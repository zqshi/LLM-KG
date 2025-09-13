<template>
  <div class="content-dashboard">
    <UnifiedPageHeader 
      title="内容数据看板" 
      description="查看内容管理的运营数据和统计信息"
    >
      <template #actions>
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </template>
    </UnifiedPageHeader>

    <!-- 核心指标卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card class="stats-card" shadow="hover">
          <div class="stats-content">
            <div class="stats-icon total">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ formatNumber(contentStats?.total || 0) }}</div>
              <div class="stats-label">内容总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stats-card" shadow="hover">
          <div class="stats-content">
            <div class="stats-icon today">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ contentStats?.today || 0 }}</div>
              <div class="stats-label">今日新增</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card 
          class="stats-card pending-card" 
          shadow="hover"
          @click="goToPendingList"
        >
          <div class="stats-content clickable">
            <div class="stats-icon pending">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ contentStats?.pending || 0 }}</div>
              <div class="stats-label">待审数量</div>
            </div>
            <div class="stats-action">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stats-card" shadow="hover">
          <div class="stats-content">
            <div class="stats-icon week">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ contentStats?.thisWeek || 0 }}</div>
              <div class="stats-label">本周互动量</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 内容类型分布 -->
    <el-row :gutter="20" class="content-section">
      <el-col :span="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">内容类型分布</span>
              <el-button type="text" @click="loadContentStats">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </template>
          <div class="type-stats">
            <div class="type-item" v-for="item in typeDistribution" :key="item.type">
              <div class="type-info">
                <div class="type-name">{{ item.name }}</div>
                <div class="type-count">{{ item.count }}</div>
              </div>
              <div class="type-progress">
                <el-progress 
                  :percentage="item.percentage" 
                  :color="item.color"
                  :show-text="false"
                />
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">热门内容 TOP5</span>
              <el-dropdown @command="handleHotContentPeriod">
                <el-button type="text">
                  {{ hotContentPeriodText }}<el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="7">最近7天</el-dropdown-item>
                    <el-dropdown-item command="30">最近30天</el-dropdown-item>
                    <el-dropdown-item command="90">最近90天</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          <div class="hot-content-list">
            <div 
              class="hot-item" 
              v-for="(item, index) in hotContents" 
              :key="item.id"
              @click="previewContent(item.id)"
            >
              <div class="hot-rank">{{ index + 1 }}</div>
              <div class="hot-info">
                <div class="hot-title">{{ item.title }}</div>
                <div class="hot-meta">
                  <el-tag :type="getTypeColor(item.type)" size="small">
                    {{ getTypeName(item.type) }}
                  </el-tag>
                  <span class="hot-author">{{ item.author.name }}</span>
                  <span class="hot-stats">
                    <el-icon><View /></el-icon>{{ item.viewCount }}
                    <el-icon><Star /></el-icon>{{ item.likeCount }}
                  </span>
                </div>
              </div>
              <div class="hot-score">{{ item.score }}</div>
            </div>
            <div v-if="hotContents.length === 0" class="empty-state">
              <el-empty description="暂无热门内容" :image-size="80" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 模块数据统计 -->
    <el-card class="module-stats-card" shadow="hover">
      <template #header>
        <span class="card-title">各模块内容统计</span>
      </template>
      <el-row :gutter="16">
        <el-col :span="4" v-for="module in moduleStats" :key="module.key">
          <div class="module-item">
            <div class="module-icon">
              <el-icon size="24" :color="module.color">
                <component :is="module.icon" />
              </el-icon>
            </div>
            <div class="module-info">
              <div class="module-name">{{ module.name }}</div>
              <div class="module-count">{{ module.count }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 内容预览抽屉 -->
    <el-drawer
      v-model="previewDrawerVisible"
      title="内容预览"
      size="50%"
      :before-close="closePreview"
    >
      <div v-if="currentPreview" class="preview-content">
        <div class="preview-header">
          <h2 class="preview-title">{{ currentPreview.title }}</h2>
          <div class="preview-meta">
            <el-tag :type="getTypeColor(currentPreview.type)" size="small">
              {{ getTypeName(currentPreview.type) }}
            </el-tag>
            <span class="preview-author">{{ currentPreview.author.name }}</span>
            <span class="preview-time">{{ formatDateTime(currentPreview.createdAt) }}</span>
          </div>
        </div>
        <div class="preview-body">
          <div v-if="currentPreview.contentHtml" v-html="currentPreview.contentHtml"></div>
          <div v-else class="preview-text">{{ currentPreview.content }}</div>
        </div>
        <div class="preview-footer">
          <div class="preview-tags">
            <el-tag v-for="tag in currentPreview.tags" :key="tag" size="small" type="info">
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </div>
      <div v-else class="preview-loading">
        <el-skeleton :rows="8" animated />
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import { useRouter } from 'vue-router'
import { useContentStore } from '@/stores/content'
import type { ContentPreview } from '@/types'
import {
  Refresh, Document, Calendar, Clock, TrendCharts, ArrowRight,
  ArrowDown, View, Star, Notebook, ChatDotRound,
  ShoppingCart, ChatDotSquare, House
} from '@element-plus/icons-vue'

const router = useRouter()
const contentStore = useContentStore()

// 响应式数据
const previewDrawerVisible = ref(false)
const currentPreview = ref<ContentPreview | null>(null)
const hotContentPeriod = ref(7)

// 计算属性
const contentStats = computed(() => contentStore.contentStats)
const hotContents = computed(() => contentStore.hotContents)
const loading = computed(() => contentStore.loading)
const statsLoading = computed(() => contentStore.statsLoading)

const hotContentPeriodText = computed(() => {
  const periodMap: Record<number, string> = {
    7: '最近7天',
    30: '最近30天', 
    90: '最近90天'
  }
  return periodMap[hotContentPeriod.value] || '最近7天'
})

const typeDistribution = computed(() => {
  const stats = contentStats.value || {}
  const total = stats.total || 1
  
  return [
    {
      type: 'article',
      name: '文章',
      count: stats.articles || 0,
      percentage: Math.round(((stats.articles || 0) / total) * 100),
      color: '#409EFF'
    },
    {
      type: 'post', 
      name: '帖子',
      count: stats.posts || 0,
      percentage: Math.round(((stats.posts || 0) / total) * 100),
      color: '#67C23A'
    },
    {
      type: 'news',
      name: '资讯',
      count: stats.news || 0,
      percentage: Math.round(((stats.news || 0) / total) * 100),
      color: '#E6A23C'
    },
    {
      type: 'goods',
      name: '商品',
      count: stats.goods || 0,
      percentage: Math.round(((stats.goods || 0) / total) * 100),
      color: '#F56C6C'
    },
    {
      type: 'quote',
      name: '名言',
      count: stats.quotes || 0,
      percentage: Math.round(((stats.quotes || 0) / total) * 100),
      color: '#909399'
    }
  ].filter(item => item.count > 0)
})

const moduleStats = computed(() => {
  const stats = contentStats.value || {}
  return [
    {
      key: 'knowledge',
      name: '知识库',
      count: stats.articles || 0,
      icon: 'Notebook',
      color: '#409EFF'
    },
    {
      key: 'forum',
      name: '论坛',
      count: stats.posts || 0,
      icon: 'ChatDotRound',
      color: '#67C23A'
    },
    {
      key: 'news',
      name: '资讯',
      count: stats.news || 0,
      icon: 'Document',
      color: '#E6A23C'
    },
    {
      key: 'flea-market',
      name: '跳蚤市场',
      count: stats.goods || 0,
      icon: 'ShoppingCart',
      color: '#F56C6C'
    },
    {
      key: 'operation',
      name: '运营内容',
      count: stats.quotes || 0,
      icon: 'House',
      color: '#909399'
    }
  ]
})

// 方法
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num.toString()
}

