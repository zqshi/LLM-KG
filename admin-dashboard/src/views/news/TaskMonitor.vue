<template>
  <div class="task-monitor">
    <UnifiedPageHeader 
      title="任务监控中心" 
      description="实时监控资讯抓取任务执行状态和运行情况"
    >
      <template #actions>
        <el-button type="primary" @click="refreshAll">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
        <el-button type="success" @click="batchStartTasks" :disabled="selectedTasks.length === 0">
          <el-icon><VideoPlay /></el-icon>
          批量执行 ({{ selectedTasks.length }})
        </el-button>
      </template>
    </UnifiedPageHeader>

    <!-- 监控仪表板 -->
    <el-row :gutter="20" class="dashboard">
      <el-col :span="6">
        <el-card class="metric-card">
          <div class="metric">
            <div class="metric-value success">{{ stats.runningTasks }}</div>
            <div class="metric-label">运行中任务</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="metric-card">
          <div class="metric">
            <div class="metric-value primary">{{ stats.todaySuccess }}</div>
            <div class="metric-label">今日成功</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="metric-card">
          <div class="metric">
            <div class="metric-value warning">{{ stats.todayFailed }}</div>
            <div class="metric-label">今日失败</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="metric-card">
          <div class="metric">
            <div class="metric-value info">{{ stats.totalFetched }}</div>
            <div class="metric-label">今日抓取</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 任务执行状态图表 -->
    <el-row :gutter="20" class="charts">
      <el-col :span="12">
        <el-card title="任务执行趋势">
          <div class="chart-container">
            <v-chart :option="trendChartOption" style="height: 300px;" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card title="任务状态分布">
          <div class="chart-container">
            <v-chart :option="statusChartOption" style="height: 300px;" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="任务状态:">
          <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
            <el-option label="运行中" value="running" />
            <el-option label="成功" value="success" />
            <el-option label="失败" value="failed" />
            <el-option label="等待中" value="pending" />
          </el-select>
        </el-form-item>
        <el-form-item label="资讯源:">
          <el-select v-model="filterForm.sourceId" placeholder="请选择资讯源" clearable>
            <el-option 
              v-for="source in sourceList" 
              :key="source.id" 
              :label="source.name" 
              :value="source.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围:">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">筛选</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 任务列表 -->
    <el-card class="task-list-card">
      <template #header>
        <div class="card-header">
          <span>任务执行记录</span>
          <div class="header-right">
            <el-switch v-model="autoRefresh" active-text="自动刷新" inactive-text="手动刷新" />
            <span class="refresh-interval" v-if="autoRefresh">{{ refreshCountdown }}s后刷新</span>
          </div>
        </div>
      </template>

      <el-table 
        :data="taskList" 
        v-loading="loading"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="任务ID" width="100" />
        <el-table-column label="资讯源" min-width="180">
          <template #default="{ row }">
            <div class="source-info">
              <div class="source-name">{{ row.sourceName }}</div>
              <div class="source-type">
                <el-tag size="small" :type="getSourceTypeColor(row.sourceType)">
                  {{ getSourceTypeText(row.sourceType) }}
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="任务状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)" :effect="row.status === 'running' ? 'dark' : 'plain'">
              <el-icon v-if="row.status === 'running'" class="rotating"><Loading /></el-icon>
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="执行进度" width="150">
          <template #default="{ row }">
            <div v-if="row.status === 'running'">
              <el-progress :percentage="row.progress" :stroke-width="6" />
              <div class="progress-text">{{ row.currentStep || '准备中...' }}</div>
            </div>
            <div v-else class="progress-result">
              <span class="fetch-count">{{ row.fetchCount }}条</span>
              <span class="duration">{{ formatDuration(row.duration) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="160" />
        <el-table-column prop="endTime" label="结束时间" width="160">
          <template #default="{ row }">
            {{ row.endTime || '进行中' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewTaskDetail(row)">详情</el-button>
            <el-button link type="info" @click="viewLogs(row)">日志</el-button>
            <el-button 
              v-if="row.status === 'running'" 
              link 
              type="danger" 
              @click="stopTask(row)"
            >
              停止
            </el-button>
            <el-button 
              v-else-if="row.status === 'failed'" 
              link 
              type="warning" 
              @click="retryTask(row)"
            >
              重试
            </el-button>
            <el-button 
              v-else-if="['success', 'failed'].includes(row.status)" 
              link 
              type="success" 
              @click="restartTask(row)"
            >
              重新执行
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 任务详情对话框 -->
    <el-dialog v-model="taskDetailVisible" :title="`任务详情 - ${selectedTask?.id || ''}`" width="800px">
      <div v-if="selectedTask" class="task-detail">
        <el-descriptions border :column="2">
          <el-descriptions-item label="任务ID">{{ selectedTask.id }}</el-descriptions-item>
          <el-descriptions-item label="资讯源">{{ selectedTask.sourceName }}</el-descriptions-item>
          <el-descriptions-item label="任务状态">
            <el-tag :type="getStatusColor(selectedTask.status)">
              {{ getStatusText(selectedTask.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="抓取数量">{{ selectedTask.fetchCount }}条</el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ selectedTask.startTime }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ selectedTask.endTime || '进行中' }}</el-descriptions-item>
          <el-descriptions-item label="执行耗时">{{ formatDuration(selectedTask.duration) }}</el-descriptions-item>
          <el-descriptions-item label="错误信息" v-if="selectedTask.errorMessage">
            <el-text type="danger">{{ selectedTask.errorMessage }}</el-text>
          </el-descriptions-item>
        </el-descriptions>

        <div class="task-config" v-if="selectedTask.config">
          <h4>任务配置</h4>
          <el-input 
            :model-value="JSON.stringify(selectedTask.config, null, 2)" 
            type="textarea" 
            :rows="6" 
            readonly 
          />
        </div>
      </div>
    </el-dialog>

    <!-- 任务日志对话框 -->
    <el-dialog v-model="logDialogVisible" :title="`任务日志 - ${selectedTask?.id || ''}`" width="1000px">
      <div class="log-container">
        <div class="log-header">
          <el-form :inline="true">
            <el-form-item label="日志级别:">
              <el-select v-model="logLevel" @change="filterLogs">
                <el-option label="全部" value="" />
                <el-option label="信息" value="info" />
                <el-option label="警告" value="warning" />
                <el-option label="错误" value="error" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="refreshLogs">刷新日志</el-button>
              <el-button type="info" @click="downloadLogs">下载日志</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="log-content">
          <div 
            v-for="log in filteredLogs" 
            :key="log.id" 
            :class="['log-item', `log-${log.level}`]"
          >
            <span class="log-time">{{ log.timestamp }}</span>
            <el-tag :type="getLogLevelColor(log.level)" size="small">{{ getLogLevelText(log.level) }}</el-tag>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, VideoPlay, Loading } from '@element-plus/icons-vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'

use([
  CanvasRenderer,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

interface TaskStatus {
  id: string
  sourceId: number
  sourceName: string
  sourceType: 'rss' | 'api' | 'crawler'
  status: 'running' | 'success' | 'failed' | 'pending'
  startTime: string
  endTime?: string
  duration?: number
  fetchCount: number
  progress?: number
  currentStep?: string
  errorMessage?: string
  config?: any
}

interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error'
  message: string
}

interface NewsSource {
  id: number
  name: string
  type: 'rss' | 'api' | 'crawler'
}

const loading = ref(false)
const taskDetailVisible = ref(false)
const logDialogVisible = ref(false)
const autoRefresh = ref(true)
const refreshCountdown = ref(30)
const logLevel = ref('')
const selectedTask = ref<TaskStatus | null>(null)
const selectedTasks = ref<TaskStatus[]>([])

const filterForm = reactive({
  status: '',
  sourceId: '',
  dateRange: [] as string[]
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const stats = reactive({
  runningTasks: 0,
  todaySuccess: 0,
  todayFailed: 0,
  totalFetched: 0
})

const taskList = ref<TaskStatus[]>([])
const logList = ref<LogEntry[]>([])
const sourceList = ref<NewsSource[]>([])

const filteredLogs = computed(() => {
  if (!logLevel.value) return logList.value
  return logList.value.filter(log => log.level === logLevel.value)
})

// 图表配置
const trendChartOption = reactive({
  title: { text: '任务执行趋势' },
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
  },
  yAxis: { type: 'value' },
  series: [{
    name: '成功任务',
    type: 'line',
    data: [12, 15, 28, 35, 42, 38],
    smooth: true,
    itemStyle: { color: '#67C23A' }
  }, {
    name: '失败任务',
    type: 'line',
    data: [2, 1, 3, 4, 2, 1],
    smooth: true,
    itemStyle: { color: '#F56C6C' }
  }]
})

const statusChartOption = reactive({
  title: { text: '任务状态分布' },
  tooltip: { trigger: 'item' },
  series: [{
    type: 'pie',
    radius: '60%',
    data: [
      { value: 68, name: '成功', itemStyle: { color: '#67C23A' } },
      { value: 12, name: '失败', itemStyle: { color: '#F56C6C' } },
      { value: 8, name: '运行中', itemStyle: { color: '#409EFF' } },
      { value: 12, name: '等待中', itemStyle: { color: '#E6A23C' } }
    ]
  }]
})

let refreshTimer: NodeJS.Timeout | null = null
let countdownTimer: NodeJS.Timeout | null = null

// 状态颜色映射
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    running: 'primary',
    success: 'success',
    failed: 'danger',
    pending: 'warning'
  }
  return colorMap[status] || ''
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    running: '运行中',
    success: '成功',
    failed: '失败',
    pending: '等待中'
  }
  return textMap[status] || status
}

const getSourceTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    rss: 'primary',
    api: 'success',
    crawler: 'warning'
  }
  return colorMap[type] || ''
}

const getSourceTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    rss: 'RSS',
    api: 'API',
    crawler: '爬虫'
  }
  return textMap[type] || type
}

const getLogLevelColor = (level: string) => {
  const colorMap: Record<string, string> = {
    info: 'info',
    warning: 'warning',
    error: 'danger'
  }
  return colorMap[level] || ''
}

const getLogLevelText = (level: string) => {
  const textMap: Record<string, string> = {
    info: '信息',
    warning: '警告',
    error: '错误'
  }
  return textMap[level] || level
}

const formatDuration = (duration?: number) => {
  if (!duration) return '-'
  if (duration < 1000) return `${duration}ms`
  if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`
  return `${(duration / 60000).toFixed(1)}min`
}

const refreshAll = async () => {
  await Promise.all([
    fetchTaskList(),
    fetchStats(),
    fetchSources()
  ])
  ElMessage.success('数据已刷新')
}

const fetchStats = async () => {
  // 模拟API调用
  await new Promise(resolve => setTimeout(resolve, 300))
  Object.assign(stats, {
    runningTasks: 3,
    todaySuccess: 68,
    todayFailed: 12,
    totalFetched: 1248
  })
}

const fetchSources = async () => {
  // 模拟获取资讯源列表
  sourceList.value = [
    { id: 1, name: '科技资讯RSS', type: 'rss' },
    { id: 2, name: '财经API接口', type: 'api' },
    { id: 3, name: '企业新闻爬虫', type: 'crawler' }
  ]
}

const fetchTaskList = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const mockTasks: TaskStatus[] = [
      {
        id: 'task_001',
        sourceId: 1,
        sourceName: '科技资讯RSS',
        sourceType: 'rss',
        status: 'running',
        startTime: '2024-03-01 14:30:00',
        fetchCount: 0,
        progress: 45,
        currentStep: '正在解析RSS内容...'
      },
      {
        id: 'task_002',
        sourceId: 2,
        sourceName: '财经API接口',
        sourceType: 'api',
        status: 'success',
        startTime: '2024-03-01 14:00:00',
        endTime: '2024-03-01 14:02:15',
        duration: 135000,
        fetchCount: 25
      },
      {
        id: 'task_003',
        sourceId: 3,
        sourceName: '企业新闻爬虫',
        sourceType: 'crawler',
        status: 'failed',
        startTime: '2024-03-01 13:30:00',
        endTime: '2024-03-01 13:31:45',
        duration: 105000,
        fetchCount: 0,
        errorMessage: '目标网站反爬虫机制阻止访问'
      }
    ]
    
    taskList.value = mockTasks
    pagination.total = mockTasks.length
  } catch (error) {
    ElMessage.error('获取任务列表失败')
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (val: TaskStatus[]) => {
  selectedTasks.value = val
}

const batchStartTasks = async () => {
  try {
    await ElMessageBox.confirm(`确定要批量执行选中的 ${selectedTasks.value.length} 个任务吗？`, '批量执行确认', {
      confirmButtonText: '确定执行',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    ElMessage.success(`已启动 ${selectedTasks.value.length} 个任务`)
    fetchTaskList()
  } catch {}
}

const viewTaskDetail = (task: TaskStatus) => {
  selectedTask.value = {
    ...task,
    config: {
      url: 'https://example.com/rss',
      frequency: '1hour',
      timeout: 30000,
      retryCount: 3
    }
  }
  taskDetailVisible.value = true
}

const viewLogs = async (task: TaskStatus) => {
  selectedTask.value = task
  // 模拟获取日志
  logList.value = [
    {
      id: '1',
      timestamp: '2024-03-01 14:30:00',
      level: 'info',
      message: '开始执行抓取任务'
    },
    {
      id: '2',
      timestamp: '2024-03-01 14:30:05',
      level: 'info',
      message: '连接到资讯源成功'
    },
    {
      id: '3',
      timestamp: '2024-03-01 14:30:15',
      level: 'warning',
      message: '发现部分内容格式异常，正在尝试修复'
    },
    {
      id: '4',
      timestamp: '2024-03-01 14:30:30',
      level: 'error',
      message: '解析第5条资讯时发生错误：标题为空'
    }
  ]
  logDialogVisible.value = true
}

const stopTask = async (task: TaskStatus) => {
  try {
    await ElMessageBox.confirm('确定要停止这个任务吗？', '停止任务', {
      confirmButtonText: '确定停止',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    ElMessage.success('任务已停止')
    fetchTaskList()
  } catch {}
}

const retryTask = async (task: TaskStatus) => {
  ElMessage.info('正在重试任务...')
  setTimeout(() => {
    ElMessage.success('任务重试已启动')
    fetchTaskList()
  }, 1000)
}

const restartTask = async (task: TaskStatus) => {
  ElMessage.info('正在重新执行任务...')
  setTimeout(() => {
    ElMessage.success('任务已重新启动')
    fetchTaskList()
  }, 1000)
}

const handleFilter = () => {
  pagination.currentPage = 1
  fetchTaskList()
}

const resetFilter = () => {
  Object.assign(filterForm, {
    status: '',
    sourceId: '',
    dateRange: []
  })
  handleFilter()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchTaskList()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  fetchTaskList()
}

const filterLogs = () => {
  // 日志筛选逻辑已在computed中实现
}

const refreshLogs = () => {
  if (selectedTask.value) {
    viewLogs(selectedTask.value)
  }
}

const downloadLogs = () => {
  const logsText = filteredLogs.value
    .map(log => `${log.timestamp} [${log.level.toUpperCase()}] ${log.message}`)
    .join('\n')
  
  const blob = new Blob([logsText], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `task_${selectedTask.value?.id}_logs.txt`
  a.click()
  URL.revokeObjectURL(url)
}

const startAutoRefresh = () => {
  if (refreshTimer) clearInterval(refreshTimer)
  if (countdownTimer) clearInterval(countdownTimer)
  
  refreshTimer = setInterval(() => {
    if (autoRefresh.value) {
      fetchTaskList()
      fetchStats()
    }
  }, 30000)
  
  countdownTimer = setInterval(() => {
    if (autoRefresh.value) {
      refreshCountdown.value -= 1
      if (refreshCountdown.value <= 0) {
        refreshCountdown.value = 30
      }
    }
  }, 1000)
}

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

onMounted(() => {
  refreshAll()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.task-monitor {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.dashboard {
  margin-bottom: 20px;
}

.metric-card {
  text-align: center;
}

.metric {
  padding: 20px;
}

.metric-value {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.metric-value.success { color: #67C23A; }
.metric-value.primary { color: #409EFF; }
.metric-value.warning { color: #E6A23C; }
.metric-value.info { color: #909399; }

.metric-label {
  font-size: 14px;
  color: #666;
}

.charts {
  margin-bottom: 20px;
}

.chart-container {
  padding: 10px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
}

.task-list-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.refresh-interval {
  font-size: 12px;
  color: #666;
}

.source-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.source-name {
  font-weight: 500;
}

.source-type {
  font-size: 12px;
}

.progress-text {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  text-align: center;
}

.progress-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.fetch-count {
  font-weight: 500;
  color: #409EFF;
}

.duration {
  font-size: 12px;
  color: #666;
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.task-detail {
  margin-bottom: 20px;
}

.task-config {
  margin-top: 20px;
}

.task-config h4 {
  margin-bottom: 10px;
  color: #333;
}

.log-container {
  max-height: 500px;
}

.log-header {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.log-content {
  max-height: 400px;
  overflow-y: auto;
  background: #f8f9fa;
  border-radius: 4px;
  padding: 15px;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
}

.log-item.log-info {
  background: #f0f9ff;
  border-left: 3px solid #409EFF;
}

.log-item.log-warning {
  background: #fdf6ec;
  border-left: 3px solid #E6A23C;
}

.log-item.log-error {
  background: #fef0f0;
  border-left: 3px solid #F56C6C;
}

.log-time {
  color: #666;
  font-size: 12px;
  min-width: 140px;
}

.log-message {
  flex: 1;
  color: #333;
}
</style>