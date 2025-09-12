<template>
  <div class="login-container">
    <div class="login-form">
      <div class="login-header">
        <h2>企业知识聚合平台</h2>
        <p>管理端登录</p>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form-content"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            prefix-icon="User"
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
          />
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            style="width: 100%"
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
            style="width: 100%"
            @click="handleDemoLogin"
          >
            演示模式
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <p>演示账号：admin / 123456</p>
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
  password: '123456',
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
        await authStore.login({
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
        router.push(redirect || '/dashboard')
      } catch (error) {
        ElMessage.error('用户名或密码错误')
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
    router.push('/dashboard')
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
}

.login-form {
  width: 420px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2);
  padding: var(--spacing-4xl);
  position: relative;
  z-index: 1;
  animation: slideInUp 0.6s ease-out;
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
  margin-bottom: var(--spacing-xl);
}

.login-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm) 0;
  background: linear-gradient(135deg, var(--color-primary) 0%, #722ed1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-header p {
  color: var(--color-text-secondary);
  margin: 0;
  font-size: 16px;
  font-weight: 400;
}

.login-form-content {
  margin-bottom: var(--spacing-lg);
}

.login-footer {
  text-align: center;
}
</style>