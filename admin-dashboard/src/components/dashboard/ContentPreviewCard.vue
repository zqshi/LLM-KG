<template>
  <DashboardCard
    title="内容类型分布"
    subtitle="各类型内容的数量占比分析"
    :icon="PieChart"
    type="success"
    :metrics="cardMetrics"
    :loading="loading"
    :error="error"
    :status="cardStatus"
    @click="handleViewDetail"
    @refresh="handleRefresh"
  >
    <template #preview>
      <div class="content-preview">
        <!-- 简化版饼图 -->
        <div class="mini-pie-chart" v-if="contentData && contentData.length > 0">
          <svg 
            width="70" 
            height="70" 
            viewBox="0 0 70 70"
            class="pie-svg"
          >
            <!-- 饼图切片 -->
            <g v-for="(slice, index) in pieSlices" :key="index">
              <path
                :d="slice.path"
                :fill="slice.color"
                :stroke="'var(--color-bg-card)'"
                stroke-width="1"
                class="pie-slice"
                @mouseenter="highlightSlice = index"
                @mouseleave="highlightSlice = -1"
              />
            </g>
            
            <!-- 中心圆 -->
            <circle
              cx="35"
              cy="35"
              r="12"
              fill="var(--color-bg-card)"
              stroke="var(--color-border-light)"
              stroke-width="1"
            />
            
            <!-- 总数显示 -->
            <text
              x="35"
              y="32"
              text-anchor="middle"
              font-size="8"
              fill="var(--color-text-secondary)"
            >
              总计
            </text>
            <text
              x="35"
              y="42"
              text-anchor="middle"
              font-size="10"
              font-weight="600"
              fill="var(--color-text-primary)"
            >
              {{ totalCount }}
            </text>
          </svg>
          
          <!-- 类型指示器 -->
          <div class="type-indicators">
            <div 
              v-for="(item, index) in displayItems" 
              :key="item.type"
              class="type-indicator"
              :class="{ active: highlightSlice === index }"
            >
              <div 
                class="indicator-color" 
                :style="{ backgroundColor: item.color }"
              ></div>
              <div class="indicator-info">
                <span class="type-name">{{ item.name }}</span>
                <span class="type-percent">{{ item.percentage.toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-else class="preview-empty">
          <el-icon size="24" class="empty-icon">
            <PieChart />
          </el-icon>
          <span>暂无分布数据</span>
        </div>
      </div>
    </template>
  </DashboardCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import DashboardCard from './DashboardCard.vue'
import { PieChart } from '@element-plus/icons-vue'
import type { ContentDistribution } from '@/api/dashboard'

// Props 定义
interface Props {
  contentData?: ContentDistribution[]
  loading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  contentData: () => [],
  loading: false,
  error: null
})

// Emits 定义
interface Emits {
  (e: 'view-detail'): void
  (e: 'refresh'): void
}

const emit = defineEmits<Emits>()

// 响应式数据
const highlightSlice = ref(-1)

// 计算属性
const totalCount = computed(() => {
  if (!props.contentData || props.contentData.length === 0) return 0
  return props.contentData.reduce((sum, item) => sum + item.count, 0)
})

const cardMetrics = computed(() => {
  if (!props.contentData || props.contentData.length === 0) {
    return [
      { label: '类型数量', value: '0', class: 'success' },
      { label: '总内容', value: '0', class: 'primary' }
    ]
  }

  const totalTypes = props.contentData.length
  const total = totalCount.value
  
  return [
    { 
      label: '类型数量', 
      value: totalTypes.toString(),
      class: 'success'
    },
    { 
      label: '总内容', 
      value: total >= 1000 ? `${Math.round(total / 1000)}k` : total.toString(),
      class: 'primary'
    }
  ]
})

const cardStatus = computed(() => {
  if (props.loading) return null
  if (props.error) return 'error'
  if (!props.contentData || props.contentData.length === 0) return 'warning'
  return 'active'
})

// 显示的内容项（最多显示前4项）
const displayItems = computed(() => {
  if (!props.contentData || props.contentData.length === 0) return []
  
  // 按数量排序并取前4项
  const sorted = [...props.contentData].sort((a, b) => b.count - a.count)
  const topItems = sorted.slice(0, 4)
  
  // 如果有其他项，合并为"其他"
  if (sorted.length > 4) {
    const otherItems = sorted.slice(4)
    const otherCount = otherItems.reduce((sum, item) => sum + item.count, 0)
    const otherPercentage = otherItems.reduce((sum, item) => sum + item.percentage, 0)
    
    topItems.push({
      type: 'other',
      name: '其他',
      count: otherCount,
      percentage: otherPercentage,
      color: '#d9d9d9'
    })
  }
  
  return topItems
})

// 饼图切片路径计算
const pieSlices = computed(() => {
  if (!displayItems.value || displayItems.value.length === 0) return []
  
  const centerX = 35
  const centerY = 35
  const radius = 22
  let currentAngle = -90 // 从顶部开始
  
  return displayItems.value.map(item => {
    const angle = (item.percentage / 100) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    
    // 转换为弧度
    const startRadians = (startAngle * Math.PI) / 180
    const endRadians = (endAngle * Math.PI) / 180
    
    // 计算路径点
    const x1 = centerX + radius * Math.cos(startRadians)
    const y1 = centerY + radius * Math.sin(startRadians)
    const x2 = centerX + radius * Math.cos(endRadians)
    const y2 = centerY + radius * Math.sin(endRadians)
    
    // 大弧标志
    const largeArcFlag = angle > 180 ? 1 : 0
    
    // 构建路径
    const path = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ')
    
    currentAngle += angle
    
    return {
      path,
      color: item.color,
      name: item.name,
      percentage: item.percentage
    }
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
.content-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.mini-pie-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.pie-svg {
  flex-shrink: 0;
}

.pie-slice {
  transition: all var(--transition-fast);
  cursor: pointer;
}

.pie-slice:hover {
  opacity: 0.8;
  filter: brightness(1.1);
}

.type-indicators {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  max-height: 60px;
  overflow: hidden;
}

.type-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 4px;
  border-radius: var(--radius-sm);
  font-size: 9px;
  transition: all var(--transition-fast);
}

.type-indicator.active {
  background: var(--color-primary-light);
  transform: scale(1.05);
}

.indicator-color {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.indicator-info {
  display: flex;
  justify-content: space-between;
  width: 100%;
  min-width: 0;
}

.type-name {
  color: var(--color-text-primary);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 40px;
}

.type-percent {
  color: var(--color-text-secondary);
  font-weight: 600;
  flex-shrink: 0;
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
.dashboard-card:hover .pie-svg {
  transform: scale(1.05);
}

.dashboard-card:hover .pie-slice {
  stroke-width: 2;
}

/* 响应式 */
@media (max-width: 768px) {
  .type-indicator {
    font-size: 8px;
  }
  
  .type-name {
    max-width: 35px;
  }
  
  .indicator-color {
    width: 6px;
    height: 6px;
  }
}
</style>