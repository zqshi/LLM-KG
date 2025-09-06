<template>
  <div class="performance-monitor">
    <el-row :gutter="20">
      <!-- 概览卡片 -->
      <el-col :span="24">
        <el-card class="overview-card">
          <template #header>
            <span>性能监控概览</span>
            <el-button 
              type="text" 
              style="float: right; padding: 3px 0" 
              @click="refreshAll"
              :loading="refreshing"
            >
              刷新
            </el-button>
          </template>
          <el-row :gutter="16">
            <el-col :span="6">
              <el-statistic 
                title="平均响应时间" 
                :value="metrics.averageResponseTime" 
                suffix="ms"
                :value-style="{ color: metrics.averageResponseTime > 1000 ? '#f56c6c' : '#67c23a' }"
              />
            </el-col>
            <el-col :span="6">
              <el-statistic 
                title="吞吐量" 
                :value="metrics.throughput" 
                suffix="req/s"
                :value-style="{ color: '#409eff' }"
              />
            </el-col>
            <el-col :span="6">
              <el-statistic 
                title="错误率" 
                :value="metrics.errorRate" 
                suffix="%"
                :value-style="{ color: metrics.errorRate > 5 ? '#f56c6c' : '#67c23a' }"
              />
            </el-col>
            <el-col :span="6">
              <el-statistic 
                title="活跃连接" 
                :value="databaseMetrics.activeConnections" 
                :suffix="`/${databaseMetrics.connectionPoolSize}`"
                :value-style="{ color: '#606266' }"
              />
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 异步处理队列状态 -->
      <el-col :span="12">
        <el-card>
          <template v-slot:header>
<div >
            <span>异步处理队列</span>
            <el-tag 
              :type="queueStatus.processing ? 'success' : 'info'" 
              style="float: right;"
            >
              {{ queueStatus.processing ? '处理中' : '空闲' }}
            </el-tag>
          </div>
</template>
          <div class="queue-stats">
            <div class="queue-item">
              <span class="label">队列长度:</span>
              <span class="value">{{ queueStatus.size }}</span>
            </div>
            <div class="queue-item">
              <span class="label">工作线程:</span>
              <span class="value">{{ queueStatus.workers }}</span>
            </div>
            <div class="queue-item">
              <span class="label">已处理任务:</span>
              <span class="value">{{ queueStatus.performance.counter_tasks_completed || 0 }}</span>
            </div>
            <div class="queue-item">
              <span class="label">失败任务:</span>
              <span class="value">{{ queueStatus.performance.counter_tasks_failed || 0 }}</span>
            </div>
          </div>
          
          <el-progress 
            :percentage="getQueueEfficiency()"
            :status="getQueueEfficiency() > 80 ? 'success' : 'warning'"
            style="margin-top: 15px;"
          >
            <template v-slot:default>队列效率</template>
          </el-progress>
        </el-card>
      </el-col>

      <!-- 数据库性能指标 -->
      <el-col :span="12">
        <el-card>
          <template v-slot:header>
<div >
            <span>数据库性能</span>
            <el-tooltip content="点击查看详细报告">
              <el-button 
                type="text" 
                icon="el-icon-document" 
                style="float: right;"
                @click="showDatabaseReport"
              />
            </el-tooltip>
          </div>
</template>
          <div class="db-metrics">
            <el-row :gutter="12">
              <el-col :span="12">
                <div class="metric-item">
                  <div class="metric-label">缓存命中率</div>
                  <div class="metric-value">{{ (databaseMetrics.cacheHitRatio * 100).toFixed(1) }}%</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="metric-item">
                  <div class="metric-label">索引效率</div>
                  <div class="metric-value">{{ (databaseMetrics.indexEfficiency * 100).toFixed(1) }}%</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="metric-item">
                  <div class="metric-label">慢查询数</div>
                  <div class="metric-value">{{ databaseMetrics.slowQueries }}</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="metric-item">
                  <div class="metric-label">全表扫描率</div>
                  <div class="metric-value">{{ (databaseMetrics.tableScansRatio * 100).toFixed(1) }}%</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 响应时间趋势图 -->
      <el-col :span="24">
        <el-card>
          <template v-slot:header>
<div >
            <span>响应时间趋势</span>
            <el-select 
              v-model="selectedTimeRange" 
              style="float: right;"
              size="small"
              @change="updateChartData"
            >
              <el-option label="最近1小时" value="1h" />
              <el-option label="最近6小时" value="6h" />
              <el-option label="最近24小时" value="24h" />
              <el-option label="最近7天" value="7d" />
            </el-select>
          </div>
</template>
          <div id="response-time-chart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 慢查询列表 -->
      <el-col :span="14">
        <el-card>
          <template v-slot:header>
