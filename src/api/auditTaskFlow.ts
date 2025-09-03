import { request } from './request'
import type { 
  BizType, 
  AuditTaskSubmission, 
  AuditCallbackData,
  AuditTaskStatus 
} from '@/types'

/**
 * 审核任务流程状态枚举
 */
export enum TaskFlowStatus {
  SUBMITTED = 'submitted',
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  AUTO_APPROVED = 'auto_approved',
  AUTO_REJECTED = 'auto_rejected',
  CANCELLED = 'cancelled',
  ERROR = 'error'
}

/**
 * 审核任务流程接口
 */
export interface AuditTaskFlow {
  taskId: string
  bizType: BizType
  bizId: string
  status: TaskFlowStatus
  submitterId: number
  submitterName: string
  assigneeId?: number
  assigneeName?: string
  priority: 'high' | 'normal' | 'low'
  content: any
  submitTime: string
  assignTime?: string
  startTime?: string
  completeTime?: string
  processTime?: number
  reason?: string
  detail?: string
  metadata?: Record<string, any>
  callbacks: AuditTaskCallback[]
  history: AuditTaskHistory[]
}

/**
 * 审核任务回调接口
 */
export interface AuditTaskCallback {
  id: string
  taskId: string
  callbackUrl: string
  nodeId: string
  status: 'pending' | 'success' | 'failed'
  retryCount: number
  maxRetries: number
  lastAttemptTime?: string
  errorMessage?: string
  createTime: string
}

/**
 * 审核任务历史接口
 */
export interface AuditTaskHistory {
  id: string
  taskId: string
  action: string
  operatorId?: number
  operatorName?: string
  fromStatus: TaskFlowStatus
  toStatus: TaskFlowStatus
  reason?: string
  detail?: string
  metadata?: Record<string, any>
  createTime: string
}

/**
 * 任务流程配置接口
 */
export interface TaskFlowConfig {
  enableAutoAssignment: boolean
  enablePriorityQueue: boolean
  enableCallback: boolean
  enableRetry: boolean
  maxRetries: number
  retryInterval: number
  callbackTimeout: number
  taskTimeout: number
  enableMetrics: boolean
}

/**
 * 审核任务流程管理器
 * 负责管理整个审核任务的生命周期
 */
export class AuditTaskFlowManager {
  private config: TaskFlowConfig
  private callbacks: Map<string, AuditTaskCallback[]> = new Map()
  private metrics: TaskFlowMetrics

  constructor(config?: Partial<TaskFlowConfig>) {
    this.config = {
      enableAutoAssignment: true,
      enablePriorityQueue: true,
      enableCallback: true,
      enableRetry: true,
      maxRetries: 3,
      retryInterval: 5000,
      callbackTimeout: 30000,
      taskTimeout: 3600000, // 1小时
      enableMetrics: true,
      ...config
    }
    this.metrics = new TaskFlowMetrics()
  }

  /**
   * 提交审核任务
   */
  async submitTask(submission: AuditTaskSubmission): Promise<string> {
    try {
      const startTime = Date.now()
      
      // 创建任务流程记录
      const taskFlow = await this.createTaskFlow(submission)
      
      // 提交到审核中心
      const response = await request.post<{ taskId: string, status: string }>('/audit/tasks/submit', {
        ...submission,
        flowId: taskFlow.taskId
      })

      // 更新任务状态
      await this.updateTaskStatus(taskFlow.taskId, TaskFlowStatus.PENDING)

      // 如果启用自动分配，尝试分配审核员
      if (this.config.enableAutoAssignment) {
        await this.tryAutoAssignment(taskFlow.taskId)
      }

      // 记录指标
      if (this.config.enableMetrics) {
        this.metrics.recordTaskSubmission(submission.bizType, Date.now() - startTime)
      }

      return response.data.taskId
    } catch (error) {
      console.error('提交审核任务失败:', error)
      throw error
    }
  }

  /**
   * 获取任务流程状态
   */
  async getTaskFlow(taskId: string): Promise<AuditTaskFlow | null> {
    try {
      const response = await request.get(`/audit/tasks/${taskId}/flow`)
      return response.data
    } catch (error) {
      console.error('获取任务流程失败:', error)
      return null
    }
  }

