<template>
  <div class="news-page">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>资讯中心</h1>
        <p>获取最新公司资讯、行业动态和政策信息</p>
      </div>

      <!-- 筛选和搜索 -->
      <div class="filter-section">
        <div class="filter-tabs">
          <div
            v-for="category in categories"
            :key="category.value"
            class="filter-tab"
            :class="{ active: selectedCategory === category.value }"
            @click="selectedCategory = category.value"
          >
            {{ category.label }}
          </div>
        </div>

        <div class="filter-controls">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索资讯..."
            :prefix-icon="Search"
            @input="handleSearch"
            clearable
            style="width: 300px"
          />
          <el-select
            v-model="sortBy"
            placeholder="排序方式"
            style="width: 120px"
            @change="handleSort"
          >
            <el-option label="最新发布" value="publishTime" />
            <el-option label="阅读量" value="readCount" />
            <el-option label="点赞数" value="likeCount" />
          </el-select>
        </div>
      </div>

      <!-- 置顶资讯 -->
      <div v-if="topNews.length > 0" class="top-news">
        <h3>置顶资讯</h3>
        <div class="top-news-list">
          <div
            v-for="item in topNews"
            :key="item.id"
            class="top-news-item"
            @click="$router.push(`/news/${item.id}`)"
          >
            <div class="news-badge">
              <el-tag type="danger" size="small">置顶</el-tag>
            </div>
            <div class="news-content">
              <h4>{{ item.title }}</h4>
              <p>{{ item.summary }}</p>
              <div class="news-meta">
                <span><el-icon><User /></el-icon>{{ item.author }}</span>
                <span><el-icon><Calendar /></el-icon>{{ formatTime(item.publishTime) }}</span>
                <span><el-icon><View /></el-icon>{{ item.readCount }} 阅读</span>
                <span><el-icon><Star /></el-icon>{{ item.likeCount }} 点赞</span>
              </div>
            </div>
            <div v-if="item.coverImage" class="news-image">
              <img :src="item.coverImage" :alt="item.title" />
            </div>
          </div>
        </div>
      </div>

      <!-- 资讯列表 -->
      <div class="news-list">
        <div v-if="loading" class="loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>

        <div v-else-if="filteredNews.length === 0" class="empty">
          <el-empty description="暂无相关资讯" />
        </div>

        <div v-else>
          <div
            v-for="item in paginatedNews"
            :key="item.id"
            class="news-item"
            @click="$router.push(`/news/${item.id}`)"
          >
            <div class="news-main">
              <div class="news-category">
                <el-tag :type="getCategoryType(item.category)" size="small">
                  {{ item.category }}
                </el-tag>
              </div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.summary }}</p>
              <div class="news-tags">
                <el-tag
                  v-for="tag in item.tags.slice(0, 3)"
                  :key="tag"
                  size="small"
                  type="info"
                  effect="plain"
                >
                  {{ tag }}
                </el-tag>
              </div>
              <div class="news-meta">
                <span><el-icon><User /></el-icon>{{ item.author }}</span>
                <span><el-icon><Calendar /></el-icon>{{ formatTime(item.publishTime) }}</span>
                <span><el-icon><View /></el-icon>{{ item.readCount }} 阅读</span>
                <span><el-icon><Star /></el-icon>{{ item.likeCount }} 点赞</span>
                <span><el-icon><ChatDotRound /></el-icon>{{ item.commentCount }} 评论</span>
              </div>
            </div>
            <div v-if="item.coverImage" class="news-image">
              <img :src="item.coverImage" :alt="item.title" />
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="filteredNews.length"
              layout="prev, pager, next, jumper"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useContentStore } from '@/stores/content'
import type { News } from '@/types'
import {
  Search,
  User,
  Calendar,
  View,
  Star,
  ChatDotRound,
  Loading
} from '@element-plus/icons-vue'

const contentStore = useContentStore()

// 响应式数据
const selectedCategory = ref('all')
const searchKeyword = ref('')
const sortBy = ref('publishTime')
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 分类选项
const categories = [
  { label: '全部', value: 'all' },
  { label: '公司新闻', value: '公司新闻' },
  { label: '行业动态', value: '行业动态' },
  { label: '政策法规', value: '政策法规' },
  { label: '培训通知', value: '培训通知' },
  { label: '竞对信息', value: '竞对信息' }
]

// 计算属性
const topNews = computed(() => 
  contentStore.news.filter(item => item.isTop)
)

