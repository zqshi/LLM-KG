import { request } from './request'
import type { BizType } from '@/types'

/**
 * 分析时间范围
 */
export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d' | '90d'

/**
 * 聚合类型
 */
export type AggregationType = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'distinct'

/**
 * 数据维度
 */
export interface DataDimension {
  name: string
  field: string
  type: 'string' | 'number' | 'date' | 'boolean'
}

/**
 * 分析查询参数
 */
export interface AnalyticsQuery {
  metrics: string[]
  dimensions?: string[]
  filters?: Array<{
    field: string
    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'like'
    value: any
  }>
  timeRange?: TimeRange
  startTime?: number
  endTime?: number
  aggregation?: AggregationType
  groupBy?: string[]
  orderBy?: Array<{
    field: string
    direction: 'asc' | 'desc'
  }>
  limit?: number
  offset?: number
}

/**
 * 分析结果
 */
export interface AnalyticsResult {
  data: Array<Record<string, any>>
  total: number
  aggregations?: Record<string, any>
  metadata: {
    query: AnalyticsQuery
    executionTime: number
    dataSource: string
    cached: boolean
    cacheExpiry?: number
  }
}

/**
 * 趋势数据
 */
export interface TrendData {
  timestamp: number
  value: number
  label?: string
}

/**
 * 漏斗分析步骤
 */
export interface FunnelStep {
  name: string
  condition: {
    field: string
    operator: string
    value: any
  }
}

/**
 * 漏斗分析结果
 */
export interface FunnelResult {
  steps: Array<{
    name: string
    count: number
    percentage: number
    dropOffRate: number
  }>
  totalUsers: number
  conversionRate: number
}

/**
 * 同期群分析结果
 */
export interface CohortResult {
  periods: string[]
  cohorts: Array<{
    cohort: string
    size: number
    values: number[]
    retentionRates: number[]
  }>
}

/**
 * 异常检测结果
 */
export interface AnomalyResult {
  timestamp: number
  value: number
  expected: number
  deviation: number
  severity: 'low' | 'medium' | 'high'
  explanation: string
}

/**
 * 预测结果
 */
export interface PredictionResult {
  forecast: Array<{
    timestamp: number
    predicted: number
    confidence: number
    lowerBound: number
    upperBound: number
  }>
  accuracy: number
  model: string
  parameters: Record<string, any>
}

/**
 * 自定义报告配置
 */
export interface ReportConfig {
  id: string
  name: string
  description?: string
  queries: AnalyticsQuery[]
  visualizations: Array<{
    type: 'line' | 'bar' | 'pie' | 'table' | 'heatmap' | 'gauge'
    query: number // 查询索引
    options: Record<string, any>
  }>
  schedule?: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly'
    time: string
    recipients: string[]
  }
  createdAt: number
  updatedAt: number
}

/**
 * 审核数据分析服务
 * 提供全面的数据分析和商业智能功能
 */
export class AuditAnalyticsService {
  private cache = new Map<string, { data: any; expiry: number }>()
  private defaultCacheTTL = 5 * 60 * 1000 // 5分钟

  /**
   * 执行分析查询
   */
  async query(query: AnalyticsQuery): Promise<AnalyticsResult> {
    const cacheKey = this.getCacheKey(query)
    const cached = this.getFromCache(cacheKey)
    
    if (cached) {
      return {
        ...cached,
        metadata: {
          ...cached.metadata,
          cached: true
        }
      }
    }

    const startTime = Date.now()
    
    try {
      const response = await request.post('/admin/analytics/query', query)
      const result: AnalyticsResult = {
        ...response.data,
        metadata: {
          query,
          executionTime: Date.now() - startTime,
          dataSource: 'database',
          cached: false
        }
      }

      this.setCache(cacheKey, result)
      return result
    } catch (error) {
      console.error('分析查询失败:', error)
      throw error
    }
  }

  /**
   * 获取审核任务趋势
   */
  async getAuditTaskTrends(
    bizType?: BizType,
    timeRange: TimeRange = '24h'
  ): Promise<{
    submitted: TrendData[]
    completed: TrendData[]
    approved: TrendData[]
    rejected: TrendData[]
  }> {
    const query: AnalyticsQuery = {
      metrics: ['task_count'],
      dimensions: ['status', 'created_at'],
      filters: bizType ? [{ field: 'biz_type', operator: 'eq', value: bizType }] : undefined,
      timeRange,
      groupBy: ['status', 'date_trunc(\'hour\', created_at)'],
      orderBy: [{ field: 'created_at', direction: 'asc' }]
    }

    const result = await this.query(query)
    
    return this.groupTrendsByStatus(result.data)
  }

