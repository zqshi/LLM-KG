<template>
  <el-dialog
    :model-value="modelValue"
    :title="title"
    :width="width"
    :fullscreen="fullscreen"
    :top="top"
    :modal="modal"
    :modal-class="modalClass"
    :append-to-body="appendToBody"
    :lock-scroll="lockScroll"
    :custom-class="customClass"
    :open-delay="openDelay"
    :close-delay="closeDelay"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :show-close="showClose"
    :before-close="handleBeforeClose"
    :center="center"
    :align-center="alignCenter"
    :destroy-on-close="destroyOnClose"
    :close-icon="closeIcon"
    :z-index="zIndex"
    @open="handleOpen"
    @opened="handleOpened"
    @close="handleClose"
    @closed="handleClosed"
    class="unified-modal"
  >
    <!-- 自定义头部 -->
    <template #header v-if="$slots.header || showHeader">
      <slot name="header">
        <div class="modal-header">
          <div class="modal-title-section">
            <div class="modal-icon" v-if="icon">
              <el-icon :size="20" :class="`icon-${type}`">
                <component :is="icon" />
              </el-icon>
            </div>
            <div class="title-content">
              <h3 class="modal-title">{{ title }}</h3>
              <p v-if="subtitle" class="modal-subtitle">{{ subtitle }}</p>
            </div>
          </div>
          <div class="modal-header-actions" v-if="headerActions.length > 0">
            <el-button
              v-for="action in headerActions"
              :key="action.key"
              :type="action.type || 'text'"
              :size="action.size || 'small'"
              :icon="action.icon"
              :loading="action.loading"
              :disabled="action.disabled"
              @click="handleHeaderAction(action)"
              :title="action.tooltip"
            >
              {{ action.label }}
            </el-button>
          </div>
        </div>
      </slot>
    </template>

    <!-- 主体内容 -->
    <div :class="['modal-body', `body-${bodyType}`, { 'body-loading': loading }]">
      <!-- 加载状态 -->
      <div v-if="loading" class="modal-loading">
        <el-skeleton :rows="3" animated />
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="modal-error">
        <div class="error-content">
          <el-icon size="48" class="error-icon">
            <WarningFilled />
          </el-icon>
          <h4 class="error-title">{{ errorTitle || '加载失败' }}</h4>
          <p class="error-message">{{ error }}</p>
          <el-button v-if="showRetry" type="primary" @click="handleRetry">
            重试
          </el-button>
        </div>
      </div>

      <!-- 正常内容 -->
      <template v-else>
        <!-- 步骤条 -->
        <div v-if="showSteps" class="modal-steps">
          <el-steps :active="currentStep" :align-center="true">
            <el-step
              v-for="(step, index) in steps"
              :key="index"
              :title="step.title"
              :description="step.description"
              :icon="step.icon"
              :status="step.status"
            />
          </el-steps>
        </div>

        <!-- 内容区域 -->
        <div class="modal-content">
          <slot></slot>
        </div>

        <!-- 表单容器 -->
        <div v-if="formMode" class="modal-form">
          <Form
            v-if="formConfig"
            ref="formRef"
            v-bind="formConfig"
            @submit="handleFormSubmit"
            @validate="handleFormValidate"
          >
            <slot name="form"></slot>
          </Form>
        </div>
      </template>
    </div>

    <!-- 自定义底部 -->
    <template #footer v-if="$slots.footer || showFooter">
      <slot name="footer">
        <div class="modal-footer">
          <div class="footer-info" v-if="footerInfo">
            <span class="info-text">{{ footerInfo }}</span>
          </div>
          
          <div class="footer-actions">
            <!-- 取消按钮 -->
            <el-button
              v-if="showCancelButton"
              @click="handleCancel"
              :disabled="cancelDisabled"
              :loading="cancelLoading"
            >
              {{ cancelButtonText }}
            </el-button>

            <!-- 自定义操作按钮 -->
            <el-button
              v-for="action in footerActions"
              :key="action.key"
              :type="action.type"
              :size="action.size"
              :icon="action.icon"
              :loading="action.loading"
              :disabled="action.disabled"
              @click="handleFooterAction(action)"
            >
              {{ action.label }}
            </el-button>

            <!-- 确认按钮 -->
            <el-button
              v-if="showConfirmButton"
              :type="confirmButtonType"
              @click="handleConfirm"
              :disabled="confirmDisabled"
              :loading="confirmLoading"
            >
              {{ confirmButtonText }}
            </el-button>
          </div>
        </div>
      </slot>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { WarningFilled } from '@element-plus/icons-vue'
