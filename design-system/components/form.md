# 表单组件

## 概述

表单是界面中用于收集用户输入的重要组件，包括文本输入、选择框、单选按钮、复选框等元素。本规范定义了企业知识聚合平台（LLM-KG）中表单组件的设计原则、类型、样式、验证和实现指南。

## 设计原则

- **清晰性**：表单字段和标签应清晰明确
- **简洁性**：表单设计简洁，减少用户输入负担
- **即时反馈**：提供实时的表单验证和反馈
- **一致性**：保持表单元素样式和行为的一致性
- **可访问性**：确保所有用户都能便捷地填写表单

## 表单结构

表单通常包含以下部分：
- 表单标题：说明表单用途
- 表单字段：标签、输入控件、帮助文本
- 操作按钮：提交、重置、取消
- 表单验证：错误提示、成功状态

## 基础样式

```css
.form {
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.form-control {
  width: 100%;
  padding: var(--spacing-sm);
  font-size: var(--text-base);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-card);
  color: var(--color-text-primary);
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.form-help-text {
  margin-top: var(--spacing-xs);
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}
```

## 表单控件类型

### 文本输入框

用于输入单行文本。

```vue
<template>
  <div class="form-group">
    <label for="username" class="form-label">用户名</label>
    <input type="text" id="username" class="form-control" placeholder="请输入用户名">
    <p class="form-help-text">用户名长度为 3-20 个字符</p>
  </div>
</template>
```

### 多行文本框

用于输入多行文本。

```css
.form-control-textarea {
  min-height: 120px;
  resize: vertical;
}
```

```vue
<template>
  <div class="form-group">
    <label for="description" class="form-label">描述</label>
    <textarea id="description" class="form-control form-control-textarea" placeholder="请输入描述"></textarea>
  </div>
</template>
```

### 下拉选择框

用于从选项列表中选择一个值。

```vue
<template>
  <div class="form-group">
    <label for="role" class="form-label">角色</label>
    <select id="role" class="form-control">
      <option value="admin">管理员</option>
      <option value="user">普通用户</option>
      <option value="guest">访客</option>
    </select>
  </div>
</template>
```

### 单选按钮组

用于从多个选项中选择一个。

```css
.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.radio-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.radio-input {
  width: var(--spacing-md);
  height: var(--spacing-md);
  accent-color: var(--color-primary);
}
```

```vue
<template>
  <div class="form-group">
    <label class="form-label">性别</label>
    <div class="radio-group">
      <div class="radio-item">
        <input type="radio" id="male" name="gender" value="male" class="radio-input">
        <label for="male">男</label>
      </div>
      <div class="radio-item">
        <input type="radio" id="female" name="gender" value="female" class="radio-input">
        <label for="female">女</label>
      </div>
      <div class="radio-item">
        <input type="radio" id="other" name="gender" value="other" class="radio-input">
        <label for="other">其他</label>
      </div>
    </div>
  </div>
</template>
```

### 复选框

用于选择一个或多个选项。

```css
.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.checkbox-input {
  width: var(--spacing-md);
  height: var(--spacing-md);
  accent-color: var(--color-primary);
}
```

```vue
<template>
  <div class="form-group">
    <label class="form-label">兴趣爱好</label>
    <div class="checkbox-group">
      <div class="checkbox-item">
        <input type="checkbox" id="reading" name="hobby" value="reading" class="checkbox-input">
        <label for="reading">阅读</label>
      </div>
      <div class="checkbox-item">
        <input type="checkbox" id="sports" name="hobby" value="sports" class="checkbox-input">
        <label for="sports">运动</label>
      </div>
      <div class="checkbox-item">
        <input type="checkbox" id="music" name="hobby" value="music" class="checkbox-input">
        <label for="music">音乐</label>
      </div>
    </div>
  </div>
</template>
```

## 表单验证

### 错误状态

