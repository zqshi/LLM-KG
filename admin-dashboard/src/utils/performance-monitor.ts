/**
 * 性能监控工具类
 * 用于监控门户配置管理模块的性能指标
 */

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  type: 'timing' | 'counter' | 'gauge'
}

interface PerformanceReport {
  pageLoadTime: number
  apiResponseTimes: Record<string, number>
  renderTimes: Record<string, number>
  memoryUsage: number
  errorCount: number
  userInteractions: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private startTimes: Map<string, number> = new Map()
  private observers: PerformanceObserver[] = []

  constructor() {
    this.initObservers()
  }

  /**
   * 初始化性能观察器
   */
  private initObservers() {
    // 监控导航性能
    if ('PerformanceObserver' in window) {
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            this.recordMetric('page-load-time', navEntry.loadEventEnd - navEntry.navigationStart, 'timing')
            this.recordMetric('dom-content-loaded', navEntry.domContentLoadedEventEnd - navEntry.navigationStart, 'timing')
            this.recordMetric('first-paint', navEntry.responseStart - navEntry.navigationStart, 'timing')
          }
        })
      })
      
      navigationObserver.observe({ entryTypes: ['navigation'] })
      this.observers.push(navigationObserver)
    }

    // 监控资源加载性能
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming
            if (resourceEntry.name.includes('/api/')) {
              const apiName = this.extractApiName(resourceEntry.name)
              this.recordMetric(`api-${apiName}`, resourceEntry.responseEnd - resourceEntry.requestStart, 'timing')
            }
          }
        })
      })
      
      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.push(resourceObserver)
    }
  }

  /**
   * 记录性能指标
   */
  recordMetric(name: string, value: number, type: PerformanceMetric['type'] = 'gauge') {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      type
    })

    // 保持最近1000条记录
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }
  }

  /**
   * 开始计时
   */
  startTiming(name: string) {
    this.startTimes.set(name, performance.now())
  }

  /**
   * 结束计时并记录
   */
  endTiming(name: string) {
    const startTime = this.startTimes.get(name)
    if (startTime) {
      const duration = performance.now() - startTime
      this.recordMetric(name, duration, 'timing')
      this.startTimes.delete(name)
      return duration
    }
    return 0
  }

  /**
   * 记录用户交互
   */
  recordInteraction(action: string, target?: string) {
    this.recordMetric(`interaction-${action}${target ? `-${target}` : ''}`, 1, 'counter')
  }

  /**
   * 记录错误
   */
  recordError(error: Error, context?: string) {
    this.recordMetric(`error-${context || 'unknown'}`, 1, 'counter')
    
    // 发送错误到监控系统
    this.sendErrorToMonitoring(error, context)
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport(): PerformanceReport {
    const now = Date.now()
    const recentMetrics = this.metrics.filter(m => now - m.timestamp < 300000) // 最近5分钟

    const report: PerformanceReport = {
      pageLoadTime: 0,
      apiResponseTimes: {},
      renderTimes: {},
      memoryUsage: 0,
      errorCount: 0,
      userInteractions: 0
    }

    recentMetrics.forEach(metric => {
      if (metric.name === 'page-load-time') {
        report.pageLoadTime = metric.value
      } else if (metric.name.startsWith('api-')) {
        const apiName = metric.name.replace('api-', '')
        report.apiResponseTimes[apiName] = metric.value
      } else if (metric.name.startsWith('render-')) {
        const renderName = metric.name.replace('render-', '')
        report.renderTimes[renderName] = metric.value
      } else if (metric.name.startsWith('error-')) {
        report.errorCount += metric.value
      } else if (metric.name.startsWith('interaction-')) {
        report.userInteractions += metric.value
      }
    })

    // 获取内存使用情况
    if ('memory' in performance) {
      const memory = (performance as any).memory
      report.memoryUsage = memory.usedJSHeapSize / 1024 / 1024 // MB
    }

    return report
  }

  /**
   * 监控组件渲染性能
   */
  monitorComponentRender(componentName: string, renderFn: () => void) {
    this.startTiming(`render-${componentName}`)
    renderFn()
    this.endTiming(`render-${componentName}`)
  }

  /**
   * 监控API请求性能
   */
  async monitorApiRequest<T>(apiName: string, requestFn: () => Promise<T>): Promise<T> {
    this.startTiming(`api-${apiName}`)
    try {
      const result = await requestFn()
      this.endTiming(`api-${apiName}`)
      return result
    } catch (error) {
      this.endTiming(`api-${apiName}`)
      this.recordError(error as Error, `api-${apiName}`)
      throw error
    }
  }

  /**
   * 获取关键性能指标
   */
  getKeyMetrics() {
    const report = this.getPerformanceReport()
    
    return {
      // 页面加载性能
      pageLoadTime: report.pageLoadTime,
      avgApiResponseTime: this.calculateAverage(Object.values(report.apiResponseTimes)),
      avgRenderTime: this.calculateAverage(Object.values(report.renderTimes)),
      
      // 用户体验指标
      errorRate: report.errorCount / Math.max(report.userInteractions, 1),
      memoryUsage: report.memoryUsage,
      
      // 性能等级评估
      performanceGrade: this.calculatePerformanceGrade(report)
    }
  }

  /**
   * 计算性能等级
   */
  private calculatePerformanceGrade(report: PerformanceReport): 'A' | 'B' | 'C' | 'D' | 'F' {
    let score = 100

    // 页面加载时间评分 (目标: <2s)
    if (report.pageLoadTime > 2000) score -= 20
    else if (report.pageLoadTime > 1500) score -= 10

    // API响应时间评分 (目标: <100ms)
    const avgApiTime = this.calculateAverage(Object.values(report.apiResponseTimes))
    if (avgApiTime > 200) score -= 20
    else if (avgApiTime > 100) score -= 10

    // 错误率评分 (目标: <1%)
    const errorRate = report.errorCount / Math.max(report.userInteractions, 1)
    if (errorRate > 0.05) score -= 30
    else if (errorRate > 0.01) score -= 15

    // 内存使用评分 (目标: <50MB)
    if (report.memoryUsage > 100) score -= 20
    else if (report.memoryUsage > 50) score -= 10

    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  /**
   * 计算平均值
   */
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  /**
   * 提取API名称
   */
  private extractApiName(url: string): string {
    const match = url.match(/\/api\/([^?]+)/)
    return match ? match[1].replace(/\//g, '-') : 'unknown'
  }

  /**
   * 发送错误到监控系统
   */
  private sendErrorToMonitoring(error: Error, context?: string) {
    // 这里可以集成实际的错误监控服务，如 Sentry
    console.error('Performance Monitor Error:', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    })
  }

  /**
   * 清理资源
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.metrics = []
    this.startTimes.clear()
  }
}

// 创建全局实例
export const performanceMonitor = new PerformanceMonitor()

// Vue 3 组合式API钩子
export function usePerformanceMonitor() {
  return {
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    startTiming: performanceMonitor.startTiming.bind(performanceMonitor),
    endTiming: performanceMonitor.endTiming.bind(performanceMonitor),
    recordInteraction: performanceMonitor.recordInteraction.bind(performanceMonitor),
    recordError: performanceMonitor.recordError.bind(performanceMonitor),
    getKeyMetrics: performanceMonitor.getKeyMetrics.bind(performanceMonitor),
    monitorComponentRender: performanceMonitor.monitorComponentRender.bind(performanceMonitor),
    monitorApiRequest: performanceMonitor.monitorApiRequest.bind(performanceMonitor)
  }
}

export default PerformanceMonitor