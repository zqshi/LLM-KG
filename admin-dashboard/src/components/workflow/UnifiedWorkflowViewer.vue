<template>
  <div class="unified-workflow-viewer">
    <!-- 头部控制区域 -->
    <div class="workflow-header" v-if="showModeSwitch">
      <div class="header-left">
        <h3 v-if="bannerInfo" class="banner-title">{{ bannerInfo.title }}</h3>
        <el-tag v-if="bannerInfo" :type="getStatusType(bannerInfo.status)">
          {{ getStatusText(bannerInfo.status) }}
        </el-tag>
      </div>
      <div class="header-right">
        <el-radio-group v-model="currentViewMode" size="small" @change="onViewModeChange">
          <el-radio-button label="steps">步骤视图</el-radio-button>
          <el-radio-button label="diagram">流程图视图</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- Banner信息卡片 -->
    <div v-if="bannerInfo && showBannerInfo" class="banner-info-card">
      <el-card shadow="never" :body-style="{ padding: '16px' }">
        <div class="banner-info-content">
          <div class="banner-preview">
            <el-image
              :src="bannerInfo.imageUrl"
              :preview-src-list="[bannerInfo.imageUrl]"
              fit="cover"
              class="preview-image"
              preview-teleported
            />
          </div>
          <div class="banner-details">
            <el-descriptions :column="2" size="small" border>
              <el-descriptions-item label="Banner标题">{{ bannerInfo.title }}</el-descriptions-item>
              <el-descriptions-item label="当前状态">
                <el-tag :type="getStatusType(bannerInfo.status)">
                  {{ getStatusText(bannerInfo.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="跳转链接" :span="2">
                <el-link :href="bannerInfo.linkUrl" target="_blank" type="primary">
                  {{ bannerInfo.linkUrl }}
                </el-link>
              </el-descriptions-item>
              <el-descriptions-item label="生效时间" :span="2">
                {{ formatDateRange(bannerInfo.startTime, bannerInfo.endTime) }}
              </el-descriptions-item>
              <el-descriptions-item v-if="bannerInfo.description" label="描述" :span="2">
                {{ bannerInfo.description }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 工作流内容区域 -->
    <div class="workflow-content">
      <!-- 步骤视图 -->
      <div v-if="currentViewMode === 'steps'" class="steps-view">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>审批流程步骤</span>
              <div class="progress-info">
                <span class="progress-text">{{ getProgressText() }}</span>
                <el-progress 
                  :percentage="getProgressPercentage()" 
                  :status="getProgressStatus()"
                  :stroke-width="6"
                  class="progress-bar"
                />
              </div>
            </div>
          </template>

          <el-steps 
            :active="getActiveStep()" 
            :finish-status="getFinishStatus()"
            :process-status="getProcessStatus()"
            align-center
            class="workflow-steps"
          >
            <el-step
              v-for="(step, index) in workflowData.steps"
              :key="index"
              :title="step.name"
              :description="getStepDescription(step)"
              :status="getStepStatus(step)"
            >
              <template #icon>
                <el-icon v-if="step.status === 'approved'" class="step-icon success">
                  <SuccessFilled />
                </el-icon>
                <el-icon v-else-if="step.status === 'rejected'" class="step-icon error">
                  <CircleCloseFilled />
                </el-icon>
                <el-icon v-else-if="step.status === 'processing'" class="step-icon processing">
                  <Loading />
                </el-icon>
                <div v-else class="step-number">{{ index + 1 }}</div>
              </template>
            </el-step>
          </el-steps>

          <!-- 空状态 -->
          <div v-if="!workflowData.steps?.length" class="empty-state">
            <el-empty :image-size="120" description="暂无审批流程数据">
              <template #description>
                <span class="empty-description">该Banner尚未提交审核或配置审批流程</span>
              </template>
            </el-empty>
          </div>
        </el-card>
      </div>

      <!-- 流程图视图 -->
      <div v-else class="diagram-view">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>审批流程图</span>
              <div class="diagram-controls">
                <el-tooltip content="重新布局" placement="top">
                  <el-button size="small" circle @click="resetLayout">
                    <el-icon><Refresh /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="全屏查看" placement="top">
                  <el-button size="small" circle @click="toggleFullscreen">
                    <el-icon><FullScreen /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </div>
          </template>

          <div class="diagram-container" :class="{ 'is-fullscreen': isFullscreen }">
            <div class="workflow-diagram">
              <div class="start-node">
                <div class="node-content">
                  <el-icon><Right /></el-icon>
                  <span>开始</span>
                </div>
              </div>

              <div 
                v-for="(step, index) in workflowData.steps" 
                :key="index" 
                class="workflow-step"
                :class="getStepNodeClass(step)"
              >
                <div class="step-header">
                  <div class="step-title">
                    <el-icon v-if="step.status === 'approved'"><SuccessFilled /></el-icon>
                    <el-icon v-else-if="step.status === 'rejected'"><CircleCloseFilled /></el-icon>
                    <el-icon v-else-if="step.status === 'processing'"><Loading /></el-icon>
                    <span class="step-index">{{ index + 1 }}</span>
                    <span class="step-name">{{ step.name }}</span>
                  </div>
                  <el-tag :type="getStepTagType(step.status)" size="small">
                    {{ getStepStatusText(step.status) }}
                  </el-tag>
                </div>
                
                <div class="step-body">
                  <div class="step-info">
                    <div class="info-item">
                      <el-icon><User /></el-icon>
                      <span>{{ step.approvers?.join(', ') || '未指定' }}</span>
                    </div>
                    <div v-if="step.processTime" class="info-item">
                      <el-icon><Clock /></el-icon>
                      <span>{{ step.processTime }}</span>
                    </div>
                    <div v-if="step.duration" class="info-item">
                      <el-icon><Timer /></el-icon>
                      <span>{{ step.duration }}</span>
                    </div>
                  </div>
                  
                  <div v-if="step.comment" class="step-comment">
                    <div class="comment-label">
                      <el-icon><ChatDotRound /></el-icon>
                      <span>处理意见:</span>
                    </div>
                    <p class="comment-text">{{ step.comment }}</p>
                  </div>
                </div>

                <!-- 连接线 -->
                <div v-if="index < workflowData.steps.length - 1" class="connection-line">
                  <div class="line"></div>
                  <div class="arrow">
                    <el-icon><ArrowRight /></el-icon>
                  </div>
                </div>
              </div>

              <div class="end-node" :class="{ 'reached': isWorkflowComplete() }">
                <div class="node-content">
                  <el-icon><Select /></el-icon>
                  <span>{{ getEndNodeText() }}</span>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="!workflowData.steps?.length" class="empty-state">
              <el-empty :image-size="200" description="暂无审批流程数据">
                <template #description>
                  <span class="empty-description">该Banner尚未提交审核或配置审批流程</span>
                </template>
              </el-empty>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 操作历史时间线 -->
      <div v-if="workflowData.operationHistory?.length" class="operation-history">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>操作记录</span>
              <el-tag size="small" type="info">
                共 {{ workflowData.operationHistory.length }} 条记录
              </el-tag>
            </div>
          </template>

          <el-timeline class="operation-timeline">
            <el-timeline-item
              v-for="(record, index) in workflowData.operationHistory"
              :key="index"
              :timestamp="record.time"
              :type="getHistoryType(record.action)"
              placement="top"
            >
              <div class="history-item">
                <div class="history-header">
                  <div class="action-info">
                    <el-tag :type="getActionTagType(record.action)" size="small">
                      {{ getActionText(record.action) }}
                    </el-tag>
                    <span class="operator">{{ record.operator }}</span>
                    <span v-if="record.node" class="node-name">{{ record.node }}</span>
                  </div>
                  <div v-if="record.duration" class="duration">
                    <el-tag size="small" type="info">耗时: {{ record.duration }}</el-tag>
                  </div>
                </div>
                <div v-if="record.comment" class="history-content">
                  <p>{{ record.comment }}</p>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  SuccessFilled, 
  CircleCloseFilled, 
  Loading, 
  Refresh, 
  FullScreen,
  Right,
  Select,
  User,
  Clock,
  Timer,
  ChatDotRound,
  ArrowRight
} from '@element-plus/icons-vue'
import type { BannerStatus } from '@/api/banner'

/**
 * 工作流步骤接口
 */
export interface WorkflowStep {
  id: string | number
  name: string
  status: 'pending' | 'processing' | 'approved' | 'rejected'
  approvers?: string[]
  processTime?: string
  comment?: string
  duration?: string
  approvalType?: 'any' | 'all'
}

/**
 * 操作记录接口
 */
export interface OperationRecord {
  time: string
  operator: string
  action: 'submit' | 'approve' | 'reject' | 'delegate' | 'revoke' | 'publish' | 'offline'
  comment?: string
  node?: string
  duration?: string
}

/**
 * 工作流数据接口
 */
export interface WorkflowData {
  steps: WorkflowStep[]
  operationHistory?: OperationRecord[]
  currentStatus?: string
  totalDuration?: string
}

/**
 * Banner信息接口
 */
export interface BannerInfo {
  id: number
  title: string
  imageUrl: string
  linkUrl: string
  startTime: string
  endTime: string
  status: BannerStatus
  description?: string
  creator?: string
  createTime?: string
}

// Props定义
interface Props {
  /** 工作流数据 */
  workflowData: WorkflowData
  /** Banner基本信息 */
  bannerInfo?: BannerInfo
  /** 展示模式 */
  viewMode?: 'auto' | 'steps' | 'diagram'
  /** 是否显示模式切换开关 */
  showModeSwitch?: boolean
  /** 是否显示Banner信息 */
  showBannerInfo?: boolean
  /** 是否开启响应式自动切换 */
  responsive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: 'auto',
  showModeSwitch: true,
  showBannerInfo: true,
  responsive: true
})

// Emits定义
interface Emits {
  (e: 'mode-change', mode: 'steps' | 'diagram'): void
  (e: 'step-click', step: WorkflowStep): void
  (e: 'fullscreen-change', isFullscreen: boolean): void
}

const emit = defineEmits<Emits>()

// 响应式数据
const currentViewMode = ref<'auto' | 'steps' | 'diagram'>(props.viewMode)
const isFullscreen = ref(false)

// 计算属性
const computedViewMode = computed<'steps' | 'diagram'>(() => {
  if (props.viewMode === 'auto') {
    // 自动模式：根据屏幕大小和数据量智能选择
    if (!props.workflowData.steps?.length) return 'steps'
    if (props.workflowData.steps.length <= 3) return 'steps'
    return window.innerWidth > 1200 ? 'diagram' : 'steps'
  }
  return props.viewMode as 'steps' | 'diagram'
})

// 状态工具函数
const getStatusType = (status: BannerStatus) => {
  const statusMap: Record<BannerStatus, string> = {
    draft: '',
    pending: 'warning',
    reviewing: 'info',
    approved: 'success',
    rejected: 'danger',
    published: 'success',
    offline: 'info'
  }
  return statusMap[status] || ''
}

const getStatusText = (status: BannerStatus) => {
  const statusMap: Record<BannerStatus, string> = {
    draft: '草稿',
    pending: '待审核',
    reviewing: '审核中',
    approved: '已通过',
    rejected: '已拒绝',
    published: '已发布',
    offline: '已下线'
  }
  return statusMap[status] || status
}

// 步骤相关函数
const getActiveStep = () => {
  const steps = props.workflowData.steps
  if (!steps?.length) return 0
  
  const processingIndex = steps.findIndex(step => step.status === 'processing')
  if (processingIndex !== -1) return processingIndex
  
  const approvedCount = steps.filter(step => step.status === 'approved').length
  return approvedCount
}

const getStepStatus = (step: WorkflowStep): 'success' | 'wait' | 'error' | 'finish' | 'process' => {
  const statusMap: Record<string, 'success' | 'wait' | 'error' | 'finish' | 'process'> = {
    pending: 'wait',
    processing: 'process',
    approved: 'finish',
    rejected: 'error'
  }
  return statusMap[step.status] || 'wait'
}

const getStepDescription = (step: WorkflowStep) => {
  const parts = []
  if (step.approvers?.length) {
    parts.push(`审批人: ${step.approvers.join(', ')}`)
  }
  if (step.processTime) {
    parts.push(`处理时间: ${step.processTime}`)
  }
  return parts.join(' | ')
}

const getFinishStatus = () => {
  const hasRejected = props.workflowData.steps.some(step => step.status === 'rejected')
  return hasRejected ? 'error' : 'success'
}

const getProcessStatus = () => {
  const hasProcessing = props.workflowData.steps.some(step => step.status === 'processing')
  return hasProcessing ? 'process' : 'wait'
}

// 进度相关函数
const getProgressPercentage = () => {
  const steps = props.workflowData.steps
  if (!steps?.length) return 0
  
  const approvedCount = steps.filter(step => step.status === 'approved').length
  const rejectedCount = steps.filter(step => step.status === 'rejected').length
  
  if (rejectedCount > 0) return 100
  return Math.round((approvedCount / steps.length) * 100)
}

const getProgressStatus = () => {
  const steps = props.workflowData.steps
  if (!steps?.length) return undefined
  
  const hasRejected = steps.some(step => step.status === 'rejected')
  if (hasRejected) return 'exception'
  
  const allApproved = steps.every(step => step.status === 'approved')
  if (allApproved) return 'success'
  
  return undefined
}

const getProgressText = () => {
  const steps = props.workflowData.steps
  if (!steps?.length) return '暂无流程'
  
  const approvedCount = steps.filter(step => step.status === 'approved').length
  const rejectedCount = steps.filter(step => step.status === 'rejected').length
  
  if (rejectedCount > 0) return '审批被拒绝'
  if (approvedCount === steps.length) return '审批完成'
  
  return `${approvedCount}/${steps.length} 已通过`
}

// 流程图相关函数
const getStepNodeClass = (step: WorkflowStep) => {
  return {
    'step-approved': step.status === 'approved',
    'step-rejected': step.status === 'rejected',
    'step-processing': step.status === 'processing',
    'step-pending': step.status === 'pending'
  }
}

const getStepTagType = (status: string) => {
  const typeMap: Record<string, string> = {
    pending: 'info',
    processing: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStepStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return textMap[status] || status
}

const isWorkflowComplete = () => {
  const steps = props.workflowData.steps
  if (!steps?.length) return false
  
  return steps.every(step => ['approved', 'rejected'].includes(step.status))
}

const getEndNodeText = () => {
  const hasRejected = props.workflowData.steps?.some(step => step.status === 'rejected')
  if (hasRejected) return '审批拒绝'
  
  const allApproved = props.workflowData.steps?.every(step => step.status === 'approved')
  if (allApproved) return '审批完成'
  
  return '结束'
}

// 操作记录相关函数
const getHistoryType = (action: string) => {
  const typeMap: Record<string, any> = {
    submit: 'primary',
    approve: 'success',
    reject: 'danger',
    delegate: 'warning',
    revoke: 'info',
    publish: 'success',
    offline: 'info'
  }
  return typeMap[action] || 'primary'
}

const getActionText = (action: string) => {
  const textMap: Record<string, string> = {
    submit: '提交审批',
    approve: '审批通过',
    reject: '审批拒绝',
    delegate: '委派审批',
    revoke: '撤回审批',
    publish: '发布上线',
    offline: '下线'
  }
  return textMap[action] || action
}

const getActionTagType = (action: string) => {
  const typeMap: Record<string, string> = {
    submit: '',
    approve: 'success',
    reject: 'danger',
    delegate: 'warning',
    revoke: 'info',
    publish: 'success',
    offline: 'info'
  }
  return typeMap[action] || ''
}

// 工具函数
const formatDateRange = (start: string, end: string) => {
  return `${start} ~ ${end}`
}

// 事件处理函数
const onViewModeChange = (mode: 'steps' | 'diagram') => {
  currentViewMode.value = mode
  emit('mode-change', mode)
}

const resetLayout = () => {
  // 重新布局逻辑
  console.log('重新布局流程图')
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  emit('fullscreen-change', isFullscreen.value)
}

// 监听器
watch(() => props.viewMode, (newMode) => {
  if (newMode !== 'auto') {
    currentViewMode.value = newMode
  }
}, { immediate: true })

watch(() => computedViewMode.value, (newMode) => {
  if (props.viewMode === 'auto') {
    currentViewMode.value = newMode
  }
}, { immediate: true })

// 响应式处理
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (props.responsive && props.viewMode === 'auto') {
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize)
    
    // 使用ResizeObserver监听容器大小变化
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(handleResize)
      const container = document.querySelector('.unified-workflow-viewer')
      if (container) {
        resizeObserver.observe(container)
      }
    }
  }
  
  // 初始化视图模式
  if (props.viewMode === 'auto') {
    currentViewMode.value = computedViewMode.value
  } else {
    currentViewMode.value = props.viewMode
  }
})

