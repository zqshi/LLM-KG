// 浏览器环境中使用Web Worker而不是worker_threads
// import { Worker } from 'worker_threads' // Node.js only
import { EventEmitter } from '@/utils/EventEmitter'
import { request } from './request'
import type { BizType } from '@/types'
// Removed dependency on auditDataFlow

// Define DataFlowEvent locally instead of importing
export interface DataFlowEvent {
  type: string
  taskId: string
  bizType: BizType
  data: any
  timestamp: number
}

/**
 * 异步处理任务配置
 */
export interface AsyncTaskConfig {
  taskId: string
  bizType: BizType
  priority: number
  maxRetries: number
  retryDelay: number
  timeout: number
  data: any
}

/**
 * 消息队列接口
 */
export interface MessageQueue {
  name: string
  push(message: any): Promise<void>
  pop(): Promise<any>
  peek(): Promise<any>
  size(): Promise<number>
  clear(): Promise<void>
}

/**
 * 内存消息队列实现
 */
class MemoryMessageQueue implements MessageQueue {
  public name: string
  private queue: any[] = []

  constructor(name: string) {
    this.name = name
  }

  async push(message: any): Promise<void> {
    this.queue.push(message)
  }

  async pop(): Promise<any> {
    return this.queue.shift()
  }

  async peek(): Promise<any> {
    return this.queue[0]
  }

  async size(): Promise<number> {
    return this.queue.length
  }

  async clear(): Promise<void> {
    this.queue.length = 0
  }
}

/**
 * Redis消息队列实现（模拟）
 */
class RedisMessageQueue implements MessageQueue {
  public name: string
  private redisClient: any // 实际项目中会是redis客户端

  constructor(name: string, redisClient?: any) {
    this.name = name
    this.redisClient = redisClient
  }

  async push(message: any): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.lpush(this.name, JSON.stringify(message))
    } else {
      // 模拟Redis操作
      await request.post('/redis/queue/push', {
        queue: this.name,
        message: JSON.stringify(message)
      })
    }
  }

  async pop(): Promise<any> {
    if (this.redisClient) {
      const result = await this.redisClient.brpop(this.name, 0)
      return result ? JSON.parse(result[1]) : null
    } else {
      // 模拟Redis操作
      const response = await request.post('/redis/queue/pop', { queue: this.name })
      return response.data ? JSON.parse(response.data) : null
    }
  }

  async peek(): Promise<any> {
    if (this.redisClient) {
      const result = await this.redisClient.lindex(this.name, -1)
      return result ? JSON.parse(result) : null
    } else {
      const response = await request.get(`/redis/queue/peek?queue=${this.name}`)
      return response.data ? JSON.parse(response.data) : null
    }
  }

  async size(): Promise<number> {
    if (this.redisClient) {
      return await this.redisClient.llen(this.name)
    } else {
      const response = await request.get(`/redis/queue/size?queue=${this.name}`)
      return response.data || 0
    }
  }

  async clear(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.del(this.name)
    } else {
      await request.delete(`/redis/queue/${this.name}`)
    }
  }
}

/**
 * 缓存接口
 */
export interface CacheManager {
  get(key: string): Promise<any>
  set(key: string, value: any, ttl?: number): Promise<void>
  del(key: string): Promise<void>
  exists(key: string): Promise<boolean>
  clear(): Promise<void>
}

/**
 * 内存缓存实现
 */
class MemoryCacheManager implements CacheManager {
  private cache = new Map<string, { value: any; expires?: number }>()

  async get(key: string): Promise<any> {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (entry.expires && Date.now() > entry.expires) {
      this.cache.delete(key)
      return null
    }
    
    return entry.value
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const entry: { value: any; expires?: number } = { value }
    if (ttl) {
      entry.expires = Date.now() + ttl * 1000
    }
    this.cache.set(key, entry)
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async exists(key: string): Promise<boolean> {
    return this.cache.has(key)
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }
}

/**
 * Redis缓存实现（模拟）
 */
class RedisCacheManager implements CacheManager {
  private redisClient: any

  constructor(redisClient?: any) {
    this.redisClient = redisClient
  }

