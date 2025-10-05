<template>
  <div class="rankings-page">
    <UnifiedPageHeader
      title="榜单管理"
      description="管理平台各类榜单数据，包括用户活跃榜和内容热门榜"
    >
      <template #actions>
        <el-button type="primary" @click="handleRefreshRankings">
          <el-icon><Refresh /></el-icon>
          刷新榜单
        </el-button>
      </template>
    </UnifiedPageHeader>

    <!-- 榜单配置 -->
    <el-row :gutter="20">
      <el-col :span="16">
        <div class="ranking-tabs">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="用户活跃榜" name="users">
              <div class="ranking-content">
                <div class="ranking-header">
                  <div class="header-left">
                    <h3>用户活跃榜</h3>
                    <span class="period-badge">{{ getPeriodLabel(userRankingPeriod) }}</span>
                  </div>
                  <div class="ranking-controls">
                    <el-select v-model="userRankingPeriod" size="small">
                      <el-option label="今日" value="today" />
                      <el-option label="本周" value="week" />
                      <el-option label="本月" value="month" />
                    </el-select>
                  </div>
                </div>

                <div class="ranking-list">
                  <div
                    v-for="(user, index) in userRankings"
                    :key="user.id"
                    class="ranking-item"
                    :class="{
                      'top-three': index < 3,
                      'ranking-item--gold': index === 0,
                      'ranking-item--silver': index === 1,
                      'ranking-item--bronze': index === 2
                    }"
                  >
                    <div class="ranking-position">
                      <span class="position-number" :class="`position-${index + 1}`">
                        {{ index + 1 }}
                      </span>
                    </div>

                    <div class="ranking-user">
                      <el-avatar :size="48" :src="user.avatar">
                        {{ user.name.charAt(0) }}
                      </el-avatar>
                      <div class="user-info">
                        <div class="user-name">{{ user.name }}</div>
                        <div class="user-dept">{{ user.department }}</div>
                      </div>
                    </div>

                    <div class="ranking-progress">
                      <el-progress
                        :percentage="getUserProgress(user.score)"
                        :color="getRankColor(index)"
                        :stroke-width="12"
                        :show-text="false"
                      />
                      <span class="progress-text">{{ user.score }}分</span>
                    </div>

                    <div class="ranking-stats">
                      <div class="stat-item">
                        <el-icon><Document /></el-icon>
                        <span class="stat-value">{{ user.posts }}</span>
                        <span class="stat-label">发帖</span>
                      </div>
                      <div class="stat-item">
                        <el-icon><Star /></el-icon>
                        <span class="stat-value">{{ user.likes }}</span>
                        <span class="stat-label">点赞</span>
                      </div>
                      <div class="stat-item">
                        <el-icon><ChatDotRound /></el-icon>
                        <span class="stat-value">{{ user.comments }}</span>
                        <span class="stat-label">评论</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="热门内容榜" name="content">
              <div class="ranking-content">
                <div class="ranking-header">
                  <div class="header-left">
                    <h3>热门内容榜</h3>
                    <span class="period-badge">{{ getPeriodLabel(contentRankingPeriod) }}</span>
                  </div>
                  <div class="ranking-controls">
                    <el-select v-model="contentRankingPeriod" size="small">
                      <el-option label="今日" value="today" />
                      <el-option label="本周" value="week" />
                      <el-option label="本月" value="month" />
                    </el-select>
                  </div>
                </div>

                <div class="content-ranking-list">
                  <div
                    v-for="(content, index) in contentRankings"
                    :key="content.id"
                    class="content-ranking-item"
                    :class="{
                      'content-ranking-item--top': index < 3
                    }"
                  >
                    <div class="ranking-position">
                      <span class="position-number" :class="`position-${index + 1}`">
                        {{ index + 1 }}
                      </span>
                    </div>

                    <div class="content-info">
                      <div class="content-title">{{ content.title }}</div>
                      <div class="content-meta">
                        <el-tag :type="getContentTypeColor(content.type)" size="small">
                          {{ getContentTypeName(content.type) }}
                        </el-tag>
                        <span class="content-author">{{ content.author }}</span>
                        <span class="content-date">{{ formatDate(content.createdAt) }}</span>
                      </div>
                    </div>

                    <div class="content-stats">
                      <div class="stat-item stat-item--compact">
                        <el-icon><View /></el-icon>
                        <span class="stat-value">{{ formatNumber(content.views) }}</span>
                      </div>
                      <div class="stat-item stat-item--compact">
                        <el-icon><Star /></el-icon>
                        <span class="stat-value">{{ formatNumber(content.likes) }}</span>
                      </div>
                      <div class="stat-item stat-item--compact">
                        <el-icon><ChatDotRound /></el-icon>
                        <span class="stat-value">{{ formatNumber(content.comments) }}</span>
                      </div>
                    </div>

                    <div class="content-score">
                      <div class="score-value">{{ calculateContentScore(content) }}</div>
                      <div class="score-label">热度</div>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="部门贡献榜" name="departments">
              <div class="ranking-content">
                <div class="ranking-header">
                  <div class="header-left">
                    <h3>部门贡献榜</h3>
                    <span class="period-badge">本月</span>
                  </div>
                </div>

                <div class="department-rankings">
                  <div
                    v-for="(dept, index) in departmentRankings"
                    :key="dept.name"
                    class="department-item"
                    :class="{
                      'department-item--top': index < 3
                    }"
                  >
                    <div class="department-position">
                      <span class="dept-rank" :class="`rank-${index + 1}`">
                        {{ index + 1 }}
                      </span>
                    </div>

                    <div class="department-info">
                      <div class="dept-name">{{ dept.name }}</div>
                      <div class="dept-score">{{ dept.score }}分</div>
                    </div>

                    <div class="department-progress">
                      <el-progress
                        :percentage="dept.percentage"
                        :color="getDeptColor(index)"
                        :stroke-width="16"
                        :show-text="false"
                      />
                      <div class="progress-text">贡献度 {{ dept.percentage }}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-col>
      
      <el-col :span="8">
        <div class="ranking-sidebar">
          <!-- 榜单配置 -->
          <el-card>
            <template #header>
              <span>榜单配置</span>
            </template>
            
            <div class="config-section">
              <div class="config-item">
                <span class="config-label">用户榜显示数量</span>
                <el-input-number v-model="rankingConfig.userCount" :min="5" :max="50" size="small" />
              </div>
              
              <div class="config-item">
                <span class="config-label">内容榜显示数量</span>
                <el-input-number v-model="rankingConfig.contentCount" :min="5" :max="50" size="small" />
              </div>
              
              <div class="config-item">
                <span class="config-label">更新频率</span>
                <el-select v-model="rankingConfig.updateFreq" size="small">
                  <el-option label="实时" value="realtime" />
                  <el-option label="每小时" value="hourly" />
                  <el-option label="每日" value="daily" />
                </el-select>
              </div>
              
              <div class="config-item">
                <span class="config-label">积分权重</span>
                <div class="weight-config">
                  <div class="weight-item">
                    <span>发帖：</span>
                    <el-input-number v-model="rankingConfig.weights.post" :min="1" :max="10" size="small" />
                  </div>
                  <div class="weight-item">
                    <span>点赞：</span>
                    <el-input-number v-model="rankingConfig.weights.like" :min="1" :max="10" size="small" />
                  </div>
                  <div class="weight-item">
                    <span>评论：</span>
                    <el-input-number v-model="rankingConfig.weights.comment" :min="1" :max="10" size="small" />
                  </div>
                </div>
              </div>
              
              <el-button type="primary" size="small" style="width: 100%" @click="handleSaveConfig">
                保存配置
              </el-button>
            </div>
          </el-card>
          
          <!-- 数据统计 -->
          <el-card style="margin-top: 20px">
            <template #header>
              <span>数据统计</span>
            </template>
            
            <div class="stats-section">
              <div class="stats-item">
                <div class="stats-label">总用户数</div>
                <div class="stats-value">1,248</div>
              </div>
              
              <div class="stats-item">
                <div class="stats-label">活跃用户</div>
                <div class="stats-value">856</div>
              </div>
              
              <div class="stats-item">
                <div class="stats-label">总内容数</div>
                <div class="stats-value">3,426</div>
              </div>
              
              <div class="stats-item">
                <div class="stats-label">本周新增</div>
                <div class="stats-value">124</div>
              </div>
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Refresh, View, Star, ChatDotRound, Document } from '@element-plus/icons-vue'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'

