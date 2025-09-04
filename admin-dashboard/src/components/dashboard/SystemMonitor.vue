<template>
  <el-card class="system-monitor-card">
    <template #header>
      <div class="card-header">
        <div class="header-left">
          <h3 class="card-title">系统监控</h3>
          <el-text size="small" type="info" class="card-subtitle">
            实时监控系统资源使用情况
          </el-text>
        </div>
        <div class="header-actions">
          <el-tooltip content="查看详细监控" placement="top">
            <el-button 
              size="small" 
              :icon="DataBoard" 
              circle
              @click="handleViewDetail"
            />
          </el-tooltip>
          <el-tooltip content="刷新数据" placement="top">
            <el-button 
              size="small" 
              :icon="Refresh" 
              circle
              @click="handleRefresh"
              :loading="loading"
            />
          </el-tooltip>
        </div>
      </div>
    </template>

    <div class="monitor-container">
      <!-- 加载状态 -->
      <div v-if="loading" class="monitor-loading">
        <el-skeleton animated>
          <template #template>
            <el-skeleton-item 
              v-for="i in 4" 
              :key="i"
              variant="text" 
              style="height: 60px; margin-bottom: 16px;" 
            />
          </template>
        </el-skeleton>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="monitor-error">
        <el-alert
          title="监控数据获取失败"
          :description="error"
          type="error"
          :closable="false"
          show-icon
        >
          <template #default>
            <el-button size="small" @click="handleRefresh">
              重试
            </el-button>
          </template>
        </el-alert>
      </div>

      <!-- 资源监控列表 -->
      <div v-else class="monitor-list">
        <div
          v-for="resource in systemResources"
          :key="resource.name"
          class="monitor-item"
          :class="`monitor-${resource.status}`"
        >
          <div class="monitor-header">
            <div class="monitor-info">
              <span class="monitor-label">{{ resource.name }}</span>
              <div class="monitor-value">
                <span class="value-number">{{ resource.usage }}</span>
                <span class="value-unit">{{ resource.unit }}</span>
              </div>
            </div>
            <div class="monitor-status">
              <el-tag 
                :type="getStatusTagType(resource.status)"
                size="small"
                class="status-tag"
              >
                {{ getStatusText(resource.status) }}
              </el-tag>
            </div>
          </div>

          <div class="monitor-progress">
            <el-progress 
              :percentage="resource.usage" 
              :color="getProgressColor(resource.status, resource.usage)"
              :stroke-width="8"
              :show-text="false"
              class="custom-progress"
            />
          </div>

          <div class="monitor-details">
            <span class="detail-text">
              {{ getResourceDescription(resource) }}
            </span>
            <span class="detail-trend">
              <el-icon 
                :size="14" 
                :class="getTrendClass(resource.type)"
              >
                <component :is="getTrendIcon(resource.type)" />
              </el-icon>
              {{ getTrendText(resource.type) }}
            </span>
          </div>
        </div>

        <!-- 系统公告 -->
        <div v-if="systemAnnouncement" class="system-announcement">
          <div class="announcement-header">
            <h4 class="announcement-title">
              <el-icon><Bell /></el-icon>
              系统公告
            </h4>
            <el-tag :type="getAnnouncementType(systemAnnouncement.type)" size="small">
              {{ getAnnouncementTypeText(systemAnnouncement.type) }}
            </el-tag>
          </div>
          
          <div class="announcement-content">
            <div class="announcement-message">
              <h5 class="announcement-subject">{{ systemAnnouncement.title }}</h5>
              <p class="announcement-text">{{ systemAnnouncement.content }}</p>
            </div>
            
            <div class="announcement-meta">
              <span class="announcement-time">
                <el-icon size="12"><Clock /></el-icon>
                {{ formatAnnouncementTime(systemAnnouncement.publishedAt) }}
              </span>
              <span class="announcement-author">
                发布者：{{ systemAnnouncement.publisher }}
              </span>
            </div>
          </div>
        </div>

        <!-- 整体健康状态 -->
        <div class="system-health">
          <div class="health-header">
            <h4 class="health-title">系统健康状态</h4>
            <div class="health-indicator" :class="overallHealthClass">
              <div class="health-dot"></div>
              <span class="health-text">{{ overallHealthText }}</span>
            </div>
          </div>

          <div class="health-summary">
            <div class="summary-item">
              <span class="summary-label">运行时长</span>
              <span class="summary-value">{{ systemUptime }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">活跃连接</span>
              <span class="summary-value">{{ activeConnections }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">响应时间</span>
              <span class="summary-value">{{ responseTime }}ms</span>
            </div>
          </div>

          <!-- 性能建议 -->
          <div v-if="performanceAlerts.length > 0" class="performance-alerts">
            <h5 class="alerts-title">
              <el-icon><Warning /></el-icon>
              性能建议
            </h5>
            <div class="alerts-list">
              <div
                v-for="alert in performanceAlerts"
                :key="alert.id"
                class="alert-item"
                :class="`alert-${alert.level}`"
              >
                <el-icon :size="16">
                  <component :is="getAlertIcon(alert.level)" />
                </el-icon>
                <span class="alert-message">{{ alert.message }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 最后更新时间 -->
      <div class="update-time">
        <el-text size="small" type="info">
          <el-icon><Clock /></el-icon>
          最后更新：{{ lastUpdateTime }}
        </el-text>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import type { SystemResource } from '@/api/dashboard'
import {
  DataBoard, Refresh, Clock, Warning, InfoFilled,
  WarningFilled, CircleCloseFilled, TrendCharts, Bell
} from '@element-plus/icons-vue'

// 系统公告接口
interface SystemAnnouncement {
  id: number
  title: string
  content: string
  type: 'info' | 'warning' | 'maintenance' | 'urgent'
  publisher: string
  publishedAt: string
}

// Props 定义
interface Props {
  systemResources?: SystemResource[]
  systemAnnouncement?: SystemAnnouncement | null
  loading?: boolean
  error?: string | null
  autoRefresh?: boolean
  refreshInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  systemResources: () => [],
  systemAnnouncement: null,
  loading: false,
  error: null,
  autoRefresh: true,
  refreshInterval: 30000 // 30秒
})

// Emits 定义
interface Emits {
  (e: 'refresh'): void
  (e: 'view-detail'): void
}

const emit = defineEmits<Emits>()

const router = useRouter()

// 响应式数据
const lastUpdateTime = ref(new Date().toLocaleTimeString())
const systemUptime = ref('15天 8小时')
const activeConnections = ref(142)
const responseTime = ref(85)
const refreshTimer = ref<NodeJS.Timeout | null>(null)

// 性能警报数据
const performanceAlerts = ref([
  {
    id: 1,
    level: 'warning' as const,
    message: '内存使用率超过60%，建议清理缓存'
  },
  {
    id: 2,
    level: 'info' as const,
    message: '系统运行平稳，各项指标正常'
  }
])

// 计算属性
const overallHealthClass = computed(() => {
  if (!props.systemResources || props.systemResources.length === 0) return 'unknown'
  
  const hasError = props.systemResources.some(r => r.status === 'danger')
  const hasWarning = props.systemResources.some(r => r.status === 'warning')
  
  if (hasError) return 'danger'
  if (hasWarning) return 'warning'
  return 'normal'
})

const overallHealthText = computed(() => {
  const classMap = {
    'normal': '良好',
    'warning': '警告',
    'danger': '异常',
    'unknown': '未知'
  }
  return classMap[overallHealthClass.value] || '未知'
})

// 方法
const getStatusTagType = (status: SystemResource['status']) => {
  const tagTypeMap = {
    'normal': 'success',
    'warning': 'warning',
    'danger': 'danger'
  } as const
  return tagTypeMap[status] || 'info'
}

const getStatusText = (status: SystemResource['status']) => {
  const statusMap = {
    'normal': '正常',
    'warning': '警告', 
    'danger': '危险'
  }
  return statusMap[status] || '未知'
}

const getProgressColor = (status: SystemResource['status'], usage: number) => {
  if (status === 'danger' || usage >= 90) {
    return '#f56c6c'
  }
  if (status === 'warning' || usage >= 70) {
    return '#e6a23c'
  }
  return '#67c23a'
}

const getResourceDescription = (resource: SystemResource) => {
  const descriptions = {
    'cpu': (usage: number) => {
      if (usage >= 80) return '处理器负载较高'
      if (usage >= 60) return '处理器使用正常'
      return '处理器使用率低'
    },
    'memory': (usage: number) => {
      if (usage >= 85) return '内存使用紧张'
      if (usage >= 70) return '内存使用正常'
      return '内存充足'
    },
    'disk': (usage: number) => {
      if (usage >= 90) return '存储空间不足'
      if (usage >= 70) return '存储使用正常'
      return '存储空间充足'
    },
    'network': (usage: number) => {
      if (usage >= 80) return '网络流量较高'
      if (usage >= 50) return '网络使用正常'
      return '网络流量较低'
    }
  } as Record<string, (usage: number) => string>

  const getDesc = descriptions[resource.type]
  return getDesc ? getDesc(resource.usage) : '使用正常'
}

const getTrendClass = (type: SystemResource['type']) => {
  // 模拟趋势数据，实际应该从API获取
  const trendMap = {
    'cpu': 'trend-up',
    'memory': 'trend-down', 
    'disk': 'trend-stable',
    'network': 'trend-up'
  }
  return trendMap[type] || 'trend-stable'
}

const getTrendIcon = (_type: SystemResource['type']) => {
  return TrendCharts
}

const getTrendText = (type: SystemResource['type']) => {
  const trendMap = {
    'cpu': '上升趋势',
    'memory': '下降趋势',
    'disk': '保持稳定',
    'network': '上升趋势'
  }
  return trendMap[type] || '稳定'
}

const getAlertIcon = (level: 'info' | 'warning' | 'danger') => {
  const iconMap = {
    'info': InfoFilled,
    'warning': WarningFilled,
    'danger': CircleCloseFilled
  }
  return iconMap[level] || InfoFilled
}

// 系统公告相关方法
const getAnnouncementType = (type: SystemAnnouncement['type']) => {
  const typeMap = {
    'info': 'info',
    'warning': 'warning', 
    'maintenance': 'warning',
    'urgent': 'danger'
  } as const
  return typeMap[type] || 'info'
}

const getAnnouncementTypeText = (type: SystemAnnouncement['type']) => {
  const textMap = {
    'info': '系统消息',
    'warning': '重要通知',
    'maintenance': '维护通知',
    'urgent': '紧急公告'
  }
  return textMap[type] || '系统消息'
}

const formatAnnouncementTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    return `${diffDays}天前发布`
  }
  if (diffHours > 0) {
    return `${diffHours}小时前发布`
  }
  if (diffMinutes > 0) {
    return `${diffMinutes}分钟前发布`
  }
  return '刚刚发布'
}