const formatDateTime = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

const getTypeName = (type: string): string => {
  const typeMap: Record<string, string> = {
    article: '文章',
    post: '帖子',
    comment: '评论',
    news: '资讯',
    goods: '商品',
    quote: '名言'
  }
  return typeMap[type] || type
}

const getTypeColor = (type: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' => {
  const colorMap: Record<string, 'primary' | 'success' | 'info' | 'warning' | 'danger'> = {
    article: 'primary',
    post: 'success',
    comment: 'info',
    news: 'warning',
    goods: 'danger',
    quote: 'info'
  }
  return colorMap[type] || 'info'
}

const refreshData = async () => {
  await Promise.all([
    loadContentStats(),
    loadHotContents()
  ])
}

const loadContentStats = async () => {
  await contentStore.loadStats()
}

const loadHotContents = async () => {
  await contentStore.loadHotContents(hotContentPeriod.value, 5)
}

const handleHotContentPeriod = (days: string) => {
  hotContentPeriod.value = parseInt(days)
  loadHotContents()
}

const goToPendingList = () => {
  router.push({
    name: 'ContentList',
    query: { status: '1' }
  })
}

const previewContent = async (id: number) => {
  previewDrawerVisible.value = true
  currentPreview.value = null
  const preview = await contentStore.getContentPreview(id)
  currentPreview.value = preview
}

const closePreview = () => {
  previewDrawerVisible.value = false
  currentPreview.value = null
}