```css
.form-control.error {
  border-color: var(--color-danger);
}

.form-error-message {
  margin-top: var(--spacing-xs);
  font-size: var(--text-xs);
  color: var(--color-danger);
}
```

### 成功状态

```css
.form-control.success {
  border-color: var(--color-success);
}
```

## 应用规范

- 表单标题应清晰说明表单用途
- 每个表单字段都应有明确的标签
- 必要字段应标记（如 *）
- 提供简洁的帮助文本
- 表单验证应实时反馈
- 错误提示应明确具体
- 表单操作按钮应清晰可见
- 确保表单在移动设备上有良好的显示效果

## 实现示例

```vue
<template>
  <form class="form" @submit.prevent="handleSubmit">
    <h2 class="text-xl font-semibold mb-lg">用户注册</h2>
    
    <div class="form-group">
      <label for="username" class="form-label">用户名 <span class="text-danger">*</span></label>
      <input type="text" id="username" class="form-control" v-model="formData.username" placeholder="请输入用户名">
      <p v-if="errors.username" class="form-error-message">{{ errors.username }}</p>
      <p v-else class="form-help-text">用户名长度为 3-20 个字符</p>
    </div>
    
    <div class="form-group">
      <label for="email" class="form-label">邮箱 <span class="text-danger">*</span></label>
      <input type="email" id="email" class="form-control" v-model="formData.email" placeholder="请输入邮箱">
      <p v-if="errors.email" class="form-error-message">{{ errors.email }}</p>
    </div>
    
    <div class="form-group">
      <label for="password" class="form-label">密码 <span class="text-danger">*</span></label>
      <input type="password" id="password" class="form-control" v-model="formData.password" placeholder="请输入密码">
      <p v-if="errors.password" class="form-error-message">{{ errors.password }}</p>
      <p v-else class="form-help-text">密码长度至少 8 个字符，包含字母和数字</p>
    </div>
    
    <div class="form-group">
      <label class="form-label">同意条款</label>
      <div class="checkbox-item">
        <input type="checkbox" id="agree" class="checkbox-input" v-model="formData.agree">
        <label for="agree">我同意<a href="#" class="text-primary">服务条款</a>和<a href="#" class="text-primary">隐私政策</a></label>
      </div>
      <p v-if="errors.agree" class="form-error-message">{{ errors.agree }}</p>
    </div>
    
    <div class="form-actions">
      <button type="button" class="btn-secondary" @click="resetForm">重置</button>
      <button type="submit" class="btn-primary">注册</button>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue';

const formData = ref({
  username: '',
  email: '',
  password: '',
  agree: false
});

const errors = ref({});

const validateForm = () => {
  let isValid = true;
  errors.value = {};
  
  if (!formData.value.username) {
    errors.value.username = '请输入用户名';
    isValid = false;
  } else if (formData.value.username.length < 3 || formData.value.username.length > 20) {
    errors.value.username = '用户名长度为 3-20 个字符';
    isValid = false;
  }
  
  // 其他验证规则...
  
  return isValid;
};

const handleSubmit = () => {
  if (validateForm()) {
    // 提交表单
    console.log('表单提交成功', formData.value);
  }
};

const resetForm = () => {
  formData.value = {
    username: '',
    email: '',
    password: '',
    agree: false
  };
  errors.value = {};
};
</script>

<style scoped>
.text-danger {
  color: var(--color-danger);
}

.mb-lg {
  margin-bottom: var(--spacing-lg);
}
</style>
```

## 可访问性

- 确保表单字段和标签有正确的关联（使用 for 和 id 属性）
- 为表单控件添加适当的 ARIA 属性
- 支持键盘操作和屏幕阅读器
- 确保错误提示清晰可访问
- 提供表单验证的实时反馈

## 版本历史

- v1.0: 初始版本，定义了基本表单控件和验证
- v1.1: 添加了更多表单控件类型
- v1.2: 优化了表单验证和可访问性支持