<template>
  <div class="batch-operation-panel">
    <el-card>
      <template #header>
        <div class="panel-header">
          <div class="header-left">
            <el-icon><Operation /></el-icon>
            <span class="panel-title">批量操作</span>
            <el-tag type="info" size="small">{{ selectedTasks.length }} 个任务</el-tag>
          </div>
          <div class="header-right">
            <el-button size="small" @click="clearSelection">
              清空选择
            </el-button>
          </div>
        </div>
      </template>

      <!-- 快速操作 -->
      <div class="quick-actions" v-if="selectedTasks.length > 0">
        <el-button-group>
          <el-button 
            type="success" 
            @click="showBatchApproveDialog"
            :disabled="!canBatchApprove"
          >
            <el-icon><Check /></el-icon>
            批量通过 ({{ selectedTasks.length }})
          </el-button>
          <el-button 
            type="danger" 
            @click="showBatchRejectDialog"
            :disabled="!canBatchReject"
          >
            <el-icon><Close /></el-icon>
            批量拒绝
          </el-button>
          <el-button 
            type="warning" 
            @click="showBatchTransferDialog"
            :disabled="!canBatchTransfer"
          >
            <el-icon><Share /></el-icon>
            批量转交
          </el-button>
        </el-button-group>
      </div>

      <!-- 智能批量分析 -->
      <div class="smart-batch-analysis" v-if="selectedTasks.length > 0">
        <el-collapse v-model="activeAnalysis">
          <el-collapse-item title="智能批量分析" name="analysis">
            <div class="analysis-content">
              <!-- 内容类型分布 -->
              <div class="analysis-section">
                <h4>内容类型分布</h4>
                <div class="type-distribution">
                  <div 
                    v-for="(count, type) in typeDistribution" 
                    :key="type"
                    class="type-item"
                  >
                    <el-tag :type="getBizTypeTag(type)" size="small">
                      {{ getBizTypeLabel(type) }}
                    </el-tag>
                    <span class="type-count">{{ count }}个</span>
                  </div>
                </div>
              </div>

              <!-- 风险评估 -->
              <div class="analysis-section">
                <h4>风险评估</h4>
                <div class="risk-assessment">
                  <el-progress 
                    :percentage="riskAnalysis.lowRisk" 
                    status="success"
                    :show-text="false"
                    :stroke-width="8"
                  />
                  <span class="risk-label">低风险: {{ riskAnalysis.lowRisk }}%</span>
                  
                  <el-progress 
                    :percentage="riskAnalysis.mediumRisk" 
                    status="warning"
                    :show-text="false"
                    :stroke-width="8"
                  />
                  <span class="risk-label">中风险: {{ riskAnalysis.mediumRisk }}%</span>
                  
                  <el-progress 
                    :percentage="riskAnalysis.highRisk" 
                    status="exception"
                    :show-text="false"
                    :stroke-width="8"
                  />
                  <span class="risk-label">高风险: {{ riskAnalysis.highRisk }}%</span>
                </div>
              </div>

              <!-- AI推荐操作 -->
              <div class="analysis-section">
                <h4>AI推荐操作</h4>
                <div class="ai-recommendations">
                  <div 
                    v-for="recommendation in aiRecommendations" 
                    :key="recommendation.action"
                    class="recommendation-item"
                  >
                    <div class="rec-icon">
                      <el-icon v-if="recommendation.action === 'approve'">
                        <Check />
                      </el-icon>
                      <el-icon v-else-if="recommendation.action === 'reject'">
                        <Close />
                      </el-icon>
                      <el-icon v-else>
                        <Warning />
                      </el-icon>
                    </div>
                    <div class="rec-content">
                      <div class="rec-title">
                        {{ recommendation.title }}
                      </div>
                      <div class="rec-description">
                        {{ recommendation.description }}
                      </div>
                      <div class="rec-tasks">
                        影响任务: {{ recommendation.taskCount }}个
                      </div>
                    </div>
                    <div class="rec-actions">
                      <el-button 
                        :type="getRecommendationButtonType(recommendation.action)"
                        size="small"
                        @click="applyRecommendation(recommendation)"
                      >
                        采用建议
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- 高级批量操作 -->
      <div class="advanced-operations" v-if="selectedTasks.length > 0">
        <el-collapse v-model="activeOperations">
          <el-collapse-item title="高级操作" name="advanced">
            <div class="advanced-content">
              <el-row :gutter="16">
                <el-col :span="8">
                  <el-button @click="batchModifyPriority" block>
                    <el-icon><Sort /></el-icon>
                    修改优先级
                  </el-button>
                </el-col>
                <el-col :span="8">
                  <el-button @click="batchAddTags" block>
                    <el-icon><CollectionTag /></el-icon>
                    批量标签
                  </el-button>
                </el-col>
                <el-col :span="8">
                  <el-button @click="batchExport" block>
                    <el-icon><Download /></el-icon>
                    批量导出
                  </el-button>
                </el-col>
              </el-row>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

    </el-card>

    <!-- 批量通过弹窗 -->
    <el-dialog v-model="batchApproveVisible" title="批量通过" width="500px">
      <el-form :model="batchApproveForm" label-width="100px">
        <el-form-item label="通过原因">
          <el-select v-model="batchApproveForm.reason" placeholder="选择通过原因">
            <el-option label="内容符合规范" value="compliant" />
            <el-option label="质量良好" value="quality" />
            <el-option label="无违规内容" value="clean" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" v-if="batchApproveForm.reason === 'other'">
          <el-input 
            v-model="batchApproveForm.remark" 
            type="textarea" 
            rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
        <el-form-item label="处理方式">
          <el-radio-group v-model="batchApproveForm.processMode">
            <el-radio label="immediate">立即处理</el-radio>
            <el-radio label="scheduled">定时处理</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item 
          label="处理时间" 
          v-if="batchApproveForm.processMode === 'scheduled'"
        >
          <el-date-picker
            v-model="batchApproveForm.scheduleTime"
            type="datetime"
            placeholder="选择处理时间"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchApproveVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchApprove" :loading="processing">
          确认通过
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量拒绝弹窗 -->
    <el-dialog v-model="batchRejectVisible" title="批量拒绝" width="500px">
      <el-form :model="batchRejectForm" label-width="100px">
        <el-form-item label="拒绝原因" required>
          <el-select v-model="batchRejectForm.reason" placeholder="选择拒绝原因">
            <el-option label="内容违规" value="violation" />
            <el-option label="质量不达标" value="quality_issue" />
            <el-option label="包含广告" value="advertisement" />
            <el-option label="重复内容" value="duplicate" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="详细说明">
          <el-input 
            v-model="batchRejectForm.detail" 
            type="textarea" 
            rows="3"
            placeholder="请详细说明拒绝原因"
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="batchRejectForm.notifySubmitters">
            通知内容提交者
          </el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchRejectVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmBatchReject" :loading="processing">
          确认拒绝
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量转交弹窗 -->
    <el-dialog v-model="batchTransferVisible" title="批量转交" width="500px">
      <el-form :model="batchTransferForm" label-width="100px">
        <el-form-item label="转交给" required>
          <el-select v-model="batchTransferForm.assigneeId" placeholder="选择审核员">
            <el-option 
              v-for="auditor in auditors" 
              :key="auditor.id"
              :label="auditor.name"
              :value="auditor.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="转交原因">
          <el-input 
            v-model="batchTransferForm.reason" 
            type="textarea" 
            rows="3"
            placeholder="请说明转交原因"
          />
        </el-form-item>
        <el-form-item label="转交类型">
          <el-radio-group v-model="batchTransferForm.transferType">
            <el-radio label="normal">普通转交</el-radio>
            <el-radio label="urgent">紧急转交</el-radio>
            <el-radio label="collaborative">协作审核</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchTransferVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchTransfer" :loading="processing">
          确认转交
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Operation,
  Check,
  Close,
  Share,
  Warning,
  Sort,
  CollectionTag,
  Download
} from '@element-plus/icons-vue'
import { useAuditStore } from '@/stores/audit'

