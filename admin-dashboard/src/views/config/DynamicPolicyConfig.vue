<template>
  <div class="dynamic-policy-config">
    <UnifiedPageHeader 
      title="动态策略配置" 
      description="实时调整审核策略，响应业务需求变化"
    />

    <!-- 策略状态监控 -->
    <el-card class="monitoring-card">
      <template #header>
        <div class="card-header">
          <el-icon><Monitor /></el-icon>
          <span class="card-title">策略状态监控</span>
          <el-button type="primary" size="small" @click="refreshMonitoring">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-row :gutter="16">
        <el-col :span="6" v-for="metric in monitoringMetrics" :key="metric.key">
          <div class="metric-card" :class="metric.status">
            <div class="metric-icon">
              <el-icon>
                <component :is="metric.icon" />
              </el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ metric.value }}</div>
              <div class="metric-label">{{ metric.label }}</div>
              <div class="metric-trend" v-if="metric.trend">
                <span :class="metric.trend > 0 ? 'trend-up' : 'trend-down'">
                  {{ metric.trend > 0 ? '+' : '' }}{{ metric.trend }}%
                </span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 动态配置规则 -->
    <el-card class="rules-card">
      <template #header>
        <div class="card-header">
          <el-icon><Setting /></el-icon>
          <span class="card-title">动态配置规则</span>
          <el-button type="primary" @click="showCreateRuleDialog">
            <el-icon><Plus /></el-icon>
            新建规则
          </el-button>
        </div>
      </template>

      <el-table :data="configRules" v-loading="loadingRules">
        <el-table-column prop="name" label="规则名称" width="150" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column label="触发条件" width="200">
          <template #default="{ row }">
            <div class="conditions-tags">
              <el-tag 
                v-for="condition in getConditionTags(row.conditions)" 
                :key="condition"
                size="small"
                class="condition-tag"
              >
                {{ condition }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="执行动作" width="200">
          <template #default="{ row }">
            <div class="actions-tags">
              <el-tag 
                v-for="action in getActionTags(row.actions)" 
                :key="action"
                type="success"
                size="small"
                class="action-tag"
              >
                {{ action }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="80">
          <template #default="{ row }">
            <el-tag :type="getPriorityTag(row.priority)" size="small">
              {{ row.priority }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="状态" width="80">
          <template #default="{ row }">
            <el-switch 
              v-model="row.enabled" 
              @change="toggleRule(row)"
              :loading="row.toggling"
            />
          </template>
        </el-table-column>
        <el-table-column prop="lastTrigger" label="最后触发" width="160">
          <template #default="{ row }">
            {{ row.lastTrigger ? formatTime(row.lastTrigger) : '未触发' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editRule(row)">编辑</el-button>
            <el-button size="small" @click="testRule(row)">测试</el-button>
            <el-button size="small" type="danger" @click="deleteRule(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 策略快照管理 -->
    <el-card class="snapshots-card">
      <template #header>
        <div class="card-header">
          <el-icon><Camera /></el-icon>
          <span class="card-title">策略快照</span>
          <el-button type="primary" @click="showCreateSnapshotDialog">
            <el-icon><Camera /></el-icon>
            创建快照
          </el-button>
        </div>
      </template>

      <el-table :data="policySnapshots" v-loading="loadingSnapshots">
        <el-table-column prop="name" label="快照名称" width="150" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column label="策略数量" width="100">
          <template #default="{ row }">
            {{ row.policies.length }}
          </template>
        </el-table-column>
        <el-table-column prop="creatorName" label="创建人" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'" size="small">
              {{ row.isActive ? '活跃' : '历史' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewSnapshot(row)">查看</el-button>
            <el-button size="small" type="warning" @click="restoreSnapshot(row)">
              恢复
            </el-button>
            <el-button size="small" type="danger" @click="deleteSnapshot(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 变更历史 -->
    <el-card class="history-card">
      <template #header>
        <div class="card-header">
          <el-icon><Clock /></el-icon>
          <span class="card-title">变更历史</span>
          <div class="header-actions">
            <el-select v-model="historyFilter.changeType" size="small" placeholder="变更类型">
              <el-option label="全部" value="" />
              <el-option label="策略更新" value="policy_updated" />
              <el-option label="策略启用" value="policy_enabled" />
              <el-option label="策略禁用" value="policy_disabled" />
            </el-select>
            <el-date-picker
              v-model="historyFilter.dateRange"
              type="daterange"
              size="small"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
            <el-button size="small" @click="loadChangeHistory">查询</el-button>
          </div>
        </div>
      </template>

      <el-table :data="changeHistory" v-loading="loadingHistory">
        <el-table-column prop="timestamp" label="时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.timestamp) }}
          </template>
        </el-table-column>
        <el-table-column prop="changeType" label="变更类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getChangeTypeTag(row.changeType)" size="small">
              {{ getChangeTypeLabel(row.changeType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="policyId" label="策略ID" width="80" />
        <el-table-column prop="operatorName" label="操作人" width="100" />
        <el-table-column prop="reason" label="原因" min-width="150" />
        <el-table-column label="变更内容" min-width="200">
          <template #default="{ row }">
            <div class="change-content">
              <el-button type="text" size="small" @click="viewChangeDetail(row)">
                查看详情
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button 
              size="small" 
              type="warning" 
              @click="rollbackChange(row)"
              :disabled="!canRollback(row)"
            >
              回滚
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建规则弹窗 -->
    <el-dialog v-model="ruleDialogVisible" :title="isEditingRule ? '编辑规则' : '创建规则'" width="800px">
      <el-form :model="ruleForm" :rules="ruleRules" ref="ruleFormRef" label-width="100px">
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="ruleForm.name" placeholder="输入规则名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="ruleForm.description" type="textarea" rows="2" />
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-input-number v-model="ruleForm.priority" :min="1" :max="100" />
        </el-form-item>
        
        <!-- 触发条件 -->
        <el-form-item label="触发条件">
          <el-collapse v-model="activeConditions">
            <el-collapse-item title="时间范围" name="timeRange">
              <el-checkbox v-model="ruleForm.conditions.enableTimeRange" label="启用时间范围触发" />
              <div v-if="ruleForm.conditions.enableTimeRange" class="condition-config">
                <el-row :gutter="16">
                  <el-col :span="12">
                    <el-date-picker
                      v-model="ruleForm.conditions.timeRange.start"
                      type="datetime"
                      placeholder="开始时间"
                      style="width: 100%"
                    />
                  </el-col>
                  <el-col :span="12">
                    <el-date-picker
                      v-model="ruleForm.conditions.timeRange.end"
                      type="datetime"
                      placeholder="结束时间"
                      style="width: 100%"
                    />
                  </el-col>
                </el-row>
              </div>
            </el-collapse-item>
            
            <el-collapse-item title="事件触发" name="events">
              <el-checkbox v-model="ruleForm.conditions.enableEvents" label="启用事件触发" />
              <div v-if="ruleForm.conditions.enableEvents" class="condition-config">
                <el-select 
                  v-model="ruleForm.conditions.triggerEvents" 
                  multiple 
                  placeholder="选择触发事件"
                  style="width: 100%"
                >
                  <el-option label="任务积压过多" value="task_backlog" />
                  <el-option label="错误率过高" value="high_error_rate" />
                  <el-option label="处理时间过长" value="slow_processing" />
                  <el-option label="审核员负载过重" value="auditor_overload" />
                </el-select>
              </div>
            </el-collapse-item>
            
            <el-collapse-item title="阈值触发" name="thresholds">
              <el-checkbox v-model="ruleForm.conditions.enableThresholds" label="启用阈值触发" />
              <div v-if="ruleForm.conditions.enableThresholds" class="condition-config">
                <el-row :gutter="16">
                  <el-col :span="8">
                    <el-input-number 
                      v-model="ruleForm.conditions.thresholds.taskCount" 
                      placeholder="任务数量阈值"
                    />
                  </el-col>
                  <el-col :span="8">
                    <el-input-number 
                      v-model="ruleForm.conditions.thresholds.errorRate" 
                      placeholder="错误率阈值(%)"
                      :max="100"
                    />
                  </el-col>
                  <el-col :span="8">
                    <el-input-number 
                      v-model="ruleForm.conditions.thresholds.avgProcessTime" 
                      placeholder="平均处理时间(分钟)"
                    />
                  </el-col>
                </el-row>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-form-item>

        <!-- 执行动作 -->
        <el-form-item label="执行动作">
          <el-collapse v-model="activeActions">
            <el-collapse-item title="策略调整" name="policyAdjust">
              <el-checkbox v-model="ruleForm.actions.enablePolicyAdjust" label="启用策略调整" />
              <div v-if="ruleForm.actions.enablePolicyAdjust" class="action-config">
                <el-select v-model="ruleForm.actions.targetPolicyId" placeholder="选择策略">
                  <el-option 
                    v-for="policy in availablePolicies" 
                    :key="policy.id"
                    :label="policy.name"
                    :value="policy.id"
                  />
                </el-select>
                <el-select v-model="ruleForm.actions.adjustmentType" placeholder="调整类型">
                  <el-option label="修改抽样率" value="sample_rate" />
                  <el-option label="修改优先级" value="priority" />
                  <el-option label="启用/禁用" value="toggle" />
                </el-select>
              </div>
            </el-collapse-item>
            
            <el-collapse-item title="通知告警" name="notification">
              <el-checkbox v-model="ruleForm.actions.enableNotification" label="启用通知告警" />
              <div v-if="ruleForm.actions.enableNotification" class="action-config">
                <el-input 
                  v-model="ruleForm.actions.notificationMessage" 
                  placeholder="通知消息模板"
                  type="textarea"
                  rows="2"
                />
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="ruleForm.enabled" label="立即启用此规则" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRule" :loading="savingRule">
          {{ isEditingRule ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 创建快照弹窗 -->
    <el-dialog v-model="snapshotDialogVisible" title="创建策略快照" width="600px">
      <el-form :model="snapshotForm" label-width="100px">
        <el-form-item label="快照名称" required>
          <el-input v-model="snapshotForm.name" placeholder="输入快照名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="snapshotForm.description" type="textarea" rows="3" />
        </el-form-item>
        <el-form-item label="包含策略">
          <el-checkbox-group v-model="snapshotForm.policyIds">
            <el-checkbox 
              v-for="policy in availablePolicies" 
              :key="policy.id"
              :label="policy.id"
            >
              {{ policy.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="snapshotDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createSnapshot" :loading="creatingSnapshot">
          创建
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import {
  Monitor,
  Refresh,
  Setting,
  Plus,
  Camera,
  Clock,
  TrendCharts,
  Warning,
  Bell
} from '@element-plus/icons-vue'
import { auditPolicyDynamicManager } from '@/api/auditPolicyDynamic'

// 响应式数据
const loadingRules = ref(false)
const loadingSnapshots = ref(false)
const loadingHistory = ref(false)
const savingRule = ref(false)
const creatingSnapshot = ref(false)

// 弹窗控制
const ruleDialogVisible = ref(false)
const snapshotDialogVisible = ref(false)
const isEditingRule = ref(false)
const currentRule = ref(null)

// 表单引用
const ruleFormRef = ref()

// 折叠面板控制
const activeConditions = ref(['timeRange'])
const activeActions = ref(['policyAdjust'])

// 监控指标
const monitoringMetrics = ref([
  {
    key: 'activeRules',
    label: '活跃规则',
    value: 3,
    icon: 'Setting',
    status: 'success',
    trend: 12
  },
  {
    key: 'todayTriggers',
    label: '今日触发',
    value: 18,
    icon: 'TrendCharts',
    status: 'primary',
    trend: 5
  },
  {
    key: 'autoAdjustments',
    label: '自动调整',
    value: 7,
    icon: 'Refresh',
    status: 'warning',
    trend: -2
  },
  {
    key: 'policyChanges',
    label: '策略变更',
    value: 25,
    icon: 'Bell',
    status: 'info',
    trend: 8
  }
])

// 配置规则列表
const configRules = ref([])

// 策略快照列表
const policySnapshots = ref([])

// 变更历史
const changeHistory = ref([])

// 可用策略列表
const availablePolicies = ref([])

// 历史查询过滤器
const historyFilter = reactive({
  changeType: '',
  dateRange: null
})

// 规则表单
const ruleForm = reactive({
  name: '',
  description: '',
  priority: 50,
  conditions: {
    enableTimeRange: false,
    timeRange: {
      start: null,
      end: null
    },
    enableEvents: false,
    triggerEvents: [],
    enableThresholds: false,
    thresholds: {
      taskCount: null,
      errorRate: null,
      avgProcessTime: null
    }
  },
  actions: {
    enablePolicyAdjust: false,
    targetPolicyId: null,
    adjustmentType: '',
    enableNotification: false,
    notificationMessage: ''
  },
  enabled: true
})

// 快照表单
const snapshotForm = reactive({
  name: '',
  description: '',
  policyIds: []
})

// 表单验证规则
const ruleRules = {
  name: [
    { required: true, message: '请输入规则名称', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入规则描述', trigger: 'blur' }
  ],
  priority: [
    { required: true, message: '请设置优先级', trigger: 'blur' }
  ]
}

// 方法
const refreshMonitoring = async () => {
  // 刷新监控数据
  console.log('刷新监控数据')
}

const showCreateRuleDialog = () => {
  isEditingRule.value = false
  resetRuleForm()
  ruleDialogVisible.value = true
}

const editRule = (rule: any) => {
  isEditingRule.value = true
  currentRule.value = rule
  
  // 填充表单
  Object.assign(ruleForm, {
    name: rule.name,
    description: rule.description,
    priority: rule.priority,
    enabled: rule.enabled,
    // ... 其他字段
  })
  
  ruleDialogVisible.value = true
}

const testRule = async (rule: any) => {
  try {
    ElMessage.info('正在测试规则...')
    
    // 模拟测试规则逻辑
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    ElMessage.success('规则测试通过！')
  } catch (error) {
    ElMessage.error('规则测试失败')
  }
}

const deleteRule = async (rule: any) => {
  try {
    await ElMessageBox.confirm(
      `确认删除规则"${rule.name}"？`,
      '确认删除',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.success('删除成功')
    await loadConfigRules()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const toggleRule = async (rule: any) => {
  rule.toggling = true
  try {
    // 切换规则状态
    ElMessage.success(`${rule.enabled ? '启用' : '禁用'}成功`)
  } catch (error) {
    rule.enabled = !rule.enabled // 恢复状态
    ElMessage.error('操作失败')
  } finally {
    rule.toggling = false
  }
}

const saveRule = async () => {
  try {
    await ruleFormRef.value.validate()
    
    savingRule.value = true
    
    if (isEditingRule.value) {
      // 更新规则
      ElMessage.success('规则更新成功')
    } else {
      // 创建规则
      await auditPolicyDynamicManager.createConfigRule(ruleForm as any)
      ElMessage.success('规则创建成功')
    }
    
    ruleDialogVisible.value = false
    await loadConfigRules()
    
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    savingRule.value = false
  }
}

const showCreateSnapshotDialog = () => {
  resetSnapshotForm()
  snapshotDialogVisible.value = true
}

const createSnapshot = async () => {
  if (!snapshotForm.name) {
    ElMessage.warning('请输入快照名称')
    return
  }

  creatingSnapshot.value = true
  try {
    await auditPolicyDynamicManager.createSnapshot(snapshotForm.name, {
      description: snapshotForm.description,
      policies: snapshotForm.policyIds
    })
    
    ElMessage.success('快照创建成功')
    snapshotDialogVisible.value = false
    await loadPolicySnapshots()
    
  } catch (error) {
    ElMessage.error('创建失败')
  } finally {
    creatingSnapshot.value = false
  }
}

const viewSnapshot = (snapshot: any) => {
  // 查看快照详情
  console.log('查看快照:', snapshot)
}

const restoreSnapshot = async (snapshot: any) => {
  try {
    await ElMessageBox.confirm(
      `确认恢复到快照"${snapshot.name}"？此操作将覆盖当前策略配置。`,
      '确认恢复',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await auditPolicyDynamicManager.restoreFromSnapshot(snapshot.id)
    ElMessage.success('快照恢复成功')
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('恢复失败')
    }
  }
}

const deleteSnapshot = async (snapshot: any) => {
  try {
    await ElMessageBox.confirm(
      `确认删除快照"${snapshot.name}"？`,
      '确认删除',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.success('删除成功')
    await loadPolicySnapshots()
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const loadChangeHistory = async () => {
  loadingHistory.value = true
  try {
    const filters = {
      changeType: historyFilter.changeType || undefined,
      dateRange: historyFilter.dateRange || undefined,
      limit: 50
    }
    
    changeHistory.value = await auditPolicyDynamicManager.getPolicyChangeHistory(filters)
    
  } catch (error) {
    ElMessage.error('加载变更历史失败')
  } finally {
    loadingHistory.value = false
  }
}

const viewChangeDetail = (change: any) => {
  // 查看变更详情
  console.log('查看变更详情:', change)
}

const rollbackChange = async (change: any) => {
  try {
    await ElMessageBox.confirm(
      `确认回滚此变更？`,
      '确认回滚',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await auditPolicyDynamicManager.rollbackPolicyChange(change.id)
    ElMessage.success('回滚成功')
    await loadChangeHistory()
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('回滚失败')
    }
  }
}

const canRollback = (change: any) => {
  return !change.rollbackAt && change.oldConfig
}

// 数据加载方法
const loadConfigRules = async () => {
  loadingRules.value = true
  try {
    // 加载配置规则
    configRules.value = [
      {
        id: '1',
        name: '高峰期策略',
        description: '工作时间内提高审核优先级',
        conditions: { timeRange: true, events: false, thresholds: false },
        actions: { policyAdjust: true, notification: false },
        priority: 80,
        enabled: true,
        lastTrigger: '2024-01-15 14:30:00'
      }
    ]
  } catch (error) {
    ElMessage.error('加载配置规则失败')
  } finally {
    loadingRules.value = false
  }
}

const loadPolicySnapshots = async () => {
  loadingSnapshots.value = true
  try {
    // 加载策略快照
    policySnapshots.value = [
      {
        id: '1',
        name: '基础配置',
        description: '系统初始化时的策略配置',
        policies: [1, 2, 3],
        creatorName: '管理员',
        createTime: '2024-01-15 10:00:00',
        isActive: false
      }
    ]
  } catch (error) {
    ElMessage.error('加载策略快照失败')
  } finally {
    loadingSnapshots.value = false
  }
}

const loadAvailablePolicies = async () => {
  try {
    // 加载可用策略
    availablePolicies.value = [
      { id: 1, name: '论坛帖子审核策略' },
      { id: 2, name: '跳蚤市场审核策略' },
      { id: 3, name: '资讯文章审核策略' }
    ]
  } catch (error) {
    console.error('加载可用策略失败:', error)
  }
}

// 工具方法
const resetRuleForm = () => {
  Object.assign(ruleForm, {
    name: '',
    description: '',
    priority: 50,
    conditions: {
      enableTimeRange: false,
      timeRange: { start: null, end: null },
      enableEvents: false,
      triggerEvents: [],
      enableThresholds: false,
      thresholds: { taskCount: null, errorRate: null, avgProcessTime: null }
    },
    actions: {
      enablePolicyAdjust: false,
      targetPolicyId: null,
      adjustmentType: '',
      enableNotification: false,
      notificationMessage: ''
    },
    enabled: true
  })
}

const resetSnapshotForm = () => {
  Object.assign(snapshotForm, {
    name: '',
    description: '',
    policyIds: []
  })
}

const getConditionTags = (conditions: any) => {
  const tags = []
  if (conditions.timeRange) tags.push('时间范围')
  if (conditions.triggerEvents) tags.push('事件触发')
  if (conditions.thresholds) tags.push('阈值触发')
  return tags
}

const getActionTags = (actions: any) => {
  const tags = []
  if (actions.modifyPolicy) tags.push('策略调整')
  if (actions.enablePolicy) tags.push('策略启用')
  if (actions.adjustSampleRate) tags.push('抽样调整')
  return tags
}

const getPriorityTag = (priority: number) => {
  if (priority >= 80) return 'danger'
  if (priority >= 50) return 'warning'
  return 'info'
}

const getChangeTypeTag = (changeType: string) => {
  const tags = {
    policy_updated: 'primary',
    policy_enabled: 'success',
    policy_disabled: 'warning',
    policy_created: 'success',
    policy_deleted: 'danger'
  }
  return tags[changeType] || 'info'
}

const getChangeTypeLabel = (changeType: string) => {
  const labels = {
    policy_updated: '策略更新',
    policy_enabled: '策略启用',
    policy_disabled: '策略禁用',
    policy_created: '策略创建',
    policy_deleted: '策略删除'
  }
  return labels[changeType] || changeType
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadConfigRules()
  loadPolicySnapshots()
  loadChangeHistory()
  loadAvailablePolicies()
})
</script>

<style scoped>
.dynamic-policy-config {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.page-description {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header .card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.monitoring-card,
.rules-card,
.snapshots-card,
.history-card {
  margin-bottom: 20px;
}

.metric-card {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #ebeef5;
  transition: all 0.3s ease;
}

.metric-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.metric-card.success {
  border-color: #67c23a;
}

.metric-card.primary {
  border-color: #409eff;
}

.metric-card.warning {
  border-color: #e6a23c;
}

.metric-card.info {
  border-color: #909399;
}

.metric-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 18px;
}

.metric-card.success .metric-icon {
  background: #f0f9ff;
  color: #67c23a;
}

.metric-card.primary .metric-icon {
  background: #ecf5ff;
  color: #409eff;
}

.metric-card.warning .metric-icon {
  background: #fdf6ec;
  color: #e6a23c;
}

.metric-card.info .metric-icon {
  background: #f4f4f5;
  color: #909399;
}

.metric-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
}

.metric-label {
  color: #909399;
  font-size: 14px;
  margin-top: 4px;
}

.metric-trend {
  margin-top: 4px;
  font-size: 12px;
}

.trend-up {
  color: #67c23a;
}

.trend-down {
  color: #f56c6c;
}

.conditions-tags,
.actions-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.condition-tag,
.action-tag {
  margin: 0;
}

.condition-config,
.action-config {
  margin-top: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
}

.change-content {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>