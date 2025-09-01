<template>
  <div class="audit-policy-page">
    <div class="page-header">
      <h1 class="page-title">审核策略配置</h1>
      <el-button type="primary" @click="handleSave" :loading="saveLoading">
        <el-icon><Check /></el-icon>
        保存配置
      </el-button>
    </div>

    <el-row :gutter="20">
      <!-- 左侧配置面板 -->
      <el-col :span="16">
        <div class="config-panels">
          <!-- 全局审核策略 -->
          <el-card class="config-card">
            <template #header>
              <span>全局审核策略</span>
            </template>
            
            <el-form :model="globalPolicy" label-width="140px">
              <el-form-item label="默认审核模式">
                <el-radio-group v-model="globalPolicy.defaultMode">
                  <el-radio value="none">
                    <div class="radio-option">
                      <div class="option-title">无需审核</div>
                      <div class="option-desc">内容直接发布，适用于信任度高的用户</div>
                    </div>
                  </el-radio>
                  <el-radio value="pre">
                    <div class="radio-option">
                      <div class="option-title">先审后发</div>
                      <div class="option-desc">内容必须审核通过后才能发布，安全性最高</div>
                    </div>
                  </el-radio>
                  <el-radio value="post">
                    <div class="radio-option">
                      <div class="option-title">先发后审</div>
                      <div class="option-desc">内容先发布再进入待审队列，兼顾效率与安全</div>
                    </div>
                  </el-radio>
                  <el-radio value="sample">
                    <div class="radio-option">
                      <div class="option-title">抽审模式</div>
                      <div class="option-desc">按比例随机抽取内容进行审核</div>
                    </div>
                  </el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item v-if="globalPolicy.defaultMode === 'sample'" label="抽审比例">
                <el-slider
                  v-model="globalPolicy.sampleRate"
                  :min="1"
                  :max="100"
                  show-tooltip
                  :format-tooltip="(val) => `${val}%`"
                  style="width: 300px; margin-right: 20px"
                />
                <span class="sample-rate-text">{{ globalPolicy.sampleRate }}%</span>
              </el-form-item>
              
              <el-form-item label="自动审核">
                <el-switch
                  v-model="globalPolicy.autoAudit"
                  active-text="启用AI自动审核"
                  inactive-text="仅人工审核"
                />
                <div class="form-help">启用后，AI会自动处理低风险内容，高风险内容仍需人工审核</div>
              </el-form-item>
              
              <el-form-item v-if="globalPolicy.autoAudit" label="AI审核阈值">
                <div class="threshold-config">
                  <div class="threshold-item">
                    <span class="threshold-label">自动通过阈值：</span>
                    <el-input-number
                      v-model="globalPolicy.autoPassThreshold"
                      :min="60"
                      :max="100"
                      :precision="0"
                    />
                    <span class="threshold-unit">分</span>
                  </div>
                  <div class="threshold-item">
                    <span class="threshold-label">自动拒绝阈值：</span>
                    <el-input-number
                      v-model="globalPolicy.autoRejectThreshold"
                      :min="0"
                      :max="40"
                      :precision="0"
                    />
                    <span class="threshold-unit">分</span>
                  </div>
                </div>
                <div class="form-help">评分在阈值之间的内容需要人工审核</div>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 版块审核策略 -->
          <el-card class="config-card">
            <template #header>
              <div class="card-header">
                <span>版块审核策略</span>
                <el-tooltip content="不同版块可以配置不同的审核策略">
                  <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
            </template>
            
            <div class="section-policies">
              <div
                v-for="policy in sectionPolicies"
                :key="policy.sectionId"
                class="policy-item"
              >
                <div class="policy-header">
                  <div class="section-info">
                    <el-icon :color="policy.color"><FolderOpened /></el-icon>
                    <span class="section-name">{{ policy.sectionName }}</span>
                    <el-tag v-if="policy.isSpecial" type="warning" size="small">特殊版块</el-tag>
                  </div>
                  <el-switch
                    v-model="policy.enabled"
                    active-text="自定义"
                    inactive-text="跟随全局"
                    size="small"
                  />
                </div>
                
                <div v-if="policy.enabled" class="policy-config">
                  <el-form :model="policy" label-width="100px" size="small">
                    <el-form-item label="审核模式">
                      <el-select v-model="policy.mode" style="width: 150px">
                        <el-option label="无需审核" value="none" />
                        <el-option label="先审后发" value="pre" />
                        <el-option label="先发后审" value="post" />
                        <el-option label="抽审模式" value="sample" />
                      </el-select>
                    </el-form-item>
                    
                    <el-form-item v-if="policy.mode === 'sample'" label="抽审比例">
                      <el-input-number
                        v-model="policy.sampleRate"
                        :min="1"
                        :max="100"
                        size="small"
                        style="width: 100px"
                      />
                      <span style="margin-left: 8px">%</span>
                    </el-form-item>
                    
                    <el-form-item label="优先级">
                      <el-radio-group v-model="policy.priority" size="small">
                        <el-radio value="low">普通</el-radio>
                        <el-radio value="high">优先</el-radio>
                        <el-radio value="urgent">紧急</el-radio>
                      </el-radio-group>
                    </el-form-item>
                    
                    <el-form-item label="指定审核员">
                      <el-select
                        v-model="policy.assignedAuditors"
                        multiple
                        placeholder="选择审核员（可选）"
                        style="width: 200px"
                      >
                        <el-option
                          v-for="auditor in auditorList"
                          :key="auditor.id"
                          :label="auditor.name"
                          :value="auditor.id"
                        />
                      </el-select>
                    </el-form-item>
                  </el-form>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 内容类型策略 -->
          <el-card class="config-card">
            <template #header>
              <span>内容类型策略</span>
            </template>
            
            <el-table :data="contentTypePolicies" style="width: 100%">
              <el-table-column prop="typeName" label="内容类型" width="120">
                <template #default="{ row }">
                  <div class="type-info">
                    <el-icon :color="row.color">
                      <component :is="row.icon" />
                    </el-icon>
                    <span>{{ row.typeName }}</span>
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column prop="mode" label="审核模式" width="150">
                <template #default="{ row }">
                  <el-select v-model="row.mode" size="small">
                    <el-option label="无需审核" value="none" />
                    <el-option label="先审后发" value="pre" />
                    <el-option label="先发后审" value="post" />
                    <el-option label="抽审模式" value="sample" />
                  </el-select>
                </template>
              </el-table-column>
              
              <el-table-column prop="aiCheck" label="AI检测" width="100">
                <template #default="{ row }">
                  <el-switch v-model="row.aiCheck" size="small" />
                </template>
              </el-table-column>
              
              <el-table-column prop="sensitiveWordCheck" label="敏感词检测" width="120">
                <template #default="{ row }">
                  <el-switch v-model="row.sensitiveWordCheck" size="small" />
                </template>
              </el-table-column>
              
              <el-table-column prop="timeout" label="审核超时" width="120">
                <template #default="{ row }">
                  <el-input-number
                    v-model="row.timeout"
                    :min="1"
                    :max="168"
                    size="small"
                    style="width: 80px"
                  />
                  <span style="margin-left: 4px; font-size: 12px">小时</span>
                </template>
              </el-table-column>
              
              <el-table-column prop="description" label="说明" min-width="150">
                <template #default="{ row }">
                  <span class="type-description">{{ row.description }}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-card>

          <!-- 高级配置 -->
          <el-card class="config-card">
            <template #header>
              <span>高级配置</span>
            </template>
            
            <el-form :model="advancedConfig" label-width="140px">
              <el-form-item label="审核时间限制">
                <div class="time-config">
                  <el-checkbox v-model="advancedConfig.enableTimeLimit">
                    启用工作时间审核
                  </el-checkbox>
                  <div v-if="advancedConfig.enableTimeLimit" class="time-range">
                    <span>工作时间：</span>
                    <el-time-picker
                      v-model="advancedConfig.workTimeStart"
                      format="HH:mm"
                      placeholder="开始时间"
                      style="width: 120px"
                    />
                    <span style="margin: 0 8px">-</span>
                    <el-time-picker
                      v-model="advancedConfig.workTimeEnd"
                      format="HH:mm"
                      placeholder="结束时间"
                      style="width: 120px"
                    />
                  </div>
                </div>
              </el-form-item>
              
              <el-form-item label="审核员分配">
                <el-radio-group v-model="advancedConfig.assignmentMode">
                  <el-radio value="round_robin">轮询分配</el-radio>
                  <el-radio value="random">随机分配</el-radio>
                  <el-radio value="load_balance">负载均衡</el-radio>
                  <el-radio value="manual">手动分配</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item label="审核提醒">
                <el-checkbox-group v-model="advancedConfig.notifications">
                  <el-checkbox value="email">邮件提醒</el-checkbox>
                  <el-checkbox value="system">站内消息</el-checkbox>
                  <el-checkbox value="mobile">手机短信</el-checkbox>
                  <el-checkbox value="webhook">Webhook通知</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              
              <el-form-item label="升级规则">
                <div class="escalation-rules">
                  <el-checkbox v-model="advancedConfig.enableEscalation">
                    启用审核升级
                  </el-checkbox>
                  <div v-if="advancedConfig.enableEscalation" class="escalation-config">
                    <div class="escalation-item">
                      <span>超时未审核：</span>
                      <el-input-number
                        v-model="advancedConfig.escalationTimeout"
                        :min="1"
                        :max="72"
                        size="small"
                        style="width: 80px"
                      />
                      <span>小时后自动升级给上级审核</span>
                    </div>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </el-col>

      <!-- 右侧预览和统计 -->
      <el-col :span="8">
        <div class="sidebar-panels">
          <!-- 策略预览 -->
          <el-card>
            <template #header>
              <span>当前策略概览</span>
            </template>
            
            <div class="policy-overview">
              <div class="overview-item">
                <div class="overview-label">全局默认模式</div>
                <el-tag :type="getModeColor(globalPolicy.defaultMode)">
                  {{ getModeName(globalPolicy.defaultMode) }}
                </el-tag>
              </div>
              
              <div class="overview-item">
                <div class="overview-label">AI自动审核</div>
                <el-tag :type="globalPolicy.autoAudit ? 'success' : 'info'">
                  {{ globalPolicy.autoAudit ? '已启用' : '已禁用' }}
                </el-tag>
              </div>
              
              <div class="overview-item">
                <div class="overview-label">自定义策略版块</div>
                <span class="overview-value">
                  {{ sectionPolicies.filter(p => p.enabled).length }}/{{ sectionPolicies.length }}
                </span>
              </div>
              
              <div class="overview-item">
                <div class="overview-label">严格审核类型</div>
                <span class="overview-value">
                  {{ contentTypePolicies.filter(p => p.mode === 'pre').length }}
                </span>
              </div>
            </div>
          </el-card>

          <!-- 审核效率统计 -->
          <el-card style="margin-top: 20px">
            <template #header>
              <span>审核效率统计</span>
            </template>
            
            <div class="efficiency-stats">
              <div class="stat-item">
                <div class="stat-value">92.5%</div>
                <div class="stat-label">自动审核通过率</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">2.3小时</div>
                <div class="stat-label">平均审核时长</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">156</div>
                <div class="stat-label">今日待审内容</div>
              </div>
            </div>
            
            <el-divider />
            
            <div class="recent-changes">
              <h4>最近策略变更</h4>
              <div class="change-list">
                <div class="change-item">
                  <div class="change-time">2小时前</div>
                  <div class="change-desc">启用企业红黑榜先审后发模式</div>
                </div>
                <div class="change-item">
                  <div class="change-time">1天前</div>
                  <div class="change-desc">调整AI自动审核阈值到85分</div>
                </div>
                <div class="change-item">
                  <div class="change-time">3天前</div>
                  <div class="change-desc">新增产品心得版块自定义策略</div>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import {
  Check, QuestionFilled, FolderOpened,
  Document, ChatDotRound, ShoppingCart, Trophy
} from '@element-plus/icons-vue'

