<template>
  <div class="knowledge-detail-page">
    <div class="container">
      <!-- 面包屑导航 -->
      <el-breadcrumb class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/knowledge' }">知识平台</el-breadcrumb-item>
        <el-breadcrumb-item>{{ knowledgeDetail?.title }}</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading">
        <el-skeleton :rows="10" animated />
      </div>

      <!-- 文档不存在 -->
      <div v-else-if="!knowledgeDetail" class="not-found">
        <el-empty description="文档不存在">
          <el-button type="primary" @click="$router.push('/knowledge')">返回知识平台</el-button>
        </el-empty>
      </div>

      <!-- 文档详情 -->
      <div v-else class="knowledge-content">
        <!-- 文档头部信息 -->
        <header class="knowledge-header">
          <div class="header-top">
            <div class="file-info">
              <div class="file-icon">
                <el-icon :size="48" :color="getFileTypeColor(knowledgeDetail.fileType)">
                  <component :is="getFileTypeIcon(knowledgeDetail.fileType)" />
                </el-icon>
              </div>
              <div class="file-details">
                <h1 class="knowledge-title">{{ knowledgeDetail.title }}</h1>
                <div class="file-meta">
                  <el-tag :type="getCategoryType(knowledgeDetail.category)" size="large">
                    {{ knowledgeDetail.category }}
                  </el-tag>
                  <el-tag type="info" size="small" effect="plain">
                    {{ knowledgeDetail.fileType.toUpperCase() }}
                  </el-tag>
                </div>
              </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="action-buttons">
              <el-button-group>
                <el-button @click="handleLike" :type="isLiked ? 'primary' : 'default'">
                  <el-icon><Star /></el-icon>
                  {{ isLiked ? '已点赞' : '点赞' }} ({{ localLikeCount }})
                </el-button>
                <el-button @click="handleCollect" :type="isCollected ? 'warning' : 'default'">
                  <el-icon><Collection /></el-icon>
                  {{ isCollected ? '已收藏' : '收藏' }}
                </el-button>
                <el-button @click="handleDownload" type="success">
                  <el-icon><Download /></el-icon>
                  下载 ({{ localDownloadCount }})
                </el-button>
                <el-button @click="handleShare">
                  <el-icon><Share /></el-icon>
                  分享
                </el-button>
              </el-button-group>
            </div>
          </div>

          <!-- 文档信息 -->
          <div class="document-info">
            <div class="info-left">
              <div class="author-info">
                <el-avatar :size="40" :src="authorAvatar" />
                <div class="author-details">
                  <span class="author-name">{{ knowledgeDetail.author }}</span>
                  <span class="author-dept">{{ knowledgeDetail.department }}</span>
                </div>
              </div>
              <div class="time-info">
                <span><el-icon><Calendar /></el-icon>创建于 {{ formatTime(knowledgeDetail.createTime) }}</span>
                <span><el-icon><EditPen /></el-icon>更新于 {{ formatTime(knowledgeDetail.updateTime) }}</span>
              </div>
            </div>
            <div class="info-right">
              <div class="stats">
                <span><el-icon><View /></el-icon>{{ knowledgeDetail.readCount }} 阅读</span>
                <span><el-icon><Star /></el-icon>{{ localLikeCount }} 点赞</span>
                <span><el-icon><Download /></el-icon>{{ localDownloadCount }} 下载</span>
              </div>
            </div>
          </div>

          <!-- 标签 -->
          <div class="knowledge-tags">
            <el-tag
              v-for="tag in knowledgeDetail.tags"
              :key="tag"
              type="info"
              effect="plain"
              size="small"
            >
              {{ tag }}
            </el-tag>
          </div>
        </header>

        <!-- 文档摘要 -->
        <div class="knowledge-summary">
          <h3>文档摘要</h3>
          <p>{{ knowledgeDetail.summary }}</p>
        </div>

        <!-- 文档内容 -->
        <div class="knowledge-body">
          <h3>文档内容</h3>
          
          <!-- 如果是视频文件 -->
          <div v-if="knowledgeDetail.fileType === 'video'" class="video-player">
            <video
              controls
              width="100%"
              height="400"
              :poster="knowledgeDetail.fileUrl"
            >
              <source :src="knowledgeDetail.fileUrl" type="video/mp4">
              您的浏览器不支持视频播放。
            </video>
          </div>
          
          <!-- 如果是PDF文件 -->
          <div v-else-if="knowledgeDetail.fileType === 'pdf'" class="pdf-viewer">
            <div class="pdf-placeholder">
              <el-icon :size="64"><Document /></el-icon>
              <p>PDF 文档预览</p>
              <el-button type="primary" @click="handleDownload">
                下载查看完整文档
              </el-button>
            </div>
          </div>
          
          <!-- 其他文件类型显示内容 -->
          <div v-else class="text-content" v-html="formatContent(knowledgeDetail.content)"></div>

          <!-- 文档预览工具栏 -->
          <div class="document-toolbar">
            <div class="toolbar-left">
              <el-button-group size="small">
                <el-button @click="zoomOut">
                  <el-icon><ZoomOut /></el-icon>
                </el-button>
                <el-button>{{ zoomLevel }}%</el-button>
                <el-button @click="zoomIn">
                  <el-icon><ZoomIn /></el-icon>
                </el-button>
              </el-button-group>
            </div>
            <div class="toolbar-right">
              <el-button size="small" @click="toggleFullscreen">
                <el-icon><FullScreen /></el-icon>
                全屏
              </el-button>
            </div>
          </div>
        </div>

        <!-- 相关文档 -->
        <div class="related-knowledge">
          <h3>相关文档</h3>
          <div class="related-list">
            <div
              v-for="item in relatedKnowledge"
              :key="item.id"
              class="related-item"
              @click="$router.push(`/knowledge/${item.id}`)"
            >
              <div class="related-icon">
                <el-icon :size="24" :color="getFileTypeColor(item.fileType)">
                  <component :is="getFileTypeIcon(item.fileType)" />
                </el-icon>
              </div>
              <div class="related-content">
                <h4>{{ item.title }}</h4>
                <p>{{ item.summary }}</p>
                <div class="related-meta">
                  <span>{{ item.author }}</span>
                  <span>{{ formatTime(item.updateTime) }}</span>
                  <span>{{ item.readCount }} 阅读</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 评论区 -->
        <div class="comments-section">
          <div class="comments-header">
            <h3>评论与讨论</h3>
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
              placeholder="分享你的想法或提出问题..."
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
                  <span class="comment-dept">{{ comment.author.department }}</span>
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
                :total="50"
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
import type { Knowledge } from '@/types'
import {
  Calendar,
  View,
  Star,
  Download,
  EditPen,
  Collection,
  Share,
  Document,
  VideoCamera,
  Files,
  PictureRounded,
  ZoomIn,
  ZoomOut,
  FullScreen
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const contentStore = useContentStore()

// 响应式数据
const loading = ref(false)
const knowledgeDetail = ref<Knowledge | null>(null)
const isLiked = ref(false)
const isCollected = ref(false)
const localLikeCount = ref(0)
const localDownloadCount = ref(0)
const showCommentForm = ref(false)
const commentText = ref('')
const commentPage = ref(1)
const zoomLevel = ref(100)

// 模拟作者头像
const authorAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'

// 模拟评论数据
const comments = ref([
  {
    id: '1',
    content: '这份文档很实用，对项目开发很有帮助！',
    author: {
      name: '张三',
      department: '技术部',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    createTime: '2024-01-15 14:30:00',
    likeCount: 8
  },
  {
    id: '2',
    content: '希望能有更多这样的技术分享',
    author: {
      name: '李四',
      department: '产品部',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b45c0c46?w=100&h=100&fit=crop&crop=face'
    },
    createTime: '2024-01-15 16:20:00',
    likeCount: 5
  }
])

// 计算属性
const relatedKnowledge = computed(() => {
  if (!knowledgeDetail.value) return []
  return contentStore.knowledge
    .filter(item => 
      item.id !== knowledgeDetail.value?.id && 
      item.status === 'published' &&
      (item.category === knowledgeDetail.value?.category ||
       item.department === knowledgeDetail.value?.department ||
       item.tags.some(tag => knowledgeDetail.value?.tags.includes(tag)))
    )
    .slice(0, 5)
})

// 方法
const fetchKnowledgeDetail = async (id: string) => {
  loading.value = true
  try {
    // 从store中查找文档
    await contentStore.fetchKnowledge()
    const knowledge = contentStore.knowledge.find(item => item.id === id)
    
    if (knowledge && knowledge.status === 'published') {
      knowledgeDetail.value = knowledge
      localLikeCount.value = knowledge.likeCount
      localDownloadCount.value = knowledge.downloadCount
      
      // 增加阅读计数 (模拟)
      knowledge.readCount += 1
    }
  } catch (error) {
    ElMessage.error('获取文档详情失败')
    console.error('Error fetching knowledge detail:', error)
  } finally {
    loading.value = false
  }
}

const formatTime = (time: string) => {
  const date = new Date(time)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getCategoryType = (category: string) => {
  const types: Record<string, string> = {
    '前端技术': 'primary',
    '后端技术': 'success',
    '管理制度': 'warning',
    '产品文档': 'info',
    '培训资料': 'danger',
    '行业报告': ''
  }
  return types[category] || 'info'
}

const getFileTypeIcon = (type: string) => {
  const icons: Record<string, any> = {
    doc: Document,
    pdf: Files,
    video: VideoCamera,
    ppt: PictureRounded,
    other: Document
  }
  return icons[type] || Document
}

const getFileTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    doc: '#409EFF',
    pdf: '#F56C6C',
    video: '#67C23A',
    ppt: '#E6A23C',
    other: '#909399'
  }
  return colors[type] || '#909399'
}

const formatContent = (content: string) => {
  // 简单的内容格式化
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

const handleDownload = () => {
  localDownloadCount.value++
  ElMessage.success('下载开始')
  // 这里应该触发实际的下载逻辑
}

const handleShare = () => {
  const url = window.location.href
  if (navigator.share) {
    navigator.share({
      title: knowledgeDetail.value?.title,
      url: url
    })
  } else {
    navigator.clipboard.writeText(url).then(() => {
      ElMessage.success('链接已复制到剪贴板')
    })
  }
}

const zoomIn = () => {
  if (zoomLevel.value < 200) {
    zoomLevel.value += 25
  }
}

const zoomOut = () => {
  if (zoomLevel.value > 50) {
    zoomLevel.value -= 25
  }
}

const toggleFullscreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    document.documentElement.requestFullscreen()
  }
}

