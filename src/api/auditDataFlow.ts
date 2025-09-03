import { EventEmitter } from '@/utils/EventEmitter'
import { request } from './request'
import type { BizType } from '@/types'

/**
 * 审核数据流事件类型
 */
export enum AuditDataFlowEvent {
  TASK_SUBMITTED = 'task_submitted',
  TASK_ASSIGNED = 'task_assigned',
  TASK_STARTED = 'task_started',
  TASK_COMPLETED = 'task_completed',
  TASK_FAILED = 'task_failed',
  CALLBACK_SUCCESS = 'callback_success',
  CALLBACK_FAILED = 'callback_failed',
  STATUS_CHANGED = 'status_changed',
  ERROR_OCCURRED = 'error_occurred'
}

/**
 * 数据流事件接口
 */
export interface DataFlowEvent {
  type: AuditDataFlowEvent
  taskId: string
  bizType: BizType
  timestamp: number
  data: any
  metadata?: Record<string, any>
}

/**
 * 数据流处理器配置
 */
export interface DataFlowProcessorConfig {
  enableEventStream: boolean
  enableDataPersistence: boolean
  enableRealtimeSync: boolean
  batchSize: number
  batchTimeout: number
  retryMaxAttempts: number
  retryDelay: number
}

/**
 * 数据处理管道接口
 */
export interface DataPipeline {
  name: string
  process(event: DataFlowEvent): Promise<DataFlowEvent>
  filter?(event: DataFlowEvent): boolean
  priority: number
}

/**
 * 审核数据流处理器
 * 负责处理审核任务相关的数据流和事件处理
 */
export class AuditDataFlowProcessor extends EventEmitter {
  private config: DataFlowProcessorConfig
  private pipelines: Map<string, DataPipeline> = new Map()
  private eventQueue: DataFlowEvent[] = []
  private processing = false
  private batchTimer: NodeJS.Timeout | null = null

  constructor(config?: Partial<DataFlowProcessorConfig>) {
    super()
    this.config = {
      enableEventStream: true,
      enableDataPersistence: true,
      enableRealtimeSync: true,
      batchSize: 50,
      batchTimeout: 5000,
      retryMaxAttempts: 3,
      retryDelay: 1000,
      ...config
    }

    this.setupDefaultPipelines()
    this.startEventProcessing()
  }

  /**
   * 添加数据处理管道
   */
  addPipeline(pipeline: DataPipeline): void {
    this.pipelines.set(pipeline.name, pipeline)
    
    // 按优先级排序
    const sortedPipelines = Array.from(this.pipelines.values())
      .sort((a, b) => b.priority - a.priority)
    
    this.pipelines.clear()
    sortedPipelines.forEach(p => this.pipelines.set(p.name, p))
  }

  /**
   * 移除数据处理管道
   */
  removePipeline(name: string): void {
    this.pipelines.delete(name)
  }

  /**
   * 发送事件到数据流
   */
  async emitEvent(event: Omit<DataFlowEvent, 'timestamp'>): Promise<void> {
    const fullEvent: DataFlowEvent = {
      ...event,
      timestamp: Date.now()
    }

    if (this.config.enableEventStream) {
      this.eventQueue.push(fullEvent)
      this.scheduleProcessing()
    }

    // 发送到本地事件监听器
    this.emit(event.type, fullEvent)
  }

  /**
   * 获取事件流
   */
  getEventStream(filters?: {
    taskId?: string
    bizType?: BizType
    eventTypes?: AuditDataFlowEvent[]
    startTime?: number
    endTime?: number
  }): AsyncIterableIterator<DataFlowEvent> {
    return this.createEventStream(filters)
  }

  /**
   * 获取任务数据流摘要
   */
  async getTaskDataSummary(taskId: string): Promise<{
    events: DataFlowEvent[]
    timeline: Array<{
      timestamp: number
      event: AuditDataFlowEvent
      duration?: number
    }>
    metrics: {
      totalEvents: number
      avgProcessTime: number
      errorCount: number
    }
  }> {
    try {
      const response = await request.get(`/audit/data-flow/${taskId}/summary`)
      return response.data
    } catch (error) {
      console.error('获取任务数据流摘要失败:', error)
      return {
        events: [],
        timeline: [],
        metrics: { totalEvents: 0, avgProcessTime: 0, errorCount: 0 }
      }
    }
  }