const activeTab = ref('users')
const userRankingPeriod = ref('week')
const contentRankingPeriod = ref('week')

const rankingConfig = reactive({
  userCount: 20,
  contentCount: 20,
  updateFreq: 'daily',
  weights: {
    post: 5,
    like: 2,
    comment: 3
  }
})

const userRankings = ref([
  {
    id: 1,
    name: '张三',
    department: '技术部',
    avatar: '',
    posts: 25,
    likes: 89,
    comments: 156,
    score: 1248
  },
  {
    id: 2,
    name: '李四',
    department: '产品部',
    avatar: '',
    posts: 18,
    likes: 76,
    comments: 134,
    score: 1156
  }
])

const contentRankings = ref([
  {
    id: 1,
    title: '如何提高团队协作效率',
    type: 'article',
    author: '张三',
    views: 1248,
    likes: 89,
    comments: 23,
    createdAt: '2024-01-10'
  },
  {
    id: 2,
    title: '产品设计的几个关键要点',
    type: 'post',
    author: '李四',
    views: 956,
    likes: 67,
    comments: 18,
    createdAt: '2024-01-12'
  }
])

const departmentRankings = ref([
  { name: '技术部', score: 2456, percentage: 100 },
  { name: '产品部', score: 2134, percentage: 87 },
  { name: '运营部', score: 1876, percentage: 76 },
  { name: '市场部', score: 1523, percentage: 62 },
  { name: '人事部', score: 1234, percentage: 50 }
])

