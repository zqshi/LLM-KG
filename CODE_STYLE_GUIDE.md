# 代码风格指南

## 概述

本指南定义了企业知识聚合平台（LLM-KG）的代码风格规范，旨在确保代码的一致性、可读性和可维护性。所有团队成员在开发过程中应严格遵循本规范。

## 1. 命名规范

### 1.1 通用命名规则
- 使用描述性名称，避免缩写和简写（除非是广为人知的技术缩写）
- 遵循相应语言的命名约定
- 保持名称的一致性和连贯性
- 避免使用保留字和关键字

### 1.2 TypeScript/JavaScript 命名
- **变量和函数**：使用驼峰命名法（camelCase）
- **类和接口**：使用帕斯卡命名法（PascalCase）
- **常量**：使用全大写字母，单词间用下划线分隔（UPPER_CASE_WITH_UNDERSCORES）
- **私有成员**：前缀加下划线（_privateMember）

```typescript
// 变量和函数
const userName = 'John Doe';
function getUserInfo() { /* ... */ }

// 类和接口
class UserService { /* ... */ }
interface UserInfo { /* ... */ }

// 常量
const MAX_RETRY_COUNT = 3;

// 私有成员
class ApiClient {
  private _baseUrl: string;
  /* ... */
}
```

### 1.3 Vue 组件命名
- 组件名使用帕斯卡命名法（PascalCase）
- 文件名与组件名保持一致
- 对于页面级组件，使用页面功能相关的名称
- 对于通用组件，添加 `Base` 前缀

```vue
<!-- 页面级组件 -->
<template>...</template>
<script setup lang="ts">/* ... */</script>
<!-- 文件名: UserManagement.vue -->

<!-- 通用组件 -->
<template>...</template>
<script setup lang="ts">/* ... */</script>
<!-- 文件名: BaseButton.vue -->
```

## 2. 代码风格

### 2.1 格式设置
- 使用 Prettier 进行代码格式化
- 缩进：2个空格
- 行长度：最大120个字符
- 结束行：使用LF（\n）
- 引号：单引号（'）
- 大括号：K&R 风格（左大括号不换行）

```typescript
// 推荐
function formatCode() {
  // 代码内容
}

// 不推荐
function formatCode()
{
  // 代码内容
}
```

### 2.2 空白符使用
- 在操作符前后添加空格
- 在逗号、冒号后添加空格
- 在大括号内侧添加空格
- 函数调用和定义时，括号内侧不加空格

```typescript
// 推荐
const sum = a + b;
const user = { name: 'John', age: 30 };
function greet(name) { /* ... */ }

greet('Alice');

// 不推荐
const sum=a+b;
const user={name:'John',age:30};
function greet( name ){ /* ... */ }

greet( 'Alice' );
```

## 3. Vue 组件开发规范

### 3.1 组件结构
- 优先使用组合式 API（`<script setup>`）
- 组件结构顺序：模板（`<template>`）、脚本（`<script>`）、样式（`<style>`）
- 为组件添加类型定义
- 保持组件的单一职责

```vue
<template>
  <div class="user-card">
    <img :src="user.avatar" alt="User avatar">
    <div class="user-info">
      <h3>{{ user.name }}</h3>
      <p>{{ user.email }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

interface User {
  id: number;
  name: string;
  avatar: string;
  email: string;
}

defineProps<{
  user: User;
}>();
</script>

<style scoped>
.user-card {
  display: flex;
  padding: 16px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 其他样式... */
</style>
```

### 3.2 状态管理
- 优先使用 `ref` 和 `reactive` 管理组件状态
- 复杂状态使用 `computed` 处理
- 避免在模板中使用复杂表达式
- 适当使用 `watch` 和 `watchEffect` 处理副作用

```typescript
import { ref, computed, watch } from 'vue';

const count = ref(0);
const doubleCount = computed(() => count.value * 2);

watch(count, (newValue, oldValue) => {
  console.log(`Count changed from ${oldValue} to ${newValue}`);
});
```

## 4. API 调用规范

### 4.1 请求封装
- 统一使用 `src/api/request.ts` 中的 `http` 对象进行请求
- 为每个功能模块创建单独的 API 文件
- 使用接口定义请求参数和响应数据结构
- 处理请求错误和异常情况

