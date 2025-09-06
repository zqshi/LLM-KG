<template>
  <div class="news-detail-page font-inter bg-gray-100 text-gray-700 min-h-screen flex flex-col">
    <!-- 顶部导航栏（固定） -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
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
    </header>

    <!-- 面包屑导航 -->
    <div class="bg-white border-b border-gray-200 py-3">
      <div class="container mx-auto px-4">
        <div class="flex items-center text-sm text-gray-500">
          <router-link to="/" class="hover:text-primary transition-colors">首页</router-link>
          <i class="fa fa-angle-right mx-2 text-gray-400"></i>
          <router-link to="/news" class="hover:text-primary transition-colors">资讯中心</router-link>
          <i class="fa fa-angle-right mx-2 text-gray-400"></i>
          <span v-if="newsDetail?.category" class="hover:text-primary transition-colors">{{ newsDetail.category }}</span>
          <i v-if="newsDetail?.category" class="fa fa-angle-right mx-2 text-gray-400"></i>
          <span class="text-gray-700 truncate max-w-[300px]">{{ newsDetail?.title || '加载中...' }}</span>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex-1 container mx-auto px-4 py-6">
      <div class="bg-white rounded-xl shadow-card p-8">
        <div class="animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div class="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div class="space-y-3">
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded w-5/6"></div>
            <div class="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 文章不存在 -->
    <div v-else-if="!newsDetail" class="flex-1 container mx-auto px-4 py-6">
      <div class="bg-white rounded-xl shadow-card p-16 text-center">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fa fa-file-text-o text-gray-400 text-2xl"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">文章不存在</h3>
        <p class="text-gray-500 mb-6">抱歉，您访问的文章不存在或已被删除</p>
        <button @click="$router.push('/news')" class="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors">
          返回资讯中心
        </button>
      </div>
    </div>

    <!-- 主要内容区 -->
    <main v-else class="flex-1 container mx-auto px-4 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左侧：资讯正文（占2/3宽度） -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 资讯标题和基础信息 -->
          <article class="bg-white rounded-xl shadow-card overflow-hidden">
            <!-- 资讯头部 -->
            <div class="p-6 border-b border-gray-100">
              <!-- 分类标签 -->
              <div class="flex flex-wrap gap-2 mb-4">
                <span :class="getCategoryColorClass(newsDetail.category)">{{ newsDetail.category }}</span>
                <span v-if="newsDetail.isTop" class="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 font-medium">置顶</span>
                <span v-for="tag in newsDetail.tags?.slice(0, 2)" :key="tag" class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">{{ tag }}</span>
              </div>
              
              <!-- 标题 -->
              <h1 class="text-2xl md:text-3xl font-bold mb-4 text-balance">{{ newsDetail.title }}</h1>
              
              <!-- 基础信息 -->
              <div class="flex flex-wrap items-center text-gray-500 text-sm gap-4">
                <div class="flex items-center">
                  <i class="fa fa-user-o mr-2"></i>
                  <span>{{ newsDetail.author }}</span>
                </div>
                <div class="flex items-center">
                  <i class="fa fa-clock-o mr-2"></i>
                  <span>{{ formatTime(newsDetail.publishTime) }}</span>
                </div>
                <div class="flex items-center" v-if="newsDetail.source">
                  <i class="fa fa-calendar-check-o mr-2"></i>
                  <span>来源: {{ newsDetail.source }}</span>
                </div>
                <div class="flex items-center">
                  <i class="fa fa-eye mr-2"></i>
                  <span>{{ newsDetail.readCount }} 阅读</span>
                </div>
                <div class="flex items-center ml-auto" v-if="newsDetail.originalUrl">
                  <a :href="newsDetail.originalUrl" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline flex items-center" @click="handleExternalLink">
                    <i class="fa fa-link mr-1"></i> 查看原文
                  </a>
                </div>
              </div>
            </div>

            <!-- 资讯正文 -->
            <div class="p-6">
              <!-- 文章摘要 -->
              <div v-if="newsDetail.summary" class="mb-6">
                <p class="text-lg text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border-l-4 border-primary">{{ newsDetail.summary }}</p>
              </div>
              
              <!-- 封面图片 -->
              <div v-if="newsDetail.coverImage" class="mb-6">
                <figure class="cursor-pointer" @click="showImagePreview(newsDetail.coverImage)">
                  <img :src="newsDetail.coverImage" :alt="newsDetail.title" class="w-full h-auto rounded-lg border border-gray-200">
                  <figcaption class="text-center text-sm text-gray-500 mt-2">点击查看大图</figcaption>
                </figure>
              </div>
              
              <div class="prose prose-lg max-w-none text-gray-700" v-html="formatContent(newsDetail.content)"></div>
            </div>
            
            <!-- 互动按钮区 -->
            <div class="flex flex-wrap gap-4 justify-between p-6 border-t border-b border-gray-100 bg-gray-50">
              <div class="flex flex-wrap gap-3">
                <!-- 点赞按钮 -->
                <button 
                  @click="handleLike" 
                  :class="[`flex items-center px-3 py-2 rounded-lg border transition-colors`,
                    isLiked ? 'border-primary/30 bg-primary/5 text-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                  ]"
                >
                  <i :class="isLiked ? 'fa fa-thumbs-up mr-2' : 'fa fa-thumbs-o-up mr-2'"></i>
                  <span>点赞 ({{ localLikeCount }})</span>
                </button>
                
                <!-- 收藏按钮 -->
                <button 
                  @click="handleCollect" 
                  :class="[`flex items-center px-3 py-2 rounded-lg border transition-colors`,
                    isCollected ? 'border-primary/30 bg-primary/5 text-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                  ]"
                >
                  <i :class="isCollected ? 'fa fa-bookmark mr-2' : 'fa fa-bookmark-o mr-2'"></i>
                  <span>{{ isCollected ? '已收藏' : '收藏' }}</span>
                </button>
                
                <!-- 分享按钮 -->
                <button @click="showSharePanel" class="flex items-center px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors">
                  <i class="fa fa-share-alt mr-2"></i>
                  <span>分享</span>
                </button>
              </div>
              
              <!-- 评论按钮 -->
              <button @click="scrollToComments" class="flex items-center px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors">
                <i class="fa fa-comment-o mr-2"></i>
                <span>评论 ({{ newsDetail.commentCount }})</span>
              </button>
            </div>

            <!-- 相关资讯推荐 -->
            <div class="p-6" v-if="relatedNews.length > 0">
              <h3 class="text-lg font-semibold mb-4">相关资讯</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <router-link 
                  v-for="item in relatedNews.slice(0, 4)" 
                  :key="item.id"
                  :to="`/news/${item.id}`"
                  class="flex gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary/30 transition-colors group"
                >
                  <img 
                    :src="item.coverImage || `https://picsum.photos/id/${Math.floor(Math.random() * 200)}/100`" 
                    :alt="item.title" 
                    class="w-20 h-20 object-cover rounded flex-shrink-0"
                  >
                  <div class="flex-1">
                    <h4 class="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1">{{ item.title }}</h4>
                    <p class="text-xs text-gray-500">{{ formatTime(item.publishTime) }} · {{ item.author }}</p>
                  </div>
                </router-link>
              </div>
            </div>
          </article>
          
          <!-- 评论区 -->
          <section class="bg-white rounded-xl shadow-card p-6" id="comment-section">
            <h3 class="text-lg font-semibold mb-6 flex items-center">
              <i class="fa fa-comments-o text-primary mr-2"></i>
              评论区 ({{ newsDetail.commentCount }})
            </h3>
            
            <!-- 评论输入框 -->
            <div class="mb-8">
              <div class="flex gap-3">
                <img src="https://picsum.photos/id/1005/100" alt="用户头像" class="w-10 h-10 rounded-full object-cover flex-shrink-0">
                <div class="flex-1">
                  <textarea 
                    v-model="commentText"
                    rows="3" 
                    placeholder="分享你的观点或疑问..." 
                    class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm resize-none"
                  ></textarea>
                  <div class="flex justify-between items-center mt-2">
                    <span class="text-xs text-gray-500">{{ commentText.length }}/500 字</span>
                    <button 
                      @click="submitComment" 
                      :disabled="!commentText.trim()"
                      class="bg-primary text-white text-sm px-4 py-1.5 rounded-md hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      发布评论
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 评论列表 -->
            <div class="space-y-6" v-if="comments.length > 0">
              <div v-for="comment in comments" :key="comment.id" class="flex gap-3">
                <img :src="comment.author.avatar" :alt="comment.author.name" class="w-10 h-10 rounded-full object-cover flex-shrink-0">
                <div class="flex-1">
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="font-medium">{{ comment.author.name }}</h4>
                      <p class="text-xs text-gray-500 mt-0.5">{{ formatTime(comment.createTime) }}</p>
                    </div>
                  </div>
                  <p class="mt-2 text-gray-700 text-sm">{{ comment.content }}</p>
                  <div class="flex items-center mt-3 space-x-4 text-sm">
                    <button class="flex items-center text-gray-500 hover:text-primary transition-colors">
                      <i class="fa fa-thumbs-o-up mr-1"></i>
                      <span>{{ comment.likeCount }}</span>
                    </button>
                    <button class="text-gray-500 hover:text-primary transition-colors">回复</button>
                  </div>
                </div>
              </div>
              
              <!-- 加载更多评论 -->
              <div class="text-center mt-8" v-if="comments.length < newsDetail.commentCount">
                <button class="bg-white text-gray-600 border border-gray-200 px-4 py-1.5 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium">
                  <i class="fa fa-refresh mr-1"></i> 加载更多评论
                </button>
              </div>
            </div>
            
            <div v-else class="text-center py-8 text-gray-500">
              <i class="fa fa-comment-o text-2xl mb-2"></i>
              <p>还没有评论，快来抢沙发吧！</p>
            </div>
          </section>
        </div>
        
        <!-- 右侧：AI工具信息卡片+热门资讯（占1/3宽度） -->
        <div class="space-y-6">
          <!-- AI工具信息卡片（如果新闻涉及AI工具） -->
          <div v-if="isAIToolRelated" class="bg-white rounded-xl shadow-card overflow-hidden sticky top-24">
            <!-- 工具头部 -->
            <div class="p-5 border-b border-gray-100 bg-primary/5">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <!-- 工具Logo -->
                  <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <i class="fa fa-code text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 class="font-bold text-lg">{{ aiToolName }}</h3>
                    <span class="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium mt-1 inline-block">已推荐</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 工具详情 -->
            <div class="p-5">
              <!-- 工具简介 -->
              <div class="mb-4">
                <h4 class="font-medium text-sm mb-2">工具简介</h4>
                <p class="text-sm text-gray-600">{{ aiToolDescription }}</p>
              </div>
              
              <!-- 官方链接 -->
              <div class="mb-5">
                <a :href="aiToolUrl" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium" @click="handleExternalLink">
                  <i class="fa fa-external-link mr-2"></i> 访问官方网站
                </a>
              </div>
            </div>
          </div>
          
          <!-- 热门资讯推荐 -->
          <div class="bg-white rounded-xl shadow-card p-5">
            <h3 class="font-semibold text-sm mb-4">热门资讯</h3>
            <div class="space-y-4">
              <router-link 
                v-for="(item, index) in hotNews" 
                :key="item.id" 
                :to="`/news/${item.id}`"
                class="flex gap-3 group"
              >
                <img :src="`https://picsum.photos/id/${48 + index}/100`" :alt="item.title" class="w-16 h-16 object-cover rounded flex-shrink-0">
                <div>
                  <h4 class="font-medium text-xs line-clamp-2 group-hover:text-primary transition-colors">{{ item.title }}</h4>
                  <p class="text-[10px] text-gray-500 mt-1">{{ formatTime(item.publishTime) }}</p>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 图片预览弹窗 -->
    <div v-if="imagePreview.show" class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" @click="closeImagePreview">
      <button class="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 transition-colors" @click="closeImagePreview">
        <i class="fa fa-times"></i>
      </button>
      <img :src="imagePreview.url" alt="预览图片" class="max-w-[90%] max-h-[90vh] object-contain" @click.stop>
    </div>

    <!-- 分享面板 -->
    <div v-if="sharePanel.show" class="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-elevation z-50">
      <div class="p-5">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-semibold">分享资讯</h3>
          <button class="text-gray-400 hover:text-gray-600" @click="closeSharePanel">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="grid grid-cols-4 gap-4 text-center">
          <a href="#" @click="shareToWeixin" class="flex flex-col items-center text-gray-600 hover:text-primary transition-colors">
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <i class="fa fa-weixin text-green-500 text-xl"></i>
            </div>
            <span class="text-xs">微信</span>
          </a>
          <a href="#" @click="shareToWeibo" class="flex flex-col items-center text-gray-600 hover:text-primary transition-colors">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <i class="fa fa-weibo text-blue-400 text-xl"></i>
            </div>
            <span class="text-xs">微博</span>
          </a>
          <a href="#" @click="copyLink" class="flex flex-col items-center text-gray-600 hover:text-primary transition-colors">
            <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
              <i class="fa fa-link text-gray-500 text-xl"></i>
            </div>
            <span class="text-xs">复制链接</span>
          </a>
          <a href="#" @click="shareToEmail" class="flex flex-col items-center text-gray-600 hover:text-primary transition-colors">
            <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
              <i class="fa fa-envelope text-yellow-500 text-xl"></i>
            </div>
            <span class="text-xs">邮件</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useContentStore } from '@/stores/content'
