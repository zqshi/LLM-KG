import { auditTaskFlowManager, TaskFlowStatus, type AuditTaskFlow } from './auditTaskFlow'
import { 
  auditDataFlowProcessor, 
  AuditDataFlowEvent, 
  type DataFlowEvent 
} from './auditDataFlow'
import { auditNodeUtils } from './auditNodeFactory'
import type { 
  BizType, 
  AuditTaskSubmission, 
  AuditCallbackData 
} from '@/types'

/**
 * 审核流程集成管理器
 * 整合任务流程管理和数据流处理，提供统一的审核流程接口
 */
export class AuditFlowIntegration {
  private static instance: AuditFlowIntegration

  private constructor() {
    this.setupEventListeners()
  }

  public static getInstance(): AuditFlowIntegration {
    if (!AuditFlowIntegration.instance) {
      AuditFlowIntegration.instance = new AuditFlowIntegration()
    }
    return AuditFlowIntegration.instance
  }

  /**
   * 提交审核任务（集成版本）
   */
  async submitAuditTask(submission: AuditTaskSubmission): Promise<{
    taskId: string
    status: string
    needAudit: boolean
  }> {
    const startTime = Date.now()

    try {
      // 发送提交事件
      await auditDataFlowProcessor.emitEvent({
        type: AuditDataFlowEvent.TASK_SUBMITTED,
        taskId: 'pending', // 暂时使用pending，后续会更新
        bizType: submission.bizType,
        data: {
          submission,
          startTime
        },
        metadata: {
          submitterId: submission.submitterId,
          submitterName: submission.submitterName
        }
      })

      // 检查是否需要审核
      const auditCheck = await auditNodeUtils.checkAuditRequired(
        submission.bizType, 
        submission.content
      )

      if (!auditCheck.needAudit) {
        // 不需要审核，直接处理自动通过
        const taskId = await this.handleAutoApproval(submission, auditCheck.skipReason || '')
        
        await auditDataFlowProcessor.emitEvent({
          type: AuditDataFlowEvent.TASK_COMPLETED,
          taskId,
          bizType: submission.bizType,
          data: {
            status: 'auto_approved',
            reason: auditCheck.skipReason,
            processTime: Date.now() - startTime
          }
        })

        return {
          taskId,
          status: 'auto_approved',
          needAudit: false
        }
      }

      // 提交到审核流程管理器
      const taskId = await auditTaskFlowManager.submitTask(submission)

      // 更新事件中的taskId
      await auditDataFlowProcessor.emitEvent({
        type: AuditDataFlowEvent.TASK_ASSIGNED,
        taskId,
        bizType: submission.bizType,
        data: {
          priority: auditCheck.priority,
          policy: auditCheck.policy,
          processTime: Date.now() - startTime
        }
      })

      return {
        taskId,
        status: 'pending',
        needAudit: true
      }

    } catch (error) {
      // 发送错误事件
      await auditDataFlowProcessor.emitEvent({
        type: AuditDataFlowEvent.ERROR_OCCURRED,
        taskId: 'unknown',
        bizType: submission.bizType,
        data: {
          error: error.message,
          submission,
          processTime: Date.now() - startTime
        }
      })

      throw error
    }
  }

  /**
   * 获取任务完整信息
   */
  async getTaskDetail(taskId: string): Promise<{
    flow: AuditTaskFlow | null
    dataStream: DataFlowEvent[]
    metrics: any
  }> {
    const [flow, dataStream, metrics] = await Promise.all([
      auditTaskFlowManager.getTaskFlow(taskId),
      this.getTaskDataStream(taskId),
      auditDataFlowProcessor.getTaskDataSummary(taskId)
    ])

    return { flow, dataStream, metrics }
  }

