# 跳蚤市场管理模块

## 概述

企业内部二手交易平台管理系统，支持商品分类管理、商品监控和举报处理。

## 功能特性

### 分类管理
- 商品分类体系维护
- 分类层级结构管理
- 分类属性配置
- 分类使用统计

### 商品管理
- 商品信息监控
- 商品状态管理
- 违规商品处理
- 商品数据统计

### 举报管理
- 用户举报处理
- 举报分类和优先级
- 举报处理流程
- 举报统计分析

### 数据看板
- 交易数据统计
- 用户活跃度分析
- 商品发布趋势
- 平台运营指标

## 页面组件

### Categories.vue
**路径**: `/src/views/flea-market/Categories.vue`
**路由**: `/dashboard/flea-market/categories`

**主要功能**:
- 商品分类管理
- 分类层级维护
- 分类属性设置
- 分类统计查看

### Goods.vue
**路径**: `/src/views/flea-market/Goods.vue`
**路由**: `/dashboard/flea-market/goods`

**主要功能**:
- 商品列表管理
- 商品详情查看
- 商品状态控制
- 违规商品处理

### Reports.vue
**路径**: `/src/views/flea-market/Reports.vue`
**路由**: `/dashboard/flea-market/reports`

**主要功能**:
- 举报列表管理
- 举报详情处理
- 举报状态更新
- 批量处理操作

### Dashboard.vue
**路径**: `/src/views/flea-market/Dashboard.vue`
**路由**: `/dashboard/flea-market/dashboard`

**主要功能**:
- 平台数据概览
- 交易趋势分析
- 用户行为统计
- 运营指标监控

## API接口

### 跳蚤市场接口
```typescript
GET    /api/flea-market/categories     // 获取商品分类
GET    /api/flea-market/goods         // 获取商品列表
GET    /api/flea-market/reports       // 获取举报列表
GET    /api/flea-market/reports/:id   // 获取举报详情
PATCH  /api/flea-market/reports/:id/status  // 更新举报状态
PATCH  /api/flea-market/reports/batch       // 批量处理举报
```

## 商品管理

### 商品状态
- **正常** - 正常展示的商品
- **待审核** - 新发布待审核商品
- **已下架** - 主动下架的商品
- **违规下架** - 因违规被下架的商品
- **已售出** - 交易完成的商品

### 违规处理
- 虚假信息商品
- 禁售商品类别
- 价格异常商品
- 重复发布商品

## 举报处理

### 举报类型
- 商品信息虚假
- 商品质量问题
- 交易纠纷
- 违规行为
- 其他问题

### 处理流程
1. 接收用户举报
2. 初步审核分类
3. 详细调查核实
4. 处理决定执行
5. 结果反馈通知

### 处理结果
- 举报成立：对违规商品/用户进行处罚
- 举报不成立：维持原状，记录处理结果
- 需要进一步调查：转入深度调查流程

## 数据统计

### 关键指标
- 商品发布数量
- 交易成功率
- 用户活跃度
- 举报处理效率
- 平台违规率