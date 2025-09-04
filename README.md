# 企业内部门户系统

一个完整的企业内部门户解决方案，包含用户端门户和管理后台。

## 项目结构

```
LLM+KG/
├── user-portal/             # 用户端门户 (员工使用)
│   ├── src/                 # 前端源码
│   ├── mock-server.cjs      # Mock数据服务
│   ├── package.json
│   └── README.md
├── admin-dashboard/         # 管理后台 (管理员使用)
│   ├── src/                 # 前端源码
│   ├── mock-server.cjs      # Mock数据服务
│   ├── package.json
│   └── README.md
├── admin-backend/           # 后端服务
└── README.md
```

## 系统组成

### 用户端门户 (user-portal)
面向企业员工的内部门户系统，提供：
- 首页信息展示
- 资讯中心
- 知识平台
- 企业论坛
- 跳蚤市场
- 个人中心

### 管理后台 (admin-dashboard)
面向管理员的后台管理系统，提供：
- 全局数据仪表盘
- 用户和权限管理
- 内容管理和审核
- 系统配置和监控
- 运营数据分析

### 后端服务 (admin-backend)
提供API服务支持前端应用

## 快速开始

### 用户端门户
```bash
cd user-portal
npm install
npm run dev:full  # 启动用户端 (http://localhost:3001)
```

### 管理后台
```bash
cd admin-dashboard
npm install
npm run dev:full  # 启动管理后台 (http://localhost:3000)
```

## 技术栈

- **前端框架**：Vue 3 + TypeScript
- **UI组件库**：Element Plus
- **状态管理**：Pinia
- **路由管理**：Vue Router 4
- **构建工具**：Vite
- **测试框架**：Vitest
- **代码规范**：ESLint + Prettier

## 端口分配

- 用户端门户：http://localhost:3001
- 管理后台：http://localhost:3000
- 用户端Mock：http://localhost:3007
- 管理后台Mock：http://localhost:3008

## 开发指南

1. **项目独立性**：用户端和管理端完全独立，可以单独开发、测试和部署
2. **代码复用**：共通组件和工具可以通过包管理进行复用
3. **API设计**：后端API需要支持两个前端应用的不同需求
4. **权限控制**：管理后台具有完整的RBAC权限控制系统

## 部署说明

每个模块都可以独立构建和部署：

```bash
# 用户端
cd user-portal && npm run build

# 管理后台  
cd admin-dashboard && npm run build
```

## 许可证

MIT License