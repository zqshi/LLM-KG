<template>
  <div class="enhanced-task-detail">
    <el-card v-if="selectedTask" class="detail-card">
      <template #header>
        <div class="detail-header">
          <span class="detail-title">任务详情</span>
          <div class="header-actions">
            <el-button-group size="small">
              <el-button 
                :type="viewMode === 'detail' ? 'primary' : ''"
                @click="viewMode = 'detail'"
              >
                <el-icon><Document /></el-icon>
                详情
              </el-button>
              <el-button 
                :type="viewMode === 'compare' ? 'primary' : ''"
                @click="viewMode = 'compare'"
                :disabled="!hasComparableVersion"
              >
                <el-icon><Switch /></el-icon>
                对比
              </el-button>
              <el-button 
                :type="viewMode === 'history' ? 'primary' : ''"
                @click="viewMode = 'history'"
              >
                <el-icon><Clock /></el-icon>
                历史
              </el-button>
            </el-button-group>
          </div>
        </div>
      </template>

      <!-- 基础信息 -->
      <div class="task-basic-info">
        <el-row :gutter="16">
          <el-col :span="12">
            <div class="info-item">
              <span class="label">任务ID:</span>
              <el-tag size="small">{{ selectedTask.taskId }}</el-tag>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="label">业务类型:</span>
              <el-tag :type="getBizTypeTag(selectedTask.bizType)">
                {{ getBizTypeLabel(selectedTask.bizType) }}
              </el-tag>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="label">优先级:</span>
              <el-tag :type="getPriorityTag(selectedTask.priority)" size="small">
                {{ getPriorityLabel(selectedTask.priority) }}
              </el-tag>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="label">提交时间:</span>
              <span class="value">{{ formatTime(selectedTask.createTime) }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="label">提交人:</span>
              <el-link @click="viewSubmitterInfo(selectedTask.submitterId)">
                {{ selectedTask.submitterName }}
              </el-link>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="label">处理时长:</span>
              <span class="value">{{ getProcessDuration() }}</span>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 内容详情视图 -->
      <div v-if="viewMode === 'detail'" class="content-detail-view">
        <!-- 智能标签 -->
        <div class="smart-tags" v-if="smartAnalysis">
          <h4>智能分析</h4>
          <div class="tags-container">
            <el-tag 
              v-for="tag in smartAnalysis.tags" 
              :key="tag.name"
              :type="getTagType(tag.confidence)"
              size="small"
              class="analysis-tag"
            >
              {{ tag.name }} ({{ tag.confidence }}%)
            </el-tag>
          </div>
          <div class="risk-assessment" v-if="smartAnalysis.riskLevel">
            <span class="risk-label">风险等级:</span>
            <el-tag 
              :type="getRiskTag(smartAnalysis.riskLevel)"
              size="small"
            >
              {{ getRiskLabel(smartAnalysis.riskLevel) }}
            </el-tag>
          </div>
        </div>

        <!-- 内容预览 -->
        <div class="content-preview">
          <h4>内容预览</h4>
          
          <!-- 文本内容 -->
          <div v-if="selectedTask.title" class="content-title">
            <strong>标题:</strong>
            <div class="highlighted-content" v-html="highlightSensitiveWords(selectedTask.title)"></div>
          </div>
          
          <div class="content-body">
            <strong>内容:</strong>
            <div 
              class="highlighted-content content-text" 
              v-html="highlightSensitiveWords(selectedTask.content)"
            ></div>
          </div>

          <!-- 图片内容 -->
          <div v-if="selectedTask.images && selectedTask.images.length" class="content-images">
            <h5>相关图片</h5>
            <div class="image-grid">
              <div 
                v-for="(img, index) in selectedTask.images" 
                :key="index"
                class="image-item"
              >
                <el-image 
                  :src="img" 
                  :preview-src-list="selectedTask.images"
                  fit="cover"
                  class="preview-image"
                  @click="analyzeImage(img)"
                >
                  <template #error>
                    <div class="image-error">
                      <el-icon><PictureFilled /></el-icon>
                      <span>加载失败</span>
                    </div>
                  </template>
                </el-image>
                <el-button size="small" type="text" @click="analyzeImage(img)">
                  AI分析
                </el-button>
              </div>
            </div>
          </div>

          <!-- 敏感词检测结果 -->
          <div v-if="sensitiveWords.length" class="sensitive-words">
            <h5>敏感词检测</h5>
            <div class="sensitive-words-list">
              <el-tag 
                v-for="word in sensitiveWords" 
                :key="word.word"
                :type="getSensitiveWordTag(word.action)"
                size="small"
                class="sensitive-word-tag"
              >
                {{ word.word }}
                <span class="action-label">({{ getSensitiveWordAction(word.action) }})</span>
              </el-tag>
            </div>
          </div>

          <!-- 相似内容检测 -->
          <div v-if="similarContent.length" class="similar-content">
            <h5>相似内容检测</h5>
            <el-table :data="similarContent" size="small">
              <el-table-column prop="title" label="相似内容" />
              <el-table-column prop="similarity" label="相似度" width="100">
                <template #default="{ row }">
                  <el-progress 
                    :percentage="row.similarity" 
                    :stroke-width="6"
                    :show-text="false"
                  />
                  <span class="similarity-text">{{ row.similarity }}%</span>
                </template>
              </el-table-column>
              <el-table-column prop="source" label="来源" width="120" />
              <el-table-column label="操作" width="80">
                <template #default="{ row }">
                  <el-button size="small" type="text" @click="compareSimilarContent(row)">
                    对比
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>

      <!-- 对比视图 -->
      <div v-if="viewMode === 'compare'" class="compare-view">
        <div class="compare-header">
          <h4>版本对比</h4>
          <el-select v-model="compareVersion" placeholder="选择对比版本" size="small">
            <el-option 
              v-for="version in compareVersions" 
              :key="version.id"
              :label="version.label"
              :value="version.id"
            />
          </el-select>
        </div>
        
        <div class="compare-content" v-if="compareVersion">
          <el-row :gutter="16">
            <el-col :span="12">
              <div class="version-panel">
                <h5>当前版本</h5>
                <div class="version-content">
                  <div class="version-title">{{ selectedTask.title }}</div>
                  <div class="version-body">{{ selectedTask.content }}</div>
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="version-panel">
                <h5>对比版本 ({{ getVersionLabel(compareVersion) }})</h5>
                <div class="version-content" v-if="compareData">
                  <div class="version-title">{{ compareData.title }}</div>
                  <div class="version-body">{{ compareData.content }}</div>
                </div>
              </div>
            </el-col>
          </el-row>
          
          <!-- 差异统计 -->
          <div class="diff-stats">
            <el-statistic title="文本变化" :value="diffStats.textChanges" suffix="处" />
            <el-statistic title="新增内容" :value="diffStats.additions" suffix="字符" />
            <el-statistic title="删除内容" :value="diffStats.deletions" suffix="字符" />
          </div>
        </div>
      </div>

      <!-- 历史记录视图 -->
      <div v-if="viewMode === 'history'" class="history-view">
        <h4>审核历史</h4>
        <el-timeline>
          <el-timeline-item 
            v-for="record in auditHistory" 
            :key="record.id"
            :timestamp="formatTime(record.createTime)"
            :type="getTimelineType(record.action)"
          >
            <div class="history-item">
              <div class="history-header">
                <span class="action-name">{{ getActionLabel(record.action) }}</span>
                <el-tag :type="getActionTag(record.action)" size="small">
                  {{ record.status }}
                </el-tag>
              </div>
              <div class="history-detail" v-if="record.reason">
                <strong>原因:</strong> {{ record.reason }}
              </div>
              <div class="history-detail" v-if="record.detail">
                <strong>详情:</strong> {{ record.detail }}
              </div>
              <div class="history-operator">
                操作人: {{ record.operatorName }}
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- 操作按钮 -->
      <div class="detail-actions">
        <el-button-group>
          <el-button type="success" @click="handleApprove">
            <el-icon><Check /></el-icon>
            通过
          </el-button>
          <el-button type="danger" @click="handleReject">
            <el-icon><Close /></el-icon>
            拒绝
          </el-button>
          <el-button type="info" @click="handleTransfer">
            <el-icon><Share /></el-icon>
            转交
          </el-button>
          <el-button @click="handleFlag" v-if="canFlag">
            <el-icon><Flag /></el-icon>
            标记
          </el-button>
        </el-button-group>

        <div class="additional-actions">
          <el-button size="small" @click="downloadTask">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
          <el-button size="small" @click="shareTask">
            <el-icon><Share /></el-icon>
            分享
          </el-button>
          <el-button size="small" @click="printTask">
            <el-icon><Printer /></el-icon>
            打印
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 空状态 -->
    <el-card v-else class="empty-card">
      <el-empty description="请选择一个任务查看详情" />
    </el-card>

    <!-- 提交人信息弹窗 -->
    <el-dialog v-model="submitterDialogVisible" title="提交人信息" width="600px">
      <div v-if="submitterInfo" class="submitter-info">
        <!-- 提交人详细信息 -->
      </div>
    </el-dialog>

    <!-- 图片分析弹窗 -->
    <el-dialog v-model="imageAnalysisVisible" title="图片AI分析" width="800px">
      <div v-if="imageAnalysisResult" class="image-analysis">
        <!-- 图片分析结果 -->
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Document,
  Switch,
  Clock,
  PictureFilled,
  Check,
  Close,
  Share,
  Flag,
  Download,
  Printer
} from '@element-plus/icons-vue'

