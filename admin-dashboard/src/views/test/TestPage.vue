<template>
  <div class="test-page">
    <h1>测试页面</h1>
    <p>用于测试静态模式下的功能</p>
    
    <el-card>
      <h3>环境信息</h3>
      <p>静态模式: {{ isStaticMode ? '是' : '否' }}</p>
      <p>API基础URL: {{ apiBaseUrl || '未设置' }}</p>
    </el-card>
    
    <el-card>
      <h3>测试功能</h3>
      <el-button @click="testNavigationApi">测试导航API</el-button>
      <el-button @click="testFeedbackApi">测试反馈API</el-button>
      <el-button @click="testAuditApi">测试审计API</el-button>
    </el-card>
    
    <el-card>
      <h3>测试结果</h3>
      <pre>{{ testResult }}</pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { portalConfigApi } from '@/api/navigation'
import { feedbackApi } from '@/api/feedback'
import { globalAuditApi } from '@/api/system'

const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
  import.meta.env.VITE_API_BASE_URL === '' || 
  !import.meta.env.VITE_API_BASE_URL

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const testResult = ref('')

const testNavigationApi = async () => {
  try {
    testResult.value = '正在测试导航API...'
    const response = await portalConfigApi.navigation.getNavigationTree()
    testResult.value = JSON.stringify(response, null, 2)
    ElMessage.success('导航API测试成功')
  } catch (error) {
    testResult.value = `导航API测试失败: ${error}`
    ElMessage.error('导航API测试失败')
  }
}

const testFeedbackApi = async () => {
  try {
    testResult.value = '正在测试反馈API...'
    const response = await feedbackApi.getFeedbackList({ page: 1, pageSize: 10 })
    testResult.value = JSON.stringify(response, null, 2)
    ElMessage.success('反馈API测试成功')
  } catch (error) {
    testResult.value = `反馈API测试失败: ${error}`
    ElMessage.error('反馈API测试失败')
  }
}

const testAuditApi = async () => {
  try {
    testResult.value = '正在测试审计API...'
    const response = await globalAuditApi.getGlobalAuditLogs({ page: 1, pageSize: 10 })
    testResult.value = JSON.stringify(response, null, 2)
    ElMessage.success('审计API测试成功')
  } catch (error) {
    testResult.value = `审计API测试失败: ${error}`
    ElMessage.error('审计API测试失败')
  }
}
</script>

<style scoped>
.test-page {
  padding: 20px;
}

.el-card {
  margin-bottom: 20px;
}
</style>