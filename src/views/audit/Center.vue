<template>
  <div class="audit-center">
    <div class="page-header">
      <h1 class="page-title">统一审核中心</h1>
      <p class="page-description">集中处理所有业务模块的内容审核任务</p>
    </div>

    <!-- 统计概览 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon pending">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ auditStats.pending }}</div>
              <div class="stats-label">待审核</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon approved">
              <el-icon><Check /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ auditStats.approved }}</div>
              <div class="stats-label">已通过</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon rejected">
              <el-icon><Close /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ auditStats.rejected }}</div>
              <div class="stats-label">已拒绝</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon efficiency">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ auditStats.efficiency }}%</div>
              <div class="stats-label">审核效率</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 主要内容区域 -->
    <el-row :gutter="16">
      <!-- 待审核面板 -->
      <el-col :span="12">
        <PendingAuditPanel 
          :tasks="pendingTasks"
          @audit="handleAudit"
          @assign="handleAssign"
          @view-detail="handleViewDetail"
        />
      </el-col>
      
      <!-- 已通过内容面板 -->
      <el-col :span="12">
        <ApprovedContentPanel 
          :content="approvedContent"
          @publish="handlePublish"
          @schedule="handleSchedulePublish"
        />
      </el-col>
    </el-row>

    <!-- 发布监控面板 -->
    <el-row>
      <el-col :span="24">
        <PublishMonitorPanel 
          :publications="publications"
          @view-stats="handleViewPublishStats"
        />
      </el-col>
    </el-row>

    <!-- 内容详情弹窗 -->
    <ContentDetailsDialog 
      v-model="detailDialogVisible"
      :content="selectedContent"
      @audit="handleAudit"
    />

    <!-- 内容预览弹窗 -->
    <ContentPreviewDialog 
      v-model="previewDialogVisible"
      :content="previewContent"
    />

    <!-- 拒绝原因弹窗 -->
    <RejectReasonDialog 
      v-model="rejectDialogVisible"
      @confirm="handleRejectConfirm"
    />

    <!-- 任务分配弹窗 -->
    <TaskAssignDialog 
      v-model="assignDialogVisible"
      :task="assignTask"
      :auditors="auditors"
      @confirm="handleAssignConfirm"
    />

    <!-- 定时发布弹窗 -->
    <SchedulePublishDialog 
      v-model="scheduleDialogVisible"
      :content="scheduleContent"
      @confirm="handleScheduleConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Clock, Check, Close, TrendCharts } from '@element-plus/icons-vue'
import PendingAuditPanel from './components/PendingAuditPanel.vue'
import ApprovedContentPanel from './components/ApprovedContentPanel.vue'
import PublishMonitorPanel from './components/PublishMonitorPanel.vue'
import ContentDetailsDialog from './components/ContentDetailsDialog.vue'
import ContentPreviewDialog from './components/ContentPreviewDialog.vue'
import RejectReasonDialog from './components/RejectReasonDialog.vue'
import TaskAssignDialog from './components/TaskAssignDialog.vue'
import SchedulePublishDialog from './components/SchedulePublishDialog.vue'

// 审核统计数据
const auditStats = reactive({
  pending: 0,
  approved: 0,
  rejected: 0,
  efficiency: 0
})

// 弹窗控制
const detailDialogVisible = ref(false)
const previewDialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const assignDialogVisible = ref(false)
const scheduleDialogVisible = ref(false)

// 数据
const pendingTasks = ref([])
const approvedContent = ref([])
const publications = ref([])
const selectedContent = ref(null)
const previewContent = ref(null)
const assignTask = ref(null)
const scheduleContent = ref(null)
const auditors = ref([])

// 审核操作
const handleAudit = async (taskId: string, action: 'approve' | 'reject', reason?: string) => {
  try {
    // TODO: 调用审核API
    ElMessage.success(`审核${action === 'approve' ? '通过' : '拒绝'}成功`)
    await loadData()
  } catch (error) {
    ElMessage.error('审核操作失败')
  }
}

// 任务分配
const handleAssign = (task: any) => {
  assignTask.value = task
  assignDialogVisible.value = true
}

// 查看详情
const handleViewDetail = (content: any) => {
  selectedContent.value = content
  detailDialogVisible.value = true
}

// 发布内容
const handlePublish = async (contentId: string) => {
  try {
    // TODO: 调用发布API
    ElMessage.success('发布成功')
    await loadData()
  } catch (error) {
    ElMessage.error('发布失败')
  }
}

// 定时发布
const handleSchedulePublish = (content: any) => {
  scheduleContent.value = content
  scheduleDialogVisible.value = true
}

// 拒绝确认
const handleRejectConfirm = (reason: string) => {
  // TODO: 处理拒绝逻辑
  rejectDialogVisible.value = false
}

// 分配确认
const handleAssignConfirm = (assigneeId: number) => {
  // TODO: 处理分配逻辑
  assignDialogVisible.value = false
}

// 定时发布确认
const handleScheduleConfirm = (scheduleData: any) => {
  // TODO: 处理定时发布逻辑
  scheduleDialogVisible.value = false
}

// 查看发布统计
const handleViewPublishStats = (publicationId: string) => {
  // TODO: 处理查看发布统计逻辑
}

// 加载数据
const loadData = async () => {
  try {
    // TODO: 加载审核数据
    auditStats.pending = 23
    auditStats.approved = 156
    auditStats.rejected = 12
    auditStats.efficiency = 87
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.audit-center {
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

.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  height: 80px;
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.stats-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stats-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: #fff;
}

.stats-icon.pending {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stats-icon.approved {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stats-icon.rejected {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stats-icon.efficiency {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stats-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
}

.stats-label {
  color: #909399;
  font-size: 14px;
  margin-top: 4px;
}
</style>