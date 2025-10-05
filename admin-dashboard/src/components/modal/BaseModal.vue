<template>
  <el-dialog
    v-model="visible"
    :title="undefined"
    :width="width"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :destroy-on-close="destroyOnClose"
    :fullscreen="fullscreen"
    @close="handleClose"
    class="unified-modal"
  >
    <template #header>
      <div class="modal-header">
        <h3 class="modal-title">{{ title }}</h3>
        <slot name="header-actions" />
      </div>
    </template>

    <div class="modal-body">
      <slot />
    </div>

    <template #footer>
      <div class="modal-footer">
        <slot name="footer" />
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  width?: string | number
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
  destroyOnClose?: boolean
  fullscreen?: boolean
}>(), {
  title: '',
  width: '600px',
  closeOnClickModal: true,
  closeOnPressEscape: true,
  destroyOnClose: false,
  fullscreen: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

function handleClose() {
  emit('close')
}
</script>

<style scoped>
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}
.modal-body {
  min-height: 60px;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>