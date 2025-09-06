import { EventEmitter } from '@/utils/EventEmitter'
import { request } from './request'

/**
 * 告警级别
 */
export enum AlertLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * 告警类型
 */
export enum AlertType {
  SYSTEM_PERFORMANCE = 'system_performance',
  DATABASE_SLOW_QUERY = 'database_slow_query',
  QUEUE_BACKLOG = 'queue_backlog',
  ERROR_RATE_HIGH = 'error_rate_high',
  AUDIT_DELAY = 'audit_delay',
  SENSITIVE_CONTENT = 'sensitive_content',
  FRAUD_DETECTION = 'fraud_detection',
  POLICY_VIOLATION = 'policy_violation'
}

/**
 * 告警规则
 */
export interface AlertRule {
  id: string
  name: string
  type: AlertType
  level: AlertLevel
  enabled: boolean
  conditions: {
    metric: string
    operator: '>' | '<' | '=' | '>=' | '<=' | '!='
    threshold: number | string
    duration?: number // 持续时间（秒）
  }[]
  actions: {
    type: 'email' | 'sms' | 'webhook' | 'slack'
    target: string
    template?: string
  }[]
  cooldown: number // 冷却时间（秒）
  description?: string
}

/**
 * 告警事件
 */
export interface AlertEvent {
  id: string
  ruleId: string
  ruleName: string
  type: AlertType
  level: AlertLevel
  title: string
  message: string
  timestamp: number
  resolved: boolean
  resolvedAt?: number
  resolvedBy?: string
  metadata: Record<string, any>
  actions: Array<{
    type: string
    target: string
    success: boolean
    timestamp: number
    error?: string
  }>
}

/**
 * 指标数据点
 */
export interface MetricDataPoint {
  metric: string
  value: number
  timestamp: number
  labels?: Record<string, string>
}

/**
 * 告警通知接口
 */
export interface AlertNotifier {
  type: string
  send(event: AlertEvent, target: string, template?: string): Promise<boolean>
}

/**
 * 邮件通知器
 */
class EmailNotifier implements AlertNotifier {
  type = 'email'

  async send(event: AlertEvent, target: string, template?: string): Promise<boolean> {
    try {
      const subject = `${event.level.toUpperCase()} - ${event.title}`
      const body = template ? 
        this.renderTemplate(template, event) : 
        this.getDefaultEmailTemplate(event)

      await request.post('/admin/notifications/email', {
        to: target,
        subject,
        body,
        html: true
      })

      return true
    } catch (error) {
      console.error('邮件发送失败:', error)
      return false
    }
  }

  private renderTemplate(template: string, event: AlertEvent): string {
    return template
      .replace(/\{\{title\}\}/g, event.title)
      .replace(/\{\{message\}\}/g, event.message)
      .replace(/\{\{level\}\}/g, event.level)
      .replace(/\{\{timestamp\}\}/g, new Date(event.timestamp).toLocaleString())
      .replace(/\{\{metadata\}\}/g, JSON.stringify(event.metadata, null, 2))
  }

  private getDefaultEmailTemplate(event: AlertEvent): string {
    return `
      <h2>审核系统告警</h2>
      <p><strong>级别：</strong>${event.level.toUpperCase()}</p>
      <p><strong>标题：</strong>${event.title}</p>
      <p><strong>详情：</strong>${event.message}</p>
      <p><strong>时间：</strong>${new Date(event.timestamp).toLocaleString()}</p>
      ${event.metadata ? `<p><strong>元数据：</strong><pre>${JSON.stringify(event.metadata, null, 2)}</pre></p>` : ''}
    `
  }
}

/**
 * Webhook通知器
 */
class WebhookNotifier implements AlertNotifier {
  type = 'webhook'

  async send(event: AlertEvent, target: string): Promise<boolean> {
    try {
      await request.post(target, {
        alert: event,
        timestamp: Date.now()
      })
      return true
    } catch (error) {
      console.error('Webhook发送失败:', error)
      return false
    }
  }
}

/**
 * Slack通知器
 */
class SlackNotifier implements AlertNotifier {
  type = 'slack'

  async send(event: AlertEvent, target: string): Promise<boolean> {
    try {
      const color = this.getLevelColor(event.level)
      const payload = {
        channel: target,
        attachments: [{
          color,
          title: event.title,
          text: event.message,
          fields: [
            {
              title: '级别',
              value: event.level.toUpperCase(),
              short: true
            },
            {
              title: '时间',
              value: new Date(event.timestamp).toLocaleString(),
              short: true
            }
          ],
          timestamp: Math.floor(event.timestamp / 1000)
        }]
      }

      await request.post('/admin/notifications/slack', payload)
      return true
    } catch (error) {
      console.error('Slack发送失败:', error)
      return false
    }
  }

