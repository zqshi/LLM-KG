# 设计系统使用指南

## 概述

本指南详细介绍了企业知识聚合平台（LLM-KG）设计系统的使用方法，包括变量系统、组件样式、布局规范和最佳实践。旨在帮助开发人员创建一致、美观且易于维护的用户界面。

## 如何使用

### 在Vue项目中使用

1. **导入主样式文件**

   在`App.vue`中导入主样式入口文件：

   ```vue
   <style lang="scss">
   @import './styles/main.scss';
   </style>
   ```

2. **使用设计系统变量**

   设计系统提供了丰富的SCSS变量和CSS自定义属性，可以在组件样式中直接使用：

   ```scss
   .my-component {
     background-color: var($color-bg-card);
     border-radius: var($radius-md);
     padding: var($spacing-md);
     font-size: var($text-base);
   }
   ```

   或者在CSS中使用自定义属性：

   ```css
   .my-component {
     background-color: var(--color-bg-card);
     border-radius: var(--radius-md);
     padding: var(--spacing-md);
     font-size: var(--text-base);
   }
   ```

## 变量系统

### 颜色系统

设计系统提供了一套完整的颜色体系，包括主色调、功能色和中性色。

#### 主色调

- `$color-primary` / `--color-primary`: #2563eb - 品牌蓝色
- `$color-primary-hover` / `--color-primary-hover`: #3b82f6 - 悬停状态
- `$color-primary-active` / `--color-primary-active`: #1d4ed8 - 激活状态
- `$color-primary-light` / `--color-primary-light`: #dbeafe - 浅色背景

#### 功能色

- 成功: `$color-success` / `--color-success`: #10b981
- 警告: `$color-warning` / `--color-warning`: #f59e0b
- 危险: `$color-danger` / `--color-danger`: #ef4444
- 信息: `$color-info` / `--color-info`: #3b82f6

#### 中性色

- 文本: `$color-text-primary` / `--color-text-primary`: #111827
- 次要文本: `$color-text-secondary` / `--color-text-secondary`: #374151
-  tertiary文本: `$color-text-tertiary` / `--color-text-tertiary`: #6b7280
- 禁用文本: `$color-text-disabled` / `--color-text-disabled`: #9ca3af

#### 背景色

- 页面背景: `$color-bg-page` / `--color-bg-page`: #f9fafb
- 卡片背景: `$color-bg-card` / `--color-bg-card`: #ffffff
- 区域背景: `$color-bg-section` / `--color-bg-section`: #f3f4f6

#### 边框色

- 主要边框: `$color-border-primary` / `--color-border-primary`: #d1d5db
- 浅色边框: `$color-border-light` / `--color-border-light`: #e5e7eb
- 更浅边框: `$color-border-lighter` / `--color-border-lighter`: #f3f4f6

### 间距系统

间距系统基于4px的基础单位，提供了多个层级的间距值：

- `$spacing-xs` / `--spacing-xs`: 4px
- `$spacing-sm` / `--spacing-sm`: 8px
- `$spacing-md` / `--spacing-md`: 12px
- `$spacing-lg` / `--spacing-lg`: 16px
- `$spacing-xl` / `--spacing-xl`: 24px
- `$spacing-xxl` / `--spacing-2xl`: 32px
- `$spacing-3xl` / `--spacing-3xl`: 48px

### 圆角系统

- `$radius-xs` / `--radius-xs`: 2px
- `$radius-sm` / `--radius-sm`: 4px
- `$radius-md` / `--radius-md`: 6px
- `$radius-lg` / `--radius-lg`: 8px
- `$radius-xl` / `--radius-xl`: 12px
- `$radius-2xl` / `--radius-2xl`: 16px
- `$radius-full` / `--radius-full`: 9999px (圆形)

### 字体系统

#### 字体家族

- 无衬线字体: `$font-family-sans` / `--font-family-sans`: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif
- 等宽字体: `$font-family-mono` / `--font-family-mono`: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace

#### 字体大小

- `$text-xs` / `--text-xs`: 0.75rem (12px)
- `$text-sm` / `--text-sm`: 0.875rem (14px)
- `$text-base` / `--text-base`: 1rem (16px)
- `$text-lg` / `--text-lg`: 1.125rem (18px)
- `$text-xl` / `--text-xl`: 1.25rem (20px)
- `$text-2xl` / `--text-2xl`: 1.5rem (24px)
- `$text-3xl` / `--text-3xl`: 1.875rem (30px)
- `$text-4xl` / `--text-4xl`: 2.25rem (36px)

#### 字体权重

- `$font-weight-light` / `--font-weight-light`: 300
- `$font-weight-normal` / `--font-weight-normal`: 400
- `$font-weight-medium` / `--font-weight-medium`: 500
- `$font-weight-semibold` / `--font-weight-semibold`: 600
- `$font-weight-bold` / `--font-weight-bold`: 700

#### 行高

- `$line-height-tight` / `--line-height-tight`: 1.25
- `$line-height-normal` / `--line-height-normal`: 1.5
- `$line-height-relaxed` / `--line-height-relaxed`: 1.75

## 组件样式

### 按钮

设计系统提供了三种按钮类型：主要按钮、次要按钮和文本按钮。

```vue
<template>
  <button class="btn-primary">主要按钮</button>
  <button class="btn-secondary">次要按钮</button>
  <button class="btn-text">文本按钮</button>
</template>

<style scoped>
.btn-primary {
  background-color: var($color-primary);
  color: white;
  border: 1px solid var($color-primary);
  border-radius: var($radius-sm);
  padding: var($spacing-xs) var($spacing-sm);
  font-size: var($text-base);
  font-weight: var($font-weight-medium);
  cursor: pointer;
}

.btn-secondary {
  background-color: transparent;
  color: var($color-text-secondary);
  border: 1px solid var($color-border-primary);
  border-radius: var($radius-sm);
  padding: var($spacing-xs) var($spacing-sm);
  font-size: var($text-base);
  font-weight: var($font-weight-medium);
  cursor: pointer;
}

.btn-text {
  background-color: transparent;
  color: var($color-primary);
  border: none;
  padding: var($spacing-xs) var($spacing-sm);
  font-size: var($text-base);
  font-weight: var($font-weight-medium);
  cursor: pointer;
}
</style>
```

