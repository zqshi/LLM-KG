<template>
  <div class="quotes-page">
    <div class="page-header">
      <h1 class="page-title">领导名言管理</h1>
      <div class="page-actions">
        <el-button @click="handleImport">
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加名言
        </el-button>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-form">
      <el-form :model="searchForm" :inline="true">
        <el-form-item label="名言内容">
          <el-input
            v-model="searchForm.content"
            placeholder="搜索名言内容"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        
        <el-form-item label="领导姓名">
          <el-input
            v-model="searchForm.author"
            placeholder="搜索领导姓名"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="全部分类" clearable>
            <el-option
              v-for="category in categories"
              :key="category"
              :label="category"
              :value="category"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 名言列表 -->
    <div class="quotes-container">
      <div class="table-operations">
        <div class="table-operations-left">
          <el-checkbox
            v-model="selectAll"
            @change="handleSelectAll"
            :indeterminate="indeterminate"
          >
            全选
          </el-checkbox>
          <el-dropdown @command="handleBatchAction">
            <el-button :disabled="selectedQuotes.length === 0">
              批量操作<el-icon><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="enable">批量启用</el-dropdown-item>
                <el-dropdown-item command="disable">批量禁用</el-dropdown-item>
                <el-dropdown-item command="delete" divided>批量删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        
        <div class="table-operations-right">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button value="card">卡片视图</el-radio-button>
            <el-radio-button value="table">表格视图</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 卡片视图 -->
      <div v-if="viewMode === 'card'" class="quotes-grid">
        <div
          v-for="quote in quotesList"
          :key="quote.id"
          class="quote-card"
          :class="{ disabled: quote.status === 'inactive' }"
        >
          <div class="quote-header">
            <el-checkbox
              :model-value="selectedQuotes.includes(quote)"
              @change="(checked) => handleQuoteSelect(quote, checked)"
            />
            <el-dropdown @command="(command) => handleQuoteAction(command, quote)">
              <el-button text>
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">编辑</el-dropdown-item>
                  <el-dropdown-item command="toggle">
                    {{ quote.status === 'active' ? '禁用' : '启用' }}
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          
          <div class="quote-content">
            <div class="quote-text">
              "{{ quote.content }}"
            </div>
            
            <div class="quote-meta">
              <div class="quote-author">
                <el-avatar :size="32" :src="quote.authorAvatar">
                  {{ quote.author.charAt(0) }}
                </el-avatar>
                <div class="author-info">
                  <div class="author-name">{{ quote.author }}</div>
                  <div class="author-title">{{ quote.authorTitle }}</div>
                </div>
              </div>
              
              <div class="quote-tags">
                <el-tag size="small" class="category-tag">{{ quote.category }}</el-tag>
                <el-tag v-if="quote.isHot" type="danger" size="small">热门</el-tag>
                <el-tag
                  :type="quote.status === 'active' ? 'success' : 'danger'"
                  size="small"
                >
                  {{ quote.status === 'active' ? '启用' : '禁用' }}
                </el-tag>
              </div>
            </div>
            
            <div class="quote-stats">
              <div class="stat-item">
                <el-icon><View /></el-icon>
                <span>{{ quote.viewCount }}</span>
              </div>
              <div class="stat-item">
                <el-icon><Star /></el-icon>
                <span>{{ quote.likeCount }}</span>
              </div>
              <div class="stat-item">
                <el-icon><Share /></el-icon>
                <span>{{ quote.shareCount }}</span>
              </div>
            </div>
            
            <div class="quote-footer">
              <span class="create-time">{{ formatDate(quote.createdAt) }}</span>
              <div class="quote-actions">
                <el-button size="small" @click="handleEdit(quote)">编辑</el-button>
                <el-button 
                  size="small" 
                  :type="quote.status === 'active' ? 'warning' : 'success'"
                  @click="toggleStatus(quote)"
                >
                  {{ quote.status === 'active' ? '禁用' : '启用' }}
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 表格视图 -->
      <el-table
        v-else
        :data="quotesList"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="content" label="名言内容" min-width="300">
          <template #default="{ row }">
            <div class="table-quote-content">
              "{{ row.content }}"
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="author" label="作者" width="120">
          <template #default="{ row }">
            <div class="table-author">
              <el-avatar :size="24" :src="row.authorAvatar">
                {{ row.author.charAt(0) }}
              </el-avatar>
              <span class="author-name">{{ row.author }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="authorTitle" label="职位" width="150" />
        
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="stats" label="统计" width="120">
          <template #default="{ row }">
            <div class="table-stats">
              <span class="stat">{{ row.viewCount }}浏览</span>
              <span class="stat">{{ row.likeCount }}点赞</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button 
              size="small" 
              :type="row.status === 'active' ? 'warning' : 'success'"
              @click="toggleStatus(row)"
            >
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-popconfirm
              title="确定要删除这条名言吗？"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[12, 24, 48, 96]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 名言编辑对话框 -->
    <el-dialog
      v-model="quoteDialogVisible"
      :title="isEdit ? '编辑名言' : '添加名言'"
      width="700px"
      @close="handleDialogClose"
    >
      <el-form
        ref="quoteFormRef"
        :model="quoteForm"
        :rules="quoteFormRules"
        label-width="100px"
      >
        <el-form-item label="名言内容" prop="content">
          <el-input
            v-model="quoteForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入名言内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="作者姓名" prop="author">
          <el-input v-model="quoteForm.author" placeholder="请输入领导姓名" />
        </el-form-item>
        
        <el-form-item label="作者职位" prop="authorTitle">
          <el-input v-model="quoteForm.authorTitle" placeholder="请输入职位信息" />
        </el-form-item>
        
        <el-form-item label="作者头像">
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="quoteForm.authorAvatar" :src="quoteForm.authorAvatar" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="名言分类" prop="category">
          <el-select v-model="quoteForm.category" style="width: 200px">
            <el-option
              v-for="category in categories"
              :key="category"
              :label="category"
              :value="category"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="显示设置">
          <el-checkbox v-model="quoteForm.isHot">设为热门</el-checkbox>
          <el-checkbox v-model="quoteForm.isRecommended">推荐显示</el-checkbox>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-switch
            v-model="quoteForm.isActive"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input
            v-model="quoteForm.remark"
            type="textarea"
            :rows="2"
            placeholder="可以备注名言来源、背景等信息"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="quoteDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleQuoteSave" :loading="saveLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Upload, Plus, ArrowDown, MoreFilled,
  View, Star, Share
} from '@element-plus/icons-vue'

