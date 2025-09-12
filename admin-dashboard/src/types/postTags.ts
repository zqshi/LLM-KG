/**
 * 帖子标签相关类型定义
 */

// 标签基础信息
export interface PostTag {
  id: number
  name: string
  code: string
  description?: string
  color: string
  isActive: boolean
  sortOrder: number
  postCount: number
  categoryId?: number
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

// 创建标签表单
export interface CreateTagForm {
  name: string
  code: string
  description?: string
  color: string
  isActive: boolean
  sortOrder: number
  categoryId?: number
}

// 更新标签表单
export interface UpdateTagForm extends Partial<CreateTagForm> {
  id: number
}

// 标签查询参数
export interface TagQueryParams {
  page?: number
  pageSize?: number
  keyword?: string
  isActive?: boolean
  categoryId?: number
  sortBy?: 'name' | 'sortOrder' | 'postCount' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

// 标签列表响应
export interface TagListResponse {
  list: PostTag[]
  total: number
  page: number
  pageSize: number
}

// 标签统计信息
export interface TagStats {
  total: number
  active: number
  inactive: number
  totalPosts: number
}

// 标签颜色选项
export interface TagColorOption {
  label: string
  value: string
  color: string
}

// 批量操作参数
export interface BatchOperationParams {
  ids: number[]
  operation: 'delete' | 'activate' | 'deactivate' | 'updateCategory'
  categoryId?: number
}

// API响应基础类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}