<div >
            <span>慢查询分析</span>
            <el-button 
              type="text" 
              style="float: right;"
              @click="refreshSlowQueries"
            >
              刷新
            </el-button>
          </div>
</template>
          <el-table 
            :data="slowQueries.slice(0, 5)" 
            size="small"
            max-height="350"
          >
            <el-table-column label="查询" width="200">
              <template v-slot="scope">
                <el-tooltip :content="scope.row.query" placement="top">
                  <span class="query-text">{{ truncateQuery(scope.row.query) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="averageTime" label="平均时间(ms)" width="100">
              <template v-slot="scope">
                <el-tag :type="scope.row.averageTime > 2000 ? 'danger' : 'warning'">
                  {{ Math.round(scope.row.averageTime) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="frequency" label="频次" width="80" />
            <el-table-column label="操作" width="100">
              <template v-slot="scope">
                <el-button 
                  type="text" 
                  size="small"
                  @click="analyzeQuery(scope.row.query)"
                >
                  分析
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 优化建议 -->
      <el-col :span="10">
        <el-card>
          <template v-slot:header>
<div >
            <span>优化建议</span>
            <el-badge 
              :value="optimizationSuggestions.length" 
              :max="99"
              style="float: right;"
            />
          </div>
</template>
          <div class="suggestions-list" style="max-height: 350px; overflow-y: auto;">
            <div 
              v-for="(suggestion, index) in optimizationSuggestions.slice(0, 8)" 
              :key="index"
              class="suggestion-item"
            >
              <div class="suggestion-header">
                <el-tag 
                  :type="getSuggestionTagType(suggestion.priority)" 
                  size="small"
                >
                  {{ getPriorityText(suggestion.priority) }}
                </el-tag>
                <el-tag 
                  type="info" 
                  size="small"
                  style="margin-left: 8px;"
                >
                  {{ suggestion.type }}
                </el-tag>
              </div>
              <div class="suggestion-content">
                {{ suggestion.description }}
              </div>
              <div class="suggestion-impact">
                <small>{{ suggestion.estimatedImpact }}</small>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据库优化报告对话框 -->
    <el-dialog 
      title="数据库优化报告" 
      v-model:visible="showReportDialog"
      width="80%"
      :before-close="closeReportDialog"
    >
      <div v-if="databaseReport">
        <el-tabs v-model="activeReportTab">
          <el-tab-pane label="查询统计" name="queries">
            <div class="report-section">
              <h4>查询摘要</h4>
              <el-row :gutter="16">
                <el-col :span="6">
                  <el-statistic title="总查询数" :value="databaseReport.summary.totalQueries" />
                </el-col>
                <el-col :span="6">
                  <el-statistic title="唯一查询" :value="databaseReport.summary.uniqueQueries" />
                </el-col>
                <el-col :span="6">
                  <el-statistic title="慢查询" :value="databaseReport.summary.slowQueries" />
                </el-col>
                <el-col :span="6">
                  <el-statistic title="平均执行时间" :value="Math.round(databaseReport.summary.averageExecutionTime)" suffix="ms" />
                </el-col>
              </el-row>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="索引建议" name="indexes">
            <el-table :data="databaseReport.indexRecommendations" size="small">
              <el-table-column prop="priority" label="优先级" width="80">
                <template v-slot="scope">
                  <el-tag :type="getSuggestionTagType(scope.row.priority)" size="small">
                    {{ getPriorityText(scope.row.priority) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="建议" />
              <el-table-column prop="sqlCommand" label="SQL命令" width="300">
                <template v-slot="scope">
                  <el-button 
                    type="text" 
                    size="small"
                    @click="copySqlCommand(scope.row.sqlCommand)"
                  >
                    复制
                  </el-button>
                  <code style="font-size: 12px;">{{ scope.row.sqlCommand }}</code>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          
          <el-tab-pane label="连接池优化" name="pool">
            <div class="report-section">
              <h4>连接池建议配置</h4>
              <el-form label-width="120px">
                <el-form-item label="最小连接数">
                  <el-input-number :value="databaseReport.connectionPoolOptimization.minConnections" disabled />
                </el-form-item>
                <el-form-item label="最大连接数">
                  <el-input-number :value="databaseReport.connectionPoolOptimization.maxConnections" disabled />
                </el-form-item>
                <el-form-item label="获取超时">
                  <el-input-number :value="databaseReport.connectionPoolOptimization.acquireTimeoutMillis" disabled />
                </el-form-item>
                <el-form-item label="空闲超时">
                  <el-input-number :value="databaseReport.connectionPoolOptimization.idleTimeoutMillis" disabled />
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <template v-slot:footer>
<div >
        <el-button @click="closeReportDialog">关闭</el-button>
        <el-button type="primary" @click="exportReport">导出报告</el-button>
      </div>
</template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import * as echarts from 'echarts'
import { auditAsyncProcessor } from '@/api/auditAsyncProcessor'
import { auditDatabaseOptimizer } from '@/api/auditDatabaseOptimizer'

// 类型定义
interface Metrics {
  averageResponseTime: number
  throughput: number
  errorRate: number
}

interface QueuePerformance {
  counter_tasks_completed?: number
  counter_tasks_failed?: number
  [key: string]: any
}

interface QueueStatus {
  size: number
  processing: boolean
  workers: number
  performance: QueuePerformance
}

interface DatabaseMetrics {
  connectionPoolSize: number
  activeConnections: number
  queuedQueries: number
  averageQueryTime: number
  slowQueries: number
  cacheHitRatio: number
  indexEfficiency: number
  tableScansRatio: number
}

interface SlowQuery {
  query: string
  averageTime: number
  frequency: number
  [key: string]: any
}

interface OptimizationSuggestion {
  type: string
  description: string
  estimatedImpact: string
  priority: 'high' | 'medium' | 'low'
  [key: string]: any
}

interface DatabaseReport {
  summary: any
  indexRecommendations: any[]
  connectionPoolOptimization: any
  [key: string]: any
}

// 响应式数据
const refreshing = ref(false)
const selectedTimeRange = ref('6h')
const showReportDialog = ref(false)
const activeReportTab = ref('queries')

const metrics = reactive<Metrics>({
  averageResponseTime: 0,
  throughput: 0,
  errorRate: 0
})

const queueStatus = reactive<QueueStatus>({
  size: 0,
  processing: false,
  workers: 0,
  performance: {}
})

const databaseMetrics = reactive<DatabaseMetrics>({
  connectionPoolSize: 0,
  activeConnections: 0,
  queuedQueries: 0,
  averageQueryTime: 0,
  slowQueries: 0,
  cacheHitRatio: 0,
  indexEfficiency: 0,
  tableScansRatio: 0
})

const slowQueries = ref<SlowQuery[]>([])
const optimizationSuggestions = ref<OptimizationSuggestion[]>([])
const databaseReport = ref<DatabaseReport | null>(null)

let chartInstance: echarts.ECharts | null = null
let refreshTimer: number | null = null

// 生命周期
onMounted(async () => {
  await initializeComponent()
  startAutoRefresh()
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  if (chartInstance) {
    chartInstance.dispose()
  }
})

// 方法
async function initializeComponent() {
  await refreshAll()
  initChart()
}

async function refreshAll() {
  refreshing.value = true
  
  try {
    await Promise.all([
      refreshMetrics(),
      refreshQueueStatus(),
      refreshDatabaseMetrics(),
      refreshSlowQueries(),
      refreshOptimizationSuggestions()
    ])
  } catch (error) {
    console.error('刷新数据失败:', error)
  } finally {
    refreshing.value = false
  }
}

async function refreshMetrics() {
  // 模拟获取系统指标
  try {
    const response = await fetch('/api/audit/metrics/system')
    const data = await response.json()
    
    Object.assign(metrics, {
      averageResponseTime: data.averageResponseTime || Math.random() * 500 + 200,
      throughput: data.throughput || Math.random() * 50 + 10,
      errorRate: data.errorRate || Math.random() * 2
    })
  } catch (error) {
    // 使用模拟数据
    Object.assign(metrics, {
      averageResponseTime: Math.random() * 500 + 200,
      throughput: Math.random() * 50 + 10,
      errorRate: Math.random() * 2
    })
  }
}

async function refreshQueueStatus() {
  try {
    const status = await auditAsyncProcessor.getQueueStatus()
    Object.assign(queueStatus, status)
  } catch (error) {
    console.error('获取队列状态失败:', error)
  }
}

async function refreshDatabaseMetrics() {
  try {
    const dbMetrics = await auditDatabaseOptimizer.getDatabaseMetrics()
    Object.assign(databaseMetrics, dbMetrics)
  } catch (error) {
    console.error('获取数据库指标失败:', error)
  }
}

async function refreshSlowQueries() {
  try {
    const queries = auditDatabaseOptimizer.getSlowQueries()
    slowQueries.value = queries
  } catch (error) {
    console.error('获取慢查询失败:', error)
  }
}

async function refreshOptimizationSuggestions() {
  try {
    const tables = ['audit_tasks', 'audit_policies', 'audit_logs']
    const suggestions = []
    
    for (const table of tables) {
      const tableSuggestions = await auditDatabaseOptimizer.analyzeTableIndexes(table)
      suggestions.push(...tableSuggestions)
    }
    
    optimizationSuggestions.value = suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  } catch (error) {
    console.error('获取优化建议失败:', error)
  }
}

function getQueueEfficiency() {
  const completed = queueStatus.performance.counter_tasks_completed || 0
  const failed = queueStatus.performance.counter_tasks_failed || 0
  const total = completed + failed
  
  if (total === 0) return 100
  return Math.round((completed / total) * 100)
}

function initChart() {
  const chartDom = document.getElementById('response-time-chart')
  if (chartDom) {
    chartInstance = echarts.init(chartDom)
    updateChartData()
  }
}

function updateChartData() {
  // 生成模拟的响应时间数据
  const now = Date.now()
  const intervals = getTimeIntervals()
  const data = []
  
  for (let i = intervals - 1; i >= 0; i--) {
    const timestamp = now - i * getInterval()
    const responseTime = Math.random() * 300 + 100 + Math.sin(i * 0.1) * 50
    data.push([new Date(timestamp), Math.round(responseTime)])
  }
  
  const option = {
    title: {
      text: '响应时间趋势',
      left: 'center',
      textStyle: {
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        const time = new Date(params[0].data[0]).toLocaleTimeString()
        return `${time}<br/>响应时间: ${params[0].data[1]}ms`
      }
    },
    xAxis: {
      type: 'time',
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      name: '响应时间 (ms)',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [{
      name: '响应时间',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: {
        color: '#409EFF'
      },
      itemStyle: {
        color: '#409EFF'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: 'rgba(64, 158, 255, 0.3)'
          }, {
            offset: 1,
            color: 'rgba(64, 158, 255, 0.1)'
          }]
        }
      },
      data: data
    }]
  }
  
  chartInstance.setOption(option)
}

function getTimeIntervals() {
  const map = { '1h': 60, '6h': 72, '24h': 96, '7d': 168 }
  return map[selectedTimeRange.value] || 72
}

function getInterval() {
  const map = { '1h': 60000, '6h': 300000, '24h': 900000, '7d': 3600000 }
  return map[selectedTimeRange.value] || 300000
}

function truncateQuery(query: string) {
  return query.length > 50 ? query.substring(0, 50) + '...' : query
}

function getSuggestionTagType(priority: string) {
  const map = { high: 'danger', medium: 'warning', low: 'info' }
  return map[priority] || 'info'
}

function getPriorityText(priority: string) {
  const map = { high: '高', medium: '中', low: '低' }
  return map[priority] || '未知'
}

async function analyzeQuery(query: string) {
  try {
    const analysis = await auditDatabaseOptimizer.analyzeQuery(query)
    
    this.$msgbox({
      title: '查询分析结果',
      message: `
        <h4>执行计划</h4>
        <p>计划时间: ${analysis.plan.planningTime}ms</p>
        <p>执行时间: ${analysis.plan.executionTime}ms</p>
        <p>总成本: ${analysis.plan.totalCost}</p>
        
        <h4>优化建议</h4>
        <ul>
          ${analysis.suggestions.map(s => `<li>${s.description}</li>`).join('')}
        </ul>
      `,
      dangerouslyUseHTMLString: true
    })
  } catch (error) {
    this.$message.error('查询分析失败')
  }
}

async function showDatabaseReport() {
  try {
    const report = await auditDatabaseOptimizer.generateOptimizationReport()
    databaseReport.value = report
    showReportDialog.value = true
  } catch (error) {
    this.$message.error('生成数据库报告失败')
  }
}

function closeReportDialog() {
  showReportDialog.value = false
  databaseReport.value = null
}

function copySqlCommand(command: string) {
  navigator.clipboard.writeText(command).then(() => {
    this.$message.success('SQL命令已复制到剪贴板')
  }).catch(() => {
    this.$message.error('复制失败')
  })
}

function exportReport() {
  if (!databaseReport.value) return
  
  const reportData = JSON.stringify(databaseReport.value, null, 2)
  const blob = new Blob([reportData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `database_optimization_report_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function startAutoRefresh() {
  refreshTimer = setInterval(() => {
    refreshMetrics()
    refreshQueueStatus()
    refreshDatabaseMetrics()
  }, 30000) // 30秒刷新一次
}
</script>

<style scoped>
.performance-monitor {
  padding: 20px;
}

.overview-card {
  margin-bottom: 20px;
}

.queue-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.queue-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.queue-item .label {
  font-size: 14px;
  color: #606266;
}

.queue-item .value {
  font-weight: bold;
  color: #303133;
}

.db-metrics {
  padding: 10px 0;
}

.metric-item {
  text-align: center;
  padding: 8px;
  border-radius: 4px;
  background-color: #f8f9fa;
}

.metric-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.query-text {
  font-family: monospace;
  font-size: 12px;
  color: #606266;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-item {
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fafafa;
}

.suggestion-header {
  margin-bottom: 8px;
}

.suggestion-content {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.suggestion-impact {
  color: #909399;
}

.report-section {
  margin-bottom: 20px;
}

.report-section h4 {
  margin-bottom: 16px;
  color: #303133;
}
</style>