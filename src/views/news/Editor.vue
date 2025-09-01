<template>
  <div class="news-editor-page">
    <!-- 页面头部 -->
    <div class="header">
      <div class="header-left">
        <el-button @click="goBack" type="info" plain>
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <div class="title-info">
          <h2>{{ pageTitle }}</h2>
          <div class="breadcrumb">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item>资讯管理</el-breadcrumb-item>
              <el-breadcrumb-item>{{ isEditMode ? '编辑资讯' : '新建资讯' }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
        </div>
      </div>
      <div class="header-right">
        <el-switch 
          v-model="autoSave" 
          active-text="自动保存" 
          inactive-text="手动保存"
          style="margin-right: 16px;"
        />
        <div class="save-status" :class="saveStatusClass">
          <el-icon>
            <Loading v-if="saveStatus === 'saving'" />
            <Check v-else-if="saveStatus === 'saved'" />
            <Warning v-else-if="saveStatus === 'error'" />
            <Document v-else />
          </el-icon>
          <span>{{ saveStatusText }}</span>
        </div>
      </div>
    </div>

    <!-- 编辑器组件 -->
    <ArticleEditor 
      :article="currentArticle"
      :mode="isEditMode ? 'edit' : 'create'"
      @save="handleSave"
      @submit="handleSubmit"
      @publish="handlePublish"
    />

    <!-- 历史版本 -->
    <el-card v-if="isEditMode" class="history-card">
      <template #header>
        <div class="card-header">
          <span>编辑历史</span>
          <el-button size="small" @click="showHistoryDialog">
            <el-icon><Clock /></el-icon>
            查看历史版本
          </el-button>
        </div>
      </template>
      
      <div class="history-summary">
        <el-timeline>
          <el-timeline-item
            v-for="(history, index) in editHistory.slice(0, 3)"
            :key="index"
            :timestamp="history.timestamp"
            :type="getHistoryType(history.action)"
          >
            <div class="history-item">
              <div class="action">{{ getHistoryText(history.action) }}</div>
              <div class="editor">编辑者: {{ history.editor }}</div>
              <div class="changes" v-if="history.changes">{{ history.changes }}</div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>

    <!-- 历史版本对话框 -->
    <el-dialog v-model="historyDialogVisible" title="编辑历史版本" width="900px">
      <el-table :data="editHistory" style="width: 100%">
        <el-table-column prop="timestamp" label="时间" width="180" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-tag :type="getHistoryType(row.action)">
              {{ getHistoryText(row.action) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="editor" label="编辑者" width="120" />
        <el-table-column prop="changes" label="更改内容" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row, $index }">
            <el-button link type="primary" @click="compareVersion($index)">对比</el-button>
            <el-button link type="warning" @click="restoreVersion($index)">恢复</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 版本对比对话框 -->
    <el-dialog v-model="compareDialogVisible" title="版本对比" width="1200px">
      <div class="version-compare">
        <div class="compare-header">
          <div class="version-info">
            <h4>当前版本</h4>
            <span class="version-time">{{ new Date().toLocaleString() }}</span>
          </div>
          <div class="version-info">
            <h4>历史版本</h4>
            <span class="version-time">{{ selectedVersion?.timestamp }}</span>
          </div>
        </div>
        <div class="compare-content">
          <div class="current-version">
            <div class="version-title">{{ currentArticle?.title }}</div>
            <div class="version-content" v-html="currentArticle?.content"></div>
          </div>
          <div class="history-version">
            <div class="version-title">{{ selectedVersion?.title }}</div>
            <div class="version-content" v-html="selectedVersion?.content"></div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft,
  Loading,
  Check,
  Warning,
  Document,
  Clock
} from '@element-plus/icons-vue'
import ArticleEditor from './components/ArticleEditor.vue'

interface ArticleForm {
  id?: number
  title: string
  content: string
  summary: string
  category: string
  tags: string[]
  priority: number
  quality: number
  originalUrl: string
  publishChannels: string[]
  editorNote: string
}

interface HistoryEntry {
  timestamp: string
  action: 'create' | 'edit' | 'save' | 'submit' | 'publish'
  editor: string
  changes: string
  title?: string
  content?: string
}

const route = useRoute()
const router = useRouter()

const autoSave = ref(true)
const historyDialogVisible = ref(false)
const compareDialogVisible = ref(false)
const saveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
const selectedVersion = ref<HistoryEntry | null>(null)

const currentArticle = ref<ArticleForm>({
  title: '',
  content: '',
  summary: '',
  category: '',
  tags: [],
  priority: 1,
  quality: 3,
  originalUrl: '',
  publishChannels: ['portal'],
  editorNote: ''
})

const editHistory = ref<HistoryEntry[]>([
  {
    timestamp: '2024-03-01 16:30:00',
    action: 'create',
    editor: '张三',
    changes: '创建文章草稿',
    title: '人工智能技术在金融行业的应用',
    content: '初始内容...'
  },
  {
    timestamp: '2024-03-01 16:45:00',
    action: 'edit',
    editor: '李四',
    changes: '修改标题，补充内容段落',
    title: '人工智能技术在金融行业的最新应用进展',
    content: '修改后的内容...'
  },
  {
    timestamp: '2024-03-01 17:10:00',
    action: 'save',
    editor: '李四',
    changes: '保存草稿，添加图片和链接'
  }
])

let autoSaveTimer: NodeJS.Timeout | null = null

const isEditMode = computed(() => {
  return route.params.id && route.params.id !== 'new'
})

const pageTitle = computed(() => {
  return isEditMode.value ? '编辑资讯' : '新建资讯'
})

const saveStatusClass = computed(() => {
  return {
    'status-saving': saveStatus.value === 'saving',
    'status-saved': saveStatus.value === 'saved',
    'status-error': saveStatus.value === 'error',
    'status-idle': saveStatus.value === 'idle'
  }
})

const saveStatusText = computed(() => {
  const statusMap = {
    idle: '未保存',
    saving: '保存中...',
    saved: '已保存',
    error: '保存失败'
  }
  return statusMap[saveStatus.value]
})

const getHistoryType = (action: string) => {
  const typeMap: Record<string, string> = {
    create: '',
    edit: 'warning',
    save: 'info',
    submit: 'success',
    publish: 'success'
  }
  return typeMap[action] || ''
}

const getHistoryText = (action: string) => {
  const textMap: Record<string, string> = {
    create: '创建',
    edit: '编辑',
    save: '保存',
    submit: '提交审核',
    publish: '发布'
  }
  return textMap[action] || action
}

const goBack = () => {
  router.back()
}

const handleSave = async (article: ArticleForm) => {
  saveStatus.value = 'saving'
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新当前文章数据
    Object.assign(currentArticle.value, article)
    
    // 添加历史记录
    editHistory.value.unshift({
      timestamp: new Date().toLocaleString(),
      action: 'save',
      editor: '当前用户',
      changes: '保存文章修改'
    })
    
    saveStatus.value = 'saved'
    
    // 3秒后重置状态
    setTimeout(() => {
      if (saveStatus.value === 'saved') {
        saveStatus.value = 'idle'
      }
    }, 3000)
    
  } catch (error) {
    saveStatus.value = 'error'
    ElMessage.error('保存失败，请重试')
  }
}

