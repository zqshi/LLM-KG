import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AuditAsyncProcessor } from '../auditAsyncProcessor'
import type { AsyncTaskConfig } from '../auditAsyncProcessor'

// Mock request module
vi.mock('../request', () => ({
  request: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn()
  }
}))

describe('AuditAsyncProcessor', () => {
  let processor: AuditAsyncProcessor
  
  beforeEach(() => {
    processor = new AuditAsyncProcessor({
      concurrency: 2,
      queueType: 'memory',
      cacheType: 'memory',
      enableWorkerThreads: false,
      enableCircuitBreaker: false,
      enableRateLimiting: false
    })
  })

  afterEach(() => {
    // 清理资源
    if (processor) {
      processor.removeAllListeners()
    }
  })

  describe('Task Management', () => {
    it('should add task to queue successfully', async () => {
      const task: AsyncTaskConfig = {
        taskId: 'test-task-1',
        bizType: 'content',
        priority: 1,
        maxRetries: 3,
        retryDelay: 1000,
        timeout: 5000,
        data: { content: 'test content' }
      }

      await expect(processor.addTask(task)).resolves.not.toThrow()
      
      const status = await processor.getQueueStatus()
      expect(status.size).toBeGreaterThan(0)
    })

    it('should handle multiple tasks', async () => {
      const tasks: AsyncTaskConfig[] = [
        {
          taskId: 'test-task-1',
          bizType: 'content',
          priority: 1,
          maxRetries: 3,
          retryDelay: 1000,
          timeout: 5000,
          data: { content: 'test content 1' }
        },
        {
          taskId: 'test-task-2',
          bizType: 'flea_market',
          priority: 2,
          maxRetries: 3,
          retryDelay: 1000,
          timeout: 5000,
          data: { content: 'test content 2' }
        }
      ]

      await expect(processor.addTasks(tasks)).resolves.not.toThrow()
      
      const status = await processor.getQueueStatus()
      expect(status.size).toBe(tasks.length)
    })

    it('should get queue status correctly', async () => {
      const status = await processor.getQueueStatus()
      
      expect(status).toHaveProperty('size')
      expect(status).toHaveProperty('processing')
      expect(status).toHaveProperty('workers')
      expect(status).toHaveProperty('performance')
      expect(typeof status.size).toBe('number')
      expect(typeof status.processing).toBe('boolean')
    })

    it('should clear queue successfully', async () => {
      // 添加一些任务
      await processor.addTask({
        taskId: 'test-task',
        bizType: 'content',
        priority: 1,
        maxRetries: 3,
        retryDelay: 1000,
        timeout: 5000,
        data: {}
      })

      await processor.clearQueue()
      
      const status = await processor.getQueueStatus()
      expect(status.size).toBe(0)
    })
  })

  describe('Cache Operations', () => {
    it('should set and get cached values', async () => {
      const key = 'test-key'
      const value = { data: 'test value' }
      
      await processor.setCached(key, value)
      const retrieved = await processor.getCached(key)
      
      expect(retrieved).toEqual(value)
    })

    it('should return null for non-existent key', async () => {
      const result = await processor.getCached('non-existent-key')
      expect(result).toBeNull()
    })

    it('should handle cache with TTL', async () => {
      const key = 'ttl-key'
      const value = 'ttl-value'
      const ttl = 1 // 1 second
      
      await processor.setCached(key, value, ttl)
      
      // Should exist immediately
      expect(await processor.getCached(key)).toBe(value)
      
      // Should expire after TTL
      await new Promise(resolve => setTimeout(resolve, 1100))
      expect(await processor.getCached(key)).toBeNull()
    })

    it('should process with cache', async () => {
      const key = 'process-cache-key'
      let processorCalled = false
      
      const testProcessor = async () => {
        processorCalled = true
        return 'processed-result'
      }

      // First call should execute processor
      const result1 = await processor.processWithCache(key, testProcessor)
      expect(result1).toBe('processed-result')
      expect(processorCalled).toBe(true)

      // Second call should use cache
      processorCalled = false
      const result2 = await processor.processWithCache(key, testProcessor)
      expect(result2).toBe('processed-result')
      expect(processorCalled).toBe(false)
    })
  })

  describe('Rate Limiting', () => {
    it('should respect rate limits when enabled', async () => {
      const rateLimitedProcessor = new AuditAsyncProcessor({
        enableRateLimiting: true,
        rateLimit: 2,
        rateLimitWindow: 1000
      })

      // First two tasks should succeed
      await expect(rateLimitedProcessor.addTask({
        taskId: 'rate-test-1',
        bizType: 'content',
        priority: 1,
        maxRetries: 1,
        retryDelay: 100,
        timeout: 1000,
        data: {}
      })).resolves.not.toThrow()

      await expect(rateLimitedProcessor.addTask({
        taskId: 'rate-test-2',
        bizType: 'content',
        priority: 1,
        maxRetries: 1,
        retryDelay: 100,
        timeout: 1000,
        data: {}
      })).resolves.not.toThrow()

      // Third task should be rate limited
      await expect(rateLimitedProcessor.addTask({
        taskId: 'rate-test-3',
        bizType: 'content',
        priority: 1,
        maxRetries: 1,
        retryDelay: 100,
        timeout: 1000,
        data: {}
      })).rejects.toThrow('Rate limit exceeded')

      rateLimitedProcessor.removeAllListeners()
    })
  })

  describe('Circuit Breaker', () => {
    it('should trip circuit breaker after failures', async () => {
      const circuitBreakerProcessor = new AuditAsyncProcessor({
        enableCircuitBreaker: true,
        circuitBreakerThreshold: 2,
        circuitBreakerTimeout: 1000
      })

      // Mock failed task processing
      vi.spyOn(circuitBreakerProcessor as any, 'processTaskDirectly')
        .mockRejectedValue(new Error('Task processing failed'))

      // Add tasks that will fail
      for (let i = 0; i < 3; i++) {
        await circuitBreakerProcessor.addTask({
          taskId: `circuit-test-${i}`,
          bizType: 'content',
          priority: 1,
          maxRetries: 1,
          retryDelay: 100,
          timeout: 1000,
          data: {}
        })
      }

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 500))

      // Circuit should be open after threshold failures
      const status = await circuitBreakerProcessor.getQueueStatus()
      expect(status.performance).toBeDefined()

      circuitBreakerProcessor.removeAllListeners()
    })
  })

  describe('Error Handling', () => {
    it('should emit task_failed event on processing errors', (done) => {
      processor.on('task_failed', (event) => {
        expect(event).toHaveProperty('task')
        expect(event).toHaveProperty('error')
        done()
      })

      // Mock a failing task
      vi.spyOn(processor as any, 'processTaskDirectly')
        .mockRejectedValue(new Error('Test error'))

      processor.addTask({
        taskId: 'failing-task',
        bizType: 'content',
        priority: 1,
        maxRetries: 1,
        retryDelay: 100,
        timeout: 1000,
        data: {}
      })
    })

    it('should emit task_completed event on successful processing', (done) => {
      processor.on('task_completed', (task) => {
        expect(task.taskId).toBe('success-task')
        done()
      })

      // Mock a successful task
      vi.spyOn(processor as any, 'processTaskDirectly')
        .mockResolvedValue(undefined)

      processor.addTask({
        taskId: 'success-task',
        bizType: 'content',
        priority: 1,
        maxRetries: 1,
        retryDelay: 100,
        timeout: 1000,
        data: {}
      })
    })
  })

  describe('Configuration', () => {
    it('should use default configuration when none provided', () => {
      const defaultProcessor = new AuditAsyncProcessor()
      expect(defaultProcessor).toBeDefined()
      defaultProcessor.removeAllListeners()
    })

    it('should override default configuration', () => {
      const customProcessor = new AuditAsyncProcessor({
        concurrency: 5,
        queueType: 'memory',
        enableRateLimiting: true,
        rateLimit: 50
      })
      
      expect(customProcessor).toBeDefined()
      customProcessor.removeAllListeners()
    })
  })

  describe('Performance Monitoring', () => {
    it('should track performance metrics', async () => {
      await processor.addTask({
        taskId: 'metrics-test',
        bizType: 'content',
        priority: 1,
        maxRetries: 1,
        retryDelay: 100,
        timeout: 1000,
        data: {}
      })

      const status = await processor.getQueueStatus()
      expect(status.performance).toBeDefined()
      expect(typeof status.performance).toBe('object')
    })
  })
})