  /**
   * 更新任务状态
   */
  async updateTaskStatus(
    taskId: string, 
    status: TaskFlowStatus, 
    options?: {
      operatorId?: number
      operatorName?: string
      reason?: string
      detail?: string
      metadata?: Record<string, any>
    }
  ): Promise<void> {
    try {
      // 获取当前状态
      const currentFlow = await this.getTaskFlow(taskId)
      if (!currentFlow) {
        throw new Error('任务流程不存在')
      }

      // 验证状态转换是否合法
      if (!this.isValidStatusTransition(currentFlow.status, status)) {
        throw new Error(`非法的状态转换: ${currentFlow.status} -> ${status}`)
      }

      // 更新任务状态
      await request.patch(`/audit/tasks/${taskId}/status`, {
        status,
        ...options,
        updateTime: new Date().toISOString()
      })

      // 记录历史
      await this.recordHistory(taskId, {
        action: 'status_change',
        fromStatus: currentFlow.status,
        toStatus: status,
        ...options
      })

      // 处理状态变更后的逻辑
      await this.handleStatusChange(taskId, status, currentFlow)

    } catch (error) {
      console.error('更新任务状态失败:', error)
      throw error
    }
  }

  /**
   * 分配任务给审核员
   */
  async assignTask(
    taskId: string, 
    assigneeId: number, 
    assigneeName: string,
    operatorId?: number
  ): Promise<void> {
    try {
      await request.post(`/audit/tasks/${taskId}/assign`, {
        assigneeId,
        assigneeName,
        operatorId,
        assignTime: new Date().toISOString()
      })

      await this.updateTaskStatus(taskId, TaskFlowStatus.ASSIGNED, {
        operatorId,
        detail: `任务已分配给 ${assigneeName}`
      })

    } catch (error) {
      console.error('分配任务失败:', error)
      throw error
    }
  }

  /**
   * 处理审核结果
   */
  async handleAuditResult(callbackData: AuditCallbackData): Promise<void> {
    try {
      const { taskId, status, reason, detail, auditorId } = callbackData
      const startTime = Date.now()

      // 转换状态
      const taskStatus = this.mapAuditStatusToFlowStatus(status)

      // 更新任务状态
      await this.updateTaskStatus(taskId, taskStatus, {
        operatorId: auditorId,
        reason,
        detail,
        metadata: {
          processTime: callbackData.processTime,
          auditResult: status
        }
      })

      // 触发回调
      if (this.config.enableCallback) {
        await this.triggerCallbacks(taskId, callbackData)
      }

      // 记录指标
      if (this.config.enableMetrics) {
        this.metrics.recordTaskCompletion(taskStatus, Date.now() - startTime)
      }

    } catch (error) {
      console.error('处理审核结果失败:', error)
      throw error
    }
  }

  /**
   * 注册任务回调
   */
  async registerCallback(
    taskId: string, 
    callbackUrl: string, 
    nodeId: string
  ): Promise<string> {
    try {
      const callback: AuditTaskCallback = {
        id: this.generateId(),
        taskId,
        callbackUrl,
        nodeId,
        status: 'pending',
        retryCount: 0,
        maxRetries: this.config.maxRetries,
        createTime: new Date().toISOString()
      }

      await request.post('/audit/tasks/callbacks', callback)

      // 本地缓存
      const callbacks = this.callbacks.get(taskId) || []
      callbacks.push(callback)
      this.callbacks.set(taskId, callbacks)

      return callback.id
    } catch (error) {
      console.error('注册回调失败:', error)
      throw error
    }
  }

  /**
   * 批量处理任务
   */
  async batchProcessTasks(
    taskIds: string[],
    action: 'approve' | 'reject',
    options?: {
      operatorId?: number
      operatorName?: string
      reason?: string
      detail?: string
    }
  ): Promise<{ success: string[], failed: string[] }> {
    const results = { success: [], failed: [] }
    
    for (const taskId of taskIds) {
      try {
        const status = action === 'approve' ? TaskFlowStatus.APPROVED : TaskFlowStatus.REJECTED
        await this.updateTaskStatus(taskId, status, options)
        results.success.push(taskId)
      } catch (error) {
        console.error(`批量处理任务失败 ${taskId}:`, error)
        results.failed.push(taskId)
      }
    }

    return results
  }

