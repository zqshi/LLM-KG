<template>
  <el-form 
    ref="formRef"
    :model="formData" 
    :rules="formRules"
    label-width="100px"
    size="default"
    :disabled="readonly"
    class="quotation-form"
  >
    <el-form-item label="名言内容" prop="content" required>
      <el-input
        v-if="!richEditor"
        v-model="formData.content"
        type="textarea"
        :rows="6"
        placeholder="请输入领导名言内容..."
        :maxlength="1000"
        show-word-limit
        resize="vertical"
      />
      <div v-else class="rich-editor-container">
        <div 
          ref="editorRef"
          class="rich-editor"
          :contenteditable="!readonly"
          @input="handleEditorInput"
          @blur="handleEditorBlur"
          v-html="formData.contentHtml || formData.content"
        ></div>
        <div class="editor-toolbar" v-if="!readonly">
          <el-button-group size="small">
            <el-button @click="execCommand('bold')">
              <el-icon><FontSize /></el-icon>
            </el-button>
            <el-button @click="execCommand('italic')">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button @click="execCommand('underline')">
              <el-icon><Document /></el-icon>
            </el-button>
          </el-button-group>
        </div>
      </div>
    </el-form-item>

    <el-form-item label="领导人员" prop="leaderId" required>
      <el-select 
        v-model="formData.leaderId" 
        placeholder="请选择领导人员"
        filterable
        remote
        reserve-keyword
        :remote-method="searchLeaders"
        :loading="leadersLoading"
        style="width: 100%"
      >
        <el-option
          v-for="leader in leaderOptions"
          :key="leader.id"
          :label="`${leader.name} - ${leader.title || '领导'}`"
          :value="leader.id"
        >
          <div class="leader-option">
            <el-avatar :size="24" :src="leader.avatar">
              {{ leader.name.charAt(0) }}
            </el-avatar>
            <div class="leader-info">
              <span class="leader-name">{{ leader.name }}</span>
              <span class="leader-title">{{ leader.title || '领导' }}</span>
            </div>
          </div>
        </el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="讲话场合" prop="occasion">
      <el-input 
        v-model="formData.occasion"
        placeholder="如：年度工作会议、部门座谈会等"
        :maxlength="100"
        show-word-limit
      />
    </el-form-item>

    <el-form-item label="发生时间" prop="occurrenceTime">
      <el-date-picker
        v-model="formData.occurrenceTime"
        type="datetime"
        placeholder="选择讲话时间"
        format="YYYY-MM-DD HH:mm"
        value-format="YYYY-MM-DD HH:mm:ss"
        style="width: 100%"
      />
    </el-form-item>

    <el-form-item label="背景说明" prop="background">
      <el-input
        v-model="formData.background"
        type="textarea"
        :rows="3"
        placeholder="请简要说明讲话背景或上下文..."
        :maxlength="500"
        show-word-limit
        resize="vertical"
      />
    </el-form-item>

    <el-form-item label="标签" prop="tags">
      <el-tag
        v-for="(tag, index) in formData.tags"
        :key="index"
        closable
        @close="removeTag(index)"
        class="tag-item"
      >
        {{ tag }}
      </el-tag>
      <el-input
        v-if="inputVisible"
        ref="inputRef"
        v-model="inputValue"
        size="small"
        style="width: 100px"
        @keyup.enter="handleInputConfirm"
        @blur="handleInputConfirm"
      />
      <el-button v-else size="small" @click="showInput">
        + 添加标签
      </el-button>
    </el-form-item>

    <el-form-item label="状态" prop="status" v-if="showStatus">
      <el-radio-group v-model="formData.status">
        <el-radio value="draft">草稿</el-radio>
        <el-radio value="pending_review" v-if="canSubmitReview">待审核</el-radio>
        <el-radio value="published" v-if="canPublish">已发布</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item v-if="mode === 'revision'" label="修正说明" prop="revisionReason">
      <el-input
        v-model="formData.revisionReason"
        type="textarea"
        :rows="3"
        placeholder="请说明修正原因..."
        :maxlength="200"
        show-word-limit
      />
    </el-form-item>

    <div class="form-actions" v-if="showActions">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSaveDraft" :loading="saving">
        保存草稿
      </el-button>
      <el-button 
        type="success" 
        @click="handleSubmit" 
        :loading="submitting"
        v-if="canSubmitReview"
      >
        提交审核
      </el-button>
      <el-button 
        type="warning" 
        @click="handlePublish" 
        :loading="publishing"
        v-if="canPublish"
      >
        直接发布
      </el-button>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, watch, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { FontSize, Edit, Document } from '@element-plus/icons-vue'
import type { QuotationForm, User } from '@/types'
import { useQuotationStore } from '@/stores/quotation'
import { rbacApi } from '@/api'

interface Props {
  modelValue?: Partial<QuotationForm>
  mode?: 'create' | 'edit' | 'revision'
  readonly?: boolean
  richEditor?: boolean
  showStatus?: boolean
  showActions?: boolean
  canSubmitReview?: boolean
  canPublish?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: QuotationForm): void
  (e: 'submit', data: QuotationForm, action: 'draft' | 'review' | 'publish'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
  readonly: false,
  richEditor: false,
  showStatus: true,
  showActions: true,
  canSubmitReview: true,
  canPublish: false
})

