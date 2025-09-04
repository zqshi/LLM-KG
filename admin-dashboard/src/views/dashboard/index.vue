<template>
  <div class="dashboard" :class="{ mobile: isMobile }">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <el-icon class="title-icon"><Monitor /></el-icon>
          全局仪表盘
        </h1>
        <p class="page-subtitle">
          欢迎回来，{{ currentUser?.name || '管理员' }}！
          {{ getWelcomeMessage() }}
        </p>
      </div>
      <div class="header-actions">
        <el-button 
          type="primary" 
          :icon="Refresh"
          @click="handleRefreshAll"
          :loading="isRefreshing"
          class="refresh-btn"
        >
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 权限错误提示 -->
    <div v-if="hasPermissionError" class="permission-error">
      <el-alert
        title="权限不足"
        description="您没有访问仪表盘的权限，请联系管理员"
        type="error"
        show-icon
        :closable="false"
      />
    </div>

    <!-- 仪表盘内容 -->
    <div v-else class="dashboard-content">
      <!-- 核心指标卡片 -->
      <MetricsCards
        :metrics="dashboardStore.metrics"
        :loading="dashboardStore.loading.metrics"
        :error="dashboardStore.error.metrics"
        @card-click="handleMetricCardClick"
        @refresh="handleMetricsRefresh"
        class="metrics-section"
      />

      <!-- 数据概览卡片区域 -->
      <div class="overview-cards-section">
        <el-row :gutter="24">
          <!-- 活跃度趋势卡片 -->
          <el-col :span="6" :xs="12" :sm="12" :md="6">
            <ActivityPreviewCard
              :activity-data="dashboardStore.activityTrend"
              :loading="dashboardStore.loading.charts"
              :error="dashboardStore.error.charts"
              @view-detail="handleViewActivityDetail"
              @refresh="handleChartsRefresh"
            />
          </el-col>
          
          <!-- 内容分布卡片 -->
          <el-col :span="6" :xs="12" :sm="12" :md="6">
            <ContentPreviewCard
              :content-data="dashboardStore.contentDistribution"
              :loading="dashboardStore.loading.charts"
              :error="dashboardStore.error.charts"
              @view-detail="handleViewContentDetail"
              @refresh="handleChartsRefresh"
            />
          </el-col>
          
          <!-- 系统监控卡片 -->
          <el-col :span="6" :xs="12" :sm="12" :md="6">
            <DashboardCard
              title="系统监控"
              subtitle="服务器运行状态和资源使用"
              :icon="Monitor"
              type="warning"
              :metrics="systemMetrics"
              :loading="dashboardStore.loading.overview"
              :error="dashboardStore.error.overview"
              :status="systemStatus"
              @click="handleViewSystemDetail"
              @refresh="handleSystemRefresh"
            />
          </el-col>
          
          <!-- 待办任务卡片 -->
          <el-col :span="6" :xs="12" :sm="12" :md="6">
            <DashboardCard
              title="待办任务"
              subtitle="需要处理的审核和管理任务"
              :icon="List"
              type="danger"
              :metrics="taskMetrics"
              :loading="dashboardStore.loading.tasks"
              :error="dashboardStore.error.tasks"
              :status="taskStatus"
              @click="handleViewTaskDetail"
              @refresh="handleTasksRefresh"
            />
          </el-col>
        </el-row>
      </div>

      <!-- 功能区域 -->
      <div class="function-section">
        <el-row :gutter="24">
          <!-- 待办任务 -->
          <el-col :span="12" :xs="24" :sm="24" :md="12" v-if="false">
            <PendingTasks
              :pending-tasks="dashboardStore.pendingTasks"
              :loading="dashboardStore.loading.tasks"
              :error="dashboardStore.error.tasks"
              @refresh="handleTasksRefresh"
              @task-click="handleTaskClick"
              @task-action="handleTaskAction"
              @view-all="handleViewAllTasks"
            />
          </el-col>

          <!-- 快捷操作 -->
          <el-col :span="12" :xs="24" :sm="24" :md="12">
            <QuickActions
              :quick-actions="dashboardStore.filteredQuickActions"
              :loading="dashboardStore.loading.overview"
              :error="dashboardStore.error.overview"
              @action-click="handleQuickActionClick"
              @customize="handleCustomizeActions"
            />
          </el-col>

          <!-- 最新反馈 -->
          <el-col :span="12" :xs="24" :sm="24" :md="12">
            <RecentFeedback
              :feedback-list="dashboardStore.recentFeedback"
              :loading="dashboardStore.loading.overview"
              :error="dashboardStore.error.overview"
              @feedback-click="handleFeedbackClick"
              @mark-all-read="handleMarkAllFeedbackRead"
              @mark-read="handleMarkFeedbackRead"
              @reply="handleFeedbackReply"
              @action="handleFeedbackAction"
              @view-all="handleViewAllFeedback"
            />
          </el-col>
        </el-row>
      </div>

      <!-- 监控和反馈区域 -->
      <div class="monitor-section" v-if="false">
        <el-row :gutter="24">
          <!-- 系统监控 -->
          <el-col :span="12" :xs="24" :sm="24" :md="12" v-if="false">
            <SystemMonitor
              :system-resources="dashboardStore.systemResources"
              :system-announcement="dashboardStore.systemAnnouncement"
              :loading="dashboardStore.loading.overview"
              :error="dashboardStore.error.overview"
              @refresh="handleSystemRefresh"
              @view-detail="handleViewSystemDetail"
            />
          </el-col>

          <!-- 最新反馈 -->
          <el-col :span="12" :xs="24" :sm="24" :md="12">
            <RecentFeedback
              :feedback-list="dashboardStore.recentFeedback"
              :loading="dashboardStore.loading.overview"
              :error="dashboardStore.error.overview"
              @feedback-click="handleFeedbackClick"
              @mark-all-read="handleMarkAllFeedbackRead"
              @mark-read="handleMarkFeedbackRead"
              @reply="handleFeedbackReply"
              @action="handleFeedbackAction"
              @view-all="handleViewAllFeedback"
            />
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 详情模态框 -->
    <el-dialog
      v-model="detailModal.visible"
      :title="detailModal.title"
      width="80%"
      :before-close="handleCloseDetailModal"
      destroy-on-close
      class="detail-modal"
    >
      <!-- 活跃度趋势详情 -->
      <template v-if="detailModal.type === 'activity'">
        <ActivityChart
          :activity-data="dashboardStore.activityTrend"
          :active-time-range="dashboardStore.activeTimeRange"
          :active-category="dashboardStore.activeCategory"
          :loading="dashboardStore.loading.charts"
          :error="dashboardStore.error.charts"
          :chart-height="'400px'"
          @time-range-change="handleTimeRangeChange"
          @category-change="handleCategoryChange"
          @refresh="handleChartsRefresh"
          @chart-click="handleActivityChartClick"
        />
      </template>

      <!-- 内容分布详情 -->
      <template v-if="detailModal.type === 'content'">
        <ContentDistributionChart
          :content-data="dashboardStore.contentDistribution"
          :time-range="dashboardStore.activeTimeRange"
          :last-update-time="dashboardStore.lastUpdateTime"
          :loading="dashboardStore.loading.charts"
          :error="dashboardStore.error.charts"
          :chart-height="'400px'"
          @refresh="handleChartsRefresh"
          @chart-click="handleContentChartClick"
          @legend-click="handleContentLegendClick"
          @export="handleChartExport"
        />
      </template>

      <!-- 系统监控详情 -->
      <template v-if="detailModal.type === 'system'">
        <SystemMonitor
          :system-resources="dashboardStore.systemResources"
          :system-announcement="dashboardStore.systemAnnouncement"
          :loading="dashboardStore.loading.overview"
          :error="dashboardStore.error.overview"
          @refresh="handleSystemRefresh"
          @view-detail="handleViewSystemDetail"
        />
      </template>

      <!-- 待办任务详情 -->
      <template v-if="detailModal.type === 'tasks'">
        <PendingTasks
          :pending-tasks="dashboardStore.pendingTasks"
          :loading="dashboardStore.loading.tasks"
          :error="dashboardStore.error.tasks"
          @refresh="handleTasksRefresh"
          @task-click="handleTaskClick"
          @task-action="handleTaskAction"
          @view-all="handleViewAllTasks"
        />
      </template>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseDetailModal">关闭</el-button>
          <el-button 
            type="primary" 
            @click="handleJumpToPage"
            v-if="detailModal.jumpUrl"
          >
            前往详情页
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 全局加载遮罩 -->
    <div v-if="isInitialLoading" class="initial-loading">
      <div class="loading-content">
        <el-icon class="is-loading" size="48"><Loading /></el-icon>
        <p class="loading-text">正在加载仪表盘数据...</p>
        <div class="loading-progress">
          <el-progress 
            :percentage="loadingProgress" 
            :show-text="false" 
            :stroke-width="4"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'

