import { http } from './request'
import { apiAdapter } from './adapter'
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
      async () => {
        try {
          // 从静态数据中获取统计数据
          const statsModule = await import('@/services/staticData/content')
          const stats = statsModule.contentStats
          
          // 转换为ContentStats格式
          const result: ContentStats = {
            total: stats.totalPosts || 0,
            articles: Math.floor(stats.totalPosts * 0.3) || 0,
            posts: Math.floor(stats.totalPosts * 0.5) || 0,
            comments: Math.floor(stats.totalPosts * 0.1) || 0,
            news: Math.floor(stats.totalPosts * 0.05) || 0,
            goods: Math.floor(stats.totalPosts * 0.03) || 0,
            quotes: Math.floor(stats.totalPosts * 0.02) || 0,
            pending: 23, // 固定值用于演示
            today: stats.todayPosts || 0,
            thisWeek: Math.floor(stats.todayPosts * 7) || 0,
            thisMonth: Math.floor(stats.todayPosts * 30) || 0
          }
          
          return result
        } catch (error) {
          console.error('加载静态统计数据失败:', error)
          // 返回默认值
          const defaultStats: ContentStats = {
            total: 0,
            articles: 0,
            posts: 0,
            comments: 0,
            news: 0,
            goods: 0,
            quotes: 0,
            pending: 0,
            today: 0,
            thisWeek: 0,
            thisMonth: 0
          }
          return defaultStats
        }
      }
    )
  },

  // 获取内容列表
  getList(params: ContentQueryParams): Promise<ApiResponse<{ list: Content[], total: number }>> {
    return apiAdapter.get(
      () => http.get('/content/list', { params }),
      async () => {
        const allPosts = await import('@/services/staticData/content').then(m => m.posts)
        // 转换静态数据为Content类型
        const contentList: Content[] = allPosts.map((post: any) => ({
          id: post.id,
          title: post.title,
          type: 'post', // 默认类型
          module: 'forum', // 默认模块
          category: post.category?.name || '默认分类',
          author: {
            id: post.author.id,
            username: post.author.name,
            name: post.author.name,
            email: 'example@example.com', // 静态数据中没有邮箱字段
            phone: '',
            avatar: post.author.avatar || '',
            groupId: 1,
            status: 1,
            roles: [],
            createTime: post.createTime,
            updateTime: post.updateTime || post.createTime
          },
          status: post.status,
          content: post.content,
          tags: post.tags || [],
          viewCount: post.viewCount || 0,
          likeCount: post.likeCount || 0,
          commentCount: post.commentCount || 0,
          isTop: post.isTop || false,
          isElite: post.isEssence || false,
          isLocked: false,
          createdAt: post.createTime,
          updatedAt: post.updateTime || post.createTime,
          publishedAt: post.publishTime || post.createTime
        }))
        return { list: contentList, total: contentList.length }
      },
      { mockPagination: true, paginationParams: params }
    )
  },

  // 获取内容详情
  getDetail(id: number): Promise<ApiResponse<Content>> {
    return apiAdapter.get(
      () => http.get(`/content/${id}`),
      async () => {
        const allPosts = await import('@/services/staticData/content').then(m => m.posts)
        const post: any = allPosts.find((p: any) => p.id === id)
        if (!post) {
          throw new Error('内容不存在')
        }
        
        // 转换为Content类型
        const content: Content = {
          id: post.id,
          title: post.title,
          type: 'post', // 默认类型
          module: 'forum', // 默认模块
          category: post.category?.name || '默认分类',
          author: {
            id: post.author.id,
            username: post.author.name,
            name: post.author.name,
            email: 'example@example.com',
            phone: '',
            avatar: post.author.avatar || '',
            groupId: 1,
            status: 1,
            roles: [],
            createTime: post.createTime,
            updateTime: post.updateTime || post.createTime
          },
          status: post.status,
          content: post.content,
          tags: post.tags || [],
          viewCount: post.viewCount || 0,
          likeCount: post.likeCount || 0,
          commentCount: post.commentCount || 0,
          isTop: post.isTop || false,
          isElite: post.isEssence || false,
          isLocked: false,
          createdAt: post.createTime,
          updatedAt: post.updateTime || post.createTime,
          publishedAt: post.publishTime || post.createTime
        }
        return content
      }
    )
  },

  // 创建内容
  create(data: ContentForm): Promise<ApiResponse<Content>> {
    return apiAdapter.post(
      () => http.post('/content', data),
      {
        id: Date.now(),
        title: data.title,
        type: (data.type as 'article' | 'post' | 'comment' | 'news' | 'goods' | 'quote') || 'post',
        module: (data.module as 'knowledge' | 'forum' | 'news' | 'flea-market' | 'operation') || 'forum',
        category: data.category,
        author: {
          id: 1,
          username: 'admin',
          name: '管理员',
          email: 'admin@example.com',
          phone: '',
          avatar: '',
          groupId: 1,
          status: 1,
          roles: [],
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString()
        },
        status: (data.status as 1 | 2 | 3 | 4) || 1,
        content: data.content,
        tags: data.tags || [],
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        isTop: data.isTop || false,
        isElite: data.isElite || false,
        isLocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(data.contentHtml && { contentHtml: data.contentHtml })
      } as Content
    )
  },

  // 更新内容
  update(id: number, data: Partial<ContentForm>): Promise<ApiResponse<Content>> {
    return apiAdapter.put(
      () => http.put(`/content/${id}`, data),
      id,
      {
        title: data.title,
        category: data.category,
        status: data.status as 1 | 2 | 3 | 4,
        content: data.content,
        tags: data.tags,
        isTop: data.isTop,
        isElite: data.isElite,
        ...(data.contentHtml && { contentHtml: data.contentHtml })
      } as Partial<Content>
    )
  },

  // 删除内容
  delete(id: number, reason?: string): Promise<ApiResponse<null>> {
    return apiAdapter.delete(
      () => http.delete(`/content/${id}`, { data: { reason } })
    )
  },

  // 批量操作
  batchOperation(data: BatchContentOperation): Promise<ApiResponse<{ successCount: number, failCount: number }>> {
    return apiAdapter.post(
      () => http.post('/content/batch', data),
      {
        successCount: data.contentIds?.length || 0,
        failCount: 0
      }
    )
  },

  // 审核内容
  audit(id: number, action: 'approve' | 'reject', reason?: string): Promise<ApiResponse<null>> {
    return apiAdapter.post(
      () => http.post(`/content/${id}/audit`, { action, reason })
    )
  },

  // 置顶内容
  setTop(id: number, isTop: boolean, expiry?: string): Promise<ApiResponse<null>> {
    return apiAdapter.post(
      () => http.post(`/content/${id}/top`, { isTop, expiry })
    )
  },

  // 设置精华
  setElite(id: number, isElite: boolean): Promise<ApiResponse<null>> {
    return apiAdapter.post(
      () => http.post(`/content/${id}/elite`, { isElite })
    )
  },

  // 锁定/解锁内容
  setLock(id: number, isLocked: boolean): Promise<ApiResponse<null>> {
    return apiAdapter.post(
      () => http.post(`/content/${id}/lock`, { isLocked })
    )
  },

  // 移动版块
  moveCategory(contentIds: number[], categoryId: string): Promise<ApiResponse<null>> {
    return apiAdapter.post(
      () => http.post('/content/move-category', { contentIds, categoryId })
    )
  },

  // 获取内容预览
  getPreview(id: number): Promise<ApiResponse<ContentPreview>> {
    return apiAdapter.get(
      () => http.get(`/content/${id}/preview`),
      async () => {
        const allPosts = await import('@/services/staticData/content').then(m => m.posts)
        const post: any = allPosts.find((p: any) => p.id === id)
        if (!post) {
          throw new Error('内容不存在')
        }
        const preview: ContentPreview = {
          id: post.id,
          title: post.title,
          content: post.content,
          type: 'post',
          module: 'forum',
          category: post.category?.name || '默认分类',
          author: post.author,
          status: post.status,
          tags: post.tags || [],
          createdAt: post.createTime,
          updatedAt: post.updateTime || post.createTime
        }
        return preview
      }
    )
  },

  // 获取热门内容
  getHotContents(days: number = 7, limit: number = 10): Promise<ApiResponse<HotContent[]>> {
    return apiAdapter.get(
      () => http.get('/content/hot', { params: { days, limit } }),
      async () => {
        const allPosts = await import('@/services/staticData/content').then(m => m.posts)
        const hotContents: HotContent[] = allPosts.slice(0, limit).map((post: any) => ({
          id: post.id,
          title: post.title,
          type: 'post',
          module: 'forum',
          category: post.category?.name || '默认分类',
          author: post.author,
          viewCount: post.viewCount,
          likeCount: post.likeCount,
          commentCount: post.commentCount,
          score: post.viewCount + post.likeCount * 10 + post.commentCount * 5,
          createdAt: post.createTime
        }))
        return hotContents
      }
    )
  },

  // 获取版块列表
  getCategories(module?: string): Promise<ApiResponse<ContentCategory[]>> {
    return apiAdapter.get(
      () => http.get('/content/categories', { params: { module } }),
      async () => {
        const categories = await import('@/services/staticData/content').then(m => m.categories)
        // 转换为ContentCategory类型
        return categories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          module: 'forum', // 默认模块
          parentId: cat.parentId,
          level: 1, // 默认层级
          sort: cat.sort,
          status: cat.status,
          contentCount: cat.postCount,
          createdAt: cat.createTime,
          updatedAt: cat.updateTime
        })) as ContentCategory[]
      }
    )
  },

  // 导出内容数据
  exportData(params: ContentQueryParams): Promise<ApiResponse<{ downloadUrl: string }>> {
    return apiAdapter.post(
      () => http.post('/content/export', params),
      {
        downloadUrl: '/mock/content_export_' + Date.now() + '.xlsx'
      }
    )
  },

  // ======================== 后台发帖相关接口 ========================

  // 管理员发帖（官方发布）
  createAdminPost(data: AdminPostForm): Promise<ApiResponse<ForumPost>> {
    return apiAdapter.post(
      () => http.post('/forum/admin/posts', data),
      {
        id: Date.now(),
        title: data.title,
        content: data.content,
        type: 'post',
        module: 'forum',
        category: '默认分类',
        author: {
          id: 1,
          username: 'admin',
          name: '管理员',
          email: 'admin@example.com',
          phone: '',
          avatar: '',
          groupId: 1,
          status: 1,
          roles: [],
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString()
        },
        status: 1,
        tags: data.tags || [],
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        isTop: false,
        isElite: false,
        isLocked: false,
        officialFlag: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as ForumPost
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
          id: '1',
          label: '总公司',
          value: '1',
          children: [
            {
              id: '11',
              label: '技术部',
              value: '11',
              children: [
                { id: '111', label: '前端组', value: '111' },
                { id: '112', label: '后端组', value: '112' }
              ]
            },
            {
              id: '12',
              label: '产品部',
              value: '12',
              children: [
                { id: '121', label: '产品设计组', value: '121' },
                { id: '122', label: '用户体验组', value: '122' }
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
      {
        url: '/mock/uploads/' + file.name,
        filename: file.name,
        size: file.size,
        type: file.type
      }
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
      files.map(file => ({
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
      {
        title: data.title,
        contentHtml: data.content,
        categoryPath: '技术讨论 / 前端开发',
        tags: data.tags || [],
        visibleRange: data.visibleRange || ['全体'],
        estimatedReadTime: Math.ceil(data.content.length / 200)
      }
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
      {
        draftId: data.draftId || 'draft_' + Date.now(),
        savedAt: new Date().toISOString()
      }
    )
  },

  // 删除帖子草稿
  deletePostDraft(draftId: string): Promise<ApiResponse<null>> {
    return apiAdapter.delete(
      () => http.delete(`/forum/posts/drafts/${draftId}`)
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
      ['推荐标签1', '推荐标签2', '推荐标签3']
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
      {
        valid: true,
        issues: [],
        processedContent: content
      }
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
      {
        postId: Date.now(),
        scheduledAt: data.publishAt
      }
    )
  },

  // 取消定时发布
  cancelScheduledPost(postId: number): Promise<ApiResponse<null>> {
    return apiAdapter.delete(
      () => http.delete(`/forum/posts/${postId}/schedule`)
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
          status: 'pending' as const
        }
      ]
    )
  }
}

export default contentApi