const getPeriodLabel = (period: string) => {
  const periodMap: Record<string, string> = {
    today: '今日',
    week: '本周',
    month: '本月'
  }
  return periodMap[period] || period
}

const getUserProgress = (score: number) => {
  const maxScore = Math.max(...userRankings.value.map(u => u.score))
  return Math.round((score / maxScore) * 100)
}

const getRankColor = (index: number) => {
  const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#409eff']
  return colors[index] || '#409eff'
}

const formatNumber = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

const calculateContentScore = (content: any) => {
  const { views, likes, comments } = content
  return Math.round(views * 0.1 + likes * 0.3 + comments * 0.6)
}

const getContentTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    article: '文章',
    post: '帖子',
    product: '商品',
    quote: '名言'
  }
  return typeMap[type] || type
}

const getContentTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    article: 'primary',
    post: 'success',
    product: 'warning',
    quote: 'info'
  }
  return colorMap[type] || 'info'
}

const getDeptColor = (index: number) => {
  const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399']
  return colors[index] || '#909399'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const handleRefreshRankings = () => {
  ElMessage.success('榜单数据刷新成功')
}

const handleSaveConfig = () => {
  ElMessage.success('榜单配置保存成功')
}
</script>

<style scoped lang="scss">
@import '@/styles/operation-styles.scss';

.rankings-page {
  padding: var(--spacing-xl);
}

.ranking-tabs {
  margin-bottom: var(--spacing-xl);

  ::v-deep(.el-tabs__header) {
    background: var(--color-bg-card);
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    margin: 0;
    border-bottom: 1px solid var(--color-border-light);
  }

  ::v-deep(.el-tabs__nav-wrap::after) {
    content: none !important;
  }

  ::v-deep(.el-tabs__content) {
    background: var(--color-bg-card);
    border-radius: 0 0 var(--radius-xl) var(--radius-xl);
    padding: var(--spacing-xl);
    border: 1px solid var(--color-border-light);
    border-top: none;
  }

  ::v-deep(.el-tabs__item) {
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    transition: all var(--transition-fast);
    padding: 0 var(--spacing-lg);
    margin-left: var(--spacing-lg);

    &.is-active {
      color: var(--color-primary);
      font-weight: var(--font-weight-semibold);
    }

    &:hover {
      color: var(--color-primary);
    }
  }
}

.ranking-content {
  padding: var(--spacing-lg) 0;
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  padding: 0 var(--spacing-lg);

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);

    h3 {
      margin: 0;
      color: var(--color-text-primary);
      font-size: var(--text-lg);
      font-weight: var(--font-weight-semibold);
    }

    .period-badge {
      background: var(--color-primary-light);
      color: var(--color-primary);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
      font-weight: var(--font-weight-medium);
    }
  }
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: 0 var(--spacing-lg);
}

