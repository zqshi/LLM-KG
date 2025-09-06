# 组件设计规范

## 概述

组件是UI的基本构建块，良好的组件设计可以提高开发效率、确保UI一致性并提升用户体验。本规范定义了企业知识聚合平台（LLM-KG）的组件设计原则、分类、规范和开发流程。

## 设计原则

- **单一职责**：每个组件专注于完成一个功能
- **可复用性**：设计通用组件以支持多种场景
- **可组合性**：组件之间可以灵活组合
- **一致性**：保持组件风格、行为的一致性
- **可访问性**：确保组件对所有用户可访问
- **性能优化**：避免不必要的渲染和计算
- **可测试性**：组件设计应便于单元测试和集成测试

## 组件分类

根据功能和使用范围，组件分为以下几类：

1. **基础组件**：原子级UI元素，如按钮、输入框、标签等
2. **布局组件**：用于页面布局，如容器、网格、分隔符等
3. **业务组件**：特定业务场景的组件，如统计卡片、权限控制组件等
4. **页面组件**：完整页面或页面片段

## 通用组件规范

### 组件开发规范

1. **命名规范**
   - 组件名称使用帕斯卡命名法（PascalCase）
   - 文件名称与组件名称保持一致
   - 基础组件前缀为 `Base`（如 `BaseButton`）
   - 业务组件前缀为业务域名称（如 `KnowledgeGraphCard`）

2. **代码结构**
   - 使用 Vue 3 组合式 API（`<script setup>`）
   - 组件结构顺序：模板（`<template>`）、脚本（`<script>`）、样式（`<style>`）
   - 样式使用 CSS 变量，遵循设计系统的颜色、间距和排版规范

3. **Props 设计**
   - 使用 TypeScript 接口定义 Props 类型
   - 为必要的 Props 设置默认值
   - 对 Props 进行适当的验证

### 按钮 (Button)

按钮用于触发用户交互，是最常用的基础组件之一。

#### 类型
- 主要按钮（primary）：用于主要操作
- 次要按钮（secondary）：用于次要操作
- 文本按钮（text）：用于非突出的操作
- 危险按钮（danger）：用于危险操作（如删除）

#### 尺寸
- 超小（xs）
- 小（sm）
- 中（md）：默认
- 大（lg）

#### 状态
- 正常
- 禁用
- 加载中

#### 实现示例

```vue
<template>
  <button
    class="btn"
    :class="[type, size, disabled ? 'disabled' : '', loading ? 'loading' : '']"
    :disabled="disabled || loading"
    @click="onClick"
  >
    <span v-if="loading" class="loading-spinner"></span>
    <span v-if="icon" :class="['icon', icon]"></span>
    <span v-if="$slots.default"><slot></slot></span>
  </button>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

interface ButtonProps {
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
   * 图标名称
   */
  icon?: string;
}

defineProps<ButtonProps>();

export interface ButtonEmits {
  (e: 'click'): void;
}

defineEmits<ButtonEmits>();
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius);
  font-family: var(--font-family);
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
  font-size: var(--font-size-xs);
  height: 24px;
}

.btn.sm {
  font-size: var(--font-size-sm);
  height: 32px;
}

.btn.md {
  font-size: var(--font-size-md);
  height: 40px;
}

.btn.lg {
  font-size: var(--font-size-lg);
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

/* 图标样式 */
.icon {
  margin-right: var(--spacing-xs);
  width: var(--icon-size-sm);
  height: var(--icon-size-sm);
}
</style>
```

### 输入框 (Input)

输入框用于接收用户文本输入。

#### 类型
- 文本输入框（text）
- 密码输入框（password）
- 数字输入框（number）
- 搜索输入框（search）

#### 状态
- 正常
- 聚焦
- 禁用
- 错误

#### 实现示例

