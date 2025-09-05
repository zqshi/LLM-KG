<template>
  <div class="bg-gray-50 font-sans text-gray-800 min-h-screen">
    <div class="container mx-auto px-4 py-6">
      <!-- 面包屑导航 -->
      <div class="text-sm text-gray-500 mb-6">
        <router-link to="/" class="hover:text-primary transition-colors">首页</router-link>
        <i class="fa fa-angle-right mx-2 text-gray-400 text-xs"></i>
        <router-link to="/forum" class="hover:text-primary transition-colors">论坛</router-link>
        <i class="fa fa-angle-right mx-2 text-gray-400 text-xs"></i>
        <span class="text-gray-700">{{ postDetail?.title || '帖子详情' }}</span>
      </div>

      <!-- 主内容区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- 帖子内容主体 -->
        <div class="lg:col-span-3">
          <div v-if="postDetail" class="bg-white rounded-xl shadow-sm overflow-hidden">
            <!-- 帖子头部 -->
            <header class="p-6 border-b border-gray-100">
              <!-- 标签和分类 -->
              <div class="flex items-center gap-2 mb-4">
                <span v-if="postDetail.isTop" class="inline-flex items-center px-2 py-1 text-xs rounded-full font-medium bg-red-100 text-red-800">
                  <i class="fa fa-thumbtack mr-1"></i>置顶
                </span>
                <span v-if="postDetail.isHighlight" class="inline-flex items-center px-2 py-1 text-xs rounded-full font-medium bg-orange-100 text-orange-800">
                  <i class="fa fa-star mr-1"></i>精华
                </span>
                <span :class="getCategoryColorClass(postDetail.category)" class="inline-flex items-center px-2 py-1 text-xs rounded-full font-medium">
                  {{ postDetail.category }}
                </span>
              </div>
              
              <!-- 标题 -->
              <h1 class="text-2xl font-bold text-gray-900 mb-6 leading-tight">{{ postDetail.title }}</h1>
              
              <!-- 作者信息 -->
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-4">
                  <img :src="postDetail.author.avatar" :alt="postDetail.author.name" class="w-12 h-12 rounded-full object-cover">
                  <div>
                    <div class="font-semibold text-gray-900">{{ postDetail.author.name }}</div>
                    <div class="text-sm text-gray-600">{{ postDetail.author.department }} · {{ postDetail.author.position }}</div>
                    <div class="text-xs bg-primary text-white px-2 py-1 rounded-full mt-1 inline-block">{{ postDetail.author.level || 'LV1' }}</div>
                  </div>
                </div>
                
                <!-- 帖子统计 -->
                <div class="text-right text-sm text-gray-500">
                  <div class="flex items-center gap-4">
                    <span class="flex items-center gap-1">
                      <i class="fa fa-clock-o"></i>
                      {{ formatTime(postDetail.createTime) }}
                    </span>
                  </div>
                  <div class="flex items-center gap-4 mt-2">
                    <span class="flex items-center gap-1">
                      <i class="fa fa-eye"></i>
                      {{ postDetail.viewCount }}
                    </span>
                    <span class="flex items-center gap-1">
                      <i class="fa fa-comment"></i>
                      {{ postDetail.replyCount }}
                    </span>
                    <span class="flex items-center gap-1">
                      <i class="fa fa-heart"></i>
                      {{ localLikeCount }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 标签 -->
              <div class="flex flex-wrap gap-2 mt-4">
                <span
                  v-for="tag in postDetail.tags"
                  :key="tag"
                  class="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                >
                  {{ tag }}
                </span>
              </div>
            </header>

            <!-- 操作按钮 -->
            <div class="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
              <div class="flex items-center gap-2">
                <button
                  @click="handleLike"
                  :class="isLiked ? 'bg-red-100 text-red-600' : 'bg-white text-gray-600 hover:bg-gray-50'"
                  class="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 transition-colors"
                >
                  <i :class="isLiked ? 'fa fa-heart text-red-500' : 'fa fa-heart-o'"></i>
                  {{ isLiked ? '已点赞' : '点赞' }} ({{ localLikeCount }})
                </button>
                
                <button
                  @click="handleCollect"
                  class="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                >
                  <i class="fa fa-bookmark-o"></i>
                  收藏
                </button>
                
                <button
                  @click="handleShare"
                  class="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                >
                  <i class="fa fa-share"></i>
                  分享
                </button>
              </div>
              
              <div class="text-sm text-gray-500">
                最后更新: {{ formatTime(postDetail.updateTime) }}
              </div>
            </div>

            <!-- 帖子正文 -->
            <div class="p-6 prose prose-gray max-w-none border-b border-gray-100">
              <div class="text-gray-800 leading-relaxed" v-html="formatContent(postDetail.content)"></div>
            </div>

            <!-- 回复区域 -->
            <div class="p-6">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-900">
                  全部回复 <span class="text-gray-500 font-normal">({{ postDetail.replyCount }})</span>
                </h3>
                <button 
                  @click="showReplyForm = !showReplyForm"
                  class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {{ showReplyForm ? '取消回复' : '我要回复' }}
                </button>
              </div>

              <!-- 回复表单 -->
              <div v-show="showReplyForm" class="mb-6 p-4 bg-gray-50 rounded-lg">
                <textarea
                  v-model="replyText"
                  placeholder="写下你的回复..."
                  rows="4"
                  maxlength="1000"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                />
                <div class="flex justify-between items-center mt-3">
                  <span class="text-xs text-gray-400">{{ replyText.length }}/1000</span>
                  <div class="flex gap-2">
                    <button @click="showReplyForm = false" class="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      取消
                    </button>
                    <button 
                      @click="submitReply"
                      :disabled="!replyText.trim()"
                      class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      发表回复
                    </button>
                  </div>
                </div>
              </div>

              <!-- 回复列表 -->
              <div class="space-y-4">
                <div
                  v-for="reply in replies"
                  :key="reply.id"
                  class="flex gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <img :src="reply.author.avatar" :alt="reply.author.name" class="w-10 h-10 rounded-full object-cover flex-shrink-0">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <span class="font-medium text-gray-900">{{ reply.author.name }}</span>
                      <span class="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">{{ reply.author.department }}</span>
                      <span class="text-xs text-gray-500">{{ formatTime(reply.createTime) }}</span>
                    </div>
                    <div class="text-gray-800 mb-3 leading-relaxed">{{ reply.content }}</div>
                    <div class="flex items-center gap-4 text-sm">
                      <button class="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
                        <i class="fa fa-heart-o"></i>
                        {{ reply.likeCount }}
                      </button>
                      <button class="text-gray-500 hover:text-primary transition-colors">回复</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 右侧侧边栏 -->
        <div class="lg:col-span-1">
          <!-- 作者信息卡片 -->
          <div v-if="postDetail" class="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div class="text-center">
              <img :src="postDetail.author.avatar" :alt="postDetail.author.name" class="w-16 h-16 rounded-full mx-auto mb-3 object-cover">
              <h4 class="font-semibold text-gray-900">{{ postDetail.author.name }}</h4>
              <p class="text-sm text-gray-600 mb-2">{{ postDetail.author.department }}</p>
              <span class="inline-block bg-primary text-white text-xs px-3 py-1 rounded-full">{{ postDetail.author.level || 'LV1' }}</span>
              
              <div class="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100 text-center">
                <div>
                  <div class="text-lg font-bold text-gray-900">{{ postDetail.author.posts || 12 }}</div>
                  <div class="text-xs text-gray-500">帖子</div>
                </div>
                <div>
                  <div class="text-lg font-bold text-gray-900">{{ postDetail.author.followers || 45 }}</div>
                  <div class="text-xs text-gray-500">粉丝</div>
                </div>
                <div>
                  <div class="text-lg font-bold text-gray-900">{{ postDetail.author.likes || 128 }}</div>
                  <div class="text-xs text-gray-500">获赞</div>
                </div>
              </div>
              
              <button class="w-full mt-4 bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors">
                <i class="fa fa-plus mr-2"></i>关注
              </button>
            </div>
          </div>
          
          <!-- 相关帖子 -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h4 class="font-semibold text-gray-900 mb-4">相关帖子</h4>
            <div class="space-y-3">
              <div class="flex gap-3">
                <div class="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div class="flex-1 min-w-0">
                  <h5 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">如何提高团队协作效率</h5>
                  <div class="text-xs text-gray-500">2天前 · 15回复</div>
                </div>
              </div>
              
              <div class="flex gap-3">
                <div class="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div class="flex-1 min-w-0">
                  <h5 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">新人入职指南</h5>
                  <div class="text-xs text-gray-500">3天前 · 8回复</div>
                </div>
              </div>
              
              <div class="flex gap-3">
                <div class="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div class="flex-1 min-w-0">
                  <h5 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">公司远程办公政策</h5>
                  <div class="text-xs text-gray-500">1周前 · 23回复</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useContentStore } from '@/stores/content'