  async get(key: string): Promise<any> {
    if (this.redisClient) {
      const result = await this.redisClient.get(key)
      return result ? JSON.parse(result) : null
    } else {
      const response = await request.get(`/redis/cache/${key}`)
      return response.data
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (this.redisClient) {
      const serialized = JSON.stringify(value)
      if (ttl) {
        await this.redisClient.setex(key, ttl, serialized)
      } else {
        await this.redisClient.set(key, serialized)
      }
    } else {
      await request.post('/redis/cache', { key, value, ttl })
    }
  }

  async del(key: string): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.del(key)
    } else {
      await request.delete(`/redis/cache/${key}`)
    }
  }

  async exists(key: string): Promise<boolean> {
    if (this.redisClient) {
      return (await this.redisClient.exists(key)) === 1
    } else {
      const response = await request.get(`/redis/cache/exists/${key}`)
      return response.data || false
    }
  }

  async clear(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.flushdb()
    } else {
      await request.delete('/redis/cache')
    }
  }
}

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private metrics = new Map<string, Array<{ timestamp: number; value: number }>>()
  private counters = new Map<string, number>()

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    
    const metric = this.metrics.get(name)!
    metric.push({ timestamp: Date.now(), value })
    
    // 保留最近1000个数据点
    if (metric.length > 1000) {
      metric.shift()
    }
  }

  incrementCounter(name: string, amount = 1): void {
    const current = this.counters.get(name) || 0
    this.counters.set(name, current + amount)
  }

  getMetricStats(name: string): {
    count: number
    avg: number
    min: number
    max: number
    latest: number
  } {
    const metric = this.metrics.get(name) || []
    if (metric.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0, latest: 0 }
    }

    const values = metric.map(m => m.value)
    return {
      count: values.length,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      latest: values[values.length - 1]
    }
  }

  getCounter(name: string): number {
    return this.counters.get(name) || 0
  }

  getAllMetrics(): Record<string, any> {
    const result: Record<string, any> = {}
    
    for (const [name] of this.metrics) {
      result[name] = this.getMetricStats(name)
    }
    
    for (const [name, value] of this.counters) {
      result[`counter_${name}`] = value
    }
    
    return result
  }

  reset(): void {
    this.metrics.clear()
    this.counters.clear()
  }
}

/**
 * 异步任务处理器配置
 */
export interface AsyncProcessorConfig {
  concurrency: number
  queueType: 'memory' | 'redis'
  cacheType: 'memory' | 'redis'
  enableWorkerThreads: boolean
  workerScript?: string
  enableCircuitBreaker: boolean
  circuitBreakerThreshold: number
  circuitBreakerTimeout: number
  enableRateLimiting: boolean
  rateLimit: number
  rateLimitWindow: number
}

/**
 * 熔断器状态
 */
enum CircuitBreakerState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open'
}

/**
 * 熔断器
 */
class CircuitBreaker {
  private state = CircuitBreakerState.CLOSED
  private failures = 0
  private lastFailureTime = 0
  private successCount = 0

  constructor(
    private threshold: number,
    private timeout: number
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = CircuitBreakerState.HALF_OPEN
        this.successCount = 0
      } else {
        throw new Error('Circuit breaker is open')
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.failures = 0
    
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.successCount++
      if (this.successCount >= 3) {
        this.state = CircuitBreakerState.CLOSED
      }
    }
  }

  private onFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()
    
    if (this.failures >= this.threshold) {
      this.state = CircuitBreakerState.OPEN
    }
  }

  getState(): CircuitBreakerState {
    return this.state
  }
}

/**
 * 速率限制器
 */
class RateLimiter {
  private requests: number[] = []

  constructor(
    private limit: number,
    private window: number // milliseconds
  ) {}

  async checkLimit(): Promise<boolean> {
    const now = Date.now()
    
    // 清理过期的请求记录
    this.requests = this.requests.filter(time => now - time < this.window)
    
    if (this.requests.length >= this.limit) {
      return false
    }
    
    this.requests.push(now)
    return true
  }

  getCurrentCount(): number {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.window)
    return this.requests.length
  }
}

/**
 * 异步任务处理器
 * 提供高性能的异步处理机制和性能优化
 */
export class AuditAsyncProcessor extends EventEmitter {
  private config: AsyncProcessorConfig
  private taskQueue!: MessageQueue
  private cache!: CacheManager
  private monitor = new PerformanceMonitor()
  private circuitBreaker!: CircuitBreaker
  private rateLimiter!: RateLimiter
  private workers: any[] = [] // 浏览器中使用Web Worker
  private isProcessing = false

