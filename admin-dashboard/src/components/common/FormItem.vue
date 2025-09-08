<template>
  <div 
    :class="[
      'unified-form-item',
      `item-size-${size}`,
      {
        'is-required': isRequired,
        'is-error': hasError,
        'is-validating': isValidating,
        'is-success': isSuccess && !hasError,
        'item-no-label': !label && !$slots.label
      }
    ]"
  >
    <!-- 标签区域 -->
    <div 
      v-if="label || $slots.label"
      class="form-item-label"
      :style="labelStyle"
    >
      <slot name="label">
        <label 
          :for="fieldId"
          class="item-label-text"
        >
          {{ label }}
        </label>
      </slot>
      
      <!-- 必填标记 -->
      <span 
        v-if="isRequired && !hideRequiredAsterisk" 
        class="required-asterisk"
      >
        *
      </span>
      
      <!-- 帮助提示 -->
      <el-tooltip 
        v-if="tooltip"
        :content="tooltip"
        placement="top"
        class="item-tooltip"
      >
        <el-icon class="tooltip-icon">
          <QuestionFilled />
        </el-icon>
      </el-tooltip>
    </div>

    <!-- 内容区域 -->
    <div class="form-item-content">
      <div class="item-content-wrapper">
        <slot></slot>
        
        <!-- 内联操作按钮 -->
        <div v-if="$slots.append" class="item-append">
          <slot name="append"></slot>
        </div>
      </div>

      <!-- 验证状态图标 -->
      <div 
        v-if="showStatusIcon && (hasError || isSuccess || isValidating)"
        class="validation-icon"
      >
        <el-icon v-if="isValidating" class="validating">
          <Loading />
        </el-icon>
        <el-icon v-else-if="hasError" class="error">
          <CircleCloseFilled />
        </el-icon>
        <el-icon v-else-if="isSuccess" class="success">
          <CircleCheckFilled />
        </el-icon>
      </div>

      <!-- 错误信息 -->
      <transition name="el-zoom-in-top">
        <div 
          v-if="hasError && showErrorMessage"
          :class="[
            'error-message',
            { 'inline-message': inlineMessage }
          ]"
        >
          {{ errorMessage }}
        </div>
      </transition>

      <!-- 帮助文本 -->
      <div 
        v-if="helpText && !hasError"
        class="help-text"
      >
        {{ helpText }}
      </div>

      <!-- 字符计数 -->
      <div 
        v-if="showWordLimit && maxLength"
        class="word-limit"
      >
        <span :class="{ 'limit-exceeded': currentLength > maxLength }">
          {{ currentLength }}
        </span>
        <span class="limit-separator">/</span>
        <span class="limit-total">{{ maxLength }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  ref, 
  computed, 
  inject, 
  onMounted, 
  onUnmounted, 
  watch, 
  nextTick,
  useSlots
} from 'vue'
import { QuestionFilled, Loading, CircleCloseFilled, CircleCheckFilled } from '@element-plus/icons-vue'
import type { ValidationRule } from './Form.vue'

// Props
interface Props {
  prop?: string
  label?: string
  labelWidth?: string
  required?: boolean
  rules?: ValidationRule[]
  error?: string
  showMessage?: boolean
  inlineMessage?: boolean
  size?: 'large' | 'default' | 'small'
  tooltip?: string
  helpText?: string
  showWordLimit?: boolean
  maxLength?: number
  validateTrigger?: 'blur' | 'change'
  showStatusIcon?: boolean
  hideRequiredAsterisk?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showMessage: true,
  inlineMessage: false,
  size: 'default',
  validateTrigger: 'blur',
  showStatusIcon: false,
  hideRequiredAsterisk: false
})

// Emits
interface Emits {
  (e: 'validate', valid: boolean, message?: string): void
}

const emit = defineEmits<Emits>()

// 注入表单上下文
const formContext = inject<any>('formContext', null)
const slots = useSlots()