interface SectionPolicy {
  sectionId: number
  sectionName: string
  color: string
  isSpecial: boolean
  enabled: boolean
  mode: 'none' | 'pre' | 'post' | 'sample'
  sampleRate: number
  priority: 'low' | 'high' | 'urgent'
  assignedAuditors: number[]
}

interface ContentTypePolicy {
  typeCode: string
  typeName: string
  icon: string
  color: string
  mode: 'none' | 'pre' | 'post' | 'sample'
  aiCheck: boolean
  sensitiveWordCheck: boolean
  timeout: number
  description: string
}

const saveLoading = ref(false)

const globalPolicy = reactive({
  defaultMode: 'post' as 'none' | 'pre' | 'post' | 'sample',
  sampleRate: 20,
  autoAudit: true,
  autoPassThreshold: 85,
  autoRejectThreshold: 30
})

const sectionPolicies = ref<SectionPolicy[]>([])
const contentTypePolicies = ref<ContentTypePolicy[]>([])

const advancedConfig = reactive({
  enableTimeLimit: false,
  workTimeStart: null as Date | null,
  workTimeEnd: null as Date | null,
  assignmentMode: 'round_robin' as 'round_robin' | 'random' | 'load_balance' | 'manual',
  notifications: ['system'],
  enableEscalation: true,
  escalationTimeout: 24
})

