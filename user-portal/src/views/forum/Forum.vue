<template>
  <div class="forum-page bg-gray-50 font-sans text-gray-800 min-h-screen">
    <!-- 面包屑导航 -->
    <div class="container mx-auto px-4 py-6">
      <div class="text-sm text-gray-500 mb-4">
        <router-link to="/" class="hover:text-primary transition-colors">首页</router-link>
        <i class="fa fa-angle-right mx-2 text-gray-400 text-xs"></i>
        <span class="text-gray-700">论坛</span>
      </div>

      <!-- 板块头部 -->
      <div class="mb-6 bg-white rounded-xl shadow-sm p-5 hover:shadow-lg transition-all duration-300">
        <div class="flex flex-col md:flex-row md:items-center justify-between">
          <div class="flex items-center mb-4 md:mb-0">
            <div class="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
              <i class="fa fa-comments text-primary text-2xl"></i>
            </div>
            <div>
              <h2 class="text-xl font-bold">企业论坛</h2>
              <p class="text-sm text-gray-500 mt-1">分享观点，交流经验，共建和谐职场</p>
            </div>
          </div>
          <button 
            @click="$router.push('/forum/create')"
            class="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-primary/90 transition-colors self-start md:self-auto"
          >
            <i class="fa fa-pencil mr-2"></i> 发布话题
          </button>
        </div>
      </div>

      <!-- 论坛统计 -->
      <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-primary mb-1">{{ contentStore.forumPosts.length }}</div>
            <div class="text-sm text-gray-500">话题总数</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-primary mb-1">{{ totalReplies }}</div>
            <div class="text-sm text-gray-500">回复总数</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-primary mb-1">{{ activeUsers }}</div>
            <div class="text-sm text-gray-500">活跃用户</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-primary mb-1">{{ todayPosts }}</div>
            <div class="text-sm text-gray-500">今日话题</div>
          </div>
        </div>
      </div>

      <!-- 筛选与排序 -->
      <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex flex-wrap gap-2">
            <button 
              @click="selectedCategory = ''"
              :class="selectedCategory === '' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              class="px-3 py-1.5 text-sm rounded-full transition-colors"
            >
              全部
            </button>
            <button 
              v-for="category in categories"
              :key="category"
              @click="selectedCategory = category"
              :class="selectedCategory === category ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              class="px-3 py-1.5 text-sm rounded-full transition-colors"
            >
              {{ category }}
            </button>
          </div>
          <div class="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <div class="relative">
              <input 
                v-model="searchKeyword"
                @input="handleSearch"
                type="text" 
                placeholder="搜索帖子、用户..." 
                class="w-48 pl-8 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
              />
              <i class="fa fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
            <select 
              v-model="sortBy"
              @change="handleSort"
              class="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
            >
              <option value="updateTime">最新回复</option>
              <option value="createTime">最新发布</option>
              <option value="replyCount">热门话题</option>
              <option value="viewCount">浏览最多</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 置顶帖子 -->
      <div v-if="topPosts.length > 0" class="bg-white rounded-xl shadow-sm p-5 mb-6">
        <h3 class="text-lg font-semibold mb-4 flex items-center">
          <i class="fa fa-thumbtack text-red-500 mr-2"></i>
          置顶话题
        </h3>
        <div class="space-y-4">
          <div
            v-for="post in topPosts"
            :key="post.id"
            @click="handlePostClick(post)"
            class="border border-red-100 bg-red-50/30 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1"
          >
            <div class="flex items-start gap-4">
              <img 
                :src="post.author.avatar" 
                :alt="post.author.name" 
                class="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-2">
                  <span class="inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium bg-red-100 text-red-800">置顶</span>
                  <span v-if="post.isHighlight" class="inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium bg-orange-100 text-orange-800">精华</span>
                  <span :class="getCategoryColorClass(post.category)" class="inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium">
                    {{ post.category }}
                  </span>
                </div>
                <h4 class="font-medium text-gray-900 mb-2 line-clamp-2">{{ post.title }}</h4>
                <div class="flex items-center text-xs text-gray-500 space-x-4">
                  <span>{{ post.author.name }}</span>
                  <span>{{ post.author.department }}</span>
                  <span>{{ formatTime(post.createTime) }}</span>
                </div>
              </div>
              <div class="flex items-center gap-4 text-xs text-gray-500">
                <div class="flex items-center gap-1">
                  <i class="fa fa-eye"></i>
                  <span>{{ post.viewCount }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fa fa-comment"></i>
                  <span>{{ post.replyCount }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fa fa-heart"></i>
                  <span>{{ post.likeCount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 帖子列表 -->
      <div class="bg-white rounded-xl shadow-sm">
        <div class="p-5 border-b border-gray-100">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">
              话题列表
              <span class="text-sm text-gray-500 font-normal ml-2">共 {{ filteredPosts.length }} 个话题</span>
            </h3>
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <i class="fa fa-clock-o"></i>
              <span>实时更新</span>
            </div>
          </div>
        </div>

        <div v-if="loading" class="p-8 text-center">
          <i class="fa fa-spinner fa-spin text-2xl text-gray-400 mb-4"></i>
          <div class="text-gray-500">加载中...</div>
        </div>

        <div v-else-if="filteredPosts.length === 0" class="p-16 text-center">
          <i class="fa fa-inbox text-4xl text-gray-300 mb-4"></i>
          <div class="text-gray-500 mb-4">暂无相关话题</div>
          <button @click="clearFilters" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
            清除筛选条件
          </button>
        </div>

        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="post in paginatedPosts"
            :key="post.id"
            @click="handlePostClick(post)"
            :class="{
              'border-l-4 border-l-purple-400': post.type === 'poll',
              'bg-gradient-to-r from-purple-50/50 to-transparent': post.type === 'poll'
            }"
            class="p-5 cursor-pointer hover:bg-gray-50 transition-all duration-200 hover:shadow-sm"
          >
            <div class="flex items-start gap-4">
              <!-- 用户头像 -->
              <div class="flex-shrink-0">
                <img 
                  :src="post.author.avatar" 
                  :alt="post.author.name" 
                  class="w-12 h-12 rounded-full object-cover"
                />
                <div class="text-center mt-1">
                  <span class="text-xs bg-primary text-white px-2 py-0.5 rounded-full">{{ post.author.level || 'LV1' }}</span>
                </div>
              </div>

              <!-- 帖子内容 -->
              <div class="flex-1 min-w-0">
                <!-- 标题和标签 -->
                <div class="flex items-start justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <i v-if="post.type === 'poll'" class="fa fa-pie-chart text-purple-500"></i>
                    <h3 class="font-semibold text-gray-900 line-clamp-2 hover:text-primary transition-colors">{{ post.title }}</h3>
                  </div>
                  <div class="flex gap-1 ml-4 flex-shrink-0">
                    <span v-if="post.type === 'poll'" class="inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium bg-purple-100 text-purple-800">投票</span>
                    <span v-if="post.type === 'poll' && post.poll?.hasRewards" class="inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium bg-orange-100 text-orange-800">有奖</span>
                    <span v-if="post.isHighlight" class="inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium bg-orange-100 text-orange-800">精华</span>
                    <span :class="getCategoryColorClass(post.category)" class="inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium">
                      {{ post.category }}
                    </span>
                  </div>
                </div>

                <!-- 投票预览 -->
                <div v-if="post.type === 'poll' && post.poll" class="bg-gray-50 rounded-lg p-3 mb-3">
                  <div class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <i class="fa fa-question-circle text-purple-500"></i>
                    {{ post.poll.question }}
                  </div>
                  <div class="flex items-center gap-4 text-xs text-gray-500">
                    <span class="bg-purple-100 text-purple-700 px-2 py-1 rounded">{{ post.poll.isMultiChoice ? '多选' : '单选' }}</span>
                    <span :class="getPollStatusColorClass(post.poll.status)">{{ getPollStatusText(post.poll.status) }}</span>
                    <span>{{ post.poll.participantCount }} 人参与</span>
                    <span v-if="post.poll.status === 'ongoing'" class="text-orange-600">
                      <i class="fa fa-clock-o mr-1"></i>
                      {{ getPollDeadline(post.poll.endTime) }}
                    </span>
                  </div>
                </div>

                <!-- 普通帖子预览 -->
                <div v-else class="text-sm text-gray-600 mb-3 line-clamp-2">
                  {{ getContentPreview(post.content) }}
                </div>

                <!-- 标签 -->
                <div class="flex flex-wrap gap-1 mb-3">
                  <span 
                    v-for="tag in post.tags.slice(0, 4)"
                    :key="tag"
                    class="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded"
                  >
                    {{ tag }}
                  </span>
                </div>

                <!-- 底部信息 -->
                <div class="flex items-center justify-between text-xs text-gray-500">
                  <div class="flex items-center gap-4">
                    <span class="font-medium text-gray-700">{{ post.author.name }}</span>
                    <span>{{ post.author.department }}</span>
                    <span>{{ formatTime(post.createTime) }}</span>
                    <span v-if="post.updateTime !== post.createTime">
                      最后回复: {{ formatTime(post.updateTime) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 统计数据 -->
              <div class="flex-shrink-0 text-center">
                <div class="grid grid-cols-1 gap-2 text-xs">
                  <div class="flex flex-col items-center">
                    <div class="flex items-center gap-1 text-gray-500">
                      <i class="fa fa-eye"></i>
                      <span>{{ post.viewCount }}</span>
                    </div>
                    <span class="text-gray-400">浏览</span>
                  </div>
                  <div class="flex flex-col items-center">
                    <div class="flex items-center gap-1 text-gray-500">
                      <i class="fa fa-comment"></i>
                      <span>{{ post.replyCount }}</span>
                    </div>
                    <span class="text-gray-400">回复</span>
                  </div>
                  <div class="flex flex-col items-center">
                    <div class="flex items-center gap-1 text-gray-500">
                      <i class="fa fa-heart"></i>
                      <span>{{ post.likeCount }}</span>
                    </div>
                    <span class="text-gray-400">点赞</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="filteredPosts.length > 0" class="p-5 border-t border-gray-100">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="filteredPosts.length"
            layout="total, sizes, prev, pager, next, jumper"
            :page-sizes="[10, 20, 50]"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
            class="justify-center"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useContentStore } from '@/stores/content'
import type { ForumPost } from '@/types'
import {
  Search,
  Edit,
  View,
  ChatDotRound,
  Star,
  DataBoard,
  QuestionFilled,
  Timer
} from '@element-plus/icons-vue'

const router = useRouter()
const contentStore = useContentStore()

// 响应式数据
const searchKeyword = ref('')
const selectedCategory = ref('')
const sortBy = ref('updateTime')
const currentPage = ref(1)
const pageSize = ref(20)
const loading = ref(false)

// 分类选项
const categories = [
  '技术讨论',
  '产品反馈',
  '公司建议',
  '生活分享',
  '求助问答',
  '活动组织'
]

// 计算属性
const topPosts = computed(() => 
  contentStore.forumPosts.filter(post => post.isTop)
)

const totalReplies = computed(() => 
  contentStore.forumPosts.reduce((sum, post) => sum + post.replyCount, 0)
)

const activeUsers = computed(() => {
  const users = new Set(contentStore.forumPosts.map(post => post.author.id))
  return users.size
})

const todayPosts = computed(() => {
  const today = new Date().toDateString()
  return contentStore.forumPosts.filter(post => 
    new Date(post.createTime).toDateString() === today
  ).length
})

const filteredPosts = computed(() => {
  let posts = contentStore.forumPosts.filter(post => !post.isTop)
  
  // 按分类筛选
  if (selectedCategory.value) {
    posts = posts.filter(post => post.category === selectedCategory.value)
  }
  
  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    posts = posts.filter(post => 
      post.title.toLowerCase().includes(keyword) ||
      post.content.toLowerCase().includes(keyword) ||
      post.author.name.toLowerCase().includes(keyword) ||
      post.tags.some(tag => tag.toLowerCase().includes(keyword))
    )
  }
  
  // 排序
  posts.sort((a, b) => {
    switch (sortBy.value) {
      case 'createTime':
        return new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
      case 'updateTime':
        return new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
      case 'replyCount':
        return b.replyCount - a.replyCount
      case 'viewCount':
        return b.viewCount - a.viewCount
      default:
        return 0
    }
  })
  
  return posts
})

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredPosts.value.slice(start, end)
})

// 方法
const handleSearch = () => {
  currentPage.value = 1
}

const handleFilter = () => {
  currentPage.value = 1
}

const handleSort = () => {
  currentPage.value = 1
}

const clearFilters = () => {
  selectedCategory.value = ''
  searchKeyword.value = ''
  currentPage.value = 1
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (hours < 1) {
    const minutes = Math.floor(diff / (1000 * 60))
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

const getCategoryType = (category: string) => {
  const types: Record<string, string> = {
    '技术讨论': 'primary',
    '产品反馈': 'success',
    '公司建议': 'warning',
    '生活分享': 'info',
    '求助问答': 'danger',
    '活动组织': ''
  }
  return types[category] || 'info'
}

const getContentPreview = (content: string) => {
  return content.length > 100 ? content.substring(0, 100) + '...' : content
}

const handlePostClick = (post: any) => {
  if (post.type === 'poll') {
    router.push(`/forum/poll/${post.id}`)
  } else {
    router.push(`/forum/post/${post.id}`)
  }
}

const getPollStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    ongoing: 'status-ongoing',
    ended: 'status-ended',
    scheduled: 'status-scheduled',
    cancelled: 'status-cancelled'
  }
  return classMap[status] || ''
}

const getPollStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    ongoing: '进行中',
    ended: '已结束',
    scheduled: '未开始',
    cancelled: '已取消'
  }
  return textMap[status] || status
}

