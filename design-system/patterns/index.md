# 设计模式

## 概述

设计模式是解决常见设计问题的可复用方案，是经过验证的最佳实践。本规范定义了企业知识聚合平台（LLM-KG）中常用的设计模式、使用场景和实现指南，旨在提高设计和开发效率，确保界面的一致性和可用性。

## 设计原则

- **一致性**：在类似场景中应用一致的设计模式
- **可用性**：设计模式应提升用户体验和操作效率
- **可复用性**：设计模式应易于在不同场景中复用
- **可扩展性**：设计模式应支持未来的功能扩展
- **简洁性**：设计模式应简洁明了，避免过度设计

## 模式分类

### 导航模式

用于帮助用户在应用中导航和定位。

#### 面包屑导航

显示用户当前位置的层级结构，允许用户快速返回到上层页面。

```vue
<template>
  <nav class="breadcrumb">
    <ol class="breadcrumb-list">
      <li class="breadcrumb-item">
        <a href="#" class="breadcrumb-link">首页</a>
      </li>
      <li class="breadcrumb-item">
        <a href="#" class="breadcrumb-link">用户管理</a>
      </li>
      <li class="breadcrumb-item active">
        <span class="breadcrumb-text">用户列表</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.breadcrumb {
  margin-bottom: var(--spacing-lg);
}

.breadcrumb-list {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
}

.breadcrumb-item:not(:last-child)::after {
  content: '/';
  margin: 0 var(--spacing-xs);
  color: var(--color-text-tertiary);
}

.breadcrumb-link {
  color: var(--color-primary);
  text-decoration: none;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.breadcrumb-text {
  color: var(--color-text-tertiary);
}
</style>
```

#### 选项卡导航

用于在同一页面中切换不同内容区域。

```vue
<template>
  <div class="tabs">
    <div class="tabs-nav">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tabs-button', { 'active': activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.title }}
      </button>
    </div>
    <div class="tabs-content">
      <div v-if="activeTab === 'tab1'"><Tab1Content /></div>
      <div v-if="activeTab === 'tab2'"><Tab2Content /></div>
      <div v-if="activeTab === 'tab3'"><Tab3Content /></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Tab1Content from './Tab1Content.vue';
import Tab2Content from './Tab2Content.vue';
import Tab3Content from './Tab3Content.vue';

const activeTab = ref('tab1');

const tabs = [
  { id: 'tab1', title: '标签页1' },
  { id: 'tab2', title: '标签页2' },
  { id: 'tab3', title: '标签页3' }
];
</script>

<style scoped>
.tabs-nav {
  display: flex;
  border-bottom: 1px solid var(--color-border-primary);
  margin-bottom: var(--spacing-lg);
}

.tabs-button {
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: var(--text-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.tabs-button.active {
  border-bottom-color: var(--color-primary);
  color: var(--color-primary);
}
</style>
```

### 数据展示模式

用于有效地展示和组织数据。

#### 表格

用于展示结构化数据，支持排序、筛选和分页。