const auditorList = ref([
  { id: 1, name: '审核员A' },
  { id: 2, name: '审核员B' },
  { id: 3, name: '审核员C' }
])

const mockSectionPolicies = (): SectionPolicy[] => [
  {
    sectionId: 1,
    sectionName: '技术分享',
    color: '#409eff',
    isSpecial: false,
    enabled: false,
    mode: 'post',
    sampleRate: 15,
    priority: 'low',
    assignedAuditors: []
  },
  {
    sectionId: 2,
    sectionName: '企业红黑榜',
    color: '#e6a23c',
    isSpecial: true,
    enabled: true,
    mode: 'pre',
    sampleRate: 100,
    priority: 'urgent',
    assignedAuditors: [1, 2]
  },
  {
    sectionId: 3,
    sectionName: '产品心得',
    color: '#67c23a',
    isSpecial: false,
    enabled: true,
    mode: 'post',
    sampleRate: 25,
    priority: 'high',
    assignedAuditors: [2]
  },
  {
    sectionId: 4,
    sectionName: '跳蚤市场',
    color: '#f56c6c',
    isSpecial: true,
    enabled: true,
    mode: 'pre',
    sampleRate: 50,
    priority: 'high',
    assignedAuditors: [1, 3]
  }
]

const mockContentTypePolicies = (): ContentTypePolicy[] => [
  {
    typeCode: 'article',
    typeName: '文章',
    icon: 'Document',
    color: '#409eff',
    mode: 'post',
    aiCheck: true,
    sensitiveWordCheck: true,
    timeout: 24,
    description: '长篇技术或管理类文章'
  },
  {
    typeCode: 'post',
    typeName: '帖子',
    icon: 'ChatDotRound',
    color: '#67c23a',
    mode: 'post',
    aiCheck: true,
    sensitiveWordCheck: true,
    timeout: 12,
    description: '日常讨论和交流帖子'
  },
  {
    typeCode: 'ranking',
    typeName: '红黑榜',
    icon: 'Trophy',
    color: '#e6a23c',
    mode: 'pre',
    aiCheck: true,
    sensitiveWordCheck: true,
    timeout: 2,
    description: '员工表彰或批评建议'
  },
  {
    typeCode: 'product',
    typeName: '商品',
    icon: 'ShoppingCart',
    color: '#f56c6c',
    mode: 'pre',
    aiCheck: true,
    sensitiveWordCheck: true,
    timeout: 6,
    description: '跳蚤市场商品信息'
  }
]

