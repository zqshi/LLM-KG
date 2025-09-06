<template>
  <div class="font-inter bg-gray-100 text-gray-700 min-h-screen">
    <!-- 顶部导航栏 -->
    <div class="sticky top-0 z-50 bg-white shadow-sm transition-all duration-300">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo和主导航 -->
          <div class="flex items-center space-x-8">
            <router-link to="/" class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <i class="fa fa-building text-white"></i>
              </div>
              <span class="text-lg font-semibold text-gray-700">企业内部门户</span>
            </router-link>
            <nav class="hidden md:flex space-x-6">
              <router-link to="/" class="text-gray-500 hover:text-primary transition-colors h-full flex items-center">首页</router-link>
              <router-link to="/forum" class="text-gray-500 hover:text-primary transition-colors h-full flex items-center">论坛</router-link>
              <router-link to="/news" class="text-primary font-medium border-b-2 border-primary h-full flex items-center">资讯中心</router-link>
              <router-link to="/knowledge" class="text-gray-500 hover:text-primary transition-colors h-full flex items-center">知识库</router-link>
              <router-link to="#" class="text-gray-500 hover:text-primary transition-colors h-full flex items-center">应用</router-link>
            </nav>
          </div>
          
          <!-- 搜索框 -->
          <div class="hidden md:flex relative flex-1 max-w-xl mx-8">
            <input type="text" placeholder="搜索AI工具、资讯或技术趋势..." 
              class="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
            <i class="fa fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
          
          <!-- 用户区域 -->
          <div class="flex items-center space-x-4">
            <button class="relative p-2 text-gray-500 hover:text-primary transition-colors">
              <i class="fa fa-bell text-xl"></i>
              <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div class="flex items-center space-x-2">
              <img src="https://picsum.photos/id/1005/200" alt="用户头像" class="w-8 h-8 rounded-full object-cover">
              <span class="hidden md:inline text-sm font-medium">张小明</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6">

      <!-- 资讯中心主体 -->
      <div class="bg-white rounded-xl shadow-card mb-8">
        <div class="p-6 border-b border-gray-100">
          <div class="text-center mb-6">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">资讯中心</h1>
            <p class="text-gray-600">获取最新公司资讯、AI工具动态和技术趋势</p>
          </div>
          
          <!-- 分类导航 -->
          <div class="flex flex-wrap justify-center gap-2 mb-6">
            <button
              v-for="category in categories"
              :key="category.value"
              @click="selectedCategory = category.value"
              :class="selectedCategory === category.value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
            >
              {{ category.label }}
            </button>
          </div>
          
          <!-- 搜索和排序 -->
          <div class="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <div class="relative">
              <input
                v-model="searchKeyword"
                @input="handleSearch"
                type="text"
                placeholder="搜索资讯标题、内容..."
                class="w-80 pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              >
              <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
            <select
              v-model="sortBy"
              @change="handleSort"
              class="px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
            >
              <option value="publishTime">最新发布</option>
              <option value="readCount">阅读最多</option>
              <option value="likeCount">点赞最多</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 热门资讯轮播 -->
      <div v-if="topNews.length > 0" class="bg-white rounded-xl shadow-card mb-8 overflow-hidden">
        <div class="bg-gradient-to-r from-primary to-blue-600 text-white p-6">
          <div class="flex items-center gap-3">
            <i class="fa fa-fire text-2xl"></i>
            <h2 class="text-xl font-bold">热门资讯</h2>
          </div>
        </div>
        
        <div class="p-6">
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="item in topNews"
              :key="item.id"
              @click="$router.push(`/news/${item.id}`)"
              class="group relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-primary/50 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div class="absolute top-3 left-3 z-10">
                <span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-full">
                  <i class="fa fa-fire mr-1"></i>热门
                </span>
              </div>
              
              <div v-if="item.coverImage" class="aspect-video overflow-hidden bg-gray-100">
                <img :src="item.coverImage" :alt="item.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
              </div>
              
              <div class="p-4">
                <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">{{ item.title }}</h3>
                <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ item.summary }}</p>
                
                <div class="flex items-center justify-between text-xs text-gray-500">
                  <div class="flex items-center gap-3">
                    <span class="flex items-center gap-1">
                      <i class="fa fa-user"></i>
                      {{ item.author }}
                    </span>
                    <span class="flex items-center gap-1">
                      <i class="fa fa-calendar"></i>
                      {{ formatTime(item.publishTime) }}
                    </span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="flex items-center gap-1">
                      <i class="fa fa-eye"></i>
                      {{ item.readCount }}
                    </span>
                    <span class="flex items-center gap-1">
                      <i class="fa fa-heart"></i>
                      {{ item.likeCount }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 资讯列表 -->
      <div class="bg-white rounded-xl shadow-card">
        <div class="p-6 border-b border-gray-100">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-900">最新资讯</h2>
            <div class="text-sm text-gray-500">
              共 {{ filteredNews.length }} 篇资讯
            </div>
          </div>
        </div>
        
        <div v-if="loading" class="p-12 text-center">
          <div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <div class="text-gray-500">加载中...</div>
        </div>

        <div v-else-if="filteredNews.length === 0" class="p-16 text-center">
          <i class="fa fa-inbox text-4xl text-gray-300 mb-4"></i>
          <div class="text-gray-500 mb-4">暂无相关资讯</div>
          <button @click="selectedCategory = 'all'; searchKeyword = ''" class="text-primary hover:underline">
            清除筛选条件
          </button>
        </div>

        <div v-else class="divide-y divide-gray-100">
          <article
            v-for="item in paginatedNews"
            :key="item.id"
            @click="$router.push(`/news/${item.id}`)"
            class="p-6 cursor-pointer hover:bg-gray-50 transition-colors content-auto"
          >
            <div class="flex gap-6 items-start">
              <div class="flex-1">
                <!-- 分类和标签 -->
                <div class="flex items-center gap-2 mb-3">
                  <span :class="getCategoryColorClass(item.category)" class="category-tag">
                    {{ item.category }}
                  </span>
                  <span v-for="tag in item.tags.slice(0, 2)" :key="tag" class="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                    {{ tag }}
                  </span>
                </div>
                
                <!-- 标题 -->
                <h3 class="text-lg font-semibold text-gray-900 mb-2 hover:text-primary transition-colors line-clamp-2">
                  {{ item.title }}
                </h3>
                
                <!-- 摘要 -->
                <p class="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                  {{ item.summary }}
                </p>
                
                <!-- 元信息 -->
                <div class="flex items-center gap-4 text-sm text-gray-500">
                  <span class="flex items-center gap-1">
                    <i class="fa fa-user"></i>
                    {{ item.author }}
                  </span>
                  <span class="flex items-center gap-1">
                    <i class="fa fa-calendar"></i>
                    {{ formatTime(item.publishTime) }}
                  </span>
                  <span class="flex items-center gap-1">
                    <i class="fa fa-eye"></i>
                    {{ item.readCount }}
                  </span>
                  <span class="flex items-center gap-1">
                    <i class="fa fa-heart"></i>
                    {{ item.likeCount }}
                  </span>
                  <span class="flex items-center gap-1">
                    <i class="fa fa-comment"></i>
                    {{ item.commentCount }}
                  </span>
                </div>
              </div>
              
              <!-- 封面图片 -->
              <div v-if="item.coverImage" class="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden bg-gray-100">
                <img :src="item.coverImage" :alt="item.title" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
              </div>
            </div>
          </article>
        </div>
        
        <!-- 分页 -->
        <div v-if="filteredNews.length > 0" class="p-6 border-t border-gray-100">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="filteredNews.length"
            layout="total, prev, pager, next, jumper"
            @current-change="handlePageChange"
            class="justify-center"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useContentStore } from '@/stores/content'
import type { News } from '@/types'

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

const getCategoryColorClass = (category: string) => {
  const colorClasses: Record<string, string> = {
    '公司新闻': 'bg-blue-100 text-blue-800',
    '行业动态': 'bg-green-100 text-green-800',
    '政策法规': 'bg-yellow-100 text-yellow-800',
    '培训通知': 'bg-purple-100 text-purple-800',
    '竞对信息': 'bg-red-100 text-red-800'
  }
  return colorClasses[category] || 'bg-gray-100 text-gray-800'
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