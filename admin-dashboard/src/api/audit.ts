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
      () => request.get('/audit/tasks', { params }) as Promise<ApiResponse<{ list: AuditTask[], total: number }>>,
      async () => {
        const allTasks = await auditTasks()
        return { list: allTasks, total: allTasks.length }
      },
      { mockPagination: true, paginationParams: params }
    ),

  // 获取单个任务详情
  getTask: (taskId: string): Promise<ApiResponse<AuditTask>> => 
    apiAdapter.get(
      () => request.get(`/audit/tasks/${taskId}`) as Promise<ApiResponse<AuditTask>>,
      async () => {
        const allTasks = await auditTasks()
        // 使用taskId而不是id来查找任务
        const task = allTasks.find(t => t.taskId === taskId)
        if (!task) {
          throw new Error('任务不存在')
        }
        return task
      }
    ),

  // 审核通过
  approve: (taskId: string, data?: { remark?: string }): Promise<ApiResponse<any>> => 
    apiAdapter.post(
      () => request.post(`/audit/tasks/${taskId}/approve`, data) as Promise<ApiResponse<any>>,
      { success: true, message: '审核通过' }
    ),

  // 审核拒绝
  reject: (taskId: string, data: { reason: string, detail?: string }): Promise<ApiResponse<any>> => 
    apiAdapter.post(
      () => request.post(`/audit/tasks/${taskId}/reject`, data) as Promise<ApiResponse<any>>,
      { success: true, message: '审核拒绝' }
    ),

  // 批量审核
  batchAudit: (data: { taskIds: string[], action: 'approve' | 'reject', reason?: string }): Promise<ApiResponse<any>> => 
    apiAdapter.post(
      () => request.post('/audit/tasks/batch', data) as Promise<ApiResponse<any>>,
      { 
        successCount: data.taskIds.length, 
        failCount: 0, 
        message: `批量${data.action === 'approve' ? '通过' : '拒绝'}成功` 
      }
    ),

  // 转交任务
  transfer: (taskId: string, data: { assigneeId: number, reason: string }): Promise<ApiResponse<any>> => 
    apiAdapter.post(
      () => request.post(`/audit/tasks/${taskId}/transfer`, data) as Promise<ApiResponse<any>>,
      { success: true, message: '任务转交成功' }
    ),

  // 获取审核统计数据
  getStats: (): Promise<ApiResponse<AuditStats>> => 
    apiAdapter.get(
      () => request.get('/audit/stats') as Promise<ApiResponse<AuditStats>>,
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
      () => request.post('/audit/tasks/submit', data) as Promise<ApiResponse<{ taskId: string, status: string }>>,
      {
        taskId: 'task_' + Date.now(),
        status: 'pending'
      }
    ),

  // 查询审核结果（业务方调用）
  getResult: (bizType: string, bizId: string): Promise<ApiResponse<{ status: string, reason?: string }>> => 
    apiAdapter.get(
      () => request.get('/audit/tasks/result', {
        params: { bizType, bizId }
      }) as Promise<ApiResponse<{ status: string, reason?: string }>>,
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
      () => request.get('/audit/policies') as Promise<ApiResponse<AuditPolicy[]>>,
      async () => await auditPolicies()
    ),

  // 获取单个策略
  getPolicy: (policyId: number): Promise<ApiResponse<AuditPolicy>> => 
    apiAdapter.get(
      () => request.get(`/audit/policies/${policyId}`) as Promise<ApiResponse<AuditPolicy>>,
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
      () => request.post('/audit/policies', data) as Promise<ApiResponse<AuditPolicy>>,
      {
        id: Date.now(),
        ...data,
        creator: '系统管理员',
        createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updateTime: undefined
      } as unknown as AuditPolicy
    ),

  // 更新策略
  updatePolicy: (policyId: number, data: PolicyForm): Promise<ApiResponse<AuditPolicy>> => 
    apiAdapter.put(
      () => request.put(`/audit/policies/${policyId}`, data) as Promise<ApiResponse<AuditPolicy>>,
      policyId,
      {
        id: policyId,
        ...data,
        updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
      } as Partial<AuditPolicy>
    ),

  // 删除策略
  deletePolicy: (policyId: number): Promise<ApiResponse<any>> => 
    apiAdapter.delete(
      () => request.delete(`/audit/policies/${policyId}`) as Promise<ApiResponse<any>>,
      '策略删除成功'
    ),

  // 启用/禁用策略
  togglePolicy: (policyId: number, isActive: boolean): Promise<ApiResponse<any>> => 
    apiAdapter.action(
      () => request.patch(`/audit/policies/${policyId}/toggle`, { isActive }) as Promise<ApiResponse<any>>,
      { success: true, message: `策略${isActive ? '启用' : '禁用'}成功` }
    )
}

/**
 * 敏感词相关API
 */