const getModeName = (mode: string) => {
  const modeMap: Record<string, string> = {
    none: '无需审核',
    pre: '先审后发',
    post: '先发后审',
    sample: '抽审模式'
  }
  return modeMap[mode] || mode
}

const getModeColor = (mode: string) => {
  const colorMap: Record<string, string> = {
    none: 'success',
    pre: 'danger',
    post: 'warning',
    sample: 'info'
  }
  return colorMap[mode] || 'info'
}

const loadData = () => {
  sectionPolicies.value = mockSectionPolicies()
  contentTypePolicies.value = mockContentTypePolicies()
}

const handleSave = () => {
  saveLoading.value = true
  setTimeout(() => {
    saveLoading.value = false
    ElMessage.success('审核策略配置保存成功')
  }, 1000)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.audit-policy-page {
  padding: 20px;
}

.config-panels {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.config-card {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.radio-option {
  margin-left: 8px;
}

.option-title {
  font-weight: 500;
  color: #303133;
}

.option-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.sample-rate-text {
  color: #409eff;
  font-weight: 500;
}

.form-help {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.threshold-config {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.threshold-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.threshold-label {
  min-width: 120px;
  color: #606266;
}

.threshold-unit {
  color: #909399;
}

.section-policies {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.policy-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  background-color: #fafafa;
}

.policy-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-name {
  font-weight: 500;
  color: #303133;
}

.policy-config {
  border-top: 1px solid #e4e7ed;
  padding-top: 16px;
  margin-top: 16px;
}

.type-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-description {
  font-size: 12px;
  color: #909399;
}

.time-config {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.time-range {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 20px;
}

.escalation-rules {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.escalation-config {
  margin-left: 20px;
}

.escalation-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sidebar-panels {
  position: sticky;
  top: 20px;
}

.policy-overview {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.overview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.overview-label {
  font-size: 14px;
  color: #606266;
}

.overview-value {
  font-weight: 500;
  color: #303133;
}

.efficiency-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.recent-changes h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #303133;
}

.change-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.change-item {
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.change-time {
  font-size: 11px;
  color: #c0c4cc;
  margin-bottom: 4px;
}

.change-desc {
  font-size: 12px;
  color: #606266;
}

:deep(.el-radio) {
  display: block;
  margin-bottom: 16px;
  height: auto;
}

:deep(.el-radio:last-child) {
  margin-bottom: 0;
}

:deep(.el-radio__label) {
  padding-left: 8px;
}
</style>