```typescript
// src/api/user.ts
import { http } from './request';
import type { ApiResponse, User, UserQuery } from '@/types';

export const userApi = {
  async getUsers(params: UserQuery): Promise<ApiResponse<User[]>> {
    return http.get('/users', params);
  },

  async getUserById(id: number): Promise<ApiResponse<User>> {
    return http.get(`/users/${id}`);
  },

  async createUser(data: Partial<User>): Promise<ApiResponse<User>> {
    return http.post('/users', data);
  },

  // 其他 API 方法...
};
```

### 4.2 数据处理
- 在组件中使用 `try/catch` 处理 API 调用异常
- 使用 `loading` 状态指示异步操作
- 合理使用缓存减少重复请求
- 对大型数据集实现分页加载

```typescript
import { ref } from 'vue';
import { userApi } from '@/api/user';

export function useUserList() {
  const users = ref<User[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const totalCount = ref(0);

  async function fetchUsers() {
    loading.value = true;
    error.value = null;

    try {
      const response = await userApi.getUsers({
        page: currentPage.value,
        pageSize: pageSize.value
      });

      users.value = response.data.items;
      totalCount.value = response.data.total;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch users';
    } finally {
      loading.value = false;
    }
  }

  return {
    users,
    loading,
    error,
    currentPage,
    pageSize,
    totalCount,
    fetchUsers
  };
}
```

## 5. 注释规范

### 5.1 代码注释
- 为复杂的逻辑和算法添加注释
- 为函数和方法添加 JSDoc 注释
- 为组件添加功能描述
- 避免不必要的注释（代码本身已经清晰表达的内容）

```typescript
/**
 * 获取用户列表
 * @param params 查询参数
 * @returns 用户列表及分页信息
 */
async function getUsers(params: UserQuery): Promise<ApiResponse<User[]>> {
  // 实现逻辑...
}
```

### 5.2 文档注释
- 为公共 API 添加详细文档
- 说明函数/方法的用途、参数和返回值
- 记录可能的异常和错误情况
- 示例用法

```typescript
/**
 * 用户服务类，处理用户相关的业务逻辑
 */
class UserService {
  /**
   * 获取用户详情
   * @param id 用户ID
   * @returns 用户详情对象
   * @throws {Error} 当用户不存在时抛出错误
   * @example
   * ```typescript
   * const userService = new UserService();
   * try {
   *   const user = await userService.getUserById(1);
   *   console.log(user.name);
   * } catch (error) {
   *   console.error(error.message);
   * }
   * ```
   */
  async getUserById(id: number): Promise<User> {
    // 实现逻辑...
  }
}
```

## 6. Git 提交规范

### 6.1 提交消息格式
- 使用语义化版本管理
- 提交消息格式：`类型(范围): 描述`
- 类型包括：feat（新功能）、fix（修复）、docs（文档）、style（样式）、refactor（重构）、test（测试）、chore（杂项）
- 描述要简洁明了，说明变更内容

```
feat(dashboard): 添加数据概览卡片
fix(auth): 修复登录失败的问题
docs: 更新API文档
style: 优化代码格式
refactor(user): 重构用户管理模块
test: 添加单元测试
chore: 更新依赖版本
```

### 6.2 分支策略
- `main`：主分支，保持稳定可发布状态
- `develop`：开发分支，集成所有功能开发
- `feature/xxx`：功能开发分支
- `fix/xxx`：bug修复分支
- `release/xxx`：发布分支

## 7. 性能优化规范

### 7.1 组件优化
- 使用 `v-memo` 优化列表渲染
- 合理使用 `shallowRef` 和 `shallowReactive`
- 避免在 `setup` 中执行耗时操作
- 组件拆分粒度要合理

### 7.2 网络优化
- 实现请求缓存
- 合理使用节流和防抖
- 实现数据预加载
- 图片懒加载

```typescript
// 使用节流函数优化频繁请求
import { throttle } from 'lodash-es';

const fetchData = throttle(async (params) => {
  // 请求逻辑...
}, 1000);
```

## 结语

本代码风格指南旨在提高团队协作效率，确保代码质量和可维护性。团队成员应严格遵循本规范，并在实践中不断完善和优化。定期的代码审查和技术分享将有助于规范的落地和持续改进。