# 运营与推荐管理模块

## 概述

企业门户运营管理系统，支持首页配置、推荐位管理、榜单管理、AI工具管理和用户反馈管理。

## 功能特性

### 首页配置
- 首页布局设计
- 内容模块配置
- 展示规则设置
- 页面效果预览

### 推荐位管理
- 推荐位创建和配置
- 推荐内容管理
- 推荐算法设置
- 推荐效果分析

### 榜单管理
- 各类榜单配置
- 榜单数据统计
- 榜单展示规则
- 榜单更新机制

### AI工具管理
- AI工具录入和分类
- 工具标签管理
- 工具使用统计
- 工具推荐配置

### 问题反馈管理
- 用户反馈收集
- 问题分类处理
- 反馈跟进管理
- 处理结果统计

### 数据看板
- 运营数据统计
- 用户行为分析
- 内容效果评估
- 运营指标监控

## 页面组件

### Homepage.vue
**路径**: `/src/views/operation/Homepage.vue`
**路由**: `/dashboard/operation/homepage`

### Recommendations.vue
**路径**: `/src/views/operation/Recommendations.vue`
**路由**: `/dashboard/operation/recommendations`

### Rankings.vue
**路径**: `/src/views/operation/Rankings.vue`
**路由**: `/dashboard/operation/rankings`

### Dashboard.vue
**路径**: `/src/views/operation/Dashboard.vue`
**路由**: `/dashboard/operation/dashboard`

### AI工具管理子模块

#### Tags.vue
**路径**: `/src/views/operation/ai-tools/Tags.vue`
**路由**: `/dashboard/operation/ai-tools/tags`

#### Tools.vue
**路径**: `/src/views/operation/ai-tools/Tools.vue`
**路由**: `/dashboard/operation/ai-tools/tools`

### 反馈管理子模块

#### List.vue
**路径**: `/src/views/operation/feedback/List.vue`
**路由**: `/dashboard/operation/feedback`

#### Detail.vue
**路径**: `/src/views/operation/feedback/Detail.vue`
**路由**: `/dashboard/operation/feedback/:id`

## API接口

### AI工具管理接口
```typescript
GET    /api/ai-tools/tags              // 获取工具标签
GET    /api/ai-tools/tags/all          // 获取所有标签
POST   /api/ai-tools/tags              // 创建工具标签
PUT    /api/ai-tools/tags/:id          // 更新工具标签
DELETE /api/ai-tools/tags/:id          // 删除工具标签
GET    /api/ai-tools/tags/:id/check-delete  // 检查标签删除条件

GET    /api/ai-tools                   // 获取AI工具列表
POST   /api/ai-tools                   // 创建AI工具
GET    /api/ai-tools/:id               // 获取AI工具详情
PUT    /api/ai-tools/:id               // 更新AI工具
DELETE /api/ai-tools/:id               // 删除AI工具
PATCH  /api/ai-tools/:id/status        // 更新工具状态
POST   /api/ai-tools/upload/logo       // 上传工具Logo
```

### 反馈管理接口
```typescript
GET    /api/feedback/list              // 获取反馈列表
GET    /api/feedback/:id               // 获取反馈详情
GET    /api/feedback/statistics        // 获取反馈统计
GET    /api/feedback/processors        // 获取处理人员列表
PUT    /api/feedback/:id/assign        // 分配处理人员
PUT    /api/feedback/:id/status        // 更新反馈状态
PUT    /api/feedback/:id/priority      // 更新反馈优先级
POST   /api/feedback/:id/comment       // 添加处理备注
POST   /api/feedback/:id/reply         // 回复用户反馈
GET    /api/feedback/attachment/:id/download  // 下载反馈附件
```

## AI工具管理

### 工具分类
- 文本处理工具
- 图像处理工具
- 数据分析工具
- 办公效率工具
- 开发辅助工具

### 标签管理
- 标签层级结构
- 标签使用统计
- 标签关联管理
- 标签推荐算法

### 工具状态
- **草稿** - 编辑中的工具
- **待审核** - 提交审核的工具
- **已发布** - 正常展示的工具
- **已下线** - 停用的工具

## 反馈管理

### 反馈类型
- 功能建议
- 问题报告
- 使用咨询
- 投诉建议
- 其他反馈

### 处理流程
1. 用户提交反馈
2. 系统自动分类
3. 分配处理人员
4. 问题调查处理
5. 结果反馈用户
6. 跟进效果评估

### 优先级管理
- **紧急** - 影响系统正常使用
- **高** - 重要功能问题
- **中** - 一般性问题
- **低** - 优化建议

## 运营数据

### 关键指标
- 页面访问量
- 用户活跃度
- 内容互动率
- 工具使用率
- 反馈处理效率