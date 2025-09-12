import type { PaginationParams } from './index'

// AI工具标签接口
export interface AIToolTag {
  id: number
  name: string
  createTime: string
  updateTime?: string
  // 统计信息
  toolCount?: number // 使用该标签的工具数量
}

// AI工具状态枚举
export type AIToolStatus = 'enabled' | 'disabled'

// AI工具接口
export interface AITool {
  id: number
  logo: string
  name: string
  tagId: number
  tag?: AIToolTag
  description: string
  url: string
  status: AIToolStatus
  creatorId: number
  creator?: string
  createTime: string
  updateTime?: string
  // 关联案例
  cases?: AIToolCase[]
  caseCount?: number
}

// AI工具关联案例接口
export interface AIToolCase {
  id: number
  toolId: number
  postId: number
  postTitle: string
  createTime: string
}

// AI工具表单接口
export interface AIToolForm {
  id?: number
  logo: string
  name: string
  tagId: number
  description: string
  url: string
  status: AIToolStatus
}

// AI工具标签表单接口
export interface AIToolTagForm {
  id?: number
  name: string
}

// AI工具查询参数
export interface AIToolQueryParams extends PaginationParams {
  keyword?: string
  tagId?: number
  status?: AIToolStatus
  creatorId?: number
  startTime?: string
  endTime?: string
}

// AI工具标签查询参数
export interface AIToolTagQueryParams extends PaginationParams {
  keyword?: string
}

// 论坛帖子搜索结果（用于关联案例）
export interface ForumPost {
  id: number
  title: string
  author: string
  createTime: string
  categoryName?: string
  viewCount?: number
  likeCount?: number
}

// 论坛帖子查询参数
export interface ForumPostQueryParams extends PaginationParams {
  keyword?: string
  categoryId?: number
  authorId?: number
}

// 论坛版块接口（用于案例搜索）
export interface ForumCategory {
  id: number
  name: string
  parentId?: number
  level: number
  children?: ForumCategory[]
}

// 批量操作接口
export interface AIToolBatchOperation {
  toolIds: number[]
  operation: 'enable' | 'disable' | 'delete'
  params?: {
    reason?: string
  }
}

// AI工具统计数据接口
export interface AIToolStatistics {
  totalTools: number
  enabledTools: number
  disabledTools: number
  totalTags: number
  todayNewTools: number
  weeklyNewTools: number
  monthlyNewTools: number
  popularTags: {
    tagId: number
    tagName: string
    toolCount: number
  }[]
  recentTools: AITool[]
}

// 案例关联操作接口
export interface CaseAssociation {
  toolId: number
  postId: number
  postTitle: string
}

// API响应接口
export interface AIToolListResponse {
  list: AITool[]
  total: number
}

export interface AIToolTagListResponse {
  list: AIToolTag[]
  total: number
}

export interface ForumPostListResponse {
  list: ForumPost[]
  total: number
}

// 删除前检查结果
export interface TagDeleteCheckResult {
  canDelete: boolean
  usedByTools?: AITool[]
  message?: string
}