// Props
interface Props {
  selectedTask: any
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits(['approve', 'reject', 'transfer'])

// 响应式数据
const viewMode = ref('detail')
const compareVersion = ref('')
const compareData = ref(null)
const submitterDialogVisible = ref(false)
const imageAnalysisVisible = ref(false)
const submitterInfo = ref(null)
const imageAnalysisResult = ref(null)

// 智能分析结果
const smartAnalysis = ref({
  tags: [
    { name: '正面内容', confidence: 85 },
    { name: '无广告', confidence: 92 },
    { name: '原创内容', confidence: 78 }
  ],
  riskLevel: 'low',
  sentiment: 'positive',
  quality: 'high'
})

// 敏感词检测结果
const sensitiveWords = ref([
  { word: '测试词', action: 'review', position: 15 }
])

// 相似内容
const similarContent = ref([
  { id: 1, title: '相似的内容标题', similarity: 76, source: '用户发布' },
  { id: 2, title: '另一个相似内容', similarity: 68, source: '新闻抓取' }
])

// 审核历史
const auditHistory = ref([
  {
    id: 1,
    action: 'submit',
    status: '已提交',
    operatorName: '系统',
    createTime: '2024-01-15 10:00:00'
  },
  {
    id: 2,
    action: 'assign',
    status: '已分配',
    operatorName: '管理员',
    reason: '自动分配',
    createTime: '2024-01-15 10:05:00'
  }
])

// 对比版本
const compareVersions = ref([
  { id: 'v1', label: '初始版本' },
  { id: 'v2', label: '修改版本1' }
])

// 差异统计
const diffStats = reactive({
  textChanges: 0,
  additions: 0,
  deletions: 0
})

// 计算属性
const hasComparableVersion = computed(() => compareVersions.value.length > 0)
const canFlag = computed(() => props.selectedTask?.priority === 'high')

// 方法
const highlightSensitiveWords = (text: string) => {
  if (!text || !sensitiveWords.value.length) return text

  let highlightedText = text
  sensitiveWords.value.forEach(word => {
    const regex = new RegExp(word.word, 'gi')
    highlightedText = highlightedText.replace(regex, `<mark class="sensitive-word">${word.word}</mark>`)
  })
  
  return highlightedText
}

const analyzeImage = async (imageUrl: string) => {
  imageAnalysisVisible.value = true
  try {
    // 模拟AI图片分析
    imageAnalysisResult.value = {
      url: imageUrl,
      analysis: {
        objects: ['person', 'text', 'building'],
        scene: 'outdoor',
        inappropriate: false,
        confidence: 92
      }
    }
  } catch (error) {
    ElMessage.error('图片分析失败')
  }
}

const viewSubmitterInfo = async (submitterId: number) => {
  submitterDialogVisible.value = true
  try {
    // 获取提交人信息
    submitterInfo.value = {
      id: submitterId,
      name: '张三',
      avatar: '',
      totalSubmissions: 25,
      approvalRate: 92,
      lastActive: '2024-01-15 09:30:00'
    }
  } catch (error) {
    ElMessage.error('获取提交人信息失败')
  }
}

const compareSimilarContent = (similarItem: any) => {
  // 切换到对比视图并加载相似内容
  viewMode.value = 'compare'
  compareData.value = similarItem
  
  // 计算差异
  calculateDifferences(props.selectedTask.content, similarItem.content)
}

const calculateDifferences = (text1: string, text2: string) => {
  // 简单的差异计算
  diffStats.textChanges = Math.abs(text1.length - text2.length)
  diffStats.additions = Math.max(0, text1.length - text2.length)
  diffStats.deletions = Math.max(0, text2.length - text1.length)
}

const handleApprove = () => {
  emit('approve', props.selectedTask)
}

const handleReject = () => {
  emit('reject', props.selectedTask)
}

const handleTransfer = () => {
  emit('transfer', props.selectedTask)
}

const handleFlag = async () => {
  try {
    ElMessage.success('任务已标记')
    // 标记逻辑
  } catch (error) {
    ElMessage.error('标记失败')
  }
}

const downloadTask = () => {
  // 导出任务详情
  const data = JSON.stringify(props.selectedTask, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `task_${props.selectedTask.taskId}.json`
  link.click()
  window.URL.revokeObjectURL(url)
}

const shareTask = () => {
  // 复制任务链接到剪贴板
  const taskUrl = `${window.location.origin}/audit/tasks/${props.selectedTask.taskId}`
  navigator.clipboard.writeText(taskUrl)
  ElMessage.success('任务链接已复制到剪贴板')
}

const printTask = () => {
  window.print()
}

const getProcessDuration = () => {
  if (!props.selectedTask.createTime) return '未知'
  const startTime = new Date(props.selectedTask.createTime).getTime()
  const now = Date.now()
  const duration = now - startTime
  
  const hours = Math.floor(duration / (1000 * 60 * 60))
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
  
  return `${hours}小时${minutes}分钟`
}

const getVersionLabel = (versionId: string) => {
  const version = compareVersions.value.find(v => v.id === versionId)
  return version?.label || versionId
}

// 工具方法
const getBizTypeLabel = (bizType: string) => {
  const labels = {
    forum_post: '论坛帖子',
    flea_goods: '跳蚤市场',
    news: '资讯文章',
    banner: 'Banner广告',
    quotation: '名言警句'
  }
  return labels[bizType] || bizType
}

const getBizTypeTag = (bizType: string) => {
  const tags = {
    forum_post: 'primary',
    flea_goods: 'success',
    news: 'warning',
    banner: 'info',
    quotation: 'danger'
  }
  return tags[bizType] || 'info'
}

const getPriorityLabel = (priority: string) => {
  const labels = { high: '高', normal: '普通', low: '低' }
  return labels[priority] || priority
}

const getPriorityTag = (priority: string) => {
  const tags = { high: 'danger', normal: 'warning', low: 'info' }
  return tags[priority] || 'info'
}

const getTagType = (confidence: number) => {
  if (confidence >= 80) return 'success'
  if (confidence >= 60) return 'warning'
  return 'danger'
}

const getRiskTag = (riskLevel: string) => {
  const tags = { low: 'success', medium: 'warning', high: 'danger' }
  return tags[riskLevel] || 'info'
}

const getRiskLabel = (riskLevel: string) => {
  const labels = { low: '低风险', medium: '中风险', high: '高风险' }
  return labels[riskLevel] || riskLevel
}

const getSensitiveWordTag = (action: string) => {
  const tags = { forbidden: 'danger', review: 'warning', replace: 'info' }
  return tags[action] || 'info'
}

const getSensitiveWordAction = (action: string) => {
  const actions = { forbidden: '禁止', review: '审核', replace: '替换' }
  return actions[action] || action
}

const getTimelineType = (action: string) => {
  const types = {
    submit: 'primary',
    assign: 'info',
    approve: 'success',
    reject: 'danger'
  }
  return types[action] || 'primary'
}

const getActionLabel = (action: string) => {
  const labels = {
    submit: '提交审核',
    assign: '分配任务',
    approve: '审核通过',
    reject: '审核拒绝',
    transfer: '任务转交'
  }
  return labels[action] || action
}

const getActionTag = (action: string) => {
  const tags = {
    submit: 'primary',
    assign: 'info',
    approve: 'success',
    reject: 'danger',
    transfer: 'warning'
  }
  return tags[action] || 'info'
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

// 监听选中任务变化
watch(() => props.selectedTask, (newTask) => {
  if (newTask) {
    // 重置视图模式
    viewMode.value = 'detail'
    compareVersion.value = ''
    compareData.value = null
    
    // 加载相关数据
    loadTaskAnalysis(newTask.taskId)
  }
}, { immediate: true })

const loadTaskAnalysis = async (taskId: string) => {
  try {
    // 加载智能分析、敏感词检测等数据
    // 这里模拟异步加载
  } catch (error) {
    console.error('加载任务分析失败:', error)
  }
}
</script>

<style scoped>
.enhanced-task-detail {
  height: 100%;
}

.detail-card {
  height: 100%;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-title {
  font-size: 16px;
  font-weight: 600;
}

.task-basic-info {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.info-item {
  margin-bottom: 8px;
}

.info-item .label {
  color: #909399;
  margin-right: 8px;
  font-size: 14px;
}

.info-item .value {
  color: #303133;
  font-size: 14px;
}

.smart-tags {
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.tags-container {
  margin-bottom: 8px;
}

.analysis-tag {
  margin-right: 8px;
  margin-bottom: 4px;
}

.risk-assessment {
  display: flex;
  align-items: center;
  gap: 8px;
}

.content-preview h4,
.content-preview h5 {
  margin: 16px 0 8px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.content-title,
.content-body {
  margin-bottom: 12px;
}

.highlighted-content {
  margin-top: 4px;
  line-height: 1.6;
}

.highlighted-content :deep(.sensitive-word) {
  background: #fef0f0;
  color: #f56c6c;
  padding: 1px 4px;
  border-radius: 3px;
}

.content-text {
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  background: #fafafa;
  border-radius: 4px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.image-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  margin-bottom: 4px;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #c0c4cc;
}

.sensitive-words-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sensitive-word-tag {
  margin: 0;
}

.action-label {
  margin-left: 4px;
  opacity: 0.7;
}

.compare-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.version-panel {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 12px;
  height: 300px;
}

.version-panel h5 {
  margin: 0 0 12px 0;
  color: #303133;
  font-weight: 600;
}

.version-content {
  height: calc(100% - 32px);
  overflow-y: auto;
}

.version-title {
  font-weight: 600;
  margin-bottom: 8px;
}

.version-body {
  line-height: 1.6;
  color: #606266;
}

.diff-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.history-view {
  max-height: 400px;
  overflow-y: auto;
}

.history-item {
  padding: 8px 0;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.action-name {
  font-weight: 600;
}

.history-detail {
  margin-bottom: 4px;
  font-size: 14px;
  color: #606266;
}

.history-operator {
  font-size: 12px;
  color: #909399;
}

.detail-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.additional-actions {
  display: flex;
  gap: 8px;
}

.empty-card {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.similarity-text {
  font-size: 12px;
  margin-left: 8px;
}

.submitter-info,
.image-analysis {
  padding: 20px;
}
</style>