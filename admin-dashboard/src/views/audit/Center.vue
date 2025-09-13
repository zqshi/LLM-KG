<template>
  <div class="audit-center">
    <UnifiedPageHeader
      title="统一审核中心"
      description="集中处理全平台内容审核任务，提升审核效率与质量"
    >
      <template #actions>
        <el-button type="primary" @click="refreshData">
          <el-icon>
            <Refresh />
          </el-icon>
          刷新数据
        </el-button>
        <el-button @click="showSettings">
          <el-icon>
            <Setting />
          </el-icon>
          审核设置
        </el-button>
        <el-button @click="showPerformanceMonitor">
          <el-icon>
            <Monitor />
          </el-icon>
          性能监控
        </el-button>
      </template>
    </UnifiedPageHeader>

    <!-- 数据看板 -->
    <el-row :gutter="16" class="dashboard-row">
      <el-col :span="6">
        <StatsCard
          :value="dashboardStats?.pendingTotal || 0"
          label="待审核总量"
          :icon="Clock"
          type="primary"
          :trend="dashboardStats?.todayNew || 0"
          trend-label="今日新增"
          trend-type="up"
        />
      </el-col>

      <el-col :span="6">
        <StatsCard
          :value="dashboardStats?.todayProcessed || 0"
          label="今日已处理"
          :icon="Check"
          type="info"
          :trend="dashboardStats?.avgProcessTime || 0"
          trend-label="平均处理时长"
          trend-type="neutral"
        />
      </el-col>

      <el-col :span="6">
        <StatsCard
          :value="dashboardStats ? `${dashboardStats.approvalRate || 0}%` : '0%'"
          label="审核通过率"
          :icon="CircleCheck"
          type="success"
          :trend="dashboardStats?.todayApproved || 0"
          trend-label="今日通过"
          trend-type="up"
        />
      </el-col>

      <el-col :span="6">
        <StatsCard
          :value="dashboardStats?.todayRejected || 0"
          label="今日拒绝"
          :icon="Close"
          type="danger"
          :trend="dashboardStats?.rejectionRate || 0"
          trend-label="拒绝率"
          trend-type="down"
        />
      </el-col>
    </el-row>

    <!-- 智能任务分配面板 -->
    <SmartTaskAssignmentPanel :selected-tasks="selectedTasks" />

    <!-- 批量操作面板 -->
    <BatchOperationPanel 
      :selected-tasks="selectedTasks" 
      @selection-change="handleSelectionChange"
      @operation-complete="handleOperationComplete"
    />

    <!-- 主要内容区域 -->
    <el-row :gutter="16" class="main-content">
      <!-- 左侧：任务列表 -->
      <el-col :span="12">
        <ContentCard title="待审核任务">
          <template #extra>
            <el-button type="primary" size="small" @click="handleBatchApprove"
              :disabled="selectedTasks.length === 0">
              批量通过 ({{ selectedTasks.length }})
            </el-button>
            <el-button type="danger" size="small" @click="handleBatchReject" :disabled="selectedTasks.length === 0">
              批量拒绝
            </el-button>
          </template>

          <!-- 筛选器 -->
          <div class="filter-section">
            <el-row :gutter="16">
              <el-col :span="6">
                <el-select v-model="filters.bizType" placeholder="业务类型" clearable
                  @change="() => auditStore.loadTasks()">
                  <el-option label="全部" value="" />
                  <el-option label="论坛帖子" value="forum_post" />
                  <el-option label="跳蚤市场" value="flea_goods" />
                  <el-option label="资讯文章" value="news" />
                  <el-option label="Banner广告" value="banner" />
                  <el-option label="名言警句" value="quotation" />
                </el-select>
              </el-col>
              <el-col :span="6">
                <el-select v-model="filters.priority" placeholder="优先级" clearable
                  @change="() => auditStore.loadTasks()">
                  <el-option label="全部" value="" />
                  <el-option label="高优先级" value="high" />
                  <el-option label="普通优先级" value="normal" />
                  <el-option label="低优先级" value="low" />
                </el-select>
              </el-col>
              <el-col :span="6">
                <el-date-picker v-model="filters.dateRange" type="daterange" range-separator="至"
                  start-placeholder="开始日期" end-placeholder="结束日期" @change="() => auditStore.loadTasks()" />
              </el-col>
              <el-col :span="6">
                <el-input v-model="filters.keyword" placeholder="搜索标题或内容" clearable @input="handleSearch">
                  <template #prefix>
                    <el-icon>
                      <Search />
                    </el-icon>
                  </template>
                </el-input>
              </el-col>
            </el-row>
          </div>

          <!-- 任务列表 -->
          <div class="task-list">
            <el-table :data="taskList" v-loading="loading" @selection-change="handleSelectionChange" class="task-table">
              <el-table-column type="selection" width="55" />
              <el-table-column prop="taskId" label="任务ID" width="120" />
              <el-table-column label="内容类型" width="100">
                <template #default="{ row }">
                  <el-tag :type="getBizTypeTag(row.bizType)">
                    {{ getBizTypeLabel(row.bizType) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="title" label="标题/摘要" min-width="200">
                <template #default="{ row }">
                  <div class="content-title" @click="viewContentDetail(row)">
                    {{ row.title || row.content.substring(0, 50) + '...' }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="submitterName" label="提交人" width="100" />
              <el-table-column prop="createTime" label="提交时间" width="160">
                <template #default="{ row }">
                  {{ formatTime(row.createTime) }}
                </template>
              </el-table-column>
              <el-table-column label="优先级" width="80">
                <template #default="{ row }">
                  <el-tag :type="getPriorityTag(row.priority)" size="small">
                    {{ getPriorityLabel(row.priority) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                  <el-button type="success" size="small" @click="handleApprove(row)">
                    通过
                  </el-button>
                  <el-button type="danger" size="small" @click="handleReject(row)">
                    拒绝
                  </el-button>
                  <el-button type="info" size="small" @click="handleTransfer(row)">
                    转交
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-wrapper">
              <el-pagination v-model:current-page="pagination.current" v-model:page-size="pagination.size"
                :total="pagination.total" :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper" @size-change="() => auditStore.loadTasks()"
                @current-change="() => auditStore.loadTasks()" />
            </div>
          </div>
        </ContentCard>
      </el-col>

      <!-- 右侧：增强任务详情 -->
      <el-col :span="12">
        <EnhancedTaskDetailPanel 
          :selected-task="selectedTask"
          @approve="handleApprove"
          @reject="handleReject"
          @transfer="handleTransfer"
        />
      </el-col>
    </el-row>

    <!-- 拒绝原因弹窗 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝原因" width="500px">
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="拒绝原因">
          <el-select v-model="rejectForm.reason" placeholder="请选择拒绝原因">
            <el-option label="包含广告内容" value="advertisement" />
            <el-option label="内容违规" value="violation" />
            <el-option label="信息不实" value="false_info" />
            <el-option label="重复内容" value="duplicate" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="详细说明" v-if="rejectForm.reason === 'other'">
          <el-input v-model="rejectForm.detail" type="textarea" :rows="3" placeholder="请详细说明拒绝原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确认拒绝</el-button>
      </template>
    </el-dialog>

    <!-- 转交任务弹窗 -->
    <el-dialog v-model="transferDialogVisible" title="转交任务" width="500px">
      <el-form :model="transferForm" label-width="80px">
        <el-form-item label="转交给">
          <el-select v-model="transferForm.assigneeId" placeholder="请选择审核员">
            <el-option v-for="auditor in auditors" :key="auditor.id" :label="auditor.name" :value="auditor.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="转交原因">
          <el-input v-model="transferForm.reason" type="textarea" :rows="3" placeholder="请说明转交原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="transferDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmTransfer">确认转交</el-button>
      </template>
    </el-dialog>

    <!-- 审核设置弹窗 -->
    <el-dialog v-model="settingsDialogVisible" title="审核设置" width="800px">
      <el-tabs v-model="settingsActiveTab">
        <el-tab-pane label="审核策略" name="policy">
          <AuditPolicySettings />
        </el-tab-pane>
        <el-tab-pane label="敏感词管理" name="sensitive">
          <SensitiveWordsSettings />
        </el-tab-pane>
        <el-tab-pane label="审核员管理" name="auditors">
          <AuditorManagement />
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 性能监控对话框 -->
    <el-dialog 
      title="性能监控中心" 
      v-model="performanceMonitorVisible"
      width="90%"
      :before-close="() => performanceMonitorVisible = false"
    >
      <PerformanceMonitor />
      <template #footer>
        <el-button @click="performanceMonitorVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'

// 定义审核员类型
interface Auditor {
  id: number;
  name: string;
}
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  Setting,
  Clock,
  Check,
  CircleCheck,
  Close,
  Search,
  Share,
  Monitor
} from '@element-plus/icons-vue'
import { useAuditStore } from '@/stores/audit'
import AuditPolicySettings from './components/AuditPolicySettings.vue'
import SensitiveWordsSettings from './components/SensitiveWordsSettings.vue'
import AuditorManagement from './components/AuditorManagement.vue'
import SmartTaskAssignmentPanel from './components/SmartTaskAssignmentPanel.vue'
import EnhancedTaskDetailPanel from './components/EnhancedTaskDetailPanel.vue'
import BatchOperationPanel from './components/BatchOperationPanel.vue'
import PerformanceMonitor from './components/PerformanceMonitor.vue'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import StatsCard from '@/components/StatsCard.vue'
import ContentCard from '@/components/common/ContentCard.vue'

// Store
const auditStore = useAuditStore()

// 响应式数据
const selectedTask = ref<null | any>(null)
const auditors = ref<Auditor[]>([])

// 弹窗控制
const rejectDialogVisible = ref(false)
const transferDialogVisible = ref(false)
const settingsDialogVisible = ref(false)
const settingsActiveTab = ref('policy')
const performanceMonitorVisible = ref(false)

// 表单数据
const rejectForm = reactive({
  reason: '' as string,
  detail: '' as string
})

const transferForm = reactive({
  assigneeId: null as number | null,
  reason: '' as string
})

// 从store获取数据 - 使用storeToRefs保持响应式
const {
  loading,
  taskList,
  selectedTasks,
  dashboardStats,
  pagination,
  filters
} = storeToRefs(auditStore)

// 计算属性
const selectedTaskIds = computed(() => {
  return selectedTasks.value.map(task => task.taskId)
})

// 方法
const refreshData = () => {
  auditStore.loadDashboardStats()
  auditStore.loadTasks()
}

const showSettings = () => {
  settingsDialogVisible.value = true
}

const showPerformanceMonitor = () => {
  performanceMonitorVisible.value = true
}

const handleSelectionChange = (selection: any[]) => {
  auditStore.setSelectedTasks(selection)
}

const handleSearch = () => {
  pagination.value.current = 1
  auditStore.loadTasks()
}

const viewContentDetail = (task: any) => {
  selectedTask.value = task
}

const handleApprove = async (task: any) => {
  try {
    await ElMessageBox.confirm('确认通过此内容？', '确认操作', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await auditStore.approveTask(task.taskId)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleReject = (task: any) => {
  selectedTask.value = task
  rejectForm.reason = ''
  rejectForm.detail = ''
  rejectDialogVisible.value = true
}

const handleTransfer = (task: any) => {
  selectedTask.value = task
  transferForm.assigneeId = null
  transferForm.reason = ''
  transferDialogVisible.value = true
}

const handleBatchApprove = async () => {
  try {
    await ElMessageBox.confirm(
      `确认批量通过选中的 ${selectedTasks.value.length} 个任务？`,
      '确认操作',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await auditStore.batchAudit(selectedTaskIds.value, 'approve')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleBatchReject = () => {
  rejectForm.reason = ''
  rejectForm.detail = ''
  rejectDialogVisible.value = true
}

const confirmReject = async () => {
  if (!rejectForm.reason) {
    ElMessage.warning('请选择拒绝原因')
    return
  }

  try {
    await auditStore.rejectTask(selectedTask.value?.taskId, rejectForm.reason, rejectForm.detail)
    rejectDialogVisible.value = false
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const confirmTransfer = async () => {
  if (!transferForm.assigneeId) {
    ElMessage.warning('请选择转交对象')
    return
  }

  if (!transferForm.reason) {
    ElMessage.warning('请填写转交原因')
    return
  }

  try {
    await auditStore.transferTask(selectedTask.value?.taskId, transferForm.assigneeId, transferForm.reason)
    transferDialogVisible.value = false
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 工具方法
const getBizTypeLabel = (bizType: string) => {
  const labels: { [key: string]: string } = {
    forum_post: '论坛帖子',
    flea_goods: '跳蚤市场',
    news: '资讯文章',
    banner: 'Banner广告',
    quotation: '名言警句'
  }
  return labels[bizType] || bizType
}

const getBizTypeTag = (bizType: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' | undefined => {
  const tags: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    forum_post: 'primary',
    flea_goods: 'success',
    news: 'warning',
    banner: 'info',
    quotation: 'danger'
  }
  return tags[bizType] || undefined
}

const getPriorityLabel = (priority: string) => {
  const labels: { [key: string]: string } = {
    high: '高',
    normal: '普通',
    low: '低'
  }
  return labels[priority] || priority
}

const getPriorityTag = (priority: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' | undefined => {
  const tags: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    high: 'danger',
    normal: 'warning',
    low: 'info'
  }
  return tags[priority] || undefined
}


const handleOperationComplete = async (operation: any) => {
  // 处理批量操作完成后的逻辑
  console.log('批量操作完成:', operation)
  
  // 刷新任务列表和统计数据
  await refreshData()
  
  // 清空选择
  auditStore.setSelectedTasks([])
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

// 生命周期
onMounted(async () => {
  try {
    await auditStore.initialize()
  } catch (error) {
    console.error('初始化审核中心失败:', error)
    ElMessage({
      message: '无法连接到后端服务，请确保后端服务已启动（运行: npm run mock）',
      type: 'error',
      duration: 0,
      showClose: true
    })
  }
})
</script>

<style scoped>
.audit-center {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.dashboard-row {
  margin-bottom: 20px;
}

.metric-card {
  height: 120px;
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.metric-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.metric-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: #fff;
  font-size: 24px;
}

.metric-card.pending .metric-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.metric-card.processed .metric-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.metric-card.approved .metric-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.metric-card.rejected .metric-icon {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.metric-value {
  font-size: 28px;
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
  margin-top: 8px;
  font-size: 12px;
}

.trend-up {
  color: #67c23a;
  font-weight: 500;
}

.trend-down {
  color: #f56c6c;
  font-weight: 500;
}

.trend-text {
  color: #909399;
  margin-left: 4px;
}

.main-content {
  margin-bottom: 20px;
}

.task-list-card {
  min-height: 600px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.filter-section {
  margin-bottom: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.task-table {
  margin-bottom: 16px;
}

.content-title {
  color: #409eff;
  cursor: pointer;
  text-decoration: underline;
}

.content-title:hover {
  color: #66b1ff;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.detail-card {
  min-height: 600px;
}

.content-detail {
  padding: 16px 0;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 8px;
}

.detail-item {
  display: flex;
  margin-bottom: 8px;
}

.detail-item .label {
  width: 80px;
  color: #909399;
  font-size: 14px;
}

.detail-item .value {
  color: #303133;
  font-size: 14px;
}

.content-preview {
  background: #fafafa;
  padding: 16px;
  border-radius: 8px;
}

.content-preview .content-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #303133;
  text-decoration: none;
}

.content-preview .content-body {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 12px;
}

.content-images {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.content-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  min-width: 80px;
}

.empty-detail {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
}
</style>