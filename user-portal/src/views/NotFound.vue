<template>
  <div class="not-found-page">
    <div class="not-found-container">
      <!-- 404 图标区域 -->
      <div class="error-illustration">
        <div class="error-number">
          <span class="digit">4</span>
          <span class="digit">0</span>
          <span class="digit">4</span>
        </div>
        <div class="error-icon">
          <el-icon :size="120">
            <Warning />
          </el-icon>
        </div>
      </div>
      
      <!-- 错误信息 -->
      <div class="error-content">
        <h1>页面未找到</h1>
        <p class="error-description">
          抱歉，您访问的页面不存在或已被移除。
          <br>
          可能是链接错误或页面已被删除。
        </p>
        
        <!-- 可能的原因 -->
        <div class="possible-reasons">
          <h3>可能的原因：</h3>
          <ul>
            <li>页面地址输入错误</li>
            <li>页面已被移动或删除</li>
            <li>您没有访问该页面的权限</li>
            <li>服务器临时故障</li>
          </ul>
        </div>
        
        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button type="primary" size="large" @click="goHome">
            <el-icon><HomeFilled /></el-icon>
            返回首页
          </el-button>
          <el-button size="large" @click="goBack">
            <el-icon><Back /></el-icon>
            返回上页
          </el-button>
          <el-button size="large" @click="refreshPage">
            <el-icon><Refresh /></el-icon>
            刷新页面
          </el-button>
        </div>
        
        <!-- 搜索建议 -->
        <div class="search-suggestion">
          <p>或者您可以搜索想要的内容：</p>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索页面内容..."
            size="large"
            :prefix-icon="Search"
            @keyup.enter="handleSearch"
            style="max-width: 400px"
          >
            <template #append>
              <el-button @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>
      </div>
      
      <!-- 快速导航 -->
      <div class="quick-nav">
        <h3>快速导航</h3>
        <div class="nav-grid">
          <div class="nav-item" @click="$router.push('/')">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </div>
          <div class="nav-item" @click="$router.push('/news')">
            <el-icon><Document /></el-icon>
            <span>资讯中心</span>
          </div>
          <div class="nav-item" @click="$router.push('/knowledge')">
            <el-icon><Reading /></el-icon>
            <span>知识平台</span>
          </div>
          <div class="nav-item" @click="$router.push('/forum')">
            <el-icon><ChatDotRound /></el-icon>
            <span>企业论坛</span>
          </div>
          <div class="nav-item" @click="$router.push('/market')">
            <el-icon><Shop /></el-icon>
            <span>跳蚤市场</span>
          </div>
          <div class="nav-item" @click="$router.push('/profile')">
            <el-icon><User /></el-icon>
            <span>个人中心</span>
          </div>
        </div>
      </div>
      
      <!-- 帮助信息 -->
      <div class="help-section">
        <p>
          如果问题持续存在，请联系
          <el-link type="primary" @click="contactSupport">技术支持</el-link>
          或发送邮件至 
          <el-link type="primary">support@company.com</el-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Warning,
  HomeFilled,
  Back,
  Refresh,
  Search,
  Document,
  Reading,
  ChatDotRound,
  Shop,
  User
} from '@element-plus/icons-vue'

const router = useRouter()
const searchKeyword = ref('')

// 返回首页
const goHome = () => {
  router.push('/')
}

// 返回上一页
const goBack = () => {
  // 检查是否有历史记录
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    // 如果没有历史记录，跳转到首页
    router.push('/')
  }
}

// 刷新页面
const refreshPage = () => {
  window.location.reload()
}

// 处理搜索
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    // 跳转到搜索页面或在当前应用中搜索
    router.push({
      path: '/search',
      query: { q: searchKeyword.value }
    }).catch(() => {
      // 如果搜索页面不存在，提示用户
      ElMessage.info('搜索功能正在开发中')
    })
  }
}

// 联系技术支持
const contactSupport = () => {
  ElMessage.info('正在为您转接技术支持...')
  // 这里可以打开在线客服或跳转到支持页面
}
</script>

<style scoped lang="scss">
.not-found-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.not-found-container {
  max-width: 800px;
  width: 100%;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  padding: 60px 40px;
  text-align: center;
}

.error-illustration {
  position: relative;
  margin-bottom: 40px;

  .error-number {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;

    .digit {
      font-size: 120px;
      font-weight: 900;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
      animation: bounce 2s ease-in-out infinite;

      &:nth-child(2) {
        animation-delay: 0.2s;
      }

      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }

  .error-icon {
    color: var(--el-color-warning);
    opacity: 0.7;
    animation: float 3s ease-in-out infinite;
  }
}

.error-content {
  margin-bottom: 40px;

  h1 {
    font-size: 32px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    margin-bottom: 16px;
  }

  .error-description {
    font-size: 16px;
    color: var(--el-text-color-regular);
    line-height: 1.6;
    margin-bottom: 32px;
  }

  .possible-reasons {
    text-align: left;
    max-width: 400px;
    margin: 0 auto 32px;
    padding: 24px;
    background: var(--el-fill-color-extra-light);
    border-radius: 8px;
    border-left: 4px solid var(--el-color-warning);

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: 12px;
    }

    ul {
      margin: 0;
      padding-left: 20px;
      color: var(--el-text-color-regular);
      font-size: 14px;
      line-height: 1.8;

      li {
        margin-bottom: 4px;
      }
    }
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 32px;
  }

  .search-suggestion {
    p {
      font-size: 14px;
      color: var(--el-text-color-secondary);
      margin-bottom: 16px;
    }
  }
}

.quick-nav {
  margin-bottom: 32px;

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 20px;
  }

  .nav-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 16px;
    max-width: 600px;
    margin: 0 auto;

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 20px;
      background: var(--el-fill-color-extra-light);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
      }

      .el-icon {
        font-size: 24px;
      }

      span {
        font-size: 12px;
        font-weight: 500;
      }
    }
  }
}

.help-section {
  p {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin: 0;
    line-height: 1.6;
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@media (max-width: 768px) {
  .not-found-container {
    padding: 40px 20px;
  }

  .error-illustration .error-number .digit {
    font-size: 80px;
  }

  .error-content {
    h1 {
      font-size: 24px;
    }

    .error-description {
      font-size: 14px;
    }

    .action-buttons {
      flex-direction: column;
      align-items: center;

      .el-button {
        width: 200px;
      }
    }
  }

  .quick-nav .nav-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;

    .nav-item {
      padding: 16px 12px;

      .el-icon {
        font-size: 20px;
      }

      span {
        font-size: 11px;
      }
    }
  }
}
</style>