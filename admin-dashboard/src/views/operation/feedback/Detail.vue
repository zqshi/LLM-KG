<template>
  <div class="feedback-detail-page">
    <div class="page-header">
      <div class="page-header-left">
        <el-button @click="goBack" :icon="ArrowLeft" circle />
        <div style="margin-left: 12px">
          <h1>反馈详情</h1>
          <p>查看和处理用户反馈详情</p>
        </div>
      </div>
    </div>

    <div v-loading="detailLoading" class="detail-content">
      <div v-if="currentFeedback">
        <el-row :gutter="24">
          <!-- 左侧：反馈信息 -->
          <el-col :span="16">
            <el-card class="feedback-info-card">
              <div class="info-section">
                <div class="info-row">
                  <label>反馈ID：</label>
                  <span>{{ currentFeedback.id }}</span>
                </div>
                
                <div class="info-row">
                  <label>反馈类型：</label>
                  <el-tag :type="currentFeedback.type === 'problem' ? 'danger' : 'primary'">
                    {{ getTypeLabel(currentFeedback.type) }}
                  </el-tag>
                </div>
                
                <div class="info-row">
                  <label>提交人：</label>
                  <span>{{ currentFeedback.submitterName }}</span>
                </div>
                
                <div class="info-row">
                  <label>提交时间：</label>
                  <span>{{ formatDateTime(currentFeedback.createTime) }}</span>
                </div>
                
                <div class="info-row" v-if="currentFeedback.submitterEmail">
                  <label>联系邮箱：</label>
                  <span>{{ currentFeedback.submitterEmail }}</span>
                </div>
                
                <div class="info-row" v-if="currentFeedback.submitterPhone">
                  <label>联系电话：</label>
                  <span>{{ currentFeedback.submitterPhone }}</span>
                </div>
                
                <div class="info-row" v-if="currentFeedback.relatedModule">
                  <label>关联模块：</label>
                  <span>{{ currentFeedback.relatedModule }}</span>
                </div>
              </div>
              
              <el-divider />
              
              <div class="feedback-content">
                <h3>{{ currentFeedback.title }}</h3>
                <div class="content-text">{{ currentFeedback.content }}</div>
              </div>
              
              <!-- 附件列表 -->
              <div v-if="currentFeedback.attachments.length > 0" class="attachments">
                <el-divider />
                <h4>附件列表</h4>
                <div class="attachment-list">
                  <div
                    v-for="attachment in currentFeedback.attachments"
                    :key="attachment.id"
                    class="attachment-item"
                  >
                    <el-icon><Document /></el-icon>
                    <span class="attachment-name">{{ attachment.name }}</span>
                    <span class="attachment-size">({{ formatFileSize(attachment.size) }})</span>
                    <el-button 
                      size="small" 
                      @click="downloadAttachment(attachment.id, attachment.name)"
                    >
                      下载
                    </el-button>
                  </div>
                </div>
              </div>
            </el-card>
            
            <!-- 处理记录时间线 -->
            <el-card class="timeline-card">
              <template #header>
                <div class="card-header">
                  <span>处理记录时间线</span>
                </div>
              </template>
              
              <el-timeline>
                <!-- 处理记录 -->
                <el-timeline-item
                  v-for="record in currentFeedback.processRecords"
                  :key="record.id"
                  :timestamp="formatDateTime(record.createTime)"
                  placement="top"
                >
                  <div class="timeline-content">
                    <div class="timeline-title">{{ record.actionDescription }}</div>
                    <div class="timeline-operator">操作人：{{ record.operatorName }}</div>
                    <div v-if="record.detail" class="timeline-detail">{{ record.detail }}</div>
                    <div v-if="record.oldValue && record.newValue" class="timeline-change">
                      <span class="old-value">{{ record.oldValue }}</span>
                      <el-icon><Right /></el-icon>
                      <span class="new-value">{{ record.newValue }}</span>
                    </div>
                  </div>
                </el-timeline-item>
                
                <!-- 内部评论 -->
                <el-timeline-item
                  v-for="comment in currentFeedback.internalComments"
                  :key="`comment-${comment.id}`"
                  :timestamp="formatDateTime(comment.createTime)"
                  placement="top"
                  color="#909399"
                >
                  <div class="timeline-content comment">
                    <div class="timeline-title">内部评论</div>
                    <div class="timeline-operator">评论人：{{ comment.authorName }}</div>
                    <div class="comment-content">{{ comment.content }}</div>
                  </div>
                </el-timeline-item>
                
                <!-- 用户回复 -->
                <el-timeline-item
                  v-for="reply in currentFeedback.userReplies"
                  :key="`reply-${reply.id}`"
                  :timestamp="formatDateTime(reply.createTime)"
                  placement="top"
                  color="#67c23a"
                >
                  <div class="timeline-content reply">
                    <div class="timeline-title">回复用户</div>
                    <div class="timeline-operator">回复人：{{ reply.senderName }}</div>
                    <div class="reply-content">{{ reply.content }}</div>
                    <div class="notification-status">
                      <el-tag :type="reply.notificationSent ? 'success' : 'warning'" size="small">
                        {{ reply.notificationSent ? '已通知' : '待通知' }}
                      </el-tag>
                    </div>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </el-card>
          </el-col>
          
          <!-- 右侧：处理交互区 -->
          <el-col :span="8">
            <el-card class="action-card">
              <template #header>
                <div class="card-header">
                  <span>处理交互区</span>
                </div>
              </template>
              
              <!-- 当前状态显示 -->
              <div class="current-status">
                <div class="status-item">
                  <label>当前状态：</label>
                  <el-tag :color="getStatusConfig(currentFeedback.status)?.color">
                    {{ getStatusConfig(currentFeedback.status)?.label }}
                  </el-tag>
                </div>
                
                <div class="status-item">
                  <label>优先级：</label>
                  <el-tag :color="getPriorityConfig(currentFeedback.priority)?.color" size="small">
                    {{ getPriorityConfig(currentFeedback.priority)?.label }}
                  </el-tag>
                </div>
                
                <div class="status-item">
                  <label>处理人：</label>
                  <span>{{ currentFeedback.processerName || '未分配' }}</span>
                </div>
              </div>
              
              <el-divider />
              
              <!-- 分配处理人 -->
              <div class="action-section">
                <h4>分配处理人</h4>
                <el-form :model="assignForm" @submit.prevent="handleAssign">
                  <el-form-item>
                    <el-select v-model="assignForm.processerId" placeholder="选择处理人" style="width: 100%">
                      <el-option
                        v-for="processor in availableProcessors"
                        :key="processor.id"
                        :label="processor.name"
                        :value="processor.id"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item>
                    <el-input
                      v-model="assignForm.note"
                      type="textarea"
                      :rows="2"
                      placeholder="分配说明（可选）"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="handleAssign" style="width: 100%">
                      分配
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>
              
              <!-- 设置优先级 -->
              <div class="action-section">
                <h4>设置优先级</h4>
                <div style="margin-bottom: 16px">
                  <el-radio-group 
                    v-model="selectedPriority" 
                    @change="(val) => handlePriorityChange(val as FeedbackPriority)"
                    style="display: flex; flex-direction: column; gap: 8px"
                  >
                    <el-radio 
                      v-for="option in priorityOptions" 
                      :key="option.value"
                      :label="option.value"
                      border
                    >
                      <span :style="{ color: option.color }">{{ option.label }}</span>
                    </el-radio>
                  </el-radio-group>
                </div>
              </div>
              
              <!-- 更新状态 -->
              <div class="action-section">
                <h4>更新状态</h4>
                <el-form :model="statusForm" @submit.prevent="handleStatusUpdate">
                  <el-form-item>
                    <el-select v-model="statusForm.status" placeholder="选择状态" style="width: 100%">
                      <el-option
                        v-for="option in statusOptions.filter(opt => currentFeedback && opt.value !== currentFeedback.status)"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item>
                    <el-input
                      v-model="statusForm.processNote"
                      type="textarea"
                      :rows="3"
                      placeholder="处理说明"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="handleStatusUpdate" style="width: 100%">
                      更新状态
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>
              
              <!-- 内部评论 -->
              <div class="action-section">
                <h4>内部评论</h4>
                <el-form :model="commentForm" @submit.prevent="handleAddComment">
                  <el-form-item>
                    <el-input
                      v-model="commentForm.content"
                      type="textarea"
                      :rows="3"
                      placeholder="添加内部评论..."
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button @click="handleAddComment" style="width: 100%">
                      添加评论
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>
              
              <!-- 回复用户 -->
              <div class="action-section">
                <h4>回复用户</h4>
                <el-form :model="replyForm" @submit.prevent="handleReplyUser">
                  <el-form-item>
                    <el-input
                      v-model="replyForm.content"
                      type="textarea"
                      :rows="4"
                      placeholder="编写回复内容..."
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-checkbox v-model="replyForm.sendNotification">
                      发送站内信通知
                    </el-checkbox>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="success" @click="handleReplyUser" style="width: 100%">
                      发送回复
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFeedbackManagementStore } from '@/stores/feedbackManagement'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Document, Right } from '@element-plus/icons-vue'
import type { AssignFormData, ProcessFormData, CommentFormData, ReplyFormData, FeedbackPriority, FeedbackType, FeedbackStatus } from '@/types/feedbackManagement'