// 生命周期
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.content-dashboard {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  min-height: 80px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .stats-content {
    display: flex;
    align-items: center;
    min-height: 80px;
    position: relative;

    &.clickable {
      cursor: pointer;
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.8);
        border-radius: 4px;
      }
    }
  }

  .stats-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    color: #fff;
    font-size: 20px;

    &.total {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &.today {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    &.pending {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    &.week {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }
  }

  .stats-info {
    flex: 1;
    overflow: hidden;
  }

  .stats-value {
    font-size: 24px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    line-height: 1;
  }

  .stats-label {
    color: var(--el-text-color-secondary);
    font-size: 14px;
    margin-top: 4px;
  }

  .stats-action {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--el-text-color-secondary);
    transition: all 0.2s;
    
    .el-icon {
      font-size: 16px;
    }
  }
}

.pending-card {
  cursor: pointer;
  
  &:hover {
    .stats-content {
      background: linear-gradient(135deg, rgba(240, 147, 251, 0.08) 0%, rgba(245, 87, 108, 0.08) 100%);
    }
    
    .stats-action {
      color: var(--el-color-primary);
      transform: translateY(-50%) translateX(2px);
    }
  }
  
  &:active {
    transform: translateY(-1px);
  }
}

.content-section {
  margin-bottom: 20px;
}

.chart-card {
  min-height: 350px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-weight: 600;
  color: #303133;
}

.type-stats {
  padding: 10px 0;
}

.type-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.type-item:last-child {
  margin-bottom: 0;
}

.type-info {
  width: 100px;
  margin-right: 16px;
}

.type-name {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.type-count {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.type-progress {
  flex: 1;
}

.hot-content-list {
  padding: 10px 0;
}

.hot-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s;
}

.hot-item:hover {
  background-color: #f5f7fa;
  border-radius: 6px;
  padding-left: 8px;
  padding-right: 8px;
}

.hot-item:last-child {
  border-bottom: none;
}

.hot-rank {
  width: 24px;
  height: 24px;
  background: #f0f2f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 12px;
  color: #666;
  margin-right: 12px;
}

.hot-rank:nth-child(1) {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #fff;
}

.hot-info {
  flex: 1;
  overflow: hidden;
}

.hot-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hot-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #909399;
}

.hot-author {
  color: #606266;
}

.hot-stats {
  display: flex;
  align-items: center;
  gap: 4px;
}

.hot-stats .el-icon {
  font-size: 12px;
}

.hot-score {
  font-size: 16px;
  font-weight: 600;
  color: #E6A23C;
}

.module-stats-card {
  margin-bottom: 20px;
  
  .el-row {
    margin: 0;
  }
  
  .el-col {
    padding: 0 8px;
  }
}

.module-item {
  display: flex;
  align-items: center;
  padding: 20px 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid #e4e7ed;
  height: 80px;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    border-color: #c0c4cc;
  }
}

.module-icon {
  width: 40px;
  height: 40px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  flex-shrink: 0;
  
  .el-icon {
    font-size: 20px !important;
    width: 20px;
    height: 20px;
  }
}

.module-info {
  flex: 1;
  overflow: hidden;
}

.module-name {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin-bottom: 4px;
  font-weight: 500;
  line-height: 1;
}

.module-count {
  font-size: 22px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  line-height: 1;
}

.preview-content {
  padding: 0 16px;
}

.preview-header {
  margin-bottom: 20px;
}

.preview-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.preview-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #909399;
}

.preview-body {
  margin-bottom: 20px;
  line-height: 1.6;
}

.preview-text {
  color: #606266;
  white-space: pre-wrap;
}

.preview-footer {
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.preview-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

.preview-loading {
  padding: 0 16px;
}

@media (max-width: 768px) {
  .stats-row .el-col {
    width: 50% !important;
    max-width: 50% !important;
    flex: 0 0 50% !important;
    margin-bottom: 16px;
  }
  
  .module-stats-card {
    .el-col {
      margin-bottom: 12px;
    }
  }
  
  .module-item {
    height: 70px;
    padding: 12px;
    
    .module-icon {
      width: 36px;
      height: 36px;
      
      .el-icon {
        font-size: 16px !important;
        width: 16px;
        height: 16px;
      }
    }
    
    .module-name {
      font-size: 12px;
    }
    
    .module-count {
      font-size: 18px;
    }
  }
}

@media (max-width: 576px) {
  .stats-row .el-col {
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 100% !important;
    margin-bottom: 12px;
  }
  
  .module-stats-card {
    .el-row {
      flex-direction: column;
    }
    
    .el-col {
      width: 100% !important;
      max-width: 100% !important;
      flex: 0 0 100% !important;
      margin-bottom: 8px;
    }
  }
}
</style>