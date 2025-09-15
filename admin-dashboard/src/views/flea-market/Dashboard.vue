<template>
  <div class="flea-market-dashboard">
    <UnifiedPageHeader 
      title="跳蚤市场数据看板" 
      description="查看跳蚤市场的运营数据和统计信息"
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
        <el-card class="stats-card" shadow="hover">
          <div class="stats-content">
            <div class="stats-icon total">
              <el-icon><ShoppingCart /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ formatNumber(statistics?.totalGoods || 0) }}</div>
              <div class="stats-label">商品总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stats-card" shadow="hover">
          <div class="stats-content">
            <div class="stats-icon today">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ statistics?.todayNewGoods || 0 }}</div>
              <div class="stats-label">今日新增</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card 
          class="stats-card pending-card" 
          shadow="hover"
          @click="goToPendingList"
        >
          <div class="stats-content clickable">
            <div class="stats-icon pending">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ statistics?.pendingGoods || 0 }}</div>
              <div class="stats-label">待审商品</div>
            </div>
            <div class="stats-action">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stats-card" shadow="hover">
          <div class="stats-content">
            <div class="stats-icon sales">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ formatNumber(statistics?.totalSales || 0) }}</div>
              <div class="stats-label">总交易数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-section">
      <el-col :span="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">商品发布趋势（近7天）</span>
              <el-button type="text" @click="loadViewTrend">
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
            <div v-else-if="viewTrend.length > 0" class="chart-wrapper">
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
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">热门分类统计</span>
              <el-button type="text" @click="loadPopularCategories">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </template>
          <div class="chart-container">
            <div v-if="categoryLoading" class="chart-loading">
              <el-skeleton animated>
                <template #template>
                  <el-skeleton-item variant="image" style="width: 100%; height: 300px" />
                </template>
              </el-skeleton>
            </div>
            <div v-else-if="popularCategories.length > 0" class="category-stats">
              <div class="category-item" v-for="item in popularCategories" :key="item.categoryId">
                <div class="category-info">
                  <div class="category-name">{{ item.categoryName }}</div>
                  <div class="category-count">{{ item.count }}</div>
                </div>
                <div class="category-progress">
                  <el-progress 
                    :percentage="item.percentage" 
                    :color="getCategoryColor(item.categoryId)"
                    :show-text="false"
                  />
                </div>
              </div>
            </div>
            <div v-else class="chart-empty">
              <el-empty description="暂无数据" :image-size="80" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 模块数据统计 -->
    <el-card class="module-stats-card" shadow="hover">
      <template #header>
        <span class="card-title">运营数据概览</span>
      </template>
      <el-row :gutter="16">
        <el-col :span="6">
          <div class="module-item">
            <div class="module-icon">
              <el-icon size="24" color="#409EFF">
                <User />
              </el-icon>
            </div>
            <div class="module-info">
              <div class="module-name">总用户数</div>
              <div class="module-count">{{ formatNumber(statistics?.totalUsers || 0) }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="module-item">
            <div class="module-icon">
              <el-icon size="24" color="#67C23A">
                <UserFilled />
              </el-icon>
            </div>
            <div class="module-info">
              <div class="module-name">活跃用户</div>
              <div class="module-count">{{ formatNumber(statistics?.activeUsers || 0) }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="module-item">
            <div class="module-icon">
              <el-icon size="24" color="#E6A23C">
                <PriceTag />
              </el-icon>
            </div>
            <div class="module-info">
              <div class="module-name">平均价格</div>
              <div class="module-count">￥{{ statistics?.averagePrice?.toFixed(1) || 0 }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="module-item">
            <div class="module-icon">
              <el-icon size="24" color="#F56C6C">
                <Warning />
              </el-icon>
            </div>
            <div class="module-info">
              <div class="module-name">待处理举报</div>
              <div class="module-count">{{ statistics?.pendingReports || 0 }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
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
import { fleaMarketApi } from '@/api/fleaMarket'
import type { FleaMarketStatistics } from '@/types'
import {
  Refresh, ShoppingCart, Calendar, Clock, TrendCharts, ArrowRight,
  User, UserFilled, PriceTag, Warning
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

const router = useRouter()

// 响应式数据
const statistics = ref<FleaMarketStatistics | null>(null)
const viewTrend = ref<{date: string, views: number, goods: number}[]>([])
const popularCategories = ref<{categoryId: number, categoryName: string, count: number, percentage: number}[]>([])
const loading = ref(false)
const trendLoading = ref(false)
const categoryLoading = ref(false)

// 计算属性
const trendChartOption = computed(() => {
  const dates = viewTrend.value.map(item => item.date)
  const goodsData = viewTrend.value.map(item => item.goods)
  
  return {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['新增商品数']
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
        name: '新增商品数',
        type: 'line',
        data: goodsData,
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

// 方法
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num.toString()
}

const getCategoryColor = (categoryId: number): string => {
  const colorMap: Record<number, string> = {
    1: '#409EFF',
    2: '#67C23A',
    3: '#E6A23C',
    4: '#F56C6C',
    5: '#909399'
  }
  return colorMap[categoryId] || '#409EFF'
}

const refreshData = async () => {
  await Promise.all([
    loadStatistics(),
    loadViewTrend(),
    loadPopularCategories()
  ])
}

const loadStatistics = async () => {
  loading.value = true
  try {
    const response = await fleaMarketApi.statistics.overview()
    if (response.code === 200) {
      statistics.value = response.data
    } else {
      throw new Error(response.message || '获取统计数据失败')
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  } finally {
    loading.value = false
  }
}

const loadViewTrend = async () => {
  trendLoading.value = true
  try {
    const response = await fleaMarketApi.statistics.viewTrend({
      interval: 'day'
    })
    if (response.code === 200) {
      viewTrend.value = response.data
    } else {
      throw new Error(response.message || '获取趋势数据失败')
    }
  } catch (error) {
    console.error('获取趋势数据失败:', error)
    ElMessage.error('获取趋势数据失败')
  } finally {
    trendLoading.value = false
  }
}

const loadPopularCategories = async () => {
  categoryLoading.value = true
  try {
    const response = await fleaMarketApi.statistics.popularCategories(5)
    if (response.code === 200) {
      // 计算百分比
      const total = response.data.reduce((sum, item) => sum + item.count, 0)
      popularCategories.value = response.data.map(item => ({
        ...item,
        percentage: total > 0 ? Math.round((item.count / total) * 100) : 0
      }))
    } else {
      throw new Error(response.message || '获取分类数据失败')
    }
  } catch (error) {
    console.error('获取分类数据失败:', error)
    ElMessage.error('获取分类数据失败')
  } finally {
    categoryLoading.value = false
  }
}

const goToPendingList = () => {
  router.push({
    name: 'FleaMarketGoods',
    query: { status: 'pending' }
  })
}

// 生命周期
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.flea-market-dashboard {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  min-height: 80px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .stats-content {
    display: flex;
    align-items: center;
    min-height: 80px;
    position: relative;

    &.clickable {
      cursor: pointer;
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.8);
        border-radius: 4px;
      }
    }
  }

  .stats-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    color: #fff;
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

    &.sales {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }
  }

  .stats-info {
    flex: 1;
    overflow: hidden;
  }

  .stats-value {
    font-size: 24px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    line-height: 1;
  }

  .stats-label {
    color: var(--el-text-color-secondary);
    font-size: 14px;
    margin-top: 4px;
  }

  .stats-action {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--el-text-color-secondary);
    transition: all 0.2s;
    
    .el-icon {
      font-size: 16px;
    }
  }
}

.pending-card {
  cursor: pointer;
  
  &:hover {
    .stats-content {
      background: linear-gradient(135deg, rgba(240, 147, 251, 0.08) 0%, rgba(245, 87, 108, 0.08) 100%);
    }
    
    .stats-action {
      color: var(--el-color-primary);
      transform: translateY(-50%) translateX(2px);
    }
  }
  
  &:active {
    transform: translateY(-1px);
  }
}

.charts-section {
  margin-bottom: 20px;
}

.chart-card {
  min-height: 350px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-weight: 600;
  color: #303133;
}

.chart-container {
  height: 300px;
  position: relative;
}

.chart-wrapper {
  height: 100%;
  width: 100%;
}

.chart {
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

.category-stats {
  padding: 10px 0;
}

.category-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.category-item:last-child {
  margin-bottom: 0;
}

.category-info {
  width: 100px;
  margin-right: 16px;
}

.category-name {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.category-count {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.category-progress {
  flex: 1;
}

.module-stats-card {
  margin-bottom: 20px;
  
  .el-row {
    margin: 0;
  }
  
  .el-col {
    padding: 0 8px;
  }
}

.module-item {
  display: flex;
  align-items: center;
  padding: 20px 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid #e4e7ed;
  height: 80px;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    border-color: #c0c4cc;
  }
}

.module-icon {
  width: 40px;
  height: 40px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
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
}

.module-name {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin-bottom: 4px;
  font-weight: 500;
  line-height: 1;
}

.module-count {
  font-size: 22px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  line-height: 1;
}

@media (max-width: 768px) {
  .stats-row .el-col {
    width: 50% !important;
    max-width: 50% !important;
    flex: 0 0 50% !important;
    margin-bottom: 16px;
  }
  
  .module-stats-card {
    .el-col {
      margin-bottom: 12px;
    }
  }
  
  .module-item {
    height: 70px;
    padding: 12px;
    
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
      font-size: 12px;
    }
    
    .module-count {
      font-size: 18px;
    }
  }
}

@media (max-width: 576px) {
  .stats-row .el-col {
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 100% !important;
    margin-bottom: 12px;
  }
  
  .module-stats-card {
    .el-row {
      flex-direction: column;
    }
    
    .el-col {
      width: 100% !important;
      max-width: 100% !important;
      flex: 0 0 100% !important;
      margin-bottom: 8px;
    }
  }
}
</style>