const handleResize = () => {
  if (props.viewMode === 'auto') {
    currentViewMode.value = computedViewMode.value
  }
}

// 清理
onUnmounted(() => {
  if (props.responsive) {
    window.removeEventListener('resize', handleResize)
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
  }
})
</script>

<style scoped>
.unified-workflow-viewer {
  width: 100%;
  min-height: 200px;
}

/* 头部样式 */
.workflow-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 4px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.banner-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
}

/* Banner信息卡片样式 */
.banner-info-card {
  margin-bottom: 16px;
}

.banner-info-content {
  display: flex;
  gap: 16px;
}

.banner-preview {
  flex-shrink: 0;
  width: 150px;
}

.preview-image {
  width: 100%;
  height: 80px;
  border-radius: 6px;
  border: 1px solid #dcdfe6;
}

.banner-details {
  flex: 1;
  min-width: 0;
}

/* 卡片头部样式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-text {
  font-size: 12px;
  color: #606266;
}

.progress-bar {
  width: 120px;
}

.diagram-controls {
  display: flex;
  gap: 8px;
}

/* 步骤视图样式 */
.steps-view .workflow-steps {
  padding: 24px 0;
}

.step-icon {
  font-size: 16px;
}

.step-icon.success {
  color: #67c23a;
}

.step-icon.error {
  color: #f56c6c;
}

