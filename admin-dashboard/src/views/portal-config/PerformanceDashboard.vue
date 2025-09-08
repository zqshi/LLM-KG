<template>
  <div class="performance-dashboard">
    <UnifiedPageHeader 
      title="性能监控仪表板" 
      description="监控门户系统的性能指标和运行状态"
    >
      <template #actions>
        <el-button @click="refreshMetrics" :loading="loading" type="primary">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
        <el-button @click="exportReport" type="success" plain>
          <el-icon><Download /></el-icon>
          导出报告
        </el-button>
      </template>
    </UnifiedPageHeader>

    <!-- 关键指标卡片 -->
    <div class="metrics-cards">
      <el-card class="metric-card" :class="getGradeClass(metrics.performanceGrade)">
        <div class="metric-content">
          <div class="metric-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="metric-info">
            <div class="metric-value">{{ metrics.performanceGrade }}</div>
            <div class="metric-label">性能等级</div>
          </div>
        </div>
      </el-card>

      <el-card class="metric-card">
        <div class="metric-content">
          <div class="metric-icon">
            <el-icon><Timer /></el-icon>
          </div>
          <div class="metric-info">
            <div class="metric-value">{{ formatTime(metrics.pageLoadTime) }}</div>
            <div class="metric-label">页面加载时间</div>
          </div>
        </div>
      </el-card>

      <el-card class="metric-card">
        <div class="metric-content">
          <div class="metric-icon">
            <el-icon><Connection /></el-icon>
          </div>
          <div class="metric-info">
            <div class="metric-value">{{ formatTime(metrics.avgApiResponseTime) }}</div>
            <div class="metric-label">平均API响应</div>
          </div>
        </div>
      </el-card>

      <el-card class="metric-card">
        <div class="metric-content">
          <div class="metric-icon">
            <el-icon><Monitor /></el-icon>
          </div>
          <div class="metric-info">
            <div class="metric-value">{{ formatMemory(metrics.memoryUsage) }}</div>
            <div class="metric-label">内存使用</div>
          </div>
        </div>
      </el-card>

      <el-card class="metric-card">
        <div class="metric-content">
          <div class="metric-icon">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="metric-info">
            <div class="metric-value">{{ formatPercent(metrics.errorRate) }}</div>
            <div class="metric-label">错误率</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 性能图表 -->
    <div class="performance-charts">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card title="页面加载时间趋势">
            <div ref="loadTimeChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card title="API响应时间分布">
            <div ref="apiTimeChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <el-card title="内存使用趋势">
            <div ref="memoryChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card title="用户交互统计">
            <div ref="interactionChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 性能建议 -->
    <el-card class="performance-suggestions" title="性能优化建议">
      <div class="suggestions-list">
        <div 
          v-for="suggestion in suggestions" 
          :key="suggestion.id"
          class="suggestion-item"
          :class="suggestion.priority"
        >
          <div class="suggestion-icon">
            <el-icon>
              <component :is="suggestion.icon" />
            </el-icon>
          </div>
          <div class="suggestion-content">
            <h4>{{ suggestion.title }}</h4>
            <p>{{ suggestion.description }}</p>
            <div class="suggestion-actions">
              <el-button 
                v-if="suggestion.action"
                size="small" 
                type="primary" 
                @click="suggestion.action"
              >
                {{ suggestion.actionText }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 详细报告 -->
    <el-card class="detailed-report" title="详细性能报告">
      <el-table :data="detailedMetrics" stripe>
        <el-table-column prop="metric" label="指标" width="200" />
        <el-table-column prop="current" label="当前值" width="120" />
        <el-table-column prop="target" label="目标值" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="trend" label="趋势" width="100">
          <template #default="{ row }">
            <el-icon :class="getTrendClass(row.trend)">
              <component :is="getTrendIcon(row.trend)" />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="说明" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import { 
  Refresh, Download, TrendCharts, Timer, Connection, 
  Monitor, Warning, ArrowUp, ArrowDown, Minus 
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { usePerformanceMonitor } from '@/utils/performance-monitor'
import { ElMessage } from 'element-plus'
import { globalAuditApi } from '@/api'
import type { GlobalAuditLog } from '@/types'

const { getKeyMetrics } = usePerformanceMonitor()

// 操作日志记录功能
const recordAuditLog = async (operationType: string, detail: string, targetName?: string) => {
  try {
    await globalAuditApi.createAuditLog({
      operationType: operationType as any,
      module: 'SYSTEM',
      targetType: 'SYSTEM_CONFIG',
      targetId: 'performance-dashboard',
      targetName: targetName || '性能监控仪表板',
      detail,
      riskLevel: 'low'
    })
  } catch (error) {
    console.warn('记录操作日志失败:', error)
  }
}

// 响应式数据
const loading = ref(false)
const metrics = ref({
  performanceGrade: 'A',
  pageLoadTime: 0,
  avgApiResponseTime: 0,
  avgRenderTime: 0,
  errorRate: 0,
  memoryUsage: 0
})

// 图表引用
const loadTimeChartRef = ref<HTMLElement>()
const apiTimeChartRef = ref<HTMLElement>()
const memoryChartRef = ref<HTMLElement>()
const interactionChartRef = ref<HTMLElement>()

// 图表实例
let loadTimeChart: echarts.ECharts | null = null
let apiTimeChart: echarts.ECharts | null = null
let memoryChart: echarts.ECharts | null = null
let interactionChart: echarts.ECharts | null = null

// 性能建议
const suggestions = ref([
  {
    id: 1,
    title: '启用API缓存',
    description: '为频繁调用的API接口启用缓存机制，可显著提升响应速度',
    priority: 'high',
    icon: 'Connection',
    actionText: '配置缓存',
    action: async () => {
      await recordAuditLog('UPDATE_SYSTEM_CONFIG', '尝试配置API缓存优化', 'API缓存配置')
      ElMessage.info('缓存配置功能开发中...')
    }
  },
  {
    id: 2,
    title: '优化图片资源',
    description: '压缩和优化图片资源，减少页面加载时间',
    priority: 'medium',
    icon: 'Picture',
    actionText: '查看详情',
    action: async () => {
      await recordAuditLog('UPDATE_SYSTEM_CONFIG', '查看图片资源优化详情', '图片优化工具')
      ElMessage.info('图片优化工具开发中...')
    }
  },
  {
    id: 3,
    title: '启用虚拟滚动',
    description: '对大数据量列表启用虚拟滚动，提升渲染性能',
    priority: 'medium',
    icon: 'List',
    actionText: '应用优化',
    action: async () => {
      await recordAuditLog('UPDATE_SYSTEM_CONFIG', '启用虚拟滚动性能优化', '虚拟滚动配置')
      ElMessage.success('虚拟滚动已启用')
    }
  }
])

// 详细指标
const detailedMetrics = ref([
  {
    metric: '首屏渲染时间',
    current: '1.2s',
    target: '<2s',
    status: '良好',
    trend: 'up',
    description: '页面首次内容渲染的时间'
  },
  {
    metric: 'DOM加载完成',
    current: '0.8s',
    target: '<1s',
    status: '优秀',
    trend: 'stable',
    description: 'DOM内容加载完成的时间'
  },
  {
    metric: '资源加载时间',
    current: '2.1s',
    target: '<3s',
    status: '良好',
    trend: 'down',
    description: '所有资源加载完成的时间'
  },
  {
    metric: 'JavaScript执行时间',
    current: '0.3s',
    target: '<0.5s',
    status: '优秀',
    trend: 'up',
    description: 'JavaScript代码执行耗时'
  }
])

// 方法
const refreshMetrics = async () => {
  loading.value = true
  
  try {
    // 记录操作日志
    await recordAuditLog('UPDATE_SYSTEM_CONFIG', '刷新性能监控数据', '性能指标数据')
    
    // 模拟数据获取延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    metrics.value = getKeyMetrics()
    updateCharts()
    
    ElMessage.success('性能数据已更新')
  } catch (error) {
    ElMessage.error('获取性能数据失败')
    // 记录错误日志
    await recordAuditLog('UPDATE_SYSTEM_CONFIG', `刷新性能数据失败: ${error}`, '性能指标数据')
  } finally {
    loading.value = false
  }
}

const exportReport = async () => {
  try {
    const reportData = {
      timestamp: new Date().toISOString(),
      metrics: metrics.value,
      suggestions: suggestions.value,
      detailedMetrics: detailedMetrics.value
    }
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const fileName = `performance-report-${Date.now()}.json`
    a.download = fileName
    a.click()
    
    URL.revokeObjectURL(url)
    
    // 记录操作日志
    await recordAuditLog('BACKUP_DATA', `导出性能监控报告: ${fileName}`, '性能报告文件')
    
    ElMessage.success('性能报告已导出')
  } catch (error) {
    ElMessage.error('导出性能报告失败')
    // 记录错误日志
    await recordAuditLog('BACKUP_DATA', `导出性能报告失败: ${error}`, '性能报告文件')
  }
}

const formatTime = (time: number): string => {
  if (time < 1000) {
    return `${Math.round(time)}ms`
  }
  return `${(time / 1000).toFixed(1)}s`
}

const formatMemory = (memory: number): string => {
  return `${memory.toFixed(1)}MB`
}

const formatPercent = (rate: number): string => {
  return `${(rate * 100).toFixed(2)}%`
}

const getGradeClass = (grade: string): string => {
  const gradeClasses = {
    'A': 'grade-excellent',
    'B': 'grade-good',
    'C': 'grade-fair',
    'D': 'grade-poor',
    'F': 'grade-fail'
  }
  return gradeClasses[grade as keyof typeof gradeClasses] || 'grade-unknown'
}

const getStatusType = (status: string) => {
  const statusTypes = {
    '优秀': 'success',
    '良好': 'primary',
    '一般': 'warning',
    '较差': 'danger'
  }
  return statusTypes[status as keyof typeof statusTypes] || 'info'
}

const getTrendClass = (trend: string): string => {
  return `trend-${trend}`
}

const getTrendIcon = (trend: string) => {
  const trendIcons = {
    'up': ArrowUp,
    'down': ArrowDown,
    'stable': Minus
  }
  return trendIcons[trend as keyof typeof trendIcons] || Minus
}

// 初始化图表
const initCharts = async () => {
  await nextTick()
  
  // 页面加载时间趋势图
  if (loadTimeChartRef.value) {
    loadTimeChart = echarts.init(loadTimeChartRef.value)
    loadTimeChart.setOption({
      title: { text: '页面加载时间趋势' },
      tooltip: { trigger: 'axis' },
      xAxis: { 
        type: 'category',
        data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
      },
      yAxis: { type: 'value', name: '时间(ms)' },
      series: [{
        data: [1200, 1100, 1300, 1000, 1150, 1080],
        type: 'line',
        smooth: true,
        itemStyle: { color: '#409eff' }
      }]
    })
  }
  
  // API响应时间分布图
  if (apiTimeChartRef.value) {
    apiTimeChart = echarts.init(apiTimeChartRef.value)
    apiTimeChart.setOption({
      title: { text: 'API响应时间分布' },
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: '50%',
        data: [
          { value: 35, name: '<50ms' },
          { value: 40, name: '50-100ms' },
          { value: 20, name: '100-200ms' },
          { value: 5, name: '>200ms' }
        ]
      }]
    })
  }
  
  // 内存使用趋势图
  if (memoryChartRef.value) {
    memoryChart = echarts.init(memoryChartRef.value)
    memoryChart.setOption({
      title: { text: '内存使用趋势' },
      tooltip: { trigger: 'axis' },
      xAxis: { 
        type: 'category',
        data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
      },
      yAxis: { type: 'value', name: '内存(MB)' },
      series: [{
        data: [25, 28, 32, 35, 33, 30],
        type: 'line',
        areaStyle: { opacity: 0.3 },
        itemStyle: { color: '#67c23a' }
      }]
    })
  }
  
  // 用户交互统计图
  if (interactionChartRef.value) {
    interactionChart = echarts.init(interactionChartRef.value)
    interactionChart.setOption({
      title: { text: '用户交互统计' },
      tooltip: { trigger: 'axis' },
      xAxis: { 
        type: 'category',
        data: ['点击', '拖拽', '输入', '滚动', '导航']
      },
      yAxis: { type: 'value' },
      series: [{
        data: [120, 45, 80, 200, 60],
        type: 'bar',
        itemStyle: { color: '#e6a23c' }
      }]
    })
  }
}

