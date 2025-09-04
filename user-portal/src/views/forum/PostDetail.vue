<template>
  <div class="post-detail-page">
    <div class="container">
      <!-- 面包屑导航 -->
      <el-breadcrumb class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/forum' }">企业论坛</el-breadcrumb-item>
        <el-breadcrumb-item>{{ postDetail?.title }}</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 帖子详情 -->
      <div v-if="postDetail" class="post-content">
        <!-- 帖子头部 -->
        <header class="post-header">
          <div class="post-badges">
            <el-tag v-if="postDetail.isTop" type="danger" size="small">置顶</el-tag>
            <el-tag v-if="postDetail.isHighlight" type="warning" size="small">精华</el-tag>
            <el-tag :type="getCategoryType(postDetail.category)" size="large">
              {{ postDetail.category }}
            </el-tag>
          </div>
          
          <h1>{{ postDetail.title }}</h1>
          
          <div class="post-meta">
            <div class="author-info">
              <el-avatar :size="48" :src="postDetail.author.avatar" />
              <div class="author-details">
                <div class="author-name">{{ postDetail.author.name }}</div>
                <div class="author-dept">{{ postDetail.author.department }} · {{ postDetail.author.position }}</div>
                <div class="user-level">{{ postDetail.author.level }}</div>
              </div>
            </div>
            <div class="post-stats">
              <span><el-icon><Calendar /></el-icon>{{ formatTime(postDetail.createTime) }}</span>
              <span><el-icon><View /></el-icon>{{ postDetail.viewCount }} 浏览</span>
              <span><el-icon><ChatDotRound /></el-icon>{{ postDetail.replyCount }} 回复</span>
              <span><el-icon><Star /></el-icon>{{ postDetail.likeCount }} 点赞</span>
            </div>
          </div>

          <!-- 标签 -->
          <div class="post-tags">
            <el-tag
              v-for="tag in postDetail.tags"
              :key="tag"
              type="info"
              effect="plain"
              size="small"
            >
              {{ tag }}
            </el-tag>
          </div>
        </header>

        <!-- 操作按钮 -->
        <div class="post-actions">
          <el-button-group>
            <el-button @click="handleLike" :type="isLiked ? 'primary' : 'default'">
              <el-icon><Star /></el-icon>
              {{ isLiked ? '已点赞' : '点赞' }} ({{ localLikeCount }})
            </el-button>
            <el-button @click="handleCollect">
              <el-icon><Collection /></el-icon>
              收藏
            </el-button>
            <el-button @click="handleShare">
              <el-icon><Share /></el-icon>
              分享
            </el-button>
          </el-button-group>
        </div>

        <!-- 帖子正文 -->
        <div class="post-body" v-html="formatContent(postDetail.content)"></div>

        <!-- 回复区域 -->
        <div class="replies-section">
          <div class="replies-header">
            <h3>全部回复 ({{ postDetail.replyCount }})</h3>
            <el-button type="primary" @click="showReplyForm = !showReplyForm">
              {{ showReplyForm ? '取消回复' : '我要回复' }}
            </el-button>
          </div>

          <!-- 回复表单 -->
          <div v-show="showReplyForm" class="reply-form">
            <el-input
              v-model="replyText"
              type="textarea"
              :rows="4"
              placeholder="写下你的回复..."
              maxlength="1000"
              show-word-limit
            />
            <div class="form-actions">
              <el-button @click="showReplyForm = false">取消</el-button>
              <el-button 
                type="primary" 
                @click="submitReply"
                :disabled="!replyText.trim()"
              >
                发表回复
              </el-button>
            </div>
          </div>

          <!-- 回复列表 -->
          <div class="replies-list">
            <div
              v-for="reply in replies"
              :key="reply.id"
              class="reply-item"
            >
              <div class="reply-avatar">
                <el-avatar :size="40" :src="reply.author.avatar" />
              </div>
              <div class="reply-content">
                <div class="reply-header">
                  <span class="reply-author">{{ reply.author.name }}</span>
                  <span class="reply-dept">{{ reply.author.department }}</span>
                  <span class="reply-time">{{ formatTime(reply.createTime) }}</span>
                </div>
                <div class="reply-text">{{ reply.content }}</div>
                <div class="reply-actions">
                  <el-button text size="small">
                    <el-icon><Star /></el-icon>
                    {{ reply.likeCount }}
                  </el-button>
                  <el-button text size="small">回复</el-button>
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

const getCategoryType = (category: string) => {
  const types: Record<string, string> = {
    '技术讨论': 'primary',
    '产品反馈': 'success',
    '公司建议': 'warning',
    '生活分享': 'info'
  }
  return types[category] || 'info'
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

<style scoped lang="scss">
.post-detail-page {
  min-height: 100vh;
  background: var(--el-bg-color-page);
  padding: 20px 0 40px;
}

.breadcrumb {
  margin-bottom: 24px;
}

.post-content {
  background: white;
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  overflow: hidden;
}

.post-header {
  padding: 40px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  .post-badges {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    line-height: 1.4;
    margin-bottom: 20px;
  }

  .post-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .author-info {
      display: flex;
      gap: 12px;
      align-items: center;

      .author-details {
        .author-name {
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
        
        .author-dept {
          font-size: 12px;
          color: var(--el-text-color-secondary);
          margin: 4px 0;
        }
        
        .user-level {
          font-size: 10px;
          background: var(--el-color-primary);
          color: white;
          padding: 2px 6px;
          border-radius: 10px;
          display: inline-block;
        }
      }
    }

    .post-stats {
      display: flex;
      gap: 20px;
      font-size: 14px;
      color: var(--el-text-color-secondary);

      span {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .post-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}

.post-actions {
  padding: 20px 40px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-extra-light);
}

.post-body {
  padding: 40px;
  font-size: 16px;
  line-height: 1.8;
  color: var(--el-text-color-primary);
  border-bottom: 1px solid var(--el-border-color-lighter);

  :deep(p) {
    margin-bottom: 16px;
  }
}

.replies-section {
  padding: 40px;

  .replies-header {
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

  .reply-form {
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

  .replies-list {
    .reply-item {
      display: flex;
      gap: 12px;
      padding: 20px 0;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:last-child {
        border-bottom: none;
      }

      .reply-content {
        flex: 1;

        .reply-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;

          .reply-author {
            font-weight: 500;
            color: var(--el-text-color-primary);
          }

          .reply-dept {
            font-size: 12px;
            color: var(--el-text-color-secondary);
            background: var(--el-fill-color-light);
            padding: 2px 8px;
            border-radius: 4px;
          }

          .reply-time {
            font-size: 12px;
            color: var(--el-text-color-secondary);
          }
        }

        .reply-text {
          font-size: 14px;
          line-height: 1.6;
          color: var(--el-text-color-regular);
          margin-bottom: 12px;
        }

        .reply-actions {
          display: flex;
          gap: 16px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .post-header {
    padding: 24px 20px;

    h1 {
      font-size: 24px;
    }

    .post-meta {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
  }

  .post-actions,
  .post-body,
  .replies-section {
    padding: 24px 20px;
  }

  .replies-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>