const submitComment = () => {
  if (!commentText.value.trim()) return
  
  const newComment = {
    id: Date.now().toString(),
    content: commentText.value,
    author: {
      name: '当前用户',
      department: '技术部',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    createTime: new Date().toISOString(),
    likeCount: 0
  }
  
  comments.value.unshift(newComment)
  commentText.value = ''
  showCommentForm.value = false
  ElMessage.success('评论发表成功')
}

const handleCommentPageChange = (page: number) => {
  commentPage.value = page
}

onMounted(() => {
  const id = route.params.id as string
  if (id) {
    fetchKnowledgeDetail(id)
  }
})
</script>

<style scoped lang="scss">
.knowledge-detail-page {
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

.knowledge-content {
  background: white;
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  overflow: hidden;
}

.knowledge-header {
  padding: 40px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;

    .file-info {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      flex: 1;

      .file-icon {
        padding: 12px;
        background: var(--el-fill-color-extra-light);
        border-radius: 8px;
        flex-shrink: 0;
      }

      .file-details {
        flex: 1;
        min-width: 0;

        .knowledge-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--el-text-color-primary);
          line-height: 1.4;
          margin-bottom: 12px;
        }

        .file-meta {
          display: flex;
          gap: 8px;
          align-items: center;
        }
      }
    }

    .action-buttons {
      flex-shrink: 0;
    }
  }

  .document-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 16px;
    background: var(--el-fill-color-extra-light);
    border-radius: 8px;

    .info-left {
      display: flex;
      gap: 24px;
      align-items: center;

      .author-info {
        display: flex;
        gap: 12px;
        align-items: center;

        .author-details {
          display: flex;
          flex-direction: column;

          .author-name {
            font-weight: 500;
            color: var(--el-text-color-primary);
          }

          .author-dept {
            font-size: 12px;
            color: var(--el-text-color-secondary);
          }
        }
      }

      .time-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 14px;
        color: var(--el-text-color-secondary);

        span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }

    .info-right {
      .stats {
        display: flex;
        gap: 16px;
        font-size: 14px;
        color: var(--el-text-color-secondary);

        span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }
  }

  .knowledge-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}