  /**
   * 获取任务统计
   */
  async getTaskStatistics(
    filters?: {
      bizType?: BizType
      dateRange?: [string, string]
      status?: TaskFlowStatus[]
    }
  ): Promise<any> {
    try {
      const response = await request.get('/audit/tasks/statistics', { params: filters })
      return response.data
    } catch (error) {
      console.error('获取任务统计失败:', error)
      return null
    }
  }

  // 私有方法

  private async createTaskFlow(submission: AuditTaskSubmission): Promise<AuditTaskFlow> {
    const taskFlow: AuditTaskFlow = {
      taskId: this.generateId(),
      bizType: submission.bizType,
      bizId: submission.bizId,
      status: TaskFlowStatus.SUBMITTED,
      submitterId: submission.submitterId,
      submitterName: submission.submitterName,
      priority: 'normal', // 默认优先级，可以根据策略调整
      content: submission.content,
      submitTime: new Date().toISOString(),
      metadata: submission.metadata,
      callbacks: [],
      history: []
    }

    // 保存到数据库
    await request.post('/audit/tasks/flows', taskFlow)
    
    return taskFlow
  }

  private async tryAutoAssignment(taskId: string): Promise<void> {
    try {
      const response = await request.post(`/audit/tasks/${taskId}/auto-assign`)
      if (response.data.assigned) {
        await this.updateTaskStatus(taskId, TaskFlowStatus.ASSIGNED, {
          detail: `自动分配给 ${response.data.assigneeName}`
        })
      }
    } catch (error) {
      console.error('自动分配失败:', error)
      // 自动分配失败不影响主流程
    }
  }

  private isValidStatusTransition(from: TaskFlowStatus, to: TaskFlowStatus): boolean {
    const validTransitions: Record<TaskFlowStatus, TaskFlowStatus[]> = {
      [TaskFlowStatus.SUBMITTED]: [TaskFlowStatus.PENDING, TaskFlowStatus.AUTO_APPROVED, TaskFlowStatus.AUTO_REJECTED],
      [TaskFlowStatus.PENDING]: [TaskFlowStatus.ASSIGNED, TaskFlowStatus.AUTO_APPROVED, TaskFlowStatus.AUTO_REJECTED, TaskFlowStatus.CANCELLED],
      [TaskFlowStatus.ASSIGNED]: [TaskFlowStatus.IN_PROGRESS, TaskFlowStatus.PENDING],
      [TaskFlowStatus.IN_PROGRESS]: [TaskFlowStatus.APPROVED, TaskFlowStatus.REJECTED, TaskFlowStatus.ASSIGNED],
      [TaskFlowStatus.APPROVED]: [],
      [TaskFlowStatus.REJECTED]: [],
      [TaskFlowStatus.AUTO_APPROVED]: [],
      [TaskFlowStatus.AUTO_REJECTED]: [],
      [TaskFlowStatus.CANCELLED]: [],
      [TaskFlowStatus.ERROR]: [TaskFlowStatus.PENDING]
    }

    return validTransitions[from]?.includes(to) || false
  }

  private async handleStatusChange(
    taskId: string, 
    newStatus: TaskFlowStatus, 
    currentFlow: AuditTaskFlow
  ): Promise<void> {
    switch (newStatus) {
      case TaskFlowStatus.ASSIGNED:
        await this.handleTaskAssigned(taskId)
        break
      case TaskFlowStatus.IN_PROGRESS:
        await this.handleTaskStarted(taskId)
        break
      case TaskFlowStatus.APPROVED:
      case TaskFlowStatus.REJECTED:
      case TaskFlowStatus.AUTO_APPROVED:
      case TaskFlowStatus.AUTO_REJECTED:
        await this.handleTaskCompleted(taskId, newStatus)
        break
    }
  }

