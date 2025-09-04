# 企业内部门户系统 (员工端)

一个现代化的企业内部门户系统，为员工提供统一的信息获取、知识学习、交流互动和服务入口。

## 功能特性

### 🏠 首页
- **Banner轮播**：展示重要通知和活动
- **快速入口**：常用系统和服务的快捷访问
- **个性化推荐**：基于用户偏好的内容推荐
- **公司动态**：最新公司新闻和通知
- **领导名言**：企业文化传播

### 📰 资讯中心
- **分类浏览**：按类型查看不同资讯
- **搜索筛选**：快速找到相关内容
- **置顶功能**：重要资讯突出显示
- **互动功能**：点赞、评论、分享

### 📚 知识平台
- **知识库**：企业知识文档集中管理
- **多媒体支持**：文档、视频、演示文稿等
- **学习跟踪**：记录学习进度
- **搜索功能**：全文检索知识内容

### 💬 企业论坛
- **话题讨论**：员工交流互动平台
- **分类管理**：不同类型的讨论区
- **回复系统**：支持多级回复
- **热门排行**：活跃话题展示

### 🛍️ 跳蚤市场
- **二手交易**：员工闲置物品交易
- **分类筛选**：按类型、价格等筛选
- **商品管理**：发布、编辑、删除商品
- **联系功能**：买卖双方沟通

### 👤 个人中心
- **个人资料**：信息展示和编辑
- **我的内容**：发布的帖子、商品等
- **消息通知**：系统通知和互动消息
- **设置中心**：个性化配置

## 技术栈

- **框架**：Vue 3 + TypeScript
- **UI库**：Element Plus
- **状态管理**：Pinia
- **路由**：Vue Router 4
- **构建工具**：Vite
- **样式**：SCSS
- **图表**：ECharts
- **测试**：Vitest

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
# 启动完整开发环境（包含mock服务器）
npm run dev:full

# 或者分别启动
npm run mock    # 启动mock服务器 (http://localhost:3007)
npm run dev     # 启动前端开发服务器 (http://localhost:3001)
```

### 构建生产版本

```bash
npm run build
```

### 运行测试

```bash
npm run test        # 运行测试
npm run test:watch  # 监听模式
npm run test:ui     # UI界面模式
```

### 代码质量检查

```bash
npm run lint        # ESLint检查并修复
npm run format      # Prettier格式化
npm run typecheck   # TypeScript类型检查
```

## 项目结构

```
enterprise-portal/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── common/         # 通用组件
│   │   └── layout/         # 布局组件
│   ├── views/              # 页面组件
│   │   ├── home/           # 首页
│   │   ├── news/           # 资讯中心
│   │   ├── knowledge/      # 知识平台
│   │   ├── forum/          # 企业论坛
│   │   ├── market/         # 跳蚤市场
│   │   └── profile/        # 个人中心
│   ├── stores/             # 状态管理
│   ├── router/             # 路由配置
│   ├── types/              # TypeScript类型定义
│   ├── styles/             # 样式文件
│   └── utils/              # 工具函数
├── mock-server.cjs         # Mock数据服务器
└── README.md
```

## 特性说明

### 响应式设计
- 支持桌面端和移动端
- 自适应布局和交互
- 触摸友好的操作体验

### 现代化UI
- Material Design风格
- 流畅的动画过渡
- 直观的用户界面

### 性能优化
- 路由懒加载
- 组件按需加载
- 图片懒加载优化

### 开发体验
- TypeScript类型安全
- 热模块替换(HMR)
- 自动代码格式化
- 完整的ESLint配置

## 开发规范

### 代码风格
- 使用Prettier进行代码格式化
- 遵循ESLint规则
- TypeScript严格模式

### 组件开发
- 使用Composition API
- 类型安全的props定义
- 统一的命名规范

### 状态管理
- 使用Pinia进行状态管理
- 模块化store设计
- 响应式数据处理

## 部署说明

### 生产构建
```bash
npm run build
```

构建产物位于 `dist/` 目录，可直接部署到静态文件服务器。

### 环境变量
可通过 `.env` 文件配置环境变量：
```
VITE_API_BASE_URL=http://localhost:3007
```

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证，详情请查看 [LICENSE](LICENSE) 文件。

## 支持

如有问题或建议，请联系：
- 邮箱：support@company.com
- 内部技术支持群：#tech-support