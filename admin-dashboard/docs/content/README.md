# 内容管理模块

## 概述

企业内部内容发布和管理系统，支持多版块内容管理、投票系统和内容审核。

## 功能特性

### 版块管理
- 内容分类和版块配置
- 版块权限设置
- 版块展示配置
- 版块数据统计

### 内容管理
- 内容发布和编辑
- 内容状态管理
- 内容搜索和筛选
- 批量内容操作

### 投票系统
- 投票活动创建
- 投票数据统计
- 投票结果分析
- 投票管理功能

### 数据看板
- 内容发布统计
- 用户活跃度分析
- 热门内容排行
- 版块活跃度对比

### 特色功能
- 内容置顶申请
- 内容加精管理
- 特色内容推荐
- 申请审批流程

## 页面组件

### Categories.vue
**路径**: `/src/views/content/Categories.vue`
**路由**: `/dashboard/content/categories`
**权限**: `content:category:view`

### Polls.vue
**路径**: `/src/views/content/Polls.vue`
**路由**: `/dashboard/content/polls`
**权限**: `content:poll:view`

### Dashboard.vue
**路径**: `/src/views/content/Dashboard.vue`
**路由**: `/dashboard/content/dashboard`
**权限**: `content:view`

### List.vue
**路径**: `/src/views/content/List.vue`
**路由**: `/dashboard/content/list`
**权限**: `content:view`

### Detail.vue
**路径**: `/src/views/content/Detail.vue`
**路由**: `/dashboard/content/detail/:id`
**权限**: `content:view`

### Edit.vue
**路径**: `/src/views/content/Edit.vue`
**路由**: `/dashboard/content/edit/:id`
**权限**: `content:edit`

### FeatureRequests.vue
**路径**: `/src/views/content/FeatureRequests.vue`
**路由**: `/dashboard/content/feature-requests`
**权限**: `content:feature:review`

### Category.vue
**路径**: `/src/views/content/Category.vue`
**路由**: `/dashboard/content/category/:code`
**权限**: `content:view`

## API接口

### 内容管理接口
```typescript
GET /api/content/categories  // 获取版块列表
GET /api/content/list       // 获取内容列表
GET /api/content/stats      // 获取内容统计
GET /api/content/hot        // 获取热门内容
```

### 投票管理接口
```typescript
GET /api/admin/polls                    // 获取投票列表
GET /api/admin/polls/overview-stats     // 获取投票概览统计
GET /api/admin/polls/:id/statistics     // 获取投票详细统计
```

## 内容状态管理

### 内容状态
- 草稿：编辑中的内容
- 待审核：提交审核的内容
- 已发布：审核通过的内容
- 已下线：被撤回的内容

### 特色标记
- 置顶：版块置顶显示
- 加精：精华内容标记
- 推荐：首页推荐展示

## 权限控制

不同角色的权限范围：
- 内容管理员：全部内容管理权限
- 版块管理员：特定版块管理权限
- 内容编辑：内容编辑和发布权限
- 审核员：内容审核权限