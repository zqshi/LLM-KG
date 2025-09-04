<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="800px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @closed="handleClosed"
    class="review-dialog"
  >
    <div class="review-content">
      <!-- 名言内容展示 -->
      <div class="quotation-display">
        <div class="quotation-header">
          <h4>名言内容</h4>
          <el-tag :type="getStatusType(quotation.status)" size="small">
            {{ getStatusText(quotation.status) }}
          </el-tag>
        </div>
        
        <div class="quotation-content">
          <div class="quote-text" v-html="quotation.contentHtml || quotation.content"></div>
          
          <div class="quote-meta">
            <div class="author-info">
              <el-avatar :size="32" :src="quotation.leader?.avatar">
                {{ quotation.leader?.name?.charAt(0) }}
              </el-avatar>
              <div class="author-details">
                <div class="author-name">{{ quotation.leader?.name }}</div>
                <div class="author-title">{{ quotation.leader?.title || '领导' }}</div>
              </div>
            </div>
            
            <div class="quote-occasion" v-if="quotation.occasion">
              <el-icon><LocationInformation /></el-icon>
              <span>{{ quotation.occasion }}</span>
            </div>
          </div>

          <div class="quote-tags" v-if="quotation.tags?.length">
            <el-tag 
              v-for="tag in quotation.tags" 
              :key="tag" 
              size="small" 
              effect="plain"
            >
              {{ tag }}
            </el-tag>
          </div>

          <div class="quote-background" v-if="quotation.background">
            <div class="background-label">背景说明：</div>
            <div class="background-text">{{ quotation.background }}</div>
          </div>
        </div>
      </div>

      <!-- 审核操作选择 -->
      <div class="review-actions">
        <el-radio-group v-model="reviewAction" @change="handleActionChange">
          <el-radio value="approve" class="action-approve">
            <div class="action-content">
              <el-icon class="action-icon"><CircleCheck /></el-icon>
              <div class="action-text">
                <div class="action-title">通过审核</div>
                <div class="action-desc">名言内容符合要求，可以发布</div>
              </div>
            </div>
          </el-radio>
          
          <el-radio value="revision" class="action-revision">
            <div class="action-content">
              <el-icon class="action-icon"><EditPen /></el-icon>
              <div class="action-text">
                <div class="action-title">要求修正</div>
                <div class="action-desc">需要修改后重新提交审核</div>
              </div>
            </div>
          </el-radio>
          
          <el-radio value="reject" class="action-reject">
            <div class="action-content">
              <el-icon class="action-icon"><CircleClose /></el-icon>
              <div class="action-text">
                <div class="action-title">拒绝发布</div>
                <div class="action-desc">名言内容不符合要求，拒绝发布</div>
              </div>
            </div>
          </el-radio>
        </el-radio-group>
      </div>

      <!-- 审核意见 -->
      <div class="review-comment">
        <el-form :model="reviewForm" :rules="reviewRules" ref="reviewFormRef">
          <el-form-item 
            :label="commentLabel" 
            prop="comment"
            :required="reviewAction !== 'approve'"
          >
            <el-input
              v-model="reviewForm.comment"
              type="textarea"
              :rows="4"
              :placeholder="commentPlaceholder"
              :maxlength="500"
              show-word-limit
            />
          </el-form-item>
          
          <!-- 修正建议模板 -->
          <div class="suggestion-templates" v-if="reviewAction === 'revision'">
            <div class="template-label">常用修正建议：</div>
            <div class="template-buttons">
              <el-button 
                v-for="template in revisionTemplates"
                :key="template"
                size="small"
                type="text"
                @click="insertTemplate(template)"
              >
                {{ template }}
              </el-button>
            </div>
          </div>

          <!-- 拒绝原因模板 -->
          <div class="suggestion-templates" v-if="reviewAction === 'reject'">
            <div class="template-label">常见拒绝原因：</div>
            <div class="template-buttons">
              <el-button 
                v-for="template in rejectTemplates"
                :key="template"
                size="small"
                type="text"
                @click="insertTemplate(template)"
              >
                {{ template }}
              </el-button>
            </div>
          </div>
        </el-form>
      </div>

      <!-- 历史审核记录 -->
      <div class="review-history" v-if="reviewHistory?.length">
        <el-divider>
          <el-icon><Clock /></el-icon>
          审核历史
        </el-divider>
        
        <el-timeline>
          <el-timeline-item
            v-for="(record, index) in reviewHistory"
            :key="index"
            :timestamp="formatTime(record.createTime)"
            :type="getTimelineType(record.operation)"
          >
            <div class="history-item">
              <div class="history-header">
                <span class="history-action">{{ getActionText(record.operation) }}</span>
                <span class="history-reviewer">{{ record.reviewer?.name }}</span>
              </div>
              <div class="history-comment" v-if="record.comment">
                {{ record.comment }}
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleConfirm"
          :loading="submitting"
          :disabled="!reviewAction"
        >
          确认{{ getActionText(reviewAction) }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { 
  LocationInformation,
  CircleCheck,
  EditPen,
  CircleClose,
  Clock
} from '@element-plus/icons-vue'
import type { Quotation, QuotationReviewLog, ReviewOperation } from '@/types'

interface Props {
  modelValue: boolean
  quotation: Quotation
  reviewHistory?: QuotationReviewLog[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', action: ReviewOperation, comment: string): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const reviewFormRef = ref<FormInstance>()
const reviewAction = ref<ReviewOperation>()
const submitting = ref(false)

const reviewForm = ref({
  comment: ''
})

const reviewRules: FormRules = {
  comment: [
    { 
      required: false, 
      validator: (rule, value, callback) => {
        if (reviewAction.value !== 'approve' && !value?.trim()) {
          callback(new Error('请填写审核意见'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    },
    { max: 500, message: '审核意见最多500个字符', trigger: 'blur' }
  ]
}

const revisionTemplates = [
  '内容表述不够准确，请核实后修正',
  '格式不符合规范，请调整格式',
  '标点符号使用有误，请检查',
  '时间或地点信息需要补充',
  '标签分类需要调整'
]

const rejectTemplates = [
  '内容与事实不符',
  '表述存在政治敏感问题',
  '格式严重不规范',
  '内容重复提交',
  '不符合发布标准'
]

const dialogTitle = computed(() => {
  return `审核名言 - ${props.quotation.leader?.name || '未知领导'}`
})

const commentLabel = computed(() => {
  switch (reviewAction.value) {
    case 'approve':
      return '审核意见（可选）'
    case 'revision':
      return '修正建议'
    case 'reject':
      return '拒绝原因'
    default:
      return '审核意见'
  }
})

const commentPlaceholder = computed(() => {
  switch (reviewAction.value) {
    case 'approve':
      return '可以添加审核通过的说明...'
    case 'revision':
      return '请详细说明需要修正的问题和建议...'
    case 'reject':
      return '请说明拒绝发布的具体原因...'
    default:
      return '请填写审核意见...'
  }
})

const getStatusType = (status: string) => {
  const statusMap = {
    draft: '',
    pending_review: 'warning',
    published: 'success',
    rejected: 'danger',
    archived: 'info'
  }
  return statusMap[status] || ''
}

const getStatusText = (status: string) => {
  const statusMap = {
    draft: '草稿',
    pending_review: '待审核',
    published: '已发布',
    rejected: '已拒绝',
    archived: '已归档'
  }
  return statusMap[status] || status
}

const getActionText = (action?: ReviewOperation) => {
  const actionMap = {
    approve: '通过',
    revision: '修正',
    reject: '拒绝'
  }
  return actionMap[action || ''] || ''
}

const getTimelineType = (operation: string) => {
  const typeMap = {
    approve: 'success',
    revision: 'warning',
    reject: 'danger',
    submit: 'primary'
  }
  return typeMap[operation] || 'primary'
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

const handleActionChange = (action: ReviewOperation) => {
  // 清空之前的意见
  reviewForm.value.comment = ''
}

const insertTemplate = (template: string) => {
  if (reviewForm.value.comment) {
    reviewForm.value.comment += '；' + template
  } else {
    reviewForm.value.comment = template
  }
}

const handleCancel = () => {
  emit('cancel')
  dialogVisible.value = false
}

const handleConfirm = async () => {
  if (!reviewAction.value) return

  // 表单验证
  if (reviewFormRef.value) {
    try {
      await reviewFormRef.value.validate()
    } catch {
      return
    }
  }

  submitting.value = true
  try {
    emit('confirm', reviewAction.value, reviewForm.value.comment)
  } finally {
    submitting.value = false
  }
}

const handleClosed = () => {
  // 重置表单
  reviewAction.value = undefined
  reviewForm.value.comment = ''
  if (reviewFormRef.value) {
    reviewFormRef.value.clearValidate()
  }
}

// 监听对话框打开状态
watch(dialogVisible, (visible) => {
  if (visible && !reviewAction.value) {
    // 默认选择通过
    reviewAction.value = 'approve'
  }
})
</script>

<style lang="scss" scoped>
.review-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
  }
}

.review-content {
  .quotation-display {
    margin-bottom: 24px;
    padding: 16px;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;

    .quotation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h4 {
        margin: 0;
        color: var(--el-text-color-primary);
      }
    }

    .quotation-content {
      .quote-text {
        font-size: 16px;
        line-height: 1.6;
        color: var(--el-text-color-primary);
        margin-bottom: 16px;
        padding: 12px;
        background: white;
        border-radius: 6px;
        border-left: 4px solid var(--el-color-primary);
      }

      .quote-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .author-info {
          display: flex;
          align-items: center;
          gap: 8px;

          .author-details {
            .author-name {
              font-weight: 600;
              color: var(--el-text-color-primary);
            }

            .author-title {
              font-size: 12px;
              color: var(--el-text-color-regular);
            }
          }
        }

        .quote-occasion {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--el-text-color-regular);
          font-size: 14px;
        }
      }

      .quote-tags {
        margin-bottom: 12px;

        .el-tag {
          margin-right: 8px;
        }
      }

      .quote-background {
        .background-label {
          font-weight: 600;
          margin-bottom: 4px;
          color: var(--el-text-color-regular);
        }

        .background-text {
          color: var(--el-text-color-regular);
          line-height: 1.5;
        }
      }
    }
  }

  .review-actions {
    margin-bottom: 24px;

    :deep(.el-radio-group) {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    :deep(.el-radio) {
      margin-right: 0;
      padding: 16px;
      border: 1px solid var(--el-border-color);
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        border-color: var(--el-color-primary);
      }

      &.is-checked {
        border-color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
      }
    }

    .action-content {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;

      .action-icon {
        font-size: 20px;
        flex-shrink: 0;
      }

      .action-text {
        .action-title {
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
        }

        .action-desc {
          font-size: 13px;
          color: var(--el-text-color-regular);
        }
      }
    }

    .action-approve .action-icon {
      color: var(--el-color-success);
    }

    .action-revision .action-icon {
      color: var(--el-color-warning);
    }

    .action-reject .action-icon {
      color: var(--el-color-danger);
    }
  }

  .review-comment {
    margin-bottom: 24px;

    .suggestion-templates {
      margin-top: 12px;

      .template-label {
        font-size: 13px;
        color: var(--el-text-color-regular);
        margin-bottom: 8px;
      }

      .template-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .el-button {
          height: auto;
          padding: 4px 8px;
          font-size: 12px;
          border: 1px dashed var(--el-border-color);
          
          &:hover {
            border-color: var(--el-color-primary);
            color: var(--el-color-primary);
          }
        }
      }
    }
  }

  .review-history {
    .history-item {
      .history-header {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 4px;

        .history-action {
          font-weight: 600;
        }

        .history-reviewer {
          color: var(--el-text-color-regular);
        }
      }

      .history-comment {
        color: var(--el-text-color-regular);
        font-size: 14px;
        line-height: 1.5;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .review-dialog {
    :deep(.el-dialog) {
      width: 95%;
      margin: 5vh auto;
    }
  }

  .review-content {
    .quotation-display .quote-meta {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  }
}
</style>