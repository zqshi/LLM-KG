<template>
  <div class="not-found-page">
    <div class="not-found-container">
      <div class="error-illustration">
        <div class="error-code">404</div>
        <div class="error-icon">
          <el-icon size="120" color="#409eff">
            <WarningFilled />
          </el-icon>
        </div>
      </div>
      
      <div class="error-content">
        <h1 class="error-title">页面未找到</h1>
        <p class="error-description">
          抱歉，您访问的页面不存在或已被移除。
          <br />
          请检查URL是否正确，或返回首页继续浏览。
        </p>
        
        <div class="error-actions">
          <el-button type="primary" @click="goHome">
            <el-icon><House /></el-icon>
            返回首页
          </el-button>
          <el-button @click="goBack">
            <el-icon><Back /></el-icon>
            返回上页
          </el-button>
        </div>
      </div>
    </div>
    
    <div class="suggestions">
      <h3>您可以尝试：</h3>
      <ul class="suggestion-list">
        <li>检查网址是否输入正确</li>
        <li>返回上一页面</li>
        <li>访问首页浏览其他内容</li>
        <li>联系系统管理员</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { WarningFilled, House, Back } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/dashboard')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.not-found-container {
  display: flex;
  align-items: center;
  gap: 60px;
  background: #fff;
  border-radius: 16px;
  padding: 60px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

.error-illustration {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  color: #409eff;
  line-height: 1;
  margin-bottom: 20px;
  text-shadow: 0 4px 8px rgba(64, 158, 255, 0.3);
}

.error-icon {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.error-content {
  max-width: 400px;
}

.error-title {
  font-size: 32px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

.error-description {
  font-size: 16px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 32px;
}

.error-actions {
  display: flex;
  gap: 16px;
}

.suggestions {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  text-align: left;
}

.suggestions h3 {
  font-size: 18px;
  color: #303133;
  margin: 0 0 16px 0;
}

.suggestion-list {
  margin: 0;
  padding-left: 20px;
  color: #606266;
  line-height: 1.8;
}

.suggestion-list li {
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .not-found-container {
    flex-direction: column;
    text-align: center;
    gap: 30px;
    padding: 40px 30px;
  }
  
  .error-code {
    font-size: 80px;
  }
  
  .error-title {
    font-size: 24px;
  }
  
  .error-actions {
    justify-content: center;
  }
}
</style>