interface Quote {
  id: number
  content: string
  author: string
  authorTitle: string
  authorAvatar?: string
  category: string
  isHot: boolean
  isRecommended: boolean
  viewCount: number
  likeCount: number
  shareCount: number
  status: 'active' | 'inactive'
  remark?: string
  createdAt: string
  updatedAt: string
}

const quoteFormRef = ref<FormInstance>()
const quoteDialogVisible = ref(false)
const isEdit = ref(false)
const saveLoading = ref(false)
const viewMode = ref<'card' | 'table'>('card')

const searchForm = reactive({
  content: '',
  author: '',
  category: '',
  status: ''
})

const quoteForm = reactive({
  content: '',
  author: '',
  authorTitle: '',
  authorAvatar: '',
  category: '',
  isHot: false,
  isRecommended: false,
  isActive: true,
  remark: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 12,
  total: 0
})

const quotesList = ref<Quote[]>([])
const selectedQuotes = ref<Quote[]>([])

const categories = ref([
  '管理智慧', '创新思维', '团队合作', '企业文化',
  '领导力', '战略规划', '客户服务', '品质管理'
])

const quoteFormRules: FormRules = {
  content: [
    { required: true, message: '请输入名言内容', trigger: 'blur' },
    { min: 10, max: 500, message: '名言内容长度在10到500个字符之间', trigger: 'blur' }
  ],
  author: [
    { required: true, message: '请输入作者姓名', trigger: 'blur' }
  ],
  authorTitle: [
    { required: true, message: '请输入作者职位', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择名言分类', trigger: 'change' }
  ]
}

const selectAll = computed({
  get: () => selectedQuotes.value.length === quotesList.value.length && quotesList.value.length > 0,
  set: (val: boolean) => {
    if (val) {
      selectedQuotes.value = [...quotesList.value]
    } else {
      selectedQuotes.value = []
    }
  }
})

const indeterminate = computed(() => {
  return selectedQuotes.value.length > 0 && selectedQuotes.value.length < quotesList.value.length
})

const mockQuoteData = (): Quote[] => [
  {
    id: 1,
    content: '创新不是一蹴而就的，需要持续的努力和不断的尝试。只有敢于突破传统思维的束缚，才能在激烈的市场竞争中脱颖而出。',
    author: '张总',
    authorTitle: '董事长兼CEO',
    authorAvatar: '',
    category: '创新思维',
    isHot: true,
    isRecommended: true,
    viewCount: 1248,
    likeCount: 89,
    shareCount: 23,
    status: 'active',
    remark: '来自2024年度创新大会主题演讲',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    content: '团队的力量是无穷的，但前提是每个人都要发挥自己的专业优势，同时保持良好的协作精神。',
    author: '李总',
    authorTitle: '副总经理',
    authorAvatar: '',
    category: '团队合作',
    isHot: false,
    isRecommended: true,
    viewCount: 856,
    likeCount: 67,
    shareCount: 15,
    status: 'active',
    remark: '团队建设培训会议发言',
    createdAt: '2024-01-14T15:20:00Z',
    updatedAt: '2024-01-14T15:20:00Z'
  },
  {
    id: 3,
    content: '质量是企业的生命线，我们绝不能为了追求速度而牺牲质量。每一个细节都关系到客户的体验和公司的声誉。',
    author: '王总',
    authorTitle: '质量总监',
    authorAvatar: '',
    category: '品质管理',
    isHot: false,
    isRecommended: false,
    viewCount: 634,
    likeCount: 45,
    shareCount: 8,
    status: 'active',
    remark: '质量管理体系会议要点',
    createdAt: '2024-01-13T09:45:00Z',
    updatedAt: '2024-01-13T09:45:00Z'
  }
]

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const loadQuotes = () => {
  const mockData = mockQuoteData()
  quotesList.value = mockData
  pagination.total = mockData.length
}

const handleSearch = () => {
  pagination.page = 1
  loadQuotes()
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    ;(searchForm as any)[key] = ''
  })
  handleSearch()
}