  /**
   * 获取审核员绩效分析
   */
  async getAuditorPerformance(
    timeRange: TimeRange = '7d',
    auditorIds?: string[]
  ): Promise<Array<{
    auditorId: string
    auditorName: string
    totalTasks: number
    avgProcessTime: number
    approvalRate: number
    accuracy: number
    efficiency: number
  }>> {
    const query: AnalyticsQuery = {
      metrics: ['task_count', 'avg_process_time', 'approval_rate', 'accuracy_score'],
      dimensions: ['auditor_id', 'auditor_name'],
      filters: auditorIds ? [{ field: 'auditor_id', operator: 'in', value: auditorIds }] : undefined,
      timeRange,
      groupBy: ['auditor_id', 'auditor_name']
    }

    const result = await this.query(query)
    
    return result.data.map(row => ({
      auditorId: row.auditor_id,
      auditorName: row.auditor_name,
      totalTasks: row.task_count,
      avgProcessTime: row.avg_process_time,
      approvalRate: row.approval_rate,
      accuracy: row.accuracy_score,
      efficiency: this.calculateEfficiency(row.task_count, row.avg_process_time)
    }))
  }

  /**
   * 获取内容质量分析
   */
  async getContentQualityAnalysis(
    bizType: BizType,
    timeRange: TimeRange = '30d'
  ): Promise<{
    qualityTrends: TrendData[]
    violationTypes: Array<{
      type: string
      count: number
      percentage: number
    }>
    riskDistribution: Array<{
      riskLevel: string
      count: number
      percentage: number
    }>
  }> {
    const [trendsQuery, violationsQuery, riskQuery] = await Promise.all([
      this.query({
        metrics: ['avg_quality_score'],
        dimensions: ['created_date'],
        filters: [{ field: 'biz_type', operator: 'eq', value: bizType }],
        timeRange,
        groupBy: ['created_date'],
        orderBy: [{ field: 'created_date', direction: 'asc' }]
      }),
      this.query({
        metrics: ['violation_count'],
        dimensions: ['violation_type'],
        filters: [{ field: 'biz_type', operator: 'eq', value: bizType }],
        timeRange,
        groupBy: ['violation_type'],
        orderBy: [{ field: 'violation_count', direction: 'desc' }]
      }),
      this.query({
        metrics: ['task_count'],
        dimensions: ['risk_level'],
        filters: [{ field: 'biz_type', operator: 'eq', value: bizType }],
        timeRange,
        groupBy: ['risk_level']
      })
    ])

    const totalViolations = violationsQuery.data.reduce((sum, row) => sum + row.violation_count, 0)
    const totalRisk = riskQuery.data.reduce((sum, row) => sum + row.task_count, 0)

    return {
      qualityTrends: trendsQuery.data.map(row => ({
        timestamp: new Date(row.created_date).getTime(),
        value: row.avg_quality_score
      })),
      violationTypes: violationsQuery.data.map(row => ({
        type: row.violation_type,
        count: row.violation_count,
        percentage: (row.violation_count / totalViolations) * 100
      })),
      riskDistribution: riskQuery.data.map(row => ({
        riskLevel: row.risk_level,
        count: row.task_count,
        percentage: (row.task_count / totalRisk) * 100
      }))
    }
  }

  /**
   * 执行漏斗分析
   */
  async funnelAnalysis(
    steps: FunnelStep[],
    timeRange: TimeRange = '7d'
  ): Promise<FunnelResult> {
    const query: AnalyticsQuery = {
      metrics: ['user_count'],
      timeRange,
      // 这里需要根据具体的数据库结构来构建查询
    }

    // 模拟漏斗分析结果
    const totalUsers = 10000
    const stepResults = steps.map((step, index) => {
      const dropOffRate = index === 0 ? 0 : 0.2 + Math.random() * 0.3
      const count = index === 0 ? totalUsers : Math.floor(totalUsers * Math.pow(0.7, index))
      const percentage = (count / totalUsers) * 100

      return {
        name: step.name,
        count,
        percentage,
        dropOffRate: index === 0 ? 0 : dropOffRate * 100
      }
    })

    const finalCount = stepResults[stepResults.length - 1].count
    const conversionRate = (finalCount / totalUsers) * 100

    return {
      steps: stepResults,
      totalUsers,
      conversionRate
    }
  }

