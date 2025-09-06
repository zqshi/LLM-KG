# 间距系统

## 概述

间距系统是设计语言的重要组成部分，用于定义界面元素之间的空间关系，建立清晰的视觉层次和节奏感。本规范定义了企业知识聚合平台（LLM-KG）的间距单位、层级和应用规则。

## 设计原则

- **一致性**：在整个产品中使用统一的间距系统
- **节奏感**：通过间距的变化创造视觉节奏和层次感
- **响应式**：根据不同屏幕尺寸调整间距
- **简洁性**：保持间距系统的简洁性，避免过多的间距选项

## 基础间距单位

定义基础间距单位，作为所有间距的基础。

```css
:root {
  --spacing-unit: 4px;  /* 基础间距单位 */
}
```

## 间距层级

基于基础间距单位，建立间距层级。

```css
:root {
  --spacing-xs: calc(var(--spacing-unit) * 1);  /* 4px - 微小间距 */
  --spacing-sm: calc(var(--spacing-unit) * 2);  /* 8px - 小间距 */
  --spacing-md: calc(var(--spacing-unit) * 3);  /* 12px - 中等间距 */
  --spacing-lg: calc(var(--spacing-unit) * 4);  /* 16px - 大间距 */
  --spacing-xl: calc(var(--spacing-unit) * 6);  /* 24px - 超大间距 */
  --spacing-2xl: calc(var(--spacing-unit) * 8);  /* 32px - 极大间距 */
  --spacing-3xl: calc(var(--spacing-unit) * 12); /* 48px - 特大间距 */
}
```

## 应用规范

### 内边距（Padding）
- 卡片内边距：`--spacing-lg`
- 按钮内边距：`--spacing-sm`（水平）和 `--spacing-xs`（垂直）
- 表单元素内边距：`--spacing-sm`
- 面板内边距：`--spacing-xl`

### 外边距（Margin）
- 组件之间的间距：`--spacing-lg`
- 标题与内容之间的间距：`--spacing-md`
- 段落之间的间距：`--spacing-md`
- 小元素之间的间距：`--spacing-sm`

### 布局间距
- 页面边距：`--spacing-xl`
- 网格间距：`--spacing-lg`
- 导航栏高度：`--spacing-2xl`
- 页脚高度：`--spacing-xl`

## 响应式调整

在不同屏幕尺寸上调整间距，确保良好的布局和可读性。

```css
@media (max-width: var(--breakpoint-sm)) {
  :root {
    --spacing-unit: 3px;  /* 在小屏幕上减小基础间距单位 */
  }
}

@media (max-width: var(--breakpoint-xs)) {
  :root {
    --spacing-unit: 2px;  /* 在超小屏幕上进一步减小基础间距单位 */
  }
}
```

## 实现示例

```vue
<template>
  <div class="card-example">
    <div class="card-header">
      <h3 class="card-title">卡片标题</h3>
    </div>
    <div class="card-body">
      <p class="card-text">卡片内容...</p>
      <button class="card-button">操作按钮</button>
    </div>
  </div>
</template>

<style scoped>
.card-example {
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  background-color: var(--color-bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.card-header {
  margin-bottom: var(--spacing-md);
}

.card-title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-weight-medium);
}

.card-text {
  margin-bottom: var(--spacing-md);
  font-size: var(--text-base);
}

.card-button {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--text-base);
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
}
</style>
```

## 版本历史

- v1.0: 初始版本，定义了基础间距单位和层级
- v1.1: 添加了响应式调整
- v1.2: 优化了应用规范和示例</content