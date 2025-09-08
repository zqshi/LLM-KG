<template>
  <form 
    :class="[
      'unified-form',
      `form-layout-${layout}`,
      `form-size-${size}`,
      { 'form-disabled': disabled }
    ]"
    @submit.prevent="handleSubmit"
    :novalidate="true"
  >
    <slot></slot>
    
    <!-- 表单操作按钮 -->
    <div 
      v-if="showActions"
      :class="[
        'form-actions',
        `actions-align-${actionsAlign}`,
        { 'actions-sticky': stickyActions }
      ]"
    >
      <slot name="actions">
        <el-button 
          v-if="showResetButton"
          @click="handleReset"
          :disabled="resetLoading"
        >
          {{ resetButtonText }}
        </el-button>
        
        <el-button 
          v-if="showSubmitButton"
          type="primary" 
          native-type="submit"
          :loading="submitLoading"
          :disabled="!canSubmit"
        >
          {{ submitButtonText }}
        </el-button>
      </slot>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, provide, reactive, nextTick, onMounted } from 'vue'
import type { FormRules, FormValidateCallback } from 'element-plus'

// 验证规则接口
export interface ValidationRule {
  required?: boolean
  message?: string
  trigger?: 'blur' | 'change'
  type?: 'string' | 'number' | 'boolean' | 'method' | 'regexp' | 'integer' | 'float' | 'array' | 'object' | 'enum' | 'date' | 'url' | 'hex' | 'email'
  pattern?: RegExp
  min?: number
  max?: number
  len?: number
  validator?: (rule: any, value: any, callback: (error?: string) => void) => void
}

// 表单配置接口
export interface FormConfig {
  model: Record<string, any>
  rules?: Record<string, ValidationRule[]>
  layout?: 'horizontal' | 'vertical' | 'inline'
  labelWidth?: string
  labelPosition?: 'left' | 'right' | 'top'
  size?: 'large' | 'default' | 'small'
  disabled?: boolean
  validateOnRuleChange?: boolean
  hideRequiredAsterisk?: boolean
  showMessage?: boolean
  inlineMessage?: boolean
  statusIcon?: boolean
  scrollToError?: boolean
}

// Props
interface Props extends FormConfig {
  showActions?: boolean
  actionsAlign?: 'left' | 'center' | 'right' | 'between'
  stickyActions?: boolean
  showSubmitButton?: boolean
  showResetButton?: boolean
  submitButtonText?: string
  resetButtonText?: string
  submitLoading?: boolean
  resetLoading?: boolean
  autoValidate?: boolean
  validateOnMount?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'vertical',
  labelWidth: '100px',
  labelPosition: 'top',
  size: 'default',
  disabled: false,
  validateOnRuleChange: true,
  hideRequiredAsterisk: false,
  showMessage: true,
  inlineMessage: false,
  statusIcon: false,
  scrollToError: true,
  showActions: true,
  actionsAlign: 'right',
  stickyActions: false,
  showSubmitButton: true,
  showResetButton: false,
  submitButtonText: '提交',
  resetButtonText: '重置',
  submitLoading: false,
  resetLoading: false,
  autoValidate: true,
  validateOnMount: false
})

// Emits
interface Emits {
  (e: 'submit', model: Record<string, any>): void
  (e: 'reset'): void
  (e: 'validate', valid: boolean, invalidFields?: Record<string, any>): void
  (e: 'change', field: string, value: any, model: Record<string, any>): void
}

const emit = defineEmits<Emits>()

// 内部状态
const formItems = ref<Map<string, any>>(new Map())
const isValidating = ref(false)
const validationResults = reactive<Record<string, boolean>>({})

// 计算属性
const canSubmit = computed(() => {
  if (!props.autoValidate) return true
  return Object.values(validationResults).every(valid => valid)
})

