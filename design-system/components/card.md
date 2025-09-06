# 卡片组件

## 概述

卡片是界面中常用的容器元素，用于展示相关信息的集合，如数据概览、内容预览、用户信息等。本规范定义了企业知识聚合平台（LLM-KG）中卡片组件的设计原则、结构、样式、类型和实现指南。

## 设计原则

- **模块化**：卡片应作为独立的信息模块
- **层次感**：通过阴影和边框创建视觉层次
- **一致性**：保持卡片样式和布局的一致性
- **简洁性**：设计简洁明了，突出核心内容
- **响应式**：适应不同屏幕尺寸

## 卡片结构

卡片通常包含以下部分：
- 卡片头部（可选）：标题、操作按钮
- 卡片主体：主要内容区域
- 卡片底部（可选）：辅助信息、操作按钮

## 基础样式

```css
.card {
  background-color: var(--color-bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-primary);
  box-shadow: var(--shadow-card);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
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
```

## 卡片类型

### 基础卡片

包含基本信息的卡片。

```vue
<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">基础卡片</h3>
    </div>
    <div class="card-body">
      <p>这是一张基础卡片，用于展示简单信息。</p>
    </div>
  </div>
</template>
```

### 统计卡片

用于展示关键指标和统计数据。

```css
.card-stat {
  text-align: center;
  padding: var(--spacing-xl);
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
}
```

```vue
<template>
  <div class="card card-stat">
    <div class="stat-value">1,234</div>
    <div class="stat-label">活跃用户</div>
  </div>
</template>
```

### 列表卡片

包含列表数据的卡片。

```css
.card-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.card-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.card-list-item:last-child {
  border-bottom: none;
}
```

```vue
<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">列表卡片</h3>
    </div>
    <div class="card-body">
      <ul class="card-list">
        <li class="card-list-item">
          <span>项目一</span>
          <span class="text-primary">查看</span>
        </li>
        <li class="card-list-item">
          <span>项目二</span>
          <span class="text-primary">查看</span>
        </li>
      </ul>
    </div>
  </div>
</template>
```

## 卡片状态

### 正常状态

默认显示状态。

### 悬停状态

鼠标悬停时的状态，增强交互感。

```css
.card:hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-2px);
  transition: all 0.2s ease;
}
```

### 加载状态

数据加载时的状态。

```css
.card-loading {
  position: relative;
  min-height: 100px;
}

.card-loading::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
}
```

## 应用规范

- 卡片内容应相关且完整
- 避免卡片内容过于复杂或信息过载
- 确保卡片之间有足够的间距（至少 `--spacing-xl`）
- 在移动设备上适当调整卡片大小和布局
- 重要信息使用统计卡片突出显示
- 列表数据使用列表卡片清晰展示

## 实现示例

```vue
<template>
  <div class="card-grid">
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">用户信息</h3>
        <button class="btn-text">编辑</button>
      </div>
      <div class="card-body">
        <div class="user-avatar">
          <img src="/avatar.png" alt="用户头像">
        </div>
        <div class="user-info">
          <p class="user-name">张三</p>
          <p class="user-role">管理员</p>
        </div>
      </div>
      <div class="card-footer">
        <button class="btn-primary">保存</button>
        <button class="btn-secondary">取消</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-xl);
}

.user-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: var(--spacing-md);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-xs);
}

.user-role {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
}
</style>
```

## 可访问性

- 确保卡片内容文本和背景有足够的对比度
- 为卡片添加适当的 ARIA 属性
- 支持键盘操作和屏幕阅读器
- 确保交互元素有清晰的焦点状态

## 版本历史

- v1.0: 初始版本，定义了基础卡片、统计卡片和列表卡片
- v1.1: 添加了卡片状态和动画效果
- v1.2: 优化了响应式布局和可访问性支持