import { request } from './request'
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

// ==================== AI工具标签管理 ====================

// 获取标签列表
export function getTagList(params?: AIToolTagQueryParams) {
  return request<ApiResponse<AIToolTagListResponse>>({
    url: '/api/ai-tools/tags',
    method: 'get',
    params
  })
}

// 获取所有标签（用于下拉选择）
export function getAllTags() {
  return request<ApiResponse<AIToolTag[]>>({
    url: '/api/ai-tools/tags/all',
    method: 'get'
  })
}

// 创建标签
export function createTag(data: AIToolTagForm) {
  return request<ApiResponse<AIToolTag>>({
    url: '/api/ai-tools/tags',
    method: 'post',
    data
  })
}

// 更新标签
export function updateTag(id: number, data: AIToolTagForm) {
  return request<ApiResponse<AIToolTag>>({
    url: `/api/ai-tools/tags/${id}`,
    method: 'put',
    data
  })
}

// 删除标签前检查
export function checkTagCanDelete(id: number) {
  return request<ApiResponse<TagDeleteCheckResult>>({
    url: `/api/ai-tools/tags/${id}/check-delete`,
    method: 'get'
  })
}

// 删除标签
export function deleteTag(id: number) {
  return request<ApiResponse<void>>({
    url: `/api/ai-tools/tags/${id}`,
    method: 'delete'
  })
}

// ==================== AI工具管理 ====================

// 获取工具列表
export function getToolList(params?: AIToolQueryParams) {
  return request<ApiResponse<AIToolListResponse>>({
    url: '/api/ai-tools',
    method: 'get',
    params
  })
}

// 获取工具详情
export function getToolDetail(id: number) {
  return request<ApiResponse<AITool>>({
    url: `/api/ai-tools/${id}`,
    method: 'get'
  })
}

// 创建工具
export function createTool(data: AIToolForm) {
  return request<ApiResponse<AITool>>({
    url: '/api/ai-tools',
    method: 'post',
    data
  })
}

// 更新工具
export function updateTool(id: number, data: AIToolForm) {
  return request<ApiResponse<AITool>>({
    url: `/api/ai-tools/${id}`,
    method: 'put',
    data
  })
}

// 删除工具
export function deleteTool(id: number) {
  return request<ApiResponse<void>>({
    url: `/api/ai-tools/${id}`,
    method: 'delete'
  })
}

// 切换工具状态
export function toggleToolStatus(id: number, status: 'enabled' | 'disabled') {
  return request<ApiResponse<void>>({
    url: `/api/ai-tools/${id}/status`,
    method: 'patch',
    data: { status }
  })
}

// 批量操作工具
export function batchOperateTools(data: AIToolBatchOperation) {
  return request<ApiResponse<void>>({
    url: '/api/ai-tools/batch',
    method: 'post',
    data
  })
}

// ==================== 案例关联管理 ====================

// 获取工具的关联案例
export function getToolCases(toolId: number) {
  return request<ApiResponse<any[]>>({
    url: `/api/ai-tools/${toolId}/cases`,
    method: 'get'
  })
}

// 关联案例
export function associateCase(data: CaseAssociation) {
  return request<ApiResponse<void>>({
    url: '/api/ai-tools/cases/associate',
    method: 'post',
    data
  })
}

// 移除关联案例
export function removeCase(toolId: number, postId: number) {
  return request<ApiResponse<void>>({
    url: `/api/ai-tools/${toolId}/cases/${postId}`,
    method: 'delete'
  })
}

// ==================== 论坛帖子搜索（用于案例关联） ====================

// 获取论坛版块列表
export function getForumCategories() {
  return request<ApiResponse<ForumCategory[]>>({
    url: '/api/forum/categories',
    method: 'get'
  })
}

// 搜索论坛帖子
export function searchForumPosts(params: ForumPostQueryParams) {
  return request<ApiResponse<ForumPostListResponse>>({
    url: '/api/forum/posts/search',
    method: 'get',
    params
  })
}

// ==================== 统计信息 ====================

// 获取AI工具统计信息
export function getToolStatistics() {
  return request<ApiResponse<AIToolStatistics>>({
    url: '/api/ai-tools/statistics',
    method: 'get'
  })
}

// ==================== 文件上传 ====================

// 上传工具Logo
export function uploadToolLogo(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  
  return request<ApiResponse<{ url: string }>>({
    url: '/api/ai-tools/upload/logo',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}