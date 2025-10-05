<template>
  <el-row :gutter="24" class="metrics-cards animate-fade-in">
    <!-- 今日活跃用户 -->
    <el-col :span="6" :xs="12" :sm="12" :md="6">
      <div class="data-display-card metrics-card-enhanced" @click="handleCardClick('users')">
        <div class="metrics-content">
          <div class="metrics-icon-container">
            <div class="metrics-icon primary">
              <el-icon size="32">
                <User />
              </el-icon>
            </div>
            <div class="data-trend" :class="getTrendClass(metrics?.todayActiveUsersTrend || 0)">
              <el-icon size="12">
                <TrendCharts />
              </el-icon>
              <span>{{ formatTrend(metrics?.todayActiveUsersTrend || 0) }}</span>
            </div>
          </div>
          <div class="metrics-info">
            <div class="data-value">
              {{ formatNumber(metrics?.todayActiveUsers || 0) }}
            </div>
            <div class="data-label">今日活跃用户</div>
            <div class="metrics-change">
              较昨日{{ getTrendText(metrics?.todayActiveUsersTrend || 0) }}
            </div>
          </div>
        </div>

        <!-- Loading 状态 -->
        <div v-if="loading" class="metrics-loading">
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item variant="text" style="width: 50%" />
              <el-skeleton-item variant="text" style="width: 30%" />
            </template>
          </el-skeleton>
        </div>
      </div>
    </el-col>

    <!-- 今日新增内容 -->
    <el-col :span="6" :xs="12" :sm="12" :md="6">
      <div class="data-display-card metrics-card-enhanced" @click="handleCardClick('content')">
        <div class="metrics-content">
          <div class="metrics-icon-container">
            <div class="metrics-icon success">
              <el-icon size="32">
                <Document />
              </el-icon>
            </div>
            <div class="data-trend" :class="getTrendClass(metrics?.todayNewContentTrend || 0)">
              <el-icon size="12">
                <TrendCharts />
              </el-icon>
              <span>{{ formatTrend(metrics?.todayNewContentTrend || 0) }}</span>
            </div>
          </div>
          <div class="metrics-info">
            <div class="data-value">
              {{ metrics?.todayNewContent || 0 }}
            </div>
            <div class="data-label">今日新增内容</div>
            <div class="metrics-change">
              较昨日{{ getTrendText(metrics?.todayNewContentTrend || 0) }}
            </div>
          </div>
        </div>

        <div v-if="loading" class="metrics-loading">
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item variant="text" style="width: 40%" />
              <el-skeleton-item variant="text" style="width: 30%" />
            </template>
          </el-skeleton>
        </div>
      </div>
    </el-col>

    <!-- 待审核内容 -->
    <el-col :span="6" :xs="12" :sm="12" :md="6">
      <div class="data-display-card metrics-card-enhanced" @click="handleCardClick('audit')">
        <div class="metrics-content">
          <div class="metrics-icon-container">
            <div class="metrics-icon warning">
              <el-icon size="32">
                <View />
              </el-icon>
            </div>
            <div class="metrics-badge" :class="{ 'urgent': (metrics?.pendingAuditCount || 0) > 10 }">
              <span>{{ (metrics?.pendingAuditCount || 0) > 10 ? '紧急' : '正常' }}</span>
            </div>
          </div>
          <div class="metrics-info">
            <div class="data-value">
              {{ metrics?.pendingAuditCount || 0 }}
            </div>
            <div class="data-label">待审核内容</div>
            <div class="metrics-change">
              {{ (metrics?.pendingAuditCount || 0) > 0 ? '需要及时处理' : '暂无待审' }}
            </div>
          </div>
        </div>

        <div v-if="loading" class="metrics-loading">
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item variant="text" style="width: 30%" />
              <el-skeleton-item variant="text" style="width: 40%" />
            </template>
          </el-skeleton>
        </div>
      </div>
    </el-col>

    <!-- 系统健康状态 -->
    <el-col :span="6" :xs="12" :sm="12" :md="6">
      <div class="data-display-card metrics-card-enhanced" @click="handleCardClick('system')">
        <div class="metrics-content">
          <div class="metrics-icon-container">
            <div class="metrics-icon" :class="systemHealthClass">
              <el-icon size="32">
                <Monitor />
              </el-icon>
            </div>
            <div class="status-indicator" :class="systemHealthClass">
              {{ systemHealthText }}
            </div>
          </div>
          <div class="metrics-info">
            <div class="data-value">{{ systemHealthText }}</div>
            <div class="data-label">系统健康状态</div>
            <div class="metrics-change">
              {{ getSystemStatusText() }}
            </div>
          </div>
        </div>

        <div v-if="loading" class="metrics-loading">
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item variant="text" style="width: 30%" />
              <el-skeleton-item variant="text" style="width: 50%" />
            </template>
          </el-skeleton>
        </div>
      </div>
    </el-col>
  </el-row>

  <!-- 数据更新时间提示 -->
  <div class="update-time-hint">
    <el-text size="small" type="info">
      <el-icon>
        <Clock />
      </el-icon>
      数据更新时间：{{ updateTimeText }}
    </el-text>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDashboardStore } from '@/stores/dashboard'