const handleSubmit = async (article: ArticleForm) => {
  try {
    await ElMessageBox.confirm('确定要提交审核吗？', '提交确认', {
      confirmButtonText: '确定提交',
      cancelButtonText: '取消',
      type: 'info'
    })
    
    // 先保存
    await handleSave(article)
    
    // 添加提交记录
    editHistory.value.unshift({
      timestamp: new Date().toLocaleString(),
      action: 'submit',
      editor: '当前用户',
      changes: '提交文章审核'
    })
    
    ElMessage.success('已提交审核，等待审核结果')
    
  } catch {}
}

const handlePublish = async (article: ArticleForm) => {
  try {
    await ElMessageBox.confirm('确定要直接发布吗？', '发布确认', {
      confirmButtonText: '确定发布',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 先保存
    await handleSave(article)
    
    // 添加发布记录
    editHistory.value.unshift({
      timestamp: new Date().toLocaleString(),
      action: 'publish',
      editor: '当前用户',
      changes: '直接发布文章'
    })
    
    ElMessage.success('文章已发布成功')
    
  } catch {}
}

const showHistoryDialog = () => {
  historyDialogVisible.value = true
}

const compareVersion = (index: number) => {
  selectedVersion.value = editHistory.value[index]
  compareDialogVisible.value = true
}

const restoreVersion = async (index: number) => {
  try {
    await ElMessageBox.confirm('确定要恢复到这个版本吗？当前的修改将会丢失。', '恢复版本确认', {
      confirmButtonText: '确定恢复',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const version = editHistory.value[index]
    if (version.title && version.content) {
      currentArticle.value.title = version.title
      currentArticle.value.content = version.content
      
      ElMessage.success('已恢复到选择的版本')
      historyDialogVisible.value = false
    }
    
  } catch {}
}

const startAutoSave = () => {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
  }
  
  if (autoSave.value) {
    autoSaveTimer = setInterval(() => {
      if (saveStatus.value !== 'saving' && currentArticle.value.title) {
        handleSave(currentArticle.value)
      }
    }, 30000) // 30秒自动保存一次
  }
}

const stopAutoSave = () => {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
    autoSaveTimer = null
  }
}

// 监听自动保存开关变化
watch(autoSave, (newValue) => {
  if (newValue) {
    startAutoSave()
  } else {
    stopAutoSave()
  }
})

// 页面离开前确认
const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
  if (saveStatus.value === 'saving' || saveStatus.value === 'idle') {
    e.preventDefault()
    e.returnValue = '页面有未保存的内容，确定要离开吗？'
  }
}

onMounted(async () => {
  // 如果是编辑模式，加载文章数据
  if (isEditMode.value) {
    try {
      // 模拟API调用加载文章
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 模拟已有文章数据
      Object.assign(currentArticle.value, {
        id: Number(route.params.id),
        title: '人工智能技术在金融行业的最新应用进展',
        content: '<p>随着人工智能技术的快速发展，金融行业正在经历一场深刻的数字化变革。从智能客服到风险控制，从算法交易到个性化投资建议，AI技术正在重塑金融服务的各个环节。</p>',
        summary: '人工智能技术正在深刻改变金融行业的服务模式和运营方式。',
        category: 'tech',
        tags: ['人工智能', '金融科技', '数字化转型'],
        priority: 2,
        quality: 4,
        originalUrl: 'https://example.com/article/1',
        publishChannels: ['portal', 'wechat'],
        editorNote: ''
      })
    } catch (error) {
      ElMessage.error('加载文章失败')
    }
  }
  
  // 启动自动保存
  startAutoSave()
  
  // 添加页面离开确认
  window.addEventListener('beforeunload', beforeUnloadHandler)
})

onUnmounted(() => {
  stopAutoSave()
  window.removeEventListener('beforeunload', beforeUnloadHandler)
})
</script>

<style scoped>
.news-editor-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-info h2 {
  margin: 0 0 4px 0;
  font-size: 20px;
  color: #333;
}

.breadcrumb {
  font-size: 14px;
  color: #666;
}

.header-right {
  display: flex;
  align-items: center;
}

.save-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 4px;
  transition: all 0.3s;
}

.save-status.status-idle {
  color: #909399;
  background: #f4f4f5;
}

.save-status.status-saving {
  color: #409EFF;
  background: #ecf5ff;
}

.save-status.status-saved {
  color: #67C23A;
  background: #f0f9ff;
}

.save-status.status-error {
  color: #F56C6C;
  background: #fef0f0;
}

.history-card {
  margin-top: 20px;
  background: #fff;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-summary {
  padding: 10px 0;
}

.history-item {
  color: #666;
}

.history-item .action {
  font-weight: 500;
  color: #333;
}

.history-item .editor {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.history-item .changes {
  font-size: 13px;
  margin-top: 4px;
}

.version-compare {
  max-height: 600px;
  overflow-y: auto;
}

.compare-header {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 15px;
}

.version-info {
  flex: 1;
  text-align: center;
}

.version-info h4 {
  margin: 0 0 8px 0;
  color: #333;
}

.version-time {
  font-size: 12px;
  color: #999;
}

.compare-content {
  display: flex;
  gap: 20px;
}

.current-version,
.history-version {
  flex: 1;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #fafafa;
}

.version-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.version-content {
  font-size: 14px;
  line-height: 1.6;
  color: #666;
}
</style>