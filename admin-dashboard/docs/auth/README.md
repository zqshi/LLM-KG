# 登录认证模块

## 概述

管理后台的用户认证系统，提供安全的登录验证和会话管理功能。

## 功能特性

### 登录功能
- 用户名/密码登录
- 登录状态保持
- 自动跳转到目标页面
- 登录失败提示

### 安全特性
- 密码加密传输
- 会话超时处理
- 防暴力破解
- 登录日志记录

## 页面组件

### Login.vue
**路径**: `/src/views/auth/Login.vue`
**路由**: `/` 和 `/login`

**主要功能**:
- 登录表单展示
- 用户输入验证
- 登录请求处理
- 错误信息显示

## API接口

### 登录接口
```typescript
POST /api/auth/login
{
  username: string
  password: string
}
```

### 获取用户信息
```typescript
GET /api/auth/user
```

### 退出登录
```typescript
POST /api/auth/logout
```

## 状态管理

使用 Pinia store 管理用户认证状态：
- 用户信息存储
- 登录状态管理
- Token管理
- 权限信息缓存

## 路由守卫

- 未登录用户自动跳转到登录页
- 已登录用户访问登录页自动跳转到仪表盘
- 权限验证和页面访问控制