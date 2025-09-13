# 企业知识聚合平台 (LLM-KG)

一个完整的企业知识聚合解决方案，包含管理后台、设计系统和共享包。

## 项目结构

```
LLM-KG/
├── admin-dashboard/         # 管理后台 (管理员使用)
│   ├── src/                 # 前端源码
│   ├── mock/                # Mock数据服务
│   ├── package.json
│   └── README.md
├── design-system/           # 设计系统
│   ├── components/          # 组件设计规范
│   ├── layout/              # 布局系统规范
│   ├── patterns/            # 设计模式规范
│   └── README.md
├── packages/
│   └── shared/              # 共享工具包
├── README.md
└── package.json             # 根级配置和脚本
```

## 系统组成

### 管理后台 (admin-dashboard)
面向管理员的后台管理系统，提供：
- 🏠 全局数据仪表盘
- 🔐 权限管理 (RBAC)
- 📄 内容管理
- 📰 资讯管理
- 🖼️ Banner管理
- 🛍️ 跳蚤市场管理
- 💬 名言管理
- ✅ 审核中心
- ⚙️ 运营管理
- 🔧 系统配置

### 设计系统 (design-system)
统一的设计语言和组件规范，确保产品界面的视觉一致性和交互体验的连贯性：
- 颜色系统规范
- 排版系统规范
- 间距系统规范
- 组件设计规范
- 布局系统规范
- 设计模式规范

### 共享包 (packages/shared)
跨项目共享的工具函数和类型定义

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- pnpm >= 9.0.0

### 安装依赖

```bash
pnpm install
```

### 管理后台开发

```bash
# 进入管理后台目录
cd admin-dashboard

# 安装依赖
npm install

# 启动完整开发环境（包含mock服务器）
npm run dev:full

# 或者分别启动
npm run mock    # 启动mock服务器
npm run dev     # 启动前端开发服务器
```

### 根目录快捷命令

```bash
# 在根目录下运行管理后台开发环境
pnpm dev

# 代码质量检查
pnpm lint       # ESLint检查
pnpm format     # Prettier格式化
pnpm typecheck  # TypeScript类型检查
```

## 技术栈

- **前端框架**：Vue 3 + TypeScript
- **UI组件库**：Element Plus
- **状态管理**：Pinia
- **路由管理**：Vue Router 4
- **构建工具**：Vite
- **样式**：SCSS
- **图表**：ECharts
- **测试框架**：Vitest
- **代码规范**：ESLint + Prettier + Stylelint

## 端口分配

根据项目配置和实际运行情况：

- 管理后台开发服务器：http://localhost:3108 (默认3106)
- 管理后台Mock服务：http://localhost:3008
- 开发环境API基础路径：/api

## 开发指南

1. **项目独立性**：各模块相对独立，可以单独开发、测试和部署
2. **代码复用**：通过共享包和设计系统实现代码复用
3. **设计一致性**：所有UI组件遵循设计系统规范
4. **权限控制**：管理后台具有完整的RBAC权限控制系统

## 部署说明

### 管理后台构建
```bash
cd admin-dashboard
npm run build
```

构建产物位于 `admin-dashboard/dist/` 目录，可直接部署到静态文件服务器。

### Netlify 部署

管理后台已经配置好可以通过 Netlify 进行托管演示。详细的部署指南请参考 [README_NETLIFY.md](README_NETLIFY.md) 文件。

```bash
cd admin-dashboard
./deploy-netlify.sh
```

或者手动部署：
```bash
cd admin-dashboard
npm run build
netlify deploy --prod
```

## 许可证

MIT License