import Form from './Form.vue'

// 操作按钮接口
export interface ModalAction {
  key: string
  label: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'
  size?: 'large' | 'default' | 'small'
  icon?: any
  loading?: boolean
  disabled?: boolean
  tooltip?: string
}

// 步骤接口
export interface ModalStep {
  title: string
  description?: string
  icon?: any
  status?: 'wait' | 'process' | 'finish' | 'error' | 'success'
}

// Props
interface Props {
  modelValue: boolean
  title?: string
  subtitle?: string
  width?: string | number
  fullscreen?: boolean
  top?: string
  modal?: boolean
  modalClass?: string
  appendToBody?: boolean
  lockScroll?: boolean
  customClass?: string
  openDelay?: number
  closeDelay?: number
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
  showClose?: boolean
  center?: boolean
  alignCenter?: boolean
  destroyOnClose?: boolean
  closeIcon?: any
  zIndex?: number
  type?: 'info' | 'success' | 'warning' | 'error'
  icon?: any
  showHeader?: boolean
  showFooter?: boolean
  headerActions?: ModalAction[]
  footerActions?: ModalAction[]
  footerInfo?: string
  showCancelButton?: boolean
  showConfirmButton?: boolean
  cancelButtonText?: string
  confirmButtonText?: string
  confirmButtonType?: string
  cancelDisabled?: boolean
  confirmDisabled?: boolean
  cancelLoading?: boolean
  confirmLoading?: boolean
  bodyType?: 'default' | 'form' | 'table' | 'steps'
  loading?: boolean
  error?: string
  errorTitle?: string
  showRetry?: boolean
  showSteps?: boolean
  steps?: ModalStep[]
  currentStep?: number
  formMode?: boolean
  formConfig?: any
  beforeClose?: (done: () => void) => void
  confirmClose?: boolean
  confirmCloseMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '50%',
  fullscreen: false,
  top: '15vh',
  modal: true,
  appendToBody: false,
  lockScroll: true,
  openDelay: 0,
  closeDelay: 0,
  closeOnClickModal: true,
  closeOnPressEscape: true,
  showClose: true,
  center: false,
  alignCenter: true,
  destroyOnClose: false,
  type: 'info',
  showHeader: true,
  showFooter: true,
  headerActions: () => [],
  footerActions: () => [],
  showCancelButton: true,
  showConfirmButton: true,
  cancelButtonText: '取消',
  confirmButtonText: '确定',
  confirmButtonType: 'primary',
  cancelDisabled: false,
  confirmDisabled: false,
  cancelLoading: false,
  confirmLoading: false,
  bodyType: 'default',
  loading: false,
  showRetry: true,
  showSteps: false,
  steps: () => [],
  currentStep: 0,
  formMode: false,
  confirmClose: false,
  confirmCloseMessage: '确定要关闭吗？未保存的内容将丢失。'
})

// Emits
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'open'): void
  (e: 'opened'): void
  (e: 'close'): void
  (e: 'closed'): void
  (e: 'cancel'): void
  (e: 'confirm', data?: any): void
  (e: 'header-action', action: string): void
  (e: 'footer-action', action: string): void
  (e: 'retry'): void
  (e: 'form-submit', data: any): void
  (e: 'form-validate', valid: boolean, fields?: any): void
}

const emit = defineEmits<Emits>()

// Refs
const formRef = ref<InstanceType<typeof Form>>()

// 计算属性
const modalClass = computed(() => {
  const classes = ['unified-modal']
  if (props.type) classes.push(`modal-${props.type}`)
  if (props.bodyType) classes.push(`modal-body-${props.bodyType}`)
  return classes.join(' ')
})

// 事件处理
const handleOpen = () => {
  emit('open')
}

const handleOpened = () => {
  emit('opened')
  if (props.formMode && formRef.value) {
    nextTick(() => {
      // 聚焦第一个输入框
      const firstInput = formRef.value?.$el?.querySelector('input, textarea, select')
      if (firstInput) {
        firstInput.focus()
      }
    })
  }
}

