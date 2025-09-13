<template>
  <el-card class="feedback-card">
    <template #header>
      <div class="card-header">
        <div class="header-left">
          <h3 class="card-title">
            最新反馈
            <el-badge 
              v-if="unreadCount > 0"
              :value="unreadCount" 
              type="danger" 
              class="unread-badge"
            />
          </h3>
          <el-text size="small" type="info" class="card-subtitle">
            用户反馈和建议，及时了解用户声音
          </el-text>
        </div>
        <div class="header-actions">
          <el-tooltip content="标记全部已读" placement="top">
            <el-button 
              size="small" 
              :icon="Check" 
              circle
              @click="handleMarkAllRead"
              :disabled="unreadCount === 0"
            />
          </el-tooltip>
          <el-tooltip content="查看所有反馈" placement="top">
            <el-button 
              size="small" 
              :icon="View" 
              circle
              @click="handleViewAll"
            />
          </el-tooltip>
        </div>
      </div>
    </template>

    <div class="feedback-container">
      <!-- 加载状态 -->
      <div v-if="loading" class="feedback-loading">
        <el-skeleton animated>
          <template #template>
            <div
              v-for="i in 3"
              :key="i"
              class="skeleton-item"
            >
              <el-skeleton-item variant="circle" style="width: 40px; height: 40px;" />
              <div class="skeleton-content">
                <el-skeleton-item variant="text" style="width: 60%;" />
                <el-skeleton-item variant="text" style="width: 80%;" />
                <el-skeleton-item variant="text" style="width: 40%;" />
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="feedback-error">
        <el-alert
          title="数据加载失败"
          :description="error"
          type="error"
          :closable="false"
          show-icon
        />
      </div>

      <!-- 空状态 -->
      <div v-else-if="!feedbackList || feedbackList.length === 0" class="feedback-empty">
        <el-empty description="暂无用户反馈">
          <template #image>
            <el-icon size="60" color="#c0c4cc">
              <MessageBox />
            </el-icon>
          </template>
          <template #description>
            <span>暂时没有收到用户反馈</span>
          </template>
        </el-empty>
      </div>

      <!-- 反馈列表 -->
      <div v-else class="feedback-list">
        <div
          v-for="feedback in feedbackList"
          :key="feedback.id"
          class="feedback-item"
          :class="{ 'unread': !feedback.isRead }"
          @click="handleFeedbackClick(feedback)"
        >
          <div class="feedback-avatar">
            <el-avatar 
              :size="40" 
              :src="feedback.user.avatar"
              class="user-avatar"
            >
              {{ getUserInitial(feedback.user.nickname) }}
            </el-avatar>
            <div 
              v-if="!feedback.isRead"
              class="unread-dot"
            ></div>
          </div>

          <div class="feedback-content">
            <div class="feedback-header">
              <div class="user-info">
                <span class="user-name">{{ feedback.user.nickname }}</span>
                <el-tag 
                  v-if="feedback.user.vip"
                  type="warning"
                  size="small"
                  class="vip-tag"
                >
                  VIP
                </el-tag>
              </div>
              <div class="feedback-meta">
                <span class="feedback-time">{{ formatTime(feedback.createdAt) }}</span>
                <el-tag 
                  :type="getFeedbackTypeTag(feedback.type)"
                  size="small"
                  class="type-tag"
                >
                  {{ getFeedbackTypeName(feedback.type) }}
                </el-tag>
              </div>
            </div>

            <div class="feedback-text">
              {{ feedback.content }}
            </div>

            <div class="feedback-actions">
              <div class="action-left">
                <div class="feedback-rating" v-if="feedback.rating">
                  <el-rate
                    v-model="feedback.rating"
                    disabled
                    size="small"
                    show-score
                    text-color="#ff9900"
                  />
                </div>
                <div v-if="feedback.tags && feedback.tags.length > 0" class="feedback-tags">
                  <el-tag
                    v-for="tag in feedback.tags.slice(0, 2)"
                    :key="tag"
                    size="small"
                    type="info"
                    class="tag-item"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>
              
              <div class="action-buttons">
                <el-button
                  size="small"
                  type="primary"
                  text
                  @click.stop="handleReply(feedback)"
                >
                  回复
                </el-button>
                <el-dropdown 
                  @command="(command: string) => handleAction(feedback, command)"
                  placement="bottom-end"
                >
                  <el-button
                    size="small"
                    :icon="MoreFilled"
                    text
                    @click.stop
                  />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item 
                        command="mark-read"
                        :disabled="feedback.isRead"
                      >
                        <el-icon><Check /></el-icon>
                        标记已读
                      </el-dropdown-item>
                      <el-dropdown-item command="forward">
                        <el-icon><Share /></el-icon>
                        转发相关部门
                      </el-dropdown-item>
                      <el-dropdown-item command="priority">
                        <el-icon><Flag /></el-icon>
                        设为重要
                      </el-dropdown-item>
                      <el-dropdown-item command="archive" divided>
                        <el-icon><Folder /></el-icon>
                        归档
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 查看更多 -->
      <div v-if="hasMore" class="feedback-footer">
        <el-button 
          text 
          type="primary"
          @click="handleViewAll"
          class="view-more-btn"
        >
          查看全部反馈
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 快速回复对话框 -->
    <el-dialog
      v-model="replyDialogVisible"
      title="快速回复"
      width="600px"
      :before-close="handleReplyDialogClose"
    >
      <div v-if="selectedFeedback" class="reply-dialog-content">
        <div class="original-feedback">
          <div class="original-header">
            <el-avatar :size="32">
              {{ getUserInitial(selectedFeedback.user.nickname) }}
            </el-avatar>
            <div class="original-info">
              <span class="original-user">{{ selectedFeedback.user.nickname }}</span>
              <span class="original-time">{{ formatDetailTime(selectedFeedback.createdAt) }}</span>
            </div>
          </div>
          <div class="original-content">
            {{ selectedFeedback.content }}
          </div>
        </div>

        <el-divider />

        <div class="reply-form">
          <el-input
            v-model="replyContent"
            type="textarea"
            :rows="4"
            placeholder="请输入回复内容..."
            maxlength="500"
            show-word-limit
          />
          
          <div class="reply-templates">
            <span class="templates-label">常用回复：</span>
            <el-button
              v-for="template in replyTemplates"
              :key="template.id"
              size="small"
              text
              @click="useTemplate(template.content)"
            >
              {{ template.name }}
            </el-button>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="replyDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleSendReply"
            :disabled="!replyContent.trim()"
          >
            发送回复
          </el-button>
        </div>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Check, View, MessageBox, MoreFilled, Share, Flag, Folder,
  ArrowRight
} from '@element-plus/icons-vue'