.ranking-item {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, var(--color-bg-section) 0%, var(--color-bg-card) 100%);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  transition: all var(--transition-medium);
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--color-border-primary);
    background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-bg-card) 5%);
  }

  &:active {
    transform: translateY(0);
  }

  &.ranking-item--gold {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, var(--color-bg-card) 20%);
    border-color: #FFD700;
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
  }

  &.ranking-item--silver {
    background: linear-gradient(135deg, rgba(192, 192, 192, 0.1) 0%, var(--color-bg-card) 20%);
    border-color: #C0C0C0;
    box-shadow: 0 4px 12px rgba(192, 192, 192, 0.2);
  }

  &.ranking-item--bronze {
    background: linear-gradient(135deg, rgba(205, 127, 50, 0.1) 0%, var(--color-bg-card) 20%);
    border-color: #CD7F32;
    box-shadow: 0 4px 12px rgba(205, 127, 50, 0.2);
  }
}

.ranking-position {
  margin-right: var(--spacing-lg);
}

.position-number {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  font-size: var(--text-lg);
  color: var(--color-white);
  box-shadow: var(--shadow-sm);
}

.position-number.position-1 {
  background: linear-gradient(135deg, #FFD700 0%, #FFB347 100%);
  box-shadow: var(--shadow-md);
}

.position-number.position-2 {
  background: linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%);
}

.position-number.position-3 {
  background: linear-gradient(135deg, #CD7F32 0%, #B8860B 100%);
}

.position-number:not(.position-1):not(.position-2):not(.position-3) {
  background: var(--color-text-tertiary);
  font-size: var(--text-base);
}

.ranking-user {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  min-width: 0;
}

.user-info {
  min-width: 0;
}

.user-name {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
  font-size: var(--text-base);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-dept {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-medium);
}

.ranking-progress {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 120px;

  .progress-text {
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    text-align: center;
    font-weight: var(--font-weight-medium);
  }
}

.ranking-stats {
  display: flex;
  gap: var(--spacing-md);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  background: rgba(255, 255, 255, 0.9);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
  min-width: 60px;

  .el-icon {
    color: var(--color-text-tertiary);
    font-size: 16px;
  }

  .stat-value {
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    font-size: var(--text-base);
  }

  .stat-label {
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    font-weight: var(--font-weight-medium);
  }
}

.content-ranking-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: 0 var(--spacing-lg);
}

.content-ranking-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, var(--color-bg-section) 0%, var(--color-bg-card) 100%);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all var(--transition-medium);
  gap: var(--spacing-lg);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--color-border-primary);
    background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-bg-card) 5%);
  }

  &:active {
    transform: translateY(0);
  }

  &.content-ranking-item--top {
    background: linear-gradient(135deg, var(--color-warning-light) 0%, var(--color-bg-card) 20%);
    border-color: var(--color-warning);
  }
}

.content-info {
  flex: 1;
  min-width: 0;
}

.content-title {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--text-base);
}

.content-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

.content-stats {
  display: flex;
  gap: var(--spacing-md);
}

.stat-item--compact {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
  background: rgba(255, 255, 255, 0.8);

  .el-icon {
    color: var(--color-text-tertiary);
    font-size: 14px;
  }

  .stat-value {
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    font-size: var(--text-sm);
  }
}

