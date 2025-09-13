import { request } from './request'
import { apiAdapter } from './adapter'
import {
  auditTasks,
  auditPolicies,
  sensitiveWords,
  auditors,
  auditStats,
  auditLogs
} from '@/services/staticData/audit'
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
  ApiResponse
} from '@/types'

/**
 * 审核任务相关API
 */
export const auditTaskApi = {
  // 获取任务列表
  getTasks: (params: TaskFilters): Promise<ApiResponse<{ list: AuditTask[], total: number }>> => 
    apiAdapter.get(
      () => request.get<{ list: AuditTask[], total: number }>('/audit/tasks', { params }),
      async () => {
        const allTasks = await auditTasks()
        return { list: allTasks, total: allTasks.length }
      },
      { mockPagination: true, paginationParams: params }
    ),

  // 获取单个任务详情
  getTask: (taskId: string): Promise<ApiResponse<AuditTask>> => 
    apiAdapter.get(
      () => request.get<AuditTask>(`/audit/tasks/${taskId}`),
      async () => {
        const allTasks = await auditTasks()
        const task = allTasks.find(t => t.id === taskId)
        if (!task) {
          throw new Error('任务不存在')
        }
        return task
      }
    ),

  // 审核通过
  approve: (taskId: string, data?: { remark?: string }): Promise<ApiResponse<any>> => 
    apiAdapter.post(
      () => request.post(`/audit/tasks/${taskId}/approve`, data),
      async () => ({ success: true, message: '审核通过' })
    ),

  // 审核拒绝
  reject: (taskId: string, data: { reason: string, detail?: string }): Promise<ApiResponse<any>> => 
    apiAdapter.post(
      () => request.post(`/audit/tasks/${taskId}/reject`, data),
      async () => ({ success: true, message: '审核拒绝' })
    ),

  // 批量审核
  batchAudit: (data: { taskIds: string[], action: 'approve' | 'reject', reason?: string }): Promise<ApiResponse<any>> => 
    apiAdapter.post(
      () => request.post('/audit/tasks/batch', data),
      async () => ({ 
        successCount: data.taskIds.length, 
        failCount: 0, 
        message: `批量${data.action === 'approve' ? '通过' : '拒绝'}成功` 
      })
    ),

  // 转交任务
  transfer: (taskId: string, data: { assigneeId: number, reason: string }): Promise<ApiResponse<any>> => 
    apiAdapter.post(
      () => request.post(`/audit/tasks/${taskId}/transfer`, data),
      async () => ({ success: true, message: '任务转交成功' })
    ),

  // 获取审核统计数据
  getStats: (): Promise<ApiResponse<AuditStats>> => 
    apiAdapter.get(
      () => request.get<AuditStats>('/audit/stats'),
      async () => await auditStats()
    ),

  // 提交审核任务（业务方调用）
  submitTask: (data: {
    bizType: string
    bizId: string
    content: any
    submitterId: number
  }): Promise<ApiResponse<{ taskId: string, status: string }>> => 
    apiAdapter.post(
      () => request.post<{ taskId: string, status: string }>('/audit/tasks/submit', data),
      async () => ({
        taskId: 'task_' + Date.now(),
        status: 'pending'
      })
    ),

  // 查询审核结果（业务方调用）
  getResult: (bizType: string, bizId: string): Promise<ApiResponse<{ status: string, reason?: string }>> => 
    apiAdapter.get(
      () => request.get<{ status: string, reason?: string }>('/audit/tasks/result', {
        params: { bizType, bizId }
      }),
      async () => ({
        status: 'approved',
        reason: '审核通过'
      })
    )
}

/**
 * 审核策略相关API
 */
