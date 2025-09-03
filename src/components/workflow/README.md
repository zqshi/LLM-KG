# UnifiedWorkflowViewer 统一工作流查看器

一个功能强大、高度可配置的Vue 3组件，用于展示Banner审批流程。该组件融合了原有`List.vue`和`StatusTracking.vue`中的流程展示功能，提供了更统一、现代化的用户体验。

## ✨ 特性

- 🎯 **两种展示模式**: 简洁的步骤视图和详细的流程图视图
- 🔄 **智能模式切换**: 支持手动切换或自适应选择最佳展示模式
- 📱 **响应式设计**: 完美适配桌面和移动设备
- 🎨 **现代化UI**: 遵循Element Plus设计规范，支持深浅主题
- ⚡ **高性能**: 使用Vue 3 Composition API，优化的渲染性能
- 🔧 **高度可配置**: 丰富的props配置选项，适应不同业务场景

## 📦 安装使用

```vue
<template>
  <UnifiedWorkflowViewer
    :workflow-data="workflowData"
    :banner-info="bannerInfo"
    view-mode="auto"
    :show-mode-switch="true"
    :show-banner-info="true"
    @mode-change="onModeChange"
  />
</template>

<script setup>
import UnifiedWorkflowViewer from '@/components/workflow/UnifiedWorkflowViewer.vue'

const workflowData = {
  steps: [
    {
      id: 1,
      name: '初审',
      status: 'approved',
      approvers: ['张三'],
      processTime: '2024-01-25 14:30:00',
      comment: '审核通过',
      duration: '2小时'
    }
  ],
  operationHistory: [
    {
      time: '2024-01-25 14:30:00',
      operator: '张三',
      action: 'approve',
      comment: '审核通过'
    }
  ]
}

const bannerInfo = {
  id: 1,
  title: 'Banner标题',
  imageUrl: 'https://example.com/banner.jpg',
  linkUrl: 'https://example.com',
  startTime: '2024-01-01 00:00:00',
  endTime: '2024-01-31 23:59:59',
  status: 'approved'
}
</script>
```

## 🔧 API 参考

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `workflow-data` | 工作流数据 | `WorkflowData` | - |
| `banner-info` | Banner信息 | `BannerInfo` | - |
| `view-mode` | 展示模式 | `'steps' \| 'diagram' \| 'auto'` | `'auto'` |
| `show-mode-switch` | 显示模式切换开关 | `boolean` | `true` |
| `show-banner-info` | 显示Banner信息卡片 | `boolean` | `true` |
| `responsive` | 开启响应式自动切换 | `boolean` | `true` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `mode-change` | 视图模式改变 | `(mode: 'steps' \| 'diagram') => void` |
| `step-click` | 点击步骤节点 | `(step: WorkflowStep) => void` |
| `fullscreen-change` | 全屏状态改变 | `(isFullscreen: boolean) => void` |

### 数据类型

#### WorkflowData

```typescript
interface WorkflowData {
  steps: WorkflowStep[]           // 工作流步骤数组
  operationHistory?: OperationRecord[]  // 操作历史记录
  currentStatus?: string          // 当前状态
  totalDuration?: string          // 总耗时
}
```

#### WorkflowStep

```typescript
interface WorkflowStep {
  id: string | number            // 步骤ID
  name: string                   // 步骤名称
  status: 'pending' | 'processing' | 'approved' | 'rejected'  // 步骤状态
  approvers?: string[]           // 审批人列表
  processTime?: string           // 处理时间
  comment?: string               // 审批意见
  duration?: string              // 处理耗时
  approvalType?: 'any' | 'all'   // 审批类型
}
```

#### BannerInfo

```typescript
interface BannerInfo {
  id: number                     // Banner ID
  title: string                  // Banner标题
  imageUrl: string               // 图片URL
  linkUrl: string                // 跳转链接
  startTime: string              // 开始时间
  endTime: string                // 结束时间
  status: BannerStatus           // Banner状态
  description?: string           // 描述
  creator?: string               // 创建人
  createTime?: string            // 创建时间
}
```

