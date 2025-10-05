<template>
  <div class="operation-dashboard">
    <UnifiedPageHeader 
      title="运营数据看板" 
      description="显示运营数据分析和统计信息"
    >
      <template #actions>
        <el-button @click="refreshData" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </template>
    </UnifiedPageHeader>

    <!-- 核心指标卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card class="stats-card" shadow="never">
          <div class="stats-content">
            <div class="stats-icon total">
              <el-icon><DataBoard /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ formatNumber(operationStats?.totalActivities || 0) }}</div>
              <div class="stats-label">总活动数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stats-card" shadow="never">
          <div class="stats-content">
            <div class="stats-icon today">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ operationStats?.todayActivities || 0 }}</div>
              <div class="stats-label">今日活动</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stats-card" shadow="never">
          <div class="stats-content">
            <div class="stats-icon pending">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ operationStats?.pendingReviews || 0 }}</div>
              <div class="stats-label">待审核</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stats-card" shadow="never">
          <div class="stats-content">
            <div class="stats-icon engagement">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ operationStats?.avgEngagementRate || 0 }}%</div>
              <div class="stats-label">平均参与率</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-section">
      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">活动参与趋势（近7天）</span>
              <el-button type="text" @click="loadActivityTrend">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </template>
          <div class="chart-container">
            <div v-if="trendLoading" class="chart-loading">
              <el-skeleton animated>
                <template #template>
                  <el-skeleton-item variant="image" style="width: 100%; height: 300px" />
                </template>
              </el-skeleton>
            </div>
            <div v-else-if="activityTrend.length > 0" class="chart-wrapper">
              <v-chart 
                class="chart" 
                :option="trendChartOption" 
                autoresize 
                theme="light"
              />
            </div>
            <div v-else class="chart-empty">
              <el-empty description="暂无数据" :image-size="80" />
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">内容类型分布</span>
              <el-button type="text" @click="loadContentTypeDistribution">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </template>
          <div class="chart-container">
            <div v-if="distributionLoading" class="chart-loading">
              <el-skeleton animated>
                <template #template>
                  <el-skeleton-item variant="image" style="width: 100%; height: 300px" />
                </template>
              </el-skeleton>
            </div>
            <div v-else-if="contentTypeDistribution.length > 0" class="chart-wrapper">
              <v-chart 
                class="chart" 
                :option="distributionChartOption" 
                autoresize 
                theme="light"
              />
            </div>
            <div v-else class="chart-empty">
              <el-empty description="暂无数据" :image-size="80" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 模块数据统计 -->
    <el-card class="module-stats-card" shadow="never">
      <template #header>
        <span class="card-title">各模块运营数据</span>
      </template>
      <el-row :gutter="16">
        <el-col :span="4" v-for="module in moduleStats" :key="module.key">
          <div class="module-item">
            <div class="module-icon">
              <el-icon size="24" :color="module.color">
                <component :is="module.icon" />
              </el-icon>
            </div>
            <div class="module-info">
              <div class="module-name">{{ module.name }}</div>
              <div class="module-count">{{ formatNumber(module.count) }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 热门内容 -->
    <el-card class="hot-content-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">热门运营内容 TOP5</span>
          <el-dropdown @command="handleHotContentPeriod">
            <el-button type="text">
              {{ hotContentPeriodText }}<el-icon><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="7">最近7天</el-dropdown-item>
                <el-dropdown-item command="30">最近30天</el-dropdown-item>
                <el-dropdown-item command="90">最近90天</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </template>
      <div class="hot-content-list">
        <div 
          class="hot-item" 
          v-for="(item, index) in hotContents" 
          :key="item.id"
        >
          <div class="hot-rank">{{ index + 1 }}</div>
          <div class="hot-info">
            <div class="hot-title">{{ item.title }}</div>
            <div class="hot-meta">
              <el-tag :type="getContentColor(item.type)" size="small">
                {{ getContentTypeName(item.type) }}
              </el-tag>
              <span class="hot-author">{{ item.author }}</span>
              <span class="hot-stats">
                <el-icon><View /></el-icon>{{ item.views }}
                <el-icon><Star /></el-icon>{{ item.likes }}
              </span>
            </div>
          </div>
          <div class="hot-score">{{ item.score }}</div>
        </div>
        <div v-if="hotContents.length === 0" class="empty-state">
          <el-empty description="暂无热门内容" :image-size="80" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import { ElMessage } from 'element-plus'
import {
  Refresh, DataBoard, Calendar, Clock, TrendCharts,
  ArrowDown, View, Star, House, StarFilled,
  Reading, ShoppingCart, ChatDotRound, Document
} from '@element-plus/icons-vue'

// 注册 echarts 组件
use([
  CanvasRenderer,
  LineChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
])

// 响应式数据
const loading = ref(false)
const trendLoading = ref(false)
const distributionLoading = ref(false)
const hotContentPeriod = ref(7)

const operationStats = ref({
  totalActivities: 1248,
  todayActivities: 23,
  pendingReviews: 5,
  avgEngagementRate: 68.5
})

const activityTrend = ref([
  { date: '2024-01-01', activities: 120, participants: 85 },
  { date: '2024-01-02', activities: 135, participants: 98 },
  { date: '2024-01-03', activities: 110, participants: 76 },
  { date: '2024-01-04', activities: 156, participants: 120 },
  { date: '2024-01-05', activities: 142, participants: 105 },
  { date: '2024-01-06', activities: 168, participants: 132 },
  { date: '2024-01-07', activities: 178, participants: 145 }
])

const contentTypeDistribution = ref([
  { type: 'recommendation', name: '推荐内容', value: 35 },
  { type: 'banner', name: 'Banner', value: 25 },
  { type: 'ai_tool', name: 'AI工具', value: 20 },
  { type: 'quote', name: '名言', value: 15 },
  { type: 'other', name: '其他', value: 5 }
])

const hotContents = ref([
  { id: 1, title: '2024年Q1优秀员工评选活动', type: 'recommendation', author: '运营部', views: 1245, likes: 89, score: 92 },
  { id: 2, title: '企业AI工具使用指南', type: 'ai_tool', author: '技术部', views: 987, likes: 67, score: 88 },
  { id: 3, title: '新年-banner设计大赛', type: 'banner', author: '设计部', views: 856, likes: 54, score: 85 },
  { id: 4, title: '领导力提升系列讲座', type: 'recommendation', author: '人事部', views: 743, likes: 48, score: 82 },
  { id: 5, title: '每日一句名人名言', type: 'quote', author: '文化部', views: 621, likes: 39, score: 78 }
])

// 计算属性
const hotContentPeriodText = computed(() => {
  const periodMap: Record<number, string> = {
    7: '最近7天',
    30: '最近30天', 
    90: '最近90天'
  }
  return periodMap[hotContentPeriod.value] || '最近7天'
})

const trendChartOption = computed(() => {
  const dates = activityTrend.value.map(item => item.date)
  const activitiesData = activityTrend.value.map(item => item.activities)
  
  return {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['活动数']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '活动数',
        type: 'line',
        data: activitiesData,
        smooth: true,
        areaStyle: {
          opacity: 0.1
        },
        lineStyle: {
          width: 2
        }
      }
    ]
  }
})

