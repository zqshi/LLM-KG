import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import { dashboardApi } from '@/api/dashboard'
import type { 
  DashboardData, 
  DashboardMetrics, 
  PendingTask, 
  QuickAction,
  ActivityData,
  ContentDistribution,
  DepartmentContribution,
  SystemResource,
  SystemAnnouncement
} from '@/api/dashboard'

// 数据加载状态类型
interface LoadingState {
  overview: boolean
  metrics: boolean
  charts: boolean
  tasks: boolean
}

// 错误状态类型
interface ErrorState {
  overview: string | null
  metrics: string | null
  charts: string | null
  tasks: string | null
}

export const useDashboardStore = defineStore('dashboard', () => {
  const authStore = useAuthStore()

  // === 数据状态 ===
  const dashboardData = ref<DashboardData | null>(null)
  const metrics = ref<DashboardMetrics | null>(null)
  const pendingTasks = ref<PendingTask[]>([])
  const quickActions = ref<QuickAction[]>([])
  const activityTrend = ref<ActivityData[]>([])
  const contentDistribution = ref<ContentDistribution[]>([])
  const departmentContributions = ref<DepartmentContribution[]>([])
  const systemResources = ref<SystemResource[]>([])
  const systemAnnouncement = ref<SystemAnnouncement | null>(null)
  const recentFeedback = ref<any[]>([])

  // === 加载状态 ===
  const loading = ref<LoadingState>({
    overview: false,
    metrics: false,
    charts: false,
    tasks: false
  })

  // === 错误状态 ===
  const error = ref<ErrorState>({
    overview: null,
    metrics: null,
    charts: null,
    tasks: null
  })

  // === 配置状态 ===
  const activeTimeRange = ref('30d')
  const activeCategory = ref('all')
  const autoRefreshEnabled = ref(true)
  const autoRefreshInterval = ref(30000) // 30秒
  const lastUpdateTime = ref<Date | null>(null)

  // === 计算属性 ===
  const isLoading = computed(() => {
    return Object.values(loading.value).some(state => state)
  })

  const hasError = computed(() => {
    return Object.values(error.value).some(err => err !== null)
  })

  const filteredQuickActions = computed(() => {
    return quickActions.value.filter(action => {
      // 根据用户权限过滤快捷操作
      if (!action.visible) return false
      if (action.permission && !authStore.checkPermission(action.permission)) return false
      return true
    })
  })

  const pendingTasksCount = computed(() => {
    return pendingTasks.value.reduce((total, task) => total + task.count, 0)
  })

  const systemHealthStatus = computed(() => {
    if (!metrics.value) return 'good'
    
    const cpuWarning = metrics.value.systemCpuUsage > 80
    const memoryWarning = metrics.value.systemMemoryUsage > 85
    const diskWarning = metrics.value.systemDiskUsage > 90

    if (cpuWarning || memoryWarning || diskWarning) {
      return diskWarning ? 'error' : 'warning'
    }
    return 'good'
  })

  const chartOptions = computed(() => ({
    // 用户活跃度趋势图配置
    activityTrend: {
      title: { show: false },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e4e7ed',
        borderWidth: 1,
        textStyle: { color: '#303133' },
        formatter: (params: any) => {
          return `${params[0].name}<br/>活跃用户: ${params[0].value}人<br/>新增内容: ${params[1].value}篇`
        }
      },
      legend: {
        data: ['活跃用户', '新增内容'],
        textStyle: { color: '#909399' }
      },
      xAxis: {
        type: 'category',
        data: activityTrend.value.map(item => item.date.slice(-5)),
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#e4e7ed' } },
        axisLabel: { color: '#909399', fontSize: 12 }
      },
      yAxis: [
        {
          type: 'value',
          name: '活跃用户',
          position: 'left',
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#909399', fontSize: 12 },
          splitLine: { lineStyle: { color: '#f0f0f0' } }
        },
        {
          type: 'value',
          name: '新增内容',
          position: 'right',
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#909399', fontSize: 12 },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: '活跃用户',
          type: 'line',
          smooth: true,
          data: activityTrend.value.map(item => item.activeUsers),
          itemStyle: { color: '#667eea' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
                { offset: 1, color: 'rgba(102, 126, 234, 0.1)' }
              ]
            }
          }
        },
        {
          name: '新增内容',
          type: 'bar',
          yAxisIndex: 1,
          data: activityTrend.value.map(item => item.newContent),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#52c41a' },
                { offset: 1, color: '#73d13d' }
              ]
            }
          }
        }
      ],
      grid: {
        left: '3%', right: '4%', bottom: '3%', top: '10%',
        containLabel: true
      }
    },

    // 内容分布饼图配置
    contentDistribution: {
      title: { show: false },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e4e7ed',
        borderWidth: 1,
        formatter: '{a} <br/>{b}: {c}个 ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: '5%',
        textStyle: { color: '#909399', fontSize: 12 }
      },
      series: [{
        name: '内容类型',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: { show: false },
        data: contentDistribution.value.map(item => ({
          value: item.count,
          name: item.name,
          itemStyle: { color: item.color }
        }))
      }]
    },

    // 部门贡献度柱状图配置
    departmentContribution: {
      title: { show: false },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e4e7ed',
        borderWidth: 1,
        formatter: (params: any) => {
          return `${params[0].name}<br/>贡献内容: ${params[0].value}篇`
        }
      },
      xAxis: {
        type: 'category',
        data: departmentContributions.value.map(item => item.departmentName),
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#e4e7ed' } },
        axisLabel: { color: '#909399', fontSize: 12 }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#909399', fontSize: 12 },
        splitLine: { lineStyle: { color: '#f0f0f0' } }
      },
      series: [{
        data: departmentContributions.value.map((item, index) => ({
          value: item.contentCount,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: ['#667eea', '#52c41a', '#faad14', '#ff4d4f', '#1890ff', '#722ed1'][index % 6] },
                { offset: 1, color: ['#764ba2', '#73d13d', '#ffc53d', '#ff7875', '#40a9ff', '#9254de'][index % 6] }
              ]
            }
          }
        })),
        type: 'bar',
        barWidth: '50%',
        itemStyle: { borderRadius: [4, 4, 0, 0] }
      }],
      grid: {
        left: '3%', right: '4%', bottom: '3%', top: '5%',
        containLabel: true
      }
    }
  }))

  // === 数据操作方法 ===

  /**
   * 初始化仪表盘数据
   * 首次加载时调用
   */
  async function initDashboard() {
    console.log('🚀 初始化仪表盘数据...')
    
    // 清除之前的错误状态
    clearErrors()
    
    // 并行加载所有数据以提升性能
    await Promise.allSettled([
      loadOverviewData(),
      loadMetrics(),
      loadChartData()
    ])

    lastUpdateTime.value = new Date()
    console.log('✅ 仪表盘数据初始化完成')
  }

  /**
   * 加载概览数据
   */
  async function loadOverviewData() {
    if (loading.value.overview) return

    loading.value.overview = true
    error.value.overview = null

    try {
      const response = await dashboardApi.getOverview()
      
      if (response.code === 200 && response.data) {
        dashboardData.value = response.data
        pendingTasks.value = response.data.pendingTasks
        quickActions.value = response.data.quickActions
        systemAnnouncement.value = response.data.systemAnnouncement
        recentFeedback.value = response.data.recentFeedback
        console.log('📊 概览数据加载成功')
      } else {
        throw new Error(response.message || '数据加载失败')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '概览数据加载失败'
      error.value.overview = errorMsg
      console.error('❌ 概览数据加载失败:', err)
    } finally {
      loading.value.overview = false
    }
  }

  /**
   * 加载实时指标数据
   */
  async function loadMetrics() {
    if (loading.value.metrics) return

    loading.value.metrics = true
    error.value.metrics = null

    try {
      const response = await dashboardApi.getMetrics()
      
      if (response.code === 200 && response.data) {
        metrics.value = response.data
        console.log('📈 指标数据刷新成功')
      } else {
        throw new Error(response.message || '指标数据加载失败')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '指标数据加载失败'
      error.value.metrics = errorMsg
      console.error('❌ 指标数据加载失败:', err)
    } finally {
      loading.value.metrics = false
    }
  }

  /**
   * 加载图表数据
   */
  async function loadChartData() {
    if (loading.value.charts) return

    loading.value.charts = true
    error.value.charts = null

    try {
      const [activityRes, contentRes, departmentRes, resourceRes] = await Promise.allSettled([
        dashboardApi.getActivityTrend(activeTimeRange.value, activeCategory.value),
        dashboardApi.getContentDistribution(activeTimeRange.value),
        dashboardApi.getDepartmentContributions(),
        dashboardApi.getSystemResources()
      ])

      if (activityRes.status === 'fulfilled' && activityRes.value.code === 200) {
        activityTrend.value = activityRes.value.data
      }

      if (contentRes.status === 'fulfilled' && contentRes.value.code === 200) {
        contentDistribution.value = contentRes.value.data
      }

      if (departmentRes.status === 'fulfilled' && departmentRes.value.code === 200) {
        departmentContributions.value = departmentRes.value.data
      }

      if (resourceRes.status === 'fulfilled' && resourceRes.value.code === 200) {
        systemResources.value = resourceRes.value.data
      }

      console.log('📊 图表数据加载成功')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '图表数据加载失败'
      error.value.charts = errorMsg
      console.error('❌ 图表数据加载失败:', err)
    } finally {
      loading.value.charts = false
    }
  }

  /**
   * 刷新实时数据
   * 定时器调用，只刷新快变数据
   */
  async function refreshRealTimeData() {
    if (!autoRefreshEnabled.value) return

    console.log('🔄 刷新实时数据...')
    
    // 只刷新指标数据，不刷新图表和概览
    await loadMetrics()
    lastUpdateTime.value = new Date()
  }

  /**
   * 切换时间范围
   */
  async function changeTimeRange(range: string) {
    if (activeTimeRange.value === range) return

    activeTimeRange.value = range
    console.log(`📅 切换时间范围到: ${range}`)
    
    // 重新加载图表数据
    await loadChartData()
  }

  /**
   * 切换板块筛选
   */
  async function changeCategoryFilter(category: string) {
    if (activeCategory.value === category) return

    activeCategory.value = category
    console.log(`🏷️ 切换板块筛选到: ${category}`)
    
    // 重新加载图表数据
    await loadChartData()
  }

  /**
   * 标记待办任务完成
   */
  async function markTaskCompleted(taskId: number) {
    loading.value.tasks = true
    error.value.tasks = null

    try {
      await dashboardApi.markTaskCompleted(taskId)
      
      // 更新本地数据
      pendingTasks.value = pendingTasks.value.map(task => 
        task.id === taskId ? { ...task, count: Math.max(0, task.count - 1) } : task
      ).filter(task => task.count > 0)

      console.log(`✅ 任务 ${taskId} 标记完成`)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '任务处理失败'
      error.value.tasks = errorMsg
      console.error('❌ 任务处理失败:', err)
    } finally {
      loading.value.tasks = false
    }
  }

  /**
   * 清除错误状态
   */
  function clearErrors() {
    error.value = {
      overview: null,
      metrics: null,
      charts: null,
      tasks: null
    }
  }

  /**
   * 设置自动刷新
   */
  function setAutoRefresh(enabled: boolean, interval: number = 30000) {
    autoRefreshEnabled.value = enabled
    autoRefreshInterval.value = interval
  }

  /**
   * 获取格式化的更新时间
   */
  function getUpdateTimeText(): string {
    if (!lastUpdateTime.value) return '未更新'
    
    const now = Date.now()
    const diffMs = now - lastUpdateTime.value.getTime()
    const diffMinutes = Math.floor(diffMs / 60000)
    
    if (diffMinutes < 1) return '刚刚更新'
    if (diffMinutes < 60) return `${diffMinutes}分钟前更新`
    
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}小时前更新`
    
    return lastUpdateTime.value.toLocaleDateString()
  }

  return {
    // 数据状态
    dashboardData,
    metrics,
    pendingTasks,
    quickActions,
    activityTrend,
    contentDistribution,
    departmentContributions,
    systemResources,
    systemAnnouncement,
    recentFeedback,

    // 加载和错误状态
    loading,
    error,
    isLoading,
    hasError,

    // 配置状态
    activeTimeRange,
    activeCategory,
    autoRefreshEnabled,
    autoRefreshInterval,
    lastUpdateTime,

    // 计算属性
    filteredQuickActions,
    pendingTasksCount,
    systemHealthStatus,
    chartOptions,

    // 方法
    initDashboard,
    loadOverviewData,
    loadMetrics,
    loadChartData,
    refreshRealTimeData,
    changeTimeRange,
    changeCategoryFilter,
    markTaskCompleted,
    clearErrors,
    setAutoRefresh,
    getUpdateTimeText
  }
})