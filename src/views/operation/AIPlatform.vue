<template>
  <div class="ai-platform-page">
    <div class="page-header">
      <h1 class="page-title">AI平台管理</h1>
      <el-button type="primary" @click="handleAddKey">
        <el-icon><Plus /></el-icon>
        添加密钥
      </el-button>
    </div>

    <div class="platform-tabs">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="API密钥管理" name="keys">
          <div class="keys-content">
            <el-table :data="apiKeys" style="width: 100%">
              <el-table-column prop="name" label="密钥名称" width="150" />
              <el-table-column prop="provider" label="服务商" width="120">
                <template #default="{ row }">
                  <el-tag :color="getProviderColor(row.provider)" size="small">
                    {{ getProviderName(row.provider) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="model" label="模型" width="150" />
              <el-table-column prop="usage" label="使用量" width="100">
                <template #default="{ row }">
                  <el-progress :percentage="row.usage" :stroke-width="6" />
                </template>
              </el-table-column>
              <el-table-column prop="quota" label="配额" width="100" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
                    {{ row.status === 'active' ? '正常' : '异常' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                  <el-button size="small" @click="handleTestKey(row)">测试</el-button>
                  <el-button size="small" @click="handleEditKey(row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="handleDeleteKey(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="功能开关" name="features">
          <div class="features-content">
            <el-form label-width="150px">
              <el-form-item label="智能摘要">
                <el-switch v-model="features.summary" active-text="开启" inactive-text="关闭" />
                <span class="feature-desc">为长篇文章自动生成摘要</span>
              </el-form-item>
              
              <el-form-item label="内容审核">
                <el-switch v-model="features.contentReview" active-text="开启" inactive-text="关闭" />
                <span class="feature-desc">AI辅助内容审核</span>
              </el-form-item>
              
              <el-form-item label="智能推荐">
                <el-switch v-model="features.recommend" active-text="开启" inactive-text="关闭" />
                <span class="feature-desc">基于用户行为的个性化推荐</span>
              </el-form-item>
              
              <el-form-item label="语音识别">
                <el-switch v-model="features.speechToText" active-text="开启" inactive-text="关闭" />
                <span class="feature-desc">支持语音转文字功能</span>
              </el-form-item>
              
              <el-form-item label="文本翻译">
                <el-switch v-model="features.translation" active-text="开启" inactive-text="关闭" />
                <span class="feature-desc">多语言文本翻译</span>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="使用统计" name="statistics">
          <div class="statistics-content">
            <el-row :gutter="16">
              <el-col :span="6">
                <el-statistic title="今日调用" :value="statistics.todayCalls" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="本月调用" :value="statistics.monthlyCalls" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="总费用" :value="statistics.totalCost" prefix="￥" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="成功率" :value="statistics.successRate" suffix="%" />
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'

const activeTab = ref('keys')

const apiKeys = ref([
  {
    id: 1,
    name: '主要密钥',
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    usage: 65,
    quota: '1000次/天',
    status: 'active'
  },
  {
    id: 2,
    name: '备用密钥',
    provider: 'baidu',
    model: '文心一言',
    usage: 23,
    quota: '500次/天',
    status: 'active'
  }
])

const features = reactive({
  summary: true,
  contentReview: true,
  recommend: false,
  speechToText: false,
  translation: false
})

const statistics = reactive({
  todayCalls: 1256,
  monthlyCalls: 35648,
  totalCost: 2453.67,
  successRate: 98.5
})

const getProviderName = (provider: string) => {
  const providerMap: Record<string, string> = {
    openai: 'OpenAI',
    baidu: '百度',
    alibaba: '阿里云',
    tencent: '腾讯云'
  }
  return providerMap[provider] || provider
}

const getProviderColor = (provider: string) => {
  const colorMap: Record<string, string> = {
    openai: '#10b981',
    baidu: '#3b82f6',
    alibaba: '#f59e0b',
    tencent: '#06b6d4'
  }
  return colorMap[provider] || '#6b7280'
}

const handleAddKey = () => {
  ElMessage.info('添加密钥功能开发中...')
}

const handleEditKey = (row: any) => {
  ElMessage.info('编辑密钥功能开发中...')
}

const handleDeleteKey = (row: any) => {
  ElMessage.info('删除密钥功能开发中...')
}

const handleTestKey = (row: any) => {
  ElMessage.success('密钥测试通过')
}
</script>

<style scoped>
.ai-platform-page {
  padding: 20px;
}

.platform-tabs {
  margin-top: 20px;
}

.keys-content,
.features-content,
.statistics-content {
  padding: 20px;
}

.feature-desc {
  margin-left: 16px;
  color: #909399;
  font-size: 14px;
}
</style>