<template>
  <el-dialog
    v-model="visibleProxy"
    :title="undefined"
    :width="width"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :destroy-on-close="destroyOnClose"
    :fullscreen="fullscreen"
    :before-close="onBeforeClose"
    class="unified-modal"
    :class="modalClass"
  >
    <template #header>
      <div class="modal-header">
        <div class="modal-title-section">
          <div v-if="icon" class="modal-icon">
            <el-icon><component :is="icon" /></el-icon>
          </div>
          <div class="title-content">
            <h3 class="modal-title">{{ title }}</h3>
            <p v-if="subtitle" class="modal-subtitle">{{ subtitle }}</p>
          </div>
        </div>
        <div class="modal-header-actions">
          <slot name="header-actions" />
        </div>
      </div>
    </template>

    <div class="modal-body">
      <div v-if="loading" class="modal-loading">
        <el-skeleton :rows="4" animated />
      </div>
      <div v-else-if="error" class="modal-error">
        <div class="error-content">
          <el-icon class="error-icon"><CircleClose /></el-icon>
          <h4 class="error-title">加载失败</h4>
          <p class="error-message">{{ errorMessage }}</p>
          <el-button type="primary" @click="$emit('retry')">重试</el-button>
        </div>
      </div>
      <div v-else class="modal-content">
        <slot />
      </div>
      <div v-if="$slots.form" class="modal-form">
        <slot name="form" />
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <div v-if="footerInfo" class="footer-info">{{ footerInfo }}</div>
        <div class="footer-actions">
          <slot name="footer">
            <el-button @click="handleCancel">{{ cancelText }}</el-button>
            <el-button type="primary" :loading="confirmLoading" @click="handleConfirm">
              {{ confirmText }}
            </el-button>
          </slot>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CircleClose } from '@element-plus/icons-vue'

type ModalType = 'default' | 'info' | 'success' | 'warning' | 'error'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title: string
  subtitle?: string
  icon?: any
  type?: ModalType
  width?: string | number
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
  destroyOnClose?: boolean
  fullscreen?: boolean
  loading?: boolean
  error?: boolean
  errorMessage?: string
  footerInfo?: string
  confirmText?: string
  cancelText?: string
  confirmLoading?: boolean
}>(), {
  type: 'default',
  width: '640px',
  closeOnClickModal: false,
  closeOnPressEscape: true,
  destroyOnClose: true,
  fullscreen: false,
  loading: false,
  error: false,
  errorMessage: '请稍后重试或检查网络连接',
  footerInfo: '',
  confirmText: '确定',
  cancelText: '取消',
  confirmLoading: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'close'): void
  (e: 'retry'): void
}>()

const visibleProxy = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

const modalClass = computed(() => {
  const classes: string[] = []
  switch (props.type) {
    case 'info': classes.push('modal-info'); break
    case 'success': classes.push('modal-success'); break
    case 'warning': classes.push('modal-warning'); break
    case 'error': classes.push('modal-error'); break
  }
  return classes.join(' ')
})

function handleCancel() {
  emit('cancel')
  visibleProxy.value = false
}

function handleConfirm() {
  emit('confirm')
}

function onBeforeClose(done: () => void) {
  emit('close')
  done()
}
</script>

<style scoped>
.unified-modal :deep(.el-dialog) { border-radius: 12px; }
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-title-section { display: flex; gap: 12px; align-items: center; }
.modal-title { margin: 0; font-size: 16px; font-weight: 600; }
.modal-subtitle { margin: 4px 0 0; color: #909399; font-size: 13px; }
.modal-body { min-height: 60px; }
.modal-loading { padding: 12px; }
.modal-error { padding: 16px; text-align: center; }
.error-title { margin: 8px 0; font-size: 16px; font-weight: 600; }
.error-message { color: #909399; font-size: 13px; }
.modal-footer { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.footer-actions { display: flex; gap: 8px; }
.modal-info :deep(.el-dialog__header) { background: #f5f7fa; }
.modal-success :deep(.el-dialog__header) { background: #e1f3d8; }
.modal-warning :deep(.el-dialog__header) { background: #fdf6ec; }
.modal-error :deep(.el-dialog__header) { background: #fde2e2; }
</style>