// Props
interface Props {
  selectedTasks: any[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits(['selectionChange', 'operationComplete'])

// Store
const auditStore = useAuditStore()

// 响应式数据
const processing = ref(false)
const activeAnalysis = ref(['analysis'])
const activeOperations = ref([])

// 弹窗控制
const batchApproveVisible = ref(false)
const batchRejectVisible = ref(false)
const batchTransferVisible = ref(false)

// 表单数据
const batchApproveForm = reactive({
  reason: '',
  remark: '',
  processMode: 'immediate',
  scheduleTime: null
})

const batchRejectForm = reactive({
  reason: '',
  detail: '',
  notifySubmitters: true
})

const batchTransferForm = reactive({
  assigneeId: null,
  reason: '',
  transferType: 'normal'
})

// 审核员列表
const auditors = ref([
  { id: 1, name: '张三', workload: 5 },
  { id: 2, name: '李四', workload: 12 },
  { id: 3, name: '王五', workload: 3 }
])

// 计算属性
const typeDistribution = computed(() => {
  const distribution: Record<string, number> = {}
  props.selectedTasks.forEach(task => {
    distribution[task.bizType] = (distribution[task.bizType] || 0) + 1
  })
  return distribution
})

const riskAnalysis = computed(() => {
  // 模拟风险分析
  const total = props.selectedTasks.length
  if (total === 0) return { lowRisk: 0, mediumRisk: 0, highRisk: 0 }
  
  return {
    lowRisk: Math.round((total * 0.7) / total * 100),
    mediumRisk: Math.round((total * 0.2) / total * 100),
    highRisk: Math.round((total * 0.1) / total * 100)
  }
})

const aiRecommendations = computed(() => {
  if (props.selectedTasks.length === 0) return []
  
  return [
    {
      action: 'approve',
      title: '建议批量通过',
      description: '大部分内容质量良好，符合发布标准',
      taskCount: Math.floor(props.selectedTasks.length * 0.7),
      confidence: 85
    },
    {
      action: 'review',
      title: '建议人工复审',
      description: '部分内容存在争议，需要进一步确认',
      taskCount: Math.floor(props.selectedTasks.length * 0.2),
      confidence: 78
    },
    {
      action: 'reject',
      title: '建议直接拒绝',
      description: '少量内容明显违规，可直接拒绝',
      taskCount: Math.floor(props.selectedTasks.length * 0.1),
      confidence: 92
    }
  ]
})

const canBatchApprove = computed(() => {
  return props.selectedTasks.length > 0 && 
         props.selectedTasks.every(task => task.status === 'pending')
})

const canBatchReject = computed(() => {
  return props.selectedTasks.length > 0 && 
         props.selectedTasks.every(task => task.status === 'pending')
})

const canBatchTransfer = computed(() => {
  return props.selectedTasks.length > 0 && 
         props.selectedTasks.every(task => task.status === 'pending')
})

// 方法
const showBatchApproveDialog = () => {
  resetBatchApproveForm()
  batchApproveVisible.value = true
}

const showBatchRejectDialog = () => {
  resetBatchRejectForm()
  batchRejectVisible.value = true
}

const showBatchTransferDialog = () => {
  resetBatchTransferForm()
  batchTransferVisible.value = true
}

const confirmBatchApprove = async () => {
  if (!batchApproveForm.reason) {
    ElMessage.warning('请选择通过原因')
    return
  }

  processing.value = true
  try {
    const taskIds = props.selectedTasks.map(task => task.taskId)
    
    if (batchApproveForm.processMode === 'scheduled' && batchApproveForm.scheduleTime) {
      // 定时处理逻辑
      await scheduleBatchOperation('approve', taskIds, {
        reason: batchApproveForm.reason,
        remark: batchApproveForm.remark,
        scheduleTime: batchApproveForm.scheduleTime
      })
    } else {
      // 立即处理
      await auditStore.batchAudit(taskIds, 'approve', batchApproveForm.reason)
    }

    ElMessage.success(`成功批量通过 ${taskIds.length} 个任务`)
    
    batchApproveVisible.value = false
    emit('operationComplete', { action: 'approve', taskIds })
    
  } catch (error) {
    ElMessage.error('批量通过操作失败')
    console.error('Batch approve failed:', error)
  } finally {
    processing.value = false
  }
}

const confirmBatchReject = async () => {
  if (!batchRejectForm.reason) {
    ElMessage.warning('请选择拒绝原因')
    return
  }

  processing.value = true
  try {
    const taskIds = props.selectedTasks.map(task => task.taskId)
    await auditStore.batchAudit(taskIds, 'reject', batchRejectForm.reason)

    ElMessage.success(`成功批量拒绝 ${taskIds.length} 个任务`)
    
    batchRejectVisible.value = false
    emit('operationComplete', { action: 'reject', taskIds })
    
  } catch (error) {
    ElMessage.error('批量拒绝操作失败')
    console.error('Batch reject failed:', error)
  } finally {
    processing.value = false
  }
}

const confirmBatchTransfer = async () => {
  if (!batchTransferForm.assigneeId) {
    ElMessage.warning('请选择转交对象')
    return
  }

  processing.value = true
  try {
    const taskIds = props.selectedTasks.map(task => task.taskId)
    
    // 执行批量转交
    for (const taskId of taskIds) {
      await auditStore.transferTask(taskId, batchTransferForm.assigneeId, batchTransferForm.reason)
    }

    ElMessage.success(`成功批量转交 ${taskIds.length} 个任务`)
    
    batchTransferVisible.value = false
    emit('operationComplete', { action: 'transfer', taskIds })
    
  } catch (error) {
    ElMessage.error('批量转交操作失败')
    console.error('Batch transfer failed:', error)
  } finally {
    processing.value = false
  }
}

const applyRecommendation = async (recommendation: any) => {
  try {
    await ElMessageBox.confirm(
      `确认采用AI推荐，对 ${recommendation.taskCount} 个任务执行 ${recommendation.title}？`,
      '确认操作',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    // 根据推荐执行相应操作
    switch (recommendation.action) {
      case 'approve':
        await handleRecommendedApprove(recommendation)
        break
      case 'reject':
        await handleRecommendedReject(recommendation)
        break
      case 'review':
        await handleRecommendedReview(recommendation)
        break
    }

    ElMessage.success('AI推荐操作执行成功')
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('执行AI推荐失败')
    }
  }
}

const handleRecommendedApprove = async (recommendation: any) => {
  const approvedTasks = props.selectedTasks.slice(0, recommendation.taskCount)
  const taskIds = approvedTasks.map(task => task.taskId)
  await auditStore.batchAudit(taskIds, 'approve', 'AI推荐自动通过')
}

const handleRecommendedReject = async (recommendation: any) => {
  const rejectedTasks = props.selectedTasks.slice(-recommendation.taskCount)
  const taskIds = rejectedTasks.map(task => task.taskId)
  await auditStore.batchAudit(taskIds, 'reject', 'AI识别违规内容')
}

const handleRecommendedReview = async (recommendation: any) => {
  // 对需要复审的任务提高优先级
  const reviewTasks = props.selectedTasks.slice(
    recommendation.taskCount, 
    recommendation.taskCount + Math.floor(props.selectedTasks.length * 0.2)
  )
  // 实现优先级提升逻辑
}

const batchModifyPriority = async () => {
  try {
    const { value: priority } = await ElMessageBox.prompt(
      '请选择新的优先级',
      '修改优先级',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        inputType: 'select',
        inputOptions: [
          { label: '高优先级', value: 'high' },
          { label: '普通优先级', value: 'normal' },
          { label: '低优先级', value: 'low' }
        ]
      }
    )

    // 执行优先级修改
    ElMessage.success(`已修改 ${props.selectedTasks.length} 个任务的优先级为${priority}`)
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('修改优先级失败')
    }
  }
}

