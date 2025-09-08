<template>
  <div class="dashboard-card" :class="cardClass" @click="handleCardClick">
    <div class="card-header">
      <div class="card-title-section">
        <div class="card-icon" :class="`icon-${type}`">
          <el-icon :size="20">
            <component :is="icon" />
          </el-icon>
        </div>
        <div class="card-title">{{ title }}</div>
        <div class="card-subtitle">{{ subtitle }}</div>
      </div>
      <div class="card-actions" v-if="showActions">
        <Button 
          size="small" 
          :icon="Refresh" 
          circle 
          @click="handleRefresh"
          :loading="loading"
        />
        <Button 
          size="small" 
          :icon="ArrowRight" 
          circle 
          @click="handleViewDetail"
        />
      </div>
    </div>

    <div class="card-content">
      <!-- 核心指标区域 -->
      <div class="metrics-row" v-if="metrics && metrics.length > 0">
        <div 
          v-for="(metric, index) in metrics" 
          :key="index"
          class="metric-item"
        >
          <div class="metric-value" :class="metric.class">{{ metric.value }}</div>
          <div class="metric-label">{{ metric.label }}</div>
        </div>
      </div>

      <!-- 缩略图区域 -->
      <div class="preview-chart" v-if="showPreview">
        <slot name="preview">
          <div class="preview-placeholder">
            <el-icon size="32" class="preview-icon">
              <TrendCharts />
            </el-icon>
            <span class="preview-text">点击查看详情</span>
          </div>
        </slot>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="card-loading">
        <el-skeleton animated>
          <template #template>
            <div class="skeleton-metrics">
              <el-skeleton-item variant="text" style="width: 60%; height: 24px;" />
              <el-skeleton-item variant="text" style="width: 40%; height: 16px;" />
            </div>
            <el-skeleton-item variant="rect" style="width: 100%; height: 80px; margin-top: 16px;" />
          </template>
        </el-skeleton>
      </div>

      <!-- 错误状态 -->
      <div v-if="error" class="card-error">
        <el-icon size="24" class="error-icon">
          <WarningFilled />
        </el-icon>
        <span class="error-text">{{ error }}</span>
        <Button size="small" type="text" @click="handleRefresh">
          重试
        </Button>
      </div>
    </div>

    <!-- 卡片状态指示器 -->
    <div class="card-indicator" :class="statusClass" v-if="status">
      <div class="indicator-dot"></div>
      <span class="status-text">{{ statusText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  Refresh, ArrowRight, TrendCharts, WarningFilled 
} from '@element-plus/icons-vue'
import Button from '@/components/common/Button.vue'

// Props 定义
interface Metric {
  label: string
  value: string | number
  class?: string
}

interface Props {
  title: string
  subtitle?: string
  icon: any
  type: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  metrics?: Metric[]
  loading?: boolean
  error?: string | null
  status?: 'active' | 'warning' | 'error' | null
  showActions?: boolean
  showPreview?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  metrics: () => [],
  loading: false,
  error: null,
  status: null,
  showActions: true,
  showPreview: true,
  clickable: true
})

// Emits 定义
interface Emits {
  (e: 'click'): void
  (e: 'refresh'): void
  (e: 'view-detail'): void
}

const emit = defineEmits<Emits>()

// 计算属性
const cardClass = computed(() => ({
  'card-clickable': props.clickable,
  'card-loading': props.loading,
  'card-error': props.error,
  [`card-${props.type}`]: true
}))

const statusClass = computed(() => {
  if (!props.status) return ''
  return `status-${props.status}`
})

const statusText = computed(() => {
  const statusMap = {
    active: '正常运行',
    warning: '需要关注',
    error: '异常'
  }
  return statusMap[props.status as keyof typeof statusMap] || ''
})

// 事件处理
const handleCardClick = () => {
  if (props.clickable && !props.loading && !props.error) {
    emit('click')
  }
}

const handleRefresh = () => {
  emit('refresh')
}

const handleViewDetail = () => {
  emit('view-detail')
}
</script>

<style scoped>
.dashboard-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-light);
  padding: var(--spacing-lg);
  height: 240px;
  display: flex;
  flex-direction: column;
  transition: all var(--transition-medium);
  position: relative;
  overflow: hidden;
}

.dashboard-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  opacity: 0;
  transition: opacity var(--transition-medium);
}

.card-primary::before {
  background: var(--gradient-primary);
}

.card-success::before {
  background: var(--gradient-success);
}

.card-warning::before {
  background: var(--gradient-warning);
}

.card-danger::before {
  background: var(--gradient-danger);
}

.card-info::before {
  background: var(--gradient-info);
}

.card-clickable:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-2px);
}

.card-clickable:hover::before {
  opacity: 1;
}

.card-clickable {
  cursor: pointer;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.card-title-section {
  flex: 1;
  min-width: 0;
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-bottom: var(--spacing-sm);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.icon-primary {
  background: var(--gradient-primary);
}

.icon-success {
  background: var(--gradient-success);
}

.icon-warning {
  background: var(--gradient-warning);
}

.icon-danger {
  background: var(--gradient-danger);
}

.icon-info {
  background: var(--gradient-info);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
  line-height: 1.2;
}

.card-subtitle {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.3;
}

.card-actions {
  display: flex;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.metric-item {
  text-align: center;
}

.metric-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
  margin-bottom: var(--spacing-xs);
}

.metric-value.success {
  color: var(--color-success);
}

.metric-value.warning {
  color: var(--color-warning);
}

.metric-value.danger {
  color: var(--color-danger);
}

.metric-label {
  font-size: 11px;
  color: var(--color-text-secondary);
  line-height: 1.2;
}

.preview-chart {
  flex: 1;
  min-height: 80px;
  border-radius: var(--radius-md);
  background: var(--color-bg-light);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--color-border-light);
  transition: all var(--transition-medium);
}

.card-clickable:hover .preview-chart {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-text-tertiary);
}

.preview-icon {
  opacity: 0.6;
}

.preview-text {
  font-size: 11px;
  opacity: 0.8;
}

.card-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
}

.skeleton-metrics {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.card-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: var(--color-danger);
}

.error-icon {
  margin-bottom: var(--spacing-sm);
}

.error-text {
  display: block;
  font-size: 12px;
  margin-bottom: var(--spacing-sm);
}

.card-indicator {
  position: absolute;
  bottom: var(--spacing-md);
  right: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 10px;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
}

.indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-active .indicator-dot {
  background: var(--color-success);
}

.status-warning .indicator-dot {
  background: var(--color-warning);
}

.status-error .indicator-dot {
  background: var(--color-danger);
}

.status-text {
  color: var(--color-text-tertiary);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-card {
    height: 200px;
    padding: var(--spacing-md);
  }
  
  .card-title {
    font-size: 14px;
  }
  
  .card-subtitle {
    font-size: 11px;
  }
  
  .metric-value {
    font-size: 16px;
  }
  
  .metrics-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>