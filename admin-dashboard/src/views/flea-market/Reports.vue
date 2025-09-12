<template>
  <div class="reports-page">
    <UnifiedPageHeader 
      title="举报处理" 
      description="处理用户对商品、用户和评论的举报"
    >
      <template #actions>
        <el-button 
          type="primary"
          :icon="Refresh"
          @click="handleRefresh"
          :loading="loading"
          data-testid="refresh-btn"
        >
          刷新数据
        </el-button>
        <el-button
          type="danger" 
          :disabled="selectedReports.length === 0"
          @click="showBatchHandleDialog = true"
          data-testid="batch-handle-btn"
        >
          批量处理 ({{ selectedReports.length }})
        </el-button>
      </template>
    </UnifiedPageHeader>

    <!-- 筛选器 -->
    <el-card class="filter-card" data-testid="reports-filter">
      <el-form 
        :model="filters" 
        inline
        @submit.prevent="loadReports"
      >
        <el-form-item label="状态筛选">
          <el-select 
            v-model="filters.status" 
            placeholder="请选择状态"
            clearable
            data-testid="status-filter"
            @change="loadReports"
          >
            <el-option label="全部" value="" />
            <el-option label="待处理" value="pending" />
            <el-option label="已处理" value="processed" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
        </el-form-item>

        <el-form-item label="举报类型">
          <el-select 
            v-model="filters.targetType" 
            placeholder="请选择类型"
            clearable
            data-testid="type-filter"
            @change="loadReports"
          >
            <el-option label="全部" value="" />
            <el-option label="商品" value="goods" />
            <el-option label="用户" value="user" />
            <el-option label="评论" value="comment" />
          </el-select>
        </el-form-item>

        <el-form-item label="举报时间">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            data-testid="date-filter"
            @change="loadReports"
          />
        </el-form-item>

        <el-form-item label="关键词">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索举报内容或用户"
            clearable
            @keyup.enter="loadReports"
            @clear="loadReports"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="loadReports">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 举报列表 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="reportsList"
        @selection-change="handleSelectionChange"
        stripe
        data-testid="reports-table"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="id" label="举报ID" width="80" />
        
        <el-table-column label="举报人" width="150">
          <template #default="{ row }">
            <div class="reporter-info">
              <div class="reporter-name">{{ row.reporter?.name || '未知用户' }}</div>
              <div class="reporter-email">{{ row.reporter?.email || '-' }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="被举报对象" width="300">
          <template #default="{ row }">
            <div v-if="row.targetType === 'goods' && row.targetGoods" class="target-info">
              <div class="target-title">{{ row.targetGoods.title }}</div>
              <div class="target-meta">
                卖家：{{ row.targetGoods.seller?.name || '未知卖家' }} | 
                类型：{{ getTargetTypeText(row.targetType) }}
              </div>
            </div>
            <div v-else class="target-info">
              <div class="target-title">{{ getTargetTypeText(row.targetType) }}</div>
              <div class="target-meta">ID: {{ row.targetId }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="举报原因" width="200">
          <template #default="{ row }">
            <el-tooltip :content="row.reason" placement="top">
              <div class="reason-text">{{ row.reason }}</div>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag 
              :type="getStatusTagType(row.status)"
              :data-testid="`status-${row.status}`"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="处理信息" width="200">
          <template #default="{ row }">
            <div v-if="row.status === 'processed' && row.handler" class="handle-info">
              <div class="handler">处理人：{{ row.handler?.name || '未知处理人' }}</div>
              <div class="handle-time">时间：{{ row.handleTime }}</div>
              <div v-if="row.handleRemark" class="handle-remark">
                备注：{{ row.handleRemark }}
              </div>
            </div>
            <span v-else class="no-handle">-</span>
          </template>
        </el-table-column>

        <el-table-column label="举报时间" width="150">
          <template #default="{ row }">
            {{ row.createTime }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === 'pending'"
              type="primary" 
              size="small"
              @click="openHandleDialog(row)"
              data-testid="handle-btn"
            >
              处理
            </el-button>
            <el-button 
              type="info" 
              size="small"
              @click="viewDetail(row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container" data-testid="loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>

      <!-- 空数据状态 -->
      <el-empty 
        v-else-if="!reportsList.length" 
        description="暂无举报数据"
        data-testid="empty-state"
      />

      <!-- 分页 -->
      <div v-if="total > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          data-testid="pagination"
        />
      </div>
    </el-card>

    <!-- 处理举报对话框 -->
    <el-dialog
      v-model="showHandleDialog"
      title="处理举报"
      width="600px"
      :before-close="handleDialogClose"
    >
      <div v-if="currentReport" class="handle-dialog-content">
        <!-- 举报详情 -->
        <div class="report-detail" data-testid="report-detail">
          <h4>举报详情</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="举报ID">{{ currentReport.id }}</el-descriptions-item>
            <el-descriptions-item label="举报人">{{ currentReport.reporter?.name || '未知用户' }}</el-descriptions-item>
            <el-descriptions-item label="被举报对象">
              <span v-if="currentReport.targetGoods">{{ currentReport.targetGoods.title }}</span>
              <span v-else>{{ getTargetTypeText(currentReport.targetType) }} (ID: {{ currentReport.targetId }})</span>
            </el-descriptions-item>
            <el-descriptions-item label="举报时间">{{ currentReport.createTime }}</el-descriptions-item>
            <el-descriptions-item label="举报原因" :span="2">{{ currentReport.reason }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 处理表单 -->
        <el-form 
          ref="handleFormRef"
          :model="handleForm" 
          :rules="handleFormRules"
          label-width="100px"
        >
          <el-form-item label="处理结果" prop="action" required>
            <el-radio-group v-model="handleForm.action">
              <el-radio label="accept">接受举报</el-radio>
              <el-radio label="reject">驳回举报</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="处理备注" prop="remark">
            <el-input
              v-model="handleForm.remark"
              type="textarea"
              :rows="4"
              placeholder="请输入处理备注（必填）"
              maxlength="500"
              show-word-limit
              data-testid="handle-remark"
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="showHandleDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleSubmit"
          :loading="submitting"
        >
          确认处理
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量处理对话框 -->
    <el-dialog
      v-model="showBatchHandleDialog"
      title="批量处理举报"
      width="500px"
    >
      <div class="batch-handle-content">
        <p>已选择 <strong>{{ selectedReports.length }}</strong> 个举报，确定要批量处理吗？</p>
        
        <el-form 
          ref="batchHandleFormRef"
          :model="batchHandleForm"
          :rules="handleFormRules"
          label-width="100px"
        >
          <el-form-item label="处理结果" prop="action" required>
            <el-radio-group v-model="batchHandleForm.action">
              <el-radio label="accept">批量接受</el-radio>
              <el-radio label="reject">批量驳回</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="处理备注" prop="remark">
            <el-input
              v-model="batchHandleForm.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入处理备注（必填）"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="showBatchHandleDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="batchHandleSubmit"
          :loading="submitting"
        >
          确认批量处理
        </el-button>
      </template>
    </el-dialog>

    <!-- 举报详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="举报详情"
      width="800px"
    >
      <div v-if="currentReport" class="report-detail-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="举报ID">{{ currentReport.id }}</el-descriptions-item>
          <el-descriptions-item label="举报人">
            {{ currentReport.reporter?.name || '未知用户' }} ({{ currentReport.reporter?.email || '-' }})
          </el-descriptions-item>
          <el-descriptions-item label="被举报对象">
            <div v-if="currentReport.targetGoods">
              <strong>{{ currentReport.targetGoods.title }}</strong><br>
              卖家：{{ currentReport.targetGoods.seller?.name || '未知卖家' }}<br>
              类型：商品 (ID: {{ currentReport.targetId }})
            </div>
            <div v-else>
              {{ getTargetTypeText(currentReport.targetType) }} (ID: {{ currentReport.targetId }})
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="举报原因">{{ currentReport.reason }}</el-descriptions-item>
          <el-descriptions-item label="举报时间">{{ currentReport.createTime }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(currentReport.status)">
              {{ getStatusText(currentReport.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="currentReport.handler" label="处理人">
            {{ currentReport.handler?.name || '未知处理人' }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentReport.handleTime" label="处理时间">
            {{ currentReport.handleTime }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentReport.handleRemark" label="处理备注">
            {{ currentReport.handleRemark }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Search, Loading } from '@element-plus/icons-vue'
import { fleaMarketApi } from '@/api/fleaMarket'
import type { FleaReport, FleaReportQueryParams } from '@/types'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const reportsList = ref<FleaReport[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const selectedReports = ref<FleaReport[]>([])
const currentReport = ref<FleaReport | null>(null)
const error = ref<string>('')

// 对话框状态
const showHandleDialog = ref(false)
const showBatchHandleDialog = ref(false)
const showDetailDialog = ref(false)

// 筛选器
const filters = reactive<FleaReportQueryParams>({
  page: 1,
  pageSize: 20,
  status: '',
  targetType: '',
  dateRange: [],
  keyword: ''
})

// 处理表单
const handleForm = reactive({
  action: 'accept',
  remark: ''
})

const batchHandleForm = reactive({
  action: 'accept',
  remark: ''
})

// 表单验证规则
const handleFormRules = {
  action: [
    { required: true, message: '请选择处理结果', trigger: 'change' }
  ],
  remark: [
    { required: true, message: '请输入处理备注', trigger: 'blur' },
    { min: 5, message: '处理备注至少5个字符', trigger: 'blur' }
  ]
}

// 表单引用
const handleFormRef = ref()
const batchHandleFormRef = ref()

// 方法
const loadReports = async () => {
  if (loading.value) return
  
  loading.value = true
  error.value = ''
  
  try {
    const params = {
      ...filters,
      page: currentPage.value,
      pageSize: pageSize.value
    }
    
    const response = await fleaMarketApi.reports.list(params)
    
    if (response.code === 200) {
      reportsList.value = response.data.list
      total.value = response.data.total
    } else {
      throw new Error(response.message || '获取数据失败')
    }
  } catch (err: any) {
    error.value = '加载举报数据失败'
    ElMessage.error(error.value)
    console.error('Load reports error:', err)
  } finally {
    loading.value = false
  }
}

const handleRefresh = () => {
  currentPage.value = 1
  loadReports()
}

const resetFilters = () => {
  Object.assign(filters, {
    page: 1,
    pageSize: 20,
    status: '',
    targetType: '',
    dateRange: [],
    keyword: ''
  })
  currentPage.value = 1
  loadReports()
}

const handleSelectionChange = (selection: FleaReport[]) => {
  selectedReports.value = selection
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadReports()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadReports()
}

const openHandleDialog = (report: FleaReport) => {
  currentReport.value = report
  handleForm.action = 'accept'
  handleForm.remark = ''
  showHandleDialog.value = true
}

const handleDialogClose = () => {
  showHandleDialog.value = false
  currentReport.value = null
  if (handleFormRef.value) {
    handleFormRef.value.resetFields()
  }
}

const handleSubmit = async () => {
  if (!handleFormRef.value || !currentReport.value) return
  
  try {
    await handleFormRef.value.validate()
    
    submitting.value = true
    
    const response = await fleaMarketApi.reports.handle(currentReport.value.id, {
      handleRemark: handleForm.remark,
      action: handleForm.action === 'accept' ? 'dismiss' : 'warn'
    })
    
    if (response.code === 200) {
      ElMessage.success('举报处理成功')
      showHandleDialog.value = false
      await loadReports()
    } else {
      throw new Error(response.message || '处理失败')
    }
  } catch (err: any) {
    if (err.message) {
      error.value = `处理失败: ${err.message}`
      ElMessage.error(error.value)
    }
  } finally {
    submitting.value = false
  }
}

const batchHandle = async (action: string, remark: string) => {
  if (selectedReports.value.length === 0) return
  
  try {
    submitting.value = true
    
    // 由于API不支持批量处理，我们逐个处理
    const promises = selectedReports.value.map(report => 
      fleaMarketApi.reports.handle(report.id, {
        handleRemark: remark,
        action: action === 'accept' ? 'dismiss' : 'warn'
      })
    )
    
    await Promise.all(promises)
    
    ElMessage.success(`批量处理成功，共处理 ${selectedReports.value.length} 个举报`)
    selectedReports.value = []
    await loadReports()
  } catch (err: any) {
    ElMessage.error('批量处理失败')
    console.error('Batch handle error:', err)
  } finally {
    submitting.value = false
  }
}

const batchHandleSubmit = async () => {
  if (!batchHandleFormRef.value) return
  
  try {
    await batchHandleFormRef.value.validate()
    await batchHandle(batchHandleForm.action, batchHandleForm.remark)
    showBatchHandleDialog.value = false
  } catch (err) {
    // 验证失败，不做处理
  }
}

const viewDetail = (report: FleaReport) => {
  currentReport.value = report
  showDetailDialog.value = true
}

// 工具函数
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待处理',
    processed: '已处理',
    rejected: '已驳回'
  }
  return statusMap[status] || status
}

const getStatusTagType = (status: string) => {
  const typeMap: Record<string, string> = {
    pending: 'warning',
    processed: 'success',
    rejected: 'danger'
  }
  return typeMap[status] || ''
}

const getTargetTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    goods: '商品',
    user: '用户',
    comment: '评论'
  }
  return typeMap[type] || type
}

// 生命周期
onMounted(() => {
  loadReports()
})
</script>

<style scoped>
.reports-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.filter-card {
  margin-bottom: 20px;
}

.reporter-info {
  line-height: 1.4;
}

.reporter-name {
  font-weight: 500;
  color: #303133;
}

.reporter-email {
  font-size: 12px;
  color: #909399;
}

.target-info {
  line-height: 1.4;
}

.target-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.target-meta {
  font-size: 12px;
  color: #909399;
}

.reason-text {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.handle-info {
  line-height: 1.3;
  font-size: 12px;
}

.handler, .handle-time {
  color: #606266;
  margin-bottom: 2px;
}

.handle-remark {
  color: #909399;
  font-style: italic;
}

.no-handle {
  color: #c0c4cc;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #909399;
}

.loading-container .el-icon {
  margin-right: 8px;
  font-size: 18px;
}

.pagination-container {
  margin-top: 20px;
  text-align: center;
}

.handle-dialog-content .report-detail {
  margin-bottom: 20px;
}

.handle-dialog-content h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 16px;
}

.batch-handle-content p {
  color: #606266;
  margin-bottom: 20px;
}

.report-detail-content {
  max-height: 60vh;
  overflow-y: auto;
}
</style>
