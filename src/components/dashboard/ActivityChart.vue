<template>
  <el-card class="chart-card activity-chart">
    <template #header>
      <div class="chart-header">
        <div class="chart-title-section">
          <h3 class="chart-title">用户活跃度趋势</h3>
          <el-text size="small" type="info" class="chart-subtitle">
            展示最近{{ timeRangeText }}{{ categoryText }}的用户活跃情况和内容增长趋势
          </el-text>
          <el-text size="small" type="warning" class="chart-time-note">
            数据范围：{{ getDataRangeText() }}
          </el-text>
        </div>
        <div class="chart-actions">
          <!-- 板块筛选器 -->
          <el-select
            :model-value="activeCategory"
            @update:model-value="handleCategoryChange"
            placeholder="选择板块"
            size="small"
            style="width: 120px;"
            :disabled="loading"
          >
            <el-option
              v-for="category in categories"
              :key="category.value"
              :label="category.label"
              :value="category.value"
            />
          </el-select>
          
          <el-button-group size="small">
            <el-button 
              v-for="range in timeRanges"
              :key="range.value"
              :type="activeTimeRange === range.value ? 'primary' : ''"
              @click="handleTimeRangeChange(range.value)"
              :loading="loading && activeTimeRange === range.value"
            >
              {{ range.label }}
            </el-button>
          </el-button-group>
          
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

    <div class="chart-container">
      <!-- 加载状态 -->
      <div v-if="loading" class="chart-loading">
        <el-skeleton animated>
          <template #template>
            <div style="height: 300px; display: flex; align-items: center; justify-content: center;">
              <el-skeleton-item variant="text" style="width: 100%; height: 200px;" />
            </div>
          </template>
        </el-skeleton>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="chart-error">
        <el-result
          icon="error"
          title="数据加载失败"
          :sub-title="error"
          class="chart-error-result"
        >
          <template #extra>
            <el-button type="primary" @click="handleRefresh">
              重新加载
            </el-button>
          </template>
        </el-result>
      </div>

      <!-- 空数据状态 -->
      <div v-else-if="!activityData || activityData.length === 0" class="chart-empty">
        <el-empty description="暂无数据" />
      </div>

      <!-- 图表内容 -->
      <div v-else class="chart-content">
        <VChart
          :option="chartOption"
          :style="{ height: chartHeight }"
          :autoresize="true"
          :loading="loading"
          @click="handleChartClick"
        />
        
        <!-- 图表统计信息 -->
        <div class="chart-stats">
          <div class="stat-item">
            <el-statistic 
              title="平均活跃用户" 
              :value="averageActiveUsers" 
              suffix="人"
            />
          </div>
          <div class="stat-item">
            <el-statistic 
              title="总新增内容" 
              :value="totalNewContent" 
              suffix="篇"
            />
          </div>
          <div class="stat-item">
            <el-statistic 
              title="内容增长率" 
              :value="contentGrowthRate" 
              suffix="%"
              :precision="1"
            />
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import type { ActivityData } from '@/api/dashboard'

// Props 定义
interface Props {
  activityData?: ActivityData[]
  activeTimeRange?: string
  activeCategory?: string
  loading?: boolean
  error?: string | null
  chartHeight?: string
}

const props = withDefaults(defineProps<Props>(), {
  activityData: () => [],
  activeTimeRange: '30d',
  activeCategory: 'all',
  loading: false,
  error: null,
  chartHeight: '350px'
})

// Emits 定义
interface Emits {
  (e: 'time-range-change', range: string): void
  (e: 'category-change', category: string): void
  (e: 'refresh'): void
  (e: 'chart-click', data: any): void
}

const emit = defineEmits<Emits>()

// 时间范围选项
const timeRanges = [
  { value: '7d', label: '7天' },
  { value: '30d', label: '30天' }, 
  { value: '90d', label: '90天' }
]

// 板块分类选项
const categories = [
  { value: 'all', label: '全部板块' },
  { value: 'knowledge', label: '知识库' },
  { value: 'forum', label: '论坛讨论' },
  { value: 'news', label: '资讯' },
  { value: 'marketplace', label: '二手市场' }
]

// 计算属性
const timeRangeText = computed(() => {
  const range = timeRanges.find(r => r.value === props.activeTimeRange)
  return range?.label || '30天'
})

const categoryText = computed(() => {
  const category = categories.find(c => c.value === props.activeCategory)
  return category?.value === 'all' ? '' : `【${category?.label}】`
})

const averageActiveUsers = computed(() => {
  if (!props.activityData || props.activityData.length === 0) return 0
  const total = props.activityData.reduce((sum, item) => sum + item.activeUsers, 0)
  return Math.round(total / props.activityData.length)
})

const totalNewContent = computed(() => {
  if (!props.activityData || props.activityData.length === 0) return 0
  return props.activityData.reduce((sum, item) => sum + item.newContent, 0)
})

const contentGrowthRate = computed(() => {
  if (!props.activityData || props.activityData.length < 2) return 0
  
  const data = props.activityData
  const firstPeriod = data.slice(0, Math.floor(data.length / 2))
  const secondPeriod = data.slice(Math.floor(data.length / 2))
  
  const firstAvg = firstPeriod.reduce((sum, item) => sum + item.newContent, 0) / firstPeriod.length
  const secondAvg = secondPeriod.reduce((sum, item) => sum + item.newContent, 0) / secondPeriod.length
  
  return ((secondAvg - firstAvg) / firstAvg * 100)
})

