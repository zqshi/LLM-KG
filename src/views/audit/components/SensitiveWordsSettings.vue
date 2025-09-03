<template>
  <div class="sensitive-words-settings">
    <div class="settings-header">
      <h3>敏感词管理</h3>
      <p>统一管理平台敏感词库，设置不同词的干预动作</p>
    </div>

    <!-- 操作工具栏 -->
    <el-card class="toolbar-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button type="primary" @click="showAddWord">
            <el-icon>
              <Plus />
            </el-icon>
            添加敏感词
          </el-button>
          <el-button @click="showBatchImport">
            <el-icon>
              <Upload />
            </el-icon>
            批量导入
          </el-button>
          <el-button @click="exportWords">
            <el-icon>
              <Download />
            </el-icon>
            导出词库
          </el-button>
        </div>
        <div class="toolbar-right">
          <el-input v-model="searchKeyword" placeholder="搜索敏感词" style="width: 200px" clearable @input="handleSearch">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>
      </div>
    </el-card>

    <!-- 敏感词列表 -->
    <el-card class="words-list">
      <template #header>
        <div class="card-header">
          <span>敏感词列表 ({{ pagination.total }})</span>
          <div class="header-actions">
            <el-select v-model="filterAction" placeholder="处理动作" clearable @change="loadWords">
              <el-option label="禁止" value="forbidden" />
              <el-option label="审核" value="review" />
              <el-option label="替换" value="replace" />
            </el-select>
          </div>
        </div>
      </template>

      <el-table :data="wordsList" v-loading="loading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="word" label="敏感词" width="200">
          <template #default="{ row }">
            <span class="word-text">{{ row.word }}</span>
            <el-tag v-if="row.isRegex" type="warning" size="small" style="margin-left: 8px">
              正则
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="action" label="处理动作" width="120">
          <template #default="{ row }">
            <el-tag :type="getActionTag(row.action)">
              {{ getActionLabel(row.action) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="replaceWith" label="替换内容" width="150">
          <template #default="{ row }">
            <span v-if="row.action === 'replace'">{{ row.replaceWith || '***' }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.category || '默认' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="hitCount" label="命中次数" width="100">
          <template #default="{ row }">
            <span class="hit-count">{{ row.hitCount || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="creator" label="创建人" width="100" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editWord(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="deleteWord(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="pagination.current" v-model:page-size="pagination.size"
          :total="pagination.total" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadWords" @current-change="loadWords" />
      </div>
    </el-card>

    <!-- 添加/编辑敏感词弹窗 -->
    <el-dialog v-model="wordDialogVisible" :title="isEdit ? '编辑敏感词' : '添加敏感词'" width="500px">
      <el-form :model="wordForm" :rules="wordRules" ref="wordFormRef" label-width="100px">
        <el-form-item label="敏感词" prop="word">
          <el-input v-model="wordForm.word" placeholder="请输入敏感词" />
        </el-form-item>

        <el-form-item label="正则表达式">
          <el-switch v-model="wordForm.isRegex" />
          <span class="form-tip">开启后按正则表达式匹配</span>
        </el-form-item>

        <el-form-item label="处理动作" prop="action">
          <el-radio-group v-model="wordForm.action">
            <el-radio label="forbidden">禁止</el-radio>
            <el-radio label="review">审核</el-radio>
            <el-radio label="replace">替换</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="替换内容" prop="replaceWith" v-if="wordForm.action === 'replace'">
          <el-input v-model="wordForm.replaceWith" placeholder="请输入替换内容" />
        </el-form-item>

        <el-form-item label="分类">
          <el-select v-model="wordForm.category" placeholder="请选择分类" clearable>
            <el-option label="政治敏感" value="political" />
            <el-option label="色情内容" value="pornographic" />
            <el-option label="暴力内容" value="violent" />
            <el-option label="广告垃圾" value="spam" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="wordForm.remark" type="textarea" rows="3" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="wordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveWord">保存</el-button>
      </template>
    </el-dialog>

    <!-- 批量导入弹窗 -->
    <el-dialog v-model="importDialogVisible" title="批量导入敏感词" width="600px">
      <el-form :model="importForm" label-width="100px">
        <el-form-item label="导入方式">
          <el-radio-group v-model="importForm.method">
            <el-radio label="file">文件上传</el-radio>
            <el-radio label="text">文本输入</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="文件上传" v-if="importForm.method === 'file'">
          <el-upload ref="uploadRef" :auto-upload="false" :on-change="handleFileChange" accept=".txt,.csv" :limit="1">
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持 .txt 或 .csv 格式，每行一个敏感词
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="文本输入" v-if="importForm.method === 'text'">
          <el-input v-model="importForm.text" type="textarea" rows="10" placeholder="请输入敏感词，每行一个" />
        </el-form-item>

        <el-form-item label="处理动作">
          <el-radio-group v-model="importForm.action">
            <el-radio label="forbidden">禁止</el-radio>
            <el-radio label="review">审核</el-radio>
            <el-radio label="replace">替换</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="替换内容" v-if="importForm.action === 'replace'">
          <el-input v-model="importForm.replaceWith" placeholder="请输入替换内容" />
        </el-form-item>

        <el-form-item label="分类">
          <el-select v-model="importForm.category" placeholder="请选择分类">
            <el-option label="政治敏感" value="political" />
            <el-option label="色情内容" value="pornographic" />
            <el-option label="暴力内容" value="violent" />
            <el-option label="广告垃圾" value="spam" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmImport">确认导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Download, Search } from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const wordsList = ref([])
const selectedWords = ref([])
const searchKeyword = ref('')
const filterAction = ref('')
const wordDialogVisible = ref(false)
const importDialogVisible = ref(false)
const isEdit = ref(false)
const wordFormRef = ref()
const uploadRef = ref()

// 表单数据
const wordForm = reactive({
  id: null,
  word: '',
  isRegex: false,
  action: 'forbidden',
  replaceWith: '',
  category: '',
  remark: ''
})

const importForm = reactive({
  method: 'file',
  text: '',
  action: 'forbidden',
  replaceWith: '',
  category: 'other',
  file: null
})

// 分页
const pagination = reactive({
  current: 1,
  size: 20,
  total: 0
})

// 表单验证规则
const wordRules = {
  word: [
    { required: true, message: '请输入敏感词', trigger: 'blur' }
  ],
  action: [
    { required: true, message: '请选择处理动作', trigger: 'change' }
  ]
}

// 方法
const loadWords = async () => {
  loading.value = true
  try {
    // TODO: 调用API获取敏感词列表
    wordsList.value = [
      {
        id: 1,
        word: '政治敏感词',
        isRegex: false,
        action: 'forbidden',
        replaceWith: '',
        category: 'political',
        hitCount: 15,
        createTime: '2024-01-15 10:00:00',
        creator: '管理员'
      },
      {
        id: 2,
        word: '广告.*推广',
        isRegex: true,
        action: 'review',
        replaceWith: '',
        category: 'spam',
        hitCount: 8,
        createTime: '2024-01-15 09:00:00',
        creator: '审核员A'
      },
      {
        id: 3,
        word: '色情内容',
        isRegex: false,
        action: 'replace',
        replaceWith: '***',
        category: 'pornographic',
        hitCount: 3,
        createTime: '2024-01-15 08:00:00',
        creator: '管理员'
      }
    ]
    pagination.total = 156
  } catch (error) {
    ElMessage.error('加载敏感词列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  loadWords()
}

const handleSelectionChange = (selection: any[]) => {
  selectedWords.value = selection
}

const showAddWord = () => {
  isEdit.value = false
  resetWordForm()
  wordDialogVisible.value = true
}

const editWord = (word: any) => {
  isEdit.value = true
  Object.assign(wordForm, word)
  wordDialogVisible.value = true
}

const deleteWord = async (word: any) => {
  try {
    await ElMessageBox.confirm(
      `确认删除敏感词"${word.word}"？`,
      '确认删除',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // TODO: 调用删除API
    ElMessage.success('删除成功')
    await loadWords()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const saveWord = async () => {
  try {
    await wordFormRef.value.validate()

    // TODO: 调用保存API
    ElMessage.success(`${isEdit.value ? '更新' : '创建'}成功`)
    wordDialogVisible.value = false
    await loadWords()
  } catch (error) {
    console.error('保存失败:', error)
  }
}

const resetWordForm = () => {
  Object.assign(wordForm, {
    id: null,
    word: '',
    isRegex: false,
    action: 'forbidden',
    replaceWith: '',
    category: '',
    remark: ''
  })
}

const showBatchImport = () => {
  resetImportForm()
  importDialogVisible.value = true
}

const handleFileChange = (file: any) => {
  importForm.file = file.raw
}

const confirmImport = async () => {
  if (importForm.method === 'file' && !importForm.file) {
    ElMessage.warning('请选择要导入的文件')
    return
  }

  if (importForm.method === 'text' && !importForm.text.trim()) {
    ElMessage.warning('请输入要导入的敏感词')
    return
  }

  try {
    // TODO: 调用批量导入API
    ElMessage.success('批量导入成功')
    importDialogVisible.value = false
    await loadWords()
  } catch (error) {
    ElMessage.error('导入失败')
  }
}

const resetImportForm = () => {
  Object.assign(importForm, {
    method: 'file',
    text: '',
    action: 'forbidden',
    replaceWith: '',
    category: 'other',
    file: null
  })
}

const exportWords = async () => {
  try {
    // TODO: 调用导出API
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 工具方法
const getActionLabel = (action: string) => {
  const labels = {
    forbidden: '禁止',
    review: '审核',
    replace: '替换'
  }
  return labels[action] || action
}

const getActionTag = (action: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' | undefined => {
  const tags: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    forbidden: 'danger',
    review: 'warning',
    replace: 'info'
  }
  return tags[action] || undefined
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadWords()
})
</script>

<style scoped>
.sensitive-words-settings {
  padding: 20px;
}

.settings-header {
  margin-bottom: 20px;
}

.settings-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.settings-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.toolbar-card {
  margin-bottom: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-left {
  display: flex;
  gap: 8px;
}

.words-list {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.word-text {
  font-weight: 500;
  color: #303133;
}

.hit-count {
  color: #f56c6c;
  font-weight: 500;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.form-tip {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}

.el-upload__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
}
</style>