```vue
<template>
  <div class="table-container">
    <table class="data-table">
      <thead>
        <tr>
          <th class="table-header" @click="sortBy('id')">
            ID <IconSort :sortDirection="sortField === 'id' ? sortDirection : 'none'" />
          </th>
          <th class="table-header" @click="sortBy('name')">
            姓名 <IconSort :sortDirection="sortField === 'name' ? sortDirection : 'none'" />
          </th>
          <th class="table-header" @click="sortBy('email')">
            邮箱 <IconSort :sortDirection="sortField === 'email' ? sortDirection : 'none'" />
          </th>
          <th class="table-header" @click="sortBy('role')">
            角色 <IconSort :sortDirection="sortField === 'role' ? sortDirection : 'none'" />
          </th>
          <th class="table-header">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in sortedUsers" :key="user.id" class="table-row">
          <td class="table-cell">{{ user.id }}</td>
          <td class="table-cell">{{ user.name }}</td>
          <td class="table-cell">{{ user.email }}</td>
          <td class="table-cell">{{ user.role }}</td>
          <td class="table-cell">
            <button class="btn-text">编辑</button>
            <button class="btn-text text-danger">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="pagination">
      <!-- 分页控件 -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { IconSort } from '@/components/icons';

const users = ref([
  { id: 1, name: '张三', email: 'zhangsan@example.com', role: '管理员' },
  { id: 2, name: '李四', email: 'lisi@example.com', role: '普通用户' },
  { id: 3, name: '王五', email: 'wangwu@example.com', role: '普通用户' }
]);

const sortField = ref('id');
const sortDirection = ref('asc');

const sortedUsers = computed(() => {
  return [...users.value].sort((a, b) => {
    if (sortDirection.value === 'asc') {
      return a[sortField.value] > b[sortField.value] ? 1 : -1;
    } else {
      return a[sortField.value] < b[sortField.value] ? 1 : -1;
    }
  });
});

const sortBy = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortDirection.value = 'asc';
  }
};
</script>

<style scoped>
.table-container {
  overflow-x: auto;
  margin-bottom: var(--spacing-xl);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.table-header {
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: left;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  background-color: var(--color-bg-elevated);
  border-bottom: 2px solid var(--color-border-primary);
  cursor: pointer;
}

.table-row {
  border-bottom: 1px solid var(--color-border-light);
}

.table-row:hover {
  background-color: var(--color-bg-elevated);
}

.table-cell {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--text-base);
  color: var(--color-text-primary);
}

.text-danger {
  color: var(--color-danger);
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
}
</style>
```

#### 卡片列表

用于展示非结构化或半结构化数据，每个卡片包含完整的信息单元。

```vue
<template>
  <div class="card-grid">
    <div class="card" v-for="item in items" :key="item.id">
      <div class="card-header">
        <h3 class="card-title">{{ item.title }}</h3>
        <span class="card-tag">{{ item.category }}</span>
      </div>
      <div class="card-body">
        <p class="card-text">{{ item.description }}</p>
      </div>
      <div class="card-footer">
        <span class="card-date">{{ item.date }}</span>
        <button class="btn-text">查看详情</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const items = ref([
  {
    id: 1,
    title: '企业知识图谱构建指南',
    category: '技术文档',
    description: '详细介绍企业知识图谱的构建流程和最佳实践...',
    date: '2023-10-15'
  },
  {
    id: 2,
    title: 'AI助手应用场景分析',
    category: '行业报告',
    description: '分析AI助手在不同行业的应用场景和价值...',
    date: '2023-10-10'
  },
  {
    id: 3,
    title: '数据安全最佳实践',
    category: '安全指南',
    description: '企业数据安全保护的最佳实践和策略...',
    date: '2023-10-05'
  }
]);
</script>

<style scoped>
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-xl);
}

.card-tag {
  padding: 2px 8px;
  background-color: var(--color-primary-light);
  color: var(--color-primary-dark);
  font-size: var(--text-xs);
  border-radius: var(--radius-sm);
}

.card-date {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}
</style>
```

### 交互模式

用于定义用户与界面的交互方式。

#### 模态框

用于显示重要信息或需要用户立即关注的内容。

```vue
<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">{{ title }}</h3>
        <button class="btn-text" @click="closeModal">
          <IconClose />
        </button>
      </div>
      <div class="modal-body">
        <slot></slot>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" @click="closeModal">取消</button>
        <button class="btn-primary" @click="confirmAction">确认</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { IconClose } from '@/components/icons';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: '提示'
  }
});

const emit = defineEmits(['close', 'confirm']);

const closeModal = () => {
  emit('close');
};

const confirmAction = () => {
  emit('confirm');
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background-color: var(--color-bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-modal);
  max-width: 500px;
  width: 90%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
}

.modal-title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-medium);
  margin: 0;
}

.modal-body {
  padding: var(--spacing-lg);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-border-light);
}
</style>
```

## 应用规范

- 根据具体场景选择合适的设计模式
- 保持设计模式应用的一致性
- 不要过度设计，保持模式的简洁性
- 考虑响应式设计，确保模式在不同设备上都有良好的显示效果
- 关注可访问性，确保所有用户都能便捷地使用
- 结合实际业务需求，灵活应用设计模式

## 版本历史

- v1.0: 初始版本，定义了导航模式、数据展示模式和交互模式
- v1.1: 添加了更多具体的模式示例
- v1.2: 优化了模式的可访问性和交互体验