// 图表配置
const chartOption = computed(() => ({
  title: {
    show: false
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#e4e7ed',
    borderWidth: 1,
    textStyle: {
      color: '#303133'
    },
    formatter: (params: any) => {
      const date = params[0].name
      const activeUsers = params[0].value
      const newContent = params[1].value
      const auditedContent = params[2]?.value || 0
      
      return `
        <div style="font-weight: 600; margin-bottom: 8px;">${date}</div>
        <div style="margin-bottom: 4px;">
          <span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:#667eea;"></span>
          活跃用户: ${activeUsers.toLocaleString()}人
        </div>
        <div style="margin-bottom: 4px;">
          <span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:#52c41a;"></span>
          新增内容: ${newContent}篇
        </div>
        <div>
          <span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:#faad14;"></span>
          已审核: ${auditedContent}篇
        </div>
      `
    }
  },
  legend: {
    data: ['活跃用户', '新增内容', '已审核内容'],
    bottom: '5%',
    textStyle: {
      color: '#909399',
      fontSize: 12
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    top: '10%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: props.activityData.map(item => {
      const date = new Date(item.date)
      return date.toLocaleDateString('zh-CN', { 
        month: '2-digit', 
        day: '2-digit' 
      })
    }),
    axisTick: { show: false },
    axisLine: {
      lineStyle: { color: '#e4e7ed' }
    },
    axisLabel: {
      color: '#909399',
      fontSize: 12
    }
  },
  yAxis: [
    {
      type: 'value',
      name: '用户数',
      position: 'left',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#909399',
        fontSize: 12,
        formatter: (value: number) => {
          if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'K'
          }
          return value.toString()
        }
      },
      splitLine: {
        lineStyle: { 
          color: '#f0f0f0',
          type: 'dashed'
        }
      }
    },
    {
      type: 'value',
      name: '内容数',
      position: 'right',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#909399',
        fontSize: 12
      },
      splitLine: { show: false }
    }
  ],
  series: [
    {
      name: '活跃用户',
      type: 'line',
      smooth: true,
      yAxisIndex: 0,
      data: props.activityData.map(item => item.activeUsers),
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        width: 3,
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color: '#667eea' },
            { offset: 1, color: '#764ba2' }
          ]
        }
      },
      itemStyle: {
        color: '#667eea',
        borderColor: '#fff',
        borderWidth: 2
      },
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
      data: props.activityData.map(item => item.newContent),
      barWidth: '40%',
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#52c41a' },
            { offset: 1, color: '#73d13d' }
          ]
        },
        borderRadius: [2, 2, 0, 0]
      }
    },
    {
      name: '已审核内容',
      type: 'line',
      smooth: true,
      yAxisIndex: 1,
      data: props.activityData.map(item => item.auditedContent),
      symbol: 'diamond',
      symbolSize: 5,
      lineStyle: {
        width: 2,
        color: '#faad14',
        type: 'dashed'
      },
      itemStyle: {
        color: '#faad14'
      }
    }
  ]
}))

// 方法
const handleTimeRangeChange = (range: string) => {
  if (range === props.activeTimeRange || props.loading) return
  emit('time-range-change', range)
}

const handleCategoryChange = (category: string) => {
  if (category === props.activeCategory || props.loading) return
  emit('category-change', category)
}

const handleRefresh = () => {
  emit('refresh')
}

const handleChartClick = (params: any) => {
  emit('chart-click', params)
}

const getDataRangeText = () => {
  if (!props.activityData || props.activityData.length === 0) {
    return '暂无数据'
  }
  
  const firstDate = props.activityData[0]?.date
  const lastDate = props.activityData[props.activityData.length - 1]?.date
  
  if (!firstDate || !lastDate) return '暂无数据'
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit'
    })
  }
  
  return `${formatDate(firstDate)} ~ ${formatDate(lastDate)}`
}

// 监听数据变化
watch(
  () => props.activityData,
  (newData) => {
    if (newData && newData.length > 0) {
      console.log('📊 活跃度图表数据更新:', newData.length, '个数据点')
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.activity-chart {
  margin-bottom: var(--spacing-xl);
}

.chart-card {
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

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  gap: var(--spacing-lg);
}

.chart-title-section {
  flex: 1;
  min-width: 0;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.chart-subtitle {
  display: block;
  line-height: 1.4;
}

.chart-time-note {
  display: block;
  line-height: 1.4;
  margin-top: var(--spacing-xs);
  font-weight: 500;
  color: var(--color-warning) !important;
}

.chart-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.chart-actions .el-button-group .el-button {
  font-size: 12px;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.chart-container {
  position: relative;
  min-height: 350px;
}

.chart-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  z-index: 10;
}

.chart-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 350px;
}

.chart-error-result {
  margin: 0;
}

.chart-error-result :deep(.el-result__icon) {
  margin-bottom: var(--spacing-sm);
}

.chart-error-result :deep(.el-result__title) {
  margin-bottom: var(--spacing-xs);
}

.chart-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 350px;
}

.chart-content {
  position: relative;
}

.chart-stats {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  background: var(--color-bg-light);
  border-top: 1px solid var(--color-border-light);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}

.stat-item {
  text-align: center;
}

.stat-item :deep(.el-statistic__head) {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.stat-item :deep(.el-statistic__content) {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .chart-actions {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }
  
  .chart-actions .el-select {
    width: 100% !important;
    margin-bottom: var(--spacing-sm);
  }
  
  .chart-stats {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .stat-item {
    width: 100%;
    padding: var(--spacing-sm) 0;
    border-bottom: 1px solid var(--color-border-light);
  }
  
  .stat-item:last-child {
    border-bottom: none;
  }
}

/* 图表动画 */
.chart-content {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
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