.knowledge-summary {
  padding: 32px 40px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-extra-light);

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 16px;
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

  p {
    font-size: 16px;
    color: var(--el-text-color-regular);
    line-height: 1.6;
    margin: 0;
  }
}

.knowledge-body {
  padding: 40px;

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 24px;
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

  .video-player {
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 24px;
  }

  .pdf-viewer {
    .pdf-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px;
      background: var(--el-fill-color-extra-light);
      border-radius: 8px;
      color: var(--el-text-color-secondary);

      p {
        margin: 16px 0 24px;
        font-size: 16px;
      }
    }
  }

  .text-content {
    font-size: 16px;
    line-height: 1.8;
    color: var(--el-text-color-primary);
    margin-bottom: 24px;

    :deep(p) {
      margin-bottom: 16px;
    }

    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
    }

    :deep(ul),
    :deep(ol) {
      margin-bottom: 16px;
      padding-left: 24px;
    }

    :deep(blockquote) {
      border-left: 4px solid var(--el-color-primary);
      padding-left: 16px;
      margin: 16px 0;
      color: var(--el-text-color-regular);
      background: var(--el-fill-color-lighter);
      padding: 16px;
      border-radius: 6px;
    }

    :deep(code) {
      background: var(--el-fill-color-light);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Monaco', 'Consolas', monospace;
    }

    :deep(pre) {
      background: var(--el-fill-color-light);
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 16px 0;
    }
  }

  .document-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: var(--el-fill-color-extra-light);
    border-radius: 8px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

.related-knowledge {
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

    .related-icon {
      padding: 8px;
      background: var(--el-fill-color-extra-light);
      border-radius: 6px;
      flex-shrink: 0;
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

          .comment-dept {
            font-size: 12px;
            color: var(--el-text-color-secondary);
            background: var(--el-fill-color-light);
            padding: 2px 8px;
            border-radius: 4px;
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
  .knowledge-header {
    padding: 24px 20px;

    .header-top {
      flex-direction: column;
      gap: 20px;
      align-items: stretch;

      .file-info {
        flex-direction: column;
        text-align: center;

        .knowledge-title {
          font-size: 24px;
        }
      }
    }

    .document-info {
      flex-direction: column;
      gap: 16px;
      align-items: flex-start;

      .info-left {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }
    }
  }

  .knowledge-summary,
  .knowledge-body,
  .related-knowledge,
  .comments-section {
    padding: 24px 20px;
  }

  .related-item {
    flex-direction: column;
    text-align: center;
  }

  .comments-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>