const emit = defineEmits<Emits>()

const quotationStore = useQuotationStore()

const formRef = ref<FormInstance>()
const editorRef = ref<HTMLElement>()
const inputRef = ref()

const formData = reactive<QuotationForm>({
  content: '',
  contentHtml: '',
  leaderId: 0,
  occasion: '',
  occurrenceTime: '',
  background: '',
  tags: [],
  status: 'draft',
  revisionReason: '',
  ...(props.modelValue || {})
})

const formRules: FormRules = {
  content: [
    { required: true, message: '请输入名言内容', trigger: 'blur' },
    { min: 10, message: '名言内容至少10个字符', trigger: 'blur' },
    { max: 1000, message: '名言内容最多1000个字符', trigger: 'blur' }
  ],
  leaderId: [
    { required: true, message: '请选择领导人员', trigger: 'change' }
  ],
  occasion: [
    { max: 100, message: '讲话场合最多100个字符', trigger: 'blur' }
  ],
  background: [
    { max: 500, message: '背景说明最多500个字符', trigger: 'blur' }
  ],
  revisionReason: [
    { required: props.mode === 'revision', message: '请填写修正说明', trigger: 'blur' },
    { max: 200, message: '修正说明最多200个字符', trigger: 'blur' }
  ]
}

const leaderOptions = ref<User[]>([])
const leadersLoading = ref(false)
const inputVisible = ref(false)
const inputValue = ref('')
const saving = ref(false)
const submitting = ref(false)
const publishing = ref(false)

// 监听表单数据变化，同步到父组件
watch(formData, (newVal) => {
  emit('update:modelValue', { ...newVal })
}, { deep: true })

// 监听外部数据变化
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    Object.assign(formData, newVal)
  }
}, { deep: true })

// 富文本编辑器相关方法
const handleEditorInput = () => {
  if (editorRef.value) {
    formData.contentHtml = editorRef.value.innerHTML
    formData.content = editorRef.value.innerText
  }
}

const handleEditorBlur = () => {
  handleEditorInput()
}

const execCommand = (command: string) => {
  document.execCommand(command, false)
  editorRef.value?.focus()
}

// 领导人员搜索
const searchLeaders = async (query: string) => {
  if (!query) return
  
  leadersLoading.value = true
  try {
    const response = await rbacApi.getUserList({
      keyword: query,
      role: 'leader',
      pageSize: 20
    })
    leaderOptions.value = response.data.list
  } catch (error) {
    console.error('搜索领导失败:', error)
  } finally {
    leadersLoading.value = false
  }
}

// 标签管理
const removeTag = (index: number) => {
  formData.tags.splice(index, 1)
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value && !formData.tags.includes(inputValue.value)) {
    formData.tags.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}

// 表单操作
const validate = async (): Promise<boolean> => {
  if (!formRef.value) return false
  
  try {
    await formRef.value.validate()
    return true
  } catch {
    return false
  }
}

const handleCancel = () => {
  emit('cancel')
}

const handleSaveDraft = async () => {
  if (!(await validate())) return
  
  saving.value = true
  try {
    emit('submit', { ...formData, status: 'draft' }, 'draft')
  } finally {
    saving.value = false
  }
}

const handleSubmit = async () => {
  if (!(await validate())) return
  
  submitting.value = true
  try {
    emit('submit', { ...formData, status: 'pending_review' }, 'review')
  } finally {
    submitting.value = false
  }
}

const handlePublish = async () => {
  if (!(await validate())) return
  
  publishing.value = true
  try {
    emit('submit', { ...formData, status: 'published' }, 'publish')
  } finally {
    publishing.value = false
  }
}

// 初始化数据
const initData = async () => {
  // 加载常用领导
  await searchLeaders('')
}

initData()

defineExpose({
  validate,
  formData
})
</script>

<style lang="scss" scoped>
.quotation-form {
  .rich-editor-container {
    border: 1px solid var(--el-border-color);
    border-radius: 6px;
    overflow: hidden;

    .rich-editor {
      min-height: 150px;
      padding: 12px;
      line-height: 1.6;
      background: white;
      outline: none;

      &:focus {
        border-color: var(--el-color-primary);
      }

      &[contenteditable="false"] {
        background: var(--el-fill-color-lighter);
        cursor: not-allowed;
      }
    }

    .editor-toolbar {
      padding: 8px 12px;
      background: var(--el-fill-color-lighter);
      border-top: 1px solid var(--el-border-color-lighter);
    }
  }

  .leader-option {
    display: flex;
    align-items: center;
    gap: 8px;

    .leader-info {
      display: flex;
      flex-direction: column;

      .leader-name {
        font-size: 14px;
        font-weight: 500;
      }

      .leader-title {
        font-size: 12px;
        color: var(--el-text-color-regular);
      }
    }
  }

  .tag-item {
    margin-right: 8px;
    margin-bottom: 8px;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 24px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

@media (max-width: 768px) {
  .quotation-form {
    :deep(.el-form-item__label) {
      width: 80px !important;
    }

    .form-actions {
      flex-direction: column-reverse;
      gap: 8px;

      .el-button {
        width: 100%;
      }
    }
  }
}
</style>