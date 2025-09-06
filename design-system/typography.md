# 排版系统

## 概述

排版系统是设计语言的重要组成部分，用于建立清晰的视觉层次、提升内容可读性和增强用户体验。本规范定义了企业知识聚合平台（LLM-KG）的字体、字号、行高、字重和文本样式等排版要素。

## 字体家族

选择清晰、易读的字体，确保跨平台一致性和良好的显示效果。

```css
:root {
  --font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  --font-family-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
}
```

### 应用场景
- 界面文本：`--font-family-sans`
- 代码块：`--font-family-mono`
- 标题：`--font-family-sans`（使用更大的字号和更重的字重）

## 字体大小系统

建立清晰的字体大小层级，确保内容层次分明。

```css
:root {
  --text-xs: 0.75rem;    /* 12px - 辅助文本、标签 */
  --text-sm: 0.875rem;   /* 14px - 表格内容、表单标签 */
  --text-base: 1rem;     /* 16px - 正文、按钮文本 */
  --text-lg: 1.125rem;   /* 18px - 副标题、小标题 */
  --text-xl: 1.25rem;    /* 20px - 区域标题 */
  --text-2xl: 1.5rem;    /* 24px - 页面主标题 */
  --text-3xl: 1.875rem;  /* 30px - 重要标题、统计数字 */
  --text-4xl: 2.25rem;   /* 36px - 大标题 */
}
```

## 字体权重

定义不同的字重，用于区分文本的重要性和层次。

```css
:root {
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

## 行高规范

适当的行高可以提高文本的可读性和舒适度。

```css
:root {
  --line-height-tight: 1.25;    /* 标题、统计数字 */
  --line-height-normal: 1.5;    /* 正文、表单元素 */
  --line-height-relaxed: 1.75;  /* 段落文本 */
}
```

## 文本样式

定义常见的文本样式，确保一致性。

```css
.text-xs {
  font-size: var(--text-xs);
  line-height: var(--line-height-normal);
}

.text-sm {
  font-size: var(--text-sm);
  line-height: var(--line-height-normal);
}

.text-base {
  font-size: var(--text-base);
  line-height: var(--line-height-normal);
}

.text-lg {
  font-size: var(--text-lg);
  line-height: var(--line-height-normal);
}

.text-xl {
  font-size: var(--text-xl);
  line-height: var(--line-height-tight);
  font-weight: var(--font-weight-medium);
}

.text-2xl {
  font-size: var(--text-2xl);
  line-height: var(--line-height-tight);
  font-weight: var(--font-weight-semibold);
}

.text-3xl {
  font-size: var(--text-3xl);
  line-height: var(--line-height-tight);
  font-weight: var(--font-weight-bold);
}
```

## 应用规范

### 标题层级
- 页面主标题：`--text-2xl` + `--font-weight-bold`
- 区域标题：`--text-xl` + `--font-weight-semibold`
- 卡片标题：`--text-lg` + `--font-weight-medium`

### 正文文本
- 普通正文：`--text-base` + `--font-weight-normal`
- 强调文本：`--text-base` + `--font-weight-medium`
- 辅助文本：`--text-sm` + `--font-weight-light`

### 特殊场景
- 统计数字：`--text-3xl` + `--font-weight-bold`
- 表格内容：`--text-sm` + `--font-weight-normal`
- 按钮文本：`--text-base` + `--font-weight-medium`

## 响应式排版

在不同屏幕尺寸上调整字体大小，确保良好的可读性。

```css
@media (max-width: var(--breakpoint-sm)) {
  :root {
    --text-xs: 0.7rem;    /* 11.2px */
    --text-sm: 0.8rem;    /* 12.8px */
    --text-base: 0.9rem;  /* 14.4px */
    --text-lg: 1rem;      /* 16px */
    --text-xl: 1.1rem;    /* 17.6px */
    --text-2xl: 1.3rem;   /* 20.8px */
    --text-3xl: 1.5rem;   /* 24px */
  }
}
```

## 可访问性

- 确保文本和背景之间有足够的对比度
- 避免使用过小的字号（最小不小于 12px）
- 使用语义化的 HTML 标签（h1-h6, p, span 等）
- 不要仅靠颜色来传达信息

## 实现示例

```vue
<template>
  <div class="typography-example">
    <h1 class="text-2xl font-bold">页面主标题</h1>
    <h2 class="text-xl font-semibold">区域标题</h2>
    <h3 class="text-lg font-medium">卡片标题</h3>
    <p class="text-base">普通正文内容，介绍产品功能和特点。</p>
    <p class="text-sm text-tertiary">辅助文本，提供补充信息。</p>
    <div class="stat-value text-3xl font-bold">1,234</div>
  </div>
</template>

<style scoped>
.typography-example {
  font-family: var(--font-family-sans);
}

.text-tertiary {
  color: var(--color-text-tertiary);
}

/* 其他样式... */
</style>
```

## 版本历史

- v1.0: 初始版本，定义了字体家族、大小和权重
- v1.1: 添加了行高规范和文本样式
- v1.2: 增加了响应式排版支持</content