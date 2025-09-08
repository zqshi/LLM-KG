<template>
  <div class="quotation-list">
    <UnifiedPageHeader
      title="名言管理"
      description="管理公司领导的思想精华，传播企业文化价值观"
    >
      <template #actions>
        <el-button type="primary" :icon="Plus" @click="showCreateDialog = true">
          新增名言
        </el-button>
        <el-button :icon="Upload" @click="showImportDialog = true">
          批量导入
        </el-button>
        <el-button 
          v-if="hasSelected" 
          type="warning" 
          :icon="Operation"
          @click="showBatchDialog = true"
        >
          批量操作（{{ selectedIds.length }}）
        </el-button>
      </template>
    </UnifiedPageHeader>

    <!-- 筛选区域 -->
    <el-card class="filter-card" shadow="never">
      <div class="filter-row">
        <div class="filter-left">
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索名言内容或背景描述"
            :prefix-icon="Search"
            clearable
            style="width: 300px; margin-right: 16px"
            @keyup.enter="handleSearch"
          />
          <el-select
            v-model="queryParams.leaderId"
            placeholder="选择领导"
            clearable
            style="width: 150px; margin-right: 16px"
          >
            <el-option
              v-for="leader in leaders"
              :key="leader.id"
              :label="leader.name"
              :value="leader.id"
            />
          </el-select>
          <el-select
            v-model="queryParams.status"
            placeholder="状态"
            clearable
            style="width: 120px; margin-right: 16px"
          >
            <el-option label="草稿" value="draft" />
            <el-option label="待审核" value="pending_review" />
            <el-option label="已发布" value="published" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </div>
        <div class="filter-right">
          <el-button :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="RefreshLeft" @click="handleReset">重置</el-button>
        </div>
      </div>
      
      <!-- 高级筛选 -->
      <el-collapse-transition>
        <div v-show="showAdvanceFilter" class="advance-filter">
          <el-row :gutter="16" style="margin-top: 16px">
            <el-col :span="8">
              <el-date-picker
                v-model="timeRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
                @change="handleTimeRangeChange"
              />
            </el-col>
            <el-col :span="8">
              <el-select
                v-model="selectedTags"
                multiple
                placeholder="选择标签"
                filterable
                allow-create
                style="width: 100%"
              >
                <el-option
                  v-for="tag in (availableTags.value as { tag: string; count: number; }[])"
                  :key="tag.tag"
                  :label="`${tag.tag}(${tag.count})`"
                  :value="tag.tag"
                />
              </el-select>
            </el-col>
          </el-row>
        </div>
      </el-collapse-transition>
      
      <div class="filter-toggle">
        <el-button 
          text 
          type="primary"
          :icon="showAdvanceFilter ? ArrowUp : ArrowDown"
          @click="showAdvanceFilter = !showAdvanceFilter"
        >
          {{ showAdvanceFilter ? '收起筛选' : '高级筛选' }}
        </el-button>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <StatsCard
          :value="(quotationStats.value || {}).totalCount || 0"
          label="总名言数"
          :icon="ChatDotRound"
          type="primary"
        />
      </el-col>
      <el-col :span="6">
        <StatsCard
          :value="(quotationStats.value || {}).publishedCount || 0"
          label="已发布"
          :icon="CircleCheck"
          type="success"
        />
      </el-col>
      <el-col :span="6">
        <StatsCard
          :value="(quotationStats.value || {}).pendingCount || 0"
          label="待审核"
          :icon="Clock"
          type="warning"
        />
      </el-col>
      <el-col :span="6">
        <StatsCard
          :value="(quotationStats.value || {}).todayPublished || 0"
          label="今日发布"
          :icon="Star"
          type="danger"
        />
      </el-col>
    </el-row>

    <!-- 名言列表 -->
    <ContentCard title="名言列表">
      <template #extra>
        <el-button 
          v-if="hasSelected"
          size="small"
          @click="clearSelected"
        >
          取消选择
        </el-button>
        <span class="total-count">共 {{ pagination.total }} 条</span>
      </template>
      
      <el-table
        v-loading="loading.value"
        :data="quotationList.value"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="名言内容" min-width="300">
          <template #default="{ row }">
            <div class="quote-content">
              <p class="quote-text" @click="showPreviewDialog(row)">{{ row.content.substring(0, 100) }}{{ row.content.length > 100 ? '...' : '' }}</p>
              <div class="quote-meta">
                <el-tag 
                  v-for="tag in row.tags" 
                  :key="tag" 
                  size="small" 
                  type="info"
                  style="margin-right: 4px"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="leader.name" label="关联领导" width="120" />
        <el-table-column prop="occasion" label="发生场合" width="150" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="数据" width="120">
          <template #default="{ row }">
            <div class="quote-stats">
              <span class="stat-item">
                <el-icon><View /></el-icon> {{ row.showCount }}
              </span>
              <span class="stat-item">
                <el-icon><Star /></el-icon> {{ row.likeCount }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button size="small" :icon="View" @click="showPreviewDialog(row)">
                预览
              </el-button>
              <el-button 
                size="small" 
                type="primary"
                :icon="Edit" 
                @click="editQuotation(row)"
                :disabled="row.status === 'published'"
              >
                编辑
              </el-button>
              <el-button 
                size="small" 
                type="danger"
                :icon="Delete"
                @click="deleteQuotation(row)"
              >
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </ContentCard>

    <!-- 新增/编辑名言对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="isEditing ? '编辑名言' : '新增名言'"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="名言正文" prop="content" required>
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="6"
            placeholder="请输入名言内容（支持换行和简单格式）"
            show-word-limit
            :maxlength="1000"
          />
        </el-form-item>
        
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="关联领导" prop="leaderId" required>
              <el-select
                v-model="formData.leaderId"
                placeholder="请选择关联领导"
                style="width: 100%"
                filterable
              >
                <el-option
                  v-for="leader in leaders"
                  :key="leader.id"
                  :label="leader.name"
                  :value="leader.id"
                >
                  <div class="leader-option">
                    <span>{{ leader.name }}</span>
                    <span class="leader-position">{{ leader.position || '领导' }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发生时间">
              <el-date-picker
                v-model="formData.occurrenceTime"
                type="datetime"
                placeholder="选择发生时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="发生场合" prop="occasion" required>
          <el-input
            v-model="formData.occasion"
            placeholder="如：2023年年会演讲、季度总结会议等"
            :maxlength="100"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="背景描述">
          <el-input
            v-model="formData.background"
            type="textarea"
            :rows="3"
            placeholder="详细描述名言产生的背景和上下文"
            :maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="关键词标签">
          <el-select
            v-model="formData.tags"
            multiple
            filterable
            allow-create
            placeholder="输入或选择标签，如：创新、客户、团队等"
            style="width: 100%"
          >
            <el-option
              v-for="tag in (availableTags.value as { tag: string; count: number; }[])"
              :key="tag.tag"
              :label="tag.tag"
              :value="tag.tag"
            />
          </el-select>
          <div class="form-tips">标签用于分类和检索，支持输入新标签</div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button 
            type="info" 
            :loading="submitLoading.value"
            @click="submitForm('draft')"
          >
            保存草稿
          </el-button>
          <el-button 
            type="primary" 
            :loading="submitLoading.value"
            @click="submitForm('pending_review')"
          >
            提交审核
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog v-model="showPreview" title="名言预览" width="600px">
      <div v-if="currentPreviewQuotation" class="preview-content">
        <div class="preview-quote">
          <blockquote class="quote-text">{{ currentPreviewQuotation.content }}</blockquote>
          <div class="quote-author">—— {{ currentPreviewQuotation.leader?.name }}</div>
        </div>
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="发生场合">{{ currentPreviewQuotation.occasion }}</el-descriptions-item>
          <el-descriptions-item label="发生时间">{{ currentPreviewQuotation.occurrenceTime || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(currentPreviewQuotation.status)">
              {{ getStatusText(currentPreviewQuotation.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="数据统计">
            <div class="stats-info">
              <span>展示 {{ currentPreviewQuotation.showCount }} 次</span>
              <span>点赞 {{ currentPreviewQuotation.likeCount }} 次</span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="标签" :span="2">
            <el-tag 
              v-for="tag in currentPreviewQuotation.tags" 
              :key="tag" 
              style="margin-right: 4px"
            >
              {{ tag }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="currentPreviewQuotation.background" label="背景描述" :span="2">
            {{ currentPreviewQuotation.background }}
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="preview-actions">
          <el-button 
            v-if="currentPreviewQuotation.status === 'published'"
            :icon="Star"
            @click="likeQuotation(currentPreviewQuotation.id)"
          >
            点赞
          </el-button>
          <el-button 
            v-if="currentPreviewQuotation.status === 'published'"
            :icon="EditPen"
            @click="openRevisionDialog(currentPreviewQuotation)"
          >
            申请修正
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 批量操作对话框 -->
    <el-dialog v-model="showBatchDialog" title="批量操作" width="500px">
      <el-form :model="batchForm" label-width="100px">
        <el-form-item label="操作类型">
          <el-radio-group v-model="batchForm.operation">
            <el-radio value="publish">批量发布</el-radio>
            <el-radio value="archive">批量归档</el-radio>
            <el-radio value="update_tags">修改标签</el-radio>
            <el-radio value="delete">批量删除</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item v-if="batchForm.operation === 'update_tags'" label="新标签">
          <el-select
            v-model="batchForm.params.tags"
            multiple
            filterable
            allow-create
            placeholder="设置新的标签"
            style="width: 100%"
          >
            <el-option
              v-for="tag in (availableTags.value as { tag: string; count: number; }[])"
              :key="tag.tag"
              :label="tag.tag"
              :value="tag.tag"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item v-if="batchForm.operation === 'delete'" label="删除原因">
          <el-input
            v-model="batchForm.params.reason"
            type="textarea"
            placeholder="请输入删除原因"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showBatchDialog = false">取消</el-button>
        <el-button type="primary" @click="handleBatchOperation">确认操作</el-button>
      </template>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <el-dialog v-model="showImportDialog" title="批量导入名言" width="500px">
      <el-upload
        ref="uploadRef"
        class="upload-demo"
        drag
        :auto-upload="false"
        :limit="1"
        accept=".xlsx,.xls"
        :on-change="handleFileChange"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          将Excel文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持.xlsx/.xls格式，请确保文件包含必要的字段信息
          </div>
        </template>
      </el-upload>
      
      <template #footer>
        <el-button @click="showImportDialog = false">取消</el-button>
        <el-button type="primary" :disabled="!uploadFile" @click="handleImport">
          开始导入
        </el-button>
      </template>
    </el-dialog>

    <!-- 修正申请对话框 -->
    <el-dialog v-model="showRevisionDialog" title="申请修正" width="600px">
      <el-form :model="revisionForm" label-width="100px">
        <el-form-item label="原内容">
          <div class="original-content">{{ revisionForm.originalContent }}</div>
        </el-form-item>
        
        <el-form-item label="修正内容" required>
          <el-input
            v-model="revisionForm.newContent"
            type="textarea"
            :rows="5"
            placeholder="请输入修正后的内容"
          />
        </el-form-item>
        
        <el-form-item label="修正原因" required>
          <el-input
            v-model="revisionForm.revisionReason"
            type="textarea"
            :rows="3"
            placeholder="请说明修正的具体原因"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showRevisionDialog = false">取消</el-button>
        <el-button type="primary" @click="submitRevision">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  RefreshLeft,
  ArrowUp,
  ArrowDown,
  Upload,
  Operation,
  View,
  Edit,
  Delete,
  ChatDotRound,
  CircleCheck,
  Clock,
  Star,
  EditPen,
  UploadFilled
} from '@element-plus/icons-vue'
import { useQuotationStore } from '@/stores/quotation'
import { useAuthStore } from '@/stores/auth'
import { userApi } from '@/api'
import type { Quotation, QuotationForm, User } from '@/types'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import StatsCard from '@/components/StatsCard.vue'
import ContentCard from '@/components/common/ContentCard.vue'

// Store
const quotationStore = useQuotationStore()
const authStore = useAuthStore()

// 响应式数据
const showAdvanceFilter = ref(false)
const showCreateDialog = ref(false)
const showPreview = ref(false)
const showBatchDialog = ref(false)
const showImportDialog = ref(false)
const showRevisionDialog = ref(false)
const isEditing = ref(false)
const currentPreviewQuotation = ref<Quotation | null>(null)
const leaders = ref<User[]>([])
const uploadFile = ref<File | null>(null)
const timeRange = ref<[string, string] | null>(null)
const selectedTags = ref<string[]>([])

// 表单相关
const formRef = ref()
const uploadRef = ref()
const formData = reactive<QuotationForm>({
  content: '',
  leaderId: 0,
  occasion: '',
  occurrenceTime: '',
  background: '',
  tags: []
})

const formRules = {
  content: [
    { required: true, message: '请输入名言内容', trigger: 'blur' },
    { min: 10, message: '名言内容不能少于10个字符', trigger: 'blur' }
  ],
  leaderId: [
    { required: true, message: '请选择关联领导', trigger: 'change' }
  ],
  occasion: [
    { required: true, message: '请输入发生场合', trigger: 'blur' }
  ]
}

// 批量操作表单
const batchForm = reactive({
  operation: 'publish',
  params: {
    tags: [] as string[],
    reason: ''
  }
})

// 修正申请表单
const revisionForm = reactive({
  quotationId: 0,
  originalContent: '',
  newContent: '',
  revisionReason: ''
})

// 计算属性
const {
  quotationList,
  quotationStats,
  selectedQuotations,
  availableTags,
  loading,
  submitLoading,
  pagination,
  queryParams
} = quotationStore

const hasSelected = computed(() => (selectedQuotations.value || []).length > 0)
const selectedIds = computed(() => selectedQuotations.value.map((q: any) => q.id))

// 方法
const handleSearch = async () => {
  // 设置标签和时间范围
  queryParams.tags = selectedTags.value
  if (timeRange.value) {
    queryParams.startTime = timeRange.value[0]
    queryParams.endTime = timeRange.value[1]
  }
  
  queryParams.page = 1
  await quotationStore.loadQuotationList()
}

const handleReset = () => {
  quotationStore.resetQueryParams()
  selectedTags.value = []
  timeRange.value = null
  handleSearch()
}

const handleTimeRangeChange = (value: [string, string] | null) => {
  timeRange.value = value
}

const handleSelectionChange = (selection: Quotation[]) => {
  quotationStore.setSelectedQuotations(selection)
}

const clearSelected = () => {
  quotationStore.clearSelected()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  handleSearch()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  quotationStore.loadQuotationList()
}

// 状态相关工具函数
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    pending_review: '待审核',
    published: '已发布',
    archived: '已归档'
  }
  return statusMap[status] || status
}

const getStatusTagType = (status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    draft: 'info',
    pending_review: 'warning',
    published: 'success',
    archived: 'danger'
  }
  return typeMap[status] || 'primary'
}

const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 表单操作
const resetForm = () => {
  Object.assign(formData, {
    content: '',
    leaderId: 0,
    occasion: '',
    occurrenceTime: '',
    background: '',
    tags: []
  })
  formRef.value?.clearValidate()
}

const editQuotation = (quotation: Quotation) => {
  isEditing.value = true
  Object.assign(formData, {
    id: quotation.id,
    content: quotation.content,
    leaderId: quotation.leaderId,
    occasion: quotation.occasion,
    occurrenceTime: quotation.occurrenceTime,
    background: quotation.background,
    tags: [...quotation.tags]
  })
  showCreateDialog.value = true
}

const submitForm = async (status: 'draft' | 'pending_review') => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    const submitData = {
      ...formData,
      status
    }
    
    if (isEditing.value && formData.id) {
      await quotationStore.updateQuotation(formData.id, submitData)
    } else {
      await quotationStore.createQuotation(submitData)
    }
    
    showCreateDialog.value = false
    resetForm()
    isEditing.value = false
    
  } catch (error) {
    console.error('表单提交失败:', error)
  }
}

// 预览操作
const showPreviewDialog = (quotation: Quotation) => {
  currentPreviewQuotation.value = quotation
  showPreview.value = true
}

// 删除操作
const deleteQuotation = async (quotation: Quotation) => {
  await quotationStore.deleteQuotation(quotation.id)
}

// 批量操作
const handleBatchOperation = async () => {
  const operation = {
    quotationIds: selectedIds.value,
    operation: batchForm.operation as any,
    params: batchForm.params
  }
  
  await quotationStore.batchOperation(operation)
  showBatchDialog.value = false
  
  // 重置表单
  batchForm.operation = 'publish'
  batchForm.params = { tags: [], reason: '' }
}

// 文件上传
const handleFileChange = (file: any) => {
  uploadFile.value = file.raw
}

const handleImport = async () => {
  if (!uploadFile.value) {
    ElMessage.warning('请选择要上传的文件')
    return
  }
  
  try {
    await quotationStore.importQuotations(uploadFile.value)
    showImportDialog.value = false
    uploadFile.value = null
  } catch (error) {
    console.error('导入失败:', error)
  }
}

// 修正申请
const openRevisionDialog = (quotation: Quotation) => {
  revisionForm.quotationId = quotation.id
  revisionForm.originalContent = quotation.content
  revisionForm.newContent = quotation.content
  revisionForm.revisionReason = ''
  showRevisionDialog.value = true
}

const submitRevision = async () => {
  if (!revisionForm.newContent.trim()) {
    ElMessage.warning('请输入修正内容')
    return
  }
  
  if (!revisionForm.revisionReason.trim()) {
    ElMessage.warning('请输入修正原因')
    return
  }
  
  try {
    await quotationStore.requestRevision({
      quotationId: revisionForm.quotationId,
      newContent: revisionForm.newContent,
      revisionReason: revisionForm.revisionReason
    })
    
    showRevisionDialog.value = false
  } catch (error) {
    console.error('提交修正申请失败:', error)
  }
}

// 点赞操作
const likeQuotation = async (id: number) => {
  await quotationStore.likeQuotation(id)
}

// 加载领导列表
const loadLeaders = async () => {
  try {
    // 获取所有用户作为领导选择
    const response = await userApi.getUsers({ page: 1, pageSize: 1000 })
    leaders.value = response.data.list
  } catch (error) {
    console.error('加载领导列表失败:', error)
  }
}

// 生命周期
onMounted(async () => {
  // 加载初始数据
  await Promise.all([
    quotationStore.loadQuotationList(),
    quotationStore.loadStats(),
    quotationStore.loadTags(),
    loadLeaders()
  ])
})

// 监听对话框关闭，重置表单
watch(showCreateDialog, (show) => {
  if (!show) {
    resetForm()
    isEditing.value = false
  }
})
</script>

<style scoped>
.quotation-list {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.header-title h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.header-description {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 筛选区域 */
.filter-card {
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-left {
  display: flex;
  align-items: center;
}

.filter-right {
  display: flex;
  gap: 8px;
}

.advance-filter {
  border-top: 1px solid #ebeef5;
  padding-top: 16px;
}

.filter-toggle {
  margin-top: 12px;
  text-align: center;
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-content {
  padding: 0;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.stat-icon {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 24px;
  opacity: 0.8;
}

/* 列表卡片 */
.list-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.total-count {
  color: #909399;
  font-size: 14px;
}

/* 表格样式 */
.quote-content {
  line-height: 1.6;
}

.quote-text {
  margin: 0 0 8px 0;
  cursor: pointer;
  transition: color 0.3s;
}

.quote-text:hover {
  color: #409eff;
}

.quote-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.quote-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.leader-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.leader-position {
  color: #909399;
  font-size: 12px;
}

/* 分页 */
.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 对话框样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.form-tips {
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
}

/* 预览样式 */
.preview-content {
  padding: 0;
}

.preview-quote {
  text-align: center;
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
}

.quote-text {
  font-size: 18px;
  line-height: 1.8;
  color: #303133;
  margin: 0 0 16px 0;
  font-style: italic;
  position: relative;
}

.quote-text::before,
.quote-text::after {
  content: '"';
  font-size: 24px;
  color: #409eff;
  font-weight: bold;
}

.quote-author {
  font-size: 16px;
  color: #606266;
  font-weight: 500;
}

.stats-info {
  display: flex;
  gap: 16px;
}

.preview-actions {
  margin-top: 20px;
  text-align: center;
}

.original-content {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  color: #606266;
  line-height: 1.6;
}

/* 上传组件样式 */
.upload-demo {
  width: 100%;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .quotation-list {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .header-actions {
    flex-wrap: wrap;
  }
  
  .filter-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .filter-left {
    flex-wrap: wrap;
    width: 100%;
  }
  
  .filter-left .el-input,
  .filter-left .el-select {
    width: 100% !important;
    margin-right: 0 !important;
    margin-bottom: 8px;
  }
}
</style>