// 事件处理
const handleRefresh = () => {
  lastUpdateTime.value = new Date().toLocaleTimeString()
  emit('refresh')
}

const handleViewDetail = () => {
  emit('view-detail')
  router.push('/system/monitor')
}

// 自动刷新
const startAutoRefresh = () => {
  if (!props.autoRefresh) return
  
  refreshTimer.value = setInterval(() => {
    handleRefresh()
  }, props.refreshInterval)
}

const stopAutoRefresh = () => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
    refreshTimer.value = null
  }
}

// 生命周期
onMounted(() => {
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.system-monitor-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}

.header-left {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.card-subtitle {
  display: block;
  line-height: 1.4;
}

.header-actions {
  flex-shrink: 0;
  display: flex;
  gap: var(--spacing-xs);
}

.monitor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.monitor-loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.monitor-error {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.monitor-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.monitor-item {
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  transition: all var(--transition-medium);
}

.monitor-item:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-card);
}

.monitor-normal {
  border-left: 4px solid var(--color-success);
}

.monitor-warning {
  border-left: 4px solid var(--color-warning);
}

.monitor-danger {
  border-left: 4px solid var(--color-danger);
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
}

.monitor-info {
  flex: 1;
}

.monitor-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.monitor-value {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-xs);
}

.value-number {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
}

