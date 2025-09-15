# 仪表盘页面跳转链接修复

## 问题描述

仪表盘页面中的【前往详情】按钮点击后出现404错误，涉及以下四个区域：

1. **用户活跃度区域** - 跳转到不存在的 `/analytics/activity`
2. **内容类型分布** - 跳转到不存在的 `/analytics/content`  
3. **系统监控** - 跳转到不存在的 `/system/monitor`
4. **待办任务详情** - 跳转到不完整的 `/audit/center`

## 修复方案

### 1. 用户活跃度趋势详情
**修复前：** `/analytics/activity` (404错误)  
**修复后：** `/dashboard/rbac/users` (用户管理页面)

### 2. 内容类型分布详情  
**修复前：** `/analytics/content` (404错误)  
**修复后：** `/dashboard/content/dashboard` (内容数据看板)

### 3. 系统监控详情
**修复前：** `/system/monitor` (404错误)  
**修复后：** `/dashboard/system/settings` (系统配置页面)

### 4. 待办任务详情
**修复前：** `/audit/center` (路径不完整)  
**修复后：** `/dashboard/audit/center` (审核中心)

## 修改的文件

### 1. `src/views/dashboard/index.vue`
- 修复了详情模态框中的跳转URL配置
- 修正了属性名匹配问题（`todayActive` → `todayActiveUsers`，`pendingTasks` → `pendingAuditCount`）

### 2. `src/components/dashboard/SystemMonitor.vue`  
- 修复了系统监控组件中的跳转路径

### 3. `src/components/dashboard/PendingTasks.vue`
- 修复了待办任务组件中的跳转路径
- 更新了任务类型映射中的路由配置

## 路由映射关系

| 功能区域 | 跳转目标 | 对应页面 |
|---------|---------|---------|
| 用户活跃度 | `/dashboard/rbac/users` | 用户管理 |
| 内容分布 | `/dashboard/content/dashboard` | 内容数据看板 |
| 系统监控 | `/dashboard/system/settings` | 系统配置 |
| 待办任务 | `/dashboard/audit/center` | 审核中心 |

## 验证结果

✅ 项目构建成功，无编译错误  
✅ 所有跳转链接指向现有的有效路由  
✅ TypeScript类型检查通过  
✅ 路由配置完整且正确

## 附加修复：百分比显示格式优化

### 问题描述
用户活跃度区域的百分比显示只保留一位小数，需要改为保留两位小数以提高精度。

### 修复内容
**修改文件：** `src/components/dashboard/MetricsCards.vue`

1. **趋势百分比格式化函数**
   - `formatTrend()`: `toFixed(1)` → `toFixed(2)`
   - `getTrendText()`: `toFixed(1)` → `toFixed(2)`

2. **系统监控百分比格式化**
   **修改文件：** `src/views/dashboard/index.vue`
   - CPU使用率: `toFixed(1)` → `toFixed(2)`
   - 内存使用率: `toFixed(1)` → `toFixed(2)`

### 修复效果
- **修复前：** 用户活跃度趋势显示为 `+5.1%`、`-2.3%`
- **修复后：** 用户活跃度趋势显示为 `+5.12%`、`-2.34%`
- **系统监控：** CPU和内存使用率也统一显示两位小数

## 使用说明

修复后，用户在仪表盘页面点击各个区域的【前往详情】按钮时，将正确跳转到对应的功能页面：

1. **用户活跃度** → 用户管理页面，可查看用户列表和活跃情况
2. **内容类型分布** → 内容数据看板，可查看详细的内容统计
3. **系统监控** → 系统配置页面，可查看和配置系统设置
4. **待办任务** → 审核中心，可处理各类待审核任务

所有跳转都将在当前窗口中打开，保持良好的用户体验。

### 数据显示优化
- 所有百分比数据现在统一保留两位小数，提供更精确的数据展示
- 用户活跃度趋势、系统资源使用率等关键指标显示更加精准

## 附加修复：整数显示格式优化

