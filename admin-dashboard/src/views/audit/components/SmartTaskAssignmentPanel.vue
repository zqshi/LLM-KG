<template>
  <div class="smart-assignment-panel">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon><UserFilled /></el-icon>
          <span class="card-title">智能任务分配</span>
          <el-tag type="info" size="small">AI驱动</el-tag>
        </div>
      </template>

      <!-- 分配策略选择 -->
      <div class="assignment-strategy">
        <el-form :model="assignmentConfig" label-width="120px" size="small">
          <el-form-item label="分配策略">
            <el-radio-group v-model="assignmentConfig.strategy">
              <el-radio-button label="intelligent">智能分配</el-radio-button>
              <el-radio-button label="balanced">负载均衡</el-radio-button>
              <el-radio-button label="expertise">专业领域</el-radio-button>
              <el-radio-button label="manual">手动分配</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="分配数量">
            <el-input-number 
              v-model="assignmentConfig.batchSize" 
              :min="1" 
              :max="50" 
              controls-position="right"
            />
            <span class="form-hint">每次批量分配的任务数量</span>
          </el-form-item>

          <el-form-item label="优先考虑" v-if="assignmentConfig.strategy === 'intelligent'">
            <el-checkbox-group v-model="assignmentConfig.priorities">
              <el-checkbox label="workload">工作负载</el-checkbox>
              <el-checkbox label="expertise">专业匹配</el-checkbox>
              <el-checkbox label="performance">历史表现</el-checkbox>
              <el-checkbox label="availability">在线状态</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </div>

      <!-- 审核员状态概览 -->
      <div class="auditors-overview">
        <h4>审核员状态</h4>
        <el-table :data="auditorsStatus" size="small" height="200">
          <el-table-column prop="name" label="姓名" width="80" />
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="getStatusTag(row.status)" size="small">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="pendingTasks" label="待办" width="60" />
          <el-table-column prop="todayProcessed" label="今日处理" width="80" />
          <el-table-column prop="efficiency" label="效率" width="60">
            <template #default="{ row }">
              <div class="efficiency-bar">
                <el-progress 
                  :percentage="row.efficiency" 
                  :stroke-width="8"
                  :show-text="false"
                  :color="getEfficiencyColor(row.efficiency)"
                />
                <span class="efficiency-text">{{ row.efficiency }}%</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="{ row }">
              <el-button 
                type="primary" 
                size="small"
                @click="assignToAuditor(row)"
                :disabled="row.status === 'offline' || row.pendingTasks >= 20"
              >
                分配
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 智能推荐 -->
      <div class="smart-recommendations" v-if="assignmentConfig.strategy === 'intelligent'">
        <h4>AI推荐分配</h4>
        <div class="recommendation-item" v-for="rec in recommendations" :key="rec.auditorId">
          <div class="rec-header">
            <el-avatar :size="32" :src="rec.auditorAvatar">{{ rec.auditorName[0] }}</el-avatar>
            <div class="rec-info">
              <div class="auditor-name">{{ rec.auditorName }}</div>
              <div class="match-score">匹配度: {{ rec.matchScore }}%</div>
            </div>
            <div class="rec-actions">
              <el-button type="primary" size="small" @click="acceptRecommendation(rec)">
                采用 ({{ rec.suggestedTasks }}个)
              </el-button>
            </div>
          </div>
          <div class="rec-reasons">
            <el-tag 
              v-for="reason in rec.reasons" 
              :key="reason.type"
              :type="getReasonTag(reason.type)"
              size="small"
              class="reason-tag"
            >
              {{ reason.label }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 分配操作 -->
      <div class="assignment-actions">
        <el-button 
          type="primary" 
          @click="performSmartAssignment"
          :loading="assigning"
          :disabled="selectedTasks.length === 0"
        >
          <el-icon><MagicStick /></el-icon>
          智能分配 ({{ selectedTasks.length }}个任务)
        </el-button>
        
        <el-button @click="showAssignmentHistory">
          <el-icon><Clock /></el-icon>
          分配历史
        </el-button>

        <el-button @click="optimizeAssignment">
          <el-icon><TrendCharts /></el-icon>
          优化分配
        </el-button>
      </div>
    </el-card>

    <!-- 分配历史弹窗 -->
    <el-dialog v-model="historyDialogVisible" title="分配历史" width="800px">
      <el-table :data="assignmentHistory" v-loading="loadingHistory">
        <el-table-column prop="timestamp" label="时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.timestamp) }}
          </template>
        </el-table-column>
        <el-table-column prop="strategy" label="策略" width="100" />
        <el-table-column prop="tasksAssigned" label="分配数量" width="100" />
        <el-table-column prop="auditorsInvolved" label="涉及审核员" width="100" />
        <el-table-column prop="avgMatchScore" label="平均匹配度" width="120">
          <template #default="{ row }">
            {{ row.avgMatchScore }}%
          </template>
        </el-table-column>
        <el-table-column prop="result" label="结果" width="100">
          <template #default="{ row }">
            <el-tag :type="row.result === 'success' ? 'success' : 'danger'">
              {{ row.result === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="notes" label="备注" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  UserFilled, 
  MagicStick, 
  Clock, 
  TrendCharts 
} from '@element-plus/icons-vue'
import { useAuditStore } from '@/stores/audit'

// Props
interface Props {
  selectedTasks: any[]
}

const props = defineProps<Props>()

// Store
const auditStore = useAuditStore()

// 响应式数据
const assigning = ref(false)
const loadingHistory = ref(false)
const historyDialogVisible = ref(false)

// 分配配置
const assignmentConfig = reactive({
  strategy: 'intelligent',
  batchSize: 10,
  priorities: ['workload', 'expertise', 'performance']
})

// 审核员状态
const auditorsStatus = ref([
  {
    id: 1,
    name: '张三',
    status: 'online',
    pendingTasks: 5,
    todayProcessed: 15,
    efficiency: 92,
    expertise: ['content', 'news'],
    avgProcessTime: 8.5
  },
  {
    id: 2,
    name: '李四',
    status: 'busy',
    pendingTasks: 12,
    todayProcessed: 28,
    efficiency: 88,
    expertise: ['flea_market', 'goods'],
    avgProcessTime: 6.2
  },
  {
    id: 3,
    name: '王五',
    status: 'online',
    pendingTasks: 3,
    todayProcessed: 8,
    efficiency: 95,
    expertise: ['quotation', 'banner'],
    avgProcessTime: 12.1
  }
])

// AI推荐
const recommendations = ref([
  {
    auditorId: 1,
    auditorName: '张三',
    auditorAvatar: '',
    matchScore: 94,
    suggestedTasks: 6,
    reasons: [
      { type: 'expertise', label: '专业匹配度高' },
      { type: 'performance', label: '历史表现优秀' },
      { type: 'availability', label: '当前负载较轻' }
    ]
  },
  {
    auditorId: 2,
    auditorName: '李四',
    auditorAvatar: '',
    matchScore: 87,
    suggestedTasks: 4,
    reasons: [
      { type: 'efficiency', label: '处理效率高' },
      { type: 'experience', label: '经验丰富' }
    ]
  }
])

// 分配历史
const assignmentHistory = ref([
  {
    timestamp: '2024-01-15 14:30:00',
    strategy: 'intelligent',
    tasksAssigned: 15,
    auditorsInvolved: 3,
    avgMatchScore: 89,
    result: 'success',
    notes: 'AI智能分配，效果良好'
  },
  {
    timestamp: '2024-01-15 10:15:00',
    strategy: 'balanced',
    tasksAssigned: 8,
    auditorsInvolved: 2,
    avgMatchScore: 76,
    result: 'success',
    notes: '负载均衡分配'
  }
])

// 方法
const performSmartAssignment = async () => {
  if (props.selectedTasks.length === 0) {
    ElMessage.warning('请先选择要分配的任务')
    return
  }

  assigning.value = true
  try {
    // 根据策略执行分配
    const result = await executeAssignmentStrategy()
    
    if (result.success) {
      ElMessage.success(`成功分配 ${result.assignedCount} 个任务`)
      
      // 记录分配历史
      addAssignmentHistory(result)
      
      // 更新审核员状态
      await updateAuditorsStatus()
    } else {
      ElMessage.error(`分配失败: ${result.error}`)
    }
  } catch (error) {
    ElMessage.error('分配操作失败')
    console.error('Smart assignment failed:', error)
  } finally {
    assigning.value = false
  }
}

const executeAssignmentStrategy = async () => {
  // 模拟智能分配逻辑
  return new Promise((resolve) => {
    setTimeout(() => {
      const assignments = generateOptimalAssignments()
      resolve({
        success: true,
        assignedCount: props.selectedTasks.length,
        assignments,
        avgMatchScore: 88
      })
    }, 2000)
  })
}

const generateOptimalAssignments = () => {
  // 根据配置生成最优分配方案
  const assignments = []
  const availableAuditors = auditorsStatus.value.filter(a => 
    a.status === 'online' && a.pendingTasks < 20
  )

  let taskIndex = 0
  for (const task of props.selectedTasks) {
    const auditor = availableAuditors[taskIndex % availableAuditors.length]
    assignments.push({
      taskId: task.taskId,
      auditorId: auditor.id,
      auditorName: auditor.name,
      matchScore: calculateMatchScore(task, auditor)
    })
    taskIndex++
  }

  return assignments
}

const calculateMatchScore = (task, auditor) => {
  // 计算任务和审核员的匹配度
  let score = 70 // 基础分数

  // 专业领域匹配
  if (auditor.expertise.includes(task.bizType)) {
    score += 20
  }

  // 工作负载考虑
  if (auditor.pendingTasks < 5) {
    score += 10
  } else if (auditor.pendingTasks > 15) {
    score -= 15
  }

  // 效率考虑
  score += (auditor.efficiency - 80) * 0.2

  return Math.min(Math.max(score, 0), 100)
}

const assignToAuditor = async (auditor) => {
  try {
    await ElMessageBox.confirm(
      `确认将选中的任务分配给 ${auditor.name}？`,
      '确认分配',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    // 执行分配
    await auditStore.batchAssign({
      auditorId: auditor.id,
      taskCount: Math.min(props.selectedTasks.length, 10),
      bizTypes: [...new Set(props.selectedTasks.map(t => t.bizType))],
      priority: 'normal'
    })

    ElMessage.success('分配成功')
    await updateAuditorsStatus()

  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('分配失败')
    }
  }
}

const acceptRecommendation = async (recommendation) => {
  try {
    // 执行推荐分配
    await auditStore.batchAssign({
      auditorId: recommendation.auditorId,
      taskCount: recommendation.suggestedTasks,
      bizTypes: [...new Set(props.selectedTasks.map(t => t.bizType))],
      priority: 'normal'
    })

    ElMessage.success(`已采用推荐，分配 ${recommendation.suggestedTasks} 个任务给 ${recommendation.auditorName}`)
    
    // 移除已分配的推荐
    const index = recommendations.value.findIndex(r => r.auditorId === recommendation.auditorId)
    if (index > -1) {
      recommendations.value.splice(index, 1)
    }

  } catch (error) {
    ElMessage.error('采用推荐失败')
  }
}

const showAssignmentHistory = () => {
  historyDialogVisible.value = true
  loadAssignmentHistory()
}

const loadAssignmentHistory = async () => {
  loadingHistory.value = true
  try {
    // 模拟加载历史数据
    await new Promise(resolve => setTimeout(resolve, 1000))
  } finally {
    loadingHistory.value = false
  }
}

const optimizeAssignment = async () => {
  ElMessage.info('正在分析当前分配情况，优化建议将在分析完成后显示')
  
  try {
    // 分析当前分配情况
    const analysis = await analyzeCurrentAssignment()
    
    if (analysis.suggestions.length > 0) {
      ElMessageBox.alert(
        analysis.suggestions.join('\n'),
        '分配优化建议',
        { confirmButtonText: '知道了' }
      )
    } else {
      ElMessage.success('当前分配已经很优化了！')
    }
  } catch (error) {
    ElMessage.error('分析失败')
  }
}

const analyzeCurrentAssignment = async () => {
  // 模拟分析逻辑
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        suggestions: [
          '建议将部分高优先级任务重新分配给效率更高的审核员',
          '李四当前负载较重，建议暂停新任务分配',
          '王五专业领域匹配度高，可以多分配相关类型任务'
        ]
      })
    }, 2000)
  })
}