const getPollDeadline = (endTime: string) => {
  const end = new Date(endTime)
  const now = new Date()
  const diff = end.getTime() - now.getTime()
  
  if (diff <= 0) return '已结束'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) return `${days}天后结束`
  if (hours > 0) return `${hours}小时后结束`
  return '即将结束'
}

const getCategoryColorClass = (category: string) => {
  const colorClasses: Record<string, string> = {
    '技术讨论': 'bg-blue-100 text-blue-800',
    '产品反馈': 'bg-green-100 text-green-800',
    '公司建议': 'bg-yellow-100 text-yellow-800',
    '生活分享': 'bg-gray-100 text-gray-800',
    '求助问答': 'bg-red-100 text-red-800',
    '活动组织': 'bg-purple-100 text-purple-800'
  }
  return colorClasses[category] || 'bg-gray-100 text-gray-800'
}

const getPollStatusColorClass = (status: string) => {
  const colorClasses: Record<string, string> = {
    ongoing: 'text-green-600 bg-green-100 px-2 py-1 rounded',
    ended: 'text-gray-600 bg-gray-100 px-2 py-1 rounded',
    scheduled: 'text-orange-600 bg-orange-100 px-2 py-1 rounded',
    cancelled: 'text-red-600 bg-red-100 px-2 py-1 rounded'
  }
  return colorClasses[status] || 'text-gray-600 bg-gray-100 px-2 py-1 rounded'
}

// 组件挂载时初始化数据
onMounted(async () => {
  if (contentStore.forumPosts.length === 0) {
    loading.value = true
    try {
      await contentStore.fetchForumPosts()
    } finally {
      loading.value = false
    }
  }
})
</script>

<style scoped>
:root {
  --primary: #3B82F6;
}

.primary {
  color: var(--primary);
}

.bg-primary {
  background-color: var(--primary);
}

.hover\:bg-primary\/90:hover {
  background-color: rgba(59, 130, 246, 0.9);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.hover\:shadow-md:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.hover\:shadow-lg:hover {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

.hover\:-translate-y-1:hover {
  transform: translateY(-0.25rem);
}

.hover\:text-primary:hover {
  color: var(--primary);
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.duration-200 {
  transition-duration: 200ms;
}

.duration-300 {
  transition-duration: 300ms;
}

@media (max-width: 768px) {
  .grid-cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .md\:grid-cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .flex-col {
    flex-direction: column;
  }
  
  .md\:flex-row {
    flex-direction: column;
  }
  
  .gap-2 {
    gap: 0.5rem;
  }
}
</style>