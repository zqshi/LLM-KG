<template>
  <div class="news-detail-page">
    <div class="container">
      <!-- 面包屑导航 -->
      <el-breadcrumb class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/news' }">资讯中心</el-breadcrumb-item>
        <el-breadcrumb-item>{{ newsDetail?.title }}</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading">
        <el-skeleton :rows="10" animated />
      </div>

      <!-- 文章不存在 -->
      <div v-else-if="!newsDetail" class="not-found">
        <el-empty description="文章不存在">
          <el-button type="primary" @click="$router.push('/news')">返回资讯中心</el-button>
        </el-empty>
      </div>

      <!-- 文章详情 -->
      <div v-else class="news-content">
        <!-- 文章头部信息 -->
        <header class="news-header">
          <div class="news-category">
            <el-tag :type="getCategoryType(newsDetail.category)" size="large">
              {{ newsDetail.category }}
            </el-tag>
            <el-tag v-if="newsDetail.isTop" type="danger" size="small">置顶</el-tag>
          </div>
          
          <h1 class="news-title">{{ newsDetail.title }}</h1>
          
          <div class="news-meta">
            <div class="meta-left">
              <span><el-icon><User /></el-icon>{{ newsDetail.author }}</span>
              <span><el-icon><Calendar /></el-icon>{{ formatTime(newsDetail.publishTime) }}</span>
              <span><el-icon><EditPen /></el-icon>{{ newsDetail.source }}</span>
            </div>
            <div class="meta-right">
              <span><el-icon><View /></el-icon>{{ newsDetail.readCount }} 阅读</span>
              <span><el-icon><Star /></el-icon>{{ newsDetail.likeCount }} 点赞</span>
              <span><el-icon><ChatDotRound /></el-icon>{{ newsDetail.commentCount }} 评论</span>
            </div>
          </div>

          <!-- 标签 -->
          <div class="news-tags">
            <el-tag
              v-for="tag in newsDetail.tags"
              :key="tag"
              type="info"
              effect="plain"
              size="small"
            >
              {{ tag }}
            </el-tag>
          </div>
        </header>

        <!-- 分享和操作按钮 -->
        <div class="news-actions">
          <el-button-group>
            <el-button @click="handleLike" :type="isLiked ? 'primary' : 'default'">
              <el-icon><Star /></el-icon>
              {{ isLiked ? '已点赞' : '点赞' }} ({{ localLikeCount }})
            </el-button>
            <el-button @click="handleCollect" :type="isCollected ? 'warning' : 'default'">
              <el-icon><Collection /></el-icon>
              {{ isCollected ? '已收藏' : '收藏' }}
            </el-button>
            <el-button @click="handleShare">
              <el-icon><Share /></el-icon>
              分享
            </el-button>
          </el-button-group>
        </div>

        <!-- 封面图片 -->
        <div v-if="newsDetail.coverImage" class="news-cover">
          <img :src="newsDetail.coverImage" :alt="newsDetail.title" />
        </div>

        <!-- 文章摘要 -->
        <div class="news-summary">
          <p>{{ newsDetail.summary }}</p>
        </div>

        <!-- 文章正文 -->
        <div class="news-body" v-html="formatContent(newsDetail.content)"></div>

        <!-- 相关推荐 -->
        <div class="related-news">
          <h3>相关推荐</h3>
          <div class="related-list">
            <div
              v-for="item in relatedNews"
              :key="item.id"
              class="related-item"
              @click="$router.push(`/news/${item.id}`)"
            >
              <div class="related-content">
                <h4>{{ item.title }}</h4>
                <p>{{ item.summary }}</p>
                <div class="related-meta">
                  <span>{{ formatTime(item.publishTime) }}</span>
                  <span>{{ item.readCount }} 阅读</span>
                </div>
              </div>
              <div v-if="item.coverImage" class="related-image">
                <img :src="item.coverImage" :alt="item.title" />
              </div>
            </div>
          </div>
        </div>

        <!-- 评论区 -->
        <div class="comments-section">
          <div class="comments-header">
            <h3>评论 ({{ newsDetail.commentCount }})</h3>
            <el-button type="primary" @click="showCommentForm = !showCommentForm">
              {{ showCommentForm ? '取消评论' : '写评论' }}
            </el-button>
          </div>

          <!-- 评论表单 -->
          <div v-show="showCommentForm" class="comment-form">
            <el-input
              v-model="commentText"
              type="textarea"
              :rows="4"
              placeholder="写下你的评论..."
              maxlength="500"
              show-word-limit
            />
            <div class="form-actions">
              <el-button @click="showCommentForm = false">取消</el-button>
              <el-button 
                type="primary" 
                @click="submitComment"
                :disabled="!commentText.trim()"
              >
                发表评论
              </el-button>
            </div>
          </div>

          <!-- 评论列表 -->
          <div class="comments-list">
            <div
              v-for="comment in comments"
              :key="comment.id"
              class="comment-item"
            >
              <div class="comment-avatar">
                <el-avatar :size="40" :src="comment.author.avatar" />
              </div>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.author.name }}</span>
                  <span class="comment-time">{{ formatTime(comment.createTime) }}</span>
                </div>
                <div class="comment-text">{{ comment.content }}</div>
                <div class="comment-actions">
                  <el-button text size="small">
                    <el-icon><Star /></el-icon>
                    {{ comment.likeCount }}
                  </el-button>
                  <el-button text size="small">回复</el-button>
                </div>
              </div>
            </div>

            <!-- 评论分页 -->
            <div v-if="comments.length > 0" class="comments-pagination">
              <el-pagination
                small
                :current-page="commentPage"
                :page-size="10"
                :total="newsDetail.commentCount"
                layout="prev, pager, next"
                @current-change="handleCommentPageChange"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useContentStore } from '@/stores/content'