.value-unit {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.monitor-status {
  flex-shrink: 0;
}

.status-tag {
  font-size: 11px;
  padding: var(--spacing-xs) var(--spacing-sm);
}

.monitor-progress {
  margin-bottom: var(--spacing-sm);
}

.custom-progress {
  --el-progress-bg-color: var(--color-bg-light);
}

.monitor-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.detail-text {
  color: var(--color-text-secondary);
}

.detail-trend {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-text-tertiary);
}

.trend-up {
  color: var(--color-danger);
}

.trend-down {
  color: var(--color-success);
}

.trend-stable {
  color: var(--color-info);
}

.system-announcement {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, var(--color-primary-light) 0%, rgba(255, 255, 255, 0.1) 100%);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-primary);
  border-left: 4px solid var(--color-primary);
  position: relative;
  overflow: hidden;
}

.system-announcement::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.announcement-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.announcement-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.announcement-message {
  flex: 1;
}

.announcement-subject {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  line-height: 1.4;
}

.announcement-text {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0;
}

.announcement-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--color-text-tertiary);
  border-top: 1px solid var(--color-border-light);
  padding-top: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.announcement-time {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.announcement-author {
  font-weight: 500;
}

.system-health {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--color-bg-light);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
}

.health-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.health-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.health-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 14px;
  font-weight: 500;
}

.health-indicator.normal {
  color: var(--color-success);
}

.health-indicator.warning {
  color: var(--color-warning);
}

.health-indicator.danger {
  color: var(--color-danger);
}

.health-indicator.unknown {
  color: var(--color-info);
}

.health-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.health-summary {
  display: flex;
  justify-content: space-around;
  margin-bottom: var(--spacing-lg);
}

.summary-item {
  text-align: center;
}

.summary-label {
  display: block;
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.summary-value {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.performance-alerts {
  border-top: 1px solid var(--color-border-light);
  padding-top: var(--spacing-md);
}

.alerts-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.alert-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: 13px;
}

.alert-info {
  background: var(--color-info-light);
  color: var(--color-info);
}

.alert-warning {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.alert-danger {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.alert-message {
  flex: 1;
}

.update-time {
  margin-top: var(--spacing-md);
  text-align: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border-light);
}

.update-time .el-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .monitor-header {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .health-summary {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: left;
  }
  
  .summary-label {
    margin-bottom: 0;
  }
}

/* 动画效果 */
.monitor-list {
  animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>