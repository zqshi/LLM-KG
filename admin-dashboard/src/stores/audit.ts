import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  auditTaskApi, 
  auditPolicyApi, 
  sensitiveWordApi, 
  auditorApi 
} from '@/api/audit'
import type { 
  AuditTask, 
  AuditPolicy, 
  SensitiveWord, 
  Auditor,
  AuditStats,
  TaskFilters,
  PolicyForm,
  WordForm,
  AuditorForm,
  AssignForm,
  AuditorStats
} from '@/types'

export const useAuditStore = defineStore('audit', () => {
  // 状态
  const loading = ref(false)
  const taskList = ref<AuditTask[]>([])
  const policyList = ref<AuditPolicy[]>([])
  const wordsList = ref<SensitiveWord[]>([])
  const auditorsList = ref<Auditor[]>([])
  const selectedTasks = ref<AuditTask[]>([])
  const selectedTask = ref<AuditTask | null>(null)
  
  // 统计数据
  const dashboardStats = reactive<AuditStats>({
    pendingTotal: 0,
    todayNew: 0,
    todayProcessed: 0,
    avgProcessTime: 0,
    approvalRate: 0,
    todayApproved: 0,
    todayRejected: 0,
    rejectionRate: 0
  })
  
  // 分页信息
  const pagination = reactive({
    current: 1,
    size: 20,
    total: 0
  })
  
  // 筛选器
  const filters = reactive<TaskFilters>({
    bizType: undefined,
    priority: undefined,
    dateRange: undefined,
    keyword: ''
  })
  
  // 计算属性
  const pendingTaskCount = computed(() => 
    taskList.value.filter(task => task.status === 'pending').length
  )
  
  const selectedTaskIds = computed(() => 
    selectedTasks.value.map(task => task.taskId)
  )
  
  // 审核任务相关方法
  const loadTasks = async (params?: TaskFilters) => {
    loading.value = true
    try {
      const queryParams = {
        ...filters,
        ...params,
        page: pagination.current,
        size: pagination.size
      }
      
      const response = await auditTaskApi.getTasks(queryParams)
      // 由于axios响应拦截器返回完整response，需要访问response.data.data
      taskList.value = response.data.list
      pagination.total = response.data.total
    } catch (error) {
      // 检查是否是静态模式下的错误
      const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
        import.meta.env.VITE_API_BASE_URL === '' || 
        !import.meta.env.VITE_API_BASE_URL
      
      if (!isStaticMode) {
        ElMessage.error('加载任务列表失败')
      }
      console.error('加载任务列表失败:', error)
    } finally {
      loading.value = false
    }
  }
  
  const loadTaskDetail = async (taskId: string) => {
    try {
      const response = await auditTaskApi.getTask(taskId)
      selectedTask.value = response.data
      return response.data
    } catch (error) {
      // 检查是否是静态模式下的错误
      const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
        import.meta.env.VITE_API_BASE_URL === '' || 
        !import.meta.env.VITE_API_BASE_URL
      
      if (!isStaticMode) {
        ElMessage.error('加载任务详情失败')
      }
      console.error('加载任务详情失败:', error)
      return null
    }
  }
  
  const approveTask = async (taskId: string, remark?: string) => {
    try {
      await auditTaskApi.approve(taskId, { remark })
      ElMessage.success('审核通过成功')
      await loadTasks()
      await loadDashboardStats()
      return true
    } catch (error) {
      ElMessage.error('审核操作失败')
      console.error('审核操作失败:', error)
      return false
    }
  }
  
  const rejectTask = async (taskId: string, reason: string, detail?: string) => {
    try {
      await auditTaskApi.reject(taskId, { reason, detail })
      ElMessage.success('审核拒绝成功')
      await loadTasks()
      await loadDashboardStats()
      return true
    } catch (error) {
      ElMessage.error('审核操作失败')
      console.error('审核操作失败:', error)
      return false
    }
  }
  
  const batchAudit = async (taskIds: string[], action: 'approve' | 'reject', reason?: string) => {
    try {
      await auditTaskApi.batchAudit({ taskIds, action, reason })
      ElMessage.success('批量审核成功')
      await loadTasks()
      await loadDashboardStats()
      return true
    } catch (error) {
      ElMessage.error('批量审核失败')
      console.error('批量审核失败:', error)
      return false
    }
  }
  
  const transferTask = async (taskId: string, assigneeId: number, reason: string) => {
    try {
      await auditTaskApi.transfer(taskId, { assigneeId, reason })
      ElMessage.success('任务转交成功')
      await loadTasks()
      return true
    } catch (error) {
      ElMessage.error('任务转交失败')
      console.error('任务转交失败:', error)
      return false
    }
  }
  
  // 统计数据相关方法
  const loadDashboardStats = async () => {
    try {
      const response = await auditTaskApi.getStats()
      // 由于axios响应拦截器返回完整response，需要访问response.data.data
      Object.assign(dashboardStats, response.data)
    } catch (error) {
      // 检查是否是静态模式下的错误
      const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
        import.meta.env.VITE_API_BASE_URL === '' || 
        !import.meta.env.VITE_API_BASE_URL
      
      if (!isStaticMode) {
        console.error('加载统计数据失败:', error)
      }
    }
  }
  
  // 审核策略相关方法
  const loadPolicies = async () => {
    try {
      const response = await auditPolicyApi.getPolicies()
      policyList.value = response.data
    } catch (error) {
      // 检查是否是静态模式下的错误
      const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
        import.meta.env.VITE_API_BASE_URL === '' || 
        !import.meta.env.VITE_API_BASE_URL
      
      if (!isStaticMode) {
        ElMessage.error('加载策略列表失败')
      }
      console.error('加载策略列表失败:', error)
    }
  }
  
  const createPolicy = async (data: PolicyForm) => {
    try {
      await auditPolicyApi.createPolicy(data)
      ElMessage.success('创建策略成功')
      await loadPolicies()
      return true
    } catch (error) {
      ElMessage.error('创建策略失败')
      console.error('创建策略失败:', error)
      return false
    }
  }
  
  const updatePolicy = async (policyId: number, data: PolicyForm) => {
    try {
      await auditPolicyApi.updatePolicy(policyId, data)
      ElMessage.success('更新策略成功')
      await loadPolicies()
      return true
    } catch (error) {
      ElMessage.error('更新策略失败')
      console.error('更新策略失败:', error)
      return false
    }
  }
  
  const deletePolicy = async (policyId: number) => {
    try {
      await auditPolicyApi.deletePolicy(policyId)
      ElMessage.success('删除策略成功')
      await loadPolicies()
      return true
    } catch (error) {
      ElMessage.error('删除策略失败')
      console.error('删除策略失败:', error)
      return false
    }
  }
  
  const togglePolicy = async (policyId: number, isActive: boolean) => {
    try {
      await auditPolicyApi.togglePolicy(policyId, isActive)
      ElMessage.success(`${isActive ? '启用' : '禁用'}策略成功`)
      await loadPolicies()
      return true
    } catch (error) {
      ElMessage.error('操作失败')
      console.error('操作失败:', error)
      return false
    }
  }
  
  // 敏感词相关方法
  const loadWords = async (params?: { keyword?: string, action?: string, page?: number, size?: number }) => {
    try {
      const response = await sensitiveWordApi.getWords(params)
      wordsList.value = response.data.list
      pagination.total = response.data.total
    } catch (error) {
      // 检查是否是静态模式下的错误
      const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
        import.meta.env.VITE_API_BASE_URL === '' || 
        !import.meta.env.VITE_API_BASE_URL
      
      if (!isStaticMode) {
        ElMessage.error('加载敏感词列表失败')
      }
      console.error('加载敏感词列表失败:', error)
    }
  }
  
  const createWord = async (data: WordForm) => {
    try {
      await sensitiveWordApi.createWord(data)
      ElMessage.success('创建敏感词成功')
      await loadWords()
      return true
    } catch (error) {
      ElMessage.error('创建敏感词失败')
      console.error('创建敏感词失败:', error)
      return false
    }
  }
  
  const updateWord = async (wordId: number, data: WordForm) => {
    try {
      await sensitiveWordApi.updateWord(wordId, data)
      ElMessage.success('更新敏感词成功')
      await loadWords()
      return true
    } catch (error) {
      ElMessage.error('更新敏感词失败')
      console.error('更新敏感词失败:', error)
      return false
    }
  }
  
  const deleteWord = async (wordId: number) => {
    try {
      await sensitiveWordApi.deleteWord(wordId)
      ElMessage.success('删除敏感词成功')
      await loadWords()
      return true
    } catch (error) {
      ElMessage.error('删除敏感词失败')
      console.error('删除敏感词失败:', error)
      return false
    }
  }
  
  const batchImportWords = async (data: { words: string[], action: string, category: string, replaceWith?: string }) => {
    try {
      await sensitiveWordApi.batchImport(data)
      ElMessage.success('批量导入成功')
      await loadWords()
      return true
    } catch (error) {
      ElMessage.error('批量导入失败')
      console.error('批量导入失败:', error)
      return false
    }
  }
  
  const exportWords = async () => {
    try {
      const response = await sensitiveWordApi.exportWords()
      // 处理文件下载
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'sensitive-words.csv'
      link.click()
      window.URL.revokeObjectURL(url)
      ElMessage.success('导出成功')
    } catch (error) {
      ElMessage.error('导出失败')
      console.error('导出失败:', error)
    }
  }
  
  const checkSensitiveWords = async (content: string) => {
    try {
      const response = await sensitiveWordApi.checkWords(content)
      return response.data.data
    } catch (error) {
      console.error('检查敏感词失败:', error)
      return { hits: [] }
    }
  }
  
  // 审核员相关方法
  const loadAuditors = async (params?: { keyword?: string, role?: string, page?: number, size?: number }) => {
    try {
      const response = await auditorApi.getAuditors(params)
      auditorsList.value = response.data.list
    } catch (error) {
      // 检查是否是静态模式下的错误
      const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
        import.meta.env.VITE_API_BASE_URL === '' || 
        !import.meta.env.VITE_API_BASE_URL
      
      if (!isStaticMode) {
        ElMessage.error('加载审核员列表失败')
      }
      console.error('加载审核员列表失败:', error)
    }
  }
  
  const createAuditor = async (data: AuditorForm) => {
    try {
      await auditorApi.createAuditor(data)
      ElMessage.success('创建审核员成功')
      await loadAuditors()
      return true
    } catch (error) {
      ElMessage.error('创建审核员失败')
      console.error('创建审核员失败:', error)
      return false
    }
  }
  
  const updateAuditor = async (auditorId: number, data: AuditorForm) => {
    try {
      await auditorApi.updateAuditor(auditorId, data)
      ElMessage.success('更新审核员成功')
      await loadAuditors()
      return true
    } catch (error) {
      ElMessage.error('更新审核员失败')
      console.error('更新审核员失败:', error)
      return false
    }
  }
  
  const deleteAuditor = async (auditorId: number) => {
    try {
      await auditorApi.deleteAuditor(auditorId)
      ElMessage.success('删除审核员成功')
      await loadAuditors()
      return true
    } catch (error) {
      ElMessage.error('删除审核员失败')
      console.error('删除审核员失败:', error)
      return false
    }
  }
  
  const toggleAuditor = async (auditorId: number, status: boolean) => {
    try {
      await auditorApi.toggleAuditor(auditorId, status)
      ElMessage.success(`${status ? '启用' : '禁用'}审核员成功`)
      await loadAuditors()
      return true
    } catch (error) {
      ElMessage.error('操作失败')
      console.error('操作失败:', error)
      return false
    }
  }
  
  const getAuditorStats = async (auditorId: number, dateRange?: [string, string]): Promise<AuditorStats | null> => {
    try {
      const response = await auditorApi.getAuditorStats(auditorId, dateRange)
      return response.data
    } catch (error) {
      console.error('获取审核员统计失败:', error)
      return null
    }
  }
  
  const batchAssign = async (data: AssignForm) => {
    try {
      await auditorApi.assignTasks(data)
      ElMessage.success('批量分配成功')
      await loadTasks()
      return true
    } catch (error) {
      ElMessage.error('批量分配失败')
      console.error('批量分配失败:', error)
      return false
    }
  }
  
  const exportAuditors = async () => {
    try {
      const response = await auditorApi.exportAuditors()
      // 处理文件下载
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'auditors.csv'
      link.click()
      window.URL.revokeObjectURL(url)
      ElMessage.success('导出成功')
    } catch (error) {
      ElMessage.error('导出失败')
      console.error('导出失败:', error)
    }
  }
  
  // 工具方法
  const setSelectedTasks = (tasks: AuditTask[]) => {
    selectedTasks.value = tasks
  }
  
  const setSelectedTask = (task: AuditTask | null) => {
    selectedTask.value = task
  }
  
  const updateFilters = (newFilters: Partial<TaskFilters>) => {
    Object.assign(filters, newFilters)
  }
  
  const resetFilters = () => {
    Object.assign(filters, {
      bizType: undefined,
      priority: undefined,
      dateRange: undefined,
      keyword: ''
    })
  }
  
  const updatePagination = (current: number, size?: number) => {
    pagination.current = current
    if (size) {
      pagination.size = size
    }
  }
  
  // 初始化方法
  const initialize = async () => {
    try {
      await Promise.all([
        loadDashboardStats(),
        loadTasks(),
        loadPolicies(),
        loadAuditors()
      ])
    } catch (error) {
      console.error('审核中心初始化失败:', error)
      throw error
    }
  }
  
  return {
    // 状态
    loading,
    taskList,
    policyList,
    wordsList,
    auditorsList,
    selectedTasks,
    selectedTask,
    dashboardStats,
    pagination,
    filters,
    
    // 计算属性
    pendingTaskCount,
    selectedTaskIds,
    
    // 审核任务方法
    loadTasks,
    loadTaskDetail,
    approveTask,
    rejectTask,
    batchAudit,
    transferTask,
    
    // 统计数据方法
    loadDashboardStats,
    
    // 审核策略方法
    loadPolicies,
    createPolicy,
    updatePolicy,
    deletePolicy,
    togglePolicy,
    
    // 敏感词方法
    loadWords,
    createWord,
    updateWord,
    deleteWord,
    batchImportWords,
    exportWords,
    checkSensitiveWords,
    
    // 审核员方法
    loadAuditors,
    createAuditor,
    updateAuditor,
    deleteAuditor,
    toggleAuditor,
    getAuditorStats,
    batchAssign,
    exportAuditors,
    
    // 工具方法
    setSelectedTasks,
    setSelectedTask,
    updateFilters,
    resetFilters,
    updatePagination,
    
    // 初始化
    initialize
  }
})
