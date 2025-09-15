# 管理后台文档

## 项目概述

企业内部门户系统管理后台，基于 Vue 3 + TypeScript + Element Plus 构建的现代化管理系统。

## 文档结构

### 认证模块
- [登录系统](./auth/README.md) - 用户登录、认证相关功能

### 核心功能模块
- [全局仪表盘](./dashboard/README.md) - 系统概览和数据统计
- [认证与权限管理](./rbac/README.md) - 用户、角色、权限管理
- [内容管理](./content/README.md) - 内容发布、审核、分类管理
- [资讯聚合管理](./news/README.md) - 资讯源和内容池管理
- [Banner管理](./banner/README.md) - 轮播图和广告位管理
- [跳蚤市场管理](./flea-market/README.md) - 二手交易平台管理
- [领导名言管理](./quotation/README.md) - 名言录入和展示配置
- [统一审核中心](./audit/README.md) - 跨模块内容审核
- [运营与推荐管理](./operation/README.md) - 运营活动和推荐位管理
- [门户配置管理](./portal-config/README.md) - 门户页面配置和版本管理
- [配置与审计](./system/README.md) - 系统设置和审计日志

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（包含Mock API）
npm run dev:full

# 仅启动前端
npm run dev

# 仅启动Mock服务器
npm run mock
```

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **构建工具**: Vite
- **代码规范**: ESLint + Prettier
- **测试**: Vitest