### 问题描述
用户活跃度趋势卡片中的"总新增"以及详情页新增内容显示带有小数点，需要改为显示整数。

### 修复内容

**1. ActivityPreviewCard组件 (`src/components/dashboard/ActivityPreviewCard.vue`)**
- **平均活跃用户数格式化：** `(avgActiveUsers / 1000).toFixed(1)` → `Math.round(avgActiveUsers / 1000)`
- **效果：** 大于1000的用户数显示为 `5k` 而不是 `5.2k`

**2. ContentPreviewCard组件 (`src/components/dashboard/ContentPreviewCard.vue`)**
- **总内容数格式化：** `(total / 1000).toFixed(1)` → `Math.round(total / 1000)`
- **效果：** 大于1000的内容数显示为 `3k` 而不是 `3.1k`

**3. ActivityChart组件 (`src/components/dashboard/ActivityChart.vue`)**
- **Y轴标签格式化：** `(value / 1000).toFixed(1)` → `Math.round(value / 1000)`
- **Tooltip新增内容格式化：** `${newContent}篇` → `${Math.round(newContent)}篇`
- **Tooltip已审核内容格式化：** `${auditedContent}篇` → `${Math.round(auditedContent)}篇`
- **效果：** 图表Y轴显示为 `2K` 而不是 `2.1K`，鼠标悬停显示整数内容数量

**4. ActivityPreviewCard组件总新增优化**
- **总新增格式化：** 支持大数值显示，超过1000时显示为 `5k` 格式
- **效果：** 总新增显示为 `1k`、`2k` 而不是原始数字或小数

### 修复效果
- **修复前：** 总新增显示为 `1.2k`、`3.5k`
- **修复后：** 总新增显示为 `1k`、`4k`
- **统一性：** 所有数量相关的显示都使用整数，保持界面简洁

## 最新修复：显示优化问题

### 问题描述
1. **待办任务详情页面滚动问题：** 待办较多时无法滚动查看全部内容
2. **最新反馈信息显示不全：** 反馈内容显示不完整，布局需要优化

### 修复内容

**1. 待办任务详情页面滚动优化**

**修改文件：** `src/views/dashboard/index.vue`
- **详情模态框优化：** 添加 `tasks-detail-modal` 类名，支持特殊样式
- **容器结构优化：** 包装 `PendingTasks` 组件到 `tasks-detail-container` 中
- **显示数量增加：** 将 `max-display-count` 从默认5个增加到20个

**CSS样式优化：**
```css
.tasks-detail-modal :deep(.el-dialog) {
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.tasks-detail-container {
  height: 60vh;
  overflow-y: auto;
  padding: var(--spacing-lg);
}
```

**修改文件：** `src/components/dashboard/PendingTasks.vue`
- **卡片布局优化：** 确保 `el-card__body` 具有正确的flex布局
- **滚动区域限制：** 设置 `max-height: 400px` 确保滚动功能正常

**2. 最新反馈信息显示优化**

**修改文件：** `src/components/dashboard/RecentFeedback.vue`
- **卡片布局优化：** 确保 `el-card__body` 具有正确的flex布局
- **反馈项高度优化：** 设置 `min-height: 120px` 确保内容有足够空间
- **文本显示优化：** 
  - 增加显示行数：`-webkit-line-clamp: 2` → `-webkit-line-clamp: 3`
  - 添加 `word-break: break-word` 处理长文本
  - 设置 `min-height: 63px` 确保文本区域稳定
- **头部布局优化：** 添加 `flex-wrap: wrap` 和 `gap` 处理响应式布局

### 修复效果

**待办任务详情页面：**
- ✅ 支持滚动查看所有待办任务（最多显示20个）
- ✅ 模态框高度自适应（最大80vh）
- ✅ 移动端优化（45vh高度）

**最新反馈信息：**
- ✅ 反馈内容显示3行文本（原来2行）
- ✅ 长文本自动换行，不会溢出
- ✅ 反馈项最小高度120px，确保布局稳定
- ✅ 响应式布局优化，适配不同屏幕尺寸