// 导入所有组件
import MetricsCards from '@/components/dashboard/MetricsCards.vue'
import ActivityChart from '@/components/dashboard/ActivityChart.vue'
import ContentDistributionChart from '@/components/dashboard/ContentDistributionChart.vue'
import PendingTasks from '@/components/dashboard/PendingTasks.vue'
import QuickActions from '@/components/dashboard/QuickActions.vue'
import SystemMonitor from '@/components/dashboard/SystemMonitor.vue'
import RecentFeedback from '@/components/dashboard/RecentFeedback.vue'

// 导入新的卡片组件
import DashboardCard from '@/components/dashboard/DashboardCard.vue'
import ActivityPreviewCard from '@/components/dashboard/ActivityPreviewCard.vue'
import ContentPreviewCard from '@/components/dashboard/ContentPreviewCard.vue'

import {
  Monitor, Refresh, Loading, List
} from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()
const dashboardStore = useDashboardStore()

// 响应式数据
const isInitialLoading = ref(true)
const isRefreshing = ref(false)
const loadingProgress = ref(0)
const autoRefreshTimer = ref<NodeJS.Timeout | null>(null)
const loadingTimer = ref<NodeJS.Timeout | null>(null)
const isMobile = ref(false)

// 详情模态框状态
const detailModal = ref({
  visible: false,
  type: '', // 'activity' | 'content' | 'system' | 'tasks'
  title: '',
  jumpUrl: ''
})

