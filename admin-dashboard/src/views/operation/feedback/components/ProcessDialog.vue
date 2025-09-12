<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="600px"
    :before-close="handleClose"
  >
    <div v-if="feedback" class="dialog-content">
      <!-- 反馈基本信息 -->
      <div class="feedback-info">
        <h4>反馈信息</h4>
        <div class="info-item">
          <span class="label">标题：</span>
          <span>{{ feedback.title }}</span>
        </div>
        <div class="info-item">
          <span class="label">类型：</span>
          <el-tag :type="feedback.type === 'problem' ? 'danger' : 'primary'">
            {{ getTypeLabel(feedback.type) }}
          </el-tag>
        </div>
        <div class="info-item">
          <span class="label">提交人：</span>
          <span>{{ feedback.submitterName }}</span>
        </div>
        <div class="info-item">
          <span class="label">当前状态：</span>
          <el-tag :color="getStatusConfig(feedback.status)?.color">
            {{ getStatusConfig(feedback.status)?.label }}
          </el-tag>
        </div>
        <div class="info-item">
          <span class="label">优先级：</span>
          <el-tag :color="getPriorityConfig(feedback.priority)?.color" size="small">
            {{ getPriorityConfig(feedback.priority)?.label }}
          </el-tag>
        </div>
      </div>

      <el-divider />

      <!-- 处理表单 -->
      <div class="process-form">
        <el-tabs v-model="activeTab" type="card">
          <!-- 分配处理人 -->
          <el-tab-pane label="分配处理人" name="assign">
            <el-form :model="assignForm" label-width="100px">
              <el-form-item label="选择处理人" required>
                <el-select
                  v-model="assignForm.processerId"
                  placeholder="请选择处理人"
                  style="width: 100%"
                >
                  <el-option
                    v-for="processor in availableProcessors"
                    :key="processor.id"
                    :label="`${processor.name}${processor.department ? ' (' + processor.department + ')' : ''}`"
                    :value="processor.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="分配说明">
                <el-input
                  v-model="assignForm.note"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入分配说明（可选）"
                />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 更新状态 -->
          <el-tab-pane label="更新状态" name="status">
            <el-form :model="statusForm" label-width="100px">
              <el-form-item label="新状态" required>
                <el-select
                  v-model="statusForm.status"
                  placeholder="请选择新状态"
                  style="width: 100%"
                >
                  <el-option
                    v-for="option in statusOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="处理说明" required>
                <el-input
                  v-model="statusForm.processNote"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入处理说明（必填）"
                />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 设置优先级 -->
          <el-tab-pane label="设置优先级" name="priority">
            <el-form :model="priorityForm" label-width="100px">
              <el-form-item label="优先级" required>
                <el-radio-group v-model="priorityForm.priority">
                  <el-radio
                    v-for="option in priorityOptions"
                    :key="option.value"
                    :label="option.value"
                    border
                    style="margin-bottom: 8px; width: 100px;"
                  >
                    <el-tag :color="option.color" size="small">
                      {{ option.label }}
                    </el-tag>
                  </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="调整原因">
                <el-input
                  v-model="priorityForm.reason"
                  type="textarea"
                  :rows="3"
                  placeholder="请说明优先级调整原因（可选）"
                />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 快速回复 -->
          <el-tab-pane label="快速回复" name="reply">
            <el-form :model="replyForm" label-width="100px">
              <el-form-item label="回复模板">
                <el-select
                  v-model="selectedTemplate"
                  placeholder="选择回复模板"
                  style="width: 100%"
                  @change="handleTemplateChange"
                  clearable
                >
                  <el-option
                    v-for="template in replyTemplates"
                    :key="template.id"
                    :label="template.title"
                    :value="template.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="回复内容" required>
                <el-input
                  v-model="replyForm.content"
                  type="textarea"
                  :rows="5"
                  placeholder="请输入回复内容"
                />
              </el-form-item>
              <el-form-item>
                <el-checkbox v-model="replyForm.sendNotification">
                  发送站内信通知用户
                </el-checkbox>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ submitButtonText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useFeedbackManagementStore } from '@/stores/feedbackManagement'
import { storeToRefs } from 'pinia'
import type {
  FeedbackItem,
  AssignFormData,
  ProcessFormData,
  ReplyFormData,
  FeedbackPriority
} from '@/types/feedbackManagement'

