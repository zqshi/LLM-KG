# 认证与权限管理模块 (RBAC)

## 概述

基于角色的访问控制系统，提供完整的用户、角色、权限管理功能。

## 功能特性

### 组织架构管理
- 部门层级结构管理
- 组织架构可视化
- 部门人员分配

### 用户管理
- 用户信息维护
- 用户状态管理
- 批量用户操作
- 用户权限查看

### 角色管理
- 角色定义和配置
- 角色权限分配
- 角色继承关系
- 角色使用统计

### 权限管理
- 权限点定义
- 权限分类管理
- 权限依赖关系
- 权限使用监控

### 用户授权
- 用户角色分配
- 临时权限授予
- 权限审批流程
- 授权历史记录

### 数据同步
- 外部系统数据同步
- 同步规则配置
- 同步状态监控
- 冲突处理机制

## 页面组件

### Organizations.vue
**路径**: `/src/views/rbac/Organizations.vue`
**路由**: `/dashboard/rbac/organizations`
**权限**: `rbac:org:view`

### Users.vue
**路径**: `/src/views/rbac/Users.vue`
**路由**: `/dashboard/rbac/users`
**权限**: `rbac:user:view`

### Roles.vue
**路径**: `/src/views/rbac/Roles.vue`
**路由**: `/dashboard/rbac/roles`
**权限**: `rbac:role:view`

### Permissions.vue
**路径**: `/src/views/rbac/Permissions.vue`
**路由**: `/dashboard/rbac/permissions`
**权限**: `rbac:permission:view`

### UserRoles.vue
**路径**: `/src/views/rbac/UserRoles.vue`
**路由**: `/dashboard/rbac/user-roles`
**权限**: `rbac:user:assign`

### SyncConfig.vue
**路径**: `/src/views/rbac/SyncConfig.vue`
**路由**: `/dashboard/rbac/sync-config`
**权限**: `rbac:sync:config`

## API接口

### 通用接口
```typescript
GET /api/common/roles        // 获取角色列表
GET /api/common/departments  // 获取部门列表
GET /api/rbac/users         // 获取用户列表
GET /api/rbac/users/:id     // 获取用户详情
```

## 权限模型

### 权限点命名规范
- `模块:资源:操作` 格式
- 例如：`rbac:user:view`、`rbac:role:edit`

### 角色层级
- 超级管理员：所有权限
- 系统管理员：系统配置权限
- 业务管理员：业务模块权限
- 普通用户：基础查看权限

## 数据同步

支持与外部系统（如AD、LDAP）进行用户数据同步：
- 定时同步任务
- 增量数据更新
- 冲突解决策略
- 同步日志记录