import type { ForumPost } from '@/types'
import { Calendar, View, ChatDotRound, Star, Collection, Share } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const contentStore = useContentStore()

const postDetail = ref<ForumPost | null>(null)
const isLiked = ref(false)
const localLikeCount = ref(0)
const showReplyForm = ref(false)
const replyText = ref('')

// 模拟回复数据
const replies = ref([
  {
    id: '1',
    content: '很好的建议，支持！',
    author: {
      name: '张三',
      department: '技术部',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    createTime: '2024-01-15 14:30:00',
    likeCount: 5
  }
])

const fetchPostDetail = async (id: string) => {
  await contentStore.fetchForumPosts()
  const post = contentStore.forumPosts.find(item => item.id === id)
  if (post) {
    postDetail.value = post
    localLikeCount.value = post.likeCount
    post.viewCount += 1
  }
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
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

const formatContent = (content: string) => {
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
  ElMessage.success('收藏成功')
}

const handleShare = () => {
  navigator.clipboard.writeText(window.location.href).then(() => {
    ElMessage.success('链接已复制到剪贴板')
  })
}

const submitReply = () => {
  if (!replyText.value.trim()) return
  
  const newReply = {
    id: Date.now().toString(),
    content: replyText.value,
    author: {
      name: '当前用户',
      department: '技术部',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    createTime: new Date().toISOString(),
    likeCount: 0
  }
  
  replies.value.unshift(newReply)
  if (postDetail.value) {
    postDetail.value.replyCount++
  }
  
  replyText.value = ''
  showReplyForm.value = false
  ElMessage.success('回复发表成功')
}

onMounted(() => {
  const id = route.params.id as string
  if (id) {
    fetchPostDetail(id)
  }
})
</script>

<style scoped>
:root {
  --primary: #3B82F6;
}

.text-primary {
  color: var(--primary);
}

.bg-primary {
  background-color: var(--primary);
}

.bg-primary\/90 {
  background-color: rgba(59, 130, 246, 0.9);
}

.hover\:bg-primary:hover {
  background-color: var(--primary);
}

.hover\:bg-primary\/90:hover {
  background-color: rgba(59, 130, 246, 0.9);
}

.hover\:text-primary:hover {
  color: var(--primary);
}

.focus\:ring-primary:focus {
  --tw-ring-color: var(--primary);
  --tw-ring-opacity: 0.5;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.focus\:border-primary:focus {
  border-color: var(--primary);
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

.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.prose {
  max-width: none;
}

.prose :deep(p) {
  margin-bottom: 1em;
}

.prose :deep(h1) {
  font-size: 1.5em;
  font-weight: 700;
  margin-bottom: 0.5em;
}

.prose :deep(h2) {
  font-size: 1.25em;
  font-weight: 600;
  margin-bottom: 0.5em;
}

.prose :deep(ul) {
  list-style-type: disc;
  margin-left: 1.5em;
  margin-bottom: 1em;
}

.prose :deep(ol) {
  list-style-type: decimal;
  margin-left: 1.5em;
  margin-bottom: 1em;
}

.prose :deep(blockquote) {
  border-left: 4px solid var(--primary);
  padding-left: 1em;
  margin: 1em 0;
  color: #6b7280;
}

.prose :deep(code) {
  background-color: #f3f4f6;
  padding: 0.125em 0.25em;
  border-radius: 0.25em;
  font-size: 0.875em;
}

.prose :deep(pre) {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1em;
  border-radius: 0.5em;
  overflow-x: auto;
  margin: 1em 0;
}

@media (max-width: 1024px) {
  .lg\:col-span-3 {
    grid-column: span 1;
  }
  
  .lg\:col-span-1 {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  .lg\:grid-cols-4 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>