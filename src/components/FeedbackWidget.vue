<template>
  <div class="feedback-widget">
    <!-- 反馈按钮 -->
    <el-button
      v-if="!showFeedbackForm"
      class="feedback-trigger"
      circle
      size="large"
      type="primary"
      @click="openFeedbackForm"
      :aria-label="'打开反馈表单'"
    >
      <el-icon size="20">
        <MessageBox />
      </el-icon>
    </el-button>

    <!-- 反馈表单 -->
    <el-card
      v-show="showFeedbackForm"
      class="feedback-form-card animate-scale-in"
      shadow="always"
    >
      <template #header>
        <div class="feedback-header">
          <span class="feedback-title">用户反馈</span>
          <el-button
            circle
            size="small"
            @click="closeFeedbackForm"
            aria-label="关闭反馈表单"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </template>

      <el-form
        ref="feedbackFormRef"
        :model="feedbackForm"
        :rules="feedbackRules"
        label-width="80px"
        size="small"
      >
        <el-form-item label="反馈类型" prop="type">
          <el-select
            v-model="feedbackForm.type"
            placeholder="请选择反馈类型"
            style="width: 100%"
          >
            <el-option label="问题反馈" value="bug" />
            <el-option label="功能建议" value="feature" />
            <el-option label="体验改进" value="improvement" />
            <el-option label="其他" value="general" />
          </el-select>
        </el-form-item>

        <el-form-item label="反馈标题" prop="title">
          <el-input
            v-model="feedbackForm.title"
            placeholder="请简要描述您的反馈"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="详细描述" prop="content">
          <el-input
            v-model="feedbackForm.content"
            type="textarea"
            placeholder="请详细描述您的问题或建议"
            :rows="4"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="体验评分">
          <el-rate
            v-model="feedbackForm.rating"
            :max="5"
            show-text
            :texts="['很差', '较差', '一般', '较好', '很好']"
          />
        </el-form-item>

        <el-form-item class="form-actions">
          <el-button @click="closeFeedbackForm">取消</el-button>
          <el-button
            type="primary"
            @click="submitFeedback"
            :loading="submitting"
            class="btn-gradient"
          >
            提交反馈
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 成功提示 -->
    <el-card
      v-show="showSuccessMessage"
      class="success-message animate-fade-in"
      shadow="always"
    >
      <div class="success-content">
        <el-icon size="32" color="#67c23a">
          <CircleCheck />
        </el-icon>
        <p>感谢您的反馈！</p>
        <p class="success-subtitle">我们会认真处理您的建议</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useFeedbackStore } from '@/stores/feedback'
import { MessageBox, Close, CircleCheck } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const feedbackStore = useFeedbackStore()

const showFeedbackForm = ref(false)
const showSuccessMessage = ref(false)
const submitting = ref(false)
const feedbackFormRef = ref<FormInstance>()

const feedbackForm = reactive({
  type: 'general' as 'bug' | 'feature' | 'improvement' | 'general',
  title: '',
  content: '',
  rating: 5
})

const feedbackRules: FormRules = {
  type: [
    { required: true, message: '请选择反馈类型', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入反馈标题', trigger: 'blur' },
    { min: 5, max: 50, message: '标题长度在 5 到 50 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入详细描述', trigger: 'blur' },
    { min: 10, max: 500, message: '描述长度在 10 到 500 个字符', trigger: 'blur' }
  ]
}

const openFeedbackForm = () => {
  showFeedbackForm.value = true
  showSuccessMessage.value = false
  
  // 记录用户行为
  feedbackStore.trackUserAction('feedback_form_opened')
}

const closeFeedbackForm = () => {
  showFeedbackForm.value = false
  resetForm()
}

const resetForm = () => {
  Object.assign(feedbackForm, {
    type: 'general',
    title: '',
    content: '',
    rating: 5
  })
  feedbackFormRef.value?.resetFields()
}

const submitFeedback = () => {
  if (!feedbackFormRef.value) return

  feedbackFormRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true

      // 模拟提交延迟
      setTimeout(() => {
        const feedbackId = feedbackStore.addFeedback({
          type: feedbackForm.type,
          title: feedbackForm.title,
          content: feedbackForm.content,
          rating: feedbackForm.rating
        })

        // 记录用户行为
        feedbackStore.trackUserAction('feedback_submitted', {
          feedbackId,
          type: feedbackForm.type,
          rating: feedbackForm.rating
        })

        submitting.value = false
        showFeedbackForm.value = false
        showSuccessMessage.value = true

        ElMessage.success('反馈提交成功，感谢您的建议！')

        // 3秒后隐藏成功消息
        setTimeout(() => {
          showSuccessMessage.value = false
          resetForm()
        }, 3000)
      }, 1000)
    }
  })
}
</script>

<style scoped>
.feedback-widget {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 1000;
}

.feedback-trigger {
  width: 56px;
  height: 56px;
  background: var(--gradient-primary);
  border: none;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  transition: all var(--transition-medium);
}

.feedback-trigger:hover {
  transform: scale(1.1) translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.feedback-form-card,
.success-message {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.feedback-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.form-actions {
  margin-bottom: 0;
  text-align: right;
}

.form-actions .el-form-item__content {
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--spacing-lg);
}

.success-content p {
  margin: var(--spacing-sm) 0 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.success-subtitle {
  font-size: 14px !important;
  font-weight: 400 !important;
  color: var(--color-text-secondary) !important;
  margin-top: var(--spacing-xs) !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .feedback-widget {
    bottom: 20px;
    right: 20px;
  }

  .feedback-form-card,
  .success-message {
    width: calc(100vw - 40px);
    right: -280px;
  }

  .feedback-trigger {
    width: 48px;
    height: 48px;
  }
}

/* 动画效果 */
.animate-scale-in {
  animation: scaleIn 0.3s ease-out;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>