import type { DashboardMetrics } from '@/api/dashboard'
import {
  User, Document, View, Monitor, TrendCharts, Clock
} from '@element-plus/icons-vue'

// Props 定义
interface Props {
  metrics?: DashboardMetrics | null
  loading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  metrics: null,
  loading: false,
  error: null
})

// Emits 定义
interface Emits {
  (e: 'card-click', type: string): void
  (e: 'refresh'): void
}

const emit = defineEmits<Emits>()

const router = useRouter()
const dashboardStore = useDashboardStore()

// 计算属性
const systemHealthClass = computed(() => {
  const status = props.metrics?.systemHealthStatus || 'good'
  return status === 'good' ? 'success' : status === 'warning' ? 'warning' : 'danger'
})

const systemHealthText = computed(() => {
  const status = props.metrics?.systemHealthStatus || 'good'
  return status === 'good' ? '良好' : status === 'warning' ? '警告' : '异常'
})

const updateTimeText = computed(() => {
  return dashboardStore.getUpdateTimeText()
})

// 方法
const formatNumber = (num: number): string => {
  return num.toLocaleString()
}

const formatTrend = (trend: number): string => {
  const abs = Math.abs(trend)
  return `${trend >= 0 ? '+' : '-'}${abs.toFixed(2)}%`
}

const getTrendClass = (trend: number): string => {
  return trend >= 0 ? 'positive' : 'negative'
}

const getTrendText = (trend: number): string => {
  if (trend === 0) return '持平'
  const abs = Math.abs(trend)
  return trend > 0 ? `增长 ${abs.toFixed(2)}%` : `下降 ${abs.toFixed(2)}%`
}

const getSystemStatusText = (): string => {
  if (!props.metrics) return '数据加载中...'

  const { systemCpuUsage, systemMemoryUsage, systemDiskUsage } = props.metrics

  if (systemCpuUsage > 80 || systemMemoryUsage > 85 || systemDiskUsage > 90) {
    return '需要关注资源使用'
  }

  return '运行稳定'
}

const handleCardClick = (type: string) => {
  emit('card-click', type)

  // 根据卡片类型跳转到相应页面
  const routeMap: Record<string, string> = {
    users: '/dashboard/rbac/users',
    content: '/dashboard/content/list',
    audit: '/dashboard/audit/center',
    system: '/dashboard/system/settings'
  }

  const path = routeMap[type]
  if (path) {
    router.push(path)
  }
}
</script>

<style scoped>
.metrics-cards {
  margin-bottom: var(--spacing-xl);
}

.metrics-card-enhanced {
  height: 160px;
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  transition: all var(--transition-medium);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  position: relative;
  cursor: pointer;
}

.metrics-card-enhanced:hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-2px);
}

.metrics-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  height: 100%;
  padding: var(--spacing-lg);
  position: relative;
  z-index: 2;
}

.metrics-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  padding: var(--spacing-lg);
}

.metrics-icon-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-sm);
}

.metrics-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: var(--shadow-md);
}

.metrics-icon.primary {
  background: var(--color-primary);
}

.metrics-icon.success {
  background: var(--color-success);
}

.metrics-icon.warning {
  background: var(--color-warning);
}

.metrics-icon.danger {
  background: var(--color-danger);
}

/* 趋势样式使用全局 data-trend */

.metrics-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: var(--color-success-light);
  color: var(--color-success);
}

.metrics-badge.urgent {
  color: var(--color-danger);
  background: var(--color-danger-light);
  animation: pulse 2s infinite;
}

.metrics-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--text-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
}

.metrics-indicator.success {
  color: var(--color-success);
  background: var(--color-success-light);
}

.metrics-indicator.warning {
  color: var(--color-warning);
  background: var(--color-warning-light);
}

.metrics-indicator.danger {
  color: var(--color-danger);
  background: var(--color-danger-light);
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: blink 2s infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

@keyframes blink {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.3;
  }
}

.metrics-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.data-value {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
  margin-bottom: var(--spacing-xxs);
  color: var(--color-text-primary);
}

.data-label {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-medium);
}

.metrics-change {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-normal);
  margin-top: var(--spacing-xs);
}

.update-time-hint {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.update-time-hint .el-text {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .metrics-card {
    margin-bottom: var(--spacing-md);
  }

  .metrics-value {
    font-size: 24px;
  }

  .metrics-icon {
    width: 48px;
    height: 48px;
  }

  .metrics-icon .el-icon {
    font-size: 24px !important;
  }
}

/* 动画效果 */
.animate-fade-in {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
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