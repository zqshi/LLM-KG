import { http } from './request'
import type { 
  ApiResponse, 
  PaginationParams,
  FleaGoods,
  FleaGoodsForm,
  FleaGoodsQueryParams,
  FleaGoodsDetail,
  FleaGoodsBatchOperation,
  FleaCategory,
  FleaCategoryQueryParams,
  FleaReport,
  FleaReportQueryParams,
  FleaChatSession,
  FleaChatMessage,
  FleaChatSessionQueryParams,
  FleaMarketStatistics,
  UserGoodsStats
} from '@/types'

// ======================== 商品管理相关API ========================

/**
 * 获取商品列表
 */
export function getGoodsList(params: FleaGoodsQueryParams): Promise<ApiResponse<{
  list: FleaGoods[]
  total: number
}>> {
  return http.get('/api/flea-market/goods', { params })
}

/**
 * 获取商品详情
 */
export function getGoodsDetail(id: number): Promise<ApiResponse<FleaGoodsDetail>> {
  return http.get(`/api/flea-market/goods/${id}`)
}

/**
 * 创建商品
 */
export function createGoods(data: FleaGoodsForm): Promise<ApiResponse<FleaGoods>> {
  return http.post('/api/flea-market/goods', data)
}

/**
 * 更新商品
 */
export function updateGoods(id: number, data: FleaGoodsForm): Promise<ApiResponse<FleaGoods>> {
  return http.put(`/api/flea-market/goods/${id}`, data)
}

/**
 * 删除商品
 */
export function deleteGoods(id: number): Promise<ApiResponse<void>> {
  return http.delete(`/api/flea-market/goods/${id}`)
}

/**
 * 批量操作商品
 */
export function batchOperateGoods(data: FleaGoodsBatchOperation): Promise<ApiResponse<void>> {
  return http.post('/api/flea-market/goods/batch', data)
}

/**
 * 审核商品（通过）
 */
export function approveGoods(id: number, remark?: string): Promise<ApiResponse<void>> {
  return http.post(`/api/flea-market/goods/${id}/approve`, { remark })
}

/**
 * 审核商品（拒绝）
 */
export function rejectGoods(id: number, reason: string): Promise<ApiResponse<void>> {
  return http.post(`/api/flea-market/goods/${id}/reject`, { reason })
}

/**
 * 上架商品
 */
export function publishGoods(id: number): Promise<ApiResponse<void>> {
  return http.post(`/api/flea-market/goods/${id}/publish`)
}

/**
 * 下架商品
 */
export function offlineGoods(id: number, reason?: string): Promise<ApiResponse<void>> {
  return http.post(`/api/flea-market/goods/${id}/offline`, { reason })
}

/**
 * 标记商品为已售出
 */
export function markGoodsAsSold(id: number): Promise<ApiResponse<void>> {
  return http.post(`/api/flea-market/goods/${id}/sold`)
}

/**
 * 获取用户的商品统计
 */
export function getUserGoodsStats(userId: number): Promise<ApiResponse<UserGoodsStats>> {
  return http.get(`/api/flea-market/users/${userId}/goods-stats`)
}

// ======================== 分类管理相关API ========================

/**
 * 获取分类列表
 */
export function getCategoryList(params?: FleaCategoryQueryParams): Promise<ApiResponse<FleaCategory[]>> {
  return http.get('/api/flea-market/categories', { params })
}

/**
 * 获取分类详情
 */
export function getCategoryDetail(id: number): Promise<ApiResponse<FleaCategory>> {
  return http.get(`/api/flea-market/categories/${id}`)
}

/**
 * 创建分类
 */
export function createCategory(data: Omit<FleaCategory, 'id' | 'createTime'>): Promise<ApiResponse<FleaCategory>> {
  return http.post('/api/flea-market/categories', data)
}

/**
 * 更新分类
 */
export function updateCategory(id: number, data: Omit<FleaCategory, 'id' | 'createTime'>): Promise<ApiResponse<FleaCategory>> {
  return http.put(`/api/flea-market/categories/${id}`, data)
}

/**
 * 删除分类
 */
export function deleteCategory(id: number): Promise<ApiResponse<void>> {
  return http.delete(`/api/flea-market/categories/${id}`)
}

// ======================== 举报管理相关API ========================

/**
 * 获取举报列表
 */
export function getReportList(params: FleaReportQueryParams): Promise<ApiResponse<{
  list: FleaReport[]
  total: number
}>> {
  return http.get('/api/flea-market/reports', { params })
}

/**
 * 获取举报详情
 */
export function getReportDetail(id: number): Promise<ApiResponse<FleaReport>> {
  return http.get(`/api/flea-market/reports/${id}`)
}

/**
 * 创建举报
 */
export function createReport(data: {
  targetType: 'goods' | 'chat'
  targetId: number
  reason: string
}): Promise<ApiResponse<FleaReport>> {
  return http.post('/api/flea-market/reports', data)
}