  constructor(config?: Partial<AsyncProcessorConfig>) {
    super()
    
    this.config = {
      concurrency: 10,
      queueType: 'memory',
      cacheType: 'memory',
      enableWorkerThreads: false,
      enableCircuitBreaker: true,
      circuitBreakerThreshold: 5,
      circuitBreakerTimeout: 30000,
      enableRateLimiting: true,
      rateLimit: 100,
      rateLimitWindow: 60000,
      ...config
    }

    this.initializeQueue()
    this.initializeCache()
    this.initializeCircuitBreaker()
    this.initializeRateLimiter()
    
    if (this.config.enableWorkerThreads) {
      this.initializeWorkers()
    }

    this.startProcessing()
  }

  /**
   * 添加异步任务到队列
   */
  async addTask(task: AsyncTaskConfig): Promise<void> {
    const startTime = Date.now()
    
    try {
      // 检查速率限制
      if (this.config.enableRateLimiting) {
        if (!(await this.rateLimiter.checkLimit())) {
          throw new Error('Rate limit exceeded')
        }
      }

      await this.taskQueue.push(task)
      this.monitor.incrementCounter('tasks_added')
      this.monitor.recordMetric('task_add_time', Date.now() - startTime)
      
      this.emit('task_added', task)
    } catch (error) {
      this.monitor.incrementCounter('task_add_errors')
      throw error
    }
  }

  /**
   * 批量添加任务
   */
  async addTasks(tasks: AsyncTaskConfig[]): Promise<void> {
    const startTime = Date.now()
    
    try {
      await Promise.all(tasks.map(task => this.addTask(task)))
      this.monitor.recordMetric('batch_add_time', Date.now() - startTime)
    } catch (error) {
      this.monitor.incrementCounter('batch_add_errors')
      throw error
    }
  }

  /**
   * 获取队列状态
   */
  async getQueueStatus(): Promise<{
    size: number
    processing: boolean
    workers: number
    performance: any
  }> {
    return {
      size: await this.taskQueue.size(),
      processing: this.isProcessing,
      workers: this.workers.length,
      performance: this.monitor.getAllMetrics()
    }
  }

  /**
   * 清空队列
   */
  async clearQueue(): Promise<void> {
    await this.taskQueue.clear()
    this.monitor.incrementCounter('queue_cleared')
  }

  /**
   * 缓存操作
   */
  async getCached(key: string): Promise<any> {
    const startTime = Date.now()
    try {
      const result = await this.cache.get(key)
      this.monitor.recordMetric('cache_get_time', Date.now() - startTime)
      this.monitor.incrementCounter(result ? 'cache_hits' : 'cache_misses')
      return result
    } catch (error) {
      this.monitor.incrementCounter('cache_errors')
      throw error
    }
  }

  async setCached(key: string, value: any, ttl?: number): Promise<void> {
    const startTime = Date.now()
    try {
      await this.cache.set(key, value, ttl)
      this.monitor.recordMetric('cache_set_time', Date.now() - startTime)
      this.monitor.incrementCounter('cache_sets')
    } catch (error) {
      this.monitor.incrementCounter('cache_errors')
      throw error
    }
  }

  /**
   * 执行缓存或处理任务
   */
  async processWithCache<T>(
    key: string,
    processor: () => Promise<T>,
    ttl = 300
  ): Promise<T> {
    // 尝试从缓存获取
    const cached = await this.getCached(key)
    if (cached) {
      return cached
    }

    // 执行处理器
    const result = await processor()
    
    // 缓存结果
    await this.setCached(key, result, ttl)
    
    return result
  }

  // 私有方法

  private initializeQueue(): void {
    if (this.config.queueType === 'redis') {
      this.taskQueue = new RedisMessageQueue('audit_tasks')
    } else {
      this.taskQueue = new MemoryMessageQueue('audit_tasks')
    }
  }

  private initializeCache(): void {
    if (this.config.cacheType === 'redis') {
      this.cache = new RedisCacheManager()
    } else {
      this.cache = new MemoryCacheManager()
    }
  }

  private initializeCircuitBreaker(): void {
    if (this.config.enableCircuitBreaker) {
      this.circuitBreaker = new CircuitBreaker(
        this.config.circuitBreakerThreshold,
        this.config.circuitBreakerTimeout
      )
    }
  }

  private initializeRateLimiter(): void {
    if (this.config.enableRateLimiting) {
      this.rateLimiter = new RateLimiter(
        this.config.rateLimit,
        this.config.rateLimitWindow
      )
    }
  }