const distributionChartOption = computed(() => {
  const data = contentTypeDistribution.value.map(item => ({
    name: item.name,
    value: item.value
  }))
  
  return {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: '0%',
      left: 'center'
    },
    series: [
      {
        name: '内容类型分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data
      }
    ]
  }
})

const moduleStats = computed(() => {
  return [
    {
      key: 'recommendations',
      name: '推荐管理',
      count: 45,
      icon: 'Star',
      color: '#409EFF'
    },
    {
      key: 'banners',
      name: 'Banner管理',
      count: 23,
      icon: 'Picture',
      color: '#67C23A'
    },
    {
      key: 'ai-tools',
      name: 'AI工具',
      count: 18,
      icon: 'Tools',
      color: '#E6A23C'
    },
    {
      key: 'quotes',
      name: '名言管理',
      count: 67,
      icon: 'ChatDotRound',
      color: '#F56C6C'
    },
    {
      key: 'homepage',
      name: '首页配置',
      count: 12,
      icon: 'House',
      color: '#909399'
    },
    {
      key: 'rankings',
      name: '榜单管理',
      count: 8,
      icon: 'TrendCharts',
      color: '#67C23A'
    }
  ]
})

// 方法
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num.toString()
}

const getContentTypeName = (type: string): string => {
  const typeMap: Record<string, string> = {
    recommendation: '推荐内容',
    banner: 'Banner',
    ai_tool: 'AI工具',
    quote: '名言',
    other: '其他'
  }
  return typeMap[type] || type
}

const getContentColor = (type: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' => {
  const colorMap: Record<string, 'primary' | 'success' | 'info' | 'warning' | 'danger'> = {
    recommendation: 'primary',
    banner: 'success',
    ai_tool: 'warning',
    quote: 'info',
    other: 'danger'
  }
  return colorMap[type] || 'info'
}

const refreshData = async () => {
  await Promise.all([
    loadOperationStats(),
    loadActivityTrend(),
    loadContentTypeDistribution()
  ])
}

const loadOperationStats = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    // 实际应该调用API获取数据
    // const response = await operationApi.getStats()
    // operationStats.value = response.data
  } catch (error) {
    console.error('获取运营统计数据失败:', error)
    ElMessage.error('获取运营统计数据失败')
  } finally {
    loading.value = false
  }
}

const loadActivityTrend = async () => {
  trendLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    // 实际应该调用API获取数据
    // const response = await operationApi.getActivityTrend()
    // activityTrend.value = response.data
  } catch (error) {
    console.error('获取活动趋势数据失败:', error)
    ElMessage.error('获取活动趋势数据失败')
  } finally {
    trendLoading.value = false
  }
}