  /**
   * 批量处理任务（集成版本）
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
  ): Promise<{
    success: string[]
    failed: string[]
    summary: {
      total: number
      successCount: number
      failedCount: number
      processTime: number
    }
  }> {
    const startTime = Date.now()

    // 发送批量处理开始事件
    await auditDataFlowProcessor.emitEvent({
      type: AuditDataFlowEvent.TASK_STARTED,
      taskId: taskIds.join(','),
      bizType: 'forum_post', // 批量操作使用默认类型
      data: {
        action,
        taskIds,
        options,
        startTime
      }
    })

    try {
      const result = await auditTaskFlowManager.batchProcessTasks(taskIds, action, options)
      
      const summary = {
        total: taskIds.length,
        successCount: result.success.length,
        failedCount: result.failed.length,
        processTime: Date.now() - startTime
      }

      // 发送批量处理完成事件
      await auditDataFlowProcessor.emitEvent({
        type: AuditDataFlowEvent.TASK_COMPLETED,
        taskId: taskIds.join(','),
        bizType: 'forum_post',
        data: {
          action,
          result,
          summary
        }
      })

      return { ...result, summary }

    } catch (error) {
      await auditDataFlowProcessor.emitEvent({
        type: AuditDataFlowEvent.TASK_FAILED,
        taskId: taskIds.join(','),
        bizType: 'forum_post',
        data: {
          action,
          error: error.message,
          processTime: Date.now() - startTime
        }
      })

      throw error
    }
  }

  /**
   * 处理审核结果回调（集成版本）
   */
  async handleAuditCallback(
    taskId: string,
    callbackData: AuditCallbackData
  ): Promise<void> {
    const startTime = Date.now()

    try {
      // 获取任务信息以确定业务类型
      const taskFlow = await auditTaskFlowManager.getTaskFlow(taskId)
      const bizType = taskFlow?.bizType || 'forum_post'

      // 发送审核结果事件
      await auditDataFlowProcessor.emitEvent({
        type: AuditDataFlowEvent.TASK_COMPLETED,
        taskId,
        bizType,
        data: {
          callbackData,
          startTime
        }
      })

      // 处理审核结果
      await auditTaskFlowManager.handleAuditResult(callbackData)

      // 通过审核节点处理回调
      await auditNodeUtils.handleAuditCallback(bizType, callbackData)

      // 发送回调成功事件
      await auditDataFlowProcessor.emitEvent({
        type: AuditDataFlowEvent.CALLBACK_SUCCESS,
        taskId,
        bizType,
        data: {
          callbackData,
          processTime: Date.now() - startTime
        }
      })

    } catch (error) {
      // 发送回调失败事件
      await auditDataFlowProcessor.emitEvent({
        type: AuditDataFlowEvent.CALLBACK_FAILED,
        taskId,
        bizType: 'forum_post',
        data: {
          error: error.message,
          callbackData,
          processTime: Date.now() - startTime
        }
      })

      throw error
    }
  }

  /**
   * 获取审核流程统计信息
   */
  async getFlowStatistics(
    filters?: {
      bizType?: BizType
      dateRange?: [string, string]
      status?: TaskFlowStatus[]
    }
  ): Promise<{
    taskStats: any
    dataFlowStats: any
    combinedMetrics: {
      totalTasks: number
      avgProcessTime: number
      throughput: number
      successRate: number
      errorRate: number
    }
  }> {
    const [taskStats, dataFlowStats] = await Promise.all([
      auditTaskFlowManager.getTaskStatistics(filters),
      auditDataFlowProcessor.getDataFlowMetrics(filters?.bizType, filters?.dateRange)
    ])

    const combinedMetrics = {
      totalTasks: taskStats?.totalTasks || 0,
      avgProcessTime: taskStats?.avgProcessTime || 0,
      throughput: dataFlowStats.throughput,
      successRate: taskStats?.successRate || 0,
      errorRate: dataFlowStats.errorRate
    }

    return {
      taskStats,
      dataFlowStats,
      combinedMetrics
    }
  }