/**
 * 处理举报
 */
export function handleReport(id: number, data: {
  handleRemark: string
  action: 'dismiss' | 'warn' | 'ban' | 'remove'
}): Promise<ApiResponse<void>> {
  return http.post(`/api/flea-market/reports/${id}/handle`, data)
}

// ======================== 聊天相关API ========================

/**
 * 获取聊天会话列表
 */
export function getChatSessionList(params: FleaChatSessionQueryParams): Promise<ApiResponse<{
  list: FleaChatSession[]
  total: number
}>> {
  return http.get('/api/flea-market/chat/sessions', { params })
}

/**
 * 获取聊天会话详情
 */
export function getChatSessionDetail(id: number): Promise<ApiResponse<FleaChatSession>> {
  return http.get(`/api/flea-market/chat/sessions/${id}`)
}

/**
 * 创建聊天会话
 */
export function createChatSession(data: {
  goodsId: number
  buyerId: number
}): Promise<ApiResponse<FleaChatSession>> {
  return http.post('/api/flea-market/chat/sessions', data)
}

/**
 * 获取聊天消息列表
 */
export function getChatMessages(sessionId: number, params?: PaginationParams): Promise<ApiResponse<{
  list: FleaChatMessage[]
  total: number
}>> {
  return http.get(`/api/flea-market/chat/sessions/${sessionId}/messages`, { params })
}

/**
 * 发送聊天消息
 */
export function sendChatMessage(sessionId: number, data: {
  content: string
}): Promise<ApiResponse<FleaChatMessage>> {
  return http.post(`/api/flea-market/chat/sessions/${sessionId}/messages`, data)
}

// ======================== 统计数据相关API ========================

/**
 * 获取跳蚤市场统计数据
 */
export function getFleaMarketStatistics(): Promise<ApiResponse<FleaMarketStatistics>> {
  return http.get('/api/flea-market/statistics')
}

/**
 * 获取商品浏览趋势
 */
export function getGoodsViewTrend(params?: {
  startDate?: string
  endDate?: string
  interval?: 'day' | 'week' | 'month'
}): Promise<ApiResponse<{
  date: string
  views: number
  goods: number
}[]>> {
  return http.get('/api/flea-market/statistics/view-trend', { params })
}

/**
 * 获取热门分类统计
 */
export function getPopularCategories(limit?: number): Promise<ApiResponse<{
  categoryId: number
  categoryName: string
  count: number
  percentage: number
}[]>> {
  return http.get('/api/flea-market/statistics/popular-categories', { 
    params: { limit } 
  })
}

/**
 * 获取用户活跃度统计
 */
export function getUserActivityStats(params?: {
  startDate?: string
  endDate?: string
}): Promise<ApiResponse<{
  date: string
  activeUsers: number
  newUsers: number
  transactions: number
}[]>> {
  return http.get('/api/flea-market/statistics/user-activity', { params })
}

// ======================== 文件上传相关API ========================

/**
 * 上传商品图片
 */
export function uploadGoodsImage(file: File): Promise<ApiResponse<{
  url: string
  name: string
  size: number
}>> {
  const formData = new FormData()
  formData.append('file', file)
  
  return http.post('/api/flea-market/upload/goods-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 批量上传商品图片
 */
export function uploadGoodsImages(files: File[]): Promise<ApiResponse<{
  url: string
  name: string
  size: number
}[]>> {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })
  
  return http.post('/api/flea-market/upload/goods-images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// ======================== 导出API对象 ========================

export const fleaMarketApi = {
  // 商品管理
  goods: {
    list: getGoodsList,
    detail: getGoodsDetail,
    create: createGoods,
    update: updateGoods,
    delete: deleteGoods,
    batchOperate: batchOperateGoods,
    approve: approveGoods,
    reject: rejectGoods,
    publish: publishGoods,
    offline: offlineGoods,
    markAsSold: markGoodsAsSold,
    getUserStats: getUserGoodsStats,
  },
  
  // 分类管理
  categories: {
    list: getCategoryList,
    detail: getCategoryDetail,
    create: createCategory,
    update: updateCategory,
    delete: deleteCategory,
  },
  
  // 举报管理
  reports: {
    list: getReportList,
    detail: getReportDetail,
    create: createReport,
    handle: handleReport,
  },
  
  // 聊天功能
  chat: {
    sessions: {
      list: getChatSessionList,
      detail: getChatSessionDetail,
      create: createChatSession,
    },
    messages: {
      list: getChatMessages,
      send: sendChatMessage,
    }
  },
  
  // 统计数据
  statistics: {
    overview: getFleaMarketStatistics,
    viewTrend: getGoodsViewTrend,
    popularCategories: getPopularCategories,
    userActivity: getUserActivityStats,
  },
  
  // 文件上传
  upload: {
    goodsImage: uploadGoodsImage,
    goodsImages: uploadGoodsImages,
  }
}

export default fleaMarketApi