const handleClose = () => {
  emit('close')
  emit('update:modelValue', false)
}

const handleClosed = () => {
  emit('closed')
}

const handleCancel = () => {
  if (props.confirmClose) {
    ElMessageBox.confirm(props.confirmCloseMessage, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      emit('cancel')
      handleClose()
    }).catch(() => {
      // 用户取消
    })
  } else {
    emit('cancel')
    handleClose()
  }
}

const handleConfirm = async () => {
  if (props.formMode && formRef.value) {
    // 表单模式下先验证表单
    const isValid = await formRef.value.validate()
    if (isValid) {
      emit('confirm', props.formConfig?.model)
    }
  } else {
    emit('confirm')
  }
}

const handleHeaderAction = (action: ModalAction) => {
  emit('header-action', action.key)
}

const handleFooterAction = (action: ModalAction) => {
  emit('footer-action', action.key)
}

const handleRetry = () => {
  emit('retry')
}

const handleFormSubmit = (data: any) => {
  emit('form-submit', data)
  emit('confirm', data)
}

const handleFormValidate = (valid: boolean, fields?: any) => {
  emit('form-validate', valid, fields)
}

const handleBeforeClose = (done: () => void) => {
  if (props.beforeClose) {
    props.beforeClose(done)
  } else if (props.confirmClose) {
    ElMessageBox.confirm(props.confirmCloseMessage, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      done()
    }).catch(() => {
      // 用户取消关闭
    })
  } else {
    done()
  }
}

// 方法暴露
const open = () => {
  emit('update:modelValue', true)
}

const close = () => {
  emit('update:modelValue', false)
}

const validateForm = () => {
  if (props.formMode && formRef.value) {
    return formRef.value.validate()
  }
  return Promise.resolve(true)
}

const resetForm = () => {
  if (props.formMode && formRef.value) {
    formRef.value.resetFields()
  }
}

defineExpose({
  open,
  close,
  validateForm,
  resetForm
})
</script>

<style scoped lang="scss">
@use '../../styles/core/mixins' as *;

// Modal样式覆盖
:deep(.unified-modal) {
  .el-dialog {
    border-radius: var(--radius-xl);
    overflow: hidden;

    .el-dialog__header {
      background: var(--color-bg-section);
      border-bottom: 1px solid var(--color-border-light);
      padding: var(--spacing-xl);
    }

    .el-dialog__body {
      padding: 0;
    }

    .el-dialog__footer {
      background: var(--color-bg-section);
      border-top: 1px solid var(--color-border-light);
      padding: var(--spacing-lg) var(--spacing-xl);
    }

    .el-dialog__headerbtn {
      top: var(--spacing-lg);
      right: var(--spacing-lg);
      width: 32px;
      height: 32px;
      background: var(--color-bg-card);
      border-radius: 50%;
      border: 1px solid var(--color-border-light);
      transition: all var(--transition-fast);

      &:hover {
        background: var(--color-bg-elevated);
        border-color: var(--color-primary);

        .el-dialog__close {
          color: var(--color-primary);
        }
      }

      .el-dialog__close {
        color: var(--color-text-secondary);
        font-size: var(--text-base);
        font-weight: normal;
      }
    }
  }

  // 类型样式
  &.modal-success {
    .modal-icon.icon-success {
      color: var(--color-success);
    }
  }

  &.modal-warning {
    .modal-icon.icon-warning {
      color: var(--color-warning);
    }
  }

  &.modal-error {
    .modal-icon.icon-error {
      color: var(--color-danger);
    }
  }

  &.modal-info {
    .modal-icon.icon-info {
      color: var(--color-info);
    }
  }
}