.content-score {
  text-align: center;
  background: linear-gradient(135deg, var(--color-warning-light) 0%, var(--color-bg-card) 100%);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-warning);
  min-width: 80px;

  .score-value {
    font-size: var(--text-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-warning);
    line-height: 1;
  }

  .score-label {
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    margin-top: var(--spacing-xs);
    font-weight: var(--font-weight-medium);
  }
}

.department-rankings {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: 0 var(--spacing-lg);
}

.department-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  background: linear-gradient(135deg, var(--color-bg-section) 0%, var(--color-bg-card) 100%);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
  transition: all var(--transition-medium);

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
    border-color: var(--color-border-primary);
  }

  &.department-item--top {
    background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-bg-card) 15%);
    border-color: var(--color-primary);
  }
}

.department-position {
  flex-shrink: 0;
}

.dept-rank {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
  box-shadow: var(--shadow-sm);

  &.rank-1 {
    background: linear-gradient(135deg, #FFD700 0%, #FFB347 100%);
  }

  &.rank-2 {
    background: linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%);
  }

  &.rank-3 {
    background: linear-gradient(135deg, #CD7F32 0%, #B8860B 100%);
  }
}

.department-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);

  .dept-name {
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    font-size: var(--text-base);
  }

  .dept-score {
    font-size: var(--text-sm);
    color: var(--color-text-tertiary);
    font-weight: var(--font-weight-medium);
  }
}

.department-progress {
  flex: 2;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);

  .progress-text {
    font-weight: var(--font-weight-semibold);
    color: var(--color-primary);
    font-size: var(--text-sm);
    min-width: 80px;
    text-align: right;
  }
}

.ranking-sidebar {
  position: sticky;
  top: var(--spacing-xl);
}

.ranking-sidebar .el-card {
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-card);
  transition: all var(--transition-medium);

  ::v-deep(.el-card__header) {
    border-bottom: 1px solid var(--color-border-light);
    background-color: var(--color-bg-elevated);
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  }

  &:hover {
    box-shadow: var(--shadow-card-hover);
  }
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.config-label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-semibold);
}

.weight-config {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background-color: var(--color-bg-section);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
}

.weight-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xs) 0;
}

.weight-item span {
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.stats-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.stats-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.stats-label {
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.stats-value {
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  font-size: var(--text-lg);
}

// 响应式设计
@media (max-width: 768px) {
  .rankings-page {
    padding: var(--spacing-md);
  }

  .ranking-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .ranking-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
  }

  .ranking-user {
    margin-right: 0;
    margin-bottom: var(--spacing-md);
  }

  .ranking-stats {
    flex-wrap: wrap;
    gap: var(--spacing-md);
    margin-right: 0;
    justify-content: space-between;
    width: 100%;
  }

  .stat-item {
    flex: 1;
    min-width: 80px;
  }

  .ranking-score {
    align-self: stretch;
    min-width: auto;
  }

  .content-ranking-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
  }

  .content-info {
    margin: 0;
    margin-bottom: var(--spacing-md);
  }

  .content-stats {
    flex-wrap: wrap;
    gap: var(--spacing-md);
    justify-content: space-between;
    width: 100%;
  }

  .department-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .dept-progress {
    width: 100%;
  }

  .ranking-sidebar {
    position: relative;
    top: 0;
    margin-top: var(--spacing-xl);
  }
}

@media (max-width: 576px) {
  .ranking-tabs {
    ::v-deep(.el-tabs__nav-wrap) {
      overflow-x: auto;
      white-space: nowrap;
    }
  }

  .ranking-position {
    margin-right: var(--spacing-md);
  }

  .position-number {
    width: 36px;
    height: 36px;
  }

  .ranking-user {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .user-info {
    margin-left: 0;
  }

  .user-name {
    font-size: var(--text-sm);
  }

  .content-title {
    font-size: var(--text-sm);
    white-space: normal;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    display: -webkit-box;
  }

  .dept-rank {
    width: 24px;
    height: 24px;
    font-size: var(--text-xs);
  }

  .dept-name {
    font-size: var(--text-sm);
  }
}
</style>