  private getLevelColor(level: AlertLevel): string {
    const colors = {
      [AlertLevel.INFO]: '#36a64f',
      [AlertLevel.WARNING]: '#ffcc00',
      [AlertLevel.ERROR]: '#ff6600',
      [AlertLevel.CRITICAL]: '#ff0000'
    }
    return colors[level] || '#cccccc'
  }
}

/**
 * 告警系统
 * 负责监控各种指标并根据规则触发告警
 */
export class AuditAlertSystem extends EventEmitter {
  private rules = new Map<string, AlertRule>()
  private activeAlerts = new Map<string, AlertEvent>()
  private notifiers = new Map<string, AlertNotifier>()
  private metricHistory = new Map<string, MetricDataPoint[]>()
  private evaluationInterval = 30000 // 30秒
  private maxHistoryPoints = 1440 // 24小时，每分钟一个点
  private evaluationTimer: NodeJS.Timeout | null = null

  constructor() {
    super()
    this.initializeNotifiers()
    this.startEvaluation()
  }

  /**
   * 添加告警规则
   */
  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule)
    this.emit('rule_added', rule)
  }

  /**
   * 更新告警规则
   */
  updateRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const rule = this.rules.get(ruleId)
    if (!rule) return false

    const updatedRule = { ...rule, ...updates }
    this.rules.set(ruleId, updatedRule)
    this.emit('rule_updated', updatedRule)
    return true
  }

  /**
   * 删除告警规则
   */
  removeRule(ruleId: string): boolean {
    const success = this.rules.delete(ruleId)
    if (success) {
      this.emit('rule_removed', ruleId)
    }
    return success
  }

  /**
   * 获取所有规则
   */
  getRules(): AlertRule[] {
    return Array.from(this.rules.values())
  }

  /**
   * 记录指标数据
   */
  recordMetric(metric: string, value: number, labels?: Record<string, string>): void {
    const dataPoint: MetricDataPoint = {
      metric,
      value,
      timestamp: Date.now(),
      labels
    }

    if (!this.metricHistory.has(metric)) {
      this.metricHistory.set(metric, [])
    }

    const history = this.metricHistory.get(metric)!
    history.push(dataPoint)

    // 保持历史数据在限制范围内
    if (history.length > this.maxHistoryPoints) {
      history.shift()
    }

    this.emit('metric_recorded', dataPoint)
  }

  /**
   * 批量记录指标
   */
  recordMetrics(metrics: Omit<MetricDataPoint, 'timestamp'>[]): void {
    metrics.forEach(m => {
      this.recordMetric(m.metric, m.value, m.labels)
    })
  }

  /**
   * 获取指标历史数据
   */
  getMetricHistory(metric: string, duration?: number): MetricDataPoint[] {
    const history = this.metricHistory.get(metric) || []
    
    if (!duration) {
      return [...history]
    }

    const cutoff = Date.now() - duration
    return history.filter(point => point.timestamp >= cutoff)
  }

  /**
   * 获取活跃告警
   */
  getActiveAlerts(): AlertEvent[] {
    return Array.from(this.activeAlerts.values())
  }

  /**
   * 获取告警历史
   */
  async getAlertHistory(
    filters?: {
      level?: AlertLevel
      type?: AlertType
      resolved?: boolean
      startTime?: number
      endTime?: number
      limit?: number
    }
  ): Promise<AlertEvent[]> {
    try {
      const response = await request.get('/admin/alerts/history', {
        params: filters
      })
      return response.data || []
    } catch (error) {
      console.error('获取告警历史失败:', error)
      return []
    }
  }

  /**
   * 手动解决告警
   */
  async resolveAlert(alertId: string, resolvedBy: string, comment?: string): Promise<boolean> {
    const alert = this.activeAlerts.get(alertId)
    if (!alert) return false

    try {
      alert.resolved = true
      alert.resolvedAt = Date.now()
      alert.resolvedBy = resolvedBy

      // 持久化解决状态
      await request.put(`/admin/alerts/${alertId}/resolve`, {
        resolvedBy,
        comment,
        timestamp: alert.resolvedAt
      })

      this.activeAlerts.delete(alertId)
      this.emit('alert_resolved', alert)
      return true
    } catch (error) {
      console.error('解决告警失败:', error)
      return false
    }
  }

  /**
   * 获取告警统计信息
   */
  getAlertStats(): {
    total: number
    byLevel: Record<AlertLevel, number>
    byType: Record<AlertType, number>
    resolved: number
    avgResolutionTime: number
  } {
    const alerts = this.getActiveAlerts()
    const stats = {
      total: alerts.length,
      byLevel: {
        [AlertLevel.INFO]: 0,
        [AlertLevel.WARNING]: 0,
        [AlertLevel.ERROR]: 0,
        [AlertLevel.CRITICAL]: 0
      },
      byType: {
        [AlertType.SYSTEM_PERFORMANCE]: 0,
        [AlertType.DATABASE_SLOW_QUERY]: 0,
        [AlertType.QUEUE_BACKLOG]: 0,
        [AlertType.ERROR_RATE_HIGH]: 0,
        [AlertType.AUDIT_DELAY]: 0,
        [AlertType.SENSITIVE_CONTENT]: 0,
        [AlertType.FRAUD_DETECTION]: 0,
        [AlertType.POLICY_VIOLATION]: 0
      },
      resolved: 0,
      avgResolutionTime: 0
    }

    let totalResolutionTime = 0
    let resolvedCount = 0

    alerts.forEach(alert => {
      stats.byLevel[alert.level]++
      stats.byType[alert.type]++

      if (alert.resolved && alert.resolvedAt) {
        resolvedCount++
        totalResolutionTime += alert.resolvedAt - alert.timestamp
      }
    })

    stats.resolved = resolvedCount
    stats.avgResolutionTime = resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0

    return stats
  }

  /**
   * 停止告警系统
   */
  destroy(): void {
    if (this.evaluationTimer) {
      clearInterval(this.evaluationTimer)
      this.evaluationTimer = null
    }
    this.removeAllListeners()
  }

  // 私有方法

  private initializeNotifiers(): void {
    this.notifiers.set('email', new EmailNotifier())
    this.notifiers.set('webhook', new WebhookNotifier())
    this.notifiers.set('slack', new SlackNotifier())
  }

  private startEvaluation(): void {
    this.evaluationTimer = setInterval(() => {
      this.evaluateRules()
    }, this.evaluationInterval)
  }

  private async evaluateRules(): Promise<void> {
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue

      try {
        const shouldAlert = await this.evaluateRule(rule)
        
        if (shouldAlert) {
          await this.triggerAlert(rule)
        }
      } catch (error) {
        console.error(`规则评估失败 ${rule.name}:`, error)
      }
    }
  }

  private async evaluateRule(rule: AlertRule): Promise<boolean> {
    // 检查冷却时间
    const existingAlert = Array.from(this.activeAlerts.values())
      .find(alert => alert.ruleId === rule.id)

    if (existingAlert && !existingAlert.resolved) {
      const timeSinceTriggered = Date.now() - existingAlert.timestamp
      if (timeSinceTriggered < rule.cooldown * 1000) {
        return false
      }
    }

    // 评估所有条件
    for (const condition of rule.conditions) {
      const satisfied = await this.evaluateCondition(condition)
      if (!satisfied) {
        return false
      }
    }

    return true
  }

  private async evaluateCondition(condition: {
    metric: string
    operator: string
    threshold: number | string
    duration?: number
  }): Promise<boolean> {
    const history = this.getMetricHistory(
      condition.metric, 
      condition.duration ? condition.duration * 1000 : undefined
    )

    if (history.length === 0) {
      return false
    }

    const latestValue = history[history.length - 1].value
    const threshold = typeof condition.threshold === 'string' ? 
      parseFloat(condition.threshold) : condition.threshold

    switch (condition.operator) {
      case '>':
        return latestValue > threshold
      case '<':
        return latestValue < threshold
      case '>=':
        return latestValue >= threshold
      case '<=':
        return latestValue <= threshold
      case '=':
        return latestValue === threshold
      case '!=':
        return latestValue !== threshold
      default:
        return false
    }
  }

  private async triggerAlert(rule: AlertRule): Promise<void> {
    const alertEvent: AlertEvent = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      ruleName: rule.name,
      type: rule.type,
      level: rule.level,
      title: this.generateAlertTitle(rule),
      message: this.generateAlertMessage(rule),
      timestamp: Date.now(),
      resolved: false,
      metadata: await this.getAlertMetadata(rule),
      actions: []
    }

    // 执行告警动作
    for (const action of rule.actions) {
      const notifier = this.notifiers.get(action.type)
      if (!notifier) {
        console.warn(`未找到通知器: ${action.type}`)
        continue
      }

      try {
        const success = await notifier.send(alertEvent, action.target, action.template)
        alertEvent.actions.push({
          type: action.type,
          target: action.target,
          success,
          timestamp: Date.now(),
          error: success ? undefined : '发送失败'
        })
      } catch (error) {
        alertEvent.actions.push({
          type: action.type,
          target: action.target,
          success: false,
          timestamp: Date.now(),
          error: error.message
        })
      }
    }

    // 存储告警
    this.activeAlerts.set(alertEvent.id, alertEvent)

    // 持久化告警
    try {
      await request.post('/admin/alerts', alertEvent)
    } catch (error) {
      console.error('告警持久化失败:', error)
    }

    this.emit('alert_triggered', alertEvent)
  }

  private generateAlertTitle(rule: AlertRule): string {
    const typeNames = {
      [AlertType.SYSTEM_PERFORMANCE]: '系统性能',
      [AlertType.DATABASE_SLOW_QUERY]: '数据库慢查询',
      [AlertType.QUEUE_BACKLOG]: '队列积压',
      [AlertType.ERROR_RATE_HIGH]: '错误率过高',
      [AlertType.AUDIT_DELAY]: '审核延迟',
      [AlertType.SENSITIVE_CONTENT]: '敏感内容',
      [AlertType.FRAUD_DETECTION]: '欺诈检测',
      [AlertType.POLICY_VIOLATION]: '策略违规'
    }

    return `${typeNames[rule.type]}告警 - ${rule.name}`
  }

  private generateAlertMessage(rule: AlertRule): string {
    const conditions = rule.conditions.map(c => 
      `${c.metric} ${c.operator} ${c.threshold}`
    ).join(' 且 ')

    return `触发条件: ${conditions}${rule.description ? `\n详情: ${rule.description}` : ''}`
  }

  private async getAlertMetadata(rule: AlertRule): Promise<Record<string, any>> {
    const metadata: Record<string, any> = {
      ruleType: rule.type,
      conditions: rule.conditions
    }

    // 添加相关指标的当前值
    for (const condition of rule.conditions) {
      const history = this.getMetricHistory(condition.metric, 60000) // 最近1分钟
      if (history.length > 0) {
        metadata[`current_${condition.metric}`] = history[history.length - 1].value
      }
    }

    return metadata
  }
}

