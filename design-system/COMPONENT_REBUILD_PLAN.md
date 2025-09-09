# 核心组件重构计划

## 概述

本计划详细定义了企业知识聚合平台（LLM-KG）设计系统阶段二的核心组件重构任务，包括重构目标、组件优先级、具体实现方案、API设计规范和测试策略。

## 重构目标

1. 建立统一的基础组件库（按钮、卡片、表单等）
2. 统一组件API和样式规范
3. 实现组件的响应式设计
4. 添加组件的可访问性支持
5. 编写组件测试用例

## 组件重构优先级

| 优先级 | 组件类型 | 描述 | 预计时间 |
|--------|----------|------|----------|
| 高 | 按钮 (Button) | 重构现有Button组件，使其符合设计系统规范 | 2天 |
| 高 | 卡片 (Card) | 开发通用Card组件，替代现有特定场景卡片 | 3天 |
| 高 | 表单 (Form/FormItem) | 开发通用表单组件 | 4天 |
| 中 | 输入框 (Input) | 重构输入框组件 | 3天 |
| 中 | 选择器 (Select) | 开发选择器组件 | 3天 |
| 中 | 表格 (Table) | 重构表格组件 | 4天 |
| 低 | 模态框 (Modal) | 开发模态框组件 | 3天 |
| 低 | 提示 (Tooltip/Notification) | 开发提示组件 | 2天 |

## 具体实现方案

### 1. 按钮 (Button)组件重构

**现状分析**：
- 现有Button组件基本符合设计系统规范
- 支持primary/secondary/text三种类型和small/default/large三种尺寸
- 支持圆形按钮样式及hover/active/disabled等状态
- 使用CSS变量定义样式

**优化方向**：
- 增加danger类型和xs尺寸
- 完善loading状态实现
- 增强可访问性支持（ARIA属性）
- 优化TypeScript类型定义

**实现代码**：
```vue
<template>
  <button
    class="btn"
    :class="[type, size, disabled ? 'disabled' : '', loading ? 'loading' : '', round ? 'round' : '']"
    :disabled="disabled || loading"
    :aria-label="ariaLabel"
    @click="onClick"
  >
    <span v-if="loading" class="loading-spinner"></span>
    <el-icon v-if="icon" :size="getIconSize()">{{ icon }}</el-icon>
    <span v-if="$slots.default"><slot></slot></span>
  </button>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';
import { Loading } from '@element-plus/icons-vue';

export interface ButtonProps {
  /**
   * 按钮类型
   */
  type?: 'primary' | 'secondary' | 'text' | 'danger';
  /**
   * 按钮尺寸
   */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /**
   * 是否禁用
   */
  disabled?: boolean;
  /**
   * 是否加载中
   */
  loading?: boolean;
  /**
   * 图标组件
   */
  icon?: any;
  /**
   * 是否圆形按钮
   */
  round?: boolean;
  /**
   * 无障碍标签
   */
  ariaLabel?: string;
}

defineProps<ButtonProps>();

export interface ButtonEmits {
  (e: 'click'): void;
}

defineEmits<ButtonEmits>();

const getIconSize = computed(() => {
  const sizeMap = {
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20
  };
  return sizeMap[props.size || 'md'];
});
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-md);
  font-family: var(--font-family-sans);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s ease;
}

/* 类型样式 */
.btn.primary {
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
}

.btn.secondary {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn.text {
  background-color: transparent;
  color: var(--color-text-primary);
  border: none;
}

.btn.danger {
  background-color: var(--color-danger);
  color: var(--color-white);
  border: none;
}

/* 尺寸样式 */
.btn.xs {
  font-size: var(--text-xs);
  height: 24px;
  padding: 0 var(--spacing-sm);
}

.btn.sm {
  font-size: var(--text-sm);
  height: 32px;
}

.btn.md {
  font-size: var(--text-base);
  height: 40px;
}

.btn.lg {
  font-size: var(--text-lg);
  height: 48px;
}

/* 状态样式 */
.btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn.loading {
  position: relative;
  pointer-events: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: var(--spacing-xs);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 圆形按钮 */
.btn.round {
  border-radius: var(--radius-full);
  padding: 0;
  width: var(--height);
  height: var(--height);
}
</style>
```

