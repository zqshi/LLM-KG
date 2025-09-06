# 图标系统

## 概述

图标是UI设计中不可或缺的视觉元素，能够直观地传达信息和功能。本规范定义了企业知识聚合平台（LLM-KG）的图标系统，包括图标风格、命名规则、尺寸规范和使用指南。

## 设计原则

- **一致性**：保持图标风格、粗细和视觉语言的一致性
- **简洁性**：使用简洁的线条和形状，避免复杂细节
- **可读性**：确保图标在不同尺寸下清晰可辨
- **语义性**：图标应准确传达其代表的功能或概念
- **可访问性**：为图标添加适当的文本描述

## 图标风格

采用线性图标风格，保持一致的线条粗细和圆角。

```css
:root {
  --icon-stroke-width: 2px;  /* 图标线条宽度 */
  --icon-radius: 2px;        /* 图标圆角半径 */
}
```

## 图标分类

根据功能和使用场景，图标分为以下几类：

1. **导航图标**：用于菜单和导航，如首页、设置、用户等
2. **操作图标**：用于按钮和交互元素，如添加、编辑、删除等
3. **状态图标**：用于表示状态，如成功、警告、错误等
4. **业务图标**：特定业务场景的图标，如知识图谱、文档、搜索等

## 尺寸规范

定义常用的图标尺寸，确保在不同场景下的一致性。

```css
:root {
  --icon-size-xs: 16px;  /* 小图标，用于紧凑空间 */
  --icon-size-sm: 20px;  /* 中小图标，用于按钮和菜单项 */
  --icon-size-md: 24px;  /* 中等图标，用于主要操作 */
  --icon-size-lg: 32px;  /* 大图标，用于强调和重点元素 */
  --icon-size-xl: 48px;  /* 超大图标，用于特殊场景 */
}
```

## 命名规则

采用统一的命名规则，提高可维护性和可用性。

### 格式
`[类别]-[功能]-[变体]`

### 示例
- `nav-home`：导航类-首页
- `action-add`：操作类-添加
- `action-edit-filled`：操作类-编辑（填充变体）
- `status-success`：状态类-成功
- `business-knowledge-graph`：业务类-知识图谱

## 使用指南

### 搭配文本
- 图标和文本搭配使用时，图标应位于文本左侧
- 图标与文本之间的间距为 `--spacing-xs`

### 颜色应用
- 普通状态：`--color-text-secondary`
- 高亮状态：`--color-primary`
- 禁用状态：`--color-text-disabled`

### 实现方式
优先使用 SVG 图标，确保清晰度和可缩放性。推荐使用组件化方式实现图标，便于统一管理和使用。

#### SVG 图标组件实现示例

```vue
<template>
  <svg
    :class="className"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="var(--icon-stroke-width)"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <slot></slot>
  </svg>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue';

interface IconProps {
  /**
   * 图标尺寸
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 图标颜色
   */
  color?: string;
}

defineProps<IconProps>();

const sizeMap = {
  xs: 'var(--icon-size-xs)',
  sm: 'var(--icon-size-sm)',
  md: 'var(--icon-size-md)',
  lg: 'var(--icon-size-lg)',
  xl: 'var(--icon-size-xl)',
};

const size = computed(() => {
  return sizeMap[props.size || 'md'];
});
</script>
```

#### 具体图标实现示例

```vue
<template>
  <Icon :size="size" :className="className" :color="color">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </Icon>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import Icon from './Icon.vue';

defineProps<{
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: string;
}>();
</script>
```

### 图标库

平台提供以下类别图标，所有图标遵循统一的设计风格和规范：

#### 导航图标
- `nav-home`: 首页
- `nav-dashboard`: 仪表盘
- `nav-settings`: 设置
- `nav-user`: 用户中心
- `nav-menu`: 菜单
- `nav-search`: 搜索

#### 操作图标
- `action-add`: 添加
- `action-edit`: 编辑
- `action-delete`: 删除
- `action-save`: 保存
- `action-cancel`: 取消
- `action-confirm`: 确认
- `action-export`: 导出
- `action-import`: 导入

#### 状态图标
- `status-success`: 成功
- `status-warning`: 警告
- `status-error`: 错误
- `status-info`: 信息
- `status-loading`: 加载中
- `status-disabled`: 禁用

#### 业务图标
- `business-knowledge-graph`: 知识图谱
- `business-document`: 文档
- `business-tag`: 标签
- `business-category`: 分类
- `business-statistics`: 统计
- `business-relation`: 关系

### 使用示例

```vue
<template>
  <div class="icon-example">
    <!-- 基础使用 -->
    <HomeIcon size="md" />

    <!-- 自定义颜色 -->
    <EditIcon size="sm" color="var(--color-primary)" />

    <!-- 搭配按钮使用 -->
    <Button icon="search">
      搜索
    </Button>

    <!-- 状态图标 -->
    <div class="status-indicator">
      <SuccessIcon size="xs" />
      <span>操作成功</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HomeIcon, EditIcon, SuccessIcon } from '@/components/icons';
import Button from '@/components/Button.vue';
</script>
```

## 版本历史

| 版本 | 日期       | 变更内容                  |
|------|------------|---------------------------|
| 1.0  | 2023-10-01 | 初始版本，包含基础图标规范 |
| 1.1  | 2023-11-15 | 新增业务图标类别          |
| 1.2  | 2023-12-20 | 优化图标样式和一致性      |