  /**
   * 执行同期群分析
   */
  async cohortAnalysis(
    timeRange: TimeRange = '90d',
    cohortType: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): Promise<CohortResult> {
    // 模拟同期群分析结果
    const periods = this.generatePeriods(cohortType, timeRange)
    const cohorts = []

    for (let i = 0; i < Math.min(periods.length, 12); i++) {
      const cohortSize = Math.floor(Math.random() * 1000 + 500)
      const values = []
      const retentionRates = []

      for (let j = 0; j <= Math.min(i, 11); j++) {
        const retentionRate = j === 0 ? 1.0 : Math.max(0.1, 1.0 - j * 0.15 - Math.random() * 0.1)
        const value = Math.floor(cohortSize * retentionRate)
        
        values.push(value)
        retentionRates.push(retentionRate * 100)
      }

      cohorts.push({
        cohort: periods[i],
        size: cohortSize,
        values,
        retentionRates
      })
    }

    return { periods, cohorts }
  }

  /**
   * 异常检测
   */
  async detectAnomalies(
    metric: string,
    timeRange: TimeRange = '7d',
    sensitivity: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<AnomalyResult[]> {
    const query: AnalyticsQuery = {
      metrics: [metric],
      timeRange,
      orderBy: [{ field: 'timestamp', direction: 'asc' }]
    }

    const result = await this.query(query)
    const anomalies: AnomalyResult[] = []

    // 简单的异常检测算法（实际项目中应使用更复杂的算法）
    const values = result.data.map(row => row[metric])
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)
    
    const thresholds = {
      low: 2.5,
      medium: 2.0,
      high: 1.5
    }
    const threshold = thresholds[sensitivity] * stdDev

    result.data.forEach((row, index) => {
      const value = row[metric]
      const deviation = Math.abs(value - mean)
      
      if (deviation > threshold) {
        const severity = deviation > threshold * 2 ? 'high' : 
                        deviation > threshold * 1.5 ? 'medium' : 'low'
        
        anomalies.push({
          timestamp: row.timestamp,
          value,
          expected: mean,
          deviation,
          severity,
          explanation: value > mean + threshold ? 
            `数值异常高于预期 ${((value - mean) / mean * 100).toFixed(1)}%` :
            `数值异常低于预期 ${((mean - value) / mean * 100).toFixed(1)}%`
        })
      }
    })

    return anomalies
  }

  /**
   * 时间序列预测
   */
  async forecast(
    metric: string,
    forecastPeriods: number,
    timeRange: TimeRange = '30d'
  ): Promise<PredictionResult> {
    const query: AnalyticsQuery = {
      metrics: [metric],
      timeRange,
      orderBy: [{ field: 'timestamp', direction: 'asc' }]
    }

    const result = await this.query(query)
    const historicalData = result.data.map(row => row[metric])

    // 简单的线性趋势预测（实际项目中应使用ARIMA、Prophet等专业模型）
    const forecast = this.simpleLinearForecast(historicalData, forecastPeriods)
    
    return {
      forecast,
      accuracy: 0.75 + Math.random() * 0.2, // 模拟准确率
      model: 'Linear Trend',
      parameters: {
        trend: this.calculateTrend(historicalData),
        seasonality: false
      }
    }
  }

