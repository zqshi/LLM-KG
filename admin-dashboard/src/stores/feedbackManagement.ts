import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { feedbackApi } from '@/api/feedback'
import type {
  FeedbackItem,
  FeedbackDetail,
  FeedbackQueryParams,
  FeedbackStatistics,
  ProcessFormData,
  ReplyFormData,
  CommentFormData,
  AssignFormData,
  FeedbackType,
  FeedbackStatus,
  FeedbackPriority
} from '@/types/feedbackManagement'

export const useFeedbackManagementStore = defineStore('feedbackManagement', () => {
  const feedbackList = ref<FeedbackItem[]>([])
  const currentFeedback = ref<FeedbackDetail | null>(null)
  const statistics = ref<FeedbackStatistics | null>(null)
  const availableProcessors = ref<{id: number, name: string, department?: string}[]>([])
  
  const loading = ref(false)
  const detailLoading = ref(false)
  const total = ref(0)
  
  const queryParams = ref<FeedbackQueryParams>({
    page: 1,
    pageSize: 20,
    keyword: '',
    type: undefined,
    status: [],
    priority: [],
    startTime: '',
    endTime: '',
    submitterName: '',
    processerId: undefined
  })

  const typeOptions = computed(() => [
    { label: '问题反馈', value: 'problem' as FeedbackType },
    { label: '产品建议', value: 'suggestion' as FeedbackType }
  ])

  const statusOptions = computed(() => [
    { label: '待处理', value: 'pending' as FeedbackStatus, color: '#f56c6c' },
    { label: '处理中', value: 'processing' as FeedbackStatus, color: '#e6a23c' },
    { label: '已解决', value: 'resolved' as FeedbackStatus, color: '#67c23a' },
    { label: '已关闭', value: 'closed' as FeedbackStatus, color: '#909399' },
    { label: '已拒绝', value: 'rejected' as FeedbackStatus, color: '#606266' }
  ])

  const priorityOptions = computed(() => [
    { label: '低', value: 'low' as FeedbackPriority, color: '#67c23a' },
    { label: '中', value: 'medium' as FeedbackPriority, color: '#e6a23c' },
    { label: '高', value: 'high' as FeedbackPriority, color: '#f56c6c' },
    { label: '紧急', value: 'urgent' as FeedbackPriority, color: '#ff0000' }
  ])

  const getTypeLabel = (type: FeedbackType) => {
    return typeOptions.value.find(option => option.value === type)?.label || type
  }

  const getStatusConfig = (status: FeedbackStatus) => {
    return statusOptions.value.find(option => option.value === status)
  }

  const getPriorityConfig = (priority: FeedbackPriority) => {
    return priorityOptions.value.find(option => option.value === priority)
  }

  const resetQuery = () => {
    queryParams.value = {
      page: 1,
      pageSize: 20,
      keyword: '',
      type: undefined,
      status: [],
      priority: [],
      startTime: '',
      endTime: '',
      submitterName: '',
      processerId: undefined
    }
  }

  const loadFeedbackList = async () => {
    try {
      loading.value = true
      const response = await feedbackApi.getFeedbackList(queryParams.value)
      
      if (response.code === 200) {
        feedbackList.value = response.data.list
        total.value = response.data.total
        if (response.data.statistics) {
          statistics.value = response.data.statistics
        }
      } else {
        // 检查是否是静态模式下的错误
        const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
          import.meta.env.VITE_API_BASE_URL === '' || 
          !import.meta.env.VITE_API_BASE_URL
        
        if (!isStaticMode) {
          ElMessage.error(response.message || '获取反馈列表失败')
        }
      }
    } catch (error) {
      console.error('获取反馈列表失败:', error)
      // 检查是否是静态模式下的错误
      const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
        import.meta.env.VITE_API_BASE_URL === '' || 
        !import.meta.env.VITE_API_BASE_URL
      
      if (!isStaticMode) {
        ElMessage.error('获取反馈列表失败')
      }
    } finally {
      loading.value = false
    }
  }

  const loadFeedbackDetail = async (id: number) => {
    try {
      detailLoading.value = true
      const response = await feedbackApi.getFeedbackDetail(id)
      
      if (response.code === 200) {
        currentFeedback.value = response.data
      } else {
        // 检查是否是静态模式下的错误
        const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
          import.meta.env.VITE_API_BASE_URL === '' || 
          !import.meta.env.VITE_API_BASE_URL
        
        if (!isStaticMode) {
          ElMessage.error(response.message || '获取反馈详情失败')
        }
      }
    } catch (error) {
      console.error('获取反馈详情失败:', error)
      // 检查是否是静态模式下的错误
      const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
        import.meta.env.VITE_API_BASE_URL === '' || 
        !import.meta.env.VITE_API_BASE_URL
      
      if (!isStaticMode) {
        ElMessage.error('获取反馈详情失败')
      }
    } finally {
      detailLoading.value = false
    }
  }

  const loadStatistics = async () => {
    try {
      const response = await feedbackApi.getFeedbackStatistics()
      
      if (response.code === 200) {
        statistics.value = response.data
      } else {
        // 检查是否是静态模式下的错误
        const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
          import.meta.env.VITE_API_BASE_URL === '' || 
          !import.meta.env.VITE_API_BASE_URL
        
        if (!isStaticMode) {
          ElMessage.error(response.message || '获取统计数据失败')
        }
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

  const loadAvailableProcessors = async () => {
    try {
      const response = await feedbackApi.getAvailableProcessors()
      
      if (response.code === 200) {
        availableProcessors.value = response.data
      } else {
        // 检查是否是静态模式下的错误
        const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
          import.meta.env.VITE_API_BASE_URL === '' || 
          !import.meta.env.VITE_API_BASE_URL
        
        if (!isStaticMode) {
          ElMessage.error(response.message || '获取处理人列表失败')
        }
      }
    } catch (error) {
      console.error('获取处理人列表失败:', error)
      // 检查是否是静态模式下的错误
      const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
        import.meta.env.VITE_API_BASE_URL === '' || 
        !import.meta.env.VITE_API_BASE_URL
      
      if (!isStaticMode) {
        ElMessage.error('获取处理人列表失败')
      }
    }
  }

  const updateFeedbackStatus = async (id: number, data: ProcessFormData) => {
    try {
      const response = await feedbackApi.updateFeedbackStatus(id, data)
      
      if (response.code === 200) {
        ElMessage.success('状态更新成功')
        await loadFeedbackList()
        if (currentFeedback.value && currentFeedback.value.id === id) {
          await loadFeedbackDetail(id)
        }
      } else {
        ElMessage.error(response.message || '状态更新失败')
      }
    } catch (error) {
      console.error('状态更新失败:', error)
      ElMessage.error('状态更新失败')
    }
  }

  const assignFeedback = async (id: number, data: AssignFormData) => {
    try {
      const response = await feedbackApi.assignFeedback(id, data)
      
      if (response.code === 200) {
        ElMessage.success('分配成功')
        await loadFeedbackList()
        if (currentFeedback.value && currentFeedback.value.id === id) {
          await loadFeedbackDetail(id)
        }
      } else {
        ElMessage.error(response.message || '分配失败')
      }
    } catch (error) {
      console.error('分配失败:', error)
      ElMessage.error('分配失败')
    }
  }

  const replyToUser = async (id: number, data: ReplyFormData) => {
    try {
      const response = await feedbackApi.replyToUser(id, data)
      
      if (response.code === 200) {
        ElMessage.success('回复成功')
        if (currentFeedback.value && currentFeedback.value.id === id) {
          await loadFeedbackDetail(id)
        }
      } else {
        ElMessage.error(response.message || '回复失败')
      }
    } catch (error) {
      console.error('回复失败:', error)
      ElMessage.error('回复失败')
    }
  }

  const addInternalComment = async (id: number, data: CommentFormData) => {
    try {
      const response = await feedbackApi.addInternalComment(id, data)
      
      if (response.code === 200) {
        ElMessage.success('评论添加成功')
        if (currentFeedback.value && currentFeedback.value.id === id) {
          await loadFeedbackDetail(id)
        }
      } else {
        ElMessage.error(response.message || '评论添加失败')
      }
    } catch (error) {
      console.error('评论添加失败:', error)
      ElMessage.error('评论添加失败')
    }
  }

  const updateFeedbackPriority = async (id: number, priority: FeedbackPriority) => {
    try {
      const response = await feedbackApi.updateFeedbackPriority(id, priority)
      
      if (response.code === 200) {
        ElMessage.success('优先级更新成功')
        await loadFeedbackList()
        if (currentFeedback.value && currentFeedback.value.id === id) {
          await loadFeedbackDetail(id)
        }
      } else {
        ElMessage.error(response.message || '优先级更新失败')
      }
    } catch (error) {
      console.error('优先级更新失败:', error)
      ElMessage.error('优先级更新失败')
    }
  }

  const downloadAttachment = async (attachmentId: number, filename: string) => {
    try {
      const blob = await feedbackApi.downloadAttachment(attachmentId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('下载附件失败:', error)
      ElMessage.error('下载附件失败')
    }
  }

  return {
    feedbackList,
    currentFeedback,
    statistics,
    availableProcessors,
    loading,
    detailLoading,
    total,
    queryParams,
    typeOptions,
    statusOptions,
    priorityOptions,
    getTypeLabel,
    getStatusConfig,
    getPriorityConfig,
    resetQuery,
    loadFeedbackList,
    loadFeedbackDetail,
    loadStatistics,
    loadAvailableProcessors,
    updateFeedbackStatus,
    assignFeedback,
    replyToUser,
    addInternalComment,
    updateFeedbackPriority,
    downloadAttachment
  }
})