  /**
   * 创建实时监控流
   */
  createRealtimeMonitor(filters?: {
    taskId?: string
    bizType?: BizType
    eventTypes?: AuditDataFlowEvent[]
  }): AsyncIterableIterator<{
    event: DataFlowEvent
    taskFlow?: AuditTaskFlow
    timestamp: number
  }> {
    return this.createRealtimeStream(filters)
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{
    taskFlowManager: boolean
    dataFlowProcessor: boolean
    auditNodes: Record<string, boolean>
    overall: boolean
  }> {
    try {
      // 检查各组件健康状态
      const taskFlowHealthy = await this.checkTaskFlowManagerHealth()
      const dataFlowHealthy = await this.checkDataFlowProcessorHealth()
      const nodesHealth = await this.checkAuditNodesHealth()

      const overall = taskFlowHealthy && dataFlowHealthy && 
                     Object.values(nodesHealth).every(h => h)

      return {
        taskFlowManager: taskFlowHealthy,
        dataFlowProcessor: dataFlowHealthy,
        auditNodes: nodesHealth,
        overall
      }
    } catch (error) {
      console.error('健康检查失败:', error)
      return {
        taskFlowManager: false,
        dataFlowProcessor: false,
        auditNodes: {},
        overall: false
      }
    }
  }

  // 私有方法

  private setupEventListeners(): void {
    // 监听任务状态变化
    auditDataFlowProcessor.on(AuditDataFlowEvent.STATUS_CHANGED, async (event: DataFlowEvent) => {
      // 同步状态到外部系统
      await this.syncStatusToExternal(event)
    })

    // 监听错误事件
    auditDataFlowProcessor.on(AuditDataFlowEvent.ERROR_OCCURRED, async (event: DataFlowEvent) => {
      // 处理错误，发送告警等
      await this.handleError(event)
    })
  }

  private async handleAutoApproval(
    submission: AuditTaskSubmission,
    reason: string
  ): Promise<string> {
    // 生成任务ID
    const taskId = `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    try {
      // 通过审核节点处理自动通过
      await auditNodeUtils.handleAuditCallback(submission.bizType, {
        taskId,
        status: 'auto_approved',
        reason,
        processTime: 0
      })

      return taskId
    } catch (error) {
      console.error('处理自动通过失败:', error)
      throw error
    }
  }

  private async getTaskDataStream(taskId: string): Promise<DataFlowEvent[]> {
    try {
      const summary = await auditDataFlowProcessor.getTaskDataSummary(taskId)
      return summary.events
    } catch (error) {
      console.error('获取任务数据流失败:', error)
      return []
    }
  }

  private async* createRealtimeStream(filters?: {
    taskId?: string
    bizType?: BizType
    eventTypes?: AuditDataFlowEvent[]
  }): AsyncIterableIterator<{
    event: DataFlowEvent
    taskFlow?: AuditTaskFlow
    timestamp: number
  }> {
    const eventStream = auditDataFlowProcessor.getEventStream(filters)

    for await (const event of eventStream) {
      let taskFlow: AuditTaskFlow | null = null
      
      // 获取对应的任务流程信息
      if (event.taskId && event.taskId !== 'unknown') {
        taskFlow = await auditTaskFlowManager.getTaskFlow(event.taskId)
      }

      yield {
        event,
        taskFlow: taskFlow || undefined,
        timestamp: Date.now()
      }
    }
  }

  private async checkTaskFlowManagerHealth(): Promise<boolean> {
    try {
      // 尝试获取统计信息来检查健康状态
      await auditTaskFlowManager.getTaskStatistics()
      return true
    } catch (error) {
      return false
    }
  }

  private async checkDataFlowProcessorHealth(): Promise<boolean> {
    try {
      // 检查数据流处理器是否正常工作
      await auditDataFlowProcessor.getDataFlowMetrics()
      return true
    } catch (error) {
      return false
    }
  }

  private async checkAuditNodesHealth(): Promise<Record<string, boolean>> {
    // 这里应该调用审核节点监控器的健康检查方法
    return {
      content_audit_node: true,
      flea_market_audit_node: true,
      banner_audit_node: true,
      news_audit_node: true,
      quotation_audit_node: true
    }
  }

  private async syncStatusToExternal(event: DataFlowEvent): Promise<void> {
    // 同步状态到外部系统
    try {
      // 这里可以集成消息队列、WebSocket等
      console.log('同步状态到外部系统:', event)
    } catch (error) {
      console.error('同步状态失败:', error)
    }
  }

  private async handleError(event: DataFlowEvent): Promise<void> {
    // 处理错误事件
    try {
      console.error('审核流程错误:', event)
      
      // 这里可以集成告警系统
      // await alertService.sendAlert({
      //   level: 'error',
      //   message: `审核任务 ${event.taskId} 出现错误: ${event.data.error}`,
      //   data: event
      // })
      
    } catch (error) {
      console.error('处理错误事件失败:', error)
    }
  }
}

/**
 * 审核流程工具函数
 */
export class AuditFlowUtils {
  
  /**
   * 格式化处理时间
   */
  static formatProcessTime(milliseconds: number): string {
    if (milliseconds < 1000) return `${milliseconds}ms`
    if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(1)}s`
    return `${(milliseconds / 60000).toFixed(1)}m`
  }

  /**
   * 获取状态描述
   */
  static getStatusDescription(status: TaskFlowStatus): string {
    const descriptions: Record<TaskFlowStatus, string> = {
      [TaskFlowStatus.SUBMITTED]: '已提交',
      [TaskFlowStatus.PENDING]: '等待审核',
      [TaskFlowStatus.ASSIGNED]: '已分配',
      [TaskFlowStatus.IN_PROGRESS]: '审核中',
      [TaskFlowStatus.APPROVED]: '审核通过',
      [TaskFlowStatus.REJECTED]: '审核拒绝',
      [TaskFlowStatus.AUTO_APPROVED]: '自动通过',
      [TaskFlowStatus.AUTO_REJECTED]: '自动拒绝',
      [TaskFlowStatus.CANCELLED]: '已取消',
      [TaskFlowStatus.ERROR]: '处理错误'
    }
    return descriptions[status] || status
  }

  /**
   * 计算处理效率
   */
  static calculateEfficiency(
    processedCount: number,
    totalTime: number
  ): number {
    if (totalTime === 0) return 0
    return Math.round((processedCount / (totalTime / 3600000)) * 100) / 100 // 每小时处理数量
  }
}

// 导出单例实例
export const auditFlowIntegration = AuditFlowIntegration.getInstance()
export { AuditFlowUtils }