<template>
  <div class="status-tracking">
    <div class="header">
      <h2>Banner状态追踪</h2>
    </div>

    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="Banner标题:">
          <el-input v-model="searchForm.title" placeholder="请输入Banner标题" clearable />
        </el-form-item>
        <el-form-item label="提交人:">
          <el-input v-model="searchForm.submitter" placeholder="请输入提交人" clearable />
        </el-form-item>
        <el-form-item label="当前状态:">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="待审批" value="pending" />
            <el-option label="审批中" value="reviewing" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="已发布" value="published" />
            <el-option label="已下线" value="offline" />
          </el-select>
        </el-form-item>
        <el-form-item label="提交时间:">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="trackingList" v-loading="loading" stripe>
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="expand-content">
            <div class="banner-info">
              <el-row :gutter="20">
                <el-col :span="6">
                  <div class="banner-preview">
                    <el-image
                      :src="row.bannerImageUrl"
                      :preview-src-list="[row.bannerImageUrl]"
                      fit="cover"
                      style="width: 100%; height: 120px"
                      preview-teleported
                    />
                  </div>
                </el-col>
                <el-col :span="18">
                  <el-descriptions :column="2" border size="small">
                    <el-descriptions-item label="跳转链接">{{ row.linkUrl }}</el-descriptions-item>
                    <el-descriptions-item label="Banner类型">{{ row.bannerType }}</el-descriptions-item>
                    <el-descriptions-item label="生效时间">
                      {{ row.startTime }} ~ {{ row.endTime }}
                    </el-descriptions-item>
                    <el-descriptions-item label="优先级">
                      <el-tag :type="getPriorityType(row.priority)" size="small">
                        {{ getPriorityText(row.priority) }}
                      </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="申请说明" :span="2">
                      {{ row.description || '无' }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-col>
              </el-row>
            </div>

            <el-divider>审批流程追踪</el-divider>

            <div class="workflow-tracking">
              <el-steps :active="getActiveStep(row.workflowSteps)" finish-status="success">
                <el-step
                  v-for="(step, index) in row.workflowSteps"
                  :key="index"
                  :title="step.name"
                  :description="getStepDescription(step)"
                  :status="getStepStatus(step)"
                >
                  <template #icon>
                    <el-icon v-if="step.status === 'approved'"><SuccessFilled /></el-icon>
                    <el-icon v-else-if="step.status === 'rejected'"><CircleCloseFilled /></el-icon>
                    <el-icon v-else-if="step.status === 'processing'"><Loading /></el-icon>
                    <div v-else class="step-number">{{ index + 1 }}</div>
                  </template>
                </el-step>
              </el-steps>
            </div>

            <el-divider>操作记录</el-divider>

            <div class="operation-history">
              <el-timeline>
                <el-timeline-item
                  v-for="(record, index) in row.operationHistory"
                  :key="index"
                  :timestamp="record.time"
                  :type="getHistoryType(record.action)"
                >
                  <div class="history-item">
                    <div class="history-header">
                      <span class="action">{{ getActionText(record.action) }}</span>
                      <span class="operator">{{ record.operator }}</span>
                      <span class="node" v-if="record.node">({{ record.node }})</span>
                    </div>
                    <div class="history-content" v-if="record.comment">
                      {{ record.comment }}
                    </div>
                    <div class="duration" v-if="record.duration">
                      <el-tag size="small" type="info">耗时: {{ record.duration }}</el-tag>
                    </div>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="bannerTitle" label="Banner标题" min-width="200" />
      <el-table-column prop="submitter" label="提交人" width="100" />
      <el-table-column prop="submitTime" label="提交时间" width="160" />
      <el-table-column label="当前状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.currentStatus)">
            {{ getStatusText(row.currentStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="当前节点" width="120">
        <template #default="{ row }">
          <span v-if="row.currentNode">{{ row.currentNode }}</span>
          <span v-else class="text-muted">-</span>
        </template>
      </el-table-column>
      <el-table-column label="进度" width="150">
        <template #default="{ row }">
          <el-progress 
            :percentage="getProgressPercentage(row.workflowSteps)" 
            :status="getProgressStatus(row.currentStatus)"
            :stroke-width="8"
          />
        </template>
      </el-table-column>
      <el-table-column label="总耗时" width="100">
        <template #default="{ row }">
          {{ calculateTotalDuration(row) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="viewWorkflowDiagram(row)">流程图</el-button>
          <el-button link type="info" @click="exportRecord(row)">导出</el-button>
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

    <!-- 流程图对话框 -->
    <el-dialog v-model="diagramDialogVisible" title="审批流程图" width="1000px">
      <div class="workflow-diagram" v-if="currentWorkflow">
        <div class="diagram-header">
          <h3>{{ currentWorkflow.bannerTitle }}</h3>
          <el-tag :type="getStatusType(currentWorkflow.currentStatus)">
            {{ getStatusText(currentWorkflow.currentStatus) }}
          </el-tag>
        </div>
        
        <div class="diagram-content">
          <div class="workflow-steps">
            <div class="start-node">开始</div>
            <div 
              v-for="(step, index) in currentWorkflow.workflowSteps" 
              :key="index" 
              class="workflow-step"
              :class="{
                'step-approved': step.status === 'approved',
                'step-rejected': step.status === 'rejected',
                'step-processing': step.status === 'processing',
                'step-pending': step.status === 'pending'
              }"
            >
              <div class="step-header">
                <div class="step-name">{{ step.name }}</div>
                <div class="step-status">
                  <el-tag :type="getStepTagType(step.status)" size="small">
                    {{ getStepStatusText(step.status) }}
                  </el-tag>
                </div>
              </div>
              <div class="step-info">
                <div class="step-approvers">审批人: {{ step.approvers.join(', ') }}</div>
                <div class="step-time" v-if="step.processTime">
                  处理时间: {{ step.processTime }}
                </div>
                <div class="step-comment" v-if="step.comment">
                  处理意见: {{ step.comment }}
                </div>
              </div>
            </div>
            <div class="end-node" :class="{ 'reached': isWorkflowComplete(currentWorkflow) }">
              结束
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { SuccessFilled, CircleCloseFilled, Loading } from '@element-plus/icons-vue'

interface WorkflowStep {
  name: string
  approvers: string[]
  status: 'pending' | 'processing' | 'approved' | 'rejected'
  processTime?: string
  comment?: string
  duration?: string
}

interface OperationRecord {
  time: string
  operator: string
  action: 'submit' | 'approve' | 'reject' | 'delegate' | 'revoke' | 'publish' | 'offline'
  comment?: string
  node?: string
  duration?: string
}

interface TrackingItem {
  id: number
  bannerTitle: string
  bannerImageUrl: string
  linkUrl: string
  startTime: string
  endTime: string
  submitter: string
  submitTime: string
  currentStatus: string
  currentNode?: string
  bannerType: string
  priority: 'high' | 'normal' | 'low'
  description?: string
  workflowSteps: WorkflowStep[]
  operationHistory: OperationRecord[]
}

const loading = ref(false)
const diagramDialogVisible = ref(false)

const searchForm = reactive({
  title: '',
  submitter: '',
  status: '',
  dateRange: [] as string[]
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const trackingList = ref<TrackingItem[]>([])
const currentWorkflow = ref<TrackingItem | null>(null)

const getPriorityType = (priority: string) => {
  const typeMap: Record<string, string> = {
    high: 'danger',
    normal: 'warning',
    low: 'info'
  }
  return typeMap[priority] || ''
}

const getPriorityText = (priority: string) => {
  const textMap: Record<string, string> = {
    high: '紧急',
    normal: '普通',
    low: '低'
  }
  return textMap[priority] || priority
}

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'warning',
    reviewing: 'info',
    approved: 'success',
    rejected: 'danger',
    published: 'success',
    offline: 'info'
  }
  return statusMap[status] || ''
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待审批',
    reviewing: '审批中',
    approved: '已通过',
    rejected: '已拒绝',
    published: '已发布',
    offline: '已下线'
  }
  return statusMap[status] || status
}

const getStepStatus = (step: WorkflowStep) => {
  const statusMap: Record<string, string> = {
    pending: 'wait',
    processing: 'process',
    approved: 'finish',
    rejected: 'error'
  }
  return statusMap[step.status] || 'wait'
}

const getStepTagType = (status: string) => {
  const typeMap: Record<string, string> = {
    pending: 'info',
    processing: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return typeMap[status] || ''
}

const getStepStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return textMap[status] || status
}

const getStepDescription = (step: WorkflowStep) => {
  const approvers = step.approvers.join(', ')
  if (step.processTime) {
    return `${approvers} | ${step.processTime}`
  }
  return approvers
}

const getActiveStep = (steps: WorkflowStep[]) => {
  const processingIndex = steps.findIndex(step => step.status === 'processing')
  if (processingIndex !== -1) return processingIndex
  
  const approvedCount = steps.filter(step => step.status === 'approved').length
  return approvedCount
}

const getProgressPercentage = (steps: WorkflowStep[]) => {
  const approvedCount = steps.filter(step => step.status === 'approved').length
  const rejectedCount = steps.filter(step => step.status === 'rejected').length
  
  if (rejectedCount > 0) return 100
  
  return Math.round((approvedCount / steps.length) * 100)
}

const getProgressStatus = (status: string) => {
  if (status === 'rejected') return 'exception'
  if (status === 'approved' || status === 'published') return 'success'
  return undefined
}

const getHistoryType = (action: string) => {
  const typeMap: Record<string, any> = {
    submit: 'primary',
    approve: 'success',
    reject: 'danger',
    delegate: 'warning',
    revoke: 'info',
    publish: 'success',
    offline: 'info'
  }
  return typeMap[action] || 'primary'
}

const getActionText = (action: string) => {
  const textMap: Record<string, string> = {
    submit: '提交审批',
    approve: '审批通过',
    reject: '审批拒绝',
    delegate: '委派审批',
    revoke: '撤回审批',
    publish: '发布上线',
    offline: '下线'
  }
  return textMap[action] || action
}

const calculateTotalDuration = (item: TrackingItem) => {
  const submitTime = new Date(item.submitTime).getTime()
  const lastRecord = item.operationHistory[item.operationHistory.length - 1]
  const endTime = lastRecord ? new Date(lastRecord.time).getTime() : new Date().getTime()
  
  const diff = endTime - submitTime
  const hours = Math.floor(diff / (1000 * 60 * 60))
  
  if (hours < 24) {
    return `${hours}小时`
  } else {
    const days = Math.floor(hours / 24)
    const remainHours = hours % 24
    return `${days}天${remainHours}小时`
  }
}

const isWorkflowComplete = (workflow: TrackingItem) => {
  return ['approved', 'published', 'rejected'].includes(workflow.currentStatus)
}

const viewWorkflowDiagram = (item: TrackingItem) => {
  currentWorkflow.value = item
  diagramDialogVisible.value = true
}

const exportRecord = (item: TrackingItem) => {
  console.log('导出记录:', item)
  ElMessage.success('导出功能开发中...')
}

const handleSearch = () => {
  pagination.currentPage = 1
  fetchTrackingList()
}

const resetSearch = () => {
  Object.assign(searchForm, {
    title: '',
    submitter: '',
    status: '',
    dateRange: []
  })
  handleSearch()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchTrackingList()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  fetchTrackingList()
}

const fetchTrackingList = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const mockData: TrackingItem[] = [
      {
        id: 1,
        bannerTitle: '春节活动Banner',
        bannerImageUrl: 'https://via.placeholder.com/800x400/FF6B6B/FFFFFF?text=Spring+Festival',
        linkUrl: 'https://example.com/spring-festival',
        startTime: '2024-02-01 00:00:00',
        endTime: '2024-02-29 23:59:59',
        submitter: '张三',
        submitTime: '2024-01-25 10:00:00',
        currentStatus: 'reviewing',
        currentNode: '运营总监审核',
        bannerType: '活动Banner',
        priority: 'high',
        description: '春节活动推广Banner，需要尽快上线',
        workflowSteps: [
          {
            name: '部门主管审核',
            approvers: ['李四'],
            status: 'approved',
            processTime: '2024-01-25 14:30:00',
            comment: '设计符合要求，同意通过',
            duration: '4小时30分钟'
          },
          {
            name: '运营总监审核',
            approvers: ['王五'],
            status: 'processing',
            processTime: '2024-01-26 09:00:00'
          },
          {
            name: '总经理审批',
            approvers: ['赵六'],
            status: 'pending'
          }
        ],
        operationHistory: [
          {
            time: '2024-01-25 10:00:00',
            operator: '张三',
            action: 'submit',
            comment: '提交春节活动Banner审批',
            node: '提交'
          },
          {
            time: '2024-01-25 14:30:00',
            operator: '李四',
            action: 'approve',
            comment: '设计符合要求，同意通过',
            node: '部门主管审核',
            duration: '4小时30分钟'
          }
        ]
      },
      {
        id: 2,
        bannerTitle: '产品发布会Banner',
        bannerImageUrl: 'https://via.placeholder.com/800x400/4ECDC4/FFFFFF?text=Product+Launch',
        linkUrl: 'https://example.com/product-launch',
        startTime: '2024-03-01 00:00:00',
        endTime: '2024-03-15 23:59:59',
        submitter: '李四',
        submitTime: '2024-02-20 14:30:00',
        currentStatus: 'published',
        bannerType: '产品Banner',
        priority: 'normal',
        description: '新产品发布会宣传Banner',
        workflowSteps: [
          {
            name: '部门主管审核',
            approvers: ['王五'],
            status: 'approved',
            processTime: '2024-02-21 09:15:00',
            comment: '产品信息准确，批准发布',
            duration: '18小时45分钟'
          },
          {
            name: '运营总监审核',
            approvers: ['赵六'],
            status: 'approved',
            processTime: '2024-02-21 15:30:00',
            comment: '营销策略合理，同意上线',
            duration: '6小时15分钟'
          }
        ],
        operationHistory: [
          {
            time: '2024-02-20 14:30:00',
            operator: '李四',
            action: 'submit',
            comment: '提交产品发布会Banner审批',
            node: '提交'
          },
          {
            time: '2024-02-21 09:15:00',
            operator: '王五',
            action: 'approve',
            comment: '产品信息准确，批准发布',
            node: '部门主管审核',
            duration: '18小时45分钟'
          },
          {
            time: '2024-02-21 15:30:00',
            operator: '赵六',
            action: 'approve',
            comment: '营销策略合理，同意上线',
            node: '运营总监审核',
            duration: '6小时15分钟'
          },
          {
            time: '2024-02-22 10:00:00',
            operator: '系统',
            action: 'publish',
            comment: '自动发布上线',
            node: '发布'
          }
        ]
      }
    ]
    
    trackingList.value = mockData
    pagination.total = mockData.length
  } catch (error) {
    ElMessage.error('获取追踪列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTrackingList()
})
</script>

<style scoped>
.status-tracking {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.search-bar {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.expand-content {
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
}

.banner-info {
  margin-bottom: 20px;
}

.banner-preview {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dcdfe6;
}

.workflow-tracking {
  margin: 20px 0;
  padding: 30px;
  background: white;
  border-radius: 8px;
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #c0c4cc;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.operation-history {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.history-item {
  padding: 8px 0;
}

.history-header {
  display: flex;
  gap: 12px;
  align-items: center;
  font-weight: bold;
  margin-bottom: 8px;
}

.action {
  color: #409eff;
}

.operator {
  color: #303133;
}

.node {
  color: #909399;
  font-weight: normal;
  font-size: 12px;
}

.history-content {
  color: #606266;
  padding-left: 12px;
  border-left: 2px solid #e4e7ed;
  margin-bottom: 8px;
}

.duration {
  padding-left: 12px;
}

.text-muted {
  color: #c0c4cc;
}

.workflow-diagram {
  padding: 20px;
}

.diagram-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.diagram-content {
  padding: 20px 0;
}

.workflow-steps {
  display: flex;
  align-items: flex-start;
  gap: 30px;
  overflow-x: auto;
  padding: 20px 0;
}

.start-node, .end-node {
  min-width: 80px;
  padding: 15px 20px;
  background: #67c23a;
  color: white;
  border-radius: 25px;
  font-weight: bold;
  text-align: center;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.end-node {
  background: #909399;
}

.end-node.reached {
  background: #67c23a;
}

.workflow-step {
  min-width: 200px;
  max-width: 250px;
  padding: 20px;
  border: 2px solid #dcdfe6;
  border-radius: 12px;
  background: white;
  flex-shrink: 0;
  position: relative;
}

.workflow-step::before {
  content: '';
  position: absolute;
  left: -31px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-right: 10px solid #dcdfe6;
}

.step-approved {
  border-color: #67c23a;
  background: #f0f9ff;
}

.step-approved::before {
  border-right-color: #67c23a;
}

.step-rejected {
  border-color: #f56c6c;
  background: #fef0f0;
}

.step-rejected::before {
  border-right-color: #f56c6c;
}

.step-processing {
  border-color: #e6a23c;
  background: #fdf6ec;
  animation: pulse 2s infinite;
}

.step-processing::before {
  border-right-color: #e6a23c;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(230, 162, 60, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(230, 162, 60, 0);
  }
}

.step-header {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.step-name {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.step-status {
  display: flex;
  justify-content: flex-end;
}

.step-info {
  font-size: 12px;
  color: #606266;
  line-height: 1.6;
}

.step-approvers {
  margin-bottom: 5px;
}

.step-time {
  margin-bottom: 5px;
  color: #909399;
}

.step-comment {
  color: #303133;
  font-style: italic;
}
</style>