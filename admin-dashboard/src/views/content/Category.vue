<template>
  <div class="category-home">
    <UnifiedPageHeader 
      :title="displayName + '版块'" 
      description="查看并管理该版块下的所有帖子"
    >
      <template #actions>
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          发布新帖
        </el-button>
      </template>
    </UnifiedPageHeader>

    <el-card class="info-card" shadow="never">
      <div class="stats">
        <div class="stat">
          <div class="num">{{ contentStats.total || 0 }}</div>
          <div class="label">总内容数</div>
        </div>
        <div class="stat">
          <div class="num">{{ contentStats.today || 0 }}</div>
          <div class="label">今日新增</div>
        </div>
        <div class="stat">
          <div class="num">{{ followers }}</div>
          <div class="label">关注人数</div>
        </div>
      </div>
    </el-card>

    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" class="filter-line" @submit.prevent>
        <el-form-item label="关键词">
          <el-input v-model="queryParams.keyword" placeholder="标题或摘要" clearable style="width: 220px" @keyup.enter="reload"/>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 140px" @change="reload">
            <el-option label="待审核" :value="1" />
            <el-option label="已发布" :value="2" />
            <el-option label="已拒绝" :value="3" />
            <el-option label="已删除" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="reload">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="reset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-table :data="contentList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80"/>
        
        <el-table-column label="标题" min-width="280">
          <template #default="{ row }">
            <div class="title-cell">
              <el-link type="primary" class="title-link" @click="previewDetail(row)">
                {{ row.title }}
              </el-link>
              <div class="meta">
                <el-tag :type="getStatusColor(row.status)" size="small">{{ getStatusName(row.status) }}</el-tag>
                <span class="sep">|</span>
                <span class="author">{{ row.author?.name }}</span>
                <span class="sep">|</span>
                <span class="time">{{ formatDateTime(row.createdAt) }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="分类" width="200">
          <template #default="{ row }">
            <div class="category-path">
              <el-breadcrumb separator="/" class="category-breadcrumb">
                <el-breadcrumb-item>
                  <el-icon><FolderOpened /></el-icon>
                  {{ getCategoryPath(row.category) }}
                </el-breadcrumb-item>
              </el-breadcrumb>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="标签" width="200">
          <template #default="{ row }">
            <div class="tags-container">
              <el-tag 
                v-for="tag in row.tags.slice(0, 3)" 
                :key="tag" 
                size="small"
                class="tag-item"
                :type="getTagType(tag)"
              >
                {{ tag }}
              </el-tag>
              <el-tooltip 
                v-if="row.tags.length > 3" 
                :content="row.tags.slice(3).join(', ')" 
                placement="top"
              >
                <el-tag size="small" type="info" class="more-tags">
                  +{{ row.tags.length - 3 }}
                </el-tag>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="作者" width="120">
          <template #default="{ row }">
            <div class="author-info">
              <el-avatar :size="24" :src="row.author?.avatar" class="author-avatar">
                {{ row.author?.name?.charAt(0) || '?' }}
              </el-avatar>
              <span class="author-name">{{ row.author?.name }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)" size="small">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="发布时间" width="150">
          <template #default="{ row }">
            <div class="time-info">
              <div class="publish-time">{{ formatDateTime(row.createdAt) }}</div>
              <div class="time-ago">{{ getTimeAgo(row.createdAt) }}</div>
            </div>
          </template>
        </el-table-column>
        

        
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="previewDetail(row)" type="primary" link>
              <el-icon><View /></el-icon>预览
            </el-button>
            <el-dropdown @command="(cmd) => rowAction(cmd, row)">
              <el-button size="small" type="primary" link>
                更多<el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit" v-if="canEdit(row)">
                    <el-icon><Edit /></el-icon>编辑
                  </el-dropdown-item>
                  <el-dropdown-item command="audit" v-if="canAudit(row)">
                    <el-icon><Check /></el-icon>审核
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>
                    <el-icon><Delete /></el-icon>删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10,20,50,100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="reload"
          @current-change="reload"
        />
      </div>
    </el-card>
    
    <!-- 发帖对话框 -->
    <CreatePostDialog
      v-model="showCreateDialog"
      :category-code="code"
      :category-name="displayName"
      @success="handleCreateSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import CreatePostDialog from './CreatePostDialog.vue'
import { useContentStore } from '@/stores/content'
import { useAuthStore } from '@/stores/auth'
import type { Content } from '@/types'
import { Plus, Search, Refresh, ArrowDown, FolderOpened, View, ChatDotRound, Star, Edit, Check, Delete } from '@element-plus/icons-vue'

const router = useRouter()
const contentStore = useContentStore()
const authStore = useAuthStore()
const { contentList, loading, pagination, queryParams, contentStats } = storeToRefs(contentStore)

const showCreateDialog = ref(false)
const code = computed(() => String(router.currentRoute.value.params.code || ''))
const categoryId = computed(() => String(router.currentRoute.value.params.categoryId || ''))
const categoryName = computed(() => String(router.currentRoute.value.params.categoryName || ''))
const displayName = computed(() => {
  // 优先使用路由参数中的版块名称
  if (categoryName.value) {
    return categoryName.value
  }
  // 备用方案：使用query参数或code
  return String(router.currentRoute.value.query.name || code.value)
})
const followers = 0

const formatDateTime = (s: string) => new Date(s).toLocaleString('zh-CN')

type TagType = 'primary' | 'success' | 'info' | 'warning' | 'danger'
const getStatusName = (status: number) => ({1:'待审核',2:'已发布',3:'已拒绝',4:'已删除'} as Record<number,string>)[status] || `状态${status}`
const getStatusColor = (status: number): TagType => ({1:'warning',2:'success',3:'danger',4:'info'} as Record<number,TagType>)[status] || 'info'

const canEdit = (row: Content) => authStore.hasPermission('content:edit') || row.author?.id === authStore.currentUser?.id
const canAudit = (row: Content) => authStore.hasPermission('content:audit') && row.status === 1

const reload = async () => {
  await contentStore.loadContentList()
}
const reset = () => {
  queryParams.value.keyword = ''
  queryParams.value.status = undefined as any
  queryParams.value.page = 1
  reload()
}

const preview = (row: Content) => {
  router.push({ name: 'ContentList', query: { module: 'forum', category: row.category, from: 'category' } })
}

const rowAction = (cmd: string, row: Content) => {
  if (cmd === 'edit') router.push({ name: 'ContentEdit', params: { id: row.id } })
  else if (cmd === 'audit') router.push({ name: 'ContentList', query: { module: 'forum', category: row.category, status: 1, from: 'category' } })
  else if (cmd === 'delete') contentStore.deleteContent(row.id).then(reload)
}

const handleCreateSuccess = () => {
  showCreateDialog.value = false
  reload()
}

// 获取完整分类路径 - 显示三级分类路径
const getCategoryPath = (category: string) => {
  // 这里应该根据实际的分类数据结构来构建路径
  // 示例：技术分享 / 前端开发 / React
  const categoryMappings: Record<string, string> = {
    'tech': '技术分享',
    'frontend': '技术分享 / 前端开发',
    'react': '技术分享 / 前端开发 / React',
    'vue': '技术分享 / 前端开发 / Vue',
    'backend': '技术分享 / 后端开发',
    'java': '技术分享 / 后端开发 / Java',
    'python': '技术分享 / 后端开发 / Python',
    'database': '技术分享 / 数据库',
    'mysql': '技术分享 / 数据库 / MySQL',
    'redis': '技术分享 / 数据库 / Redis',
    'life': '生活分享',
    'food': '生活分享 / 美食',
    'travel': '生活分享 / 旅行',
    'work': '工作交流',
    'career': '工作交流 / 职业发展',
    'team': '工作交流 / 团队协作'
  }
  
  return categoryMappings[category] || category
}

// 预览详情页面 - 跳转到后台详情预览页
const previewDetail = (row: Content) => {
  router.push({ name: 'ContentDetail', params: { id: row.id } })
}

// 获取标签类型 - 为不同标签提供颜色类型
const getTagType = (tag: string): TagType => {
  const tagTypeMap: Record<string, TagType> = {
    // 技术类标签
    'JavaScript': 'warning',
    'TypeScript': 'primary',
    'Vue': 'success',
    'React': 'primary',
    'Node.js': 'success',
    'Python': 'warning',
    'Java': 'danger',
    'MySQL': 'info',
    'Redis': 'danger',
    // 分类标签
    '前端': 'primary',
    '后端': 'success',
    '全栈': 'warning',
    '移动端': 'info',
    '数据库': 'danger',
    // 难度标签
    '入门': 'success',
    '进阶': 'warning',
    '高级': 'danger',
    // 其他常用标签
    '教程': 'primary',
    '实战': 'warning',
    '分享': 'success',
    '问答': 'info',
    '讨论': 'info'
  }
  
  // 如果找到匹配的标签类型，返回对应类型，否则返回默认类型
  return tagTypeMap[tag] || (['primary', 'success', 'info', 'warning'] as TagType[])[tag.length % 4]
}

// 获取相对时间 - 显示"X小时前"格式
const getTimeAgo = (dateStr: string) => {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  
  if (diffMs < 0) return '刚刚' // 处理未来时间
  
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)
  
  if (diffSeconds < 60) return '刚刚'
  if (diffMinutes < 60) return `${diffMinutes}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  if (diffWeeks < 4) return `${diffWeeks}周前`
  if (diffMonths < 12) return `${diffMonths}个月前`
  return `${diffYears}年前`
}

// Mock数据
const mockContentData = (): Content[] => [
  {
    id: 1,
    title: 'Vue 3 + TypeScript 项目实战经验分享',
    type: 'post',
    module: 'forum',
    category: 'tech_share',
    author: {
      id: 1,
      username: 'tech_expert',
      name: '前端架构师',
      email: 'tech@example.com',
      groupId: 1,
      avatar: '',
      status: 1,
      roles: [],
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-16T14:30:00Z'
    },
    status: 2,
    content: '分享我们团队在使用Vue 3 + TypeScript构建大型项目过程中的实践经验和踩过的坑...',
    contentHtml: '<p>分享我们团队在使用Vue 3 + TypeScript构建大型项目过程中的实践经验和踩过的坑...</p>',
    tags: ['Vue3', 'TypeScript', '项目实战', '前端架构'],
    viewCount: 1250,
    likeCount: 89,
    commentCount: 32,
    isTop: true,
    isElite: true,
    isLocked: false,
    createdAt: '2024-01-15T09:30:00Z',
    updatedAt: '2024-01-16T14:20:00Z',
    publishedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    title: 'React Hooks 最佳实践指南',
    type: 'post',
    module: 'forum',
    category: 'tech_share',
    author: {
      id: 2,
      username: 'react_guru',
      name: 'React专家',
      email: 'react@example.com',
      groupId: 1,
      avatar: '',
      status: 1,
      roles: [],
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-16T10:15:00Z'
    },
    status: 2,
    content: '深入探讨React Hooks的使用技巧、性能优化策略以及常见陷阱...',
    contentHtml: '<p>深入探讨React Hooks的使用技巧、性能优化策略以及常见陷阱...</p>',
    tags: ['React', 'Hooks', '性能优化', '最佳实践'],
    viewCount: 980,
    likeCount: 67,
    commentCount: 28,
    isTop: false,
    isElite: true,
    isLocked: false,
    createdAt: '2024-01-14T16:45:00Z',
    updatedAt: '2024-01-15T09:10:00Z',
    publishedAt: '2024-01-14T17:00:00Z'
  },
  {
    id: 3,
    title: 'Node.js 微服务架构设计心得',
    type: 'post',
    module: 'forum',
    category: 'tech_share',
    author: {
      id: 3,
      username: 'backend_master',
      name: '后端工程师',
      email: 'backend@example.com',
      groupId: 2,
      avatar: '',
      status: 1,
      roles: [],
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-14T20:30:00Z'
    },
    status: 2,
    content: '从单体应用到微服务架构的演进过程，以及在实际项目中的应用经验...',
    contentHtml: '<p>从单体应用到微服务架构的演进过程，以及在实际项目中的应用经验...</p>',
    tags: ['Node.js', '微服务', '架构设计', '后端开发'],
    viewCount: 756,
    likeCount: 45,
    commentCount: 19,
    isTop: false,
    isElite: false,
    isLocked: false,
    createdAt: '2024-01-13T14:20:00Z',
    updatedAt: '2024-01-14T08:45:00Z',
    publishedAt: '2024-01-13T15:00:00Z'
  },
  {
    id: 4,
    title: 'Docker 容器化部署实践总结',
    type: 'post',
    module: 'forum',
    category: 'tech_share',
    author: {
      id: 4,
      username: 'devops_pro',
      name: 'DevOps工程师',
      email: 'devops@example.com',
      groupId: 3,
      avatar: '',
      status: 1,
      roles: [],
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-13T18:20:00Z'
    },
    status: 1,
    content: '分享在生产环境中使用Docker进行应用部署的经验和遇到的问题解决方案...',
    contentHtml: '<p>分享在生产环境中使用Docker进行应用部署的经验和遇到的问题解决方案...</p>',
    tags: ['Docker', '容器化', 'DevOps', '部署'],
    viewCount: 523,
    likeCount: 34,
    commentCount: 12,
    isTop: false,
    isElite: false,
    isLocked: false,
    createdAt: '2024-01-12T11:30:00Z',
    updatedAt: '2024-01-13T09:15:00Z'
  },
  {
    id: 5,
    title: 'MySQL 查询优化技巧详解',
    type: 'post',
    module: 'forum',
    category: 'tech_share',
    author: {
      id: 5,
      username: 'db_expert',
      name: '数据库专家',
      email: 'db@example.com',
      groupId: 2,
      avatar: '',
      status: 1,
      roles: [],
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-12T16:40:00Z'
    },
    status: 2,
    content: '深入讲解MySQL查询优化的方法和技巧，包括索引优化、SQL语句优化等...',
    contentHtml: '<p>深入讲解MySQL查询优化的方法和技巧，包括索引优化、SQL语句优化等...</p>',
    tags: ['MySQL', '查询优化', '数据库', '性能调优'],
    viewCount: 892,
    likeCount: 56,
    commentCount: 23,
    isTop: false,
    isElite: true,
    isLocked: false,
    createdAt: '2024-01-11T13:45:00Z',
    updatedAt: '2024-01-12T10:20:00Z',
    publishedAt: '2024-01-11T14:00:00Z'
  }
]

onMounted(async () => {
  // 进入版块页：固定模块为 forum，分类默认取路由 name
  queryParams.value.module = 'forum'
  if (displayName.value) queryParams.value.category = displayName.value
  queryParams.value.page = queryParams.value.page || 1
  queryParams.value.pageSize = queryParams.value.pageSize || 20

  try {
    await contentStore.loadCategories('forum')
    await contentStore.loadContentList()
    await contentStore.loadStats()
  } catch (error) {
    console.error('API加载失败，使用Mock数据:', error)
    // 使用mock数据
    contentList.value = mockContentData()
    pagination.value.total = contentList.value.length
    
    // 设置统计数据
    contentStats.value = {
      total: 5,
      today: 2,
      thisWeek: 5,
      thisMonth: 5,
      articles: 0,
      posts: 5,
      comments: 0,
      news: 0,
      goods: 0,
      quotes: 0,
      pending: 1
    }
  }
})
</script>

<style scoped>
.category-home { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-title { margin: 0; font-size: 22px; font-weight: 600; color: #303133; }
.desc { color: #909399; margin-top: 4px; font-size: 13px; }
.right { display: flex; gap: 8px; }
.info-card { margin-bottom: 12px; }
.stats { display: flex; gap: 16px; }
.stat { background: #f8f9fa; border-radius: 8px; padding: 12px 16px; text-align: center; min-width: 120px; }
.num { font-weight: 600; font-size: 20px; color: #303133; line-height: 1; }
.label { color: #606266; font-size: 12px; margin-top: 4px; }
.filter-card { margin-bottom: 12px; }
.filter-line { display: flex; gap: 12px; align-items: center; }
.table-card { margin-top: 12px; }
.title-cell .title-link { 
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
}
.title-cell .title-link:hover {
  text-decoration: underline;
}
.meta { display: flex; align-items: center; gap: 8px; color: #909399; font-size: 12px; margin-top: 6px; }
.sep { color: #e4e7ed; }

/* 分类路径样式 */
.category-path {
  display: flex;
  align-items: center;
}
.category-breadcrumb {
  font-size: 13px;
}
.category-breadcrumb :deep(.el-breadcrumb__item) {
  display: flex;
  align-items: center;
  gap: 4px;
}
.category-breadcrumb :deep(.el-breadcrumb__inner) {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #606266;
  font-weight: 500;
}

/* 标签容器样式 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}
.tag-item {
  margin: 0;
  font-size: 12px;
}
.more-tags {
  margin: 0;
  cursor: help;
}

/* 作者信息样式 */
.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.author-avatar {
  flex-shrink: 0;
}
.author-name {
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 时间信息样式 */
.time-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.publish-time {
  font-size: 13px;
  color: #303133;
  line-height: 1.2;
}
.time-ago {
  font-size: 12px;
  color: #909399;
  line-height: 1.2;
}

/* 互动数据样式 */
.stats-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.kpi { 
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  color: #909399; 
  font-size: 12px;
  line-height: 1.2;
}
.kpi .el-icon {
  font-size: 14px;
}
.pagination { display:flex; justify-content:center; margin-top: 16px; }
</style>