### 2. 卡片 (Card)组件开发

**现状分析**：
- 目前没有通用Card组件
- 存在特定场景卡片（如DashboardCard、QuotationCard）
- 各卡片组件样式和API不统一

**设计方案**：
- 开发通用Card组件，支持头部、内容和底部三个部分
- 支持不同类型（默认、强调、简洁）
- 支持自定义边框、阴影和圆角
- 实现响应式设计

**实现代码**：
```vue
<template>
  <div class="card" :class="[type, bordered ? 'bordered' : '', shadow ? 'shadow' : '']">
    <div class="card-header" v-if="$slots.header || title">
      <div class="card-title" v-if="title">{{ title }}</div>
      <slot name="header"></slot>
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
    <div class="card-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

export interface CardProps {
  /**
   * 卡片类型
   */
  type?: 'default' | 'highlight' | 'simple';
  /**
   * 卡片标题
   */
  title?: string;
  /**
   * 是否显示边框
   */
  bordered?: boolean;
  /**
   * 是否显示阴影
   */
  shadow?: boolean;
  /**
   * 圆角大小
   */
  radius?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

defineProps<CardProps>();
</script>

<style scoped>
.card {
  background-color: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  transition: all 0.2s ease;
}

.card.bordered {
  border: 1px solid var(--color-border-primary);
}

.card.shadow {
  box-shadow: var(--shadow-card);
}

.card.highlight {
  border-top: 3px solid var(--color-primary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border-light);
}

.card-title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-medium);
  margin: 0;
}

.card-body {
  margin-bottom: var(--spacing-md);
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border-light);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card {
    padding: var(--spacing-md);
  }
}
</style>
```

### 3. 表单 (Form/FormItem)组件开发

**现状分析**：
- 目前没有通用Form组件
- 存在特定场景表单（如QuotationForm）
- 表单验证逻辑分散

**设计方案**：
- 开发Form和FormItem组件
- 支持表单验证
- 支持标签位置调整
- 实现响应式布局

**实现代码**（Form组件）：
```vue
<template>
  <form class="form" @submit.prevent="handleSubmit">
    <slot></slot>
  </form>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, provide, ref } from 'vue';

export interface FormProps {
  /**
   * 表单模型
   */
  model?: Record<string, any>;
  /**
   * 验证规则
   */
  rules?: Record<string, any>;
  /**
   * 标签宽度
   */
  labelWidth?: string;
  /**
   * 标签位置
   */
  labelPosition?: 'left' | 'top';
}

defineProps<FormProps>();

export interface FormEmits {
  (e: 'submit', data: Record<string, any>): void;
  (e: 'validate', valid: boolean, errors: Record<string, string[]>): void;
}

defineEmits<FormEmits>();

const formItemRefs = ref<Record<string, any>>({});

provide('formContext', {
  props,
  formItemRefs,
  registerFormItem: (name: string, ref: any) => {
    formItemRefs.value[name] = ref;
  },
  unregisterFormItem: (name: string) => {
    delete formItemRefs.value[name];
  }
});

const handleSubmit = () => {
  validate().then((valid) => {
    if (valid) {
      emit('submit', props.model || {});
    }
  });
};

const validate = async (): Promise<boolean> => {
  const keys = Object.keys(formItemRefs.value);
  const errors: Record<string, string[]> = {};
  let valid = true;

  for (const key of keys) {
    const item = formItemRefs.value[key];
    if (item && item.validate) {
      const itemValid = await item.validate();
      if (!itemValid) {
        valid = false;
        errors[key] = item.errors || [];
      }
    }
  }

  emit('validate', valid, errors);
  return valid;
};
</script>

<style scoped>
.form {
  width: 100%;
}
</style>
```