import type { News } from '@/types'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const contentStore = useContentStore()

// 响应式数据
const loading = ref(false)
const newsDetail = ref<News | null>(null)
const isLiked = ref(false)
const isCollected = ref(false)
const localLikeCount = ref(0)
const commentText = ref('')
const commentPage = ref(1)

// 新增交互功能状态
const imagePreview = ref({
  show: false,
  url: ''
})
const sharePanel = ref({
  show: false
})

// 模拟评论数据
const comments = ref([
  {
    id: '1',
    content: '这篇文章写得很好，对我很有帮助！',
    author: {
      name: '张三',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    createTime: '2024-01-15 14:30:00',
    likeCount: 5
  },
  {
    id: '2',
    content: '希望能有更多这样的内容分享',
    author: {
      name: '李四',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b45c0c46?w=100&h=100&fit=crop&crop=face'
    },
    createTime: '2024-01-15 16:20:00',
    likeCount: 3
  }
])

// 计算属性
const relatedNews = computed(() => {
  if (!newsDetail.value) return []
  return contentStore.news
    .filter(item => 
      item.id !== newsDetail.value?.id && 
      (item.category === newsDetail.value?.category ||
       item.tags?.some(tag => newsDetail.value?.tags?.includes(tag)))
    )
    .slice(0, 5)
})

// 热门资讯
const hotNews = computed(() => {
  return contentStore.news
    .filter(item => item.id !== newsDetail.value?.id)
    .sort((a, b) => b.readCount - a.readCount)
    .slice(0, 3)
})

// AI工具相关判断
const isAIToolRelated = computed(() => {
  if (!newsDetail.value) return false
  const content = newsDetail.value.content?.toLowerCase() || ''
  const title = newsDetail.value.title?.toLowerCase() || ''
  const aiKeywords = ['github copilot', 'ai编码', 'ai助手', 'gpt', 'openai', 'copilot', 'codewhisperer', 'tabnine']
  return aiKeywords.some(keyword => content.includes(keyword) || title.includes(keyword))
})

const aiToolName = computed(() => {
  if (!newsDetail.value) return 'AI工具'
  const title = newsDetail.value.title?.toLowerCase() || ''
  if (title.includes('github copilot') || title.includes('copilot')) return 'GitHub Copilot'
  if (title.includes('codewhisperer')) return 'CodeWhisperer'
  if (title.includes('tabnine')) return 'Tabnine'
  return 'AI编码助手'
})

const aiToolDescription = computed(() => {
  const toolName = aiToolName.value
  const descriptions: Record<string, string> = {
    'GitHub Copilot': '由 GitHub 和 OpenAI 联合开发的AI编程助手，基于GPT模型架构，支持多种编程语言的代码生成和补全。',
    'CodeWhisperer': 'Amazon开发的AI编程助手，专门针对AWS云服务优化，提供智能代码建议和最佳实践。',
    'Tabnine': '基于深度学习的AI代码补全工具，支持多种IDE和编程语言，提供个性化的编程建议。',
    'AI编码助手': '智能编程辅助工具，通过机器学习技术提供代码建议、补全和优化方案。'
  }
  return descriptions[toolName] || descriptions['AI编码助手']
})

const aiToolUrl = computed(() => {
  const toolName = aiToolName.value
  const urls: Record<string, string> = {
    'GitHub Copilot': 'https://copilot.github.com',
    'CodeWhisperer': 'https://aws.amazon.com/codewhisperer/',
    'Tabnine': 'https://www.tabnine.com/'
  }
  return urls[toolName] || '#'
})

// 获取分类颜色类名
const getCategoryColorClass = (category: string) => {
  const colorClasses: Record<string, string> = {
    '公司新闻': 'text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium',
    '行业动态': 'text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium',
    'AI工具': 'text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 font-medium',
    '政策法规': 'text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium',
    '培训通知': 'text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 font-medium',
    '竞对信息': 'text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 font-medium'
  }
  return colorClasses[category] || 'text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800 font-medium'
}

// 方法
const fetchNewsDetail = async (id: string) => {
  loading.value = true
  try {
    // 从store中查找新闻
    await contentStore.fetchNews()
    const news = contentStore.news.find(item => item.id === id)
    
    if (news) {
      newsDetail.value = news
      localLikeCount.value = news.likeCount
      
      // 增加阅读计数 (模拟)
      news.readCount += 1
    }
  } catch (error) {
    ElMessage.error('获取文章详情失败')
    console.error('Error fetching news detail:', error)
  } finally {
    loading.value = false
  }
}

const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return `${minutes}分钟前`
    }
    return `${hours}小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
}

// 保留原有的getCategoryType方法用于兼容性
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

const formatContent = (content: string) => {
  // 简单的内容格式化，将换行符转换为HTML
  return content.replace(/\n/g, '<br>')
}

const handleLike = () => {
  if (isLiked.value) {
    localLikeCount.value--
    isLiked.value = false
    ElMessage.success('取消点赞')
  } else {
    localLikeCount.value++
    isLiked.value = true
    ElMessage.success('点赞成功')
  }
}

const handleCollect = () => {
  if (isCollected.value) {
    isCollected.value = false
    ElMessage.success('取消收藏')
  } else {
    isCollected.value = true
    ElMessage.success('收藏成功')
  }
}

// 图片预览功能
const showImagePreview = (url: string) => {
  imagePreview.value.url = url
  imagePreview.value.show = true
  document.body.style.overflow = 'hidden'
}

const closeImagePreview = () => {
  imagePreview.value.show = false
  imagePreview.value.url = ''
  document.body.style.overflow = ''
}

// 分享面板功能
const showSharePanel = () => {
  sharePanel.value.show = true
  document.body.style.overflow = 'hidden'
}

const closeSharePanel = () => {
  sharePanel.value.show = false
  document.body.style.overflow = ''
}

// 滚动到评论区
const scrollToComments = () => {
  nextTick(() => {
    const commentSection = document.getElementById('comment-section')
    if (commentSection) {
      commentSection.scrollIntoView({ behavior: 'smooth' })
    }
  })
}

// 分享功能
const handleShare = () => {
  showSharePanel()
}

const shareToWeixin = (e: Event) => {
  e.preventDefault()
  ElMessage.info('请使用微信扫一扫分享')
  closeSharePanel()
}

const shareToWeibo = (e: Event) => {
  e.preventDefault()
  const url = encodeURIComponent(window.location.href)
  const title = encodeURIComponent(newsDetail.value?.title || '')
  window.open(`https://service.weibo.com/share/share.php?url=${url}&title=${title}`)
  closeSharePanel()
}

