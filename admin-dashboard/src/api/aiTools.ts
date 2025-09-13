import { http } from './request'
import { apiAdapter } from './adapter'
import type {
  AITool,
  AIToolTag,
  AIToolForm,
  AIToolTagForm,
  AIToolQueryParams,
  AIToolTagQueryParams,
  AIToolListResponse,
  AIToolTagListResponse,
  AIToolBatchOperation,
  AIToolStatistics,
  CaseAssociation,
  TagDeleteCheckResult,
  ForumPost,
  ForumPostQueryParams,
  ForumPostListResponse,
  ForumCategory
} from '@/types/aiTools'
import type { ApiResponse } from '@/types'

// 静态数据导入
const staticData = {
  aiTools: () => import('@/services/staticData/aiTools').then(m => m.aiTools),
  aiToolTags: () => import('@/services/staticData/aiTools').then(m => m.aiToolTags),
  aiToolStatistics: () => import('@/services/staticData/aiTools').then(m => m.aiToolStatistics)
}

// ==================== AI工具标签管理 ====================

// 获取标签列表
export function getTagList(params?: AIToolTagQueryParams) {
  return apiAdapter.get<AIToolTagListResponse>(
    () => http.get<AIToolTagListResponse>('/api/ai-tools/tags', params),
    async () => {
      const tags = await staticData.aiToolTags()
      return {
        list: tags,
        total: tags.length
      }
    },
    {
      mockPagination: true,
      paginationParams: params
    }
  )
}

// 获取所有标签（用于下拉选择）
export function getAllTags() {
  return apiAdapter.get<AIToolTag[]>(
    () => http.get<AIToolTag[]>('/api/ai-tools/tags/all'),
    staticData.aiToolTags
  )
}

// 创建标签
export function createTag(data: AIToolTagForm) {
  return apiAdapter.post<AIToolTag>(
    () => http.post<AIToolTag>('/api/ai-tools/tags', data),
    data as unknown as AIToolTag
  )
}

// 更新标签
export function updateTag(id: number, data: AIToolTagForm) {
  return apiAdapter.put<AIToolTag>(
    () => http.put<AIToolTag>(`/api/ai-tools/tags/${id}`, data),
    id,
    data
  )
}

// 删除标签前检查
export function checkTagCanDelete(id: number) {
  return apiAdapter.get<TagDeleteCheckResult>(
    () => http.get<TagDeleteCheckResult>(`/api/ai-tools/tags/${id}/check-delete`),
    async () => ({
      canDelete: true
    })
  )
}

// 删除标签
export function deleteTag(id: number) {
  return apiAdapter.delete(
    () => http.delete<null>(`/api/ai-tools/tags/${id}`)
  )
}

// ==================== AI工具管理 ====================

// 获取工具列表
export function getToolList(params?: AIToolQueryParams) {
  console.log('getToolList called with params:', params)
  console.log('Static mode:', import.meta.env.VITE_STATIC_MODE)
  return apiAdapter.get<AIToolListResponse>(
    () => http.get<AIToolListResponse>('/api/ai-tools', params),
    async () => {
      console.log('Loading static AI tools data...')
      const tools = await staticData.aiTools()
      console.log('Loaded static AI tools:', tools)
      return {
        list: tools,
        total: tools.length
      }
    },
    {
      mockPagination: true,
      paginationParams: params
    }
  )
}

// 获取工具详情
export function getToolDetail(id: number) {
  return apiAdapter.get<AITool>(
    () => http.get<AITool>(`/api/ai-tools/${id}`),
    async () => {
      const tools = await staticData.aiTools()
      const tool = tools.find(t => t.id === id)
      if (!tool) {
        throw new Error('工具不存在')
      }
      return tool
    }
  )
}

// 创建工具
export function createTool(data: AIToolForm) {
  return apiAdapter.post<AITool>(
    () => http.post<AITool>('/api/ai-tools', data),
    data as unknown as AITool
  )
}

// 更新工具
export function updateTool(id: number, data: AIToolForm) {
  return apiAdapter.put<AITool>(
    () => http.put<AITool>(`/api/ai-tools/${id}`, data),
    id,
    data
  )
}

// 删除工具
export function deleteTool(id: number) {
  return apiAdapter.delete(
    () => http.delete<null>(`/api/ai-tools/${id}`)
  )
}

// 切换工具状态
export function toggleToolStatus(id: number, status: 'enabled' | 'disabled') {
  return apiAdapter.action<void>(
    () => http.patch<void>(`/api/ai-tools/${id}/status`, { status }),
    undefined,
    '状态切换成功'
  )
}

// 批量操作工具
export function batchOperateTools(data: AIToolBatchOperation) {
  return apiAdapter.action<void>(
    () => http.post<void>('/api/ai-tools/batch', data),
    undefined,
    '批量操作成功'
  )
}

// ==================== 案例关联管理 ====================

// 获取工具的关联案例
export function getToolCases(toolId: number) {
  return apiAdapter.get<any[]>(
    () => http.get<any[]>(`/api/ai-tools/${toolId}/cases`),
    async () => []
  )
}

// 关联案例
export function associateCase(data: CaseAssociation) {
  return apiAdapter.action<void>(
    () => http.post<void>('/api/ai-tools/cases/associate', data),
    undefined,
    '案例关联成功'
  )
}

// 移除关联案例
export function removeCase(toolId: number, postId: number) {
  return apiAdapter.action<void>(
    () => http.delete<void>(`/api/ai-tools/${toolId}/cases/${postId}`),
    undefined,
    '案例移除成功'
  )
}

// ==================== 论坛帖子搜索（用于案例关联） ====================

// 获取论坛版块列表
export function getForumCategories() {
  return apiAdapter.get<ForumCategory[]>(
    () => http.get<ForumCategory[]>('/api/forum/categories'),
    async () => []
  )
}

// 搜索论坛帖子
export function searchForumPosts(params: ForumPostQueryParams) {
  return apiAdapter.get<ForumPostListResponse>(
    () => http.get<ForumPostListResponse>('/api/forum/posts/search', params),
    async () => ({
      list: [],
      total: 0
    })
  )
}

// ==================== 统计信息 ====================

// 获取AI工具统计信息
export function getToolStatistics() {
  return apiAdapter.get<AIToolStatistics>(
    () => http.get<AIToolStatistics>('/api/ai-tools/statistics'),
    staticData.aiToolStatistics
  )
}

// ==================== 文件上传 ====================

// 上传工具Logo
export function uploadToolLogo(file: File) {
  return apiAdapter.action<{ url: string }>(
    () => http.post<{ url: string }>('/api/ai-tools/upload/logo', { file }),
    { url: '/images/ai-tools/default-logo.png' },
    '上传成功'
  )
}