export const auditPolicyApi = {
  // 获取策略列表
  getPolicies: (): Promise<ApiResponse<AuditPolicy[]>> => 
    apiAdapter.get(
      () => request.get<AuditPolicy[]>('/audit/policies'),
      async () => await auditPolicies()
    ),

  // 获取单个策略
  getPolicy: (policyId: number): Promise<ApiResponse<AuditPolicy>> => 
    apiAdapter.get(
      () => request.get<AuditPolicy>(`/audit/policies/${policyId}`),
      async () => {
        const allPolicies = await auditPolicies()
        const policy = allPolicies.find(p => p.id === policyId)
        if (!policy) {
          throw new Error('策略不存在')
        }
        return policy
      }
    ),

  // 创建策略
  createPolicy: (data: PolicyForm): Promise<ApiResponse<AuditPolicy>> => 
    apiAdapter.post(
      () => request.post<AuditPolicy>('/audit/policies', data),
      async () => ({
        id: Date.now(),
        ...data,
        creator: '系统管理员',
        createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updateTime: null
      })
    ),

  // 更新策略
  updatePolicy: (policyId: number, data: PolicyForm): Promise<ApiResponse<AuditPolicy>> => 
    apiAdapter.put(
      () => request.put<AuditPolicy>(`/audit/policies/${policyId}`, data),
      async () => {
        const allPolicies = await auditPolicies()
        const policy = allPolicies.find(p => p.id === policyId)
        if (!policy) {
          throw new Error('策略不存在')
        }
        return {
          ...policy,
          ...data,
          updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
        }
      }
    ),

  // 删除策略
  deletePolicy: (policyId: number): Promise<ApiResponse<any>> => 
    apiAdapter.delete(
      () => request.delete(`/audit/policies/${policyId}`),
      async () => ({ success: true, message: '策略删除成功' })
    ),

  // 启用/禁用策略
  togglePolicy: (policyId: number, isActive: boolean): Promise<ApiResponse<any>> => 
    apiAdapter.patch(
      () => request.patch(`/audit/policies/${policyId}/toggle`, { isActive }),
      async () => ({ success: true, message: `策略${isActive ? '启用' : '禁用'}成功` })
    )
}

/**
 * 敏感词相关API
 */
export const sensitiveWordApi = {
  // 获取敏感词列表
  getWords: (params?: { keyword?: string, action?: string, page?: number, size?: number }): Promise<ApiResponse<{ list: SensitiveWord[], total: number }>> => 
    apiAdapter.get(
      () => request.get<{ list: SensitiveWord[], total: number }>('/audit/sensitive-words', { params }),
      async () => {
        const allWords = await sensitiveWords()
        return { list: allWords, total: allWords.length }
      },
      { mockPagination: true, paginationParams: params }
    ),

  // 获取单个敏感词
  getWord: (wordId: number): Promise<ApiResponse<SensitiveWord>> => 
    apiAdapter.get(
      () => request.get<SensitiveWord>(`/audit/sensitive-words/${wordId}`),
      async () => {
        const allWords = await sensitiveWords()
        const word = allWords.find(w => w.id === wordId)
        if (!word) {
          throw new Error('敏感词不存在')
        }
        return word
      }
    ),

  // 创建敏感词
  createWord: (data: WordForm): Promise<ApiResponse<SensitiveWord>> => 
    apiAdapter.post(
      () => request.post<SensitiveWord>('/audit/sensitive-words', data),
      async () => ({
        id: Date.now(),
        ...data,
        hitCount: 0,
        creator: '系统管理员',
        createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updateTime: null
      })
    ),

  // 更新敏感词
  updateWord: (wordId: number, data: WordForm): Promise<ApiResponse<SensitiveWord>> => 
    apiAdapter.put(
      () => request.put<SensitiveWord>(`/audit/sensitive-words/${wordId}`, data),
      async () => {
        const allWords = await sensitiveWords()
        const word = allWords.find(w => w.id === wordId)
        if (!word) {
          throw new Error('敏感词不存在')
        }
        return {
          ...word,
          ...data,
          updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
        }
      }
    ),

  // 删除敏感词
  deleteWord: (wordId: number): Promise<ApiResponse<any>> => 
    apiAdapter.delete(
      () => request.delete(`/audit/sensitive-words/${wordId}`),
      async () => ({ success: true, message: '敏感词删除成功' })
    ),

  // 批量导入敏感词
  batchImport: (data: { words: string[], action: string, category: string, replaceWith?: string }): Promise<ApiResponse<any>> => 
    apiAdapter.post(
      () => request.post('/audit/sensitive-words/batch-import', data),
      async () => ({ 
        successCount: data.words.length, 
        failCount: 0, 
        message: '批量导入成功' 
      })
    ),

  // 导出敏感词
  exportWords: (): Promise<ApiResponse<any>> => 
    apiAdapter.get(
      () => request.get('/audit/sensitive-words/export', { responseType: 'blob' }),
      async () => ({ downloadUrl: '/mock/sensitive-words-export.xlsx' })
    ),

  // 检查敏感词（业务方调用）
  checkWords: (content: string): Promise<ApiResponse<{ hits: Array<{ word: string, action: string, replaceWith?: string }> }>> => 
    apiAdapter.post(
      () => request.post<{ hits: Array<{ word: string, action: string, replaceWith?: string }> }>('/audit/sensitive-words/check', { content }),
      async () => ({ hits: [] })
    )
}

/**
 * 审核员相关API
 */
