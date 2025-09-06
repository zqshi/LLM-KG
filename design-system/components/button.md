# 按钮组件

## 概述

按钮是界面中最常用的交互元素之一，用于触发操作、提交表单或导航到其他页面。本规范定义了企业知识聚合平台（LLM-KG）中按钮组件的设计原则、类型、状态、样式和实现指南。

## 设计原则

- **一致性**：保持按钮样式和行为的一致性
- **明确性**：按钮的视觉设计应清晰传达其功能和状态
- **可访问性**：确保所有用户都能便捷地使用按钮
- **反馈性**：提供清晰的交互反馈
- **简洁性**：设计简洁明了，突出核心功能

## 按钮类型

### 主要按钮

用于关键操作，如提交表单、确认操作等。

```css
.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--text-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}

.btn-primary:active {
  background-color: var(--color-primary-active);
}
```

### 次要按钮

用于非关键操作，如取消、返回等。

```css
.btn-secondary {
  background-color: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--text-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: var(--color-bg-elevated);
}
```

### 文本按钮

用于辅助操作，如链接、小标签等。

```css
.btn-text {
  background-color: transparent;
  color: var(--color-primary);
  border: none;
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--text-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
}

.btn-text:hover {
  text-decoration: underline;
}
```

## 按钮状态

### 正常状态

默认显示状态。

### 悬停状态

鼠标悬停时的状态，提供视觉反馈。

### 激活状态

按钮被点击时的状态。

### 禁用状态

按钮不可点击时的状态。

```css
.btn-disabled,
.btn-primary:disabled,
.btn-secondary:disabled,
.btn-text:disabled {
  background-color: var(--color-bg-disabled);
  color: var(--color-text-disabled);
  border-color: var(--color-border-dark);
  cursor: not-allowed;
}
```

## 按钮大小

### 小号按钮

```css
.btn-sm {
  padding: calc(var(--spacing-unit) * 0.75) var(--spacing-xs);
  font-size: var(--text-sm);
}
```

### 大号按钮

```css
.btn-lg {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--text-lg);
}
```

## 应用规范

- 主要操作使用主要按钮
- 次要操作使用次要按钮
- 辅助操作使用文本按钮
- 按钮文本应简洁明了，使用动宾结构
- 避免在同一区域使用过多按钮
- 确保按钮之间有足够的间距（至少 `--spacing-md`）

## 实现示例

```vue
<template>
  <div class="button-group">
    <button class="btn-primary">提交</button>
    <button class="btn-secondary">取消</button>
    <button class="btn-text">查看详情</button>
    <button class="btn-primary btn-sm">小按钮</button>
    <button class="btn-primary btn-lg">大按钮</button>
    <button class="btn-primary" disabled>禁用按钮</button>
  </div>
</template>

<style scoped>
.button-group {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

/* 按钮样式定义... */
</style>
```

## 可访问性

- 确保按钮文本和背景有足够的对比度
- 为按钮添加适当的 ARIA 属性
- 支持键盘操作（如 Enter 和 Space 键）
- 提供清晰的焦点状态

```css
.btn-primary:focus,
.btn-secondary:focus,
.btn-text:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

## 版本历史

- v1.0: 初始版本，定义了主要、次要和文本按钮
- v1.1: 添加了按钮大小和禁用状态
- v1.2: 优化了可访问性支持