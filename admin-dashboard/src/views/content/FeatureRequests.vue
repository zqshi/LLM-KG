<template>
  <div class="feature-requests-page">
    <UnifiedPageHeader 
      title="置顶/加精申请" 
      description="处理用户提交的置顶和加精申请，助力社区优质内容推广"
    >
      <template #actions>
        <el-button @click="refreshData" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
        <el-dropdown @command="handleExport">
          <el-button>
            <el-icon><Download /></el-icon>
            导出数据
            <el-icon><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="all">导出全部申请</el-dropdown-item>
              <el-dropdown-item command="pending">导出待处理申请</el-dropdown-item>
              <el-dropdown-item command="approved">导出已通过申请</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </UnifiedPageHeader>

    <!-- 数据统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon total">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ stats.totalRequests }}</div>
              <div class="stats-label">总申请数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stats-card" @click="filterByStatus('pending')">
          <div class="stats-content clickable">
            <div class="stats-icon pending">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ stats.pendingRequests }}</div>
              <div class="stats-label">待处理</div>
            </div>
            <div class="stats-action">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon approved">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ stats.approvedRequests }}</div>
              <div class="stats-label">已通过</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon rejected">
              <el-icon><CircleClose /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ stats.rejectedRequests }}</div>
              <div class="stats-label">已拒绝</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选和搜索 -->
    <el-card shadow="never" class="filter-card">
      <el-form :model="queryParams" :inline="true" class="filter-form">
        <el-form-item label="申请类型">
          <el-select 
            v-model="queryParams.requestType" 
            placeholder="全部类型" 
            clearable
            style="width: 120px"
          >
            <el-option label="置顶" value="top" />
            <el-option label="加精" value="elite" />
          </el-select>
        </el-form-item>

        <el-form-item label="申请状态">
          <el-select 
            v-model="queryParams.status" 
            placeholder="全部状态" 
            clearable
            style="width: 120px"
          >
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>

        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="关键词">
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索帖子标题或申请人" 
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 申请列表 -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="table-header">
          <span class="table-title">申请列表</span>
          <div class="table-actions">
            <el-button 
              type="success" 
              :disabled="!selectedRequests.length"
              @click="batchProcess('approve')"
            >
              <el-icon><Check /></el-icon>
              批量通过 ({{ selectedRequests.length }})
            </el-button>
            <el-button 
              type="danger" 
              :disabled="!selectedRequests.length"
              @click="batchProcess('reject')"
            >
              <el-icon><Close /></el-icon>
              批量拒绝 ({{ selectedRequests.length }})
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="requestList"
        @selection-change="handleSelectionChange"
        stripe
        class="requests-table"
      >
        <el-table-column type="selection" width="50" />
        
        <el-table-column label="申请ID" prop="id" width="80" />
        
        <el-table-column label="申请类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getRequestTypeColor(row.requestType)" size="small">
              <el-icon class="tag-icon">
                <Top v-if="row.requestType === 'top'" />
                <Star v-else />
              </el-icon>
              {{ getRequestTypeName(row.requestType) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="帖子标题" min-width="200">
          <template #default="{ row }">
            <div class="post-info">
              <el-link 
                type="primary" 
                @click="viewPost(row.post)"
                class="post-title"
              >
                {{ row.post?.title || '帖子已删除' }}
              </el-link>
              <div class="post-meta" v-if="row.post">
                <el-text type="info" size="small">
                  作者：{{ row.post.author?.name }} | 
                  发布：{{ formatTime(row.post.createdAt) }}
                </el-text>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="申请人" width="120">
          <template #default="{ row }">
            <div class="applicant-info">
              <el-avatar :size="24" :src="row.applicant.avatar">
                {{ row.applicant.name?.charAt(0) }}
              </el-avatar>
              <span class="applicant-name">{{ row.applicant.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="申请理由" min-width="200">
          <template #default="{ row }">
            <el-tooltip 
              :content="row.reason" 
              placement="top" 
              :disabled="row.reason.length <= 50"
            >
              <div class="reason-text">
                {{ row.reason.length > 50 ? row.reason.substring(0, 50) + '...' : row.reason }}
              </div>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column label="申请状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)" size="small">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="申请时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="审核人" width="100">
          <template #default="{ row }">
            <span v-if="row.reviewer">{{ row.reviewer.name }}</span>
            <el-text v-else type="info" size="small">-</el-text>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button 
                v-if="row.status === 'pending'"
                type="success" 
                size="small" 
                @click="processRequest(row, 'approve')"
              >
                <el-icon><Check /></el-icon>
                通过
              </el-button>
              <el-button 
                v-if="row.status === 'pending'"
                type="danger" 
                size="small" 
                @click="processRequest(row, 'reject')"
              >
                <el-icon><Close /></el-icon>
                拒绝
              </el-button>
              <el-button 
                type="primary" 
                size="small" 
                text
                @click="viewRequestDetail(row)"
              >
                详情
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 申请详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="申请详情"
      width="800px"
      :before-close="closeDetail"
    >
      <div v-if="currentRequest" class="request-detail">
        <div class="detail-section">
          <h3>基本信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="申请ID">{{ currentRequest.id }}</el-descriptions-item>
            <el-descriptions-item label="申请类型">
              <el-tag :type="getRequestTypeColor(currentRequest.requestType)">
                {{ getRequestTypeName(currentRequest.requestType) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="申请状态">
              <el-tag :type="getStatusColor(currentRequest.status)">
                {{ getStatusName(currentRequest.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="申请时间">
              {{ formatTime(currentRequest.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="申请人">
              {{ currentRequest.applicant?.name }}
            </el-descriptions-item>
            <el-descriptions-item label="审核人">
              {{ currentRequest.reviewer?.name || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section" v-if="currentRequest.post">
          <h3>相关帖子</h3>
          <div class="post-preview">
            <h4 class="post-title">{{ currentRequest.post.title }}</h4>
            <div class="post-meta">
              <el-text type="info">
                作者：{{ currentRequest.post.author?.name }} | 
                发布时间：{{ formatTime(currentRequest.post.createdAt) }} |
                浏览：{{ currentRequest.post.viewCount }} |
                点赞：{{ currentRequest.post.likeCount }}
              </el-text>
            </div>
            <div class="post-content">
              {{ currentRequest.post.content?.substring(0, 200) }}...
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3>申请理由</h3>
          <div class="reason-content">{{ currentRequest.reason }}</div>
        </div>

        <div class="detail-section" v-if="currentRequest.rejectReason">
          <h3>拒绝原因</h3>
          <div class="reject-reason">{{ currentRequest.rejectReason }}</div>
        </div>
      </div>

      <template #footer>
        <div class="detail-footer">
          <el-button @click="detailVisible = false">关闭</el-button>
          <el-button 
            v-if="currentRequest?.status === 'pending'" 
            type="success"
            @click="processRequestFromDetail('approve')"
          >
            通过申请
          </el-button>
          <el-button 
            v-if="currentRequest?.status === 'pending'" 
            type="danger"
            @click="processRequestFromDetail('reject')"
          >
            拒绝申请
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 拒绝原因对话框 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="拒绝申请"
      width="500px"
    >
      <el-form :model="rejectForm" :rules="rejectRules" ref="rejectFormRef">
        <el-form-item label="拒绝原因" prop="reason">
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝原因，将发送给申请人"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject" :loading="processing">
          确认拒绝
        </el-button>
      </template>
    </el-dialog>

    <!-- 帖子预览对话框 -->
    <el-dialog
      v-model="postPreviewVisible"
      title="帖子预览"
      width="800px"
    >
      <div v-if="currentPost" class="post-preview-content">
        <h2>{{ currentPost.title }}</h2>
        <div class="post-info">
          <el-text type="info">
            作者：{{ currentPost.author?.name }} | 
            发布：{{ formatTime(currentPost.createdAt) }} |
            分类：{{ currentPost.category }}
          </el-text>
        </div>
        <div class="post-content">{{ currentPost.content }}</div>
        <div class="post-tags" v-if="currentPost.tags?.length">
          <el-tag v-for="tag in currentPost.tags" :key="tag" size="small">
            {{ tag }}
          </el-tag>
        </div>
      </div>
      <template #footer>
        <el-button @click="postPreviewVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import {
  Refresh, Download, ArrowDown, Document, Clock, CircleCheck, CircleClose,
  ArrowRight, Search, RefreshLeft, Check, Close, Top, Star
} from '@element-plus/icons-vue'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import { featureRequestApi } from '@/api/feature-request'
import type { 
  ForumFeatureRequest, 
  FeatureRequestQueryParams,
  FeatureRequestStats,
  FeatureRequestType,
  FeatureRequestStatus,
  Content
} from '@/types'

// 响应式数据
const loading = ref(false)
const processing = ref(false)
const detailVisible = ref(false)
const rejectDialogVisible = ref(false)
const postPreviewVisible = ref(false)

const requestList = ref<ForumFeatureRequest[]>([])
const selectedRequests = ref<ForumFeatureRequest[]>([])
const currentRequest = ref<ForumFeatureRequest | null>(null)
const currentPost = ref<Content | null>(null)
const total = ref(0)
const dateRange = ref<[string, string] | null>(null)

const stats = ref<FeatureRequestStats>({
  totalRequests: 0,
  pendingRequests: 0,
  approvedRequests: 0,
  rejectedRequests: 0,
  todayRequests: 0,
  thisWeekRequests: 0,
  topRequests: 0,
  eliteRequests: 0,
  approvalRate: 0
})

const queryParams = reactive<FeatureRequestQueryParams>({
  page: 1,
  pageSize: 20,
  requestType: undefined,
  status: undefined,
  startTime: undefined,
  endTime: undefined
})

// 搜索关键词单独定义
const searchKeyword = ref('')

const rejectForm = reactive({
  reason: '',
  requestIds: [] as number[]
})

const rejectFormRef = ref<FormInstance>()
const rejectRules = {
  reason: [
    { required: true, message: '请输入拒绝原因', trigger: 'blur' },
    { min: 5, message: '拒绝原因至少需要5个字符', trigger: 'blur' }
  ]
}

// 方法
const getRequestTypeName = (type: FeatureRequestType): string => {
  return type === 'top' ? '置顶' : '加精'
}

const getRequestTypeColor = (type: FeatureRequestType): 'warning' | 'success' => {
  return type === 'top' ? 'warning' : 'success'
}

const getStatusName = (status: FeatureRequestStatus): string => {
  const statusMap = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return statusMap[status] || status
}

const getStatusColor = (status: FeatureRequestStatus): 'warning' | 'success' | 'danger' => {
  const colorMap = {
    pending: 'warning' as const,
    approved: 'success' as const,
    rejected: 'danger' as const
  }
  return colorMap[status] || 'warning'
}

const formatTime = (timeStr: string): string => {
  return new Date(timeStr).toLocaleString('zh-CN')
}

const refreshData = async () => {
  await Promise.all([
    loadRequestList(),
    loadStats()
  ])
}

const loadRequestList = async () => {
  loading.value = true
  try {
    // 处理时间范围
    if (dateRange.value) {
      queryParams.startTime = dateRange.value[0]
      queryParams.endTime = dateRange.value[1]
    } else {
      queryParams.startTime = undefined
      queryParams.endTime = undefined
    }

    const { data } = await featureRequestApi.getRequestList(queryParams)
    requestList.value = data.list
    total.value = data.total
  } catch (error) {
    ElMessage.error('加载申请列表失败')
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const { data } = await featureRequestApi.getRequestStats()
    stats.value = data
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const handleSearch = () => {
  queryParams.page = 1
  loadRequestList()
}

const handleReset = () => {
  Object.assign(queryParams, {
    page: 1,
    pageSize: 20,
    requestType: undefined,
    status: undefined,
    startTime: undefined,
    endTime: undefined
  })
  dateRange.value = null
  loadRequestList()
}

const filterByStatus = (status: FeatureRequestStatus) => {
  queryParams.status = status
  queryParams.page = 1
  loadRequestList()
}

const handleSelectionChange = (selection: ForumFeatureRequest[]) => {
  selectedRequests.value = selection
}

const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  queryParams.page = 1
  loadRequestList()
}

const handleCurrentChange = (page: number) => {
  queryParams.page = page
  loadRequestList()
}

const processRequest = async (request: ForumFeatureRequest, action: 'approve' | 'reject') => {
  if (action === 'reject') {
    // 打开拒绝原因对话框
    currentRequest.value = request
    rejectForm.requestIds = [request.id]
    rejectForm.reason = ''
    rejectDialogVisible.value = true
    return
  }

  try {
    processing.value = true
    await featureRequestApi.processRequest({
      requestId: request.id,
      action
    })
    ElMessage.success(action === 'approve' ? '申请已通过' : '申请已拒绝')
    refreshData()
  } catch (error) {
    ElMessage.error('处理失败')
  } finally {
    processing.value = false
  }
}

const batchProcess = async (action: 'approve' | 'reject') => {
  if (!selectedRequests.value.length) return

  if (action === 'reject') {
    // 批量拒绝需要输入原因
    rejectForm.requestIds = selectedRequests.value.map(r => r.id)
    rejectForm.reason = ''
    rejectDialogVisible.value = true
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要批量通过这 ${selectedRequests.value.length} 个申请吗？`,
      '批量处理',
      { type: 'warning' }
    )

    processing.value = true
    await featureRequestApi.batchProcessRequests({
      requestIds: selectedRequests.value.map(r => r.id),
      action
    })
    ElMessage.success('批量处理成功')
    refreshData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量处理失败')
    }
  } finally {
    processing.value = false
  }
}

const confirmReject = async () => {
  if (!rejectFormRef.value) return

  try {
    await rejectFormRef.value.validate()
    processing.value = true
    
    await featureRequestApi.batchProcessRequests({
      requestIds: rejectForm.requestIds,
      action: 'reject',
      rejectReason: rejectForm.reason
    })

    ElMessage.success('申请已拒绝')
    rejectDialogVisible.value = false
    refreshData()
  } catch (error: any) {
    if (error.fields) {
      ElMessage.error('请完善拒绝原因')
    } else {
      ElMessage.error('拒绝失败')
    }
  } finally {
    processing.value = false
  }
}

const viewRequestDetail = (request: ForumFeatureRequest) => {
  currentRequest.value = request
  detailVisible.value = true
}

const closeDetail = () => {
  detailVisible.value = false
  currentRequest.value = null
}

const processRequestFromDetail = (action: 'approve' | 'reject') => {
  if (!currentRequest.value) return
  detailVisible.value = false
  processRequest(currentRequest.value, action)
}

const viewPost = (post: Content) => {
  currentPost.value = post
  postPreviewVisible.value = true
}

const handleExport = async (command: string) => {
  try {
    const params = { ...queryParams }
    if (command === 'pending') {
      params.status = 'pending'
    } else if (command === 'approved') {
      params.status = 'approved'
    }

    const { data } = await featureRequestApi.exportRequests(params)
    // 触发下载
    const link = document.createElement('a')
    link.href = data.downloadUrl
    link.download = `feature-requests-${command}-${Date.now()}.xlsx`
    link.click()
    
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped lang="scss">
.feature-requests-page {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  min-height: 80px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .stats-content {
    display: flex;
    align-items: center;
    min-height: 80px;
    position: relative;

    &.clickable:hover {
      background-color: #fdf6ec;
    }
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
    font-size: 20px;

    &.total {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &.pending {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    &.approved {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    &.rejected {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }
  }

  .stats-value {
    font-size: 24px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    line-height: 1;
  }

  .stats-label {
    color: var(--el-text-color-secondary);
    font-size: 14px;
    margin-top: 4px;
  }

  .stats-action {
    position: absolute;
    right: 16px;
    color: var(--el-text-color-secondary);
  }
}

.filter-card {
  margin-bottom: 20px;

  .filter-form {
    .el-form-item {
      margin-bottom: 0;
    }
  }
}

.table-card {
  .el-card__header {
    padding: 16px 20px;
  }

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .table-title {
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .table-actions {
      display: flex;
      gap: 8px;
    }
  }

  .requests-table {
    .post-info {
      .post-title {
        font-weight: 500;
        text-decoration: none;
        display: block;
        margin-bottom: 4px;
      }
      
      .post-meta {
        font-size: 12px;
      }
    }

    .applicant-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .applicant-name {
        font-size: 14px;
        color: var(--el-text-color-primary);
      }
    }

    .reason-text {
      line-height: 1.4;
      color: var(--el-text-color-regular);
    }

    .tag-icon {
      margin-right: 4px;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }
  }

  .pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}

.request-detail {
  .detail-section {
    margin-bottom: 24px;

    h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  .post-preview {
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    padding: 16px;

    .post-title {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .post-meta {
      margin-bottom: 12px;
      font-size: 14px;
    }

    .post-content {
      color: var(--el-text-color-regular);
      line-height: 1.6;
    }
  }

  .reason-content, .reject-reason {
    background-color: var(--el-fill-color-lighter);
    border-radius: 4px;
    padding: 12px;
    color: var(--el-text-color-regular);
    line-height: 1.6;
  }

  .reject-reason {
    background-color: var(--el-color-danger-light-9);
    color: var(--el-color-danger);
  }

  .detail-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}

.post-preview-content {
  h2 {
    margin: 0 0 16px 0;
    font-size: 24px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .post-info {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--el-border-color);
  }

  .post-content {
    margin-bottom: 20px;
    line-height: 1.8;
    color: var(--el-text-color-regular);
  }

  .post-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .filter-form {
    flex-direction: column;
    gap: 16px;
    align-items: stretch !important;
  }

  .stats-row .el-col {
    width: 50% !important;
    max-width: 50% !important;
    flex: 0 0 50% !important;
    margin-bottom: 12px;
  }
}

@media (max-width: 576px) {
  .stats-row .el-col {
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 100% !important;
  }
}
</style>