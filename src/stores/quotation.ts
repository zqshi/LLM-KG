import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { quotationApi } from '@/api/quotation'
import { useAuthStore } from './auth'
import type { 
  Quotation,
  QuotationForm,
  QuotationQueryParams,
  QuotationBatchOperation,
  QuotationReviewLog,
  QuotationRevisionHistory,
  RevisionRequestForm,
  DisplayConfig,
  QuotationPlaylist,
  QuotationStatistics,
  DailyQuoteConfig,
  QuotationStatus,
  ReviewOperation
} from '@/types'

export const useQuotationStore = defineStore('quotation', () => {
  // 状态
  const quotationList = ref<Quotation[]>([])
  const pendingList = ref<Quotation[]>([])
  const quotationStats = ref<QuotationStatistics>({
    totalCount: 0,
    publishedCount: 0,
    pendingCount: 0,
    archivedCount: 0,
    todayPublished: 0,
    weeklyPublished: 0,
    monthlyPublished: 0,
    topLeaders: [],
    popularQuotations: []
  })
  
  const displayConfigs = ref<DisplayConfig[]>([])
  const playlists = ref<QuotationPlaylist[]>([])
  const dailyQuoteConfig = ref<DailyQuoteConfig>({
    id: 1,
    isEnabled: false,
    sendTime: '09:00',
    mode: 'random',
    targetQuotationIds: [],
    createTime: '',
    updateTime: ''
  })
  
  const selectedQuotations = ref<Quotation[]>([])
  const currentQuotation = ref<Quotation | null>(null)
  const currentReviewLogs = ref<QuotationReviewLog[]>([])
  const currentRevisions = ref<QuotationRevisionHistory[]>([])
  const availableTags = ref<{ tag: string, count: number }[]>([])
  
  const loading = ref(false)
  const pendingLoading = ref(false)
  const detailLoading = ref(false)
  const statsLoading = ref(false)
  const submitLoading = ref(false)
  
  const pagination = reactive({
    page: 1,
    pageSize: 20,
    total: 0
  })
  
  const pendingPagination = reactive({
    page: 1,
    pageSize: 10,
    total: 0
  })

  // 查询参数
  const queryParams = reactive<QuotationQueryParams>({
    page: 1,
    pageSize: 20,
    keyword: '',
    leaderId: undefined,
    tags: [],
    status: undefined,
    startTime: '',
    endTime: ''
  })

  // 计算属性
  const pendingCount = computed(() => quotationStats.value.pendingCount)
  const publishedCount = computed(() => quotationStats.value.publishedCount)
  const todayCount = computed(() => quotationStats.value.todayPublished)
  const hasSelected = computed(() => selectedQuotations.value.length > 0)
  const selectedIds = computed(() => selectedQuotations.value.map(item => item.id))
  
  // ======================== 基础CRUD操作 ========================
  
  // 获取名言列表
  const loadQuotationList = async (params?: Partial<QuotationQueryParams>) => {
    loading.value = true
    try {
      const finalParams = { ...queryParams, ...params }
      const response = await quotationApi.getList(finalParams)
      
      quotationList.value = response.data.list
      pagination.total = response.data.total
      
      return response
    } catch (error) {
      ElMessage.error('获取名言列表失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取名言详情
  const loadQuotationDetail = async (id: number) => {
    detailLoading.value = true
    try {
      const response = await quotationApi.getDetail(id)
      currentQuotation.value = response.data
      return response.data
    } catch (error) {
      ElMessage.error('获取名言详情失败')
      throw error
    } finally {
      detailLoading.value = false
    }
  }

  // 创建名言
  const createQuotation = async (data: QuotationForm) => {
    submitLoading.value = true
    try {
      const response = await quotationApi.create(data)
      ElMessage.success('创建名言成功')
      
      // 重新加载列表
      await loadQuotationList()
      await loadStats()
      
      return response.data
    } catch (error) {
      ElMessage.error('创建名言失败')
      throw error
    } finally {
      submitLoading.value = false
    }
  }

  // 更新名言
  const updateQuotation = async (id: number, data: Partial<QuotationForm>) => {
    submitLoading.value = true
    try {
      const response = await quotationApi.update(id, data)
      ElMessage.success('更新名言成功')
      
      // 更新本地数据
      const index = quotationList.value.findIndex(item => item.id === id)
      if (index > -1) {
        quotationList.value[index] = response.data
      }
      
      if (currentQuotation.value?.id === id) {
        currentQuotation.value = response.data
      }
      
      return response.data
    } catch (error) {
      ElMessage.error('更新名言失败')
      throw error
    } finally {
      submitLoading.value = false
    }
  }

  // 删除名言
  const deleteQuotation = async (id: number, reason?: string) => {
    try {
      await ElMessageBox.confirm('确定要删除这条名言吗？', '确认删除', {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      })
      
      await quotationApi.delete(id, reason)
      ElMessage.success('删除成功')
      
      // 从列表中移除
      quotationList.value = quotationList.value.filter(item => item.id !== id)
      pendingList.value = pendingList.value.filter(item => item.id !== id)
      
      // 重新加载统计数据
      await loadStats()
      
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
        throw error
      }
    }
  }

  // 批量操作
  const batchOperation = async (operation: QuotationBatchOperation) => {
    if (operation.quotationIds.length === 0) {
      ElMessage.warning('请选择要操作的名言')
      return
    }
    
    const operationMap = {
      publish: '发布',
      archive: '归档', 
      delete: '删除',
      update_tags: '更新标签'
    }
    
    try {
      await ElMessageBox.confirm(
        `确定要${operationMap[operation.operation]}选中的 ${operation.quotationIds.length} 条名言吗？`,
        `批量${operationMap[operation.operation]}`,
        { type: 'warning' }
      )
      
      const response = await quotationApi.batchOperation(operation)
      ElMessage.success(`批量操作成功：成功 ${response.data.successCount} 条，失败 ${response.data.failCount} 条`)
      
      // 清除选择
      selectedQuotations.value = []
      
      // 重新加载数据
      await loadQuotationList()
      await loadStats()
      
      return response
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('批量操作失败')
        throw error
      }
    }
  }

  // ======================== 审核相关操作 ========================
  
  // 获取待审核列表
  const loadPendingList = async (params?: { page?: number, pageSize?: number }) => {
    pendingLoading.value = true
    try {
      const finalParams = { ...pendingPagination, ...params }
      const response = await quotationApi.getPendingList(finalParams)
      
      pendingList.value = response.data.list
      pendingPagination.total = response.data.total
      
      return response
    } catch (error) {
      ElMessage.error('获取待审核列表失败')
      throw error
    } finally {
      pendingLoading.value = false
    }
  }

  // 审核操作
  const reviewQuotation = async (id: number, operation: ReviewOperation, comment?: string) => {
    try {
      await quotationApi.review(id, operation, comment)
      
      const operationText = operation === 'approve' ? '通过' : '驳回'
      ElMessage.success(`审核${operationText}成功`)
      
      // 从待审核列表中移除
      pendingList.value = pendingList.value.filter(item => item.id !== id)
      
      // 重新加载数据
      await loadPendingList()
      await loadQuotationList()
      await loadStats()
      
    } catch (error) {
      ElMessage.error('审核操作失败')
      throw error
    }
  }

  // 申请修正
  const requestRevision = async (data: RevisionRequestForm) => {
    try {
      await quotationApi.requestRevision(data)
      ElMessage.success('修正申请已提交')
    } catch (error) {
      ElMessage.error('修正申请提交失败')
      throw error
    }
  }

  // 获取审核记录
  const loadReviewLogs = async (quotationId: number) => {
    try {
      const response = await quotationApi.getReviewLogs(quotationId)
      currentReviewLogs.value = response.data.list
      return response.data.list
    } catch (error) {
      ElMessage.error('获取审核记录失败')
      throw error
    }
  }

  // 获取修正历史
  const loadRevisionHistory = async (quotationId: number) => {
    try {
      const response = await quotationApi.getRevisionHistory(quotationId)
      currentRevisions.value = response.data
      return response.data
    } catch (error) {
      ElMessage.error('获取修正历史失败')
      throw error
    }
  }

  // ======================== 展示配置相关 ========================
  
  // 获取展示配置
  const loadDisplayConfigs = async () => {
    try {
      const response = await quotationApi.getDisplayConfigs()
      displayConfigs.value = response.data
      return response.data
    } catch (error) {
      ElMessage.error('获取展示配置失败')
      throw error
    }
  }

  // 获取精选集列表
  const loadPlaylists = async () => {
    try {
      const response = await quotationApi.getPlaylists()
      playlists.value = response.data.list
      return response.data.list
    } catch (error) {
      ElMessage.error('获取精选集失败')
      throw error
    }
  }

  // 获取每日一语配置
  const loadDailyQuoteConfig = async () => {
    try {
      const response = await quotationApi.getDailyQuoteConfig()
      dailyQuoteConfig.value = response.data
      return response.data
    } catch (error) {
      ElMessage.error('获取每日一语配置失败')
      throw error
    }
  }

  // 更新每日一语配置
  const updateDailyQuoteConfig = async (data: Partial<DailyQuoteConfig>) => {
    try {
      const response = await quotationApi.updateDailyQuoteConfig(data)
      dailyQuoteConfig.value = response.data
      ElMessage.success('每日一语配置更新成功')
      return response.data
    } catch (error) {
      ElMessage.error('每日一语配置更新失败')
      throw error
    }
  }

  // ======================== 统计数据相关 ========================
  
  // 获取统计数据
  const loadStats = async () => {
    statsLoading.value = true
    try {
      const response = await quotationApi.getStatistics()
      quotationStats.value = response.data
      return response.data
    } catch (error) {
      ElMessage.error('获取统计数据失败')
      throw error
    } finally {
      statsLoading.value = false
    }
  }

  // 获取标签列表
  const loadTags = async () => {
    try {
      const response = await quotationApi.getTags()
      availableTags.value = response.data
      return response.data
    } catch (error) {
      ElMessage.error('获取标签列表失败')
      throw error
    }
  }

  // ======================== 工具方法 ========================
  
  // 重置查询参数
  const resetQueryParams = () => {
    Object.assign(queryParams, {
      page: 1,
      pageSize: 20,
      keyword: '',
      leaderId: undefined,
      tags: [],
      status: undefined,
      startTime: '',
      endTime: ''
    })
  }

  // 设置选中状态
  const setSelectedQuotations = (quotations: Quotation[]) => {
    selectedQuotations.value = quotations
  }

  // 清除选中状态
  const clearSelected = () => {
    selectedQuotations.value = []
  }

  // 切换选中状态
  const toggleSelection = (quotation: Quotation) => {
    const index = selectedQuotations.value.findIndex(item => item.id === quotation.id)
    if (index > -1) {
      selectedQuotations.value.splice(index, 1)
    } else {
      selectedQuotations.value.push(quotation)
    }
  }

  // 点赞操作
  const likeQuotation = async (id: number) => {
    try {
      const response = await quotationApi.likeQuotation(id)
      
      // 更新本地数据
      const updateLikeCount = (list: Quotation[]) => {
        const item = list.find(q => q.id === id)
        if (item) {
          item.likeCount = response.data.likeCount
        }
      }
      
      updateLikeCount(quotationList.value)
      updateLikeCount(pendingList.value)
      
      if (currentQuotation.value?.id === id) {
        currentQuotation.value.likeCount = response.data.likeCount
      }
      
      return response.data
    } catch (error) {
      ElMessage.error('点赞失败')
      throw error
    }
  }

  // 导入名言
  const importQuotations = async (file: File) => {
    try {
      const response = await quotationApi.importQuotations(file)
      ElMessage.success(`导入完成：成功 ${response.data.successCount} 条，失败 ${response.data.failCount} 条`)
      
      // 重新加载数据
      await loadQuotationList()
      await loadStats()
      
      return response.data
    } catch (error) {
      ElMessage.error('导入失败')
      throw error
    }
  }

  return {
    // 状态
    quotationList,
    pendingList,
    quotationStats,
    displayConfigs,
    playlists,
    dailyQuoteConfig,
    selectedQuotations,
    currentQuotation,
    currentReviewLogs,
    currentRevisions,
    availableTags,
    
    // 加载状态
    loading,
    pendingLoading,
    detailLoading,
    statsLoading,
    submitLoading,
    
    // 分页
    pagination,
    pendingPagination,
    queryParams,
    
    // 计算属性
    pendingCount,
    publishedCount,
    todayCount,
    hasSelected,
    selectedIds,
    
    // Actions - 基础CRUD
    loadQuotationList,
    loadQuotationDetail,
    createQuotation,
    updateQuotation,
    deleteQuotation,
    batchOperation,
    
    // Actions - 审核相关
    loadPendingList,
    reviewQuotation,
    requestRevision,
    loadReviewLogs,
    loadRevisionHistory,
    
    // Actions - 展示配置
    loadDisplayConfigs,
    loadPlaylists,
    loadDailyQuoteConfig,
    updateDailyQuoteConfig,
    
    // Actions - 统计数据
    loadStats,
    loadTags,
    
    // Actions - 工具方法
    resetQueryParams,
    setSelectedQuotations,
    clearSelected,
    toggleSelection,
    likeQuotation,
    importQuotations
  }
})

export default useQuotationStore