// 计算属性
const currentUser = computed(() => authStore.user)

const hasPermissionError = computed(() => {
  // 如果用户未登录，显示权限错误
  if (!authStore.isLoggedIn) {
    return true
  }
  
  // 检查用户是否有仪表盘访问权限
  return !authStore.checkAnyPermission([
    'dashboard:view',
    'rbac:user:view',
    'content:view'
  ])
})

// 系统监控卡片指标
const systemMetrics = computed(() => {
  const metrics = dashboardStore.metrics
  if (!metrics) {
    return [
      { label: 'CPU使用率', value: '0%', class: 'success' },
      { label: '内存使用', value: '0%', class: 'success' }
    ]
  }

  const cpuClass = metrics.systemCpuUsage > 80 ? 'danger' : metrics.systemCpuUsage > 60 ? 'warning' : 'success'
  const memoryClass = metrics.systemMemoryUsage > 85 ? 'danger' : metrics.systemMemoryUsage > 70 ? 'warning' : 'success'

  return [
    { 
      label: 'CPU使用率', 
      value: `${metrics.systemCpuUsage.toFixed(1)}%`, 
      class: cpuClass
    },
    { 
      label: '内存使用', 
      value: `${metrics.systemMemoryUsage.toFixed(1)}%`, 
      class: memoryClass
    }
  ]
})

const systemStatus = computed(() => {
  const metrics = dashboardStore.metrics
  if (!metrics) return null
  
  if (metrics.systemCpuUsage > 80 || metrics.systemMemoryUsage > 85) {
    return 'error'
  }
  if (metrics.systemCpuUsage > 60 || metrics.systemMemoryUsage > 70) {
    return 'warning'
  }
  return 'active'
})

