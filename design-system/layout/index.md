# 布局系统

## 概述

布局系统是设计语言的重要组成部分，用于定义界面的整体结构和组件的排列方式。本规范定义了企业知识聚合平台（LLM-KG）的布局类型、网格系统、响应式设计和实现指南。

## 设计原则

- **一致性**：保持页面布局的一致性
- **清晰性**：布局结构清晰，层次分明
- **响应式**：适应不同屏幕尺寸
- **可扩展性**：支持未来的功能扩展
- **用户体验优先**：优化用户浏览和操作体验

## 布局类型

### 管理后台布局

适用于管理控制台、仪表盘等场景。

```css
.layout-admin {
  display: flex;
  min-height: 100vh;
}

.layout-admin-sidebar {
  width: var(--sidebar-width);
  background-color: var(--color-bg-card);
  border-right: 1px solid var(--color-border-primary);
  padding: var(--spacing-lg);
  overflow-y: auto;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 10;
}

.layout-admin-main {
  flex: 1;
  margin-left: var(--sidebar-width);
}

.layout-admin-header {
  height: var(--header-height);
  background-color: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border-primary);
  padding: 0 var(--spacing-xl);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 5;
}

.layout-admin-content {
  padding: var(--spacing-xl);
  background-color: var(--color-bg-page);
  min-height: calc(100vh - var(--header-height));
}
```

```vue
<template>
  <div class="layout-admin">
    <aside class="layout-admin-sidebar">
      <!-- 侧边栏内容 -->
    </aside>
    <main class="layout-admin-main">
      <header class="layout-admin-header">
        <!-- 顶部栏内容 -->
      </header>
      <div class="layout-admin-content">
        <!-- 页面内容 -->
      </div>
    </main>
  </div>
</template>
```

### 用户门户布局

适用于面向用户的门户网站、首页等场景。

```css
.layout-portal {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.layout-portal-header {
  height: var(--header-height);
  background-color: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border-primary);
  padding: 0 var(--spacing-xl);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 10;
}

.layout-portal-content {
  flex: 1;
  padding: var(--spacing-xl);
  background-color: var(--color-bg-page);
}

.layout-portal-footer {
  height: var(--footer-height);
  background-color: var(--color-bg-card);
  border-top: 1px solid var(--color-border-primary);
  padding: 0 var(--spacing-xl);
  display: flex;
  align-items: center;
  justify-content: center;
}
```

```vue
<template>
  <div class="layout-portal">
    <header class="layout-portal-header">
      <!-- 顶部导航 -->
    </header>
    <main class="layout-portal-content">
      <!-- 页面内容 -->
    </main>
    <footer class="layout-portal-footer">
      <!-- 页脚内容 -->
    </footer>
  </div>
</template>
```

## 网格系统

网格系统用于统一页面元素的排列和对齐。

```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--spacing-lg);
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
}

.col-1 {
  grid-column: span 1;
}

.col-2 {
  grid-column: span 2;
}

/* ... 更多列宽定义 ... */

.col-12 {
  grid-column: span 12;
}
```

## 响应式设计

根据不同屏幕尺寸调整布局和组件大小。

```css
:root {
  --breakpoint-xs: 360px;
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}

@media (max-width: var(--breakpoint-sm)) {
  .layout-admin-sidebar {
    width: 100%;
    height: auto;
    position: relative;
  }

  .layout-admin-main {
    margin-left: 0;
  }

  .col-sm-12 {
    grid-column: span 12;
  }
}

@media (min-width: var(--breakpoint-md)) {
  .col-md-6 {
    grid-column: span 6;
  }
}

@media (min-width: var(--breakpoint-lg)) {
  .col-lg-4 {
    grid-column: span 4;
  }
}
```

## 应用规范

- 根据页面类型选择合适的布局
- 保持页面布局的一致性
- 使用网格系统统一元素排列
- 确保布局在不同屏幕尺寸上都有良好的显示效果
- 合理使用间距，保持界面的整洁和层次感
- 侧边栏和顶部栏使用固定定位，方便用户导航
- 内容区域使用滚动，避免页面过长

## 实现示例

```vue
<template>
  <div class="layout-admin">
    <aside class="layout-admin-sidebar">
      <div class="logo">
        <img src="/logo.png" alt="LLM-KG Logo">
      </div>
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li class="nav-item active">
            <a href="#dashboard" class="nav-link">仪表盘</a>
          </li>
          <li class="nav-item">
            <a href="#users" class="nav-link">用户管理</a>
          </li>
          <li class="nav-item">
            <a href="#content" class="nav-link">内容管理</a>
          </li>
          <li class="nav-item">
            <a href="#settings" class="nav-link">系统设置</a>
          </li>
        </ul>
      </nav>
    </aside>
    <main class="layout-admin-main">
      <header class="layout-admin-header">
        <div class="header-left">
          <button class="btn-text" @click="toggleSidebar">
            <IconMenu />
          </button>
        </div>
        <div class="header-right">
          <div class="user-info">
            <img src="/avatar.png" alt="用户头像" class="avatar">
            <span class="username">管理员</span>
          </div>
        </div>
      </header>
      <div class="layout-admin-content">
        <div class="grid-container">
          <div class="col-12 col-md-6 col-lg-4">
            <div class="card card-stat">
              <div class="stat-value">1,234</div>
              <div class="stat-label">活跃用户</div>
            </div>
          </div>
          <div class="col-12 col-md-6 col-lg-4">
            <div class="card card-stat">
              <div class="stat-value">5,678</div>
              <div class="stat-label">内容条目</div>
            </div>
          </div>
          <div class="col-12 col-md-6 col-lg-4">
            <div class="card card-stat">
              <div class="stat-value">98%</div>
              <div class="stat-label">系统可用性</div>
            </div>
          </div>
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">最近活动</h3>
              </div>
              <div class="card-body">
                <!-- 活动列表 -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { IconMenu } from '@/components/icons';

const sidebarCollapsed = ref(false);

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};
</script>

<style scoped>
.logo {
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
}

.logo img {
  max-width: 100%;
  height: auto;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: var(--spacing-xs);
}

.nav-link {
  display: block;
  padding: var(--spacing-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: var(--radius-sm);
}

.nav-link:hover {
  background-color: var(--color-bg-elevated);
  color: var(--color-primary);
}

.nav-item.active .nav-link {
  background-color: var(--color-primary-light);
  color: var(--color-primary-dark);
  font-weight: var(--font-weight-medium);
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: var(--spacing-xs);
}

.user-info {
  display: flex;
  align-items: center;
}

.username {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
}
</style>
```

## 可访问性

- 确保布局在不同屏幕尺寸和设备上都有良好的可访问性
- 支持键盘导航和屏幕阅读器
- 确保布局变更不会影响内容的可访问性
- 合理设置焦点顺序，提高键盘操作效率

## 版本历史

- v1.0: 初始版本，定义了管理后台布局和用户门户布局
- v1.1: 添加了网格系统和响应式设计
- v1.2: 优化了布局组件的可访问性和交互体验