import { request } from './request'

/**
 * 数据库查询统计信息
 */
export interface QueryStats {
  query: string
  executionTime: number
  frequency: number
  lastExecuted: number
  averageTime: number
  slowestTime: number
  fastestTime: number
  affectedRows?: number
}

/**
 * 索引信息
 */
export interface IndexInfo {
  tableName: string
  indexName: string
  columns: string[]
  isUnique: boolean
  type: 'btree' | 'hash' | 'gin' | 'gist'
  size: number
  usage: number
}

/**
 * 查询优化建议
 */
export interface OptimizationSuggestion {
  type: 'index' | 'query' | 'schema'
  priority: 'high' | 'medium' | 'low'
  description: string
  sqlCommand?: string
  estimatedImpact: string
  effort: 'low' | 'medium' | 'high'
}

/**
 * 数据库性能指标
 */
export interface DatabaseMetrics {
  connectionPoolSize: number
  activeConnections: number
  queuedQueries: number
  averageQueryTime: number
  slowQueries: number
  cacheHitRatio: number
  indexEfficiency: number
  tableScansRatio: number
}

/**
 * 查询计划信息
 */
export interface QueryPlan {
  planningTime: number
  executionTime: number
  totalCost: number
  operations: Array<{
    operation: string
    cost: number
    rows: number
    width: number
    actualTime?: number
    actualRows?: number
  }>
  suggestions: string[]
}

/**
 * 数据库连接池配置
 */
export interface ConnectionPoolConfig {
  minConnections: number
  maxConnections: number
  acquireTimeoutMillis: number
  idleTimeoutMillis: number
  createTimeoutMillis: number
  reapIntervalMillis: number
}

/**
 * 审核数据库优化器
 * 提供数据库查询优化、索引管理和性能监控功能
 */
export class AuditDatabaseOptimizer {
  private queryStats = new Map<string, QueryStats>()
  private slowQueryThreshold = 1000 // 1秒
  private connectionPoolConfig: ConnectionPoolConfig
  private optimizationCache = new Map<string, OptimizationSuggestion[]>()

  constructor(config?: {
    slowQueryThreshold?: number
    connectionPoolConfig?: Partial<ConnectionPoolConfig>
  }) {
    this.slowQueryThreshold = config?.slowQueryThreshold || 1000
    this.connectionPoolConfig = {
      minConnections: 2,
      maxConnections: 20,
      acquireTimeoutMillis: 30000,
      idleTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      ...config?.connectionPoolConfig
    }
  }

  /**
   * 记录查询统计信息
   */
  recordQueryStats(query: string, executionTime: number, affectedRows?: number): void {
    const queryHash = this.getQueryHash(query)
    const existing = this.queryStats.get(queryHash)
    
    if (existing) {
      existing.frequency++
      existing.lastExecuted = Date.now()
      existing.averageTime = (existing.averageTime * (existing.frequency - 1) + executionTime) / existing.frequency
      existing.slowestTime = Math.max(existing.slowestTime, executionTime)
      existing.fastestTime = Math.min(existing.fastestTime, executionTime)
      if (affectedRows !== undefined) {
        existing.affectedRows = affectedRows
      }
    } else {
      this.queryStats.set(queryHash, {
        query: this.normalizeQuery(query),
        executionTime,
        frequency: 1,
        lastExecuted: Date.now(),
        averageTime: executionTime,
        slowestTime: executionTime,
        fastestTime: executionTime,
        affectedRows
      })
    }
  }

  /**
   * 获取慢查询列表
   */
  getSlowQueries(threshold?: number): QueryStats[] {
    const limit = threshold || this.slowQueryThreshold
    return Array.from(this.queryStats.values())
      .filter(stats => stats.averageTime > limit || stats.slowestTime > limit)
      .sort((a, b) => b.averageTime - a.averageTime)
  }

