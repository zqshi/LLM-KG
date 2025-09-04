import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { contentApi } from '@/api/content'
import { useAuthStore } from './auth'
import type { 
  Content, 
  ContentStats, 
  ContentQueryParams,
  ContentForm,
  BatchContentOperation,
  ContentCategory,
  HotContent,
  ContentPreview
} from '@/types'


export const useContentStore = defineStore('content', () => {
  // 状态
  const contentList = ref<Content[]>([])
  const contentStats = ref<ContentStats>({
    total: 0,
    articles: 0,
    posts: 0,
    comments: 0,
    news: 0,
    goods: 0,
    quotes: 0,
    pending: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  })
  const categories = ref<ContentCategory[]>([])
  const hotContents = ref<HotContent[]>([])
  const selectedContents = ref<Content[]>([])
  const currentPreview = ref<ContentPreview | null>(null)
  
  const loading = ref(false)
  const detailLoading = ref(false)
  const statsLoading = ref(false)
  
  const pagination = reactive({
    page: 1,
    pageSize: 20,
    total: 0
  })

  // 查询参数
  const queryParams = reactive<ContentQueryParams>({
    page: 1,
    pageSize: 20,
    keyword: '',
    type: '',
    module: '',
    category: '',
    status: undefined,
    author: '',
    startTime: '',
    endTime: '',
    isTop: undefined,
    isElite: undefined
  })

  // 计算属性
  const pendingCount = computed(() => contentStats.value.pending)
  const todayCount = computed(() => contentStats.value.today)
  const hasSelected = computed(() => selectedContents.value.length > 0)
  const selectedIds = computed(() => selectedContents.value.map(item => item.id))

  // Actions
  const loadStats = async () => {
    try {
      statsLoading.value = true
      const { data } = await contentApi.getStats()
      contentStats.value = data
    } catch (error) {
      console.error('加载统计数据失败:', error)
      ElMessage.error('加载统计数据失败')
    } finally {
      statsLoading.value = false
    }
  }

  const loadContentList = async (params?: Partial<ContentQueryParams>) => {
    try {
      loading.value = true
      
      // 合并查询参数
      const mergedParams = { ...queryParams, ...params }
      
      const { data } = await contentApi.getList(mergedParams)
      const list = Array.isArray((data as any)?.list) ? (data as any).list : []
      const total = Number((data as any)?.total) || 0
      contentList.value = list
      pagination.total = total
      
      // 更新查询参数
      Object.assign(queryParams, mergedParams)
      
    } catch (error) {
      console.error('加载内容列表失败:', error)
      ElMessage.error('加载内容列表失败')
    } finally {
      loading.value = false
    }
  }

  const loadCategories = async (module?: string) => {
    try {
      const { data } = await contentApi.getCategories(module)
      categories.value = Array.isArray(data) ? data : []
    } catch (error) {
      console.error('加载版块列表失败:', error)
      categories.value = []
    }
  }

  const loadHotContents = async (days = 7, limit = 10) => {
    try {
      const { data } = await contentApi.getHotContents(days, limit)
      hotContents.value = data
    } catch (error) {
      console.error('加载热门内容失败:', error)
    }
  }

  const getContentDetail = async (id: number): Promise<Content | null> => {
    try {
      detailLoading.value = true
      const { data } = await contentApi.getDetail(id)
      return data
    } catch (error) {
      console.error('获取内容详情失败:', error)
      ElMessage.error('获取内容详情失败')
      return null
    } finally {
      detailLoading.value = false
    }
  }

  const getContentPreview = async (id: number): Promise<ContentPreview | null> => {
    try {
      const { data } = await contentApi.getPreview(id)
      currentPreview.value = data
      return data
    } catch (error) {
      console.error('获取内容预览失败:', error)
      ElMessage.error('获取内容预览失败')
      return null
    }
  }

  const createContent = async (formData: ContentForm): Promise<boolean> => {
    try {
      const result = await contentApi.create(formData)
      ElMessage.success('创建内容成功')
      
      await loadStats()
      return true
    } catch (error) {
      console.error('创建内容失败:', error)
      ElMessage.error('创建内容失败')
      return false
    }
  }

  const updateContent = async (id: number, formData: Partial<ContentForm>): Promise<boolean> => {
    try {
      await contentApi.update(id, formData)
      ElMessage.success('更新内容成功')
      
      // 更新列表中的内容
      const index = contentList.value.findIndex(item => item.id === id)
      if (index !== -1) {
        const updated = await getContentDetail(id)
        if (updated) {
          contentList.value[index] = updated
        }
      }
      
      return true
    } catch (error) {
      console.error('更新内容失败:', error)
      ElMessage.error('更新内容失败')
      return false
    }
  }

  const deleteContent = async (id: number, reason?: string): Promise<boolean> => {
    try {
      await contentApi.delete(id, reason)
      ElMessage.success('删除内容成功')
      
      // 从列表中移除
      const index = contentList.value.findIndex(item => item.id === id)
      if (index !== -1) {
        contentList.value.splice(index, 1)
      }
      
      await loadStats()
      return true
    } catch (error) {
      console.error('删除内容失败:', error)
      ElMessage.error('删除内容失败')
      return false
    }
  }

  const batchOperation = async (operation: BatchContentOperation): Promise<boolean> => {
    try {
      const { data } = await contentApi.batchOperation(operation)
      ElMessage.success(`批量操作成功: 成功 ${data.successCount} 条，失败 ${data.failCount} 条`)
      
      // 清空选中项
      selectedContents.value = []
      
      // 重新加载数据
      await Promise.all([loadContentList(), loadStats()])
      return true
    } catch (error) {
      console.error('批量操作失败:', error)
      ElMessage.error('批量操作失败')
      return false
    }
  }

  const auditContent = async (id: number, action: 'approve' | 'reject', reason?: string): Promise<boolean> => {
    try {
      await contentApi.audit(id, action, reason)
      ElMessage.success(`${action === 'approve' ? '审核通过' : '审核拒绝'}成功`)
      
      // 更新列表中的状态
      const content = contentList.value.find(item => item.id === id)
      if (content) {
        content.status = action === 'approve' ? 2 : 3
        if (reason) {
          content.auditReason = reason
        }

      }
      
      await loadStats()
      return true
    } catch (error) {
      console.error('审核失败:', error)
      ElMessage.error('审核失败')
      return false
    }
  }

  const setTop = async (id: number, isTop: boolean, expiry?: string): Promise<boolean> => {
    try {
      await contentApi.setTop(id, isTop, expiry)
      ElMessage.success(isTop ? '置顶成功' : '取消置顶成功')
      
      // 更新列表中的状态
      const content = contentList.value.find(item => item.id === id)
      if (content) {
        content.isTop = isTop
        if (expiry) {
          content.topExpiry = expiry
        }
      }
      
      return true
    } catch (error) {
      console.error('置顶操作失败:', error)
      ElMessage.error('置顶操作失败')
      return false
    }
  }

  const setElite = async (id: number, isElite: boolean): Promise<boolean> => {
    try {
      await contentApi.setElite(id, isElite)
      ElMessage.success(isElite ? '设置精华成功' : '取消精华成功')
      
      // 更新列表中的状态
      const content = contentList.value.find(item => item.id === id)
      if (content) {
        content.isElite = isElite
      }
      
      return true
    } catch (error) {
      console.error('精华操作失败:', error)
      ElMessage.error('精华操作失败')
      return false
    }
  }

  const setLock = async (id: number, isLocked: boolean): Promise<boolean> => {
    try {
      await contentApi.setLock(id, isLocked)
      ElMessage.success(isLocked ? '锁定成功' : '解锁成功')
      
      // 更新列表中的状态
      const content = contentList.value.find(item => item.id === id)
      if (content) {
        content.isLocked = isLocked
      }
      
      return true
    } catch (error) {
      console.error('锁定操作失败:', error)
      ElMessage.error('锁定操作失败')
      return false
    }
  }

  const moveCategory = async (contentIds: number[], categoryId: string): Promise<boolean> => {
    try {
      await contentApi.moveCategory(contentIds, categoryId)
      ElMessage.success('移动版块成功')
      
      // 重新加载数据
      await loadContentList()
      return true
    } catch (error) {
      console.error('移动版块失败:', error)
      ElMessage.error('移动版块失败')
      return false
    }
  }

  const exportData = async (params?: ContentQueryParams): Promise<string | null> => {
    try {
      const exportParams = params || queryParams
      const { data } = await contentApi.exportData(exportParams)
      ElMessage.success('导出任务已启动')
      return data.downloadUrl
    } catch (error) {
      console.error('导出失败:', error)
      ElMessage.error('导出失败')
      return null
    }
  }


  // 工具方法
  const resetQueryParams = () => {
    Object.assign(queryParams, {
      page: 1,
      pageSize: 20,
      keyword: '',
      type: '',
      module: '',
      category: '',
      status: undefined,
      author: '',
      startTime: '',
      endTime: '',
      isTop: undefined,
      isElite: undefined
    })
  }

  const clearSelection = () => {
    selectedContents.value = []
  }

  const selectAll = (allItems: Content[]) => {
    selectedContents.value = [...allItems]
  }

  const toggleSelection = (content: Content) => {
    const index = selectedContents.value.findIndex(item => item.id === content.id)
    if (index !== -1) {
      selectedContents.value.splice(index, 1)
    } else {
      selectedContents.value.push(content)
    }
  }

  return {
    // 状态
    contentList,
    contentStats,
    categories,
    hotContents,
    selectedContents,
    currentPreview,
    loading,
    detailLoading,
    statsLoading,
    pagination,
    queryParams,
    
    // 计算属性
    pendingCount,
    todayCount,
    hasSelected,
    selectedIds,
    
    // Actions
    loadStats,
    loadContentList,
    loadCategories,
    loadHotContents,
    getContentDetail,
    getContentPreview,
    createContent,
    updateContent,
    deleteContent,
    batchOperation,
    auditContent,
    setTop,
    setElite,
    setLock,
    moveCategory,
    exportData,
    
    // 工具方法
    resetQueryParams,
    clearSelection,
    selectAll,
    toggleSelection
  }
})

export default useContentStore