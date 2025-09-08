<template>
  <button
    class="btn"
    :class="[buttonTypeClass, buttonSizeClass, buttonStateClass]"
    :disabled="disabled || loading"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
    :aria-label="ariaLabel"
  >
    <el-icon v-if="icon && !loading" :size="iconSize" class="btn-icon">
      <component :is="icon" />
    </el-icon>
    <el-icon v-if="loading" :size="iconSize" class="btn-icon">
      <Loading />
    </el-icon>
    <span v-if="label" class="btn-label">
      {{ label }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Loading } from '@element-plus/icons-vue';

// 定义组件属性
interface Props {
  // 按钮类型
  type?: 'primary' | 'secondary' | 'text';
  // 按钮大小
  size?: 'small' | 'default' | 'large';
  // 按钮标签
  label?: string;
  // 按钮图标
  icon?: any;
  // 是否禁用
  disabled?: boolean;
  // 是否加载中
  loading?: boolean;
  // 是否为圆形按钮
  circle?: boolean;
  // ARIA标签，用于可访问性
  ariaLabel?: string;
}

// 定义组件发出的事件
interface Emits {
  (e: 'click'): void;
}

// 组件属性默认值
const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'default',
  disabled: false,
  loading: false,
  circle: false,
});

const emit = defineEmits<Emits>();

// 响应式状态
const isHovered = ref(false);
const isPressed = ref(false);

// 计算图标大小
const iconSize = computed(() => {
  switch (props.size) {
    case 'small':
      return 16;
    case 'large':
      return 20;
    default:
      return 18;
  }
});

// 计算按钮类型样式
const buttonTypeClass = computed(() => {
  const baseClasses = ['btn'];

  // 按钮类型
  baseClasses.push(`btn-${props.type}`);

  // 圆形按钮
  if (props.circle) {
    baseClasses.push('btn-circle');
  }

  return baseClasses;
});

// 计算按钮大小样式
const buttonSizeClass = computed(() => {
  return `btn-${props.size}`;
});

// 计算按钮状态样式
const buttonStateClass = computed(() => {
  if (props.disabled || props.loading) {
    return 'btn-disabled';
  }

  if (isPressed.value) {
    return 'btn-active';
  }

  if (isHovered.value) {
    return 'btn-hover';
  }

  return '';
});

// 事件处理
const handleClick = () => {
  if (!props.disabled && !props.loading) {
    emit('click');
  }
};

const handleMouseEnter = () => {
  if (!props.disabled && !props.loading) {
    isHovered.value = true;
  }
};

const handleMouseLeave = () => {
  if (!props.disabled && !props.loading) {
    isHovered.value = false;
    isPressed.value = false;
  }
};

const handleMouseDown = () => {
  if (!props.disabled && !props.loading) {
    isPressed.value = true;
  }
};

const handleMouseUp = () => {
  if (!props.disabled && !props.loading) {
    isPressed.value = false;
  }
};
</script>

<style scoped lang="scss">
// 导入变量
@import '@/styles/core/variables.scss';

// 基础按钮样式
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--text-base);
  line-height: var(--line-height-normal);
  cursor: pointer;
  outline: none;
  border: 1px solid transparent;
}

// 按钮类型
.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.btn-secondary {
  background-color: transparent;
  color: var(--color-text-secondary);
  border-color: var(--color-border-primary);
}

.btn-text {
  background-color: transparent;
  color: var(--color-primary);
  border-color: transparent;
  padding: var(--spacing-xs) var(--spacing-xs);
}

// 按钮大小
.btn-small {
  padding: calc(var(--spacing-unit) * 0.75) var(--spacing-xs);
  font-size: var(--text-sm);
}

.btn-large {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--text-lg);
}

// 圆形按钮
.btn-circle {
  border-radius: 50%;
  padding: var(--spacing-xs);
  width: 36px;
  height: 36px;
}

.btn-large.btn-circle {
  width: 44px;
  height: 44px;
}

.btn-small.btn-circle {
  width: 28px;
  height: 28px;
}

// 按钮状态
.btn-hover {
  &.btn-primary {
    background-color: var(--color-primary-hover);
  }

  &.btn-secondary {
    background-color: var(--color-bg-elevated);
  }

  &.btn-text {
    text-decoration: underline;
  }
}

.btn-active {
  &.btn-primary {
    background-color: var(--color-primary-active);
  }

  &.btn-secondary {
    background-color: var(--color-bg-elevated-dark);
  }
}

.btn-disabled {
  background-color: var(--color-bg-disabled);
  color: var(--color-text-disabled);
  border-color: var(--color-border-dark);
  cursor: not-allowed;
  opacity: 0.6;
}

// 按钮图标和标签
.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-label {
  white-space: nowrap;
}

// 焦点状态
.btn:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>