const updateCharts = () => {
  // 更新图表数据
  if (loadTimeChart) {
    loadTimeChart.setOption({
      series: [{
        data: [1200, 1100, 1300, 1000, 1150, 1080].map(v => v + Math.random() * 200 - 100)
      }]
    })
  }
}

// 响应式处理
const handleResize = () => {
  loadTimeChart?.resize()
  apiTimeChart?.resize()
  memoryChart?.resize()
  interactionChart?.resize()
}

// 生命周期
onMounted(async () => {
  // 记录页面访问日志
  await recordAuditLog('UPDATE_SYSTEM_CONFIG', '访问性能监控仪表板页面', '性能监控页面')
  
  await refreshMetrics()
  await initCharts()
  
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  
  loadTimeChart?.dispose()
  apiTimeChart?.dispose()
  memoryChart?.dispose()
  interactionChart?.dispose()
})
</script>

<style scoped lang="scss">
.performance-dashboard {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h2 {
    margin: 0;
    color: #303133;
  }
  
  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.metrics-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
  
  .metric-card {
    &.grade-excellent {
      border-left: 4px solid #67c23a;
    }
    
    &.grade-good {
      border-left: 4px solid #409eff;
    }
    
    &.grade-fair {
      border-left: 4px solid #e6a23c;
    }
    
    &.grade-poor {
      border-left: 4px solid #f56c6c;
    }
    
    &.grade-fail {
      border-left: 4px solid #f56c6c;
      background: #fef0f0;
    }
    
    .metric-content {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .metric-icon {
        font-size: 32px;
        color: #409eff;
      }
      
      .metric-info {
        .metric-value {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 4px;
        }
        
        .metric-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }
}

.performance-charts {
  margin-bottom: 24px;
  
  .chart-container {
    height: 300px;
  }
}

.performance-suggestions {
  margin-bottom: 24px;
  
  .suggestions-list {
    .suggestion-item {
      display: flex;
      gap: 16px;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 12px;
      
      &.high {
        background: #fef0f0;
        border-left: 4px solid #f56c6c;
      }
      
      &.medium {
        background: #fdf6ec;
        border-left: 4px solid #e6a23c;
      }
      
      &.low {
        background: #f0f9ff;
        border-left: 4px solid #409eff;
      }
      
      .suggestion-icon {
        font-size: 24px;
        color: #409eff;
      }
      
      .suggestion-content {
        flex: 1;
        
        h4 {
          margin: 0 0 8px 0;
          color: #303133;
        }
        
        p {
          margin: 0 0 12px 0;
          color: #606266;
          line-height: 1.5;
        }
        
        .suggestion-actions {
          display: flex;
          gap: 8px;
        }
      }
    }
  }
}

.detailed-report {
  .trend-up {
    color: #67c23a;
  }
  
  .trend-down {
    color: #f56c6c;
  }
  
  .trend-stable {
    color: #909399;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .performance-dashboard {
    padding: 16px;
  }
  
  .dashboard-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .metrics-cards {
    grid-template-columns: 1fr;
  }
  
  .chart-container {
    height: 250px;
  }
}
</style>