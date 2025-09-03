<template>
  <div class="alert-management">
    <!-- 告警概览 -->
    <el-row :gutter="20" class="alert-overview">
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="metric-content">
            <div class="metric-icon critical">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ alertStats.total }}</div>
              <div class="metric-label">活跃告警</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="metric-content">
            <div class="metric-icon error">
              <el-icon><CircleCloseFilled /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ alertStats.byLevel.critical + alertStats.byLevel.error }}</div>
              <div class="metric-label">严重告警</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="metric-content">
            <div class="metric-icon warning">
              <el-icon><InfoFilled /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ alertStats.byLevel.warning }}</div>
              <div class="metric-label">警告</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card">
          <div class="metric-content">
            <div class="metric-icon success">
              <el-icon><CircleCheckFilled /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ Math.round(alertStats.avgResolutionTime / 1000 / 60) }}min</div>
              <div class="metric-label">平均解决时间</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 活跃告警列表 -->
      <el-col :span="14">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>活跃告警</span>
              <div class="header-actions">
                <el-button 
                  type="primary" 
                  size="small"
                  @click="showCreateRuleDialog"
                >
                  <el-icon><Plus /></el-icon>
                  新建规则
                </el-button>
                <el-button 
                  size="small"
                  @click="refreshAlerts"
                >
                  <el-icon><Refresh /></el-icon>
                  刷新
                </el-button>
              </div>
            </div>
          </template>

          <div class="alert-filters">
            <el-select 
              v-model="filterLevel" 
              placeholder="告警级别"
              clearable
              size="small"
              style="width: 120px; margin-right: 10px;"
              @change="filterAlerts"
            >
              <el-option label="严重" value="critical" />
              <el-option label="错误" value="error" />
              <el-option label="警告" value="warning" />
              <el-option label="信息" value="info" />
            </el-select>
            <el-select 
              v-model="filterType" 
              placeholder="告警类型"
              clearable
              size="small"
              style="width: 150px; margin-right: 10px;"
              @change="filterAlerts"
            >
              <el-option label="系统性能" value="system_performance" />
              <el-option label="数据库" value="database_slow_query" />
              <el-option label="队列积压" value="queue_backlog" />
              <el-option label="错误率" value="error_rate_high" />
            </el-select>
            <el-input 
              v-model="searchKeyword"
              placeholder="搜索告警"
              size="small"
              style="width: 200px;"
              @input="filterAlerts"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <el-table 
            :data="filteredAlerts" 
            style="width: 100%; margin-top: 15px;"
            max-height="400"
          >
            <el-table-column width="60">
              <template #default="scope">
                <div class="alert-level-indicator" :class="scope.row.level"></div>
              </template>
            </el-table-column>
            <el-table-column prop="title" label="标题" min-width="200">
              <template #default="scope">
                <div class="alert-title">{{ scope.row.title }}</div>
                <div class="alert-time">{{ formatTime(scope.row.timestamp) }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="120">
              <template #default="scope">
                <el-tag size="small">{{ getTypeLabel(scope.row.type) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="level" label="级别" width="80">
              <template #default="scope">
                <el-tag :type="getLevelTagType(scope.row.level)" size="small">
                  {{ getLevelLabel(scope.row.level) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="持续时间" width="100">
              <template #default="scope">
                {{ getDuration(scope.row.timestamp) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button 
                  type="text" 
                  size="small"
                  @click="viewAlertDetails(scope.row)"
                >
                  详情
                </el-button>
                <el-button 
                  type="text" 
                  size="small"
                  @click="resolveAlert(scope.row)"
                >
                  解决
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 告警规则管理 -->
      <el-col :span="10">
        <el-card>
          <template #header>
            <span>告警规则</span>
          </template>

          <el-table :data="alertRules" size="small" max-height="300">
            <el-table-column prop="name" label="规则名称" />
            <el-table-column prop="enabled" label="状态" width="80">
              <template #default="scope">
                <el-switch 
                  v-model="scope.row.enabled"
                  @change="toggleRule(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button 
                  type="text" 
                  size="small"
                  @click="editRule(scope.row)"
                >
                  编辑
                </el-button>
                <el-button 
                  type="text" 
                  size="small"
                  @click="deleteRule(scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 告警趋势图表 -->
        <el-card style="margin-top: 20px;">
          <template #header>
            <span>告警趋势</span>
          </template>
          <div id="alert-trend-chart" style="height: 200px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 告警详情对话框 -->
    <el-dialog 
      v-model="alertDetailVisible"
      title="告警详情"
      width="60%"
    >
      <div v-if="selectedAlert">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="告警ID">{{ selectedAlert.id }}</el-descriptions-item>
          <el-descriptions-item label="规则名称">{{ selectedAlert.ruleName }}</el-descriptions-item>
          <el-descriptions-item label="告警级别">
            <el-tag :type="getLevelTagType(selectedAlert.level)">
              {{ getLevelLabel(selectedAlert.level) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="告警类型">{{ getTypeLabel(selectedAlert.type) }}</el-descriptions-item>
          <el-descriptions-item label="触发时间">{{ formatTime(selectedAlert.timestamp) }}</el-descriptions-item>
          <el-descriptions-item label="持续时间">{{ getDuration(selectedAlert.timestamp) }}</el-descriptions-item>
          <el-descriptions-item label="标题" :span="2">{{ selectedAlert.title }}</el-descriptions-item>
          <el-descriptions-item label="详细信息" :span="2">{{ selectedAlert.message }}</el-descriptions-item>
        </el-descriptions>

        <h4 style="margin-top: 20px;">元数据</h4>
        <el-table :data="getMetadataArray(selectedAlert.metadata)" size="small">
          <el-table-column prop="key" label="键" width="200" />
          <el-table-column prop="value" label="值" />
        </el-table>

        <h4 style="margin-top: 20px;">通知动作</h4>
        <el-table :data="selectedAlert.actions" size="small">
          <el-table-column prop="type" label="类型" width="100" />
          <el-table-column prop="target" label="目标" />
          <el-table-column prop="success" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.success ? 'success' : 'danger'" size="small">
                {{ scope.row.success ? '成功' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="timestamp" label="执行时间" width="150">
            <template #default="scope">
              {{ formatTime(scope.row.timestamp) }}
            </template>
          </el-table-column>
        </el-table>
      </div>

      <template #footer>
        <div>
          <el-button @click="alertDetailVisible = false">关闭</el-button>
          <el-button 
            v-if="selectedAlert && !selectedAlert.resolved"
            type="primary" 
            @click="resolveAlertFromDetail"
          >
            解决告警
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 创建/编辑规则对话框 -->
    <el-dialog 
      v-model="ruleDialogVisible"
      :title="editingRule ? '编辑告警规则' : '创建告警规则'"
      width="70%"
    >
      <el-form 
        ref="ruleFormRef"
        :model="ruleForm" 
        :rules="ruleFormRules"
        label-width="100px"
      >
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="ruleForm.name" placeholder="输入规则名称" />
        </el-form-item>
        
        <el-form-item label="规则描述">
          <el-input 
            v-model="ruleForm.description" 
            type="textarea" 
            placeholder="输入规则描述"
            :rows="2"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="告警类型" prop="type">
              <el-select v-model="ruleForm.type" placeholder="选择告警类型">
                <el-option label="系统性能" value="system_performance" />
                <el-option label="数据库慢查询" value="database_slow_query" />
                <el-option label="队列积压" value="queue_backlog" />
                <el-option label="错误率过高" value="error_rate_high" />
                <el-option label="审核延迟" value="audit_delay" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="告警级别" prop="level">
              <el-select v-model="ruleForm.level" placeholder="选择告警级别">
                <el-option label="信息" value="info" />
                <el-option label="警告" value="warning" />
                <el-option label="错误" value="error" />
                <el-option label="严重" value="critical" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="触发条件">
          <div v-for="(condition, index) in ruleForm.conditions" :key="index" class="condition-item">
            <el-row :gutter="10">
              <el-col :span="6">
                <el-input v-model="condition.metric" placeholder="指标名称" />
              </el-col>
              <el-col :span="4">
                <el-select v-model="condition.operator" placeholder="操作符">
                  <el-option label="大于" value=">" />
                  <el-option label="小于" value="<" />
                  <el-option label="等于" value="=" />
                  <el-option label="大于等于" value=">=" />
                  <el-option label="小于等于" value="<=" />
                  <el-option label="不等于" value="!=" />
                </el-select>
              </el-col>
              <el-col :span="4">
                <el-input-number v-model="condition.threshold" placeholder="阈值" :min="0" />
              </el-col>
              <el-col :span="4">
                <el-input-number 
                  v-model="condition.duration" 
                  placeholder="持续时间(秒)"
                  :min="0"
                />
              </el-col>
              <el-col :span="2">
                <el-button 
                  type="danger" 
                  icon="Delete"
                  size="small"
                  @click="removeCondition(index)"
                />
              </el-col>
            </el-row>
          </div>
          <el-button 
            type="dashed" 
            style="width: 100%; margin-top: 10px;"
            @click="addCondition"
          >
            <el-icon><Plus /></el-icon>
            添加条件
          </el-button>
        </el-form-item>

        <el-form-item label="通知方式">
          <div v-for="(action, index) in ruleForm.actions" :key="index" class="action-item">
            <el-row :gutter="10">
              <el-col :span="6">
                <el-select v-model="action.type" placeholder="通知类型">
                  <el-option label="邮件" value="email" />
                  <el-option label="短信" value="sms" />
                  <el-option label="Webhook" value="webhook" />
                  <el-option label="Slack" value="slack" />
                </el-select>
              </el-col>
              <el-col :span="10">
                <el-input v-model="action.target" placeholder="通知目标" />
              </el-col>
              <el-col :span="6">
                <el-input v-model="action.template" placeholder="模板(可选)" />
              </el-col>
              <el-col :span="2">
                <el-button 
                  type="danger" 
                  icon="Delete"
                  size="small"
                  @click="removeAction(index)"
                />
              </el-col>
            </el-row>
          </div>
          <el-button 
            type="dashed" 
            style="width: 100%; margin-top: 10px;"
            @click="addAction"
          >
            <el-icon><Plus /></el-icon>
            添加通知方式
          </el-button>
        </el-form-item>

        <el-form-item label="冷却时间">
          <el-input-number 
            v-model="ruleForm.cooldown" 
            placeholder="秒"
            :min="60"
            :max="86400"
          />
          <span style="margin-left: 10px; color: #999;">告警触发后的静默时间</span>
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="ruleForm.enabled">启用规则</el-checkbox>
        </el-form-item>
      </el-form>

      <template #footer>
        <div>
          <el-button @click="ruleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRule">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import {
  Warning,
  CircleCloseFilled,
  InfoFilled,
  CircleCheckFilled,
  Plus,
  Refresh,
  Search,
  Delete
} from '@element-plus/icons-vue'
import { auditAlertSystem, type AlertRule, type AlertEvent, AlertType, AlertLevel } from '@/api/auditAlertSystem'

// 响应式数据
const alertStats = reactive({
  total: 0,
  byLevel: {
    critical: 0,
    error: 0,
    warning: 0,
    info: 0
  },
  byType: {},
  resolved: 0,
  avgResolutionTime: 0
})

const activeAlerts = ref<AlertEvent[]>([])
const filteredAlerts = ref<AlertEvent[]>([])
const alertRules = ref<AlertRule[]>([])

// 过滤条件
const filterLevel = ref('')
const filterType = ref('')
const searchKeyword = ref('')

// 对话框状态
const alertDetailVisible = ref(false)
const ruleDialogVisible = ref(false)
const selectedAlert = ref<AlertEvent | null>(null)
const editingRule = ref<AlertRule | null>(null)

// 表单数据
const ruleForm = reactive({
  name: '',
  description: '',
  type: '',
  level: '',
  enabled: true,
  conditions: [
    {
      metric: '',
      operator: '>',
      threshold: 0,
      duration: 300
    }
  ],
  actions: [
    {
      type: 'email',
      target: '',
      template: ''
    }
  ],
  cooldown: 1800
})

const ruleFormRules = {
  name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择告警类型', trigger: 'change' }],
  level: [{ required: true, message: '请选择告警级别', trigger: 'change' }]
}

const ruleFormRef = ref()

let chartInstance: echarts.EChartsType | null = null
let refreshTimer: NodeJS.Timeout | null = null

// 生命周期
onMounted(async () => {
  await loadData()
  initChart()
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
async function loadData() {
  try {
    const [alerts, rules, stats] = await Promise.all([
      auditAlertSystem.getActiveAlerts(),
      auditAlertSystem.getRules(),
      auditAlertSystem.getAlertStats()
    ])

    activeAlerts.value = alerts
    filteredAlerts.value = alerts
    alertRules.value = rules
    Object.assign(alertStats, stats)
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  }
}

function filterAlerts() {
  let filtered = [...activeAlerts.value]

  if (filterLevel.value) {
    filtered = filtered.filter(alert => alert.level === filterLevel.value)
  }

  if (filterType.value) {
    filtered = filtered.filter(alert => alert.type === filterType.value)
  }

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(alert => 
      alert.title.toLowerCase().includes(keyword) ||
      alert.message.toLowerCase().includes(keyword)
    )
  }

  filteredAlerts.value = filtered
}

function refreshAlerts() {
  loadData()
}

function viewAlertDetails(alert: AlertEvent) {
  selectedAlert.value = alert
  alertDetailVisible.value = true
}

async function resolveAlert(alert: AlertEvent) {
  try {
    await ElMessageBox.confirm(
      `确认解决告警 "${alert.title}"？`,
      '确认操作',
      { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' }
    )

    const success = await auditAlertSystem.resolveAlert(alert.id, 'admin')
    if (success) {
      ElMessage.success('告警已解决')
      await loadData()
    } else {
      ElMessage.error('解决告警失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

function resolveAlertFromDetail() {
  if (selectedAlert.value) {
    resolveAlert(selectedAlert.value)
    alertDetailVisible.value = false
  }
}

function showCreateRuleDialog() {
  editingRule.value = null
  resetRuleForm()
  ruleDialogVisible.value = true
}

function editRule(rule: AlertRule) {
  editingRule.value = rule
  Object.assign(ruleForm, {
    ...rule,
    conditions: [...rule.conditions],
    actions: [...rule.actions]
  })
  ruleDialogVisible.value = true
}

async function toggleRule(rule: AlertRule) {
  try {
    const success = auditAlertSystem.updateRule(rule.id, { enabled: rule.enabled })
    if (success) {
      ElMessage.success(`规则已${rule.enabled ? '启用' : '禁用'}`)
    } else {
      ElMessage.error('更新规则失败')
      rule.enabled = !rule.enabled // 回滚
    }
  } catch (error) {
    ElMessage.error('操作失败')
    rule.enabled = !rule.enabled // 回滚
  }
}

async function deleteRule(rule: AlertRule) {
  try {
    await ElMessageBox.confirm(
      `确认删除规则 "${rule.name}"？`,
      '确认删除',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
    )

    const success = auditAlertSystem.removeRule(rule.id)
    if (success) {
      ElMessage.success('规则已删除')
      await loadData()
    } else {
      ElMessage.error('删除规则失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

function addCondition() {
  ruleForm.conditions.push({
    metric: '',
    operator: '>',
    threshold: 0,
    duration: 300
  })
}

function removeCondition(index: number) {
  if (ruleForm.conditions.length > 1) {
    ruleForm.conditions.splice(index, 1)
  }
}

function addAction() {
  ruleForm.actions.push({
    type: 'email',
    target: '',
    template: ''
  })
}

function removeAction(index: number) {
  if (ruleForm.actions.length > 1) {
    ruleForm.actions.splice(index, 1)
  }
}

async function saveRule() {
  try {
    await ruleFormRef.value.validate()

    const rule: AlertRule = {
      ...ruleForm,
      id: editingRule.value?.id || `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    if (editingRule.value) {
      const success = auditAlertSystem.updateRule(rule.id, rule)
      if (success) {
        ElMessage.success('规则更新成功')
      } else {
        ElMessage.error('更新规则失败')
        return
      }
    } else {
      auditAlertSystem.addRule(rule)
      ElMessage.success('规则创建成功')
    }

    ruleDialogVisible.value = false
    await loadData()
  } catch (error) {
    console.error('保存规则失败:', error)
  }
}

function resetRuleForm() {
  Object.assign(ruleForm, {
    name: '',
    description: '',
    type: '',
    level: '',
    enabled: true,
    conditions: [
      {
        metric: '',
        operator: '>',
        threshold: 0,
        duration: 300
      }
    ],
    actions: [
      {
        type: 'email',
        target: '',
        template: ''
      }
    ],
    cooldown: 1800
  })
}

function initChart() {
  const chartDom = document.getElementById('alert-trend-chart')
  if (!chartDom) return

  chartInstance = echarts.init(chartDom)
  updateChart()
}

function updateChart() {
  if (!chartInstance) return

  // 生成模拟数据
  const now = Date.now()
  const data = []
  
  for (let i = 23; i >= 0; i--) {
    const timestamp = now - i * 60 * 60 * 1000
    const value = Math.floor(Math.random() * 10 + 2)
    data.push([new Date(timestamp), value])
  }

  const option = {
    title: {
      text: '24小时告警趋势',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params: any) {
        const time = new Date(params[0].data[0]).toLocaleTimeString()
        return `${time}<br/>告警数量: ${params[0].data[1]}`
      }
    },
    xAxis: {
      type: 'time',
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '告警数量',
      splitLine: { lineStyle: { type: 'dashed' } }
    },
    series: [{
      name: '告警数量',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: { color: '#ff6b6b' },
      itemStyle: { color: '#ff6b6b' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(255, 107, 107, 0.3)' },
            { offset: 1, color: 'rgba(255, 107, 107, 0.1)' }
          ]
        }
      },
      data
    }]
  }

  chartInstance.setOption(option)
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

function getDuration(startTime: number): string {
  const duration = Date.now() - startTime
  const minutes = Math.floor(duration / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}天`
  if (hours > 0) return `${hours}小时`
  return `${minutes}分钟`
}

function getLevelLabel(level: AlertLevel): string {
  const labels = {
    [AlertLevel.INFO]: '信息',
    [AlertLevel.WARNING]: '警告',
    [AlertLevel.ERROR]: '错误',
    [AlertLevel.CRITICAL]: '严重'
  }
  return labels[level] || level
}

function getLevelTagType(level: AlertLevel): string {
  const types = {
    [AlertLevel.INFO]: 'info',
    [AlertLevel.WARNING]: 'warning',
    [AlertLevel.ERROR]: 'danger',
    [AlertLevel.CRITICAL]: 'danger'
  }
  return types[level] || 'info'
}

function getTypeLabel(type: AlertType): string {
  const labels = {
    [AlertType.SYSTEM_PERFORMANCE]: '系统性能',
    [AlertType.DATABASE_SLOW_QUERY]: '数据库',
    [AlertType.QUEUE_BACKLOG]: '队列积压',
    [AlertType.ERROR_RATE_HIGH]: '错误率',
    [AlertType.AUDIT_DELAY]: '审核延迟',
    [AlertType.SENSITIVE_CONTENT]: '敏感内容',
    [AlertType.FRAUD_DETECTION]: '欺诈检测',
    [AlertType.POLICY_VIOLATION]: '策略违规'
  }
  return labels[type] || type
}

function getMetadataArray(metadata: Record<string, any>) {
  return Object.entries(metadata).map(([key, value]) => ({
    key,
    value: typeof value === 'object' ? JSON.stringify(value) : String(value)
  }))
}

function startAutoRefresh() {
  refreshTimer = setInterval(() => {
    loadData()
  }, 30000) // 30秒刷新一次
}
</script>

<style scoped>
.alert-management {
  padding: 20px;
}

.alert-overview {
  margin-bottom: 20px;
}

.overview-card {
  height: 100px;
}

.metric-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.metric-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
  color: white;
}

.metric-icon.critical {
  background-color: #f56c6c;
}

.metric-icon.error {
  background-color: #e6a23c;
}

.metric-icon.warning {
  background-color: #909399;
}

.metric-icon.success {
  background-color: #67c23a;
}

.metric-info {
  flex: 1;
}

.metric-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.metric-label {
  font-size: 14px;
  color: #606266;
  margin-top: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.alert-filters {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.alert-level-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin: 0 auto;
}

.alert-level-indicator.critical {
  background-color: #f56c6c;
}

.alert-level-indicator.error {
  background-color: #e6a23c;
}

.alert-level-indicator.warning {
  background-color: #909399;
}

.alert-level-indicator.info {
  background-color: #409eff;
}

.alert-title {
  font-weight: 500;
  color: #303133;
}

.alert-time {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.condition-item,
.action-item {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

:deep(.el-descriptions__body .el-descriptions__table) {
  table-layout: auto;
}
</style>