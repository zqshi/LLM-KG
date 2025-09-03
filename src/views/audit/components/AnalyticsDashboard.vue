<template>
  <div class="analytics-dashboard">
    <!-- 实时指标概览 -->
    <el-row :gutter="16" class="metrics-overview">
      <el-col :span="3" v-for="(metric, key) in realTimeMetrics" :key="key">
        <el-card class="metric-card">
          <div class="metric-content">
            <div class="metric-value">{{ formatMetricValue(metric.value, metric.type) }}</div>
            <div class="metric-label">{{ metric.label }}</div>
            <div class="metric-trend" :class="metric.trend">
              <el-icon v-if="metric.trend === 'up'"><TrendCharts /></el-icon>
              <el-icon v-else-if="metric.trend === 'down'"><Bottom /></el-icon>
              <span>{{ metric.change }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 审核任务趋势 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>审核任务趋势</span>
              <el-select v-model="taskTrendTimeRange" size="small" style="width: 120px;" @change="updateTaskTrendChart">
                <el-option label="1小时" value="1h" />
                <el-option label="6小时" value="6h" />
                <el-option label="24小时" value="24h" />
                <el-option label="7天" value="7d" />
              </el-select>
            </div>
          </template>
          <div id="task-trend-chart" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <!-- 审核结果分布 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>审核结果分布</span>
          </template>
          <div id="result-distribution-chart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 审核员绩效 -->
      <el-col :span="14">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>审核员绩效排行</span>
              <el-select v-model="performanceTimeRange" size="small" style="width: 120px;" @change="loadAuditorPerformance">
                <el-option label="今日" value="24h" />
                <el-option label="本周" value="7d" />
                <el-option label="本月" value="30d" />
              </el-select>
            </div>
          </template>
          <el-table :data="auditorPerformance" style="width: 100%;">
            <el-table-column prop="auditorName" label="审核员" width="120" />
            <el-table-column prop="totalTasks" label="处理任务" width="100" align="center" />
            <el-table-column prop="avgProcessTime" label="平均耗时" width="100" align="center">
              <template #default="scope">
                {{ formatDuration(scope.row.avgProcessTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="approvalRate" label="通过率" width="100" align="center">
              <template #default="scope">
                <span :style="{ color: scope.row.approvalRate >= 80 ? '#67c23a' : '#f56c6c' }">
                  {{ scope.row.approvalRate.toFixed(1) }}%
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="accuracy" label="准确率" width="100" align="center">
              <template #default="scope">
                <span :style="{ color: scope.row.accuracy >= 95 ? '#67c23a' : '#f56c6c' }">
                  {{ scope.row.accuracy.toFixed(1) }}%
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="efficiency" label="效率指数" width="100" align="center">
              <template #default="scope">
                <el-progress 
                  :percentage="scope.row.efficiency" 
                  :stroke-width="8"
                  :show-text="false"
                  :status="scope.row.efficiency >= 80 ? 'success' : 'warning'"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 内容质量分析 -->
      <el-col :span="10">
        <el-card>
          <template #header>
            <span>内容质量分析</span>
          </template>
          <div class="quality-metrics">
            <div class="quality-item">
              <div class="quality-label">平均质量得分</div>
              <div class="quality-value">{{ contentQuality.avgScore.toFixed(1) }}</div>
            </div>
            <div class="quality-item">
              <div class="quality-label">违规内容占比</div>
              <div class="quality-value">{{ contentQuality.violationRate.toFixed(1) }}%</div>
            </div>
          </div>
          <div id="quality-trend-chart" style="height: 200px; margin-top: 20px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 业务类型分布 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>业务类型分布</span>
          </template>
          <div id="biz-type-chart" style="height: 250px;"></div>
        </el-card>
      </el-col>

      <!-- 风险级别分布 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>风险级别分布</span>
          </template>
          <div id="risk-level-chart" style="height: 250px;"></div>
        </el-card>
      </el-col>

      <!-- 违规类型统计 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>违规类型统计</span>
          </template>
          <div id="violation-type-chart" style="height: 250px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 异常检测 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>异常检测</span>
              <el-button size="small" @click="runAnomalyDetection">
                <el-icon><Search /></el-icon>
                检测异常
              </el-button>
            </div>
          </template>
          <div v-if="anomalies.length === 0" class="no-data">
            <el-empty description="暂无异常数据" />
          </div>
          <div v-else>
            <div v-for="anomaly in anomalies.slice(0, 5)" :key="anomaly.timestamp" class="anomaly-item">
              <div class="anomaly-header">
                <el-tag 
                  :type="anomaly.severity === 'high' ? 'danger' : anomaly.severity === 'medium' ? 'warning' : 'info'"
                  size="small"
                >
                  {{ getSeverityLabel(anomaly.severity) }}
                </el-tag>
                <span class="anomaly-time">{{ formatTime(anomaly.timestamp) }}</span>
              </div>
              <div class="anomaly-content">{{ anomaly.explanation }}</div>
              <div class="anomaly-values">
                实际值: {{ anomaly.value.toFixed(2) }} | 预期值: {{ anomaly.expected.toFixed(2) }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 预测分析 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>任务量预测</span>
              <el-button size="small" @click="generateForecast">
                <el-icon><TrendCharts /></el-icon>
                生成预测
              </el-button>
            </div>
          </template>
          <div id="forecast-chart" style="height: 250px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 自定义报告 -->
    <el-row style="margin-top: 20px;">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>自定义分析</span>
              <el-button type="primary" size="small" @click="showReportBuilder">
                <el-icon><Plus /></el-icon>
                创建报告
              </el-button>
            </div>
          </template>
          
          <div class="custom-analysis">
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="analysis-section">
                  <h4>快速分析</h4>
                  <el-select v-model="quickAnalysisMetric" placeholder="选择指标" style="width: 100%;">
                    <el-option label="审核通过率" value="approval_rate" />
                    <el-option label="平均处理时间" value="avg_process_time" />
                    <el-option label="错误率" value="error_rate" />
                    <el-option label="队列长度" value="queue_length" />
                  </el-select>
                  <el-button 
                    type="primary" 
                    style="width: 100%; margin-top: 10px;"
                    @click="runQuickAnalysis"
                  >
                    运行分析
                  </el-button>
                </div>
              </el-col>
              
              <el-col :span="8">
                <div class="analysis-section">
                  <h4>漏斗分析</h4>
                  <el-select v-model="funnelBizType" placeholder="选择业务类型" style="width: 100%;">
                    <el-option label="论坛内容" value="content" />
                    <el-option label="二手市场" value="flea_market" />
                    <el-option label="用户举报" value="user_report" />
                  </el-select>
                  <el-button 
                    type="primary" 
                    style="width: 100%; margin-top: 10px;"
                    @click="runFunnelAnalysis"
                  >
                    分析转化
                  </el-button>
                </div>
              </el-col>
              
              <el-col :span="8">
                <div class="analysis-section">
                  <h4>同期群分析</h4>
                  <el-select v-model="cohortType" placeholder="选择时间粒度" style="width: 100%;">
                    <el-option label="按天" value="daily" />
                    <el-option label="按周" value="weekly" />
                    <el-option label="按月" value="monthly" />
                  </el-select>
                  <el-button 
                    type="primary" 
                    style="width: 100%; margin-top: 10px;"
                    @click="runCohortAnalysis"
                  >
                    分析留存
                  </el-button>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 报告构建器对话框 -->
    <el-dialog v-model="reportBuilderVisible" title="创建自定义报告" width="70%">
      <div class="report-builder">
        <el-form :model="reportConfig" label-width="100px">
          <el-form-item label="报告名称">
            <el-input v-model="reportConfig.name" placeholder="输入报告名称" />
          </el-form-item>
          <el-form-item label="报告描述">
            <el-input v-model="reportConfig.description" type="textarea" placeholder="输入报告描述" />
          </el-form-item>
          <el-form-item label="数据源">
            <el-checkbox-group v-model="reportConfig.dataSources">
              <el-checkbox label="audit_tasks">审核任务</el-checkbox>
              <el-checkbox label="audit_logs">审核日志</el-checkbox>
              <el-checkbox label="system_metrics">系统指标</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-select v-model="reportConfig.timeRange">
              <el-option label="最近24小时" value="24h" />
              <el-option label="最近7天" value="7d" />
              <el-option label="最近30天" value="30d" />
              <el-option label="最近90天" value="90d" />
            </el-select>
          </el-form-item>
          <el-form-item label="定时发送">
            <el-switch v-model="reportConfig.scheduled" />
            <el-select 
              v-if="reportConfig.scheduled"
              v-model="reportConfig.frequency"
              style="margin-left: 10px;"
            >
              <el-option label="每日" value="daily" />
              <el-option label="每周" value="weekly" />
              <el-option label="每月" value="monthly" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <div>
          <el-button @click="reportBuilderVisible = false">取消</el-button>
          <el-button type="primary" @click="createCustomReport">创建报告</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import {
  TrendCharts,
  Bottom,
  Search,
  Plus
} from '@element-plus/icons-vue'
import { auditAnalyticsService, type TimeRange } from '@/api/auditAnalyticsService'
import type { BizType } from '@/types'

// 响应式数据
const realTimeMetrics = reactive({
  activeUsers: { label: '在线用户', value: 0, trend: 'up', change: '+5%', type: 'number' },
  pendingTasks: { label: '待审任务', value: 0, trend: 'down', change: '-12', type: 'number' },
  completedToday: { label: '今日完成', value: 0, trend: 'up', change: '+23', type: 'number' },
  avgResponseTime: { label: '响应时间', value: 0, trend: 'down', change: '-50ms', type: 'time' },
  errorRate: { label: '错误率', value: 0, trend: 'down', change: '-0.5%', type: 'percentage' },
  queueSize: { label: '队列长度', value: 0, trend: 'stable', change: '0', type: 'number' },
  systemLoad: { label: '系统负载', value: 0, trend: 'up', change: '+5%', type: 'percentage' },
  processingTasks: { label: '处理中', value: 0, trend: 'stable', change: '0', type: 'number' }
})

const auditorPerformance = ref([])
const contentQuality = reactive({
  avgScore: 0,
  violationRate: 0
})
const anomalies = ref([])

// 控制变量
const taskTrendTimeRange = ref<TimeRange>('24h')
const performanceTimeRange = ref<TimeRange>('7d')
const quickAnalysisMetric = ref('')
const funnelBizType = ref('')
const cohortType = ref('')

// 对话框状态
const reportBuilderVisible = ref(false)

// 报告配置
const reportConfig = reactive({
  name: '',
  description: '',
  dataSources: [],
  timeRange: '7d',
  scheduled: false,
  frequency: 'weekly'
})

// 图表实例
let taskTrendChart: echarts.EChartsType | null = null
let resultDistributionChart: echarts.EChartsType | null = null
let qualityTrendChart: echarts.EChartsType | null = null
let bizTypeChart: echarts.EChartsType | null = null
let riskLevelChart: echarts.EChartsType | null = null
let violationTypeChart: echarts.EChartsType | null = null
let forecastChart: echarts.EChartsType | null = null

let refreshTimer: NodeJS.Timeout | null = null

// 生命周期
onMounted(async () => {
  await loadInitialData()
  initCharts()
  startAutoRefresh()
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  disposeCharts()
})

// 方法
async function loadInitialData() {
  try {
    const [metrics, performance] = await Promise.all([
      auditAnalyticsService.getRealTimeMetrics(),
      auditAnalyticsService.getAuditorPerformance(performanceTimeRange.value)
    ])

    // 更新实时指标
    Object.keys(metrics).forEach(key => {
      if (realTimeMetrics[key]) {
        realTimeMetrics[key].value = metrics[key]
      }
    })

    auditorPerformance.value = performance
    
    // 加载内容质量数据
    await loadContentQuality()
    
  } catch (error) {
    console.error('加载初始数据失败:', error)
    ElMessage.error('加载数据失败')
  }
}

async function loadContentQuality() {
  try {
    const qualityData = await auditAnalyticsService.getContentQualityAnalysis('content', '7d')
    
    if (qualityData.qualityTrends.length > 0) {
      const scores = qualityData.qualityTrends.map(t => t.value)
      contentQuality.avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
    }
    
    const totalViolations = qualityData.violationTypes.reduce((sum, v) => sum + v.count, 0)
    const totalContent = totalViolations * 10 // 模拟总内容数
    contentQuality.violationRate = (totalViolations / totalContent) * 100
    
  } catch (error) {
    console.error('加载内容质量数据失败:', error)
  }
}

async function loadAuditorPerformance() {
  try {
    const performance = await auditAnalyticsService.getAuditorPerformance(performanceTimeRange.value)
    auditorPerformance.value = performance
  } catch (error) {
    console.error('加载审核员绩效失败:', error)
  }
}

function initCharts() {
  initTaskTrendChart()
  initResultDistributionChart()
  initQualityTrendChart()
  initBizTypeChart()
  initRiskLevelChart()
  initViolationTypeChart()
  initForecastChart()
}

function initTaskTrendChart() {
  const chartDom = document.getElementById('task-trend-chart')
  if (!chartDom) return

  taskTrendChart = echarts.init(chartDom)
  updateTaskTrendChart()
}

async function updateTaskTrendChart() {
  if (!taskTrendChart) return

  try {
    const trendData = await auditAnalyticsService.getAuditTaskTrends('content', taskTrendTimeRange.value)
    
    const option = {
      title: {
        text: '审核任务趋势',
        left: 'center',
        textStyle: { fontSize: 14 }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      legend: {
        data: ['提交', '完成', '通过', '拒绝'],
        bottom: 10
      },
      xAxis: {
        type: 'time',
        splitLine: { show: false }
      },
      yAxis: {
        type: 'value',
        name: '任务数量'
      },
      series: [
        {
          name: '提交',
          type: 'line',
          data: trendData.submitted.map(t => [new Date(t.timestamp), t.value]),
          smooth: true,
          lineStyle: { color: '#409eff' }
        },
        {
          name: '完成',
          type: 'line',
          data: trendData.completed.map(t => [new Date(t.timestamp), t.value]),
          smooth: true,
          lineStyle: { color: '#67c23a' }
        },
        {
          name: '通过',
          type: 'line',
          data: trendData.approved.map(t => [new Date(t.timestamp), t.value]),
          smooth: true,
          lineStyle: { color: '#e6a23c' }
        },
        {
          name: '拒绝',
          type: 'line',
          data: trendData.rejected.map(t => [new Date(t.timestamp), t.value]),
          smooth: true,
          lineStyle: { color: '#f56c6c' }
        }
      ]
    }

    taskTrendChart.setOption(option)
  } catch (error) {
    console.error('更新任务趋势图表失败:', error)
  }
}

function initResultDistributionChart() {
  const chartDom = document.getElementById('result-distribution-chart')
  if (!chartDom) return

  resultDistributionChart = echarts.init(chartDom)
  
  const option = {
    title: {
      text: '审核结果分布',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    series: [{
      name: '审核结果',
      type: 'pie',
      radius: '70%',
      data: [
        { value: 65, name: '通过', itemStyle: { color: '#67c23a' } },
        { value: 20, name: '拒绝', itemStyle: { color: '#f56c6c' } },
        { value: 10, name: '需复审', itemStyle: { color: '#e6a23c' } },
        { value: 5, name: '其他', itemStyle: { color: '#909399' } }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }

  resultDistributionChart.setOption(option)
}

function initQualityTrendChart() {
  const chartDom = document.getElementById('quality-trend-chart')
  if (!chartDom) return

  qualityTrendChart = echarts.init(chartDom)
  
  // 生成模拟数据
  const data = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push([date, Math.random() * 20 + 80])
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function (params: any) {
        const date = new Date(params[0].data[0]).toLocaleDateString()
        return `${date}<br/>质量得分: ${params[0].data[1].toFixed(1)}`
      }
    },
    xAxis: {
      type: 'time',
      splitLine: { show: false },
      axisLabel: { show: false }
    },
    yAxis: {
      type: 'value',
      min: 70,
      max: 100,
      splitLine: { lineStyle: { type: 'dashed' } }
    },
    series: [{
      type: 'line',
      data,
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: { color: '#409eff' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ]
        }
      }
    }]
  }

  qualityTrendChart.setOption(option)
}

function initBizTypeChart() {
  const chartDom = document.getElementById('biz-type-chart')
  if (!chartDom) return

  bizTypeChart = echarts.init(chartDom)
  
  const option = {
    title: {
      text: '业务类型分布',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'item'
    },
    series: [{
      type: 'pie',
      radius: '60%',
      data: [
        { value: 45, name: '论坛内容' },
        { value: 30, name: '二手市场' },
        { value: 15, name: '用户举报' },
        { value: 10, name: '其他' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }

  bizTypeChart.setOption(option)
}

function initRiskLevelChart() {
  const chartDom = document.getElementById('risk-level-chart')
  if (!chartDom) return

  riskLevelChart = echarts.init(chartDom)
  
  const option = {
    title: {
      text: '风险级别分布',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    xAxis: {
      type: 'category',
      data: ['低风险', '中风险', '高风险', '极高风险']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      type: 'bar',
      data: [
        { value: 120, itemStyle: { color: '#67c23a' } },
        { value: 80, itemStyle: { color: '#e6a23c' } },
        { value: 40, itemStyle: { color: '#f56c6c' } },
        { value: 10, itemStyle: { color: '#909399' } }
      ]
    }]
  }

  riskLevelChart.setOption(option)
}

function initViolationTypeChart() {
  const chartDom = document.getElementById('violation-type-chart')
  if (!chartDom) return

  violationTypeChart = echarts.init(chartDom)
  
  const option = {
    title: {
      text: '违规类型统计',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: ['垃圾信息', '敏感词汇', '虚假信息', '恶意链接', '其他']
    },
    series: [{
      type: 'bar',
      data: [50, 30, 25, 15, 8]
    }]
  }

  violationTypeChart.setOption(option)
}

function initForecastChart() {
  const chartDom = document.getElementById('forecast-chart')
  if (!chartDom) return

  forecastChart = echarts.init(chartDom)
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['历史数据', '预测数据', '置信区间'],
      bottom: 0
    },
    xAxis: {
      type: 'time',
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '任务数量'
    },
    series: [
      {
        name: '历史数据',
        type: 'line',
        data: [],
        lineStyle: { color: '#409eff' }
      },
      {
        name: '预测数据',
        type: 'line',
        data: [],
        lineStyle: { color: '#67c23a', type: 'dashed' }
      }
    ]
  }

  forecastChart.setOption(option)
}

function disposeCharts() {
  const charts = [
    taskTrendChart,
    resultDistributionChart,
    qualityTrendChart,
    bizTypeChart,
    riskLevelChart,
    violationTypeChart,
    forecastChart
  ]

  charts.forEach(chart => {
    if (chart) {
      chart.dispose()
    }
  })
}

async function runAnomalyDetection() {
  try {
    const result = await auditAnalyticsService.detectAnomalies('task_count', '7d', 'medium')
    anomalies.value = result
    
    if (result.length === 0) {
      ElMessage.info('未检测到异常数据')
    } else {
      ElMessage.success(`检测到 ${result.length} 个异常`)
    }
  } catch (error) {
    console.error('异常检测失败:', error)
    ElMessage.error('异常检测失败')
  }
}

async function generateForecast() {
  try {
    const result = await auditAnalyticsService.forecast('task_count', 7, '30d')
    
    // 更新预测图表
    if (forecastChart) {
      const option = forecastChart.getOption()
      option.series[1].data = result.forecast.map(f => [new Date(f.timestamp), f.predicted])
      forecastChart.setOption(option)
    }
    
    ElMessage.success(`预测准确率: ${(result.accuracy * 100).toFixed(1)}%`)
  } catch (error) {
    console.error('生成预测失败:', error)
    ElMessage.error('生成预测失败')
  }
}

async function runQuickAnalysis() {
  if (!quickAnalysisMetric.value) {
    ElMessage.warning('请选择分析指标')
    return
  }
  
  ElMessage.success(`正在分析 ${quickAnalysisMetric.value}...`)
  // 这里可以实现具体的快速分析逻辑
}

async function runFunnelAnalysis() {
  if (!funnelBizType.value) {
    ElMessage.warning('请选择业务类型')
    return
  }
  
  try {
    const steps = [
      { name: '内容提交', condition: { field: 'status', operator: 'eq', value: 'submitted' } },
      { name: '开始审核', condition: { field: 'status', operator: 'eq', value: 'processing' } },
      { name: '审核完成', condition: { field: 'status', operator: 'eq', value: 'completed' } }
    ]
    
    const result = await auditAnalyticsService.funnelAnalysis(steps)
    ElMessage.success(`转化率: ${result.conversionRate.toFixed(1)}%`)
  } catch (error) {
    console.error('漏斗分析失败:', error)
    ElMessage.error('漏斗分析失败')
  }
}

async function runCohortAnalysis() {
  if (!cohortType.value) {
    ElMessage.warning('请选择时间粒度')
    return
  }
  
  try {
    const result = await auditAnalyticsService.cohortAnalysis('90d', cohortType.value as any)
    ElMessage.success(`生成了 ${result.cohorts.length} 个同期群`)
  } catch (error) {
    console.error('同期群分析失败:', error)
    ElMessage.error('同期群分析失败')
  }
}

function showReportBuilder() {
  reportBuilderVisible.value = true
}

async function createCustomReport() {
  try {
    const reportId = await auditAnalyticsService.createReport({
      name: reportConfig.name,
      description: reportConfig.description,
      queries: [], // 需要根据配置生成查询
      visualizations: []
    })
    
    ElMessage.success('报告创建成功')
    reportBuilderVisible.value = false
  } catch (error) {
    console.error('创建报告失败:', error)
    ElMessage.error('创建报告失败')
  }
}

function formatMetricValue(value: number, type: string): string {
  switch (type) {
    case 'time':
      return `${value}ms`
    case 'percentage':
      return `${value.toFixed(1)}%`
    case 'number':
    default:
      return value.toLocaleString()
  }
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

function getSeverityLabel(severity: string): string {
  const labels = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return labels[severity] || severity
}

function startAutoRefresh() {
  refreshTimer = setInterval(async () => {
    const metrics = await auditAnalyticsService.getRealTimeMetrics()
    Object.keys(metrics).forEach(key => {
      if (realTimeMetrics[key]) {
        realTimeMetrics[key].value = metrics[key]
      }
    })
  }, 30000) // 30秒刷新一次
}
</script>

<style scoped>
.analytics-dashboard {
  padding: 20px;
}

.metrics-overview {
  margin-bottom: 20px;
}

.metric-card {
  height: 90px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.metric-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.metric-label {
  font-size: 12px;
  color: #606266;
  margin: 4px 0;
}

.metric-trend {
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.metric-trend.up {
  color: #67c23a;
}

.metric-trend.down {
  color: #f56c6c;
}

.metric-trend.stable {
  color: #909399;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quality-metrics {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.quality-item {
  text-align: center;
}

.quality-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.quality-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.anomaly-item {
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-bottom: 8px;
}

.anomaly-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.anomaly-time {
  font-size: 12px;
  color: #909399;
}

.anomaly-content {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.anomaly-values {
  font-size: 12px;
  color: #606266;
}

.custom-analysis {
  margin-top: 20px;
}

.analysis-section {
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  text-align: center;
}

.analysis-section h4 {
  margin: 0 0 12px 0;
  color: #303133;
}

.report-builder {
  padding: 20px;
}
</style>