.step-icon.processing {
  color: #e6a23c;
  animation: rotate 1s linear infinite;
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #c0c4cc;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

/* 流程图视图样式 */
.diagram-container {
  position: relative;
  min-height: 300px;
  transition: all 0.3s ease;
}

.diagram-container.is-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  background: white;
  padding: 20px;
  overflow: auto;
}

.workflow-diagram {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 20px;
  overflow-x: auto;
  min-height: 200px;
}

.start-node, .end-node {
  flex-shrink: 0;
  min-width: 80px;
  padding: 12px 16px;
  border-radius: 20px;
  font-weight: 600;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #67c23a;
  color: white;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
}

.end-node {
  background: #909399;
  box-shadow: 0 2px 8px rgba(144, 147, 153, 0.3);
}

.end-node.reached {
  background: #67c23a;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
}

.node-content {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.workflow-step {
  position: relative;
  flex-shrink: 0;
  min-width: 240px;
  max-width: 280px;
  padding: 16px;
  border: 2px solid #dcdfe6;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.workflow-step:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.step-approved {
  border-color: #67c23a;
  background: linear-gradient(135deg, #f0f9ff 0%, #e8f8f5 100%);
}

.step-rejected {
  border-color: #f56c6c;
  background: linear-gradient(135deg, #fef0f0 0%, #fdf2f2 100%);
}

.step-processing {
  border-color: #e6a23c;
  background: linear-gradient(135deg, #fdf6ec 0%, #fef7e6 100%);
  animation: pulse 2s infinite;
}

.step-pending {
  border-color: #c0c4cc;
  background: #fafafa;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(230, 162, 60, 0.3);
  }
  50% {
    box-shadow: 0 2px 16px rgba(230, 162, 60, 0.6);
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.step-title {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.step-index {
  font-weight: bold;
  color: #909399;
  font-size: 12px;
}

.step-name {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.step-body {
  font-size: 12px;
  color: #606266;
}

.step-info {
  margin-bottom: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
  line-height: 1.4;
}

.info-item:last-child {
  margin-bottom: 0;
}

.step-comment {
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.comment-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #303133;
}

.comment-text {
  margin: 0;
  padding: 6px 8px;
  background: #f5f7fa;
  border-radius: 4px;
  font-style: italic;
  line-height: 1.4;
}

.connection-line {
  position: absolute;
  left: 100%;
  top: 50%;
  width: 20px;
  height: 2px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  z-index: 1;
}

.connection-line .line {
  flex: 1;
  height: 2px;
  background: #dcdfe6;
}

.connection-line .arrow {
  color: #dcdfe6;
  font-size: 12px;
}

/* 操作历史样式 */
.operation-history {
  margin-top: 16px;
}

.operation-timeline {
  padding: 8px 0;
}

.history-item {
  padding: 4px 0;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.action-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.operator {
  font-weight: 600;
  color: #303133;
}

.node-name {
  color: #909399;
  font-size: 12px;
}

.history-content {
  color: #606266;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}

.history-content p {
  margin: 0;
  line-height: 1.5;
}

/* 空状态样式 */
.empty-state {
  padding: 40px 0;
  text-align: center;
}

.empty-description {
  color: #909399;
  font-size: 14px;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .workflow-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .header-left {
    justify-content: center;
  }
  
  .header-right {
    justify-content: center;
  }
  
  .banner-info-content {
    flex-direction: column;
  }
  
  .banner-preview {
    width: 100%;
    max-width: 200px;
    margin: 0 auto;
  }
  
  .workflow-diagram {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  
  .workflow-step {
    width: 100%;
    max-width: 300px;
  }
  
  .connection-line {
    position: static;
    width: 2px;
    height: 16px;
    transform: none;
    align-self: center;
  }
  
  .connection-line .line {
    width: 2px;
    height: 100%;
  }
  
  .connection-line .arrow {
    transform: rotate(90deg);
  }
}

@media (max-width: 480px) {
  .card-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .progress-info {
    width: 100%;
    justify-content: space-between;
  }
  
  .progress-bar {
    width: 100px;
  }
}
</style>