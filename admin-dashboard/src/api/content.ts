import { http } from './request'
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
    return http.get('/content/stats')
  },

  // 获取内容列表
  getList(params: ContentQueryParams): Promise<ApiResponse<{ list: Content[], total: number }>> {
    return http.get('/content/list', { params })
  },

  // 获取内容详情
  getDetail(id: number): Promise<ApiResponse<Content>> {
    return http.get(`/content/${id}`)
  },

  // 创建内容
  create(data: ContentForm): Promise<ApiResponse<Content>> {
    return http.post('/content', data)
  },

  // 更新内容
  update(id: number, data: Partial<ContentForm>): Promise<ApiResponse<Content>> {
    return http.put(`/content/${id}`, data)
  },

  // 删除内容
  delete(id: number, reason?: string): Promise<ApiResponse<void>> {
    return http.delete(`/content/${id}`, { data: { reason } })
  },

  // 批量操作
  batchOperation(data: BatchContentOperation): Promise<ApiResponse<{ successCount: number, failCount: number }>> {
    return http.post('/content/batch', data)
  },

  // 审核内容
  audit(id: number, action: 'approve' | 'reject', reason?: string): Promise<ApiResponse<void>> {
    return http.post(`/content/${id}/audit`, { action, reason })
  },

  // 置顶内容
  setTop(id: number, isTop: boolean, expiry?: string): Promise<ApiResponse<void>> {
    return http.post(`/content/${id}/top`, { isTop, expiry })
  },

  // 设置精华
  setElite(id: number, isElite: boolean): Promise<ApiResponse<void>> {
    return http.post(`/content/${id}/elite`, { isElite })
  },

  // 锁定/解锁内容
  setLock(id: number, isLocked: boolean): Promise<ApiResponse<void>> {
    return http.post(`/content/${id}/lock`, { isLocked })
  },

  // 移动版块
  moveCategory(contentIds: number[], categoryId: string): Promise<ApiResponse<void>> {
    return http.post('/content/move-category', { contentIds, categoryId })
  },

  // 获取内容预览
  getPreview(id: number): Promise<ApiResponse<ContentPreview>> {
    return http.get(`/content/${id}/preview`)
  },


  // 获取热门内容
  getHotContents(days: number = 7, limit: number = 10): Promise<ApiResponse<HotContent[]>> {
    return http.get('/content/hot', { params: { days, limit } })
  },

  // 获取版块列表
  getCategories(module?: string): Promise<ApiResponse<ContentCategory[]>> {
    return http.get('/content/categories', { params: { module } })
  },

  // 导出内容数据
  exportData(params: ContentQueryParams): Promise<ApiResponse<{ downloadUrl: string }>> {
    return http.post('/content/export', params)
  },

  // 获取内容类型映射
  getTypeMapping(): Promise<ApiResponse<{ [key: string]: { name: string, color: string } }>> {
    return http.get('/content/type-mapping')
  },

  // 获取模块映射
  getModuleMapping(): Promise<ApiResponse<{ [key: string]: { name: string, icon: string } }>> {
    return http.get('/content/module-mapping')
  },

  // 获取状态映射
  getStatusMapping(): Promise<ApiResponse<{ [key: number]: { name: string, color: string } }>> {
    return http.get('/content/status-mapping')
  },

  // ======================== 后台发帖相关接口 ========================

  // 管理员发帖（官方发布）
  createAdminPost(data: AdminPostForm): Promise<ApiResponse<ForumPost>> {
    return http.post('/forum/admin/posts', data)
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
    return http.get('/forum/categories/cascader')
  },

  // 获取组织架构树（用于可见范围选择）
  getOrganizationTree(): Promise<ApiResponse<OrganizationNode[]>> {
    return http.get('/organization/tree')
  },

  // 上传帖子附件
  uploadPostAttachment(file: File): Promise<ApiResponse<{
    url: string
    filename: string
    size: number
    type: string
  }>> {
    const formData = new FormData()
    formData.append('file', file)
    return http.post('/forum/posts/upload-attachment', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
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
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })
    return http.post('/forum/posts/upload-multiple-attachments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // 预览帖子（发布前预览）
  previewPost(data: AdminPostForm): Promise<ApiResponse<{
    title: string
    contentHtml: string
    categoryPath: string
    tags: string[]
    visibleRange: string[]
    estimatedReadTime: number // 分钟
  }>> {
    return http.post('/forum/posts/preview', data)
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
    return http.get('/forum/posts/drafts')
  },

  // 保存帖子草稿
  savePostDraft(data: AdminPostForm & { draftId?: string }): Promise<ApiResponse<{
    draftId: string
    savedAt: string
  }>> {
    return http.post('/forum/posts/save-draft', data)
  },

  // 删除帖子草稿
  deletePostDraft(draftId: string): Promise<ApiResponse<void>> {
    return http.delete(`/forum/posts/drafts/${draftId}`)
  },

  // 从草稿恢复帖子数据
  loadPostFromDraft(draftId: string): Promise<ApiResponse<AdminPostForm>> {
    return http.get(`/forum/posts/drafts/${draftId}/load`)
  },

  // 检查帖子标题是否重复
  checkTitleDuplicate(title: string, excludeId?: number): Promise<ApiResponse<{
    duplicate: boolean
    suggestions?: string[]
  }>> {
    return http.get('/forum/posts/check-title', { 
      params: { title, excludeId } 
    })
  },

  // 获取推荐标签
  getRecommendedTags(content: string, categoryId?: number): Promise<ApiResponse<string[]>> {
    return http.post('/forum/posts/recommend-tags', { content, categoryId })
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
    return http.post('/forum/posts/validate-content', { content })
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
    return http.get('/forum/admin/posts/stats')
  },

  // 设定帖子发布时间（定时发布）
  schedulePost(data: AdminPostForm & {
    publishAt: string
  }): Promise<ApiResponse<{
    postId: number
    scheduledAt: string
  }>> {
    return http.post('/forum/posts/schedule', data)
  },

  // 取消定时发布
  cancelScheduledPost(postId: number): Promise<ApiResponse<void>> {
    return http.delete(`/forum/posts/${postId}/schedule`)
  },

  // 获取定时发布列表
  getScheduledPosts(): Promise<ApiResponse<Array<{
    id: number
    title: string
    categoryPath: string
    scheduledAt: string
    status: 'pending' | 'published' | 'failed'
  }>>> {
    return http.get('/forum/posts/scheduled')
  }
}

export default contentApi