// 表单项注册和注销
const registerFormItem = (name: string, instance: any) => {
  formItems.value.set(name, instance)
  // 初始验证状态
  validationResults[name] = !props.rules?.[name]?.some(rule => rule.required)
}

const unregisterFormItem = (name: string) => {
  formItems.value.delete(name)
  delete validationResults[name]
}

// 字段值变化处理
const handleFieldChange = (field: string, value: any) => {
  if (props.model && typeof props.model === 'object') {
    props.model[field] = value
  }
  emit('change', field, value, props.model)
  
  // 自动验证
  if (props.autoValidate) {
    nextTick(() => {
      validateField(field)
    })
  }
}

// 字段验证状态变化
const handleFieldValidate = (field: string, valid: boolean) => {
  validationResults[field] = valid
}

// 提供给子组件的上下文
provide('formContext', {
  props: computed(() => props),
  registerFormItem,
  unregisterFormItem,
  handleFieldChange,
  handleFieldValidate
})

// 验证方法
const validate = async (callback?: FormValidateCallback): Promise<boolean> => {
  isValidating.value = true
  const promises: Promise<boolean>[] = []
  const invalidFields: Record<string, any> = {}
  
  for (const [name, item] of formItems.value.entries()) {
    if (item && typeof item.validate === 'function') {
      promises.push(
        item.validate().then((valid: boolean) => {
          if (!valid && item.getValidationMessage) {
            invalidFields[name] = item.getValidationMessage()
          }
          return valid
        })
      )
    }
  }
  
  try {
    const results = await Promise.all(promises)
    const isValid = results.every(result => result)
    
    isValidating.value = false
    emit('validate', isValid, Object.keys(invalidFields).length > 0 ? invalidFields : undefined)
    
    if (callback) {
      callback(isValid, invalidFields)
    }
    
    return isValid
  } catch (error) {
    isValidating.value = false
    console.error('Form validation error:', error)
    return false
  }
}

const validateField = async (field: string): Promise<boolean> => {
  const item = formItems.value.get(field)
  if (item && typeof item.validate === 'function') {
    try {
      const valid = await item.validate()
      validationResults[field] = valid
      return valid
    } catch (error) {
      console.error(`Field validation error for ${field}:`, error)
      return false
    }
  }
  return true
}

const resetFields = () => {
  for (const [, item] of formItems.value.entries()) {
    if (item && typeof item.reset === 'function') {
      item.reset()
    }
  }
  
  // 重置验证状态
  for (const field in validationResults) {
    validationResults[field] = !props.rules?.[field]?.some(rule => rule.required)
  }
}

const clearValidate = (fields?: string | string[]) => {
  const fieldsToClear = fields 
    ? (Array.isArray(fields) ? fields : [fields])
    : Array.from(formItems.value.keys())
  
  for (const field of fieldsTolear) {
    const item = formItems.value.get(field)
    if (item && typeof item.clearValidate === 'function') {
      item.clearValidate()
    }
    validationResults[field] = true
  }
}

// 事件处理
const handleSubmit = async () => {
  if (props.autoValidate) {
    const isValid = await validate()
    if (isValid) {
      emit('submit', props.model)
    } else if (props.scrollToError) {
      scrollToFirstError()
    }
  } else {
    emit('submit', props.model)
  }
}

const handleReset = () => {
  resetFields()
  emit('reset')
}

const scrollToFirstError = () => {
  const firstErrorField = Object.keys(validationResults).find(
    field => !validationResults[field]
  )
  
  if (firstErrorField) {
    const item = formItems.value.get(firstErrorField)
    if (item && item.$el) {
      item.$el.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      })
    }
  }
}

// 生命周期
onMounted(() => {
  if (props.validateOnMount) {
    nextTick(() => {
      validate()
    })
  }
})

// 暴露方法给父组件
defineExpose({
  validate,
  validateField,
  resetFields,
  clearValidate,
  scrollToError: scrollToFirstError
})
</script>

