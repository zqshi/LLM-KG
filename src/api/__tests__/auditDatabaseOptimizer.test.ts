import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AuditDatabaseOptimizer } from '../auditDatabaseOptimizer'
import type { QueryStats, IndexInfo, OptimizationSuggestion } from '../auditDatabaseOptimizer'

// Mock request module
vi.mock('../request', () => ({
  request: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

const { request } = await import('../request')

describe('AuditDatabaseOptimizer', () => {
  let optimizer: AuditDatabaseOptimizer

  beforeEach(() => {
    optimizer = new AuditDatabaseOptimizer({
      slowQueryThreshold: 1000,
      connectionPoolConfig: {
        minConnections: 2,
        maxConnections: 10
      }
    })
    vi.clearAllMocks()
  })

  describe('Query Statistics', () => {
    it('should record query statistics correctly', () => {
      const query = 'SELECT * FROM audit_tasks WHERE status = ?'
      const executionTime = 1500
      const affectedRows = 10

      optimizer.recordQueryStats(query, executionTime, affectedRows)

      const slowQueries = optimizer.getSlowQueries()
      expect(slowQueries).toHaveLength(1)
      expect(slowQueries[0].query).toContain('SELECT * FROM audit_tasks')
      expect(slowQueries[0].averageTime).toBe(1500)
      expect(slowQueries[0].affectedRows).toBe(10)
    })

    it('should aggregate multiple executions of same query', () => {
      const query = 'SELECT * FROM audit_tasks WHERE status = ?'

      optimizer.recordQueryStats(query, 1000)
      optimizer.recordQueryStats(query, 2000)
      optimizer.recordQueryStats(query, 1500)

      const slowQueries = optimizer.getSlowQueries()
      expect(slowQueries).toHaveLength(1)
      
      const stats = slowQueries[0]
      expect(stats.frequency).toBe(3)
      expect(stats.averageTime).toBe(1500)
      expect(stats.slowestTime).toBe(2000)
      expect(stats.fastestTime).toBe(1000)
    })

    it('should filter slow queries by threshold', () => {
      optimizer.recordQueryStats('FAST SELECT', 500)
      optimizer.recordQueryStats('SLOW SELECT', 1500)
      optimizer.recordQueryStats('NORMAL SELECT', 900)

      const slowQueries = optimizer.getSlowQueries(1000)
      expect(slowQueries).toHaveLength(1)
      expect(slowQueries[0].query).toContain('SLOW SELECT')
    })

    it('should generate query statistics summary', () => {
      optimizer.recordQueryStats('Query 1', 1200, 5)
      optimizer.recordQueryStats('Query 2', 800, 10)
      optimizer.recordQueryStats('Query 1', 1000, 3)

      const summary = optimizer.getQueryStatsSummary()
      
      expect(summary.totalQueries).toBe(3)
      expect(summary.uniqueQueries).toBe(2)
      expect(summary.slowQueries).toBe(1)
      expect(summary.averageExecutionTime).toBeCloseTo(1000)
      expect(summary.topSlowQueries).toHaveLength(1)
      expect(summary.mostFrequentQueries).toHaveLength(2)
    })
  })

  describe('Query Analysis', () => {
    it('should analyze query and return plan with suggestions', async () => {
      const mockPlan = {
        planningTime: 10,
        executionTime: 1200,
        totalCost: 500,
        operations: [
          {
            operation: 'Seq Scan',
            cost: 400,
            rows: 1000,
            width: 100
          }
        ],
        suggestions: ['Consider adding index']
      }

      vi.mocked(request.post).mockResolvedValue({ data: mockPlan })

      const query = 'SELECT * FROM audit_tasks WHERE created_at > ?'
      const result = await optimizer.analyzeQuery(query)

      expect(result.plan).toEqual(mockPlan)
      expect(result.suggestions).toBeInstanceOf(Array)
      expect(result.suggestions.some(s => s.type === 'index')).toBe(true)
    })

    it('should handle query analysis errors gracefully', async () => {
      vi.mocked(request.post).mockRejectedValue(new Error('Database error'))

      const query = 'INVALID QUERY'
      const result = await optimizer.analyzeQuery(query)

      expect(result.plan.executionTime).toBe(0)
      expect(result.suggestions).toEqual([])
    })
  })

  describe('Index Management', () => {
    it('should retrieve index information', async () => {
      const mockIndexes: IndexInfo[] = [
        {
          tableName: 'audit_tasks',
          indexName: 'idx_audit_tasks_status',
          columns: ['status'],
          isUnique: false,
          type: 'btree',
          size: 1024,
          usage: 95
        }
      ]

      vi.mocked(request.get).mockResolvedValue({ data: mockIndexes })

      const indexes = await optimizer.getIndexInfo('audit_tasks')
      
      expect(indexes).toHaveLength(1)
      expect(indexes[0].tableName).toBe('audit_tasks')
      expect(indexes[0].columns).toContain('status')
    })

    it('should create index successfully', async () => {
      vi.mocked(request.post).mockResolvedValue({ data: { success: true } })

      const result = await optimizer.createIndex('audit_tasks', ['created_at'], {
        unique: false,
        type: 'btree',
        name: 'idx_audit_tasks_created_at'
      })

      expect(result).toBe(true)
      expect(request.post).toHaveBeenCalledWith('/admin/database/execute-sql', {
        sql: 'CREATE INDEX idx_audit_tasks_created_at ON audit_tasks (created_at)'
      })
    })

    it('should drop index successfully', async () => {
      vi.mocked(request.post).mockResolvedValue({ data: { success: true } })

      const result = await optimizer.dropIndex('idx_unused_index')
      
      expect(result).toBe(true)
      expect(request.post).toHaveBeenCalledWith('/admin/database/execute-sql', {
        sql: 'DROP INDEX idx_unused_index'
      })
    })

    it('should handle index creation failures', async () => {
      vi.mocked(request.post).mockRejectedValue(new Error('Index creation failed'))

      const result = await optimizer.createIndex('audit_tasks', ['nonexistent_column'])
      
      expect(result).toBe(false)
    })
  })

  describe('Table Index Analysis', () => {
    it('should analyze table indexes and provide suggestions', async () => {
      // Setup slow queries that could benefit from indexes
      optimizer.recordQueryStats('SELECT * FROM audit_tasks WHERE user_id = ? AND status = ?', 1500)
      optimizer.recordQueryStats('SELECT * FROM audit_tasks ORDER BY created_at DESC', 1200)

      // Mock current indexes response
      const mockIndexes: IndexInfo[] = [
        {
          tableName: 'audit_tasks',
          indexName: 'PRIMARY',
          columns: ['id'],
          isUnique: true,
          type: 'btree',
          size: 2048,
          usage: 100
        }
      ]

      vi.mocked(request.get).mockResolvedValue({ data: mockIndexes })

      const suggestions = await optimizer.analyzeTableIndexes('audit_tasks')
      
      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions.some(s => s.type === 'index')).toBe(true)
      expect(suggestions.some(s => s.sqlCommand?.includes('CREATE INDEX'))).toBe(true)
    })

    it('should suggest removing unused indexes', async () => {
      const mockIndexes: IndexInfo[] = [
        {
          tableName: 'audit_tasks',
          indexName: 'idx_unused',
          columns: ['obsolete_column'],
          isUnique: false,
          type: 'btree',
          size: 1024,
          usage: 5 // Low usage
        }
      ]

      vi.mocked(request.get).mockResolvedValue({ data: mockIndexes })

      const suggestions = await optimizer.analyzeTableIndexes('audit_tasks')
      
      const dropSuggestions = suggestions.filter(s => s.sqlCommand?.includes('DROP INDEX'))
      expect(dropSuggestions.length).toBeGreaterThan(0)
    })
  })

  describe('Database Metrics', () => {
    it('should retrieve database performance metrics', async () => {
      const mockMetrics = {
        connectionPoolSize: 20,
        activeConnections: 10,
        queuedQueries: 2,
        averageQueryTime: 150,
        slowQueries: 3,
        cacheHitRatio: 0.95,
        indexEfficiency: 0.88,
        tableScansRatio: 0.12
      }

      vi.mocked(request.get).mockResolvedValue({ data: mockMetrics })

      const metrics = await optimizer.getDatabaseMetrics()
      
      expect(metrics).toEqual(mockMetrics)
      expect(metrics.cacheHitRatio).toBeGreaterThan(0.9)
      expect(metrics.indexEfficiency).toBeGreaterThan(0.8)
    })

    it('should handle metrics retrieval errors', async () => {
      vi.mocked(request.get).mockRejectedValue(new Error('Metrics unavailable'))

      const metrics = await optimizer.getDatabaseMetrics()
      
      expect(metrics.connectionPoolSize).toBe(0)
      expect(metrics.averageQueryTime).toBe(0)
    })
  })

  describe('Connection Pool Optimization', () => {
    it('should optimize connection pool based on metrics', async () => {
      const mockMetrics = {
        connectionPoolSize: 10,
        activeConnections: 2,
        queuedQueries: 5,
        averageQueryTime: 200,
        slowQueries: 1,
        cacheHitRatio: 0.95,
        indexEfficiency: 0.85,
        tableScansRatio: 0.15
      }

      vi.mocked(request.get).mockResolvedValue({ data: mockMetrics })

      const optimizedConfig = await optimizer.optimizeConnectionPool()
      
      expect(optimizedConfig.maxConnections).toBeGreaterThan(10)
      expect(optimizedConfig.minConnections).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Comprehensive Optimization Report', () => {
    it('should generate complete optimization report', async () => {
      // Setup test data
      optimizer.recordQueryStats('SELECT * FROM audit_tasks WHERE status = ?', 1500)
      optimizer.recordQueryStats('SELECT COUNT(*) FROM audit_logs', 800)

      const mockMetrics = {
        connectionPoolSize: 15,
        activeConnections: 8,
        queuedQueries: 1,
        averageQueryTime: 300,
        slowQueries: 1,
        cacheHitRatio: 0.92,
        indexEfficiency: 0.87,
        tableScansRatio: 0.13
      }

      const mockIndexes: IndexInfo[] = []

      vi.mocked(request.get).mockResolvedValue({ data: mockMetrics })
      vi.mocked(request.get).mockResolvedValueOnce({ data: mockIndexes })

      const report = await optimizer.generateOptimizationReport()
      
      expect(report).toHaveProperty('summary')
      expect(report).toHaveProperty('slowQueries')
      expect(report).toHaveProperty('indexRecommendations')
      expect(report).toHaveProperty('databaseMetrics')
      expect(report).toHaveProperty('connectionPoolOptimization')
      
      expect(report.summary.totalQueries).toBeGreaterThan(0)
      expect(report.summary.slowQueries).toBeGreaterThanOrEqual(0)
      expect(Array.isArray(report.indexRecommendations)).toBe(true)
    })
  })

  describe('Query Normalization', () => {
    it('should normalize similar queries', () => {
      optimizer.recordQueryStats('SELECT * FROM users WHERE id = 123', 500)
      optimizer.recordQueryStats('SELECT * FROM users WHERE id = 456', 600)
      optimizer.recordQueryStats("SELECT * FROM users WHERE id = '789'", 550)

      const summary = optimizer.getQueryStatsSummary()
      
      // All queries should be normalized to the same pattern
      expect(summary.uniqueQueries).toBe(1)
      expect(summary.totalQueries).toBe(3)
    })
  })

  describe('Performance Edge Cases', () => {
    it('should handle empty query statistics', () => {
      const summary = optimizer.getQueryStatsSummary()
      
      expect(summary.totalQueries).toBe(0)
      expect(summary.averageExecutionTime).toBe(0)
      expect(summary.topSlowQueries).toEqual([])
    })

    it('should handle very fast queries', () => {
      optimizer.recordQueryStats('SELECT 1', 0.1)
      
      const slowQueries = optimizer.getSlowQueries(1000)
      expect(slowQueries).toHaveLength(0)
    })

    it('should handle queries with special characters', () => {
      const specialQuery = "SELECT * FROM table WHERE column LIKE '%test%' AND other = 'value with \"quotes\"'"
      
      optimizer.recordQueryStats(specialQuery, 800)
      
      const summary = optimizer.getQueryStatsSummary()
      expect(summary.uniqueQueries).toBe(1)
    })
  })
})