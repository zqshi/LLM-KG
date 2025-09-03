import { request } from './request'
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
  AssignForm
} from '@/types'

/**
 * 审核任务相关API
 */
export const auditTaskApi = {
  // 获取任务列表
  getTasks: (params: TaskFilters) => 
    request.get<{ list: AuditTask[], total: number }>('/audit/tasks', { params }),

  // 获取单个任务详情
  getTask: (taskId: string) => 
    request.get<AuditTask>(`/audit/tasks/${taskId}`),

  // 审核通过
  approve: (taskId: string, data?: { remark?: string }) => 
    request.post(`/audit/tasks/${taskId}/approve`, data),

  // 审核拒绝
  reject: (taskId: string, data: { reason: string, detail?: string }) => 
    request.post(`/audit/tasks/${taskId}/reject`, data),

  // 批量审核
  batchAudit: (data: { taskIds: string[], action: 'approve' | 'reject', reason?: string }) => 
    request.post('/audit/tasks/batch', data),

  // 转交任务
  transfer: (taskId: string, data: { assigneeId: number, reason: string }) => 
    request.post(`/audit/tasks/${taskId}/transfer`, data),

  // 获取审核统计数据
  getStats: () => 
    request.get<AuditStats>('/audit/stats'),

  // 提交审核任务（业务方调用）
  submitTask: (data: {
    bizType: string
    bizId: string
    content: any
    submitterId: number
  }) => 
    request.post<{ taskId: string, status: string }>('/audit/tasks/submit', data),

  // 查询审核结果（业务方调用）
  getResult: (bizType: string, bizId: string) => 
    request.get<{ status: string, reason?: string }>('/audit/tasks/result', {
      params: { bizType, bizId }
    })
}

/**
 * 审核策略相关API
 */
export const auditPolicyApi = {
  // 获取策略列表
  getPolicies: () => 
    request.get<AuditPolicy[]>('/audit/policies'),

  // 获取单个策略
  getPolicy: (policyId: number) => 
    request.get<AuditPolicy>(`/audit/policies/${policyId}`),

  // 创建策略
  createPolicy: (data: PolicyForm) => 
    request.post<AuditPolicy>('/audit/policies', data),

  // 更新策略
  updatePolicy: (policyId: number, data: PolicyForm) => 
    request.put<AuditPolicy>(`/audit/policies/${policyId}`, data),

  // 删除策略
  deletePolicy: (policyId: number) => 
    request.delete(`/audit/policies/${policyId}`),

  // 启用/禁用策略
  togglePolicy: (policyId: number, isActive: boolean) => 
    request.patch(`/audit/policies/${policyId}/toggle`, { isActive })
}

/**
 * 敏感词相关API
 */
export const sensitiveWordApi = {
  // 获取敏感词列表
  getWords: (params?: { keyword?: string, action?: string, page?: number, size?: number }) => 
    request.get<{ list: SensitiveWord[], total: number }>('/audit/sensitive-words', { params }),

  // 获取单个敏感词
  getWord: (wordId: number) => 
    request.get<SensitiveWord>(`/audit/sensitive-words/${wordId}`),

  // 创建敏感词
  createWord: (data: WordForm) => 
    request.post<SensitiveWord>('/audit/sensitive-words', data),

  // 更新敏感词
  updateWord: (wordId: number, data: WordForm) => 
    request.put<SensitiveWord>(`/audit/sensitive-words/${wordId}`, data),

  // 删除敏感词
  deleteWord: (wordId: number) => 
    request.delete(`/audit/sensitive-words/${wordId}`),

  // 批量导入敏感词
  batchImport: (data: { words: string[], action: string, category: string, replaceWith?: string }) => 
    request.post('/audit/sensitive-words/batch-import', data),

  // 导出敏感词
  exportWords: () => 
    request.get('/audit/sensitive-words/export', { responseType: 'blob' }),

  // 检查敏感词（业务方调用）
  checkWords: (content: string) => 
    request.post<{ hits: Array<{ word: string, action: string, replaceWith?: string }> }>('/audit/sensitive-words/check', { content })
}

/**
 * 审核员相关API
 */
export const auditorApi = {
  // 获取审核员列表
  getAuditors: (params?: { keyword?: string, role?: string, page?: number, size?: number }) => 
    request.get<{ list: Auditor[], total: number }>('/audit/auditors', { params }),

  // 获取单个审核员
  getAuditor: (auditorId: number) => 
    request.get<Auditor>(`/audit/auditors/${auditorId}`),

  // 创建审核员
  createAuditor: (data: AuditorForm) => 
    request.post<Auditor>('/audit/auditors', data),

  // 更新审核员
  updateAuditor: (auditorId: number, data: AuditorForm) => 
    request.put<Auditor>(`/audit/auditors/${auditorId}`, data),

  // 删除审核员
  deleteAuditor: (auditorId: number) => 
    request.delete(`/audit/auditors/${auditorId}`),

  // 启用/禁用审核员
  toggleAuditor: (auditorId: number, status: boolean) => 
    request.patch(`/audit/auditors/${auditorId}/toggle`, { status }),

  // 获取审核员统计数据
  getAuditorStats: (auditorId: number, dateRange?: [string, string]) => 
    request.get(`/audit/auditors/${auditorId}/stats`, { 
      params: { startDate: dateRange?.[0], endDate: dateRange?.[1] } 
    }),

  // 批量分配任务
  batchAssign: (data: AssignForm) => 
    request.post('/audit/auditors/batch-assign', data),

  // 导出审核员列表
  exportAuditors: () => 
    request.get('/audit/auditors/export', { responseType: 'blob' })
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
  }) => 
    request.get<{ list: any[], total: number }>('/audit/logs', { params }),

  // 导出审核日志
  exportLogs: (params?: { 
    taskId?: string, 
    auditorId?: number, 
    action?: string, 
    startDate?: string, 
    endDate?: string 
  }) => 
    request.get('/audit/logs/export', { params, responseType: 'blob' })
}