// 反馈数据类型定义
interface FeedbackItem {
  id: number
  user: {
    id: number
    nickname: string
    avatar?: string
    vip?: boolean
  }
  content: string
  type: 'bug' | 'suggestion' | 'complaint' | 'praise'
  rating?: number
  tags?: string[]
  isRead: boolean
  createdAt: string
  updatedAt?: string
}

// Props 定义
interface Props {
  feedbackList?: FeedbackItem[]
  loading?: boolean
  error?: string | null
  hasMore?: boolean
  maxDisplayCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  feedbackList: () => [],
  loading: false,
  error: null,
  hasMore: false,
  maxDisplayCount: 5
})

// Emits 定义
interface Emits {
  (e: 'feedback-click', feedback: FeedbackItem): void
  (e: 'mark-all-read'): void
  (e: 'mark-read', feedback: FeedbackItem): void
  (e: 'reply', feedback: FeedbackItem, content: string): void
  (e: 'action', feedback: FeedbackItem, action: string): void
  (e: 'view-all'): void
}

const emit = defineEmits<Emits>()

const router = useRouter()

// 响应式数据
const replyDialogVisible = ref(false)
const selectedFeedback = ref<FeedbackItem | null>(null)
const replyContent = ref('')

// 回复模板
const replyTemplates = ref([
  { id: 1, name: '感谢反馈', content: '非常感谢您的反馈，我们会认真考虑您的建议。' },
  { id: 2, name: '已收到', content: '我们已收到您的反馈，会尽快处理并给您回复。' },
  { id: 3, name: '已修复', content: '您反馈的问题已经修复，请您验证一下。' },
  { id: 4, name: '需要更多信息', content: '为了更好地帮助您，能否提供更多详细信息？' }
])

// 计算属性
const unreadCount = computed(() => {
  if (!props.feedbackList) return 0
  return props.feedbackList.filter(item => !item.isRead).length
})

// 反馈类型映射
const feedbackTypeMap = {
  'bug': { name: 'Bug反馈', tag: 'danger' },
  'suggestion': { name: '建议', tag: 'primary' },
  'complaint': { name: '投诉', tag: 'warning' },
  'praise': { name: '表扬', tag: 'success' }
} as const

// 方法
const getUserInitial = (nickname: string) => {
  if (!nickname) return '?'
  return nickname.charAt(0).toUpperCase()
}

const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}

const formatDetailTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getFeedbackTypeName = (type: FeedbackItem['type']) => {
  return feedbackTypeMap[type]?.name || '其他'
}

const getFeedbackTypeTag = (type: FeedbackItem['type']) => {
  return feedbackTypeMap[type]?.tag || 'info'
}