// 内部状态
const fieldId = ref(`form-item-${Math.random().toString(36).substr(2, 9)}`)
const isValidating = ref(false)
const hasError = ref(false)
const errorMessage = ref('')
const isSuccess = ref(false)
const currentLength = ref(0)

// 计算属性
const formProps = computed(() => formContext?.props?.value || {})

const size = computed(() => props.size || formProps.value.size || 'default')

const isRequired = computed(() => {
  if (props.required !== undefined) return props.required
  if (props.rules) {
    return props.rules.some(rule => rule.required)
  }
  if (formProps.value.rules && props.prop) {
    const fieldRules = formProps.value.rules[props.prop] || []
    return fieldRules.some((rule: ValidationRule) => rule.required)
  }
  return false
})

const labelStyle = computed(() => {
  const width = props.labelWidth || formProps.value.labelWidth
  if (width && formProps.value.layout === 'horizontal') {
    return { width }
  }
  return {}
})

const showErrorMessage = computed(() => {
  return props.showMessage !== false && (formProps.value.showMessage !== false)
})

const hideRequiredAsterisk = computed(() => {
  return props.hideRequiredAsterisk || formProps.value.hideRequiredAsterisk || false
})

const inlineMessage = computed(() => {
  return props.inlineMessage || formProps.value.inlineMessage || false
})

const showStatusIcon = computed(() => {
  return props.showStatusIcon || formProps.value.statusIcon || false
})

// 获取验证规则
const getRules = (): ValidationRule[] => {
  let rules: ValidationRule[] = []
  
  if (props.rules) {
    rules = [...props.rules]
  } else if (formProps.value.rules && props.prop) {
    rules = formProps.value.rules[props.prop] || []
  }
  
  // 添加必填规则
  if (props.required && !rules.some(rule => rule.required)) {
    rules.unshift({
      required: true,
      message: `${props.label || props.prop}不能为空`
    })
  }
  
  return rules
}

// 获取字段值
const getFieldValue = () => {
  if (formProps.value.model && props.prop) {
    return formProps.value.model[props.prop]
  }
  return undefined
}

// 设置字段值
const setFieldValue = (value: any) => {
  if (formContext && formContext.handleFieldChange && props.prop) {
    formContext.handleFieldChange(props.prop, value)
  }
}

// 验证字段
const validate = async (trigger?: string): Promise<boolean> => {
  if (!props.prop) return true

  const rules = getRules()
  const value = getFieldValue()
  
  // 过滤触发器匹配的规则
  const applicableRules = trigger 
    ? rules.filter(rule => !rule.trigger || rule.trigger === trigger)
    : rules

  if (applicableRules.length === 0) {
    clearValidate()
    return true
  }

  isValidating.value = true
  hasError.value = false
  errorMessage.value = ''
  isSuccess.value = false

  try {
    for (const rule of applicableRules) {
      const isValid = await validateSingleRule(rule, value)
      if (!isValid) {
        hasError.value = true
        errorMessage.value = rule.message || '验证失败'
        isSuccess.value = false
        isValidating.value = false
        
        if (formContext && formContext.handleFieldValidate && props.prop) {
          formContext.handleFieldValidate(props.prop, false)
        }
        
        emit('validate', false, errorMessage.value)
        return false
      }
    }

    // 所有规则都通过
    hasError.value = false
    errorMessage.value = ''
    isSuccess.value = true
    isValidating.value = false
    
    if (formContext && formContext.handleFieldValidate && props.prop) {
      formContext.handleFieldValidate(props.prop, true)
    }
    
    emit('validate', true)
    return true
  } catch (error) {
    hasError.value = true
    errorMessage.value = '验证过程中发生错误'
    isSuccess.value = false
    isValidating.value = false
    
    if (formContext && formContext.handleFieldValidate && props.prop) {
      formContext.handleFieldValidate(props.prop, false)
    }
    
    emit('validate', false, errorMessage.value)
    return false
  }
}

