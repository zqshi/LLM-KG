import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { ElMessage, ElNotification, ElButton, ElCard, ElAlert } from 'element-plus'
import Dashboard from '../index.vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useAuthStore } from '@/stores/auth'

// Mock dependencies
vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn()
}))

vi.mock('@/stores/dashboard', () => ({
  useDashboardStore: vi.fn()
}))

vi.mock('@/api/dashboard', () => ({
  dashboardApi: {
    getDashboardData: vi.fn(),
    getMetrics: vi.fn(),
    getActivityTrend: vi.fn(),
    getContentDistribution: vi.fn()
  }
}))

describe('数据看板页面', () => {
  let wrapper: any
  let pinia: any
  let mockDashboardStore: any
  let mockAuthStore: any

  const mockUser = {
    id: 1,
    name: '测试管理员',
    email: 'admin@test.com',
    role: 'admin'
  }

  const mockMetrics = {
    totalUsers: 1250,
    activeUsers: 892,
    totalContent: 5680,
    pendingReview: 23,
    todayViews: 15420,
    systemHealth: 98.5
  }

  const mockActivityData = [
    { date: '2024-03-01', users: 120, content: 45, interactions: 380 },
    { date: '2024-03-02', users: 135, content: 52, interactions: 420 },
    { date: '2024-03-03', users: 148, content: 38, interactions: 395 }
  ]

  const mockContentDistribution = [
    { name: '新闻资讯', value: 2340, percentage: 41.2 },
    { name: '论坛帖子', value: 1890, percentage: 33.3 },
    { name: '商品信息', value: 980, percentage: 17.2 },
    { name: '名言名句', value: 470, percentage: 8.3 }
  ]

  const mockPendingTasks = [
    {
      id: 1,
      title: '新闻审核',
      type: 'news_review',
      priority: 'high',
      count: 15,
      createTime: '2024-03-16 10:30:00'
    },
    {
      id: 2,
      title: '商品审核',
      type: 'goods_review',
      priority: 'medium',
      count: 8,
      createTime: '2024-03-16 11:20:00'
    }
  ]

  beforeEach(() => {
    pinia = createPinia()
    
    // Mock dashboard store
    mockDashboardStore = {
      metrics: mockMetrics,
      activityTrend: mockActivityData,
      contentDistribution: mockContentDistribution,
      pendingTasks: mockPendingTasks,
      recentFeedback: [],
      systemResources: [],
      systemAnnouncement: null,
      loading: {
        overview: false,
        metrics: false,
        charts: false,
        tasks: false
      },
      error: {
        overview: null,
        metrics: null,
        charts: null,
        tasks: null
      },
      activeTimeRange: '7days',
      activeCategory: 'all',
      lastUpdateTime: '2024-03-16 12:00:00',
      initDashboard: vi.fn().mockResolvedValue(true),
      refreshRealTimeData: vi.fn().mockResolvedValue(true),
      loadMetrics: vi.fn().mockResolvedValue(true),
      loadChartData: vi.fn().mockResolvedValue(true),
      loadOverviewData: vi.fn().mockResolvedValue(true),
      changeTimeRange: vi.fn().mockResolvedValue(true),
      changeCategoryFilter: vi.fn().mockResolvedValue(true),
      markTaskCompleted: vi.fn().mockResolvedValue(true),
      filteredQuickActions: []
    }

    // Mock auth store
    mockAuthStore = {
      user: mockUser,
      isAuthenticated: true,
      checkAnyPermission: vi.fn().mockReturnValue(true)
    }

    vi.mocked(useDashboardStore).mockReturnValue(mockDashboardStore)
    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore)

    wrapper = mount(Dashboard, {
      global: {
        plugins: [pinia],
        components: {
          ElMessage,
          ElNotification,
          ElButton,
          ElCard,
          ElAlert
        },
        stubs: {
          'MetricsCards': true,
          'ActivityChart': true,
          'ContentDistributionChart': true,
          'PendingTasks': true,
          'QuickActions': true,
          'SystemMonitor': true,
          'RecentFeedback': true
        }
      }
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('页面结构测试', () => {
    it('应该渲染正确的页面标题', () => {
      expect(wrapper.find('.page-title').text()).toContain('全局仪表盘')
    })

    it('应该显示正确的欢迎信息', () => {
      expect(wrapper.find('.page-subtitle').text()).toContain('测试管理员')
    })

    it('应该包含刷新按钮', () => {
      const refreshBtn = wrapper.find('.refresh-btn')
      expect(refreshBtn.exists()).toBe(true)
      expect(refreshBtn.text()).toContain('刷新数据')
    })

    it('应该包含所有核心组件', () => {
      expect(wrapper.findComponent({ name: 'MetricsCards' }).exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'ActivityChart' }).exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'ContentDistributionChart' }).exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'PendingTasks' }).exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'QuickActions' }).exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'SystemMonitor' }).exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'RecentFeedback' }).exists()).toBe(true)
    })
  })

  describe('权限控制测试', () => {
    it('应该在没有权限时显示权限错误', async () => {
      mockAuthStore.checkAnyPermission.mockReturnValue(false)
      
      await wrapper.vm.$nextTick()
      
      const permissionError = wrapper.find('.permission-error')
      expect(permissionError.exists()).toBe(true)
      expect(permissionError.text()).toContain('权限不足')
    })

    it('应该在有权限时显示仪表盘内容', async () => {
      mockAuthStore.checkAnyPermission.mockReturnValue(true)
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.dashboard-content').exists()).toBe(true)
      expect(wrapper.find('.permission-error').exists()).toBe(false)
    })
  })

  describe('数据加载测试', () => {
    it('应该在组件挂载时初始化仪表盘', async () => {
      expect(mockDashboardStore.initDashboard).toHaveBeenCalled()
    })

    it('应该正确处理初始加载状态', async () => {
      wrapper.vm.isInitialLoading = true
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.initial-loading').exists()).toBe(true)
      expect(wrapper.find('.loading-text').text()).toBe('正在加载仪表盘数据...')
    })

    it('应该在加载完成后隐藏加载状态', async () => {
      wrapper.vm.isInitialLoading = false
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.initial-loading').exists()).toBe(false)
    })

    it('应该显示加载进度条', async () => {
      wrapper.vm.isInitialLoading = true
      wrapper.vm.loadingProgress = 65
      await wrapper.vm.$nextTick()
      
      const progress = wrapper.find('.el-progress')
      expect(progress.exists()).toBe(true)
    })
  })

  describe('数据刷新测试', () => {
    it('应该支持手动刷新所有数据', async () => {
      const refreshBtn = wrapper.find('.refresh-btn')
      await refreshBtn.trigger('click')
      
      expect(mockDashboardStore.initDashboard).toHaveBeenCalled()
    })

    it('应该在刷新时显示加载状态', async () => {
      wrapper.vm.isRefreshing = true
      await wrapper.vm.$nextTick()
      
      const refreshBtn = wrapper.find('.refresh-btn')
      expect(refreshBtn.attributes('loading')).toBeDefined()
    })

    it('应该启动自动刷新定时器', () => {
      expect(wrapper.vm.autoRefreshTimer).toBeTruthy()
    })

    it('应该在组件销毁时清理定时器', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
      wrapper.unmount()
      expect(clearIntervalSpy).toHaveBeenCalled()
    })
  })

  describe('欢迎信息测试', () => {
    it('应该根据时间显示不同的问候语', () => {
      // Mock different hours
      const originalDate = Date
      global.Date = class extends Date {
        getHours() {
          return 9 // 上午
        }
      } as any

      const message = wrapper.vm.getWelcomeMessage()
      expect(message).toBe('早上好，新的一天开始了！')

      global.Date = originalDate
    })

    it('应该在下午显示正确的问候语', () => {
      const originalDate = Date
      global.Date = class extends Date {
        getHours() {
          return 14 // 下午
        }
      } as any

      const message = wrapper.vm.getWelcomeMessage()
      expect(message).toBe('下午好，工作进展顺利吗？')

      global.Date = originalDate
    })

    it('应该在晚上显示正确的问候语', () => {
      const originalDate = Date
      global.Date = class extends Date {
        getHours() {
          return 20 // 晚上
        }
      } as any

      const message = wrapper.vm.getWelcomeMessage()
      expect(message).toBe('晚上好，今天辛苦了！')

      global.Date = originalDate
    })
  })

  describe('事件处理测试', () => {
    it('应该处理指标卡片点击事件', async () => {
      const consoleSpy = vi.spyOn(console, 'log')
      await wrapper.vm.handleMetricCardClick('users')
      expect(consoleSpy).toHaveBeenCalledWith('📊 指标卡片点击:', 'users')
    })

    it('应该处理时间范围变化事件', async () => {
      await wrapper.vm.handleTimeRangeChange('30days')
      expect(mockDashboardStore.changeTimeRange).toHaveBeenCalledWith('30days')
    })

    it('应该处理分类筛选变化事件', async () => {
      await wrapper.vm.handleCategoryChange('news')
      expect(mockDashboardStore.changeCategoryFilter).toHaveBeenCalledWith('news')
    })

    it('应该处理任务点击事件', async () => {
      const task = mockPendingTasks[0]
      const consoleSpy = vi.spyOn(console, 'log')
      await wrapper.vm.handleTaskClick(task)
      expect(consoleSpy).toHaveBeenCalledWith('📝 任务点击:', task)
    })

    it('应该处理任务操作事件', async () => {
      const task = mockPendingTasks[0]
      await wrapper.vm.handleTaskAction(task, 'mark-completed')
      expect(mockDashboardStore.markTaskCompleted).toHaveBeenCalledWith(task.id)
    })
  })

  describe('导航功能测试', () => {
    it('应该支持跳转到审核中心', async () => {
      const router = wrapper.vm.$router
      const pushSpy = vi.spyOn(router, 'push')
      
      await wrapper.vm.handleViewAllTasks()
      expect(pushSpy).toHaveBeenCalledWith('/audit/center')
    })

    it('应该支持跳转到系统监控', async () => {
      const router = wrapper.vm.$router
      const pushSpy = vi.spyOn(router, 'push')
      
      await wrapper.vm.handleViewSystemDetail()
      expect(pushSpy).toHaveBeenCalledWith('/system/monitor')
    })

    it('应该支持跳转到反馈页面', async () => {
      const router = wrapper.vm.$router
      const pushSpy = vi.spyOn(router, 'push')
      
      await wrapper.vm.handleViewAllFeedback()
      expect(pushSpy).toHaveBeenCalledWith('/system/feedback')
    })
  })

  describe('通知功能测试', () => {
    it('应该在初始化完成后显示欢迎通知', async () => {
      const notificationSpy = vi.spyOn(ElNotification, 'info')
      
      await wrapper.vm.initializeDashboard()
      
      expect(notificationSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '欢迎回来！',
          type: 'success'
        })
      )
    })

    it('应该在刷新成功后显示成功消息', async () => {
      const messageSpy = vi.spyOn(ElMessage, 'success')
      
      await wrapper.vm.handleRefreshAll()
      
      expect(messageSpy).toHaveBeenCalledWith('数据刷新成功')
    })

    it('应该在刷新失败时显示错误消息', async () => {
      mockDashboardStore.initDashboard.mockRejectedValue(new Error('网络错误'))
      const messageSpy = vi.spyOn(ElMessage, 'error')
      
      await wrapper.vm.handleRefreshAll()
      
      expect(messageSpy).toHaveBeenCalledWith('数据刷新失败')
    })
  })

  describe('反馈处理测试', () => {
    const mockFeedback = {
      id: 1,
      user: { name: '用户A' },
      content: '测试反馈内容',
      createTime: '2024-03-16 10:30:00'
    }

    it('应该处理反馈点击事件', async () => {
      const consoleSpy = vi.spyOn(console, 'log')
      await wrapper.vm.handleFeedbackClick(mockFeedback)
      expect(consoleSpy).toHaveBeenCalledWith('💬 反馈点击:', mockFeedback)
    })

    it('应该支持标记反馈为已读', async () => {
      const consoleSpy = vi.spyOn(console, 'log')
      await wrapper.vm.handleMarkFeedbackRead(mockFeedback)
      expect(consoleSpy).toHaveBeenCalledWith('✓ 标记反馈已读:', mockFeedback)
    })

    it('应该支持回复反馈', async () => {
      const messageSpy = vi.spyOn(ElMessage, 'success')
      await wrapper.vm.handleFeedbackReply(mockFeedback, '测试回复')
      expect(messageSpy).toHaveBeenCalledWith('回复发送成功')
    })

    it('应该支持批量标记已读', async () => {
      const messageSpy = vi.spyOn(ElMessage, 'success')
      await wrapper.vm.handleMarkAllFeedbackRead()
      expect(messageSpy).toHaveBeenCalledWith('已标记所有反馈为已读')
    })
  })

  describe('图表交互测试', () => {
    it('应该处理活跃度图表点击', async () => {
      const chartData = { date: '2024-03-16', value: 120 }
      const consoleSpy = vi.spyOn(console, 'log')
      
      await wrapper.vm.handleActivityChartClick(chartData)
      expect(consoleSpy).toHaveBeenCalledWith('📈 活跃度图表点击:', chartData)
    })

    it('应该处理内容分布图表点击', async () => {
      const chartData = { name: '新闻资讯', value: 2340 }
      const consoleSpy = vi.spyOn(console, 'log')
      
      await wrapper.vm.handleContentChartClick(chartData)
      expect(consoleSpy).toHaveBeenCalledWith('📈 内容分布图点击:', chartData)
    })

    it('应该处理图例点击事件', async () => {
      const legendItem = { name: '新闻资讯' }
      const consoleSpy = vi.spyOn(console, 'log')
      
      await wrapper.vm.handleContentLegendClick(legendItem)
      expect(consoleSpy).toHaveBeenCalledWith('📊 内容图例点击:', legendItem)
    })

    it('应该支持图表导出功能', async () => {
      const messageSpy = vi.spyOn(ElMessage, 'success')
      await wrapper.vm.handleChartExport('png')
      expect(messageSpy).toHaveBeenCalledWith('导出 png 成功')
    })
  })

  describe('错误处理测试', () => {
    it('应该正确处理初始化失败', async () => {
      mockDashboardStore.initDashboard.mockRejectedValue(new Error('初始化失败'))
      const messageSpy = vi.spyOn(ElMessage, 'error')
      
      await wrapper.vm.initializeDashboard()
      
      expect(messageSpy).toHaveBeenCalledWith('仪表盘数据加载失败，请刷新页面重试')
    })

    it('应该正确处理实时数据刷新失败', async () => {
      mockDashboardStore.refreshRealTimeData.mockRejectedValue(new Error('刷新失败'))
      const consoleSpy = vi.spyOn(console, 'error')
      
      // 触发自动刷新
      if (wrapper.vm.autoRefreshTimer) {
        await new Promise(resolve => setTimeout(resolve, 30100))
      }
      
      expect(consoleSpy).toHaveBeenCalledWith('❌ 实时数据刷新失败:', expect.any(Error))
    })
  })

  describe('响应式设计测试', () => {
    it('应该在移动端正确显示', async () => {
      // 模拟移动端视口
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })
      
      window.dispatchEvent(new Event('resize'))
      await wrapper.vm.$nextTick()
      
      // 检查响应式类名或样式
      expect(wrapper.find('.dashboard').classes()).toContain('mobile')
    })
  })
})