// 事件处理
const handleFeedbackClick = (feedback: FeedbackItem) => {
  emit('feedback-click', feedback)
  
  // 如果未读，标记为已读
  if (!feedback.isRead) {
    handleMarkRead(feedback)
  }
}

const handleMarkAllRead = () => {
  emit('mark-all-read')
  ElMessage.success('已标记全部反馈为已读')
}

const handleMarkRead = (feedback: FeedbackItem) => {
  emit('mark-read', feedback)
  feedback.isRead = true
}

const handleReply = (feedback: FeedbackItem) => {
  selectedFeedback.value = feedback
  replyContent.value = ''
  replyDialogVisible.value = true
}

const handleAction = (feedback: FeedbackItem, action: string) => {
  emit('action', feedback, action)
  
  switch (action) {
    case 'mark-read':
      handleMarkRead(feedback)
      ElMessage.success('已标记为已读')
      break
    case 'forward':
      ElMessage.success('已转发给相关部门')
      break
    case 'priority':
      ElMessage.success('已设为重要反馈')
      break
    case 'archive':
      ElMessage.success('已归档')
      break
  }
}

const handleViewAll = () => {
  emit('view-all')
  router.push('/system/feedback')
}

const handleReplyDialogClose = () => {
  replyDialogVisible.value = false
  selectedFeedback.value = null
  replyContent.value = ''
}

const useTemplate = (template: string) => {
  replyContent.value = template
}

const handleSendReply = () => {
  if (!selectedFeedback.value || !replyContent.value.trim()) return
  
  emit('reply', selectedFeedback.value, replyContent.value.trim())
  ElMessage.success('回复发送成功')
  
  replyDialogVisible.value = false
  selectedFeedback.value = null
  replyContent.value = ''
}
</script>

<style scoped>
.feedback-card {
  height: 500px;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}

.header-left {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.unread-badge {
  position: relative;
  top: -2px;
}

.card-subtitle {
  display: block;
  line-height: 1.4;
}

.header-actions {
  flex-shrink: 0;
  display: flex;
  gap: var(--spacing-xs);
}

.feedback-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.feedback-loading {
  flex: 1;
  padding: var(--spacing-md) 0;
}

.skeleton-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.feedback-error, .feedback-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feedback-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-xs) 0;
}

.feedback-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-medium);
  border: 1px solid var(--color-border-light);
  background: var(--color-bg-card);
}

.feedback-item:hover {
  background: var(--color-bg-light);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-card);
}

.feedback-item.unread {
  background: linear-gradient(to right, var(--color-primary-light), var(--color-bg-card));
  border-left: 4px solid var(--color-primary);
}

.feedback-avatar {
  position: relative;
  flex-shrink: 0;
}

.user-avatar {
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
}

.unread-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: var(--color-danger);
  border: 2px solid #fff;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.feedback-content {
  flex: 1;
  min-width: 0;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.user-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.vip-tag {
  font-size: 10px;
  padding: 2px 6px;
  height: 18px;
}

.feedback-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.feedback-time {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.type-tag {
  font-size: 10px;
  padding: 2px 6px;
  height: 18px;
}

.feedback-text {
  font-size: 14px;
  color: var(--color-text-primary);
  line-height: 1.5;
  margin-bottom: var(--spacing-sm);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.feedback-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-sm);
}

.action-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.feedback-rating {
  flex-shrink: 0;
}

.feedback-tags {
  display: flex;
  gap: var(--spacing-xs);
}

.tag-item {
  font-size: 10px;
  padding: 2px 6px;
  height: 18px;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.feedback-footer {
  padding: var(--spacing-md) 0;
  text-align: center;
  border-top: 1px solid var(--color-border-light);
  margin-top: var(--spacing-md);
}

.view-more-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 14px;
}

/* 对话框样式 */
.reply-dialog-content {
  padding: var(--spacing-md) 0;
}

.original-feedback {
  background: var(--color-bg-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.original-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.original-info {
  display: flex;
  flex-direction: column;
}

.original-user {
  font-weight: 600;
  color: var(--color-text-primary);
}

.original-time {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.original-content {
  font-size: 14px;
  color: var(--color-text-primary);
  line-height: 1.6;
}

.reply-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.reply-templates {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.templates-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .feedback-item {
    padding: var(--spacing-md);
  }
  
  .feedback-header {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .feedback-actions {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }
  
  .action-left {
    justify-content: space-between;
  }
}

/* 滚动条样式 */
.feedback-list::-webkit-scrollbar {
  width: 4px;
}

.feedback-list::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 2px;
}

.feedback-list::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-dark);
}
</style>