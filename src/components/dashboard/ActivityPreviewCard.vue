<template>
  <DashboardCard
    title="用户活跃度趋势"
    subtitle="展示最近30天的用户活跃情况"
    :icon="TrendCharts"
    type="primary"
    :metrics="cardMetrics"
    :loading="loading"
    :error="error"
    :status="cardStatus"
    @click="handleViewDetail"
    @refresh="handleRefresh"
  >
    <template #preview>
      <div class="activity-preview">
        <!-- 简化版趋势线图 -->
        <div class="mini-chart" v-if="activityData && activityData.length > 0">
          <svg 
            width="100%" 
            height="60" 
            viewBox="0 0 200 60"
            class="trend-svg"
          >
            <!-- 背景网格 -->
            <defs>
              <pattern id="grid" width="20" height="12" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 12" fill="none" stroke="var(--color-border-light)" stroke-width="0.5" opacity="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            <!-- 活跃用户趋势线 -->
            <path 
              :d="userTrendPath" 
              fill="none" 
              stroke="var(--color-primary)" 
              stroke-width="2"
              class="trend-line"
            />
            
            <!-- 内容增长趋势线 -->
            <path 
              :d="contentTrendPath" 
              fill="none" 
              stroke="var(--color-success)" 
              stroke-width="1.5"
              stroke-dasharray="3,3"
              class="trend-line"
            />
            
            <!-- 趋势点 -->
            <g v-if="showTrendPoints">
              <circle 
                v-for="(point, index) in trendPoints" 
                :key="`user-${index}`"
                :cx="point.x" 
                :cy="point.userY" 
                r="2" 
                fill="var(--color-primary)"
                class="trend-point"
              />
            </g>
          </svg>
          
          <!-- 图例 -->
          <div class="mini-legend">
            <div class="legend-item">
              <div class="legend-dot primary"></div>
              <span>活跃用户</span>
            </div>
            <div class="legend-item">
              <div class="legend-dot success dashed"></div>
              <span>新增内容</span>
            </div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-else class="preview-empty">
          <el-icon size="24" class="empty-icon">
            <TrendCharts />
          </el-icon>
          <span>暂无趋势数据</span>
        </div>
      </div>
    </template>
  </DashboardCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DashboardCard from './DashboardCard.vue'
import { TrendCharts } from '@element-plus/icons-vue'
import type { ActivityData } from '@/api/dashboard'

// Props 定义
interface Props {
  activityData?: ActivityData[]
  loading?: boolean
  error?: string | null
  showTrendPoints?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  activityData: () => [],
  loading: false,
  error: null,
  showTrendPoints: false
})

// Emits 定义
interface Emits {
  (e: 'view-detail'): void
  (e: 'refresh'): void
}

const emit = defineEmits<Emits>()

// 计算属性
const cardMetrics = computed(() => {
  if (!props.activityData || props.activityData.length === 0) {
    return [
      { label: '平均活跃', value: '0', class: 'primary' },
      { label: '总新增', value: '0', class: 'success' }
    ]
  }

  const data = props.activityData
  const avgActiveUsers = Math.round(
    data.reduce((sum, item) => sum + item.activeUsers, 0) / data.length
  )
  const totalNewContent = data.reduce((sum, item) => sum + item.newContent, 0)
  
  return [
    { 
      label: '平均活跃', 
      value: avgActiveUsers >= 1000 ? `${(avgActiveUsers / 1000).toFixed(1)}k` : avgActiveUsers.toString(),
      class: 'primary'
    },
    { 
      label: '总新增', 
      value: totalNewContent.toString(),
      class: 'success'
    }
  ]
})

const cardStatus = computed(() => {
  if (props.loading) return null
  if (props.error) return 'error'
  if (!props.activityData || props.activityData.length === 0) return 'warning'
  return 'active'
})

// SVG路径计算
const userTrendPath = computed(() => {
  if (!props.activityData || props.activityData.length === 0) return ''
  
  const data = props.activityData
  const maxUsers = Math.max(...data.map(item => item.activeUsers))
  const minUsers = Math.min(...data.map(item => item.activeUsers))
  const userRange = maxUsers - minUsers || 1
  
  const width = 200
  const height = 50
  const padding = 10
  
  return data.map((item, index) => {
    const x = padding + (index / (data.length - 1)) * (width - 2 * padding)
    const y = height - padding - ((item.activeUsers - minUsers) / userRange) * (height - 2 * padding)
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')
})

const contentTrendPath = computed(() => {
  if (!props.activityData || props.activityData.length === 0) return ''
  
  const data = props.activityData
  const maxContent = Math.max(...data.map(item => item.newContent))
  const minContent = Math.min(...data.map(item => item.newContent))
  const contentRange = maxContent - minContent || 1
  
  const width = 200
  const height = 50
  const padding = 10
  
  return data.map((item, index) => {
    const x = padding + (index / (data.length - 1)) * (width - 2 * padding)
    const y = height - padding - ((item.newContent - minContent) / contentRange) * (height - 2 * padding)
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')
})

const trendPoints = computed(() => {
  if (!props.activityData || props.activityData.length === 0) return []
  
  const data = props.activityData
  const maxUsers = Math.max(...data.map(item => item.activeUsers))
  const minUsers = Math.min(...data.map(item => item.activeUsers))
  const userRange = maxUsers - minUsers || 1
  
  const maxContent = Math.max(...data.map(item => item.newContent))
  const minContent = Math.min(...data.map(item => item.newContent))
  const contentRange = maxContent - minContent || 1
  
  const width = 200
  const height = 50
  const padding = 10
  
  return data.map((item, index) => {
    const x = padding + (index / (data.length - 1)) * (width - 2 * padding)
    const userY = height - padding - ((item.activeUsers - minUsers) / userRange) * (height - 2 * padding)
    const contentY = height - padding - ((item.newContent - minContent) / contentRange) * (height - 2 * padding)
    
    return { x, userY, contentY }
  })
})

// 事件处理
const handleViewDetail = () => {
  emit('view-detail')
}

const handleRefresh = () => {
  emit('refresh')
}
</script>

<style scoped>
.activity-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.mini-chart {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.trend-svg {
  border-radius: var(--radius-sm);
  background: var(--color-bg-card);
}

.trend-line {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  transition: all var(--transition-medium);
}

.trend-point {
  transition: all var(--transition-fast);
  cursor: pointer;
}

.trend-point:hover {
  r: 3;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.mini-legend {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  font-size: 10px;
  color: var(--color-text-secondary);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-dot.primary {
  background: var(--color-primary);
}

.legend-dot.success {
  background: var(--color-success);
}

.legend-dot.dashed {
  background: none;
  border: 1px dashed var(--color-success);
}

.preview-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  color: var(--color-text-tertiary);
}

.empty-icon {
  opacity: 0.6;
}

/* 悬停效果 */
.dashboard-card:hover .trend-line {
  stroke-width: 2.5;
}

.dashboard-card:hover .trend-svg {
  transform: scale(1.02);
}

/* 响应式 */
@media (max-width: 768px) {
  .mini-legend {
    font-size: 9px;
    gap: var(--spacing-sm);
  }
  
  .legend-dot {
    width: 6px;
    height: 6px;
  }
}
</style>