const route = useRoute()
const router = useRouter()
const feedbackStore = useFeedbackManagementStore()

// 直接从store获取函数，而不是通过storeToRefs
const {
  currentFeedback,
  availableProcessors,
  detailLoading,
  statusOptions,
  priorityOptions
} = storeToRefs(feedbackStore)

// 直接从store获取函数
const getTypeLabel = (type: FeedbackType) => feedbackStore.getTypeLabel(type)
const getStatusConfig = (status: FeedbackStatus) => feedbackStore.getStatusConfig(status)
const getPriorityConfig = (priority: FeedbackPriority) => feedbackStore.getPriorityConfig(priority)

const feedbackId = computed(() => Number(route.params.id))
const selectedPriority = ref<FeedbackPriority>()

const assignForm = ref<AssignFormData>({
  processerId: 0,
  note: ''
})

const statusForm = ref<ProcessFormData>({
  status: undefined,
  processNote: ''
})

const commentForm = ref<CommentFormData>({
  content: ''
})

const replyForm = ref<ReplyFormData>({
  content: '',
  sendNotification: true
})

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const goBack = () => {
  router.push({ name: 'FeedbackManagement' })
}

const handleAssign = async () => {
  if (!assignForm.value.processerId) {
    ElMessage.warning('请选择处理人')
    return
  }
  
  await feedbackStore.assignFeedback(feedbackId.value, assignForm.value)
  assignForm.value = { processerId: 0, note: '' }
}