// 任务卡片指标
const taskMetrics = computed(() => {
  const tasks = dashboardStore.pendingTasks
  const totalTasks = tasks.reduce((sum, task) => sum + task.count, 0)
  const highPriorityTasks = tasks.filter(task => task.priority === 'high').reduce((sum, task) => sum + task.count, 0)

  return [
    { 
      label: '待处理', 
      value: totalTasks.toString(), 
      class: totalTasks > 10 ? 'danger' : totalTasks > 5 ? 'warning' : 'success'
    },
    { 
      label: '高优先级', 
      value: highPriorityTasks.toString(), 
      class: highPriorityTasks > 0 ? 'danger' : 'success'
    }
  ]
})

const taskStatus = computed(() => {
  const totalTasks = dashboardStore.pendingTasks.reduce((sum, task) => sum + task.count, 0)
  const highPriorityTasks = dashboardStore.pendingTasks.filter(task => task.priority === 'high').reduce((sum, task) => sum + task.count, 0)
  
  if (highPriorityTasks > 0 || totalTasks > 10) return 'error'
  if (totalTasks > 5) return 'warning'
  if (totalTasks > 0) return 'active'
  return 'active'
})

// 方法
const getWelcomeMessage = () => {
  const hour = new Date().getHours()
  if (hour < 6) return '晚上好，辛苦了！'
  if (hour < 12) return '早上好，新的一天开始了！'
  if (hour < 18) return '下午好，工作进展顺利吗？'
  return '晚上好，今天辛苦了！'
}

const simulateLoadingProgress = () => {
  loadingProgress.value = 0
  loadingTimer.value = setInterval(() => {
    loadingProgress.value += Math.random() * 15
    if (loadingProgress.value >= 100) {
      loadingProgress.value = 100
      if (loadingTimer.value) {
        clearInterval(loadingTimer.value)
        loadingTimer.value = null
      }
    }
  }, 200)
}

const initializeDashboard = async () => {
  console.log('🚀 开始初始化仪表盘...')
  
  // 检查权限
  if (hasPermissionError.value) {
    console.warn('⚠️ 用户没有仪表盘访问权限')
    isInitialLoading.value = false
    return
  }

  try {
    simulateLoadingProgress()
    
    // 初始化仪表盘数据
    await dashboardStore.initDashboard()
    
    // 启动自动刷新
    startAutoRefresh()
    
    console.log('✅ 仪表盘初始化完成')
    
    // 显示欢迎信息
    ElNotification({
      title: '欢迎回来！',
      message: `${currentUser.value?.name || '管理员'}，${getWelcomeMessage()}`,
      type: 'success',
      duration: 3000
    })
    
  } catch (error) {
    console.error('❌ 仪表盘初始化失败:', error)
    ElMessage.error('仪表盘数据加载失败，请刷新页面重试')
  } finally {
    // 延迟隐藏加载状态，保证良好的用户体验
    setTimeout(() => {
      isInitialLoading.value = false
    }, 800)
  }
}

const startAutoRefresh = () => {
  if (autoRefreshTimer.value) return
  
  // 每 30 秒刷新一次实时数据
  autoRefreshTimer.value = setInterval(async () => {
    try {
      await dashboardStore.refreshRealTimeData()
      console.log('🔄 实时数据刷新成功')
    } catch (error) {
      console.error('❌ 实时数据刷新失败:', error)
    }
  }, 30000)
}

const stopAutoRefresh = () => {
  if (autoRefreshTimer.value) {
    clearInterval(autoRefreshTimer.value)
    autoRefreshTimer.value = null
  }
}

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

const handleResize = () => {
  checkMobile()
}

// 事件处理器
const handleRefreshAll = async () => {
  if (isRefreshing.value) return
  
  isRefreshing.value = true
  
  try {
    await dashboardStore.initDashboard()
    ElMessage.success('数据刷新成功')
  } catch (error) {
    ElMessage.error('数据刷新失败')
  } finally {
    isRefreshing.value = false
  }
}