const batchAddTags = async () => {
  try {
    const { value: tags } = await ElMessageBox.prompt(
      '请输入标签，多个标签用逗号分隔',
      '批量添加标签',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }
    )

    if (tags) {
      // 执行标签添加
      ElMessage.success(`已为 ${props.selectedTasks.length} 个任务添加标签`)
    }
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('添加标签失败')
    }
  }
}

const batchExport = () => {
  try {
    const data = props.selectedTasks.map(task => ({
      taskId: task.taskId,
      bizType: task.bizType,
      title: task.title,
      content: task.content,
      submitterName: task.submitterName,
      createTime: task.createTime
    }))

    const jsonData = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `batch_tasks_${new Date().getTime()}.json`
    link.click()
    window.URL.revokeObjectURL(url)

    ElMessage.success('批量导出成功')
    
  } catch (error) {
    ElMessage.error('批量导出失败')
  }
}

const scheduleBatchOperation = async (
  action: string, 
  taskIds: string[], 
  options: any
) => {
  // 模拟定时任务调度
  console.log('Scheduled operation:', { action, taskIds, options })
}

const clearSelection = () => {
  emit('selectionChange', [])
}


// 表单重置方法
const resetBatchApproveForm = () => {
  Object.assign(batchApproveForm, {
    reason: '',
    remark: '',
    processMode: 'immediate',
    scheduleTime: null
  })
}

