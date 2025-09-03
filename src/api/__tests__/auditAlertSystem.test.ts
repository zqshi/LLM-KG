import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AuditAlertSystem, AlertLevel, AlertType } from '../auditAlertSystem'
import type { AlertRule, AlertEvent, MetricDataPoint } from '../auditAlertSystem'

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

describe('AuditAlertSystem', () => {
  let alertSystem: AuditAlertSystem

  beforeEach(() => {
    alertSystem = new AuditAlertSystem()
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    if (alertSystem) {
      alertSystem.destroy()
    }
    vi.useRealTimers()
  })

  describe('Alert Rules Management', () => {
    it('should add alert rule successfully', () => {
      const rule: AlertRule = {
        id: 'test-rule-1',
        name: 'High Response Time',
        type: AlertType.SYSTEM_PERFORMANCE,
        level: AlertLevel.WARNING,
        enabled: true,
        conditions: [{
          metric: 'response_time',
          operator: '>',
          threshold: 2000,
          duration: 300
        }],
        actions: [{
          type: 'email',
          target: 'admin@example.com'
        }],
        cooldown: 1800,
        description: 'Alert when response time exceeds 2 seconds'
      }

      alertSystem.addRule(rule)
      
      const rules = alertSystem.getRules()
      expect(rules).toHaveLength(1)
      expect(rules[0].id).toBe('test-rule-1')
    })

    it('should update existing rule', () => {
      const rule: AlertRule = {
        id: 'test-rule-1',
        name: 'Test Rule',
        type: AlertType.SYSTEM_PERFORMANCE,
        level: AlertLevel.WARNING,
        enabled: true,
        conditions: [],
        actions: [],
        cooldown: 1800
      }

      alertSystem.addRule(rule)
      
      const success = alertSystem.updateRule('test-rule-1', {
        name: 'Updated Rule',
        level: AlertLevel.ERROR
      })

      expect(success).toBe(true)
      
      const updatedRule = alertSystem.getRules()[0]
      expect(updatedRule.name).toBe('Updated Rule')
      expect(updatedRule.level).toBe(AlertLevel.ERROR)
    })

    it('should remove rule successfully', () => {
      const rule: AlertRule = {
        id: 'test-rule-1',
        name: 'Test Rule',
        type: AlertType.SYSTEM_PERFORMANCE,
        level: AlertLevel.WARNING,
        enabled: true,
        conditions: [],
        actions: [],
        cooldown: 1800
      }

      alertSystem.addRule(rule)
      expect(alertSystem.getRules()).toHaveLength(1)
      
      const success = alertSystem.removeRule('test-rule-1')
      expect(success).toBe(true)
      expect(alertSystem.getRules()).toHaveLength(0)
    })

    it('should return false when updating non-existent rule', () => {
      const success = alertSystem.updateRule('non-existent', { name: 'New Name' })
      expect(success).toBe(false)
    })
  })

  describe('Metric Recording', () => {
    it('should record single metric data point', () => {
      const metric = 'response_time'
      const value = 1500
      
      alertSystem.recordMetric(metric, value)
      
      const history = alertSystem.getMetricHistory(metric)
      expect(history).toHaveLength(1)
      expect(history[0].metric).toBe(metric)
      expect(history[0].value).toBe(value)
      expect(history[0].timestamp).toBeTypeOf('number')
    })

    it('should record batch metrics', () => {
      const metrics = [
        { metric: 'cpu_usage', value: 75 },
        { metric: 'memory_usage', value: 60 },
        { metric: 'response_time', value: 200 }
      ]

      alertSystem.recordMetrics(metrics)
      
      expect(alertSystem.getMetricHistory('cpu_usage')).toHaveLength(1)
      expect(alertSystem.getMetricHistory('memory_usage')).toHaveLength(1)
      expect(alertSystem.getMetricHistory('response_time')).toHaveLength(1)
    })

    it('should maintain metric history within limits', () => {
      const metric = 'test_metric'
      
      // Record more points than the limit
      for (let i = 0; i < 1500; i++) {
        alertSystem.recordMetric(metric, i)
      }
      
      const history = alertSystem.getMetricHistory(metric)
      expect(history.length).toBeLessThanOrEqual(1440) // maxHistoryPoints
    })

    it('should filter metric history by duration', () => {
      const metric = 'test_metric'
      const now = Date.now()
      
      // Manually set timestamps
      vi.setSystemTime(now - 7200000) // 2 hours ago
      alertSystem.recordMetric(metric, 100)
      
      vi.setSystemTime(now - 3600000) // 1 hour ago
      alertSystem.recordMetric(metric, 200)
      
      vi.setSystemTime(now)
      alertSystem.recordMetric(metric, 300)
      
      const recentHistory = alertSystem.getMetricHistory(metric, 3600000) // Last 1 hour
      expect(recentHistory).toHaveLength(2) // Should exclude the 2-hour-old record
    })
  })

  describe('Alert Rule Evaluation', () => {
    it('should trigger alert when conditions are met', async () => {
      const rule: AlertRule = {
        id: 'response-time-rule',
        name: 'High Response Time Alert',
        type: AlertType.SYSTEM_PERFORMANCE,
        level: AlertLevel.WARNING,
        enabled: true,
        conditions: [{
          metric: 'response_time',
          operator: '>',
          threshold: 1000
        }],
        actions: [{
          type: 'email',
          target: 'admin@test.com'
        }],
        cooldown: 60
      }

      alertSystem.addRule(rule)
      
      // Mock successful notification
      vi.mocked(request.post).mockResolvedValue({ data: { success: true } })
      
      let alertTriggered = false
      alertSystem.on('alert_triggered', () => {
        alertTriggered = true
      })
      
      // Record metric that exceeds threshold
      alertSystem.recordMetric('response_time', 1500)
      
      // Trigger evaluation
      await vi.advanceTimersByTimeAsync(30000)
      
      expect(alertTriggered).toBe(true)
      expect(alertSystem.getActiveAlerts()).toHaveLength(1)
    })

    it('should not trigger alert when conditions are not met', async () => {
      const rule: AlertRule = {
        id: 'response-time-rule',
        name: 'High Response Time Alert',
        type: AlertType.SYSTEM_PERFORMANCE,
        level: AlertLevel.WARNING,
        enabled: true,
        conditions: [{
          metric: 'response_time',
          operator: '>',
          threshold: 2000
        }],
        actions: [],
        cooldown: 60
      }

      alertSystem.addRule(rule)
      
      let alertTriggered = false
      alertSystem.on('alert_triggered', () => {
        alertTriggered = true
      })
      
      // Record metric below threshold
      alertSystem.recordMetric('response_time', 1000)
      
      await vi.advanceTimersByTimeAsync(30000)
      
      expect(alertTriggered).toBe(false)
      expect(alertSystem.getActiveAlerts()).toHaveLength(0)
    })

    it('should respect cooldown period', async () => {
      const rule: AlertRule = {
        id: 'cooldown-test',
        name: 'Cooldown Test',
        type: AlertType.SYSTEM_PERFORMANCE,
        level: AlertLevel.WARNING,
        enabled: true,
        conditions: [{
          metric: 'test_metric',
          operator: '>',
          threshold: 100
        }],
        actions: [],
        cooldown: 300 // 5 minutes
      }

      alertSystem.addRule(rule)
      
      let alertCount = 0
      alertSystem.on('alert_triggered', () => {
        alertCount++
      })
      
      // First alert
      alertSystem.recordMetric('test_metric', 200)
      await vi.advanceTimersByTimeAsync(30000)
      
      expect(alertCount).toBe(1)
      
      // Second alert within cooldown period
      alertSystem.recordMetric('test_metric', 250)
      await vi.advanceTimersByTimeAsync(30000)
      
      // Should not trigger due to cooldown
      expect(alertCount).toBe(1)
      
      // Alert after cooldown period
      await vi.advanceTimersByTimeAsync(300000) // Wait for cooldown
      alertSystem.recordMetric('test_metric', 300)
      await vi.advanceTimersByTimeAsync(30000)
      
      expect(alertCount).toBe(2)
    })

    it('should evaluate multiple conditions with AND logic', async () => {
      const rule: AlertRule = {
        id: 'multi-condition',
        name: 'Multi Condition Alert',
        type: AlertType.SYSTEM_PERFORMANCE,
        level: AlertLevel.ERROR,
        enabled: true,
        conditions: [
          {
            metric: 'cpu_usage',
            operator: '>',
            threshold: 80
          },
          {
            metric: 'memory_usage',
            operator: '>',
            threshold: 90
          }
        ],
        actions: [],
        cooldown: 60
      }

      alertSystem.addRule(rule)
      
      let alertTriggered = false
      alertSystem.on('alert_triggered', () => {
        alertTriggered = true
      })
      
      // Only one condition met
      alertSystem.recordMetric('cpu_usage', 85)
      alertSystem.recordMetric('memory_usage', 70)
      
      await vi.advanceTimersByTimeAsync(30000)
      expect(alertTriggered).toBe(false)
      
      // Both conditions met
      alertSystem.recordMetric('cpu_usage', 85)
      alertSystem.recordMetric('memory_usage', 95)
      
      await vi.advanceTimersByTimeAsync(30000)
      expect(alertTriggered).toBe(true)
    })
  })

  describe('Alert Resolution', () => {
    it('should resolve active alert', async () => {
      // Create an active alert first
      const mockAlert: AlertEvent = {
        id: 'test-alert-1',
        ruleId: 'test-rule',
        ruleName: 'Test Rule',
        type: AlertType.SYSTEM_PERFORMANCE,
        level: AlertLevel.WARNING,
        title: 'Test Alert',
        message: 'Test message',
        timestamp: Date.now(),
        resolved: false,
        metadata: {},
        actions: []
      }

      // Manually add to active alerts for testing
      ;(alertSystem as any).activeAlerts.set(mockAlert.id, mockAlert)
      
      vi.mocked(request.put).mockResolvedValue({ data: { success: true } })
      
      const success = await alertSystem.resolveAlert(mockAlert.id, 'admin')
      
      expect(success).toBe(true)
      expect(alertSystem.getActiveAlerts()).toHaveLength(0)
    })

    it('should handle resolution of non-existent alert', async () => {
      const success = await alertSystem.resolveAlert('non-existent', 'admin')
      expect(success).toBe(false)
    })
  })

  describe('Alert History', () => {
    it('should retrieve alert history with filters', async () => {
      const mockHistory: AlertEvent[] = [
        {
          id: 'alert-1',
          ruleId: 'rule-1',
          ruleName: 'Rule 1',
          type: AlertType.SYSTEM_PERFORMANCE,
          level: AlertLevel.WARNING,
          title: 'Test Alert 1',
          message: 'Message 1',
          timestamp: Date.now() - 3600000,
          resolved: true,
          resolvedAt: Date.now(),
          metadata: {},
          actions: []
        }
      ]

      vi.mocked(request.get).mockResolvedValue({ data: mockHistory })

      const history = await alertSystem.getAlertHistory({
        level: AlertLevel.WARNING,
        resolved: true
      })

      expect(history).toEqual(mockHistory)
      expect(request.get).toHaveBeenCalledWith('/admin/alerts/history', {
        params: {
          level: AlertLevel.WARNING,
          resolved: true
        }
      })
    })
  })

  describe('Alert Statistics', () => {
    it('should calculate alert statistics correctly', () => {
      // Add some mock active alerts
      const alerts: AlertEvent[] = [
        {
          id: 'alert-1',
          ruleId: 'rule-1',
          ruleName: 'Rule 1',
          type: AlertType.SYSTEM_PERFORMANCE,
          level: AlertLevel.CRITICAL,
          title: 'Critical Alert',
          message: 'Critical message',
          timestamp: Date.now() - 1800000,
          resolved: false,
          metadata: {},
          actions: []
        },
        {
          id: 'alert-2',
          ruleId: 'rule-2',
          ruleName: 'Rule 2',
          type: AlertType.DATABASE_SLOW_QUERY,
          level: AlertLevel.WARNING,
          title: 'Warning Alert',
          message: 'Warning message',
          timestamp: Date.now() - 900000,
          resolved: true,
          resolvedAt: Date.now() - 300000,
          metadata: {},
          actions: []
        }
      ]

      // Manually add alerts for testing
      alerts.forEach(alert => {
        ;(alertSystem as any).activeAlerts.set(alert.id, alert)
      })

      const stats = alertSystem.getAlertStats()
      
      expect(stats.total).toBe(2)
      expect(stats.byLevel[AlertLevel.CRITICAL]).toBe(1)
      expect(stats.byLevel[AlertLevel.WARNING]).toBe(1)
      expect(stats.byType[AlertType.SYSTEM_PERFORMANCE]).toBe(1)
      expect(stats.byType[AlertType.DATABASE_SLOW_QUERY]).toBe(1)
      expect(stats.resolved).toBe(1)
      expect(stats.avgResolutionTime).toBeGreaterThan(0)
    })
  })

  describe('Event Emission', () => {
    it('should emit rule_added event when rule is added', (done) => {
      const rule: AlertRule = {
        id: 'test-rule',
        name: 'Test Rule',
        type: AlertType.SYSTEM_PERFORMANCE,
        level: AlertLevel.INFO,
        enabled: true,
        conditions: [],
        actions: [],
        cooldown: 60
      }

      alertSystem.on('rule_added', (addedRule) => {
        expect(addedRule.id).toBe('test-rule')
        done()
      })

      alertSystem.addRule(rule)
    })

    it('should emit metric_recorded event when metric is recorded', (done) => {
      alertSystem.on('metric_recorded', (dataPoint: MetricDataPoint) => {
        expect(dataPoint.metric).toBe('test_metric')
        expect(dataPoint.value).toBe(100)
        done()
      })

      alertSystem.recordMetric('test_metric', 100)
    })
  })

  describe('Error Handling', () => {
    it('should handle notification failures gracefully', async () => {
      const rule: AlertRule = {
        id: 'notification-fail-test',
        name: 'Notification Fail Test',
        type: AlertType.SYSTEM_PERFORMANCE,
        level: AlertLevel.ERROR,
        enabled: true,
        conditions: [{
          metric: 'error_rate',
          operator: '>',
          threshold: 5
        }],
        actions: [{
          type: 'email',
          target: 'fail@test.com'
        }],
        cooldown: 60
      }

      alertSystem.addRule(rule)
      
      // Mock notification failure
      vi.mocked(request.post).mockRejectedValue(new Error('Network error'))
      
      alertSystem.recordMetric('error_rate', 10)
      
      await vi.advanceTimersByTimeAsync(30000)
      
      // Alert should still be created even if notification fails
      const activeAlerts = alertSystem.getActiveAlerts()
      expect(activeAlerts).toHaveLength(1)
      
      // Check that action failure is recorded
      const alert = activeAlerts[0]
      expect(alert.actions.some(action => !action.success)).toBe(true)
    })
  })

  describe('Disabled Rules', () => {
    it('should not evaluate disabled rules', async () => {
      const rule: AlertRule = {
        id: 'disabled-rule',
        name: 'Disabled Rule',
        type: AlertType.SYSTEM_PERFORMANCE,
        level: AlertLevel.WARNING,
        enabled: false, // Disabled
        conditions: [{
          metric: 'test_metric',
          operator: '>',
          threshold: 50
        }],
        actions: [],
        cooldown: 60
      }

      alertSystem.addRule(rule)
      
      let alertTriggered = false
      alertSystem.on('alert_triggered', () => {
        alertTriggered = true
      })
      
      alertSystem.recordMetric('test_metric', 100)
      
      await vi.advanceTimersByTimeAsync(30000)
      
      expect(alertTriggered).toBe(false)
      expect(alertSystem.getActiveAlerts()).toHaveLength(0)
    })
  })
})