  /**
   * 批量获取数据流指标
   */
  async getDataFlowMetrics(
    bizType?: BizType,
    dateRange?: [string, string]
  ): Promise<{
    throughput: number // 吞吐量
    latency: number // 延迟
    errorRate: number // 错误率
    eventCounts: Record<AuditDataFlowEvent, number>
    bizTypeDistribution: Record<BizType, number>
  }> {
    try {
      const response = await request.get('/audit/data-flow/metrics', {
        params: { bizType, startDate: dateRange?.[0], endDate: dateRange?.[1] }
      })
      return response.data
    } catch (error) {
      console.error('获取数据流指标失败:', error)
      return {
        throughput: 0,
        latency: 0,
        errorRate: 0,
        eventCounts: {} as Record<AuditDataFlowEvent, number>,
        bizTypeDistribution: {} as Record<BizType, number>
      }
    }
  }

  // 私有方法

  private setupDefaultPipelines(): void {
    // 数据验证管道
    this.addPipeline({
      name: 'data_validation',
      priority: 100,
      process: async (event: DataFlowEvent) => {
        if (!event.taskId || !event.bizType) {
          throw new Error('事件数据不完整')
        }
        return event
      }
    })

    // 数据持久化管道
    if (this.config.enableDataPersistence) {
      this.addPipeline({
        name: 'data_persistence',
        priority: 90,
        process: async (event: DataFlowEvent) => {
          await this.persistEvent(event)
          return event
        }
      })
    }

    // 实时同步管道
    if (this.config.enableRealtimeSync) {
      this.addPipeline({
        name: 'realtime_sync',
        priority: 80,
        process: async (event: DataFlowEvent) => {
          await this.syncToRealtimeSystem(event)
          return event
        }
      })
    }

    // 指标收集管道
    this.addPipeline({
      name: 'metrics_collection',
      priority: 70,
      process: async (event: DataFlowEvent) => {
        await this.collectMetrics(event)
        return event
      }
    })

    // 告警检查管道
    this.addPipeline({
      name: 'alert_check',
      priority: 60,
      process: async (event: DataFlowEvent) => {
        await this.checkAlerts(event)
        return event
      }
    })
  }