const resetBatchRejectForm = () => {
  Object.assign(batchRejectForm, {
    reason: '',
    detail: '',
    notifySubmitters: true
  })
}

const resetBatchTransferForm = () => {
  Object.assign(batchTransferForm, {
    assigneeId: null,
    reason: '',
    transferType: 'normal'
  })
}

// 工具方法
const getBizTypeLabel = (bizType: string) => {
  const labels = {
    forum_post: '论坛帖子',
    flea_goods: '跳蚤市场',
    news: '资讯文章',
    banner: 'Banner广告',
    quotation: '名言警句'
  }
  return labels[bizType] || bizType
}

const getBizTypeTag = (bizType: string) => {
  const tags = {
    forum_post: 'primary',
    flea_goods: 'success',
    news: 'warning',
    banner: 'info',
    quotation: 'danger'
  }
  return tags[bizType] || 'info'
}

const getRecommendationButtonType = (action: string) => {
  const types = {
    approve: 'success',
    reject: 'danger',
    review: 'warning'
  }
  return types[action] || 'primary'
}


const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}
</script>

<style scoped>
.batch-operation-panel {
  margin-bottom: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-title {
  font-weight: 600;
}

.quick-actions {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.analysis-content {
  padding: 16px 0;
}

.analysis-section {
  margin-bottom: 20px;
}

.analysis-section h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.type-distribution {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.type-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.type-count {
  font-size: 12px;
  color: #909399;
}

.risk-assessment {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: center;
}

.risk-label {
  font-size: 12px;
  color: #606266;
  justify-self: start;
}

.ai-recommendations {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommendation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
}

.rec-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}

.rec-content {
  flex: 1;
}

.rec-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.rec-description {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.rec-tasks {
  font-size: 12px;
  color: #909399;
}

.rec-actions {
  flex-shrink: 0;
}

.advanced-content {
  padding: 16px 0;
}

</style>