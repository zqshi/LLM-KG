import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { newsApi } from '@/api/news'
import type { 
  NewsArticle, 
  NewsArticleForm,
  NewsQueryParams, 
  NewsStats,
  NewsSource,
  OrganizationNode
} from '@/types'
import { ElMessage } from 'element-plus'

export const useNewsStore = defineStore('news', () => {
  const articleList = ref<NewsArticle[]>([])
  const sourceList = ref<NewsSource[]>([])
  const organizationList = ref<OrganizationNode[]>([])
  const stats = ref<NewsStats>({
    pendingCount: 0,
    duplicateCount: 0,
    todayApproved: 0,
    avgProcessTime: 0,
    totalFetched: 0,
    activeSourceCount: 0,
    errorSourceCount: 0
  })
  
  const loading = ref(false)
  const pagination = ref({
    currentPage: 1,
    pageSize: 20,
    total: 0
  })

  // 计算属性
  const pendingArticles = computed(() => 
    articleList.value.filter(article => article.status === 'pending')
  )
  
  const duplicateArticles = computed(() => 
    articleList.value.filter(article => article.isDuplicate)
  )

  // 获取资讯统计
  const fetchStats = async () => {
    try {
      const response = await newsApi.getNewsStats()
      if (response.code === 200) {
        stats.value = response.data
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
    }
  }

  // 获取资讯列表
  const fetchArticleList = async (params?: NewsQueryParams) => {
    loading.value = true
    try {
      const queryParams = {
        page: pagination.value.currentPage,
        size: pagination.value.pageSize,
        ...params
      }
      const response = await newsApi.getNewsList(queryParams)
      if (response.code === 200) {
        articleList.value = response.data.list
        pagination.value.total = response.data.total
      }
    } catch (error) {
      console.error('获取资讯列表失败:', error)
      // 检查是否是静态模式下的错误
      const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
        import.meta.env.VITE_API_BASE_URL === '' || 
        !import.meta.env.VITE_API_BASE_URL
      
      if (!isStaticMode) {
        ElMessage.error('获取资讯列表失败')
      }
    } finally {
      loading.value = false
    }
  }

  // 获取资讯源列表
  const fetchSourceList = async () => {
    try {
      const response = await newsApi.getSourceList({})
      if (response.code === 200) {
        sourceList.value = response.data.list
      }
    } catch (error) {
      console.error('获取资讯源列表失败:', error)
      // 检查是否是静态模式下的错误
      const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
        import.meta.env.VITE_API_BASE_URL === '' || 
        !import.meta.env.VITE_API_BASE_URL
      
      if (!isStaticMode) {
        ElMessage.error('获取资讯源列表失败')
      }
    }
  }

  // 获取组织架构
  const fetchOrganizationList = async () => {
    try {
      const response = await newsApi.getOrganizations()
      if (response.code === 200) {
        organizationList.value = response.data
      }
    } catch (error) {
      console.error('获取组织架构失败:', error)
      // 检查是否是静态模式下的错误
      const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
        import.meta.env.VITE_API_BASE_URL === '' || 
        !import.meta.env.VITE_API_BASE_URL
      
      if (!isStaticMode) {
        ElMessage.error('获取组织架构失败')
      }
    }
  }

  // 创建资讯
  const createNews = async (data: NewsArticleForm) => {
    try {
      const response = await newsApi.createNews(data)
      if (response.code === 200) {
        ElMessage.success('资讯创建成功')
        await fetchArticleList()
        await fetchStats()
        return true
      }
      return false
    } catch (error) {
      ElMessage.error('资讯创建失败')
      console.error('资讯创建失败:', error)
      return false
    }
  }

  // 更新资讯
  const updateNews = async (id: number, data: Partial<NewsArticleForm>) => {
    try {
      const response = await newsApi.updateNews(id, data)
      if (response.code === 200) {
        ElMessage.success('资讯更新成功')
        await fetchArticleList()
        return true
      }
      return false
    } catch (error) {
      ElMessage.error('资讯更新失败')
      console.error('资讯更新失败:', error)
      return false
    }
  }

  // 删除资讯
  const deleteNews = async (id: number, reason?: string) => {
    try {
      const response = await newsApi.deleteNews(id, reason)
      if (response.code === 200) {
        ElMessage.success('资讯删除成功')
        await fetchArticleList()
        await fetchStats()
        return true
      }
      return false
    } catch (error) {
      ElMessage.error('资讯删除失败')
      console.error('资讯删除失败:', error)
      return false
    }
  }

  // 审核资讯
  const auditNews = async (id: number, action: 'approve' | 'reject', reason?: string) => {
    try {
      const response = await newsApi.auditNews(id, action, reason)
      if (response.code === 200) {
        const actionText = action === 'approve' ? '审核通过' : '审核拒绝'
        ElMessage.success(`资讯${actionText}成功`)
        await fetchArticleList()
        await fetchStats()
        return true
      }
      return false
    } catch (error) {
      const actionText = action === 'approve' ? '审核通过' : '审核拒绝'
      ElMessage.error(`资讯${actionText}失败`)
      console.error('资讯审核失败:', error)
      return false
    }
  }

  // 批量审核资讯
  const batchAuditNews = async (ids: number[], action: 'approve' | 'reject', reason?: string) => {
    try {
      const response = await newsApi.batchAuditNews(ids, action, reason)
      if (response.code === 200) {
        const actionText = action === 'approve' ? '审核通过' : '审核拒绝'
        ElMessage.success(`批量${actionText}成功`)
        await fetchArticleList()
        await fetchStats()
        return response.data
      }
      return null
    } catch (error) {
      const actionText = action === 'approve' ? '审核通过' : '审核拒绝'
      ElMessage.error(`批量${actionText}失败`)
      console.error('批量审核失败:', error)
      return null
    }
  }

  // 更新资讯分类
  const updateNewsCategory = async (id: number, category: string) => {
    try {
      const response = await newsApi.updateNewsCategory(id, category)
      if (response.code === 200) {
        ElMessage.success('分类更新成功')
        // 更新本地数据
        const article = articleList.value.find(item => item.id === id)
        if (article) {
          article.category = category
        }
        return true
      }
      return false
    } catch (error) {
      ElMessage.error('分类更新失败')
      console.error('分类更新失败:', error)
      return false
    }
  }

  // 更新质量评分
  const updateQualityScore = async (id: number, score: number) => {
    try {
      const response = await newsApi.updateNewsQualityScore(id, score)
      if (response.code === 200) {
        ElMessage.success('质量评分已更新')
        // 更新本地数据
        const article = articleList.value.find(item => item.id === id)
        if (article) {
          article.qualityScore = score
        }
        return true
      }
      return false
    } catch (error) {
      ElMessage.error('质量评分更新失败')
      console.error('质量评分更新失败:', error)
      return false
    }
  }

  // 获取资讯详情
  const fetchNewsDetail = async (id: number) => {
    try {
      const response = await newsApi.getNewsDetail(id)
      if (response.code === 200) {
        return response.data
      }
      return null
    } catch (error) {
      console.error('获取资讯详情失败:', error)
      // 检查是否是静态模式下的错误
      const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
        import.meta.env.VITE_API_BASE_URL === '' || 
        !import.meta.env.VITE_API_BASE_URL
      
      if (!isStaticMode) {
        ElMessage.error('获取资讯详情失败')
      }
      return null
    }
  }

  // 设置分页
  const setPagination = (page: number, size?: number) => {
    pagination.value.currentPage = page
    if (size) {
      pagination.value.pageSize = size
    }
  }

  // 重置状态
  const resetState = () => {
    articleList.value = []
    pagination.value = {
      currentPage: 1,
      pageSize: 20,
      total: 0
    }
  }

  return {
    // 状态
    articleList,
    sourceList,
    organizationList,
    stats,
    loading,
    pagination,

    // 计算属性
    pendingArticles,
    duplicateArticles,

    // 方法
    fetchStats,
    fetchArticleList,
    fetchSourceList,
    fetchOrganizationList,
    fetchNewsDetail,
    createNews,
    updateNews,
    deleteNews,
    auditNews,
    batchAuditNews,
    updateNewsCategory,
    updateQualityScore,
    setPagination,
    resetState
  }
})