const filteredNews = computed(() => {
  let news = contentStore.news.filter(item => !item.isTop)
  
  // 按分类筛选
  if (selectedCategory.value !== 'all') {
    news = news.filter(item => item.category === selectedCategory.value)
  }
  
  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    news = news.filter(item => 
      item.title.toLowerCase().includes(keyword) ||
      item.summary.toLowerCase().includes(keyword) ||
      item.tags.some(tag => tag.toLowerCase().includes(keyword))
    )
  }
  
  // 排序
  news.sort((a, b) => {
    if (sortBy.value === 'publishTime') {
      return new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime()
    } else if (sortBy.value === 'readCount') {
      return b.readCount - a.readCount
    } else if (sortBy.value === 'likeCount') {
      return b.likeCount - a.likeCount
    }
    return 0
  })
  
  return news
})

const paginatedNews = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredNews.value.slice(start, end)
})

// 方法
const handleSearch = () => {
  currentPage.value = 1
}

const handleSort = () => {
  currentPage.value = 1
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    return '今天'
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

const getCategoryType = (category: string) => {
  const types: Record<string, string> = {
    '公司新闻': 'primary',
    '行业动态': 'success',
    '政策法规': 'warning',
    '培训通知': 'info',
    '竞对信息': 'danger'
  }
  return types[category] || 'info'
}

// 监听分类变化
watch(selectedCategory, () => {
  currentPage.value = 1
})

// 组件挂载时初始化数据
onMounted(async () => {
  if (contentStore.news.length === 0) {
    loading.value = true
    try {
      await contentStore.fetchNews()
    } finally {
      loading.value = false
    }
  }
})
</script>

<style scoped lang="scss">
.news-page {
  min-height: 100vh;
  padding: 40px 0;
  background: var(--el-bg-color-page);
}

.page-header {
  text-align: center;
  margin-bottom: 40px;

  h1 {
    font-size: 32px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    margin-bottom: 12px;
  }

  p {
    font-size: 16px;
    color: var(--el-text-color-regular);
    margin: 0;
  }
}

.filter-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: var(--el-box-shadow-light);

  .filter-tabs {
    display: flex;
    gap: 24px;
    margin-bottom: 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .filter-tab {
      padding: 12px 16px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      color: var(--el-text-color-regular);
      font-weight: 500;
      transition: all 0.3s;

      &:hover {
        color: var(--el-color-primary);
      }

      &.active {
        color: var(--el-color-primary);
        border-bottom-color: var(--el-color-primary);
      }
    }
  }

  .filter-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }
}

.top-news {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: var(--el-box-shadow-light);

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;

    &::before {
      content: '';
      width: 4px;
      height: 18px;
      background: var(--el-color-danger);
      border-radius: 2px;
    }
  }

  .top-news-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .top-news-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      border-color: var(--el-color-primary);
      box-shadow: var(--el-box-shadow-light);
      transform: translateY(-2px);
    }

    .news-content {
      flex: 1;

      h4 {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: 8px;
      }

      p {
        font-size: 14px;
        color: var(--el-text-color-regular);
        margin-bottom: 12px;
        line-height: 1.5;
      }

      .news-meta {
        display: flex;
        gap: 16px;
        font-size: 12px;
        color: var(--el-text-color-secondary);

        span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }

    .news-image {
      width: 120px;
      height: 80px;
      border-radius: 6px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}

.news-list {
  background: white;
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  padding: 24px;

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px;
    color: var(--el-text-color-secondary);

    .el-icon {
      font-size: 32px;
      margin-bottom: 12px;
    }
  }

  .news-item {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    padding: 20px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background: var(--el-fill-color-lighter);
      border-radius: 8px;
      padding-left: 20px;
      padding-right: 20px;
    }

    &:last-child {
      border-bottom: none;
    }

    .news-main {
      flex: 1;

      .news-category {
        margin-bottom: 8px;
      }

      h3 {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: 8px;
        line-height: 1.4;
      }

      p {
        font-size: 14px;
        color: var(--el-text-color-regular);
        margin-bottom: 12px;
        line-height: 1.6;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .news-tags {
        margin-bottom: 12px;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .news-meta {
        display: flex;
        gap: 16px;
        font-size: 12px;
        color: var(--el-text-color-secondary);

        span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }

    .news-image {
      width: 160px;
      height: 100px;
      border-radius: 6px;
      overflow: hidden;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 32px;
  }
}

@media (max-width: 768px) {
  .filter-section {
    .filter-tabs {
      flex-wrap: wrap;
      gap: 12px;
    }

    .filter-controls {
      flex-direction: column;
      align-items: stretch;
    }
  }

  .top-news-item {
    flex-direction: column;

    .news-image {
      width: 100%;
      height: 120px;
    }
  }

  .news-item {
    flex-direction: column;

    .news-image {
      width: 100%;
      height: 120px;
    }
  }
}
</style>