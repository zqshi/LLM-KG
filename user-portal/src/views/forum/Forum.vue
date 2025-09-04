<template>
  <div class="forum-page">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>企业论坛</h1>
        <p>分享观点，交流经验，共建和谐职场</p>
        <el-button type="primary" size="large" @click="$router.push('/forum/create')">
          <el-icon><Edit /></el-icon>
          发布话题
        </el-button>
      </div>

      <!-- 热门话题和统计 -->
      <div class="forum-stats">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">{{ contentStore.forumPosts.length }}</div>
            <div class="stat-label">话题总数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ totalReplies }}</div>
            <div class="stat-label">回复总数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ activeUsers }}</div>
            <div class="stat-label">活跃用户</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ todayPosts }}</div>
            <div class="stat-label">今日话题</div>
          </div>
        </div>
      </div>

      <!-- 搜索和筛选 -->
      <div class="filter-section">
        <div class="search-controls">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索话题、内容或用户..."
            :prefix-icon="Search"
            clearable
            @input="handleSearch"
            style="width: 400px"
          />
          <div class="filter-buttons">
            <el-select
              v-model="selectedCategory"
              placeholder="分类"
              clearable
              style="width: 120px"
              @change="handleFilter"
            >
              <el-option
                v-for="category in categories"
                :key="category"
                :label="category"
                :value="category"
              />
            </el-select>
            <el-select
              v-model="sortBy"
              placeholder="排序"
              style="width: 120px"
              @change="handleSort"
            >
              <el-option label="最新发布" value="createTime" />
              <el-option label="最新回复" value="updateTime" />
              <el-option label="热门话题" value="replyCount" />
              <el-option label="浏览最多" value="viewCount" />
            </el-select>
          </div>
        </div>
      </div>

      <!-- 置顶话题 -->
      <div v-if="topPosts.length > 0" class="top-posts">
        <h3>置顶话题</h3>
        <div class="post-list">
          <div
            v-for="post in topPosts"
            :key="post.id"
            class="post-item top-post"
            @click="$router.push(`/forum/post/${post.id}`)"
          >
            <div class="post-avatar">
              <el-avatar :size="48" :src="post.author.avatar" />
            </div>
            <div class="post-content">
              <div class="post-header">
                <el-tag type="danger" size="small">置顶</el-tag>
                <h4>{{ post.title }}</h4>
                <div v-if="post.isHighlight" class="highlight-badge">
                  <el-tag type="warning" size="small">精华</el-tag>
                </div>
              </div>
              <div class="post-meta">
                <span>{{ post.author.name }}</span>
                <span>{{ post.author.department }}</span>
                <span>{{ formatTime(post.createTime) }}</span>
              </div>
              <div class="post-tags">
                <el-tag
                  v-for="tag in post.tags.slice(0, 3)"
                  :key="tag"
                  size="small"
                  type="info"
                  effect="plain"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
            <div class="post-stats">
              <div class="stat">
                <el-icon><View /></el-icon>
                <span>{{ post.viewCount }}</span>
              </div>
              <div class="stat">
                <el-icon><ChatDotRound /></el-icon>
                <span>{{ post.replyCount }}</span>
              </div>
              <div class="stat">
                <el-icon><Star /></el-icon>
                <span>{{ post.likeCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 话题列表 -->
      <div class="forum-content">
        <div v-if="loading" class="loading">
          <el-skeleton :rows="6" animated />
        </div>

        <div v-else-if="filteredPosts.length === 0" class="empty">
          <el-empty description="暂无相关话题">
            <el-button type="primary" @click="clearFilters">清除筛选条件</el-button>
          </el-empty>
        </div>

        <div v-else>
          <div class="result-info">
            共找到 {{ filteredPosts.length }} 个话题
          </div>

          <div class="post-list">
            <div
              v-for="post in paginatedPosts"
              :key="post.id"
              class="post-item"
              :class="{ 'poll-post': post.type === 'poll' }"
              @click="handlePostClick(post)"
            >
              <div class="post-avatar">
                <el-avatar :size="48" :src="post.author.avatar" />
                <div class="user-level">{{ post.author.level }}</div>
              </div>
              
              <div class="post-content">
                <div class="post-header">
                  <div class="title-row">
                    <div class="post-type-icon" v-if="post.type === 'poll'">
                      <el-icon><DataBoard /></el-icon>
                    </div>
                    <h4>{{ post.title }}</h4>
                  </div>
                  <div class="post-badges">
                    <el-tag
                      v-if="post.type === 'poll'"
                      type="primary"
                      size="small"
                    >
                      投票帖
                    </el-tag>
                    <el-tag
                      v-if="post.type === 'poll' && post.poll?.hasRewards"
                      type="warning"
                      size="small"
                    >
                      有奖
                    </el-tag>
                    <el-tag
                      v-if="post.isHighlight"
                      type="warning"
                      size="small"
                    >
                      精华
                    </el-tag>
                    <el-tag :type="getCategoryType(post.category)" size="small">
                      {{ post.category }}
                    </el-tag>
                  </div>
                </div>
                
                <!-- 投票帖预览 -->
                <div v-if="post.type === 'poll' && post.poll" class="poll-preview">
                  <div class="poll-question">
                    <el-icon><QuestionFilled /></el-icon>
                    {{ post.poll.question }}
                  </div>
                  <div class="poll-info">
                    <span class="poll-type">
                      {{ post.poll.isMultiChoice ? '多选' : '单选' }}
                    </span>
                    <span class="poll-status" :class="getPollStatusClass(post.poll.status)">
                      {{ getPollStatusText(post.poll.status) }}
                    </span>
                    <span class="poll-participants">
                      {{ post.poll.participantCount }} 人参与
                    </span>
                  </div>
                  <div v-if="post.poll.status === 'ongoing'" class="poll-deadline">
                    <el-icon><Timer /></el-icon>
                    {{ getPollDeadline(post.poll.endTime) }}
                  </div>
                </div>
                
                <!-- 普通帖子预览 -->
                <div v-else class="post-preview">
                  {{ getContentPreview(post.content) }}
                </div>
                
                <div class="post-tags">
                  <el-tag
                    v-for="tag in post.tags.slice(0, 4)"
                    :key="tag"
                    size="small"
                    type="info"
                    effect="plain"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
                
                <div class="post-meta">
                  <div class="meta-left">
                    <span><strong>{{ post.author.name }}</strong></span>
                    <span>{{ post.author.department }}</span>
                    <span>{{ formatTime(post.createTime) }}</span>
                  </div>
                  <div class="meta-right">
                    <span v-if="post.updateTime !== post.createTime">
                      最后回复: {{ formatTime(post.updateTime) }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="post-stats">
                <div class="stat">
                  <el-icon><View /></el-icon>
                  <span>{{ post.viewCount }}</span>
                  <label>浏览</label>
                </div>
                <div class="stat">
                  <el-icon><ChatDotRound /></el-icon>
                  <span>{{ post.replyCount }}</span>
                  <label>回复</label>
                </div>
                <div class="stat">
                  <el-icon><Star /></el-icon>
                  <span>{{ post.likeCount }}</span>
                  <label>点赞</label>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="filteredPosts.length"
              layout="total, sizes, prev, pager, next, jumper"
              :page-sizes="[10, 20, 50]"
              @current-change="handlePageChange"
              @size-change="handleSizeChange"
            />
          </div>
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

<style scoped lang="scss">
.forum-page {
  min-height: 100vh;
  padding: 40px 0;
  background: var(--el-bg-color-page);
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;

  h1 {
    font-size: 32px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    margin-bottom: 12px;
  }

  p {
    font-size: 16px;
    color: var(--el-text-color-regular);
    margin-bottom: 24px;
  }

  .el-button {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
  }
}

.forum-stats {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: var(--el-box-shadow-light);

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;

    .stat-item {
      text-align: center;

      .stat-number {
        font-size: 32px;
        font-weight: 700;
        color: var(--el-color-primary);
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}

.filter-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: var(--el-box-shadow-light);

  .search-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .filter-buttons {
      display: flex;
      gap: 12px;
    }
  }
}

.top-posts {
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
}

.forum-content {
  background: white;
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  padding: 24px;

  .loading {
    padding: 40px 0;
  }

  .empty {
    text-align: center;
    padding: 80px 0;
  }

  .result-info {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
}

.post-list {
  .post-item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
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

    &.top-post {
      background: var(--el-color-danger-light-9);
      border: 1px solid var(--el-color-danger-light-7);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 12px;
    }

    &.poll-post {
      border-left: 4px solid var(--el-color-primary);
      background: linear-gradient(90deg, var(--el-color-primary-light-9) 0%, white 10%);
    }

    .post-avatar {
      position: relative;
      flex-shrink: 0;

      .user-level {
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 10px;
        background: var(--el-color-primary);
        color: white;
        padding: 2px 6px;
        border-radius: 10px;
        white-space: nowrap;
      }
    }

    .post-content {
      flex: 1;
      min-width: 0;

      .post-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8px;

        .title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-right: 16px;
          flex: 1;

          .post-type-icon {
            color: var(--el-color-primary);
            font-size: 18px;
            flex-shrink: 0;
          }

          h4 {
            font-size: 18px;
            font-weight: 600;
            color: var(--el-text-color-primary);
            margin: 0;
            line-height: 1.4;
          }
        }

        .post-badges {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
      }

      .post-preview {
        font-size: 14px;
        color: var(--el-text-color-regular);
        line-height: 1.6;
        margin-bottom: 12px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .poll-preview {
        background: var(--el-fill-color-extra-light);
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 12px;
        border: 1px solid var(--el-border-color-light);

        .poll-question {
          font-size: 15px;
          font-weight: 500;
          color: var(--el-text-color-primary);
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;

          .el-icon {
            color: var(--el-color-primary);
          }
        }

        .poll-info {
          display: flex;
          gap: 12px;
          font-size: 12px;
          margin-bottom: 8px;

          .poll-type {
            background: var(--el-color-primary-light-8);
            color: var(--el-color-primary);
            padding: 2px 6px;
            border-radius: 3px;
          }

          .poll-status {
            padding: 2px 6px;
            border-radius: 3px;
            
            &.status-ongoing {
              background: var(--el-color-success-light-8);
              color: var(--el-color-success);
            }

            &.status-ended {
              background: var(--el-color-info-light-8);
              color: var(--el-color-info);
            }

            &.status-scheduled {
              background: var(--el-color-warning-light-8);
              color: var(--el-color-warning);
            }

            &.status-cancelled {
              background: var(--el-color-danger-light-8);
              color: var(--el-color-danger);
            }
          }

          .poll-participants {
            color: var(--el-text-color-secondary);
          }
        }

        .poll-deadline {
          font-size: 12px;
          color: var(--el-color-warning);
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 500;
        }
      }

      .post-tags {
        margin-bottom: 12px;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .post-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: var(--el-text-color-secondary);

        .meta-left {
          display: flex;
          gap: 12px;
        }
      }
    }

    .post-stats {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: center;
      min-width: 80px;
      padding: 8px;
      background: var(--el-fill-color-extra-light);
      border-radius: 6px;

      .stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: var(--el-text-color-secondary);

        span {
          font-weight: 500;
          color: var(--el-text-color-primary);
        }

        label {
          font-size: 10px;
        }
      }
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

@media (max-width: 768px) {
  .page-header {
    .el-button {
      position: static;
      transform: none;
      margin-top: 16px;
    }
  }

  .forum-stats .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filter-section .search-controls {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .post-item {
    flex-direction: column;
    
    .post-content .post-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .post-stats {
      flex-direction: row;
      justify-content: space-around;
      min-width: auto;
      width: 100%;
    }
  }
}
</style>