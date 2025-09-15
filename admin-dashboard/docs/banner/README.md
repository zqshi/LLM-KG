# Banner管理模块

## 概述

企业门户Banner和广告位管理系统，支持Banner生命周期管理和审批流程。

## 功能特性

### Banner管理
- Banner创建和编辑
- 图片上传和管理
- 展示位置配置
- 生效时间设置

### 工作流管理
- Banner审批流程
- 任务分配和处理
- 状态跟踪和监控
- 历史记录查看

### 我的工作台
- 待办任务管理
- 已办任务查看
- 任务优先级设置
- 工作量统计

## 页面组件

### List.vue
**路径**: `/src/views/banner/List.vue`
**路由**: `/dashboard/banner/list`

**主要功能**:
- Banner列表展示
- Banner状态管理
- 批量操作功能
- 搜索和筛选

### MyTodo.vue
**路径**: `/src/views/banner/MyTodo.vue`
**路由**: `/dashboard/banner/my-todo`

**主要功能**:
- 个人待办任务
- 任务处理操作
- 任务详情查看
- 处理进度跟踪

### MyDone.vue
**路径**: `/src/views/banner/MyDone.vue`
**路由**: `/dashboard/banner/my-done`

**主要功能**:
- 个人已办任务
- 处理历史记录
- 任务结果查看
- 工作量统计

### StatusTracking.vue
**路径**: `/src/views/banner/StatusTracking.vue`
**路由**: `/dashboard/banner/status-tracking`

**主要功能**:
- Banner状态追踪
- 流程进度监控
- 状态变更历史
- 异常情况处理

## Banner生命周期

### 状态流转
1. **草稿** - 创建但未提交
2. **待审核** - 提交审核中
3. **审核中** - 正在审核处理
4. **已通过** - 审核通过待发布
5. **已发布** - 正在展示中
6. **已下线** - 停止展示
7. **已拒绝** - 审核未通过

### 审批流程
- 内容审核：检查Banner内容合规性
- 设计审核：检查设计质量和规范
- 业务审核：确认业务需求匹配
- 最终审批：管理层最终确认

## 权限控制

### 角色权限
- **Banner管理员**：全部Banner管理权限
- **内容审核员**：Banner内容审核权限
- **设计审核员**：Banner设计审核权限
- **业务审核员**：Banner业务审核权限
- **普通用户**：Banner查看权限

### 操作权限
- 创建Banner
- 编辑Banner
- 删除Banner
- 审核Banner
- 发布Banner
- 下线Banner