const handlePriorityChange = async (priority: FeedbackPriority) => {
  await feedbackStore.updateFeedbackPriority(feedbackId.value, priority)
}

const handleStatusUpdate = async () => {
  if (!statusForm.value.status) {
    ElMessage.warning('请选择状态')
    return
  }
  
  if (!statusForm.value.processNote.trim()) {
    ElMessage.warning('请填写处理说明')
    return
  }
  
  await feedbackStore.updateFeedbackStatus(feedbackId.value, statusForm.value)
  statusForm.value = { status: undefined, processNote: '' }
}

const handleAddComment = async () => {
  if (!commentForm.value.content.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  
  await feedbackStore.addInternalComment(feedbackId.value, commentForm.value)
  commentForm.value = { content: '' }
}

const handleReplyUser = async () => {
  if (!replyForm.value.content.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  
  await feedbackStore.replyToUser(feedbackId.value, replyForm.value)
  replyForm.value = { content: '', sendNotification: true }
}

const downloadAttachment = async (attachmentId: number, filename: string) => {
  await feedbackStore.downloadAttachment(attachmentId, filename)
}

onMounted(async () => {
  await Promise.all([
    feedbackStore.loadFeedbackDetail(feedbackId.value),
    feedbackStore.loadAvailableProcessors()
  ])
  
  if (currentFeedback.value) {
    selectedPriority.value = currentFeedback.value.priority
  }
})

// 组件卸载时清理资源
onUnmounted(() => {
  // 清理表单数据
  assignForm.value = { processerId: 0, note: '' }
  statusForm.value = { status: undefined, processNote: '' }
  commentForm.value = { content: '' }
  replyForm.value = { content: '', sendNotification: true }
  selectedPriority.value = undefined
})
</script>

<style scoped>
.feedback-detail-page {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
}

.page-header-left {
  display: flex;
  align-items: center;
}

.page-header-left h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.page-header-left p {
  margin: 8px 0 0 0;
  color: #606266;
  font-size: 14px;
}

.detail-content {
  min-height: 600px;
}

.feedback-info-card,
.timeline-card,
.action-card {
  margin-bottom: 16px;
}

.card-header {
  font-weight: 600;
  color: #303133;
}

.info-section {
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.info-row label {
  width: 100px;
  color: #606266;
  font-weight: 500;
}

.feedback-content h3 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.content-text {
  line-height: 1.6;
  color: #606266;
  white-space: pre-wrap;
}

.attachments h4 {
  margin: 16px 0 12px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  gap: 8px;
}

.attachment-name {
  flex: 1;
  color: #303133;
}

.attachment-size {
  color: #909399;
  font-size: 12px;
}

.timeline-content {
  padding: 8px 0;
}

.timeline-title {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.timeline-operator {
  color: #909399;
  font-size: 12px;
  margin-bottom: 8px;
}

.timeline-detail,
.comment-content,
.reply-content {
  color: #606266;
  line-height: 1.5;
  margin-bottom: 8px;
}

.timeline-change {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.old-value {
  color: #f56c6c;
  text-decoration: line-through;
}

.new-value {
  color: #67c23a;
  font-weight: 600;
}

.action-section {
  margin-bottom: 24px;
}

.action-section h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.status-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.status-item label {
  width: 80px;
  color: #606266;
  font-weight: 500;
}

.notification-status {
  margin-top: 8px;
}
</style>