const handleMetricCardClick = (type: string) => {
  console.log('📊 指标卡片点击:', type)
}

const handleMetricsRefresh = async () => {
  await dashboardStore.loadMetrics()
}

const handleTimeRangeChange = async (range: string) => {
  await dashboardStore.changeTimeRange(range)
}

const handleCategoryChange = async (category: string) => {
  await dashboardStore.changeCategoryFilter(category)
}

const handleChartsRefresh = async () => {
  await dashboardStore.loadChartData()
}

const handleActivityChartClick = (data: any) => {
  console.log('📈 活跃度图表点击:', data)
}

const handleContentChartClick = (data: any) => {
  console.log('📈 内容分布图点击:', data)
}

const handleContentLegendClick = (item: any) => {
  console.log('📊 内容图例点击:', item)
}

const handleChartExport = (type: string) => {
  ElMessage.success(`导出 ${type} 成功`)
}

const handleTasksRefresh = async () => {
  await dashboardStore.loadOverviewData()
}

const handleTaskClick = (task: any) => {
  console.log('📝 任务点击:', task)
}

const handleTaskAction = async (task: any, action: string) => {
  console.log('⚙️ 任务操作:', { task, action })
  
  if (action === 'mark-completed') {
    await dashboardStore.markTaskCompleted(task.id)
  }
}

const handleViewAllTasks = () => {
  router.push('/audit/center')
}

const handleQuickActionClick = (action: any) => {
  console.log('⚡ 快捷操作点击:', action)
}

const handleCustomizeActions = () => {
  ElMessage.info('自定义功能即将开放')
}

const handleSystemRefresh = async () => {
  await dashboardStore.loadOverviewData()
}

const handleFeedbackClick = (feedback: any) => {
  console.log('💬 反馈点击:', feedback)
}

const handleMarkAllFeedbackRead = () => {
  ElMessage.success('已标记所有反馈为已读')
}

const handleMarkFeedbackRead = (feedback: any) => {
  console.log('✓ 标记反馈已读:', feedback)
}

const handleFeedbackReply = (feedback: any, content: string) => {
  console.log('💬 反馈回复:', { feedback, content })
  ElMessage.success('回复发送成功')
}

const handleFeedbackAction = (feedback: any, action: string) => {
  console.log('⚙️ 反馈操作:', { feedback, action })
}

const handleViewAllFeedback = () => {
  router.push('/system/feedback')
}

// 新增的详情查看方法
const handleViewActivityDetail = () => {
  detailModal.value = {
    visible: true,
    type: 'activity',
    title: '用户活跃度趋势详情',
    jumpUrl: '/analytics/activity'
  }
}

const handleViewContentDetail = () => {
  detailModal.value = {
    visible: true,
    type: 'content',
    title: '内容类型分布详情',
    jumpUrl: '/analytics/content'
  }
}

const handleViewSystemDetail = () => {
  detailModal.value = {
    visible: true,
    type: 'system',
    title: '系统监控详情',
    jumpUrl: '/system/monitor'
  }
}

const handleViewTaskDetail = () => {
  detailModal.value = {
    visible: true,
    type: 'tasks',
    title: '待办任务详情',
    jumpUrl: '/audit/center'
  }
}

const handleCloseDetailModal = () => {
  detailModal.value.visible = false
}

const handleJumpToPage = () => {
  if (detailModal.value.jumpUrl) {
    router.push(detailModal.value.jumpUrl)
    handleCloseDetailModal()
  }
}

// 删除旧的模拟数据，使用 Store 中的数据

// 删除旧的图表配置，由组件内部处理

// 删除旧的饼图配置

// 删除旧的柱状图配置

// 删除旧的环形图配置

// 删除旧的工具函数

// 删除旧的快捷操作数据

// 删除旧的待审数据

// 删除旧的反馈数据

// 删除旧的工具函数

// 生命周期钩子
onMounted(async () => {
  console.log('🚀 仪表盘组件加载')
  checkMobile()
  window.addEventListener('resize', handleResize)
  await initializeDashboard()
})