// 验证单个规则
const validateSingleRule = async (rule: ValidationRule, value: any): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    // 必填验证
    if (rule.required) {
      if (value === undefined || value === null || value === '' || 
          (Array.isArray(value) && value.length === 0)) {
        resolve(false)
        return
      }
    }

    // 如果值为空且不是必填，跳过验证
    if (!rule.required && (value === undefined || value === null || value === '')) {
      resolve(true)
      return
    }

    // 类型验证
    if (rule.type) {
      if (!validateType(rule.type, value)) {
        resolve(false)
        return
      }
    }

    // 正则验证
    if (rule.pattern && !rule.pattern.test(String(value))) {
      resolve(false)
      return
    }

    // 长度验证
    if (rule.len !== undefined) {
      const length = Array.isArray(value) ? value.length : String(value).length
      if (length !== rule.len) {
        resolve(false)
        return
      }
    }

    // 最小长度/值验证
    if (rule.min !== undefined) {
      const length = Array.isArray(value) ? value.length : 
                    typeof value === 'number' ? value : String(value).length
      if (length < rule.min) {
        resolve(false)
        return
      }
    }

    // 最大长度/值验证
    if (rule.max !== undefined) {
      const length = Array.isArray(value) ? value.length : 
                    typeof value === 'number' ? value : String(value).length
      if (length > rule.max) {
        resolve(false)
        return
      }
    }

    // 自定义验证器
    if (rule.validator && typeof rule.validator === 'function') {
      rule.validator(rule, value, (error?: string) => {
        if (error) {
          resolve(false)
        } else {
          resolve(true)
        }
      })
      return
    }

    resolve(true)
  })
}

// 类型验证
const validateType = (type: string, value: any): boolean => {
  switch (type) {
    case 'string':
      return typeof value === 'string'
    case 'number':
      return typeof value === 'number' && !isNaN(value)
    case 'integer':
      return typeof value === 'number' && Number.isInteger(value)
    case 'float':
      return typeof value === 'number' && !Number.isInteger(value)
    case 'boolean':
      return typeof value === 'boolean'
    case 'array':
      return Array.isArray(value)
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value)
    case 'date':
      return value instanceof Date || !isNaN(Date.parse(value))
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    case 'url':
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    case 'hex':
      return /^#?[0-9A-Fa-f]{6}$/.test(value)
    default:
      return true
  }
}

// 清除验证状态
const clearValidate = () => {
  hasError.value = false
  errorMessage.value = ''
  isSuccess.value = false
  isValidating.value = false
}

// 重置字段
const reset = () => {
  clearValidate()
  if (formProps.value.model && props.prop) {
    // 重置为初始值或默认值
    formProps.value.model[props.prop] = undefined
  }
}

// 获取验证消息
const getValidationMessage = () => {
  return errorMessage.value
}

// 更新字符计数
const updateCurrentLength = () => {
  const value = getFieldValue()
  if (typeof value === 'string') {
    currentLength.value = value.length
  } else if (Array.isArray(value)) {
    currentLength.value = value.length
  } else {
    currentLength.value = 0
  }
}

// 监听字段值变化
watch(
  () => getFieldValue(),
  () => {
    updateCurrentLength()
    
    if (props.validateTrigger === 'change') {
      nextTick(() => {
        validate('change')
      })
    }
  },
  { immediate: true }
)

// 外部错误设置
watch(
  () => props.error,
  (error) => {
    if (error) {
      hasError.value = true
      errorMessage.value = error
      isSuccess.value = false
    } else {
      clearValidate()
    }
  },
  { immediate: true }
)

// 生命周期
onMounted(() => {
  if (formContext && formContext.registerFormItem && props.prop) {
    formContext.registerFormItem(props.prop, {
      validate,
      reset,
      clearValidate,
      getValidationMessage,
      $el: getCurrentInstance()?.vnode.el
    })
  }
  updateCurrentLength()
})

