# 颜色系统

## 概述

颜色系统是设计语言的核心组成部分，用于传达品牌特性、建立视觉层次和引导用户注意力。本规范定义了企业知识聚合平台（LLM-KG）的颜色体系，包括主色调、辅助色、中性色及其应用场景。

## 颜色模型

所有颜色均基于 RGB 和 HSL 色彩模型定义，并提供十六进制值（#RRGGBB）以便在代码中使用。

## 核心颜色

### 主色调

主色调代表品牌特性，用于关键交互元素和品牌识别。

```css
:root {
  --color-primary: #2563eb;     /* 主色 - 蓝色 */
  --color-primary-light: #3b82f6;  /* 主色浅色 */
  --color-primary-dark: #1d4ed8;   /* 主色深色 */
  --color-primary-hover: #3b82f6;  /* 悬停状态 */
  --color-primary-active: #1e40af; /* 激活状态 */
}
```

### 辅助色

辅助色用于强调重要信息、区分不同功能模块和提供交互反馈。

```css
:root {
  /* 成功 */
  --color-success: #10b981;     /* 成功色 */
  --color-success-light: #d1fae5;  /* 成功浅色 */
  --color-success-dark: #059669;   /* 成功深色 */
  
  /* 警告 */
  --color-warning: #f59e0b;     /* 警告色 */
  --color-warning-light: #fef3c7;  /* 警告浅色 */
  --color-warning-dark: #d97706;   /* 警告深色 */
  
  /* 错误/危险 */
  --color-danger: #ef4444;      /* 错误色 */
  --color-danger-light: #fee2e2;   /* 错误浅色 */
  --color-danger-dark: #dc2626;    /* 错误深色 */
  
  /* 信息 */
  --color-info: #3b82f6;        /* 信息色 */
  --color-info-light: #dbeafe;     /* 信息浅色 */
  --color-info-dark: #2563eb;      /* 信息深色 */
}
```

## 中性色

中性色用于文本、背景和边框，建立清晰的视觉层次。

```css
:root {
  /* 文本颜色 */
  --color-text-primary: #111827;  /* 主文本 */
  --color-text-secondary: #374151; /* 次要文本 */
  --color-text-tertiary: #6b7280;  /* 提示文本 */
  --color-text-disabled: #9ca3af;  /* 禁用文本 */
  
  /* 背景颜色 */
  --color-bg-page: #f9fafb;      /* 页面背景 */
  --color-bg-card: #ffffff;      /* 卡片背景 */
  --color-bg-elevated: #f8fafc;  /* 悬浮背景 */
  --color-bg-disabled: #f3f4f6;  /* 禁用背景 */
  
  /* 边框颜色 */
  --color-border-light: #e5e7eb; /* 浅色边框 */
  --color-border-primary: #d1d5db; /* 主要边框 */
  --color-border-dark: #9ca3af;  /* 深色边框 */
}
```

## 深色模式

深色模式为低光环境提供更好的视觉体验，减少眼睛疲劳。

```css
:root[data-theme="dark"] {
  /* 文本颜色 */
  --color-text-primary: #f9fafb;  /* 主文本 */
  --color-text-secondary: #e5e7eb; /* 次要文本 */
  --color-text-tertiary: #d1d5db;  /* 提示文本 */
  --color-text-disabled: #9ca3af;  /* 禁用文本 */
  
  /* 背景颜色 */
  --color-bg-page: #0f172a;      /* 页面背景 */
  --color-bg-card: #1e293b;      /* 卡片背景 */
  --color-bg-elevated: #334155;  /* 悬浮背景 */
  --color-bg-disabled: #475569;  /* 禁用背景 */
  
  /* 边框颜色 */
  --color-border-light: #334155; /* 浅色边框 */
  --color-border-primary: #475569; /* 主要边框 */
  --color-border-dark: #64748b;  /* 深色边框 */
}
```

## 应用规范

### 文本颜色
- 主标题：`--color-text-primary`
- 副标题：`--color-text-secondary`
- 正文：`--color-text-secondary`
- 辅助文本：`--color-text-tertiary`
- 禁用文本：`--color-text-disabled`

### 背景颜色
- 页面背景：`--color-bg-page`
- 卡片背景：`--color-bg-card`
- 按钮背景：根据状态使用主色、辅助色或中性色
- 禁用背景：`--color-bg-disabled`

### 边框颜色
- 普通边框：`--color-border-primary`
- 分割线：`--color-border-light`
- 禁用边框：`--color-border-dark`

## 可访问性

确保文本和背景之间有足够的对比度（至少 4.5:1），以满足 WCAG AA 级标准。避免使用仅靠颜色传达信息的设计，确保所有用户都能理解界面内容。

## 实现示例

```vue
<template>
  <div class="button-example">
    <button class="btn-primary">主要按钮</button>
    <button class="btn-success">成功按钮</button>
    <button class="btn-warning">警告按钮</button>
    <button class="btn-danger">危险按钮</button>
    <button class="btn-disabled" disabled>禁用按钮</button>
  </div>
</template>

<style scoped>
.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: 1px solid var(--color-primary);
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}

/* 其他按钮样式... */
</style>
```

## 版本历史

- v1.0: 初始版本，定义了主色调、辅助色和中性色
- v1.1: 添加了深色模式支持
- v1.2: 优化了颜色对比度，提升可访问性</content