onUnmounted(() => {
  console.log('📋 仪表盘组件销毁')
  stopAutoRefresh()
  window.removeEventListener('resize', handleResize)
  
  // 清理定时器
  if (loadingTimer.value) {
    clearInterval(loadingTimer.value)
    loadingTimer.value = null
  }
})
</script>

<style scoped>
.dashboard {
  padding: var(--spacing-lg);
  background: var(--color-bg-page);
  min-height: calc(100vh - 120px);
  overflow-x: hidden;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-xl);
  background: linear-gradient(135deg, var(--color-bg-card) 0%, #f8f9fa 100%);
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-border-light);
  gap: var(--spacing-lg);
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  background: linear-gradient(135deg, var(--color-primary) 0%, #722ed1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  color: var(--color-text-secondary);
  font-size: 16px;
  margin: 0;
  font-weight: 400;
}

.header-actions {
  display: flex;
  align-items: flex-end;
  flex-shrink: 0;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.metrics-section {
  margin-bottom: 0;
}

.charts-section {
  margin-bottom: 0;
}

.function-section {
  margin-bottom: 0;
}

.monitor-section {
  margin-bottom: 0;
}

.stats-row {
  margin-bottom: var(--spacing-xl);
}

.stats-card {
  height: 140px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
  transition: all var(--transition-medium);
  position: relative;
  overflow: hidden;
}

.stats-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradient-primary);
  opacity: 0;
  transition: opacity var(--transition-medium);
}

.stats-card:hover::before {
  opacity: 1;
}

.stats-card-primary::before {
  background: var(--gradient-primary);
}

.stats-card-success::before {
  background: var(--gradient-success);
}

.stats-card-warning::before {
  background: var(--gradient-warning);
}

.stats-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  height: 100%;
  padding: var(--spacing-lg);
}

.stats-icon-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-sm);
}

.stats-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stats-icon.primary {
  background: var(--gradient-primary);
}

.stats-icon.success {
  background: var(--gradient-success);
}

.stats-icon.warning {
  background: var(--gradient-warning);
}

.stats-icon.danger {
  background: var(--gradient-danger);
}

.stats-trend {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 12px;
  font-weight: 600;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  color: var(--color-success);
  background: var(--color-success-light);
}

.stats-trend.positive {
  color: var(--color-success);
  background: var(--color-success-light);
}

.stats-trend.negative {
  color: var(--color-danger);
  background: var(--color-danger-light);
}

.stats-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stats-badge.urgent {
  color: var(--color-danger);
  background: var(--color-danger-light);
  animation: pulse 2s infinite;
}

.stats-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 12px;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
}

.stats-indicator.success {
  color: var(--color-success);
  background: var(--color-success-light);
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: blink 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.stats-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stats-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
  margin-bottom: var(--spacing-xs);
  letter-spacing: -0.5px;
}

.stats-label {
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: 500;
  margin-bottom: var(--spacing-xs);
}