onUnmounted(() => {
  if (formContext && formContext.unregisterFormItem && props.prop) {
    formContext.unregisterFormItem(props.prop)
  }
})

// 暴露方法
defineExpose({
  validate,
  reset,
  clearValidate,
  getValidationMessage
})
</script>

<style scoped lang="scss">
@use '../../styles/core/mixins' as *;

.unified-form-item {
  position: relative;
  margin-bottom: var(--spacing-lg);

  // 标签样式
  .form-item-label {
    @include flex-center;
    gap: var(--spacing-xs);
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium);
    font-size: var(--text-sm);
    line-height: var(--line-height-normal);

    .item-label-text {
      cursor: pointer;
      @include text-ellipsis;
    }

    .required-asterisk {
      color: var(--color-danger);
      font-weight: var(--font-weight-bold);
    }

    .item-tooltip {
      .tooltip-icon {
        color: var(--color-text-tertiary);
        font-size: var(--text-sm);
        cursor: help;
        transition: color var(--transition-fast);

        &:hover {
          color: var(--color-primary);
        }
      }
    }
  }

  // 内容样式
  .form-item-content {
    position: relative;

    .item-content-wrapper {
      @include flex-center;
      gap: var(--spacing-sm);

      .item-append {
        flex-shrink: 0;
      }
    }

    .validation-icon {
      position: absolute;
      right: var(--spacing-md);
      top: 50%;
      transform: translateY(-50%);
      z-index: 2;

      .el-icon {
        font-size: var(--text-base);
        
        &.validating {
          color: var(--color-primary);
          animation: rotate 1s linear infinite;
        }

        &.error {
          color: var(--color-danger);
        }

        &.success {
          color: var(--color-success);
        }
      }
    }

    .error-message {
      color: var(--color-danger);
      font-size: var(--text-xs);
      line-height: var(--line-height-normal);
      margin-top: var(--spacing-xs);

      &.inline-message {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        z-index: 1;
      }
    }

    .help-text {
      color: var(--color-text-tertiary);
      font-size: var(--text-xs);
      line-height: var(--line-height-normal);
      margin-top: var(--spacing-xs);
    }

    .word-limit {
      color: var(--color-text-tertiary);
      font-size: var(--text-xs);
      text-align: right;
      margin-top: var(--spacing-xs);

      .limit-exceeded {
        color: var(--color-danger);
      }

      .limit-separator {
        margin: 0 1px;
      }

      .limit-total {
        color: var(--color-text-secondary);
      }
    }
  }

  // 状态样式
  &.is-error {
    .form-item-label .item-label-text {
      color: var(--color-danger);
    }
  }

  &.is-validating {
    .form-item-label .item-label-text {
      color: var(--color-primary);
    }
  }

  &.is-success {
    .form-item-label .item-label-text {
      color: var(--color-success);
    }
  }

  // 无标签样式
  &.item-no-label {
    .form-item-content {
      margin-left: 0;
    }
  }

  // 尺寸样式
  &.item-size-large {
    margin-bottom: var(--spacing-xl);

    .form-item-label {
      font-size: var(--text-base);
      min-height: 48px;
    }
  }

  &.item-size-default {
    .form-item-label {
      min-height: 40px;
    }
  }

  &.item-size-small {
    margin-bottom: var(--spacing-md);

    .form-item-label {
      font-size: var(--text-sm);
      min-height: 32px;
    }
  }
}

// 动画
@keyframes rotate {
  from {
    transform: translateY(-50%) rotate(0deg);
  }
  to {
    transform: translateY(-50%) rotate(360deg);
  }
}

// 响应式适配
@include respond-below(md) {
  .unified-form-item {
    .form-item-content {
      .item-content-wrapper {
        flex-direction: column;
        align-items: stretch;

        .item-append {
          align-self: flex-start;
        }
      }

      .validation-icon {
        right: var(--spacing-sm);
      }
    }
  }
}
</style>