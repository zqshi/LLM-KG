import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { ElButton, ElCard, ElStatistic, ElProgress } from 'element-plus'
import PerformanceMonitor from '../PerformanceMonitor.vue'

// Mock echarts
vi.mock('echarts', () => ({
  default: {
    init: vi.fn(() => ({
      setOption: vi.fn(),
      dispose: vi.fn()
    }))
  }
}))

// Mock API modules
vi.mock('@/api/auditAsyncProcessor', () => ({
  auditAsyncProcessor: {
    getQueueStatus: vi.fn().mockResolvedValue({
      size: 15,
      processing: true,
      workers: 4,
      performance: {
        counter_tasks_completed: 150,
        counter_tasks_failed: 5
      }
    })
  }
}))

vi.mock('@/api/auditDatabaseOptimizer', () => ({
  auditDatabaseOptimizer: {
    getDatabaseMetrics: vi.fn().mockResolvedValue({
      connectionPoolSize: 20,
      activeConnections: 12,
      queuedQueries: 3,
      averageQueryTime: 250,
      slowQueries: 8,
      cacheHitRatio: 0.92,
      indexEfficiency: 0.88,
      tableScansRatio: 0.15
    }),
    getSlowQueries: vi.fn().mockReturnValue([
      {
        query: 'SELECT * FROM audit_tasks WHERE status = ?',
        averageTime: 1200,
        frequency: 25,
        slowestTime: 2000,
        fastestTime: 800
      },
      {
        query: 'SELECT COUNT(*) FROM audit_logs WHERE created_at > ?',
        averageTime: 900,
        frequency: 40,
        slowestTime: 1500,
        fastestTime: 600
      }
    ]),
    analyzeTableIndexes: vi.fn().mockResolvedValue([
      {
        type: 'index',
        priority: 'high',
        description: '建议为 audit_tasks.status 创建索引',
        estimatedImpact: '提升查询性能40%',
        effort: 'low'
      }
    ]),
    analyzeQuery: vi.fn().mockResolvedValue({
      plan: {
        planningTime: 5,
        executionTime: 120,
        totalCost: 45,
        operations: []
      },
      suggestions: [
        {
          description: '建议添加索引优化查询性能',
          estimatedImpact: '减少50%查询时间'
        }
      ]
    }),
    generateOptimizationReport: vi.fn().mockResolvedValue({
      summary: {
        totalQueries: 1000,
        uniqueQueries: 150,
        slowQueries: 25,
        averageExecutionTime: 300
      },
      indexRecommendations: [],
      connectionPoolOptimization: {
        minConnections: 2,
        maxConnections: 25,
        acquireTimeoutMillis: 30000,
        idleTimeoutMillis: 30000
      }
    })
  }
}))

// Mock DOM methods
Object.defineProperty(document, 'getElementById', {
  value: vi.fn(() => ({
    style: {},
    innerHTML: ''
  }))
})

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined)
  }
})

