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
          <el-button link type="primary" @click="viewWorkflowDiagram(row)">查看流程</el-button>
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
    <el-dialog 
      v-model="diagramDialogVisible" 
      title="审批流程" 
      width="1200px"
      :destroy-on-close="true"
      class="workflow-dialog"
    >
      <UnifiedWorkflowViewer
        v-if="currentWorkflow && currentBannerInfo"
        :workflow-data="currentWorkflow"
        :banner-info="currentBannerInfo"
        :view-mode="'auto'"
        :show-mode-switch="true"
        :show-banner-info="true"
        :responsive="true"
        @mode-change="onWorkflowModeChange"
      />
      <div v-else class="empty-workflow">
        <el-empty description="暂无流程数据" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { SuccessFilled, CircleCloseFilled, Loading } from '@element-plus/icons-vue'
import UnifiedWorkflowViewer from '@/components/workflow/UnifiedWorkflowViewer.vue'
import type { WorkflowData, BannerInfo } from '@/components/workflow/UnifiedWorkflowViewer.vue'

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
  workflowSteps: {
    id: string | number
    name: string
    status: 'pending' | 'processing' | 'approved' | 'rejected'
    approvers?: string[]
    processTime?: string
    comment?: string
    duration?: string
    approvalType?: 'any' | 'all'
  }[]
  operationHistory: {
    time: string
    operator: string
    action: 'submit' | 'approve' | 'reject' | 'delegate' | 'revoke' | 'publish' | 'offline'
    comment?: string
    node?: string
    duration?: string
  }[]
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
const currentWorkflow = ref<WorkflowData | null>(null)
const currentBannerInfo = ref<BannerInfo | null>(null)

// 数据转换函数：将TrackingItem转换为UnifiedWorkflowViewer所需的格式
const transformToWorkflowData = (item: TrackingItem): { workflowData: WorkflowData; bannerInfo: BannerInfo } => {
  const workflowData: WorkflowData = {
    steps: item.workflowSteps.map((step, index) => ({
      id: step.id || `step-${index}`,
      name: step.name,
      status: step.status,
      approvers: step.approvers,
      processTime: step.processTime,
      comment: step.comment,
      duration: step.duration,
      approvalType: step.approvalType
    })),
    operationHistory: item.operationHistory,
    currentStatus: item.currentStatus,
    totalDuration: calculateTotalDuration(item)
  }

  const bannerInfo: BannerInfo = {
    id: item.id,
    title: item.bannerTitle,
    imageUrl: item.bannerImageUrl,
    linkUrl: item.linkUrl,
    startTime: item.startTime,
    endTime: item.endTime,
    status: item.currentStatus as any,
    description: item.description,
    creator: item.submitter,
    createTime: item.submitTime
  }

  return { workflowData, bannerInfo }
}

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

// 这些函数现在由UnifiedWorkflowViewer组件处理，保留供表格显示使用
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

// isWorkflowComplete函数现在由UnifiedWorkflowViewer组件处理

const viewWorkflowDiagram = (item: TrackingItem) => {
  const { workflowData, bannerInfo } = transformToWorkflowData(item)
  currentWorkflow.value = workflowData
  currentBannerInfo.value = bannerInfo
  diagramDialogVisible.value = true
}

const exportRecord = (item: TrackingItem) => {
  console.log('导出记录:', item)
  ElMessage.success('导出功能开发中...')
}

const onWorkflowModeChange = (mode: 'steps' | 'diagram') => {
  console.log('流程视图模式变更:', mode)
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
            id: 'step-1',
            name: '部门主管审核',
            approvers: ['李四'],
            status: 'approved',
            processTime: '2024-01-25 14:30:00',
            comment: '设计符合要求，同意通过',
            duration: '4小时30分钟',
            approvalType: 'any'
          },
          {
            id: 'step-2',
            name: '运营总监审核',
            approvers: ['王五'],
            status: 'processing',
            processTime: '2024-01-26 09:00:00',
            approvalType: 'any'
          },
          {
            id: 'step-3',
            name: '总经理审批',
            approvers: ['赵六'],
            status: 'pending',
            approvalType: 'any'
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
            id: 'step-1',
            name: '部门主管审核',
            approvers: ['王五'],
            status: 'approved',
            processTime: '2024-02-21 09:15:00',
            comment: '产品信息准确，批准发布',
            duration: '18小时45分钟',
            approvalType: 'any'
          },
          {
            id: 'step-2',
            name: '运营总监审核',
            approvers: ['赵六'],
            status: 'approved',
            processTime: '2024-02-21 15:30:00',
            comment: '营销策略合理，同意上线',
            duration: '6小时15分钟',
            approvalType: 'any'
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

.workflow-dialog {
  .el-dialog__body {
    padding: 0;
  }
}

.empty-workflow {
  padding: 40px 0;
  text-align: center;
}
</style>