const copyLink = (e: Event) => {
  e.preventDefault()
  navigator.clipboard.writeText(window.location.href).then(() => {
    ElMessage.success('链接已复制到剪贴板')
    closeSharePanel()
  })
}

const shareToEmail = (e: Event) => {
  e.preventDefault()
  const subject = encodeURIComponent(`推荐文章：${newsDetail.value?.title || ''}`)
  const body = encodeURIComponent(`我发现了一篇很不错的文章，推荐给你：\n\n${newsDetail.value?.title || ''}\n\n${window.location.href}`)
  window.open(`mailto:?subject=${subject}&body=${body}`)
  closeSharePanel()
}

// 外链处理
const handleExternalLink = (e: Event) => {
  e.preventDefault()
  const target = e.currentTarget as HTMLAnchorElement
  const href = target.href
  
  // 简化的外链处理，直接打开（实际项目中可以添加确认弹窗）
  if (confirm('即将访问外部链接，请注意网络安全。确定要继续吗？')) {
    window.open(href, '_blank')
  }
}

const submitComment = () => {
  if (!commentText.value.trim()) return
  
  const newComment = {
    id: Date.now().toString(),
    content: commentText.value,
    author: {
      name: '当前用户', // 应该从用户store获取
      avatar: 'https://picsum.photos/id/1005/100'
    },
    createTime: new Date().toISOString(),
    likeCount: 0
  }
  
  comments.value.unshift(newComment)
  if (newsDetail.value) {
    newsDetail.value.commentCount++
  }
  
  commentText.value = ''
  ElMessage.success('评论发表成功')
}