## 🎨 视图模式

### 步骤视图 (Steps View)

- 🎯 简洁的线性步骤展示
- 📊 实时进度条显示
- 💬 支持步骤描述和状态图标
- 📱 移动端友好的竖直布局

### 流程图视图 (Diagram View)

- 🔄 可视化的流程节点展示
- 🎨 状态颜色编码和动画效果
- 💬 详细的审批信息和意见展示
- 🖥️ 桌面端优化的水平布局
- 🔍 支持全屏查看

### 自动模式 (Auto Mode)

组件会根据以下条件智能选择最佳展示模式：

- **屏幕尺寸**: 大屏显示流程图，小屏显示步骤
- **数据复杂度**: 简单流程用步骤视图，复杂流程用流程图
- **步骤数量**: ≤3步用步骤视图，>3步用流程图

## 🎯 使用场景

### 基础使用

```vue
<!-- 最简单的使用方式 -->
<UnifiedWorkflowViewer
  :workflow-data="workflowData"
  :banner-info="bannerInfo"
/>
```

### 嵌入式使用

```vue
<!-- 作为对话框内容 -->
<el-dialog title="审批流程" width="1000px">
  <UnifiedWorkflowViewer
    :workflow-data="workflowData"
    :banner-info="bannerInfo"
    view-mode="auto"
    :show-mode-switch="true"
  />
</el-dialog>
```

### 独立页面使用

```vue
<!-- 作为独立页面展示 -->
<UnifiedWorkflowViewer
  :workflow-data="workflowData"
  :show-banner-info="false"
  view-mode="diagram"
  :show-mode-switch="false"
/>
```

## 🎨 样式定制

组件使用CSS变量，支持主题定制：

```css
.unified-workflow-viewer {
  --primary-color: #409eff;
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --danger-color: #f56c6c;
  --info-color: #909399;
}
```

## 📱 响应式支持

| 断点 | 宽度 | 默认模式 | 特点 |
|------|------|----------|------|
| 桌面 | ≥1200px | diagram | 水平流程图，全功能 |
| 平板 | 768px-1199px | auto | 智能选择，简化布局 |
| 手机 | <768px | steps | 竖直步骤，触屏优化 |

## 🔄 迁移指南

### 从 List.vue 迁移

```vue
<!-- 旧的使用方式 -->
<div class="workflow-tracking">
  <el-steps :active="getActiveStep(workflowSteps)">
    <el-step v-for="step in workflowSteps" :title="step.name" />
  </el-steps>
</div>

<!-- 新的使用方式 -->
<UnifiedWorkflowViewer
  :workflow-data="{ steps: workflowSteps }"
  view-mode="steps"
  :show-banner-info="false"
  :show-mode-switch="false"
/>
```

### 从 StatusTracking.vue 迁移

```vue
<!-- 旧的使用方式 -->
<div class="workflow-diagram">
  <div class="workflow-steps">
    <div v-for="step in steps" class="workflow-step">
      {{ step.name }}
    </div>
  </div>
</div>

<!-- 新的使用方式 -->
<UnifiedWorkflowViewer
  :workflow-data="{ steps, operationHistory }"
  view-mode="diagram"
  :show-mode-switch="true"
/>
```

## 🛠️ 开发与贡献

### 本地开发

```bash
# 启动开发服务器
npm run dev

# 查看示例页面
# http://localhost:3000/components/workflow/example
```

### 测试

```bash
# 运行单元测试
npm run test

# 运行E2E测试
npm run test:e2e
```

## 📝 更新日志

### v1.0.0 (2024-01-25)

- ✨ 初始版本发布
- 🎯 支持步骤视图和流程图视图
- 📱 响应式设计
- 🔧 统一的API接口
- 🎨 现代化UI设计

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

> 💡 **提示**: 这个组件是对原有Banner工作流展示功能的重构和升级，提供了更好的用户体验和更强的可扩展性。如果您在使用过程中遇到问题，请查看示例文件或联系开发团队。