// 预定义的告警规则模板
export const DEFAULT_ALERT_RULES: Omit<AlertRule, 'id'>[] = [
  {
    name: '响应时间过长',
    type: AlertType.SYSTEM_PERFORMANCE,
    level: AlertLevel.WARNING,
    enabled: true,
    conditions: [{
      metric: 'response_time',
      operator: '>',
      threshold: 2000,
      duration: 300 // 5分钟
    }],
    actions: [{
      type: 'email',
      target: 'admin@example.com'
    }],
    cooldown: 1800, // 30分钟
    description: '系统响应时间持续5分钟超过2秒'
  },
  {
    name: '队列任务积压',
    type: AlertType.QUEUE_BACKLOG,
    level: AlertLevel.ERROR,
    enabled: true,
    conditions: [{
      metric: 'queue_size',
      operator: '>',
      threshold: 100,
      duration: 600 // 10分钟
    }],
    actions: [{
      type: 'email',
      target: 'admin@example.com'
    }],
    cooldown: 900, // 15分钟
    description: '队列任务积压超过100个且持续10分钟'
  },
  {
    name: '数据库慢查询过多',
    type: AlertType.DATABASE_SLOW_QUERY,
    level: AlertLevel.WARNING,
    enabled: true,
    conditions: [{
      metric: 'slow_queries_count',
      operator: '>',
      threshold: 10,
      duration: 300 // 5分钟
    }],
    actions: [{
      type: 'email',
      target: 'dba@example.com'
    }],
    cooldown: 1800, // 30分钟
    description: '5分钟内慢查询数量超过10个'
  },
  {
    name: '错误率异常',
    type: AlertType.ERROR_RATE_HIGH,
    level: AlertLevel.CRITICAL,
    enabled: true,
    conditions: [{
      metric: 'error_rate',
      operator: '>',
      threshold: 10,
      duration: 300 // 5分钟
    }],
    actions: [{
      type: 'email',
      target: 'admin@example.com'
    }, {
      type: 'slack',
      target: '#alerts'
    }],
    cooldown: 600, // 10分钟
    description: '系统错误率持续5分钟超过10%'
  }
]

// 导出单例实例
export const auditAlertSystem = new AuditAlertSystem()