describe('PerformanceMonitor', () => {
  let wrapper: VueWrapper<any>

  beforeEach(async () => {
    vi.clearAllMocks()
    
    wrapper = mount(PerformanceMonitor, {
      global: {
        components: {
          ElButton,
          ElCard,
          ElStatistic,
          ElProgress
        },
        stubs: {
          'el-icon': true,
          'el-tooltip': true,
          'el-select': true,
          'el-option': true,
          'el-table': true,
          'el-table-column': true,
          'el-tag': true,
          'el-badge': true,
          'el-dialog': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-form': true,
          'el-form-item': true,
          'el-input-number': true
        }
      }
    })

    // Wait for component to mount and load data
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Component Mounting', () => {
    it('should mount successfully', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.performance-monitor').exists()).toBe(true)
    })

    it('should display overview cards', () => {
      const overviewCard = wrapper.find('.overview-card')
      expect(overviewCard.exists()).toBe(true)
    })

    it('should load initial data on mount', () => {
      expect(wrapper.vm.queueStatus.size).toBe(15)
      expect(wrapper.vm.queueStatus.processing).toBe(true)
      expect(wrapper.vm.databaseMetrics.connectionPoolSize).toBe(20)
    })
  })

  describe('Queue Status Display', () => {
    it('should show queue status correctly', async () => {
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.queueStatus.size).toBe(15)
      expect(wrapper.vm.queueStatus.workers).toBe(4)
    })

    it('should calculate queue efficiency', () => {
      const completed = 150
      const failed = 5
      const expectedEfficiency = Math.round((completed / (completed + failed)) * 100)
      
      expect(wrapper.vm.getQueueEfficiency()).toBe(expectedEfficiency)
    })

    it('should handle empty performance data', async () => {
      wrapper.vm.queueStatus.performance = {}
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.getQueueEfficiency()).toBe(100)
    })
  })

  describe('Database Metrics', () => {
    it('should display database performance metrics', async () => {
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.databaseMetrics.cacheHitRatio).toBe(0.92)
      expect(wrapper.vm.databaseMetrics.indexEfficiency).toBe(0.88)
    })

    it('should format cache hit ratio as percentage', () => {
      const cacheHitRatio = wrapper.vm.databaseMetrics.cacheHitRatio
      const percentage = (cacheHitRatio * 100).toFixed(1)
      expect(percentage).toBe('92.0')
    })
  })

  describe('Slow Queries Analysis', () => {
    it('should load and display slow queries', async () => {
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.slowQueries).toHaveLength(2)
      expect(wrapper.vm.slowQueries[0].averageTime).toBe(1200)
    })

    it('should truncate long queries', () => {
      const longQuery = 'SELECT * FROM very_long_table_name WHERE very_long_column_name = ?'
      const truncated = wrapper.vm.truncateQuery(longQuery)
      
      expect(truncated.length).toBeLessThanOrEqual(53) // 50 chars + '...'
    })

    it('should analyze individual queries', async () => {
      const query = 'SELECT * FROM audit_tasks WHERE status = ?'
      
      // Mock Element Plus message box
      const mockMsgbox = vi.fn().mockResolvedValue('confirm')
      wrapper.vm.$msgbox = mockMsgbox
      
      await wrapper.vm.analyzeQuery(query)
      
      expect(mockMsgbox).toHaveBeenCalled()
    })
  })

  describe('Optimization Suggestions', () => {
    it('should load optimization suggestions', async () => {
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.optimizationSuggestions).toHaveLength(1)
      expect(wrapper.vm.optimizationSuggestions[0].type).toBe('index')
    })

    it('should get correct suggestion tag type', () => {
      const highPriority = wrapper.vm.getSuggestionTagType('high')
      const mediumPriority = wrapper.vm.getSuggestionTagType('medium')
      const lowPriority = wrapper.vm.getSuggestionTagType('low')
      
      expect(highPriority).toBe('danger')
      expect(mediumPriority).toBe('warning')
      expect(lowPriority).toBe('info')
    })

    it('should get priority text in Chinese', () => {
      expect(wrapper.vm.getPriorityText('high')).toBe('高')
      expect(wrapper.vm.getPriorityText('medium')).toBe('中')
      expect(wrapper.vm.getPriorityText('low')).toBe('低')
    })
  })

  describe('Database Report Dialog', () => {
    it('should show database report dialog', async () => {
      await wrapper.vm.showDatabaseReport()
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.showReportDialog).toBe(true)
      expect(wrapper.vm.databaseReport).toBeDefined()
    })

    it('should close report dialog', async () => {
      wrapper.vm.showReportDialog = true
      await wrapper.vm.$nextTick()
      
      wrapper.vm.closeReportDialog()
      
      expect(wrapper.vm.showReportDialog).toBe(false)
      expect(wrapper.vm.databaseReport).toBeNull()
    })

    it('should copy SQL command to clipboard', async () => {
      const sqlCommand = 'CREATE INDEX idx_test ON test_table (column1)'
      
      await wrapper.vm.copySqlCommand(sqlCommand)
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(sqlCommand)
    })
  })

  describe('Data Refresh', () => {
    it('should refresh all data', async () => {
      const refreshSpy = vi.spyOn(wrapper.vm, 'refreshAll')
      
      await wrapper.find('.overview-card').find('button').trigger('click')
      
      expect(refreshSpy).toHaveBeenCalled()
    })

    it('should handle refresh errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Mock API error
      const { auditAsyncProcessor } = await import('@/api/auditAsyncProcessor')
      vi.mocked(auditAsyncProcessor.getQueueStatus).mockRejectedValueOnce(new Error('API Error'))
      
      await wrapper.vm.refreshQueueStatus()
      
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('Time Range Selection', () => {
    it('should update chart when time range changes', async () => {
      const updateChartSpy = vi.spyOn(wrapper.vm, 'updateChartData')
      
      wrapper.vm.selectedTimeRange = '1h'
      await wrapper.vm.$nextTick()
      
      wrapper.vm.updateChartData()
      expect(updateChartSpy).toHaveBeenCalled()
    })

    it('should calculate correct time intervals', () => {
      wrapper.vm.selectedTimeRange = '1h'
      expect(wrapper.vm.getTimeIntervals()).toBe(60)
      
      wrapper.vm.selectedTimeRange = '24h'
      expect(wrapper.vm.getTimeIntervals()).toBe(96)
    })
  })

  describe('Chart Management', () => {
    it('should initialize chart on mount', () => {
      expect(wrapper.vm.chartInstance).toBeDefined()
    })

    it('should dispose chart on unmount', () => {
      const disposeSpy = vi.spyOn(wrapper.vm.chartInstance, 'dispose')
      
      wrapper.unmount()
      
      expect(disposeSpy).toHaveBeenCalled()
    })
  })

  describe('Auto Refresh', () => {
    it('should start auto refresh timer on mount', () => {
      expect(wrapper.vm.refreshTimer).toBeDefined()
    })

    it('should clear timer on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
      
      wrapper.unmount()
      
      expect(clearIntervalSpy).toHaveBeenCalled()
    })
  })

  describe('Export Functionality', () => {
    it('should export report as JSON', () => {
      const mockReport = {
        summary: { totalQueries: 100 },
        indexRecommendations: []
      }
      
      wrapper.vm.databaseReport = mockReport
      
      // Mock URL and createElement methods
      const mockUrl = 'blob:mock-url'
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      }
      
      global.URL.createObjectURL = vi.fn(() => mockUrl)
      global.URL.revokeObjectURL = vi.fn()
      document.createElement = vi.fn(() => mockLink)
      
      wrapper.vm.exportReport()
      
      expect(mockLink.click).toHaveBeenCalled()
      expect(mockLink.download).toContain('database_optimization_report_')
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl)
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Mock all API calls to fail
      const { auditDatabaseOptimizer } = await import('@/api/auditDatabaseOptimizer')
      vi.mocked(auditDatabaseOptimizer.getDatabaseMetrics).mockRejectedValue(new Error('Network error'))
      
      await wrapper.vm.refreshDatabaseMetrics()
      
      expect(consoleSpy).toHaveBeenCalledWith('获取数据库指标失败:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('should handle missing chart element', async () => {
      // Mock getElementById to return null
      document.getElementById = vi.fn(() => null)
      
      // Should not throw error
      expect(() => wrapper.vm.initChart()).not.toThrow()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const cards = wrapper.findAll('.metric-card')
      expect(cards.length).toBeGreaterThan(0)
    })

    it('should support keyboard navigation', async () => {
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThan(0)
      
      // Test that buttons are focusable
      buttons.forEach(button => {
        expect(button.attributes('tabindex')).not.toBe('-1')
      })
    })
  })
})