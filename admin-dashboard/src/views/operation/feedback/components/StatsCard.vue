<template>
  <div class="stats-card-wrapper">
    <el-row :gutter="20">
      <!-- 基础统计卡片 -->
      <el-col :span="6">
        <el-card class="stats-card total">
          <div class="stats-content">
            <div class="stats-icon">
              <el-icon><ChatDotRound /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ statistics?.total || 0 }}</div>
              <div class="stats-label">反馈总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stats-card pending">
          <div class="stats-content">
            <div class="stats-icon">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ statistics?.pending || 0 }}</div>
              <div class="stats-label">待处理</div>
              <div class="stats-trend" v-if="todayTrend.pending !== 0">
                <span :class="todayTrend.pending > 0 ? 'increase' : 'decrease'">
                  {{ todayTrend.pending > 0 ? '+' : '' }}{{ todayTrend.pending }}
                </span>
                <span class="trend-label">今日</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stats-card processing">
          <div class="stats-content">
            <div class="stats-icon">
              <el-icon><Loading /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ statistics?.processing || 0 }}</div>
              <div class="stats-label">处理中</div>
              <div class="stats-trend" v-if="todayTrend.processing !== 0">
                <span :class="todayTrend.processing > 0 ? 'increase' : 'decrease'">
                  {{ todayTrend.processing > 0 ? '+' : '' }}{{ todayTrend.processing }}
                </span>
                <span class="trend-label">今日</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stats-card resolved">
          <div class="stats-content">
            <div class="stats-icon">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ statistics?.resolved || 0 }}</div>
              <div class="stats-label">已解决</div>
              <div class="stats-trend" v-if="todayTrend.resolved !== 0">
                <span :class="todayTrend.resolved > 0 ? 'increase' : 'decrease'">
                  {{ todayTrend.resolved > 0 ? '+' : '' }}{{ todayTrend.resolved }}
                </span>
                <span class="trend-label">今日</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细统计卡片 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <!-- 反馈类型分布 -->
      <el-col :span="8">
        <el-card class="distribution-card">
          <template #header>
            <div class="card-header">
              <span>反馈类型分布</span>
            </div>
          </template>
          <div class="distribution-content">
            <div
              v-for="item in statistics?.typeDistribution || []"
              :key="item.type"
              class="distribution-item"
            >
              <div class="distribution-label">
                <el-tag :type="item.type === 'problem' ? 'danger' : 'primary'" size="small">
                  {{ getTypeLabel(item.type) }}
                </el-tag>
              </div>
              <div class="distribution-value">{{ item.count }}</div>
              <div class="distribution-percent">
                {{ calculatePercentage(item.count, statistics?.total || 0) }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 优先级分布 -->
      <el-col :span="8">
        <el-card class="distribution-card">
          <template #header>
            <div class="card-header">
              <span>优先级分布</span>
            </div>
          </template>
          <div class="distribution-content">
            <div
              v-for="item in statistics?.priorityDistribution || []"
              :key="item.priority"
              class="distribution-item"
            >
              <div class="distribution-label">
                <el-tag :color="getPriorityColor(item.priority)" size="small">
                  {{ getPriorityLabel(item.priority) }}
                </el-tag>
              </div>
              <div class="distribution-value">{{ item.count }}</div>
              <div class="distribution-percent">
                {{ calculatePercentage(item.count, statistics?.total || 0) }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 时间统计 -->
      <el-col :span="8">
        <el-card class="time-stats-card">
          <template #header>
            <div class="card-header">
              <span>时间统计</span>
            </div>
          </template>
          <div class="time-stats-content">
            <div class="time-stat-item">
              <div class="time-stat-label">今日新增</div>
              <div class="time-stat-value highlight">{{ statistics?.todayNew || 0 }}</div>
            </div>
            <div class="time-stat-item">
              <div class="time-stat-label">本周新增</div>
              <div class="time-stat-value">{{ statistics?.weeklyNew || 0 }}</div>
            </div>
            <div class="time-stat-item">
              <div class="time-stat-label">本月新增</div>
              <div class="time-stat-value">{{ statistics?.monthlyNew || 0 }}</div>
            </div>
            <div class="time-stat-item">
              <div class="time-stat-label">平均处理时间</div>
              <div class="time-stat-value">{{ formatProcessTime(statistics?.avgProcessTime || 0) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 处理效率指标 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card class="efficiency-card">
          <template #header>
            <div class="card-header">
              <span>处理效率指标</span>
              <el-button size="small" @click="refreshStats">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>
          <div class="efficiency-content">
            <el-row :gutter="40">
              <el-col :span="6">
                <div class="efficiency-item">
                  <div class="efficiency-value">{{ resolutionRate }}%</div>
                  <div class="efficiency-label">解决率</div>
                  <div class="efficiency-desc">已解决 / (已解决 + 已拒绝)</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="efficiency-item">
                  <div class="efficiency-value">{{ pendingRate }}%</div>
                  <div class="efficiency-label">待处理率</div>
                  <div class="efficiency-desc">待处理 / 总数</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="efficiency-item">
                  <div class="efficiency-value">{{ responseTime }}</div>
                  <div class="efficiency-label">平均响应时间</div>
                  <div class="efficiency-desc">从提交到首次处理</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="efficiency-item">
                  <div class="efficiency-value">{{ getHealthStatus() }}</div>
                  <div class="efficiency-label">整体健康度</div>
                  <div class="efficiency-desc">基于各项指标综合评估</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChatDotRound, Warning, Loading, CircleCheck, Refresh } from '@element-plus/icons-vue'
import type { FeedbackStatistics, FeedbackType, FeedbackPriority } from '@/types/feedbackManagement'

interface Props {
  statistics: FeedbackStatistics | null
}

interface Emits {
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 模拟今日变化趋势数据
const todayTrend = computed(() => ({
  pending: 5,
  processing: -2,
  resolved: 8
}))

const resolutionRate = computed(() => {
  if (!props.statistics) return 0
  const resolved = props.statistics.resolved
  const rejected = props.statistics.rejected
  const total = resolved + rejected
  return total > 0 ? Math.round((resolved / total) * 100) : 0
})

const pendingRate = computed(() => {
  if (!props.statistics) return 0
  const pending = props.statistics.pending
  const total = props.statistics.total
  return total > 0 ? Math.round((pending / total) * 100) : 0
})

const responseTime = computed(() => {
  return '2.5小时' // 模拟数据
})

const getTypeLabel = (type: FeedbackType) => {
  return type === 'problem' ? '问题反馈' : '产品建议'
}

const getPriorityLabel = (priority: FeedbackPriority) => {
  const labels = {
    low: '低',
    medium: '中', 
    high: '高',
    urgent: '紧急'
  }
  return labels[priority] || priority
}

const getPriorityColor = (priority: FeedbackPriority) => {
  const colors = {
    low: '#67c23a',
    medium: '#e6a23c',
    high: '#f56c6c',
    urgent: '#ff0000'
  }
  return colors[priority] || '#909399'
}

const calculatePercentage = (count: number, total: number) => {
  return total > 0 ? Math.round((count / total) * 100) : 0
}

const formatProcessTime = (hours: number) => {
  if (hours < 1) {
    return `${Math.round(hours * 60)}分钟`
  } else if (hours < 24) {
    return `${hours.toFixed(1)}小时`
  } else {
    return `${Math.round(hours / 24)}天`
  }
}

const getHealthStatus = () => {
  if (!props.statistics) return '未知'
  
  const pendingRate = (props.statistics.pending / props.statistics.total) * 100
  const resolutionRate = props.statistics.resolved / (props.statistics.resolved + props.statistics.rejected) * 100
  
  if (pendingRate < 10 && resolutionRate > 90) {
    return '优秀'
  } else if (pendingRate < 20 && resolutionRate > 80) {
    return '良好'
  } else if (pendingRate < 30 && resolutionRate > 70) {
    return '一般'
  } else {
    return '需改进'
  }
}

const refreshStats = () => {
  emit('refresh')
}
</script>

<style scoped>
.stats-card-wrapper {
  width: 100%;
}

.stats-card {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stats-card.total {
  border-left: 4px solid #409eff;
}

.stats-card.pending {
  border-left: 4px solid #f56c6c;
}

.stats-card.processing {
  border-left: 4px solid #e6a23c;
}

.stats-card.resolved {
  border-left: 4px solid #67c23a;
}

.stats-content {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.stats-icon {
  font-size: 32px;
  margin-right: 16px;
  opacity: 0.8;
}

.stats-card.total .stats-icon {
  color: #409eff;
}

.stats-card.pending .stats-icon {
  color: #f56c6c;
}

.stats-card.processing .stats-icon {
  color: #e6a23c;
}

.stats-card.resolved .stats-icon {
  color: #67c23a;
}

.stats-info {
  flex: 1;
}

.stats-number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.stats-label {
  color: #606266;
  font-size: 14px;
  margin-bottom: 4px;
}

.stats-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stats-trend .increase {
  color: #f56c6c;
}

.stats-trend .decrease {
  color: #67c23a;
}

.stats-trend .trend-label {
  color: #909399;
}

.distribution-card,
.time-stats-card,
.efficiency-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #303133;
}

.distribution-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.distribution-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.distribution-item:last-child {
  border-bottom: none;
}

.distribution-label {
  flex: 1;
}

.distribution-value {
  font-weight: 600;
  color: #303133;
  margin-right: 12px;
}

.distribution-percent {
  color: #909399;
  font-size: 12px;
  width: 40px;
  text-align: right;
}

.time-stats-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.time-stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.time-stat-label {
  color: #606266;
  font-size: 14px;
}

.time-stat-value {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
}

.time-stat-value.highlight {
  color: #409eff;
  font-size: 18px;
}

.efficiency-content {
  padding: 20px 0;
}

.efficiency-item {
  text-align: center;
}

.efficiency-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.efficiency-label {
  color: #606266;
  font-size: 14px;
  margin-bottom: 4px;
}

.efficiency-desc {
  color: #909399;
  font-size: 12px;
  line-height: 1.4;
}
</style>