const handleAdd = () => {
  isEdit.value = false
  Object.keys(quoteForm).forEach(key => {
    if (key === 'isActive') {
      quoteForm[key] = true
    } else if (key === 'isHot' || key === 'isRecommended') {
      ;(quoteForm as any)[key] = false
    } else {
      ;(quoteForm as any)[key] = ''
    }
  })
  quoteDialogVisible.value = true
}

const handleEdit = (quote: Quote) => {
  isEdit.value = true
  Object.keys(quoteForm).forEach(key => {
    if (key === 'isActive') {
      quoteForm[key] = quote.status === 'active'
    } else {
      ;(quoteForm as any)[key] = (quote as any)[key] || ''
    }
  })
  quoteDialogVisible.value = true
}

const handleDialogClose = () => {
  quoteFormRef.value?.resetFields()
}

const handleQuoteSave = () => {
  if (!quoteFormRef.value) return
  
  quoteFormRef.value.validate((valid) => {
    if (valid) {
      saveLoading.value = true
      setTimeout(() => {
        saveLoading.value = false
        quoteDialogVisible.value = false
        ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
        loadQuotes()
      }, 1000)
    }
  })
}

const toggleStatus = (quote: Quote) => {
  quote.status = quote.status === 'active' ? 'inactive' : 'active'
  ElMessage.success(quote.status === 'active' ? '名言已启用' : '名言已禁用')
}

const handleDelete = (quote: Quote) => {
  ElMessage.success('删除成功')
  loadQuotes()
}

const handleSelectionChange = (selection: Quote[]) => {
  selectedQuotes.value = selection
}

const handleSelectAll = () => {
  // 已通过计算属性处理
}

const handleQuoteSelect = (quote: Quote, checked: boolean) => {
  if (checked) {
    if (!selectedQuotes.value.includes(quote)) {
      selectedQuotes.value.push(quote)
    }
  } else {
    const index = selectedQuotes.value.indexOf(quote)
    if (index > -1) {
      selectedQuotes.value.splice(index, 1)
    }
  }
}

const handleQuoteAction = (command: string, quote: Quote) => {
  switch (command) {
    case 'edit':
      handleEdit(quote)
      break
    case 'toggle':
      toggleStatus(quote)
      break
    case 'delete':
      handleDelete(quote)
      break
  }
}

const handleBatchAction = (command: string) => {
  if (selectedQuotes.value.length === 0) {
    ElMessage.warning('请先选择名言')
    return
  }
  
  switch (command) {
    case 'enable':
      ElMessage.success('批量启用成功')
      break
    case 'disable':
      ElMessage.success('批量禁用成功')
      break
    case 'delete':
      ElMessageBox.confirm(
        `确定要删除选中的 ${selectedQuotes.value.length} 条名言吗？`,
        '批量删除',
        { type: 'warning' }
      ).then(() => {
        ElMessage.success('批量删除成功')
        selectedQuotes.value = []
        loadQuotes()
      })
      break
  }
}

const handleImport = () => {
  ElMessage.info('批量导入功能开发中...')
}

const beforeAvatarUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
    return false
  }
  
  // 模拟上传成功
  setTimeout(() => {
    quoteForm.authorAvatar = URL.createObjectURL(file)
  }, 1000)
  
  return false // 阻止自动上传
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadQuotes()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadQuotes()
}

onMounted(() => {
  loadQuotes()
})
</script>

<style scoped>
.quotes-page {
  padding: 20px;
}

.quotes-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-top: 20px;
}

.quotes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.quote-card {
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 20px;
  background: #fff;
  transition: all 0.3s;
  position: relative;
}

.quote-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.quote-card.disabled {
  opacity: 0.6;
  background-color: #f5f7fa;
}

.quote-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.quote-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quote-text {
  font-size: 16px;
  line-height: 1.8;
  color: #303133;
  font-style: italic;
  border-left: 4px solid #409eff;
  padding-left: 16px;
  margin-bottom: 4px;
}

.quote-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.quote-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.author-title {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.quote-tags {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
}

.category-tag {
  background-color: #f0f9ff;
  color: #0284c7;
  border: none;
}

.quote-stats {
  display: flex;
  gap: 20px;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 13px;
}

.quote-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.create-time {
  font-size: 12px;
  color: #c0c4cc;
}

.quote-actions {
  display: flex;
  gap: 8px;
}

.table-quote-content {
  line-height: 1.6;
  color: #303133;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.table-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-name {
  font-size: 13px;
}

.table-stats {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat {
  font-size: 12px;
  color: #909399;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.avatar-uploader .avatar {
  width: 80px;
  height: 80px;
  display: block;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 80px;
  height: 80px;
  line-height: 80px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
}

.avatar-uploader-icon:hover {
  border-color: #409eff;
  color: #409eff;
}

:deep(.avatar-uploader .el-upload) {
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}
</style>