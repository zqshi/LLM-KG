import { http } from './request'
import { apiAdapter } from './adapter'
import { 
  categories, 
  posts, 
  polls, 
  featureRequests, 
  tags, 
  contentStats 
} from '@/services/staticData'
import type { 
  ApiResponse, 
  Content, 
  ContentStats, 
  ContentQueryParams, 
  ContentForm,
  BatchContentOperation,
  ContentCategory,
  HotContent,
  ContentPreview,
  AdminPostForm,
  ForumPost,
  CascaderValue,
  OrganizationNode
} from '@/types'

export const contentApi = {
  // 获取内容统计数据
  getStats(): Promise<ApiResponse<ContentStats>> {
    return apiAdapter.get(
      () => http.get('/content/stats'),
      () => contentStats()
    )
  },

  // 获取内容列表
  getList(params: ContentQueryParams): Promise<ApiResponse<{ list: Content[], total: number }>> {
    return apiAdapter.get(
      () => http.get('/content/list', { params }),
      async () => {
        const allPosts = await posts()
        return { list: allPosts, total: allPosts.length }
      },
      { mockPagination: true, paginationParams: params }
    )
  },

  // 获取内容详情
  getDetail(id: number): Promise<ApiResponse<Content>> {
    return apiAdapter.get(
      () => http.get(`/content/${id}`),
      async () => {
        const allPosts = await posts()
        const post = allPosts.find(p => p.id === id)
        if (!post) {
          throw new Error('内容不存在')
        }
        return post
      }
    )
  },

  // 创建内容
  create(data: ContentForm): Promise<ApiResponse<Content>> {
    return apiAdapter.post(
      () => http.post('/content', data),
      async () => {
        const newContent: Content = {
          id: Date.now(),
          title: data.title,
          content: data.content,
          type: data.type || 'post',
          module: data.module || 'forum',
          categoryId: data.categoryId,
          categoryName: '默认分类',
          author: {
            id: 1,
            username: 'admin',
            name: '管理员',
            avatar: ''
          },
          status: 1,
          statusName: '已发布',
          isTop: false,
          isElite: false,
          isLocked: false,
          viewCount: 0,
          likeCount: 0,
          commentCount: 0,
          shareCount: 0,
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString(),
          tags: data.tags || []
        }
        return newContent
      }
    )
  },

  // 更新内容
  update(id: number, data: Partial<ContentForm>): Promise<ApiResponse<Content>> {
    return apiAdapter.put(
      () => http.put(`/content/${id}`, data),
      async () => {
        const allPosts = await posts()
        const post = allPosts.find(p => p.id === id)
        if (!post) {
          throw new Error('内容不存在')
        }
        return {
          ...post,
          ...data,
          updateTime: new Date().toISOString()
        }
      }
    )
  },

  // 删除内容
  delete(id: number, reason?: string): Promise<ApiResponse<void>> {
    return apiAdapter.delete(
      () => http.delete(`/content/${id}`, { data: { reason } }),
      async () => undefined
    )
  },

  // 批量操作
  batchOperation(data: BatchContentOperation): Promise<ApiResponse<{ successCount: number, failCount: number }>> {
    return apiAdapter.post(
      () => http.post('/content/batch', data),
      async () => ({
        successCount: data.ids?.length || 0,
        failCount: 0
      })
    )
  },

  // 审核内容
  audit(id: number, action: 'approve' | 'reject', reason?: string): Promise<ApiResponse<void>> {
    return apiAdapter.post(
      () => http.post(`/content/${id}/audit`, { action, reason }),
      async () => undefined
    )
  },

  // 置顶内容
  setTop(id: number, isTop: boolean, expiry?: string): Promise<ApiResponse<void>> {
    return apiAdapter.post(
      () => http.post(`/content/${id}/top`, { isTop, expiry }),
      async () => undefined
    )
  },

  // 设置精华
  setElite(id: number, isElite: boolean): Promise<ApiResponse<void>> {
    return apiAdapter.post(
      () => http.post(`/content/${id}/elite`, { isElite }),
      async () => undefined
    )
  },

  // 锁定/解锁内容
  setLock(id: number, isLocked: boolean): Promise<ApiResponse<void>> {
    return apiAdapter.post(
      () => http.post(`/content/${id}/lock`, { isLocked }),
      async () => undefined
    )
  },

  // 移动版块
  moveCategory(contentIds: number[], categoryId: string): Promise<ApiResponse<void>> {
    return apiAdapter.post(
      () => http.post('/content/move-category', { contentIds, categoryId }),
      async () => undefined
    )
  },

  // 获取内容预览
  getPreview(id: number): Promise<ApiResponse<ContentPreview>> {
    return apiAdapter.get(
      () => http.get(`/content/${id}/preview`),
      async () => {
        const allPosts = await posts()
        const post = allPosts.find(p => p.id === id)
        if (!post) {
          throw new Error('内容不存在')
        }
        return {
          title: post.title,
          content: post.content,
          author: post.author,
          createTime: post.createTime,
          viewCount: post.viewCount,
          likeCount: post.likeCount,
          commentCount: post.commentCount
        }
      }
    )
  },

  // 获取热门内容
  getHotContents(days: number = 7, limit: number = 10): Promise<ApiResponse<HotContent[]>> {
    return apiAdapter.get(
      () => http.get('/content/hot', { params: { days, limit } }),
      async () => {
        const allPosts = await posts()
        return allPosts.slice(0, limit).map(post => ({
          id: post.id,
          title: post.title,
          type: post.type,
          viewCount: post.viewCount,
          likeCount: post.likeCount,
          commentCount: post.commentCount,
          score: post.viewCount + post.likeCount * 10 + post.commentCount * 5,
          createTime: post.createTime,
          author: post.author
        }))
      }
    )
  },

  // 获取版块列表
  getCategories(module?: string): Promise<ApiResponse<ContentCategory[]>> {
    return apiAdapter.get(
      () => http.get('/content/categories', { params: { module } }),
      () => categories()
    )
  },

  // 导出内容数据
  exportData(params: ContentQueryParams): Promise<ApiResponse<{ downloadUrl: string }>> {
    return apiAdapter.post(
      () => http.post('/content/export', params),
      async () => ({
        downloadUrl: '/mock/content_export_' + Date.now() + '.xlsx'
      })
    )
  },

  // 获取内容类型映射
  getTypeMapping(): Promise<ApiResponse<{ [key: string]: { name: string, color: string } }>> {
    return apiAdapter.get(
      () => http.get('/content/type-mapping'),
      async () => ({
        'post': { name: '帖子', color: '#409eff' },
        'article': { name: '文章', color: '#67c23a' },
        'news': { name: '资讯', color: '#e6a23c' },
        'poll': { name: '投票', color: '#f56c6c' },
        'feature_request': { name: '需求', color: '#909399' }
      })
    )
  },

  // 获取模块映射
  getModuleMapping(): Promise<ApiResponse<{ [key: string]: { name: string, icon: string } }>> {
    return apiAdapter.get(
      () => http.get('/content/module-mapping'),
      async () => ({
        'forum': { name: '论坛', icon: 'ChatDotRound' },
        'knowledge': { name: '知识库', icon: 'Document' },
        'news': { name: '资讯', icon: 'Reading' },
        'marketplace': { name: '交易市场', icon: 'Shop' }
      })
    )
  },

  // 获取状态映射
  getStatusMapping(): Promise<ApiResponse<{ [key: number]: { name: string, color: string } }>> {
    return apiAdapter.get(
      () => http.get('/content/status-mapping'),
      async () => ({
        0: { name: '草稿', color: '#909399' },
        1: { name: '已发布', color: '#67c23a' },
        2: { name: '待审核', color: '#e6a23c' },
        3: { name: '已拒绝', color: '#f56c6c' },
        4: { name: '已隐藏', color: '#909399' }
      })
    )
  },

  // ======================== 后台发帖相关接口 ========================

  // 管理员发帖（官方发布）
  createAdminPost(data: AdminPostForm): Promise<ApiResponse<ForumPost>> {
    return apiAdapter.post(
      () => http.post('/forum/admin/posts', data),
      async () => ({
        id: Date.now(),
        title: data.title,
        content: data.content,
        categoryId: data.categoryId,
        categoryName: '默认分类',
        author: {
          id: 1,
          username: 'admin',
          name: '管理员',
          avatar: '',
          isOfficial: true
        },
        isTop: data.isTop || false,
        isElite: data.isElite || false,
        tags: data.tags || [],
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        status: 1
      })
    )
  },

  // 获取级联分类选择器数据
  getCascaderCategories(): Promise<ApiResponse<Array<{
    value: number
    label: string
    children?: Array<{
      value: number
      label: string
      children?: Array<{
        value: number
        label: string
      }>
    }>
  }>>> {
    return apiAdapter.get(
      () => http.get('/forum/categories/cascader'),
      async () => [
        {
          value: 1,
          label: '技术讨论',
          children: [
            { value: 11, label: '前端开发' },
            { value: 12, label: '后端开发' },
            { value: 13, label: '移动开发' }
          ]
        },
        {
          value: 2,
          label: '产品交流',
          children: [
            { value: 21, label: '产品设计' },
            { value: 22, label: '用户体验' }
          ]
        },
        {
          value: 3,
          label: '行业资讯',
          children: [
            { value: 31, label: '科技新闻' },
            { value: 32, label: '行业动态' }
          ]
        }
      ]
    )
  },

  // 获取组织架构树（用于可见范围选择）
  getOrganizationTree(): Promise<ApiResponse<OrganizationNode[]>> {
    return apiAdapter.get(
      () => http.get('/organization/tree'),
      async () => [
        {
          id: 1,
          name: '总公司',
          children: [
            {
              id: 11,
              name: '技术部',
              children: [
                { id: 111, name: '前端组' },
                { id: 112, name: '后端组' }
              ]
            },
            {
              id: 12,
              name: '产品部',
              children: [
                { id: 121, name: '产品设计组' },
                { id: 122, name: '用户体验组' }
              ]
            }
          ]
        }
      ]
    )
  },

  // 上传帖子附件
  uploadPostAttachment(file: File): Promise<ApiResponse<{
    url: string
    filename: string
    size: number
    type: string
  }>> {
    return apiAdapter.post(
      () => {
        const formData = new FormData()
        formData.append('file', file)
        return http.post('/forum/posts/upload-attachment', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      },
      async () => ({
        url: '/mock/uploads/' + file.name,
        filename: file.name,
        size: file.size,
        type: file.type
      })
    )
  },

  // 批量上传附件
  uploadMultipleAttachments(files: File[]): Promise<ApiResponse<Array<{
    url: string
    filename: string
    size: number
    type: string
    success: boolean
    error?: string
  }>>> {
    return apiAdapter.post(
      () => {
        const formData = new FormData()
        files.forEach(file => {
          formData.append('files', file)
        })
        return http.post('/forum/posts/upload-multiple-attachments', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      },
      async () => files.map(file => ({
        url: '/mock/uploads/' + file.name,
        filename: file.name,
        size: file.size,
        type: file.type,
        success: true
      }))
    )
  },

  // 预览帖子（发布前预览）
  previewPost(data: AdminPostForm): Promise<ApiResponse<{
    title: string
    contentHtml: string
    categoryPath: string
    tags: string[]
    visibleRange: string[]
    estimatedReadTime: number
  }>> {
    return apiAdapter.post(
      () => http.post('/forum/posts/preview', data),
      async () => ({
        title: data.title,
        contentHtml: data.content,
        categoryPath: '技术讨论 / 前端开发',
        tags: data.tags || [],
        visibleRange: data.visibleRange || ['全体'],
        estimatedReadTime: Math.ceil(data.content.length / 200)
      })
    )
  },

  // 获取帖子草稿
  getPostDrafts(): Promise<ApiResponse<Array<{
    id: string
    title: string
    categoryId: number
    categoryPath: string
    lastModified: string
    wordCount: number
  }>>> {
    return apiAdapter.get(
      () => http.get('/forum/posts/drafts'),
      async () => [
        {
          id: 'draft_1',
          title: '未完成的帖子标题',
          categoryId: 11,
          categoryPath: '技术讨论 / 前端开发',
          lastModified: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          wordCount: 1250
        }
      ]
    )
  },

  // 保存帖子草稿
  savePostDraft(data: AdminPostForm & { draftId?: string }): Promise<ApiResponse<{
    draftId: string
    savedAt: string
  }>> {
    return apiAdapter.post(
      () => http.post('/forum/posts/save-draft', data),
      async () => ({
        draftId: data.draftId || 'draft_' + Date.now(),
        savedAt: new Date().toISOString()
      })
    )
  },

  // 删除帖子草稿
  deletePostDraft(draftId: string): Promise<ApiResponse<void>> {
    return apiAdapter.delete(
      () => http.delete(`/forum/posts/drafts/${draftId}`),
      async () => undefined
    )
  },

  // 从草稿恢复帖子数据
  loadPostFromDraft(draftId: string): Promise<ApiResponse<AdminPostForm>> {
    return apiAdapter.get(
      () => http.get(`/forum/posts/drafts/${draftId}/load`),
      async () => ({
        title: '草稿标题',
        content: '草稿内容...',
        categoryId: 11,
        tags: ['前端', '开发'],
        isTop: false,
        isElite: false,
        visibleRange: ['全体']
      })
    )
  },

  // 检查帖子标题是否重复
  checkTitleDuplicate(title: string, excludeId?: number): Promise<ApiResponse<{
    duplicate: boolean
    suggestions?: string[]
  }>> {
    return apiAdapter.get(
      () => http.get('/forum/posts/check-title', { 
        params: { title, excludeId } 
      }),
      async () => ({
        duplicate: false,
        suggestions: []
      })
    )
  },

  // 获取推荐标签
  getRecommendedTags(content: string, categoryId?: number): Promise<ApiResponse<string[]>> {
    return apiAdapter.post(
      () => http.post('/forum/posts/recommend-tags', { content, categoryId }),
      async () => ['推荐标签1', '推荐标签2', '推荐标签3']
    )
  },

  // 验证帖子内容（敏感词检查等）
  validatePostContent(content: string): Promise<ApiResponse<{
    valid: boolean
    issues?: Array<{
      type: 'sensitive_word' | 'length' | 'format'
      message: string
      suggestion?: string
    }>
    processedContent?: string
  }>> {
    return apiAdapter.post(
      () => http.post('/forum/posts/validate-content', { content }),
      async () => ({
        valid: true,
        issues: [],
        processedContent: content
      })
    )
  },

  // 获取官方发帖统计
  getAdminPostStats(): Promise<ApiResponse<{
    totalPosts: number
    todayPosts: number
    thisWeekPosts: number
    thisMonthPosts: number
    avgViewsPerPost: number
    avgCommentsPerPost: number
    topCategories: Array<{
      categoryId: number
      categoryName: string
      postCount: number
    }>
  }>> {
    return apiAdapter.get(
      () => http.get('/forum/admin/posts/stats'),
      async () => ({
        totalPosts: 1286,
        todayPosts: 8,
        thisWeekPosts: 56,
        thisMonthPosts: 234,
        avgViewsPerPost: 1580,
        avgCommentsPerPost: 23,
        topCategories: [
          { categoryId: 11, categoryName: '前端开发', postCount: 456 },
          { categoryId: 12, categoryName: '后端开发', postCount: 389 },
          { categoryId: 13, categoryName: '移动开发', postCount: 267 }
        ]
      })
    )
  },

  // 设定帖子发布时间（定时发布）
  schedulePost(data: AdminPostForm & {
    publishAt: string
  }): Promise<ApiResponse<{
    postId: number
    scheduledAt: string
  }>> {
    return apiAdapter.post(
      () => http.post('/forum/posts/schedule', data),
      async () => ({
        postId: Date.now(),
        scheduledAt: data.publishAt
      })
    )
  },

  // 取消定时发布
  cancelScheduledPost(postId: number): Promise<ApiResponse<void>> {
    return apiAdapter.delete(
      () => http.delete(`/forum/posts/${postId}/schedule`),
      async () => undefined
    )
  },

  // 获取定时发布列表
  getScheduledPosts(): Promise<ApiResponse<Array<{
    id: number
    title: string
    categoryPath: string
    scheduledAt: string
    status: 'pending' | 'published' | 'failed'
  }>>> {
    return apiAdapter.get(
      () => http.get('/forum/posts/scheduled'),
      async () => [
        {
          id: 1001,
          title: '定时发布的帖子标题',
          categoryPath: '技术讨论 / 前端开发',
          scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
          status: 'pending'
        }
      ]
    )
  }
}

export default contentApi