  /**
   * 获取查询统计摘要
   */
  getQueryStatsSummary(): {
    totalQueries: number
    uniqueQueries: number
    slowQueries: number
    averageExecutionTime: number
    topSlowQueries: QueryStats[]
    mostFrequentQueries: QueryStats[]
  } {
    const stats = Array.from(this.queryStats.values())
    const slowQueries = this.getSlowQueries()
    
    return {
      totalQueries: stats.reduce((sum, stat) => sum + stat.frequency, 0),
      uniqueQueries: stats.length,
      slowQueries: slowQueries.length,
      averageExecutionTime: stats.reduce((sum, stat) => sum + stat.averageTime, 0) / stats.length || 0,
      topSlowQueries: slowQueries.slice(0, 10),
      mostFrequentQueries: stats
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10)
    }
  }

  /**
   * 分析查询并生成优化建议
   */
  async analyzeQuery(query: string): Promise<{
    plan: QueryPlan
    suggestions: OptimizationSuggestion[]
  }> {
    try {
      // 获取查询执行计划
      const plan = await this.getQueryPlan(query)
      
      // 生成优化建议
      const suggestions = await this.generateOptimizationSuggestions(query, plan)
      
      return { plan, suggestions }
    } catch (error) {
      console.error('Query analysis failed:', error)
      return {
        plan: {
          planningTime: 0,
          executionTime: 0,
          totalCost: 0,
          operations: [],
          suggestions: []
        },
        suggestions: []
      }
    }
  }

  /**
   * 获取数据库索引信息
   */
  async getIndexInfo(tableName?: string): Promise<IndexInfo[]> {
    try {
      const response = await request.get('/admin/database/indexes', {
        params: { tableName }
      })
      return response.data || []
    } catch (error) {
      console.error('Failed to get index info:', error)
      return []
    }
  }

  /**
   * 创建索引
   */
  async createIndex(
    tableName: string,
    columns: string[],
    options?: {
      unique?: boolean
      type?: 'btree' | 'hash' | 'gin' | 'gist'
      name?: string
      concurrent?: boolean
    }
  ): Promise<boolean> {
    try {
      const indexName = options?.name || `idx_${tableName}_${columns.join('_')}`
      const indexType = options?.type || 'btree'
      
      let sql = `CREATE ${options?.unique ? 'UNIQUE ' : ''}INDEX ${options?.concurrent ? 'CONCURRENTLY ' : ''}${indexName} ON ${tableName}`
      
      if (indexType !== 'btree') {
        sql += ` USING ${indexType}`
      }
      
      sql += ` (${columns.join(', ')})`
      
      await request.post('/admin/database/execute-sql', { sql })
      return true
    } catch (error) {
      console.error('Failed to create index:', error)
      return false
    }
  }

  /**
   * 删除索引
   */
  async dropIndex(indexName: string, concurrent = false): Promise<boolean> {
    try {
      const sql = `DROP INDEX ${concurrent ? 'CONCURRENTLY ' : ''}${indexName}`
      await request.post('/admin/database/execute-sql', { sql })
      return true
    } catch (error) {
      console.error('Failed to drop index:', error)
      return false
    }
  }

  /**
   * 分析表并生成索引建议
   */
  async analyzeTableIndexes(tableName: string): Promise<OptimizationSuggestion[]> {
    const cacheKey = `table_analysis_${tableName}`
    const cached = this.optimizationCache.get(cacheKey)
    
    if (cached) {
      return cached
    }

    try {
      // 获取表的查询统计
      const tableQueries = Array.from(this.queryStats.values())
        .filter(stat => stat.query.toLowerCase().includes(tableName.toLowerCase()))
      
      // 获取当前索引信息
      const currentIndexes = await this.getIndexInfo(tableName)
      
      // 分析慢查询
      const slowQueries = tableQueries.filter(stat => stat.averageTime > this.slowQueryThreshold)
      
      const suggestions: OptimizationSuggestion[] = []
      
      // 分析WHERE子句
      for (const queryStats of slowQueries) {
        const whereColumns = this.extractWhereColumns(queryStats.query)
        
        for (const column of whereColumns) {
          const hasIndex = currentIndexes.some(idx => 
            idx.columns.includes(column) && idx.columns.length === 1
          )
          
          if (!hasIndex) {
            suggestions.push({
              type: 'index',
              priority: queryStats.frequency > 10 ? 'high' : 'medium',
              description: `创建索引 ${tableName}.${column} 以优化 WHERE 查询`,
              sqlCommand: `CREATE INDEX idx_${tableName}_${column} ON ${tableName} (${column})`,
              estimatedImpact: `预计可提升 ${Math.round(queryStats.averageTime * 0.7)}ms 查询性能`,
              effort: 'low'
            })
          }
        }
        
        // 分析ORDER BY子句
        const orderByColumns = this.extractOrderByColumns(queryStats.query)
        if (orderByColumns.length > 0) {
          const indexColumns = whereColumns.concat(orderByColumns)
          const hasCompositeIndex = currentIndexes.some(idx => 
            idx.columns.length > 1 && 
            indexColumns.every(col => idx.columns.includes(col))
          )
          
          if (!hasCompositeIndex && indexColumns.length > 1) {
            suggestions.push({
              type: 'index',
              priority: 'medium',
              description: `创建复合索引 ${tableName}(${indexColumns.join(', ')}) 以优化排序查询`,
              sqlCommand: `CREATE INDEX idx_${tableName}_${indexColumns.join('_')} ON ${tableName} (${indexColumns.join(', ')})`,
              estimatedImpact: `预计可提升排序查询性能`,
              effort: 'low'
            })
          }
        }
      }
      
      // 检查未使用的索引
      for (const index of currentIndexes) {
        if (index.usage < 100 && !index.isUnique && index.indexName !== 'PRIMARY') {
          suggestions.push({
            type: 'index',
            priority: 'low',
            description: `考虑删除低使用率索引 ${index.indexName}`,
            sqlCommand: `DROP INDEX ${index.indexName}`,
            estimatedImpact: `减少存储空间和写入开销`,
            effort: 'low'
          })
        }
      }
      
      this.optimizationCache.set(cacheKey, suggestions)
      return suggestions
    } catch (error) {
      console.error('Table analysis failed:', error)
      return []
    }
  }

  /**
   * 获取数据库性能指标
   */
  async getDatabaseMetrics(): Promise<DatabaseMetrics> {
    try {
      const response = await request.get('/admin/database/metrics')
      return response.data
    } catch (error) {
      console.error('Failed to get database metrics:', error)
      return {
        connectionPoolSize: 0,
        activeConnections: 0,
        queuedQueries: 0,
        averageQueryTime: 0,
        slowQueries: 0,
        cacheHitRatio: 0,
        indexEfficiency: 0,
        tableScansRatio: 0
      }
    }
  }

  /**
   * 优化连接池配置
   */
  async optimizeConnectionPool(): Promise<ConnectionPoolConfig> {
    const metrics = await this.getDatabaseMetrics()
    const config = { ...this.connectionPoolConfig }
    
    // 根据当前指标调整连接池配置
    if (metrics.queuedQueries > 0) {
      // 有排队查询，增加最大连接数
      config.maxConnections = Math.min(config.maxConnections + 5, 50)
    }
    
    if (metrics.activeConnections < config.minConnections * 0.5) {
      // 活跃连接较少，减少最小连接数
      config.minConnections = Math.max(config.minConnections - 1, 1)
    }
    
    if (metrics.averageQueryTime > 5000) {
      // 查询时间较长，增加获取超时时间
      config.acquireTimeoutMillis = Math.min(config.acquireTimeoutMillis + 10000, 60000)
    }
    
    return config
  }

  /**
   * 生成完整的数据库优化报告
   */
  async generateOptimizationReport(): Promise<{
    summary: any
    slowQueries: QueryStats[]
    indexRecommendations: OptimizationSuggestion[]
    databaseMetrics: DatabaseMetrics
    connectionPoolOptimization: ConnectionPoolConfig
  }> {
    const [
      summary,
      slowQueries,
      databaseMetrics,
      connectionPoolOptimization
    ] = await Promise.all([
      this.getQueryStatsSummary(),
      Promise.resolve(this.getSlowQueries()),
      this.getDatabaseMetrics(),
      this.optimizeConnectionPool()
    ])
    
    // 获取所有表的索引建议
    const tables = ['audit_tasks', 'audit_policies', 'audit_logs', 'audit_results']
    const indexRecommendations: OptimizationSuggestion[] = []
    
    for (const tableName of tables) {
      const suggestions = await this.analyzeTableIndexes(tableName)
      indexRecommendations.push(...suggestions)
    }
    
    return {
      summary,
      slowQueries,
      indexRecommendations,
      databaseMetrics,
      connectionPoolOptimization
    }
  }

  // 私有方法

  private getQueryHash(query: string): string {
    return this.normalizeQuery(query)
  }

  private normalizeQuery(query: string): string {
    return query
      .replace(/\s+/g, ' ')
      .replace(/\d+/g, '?')
      .replace(/'[^']*'/g, '?')
      .trim()
      .toLowerCase()
  }

  private async getQueryPlan(query: string): Promise<QueryPlan> {
    try {
      const response = await request.post('/admin/database/explain', { query })
      return response.data
    } catch (error) {
      throw new Error(`Failed to get query plan: ${error}`)
    }
  }

  private async generateOptimizationSuggestions(
    query: string,
    plan: QueryPlan
  ): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = []
    
    // 分析执行计划中的问题
    for (const operation of plan.operations) {
      if (operation.operation.toLowerCase().includes('seq scan')) {
        suggestions.push({
          type: 'index',
          priority: 'high',
          description: '查询中包含全表扫描，建议创建合适的索引',
          estimatedImpact: '大幅提升查询性能',
          effort: 'low'
        })
      }
      
      if (operation.operation.toLowerCase().includes('sort')) {
        suggestions.push({
          type: 'index',
          priority: 'medium',
          description: '查询需要排序操作，建议创建包含ORDER BY字段的索引',
          estimatedImpact: '减少排序时间',
          effort: 'low'
        })
      }
      
      if (operation.cost > 1000) {
        suggestions.push({
          type: 'query',
          priority: 'high',
          description: '查询成本过高，考虑重写查询或优化表结构',
          estimatedImpact: '显著提升查询性能',
          effort: 'medium'
        })
      }
    }
    
    return suggestions
  }

  private extractWhereColumns(query: string): string[] {
    const whereMatch = query.match(/where\s+(.+?)(?:\s+order\s+by|\s+group\s+by|\s+limit|$)/i)
    if (!whereMatch) return []
    
    const whereClause = whereMatch[1]
    const columns: string[] = []
    
    // 简单的列提取逻辑（实际项目中需要更复杂的解析）
    const columnMatches = whereClause.match(/(\w+)\s*[=<>]/g)
    if (columnMatches) {
      columnMatches.forEach(match => {
        const column = match.replace(/\s*[=<>].*/, '').trim()
        if (!columns.includes(column)) {
          columns.push(column)
        }
      })
    }
    
    return columns
  }

  private extractOrderByColumns(query: string): string[] {
    const orderByMatch = query.match(/order\s+by\s+(.+?)(?:\s+limit|$)/i)
    if (!orderByMatch) return []
    
    return orderByMatch[1]
      .split(',')
      .map(col => col.trim().replace(/\s+(asc|desc)$/i, '').trim())
      .filter(col => col.length > 0)
  }
}

/**
 * 数据库连接管理器
 */
export class DatabaseConnectionManager {
  private connections = new Map<string, any>()
  private connectionCounts = new Map<string, number>()
  private maxConnections = 20

  async getConnection(database = 'default'): Promise<any> {
    const count = this.connectionCounts.get(database) || 0
    
    if (count >= this.maxConnections) {
      throw new Error('Maximum connections reached')
    }
    
    this.connectionCounts.set(database, count + 1)
    
    // 模拟数据库连接
    const connection = {
      database,
      id: Math.random().toString(36),
      createdAt: Date.now()
    }
    
    this.connections.set(connection.id, connection)
    return connection
  }

  releaseConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId)
    if (connection) {
      this.connections.delete(connectionId)
      const count = this.connectionCounts.get(connection.database) || 0
      this.connectionCounts.set(connection.database, Math.max(0, count - 1))
    }
  }

  getStats(): Record<string, any> {
    return {
      totalConnections: this.connections.size,
      connectionsByDatabase: Object.fromEntries(this.connectionCounts),
      maxConnections: this.maxConnections
    }
  }
}

// 导出单例实例
export const auditDatabaseOptimizer = new AuditDatabaseOptimizer()
export const databaseConnectionManager = new DatabaseConnectionManager()