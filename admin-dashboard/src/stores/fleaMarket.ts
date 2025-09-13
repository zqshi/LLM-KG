import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { fleaMarketApi } from '@/api'
import type { 
  FleaGoods,
  FleaGoodsForm,
  FleaGoodsQueryParams,
  FleaGoodsDetail,
  FleaCategory,
  FleaReport,
  FleaReportQueryParams,
  FleaChatSession,
  FleaChatMessage,
  FleaMarketStatistics,
  UserGoodsStats,
  FleaGoodsBatchOperation
} from '@/types'

export const useFleaMarketStore = defineStore('fleaMarket', () => {
  // ======================== 状态定义 ========================
  
  // 商品相关状态
  const goodsList = ref<FleaGoods[]>([])
  const goodsTotal = ref(0)
  const goodsLoading = ref(false)
  const selectedGoods = ref<FleaGoods[]>([])
  const currentGoods = ref<FleaGoodsDetail | null>(null)
  
  // 分类相关状态
  const categoryList = ref<FleaCategory[]>([])
  const categoryLoading = ref(false)
  
  // 举报相关状态
  const reportList = ref<FleaReport[]>([])
  const reportTotal = ref(0)
  const reportLoading = ref(false)
  
  // 聊天相关状态
  const chatSessions = ref<FleaChatSession[]>([])
  const chatMessages = ref<FleaChatMessage[]>([])
  const currentChatSession = ref<FleaChatSession | null>(null)
  
  // 统计数据状态
  const statistics = ref<FleaMarketStatistics | null>(null)
  const statisticsLoading = ref(false)
  
  // 用户商品统计
  const userStats = ref<UserGoodsStats | null>(null)

  // ======================== 计算属性 ========================
  
  // 已选中商品ID列表
  const selectedGoodsIds = computed(() => selectedGoods.value.map(item => item.id))
  
  // 待审核商品数量
  const pendingGoodsCount = computed(() => {
    return goodsList.value.filter(item => item.status === 'under_review').length
  })
  
  // 已发布商品数量
  const publishedGoodsCount = computed(() => {
    return goodsList.value.filter(item => item.status === 'published').length
  })
  
  // 已售出商品数量
  const soldGoodsCount = computed(() => {
    return goodsList.value.filter(item => item.status === 'sold').length
  })
  
  // 待处理举报数量
  const pendingReportsCount = computed(() => {
    return reportList.value.filter(item => item.status === 'pending').length
  })

  // ======================== 商品管理相关方法 ========================
  
  /**
   * 获取商品列表
   */
  const fetchGoodsList = async (params: FleaGoodsQueryParams) => {
    try {
      goodsLoading.value = true
      const response = await fleaMarketApi.goods.list(params)
      if (response.code === 200) {
        goodsList.value = response.data.list
        goodsTotal.value = response.data.total
      }
    } catch (error) {
      console.error('获取商品列表失败:', error)
      // 检查是否是静态模式下的错误
      const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
        import.meta.env.VITE_API_BASE_URL === '' || 
        !import.meta.env.VITE_API_BASE_URL
      
      if (!isStaticMode) {
        ElMessage.error('获取商品列表失败')
      }
    } finally {
      goodsLoading.value = false
    }
  }
  
  /**
   * 获取商品详情
   */
  const fetchGoodsDetail = async (id: number) => {
    try {
      const response = await fleaMarketApi.goods.detail(id)
      if (response.code === 200) {
        currentGoods.value = response.data
      }
      return response.data
    } catch (error) {
      console.error('获取商品详情失败:', error)
      // 检查是否是静态模式下的错误
      const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
        import.meta.env.VITE_API_BASE_URL === '' || 
        !import.meta.env.VITE_API_BASE_URL
      
      if (!isStaticMode) {
        ElMessage.error('获取商品详情失败')
      }
      throw error
    }
  }
  
  /**
   * 创建商品
   */
  const createGoods = async (data: FleaGoodsForm) => {
    try {
      const response = await fleaMarketApi.goods.create(data)
      if (response.code === 200) {
        ElMessage.success('商品创建成功')
        // 重新获取商品列表
        return response.data
      }
    } catch (error) {
      console.error('创建商品失败:', error)
      // 检查是否是静态模式下的错误
      const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
        import.meta.env.VITE_API_BASE_URL === '' || 
        !import.meta.env.VITE_API_BASE_URL
      
      if (!isStaticMode) {
        ElMessage.error('创建商品失败')
      }
      throw error
    }
  }
  
  /**
   * 更新商品
   */
  const updateGoods = async (id: number, data: FleaGoodsForm) => {
    try {
      const response = await fleaMarketApi.goods.update(id, data)
      if (response.code === 200) {
        ElMessage.success('商品更新成功')
        // 更新本地状态
        const index = goodsList.value.findIndex(item => item.id === id)
        if (index > -1) {
          goodsList.value[index] = { ...goodsList.value[index], ...response.data }
        }
        return response.data
      }
    } catch (error) {
      console.error('更新商品失败:', error)
      ElMessage.error('更新商品失败')
      throw error
    }
  }
  
  /**
   * 删除商品
   */
  const deleteGoods = async (id: number) => {
    try {
      const response = await fleaMarketApi.goods.delete(id)
      if (response.code === 200) {
        ElMessage.success('商品删除成功')
        // 从本地状态中移除
        const index = goodsList.value.findIndex(item => item.id === id)
        if (index > -1) {
          goodsList.value.splice(index, 1)
          goodsTotal.value--
        }
      }
    } catch (error) {
      console.error('删除商品失败:', error)
      ElMessage.error('删除商品失败')
      throw error
    }
  }
  
  /**
   * 批量操作商品
   */
  const batchOperateGoods = async (operation: FleaGoodsBatchOperation) => {
    try {
      const response = await fleaMarketApi.goods.batchOperate(operation)
      if (response.code === 200) {
        ElMessage.success('批量操作成功')
        // 清空选中状态
        selectedGoods.value = []
        return true
      }
    } catch (error) {
      console.error('批量操作失败:', error)
      ElMessage.error('批量操作失败')
      throw error
    }
  }
  
  /**
   * 审核商品（通过）
   */
  const approveGoods = async (id: number, remark?: string) => {
    try {
      const response = await fleaMarketApi.goods.approve(id, remark)
      if (response.code === 200) {
        ElMessage.success('商品审核通过')
        // 更新本地状态
        const index = goodsList.value.findIndex(item => item.id === id)
        if (index > -1) {
          goodsList.value[index].status = 'published'
        }
      }
    } catch (error) {
      console.error('商品审核失败:', error)
      ElMessage.error('商品审核失败')
      throw error
    }
  }
  
  /**
   * 审核商品（拒绝）
   */
  const rejectGoods = async (id: number, reason: string) => {
    try {
      const response = await fleaMarketApi.goods.reject(id, reason)
      if (response.code === 200) {
        ElMessage.success('商品审核拒绝')
        // 更新本地状态
        const index = goodsList.value.findIndex(item => item.id === id)
        if (index > -1) {
          goodsList.value[index].status = 'offline'
        }
      }
    } catch (error) {
      console.error('商品审核失败:', error)
      ElMessage.error('商品审核失败')
      throw error
    }
  }
  
  /**
   * 上架商品
   */
  const publishGoods = async (id: number) => {
    try {
      const response = await fleaMarketApi.goods.publish(id)
      if (response.code === 200) {
        ElMessage.success('商品上架成功')
        // 更新本地状态
        const index = goodsList.value.findIndex(item => item.id === id)
        if (index > -1) {
          goodsList.value[index].status = 'published'
        }
      }
    } catch (error) {
      console.error('商品上架失败:', error)
      ElMessage.error('商品上架失败')
      throw error
    }
  }
  
  /**
   * 下架商品
   */
  const offlineGoods = async (id: number, reason?: string) => {
    try {
      const response = await fleaMarketApi.goods.offline(id, reason)
      if (response.code === 200) {
        ElMessage.success('商品下架成功')
        // 更新本地状态
        const index = goodsList.value.findIndex(item => item.id === id)
        if (index > -1) {
          goodsList.value[index].status = 'offline'
        }
      }
    } catch (error) {
      console.error('商品下架失败:', error)
      ElMessage.error('商品下架失败')
      throw error
    }
  }
  
  /**
   * 标记商品为已售出
   */
  const markGoodsAsSold = async (id: number) => {
    try {
      const response = await fleaMarketApi.goods.markAsSold(id)
      if (response.code === 200) {
        ElMessage.success('商品标记为已售出')
        // 更新本地状态
        const index = goodsList.value.findIndex(item => item.id === id)
        if (index > -1) {
          goodsList.value[index].status = 'sold'
        }
      }
    } catch (error) {
      console.error('标记商品失败:', error)
      ElMessage.error('标记商品失败')
      throw error
    }
  }

  // ======================== 分类管理相关方法 ========================
  
  /**
   * 获取分类列表
   */
  const fetchCategoryList = async (params?: any) => {
    try {
      categoryLoading.value = true
      const response = await fleaMarketApi.categories.list(params)
      if (response.code === 200) {
        categoryList.value = response.data
      }
    } catch (error) {
      console.error('获取分类列表失败:', error)
      // 检查是否是静态模式下的错误
      const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
        import.meta.env.VITE_API_BASE_URL === '' || 
        !import.meta.env.VITE_API_BASE_URL
      
      if (!isStaticMode) {
        ElMessage.error('获取分类列表失败')
      }
    } finally {
      categoryLoading.value = false
    }
  }
  
  /**
   * 创建分类
   */
  const createCategory = async (data: Omit<FleaCategory, 'id' | 'createTime'>) => {
    try {
      const response = await fleaMarketApi.categories.create(data)
      if (response.code === 200) {
        ElMessage.success('分类创建成功')
        categoryList.value.push(response.data)
        return response.data
      }
    } catch (error) {
      console.error('创建分类失败:', error)
      ElMessage.error('创建分类失败')
      throw error
    }
  }
  
  /**
   * 更新分类
   */
  const updateCategory = async (id: number, data: Omit<FleaCategory, 'id' | 'createTime'>) => {
    try {
      const response = await fleaMarketApi.categories.update(id, data)
      if (response.code === 200) {
        ElMessage.success('分类更新成功')
        // 更新本地状态
        const index = categoryList.value.findIndex(item => item.id === id)
        if (index > -1) {
          categoryList.value[index] = { ...categoryList.value[index], ...response.data }
        }
        return response.data
      }
    } catch (error) {
      console.error('更新分类失败:', error)
      ElMessage.error('更新分类失败')
      throw error
    }
  }
  
  /**
   * 删除分类
   */
  const deleteCategory = async (id: number) => {
    try {
      const response = await fleaMarketApi.categories.delete(id)
      if (response.code === 200) {
        ElMessage.success('分类删除成功')
        // 从本地状态中移除
        const index = categoryList.value.findIndex(item => item.id === id)
        if (index > -1) {
          categoryList.value.splice(index, 1)
        }
      }
    } catch (error) {
      console.error('删除分类失败:', error)
      ElMessage.error('删除分类失败')
      throw error
    }
  }

  // ======================== 举报管理相关方法 ========================
  
  /**
   * 获取举报列表
   */
  const fetchReportList = async (params: FleaReportQueryParams) => {
    try {
      reportLoading.value = true
      const response = await fleaMarketApi.reports.list(params)
      if (response.code === 200) {
        reportList.value = response.data.list
        reportTotal.value = response.data.total
      }
    } catch (error) {
      console.error('获取举报列表失败:', error)
      // 检查是否是静态模式下的错误
      const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
        import.meta.env.VITE_API_BASE_URL === '' || 
        !import.meta.env.VITE_API_BASE_URL
      
      if (!isStaticMode) {
        ElMessage.error('获取举报列表失败')
      }
    } finally {
      reportLoading.value = false
    }
  }
  
  /**
   * 处理举报
   */
  const handleReport = async (id: number, data: { handleRemark: string; action: 'dismiss' | 'warn' | 'ban' | 'remove' }) => {
    try {
      const response = await fleaMarketApi.reports.handle(id, data)
      if (response.code === 200) {
        ElMessage.success('举报处理成功')
        // 更新本地状态
        const index = reportList.value.findIndex(item => item.id === id)
        if (index > -1) {
          reportList.value[index].status = 'processed'
        }
      }
    } catch (error) {
      console.error('处理举报失败:', error)
      ElMessage.error('处理举报失败')
      throw error
    }
  }

  // ======================== 统计数据相关方法 ========================
  
  /**
   * 获取跳蚤市场统计数据
   */
  const fetchStatistics = async () => {
    try {
      statisticsLoading.value = true
      const response = await fleaMarketApi.statistics.overview()
      if (response.code === 200) {
        statistics.value = response.data
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
      // 检查是否是静态模式下的错误
      const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
        import.meta.env.VITE_API_BASE_URL === '' || 
        !import.meta.env.VITE_API_BASE_URL
      
      if (!isStaticMode) {
        ElMessage.error('获取统计数据失败')
      }
    } finally {
      statisticsLoading.value = false
    }
  }
  
  /**
   * 获取用户商品统计
   */
  const fetchUserStats = async (userId: number) => {
    try {
      const response = await fleaMarketApi.goods.getUserStats(userId)
      if (response.code === 200) {
        userStats.value = response.data
      }
    } catch (error) {
      console.error('获取用户统计失败:', error)
      // 检查是否是静态模式下的错误
      const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
        import.meta.env.VITE_API_BASE_URL === '' || 
        !import.meta.env.VITE_API_BASE_URL
      
      if (!isStaticMode) {
        ElMessage.error('获取用户统计失败')
      }
    }
  }

  // ======================== 工具方法 ========================
  
  /**
   * 设置选中商品
   */
  const setSelectedGoods = (goods: FleaGoods[]) => {
    selectedGoods.value = goods
  }
  
  /**
   * 清空选中商品
   */
  const clearSelectedGoods = () => {
    selectedGoods.value = []
  }
  
  /**
   * 重置所有状态
   */
  const resetState = () => {
    goodsList.value = []
    goodsTotal.value = 0
    selectedGoods.value = []
    currentGoods.value = null
    categoryList.value = []
    reportList.value = []
    reportTotal.value = 0
    chatSessions.value = []
    chatMessages.value = []
    currentChatSession.value = null
    statistics.value = null
    userStats.value = null
  }

  // ======================== 返回状态和方法 ========================
  
  return {
    // 状态
    goodsList,
    goodsTotal,
    goodsLoading,
    selectedGoods,
    currentGoods,
    categoryList,
    categoryLoading,
    reportList,
    reportTotal,
    reportLoading,
    chatSessions,
    chatMessages,
    currentChatSession,
    statistics,
    statisticsLoading,
    userStats,
    
    // 计算属性
    selectedGoodsIds,
    pendingGoodsCount,
    publishedGoodsCount,
    soldGoodsCount,
    pendingReportsCount,
    
    // 商品管理方法
    fetchGoodsList,
    fetchGoodsDetail,
    createGoods,
    updateGoods,
    deleteGoods,
    batchOperateGoods,
    approveGoods,
    rejectGoods,
    publishGoods,
    offlineGoods,
    markGoodsAsSold,
    
    // 分类管理方法
    fetchCategoryList,
    createCategory,
    updateCategory,
    deleteCategory,
    
    // 举报管理方法
    fetchReportList,
    handleReport,
    
    // 统计数据方法
    fetchStatistics,
    fetchUserStats,
    
    // 工具方法
    setSelectedGoods,
    clearSelectedGoods,
    resetState
  }
})