interface Props {
  visible: boolean
  feedback: FeedbackItem | null
  mode: 'assign' | 'status' | 'priority' | 'reply'
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const feedbackStore = useFeedbackManagementStore()

const {
  availableProcessors,
  statusOptions,
  priorityOptions,
  getTypeLabel,
  getStatusConfig,
  getPriorityConfig
} = storeToRefs(feedbackStore)

const activeTab = ref(props.mode)
const submitting = ref(false)
const selectedTemplate = ref<number>()

const assignForm = ref<AssignFormData>({
  processerId: 0,
  note: ''
})

const statusForm = ref<ProcessFormData>({
  status: undefined,
  processNote: ''
})

const priorityForm = ref<{
  priority: FeedbackPriority
  reason: string
}>({
  priority: 'medium',
  reason: ''
})

const replyForm = ref<ReplyFormData>({
  content: '',
  sendNotification: true
})

const replyTemplates = ref([
  {
    id: 1,
    title: '问题已收到',
    content: '感谢您的反馈，我们已经收到您提交的问题，将尽快为您处理。'
  },
  {
    id: 2,
    title: '问题已解决',
    content: '您反馈的问题已经得到解决，感谢您的耐心等待。如有其他问题，请随时联系我们。'
  },
  {
    id: 3,
    title: '需要更多信息',
    content: '为了更好地帮助您解决问题，我们需要您提供更多详细信息。请您补充相关描述。'
  },
  {
    id: 4,
    title: '建议已采纳',
    content: '感谢您的宝贵建议，我们已将其纳入产品规划中，会在后续版本中考虑实现。'
  }
])

const dialogTitle = computed(() => {
  const titles = {
    assign: '分配处理人',
    status: '更新处理状态',
    priority: '设置优先级',
    reply: '快速回复'
  }
  return titles[activeTab.value] || '处理反馈'
})

const submitButtonText = computed(() => {
  const texts = {
    assign: '分配',
    status: '更新状态',
    priority: '设置优先级',
    reply: '发送回复'
  }
  return texts[activeTab.value] || '提交'
})

const handleTemplateChange = (templateId: number) => {
  const template = replyTemplates.value.find(t => t.id === templateId)
  if (template) {
    replyForm.value.content = template.content
  }
}

const resetForms = () => {
  assignForm.value = { processerId: 0, note: '' }
  statusForm.value = { status: undefined, processNote: '' }
  priorityForm.value = { priority: 'medium', reason: '' }
  replyForm.value = { content: '', sendNotification: true }
  selectedTemplate.value = undefined
}

const handleClose = () => {
  resetForms()
  emit('update:visible', false)
}

const validateForm = () => {
  switch (activeTab.value) {
    case 'assign':
      if (!assignForm.value.processerId) {
        ElMessage.warning('请选择处理人')
        return false
      }
      break
    case 'status':
      if (!statusForm.value.status) {
        ElMessage.warning('请选择新状态')
        return false
      }
      if (!statusForm.value.processNote.trim()) {
        ElMessage.warning('请输入处理说明')
        return false
      }
      break
    case 'priority':
      if (!priorityForm.value.priority) {
        ElMessage.warning('请选择优先级')
        return false
      }
      break
    case 'reply':
      if (!replyForm.value.content.trim()) {
        ElMessage.warning('请输入回复内容')
        return false
      }
      break
  }
  return true
}

const handleSubmit = async () => {
  if (!props.feedback || !validateForm()) {
    return
  }

  try {
    submitting.value = true

    switch (activeTab.value) {
      case 'assign':
        await feedbackStore.assignFeedback(props.feedback.id, assignForm.value)
        break
      case 'status':
        await feedbackStore.updateFeedbackStatus(props.feedback.id, statusForm.value)
        break
      case 'priority':
        await feedbackStore.updateFeedbackPriority(props.feedback.id, priorityForm.value.priority)
        break
      case 'reply':
        await feedbackStore.replyToUser(props.feedback.id, replyForm.value)
        break
    }

    emit('success')
    handleClose()
  } catch (error) {
    console.error('处理失败:', error)
  } finally {
    submitting.value = false
  }
}

watch(
  () => props.mode,
  (newMode) => {
    activeTab.value = newMode
  }
)

watch(
  () => props.feedback,
  (newFeedback) => {
    if (newFeedback) {
      priorityForm.value.priority = newFeedback.priority
    }
  }
)
</script>

<style scoped>
.dialog-content {
  max-height: 600px;
  overflow-y: auto;
}

.feedback-info {
  margin-bottom: 20px;
}

.feedback-info h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.label {
  width: 80px;
  color: #606266;
  font-weight: 500;
}

.process-form {
  margin-top: 20px;
}

.dialog-footer {
  text-align: right;
}

:deep(.el-tabs__content) {
  min-height: 200px;
}

:deep(.el-radio.is-bordered) {
  margin-right: 8px;
  margin-bottom: 8px;
}
</style>