const handleCommentPageChange = (page: number) => {
  commentPage.value = page
  // 这里应该加载对应页的评论数据
}

// 监听键盘事件关闭弹窗
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    if (imagePreview.value.show) {
      closeImagePreview()
    }
    if (sharePanel.value.show) {
      closeSharePanel()
    }
  }
}

onMounted(() => {
  const id = route.params.id as string
  if (id) {
    fetchNewsDetail(id)
  }
  
  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeydown)
})

// 清理事件监听器
import { onUnmounted } from 'vue'
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
:root {
  --primary: #165DFF;
  --secondary: #722ed1;
  --success: #00B42A;
  --warning: #FF7D00;
  --danger: #F53F3F;
}

.primary {
  color: var(--primary);
}

.bg-primary {
  background-color: var(--primary);
}

.border-primary {
  border-color: var(--primary);
}

.shadow-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.shadow-hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.shadow-elevation {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-hover {
  transition: all 0.3s;
}

.card-hover:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.text-balance {
  text-wrap: balance;
}

.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

/* 自定义prose样式 */
.prose {
  color: #374151;
  max-width: none;
}

.prose p {
  margin-bottom: 1.25rem;
  line-height: 1.75;
}

.prose h2 {
  color: #111827;
  font-weight: 700;
  font-size: 1.5rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
  line-height: 1.375;
}

.prose h3 {
  color: #111827;
  font-weight: 600;
  font-size: 1.25rem;
  margin-top: 1.6rem;
  margin-bottom: 0.6rem;
  line-height: 1.5;
}

.prose ul,
.prose ol {
  margin-bottom: 1.25rem;
  padding-left: 1.625rem;
}

.prose li {
  margin-bottom: 0.5rem;
}

.prose img {
  margin-top: 2rem;
  margin-bottom: 2rem;
  border-radius: 0.5rem;
  max-width: 100%;
  height: auto;
}

.prose figure {
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.prose figcaption {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.25rem;
  margin-top: 0.75rem;
  text-align: center;
}

.prose blockquote {
  font-weight: 500;
  font-style: italic;
  color: #111827;
  border-left-width: 0.25rem;
  border-left-color: #d1d5db;
  quotes: "\201C""\201D""\2018""\2019";
  margin-top: 1.6rem;
  margin-bottom: 1.6rem;
  padding-left: 1rem;
}

.prose code {
  color: #111827;
  font-weight: 600;
  font-size: 0.875rem;
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}

/* 应对移动端的响应式设计 */
@media (max-width: 768px) {
  .prose {
    font-size: 0.875rem;
  }
  
  .prose h2 {
    font-size: 1.25rem;
  }
  
  .prose h3 {
    font-size: 1.125rem;
  }
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

/* Z-index 管理 */
.z-40 {
  z-index: 40;
}

.z-50 {
  z-index: 50;
}

/* 额外的工具类 */
.font-inter {
  font-family: 'Inter', system-ui, sans-serif;
}

.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.hover\:bg-gray-100:hover {
  background-color: #f3f4f6;
}

.hover\:text-primary:hover {
  color: var(--primary);
}

.hover\:border-primary\/30:hover {
  border-color: rgba(22, 93, 255, 0.3);
}

.hover\:bg-primary\/90:hover {
  background-color: rgba(22, 93, 255, 0.9);
}

.hover\:bg-primary\/20:hover {
  background-color: rgba(22, 93, 255, 0.2);
}

.focus\:ring-2:focus {
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.3);
}

.focus\:border-primary:focus {
  border-color: var(--primary);
}

.focus\:outline-none:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.disabled\:bg-gray-300:disabled {
  background-color: #d1d5db;
}

.disabled\:cursor-not-allowed:disabled {
  cursor: not-allowed;
}
</style>