export const auditorApi = {
  // 获取审核员列表
  getAuditors: (params?: { keyword?: string, role?: string, page?: number, size?: number }): Promise<ApiResponse<{ list: Auditor[], total: number }>> => 
    apiAdapter.get(
      () => request.get<{ list: Auditor[], total: number }>('/audit/auditors', { params }),
      async () => {
        const allAuditors = await auditors()
        return { list: allAuditors, total: allAuditors.length }
      },
      { mockPagination: true, paginationParams: params }
    ),

  // 获取单个审核员
  getAuditor: (auditorId: number): Promise<ApiResponse<Auditor>> => 
    apiAdapter.get(
      () => request.get<Auditor>(`/audit/auditors/${auditorId}`),
      async () => {
        const allAuditors = await auditors()
        const auditor = allAuditors.find(a => a.id === auditorId)
        if (!auditor) {
          throw new Error('审核员不存在')
        }
        return auditor
      }
    ),

  // 创建审核员
  createAuditor: (data: AuditorForm): Promise<ApiResponse<Auditor>> => 
    apiAdapter.post(
      () => request.post<Auditor>('/audit/auditors', data),
      async () => ({
        id: Date.now(),
        ...data,
        currentTasks: 0,
        todayCompleted: 0,
        totalCompleted: 0,
        avgProcessTime: 0,
        successRate: 100,
        lastActiveTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        createTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
      })
    ),

  // 更新审核员
  updateAuditor: (auditorId: number, data: AuditorForm): Promise<ApiResponse<Auditor>> => 
    apiAdapter.put(
      () => request.put<Auditor>(`/audit/auditors/${auditorId}`, data),
      async () => {
        const allAuditors = await auditors()
        const auditor = allAuditors.find(a => a.id === auditorId)
        if (!auditor) {
          throw new Error('审核员不存在')
        }
        return { ...auditor, ...data }
      }
    ),

  // 删除审核员
  deleteAuditor: (auditorId: number): Promise<ApiResponse<any>> => 
    apiAdapter.delete(
      () => request.delete(`/audit/auditors/${auditorId}`),
      async () => ({ success: true, message: '审核员删除成功' })
    ),

  // 启用/禁用审核员
  toggleAuditor: (auditorId: number, status: boolean): Promise<ApiResponse<any>> => 
    apiAdapter.patch(
      () => request.patch(`/audit/auditors/${auditorId}/toggle`, { status }),
      async () => ({ success: true, message: `审核员${status ? '启用' : '禁用'}成功` })
    ),

  // 获取审核员统计数据
  getAuditorStats: (auditorId: number, dateRange?: [string, string]): Promise<ApiResponse<any>> => 
    apiAdapter.get(
      () => request.get(`/audit/auditors/${auditorId}/stats`, { 
        params: { startDate: dateRange?.[0], endDate: dateRange?.[1] } 
      }),
      async () => ({
        totalTasks: 45,
        completedTasks: 42,
        avgProcessTime: 85,
        successRate: 98.5,
        todayTasks: 8,
        weekTasks: 35
      })
    ),

  // 批量分配任务
  batchAssign: (data: AssignForm): Promise<ApiResponse<any>> => 
    apiAdapter.post(
      () => request.post('/audit/auditors/batch-assign', data),
      async () => ({ 
        successCount: data.taskIds?.length || 0, 
        failCount: 0, 
        message: '批量分配成功' 
      })
    ),

  // 导出审核员列表
  exportAuditors: (): Promise<ApiResponse<any>> => 
    apiAdapter.get(
      () => request.get('/audit/auditors/export', { responseType: 'blob' }),
      async () => ({ downloadUrl: '/mock/auditors-export.xlsx' })
    )
}

/**
 * 审核日志相关API
 */
export const auditLogApi = {
  // 获取审核日志
  getLogs: (params?: { 
    taskId?: string, 
    auditorId?: number, 
    action?: string, 
    startDate?: string, 
    endDate?: string,
    page?: number,
    size?: number 
  }): Promise<ApiResponse<{ list: any[], total: number }>> => 
    apiAdapter.get(
      () => request.get<{ list: any[], total: number }>('/audit/logs', { params }),
      async () => {
        const allLogs = await auditLogs()
        return { list: allLogs, total: allLogs.length }
      },
      { mockPagination: true, paginationParams: params }
    ),

  // 导出审核日志
  exportLogs: (params?: { 
    taskId?: string, 
    auditorId?: number, 
    action?: string, 
    startDate?: string, 
    endDate?: string 
  }): Promise<ApiResponse<any>> => 
    apiAdapter.get(
      () => request.get('/audit/logs/export', { params, responseType: 'blob' }),
      async () => ({ downloadUrl: '/mock/audit-logs-export.xlsx' })
    )
}