.stats-change {
  font-size: 12px;
  color: var(--color-text-tertiary);
  font-weight: 400;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-btn {
  width: 100%;
  height: 48px;
}

.system-monitor {
  space-y: 16px;
}

.monitor-item {
  margin-bottom: 16px;
}

.monitor-label {
  display: block;
  margin-bottom: 8px;
  color: #606266;
  font-size: 14px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pending-list, .feedback-list {
  max-height: 300px;
  overflow-y: auto;
}

.pending-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pending-item:hover {
  background-color: #f5f7fa;
}

.pending-content {
  flex: 1;
  min-width: 0;
}

.pending-title {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pending-meta {
  font-size: 12px;
  color: #909399;
  display: flex;
  gap: 8px;
}

.feedback-item {
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.feedback-avatar {
  margin-right: 12px;
}

.feedback-content {
  flex: 1;
  min-width: 0;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.feedback-user {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.feedback-time {
  font-size: 12px;
  color: #909399;
}

.feedback-text {
  font-size: 13px;
  color: #606266;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-placeholder {
  text-align: center;
  color: #909399;
  font-size: 14px;
  padding: 40px 20px;
}

.el-row {
  margin-bottom: 20px;
}

.el-row:last-child {
  margin-bottom: 0;
}

/* 图表样式 */
.charts-row {
  margin-bottom: var(--spacing-xl);
}

.action-row {
  margin-bottom: var(--spacing-lg);
}

.chart-card {
  height: auto;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
  transition: all var(--transition-medium);
  overflow: hidden;
}

.chart-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-2px);
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.chart-actions .el-button-group .el-button {
  font-size: 12px;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.chart-container {
  position: relative;
  padding: var(--spacing-sm) 0;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .dashboard {
    padding: var(--spacing-md);
  }
  
  .page-header {
    padding: var(--spacing-lg);
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
  }
  
  .header-actions {
    justify-content: flex-end;
  }
  
  .dashboard-content {
    gap: var(--spacing-lg);
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: var(--spacing-sm);
  }
  
  .page-header {
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }
  
  .page-title {
    font-size: 22px;
  }
  
  .page-subtitle {
    font-size: 14px;
  }
  
  .dashboard-content {
    gap: var(--spacing-md);
  }
  
  /* 概览卡片响应式 */
  .overview-cards-section .el-col {
    margin-bottom: var(--spacing-md);
  }
  
  .overview-cards-section .el-row {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
  
  .overview-cards-section .el-col {
    padding-left: var(--spacing-xs) !important;
    padding-right: var(--spacing-xs) !important;
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: var(--spacing-xs);
  }
  
  .page-header {
    padding: var(--spacing-sm);
  }
  
  .page-title {
    font-size: 18px;
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }
  
  .title-icon {
    font-size: 20px !important;
  }
  
  .refresh-btn {
    width: 100%;
    justify-content: center;
  }
}

/* 数据概览卡片区域 */
.overview-cards-section {
  margin-bottom: var(--spacing-xl);
}

.overview-cards-section .el-row {
  margin-left: -12px;
  margin-right: -12px;
}

.overview-cards-section .el-col {
  padding-left: 12px;
  padding-right: 12px;
}

/* 图表加载状态 */
.chart-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: var(--color-text-tertiary);
}

/* 图表空状态 */
.chart-empty {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: var(--color-text-tertiary);
}

.chart-empty-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
}

.chart-empty-text {
  font-size: 14px;
  margin-bottom: var(--spacing-lg);
}

/* 图表动画 */
.chart-fade-enter-active,
.chart-fade-leave-active {
  transition: all var(--transition-medium);
}

.chart-fade-enter-from,
.chart-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 详情模态框样式 */
.detail-modal :deep(.el-dialog) {
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.detail-modal :deep(.el-dialog__header) {
  background: linear-gradient(135deg, var(--color-primary) 0%, #722ed1 100%);
  color: white;
  padding: var(--spacing-xl);
  margin: 0;
}

.detail-modal :deep(.el-dialog__title) {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.detail-modal :deep(.el-dialog__headerbtn) .el-dialog__close {
  color: white;
  font-size: 20px;
}

.detail-modal :deep(.el-dialog__headerbtn):hover .el-dialog__close {
  color: rgba(255, 255, 255, 0.8);
}

.detail-modal :deep(.el-dialog__body) {
  padding: var(--spacing-xl);
  background: var(--color-bg-page);
  min-height: 400px;
}

.detail-modal :deep(.el-dialog__footer) {
  background: var(--color-bg-card);
  padding: var(--spacing-lg) var(--spacing-xl);
  border-top: 1px solid var(--color-border-light);
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 响应式模态框 */
@media (max-width: 768px) {
  .detail-modal :deep(.el-dialog) {
    width: 95% !important;
    margin: 0 auto !important;
  }
  
  .detail-modal :deep(.el-dialog__body) {
    padding: var(--spacing-md);
  }
  
  .detail-modal :deep(.el-dialog__header) {
    padding: var(--spacing-md);
  }
  
  .detail-modal :deep(.el-dialog__footer) {
    padding: var(--spacing-md);
  }
  
  .dialog-footer {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}
</style>