const updateAuditorsStatus = async () => {
  // 更新审核员状态数据
  try {
    await auditStore.loadAuditors()
    // 更新本地状态
    // auditorsStatus.value = transformAuditorsData(auditStore.auditorsList)
  } catch (error) {
    console.error('更新审核员状态失败:', error)
  }
}

const addAssignmentHistory = (result) => {
  assignmentHistory.value.unshift({
    timestamp: new Date().toLocaleString('zh-CN'),
    strategy: assignmentConfig.strategy,
    tasksAssigned: result.assignedCount,
    auditorsInvolved: result.assignments.length,
    avgMatchScore: result.avgMatchScore,
    result: 'success',
    notes: 'AI智能分配执行成功'
  })
}

// 工具方法
const getStatusTag = (status: string) => {
  const tags = {
    online: 'success',
    busy: 'warning',
    offline: 'info'
  }
  return tags[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const labels = {
    online: '在线',
    busy: '忙碌',
    offline: '离线'
  }
  return labels[status] || status
}

const getEfficiencyColor = (efficiency: number) => {
  if (efficiency >= 90) return '#67c23a'
  if (efficiency >= 80) return '#e6a23c'
  return '#f56c6c'
}

const getReasonTag = (type: string) => {
  const tags = {
    expertise: 'primary',
    performance: 'success',
    availability: 'info',
    efficiency: 'warning',
    experience: 'primary'
  }
  return tags[type] || 'info'
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  updateAuditorsStatus()
})
</script>

<style scoped>
.smart-assignment-panel {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title {
  font-weight: 600;
}

.assignment-strategy {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.form-hint {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}

.auditors-overview {
  margin-bottom: 20px;
}

.efficiency-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.efficiency-text {
  font-size: 12px;
  min-width: 35px;
}

.smart-recommendations {
  margin-bottom: 20px;
}

.recommendation-item {
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  margin-bottom: 8px;
}

.rec-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.rec-info {
  flex: 1;
}

.auditor-name {
  font-weight: 600;
  margin-bottom: 2px;
}

.match-score {
  font-size: 12px;
  color: #67c23a;
}

.rec-reasons {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.reason-tag {
  margin-right: 4px;
}

.assignment-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}
</style>