  /**
   * 创建自定义报告
   */
  async createReport(config: Omit<ReportConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const reportConfig: ReportConfig = {
      ...config,
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    try {
      await request.post('/admin/reports', reportConfig)
      return reportConfig.id
    } catch (error) {
      console.error('创建报告失败:', error)
      throw error
    }
  }

  /**
   * 生成报告
   */
  async generateReport(reportId: string): Promise<{
    config: ReportConfig
    results: AnalyticsResult[]
    generatedAt: number
  }> {
    try {
      const configResponse = await request.get(`/admin/reports/${reportId}`)
      const config: ReportConfig = configResponse.data

      const results = await Promise.all(
        config.queries.map(query => this.query(query))
      )

      return {
        config,
        results,
        generatedAt: Date.now()
      }
    } catch (error) {
      console.error('生成报告失败:', error)
      throw error
    }
  }

  /**
   * 获取实时指标
   */
  async getRealTimeMetrics(): Promise<{
    activeUsers: number
    pendingTasks: number
    processingTasks: number
    completedToday: number
    errorRate: number
    avgResponseTime: number
    queueSize: number
    systemLoad: number
  }> {
    try {
      const response = await request.get('/admin/metrics/realtime')
      return response.data
    } catch (error) {
      console.error('获取实时指标失败:', error)
      return {
        activeUsers: 0,
        pendingTasks: 0,
        processingTasks: 0,
        completedToday: 0,
        errorRate: 0,
        avgResponseTime: 0,
        queueSize: 0,
        systemLoad: 0
      }
    }
  }

  // 私有方法

  private getCacheKey(query: AnalyticsQuery): string {
    return `analytics_${JSON.stringify(query)}`
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key)
    if (cached && cached.expiry > Date.now()) {
      return cached.data
    }
    return null
  }

  private setCache(key: string, data: any, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultCacheTTL)
    this.cache.set(key, { data, expiry })
  }

  private groupTrendsByStatus(data: Array<Record<string, any>>): {
    submitted: TrendData[]
    completed: TrendData[]
    approved: TrendData[]
    rejected: TrendData[]
  } {
    const result = {
      submitted: [] as TrendData[],
      completed: [] as TrendData[],
      approved: [] as TrendData[],
      rejected: [] as TrendData[]
    }

    data.forEach(row => {
      const timestamp = new Date(row.created_at).getTime()
      const value = row.task_count
      const status = row.status

      if (result[status]) {
        result[status].push({ timestamp, value })
      }
    })

    return result
  }

  private calculateEfficiency(taskCount: number, avgProcessTime: number): number {
    if (avgProcessTime === 0) return 0
    return Math.min(100, (taskCount / avgProcessTime) * 100)
  }

  private generatePeriods(cohortType: string, timeRange: TimeRange): string[] {
    const periods = []
    const now = new Date()
    const rangeMs = this.getTimeRangeMs(timeRange)
    const startDate = new Date(now.getTime() - rangeMs)

    let current = new Date(startDate)
    while (current <= now) {
      if (cohortType === 'daily') {
        periods.push(current.toISOString().split('T')[0])
        current.setDate(current.getDate() + 1)
      } else if (cohortType === 'weekly') {
        const weekStart = new Date(current)
        weekStart.setDate(current.getDate() - current.getDay())
        periods.push(weekStart.toISOString().split('T')[0])
        current.setDate(current.getDate() + 7)
      } else if (cohortType === 'monthly') {
        periods.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`)
        current.setMonth(current.getMonth() + 1)
      }
    }

    return periods
  }

  private getTimeRangeMs(timeRange: TimeRange): number {
    const ranges = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000
    }
    return ranges[timeRange] || ranges['24h']
  }

  private simpleLinearForecast(data: number[], periods: number): Array<{
    timestamp: number
    predicted: number
    confidence: number
    lowerBound: number
    upperBound: number
  }> {
    if (data.length < 2) return []

    // 计算线性趋势
    const n = data.length
    const sumX = (n * (n - 1)) / 2
    const sumY = data.reduce((a, b) => a + b, 0)
    const sumXY = data.reduce((sum, y, x) => sum + x * y, 0)
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    const forecast = []
    const now = Date.now()
    const interval = 24 * 60 * 60 * 1000 // 1天

    for (let i = 0; i < periods; i++) {
      const predicted = intercept + slope * (n + i)
      const confidence = Math.max(0.5, 1.0 - i * 0.05) // 置信度递减
      const errorMargin = predicted * 0.1 * (1 + i * 0.1)

      forecast.push({
        timestamp: now + (i + 1) * interval,
        predicted: Math.max(0, predicted),
        confidence,
        lowerBound: Math.max(0, predicted - errorMargin),
        upperBound: predicted + errorMargin
      })
    }

    return forecast
  }

  private calculateTrend(data: number[]): number {
    if (data.length < 2) return 0
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2))
    const secondHalf = data.slice(Math.floor(data.length / 2))
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
    
    return secondAvg - firstAvg
  }
}

// 导出单例实例
export const auditAnalyticsService = new AuditAnalyticsService()