```vue
<template>
  <div class="input-container" :class="{ error, disabled, focus }">
    <label v-if="label" class="label">{{ label }}</label>
    <div class="input-wrapper">
      <span v-if="prefixIcon" class="prefix-icon">{{ prefixIcon }}</span>
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
      >
      <span v-if="suffixIcon" class="suffix-icon">{{ suffixIcon }}</span>
      <button v-if="type === 'password'" class="toggle-password" @click="togglePassword">
        {{ showPassword ? '隐藏' : '显示' }}
      </button>
    </div>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, computed } from 'vue';

interface InputProps {
  /**
   * 输入框类型
   */
  type?: 'text' | 'password' | 'number' | 'search';
  /**
   * 绑定值
   */
  modelValue: string | number;
  /**
   * 标签
   */
  label?: string;
  /**
   * 占位符
   */
  placeholder?: string;
  /**
   * 是否禁用
   */
  disabled?: boolean;
  /**
   * 是否错误状态
   */
  error?: boolean;
  /**
   * 错误信息
   */
  errorMessage?: string;
  /**
   * 前缀图标
   */
  prefixIcon?: string;
  /**
   * 后缀图标
   */
  suffixIcon?: string;
}

defineProps<InputProps>();

export interface InputEmits {
  (e: 'update:modelValue', value: string | number): void;
  (e: 'focus'): void;
  (e: 'blur'): void;
}

defineEmits<InputEmits>();

const focus = ref(false);
const showPassword = ref(false);
const inputType = computed(() => {
  return props.type === 'password' && showPassword.value ? 'text' : props.type;
});

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
}

function onFocus() {
  focus.value = true;
  emit('focus');
}

function onBlur() {
  focus.value = false;
  emit('blur');
}

function togglePassword() {
  showPassword.value = !showPassword.value;
}
</script>

<style scoped>
.input-container {
  display: flex;
  flex-direction: column;
  margin-bottom: var(--spacing-md);
}

.label {
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  padding: 0 var(--spacing-md);
  height: 40px;
  background-color: var(--color-bg);
  transition: border-color 0.2s ease;
}

.input-container.focus .input-wrapper {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
}

.input-container.error .input-wrapper {
  border-color: var(--color-danger);
}

.input-container.disabled .input-wrapper {
  opacity: 0.5;
  cursor: not-allowed;
}

input {
  flex: 1;
  border: none;
  background-color: transparent;
  outline: none;
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
}

input::placeholder {
  color: var(--color-text-placeholder);
}

.prefix-icon,
.suffix-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-size-sm);
  height: var(--icon-size-sm);
  color: var(--color-text-secondary);
}

.prefix-icon {
  margin-right: var(--spacing-xs);
}

.suffix-icon {
  margin-left: var(--spacing-xs);
}

.toggle-password {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  margin-left: var(--spacing-xs);
}

.error-message {
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--color-danger);
}
</style>
```

### 卡片 (Card)

卡片用于展示相关信息的集合，是常用的内容容器。

#### 类型
- 基础卡片
- 统计卡片
- 信息卡片

#### 实现示例

```vue
<template>
  <div class="card" :class="{ shadow, bordered }">
    <div v-if="title" class="card-header">
      <h3 class="card-title">{{ title }}</h3>
      <div v-if="$slots.headerAction" class="header-action">
        <slot name="headerAction"></slot>
      </div>
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

interface CardProps {
  /**
   * 卡片标题
   */
  title?: string;
  /**
   * 是否显示阴影
   */
  shadow?: boolean;
  /**
   * 是否显示边框
   */
  bordered?: boolean;
}

defineProps<CardProps>();
</script>

<style scoped>
.card {
  background-color: var(--color-white);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.card.bordered {
  border: 1px solid var(--color-border);
}

.card.shadow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.card-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.header-action {
  display: flex;
  align-items: center;
}

.card-body {
  padding: var(--spacing-md);
}

.card-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}
</style>
```

## 组件开发流程

1. **需求分析**：明确组件的功能和使用场景
2. **设计**：设计组件的API、UI和交互
3. **实现**：编写组件代码和单元测试
4. **评审**：代码评审和UI评审
5. **文档**：编写组件使用文档
6. **发布**：将组件发布到组件库
7. **维护**：修复bug和优化组件

## 组件测试规范

1. **单元测试**：测试组件的基本功能和边界情况
2. **集成测试**：测试组件与其他组件的交互
3. **可视化测试**：确保组件UI在不同状态下的一致性
4. **性能测试**：确保组件渲染和交互性能良好

## 版本历史

| 版本 | 日期       | 变更内容                  |
|------|------------|---------------------------|
| 1.0  | 2023-10-01 | 初始版本，包含基础组件规范 |