### 卡片

卡片是常用的信息容器，包含头部、主体和底部三个部分。

```vue
<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">卡片标题</h3>
    </div>
    <div class="card-body">
      <p>卡片内容...</p>
    </div>
    <div class="card-footer">
      <button class="btn-primary">确认</button>
      <button class="btn-secondary">取消</button>
    </div>
  </div>
</template>

<style scoped>
.card {
  background-color: var($color-bg-card);
  border-radius: var($radius-lg);
  border: 1px solid var($color-border-primary);
  box-shadow: var($shadow-card);
  padding: var($spacing-lg);
  margin-bottom: var($spacing-xl);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var($spacing-md);
  padding-bottom: var($spacing-md);
  border-bottom: 1px solid var($color-border-light);
}

.card-title {
  font-size: var($text-lg);
  font-weight: var($font-weight-medium);
  margin: 0;
}

.card-body {
  margin-bottom: var($spacing-md);
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: var($spacing-md);
  padding-top: var($spacing-md);
  border-top: 1px solid var($color-border-light);
}
</style>
```

### 表单

表单元素包括标签、输入框、帮助文本和操作按钮。

```vue
<template>
  <form class="form">
    <div class="form-group">
      <label for="username" class="form-label">用户名</label>
      <input type="text" id="username" class="form-control" placeholder="请输入用户名">
      <p class="form-help-text">用户名长度为 3-20 个字符</p>
    </div>
    <div class="form-actions">
      <button type="button" class="btn-secondary">取消</button>
      <button type="submit" class="btn-primary">提交</button>
    </div>
  </form>
</template>

<style scoped>
.form {
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: var($spacing-lg);
}

.form-label {
  display: block;
  margin-bottom: var($spacing-xs);
  font-size: var($text-sm);
  font-weight: var($font-weight-medium);
  color: var($color-text-secondary);
}

.form-control {
  width: 100%;
  padding: var($spacing-sm);
  font-size: var($text-base);
  border: 1px solid var($color-border-primary);
  border-radius: var($radius-sm);
  background-color: var($color-bg-card);
  color: var($color-text-primary);
}

.form-control:focus {
  outline: none;
  border-color: var($color-primary);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.form-help-text {
  margin-top: var($spacing-xs);
  font-size: var($text-xs);
  color: var($color-text-tertiary);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var($spacing-md);
  margin-top: var($spacing-xl);
}
</style>
```

## 布局系统

### 管理后台布局

管理后台采用侧边栏+顶部栏+内容区的三栏布局。

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

<style scoped>
.layout-admin {
  display: flex;
  min-height: 100vh;
}

.layout-admin-sidebar {
  width: 280px;
  background-color: var($color-bg-card);
  border-right: 1px solid var($color-border-primary);
  padding: var($spacing-lg);
  overflow-y: auto;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 10;
  transition: width var($transition-medium);
}

/* 折叠状态 */
.layout-admin-sidebar.collapsed {
  width: 64px;
}

.layout-admin-main {
  flex: 1;
  margin-left: 280px;
  transition: margin-left var($transition-medium);
}

/* 侧边栏折叠时 */
.layout-admin-sidebar.collapsed ~ .layout-admin-main {
  margin-left: 64px;
}

.layout-admin-header {
  height: 64px;
  background-color: var($color-bg-card);
  border-bottom: 1px solid var($color-border-primary);
  padding: 0 var($spacing-xl);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 5;
}

.layout-admin-content {
  padding: var($spacing-xl);
  background-color: var($color-bg-page);
  min-height: calc(100vh - 64px);
}
</style>
```

## 响应式设计

设计系统支持响应式布局，提供了以下断点：

- `$breakpoint-xs` / `--breakpoint-xs`: 480px
- `$breakpoint-sm` / `--breakpoint-sm`: 640px
- `$breakpoint-md` / `--breakpoint-md`: 768px
- `$breakpoint-lg` / `--breakpoint-lg`: 1024px
- `$breakpoint-xl` / `--breakpoint-xl`: 1280px
- `$breakpoint-2xl` / `--breakpoint-2xl`: 1536px

可以使用SCSS的mixin来实现响应式设计：

```scss
.my-component {
  padding: var($spacing-md);

  // 在小屏幕上调整样式
  @include respond-below(sm) {
    padding: var($spacing-sm);
    font-size: var($text-sm);
  }
}
```

## 最佳实践

1. **使用设计系统变量**：始终使用设计系统提供的变量，而不是硬编码的颜色、间距或字体大小。

2. **组件化开发**：将UI元素封装为可复用的组件，并使用设计系统的样式规范。

3. **保持一致性**：在整个应用中保持视觉和交互的一致性，减少用户认知负担。

4. **考虑可访问性**：确保所有用户，包括使用辅助技术的用户，都能便捷地使用产品。

5. **优化性能**：避免不必要的复杂样式和动画，确保页面加载速度和响应性能。

## 后续计划

1. 开发更多高级组件，如表格、树组件、图表等
2. 实现可视化的主题配置工具
3. 建立设计系统的自动化测试流程
4. 优化设计系统的性能和加载速度

通过遵循本指南，开发人员可以创建一致、美观且易于维护的用户界面，提升用户体验和开发效率。