  private scheduleProcessing(): void {
    if (this.processing) return

    // 批量超时处理
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.processEventBatch()
      }, this.config.batchTimeout)
    }

    // 批量大小处理
    if (this.eventQueue.length >= this.config.batchSize) {
      if (this.batchTimer) {
        clearTimeout(this.batchTimer)
        this.batchTimer = null
      }
      this.processEventBatch()
    }
  }

  private async processEventBatch(): Promise<void> {
    if (this.processing || this.eventQueue.length === 0) return

    this.processing = true
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }

    const batch = this.eventQueue.splice(0, this.config.batchSize)
    
    try {
      await Promise.all(batch.map(event => this.processEvent(event)))
    } catch (error) {
      console.error('批量处理事件失败:', error)
    } finally {
      this.processing = false
      
      // 如果队列中还有事件，继续处理
      if (this.eventQueue.length > 0) {
        this.scheduleProcessing()
      }
    }
  }

  private async processEvent(event: DataFlowEvent): Promise<void> {
    let processedEvent = event

    // 通过所有处理管道
    for (const pipeline of this.pipelines.values()) {
      try {
        // 检查过滤条件
        if (pipeline.filter && !pipeline.filter(processedEvent)) {
          continue
        }

        // 处理事件
        processedEvent = await this.retryOperation(
          () => pipeline.process(processedEvent),
          this.config.retryMaxAttempts,
          this.config.retryDelay
        )
      } catch (error) {
        console.error(`管道 ${pipeline.name} 处理失败:`, error)
        
        // 发送错误事件
        this.emit(AuditDataFlowEvent.ERROR_OCCURRED, {
          ...event,
          error: error.message,
          pipeline: pipeline.name
        })
      }
    }
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    maxAttempts: number,
    delay: number
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        
        if (attempt === maxAttempts) {
          break
        }

        // 等待重试
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }

    throw lastError!
  }

  private async persistEvent(event: DataFlowEvent): Promise<void> {
    try {
      await request.post('/audit/data-flow/events', event)
    } catch (error) {
      console.error('持久化事件失败:', error)
      throw error
    }
  }

  private async syncToRealtimeSystem(event: DataFlowEvent): Promise<void> {
    try {
      // 同步到WebSocket或SSE服务
      await request.post('/audit/realtime/sync', event)
    } catch (error) {
      console.error('实时同步失败:', error)
      // 实时同步失败不应该影响主流程
    }
  }

  private async collectMetrics(event: DataFlowEvent): Promise<void> {
    try {
      await request.post('/audit/metrics/collect', {
        eventType: event.type,
        bizType: event.bizType,
        timestamp: event.timestamp,
        metadata: event.metadata
      })
    } catch (error) {
      console.error('收集指标失败:', error)
    }
  }

  private async checkAlerts(event: DataFlowEvent): Promise<void> {
    try {
      // 检查是否需要触发告警
      if (event.type === AuditDataFlowEvent.TASK_FAILED || 
          event.type === AuditDataFlowEvent.CALLBACK_FAILED ||
          event.type === AuditDataFlowEvent.ERROR_OCCURRED) {
        
        await request.post('/audit/alerts/check', {
          eventType: event.type,
          taskId: event.taskId,
          bizType: event.bizType,
          data: event.data
        })
      }
    } catch (error) {
      console.error('检查告警失败:', error)
    }
  }

  private startEventProcessing(): void {
    // 定期处理队列中的事件
    setInterval(() => {
      if (!this.processing && this.eventQueue.length > 0) {
        this.processEventBatch()
      }
    }, this.config.batchTimeout)
  }

  private async* createEventStream(filters?: {
    taskId?: string
    bizType?: BizType
    eventTypes?: AuditDataFlowEvent[]
    startTime?: number
    endTime?: number
  }): AsyncIterableIterator<DataFlowEvent> {
    // 这里应该实现真实的事件流逻辑
    // 可以通过WebSocket、SSE或者轮询来实现
    
    const eventBuffer: DataFlowEvent[] = []
    let isActive = true

    // 监听相关事件
    const eventHandler = (event: DataFlowEvent) => {
      if (this.matchesFilter(event, filters)) {
        eventBuffer.push(event)
      }
    }

    // 注册事件监听器
    Object.values(AuditDataFlowEvent).forEach(eventType => {
      this.on(eventType, eventHandler)
    })

    try {
      while (isActive) {
        if (eventBuffer.length > 0) {
          yield eventBuffer.shift()!
        } else {
          // 等待新事件
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
    } finally {
      // 清理事件监听器
      Object.values(AuditDataFlowEvent).forEach(eventType => {
        this.off(eventType, eventHandler)
      })
    }
  }

  private matchesFilter(
    event: DataFlowEvent, 
    filters?: {
      taskId?: string
      bizType?: BizType
      eventTypes?: AuditDataFlowEvent[]
      startTime?: number
      endTime?: number
    }
  ): boolean {
    if (!filters) return true

    if (filters.taskId && event.taskId !== filters.taskId) return false
    if (filters.bizType && event.bizType !== filters.bizType) return false
    if (filters.eventTypes && !filters.eventTypes.includes(event.type)) return false
    if (filters.startTime && event.timestamp < filters.startTime) return false
    if (filters.endTime && event.timestamp > filters.endTime) return false

    return true
  }
}

/**
 * 数据流管道工厂
 */
export class DataPipelineFactory {
  static createValidationPipeline(): DataPipeline {
    return {
      name: 'validation',
      priority: 100,
      process: async (event: DataFlowEvent) => {
        // 验证逻辑
        if (!event.taskId) throw new Error('缺少taskId')
        if (!event.bizType) throw new Error('缺少bizType')
        return event
      }
    }
  }

  static createTransformPipeline(transformer: (event: DataFlowEvent) => DataFlowEvent): DataPipeline {
    return {
      name: 'transform',
      priority: 50,
      process: async (event: DataFlowEvent) => {
        return transformer(event)
      }
    }
  }

  static createFilterPipeline(predicate: (event: DataFlowEvent) => boolean): DataPipeline {
    return {
      name: 'filter',
      priority: 60,
      filter: predicate,
      process: async (event: DataFlowEvent) => event
    }
  }
}

// 导出单例实例
export const auditDataFlowProcessor = new AuditDataFlowProcessor()
export const dataPipelineFactory = DataPipelineFactory