**实现代码**（FormItem组件）：
```vue
<template>
  <div class="form-item" :class="{ 'error': hasError }">
    <label v-if="label" class="form-label" :style="{ width: labelWidth }">{{ label }}</label>
    <div class="form-item-content">
      <slot></slot>
      <div v-if="hasError" class="error-message">{{ errorMessage }}</div>
      <div v-if="helpText && !hasError" class="help-text">{{ helpText }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, inject, onMounted, onUnmounted, computed } from 'vue';

export interface FormItemProps {
  /**
   * 字段名称
   */
  name: string;
  /**
   * 标签文本
   */
  label?: string;
  /**
   * 帮助文本
   */
  helpText?: string;
  /**
   * 是否必填
   */
  required?: boolean;
  /**
   * 验证规则
   */
  rules?: any[];
}

defineProps<FormItemProps>();

export interface FormItemEmits {
  (e: 'validate'): void;
}

defineEmits<FormItemEmits>();

const hasError = ref(false);
const errors = ref<string[]>([]);
const errorMessage = ref('');
const formContext = inject('formContext', null);
const value = ref<any>(null);

const validate = async (): Promise<boolean> => {
  // 简化版验证逻辑，实际项目中可使用async-validator等库
  if (props.required && (value.value === undefined || value.value === null || value.value === '')) {
    hasError.value = true;
    errors.value = [`${props.label || props.name}不能为空`];
    errorMessage.value = errors.value[0];
    return false;
  }

  // 验证规则
  if (props.rules && props.rules.length > 0) {
    for (const rule of props.rules) {
      if (rule.required && !value.value) {
        hasError.value = true;
        errors.value = [rule.message || `${props.label || props.name}不能为空`];
        errorMessage.value = errors.value[0];
        return false;
      }

      if (rule.pattern && !rule.pattern.test(value.value)) {
        hasError.value = true;
        errors.value = [rule.message || `${props.label || props.name}格式不正确`];
        errorMessage.value = errors.value[0];
        return false;
      }
    }
  }

  hasError.value = false;
  errors.value = [];
  errorMessage.value = '';
  return true;
};

const labelWidth = computed(() => {
  return formContext?.props.labelWidth || '100px';
});

// 注册到表单上下文
onMounted(() => {
  if (formContext && formContext.registerFormItem) {
    formContext.registerFormItem(props.name, {
      validate,
      errors
    });
  }
});

onUnmounted(() => {
  if (formContext && formContext.unregisterFormItem) {
    formContext.unregisterFormItem(props.name);
  }
});

// 提供给子组件的上下文
provide('formItemContext', {
  props,
  hasError,
  value,
  validate
});
</script>

<style scoped>
.form-item {
  display: flex;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.form-label {
  text-align: right;
  padding-right: var(--spacing-md);
  margin-bottom: var(--spacing-xs);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.form-item-content {
  flex: 1;
  min-width: 0;
}

.error-message {
  color: var(--color-danger);
  font-size: var(--text-xs);
  margin-top: var(--spacing-xs);
}

.help-text {
  color: var(--color-text-tertiary);
  font-size: var(--text-xs);
  margin-top: var(--spacing-xs);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-item {
    flex-direction: column;
  }

  .form-label {
    text-align: left;
    padding-right: 0;
  }
}
</style>
```

## 4. 测试策略

**单元测试**：
- 使用Vitest进行组件单元测试
- 测试组件的基本渲染、props传递、事件触发
- 覆盖率目标：80%以上

**集成测试**：
- 测试组件之间的交互
- 测试表单验证流程
- 测试组件在不同场景下的表现

**可访问性测试**：
- 使用axe-core进行可访问性测试
- 确保组件符合WCAG 2.1 AA标准
- 测试键盘导航和屏幕阅读器兼容性

## 5. 实施计划

| 时间 | 任务 | 负责人 |
|------|------|--------|
| 第1周 | 按钮和卡片组件重构 | 前端团队 |
| 第2周 | 表单组件开发 | 前端团队 |
| 第3周 | 输入框和选择器组件开发 | 前端团队 |
| 第4-5周 | 页面整合与优化 | 全栈团队 |
| 第6周 | 测试与验收 | QA团队 |

## 6. 验收标准

1. 所有核心组件实现并通过单元测试
2. 组件符合设计系统规范和响应式设计要求
3. 组件通过可访问性测试
4. 文档完善，包括使用示例和API参考
5. 团队培训完成，所有开发人员熟悉新组件的使用

## 7. 后续工作

1. 继续开发剩余组件（表格、模态框等）
2. 收集用户反馈，持续优化组件
3. 建立组件使用监控机制
4. 定期更新设计系统