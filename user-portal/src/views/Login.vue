<template>
  <div class="login-page">
    <div class="login-container">
      <!-- 左侧装饰区域 -->
      <div class="login-decoration">
        <div class="decoration-content">
          <div class="logo-section">
            <div class="logo">
              <img src="/logo.svg" alt="企业门户" />
            </div>
            <h1>企业门户系统</h1>
            <p>连接每一个员工，构建智慧企业</p>
          </div>
          
          <div class="feature-list">
            <div class="feature-item">
              <el-icon><Document /></el-icon>
              <span>资讯中心 - 获取最新公司动态</span>
            </div>
            <div class="feature-item">
              <el-icon><Reading /></el-icon>
              <span>知识平台 - 分享与学习企业知识</span>
            </div>
            <div class="feature-item">
              <el-icon><ChatDotRound /></el-icon>
              <span>企业论坛 - 员工交流互动平台</span>
            </div>
            <div class="feature-item">
              <el-icon><Shop /></el-icon>
              <span>跳蚤市场 - 员工二手交易</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧登录表单 -->
      <div class="login-form-section">
        <div class="form-container">
          <div class="form-header">
            <h2>员工登录</h2>
            <p>请使用企业邮箱登录系统</p>
          </div>
          
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
            @keyup.enter="handleLogin"
          >
            <el-form-item prop="email">
              <el-input
                v-model="loginForm.email"
                type="email"
                placeholder="请输入企业邮箱"
                size="large"
                :prefix-icon="Message"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <el-form-item>
              <div class="form-options">
                <el-checkbox v-model="loginForm.remember">
                  记住我
                </el-checkbox>
                <el-link type="primary" @click="showForgotPassword = true">
                  忘记密码？
                </el-link>
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
                {{ loading ? '登录中...' : '登录' }}
              </el-button>
            </el-form-item>
          </el-form>
          
          <!-- 其他登录方式 -->
          <div class="other-login">
            <div class="divider">
              <span>其他登录方式</span>
            </div>
            <div class="social-login">
              <el-button circle size="large" @click="handleSSOLogin('dingtalk')">
                <el-icon><ChatDotRound /></el-icon>
              </el-button>
              <el-button circle size="large" @click="handleSSOLogin('wechat')">
                <el-icon><ChatDotRound /></el-icon>
              </el-button>
              <el-button circle size="large" @click="handleSSOLogin('ldap')">
                <el-icon><User /></el-icon>
              </el-button>
            </div>
          </div>
          
          <!-- 帮助信息 -->
          <div class="help-info">
            <p>
              首次登录或遇到问题？请联系
              <el-link type="primary">IT支持部门</el-link>
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 忘记密码对话框 -->
    <el-dialog
      v-model="showForgotPassword"
      title="重置密码"
      width="400px"
    >
      <el-form :model="resetForm" label-width="100px">
        <el-form-item label="企业邮箱">
          <el-input
            v-model="resetForm.email"
            type="email"
            placeholder="请输入企业邮箱"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showForgotPassword = false">取消</el-button>
        <el-button type="primary" @click="handleResetPassword">
          发送重置邮件
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Document,
  Reading,
  ChatDotRound,
  Shop,
  Message,
  Lock,
  User
} from '@element-plus/icons-vue'

const router = useRouter()
const loginFormRef = ref()
const loading = ref(false)
const showForgotPassword = ref(false)

// 登录表单
const loginForm = reactive({
  email: '',
  password: '',
  remember: false
})

// 重置密码表单
const resetForm = reactive({
  email: ''
})

// 表单验证规则
const loginRules = {
  email: [
    { required: true, message: '请输入企业邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

// 处理登录
const handleLogin = () => {
  loginFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      loading.value = true
      
      // 模拟登录请求
      setTimeout(() => {
        loading.value = false
        
        // 模拟登录成功
        if (loginForm.email && loginForm.password) {
          ElMessage.success('登录成功')
          // 跳转到首页
          router.push('/')
        } else {
          ElMessage.error('用户名或密码错误')
        }
      }, 1500)
    }
  })
}

// 处理SSO登录
const handleSSOLogin = (provider: string) => {
  ElMessage.info(`正在跳转到${provider}登录...`)
  // 这里应该跳转到对应的SSO登录页面
}

// 处理重置密码
const handleResetPassword = () => {
  if (!resetForm.email) {
    ElMessage.error('请输入企业邮箱')
    return
  }
  
  ElMessage.success('重置邮件已发送，请查收邮箱')
  showForgotPassword.value = false
  resetForm.email = ''
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 1000px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 400px;
  min-height: 600px;
}

.login-decoration {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  color: white;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"50\" cy=\"50\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.1\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg>');
    opacity: 0.3;
  }

  .decoration-content {
    position: relative;
    z-index: 1;
    text-align: center;

    .logo-section {
      margin-bottom: 60px;

      .logo {
        width: 80px;
        height: 80px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;

        img {
          width: 50px;
          height: 50px;
        }
      }

      h1 {
        font-size: 32px;
        font-weight: 700;
        margin-bottom: 12px;
      }

      p {
        font-size: 16px;
        opacity: 0.9;
        margin: 0;
      }
    }

    .feature-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
      text-align: left;

      .feature-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px 20px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        backdrop-filter: blur(10px);
        transition: all 0.3s;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateX(10px);
        }

        .el-icon {
          font-size: 24px;
          opacity: 0.8;
        }

        span {
          font-size: 14px;
          line-height: 1.5;
        }
      }
    }
  }
}

.login-form-section {
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-container {
  width: 100%;
  max-width: 320px;

  .form-header {
    text-align: center;
    margin-bottom: 40px;

    h2 {
      font-size: 28px;
      font-weight: 700;
      color: var(--el-text-color-primary);
      margin-bottom: 8px;
    }

    p {
      font-size: 14px;
      color: var(--el-text-color-regular);
      margin: 0;
    }
  }

  .login-form {
    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .login-button {
      width: 100%;
      height: 48px;
      font-size: 16px;
      font-weight: 500;
    }
  }

  .other-login {
    margin-top: 32px;

    .divider {
      position: relative;
      text-align: center;
      margin-bottom: 24px;

      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background: var(--el-border-color-lighter);
      }

      span {
        background: white;
        padding: 0 16px;
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }

    .social-login {
      display: flex;
      justify-content: center;
      gap: 16px;

      .el-button {
        width: 48px;
        height: 48px;
        border: 1px solid var(--el-border-color-light);

        &:hover {
          border-color: var(--el-color-primary);
          color: var(--el-color-primary);
        }
      }
    }
  }

  .help-info {
    margin-top: 32px;
    text-align: center;

    p {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      margin: 0;
    }
  }
}

@media (max-width: 768px) {
  .login-container {
    grid-template-columns: 1fr;
    max-width: 400px;

    .login-decoration {
      display: none;
    }

    .login-form-section {
      padding: 40px 20px;
    }
  }
}
</style>