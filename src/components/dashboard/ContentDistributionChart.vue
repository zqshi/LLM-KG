<template>
  <el-card class="content-chart-card">
    <template #header>
      <div class="chart-header">
        <div class="header-left">
          <h3 class="chart-title">内容类型分布</h3>
          <el-text size="small" type="info" class="chart-subtitle">
            平台各类型内容的数量和占比分布
          </el-text>
          <el-text size="small" type="warning" class="chart-time-note">
            数据更新至{{ dataUpdateTime }}
          </el-text>
        </div>
        <div class="header-actions">
          <el-dropdown @command="handleExport" placement="bottom-end">
            <el-button size="small" :icon="Download" circle />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="png">
                  <el-icon><Picture /></el-icon>
                  导出图片
                </el-dropdown-item>
                <el-dropdown-item command="excel">
                  <el-icon><Document /></el-icon>
                  导出Excel
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          
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
        <div class="loading-content">
          <el-icon class="is-loading" size="40">
            <Loading />
          </el-icon>
          <p>正在加载数据...</p>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="chart-error">
        <el-result
          icon="error"
          title="数据加载失败"
          :sub-title="error"
        >
          <template #extra>
            <el-button type="primary" @click="handleRefresh">
              重新加载
            </el-button>
          </template>
        </el-result>
      </div>

      <!-- 空数据状态 -->
      <div v-else-if="!contentData || contentData.length === 0" class="chart-empty">
        <el-empty description="暂无内容数据" />
      </div>

      <!-- 图表和统计 -->
      <div v-else class="chart-content">
        <div class="chart-main">
          <!-- 饼图 -->
          <div class="chart-wrapper">
            <VChart
              ref="chartRef"
              :option="chartOption"
              :style="{ height: chartHeight }"
              :autoresize="true"
              @click="handleChartClick"
            />
          </div>

          <!-- 图表说明 -->
          <div class="chart-legend">
            <div
              v-for="item in contentData"
              :key="item.type"
              class="legend-item"
              @click="handleLegendClick(item)"
            >
              <div 
                class="legend-color"
                :style="{ backgroundColor: item.color }"
              ></div>
              <div class="legend-info">
                <span class="legend-name">{{ item.name }}</span>
                <div class="legend-stats">
                  <span class="legend-count">{{ item.count.toLocaleString() }}</span>
                  <span class="legend-percent">{{ item.percentage.toFixed(1) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 详细统计 -->
        <div class="content-stats">
          <div class="stats-header">
            <h4 class="stats-title">详细统计</h4>
            <el-tag type="info" size="small">
              总计: {{ totalCount.toLocaleString() }}篇
            </el-tag>
          </div>

          <div class="stats-grid">
            <div
              v-for="item in sortedContentData"
              :key="item.type"
              class="stat-item"
              :class="`stat-${item.type}`"
            >
              <div class="stat-header">
                <div class="stat-icon" :style="{ backgroundColor: item.color }">
                  <el-icon :size="18">
                    <component :is="getContentIcon(item.type)" />
                  </el-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-name">{{ item.name }}</span>
                  <span class="stat-trend" :class="getTrendClass(item.type)">
                    <el-icon size="12">
                      <component :is="getTrendIcon(item.type)" />
                    </el-icon>
                    {{ getTrendText(item.type) }}
                  </span>
                </div>
              </div>
              
              <div class="stat-metrics">
                <div class="metric-item">
                  <span class="metric-value">{{ item.count.toLocaleString() }}</span>
                  <span class="metric-label">总数</span>
                </div>
                <div class="metric-item">
                  <span class="metric-value">{{ item.percentage.toFixed(1) }}%</span>
                  <span class="metric-label">占比</span>
                </div>
                <div class="metric-item">
                  <span class="metric-value">{{ getGrowthRate(item.type) }}%</span>
                  <span class="metric-label">增长率</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 趋势分析 -->
        <div class="trend-analysis">
          <h5 class="analysis-title">
            <el-icon><TrendCharts /></el-icon>
            趋势分析
          </h5>
          <div class="analysis-content">
            <div class="analysis-item">
              <el-icon class="analysis-icon success">
                <ArrowUp />
              </el-icon>
              <span class="analysis-text">
                <strong>文章</strong>内容增长强劲，是平台主要内容来源
              </span>
            </div>
            <div class="analysis-item">
              <el-icon class="analysis-icon warning">
                <Minus />
              </el-icon>
              <span class="analysis-text">
                <strong>商品</strong>发布数量相对较少，可考虑加强推广
              </span>
            </div>
            <div class="analysis-item">
              <el-icon class="analysis-icon info">
                <InfoFilled />
              </el-icon>
              <span class="analysis-text">
                各类型内容分布相对均衡，平台生态健康
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { ContentDistribution } from '@/api/dashboard'
import {
  Download, Refresh, Loading, Picture, Document, 
  TrendCharts, ArrowUp, Minus, InfoFilled,
  ChatDotRound, Goods, EditPen, Collection
} from '@element-plus/icons-vue'

// Props 定义
interface Props {
  contentData?: ContentDistribution[]
  loading?: boolean
  error?: string | null
  chartHeight?: string
  timeRange?: string
  lastUpdateTime?: Date | string | null
}

const props = withDefaults(defineProps<Props>(), {
  contentData: () => [],
  loading: false,
  error: null,
  chartHeight: '300px',
  timeRange: '30d',
  lastUpdateTime: null
})

// Emits 定义
interface Emits {
  (e: 'refresh'): void
  (e: 'chart-click', data: any): void
  (e: 'legend-click', item: ContentDistribution): void
  (e: 'export', type: string): void
}

const emit = defineEmits<Emits>()

const router = useRouter()
const chartRef = ref()

// 内容类型图标映射
const contentIconMap = {
  'article': EditPen,
  'post': ChatDotRound,
  'product': Goods,
  'quote': Collection
} as any

// 模拟增长率数据
const growthRateMap = {
  'article': 18.5,
  'post': 12.3,
  'product': -3.2,
  'quote': 22.1,
  'news': 8.7
}

// 计算属性
const totalCount = computed(() => {
  if (!props.contentData || props.contentData.length === 0) return 0
  return props.contentData.reduce((sum, item) => sum + item.count, 0)
})

const dataUpdateTime = computed(() => {
  if (!props.lastUpdateTime) {
    // 如果没有提供时间，则显示默认的时间范围描述
    const timeRangeMap: Record<string, string> = {
      '7d': '最近7天',
      '30d': '最近30天',
      '90d': '最近90天'
    }
    return timeRangeMap[props.timeRange] || '最近30天'
  }

  // 格式化更新时间
  const date = new Date(props.lastUpdateTime)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\//g, '年').replace(/:/g, '时') + '分'
})

const sortedContentData = computed(() => {
  if (!props.contentData) return []
  return [...props.contentData].sort((a, b) => b.count - a.count)
})

const chartOption = computed(() => ({
  title: {
    show: false
  },
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#e4e7ed',
    borderWidth: 1,
    textStyle: {
      color: '#303133'
    },
    formatter: (params: any) => {
      return `
        <div style="font-weight: 600; margin-bottom: 8px;">${params.name}</div>
        <div style="margin-bottom: 4px;">数量: ${params.value.toLocaleString()}篇</div>
        <div>占比: ${params.percent.toFixed(1)}%</div>
      `
    }
  },
  legend: {
    show: false
  },
  series: [{
    name: '内容类型',
    type: 'pie',
    radius: ['45%', '75%'],
    center: ['50%', '50%'],
    avoidLabelOverlap: false,
    itemStyle: {
      borderRadius: 8,
      borderColor: '#fff',
      borderWidth: 3
    },
    label: {
      show: true,
      position: 'outside',
      formatter: '{b}\n{c}篇',
      fontSize: 12,
      color: '#606266'
    },
    labelLine: {
      show: true,
      length: 15,
      length2: 10,
      lineStyle: {
        color: '#e4e7ed'
      }
    },
    emphasis: {
      itemStyle: {
        shadowBlur: 20,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.3)'
      },
      label: {
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    data: props.contentData.map(item => ({
      value: item.count,
      name: item.name,
      itemStyle: { 
        color: item.color,
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.1)'
      }
    }))
  }],
  animationType: 'scale',
  animationEasing: 'elasticOut',
  animationDelay: (_idx: number) => Math.random() * 200
}))

// 方法
const getContentIcon = (type: string) => {
  return contentIconMap[type] || EditPen
}

const getGrowthRate = (type: string) => {
  return (growthRateMap as Record<string, number>)[type] || 0
}

const getTrendClass = (type: string) => {
  const rate = getGrowthRate(type)
  return rate > 0 ? 'trend-up' : rate < 0 ? 'trend-down' : 'trend-stable'
}

const getTrendIcon = (type: string) => {
  const rate = getGrowthRate(type)
  return rate > 0 ? ArrowUp : rate < 0 ? 'ArrowDown' : Minus
}

const getTrendText = (type: string) => {
  const rate = Math.abs(getGrowthRate(type))
  const direction = getGrowthRate(type) > 0 ? '上升' : getGrowthRate(type) < 0 ? '下降' : '持平'
  return `${direction} ${rate}%`
}

// 事件处理
const handleRefresh = () => {
  emit('refresh')
}

const handleChartClick = (params: any) => {
  emit('chart-click', params)
  
  // 根据点击的内容类型跳转到对应页面
  const typeRouteMap: Record<string, string> = {
    'article': '/content/list?type=article',
    'post': '/content/list?type=post',
    'product': '/flea-market/goods',
    'quote': '/quotation/list'
  }
  
  const route = typeRouteMap[params.data.name] || '/content/list'
  router.push(route)
}

const handleLegendClick = (item: ContentDistribution) => {
  emit('legend-click', item)
}

const handleExport = (type: string) => {
  emit('export', type)
  
  if (type === 'png') {
    // 导出图片
    const chart = chartRef.value?.getEchartsInstance()
    if (chart) {
      const url = chart.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#fff'
      })
      
      const link = document.createElement('a')
      link.download = '内容分布图.png'
      link.href = url
      link.click()
    }
  } else if (type === 'excel') {
    // 导出Excel数据
    console.log('导出Excel功能待实现')
  }
}
</script>