  private async handleTaskAssigned(taskId: string): Promise<void> {
    // 设置任务超时检查
    if (this.config.taskTimeout > 0) {
      setTimeout(() => {
        this.checkTaskTimeout(taskId)
      }, this.config.taskTimeout)
    }
  }

  private async handleTaskStarted(taskId: string): Promise<void> {
    // 记录开始时间等
  }

  private async handleTaskCompleted(taskId: string, status: TaskFlowStatus): Promise<void> {
    // 清理相关资源，发送通知等
  }

  private async checkTaskTimeout(taskId: string): Promise<void> {
    try {
      const flow = await this.getTaskFlow(taskId)
      if (flow && flow.status === TaskFlowStatus.IN_PROGRESS) {
        await this.updateTaskStatus(taskId, TaskFlowStatus.ERROR, {
          reason: 'task_timeout',
          detail: '任务处理超时'
        })
      }
    } catch (error) {
      console.error('检查任务超时失败:', error)
    }
  }

  private mapAuditStatusToFlowStatus(auditStatus: string): TaskFlowStatus {
    const mapping: Record<string, TaskFlowStatus> = {
      'approved': TaskFlowStatus.APPROVED,
      'rejected': TaskFlowStatus.REJECTED,
      'auto_approved': TaskFlowStatus.AUTO_APPROVED,
      'auto_rejected': TaskFlowStatus.AUTO_REJECTED
    }
    return mapping[auditStatus] || TaskFlowStatus.ERROR
  }

  private async triggerCallbacks(taskId: string, callbackData: AuditCallbackData): Promise<void> {
    const callbacks = this.callbacks.get(taskId) || []
    
    for (const callback of callbacks) {
      if (callback.status === 'pending') {
        await this.executeCallback(callback, callbackData)
      }
    }
  }

  private async executeCallback(
    callback: AuditTaskCallback, 
    callbackData: AuditCallbackData
  ): Promise<void> {
    try {
      const response = await request.post(callback.callbackUrl, callbackData, {
        timeout: this.config.callbackTimeout
      })

      callback.status = 'success'
      callback.lastAttemptTime = new Date().toISOString()
      
      await this.updateCallback(callback)
    } catch (error) {
      callback.retryCount++
      callback.errorMessage = error.message
      callback.lastAttemptTime = new Date().toISOString()

      if (callback.retryCount >= callback.maxRetries) {
        callback.status = 'failed'
      }

      await this.updateCallback(callback)

      // 如果还可以重试，安排重试
      if (callback.retryCount < callback.maxRetries) {
        setTimeout(() => {
          this.executeCallback(callback, callbackData)
        }, this.config.retryInterval * callback.retryCount)
      }
    }
  }

  private async updateCallback(callback: AuditTaskCallback): Promise<void> {
    try {
      await request.put(`/audit/tasks/callbacks/${callback.id}`, callback)
    } catch (error) {
      console.error('更新回调状态失败:', error)
    }
  }

  private async recordHistory(
    taskId: string, 
    historyData: Partial<AuditTaskHistory>
  ): Promise<void> {
    try {
      const history: AuditTaskHistory = {
        id: this.generateId(),
        taskId,
        action: historyData.action || 'unknown',
        createTime: new Date().toISOString(),
        ...historyData
      }

      await request.post('/audit/tasks/history', history)
    } catch (error) {
      console.error('记录历史失败:', error)
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * 任务流程指标统计
 */
export class TaskFlowMetrics {
  private submissionCount = 0
  private completionCount = 0
  private avgProcessTime = 0
  private successRate = 0

  recordTaskSubmission(bizType: BizType, processTime: number): void {
    this.submissionCount++
    // 更新统计逻辑
  }

  recordTaskCompletion(status: TaskFlowStatus, processTime: number): void {
    this.completionCount++
    // 更新统计逻辑
  }

  getMetrics(): any {
    return {
      submissionCount: this.submissionCount,
      completionCount: this.completionCount,
      avgProcessTime: this.avgProcessTime,
      successRate: this.successRate
    }
  }
}

// 导出单例实例
export const auditTaskFlowManager = new AuditTaskFlowManager()