import type { News } from '@/types'
import {
  User,
  Calendar,
  View,
  Star,
  ChatDotRound,
  EditPen,
  Collection,
  Share
} from '@element-plus/icons-vue'
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
const showCommentForm = ref(false)
const commentText = ref('')
const commentPage = ref(1)

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
       item.tags.some(tag => newsDetail.value?.tags.includes(tag)))
    )
    .slice(0, 5)
})

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

const handleShare = () => {
  const url = window.location.href
  if (navigator.share) {
    navigator.share({
      title: newsDetail.value?.title,
      url: url
    })
  } else {
    // 复制链接到剪贴板
    navigator.clipboard.writeText(url).then(() => {
      ElMessage.success('链接已复制到剪贴板')
    })
  }
}

const submitComment = () => {
  if (!commentText.value.trim()) return
  
  const newComment = {
    id: Date.now().toString(),
    content: commentText.value,
    author: {
      name: '当前用户', // 应该从用户store获取
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    createTime: new Date().toISOString(),
    likeCount: 0
  }
  
  comments.value.unshift(newComment)
  if (newsDetail.value) {
    newsDetail.value.commentCount++
  }
  
  commentText.value = ''
  showCommentForm.value = false
  ElMessage.success('评论发表成功')
}

const handleCommentPageChange = (page: number) => {
  commentPage.value = page
  // 这里应该加载对应页的评论数据
}

onMounted(() => {
  const id = route.params.id as string
  if (id) {
    fetchNewsDetail(id)
  }
})
</script>

<style scoped lang="scss">
.news-detail-page {
  min-height: 100vh;
  background: var(--el-bg-color-page);
  padding: 20px 0 40px;
}

.breadcrumb {
  margin-bottom: 24px;
}

.loading {
  background: white;
  border-radius: 8px;
  padding: 40px;
  box-shadow: var(--el-box-shadow-light);
}

.not-found {
  background: white;
  border-radius: 8px;
  padding: 80px;
  text-align: center;
  box-shadow: var(--el-box-shadow-light);
}

.news-content {
  background: white;
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  overflow: hidden;
}

.news-header {
  padding: 40px 40px 24px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  .news-category {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .news-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    line-height: 1.4;
    margin-bottom: 20px;
  }

  .news-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    font-size: 14px;
    color: var(--el-text-color-secondary);

    .meta-left,
    .meta-right {
      display: flex;
      gap: 20px;

      span {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .news-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}

.news-actions {
  padding: 20px 40px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-extra-light);
}

.news-cover {
  padding: 0 40px;
  margin-bottom: 24px;

  img {
    width: 100%;
    max-height: 400px;
    object-fit: cover;
    border-radius: 8px;
  }
}

.news-summary {
  padding: 0 40px;
  margin-bottom: 24px;

  p {
    font-size: 16px;
    color: var(--el-text-color-regular);
    line-height: 1.6;
    background: var(--el-fill-color-light);
    padding: 16px;
    border-radius: 6px;
    border-left: 4px solid var(--el-color-primary);
    margin: 0;
  }
}

.news-body {
  padding: 0 40px;
  margin-bottom: 40px;
  font-size: 16px;
  line-height: 1.8;
  color: var(--el-text-color-primary);

  :deep(p) {
    margin-bottom: 16px;
  }

  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
    margin: 16px 0;
  }
}

.related-news {
  padding: 40px;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-extra-light);

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
      background: var(--el-color-primary);
      border-radius: 2px;
    }
  }

  .related-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .related-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      box-shadow: var(--el-box-shadow-light);
      transform: translateY(-2px);
    }

    .related-content {
      flex: 1;

      h4 {
        font-size: 16px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        margin-bottom: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      p {
        font-size: 14px;
        color: var(--el-text-color-regular);
        margin-bottom: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .related-meta {
        display: flex;
        gap: 12px;
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }

    .related-image {
      width: 80px;
      height: 60px;
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
}

.comments-section {
  padding: 40px;
  border-top: 1px solid var(--el-border-color-lighter);

  .comments-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0;
    }
  }

  .comment-form {
    margin-bottom: 32px;
    padding: 20px;
    background: var(--el-fill-color-extra-light);
    border-radius: 8px;

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;
    }
  }

  .comments-list {
    .comment-item {
      display: flex;
      gap: 12px;
      padding: 20px 0;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:last-child {
        border-bottom: none;
      }

      .comment-content {
        flex: 1;

        .comment-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;

          .comment-author {
            font-weight: 500;
            color: var(--el-text-color-primary);
          }

          .comment-time {
            font-size: 12px;
            color: var(--el-text-color-secondary);
          }
        }

        .comment-text {
          font-size: 14px;
          line-height: 1.6;
          color: var(--el-text-color-regular);
          margin-bottom: 12px;
        }

        .comment-actions {
          display: flex;
          gap: 16px;
        }
      }
    }

    .comments-pagination {
      display: flex;
      justify-content: center;
      margin-top: 32px;
    }
  }
}

@media (max-width: 768px) {
  .news-header {
    padding: 24px 20px 16px;

    .news-title {
      font-size: 24px;
    }

    .news-meta {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
  }

  .news-actions {
    padding: 16px 20px;
  }

  .news-cover,
  .news-summary,
  .news-body {
    padding: 0 20px;
  }

  .related-news,
  .comments-section {
    padding: 24px 20px;
  }

  .related-item {
    flex-direction: column;

    .related-image {
      width: 100%;
      height: 120px;
    }
  }

  .comments-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>