const loadContentTypeDistribution = async () => {
  distributionLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    // 实际应该调用API获取数据
    // const response = await operationApi.getContentTypeDistribution()
    // contentTypeDistribution.value = response.data
  } catch (error) {
    console.error('获取内容类型分布数据失败:', error)
    ElMessage.error('获取内容类型分布数据失败')
  } finally {
    distributionLoading.value = false
  }
}

const handleHotContentPeriod = (days: string) => {
  hotContentPeriod.value = parseInt(days)
  // 实际应该重新加载热门内容数据
  ElMessage.info(`切换到${hotContentPeriod.value}天数据`)
}

// 生命周期
onMounted(() => {
  refreshData()
})
</script>

<style scoped lang="scss">
@import '@/styles/operation-styles.scss';

.operation-dashboard {
  padding: var(--spacing-xl);
}

.stats-row {
  margin-bottom: var(--spacing-xl);

  .stats-content {
    display: flex;
    align-items: center;
    min-height: 80px;
    position: relative;
  }

  .stats-icon {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: var(--spacing-lg);
    color: var(--color-white);
    font-size: 20px;

    &.total {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &.today {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    &.pending {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    &.engagement {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }
  }

  .stats-info {
    flex: 1;
    overflow: hidden;

    .stats-value {
      font-size: var(--text-2xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      line-height: 1;
    }

    .stats-label {
      color: var(--color-text-secondary);
      font-size: var(--text-sm);
      margin-top: var(--spacing-xs);
    }
  }
}

.charts-section {
  margin-bottom: var(--spacing-xl);
}

.chart-card {
  min-height: 350px;

  ::v-deep(.el-card__header) {
    border-bottom: 1px solid var(--color-border-light);
    background-color: var(--color-bg-elevated);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.chart-container {
  height: 300px;
  position: relative;

  .chart-wrapper {
    height: 100%;
    width: 100%;
  }

  .chart-loading,
  .chart-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
}

.module-stats-card {
  margin-bottom: var(--spacing-xl);

  .el-row {
    margin: 0;
  }

  .el-col {
    padding: 0 var(--spacing-sm);
  }
}

.module-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-xl) var(--spacing-lg);
  background: linear-gradient(135deg, var(--color-bg-section) 0%, var(--color-bg-card) 100%);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-light);
  height: 80px;
}

.module-icon {
  width: 40px;
  height: 40px;
  margin-right: var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: var(--radius-md);
  flex-shrink: 0;

  .el-icon {
    font-size: 20px !important;
    width: 20px;
    height: 20px;
  }
}

.module-info {
  flex: 1;
  overflow: hidden;

  .module-name {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-xs);
    font-weight: var(--font-weight-medium);
    line-height: 1;
  }

  .module-count {
    font-size: var(--text-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    line-height: 1;
  }
}

.hot-content-card {
  margin-bottom: var(--spacing-xl);

  ::v-deep(.el-card__header) {
    border-bottom: 1px solid var(--color-border-light);
    background-color: var(--color-bg-elevated);
  }
}

.hot-content-list {
  padding: var(--spacing-sm) 0;
}

.hot-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--color-border-light);

  &:last-child {
    border-bottom: none;
  }
}

.hot-rank {
  width: 24px;
  height: 24px;
  background: var(--color-bg-section);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-semibold);
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin-right: var(--spacing-md);
}

.hot-rank:nth-child(1) {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: var(--color-white);
}

.hot-info {
  flex: 1;
  overflow: hidden;

  .hot-title {
    font-size: var(--text-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-xs);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .hot-meta {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
  }
}

.hot-author {
  color: var(--color-text-secondary);
}

.hot-stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.hot-stats .el-icon {
  font-size: var(--text-xs);
}

.hot-score {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-warning);
}

.empty-state {
  padding: var(--spacing-2xl) 0;
  text-align: center;
}

// 响应式设计
@media (max-width: 768px) {
  .operation-dashboard {
    padding: var(--spacing-md);
  }

  .stats-row .el-col {
    width: 50% !important;
    max-width: 50% !important;
    flex: 0 0 50% !important;
    margin-bottom: var(--spacing-md);
  }

  .module-stats-card {
    .el-col {
      margin-bottom: var(--spacing-md);
    }
  }

  .module-item {
    height: 70px;
    padding: var(--spacing-md);

    .module-icon {
      width: 36px;
      height: 36px;

      .el-icon {
        font-size: 16px !important;
        width: 16px;
        height: 16px;
      }
    }

    .module-name {
      font-size: var(--text-xs);
    }

    .module-count {
      font-size: var(--text-lg);
    }
  }
}

@media (max-width: 576px) {
  .stats-row .el-col {
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 100% !important;
    margin-bottom: var(--spacing-md);
  }

  .module-stats-card {
    .el-row {
      flex-direction: column;
    }

    .el-col {
      width: 100% !important;
      max-width: 100% !important;
      flex: 0 0 100% !important;
      margin-bottom: var(--spacing-sm);
    }
  }
}
</style>