<style scoped lang="scss">
@use '../../styles/core/mixins' as *;

.unified-form {
  width: 100%;

  // 布局样式
  &.form-layout-horizontal {
    :deep(.unified-form-item) {
      @include flex-center;
      margin-bottom: var(--spacing-lg);

      .form-item-label {
        text-align: right;
        padding-right: var(--spacing-md);
        flex-shrink: 0;
      }

      .form-item-content {
        flex: 1;
        min-width: 0;
      }
    }
  }

  &.form-layout-vertical {
    :deep(.unified-form-item) {
      @include flex-column;
      margin-bottom: var(--spacing-lg);

      .form-item-label {
        text-align: left;
        margin-bottom: var(--spacing-xs);
      }

      .form-item-content {
        width: 100%;
      }
    }
  }

  &.form-layout-inline {
    @include flex-center;
    flex-wrap: wrap;
    gap: var(--spacing-lg);

    :deep(.unified-form-item) {
      @include flex-center;
      margin-bottom: 0;
      white-space: nowrap;

      .form-item-label {
        margin-right: var(--spacing-sm);
        margin-bottom: 0;
      }

      .form-item-content {
        flex: none;
        width: auto;
      }
    }
  }

  // 尺寸样式
  &.form-size-large {
    :deep(.unified-form-item) {
      .form-item-label {
        font-size: var(--text-base);
        min-height: 48px;
        line-height: 48px;
      }
    }
  }

  &.form-size-default {
    :deep(.unified-form-item) {
      .form-item-label {
        font-size: var(--text-sm);
        min-height: 40px;
        line-height: 40px;
      }
    }
  }

  &.form-size-small {
    :deep(.unified-form-item) {
      margin-bottom: var(--spacing-md);

      .form-item-label {
        font-size: var(--text-sm);
        min-height: 32px;
        line-height: 32px;
      }
    }
  }

  // 禁用状态
  &.form-disabled {
    opacity: 0.6;
    pointer-events: none;
  }
}

// 表单操作区域
.form-actions {
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--color-border-light);
  @include flex-center;
  gap: var(--spacing-md);

  &.actions-align-left {
    justify-content: flex-start;
  }

  &.actions-align-center {
    justify-content: center;
  }

  &.actions-align-right {
    justify-content: flex-end;
  }

  &.actions-align-between {
    justify-content: space-between;
  }

  // 固定操作栏
  &.actions-sticky {
    position: sticky;
    bottom: 0;
    background: var(--color-bg-card);
    z-index: var(--z-sticky);
    margin-left: calc(var(--spacing-xl) * -1);
    margin-right: calc(var(--spacing-xl) * -1);
    margin-bottom: calc(var(--spacing-xl) * -1);
    padding-left: var(--spacing-xl);
    padding-right: var(--spacing-xl);
    padding-bottom: var(--spacing-xl);
    border-top: 1px solid var(--color-border-light);
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  }
}

// 响应式适配
@include respond-below(md) {
  .unified-form {
    &.form-layout-horizontal {
      :deep(.unified-form-item) {
        flex-direction: column;
        align-items: flex-start;

        .form-item-label {
          text-align: left;
          padding-right: 0;
          margin-bottom: var(--spacing-xs);
        }

        .form-item-content {
          width: 100%;
        }
      }
    }

    &.form-layout-inline {
      flex-direction: column;
      align-items: stretch;

      :deep(.unified-form-item) {
        flex-direction: column;
        align-items: flex-start;
        width: 100%;

        .form-item-label {
          margin-right: 0;
          margin-bottom: var(--spacing-xs);
        }

        .form-item-content {
          width: 100%;
        }
      }
    }
  }

  .form-actions {
    flex-direction: column;
    gap: var(--spacing-sm);

    .el-button {
      width: 100%;
    }

    &.actions-align-between {
      flex-direction: column-reverse;
    }
  }
}
</style>