// 模态框头部
.modal-header {
  @include flex-between;
  gap: var(--spacing-lg);

  .modal-title-section {
    @include flex-center;
    gap: var(--spacing-md);
    flex: 1;
    min-width: 0;

    .modal-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-lg);
      @include flex-center;
      background: var(--color-bg-light);
      flex-shrink: 0;

      .el-icon {
        font-size: 20px;
      }
    }

    .title-content {
      flex: 1;
      min-width: 0;

      .modal-title {
        font-size: var(--text-xl);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
        margin: 0;
        @include text-ellipsis;
      }

      .modal-subtitle {
        font-size: var(--text-sm);
        color: var(--color-text-secondary);
        margin: var(--spacing-xs) 0 0 0;
        @include text-ellipsis;
      }
    }
  }

  .modal-header-actions {
    @include flex-center;
    gap: var(--spacing-sm);
    flex-shrink: 0;
  }
}

// 模态框主体
.modal-body {
  position: relative;
  padding: var(--spacing-xl);
  max-height: 60vh;
  overflow-y: auto;

  &.body-form {
    padding: var(--spacing-xl) var(--spacing-xl) 0;
  }

  &.body-table {
    padding: 0;
  }

  &.body-steps {
    padding-top: var(--spacing-lg);
  }

  &.body-loading {
    min-height: 200px;
  }

  // 加载状态
  .modal-loading {
    padding: var(--spacing-2xl);
  }

  // 错误状态
  .modal-error {
    @include flex-center;
    justify-content: center;
    min-height: 200px;
    text-align: center;

    .error-content {
      max-width: 300px;

      .error-icon {
        color: var(--color-danger);
        margin-bottom: var(--spacing-lg);
      }

      .error-title {
        font-size: var(--text-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
        margin: 0 0 var(--spacing-sm) 0;
      }

      .error-message {
        font-size: var(--text-sm);
        color: var(--color-text-secondary);
        margin: 0 0 var(--spacing-lg) 0;
        line-height: var(--line-height-relaxed);
      }
    }
  }

  // 步骤条
  .modal-steps {
    margin-bottom: var(--spacing-xl);
    padding: 0 var(--spacing-lg);

    :deep(.el-steps) {
      .el-step__title {
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
      }

      .el-step__description {
        font-size: var(--text-xs);
        color: var(--color-text-tertiary);
      }

      .el-step__icon {
        width: 24px;
        height: 24px;
        border-radius: 50%;
      }
    }
  }

  // 内容区域
  .modal-content {
    line-height: var(--line-height-relaxed);

    h1, h2, h3, h4, h5, h6 {
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-md);
    }

    p {
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-md);

      &:last-child {
        margin-bottom: 0;
      }
    }

    ul, ol {
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-md);
      padding-left: var(--spacing-xl);

      li {
        margin-bottom: var(--spacing-xs);
      }
    }
  }

  // 表单区域
  .modal-form {
    margin-top: var(--spacing-lg);
  }
}

// 模态框底部
.modal-footer {
  @include flex-between;
  gap: var(--spacing-lg);

  .footer-info {
    flex: 1;
    min-width: 0;

    .info-text {
      font-size: var(--text-sm);
      color: var(--color-text-tertiary);
      @include text-ellipsis;
    }
  }

  .footer-actions {
    @include flex-center;
    gap: var(--spacing-sm);
    flex-shrink: 0;
  }
}

// 响应式适配
@include respond-below(md) {
  :deep(.unified-modal) {
    .el-dialog {
      width: 95% !important;
      margin: var(--spacing-lg);

      .el-dialog__header {
        padding: var(--spacing-lg);
      }

      .el-dialog__footer {
        padding: var(--spacing-lg);
      }
    }
  }

  .modal-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);

    .modal-header-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }

  .modal-body {
    padding: var(--spacing-lg);
    max-height: 50vh;

    &.body-form {
      padding: var(--spacing-lg) var(--spacing-lg) 0;
    }

    .modal-steps {
      padding: 0 var(--spacing-sm);
    }
  }

  .modal-footer {
    flex-direction: column-reverse;
    gap: var(--spacing-md);

    .footer-info {
      text-align: center;
    }

    .footer-actions {
      width: 100%;
      justify-content: center;
      flex-wrap: wrap;

      .el-button {
        min-width: 100px;
      }
    }
  }
}

// 全屏模式适配
@include respond-below(sm) {
  :deep(.unified-modal) {
    .el-dialog {
      &.is-fullscreen {
        .el-dialog__body {
          .modal-body {
            max-height: calc(100vh - 200px);
            padding: var(--spacing-md);
          }
        }
      }
    }
  }
}
</style>