  private initializeWorkers(): void {
    // 在浏览器环境中禁用Worker，因为它们需要特殊的配置
    console.warn('Worker threads disabled in browser environment')
    this.config.enableWorkerThreads = false
    
    // 如果需要Web Worker，可以在这里实现
    // for (let i = 0; i < this.config.concurrency; i++) {
    //   const worker = new Worker(this.config.workerScript)
    //   worker.addEventListener('message', (event) => {
    //     this.emit('task_completed', event.data)
    //   })
    //   worker.addEventListener('error', (error) => {
    //     this.emit('task_error', error)
    //     this.monitor.incrementCounter('worker_errors')
    //   })
    //   this.workers.push(worker)
    // }
  }

  private async startProcessing(): Promise<void> {
    this.isProcessing = true

    const processLoop = async () => {
      while (this.isProcessing) {
        try {
          const queueSize = await this.taskQueue.size()
          if (queueSize === 0) {
            await new Promise(resolve => setTimeout(resolve, 1000))
            continue
          }

          // 并发处理任务
          const promises: Promise<void>[] = []
          const processingCount = Math.min(this.config.concurrency, queueSize)
          
          for (let i = 0; i < processingCount; i++) {
            promises.push(this.processNextTask())
          }

          await Promise.allSettled(promises)
        } catch (error) {
          console.error('Processing loop error:', error)
          this.monitor.incrementCounter('processing_errors')
        }
      }
    }

    processLoop()
  }

  private async processNextTask(): Promise<void> {
    const task = await this.taskQueue.pop()
    if (!task) return

    const startTime = Date.now()
    this.monitor.incrementCounter('tasks_started')

    try {
      if (this.config.enableCircuitBreaker) {
        await this.circuitBreaker.execute(() => this.executeTask(task))
      } else {
        await this.executeTask(task)
      }

      this.monitor.incrementCounter('tasks_completed')
      this.monitor.recordMetric('task_processing_time', Date.now() - startTime)
      this.emit('task_completed', task)
    } catch (error) {
      this.monitor.incrementCounter('tasks_failed')
      this.emit('task_failed', { task, error })
      
      // 重试逻辑
      if (task.maxRetries > 0) {
        task.maxRetries--
        setTimeout(() => {
          this.taskQueue.push(task)
        }, task.retryDelay)
      }
    }
  }

  private async executeTask(task: AsyncTaskConfig): Promise<void> {
    // 任务执行逻辑
    if (this.workers.length > 0) {
      // 浏览器环境中直接执行任务，不使用Worker
      return this.processTaskDirectly(task)
    } else {
      // 直接执行
      return this.processTaskDirectly(task)
    }
  }

  private async processTaskDirectly(task: AsyncTaskConfig): Promise<void> {
    // 根据任务类型执行不同的处理逻辑
    switch (task.bizType) {
      case 'forum_post':
        await this.processContentTask(task)
        break
      case 'flea_goods':
        await this.processFleaMarketTask(task)
        break
      case 'banner':
        await this.processBannerTask(task)
        break
      case 'news':
        await this.processNewsTask(task)
        break
      case 'quotation':
        await this.processQuotationTask(task)
        break
      default:
        throw new Error(`Unknown task type: ${task.bizType}`)
    }
  }

  private async processContentTask(task: AsyncTaskConfig): Promise<void> {
    // 内容审核任务处理
    await request.post('/audit/content/process', {
      taskId: task.taskId,
      data: task.data
    })
  }

  private async processFleaMarketTask(task: AsyncTaskConfig): Promise<void> {
    // 二手市场任务处理
    await request.post('/audit/flea-market/process', {
      taskId: task.taskId,
      data: task.data
    })
  }

  private async processBannerTask(task: AsyncTaskConfig): Promise<void> {
    // Banner任务处理
    await request.post('/audit/banner/process', {
      taskId: task.taskId,
      data: task.data
    })
  }

  private async processNewsTask(task: AsyncTaskConfig): Promise<void> {
    // 新闻任务处理
    await request.post('/audit/news/process', {
      taskId: task.taskId,
      data: task.data
    })
  }

  private async processQuotationTask(task: AsyncTaskConfig): Promise<void> {
    // 名言任务处理
    await request.post('/audit/quotation/process', {
      taskId: task.taskId,
      data: task.data
    })
  }
}

// 导出单例实例
export const auditAsyncProcessor = new AuditAsyncProcessor()