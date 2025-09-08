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
          <el-tabs v-model="activeTab" type="border-card">
            <el-tab-pane label="用户活跃榜" name="users">
              <div class="ranking-content">
                <div class="ranking-header">
                  <h3>用户活跃榜 (本周)</h3>
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
                    :class="{ 'top-three': index < 3 }"
                  >
                    <div class="ranking-position">
                      <span class="position-number" :class="`position-${index + 1}`">
                        {{ index + 1 }}
                      </span>
                    </div>
                    
                    <div class="ranking-user">
                      <el-avatar :size="40" :src="user.avatar">
                        {{ user.name.charAt(0) }}
                      </el-avatar>
                      <div class="user-info">
                        <div class="user-name">{{ user.name }}</div>
                        <div class="user-dept">{{ user.department }}</div>
                      </div>
                    </div>
                    
                    <div class="ranking-stats">
                      <div class="stat-item">
                        <span class="stat-label">发帖</span>
                        <span class="stat-value">{{ user.posts }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">点赞</span>
                        <span class="stat-value">{{ user.likes }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">评论</span>
                        <span class="stat-value">{{ user.comments }}</span>
                      </div>
                    </div>
                    
                    <div class="ranking-score">
                      <div class="score-value">{{ user.score }}</div>
                      <div class="score-label">积分</div>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="热门内容榜" name="content">
              <div class="ranking-content">
                <div class="ranking-header">
                  <h3>热门内容榜 (本周)</h3>
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
                      <div class="stat-item">
                        <el-icon><View /></el-icon>
                        <span>{{ content.views }}</span>
                      </div>
                      <div class="stat-item">
                        <el-icon><Star /></el-icon>
                        <span>{{ content.likes }}</span>
                      </div>
                      <div class="stat-item">
                        <el-icon><ChatDotRound /></el-icon>
                        <span>{{ content.comments }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="部门贡献榜" name="departments">
              <div class="ranking-content">
                <div class="ranking-header">
                  <h3>部门贡献榜 (本月)</h3>
                </div>
                
                <div class="department-chart">
                  <div
                    v-for="(dept, index) in departmentRankings"
                    :key="dept.name"
                    class="department-item"
                  >
                    <div class="dept-info">
                      <div class="dept-rank">{{ index + 1 }}</div>
                      <div class="dept-name">{{ dept.name }}</div>
                    </div>
                    <div class="dept-progress">
                      <el-progress 
                        :percentage="dept.percentage" 
                        :color="getDeptColor(index)"
                        :stroke-width="20"
                        :show-text="false"
                      />
                      <span class="dept-score">{{ dept.score }}分</span>
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
import { Refresh, View, Star, ChatDotRound } from '@element-plus/icons-vue'
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

<style scoped>
.rankings-page {
  padding: 20px;
}

.ranking-tabs {
  margin-bottom: 20px;
}

.ranking-content {
  padding: 20px 0;
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.ranking-header h3 {
  margin: 0;
  color: #303133;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s;
}

.ranking-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.ranking-item.top-three {
  background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
  background: linear-gradient(90deg, #fff9e6 0%, #fff 20%);
  border-color: #faad14;
}

.ranking-position {
  margin-right: 16px;
}

.position-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  color: #fff;
}

.position-number.position-1 {
  background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
}

.position-number.position-2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #a9a9a9 100%);
}

.position-number.position-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #b8860b 100%);
}

.position-number:not(.position-1):not(.position-2):not(.position-3) {
  background: #909399;
}

.ranking-user {
  display: flex;
  align-items: center;
  flex: 1;
  margin-right: 20px;
}

.user-info {
  margin-left: 12px;
}

.user-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.user-dept {
  font-size: 12px;
  color: #909399;
}

.ranking-stats {
  display: flex;
  gap: 20px;
  margin-right: 20px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-weight: 600;
  color: #303133;
}

.ranking-score {
  text-align: center;
}

.score-value {
  font-size: 20px;
  font-weight: 600;
  color: #409eff;
  line-height: 1;
}

.score-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.content-ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.content-ranking-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s;
}

.content-ranking-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.content-info {
  flex: 1;
  margin: 0 20px;
}

.content-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.content-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

.content-stats {
  display: flex;
  gap: 16px;
}

.content-stats .stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
}

.department-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.department-item {
  display: flex;
  align-items: center;
  gap: 20px;
}

.dept-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 100px;
}

.dept-rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #409eff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.dept-name {
  font-weight: 500;
  color: #303133;
}

.dept-progress {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.dept-score {
  font-weight: 600;
  color: #409eff;
  min-width: 60px;
}

.ranking-sidebar {
  position: sticky;
  top: 20px;
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.weight-config {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.weight-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stats-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-label {
  color: #606266;
}

.stats-value {
  font-weight: 600;
  color: #409eff;
}
</style>