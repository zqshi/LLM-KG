<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 8L8 24L24 40L40 24L24 8Z" fill="var(--color-primary)" stroke="var(--color-primary)" stroke-width="2" stroke-linejoin="round"/>
            <path d="M24 8V40" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 24H40" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 16L32 32" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M32 16L16 32" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 class="title">企业知识聚合平台</h1>
        <p class="subtitle">管理后台登录</p>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            prefix-icon="User"
            class="login-input"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="Lock"
            show-password
            class="login-input"
          />
        </el-form-item>
        
        <el-form-item>
          <div class="remember-forgot">
            <el-checkbox v-model="loginForm.remember" size="large">记住密码</el-checkbox>
            <el-link type="primary" :underline="false">忘记密码？</el-link>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="success"
            size="large"
            class="demo-button"
            @click="handleDemoLogin"
          >
            演示模式
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <p class="demo-info">演示账号：admin / admin123</p>
        <div class="version-info">v2.0.0</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive({
  username: 'admin',
  password: 'admin123',
  remember: false
})

const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      
      try {
        console.log('开始登录流程...')
        // 调用auth store的登录方法
        const result = await authStore.login({
          username: loginForm.username,
          password: loginForm.password
        })
        
        console.log('登录成功，当前状态:', {
          token: !!authStore.token,
          user: !!authStore.user,
          isLoggedIn: authStore.isLoggedIn
        })
        
        ElMessage.success('登录成功')
        
        // 获取重定向路径或默认跳转到dashboard
        const redirect = router.currentRoute.value.query.redirect as string
        console.log('准备跳转到:', redirect || '/dashboard')
        
        // 确保跳转执行
        setTimeout(() => {
          router.push(redirect || '/dashboard')
        }, 100)
      } catch (error: any) {
        ElMessage.error(error.message || '用户名或密码错误')
        console.error('登录失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}

// 演示模式登录
const handleDemoLogin = async () => {
  loading.value = true
  
  try {
    // 清除现有认证信息
    authStore.logout()
    
    // 初始化演示模式
    authStore.initAuth()
    
    ElMessage.success('已进入演示模式')
    
    // 跳转到仪表盘
    setTimeout(() => {
      router.push('/dashboard')
    }, 100)
  } catch (error) {
    ElMessage.error('进入演示模式失败')
    console.error('演示模式登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf9 100%);
  position: relative;
  overflow: hidden;
  padding: var(--spacing-xl);
}

.login-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
  z-index: 0;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: var(--color-bg-card);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  padding: var(--spacing-2xl);
  position: relative;
  z-index: 1;
  border: 1px solid var(--color-border-light);
  animation: slideInUp 0.6s ease-out;
  transition: all var(--transition-medium);
}

.login-card:hover {
  box-shadow: var(--shadow-2xl);
  transform: translateY(-4px);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.logo {
  margin: 0 auto var(--spacing-lg);
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: var(--gradient-primary-soft);
  padding: var(--spacing-sm);
}

.title {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: var(--color-text-secondary);
  margin: 0;
  font-size: var(--text-base);
  font-weight: var(--font-weight-normal);
}

.login-form {
  margin-bottom: var(--spacing-xl);
}

.login-input {
  :deep(.el-input__wrapper) {
    border-radius: var(--radius-lg);
    padding: var(--spacing-md);
    border: 1px solid var(--color-border-light);
    transition: all var(--transition-fast);
    
    &:hover {
      border-color: var(--color-primary);
    }
    
    &.is-focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
    }
  }
  
  :deep(.el-input__prefix) {
    margin-right: var(--spacing-sm);
  }
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  :deep(.el-checkbox__label) {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }
  
  :deep(.el-link) {
    font-size: var(--text-sm);
  }
}

.login-button,
.demo-button {
  width: 100%;
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-semibold);
  font-size: var(--text-base);
  padding: var(--spacing-md);
  margin-top: var(--spacing-sm);
  transition: all var(--transition-fast);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  &:active {
    transform: translateY(0);
  }
}

.login-button {
  background: var(--gradient-primary);
  border: none;
  color: white;
  
  &:hover {
    box-shadow: var(--shadow-floating);
  }
}

.demo-button {
  background: var(--gradient-success);
  border: none;
  color: white;
  
  &:hover {
    box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
  }
}

.login-footer {
  text-align: center;
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border-light);
}

.demo-info {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  margin: 0 0 var(--spacing-xs);
}

.version-info {
  color: var(--color-text-tertiary);
  font-size: var(--text-xs);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-container {
    padding: var(--spacing-md);
  }
  
  .login-card {
    padding: var(--spacing-xl);
  }
  
  .title {
    font-size: var(--text-xl);
  }
  
  .logo {
    width: 56px;
    height: 56px;
  }
}
</style>