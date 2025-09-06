<template>
  <div class="approval-config-panel">
    <!-- 配置模式选择 -->
    <div class="config-mode-selector">
      <el-radio-group v-model="configMode" class="mode-group">
        <el-radio value="smart" class="mode-radio">
          <div class="mode-content">
            <el-icon class="mode-icon"><MagicStick /></el-icon>
            <div class="mode-text">
              <div class="mode-title">智能推荐</div>
              <div class="mode-desc">基于内容自动推荐审批流程</div>
            </div>
          </div>
        </el-radio>
        <el-radio value="template" class="mode-radio">
          <div class="mode-content">
            <el-icon class="mode-icon"><Collection /></el-icon>
            <div class="mode-text">
              <div class="mode-title">模板选择</div>
              <div class="mode-desc">从预设模板中选择审批流程</div>
            </div>
          </div>
        </el-radio>
        <el-radio value="custom" class="mode-radio">
          <div class="mode-content">
            <el-icon class="mode-icon"><Setting /></el-icon>
            <div class="mode-text">
              <div class="mode-title">自定义配置</div>
              <div class="mode-desc">手动配置详细审批参数</div>
            </div>
          </div>
        </el-radio>
      </el-radio-group>
    </div>

    <!-- 智能推荐模式 -->
    <div v-if="configMode === 'smart'" class="smart-config-section">
      <div class="section-header">
        <h4>智能审批配置</h4>
        <el-button type="primary" link @click="generateRecommendation">
          <el-icon><Refresh /></el-icon>
          重新推荐
        </el-button>
      </div>

      <div class="recommendation-area" v-loading="recommendationLoading">
        <div v-if="recommendation" class="recommendation-content">
          <div class="recommendation-header">
            <div class="confidence-indicator">
              <span class="confidence-label">推荐置信度</span>
              <el-progress 
                :percentage="recommendation.confidence" 
                :color="getConfidenceColor(recommendation.confidence)"
                :show-text="false"
                :stroke-width="8"
              />
              <span class="confidence-value">{{ recommendation.confidence }}%</span>
            </div>
            <div class="recommendation-reason">
              <el-icon><InfoFilled /></el-icon>
              {{ recommendation.reason }}
            </div>
          </div>

          <div class="recommended-flow">
            <div class="flow-title">推荐审批流程</div>
            <div class="flow-steps">
              <div 
                v-for="(step, index) in recommendation.steps" 
                :key="index"
                class="flow-step"
              >
                <div class="step-number">{{ index + 1 }}</div>
                <div class="step-content">
                  <div class="step-name">{{ step.name }}</div>
                  <div class="step-desc">{{ step.description }}</div>
                  <div class="step-estimateTime">预计耗时：{{ step.estimateTime }}</div>
                </div>
                <el-icon v-if="index < recommendation.steps.length - 1" class="step-arrow">
                  <ArrowRight />
                </el-icon>
              </div>
            </div>
          </div>

          <div class="flow-options">
            <div class="priority-section">
              <label>审批优先级</label>
              <el-select v-model="smartConfig.priority" placeholder="选择优先级">
                <el-option 
                  v-for="option in priorityOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                >
                  <span class="priority-option">
                    <el-tag :type="option.type as any" size="small">{{ option.label }}</el-tag>
                    <span class="option-desc">{{ option.desc }}</span>
                  </span>
                </el-option>
              </el-select>
            </div>

            <div class="timeline-section">
              <label>期望完成时间</label>
              <el-date-picker
                v-model="smartConfig.expectedCompleteTime"
                type="datetime"
                placeholder="选择期望完成时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </div>
          </div>

          <div class="smart-features">
            <el-checkbox v-model="smartConfig.autoReminder">
              自动催办提醒（超时自动提醒审批人员）
            </el-checkbox>
            <el-checkbox v-model="smartConfig.smartEscalation">
              智能升级（审批超时自动升级到上级处理）
            </el-checkbox>
            <el-checkbox v-model="smartConfig.parallelProcessing">
              并行处理（多个审批节点同时进行）
            </el-checkbox>
          </div>
        </div>

        <div v-else class="no-recommendation">
          <el-empty description="点击重新推荐获取智能审批建议" />
        </div>
      </div>
    </div>

    <!-- 模板选择模式 -->
    <div v-if="configMode === 'template'" class="template-config-section">
      <div class="section-header">
        <h4>选择审批模板</h4>
        <el-input
          v-model="templateSearchKeyword"
          placeholder="搜索模板..."
          class="template-search"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <div class="template-list">
        <div 
          v-for="template in filteredTemplates"
          :key="template.id"
          class="template-card"
          :class="{ 'selected': selectedTemplate?.id === template.id }"
          @click="selectTemplate(template)"
        >
          <div class="template-header">
            <div class="template-name">{{ template.name }}</div>
            <el-tag :type="template.recommended ? 'success' : 'info'" size="small">
              {{ template.recommended ? '推荐' : '标准' }}
            </el-tag>
          </div>
          <div class="template-desc">{{ template.description }}</div>
          <div class="template-stats">
            <span class="stat-item">
              <el-icon><Timer /></el-icon>
              {{ template.avgProcessTime }}
            </span>
            <span class="stat-item">
              <el-icon><User /></el-icon>
              {{ template.stepCount }}个节点
            </span>
            <span class="stat-item">
              <el-icon><SuccessFilled /></el-icon>
              {{ template.successRate }}%通过率
            </span>
          </div>
        </div>
      </div>

      <!-- 模板预览 -->
      <div v-if="selectedTemplate" class="template-preview">
        <div class="preview-header">
          <h4>{{ selectedTemplate.name }} - 流程预览</h4>
        </div>
        <div class="preview-steps">
          <div 
            v-for="(step, index) in selectedTemplate.steps"
            :key="index"
            class="preview-step"
          >
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-info">
              <div class="step-name">{{ step.name }}</div>
              <div class="step-detail">
                <span class="approver">审批人：{{ step.approver || '自动分配' }}</span>
                <span class="time-limit">时限：{{ step.timeLimit || '24小时' }}</span>
              </div>
            </div>
            <el-icon v-if="index < selectedTemplate.steps.length - 1" class="step-connector">
              <ArrowDown />
            </el-icon>
          </div>
        </div>

        <div class="template-options">
          <div class="option-group">
            <label>优先级设置</label>
            <el-radio-group v-model="templateConfig.priority">
              <el-radio value="high">高优先级（4小时内处理）</el-radio>
              <el-radio value="normal">普通优先级（24小时内处理）</el-radio>
              <el-radio value="low">低优先级（72小时内处理）</el-radio>
            </el-radio-group>
          </div>

          <div class="option-group">
            <label>特殊设置</label>
            <el-checkbox-group v-model="templateConfig.features">
              <el-checkbox value="skip_weekend">跳过周末</el-checkbox>
              <el-checkbox value="auto_reminder">自动提醒</el-checkbox>
              <el-checkbox value="escalation">超时升级</el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
      </div>
    </div>

    <!-- 自定义配置模式 -->
    <div v-if="configMode === 'custom'" class="custom-config-section">
      <div class="section-header">
        <h4>自定义审批配置</h4>
        <el-button type="primary" @click="addCustomStep">
          <el-icon><Plus /></el-icon>
          添加审批节点
        </el-button>
      </div>

      <div class="custom-steps">
        <div 
          v-for="(step, index) in customConfig.steps"
          :key="step.id"
          class="custom-step"
        >
          <div class="step-header">
            <div class="step-title">
              <span class="step-index">步骤 {{ index + 1 }}</span>
              <el-button 
                type="danger" 
                link 
                size="small"
                @click="removeCustomStep(index)"
                v-if="customConfig.steps.length > 1"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>

          <div class="step-form">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="节点名称">
                  <el-input v-model="step.name" placeholder="输入节点名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="审批人员">
                  <el-select 
                    v-model="step.approverId" 
                    placeholder="选择审批人员"
                    filterable
                    clearable
                  >
                    <el-option
                      v-for="user in approverList"
                      :key="user.id"
                      :label="`${user.name} (${user.department})`"
                      :value="user.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="处理时限">
                  <el-select v-model="step.timeLimit" placeholder="选择时限">
                    <el-option label="2小时" value="2h" />
                    <el-option label="4小时" value="4h" />
                    <el-option label="8小时" value="8h" />
                    <el-option label="24小时" value="24h" />
                    <el-option label="48小时" value="48h" />
                    <el-option label="72小时" value="72h" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="节点类型">
                  <el-select v-model="step.type" placeholder="选择类型">
                    <el-option label="人工审批" value="manual" />
                    <el-option label="自动审批" value="auto" />
                    <el-option label="条件审批" value="conditional" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="是否必须">
                  <el-switch v-model="step.required" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="备注说明">
              <el-input 
                v-model="step.description" 
                type="textarea" 
                :rows="2"
                placeholder="输入节点说明..."
              />
            </el-form-item>
          </div>
        </div>
      </div>

      <div class="custom-global-settings">
        <h4>全局设置</h4>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="整体优先级">
              <el-select v-model="customConfig.globalPriority">
                <el-option label="高" value="high" />
                <el-option label="中" value="normal" />
                <el-option label="低" value="low" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="并行处理">
              <el-switch v-model="customConfig.parallelEnabled" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="自动提醒">
              <el-switch v-model="customConfig.reminderEnabled" />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 实时预览区 -->
    <div class="preview-section">
      <div class="section-header">
        <h4>审批流程预览</h4>
        <div class="preview-actions">
          <el-button @click="previewMode = 'flow'" :type="previewMode === 'flow' ? 'primary' : ''">
            流程图
          </el-button>
          <el-button @click="previewMode = 'timeline'" :type="previewMode === 'timeline' ? 'primary' : ''">
            时间轴
          </el-button>
          <el-button @click="previewMode = 'table'" :type="previewMode === 'table' ? 'primary' : ''">
            表格视图
          </el-button>
        </div>
      </div>

      <div class="preview-content">
        <!-- 流程图预览 -->
        <div v-if="previewMode === 'flow'" class="flow-preview">
          <div v-if="previewSteps.length === 0" class="empty-preview">
            <el-empty description="请先配置审批流程" />
          </div>
          <div v-else class="flow-diagram">
            <div class="flow-start">开始</div>
            <div 
              v-for="(step, index) in previewSteps"
              :key="index"
              class="flow-node"
            >
              <el-icon class="flow-arrow"><ArrowDown /></el-icon>
              <div class="node-content">
                <div class="node-title">{{ step.name }}</div>
                <div class="node-approver">{{ step.approver || '系统自动' }}</div>
                <div class="node-time">{{ step.timeLimit || '24h' }}</div>
              </div>
            </div>
            <el-icon class="flow-arrow"><ArrowDown /></el-icon>
            <div class="flow-end">完成</div>
          </div>
        </div>

        <!-- 时间轴预览 -->
        <div v-if="previewMode === 'timeline'" class="timeline-preview">
          <el-timeline>
            <el-timeline-item
              v-for="(step, index) in previewSteps"
              :key="index"
              :timestamp="`预计 ${step.estimatedTime || calculateEstimatedTime(index)}`"
              placement="top"
            >
              <el-card shadow="hover">
                <h4>{{ step.name }}</h4>
                <p>审批人：{{ step.approver || '系统自动分配' }}</p>
                <p>处理时限：{{ step.timeLimit || '24小时' }}</p>
                <p v-if="step.description">{{ step.description }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>

        <!-- 表格预览 -->
        <div v-if="previewMode === 'table'" class="table-preview">
          <el-table :data="previewSteps" stripe>
            <el-table-column type="index" label="步骤" width="60" />
            <el-table-column prop="name" label="节点名称" />
            <el-table-column prop="approver" label="审批人员" />
            <el-table-column prop="timeLimit" label="处理时限" />
            <el-table-column prop="type" label="节点类型" />
            <el-table-column label="状态">
              <template #default>
                <el-tag type="info">待配置</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 配置摘要 -->
    <div class="config-summary">
      <div class="summary-header">
        <h4>配置摘要</h4>
      </div>
      <div class="summary-content">
        <div class="summary-item">
          <span class="label">配置模式：</span>
          <span class="value">{{ getConfigModeText() }}</span>
        </div>
        <div class="summary-item">
          <span class="label">审批节点：</span>
          <span class="value">{{ previewSteps.length }}个</span>
        </div>
        <div class="summary-item">
          <span class="label">预计耗时：</span>
          <span class="value">{{ getTotalEstimatedTime() }}</span>
        </div>
        <div class="summary-item">
          <span class="label">优先级：</span>
          <span class="value">{{ getCurrentPriority() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  MagicStick, 
  Collection, 
  Setting, 
  Refresh, 
  InfoFilled,
  ArrowRight,
  ArrowDown,
  Search,
  Timer,
  User,
  SuccessFilled,
  Plus,
  Delete
} from '@element-plus/icons-vue'
import { bannerApi, type ApprovalTemplate } from '@/api/banner'

// 组件 Props
interface Props {
  bannerData?: {
    title?: string
    imageUrl?: string
    linkUrl?: string
    description?: string
  }
  initialConfig?: any
}

const props = withDefaults(defineProps<Props>(), {
  bannerData: () => ({}),
  initialConfig: () => ({})
})

// Emits
const emit = defineEmits<{
  configChange: [config: any]
  ready: [isReady: boolean]
}>()

// 配置模式
const configMode = ref<'smart' | 'template' | 'custom'>('smart')
const previewMode = ref<'flow' | 'timeline' | 'table'>('flow')

// 推荐相关数据
const recommendationLoading = ref(false)
const recommendation = ref<any>(null)

// 智能配置
const smartConfig = reactive({
  priority: 'normal',
  expectedCompleteTime: '',
  autoReminder: true,
  smartEscalation: false,
  parallelProcessing: false
})

// 模板相关数据
const templateSearchKeyword = ref('')
const selectedTemplate = ref<any>(null)
const templateConfig = reactive({
  priority: 'normal',
  features: []
})

// 自定义配置
const customConfig = reactive({
  steps: [
    {
      id: 1,
      name: '',
      approverId: null,
      timeLimit: '24h',
      type: 'manual',
      required: true,
      description: ''
    }
  ],
  globalPriority: 'normal',
  parallelEnabled: false,
  reminderEnabled: true
})

// 审批人员列表
const approverList = ref([
  { id: 1, name: '张三', department: '运营部' },
  { id: 2, name: '李四', department: '市场部' },
  { id: 3, name: '王五', department: '内容部' },
  { id: 4, name: '赵六', department: '技术部' }
])

// 优先级选项
const priorityOptions = [
  { 
    value: 'high', 
    label: '高优先级', 
    type: 'danger', 
    desc: '4小时内处理完成' 
  },
  { 
    value: 'normal', 
    label: '普通优先级', 
    type: 'warning', 
    desc: '24小时内处理完成' 
  },
  { 
    value: 'low', 
    label: '低优先级', 
    type: 'info', 
    desc: '72小时内处理完成' 
  }
]

// 模板数据
const approvalTemplates = ref<ApprovalTemplate[]>([
  {
    id: 1,
    name: '标准Banner审批',
    description: '适用于常规营销Banner的审批流程',
    recommended: true,
    avgProcessTime: '8小时',
    stepCount: 3,
    successRate: 95,
    steps: [
      { name: '内容初审', approver: '内容审核员', timeLimit: '2小时', type: 'manual', description: '审核内容是否符合规范' },
      { name: '设计审核', approver: '设计主管', timeLimit: '4小时', type: 'manual', description: '审核设计质量' },
      { name: '运营审批', approver: '运营总监', timeLimit: '2小时', type: 'manual', description: '最终运营审批' }
    ]
  },
  {
    id: 2,
    name: '快速审批流程',
    description: '适用于紧急或简单Banner的快速审批',
    recommended: false,
    avgProcessTime: '2小时',
    stepCount: 2,
    successRate: 88,
    steps: [
      { name: '自动检测', approver: '系统自动', timeLimit: '10分钟', type: 'auto', description: '系统自动检测' },
      { name: '主管审批', approver: '部门主管', timeLimit: '2小时', type: 'manual', description: '部门主管审批' }
    ]
  },
  {
    id: 3,
    name: '重要活动审批',
    description: '适用于重大活动或品牌相关Banner',
    recommended: false,
    avgProcessTime: '24小时',
    stepCount: 5,
    successRate: 98,
    steps: [
      { name: '内容审核', approver: '内容审核员', timeLimit: '4小时', type: 'manual', description: '审核内容合规性' },
      { name: '法务审核', approver: '法务专员', timeLimit: '8小时', type: 'manual', description: '法务风险评估' },
      { name: '设计审核', approver: '设计总监', timeLimit: '4小时', type: 'manual', description: '设计质量审核' },
      { name: '运营审批', approver: '运营总监', timeLimit: '4小时', type: 'manual', description: '运营策略审批' },
      { name: '最终确认', approver: 'CEO', timeLimit: '4小时', type: 'manual', description: 'CEO最终确认' }
    ]
  }
])

// 计算过滤后的模板
const filteredTemplates = computed(() => {
  if (!templateSearchKeyword.value) return approvalTemplates.value
  return approvalTemplates.value.filter(template => 
    template.name.includes(templateSearchKeyword.value) ||
    template.description.includes(templateSearchKeyword.value)
  )
})

// 获取预览步骤
const previewSteps = computed(() => {
  if (configMode.value === 'smart' && recommendation.value) {
    return recommendation.value.steps.map((step: any) => ({
      name: step.name,
      approver: step.approver || '系统自动',
      timeLimit: step.estimateTime,
      type: step.type || 'manual',
      description: step.description
    }))
  } else if (configMode.value === 'template' && selectedTemplate.value) {
    return selectedTemplate.value.steps.map((step: any) => ({
      name: step.name,
      approver: step.approver,
      timeLimit: step.timeLimit,
      type: 'manual',
      description: ''
    }))
  } else if (configMode.value === 'custom') {
    return customConfig.steps.filter(step => step.name).map(step => {
      const approver = approverList.value.find(user => user.id === step.approverId)
      return {
        name: step.name,
        approver: approver ? `${approver.name} (${approver.department})` : '未指定',
        timeLimit: step.timeLimit,
        type: step.type,
        description: step.description
      }
    })
  }
  return []
})

// 获取置信度颜色
const getConfidenceColor = (confidence: number) => {
  if (confidence >= 80) return '#67c23a'
  if (confidence >= 60) return '#e6a23c'
  return '#f56c6c'
}

// 生成智能推荐
const generateRecommendation = async () => {
  recommendationLoading.value = true
  
  try {
    // 调用真实API获取智能推荐
    const response = await bannerApi.getApprovalRecommendation(props.bannerData)
    recommendation.value = response.data
    ElMessage.success('智能推荐生成成功')
  } catch (error) {
    console.error('获取智能推荐失败:', error)
    
    // 降级使用本地推荐逻辑
    const bannerContent = props.bannerData
    let confidence = 85
    let steps = []
    let reason = '基于内容分析和历史数据'

    // 根据不同条件调整推荐
    if (bannerContent.linkUrl?.includes('activity') || bannerContent.title?.includes('活动')) {
      confidence = 92
      reason = '检测到活动相关内容，推荐使用活动专用审批流程'
      steps = [
        {
          name: '内容合规检查',
          description: '检查活动内容是否符合平台规范',
          estimateTime: '1小时',
          approver: '内容审核员'
        },
        {
          name: '活动审核',
          description: '审核活动策划和执行方案',
          estimateTime: '4小时',
          approver: '活动策划主管'
        },
        {
          name: '法务风控',
          description: '评估活动的法律风险和合规性',
          estimateTime: '2小时',
          approver: '法务专员'
        },
        {
          name: '最终审批',
          description: '运营总监最终确认',
          estimateTime: '1小时',
          approver: '运营总监'
        }
      ]
    } else if (bannerContent.title?.includes('品牌') || bannerContent.title?.includes('官方')) {
      confidence = 88
      reason = '检测到品牌相关内容，推荐使用品牌审批流程'
      steps = [
        {
          name: '品牌合规审核',
          description: '检查品牌元素使用是否规范',
          estimateTime: '2小时',
          approver: '品牌管理员'
        },
        {
          name: '设计审核',
          description: '审核设计质量和品牌一致性',
          estimateTime: '4小时',
          approver: '设计总监'
        },
        {
          name: '运营确认',
          description: '运营部门最终确认',
          estimateTime: '2小时',
          approver: '运营总监'
        }
      ]
    } else {
      // 标准流程
      steps = [
        {
          name: '自动检测',
          description: 'AI自动检测内容合规性',
          estimateTime: '10分钟',
          approver: '系统自动'
        },
        {
          name: '人工审核',
          description: '人工审核内容质量和合规性',
          estimateTime: '2小时',
          approver: '内容审核员'
        },
        {
          name: '主管审批',
          description: '部门主管最终审批',
          estimateTime: '1小时',
          approver: '部门主管'
        }
      ]
    }

    recommendation.value = {
      confidence,
      reason,
      steps,
      estimatedTotalTime: steps.reduce((total, step) => {
        const time = parseInt(step.estimateTime || '1')
        return total + (isNaN(time) ? 1 : time)
      }, 0) + '小时'
    }

    ElMessage.warning('API调用失败，使用本地推荐逻辑')
  } finally {
    recommendationLoading.value = false
  }
}

// 选择模板
const selectTemplate = (template: any) => {
  selectedTemplate.value = template
  templateConfig.priority = 'normal'
  templateConfig.features = []
  
  ElMessage.success(`已选择模板：${template.name}`)
}

// 添加自定义步骤
const addCustomStep = () => {
  const newId = Math.max(...customConfig.steps.map(s => s.id)) + 1
  customConfig.steps.push({
    id: newId,
    name: '',
    approverId: null,
    timeLimit: '24h',
    type: 'manual',
    required: true,
    description: ''
  })
}

// 移除自定义步骤
const removeCustomStep = (index: number) => {
  customConfig.steps.splice(index, 1)
}

// 计算预估时间
const calculateEstimatedTime = (index: number) => {
  const baseTime = new Date()
  baseTime.setHours(baseTime.getHours() + (index + 1) * 8)
  return baseTime.toLocaleString()
}

// 获取配置模式文本
const getConfigModeText = () => {
  const modeMap = {
    smart: '智能推荐',
    template: '模板选择',
    custom: '自定义配置'
  }
  return modeMap[configMode.value]
}

// 获取总预计时间
const getTotalEstimatedTime = () => {
  if (configMode.value === 'smart' && recommendation.value) {
    return recommendation.value.estimatedTotalTime
  } else if (configMode.value === 'template' && selectedTemplate.value) {
    return selectedTemplate.value.avgProcessTime
  } else if (configMode.value === 'custom') {
    const totalHours = customConfig.steps.length * 8 // 简化计算
    return `约${totalHours}小时`
  }
  return '待配置'
}

// 获取当前优先级
const getCurrentPriority = () => {
  if (configMode.value === 'smart') {
    return priorityOptions.find(p => p.value === smartConfig.priority)?.label || '普通'
  } else if (configMode.value === 'template') {
    return priorityOptions.find(p => p.value === templateConfig.priority)?.label || '普通'
  } else if (configMode.value === 'custom') {
    return priorityOptions.find(p => p.value === customConfig.globalPriority)?.label || '普通'
  }
  return '普通'
}

// 监听配置变化
watch([configMode, smartConfig, templateConfig, customConfig, selectedTemplate], () => {
  const currentConfig = {
    mode: configMode.value,
    smart: configMode.value === 'smart' ? { ...smartConfig, recommendation: recommendation.value } : null,
    template: configMode.value === 'template' ? { ...templateConfig, selected: selectedTemplate.value } : null,
    custom: configMode.value === 'custom' ? { ...customConfig } : null,
    preview: previewSteps.value
  }
  
  emit('configChange', currentConfig)
  emit('ready', previewSteps.value.length > 0)
}, { deep: true })

// 加载模板数据
const loadTemplates = async () => {
  try {
    const response = await bannerApi.getApprovalTemplates()
    approvalTemplates.value = response.data
  } catch (error) {
    console.error('加载模板失败:', error)
    // 使用默认模板数据
  }
}

// 加载审批人员
const loadApprovers = async () => {
  try {
    const response = await bannerApi.getApprovers()
    approverList.value = response.data
  } catch (error) {
    console.error('加载审批人员失败:', error)
    // 使用默认数据
  }
}

// 初始化
onMounted(async () => {
  // 并行加载基础数据
  await Promise.all([
    loadTemplates(),
    loadApprovers()
  ])

  // 如果有初始配置，加载它
  if (props.initialConfig && props.initialConfig.mode) {
    configMode.value = props.initialConfig.mode
  }
  
  // 如果是智能模式，自动生成推荐
  if (configMode.value === 'smart') {
    generateRecommendation()
  }
})
</script>

<style scoped>
.approval-config-panel {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}

/* 配置模式选择器 */
.config-mode-selector {
  margin-bottom: 24px;
}

.mode-group {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.mode-radio {
  margin: 0;
  flex: 1;
  min-width: 200px;
}

.mode-radio :deep(.el-radio__input) {
  display: none;
}

.mode-radio :deep(.el-radio__label) {
  padding: 0;
  width: 100%;
}

.mode-content {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;
}

.mode-radio.is-checked .mode-content {
  border-color: #409eff;
  background: #ecf5ff;
}

.mode-icon {
  font-size: 24px;
  color: #909399;
  margin-right: 12px;
}

.mode-radio.is-checked .mode-icon {
  color: #409eff;
}

.mode-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
}

.mode-desc {
  font-size: 12px;
  color: #909399;
}

/* 区域通用样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.section-header h4 {
  margin: 0;
  color: #303133;
}

/* 智能推荐区域 */
.smart-config-section {
  margin-bottom: 24px;
}

.recommendation-area {
  min-height: 200px;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
}

.recommendation-content {
  background: white;
  border-radius: 6px;
  padding: 16px;
}

.recommendation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  background: #f0f9ff;
  border-radius: 6px;
}

.confidence-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.confidence-label {
  font-size: 12px;
  color: #606266;
}

.confidence-value {
  font-weight: 600;
  font-size: 14px;
}

.recommendation-reason {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #409eff;
  font-size: 13px;
}

.recommended-flow {
  margin-bottom: 20px;
}

.flow-title {
  font-weight: 600;
  margin-bottom: 12px;
  color: #303133;
}

.flow-steps {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.flow-step {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.step-content {
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: white;
  min-width: 150px;
}

.step-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.step-desc {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.step-estimateTime {
  font-size: 11px;
  color: #67c23a;
}

.step-arrow {
  color: #c0c4cc;
}

.flow-options {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.priority-section, .timeline-section {
  flex: 1;
}

.priority-section label, .timeline-section label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.priority-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.option-desc {
  font-size: 12px;
  color: #909399;
}

.smart-features {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

/* 模板选择区域 */
.template-config-section {
  margin-bottom: 24px;
}

.template-search {
  width: 300px;
}

.template-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.template-card {
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.template-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.template-card.selected {
  border-color: #409eff;
  background: #ecf5ff;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.template-name {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.template-desc {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
  line-height: 1.4;
}

.template-stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.template-preview {
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
  margin-top: 16px;
}

.preview-header h4 {
  margin: 0 0 16px 0;
  color: #303133;
}

.preview-steps {
  margin-bottom: 20px;
}

.preview-step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.preview-step:last-child {
  margin-bottom: 0;
}

.step-info {
  flex: 1;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

.step-detail {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.step-connector {
  color: #c0c4cc;
  margin-top: 8px;
}

.template-options {
  display: flex;
  gap: 32px;
}

.option-group {
  flex: 1;
}

.option-group label {
  display: block;
  margin-bottom: 12px;
  font-weight: 600;
  color: #303133;
}

/* 自定义配置区域 */
.custom-config-section {
  margin-bottom: 24px;
}

.custom-steps {
  margin-bottom: 24px;
}

.custom-step {
  margin-bottom: 20px;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.step-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-index {
  font-weight: 600;
  color: #409eff;
}

.step-form {
  background: white;
  padding: 16px;
  border-radius: 6px;
}

.custom-global-settings {
  padding: 16px;
  background: #f0f9ff;
  border-radius: 8px;
}

.custom-global-settings h4 {
  margin: 0 0 16px 0;
  color: #303133;
}

/* 预览区域 */
.preview-section {
  margin-bottom: 24px;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.preview-content {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
  min-height: 300px;
}

.flow-preview .empty-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 260px;
}

.flow-diagram {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
}

.flow-start, .flow-end {
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  color: white;
}

.flow-start {
  background: #67c23a;
}

.flow-end {
  background: #409eff;
}

.flow-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.flow-arrow {
  color: #c0c4cc;
  font-size: 18px;
}

.node-content {
  padding: 12px 16px;
  background: white;
  border: 2px solid #409eff;
  border-radius: 8px;
  text-align: center;
  min-width: 120px;
}

.node-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.node-approver {
  font-size: 12px;
  color: #606266;
  margin-bottom: 2px;
}

.node-time {
  font-size: 11px;
  color: #909399;
}

.timeline-preview {
  padding: 20px;
}

.table-preview {
  background: white;
  border-radius: 6px;
  padding: 16px;
}

/* 配置摘要 */
.config-summary {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.summary-header h4 {
  margin: 0 0 12px 0;
  color: #303133;
}

.summary-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-item .label {
  font-size: 13px;
  color: #606266;
}

.summary-item .value {
  font-weight: 600;
  color: #303133;
}

/* 响应式 */
@media (max-width: 768px) {
  .mode-group {
    flex-direction: column;
  }
  
  .flow-options {
    flex-direction: column;
    gap: 16px;
  }
  
  .template-options {
    flex-direction: column;
    gap: 20px;
  }
  
  .summary-content {
    grid-template-columns: 1fr;
  }
}
</style>