export const sensitiveWordApi = {
  // 获取敏感词列表
  getWords: (params?: { keyword?: string, action?: string, page?: number, size?: number }): Promise<ApiResponse<{ list: SensitiveWord[], total: number }>> => 
    apiAdapter.get(
      () => request.get('/audit/sensitive-words', { params }) as Promise<ApiResponse<{ list: SensitiveWord[], total: number }>>,
      async () => {
        const allWords = await sensitiveWords()
        return { list: allWords, total: allWords.length }
      },
      { mockPagination: true, paginationParams: params }
    ),

  // 获取单个敏感词
  getWord: (wordId: number): Promise<ApiResponse<SensitiveWord>> => 
    apiAdapter.get(
      () => request.get(`/audit/sensitive-words/${wordId}`) as Promise<ApiResponse<SensitiveWord>>,
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
      () => request.post('/audit/sensitive-words', data) as Promise<ApiResponse<SensitiveWord>>,
      {
        id: Date.now(),
        ...data,
        isRegex: false,
        hitCount: 0,
        creator: '系统管理员',
        createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updateTime: undefined
      } as unknown as SensitiveWord
    ),

  // 更新敏感词
  updateWord: (wordId: number, data: WordForm): Promise<ApiResponse<SensitiveWord>> => 
    apiAdapter.put(
      () => request.put(`/audit/sensitive-words/${wordId}`, data) as Promise<ApiResponse<SensitiveWord>>,
      wordId,
      {
        id: wordId,
        ...data
      } as Partial<SensitiveWord>
    ),

  // 删除敏感词
  deleteWord: (wordId: number): Promise<ApiResponse<any>> => 
    apiAdapter.delete(
      () => request.delete(`/audit/sensitive-words/${wordId}`) as Promise<ApiResponse<any>>,
      '敏感词删除成功'
    ),

  // 批量导入敏感词
  batchImport: (data: { words: string[], action: string, category: string, replaceWith?: string }): Promise<ApiResponse<any>> => 
    apiAdapter.post(
      () => request.post('/audit/sensitive-words/batch-import', data) as Promise<ApiResponse<any>>,
      { success: true, message: '批量导入成功' }
    ),

  // 导出敏感词
  exportWords: (): Promise<ApiResponse<any>> => 
    apiAdapter.get(
      () => request.get('/audit/sensitive-words/export') as Promise<ApiResponse<any>>,
      async () => ({ downloadUrl: '/mock/sensitive-words-export.xlsx' })
    ),

  // 检查敏感词
  checkWords: (content: string): Promise<ApiResponse<any>> => 
    apiAdapter.post(
      () => request.post('/audit/sensitive-words/check', { content }) as Promise<ApiResponse<any>>,
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
      () => request.get('/audit/auditors', { params }) as Promise<ApiResponse<{ list: Auditor[], total: number }>>,
      async () => {
        const allAuditors = await auditors()
        return { list: allAuditors, total: allAuditors.length }
      },
      { mockPagination: true, paginationParams: params }
    ),

  // 获取单个审核员
  getAuditor: (auditorId: number): Promise<ApiResponse<Auditor>> => 
    apiAdapter.get(
      () => request.get(`/audit/auditors/${auditorId}`) as Promise<ApiResponse<Auditor>>,
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
      () => request.post('/audit/auditors', data) as Promise<ApiResponse<Auditor>>,
      {
        id: Date.now(),
        ...data,
        pendingCount: 0,
        todayProcessed: 0,
        approvalRate: 100,
        createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updateTime: undefined
      } as unknown as Auditor
    ),

  // 更新审核员
  updateAuditor: (auditorId: number, data: AuditorForm): Promise<ApiResponse<Auditor>> => 
    apiAdapter.put(
      () => request.put(`/audit/auditors/${auditorId}`, data) as Promise<ApiResponse<Auditor>>,
      auditorId,
      {
        id: auditorId,
        ...data
      } as Partial<Auditor>
    ),

  // 删除审核员
  deleteAuditor: (auditorId: number): Promise<ApiResponse<any>> => 
    apiAdapter.delete(
      () => request.delete(`/audit/auditors/${auditorId}`) as Promise<ApiResponse<any>>,
      '审核员删除成功'
    ),

  // 启用/禁用审核员
  toggleAuditor: (auditorId: number, status: boolean): Promise<ApiResponse<any>> => 
    apiAdapter.action(
      () => request.patch(`/audit/auditors/${auditorId}/toggle`, { status }) as Promise<ApiResponse<any>>,
      { success: true, message: `审核员${status ? '启用' : '禁用'}成功` }
    ),

  // 获取审核员统计数据
  getAuditorStats: (auditorId: number, dateRange?: [string, string]): Promise<ApiResponse<any>> => 
    apiAdapter.get(
      () => request.get(`/audit/auditors/${auditorId}/stats`, { 
        params: { startDate: dateRange?.[0], endDate: dateRange?.[1] } 
      }) as Promise<ApiResponse<any>>,
      async () => ({
        totalProcessed: 45,
        approvalRate: 98.5,
        avgProcessTime: 85,
        qualityScore: 95,
        dailyStats: []
      })
    ),

  // 导出审核员列表
  exportAuditors: (): Promise<ApiResponse<any>> => 
    apiAdapter.get(
      () => request.get('/audit/auditors/export') as Promise<ApiResponse<any>>,
      async () => ({ downloadUrl: '/mock/auditors-export.xlsx' })
    ),

  // 批量分配任务
  assignTasks: (data: AssignForm): Promise<ApiResponse<any>> => 
    apiAdapter.post(
      () => request.post('/audit/auditors/assign-tasks', data) as Promise<ApiResponse<any>>,
      { success: true, message: '任务分配成功' }
    )
}
