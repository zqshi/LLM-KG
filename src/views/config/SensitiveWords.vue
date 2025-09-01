<template>
  <div class="sensitive-words-page">
    <div class="page-header">
      <h1 class="page-title">敏感词库管理</h1>
      <div class="page-actions">
        <el-button @click="handleImport">
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出词库
        </el-button>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加词条
        </el-button>
      </div>
    </div>

    <!-- 词库统计 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon total">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ wordStats.total }}</div>
              <div class="stats-label">总词条数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon blocked">
              <el-icon><CloseBold /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ wordStats.blocked }}</div>
              <div class="stats-label">拦截词</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon review">
              <el-icon><View /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ wordStats.review }}</div>
              <div class="stats-label">审核词</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon hits">
              <el-icon><WarnTriangleFilled /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ wordStats.todayHits }}</div>
              <div class="stats-label">今日命中</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索和筛选 -->
    <div class="search-form">
      <el-form :model="searchForm" :inline="true">
        <el-form-item label="词条搜索">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入关键词"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        
        <el-form-item label="词条类型">
          <el-select v-model="searchForm.type" placeholder="全部类型" clearable>
            <el-option label="全部" value="" />
            <el-option label="直接拦截" value="block" />
            <el-option label="进入审核" value="review" />
            <el-option label="敏感替换" value="replace" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="词条分类">
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
          <el-button @click="handleTest">测试词条</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 词条列表 -->
    <div class="table-container">
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
            <el-button :disabled="selectedWords.length === 0">
              批量操作<el-icon><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="enable">批量启用</el-dropdown-item>
                <el-dropdown-item command="disable">批量禁用</el-dropdown-item>
                <el-dropdown-item command="changeType">批量修改类型</el-dropdown-item>
                <el-dropdown-item command="delete" divided>批量删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        
        <div class="table-operations-right">
          <span>共 {{ pagination.total }} 条记录</span>
        </div>
      </div>

      <el-table
        :data="wordList"
        @selection-change="handleSelectionChange"
        stripe
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="word" label="敏感词" min-width="120">
          <template #default="{ row }">
            <div class="word-content">
              <span class="word-text" :class="{ regex: row.isRegex }">
                {{ row.word }}
              </span>
              <el-tag v-if="row.isRegex" type="info" size="small">正则</el-tag>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="type" label="词条类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)" size="small">
              {{ getTypeName(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="category" label="分类" width="100" />
        
        <el-table-column prop="replacement" label="替换词" width="120">
          <template #default="{ row }">
            <span v-if="row.replacement" class="replacement-text">
              {{ row.replacement }}
            </span>
            <span v-else class="text-placeholder">-</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="level" label="严重程度" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelColor(row.level)" size="small">
              {{ getLevelName(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="hitCount" label="命中次数" width="100">
          <template #default="{ row }">
            <span class="hit-count">{{ row.hitCount }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
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
              title="确定要删除这个词条吗？"
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
          :page-sizes="[20, 50, 100, 200]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 词条编辑对话框 -->
    <el-dialog
      v-model="wordDialogVisible"
      :title="isEdit ? '编辑词条' : '添加词条'"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="wordFormRef"
        :model="wordForm"
        :rules="wordFormRules"
        label-width="100px"
      >
        <el-form-item label="敏感词" prop="word">
          <el-input
            v-model="wordForm.word"
            placeholder="请输入敏感词"
            :disabled="isEdit"
          />
        </el-form-item>
        
        <el-form-item label="词条类型" prop="type">
          <el-radio-group v-model="wordForm.type">
            <el-radio value="block">
              <div class="radio-option">
                <div class="option-title">直接拦截</div>
                <div class="option-desc">发现该词直接拦截发布</div>
              </div>
            </el-radio>
            <el-radio value="review">
              <div class="radio-option">
                <div class="option-title">进入审核</div>
                <div class="option-desc">发现该词转入人工审核</div>
              </div>
            </el-radio>
            <el-radio value="replace">
              <div class="radio-option">
                <div class="option-title">敏感替换</div>
                <div class="option-desc">自动替换为指定词汇</div>
              </div>
            </el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item 
          v-if="wordForm.type === 'replace'" 
          label="替换词" 
          prop="replacement"
        >
          <el-input
            v-model="wordForm.replacement"
            placeholder="请输入替换词"
          />
        </el-form-item>
        
        <el-form-item label="词条分类" prop="category">
          <el-select v-model="wordForm.category" style="width: 200px">
            <el-option
              v-for="category in categories"
              :key="category"
              :label="category"
              :value="category"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="严重程度" prop="level">
          <el-radio-group v-model="wordForm.level">
            <el-radio value="low">轻微</el-radio>
            <el-radio value="medium">中等</el-radio>
            <el-radio value="high">严重</el-radio>
            <el-radio value="critical">极严重</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="匹配方式">
          <el-checkbox v-model="wordForm.isRegex">使用正则表达式</el-checkbox>
          <div class="form-help">启用后可以使用正则表达式进行复杂匹配</div>
        </el-form-item>
        
        <el-form-item label="适用范围">
          <el-checkbox-group v-model="wordForm.scopes">
            <el-checkbox value="title">标题</el-checkbox>
            <el-checkbox value="content">内容</el-checkbox>
            <el-checkbox value="comment">评论</el-checkbox>
            <el-checkbox value="nickname">昵称</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input
            v-model="wordForm.remark"
            type="textarea"
            :rows="3"
            placeholder="可以备注词条来源、用途等信息"
          />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-switch
            v-model="wordForm.isActive"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="wordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleWordSave" :loading="saveLoading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 词条测试对话框 -->
    <el-dialog v-model="testDialogVisible" title="敏感词测试" width="600px">
      <div class="test-container">
        <el-form label-width="80px">
          <el-form-item label="测试文本">
            <el-input
              v-model="testText"
              type="textarea"
              :rows="6"
              placeholder="请输入要测试的文本内容"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="runTest" :loading="testLoading">
              开始测试
            </el-button>
            <el-button @click="clearTest">清空</el-button>
          </el-form-item>
        </el-form>
        
        <div v-if="testResults.length > 0" class="test-results">
          <h4>检测结果</h4>
          <div class="result-summary">
            <el-tag type="danger">发现 {{ testResults.length }} 个敏感词</el-tag>
          </div>
          
          <div class="result-list">
            <div
              v-for="(result, index) in testResults"
              :key="index"
              class="result-item"
            >
              <div class="result-word">
                <span class="word">{{ result.word }}</span>
                <el-tag :type="getTypeColor(result.type)" size="small">
                  {{ getTypeName(result.type) }}
                </el-tag>
                <el-tag :type="getLevelColor(result.level)" size="small">
                  {{ getLevelName(result.level) }}
                </el-tag>
              </div>
              <div class="result-action">
                <span class="action-desc">{{ getActionDesc(result.type) }}</span>
                <span v-if="result.replacement" class="replacement">
                  替换为: {{ result.replacement }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="processed-text">
            <h4>处理后文本</h4>
            <div class="processed-content">
              {{ processedText }}
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <el-dialog v-model="importDialogVisible" title="批量导入词条" width="600px">
      <div class="import-container">
        <el-steps :active="importStep" finish-status="success">
          <el-step title="上传文件" />
          <el-step title="配置参数" />
          <el-step title="确认导入" />
        </el-steps>
        
        <div class="import-content">
          <!-- 步骤1: 上传文件 -->
          <div v-if="importStep === 0" class="import-step">
            <el-upload
              class="upload-demo"
              drag
              accept=".txt,.csv,.xlsx"
              :auto-upload="false"
              :on-change="handleFileChange"
            >
              <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持 .txt/.csv/.xlsx 格式，单个文件不超过10MB
                </div>
              </template>
            </el-upload>
          </div>
          
          <!-- 步骤2: 配置参数 -->
          <div v-if="importStep === 1" class="import-step">
            <el-form label-width="100px">
              <el-form-item label="默认类型">
                <el-radio-group v-model="importConfig.defaultType">
                  <el-radio value="block">直接拦截</el-radio>
                  <el-radio value="review">进入审核</el-radio>
                  <el-radio value="replace">敏感替换</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item label="默认分类">
                <el-select v-model="importConfig.defaultCategory">
                  <el-option
                    v-for="category in categories"
                    :key="category"
                    :label="category"
                    :value="category"
                  />
                </el-select>
              </el-form-item>
              
              <el-form-item label="严重程度">
                <el-radio-group v-model="importConfig.defaultLevel">
                  <el-radio value="low">轻微</el-radio>
                  <el-radio value="medium">中等</el-radio>
                  <el-radio value="high">严重</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item label="处理方式">
                <el-checkbox v-model="importConfig.skipDuplicates">
                  跳过重复词条
                </el-checkbox>
                <el-checkbox v-model="importConfig.autoEnable">
                  导入后自动启用
                </el-checkbox>
              </el-form-item>
            </el-form>
          </div>
          
          <!-- 步骤3: 确认导入 -->
          <div v-if="importStep === 2" class="import-step">
            <div class="import-summary">
              <p>准备导入 <strong>{{ importPreview.length }}</strong> 个词条</p>
              <div class="preview-list">
                <div
                  v-for="(word, index) in importPreview.slice(0, 10)"
                  :key="index"
                  class="preview-item"
                >
                  {{ word }}
                </div>
                <div v-if="importPreview.length > 10" class="preview-more">
                  还有 {{ importPreview.length - 10 }} 个词条...
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <template #footer>
          <el-button v-if="importStep > 0" @click="importStep--">上一步</el-button>
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button
            v-if="importStep < 2"
            type="primary"
            @click="importStep++"
            :disabled="importStep === 0 && !selectedFile"
          >
            下一步
          </el-button>
          <el-button
            v-if="importStep === 2"
            type="primary"
            @click="confirmImport"
            :loading="importLoading"
          >
            确认导入
          </el-button>
        </template>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import type { PaginationParams } from '@/types'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Upload, Download, Plus, Document, CloseBold,
  View, WarnTriangleFilled, ArrowDown, UploadFilled
} from '@element-plus/icons-vue'

interface SensitiveWord {
  id: number
  word: string
  type: 'block' | 'review' | 'replace'
  replacement?: string
  category: string
  level: 'low' | 'medium' | 'high' | 'critical'
  isRegex: boolean
  scopes: string[]
  hitCount: number
  status: 'active' | 'inactive'
  remark?: string
  createdAt: string
  updatedAt: string
}

interface TestResult {
  word: string
  type: string
  level: string
  replacement?: string
  position: number
}

const wordFormRef = ref<FormInstance>()
const wordDialogVisible = ref(false)
const testDialogVisible = ref(false)
const importDialogVisible = ref(false)
const isEdit = ref(false)
const saveLoading = ref(false)
const testLoading = ref(false)
const importLoading = ref(false)
const importStep = ref(0)
const selectedFile = ref<File | null>(null)

const searchForm = reactive({
  keyword: '',
  type: '',
  category: '',
  status: ''
})

const wordForm = reactive({
  word: '',
  type: 'review' as 'block' | 'review' | 'replace',
  replacement: '',
  category: '',
  level: 'medium' as 'low' | 'medium' | 'high' | 'critical',
  isRegex: false,
  scopes: ['title', 'content'],
  remark: '',
  isActive: true
})

const importConfig = reactive({
  defaultType: 'review' as 'block' | 'review' | 'replace',
  defaultCategory: '通用',
  defaultLevel: 'medium' as 'low' | 'medium' | 'high' | 'critical',
  skipDuplicates: true,
  autoEnable: true
})

const pagination = reactive<PaginationParams>({
  page: 1,
  pageSize: 20,
  total: 0
})

const wordList = ref<SensitiveWord[]>([])
const selectedWords = ref<SensitiveWord[]>([])
const testText = ref('')
const testResults = ref<TestResult[]>([])
const processedText = ref('')
const importPreview = ref<string[]>([])

const categories = ref([
  '通用', '政治敏感', '色情低俗', '暴力血腥', 
  '违法犯罪', '诈骗信息', '广告垃圾', '恶意攻击'
])

const wordStats = ref({
  total: 1248,
  blocked: 856,
  review: 312,
  todayHits: 23
})

const wordFormRules: FormRules = {
  word: [
    { required: true, message: '请输入敏感词', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择词条类型', trigger: 'change' }
  ],
  category: [
    { required: true, message: '请选择词条分类', trigger: 'change' }
  ],
  replacement: [
    { 
      validator: (rule, value, callback) => {
        if (wordForm.type === 'replace' && !value) {
          callback(new Error('请输入替换词'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
}

const selectAll = computed({
  get: () => selectedWords.value.length === wordList.value.length && wordList.value.length > 0,
  set: (val: boolean) => {
    if (val) {
      selectedWords.value = [...wordList.value]
    } else {
      selectedWords.value = []
    }
  }
})

const indeterminate = computed(() => {
  return selectedWords.value.length > 0 && selectedWords.value.length < wordList.value.length
})

const mockWordData = (): SensitiveWord[] => [
  {
    id: 1,
    word: '测试敏感词',
    type: 'review',
    category: '通用',
    level: 'medium',
    isRegex: false,
    scopes: ['title', 'content'],
    hitCount: 15,
    status: 'active',
    remark: '测试用敏感词',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    word: '垃圾.*信息',
    type: 'block',
    category: '广告垃圾',
    level: 'high',
    isRegex: true,
    scopes: ['title', 'content', 'comment'],
    hitCount: 89,
    status: 'active',
    remark: '匹配垃圾信息的正则表达式',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-14T15:30:00Z'
  }
]

const getTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    block: '直接拦截',
    review: '进入审核',
    replace: '敏感替换'
  }
  return typeMap[type] || type
}

const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    block: 'danger',
    review: 'warning',
    replace: 'success'
  }
  return colorMap[type] || 'info'
}

const getLevelName = (level: string) => {
  const levelMap: Record<string, string> = {
    low: '轻微',
    medium: '中等',
    high: '严重',
    critical: '极严重'
  }
  return levelMap[level] || level
}

const getLevelColor = (level: string) => {
  const colorMap: Record<string, string> = {
    low: 'success',
    medium: 'warning',
    high: 'danger',
    critical: 'danger'
  }
  return colorMap[level] || 'info'
}

const getActionDesc = (type: string) => {
  const actionMap: Record<string, string> = {
    block: '直接拦截发布',
    review: '转入人工审核',
    replace: '自动替换'
  }
  return actionMap[type] || ''
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const loadWords = () => {
  const mockData = mockWordData()
  wordList.value = mockData
  pagination.total = mockData.length
}

const handleSearch = () => {
  pagination.page = 1
  loadWords()
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    ;(searchForm as any)[key] = ''
  })
  handleSearch()
}

const handleAdd = () => {
  isEdit.value = false
  Object.keys(wordForm).forEach(key => {
    if (key === 'type') {
      wordForm[key] = 'review'
    } else if (key === 'level') {
      wordForm[key] = 'medium'
    } else if (key === 'isRegex' || key === 'isActive') {
      ;(wordForm as any)[key] = key === 'isActive'
    } else if (key === 'scopes') {
      wordForm[key] = ['title', 'content']
    } else {
      ;(wordForm as any)[key] = ''
    }
  })
  wordDialogVisible.value = true
}

const handleEdit = (word: SensitiveWord) => {
  isEdit.value = true
  Object.keys(wordForm).forEach(key => {
    ;(wordForm as any)[key] = (word as any)[key] || (key === 'scopes' ? [] : '')
  })
  wordDialogVisible.value = true
}

const handleDialogClose = () => {
  wordFormRef.value?.resetFields()
}

const handleWordSave = () => {
  if (!wordFormRef.value) return
  
  wordFormRef.value.validate((valid) => {
    if (valid) {
      saveLoading.value = true
      setTimeout(() => {
        saveLoading.value = false
        wordDialogVisible.value = false
        ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
        loadWords()
      }, 1000)
    }
  })
}

const toggleStatus = (word: SensitiveWord) => {
  word.status = word.status === 'active' ? 'inactive' : 'active'
  ElMessage.success(word.status === 'active' ? '词条已启用' : '词条已禁用')
}

const handleDelete = (word: SensitiveWord) => {
  ElMessage.success('删除成功')
  loadWords()
}

const handleSelectionChange = (selection: SensitiveWord[]) => {
  selectedWords.value = selection
}

const handleSelectAll = () => {
  // 已通过计算属性处理
}

const handleBatchAction = (command: string) => {
  if (selectedWords.value.length === 0) {
    ElMessage.warning('请先选择词条')
    return
  }
  
  switch (command) {
    case 'enable':
      ElMessage.success('批量启用成功')
      break
    case 'disable':
      ElMessage.success('批量禁用成功')
      break
    case 'changeType':
      ElMessage.info('批量修改类型功能开发中...')
      break
    case 'delete':
      ElMessageBox.confirm(
        `确定要删除选中的 ${selectedWords.value.length} 个词条吗？`,
        '批量删除',
        { type: 'warning' }
      ).then(() => {
        ElMessage.success('批量删除成功')
        loadWords()
      })
      break
  }
}

const handleTest = () => {
  testText.value = ''
  testResults.value = []
  processedText.value = ''
  testDialogVisible.value = true
}

const runTest = () => {
  if (!testText.value.trim()) {
    ElMessage.warning('请输入测试文本')
    return
  }
  
  testLoading.value = true
  setTimeout(() => {
    // 模拟测试结果
    testResults.value = [
      {
        word: '测试敏感词',
        type: 'review',
        level: 'medium',
        position: 0
      }
    ]
    
    processedText.value = testText.value.replace(/测试敏感词/g, '[审核中]')
    testLoading.value = false
  }, 1000)
}

const clearTest = () => {
  testText.value = ''
  testResults.value = []
  processedText.value = ''
}

const handleImport = () => {
  importStep.value = 0
  selectedFile.value = null
  importPreview.value = []
  importDialogVisible.value = true
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

const handleFileChange = (file: any) => {
  selectedFile.value = file.raw
}

const confirmImport = () => {
  importLoading.value = true
  setTimeout(() => {
    importLoading.value = false
    importDialogVisible.value = false
    ElMessage.success('导入成功')
    loadWords()
  }, 2000)
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadWords()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadWords()
}

onMounted(() => {
  loadWords()
})
</script>

<style scoped>
.sensitive-words-page {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  height: 80px;
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

.stats-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stats-icon.blocked {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stats-icon.review {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stats-icon.hits {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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

.word-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.word-text {
  font-weight: 500;
}

.word-text.regex {
  font-family: 'Courier New', monospace;
  color: #e6a23c;
}

.replacement-text {
  color: #67c23a;
  font-weight: 500;
}

.text-placeholder {
  color: #c0c4cc;
}

.hit-count {
  color: #409eff;
  font-weight: 500;
}

.radio-option {
  margin-left: 8px;
}

.option-title {
  font-weight: 500;
  color: #303133;
}

.option-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.form-help {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.test-container {
  max-height: 60vh;
  overflow-y: auto;
}

.test-results {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.test-results h4 {
  margin: 0 0 12px 0;
  color: #303133;
}

.result-summary {
  margin-bottom: 16px;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.result-item {
  padding: 12px;
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
}

.result-word {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.word {
  font-weight: 500;
  color: #f56c6c;
}

.result-action {
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 12px;
}

.replacement {
  color: #67c23a;
}

.processed-text h4 {
  margin: 0 0 8px 0;
  color: #303133;
}

.processed-content {
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
  line-height: 1.6;
  color: #606266;
  border: 1px solid #e4e7ed;
}

.import-container {
  padding: 20px 0;
}

.import-content {
  margin: 30px 0;
  min-height: 200px;
}

.import-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.import-summary {
  text-align: center;
}

.preview-list {
  margin-top: 16px;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
}

.preview-item {
  padding: 4px 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 14px;
}

.preview-more {
  color: #909399;
  font-style: italic;
  text-align: center;
  margin-top: 8px;
}

:deep(.el-radio) {
  display: block;
  margin-bottom: 16px;
  height: auto;
}

:deep(.el-radio:last-child) {
  margin-bottom: 0;
}

:deep(.el-radio__label) {
  padding-left: 8px;
}
</style>