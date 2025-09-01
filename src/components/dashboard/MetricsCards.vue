<template>
  <el-row :gutter="24" class="metrics-cards animate-fade-in">
    <!-- 今日活跃用户 -->
    <el-col :span="6" :xs="12" :sm="12" :md="6">
      <el-card 
        class="metrics-card metrics-card-primary" 
        shadow="hover"
        @click="handleCardClick('users')"
      >
        <div class="metrics-content">
          <div class="metrics-icon-container">
            <div class="metrics-icon primary">
              <el-icon size="32"><User /></el-icon>
            </div>
            <div 
              class="metrics-trend"
              :class="getTrendClass(metrics?.todayActiveUsersTrend || 0)"
            >
              <el-icon size="12"><TrendCharts /></el-icon>
              <span>{{ formatTrend(metrics?.todayActiveUsersTrend || 0) }}</span>
            </div>
          </div>
          <div class="metrics-info">
            <div class="metrics-value">
              {{ formatNumber(metrics?.todayActiveUsers || 0) }}
            </div>
            <div class="metrics-label">今日活跃用户</div>
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
      </el-card>
    </el-col>
    
    <!-- 今日新增内容 -->
    <el-col :span="6" :xs="12" :sm="12" :md="6">
      <el-card 
        class="metrics-card metrics-card-success" 
        shadow="hover"
        @click="handleCardClick('content')"
      >
        <div class="metrics-content">
          <div class="metrics-icon-container">
            <div class="metrics-icon success">
              <el-icon size="32"><Document /></el-icon>
            </div>
            <div 
              class="metrics-trend"
              :class="getTrendClass(metrics?.todayNewContentTrend || 0)"
            >
              <el-icon size="12"><TrendCharts /></el-icon>
              <span>{{ formatTrend(metrics?.todayNewContentTrend || 0) }}</span>
            </div>
          </div>
          <div class="metrics-info">
            <div class="metrics-value">
              {{ metrics?.todayNewContent || 0 }}
            </div>
            <div class="metrics-label">今日新增内容</div>
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
      </el-card>
    </el-col>
    
    <!-- 待审核内容 -->
    <el-col :span="6" :xs="12" :sm="12" :md="6">
      <el-card 
        class="metrics-card metrics-card-warning" 
        shadow="hover"
        @click="handleCardClick('audit')"
      >
        <div class="metrics-content">
          <div class="metrics-icon-container">
            <div class="metrics-icon warning">
              <el-icon size="32"><View /></el-icon>
            </div>
            <div 
              class="metrics-badge"
              :class="{ 'urgent': (metrics?.pendingAuditCount || 0) > 10 }"
            >
              <span>{{ (metrics?.pendingAuditCount || 0) > 10 ? '紧急' : '正常' }}</span>
            </div>
          </div>
          <div class="metrics-info">
            <div class="metrics-value">
              {{ metrics?.pendingAuditCount || 0 }}
            </div>
            <div class="metrics-label">待审核内容</div>
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
      </el-card>
    </el-col>
    
    <!-- 系统健康状态 -->
    <el-col :span="6" :xs="12" :sm="12" :md="6">
      <el-card 
        class="metrics-card" 
        :class="`metrics-card-${systemHealthClass}`" 
        shadow="hover"
        @click="handleCardClick('system')"
      >
        <div class="metrics-content">
          <div class="metrics-icon-container">
            <div class="metrics-icon" :class="systemHealthClass">
              <el-icon size="32"><Monitor /></el-icon>
            </div>
            <div class="metrics-indicator" :class="systemHealthClass">
              <div class="indicator-dot"></div>
            </div>
          </div>
          <div class="metrics-info">
            <div class="metrics-value">{{ systemHealthText }}</div>
            <div class="metrics-label">系统健康状态</div>
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
      </el-card>
    </el-col>
  </el-row>
  
  <!-- 数据更新时间提示 -->
  <div class="update-time-hint">
    <el-text size="small" type="info">
      <el-icon><Clock /></el-icon>
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
  return `${trend >= 0 ? '+' : '-'}${abs.toFixed(1)}%`
}

const getTrendClass = (trend: number): string => {
  return trend >= 0 ? 'positive' : 'negative'
}

const getTrendText = (trend: number): string => {
  if (trend === 0) return '持平'
  const abs = Math.abs(trend)
  return trend > 0 ? `增长 ${abs.toFixed(1)}%` : `下降 ${abs.toFixed(1)}%`
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
    users: '/rbac/users',
    content: '/content/list', 
    audit: '/audit/center',
    system: '/system/settings'
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

.metrics-card {
  height: 140px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
  transition: all var(--transition-medium);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.metrics-card::before {
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

.metrics-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}

.metrics-card:hover::before {
  opacity: 1;
}

.metrics-card-primary::before {
  background: var(--gradient-primary);
}

.metrics-card-success::before {
  background: var(--gradient-success);
}

.metrics-card-warning::before {
  background: var(--gradient-warning);
}

.metrics-card-danger::before {
  background: var(--gradient-danger);
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
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.metrics-icon.primary {
  background: var(--gradient-primary);
}

.metrics-icon.success {
  background: var(--gradient-success);
}

.metrics-icon.warning {
  background: var(--gradient-warning);
}

.metrics-icon.danger {
  background: var(--gradient-danger);
}

.metrics-trend {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 12px;
  font-weight: 600;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
}

.metrics-trend.positive {
  color: var(--color-success);
  background: var(--color-success-light);
}

.metrics-trend.negative {
  color: var(--color-danger);
  background: var(--color-danger-light);
}

.metrics-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 600;
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
  font-size: 12px;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
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
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.metrics-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.metrics-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
  margin-bottom: var(--spacing-xs);
  letter-spacing: -0.5px;
}

.metrics-label {
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: 500;
  margin-bottom: var(--spacing-xs);
}

.metrics-change {
  font-size: 12px;
  color: var(--color-text-tertiary);
  font-weight: 400;
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