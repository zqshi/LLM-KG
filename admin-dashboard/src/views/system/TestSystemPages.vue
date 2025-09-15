<template>
  <div class="test-system-pages">
    <h1>系统页面测试</h1>
    <p>此页面用于测试系统设置和告警页面的功能</p>
    
    <el-card>
      <template #header>
        <div class="card-header">
          <span>页面测试</span>
        </div>
      </template>
      
      <div class="test-content">
        <el-button type="primary" @click="testSettingsPage">测试系统设置页面</el-button>
        <el-button type="warning" @click="testAlertsPage">测试系统告警页面</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const testSettingsPage = () => {
  router.push('/dashboard/system/settings')
  ElMessage.success('跳转到系统设置页面')
}

const testAlertsPage = () => {
  router.push('/dashboard/system/alerts')
  ElMessage.success('跳转到系统告警页面')
}
</script>

<style scoped>
.test-system-pages {
  padding: 20px;
}

.card-header {
  font-weight: bold;
  font-size: 18px;
}

.test-content {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}
</style>