<style scoped>
.content-chart-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}

.header-left {
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

.header-actions {
  flex-shrink: 0;
  display: flex;
  gap: var(--spacing-xs);
}

.chart-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.chart-loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--color-text-secondary);
}

.chart-error {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.chart-main {
  display: flex;
  gap: var(--spacing-lg);
}

.chart-wrapper {
  flex: 1;
  min-width: 0;
}

.chart-legend {
  flex-shrink: 0;
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--color-bg-light);
  border-radius: var(--radius-lg);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-medium);
}

.legend-item:hover {
  background: var(--color-bg-card);
  box-shadow: var(--shadow-card);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-info {
  flex: 1;
  min-width: 0;
}

.legend-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.legend-stats {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.legend-count {
  font-weight: 600;
  color: var(--color-text-primary);
}

.legend-percent {
  color: var(--color-text-secondary);
}

.content-stats {
  background: var(--color-bg-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.stats-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-md);
}

.stat-item {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--color-border-light);
  transition: all var(--transition-medium);
}

.stat-item:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-card);
  transform: translateY(-2px);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-name {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 12px;
}

.stat-trend.trend-up {
  color: var(--color-success);
}

.stat-trend.trend-down {
  color: var(--color-danger);
}

.stat-trend.trend-stable {
  color: var(--color-info);
}

.stat-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.metric-item {
  text-align: center;
}

.metric-value {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.metric-label {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.trend-analysis {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--color-border-light);
}

.analysis-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.analysis-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.analysis-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  font-size: 14px;
  line-height: 1.5;
}

.analysis-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.analysis-icon.success {
  color: var(--color-success);
}

.analysis-icon.warning {
  color: var(--color-warning);
}

.analysis-icon.info {
  color: var(--color-info);
}

.analysis-text {
  flex: 1;
  color: var(--color-text-primary);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .chart-main {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .chart-legend {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    padding: var(--spacing-sm);
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
  
  .chart-wrapper {
    min-height: 300px;
  }
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: var(--spacing-xs);
  }
  
  .metric-item {
    padding: var(--spacing-sm);
    border-radius: var(--radius-md);
    background: var(--color-bg-light);
  }
}

/* 动画效果 */
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