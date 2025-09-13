import { http } from './request'
import { apiAdapter } from './adapter'
import { fleaMarket } from '@/services/staticData'
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
  return apiAdapter.get(
    () => http.get('/flea-market/goods', { params }),
    async () => {
      const data = await fleaMarket()
      return { list: data, total: data.length }
    },
    { mockPagination: true, paginationParams: params }
  )
}

/**
 * 获取商品详情
 */
export function getGoodsDetail(id: number): Promise<ApiResponse<FleaGoodsDetail>> {
  return apiAdapter.get(
    () => http.get(`/flea-market/goods/${id}`),
    async () => {
      const data = await fleaMarket()
      const goods = data.find(g => g.id === id)
      if (!goods) {
        throw new Error('商品不存在')
      }
      return goods
    }
  )
}

/**
 * 创建商品
 */
export function createGoods(data: FleaGoodsForm): Promise<ApiResponse<FleaGoods>> {
  return apiAdapter.post(
    () => http.post('/flea-market/goods', data),
    async () => ({
      id: Date.now(),
      title: data.title,
      description: data.description,
      price: data.price,
      category: data.category,
      images: data.images || [],
      status: 'draft',
      seller: {
        id: 1,
        username: 'admin',
        name: '管理员',
        avatar: ''
      },
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      viewCount: 0,
      favoriteCount: 0
    })
  )
}

/**
 * 更新商品
 */
export function updateGoods(id: number, data: FleaGoodsForm): Promise<ApiResponse<FleaGoods>> {
  return apiAdapter.put(
    () => http.put(`/flea-market/goods/${id}`, data),
    async () => {
      const allGoods = await fleaMarket()
      const goods = allGoods.find(g => g.id === id)
      if (!goods) {
        throw new Error('商品不存在')
      }
      return {
        ...goods,
        ...data,
        updateTime: new Date().toISOString()
      }
    }
  )
}

/**
 * 删除商品
 */
export function deleteGoods(id: number): Promise<ApiResponse<void>> {
  return apiAdapter.delete(
    () => http.delete(`/flea-market/goods/${id}`),
    async () => undefined
  )
}

/**
 * 批量操作商品
 */
export function batchOperateGoods(data: FleaGoodsBatchOperation): Promise<ApiResponse<void>> {
  return apiAdapter.post(
    () => http.post('/flea-market/goods/batch', data),
    async () => undefined
  )
}

/**
 * 审核商品（通过）
 */
export function approveGoods(id: number, remark?: string): Promise<ApiResponse<void>> {
  return apiAdapter.post(
    () => http.post(`/flea-market/goods/${id}/approve`, { remark }),
    async () => undefined
  )
}

/**
 * 审核商品（拒绝）
 */
export function rejectGoods(id: number, reason: string): Promise<ApiResponse<void>> {
  return apiAdapter.post(
    () => http.post(`/flea-market/goods/${id}/reject`, { reason }),
    async () => undefined
  )
}

/**
 * 上架商品
 */
export function publishGoods(id: number): Promise<ApiResponse<void>> {
  return apiAdapter.post(
    () => http.post(`/flea-market/goods/${id}/publish`),
    async () => undefined
  )
}

/**
 * 下架商品
 */
export function offlineGoods(id: number, reason?: string): Promise<ApiResponse<void>> {
  return apiAdapter.post(
    () => http.post(`/flea-market/goods/${id}/offline`, { reason }),
    async () => undefined
  )
}

/**
 * 标记商品为已售出
 */
export function markGoodsAsSold(id: number): Promise<ApiResponse<void>> {
  return apiAdapter.post(
    () => http.post(`/flea-market/goods/${id}/sold`),
    async () => undefined
  )
}

/**
 * 获取用户的商品统计
 */
export function getUserGoodsStats(userId: number): Promise<ApiResponse<UserGoodsStats>> {
  return apiAdapter.get(
    () => http.get(`/flea-market/users/${userId}/goods-stats`),
    async () => ({
      totalGoods: 25,
      onSaleGoods: 15,
      soldGoods: 8,
      draftGoods: 2,
      totalViews: 1250,
      totalFavorites: 89,
      totalSales: 12600
    })
  )
}

// ======================== 分类管理相关API ========================

/**
 * 获取分类列表
 */
export function getCategoryList(params?: FleaCategoryQueryParams): Promise<ApiResponse<FleaCategory[]>> {
  return apiAdapter.get(
    () => http.get('/flea-market/categories', { params }),
    async () => [
      { id: 1, name: '数码电子', code: 'digital', icon: 'Smartphone', sort: 1, status: 'active', createTime: new Date().toISOString() },
      { id: 2, name: '生活用品', code: 'daily', icon: 'House', sort: 2, status: 'active', createTime: new Date().toISOString() },
      { id: 3, name: '图书文具', code: 'books', icon: 'Reading', sort: 3, status: 'active', createTime: new Date().toISOString() },
      { id: 4, name: '服装配饰', code: 'clothing', icon: 'Handbag', sort: 4, status: 'active', createTime: new Date().toISOString() }
    ]
  )
}

/**
 * 获取分类详情
 */
export function getCategoryDetail(id: number): Promise<ApiResponse<FleaCategory>> {
  return apiAdapter.get(
    () => http.get(`/flea-market/categories/${id}`),
    async () => {
      const categories = [
        { id: 1, name: '数码电子', code: 'digital', icon: 'Smartphone', sort: 1, status: 'active', createTime: new Date().toISOString() },
        { id: 2, name: '生活用品', code: 'daily', icon: 'House', sort: 2, status: 'active', createTime: new Date().toISOString() },
        { id: 3, name: '图书文具', code: 'books', icon: 'Reading', sort: 3, status: 'active', createTime: new Date().toISOString() },
        { id: 4, name: '服装配饰', code: 'clothing', icon: 'Handbag', sort: 4, status: 'active', createTime: new Date().toISOString() }
      ]
      const category = categories.find(c => c.id === id)
      if (!category) {
        throw new Error('分类不存在')
      }
      return category
    }
  )
}

/**
 * 创建分类
 */
export function createCategory(data: Omit<FleaCategory, 'id' | 'createTime'>): Promise<ApiResponse<FleaCategory>> {
  return apiAdapter.post(
    () => http.post('/flea-market/categories', data),
    async () => ({
      id: Date.now(),
      ...data,
      createTime: new Date().toISOString()
    })
  )
}

/**
 * 更新分类
 */
export function updateCategory(id: number, data: Omit<FleaCategory, 'id' | 'createTime'>): Promise<ApiResponse<FleaCategory>> {
  return apiAdapter.put(
    () => http.put(`/flea-market/categories/${id}`, data),
    async () => ({
      id,
      ...data,
      createTime: new Date().toISOString()
    })
  )
}

/**
 * 删除分类
 */
export function deleteCategory(id: number): Promise<ApiResponse<void>> {
  return apiAdapter.delete(
    () => http.delete(`/flea-market/categories/${id}`),
    async () => undefined
  )
}

// ======================== 举报管理相关API ========================

/**
 * 获取举报列表
 */
export function getReportList(params: FleaReportQueryParams): Promise<ApiResponse<{
  list: FleaReport[]
  total: number
}>> {
  return apiAdapter.get(
    () => http.get('/flea-market/reports', { params }),
    async () => ({
      list: [
        {
          id: 1,
          targetType: 'goods',
          targetId: 1,
          targetTitle: '二手iPhone',
          reporter: { id: 2, name: '举报用户', avatar: '' },
          reason: '虚假信息',
          description: '商品描述与实际不符',
          status: 'pending',
          createTime: new Date().toISOString()
        }
      ],
      total: 1
    }),
    { mockPagination: true, paginationParams: params }
  )
}

/**
 * 获取举报详情
 */
export function getReportDetail(id: number): Promise<ApiResponse<FleaReport>> {
  return apiAdapter.get(
    () => http.get(`/flea-market/reports/${id}`),
    async () => ({
      id,
      targetType: 'goods',
      targetId: 1,
      targetTitle: '二手iPhone',
      reporter: { id: 2, name: '举报用户', avatar: '' },
      reason: '虚假信息',
      description: '商品描述与实际不符',
      status: 'pending',
      createTime: new Date().toISOString()
    })
  )
}

/**
 * 创建举报
 */
export function createReport(data: {
  targetType: 'goods' | 'chat'
  targetId: number
  reason: string
}): Promise<ApiResponse<FleaReport>> {
  return apiAdapter.post(
    () => http.post('/flea-market/reports', data),
    async () => ({
      id: Date.now(),
      targetType: data.targetType,
      targetId: data.targetId,
      targetTitle: '举报目标',
      reporter: { id: 1, name: '当前用户', avatar: '' },
      reason: data.reason,
      description: '',
      status: 'pending',
      createTime: new Date().toISOString()
    })
  )
}

/**
 * 处理举报
 */
export function handleReport(id: number, data: {
  handleRemark: string
  action: 'dismiss' | 'warn' | 'ban' | 'remove'
}): Promise<ApiResponse<void>> {
  return apiAdapter.post(
    () => http.post(`/flea-market/reports/${id}/handle`, data),
    async () => undefined
  )
}

// ======================== 聊天相关API ========================

/**
 * 获取聊天会话列表
 */
export function getChatSessionList(params: FleaChatSessionQueryParams): Promise<ApiResponse<{
  list: FleaChatSession[]
  total: number
}>> {
  return apiAdapter.get(
    () => http.get('/flea-market/chat/sessions', { params }),
    async () => ({
      list: [
        {
          id: 1,
          goodsId: 1,
          goodsTitle: '二手iPhone',
          seller: { id: 1, name: '卖家', avatar: '' },
          buyer: { id: 2, name: '买家', avatar: '' },
          lastMessage: '这个还能优惠吗？',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 2,
          status: 'active',
          createTime: new Date().toISOString()
        }
      ],
      total: 1
    }),
    { mockPagination: true, paginationParams: params }
  )
}

/**
 * 获取聊天会话详情
 */
export function getChatSessionDetail(id: number): Promise<ApiResponse<FleaChatSession>> {
  return apiAdapter.get(
    () => http.get(`/flea-market/chat/sessions/${id}`),
    async () => ({
      id,
      goodsId: 1,
      goodsTitle: '二手iPhone',
      seller: { id: 1, name: '卖家', avatar: '' },
      buyer: { id: 2, name: '买家', avatar: '' },
      lastMessage: '这个还能优惠吗？',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 2,
      status: 'active',
      createTime: new Date().toISOString()
    })
  )
}

/**
 * 创建聊天会话
 */
export function createChatSession(data: {
  goodsId: number
  buyerId: number
}): Promise<ApiResponse<FleaChatSession>> {
  return apiAdapter.post(
    () => http.post('/flea-market/chat/sessions', data),
    async () => ({
      id: Date.now(),
      goodsId: data.goodsId,
      goodsTitle: '商品标题',
      seller: { id: 1, name: '卖家', avatar: '' },
      buyer: { id: data.buyerId, name: '买家', avatar: '' },
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      status: 'active',
      createTime: new Date().toISOString()
    })
  )
}

/**
 * 获取聊天消息列表
 */
export function getChatMessages(sessionId: number, params?: PaginationParams): Promise<ApiResponse<{
  list: FleaChatMessage[]
  total: number
}>> {
  return apiAdapter.get(
    () => http.get(`/flea-market/chat/sessions/${sessionId}/messages`, { params }),
    async () => ({
      list: [
        {
          id: 1,
          sessionId,
          senderId: 1,
          senderName: '卖家',
          content: '您好，这个商品还在吗？',
          messageType: 'text',
          sendTime: new Date().toISOString()
        },
        {
          id: 2,
          sessionId,
          senderId: 2,
          senderName: '买家',
          content: '在的，请问有什么问题吗？',
          messageType: 'text',
          sendTime: new Date().toISOString()
        }
      ],
      total: 2
    }),
    { mockPagination: true, paginationParams: params }
  )
}

/**
 * 发送聊天消息
 */
export function sendChatMessage(sessionId: number, data: {
  content: string
}): Promise<ApiResponse<FleaChatMessage>> {
  return apiAdapter.post(
    () => http.post(`/flea-market/chat/sessions/${sessionId}/messages`, data),
    async () => ({
      id: Date.now(),
      sessionId,
      senderId: 1,
      senderName: '当前用户',
      content: data.content,
      messageType: 'text',
      sendTime: new Date().toISOString()
    })
  )
}

// ======================== 统计数据相关API ========================

/**
 * 获取跳蚤市场统计数据
 */
export function getFleaMarketStatistics(): Promise<ApiResponse<FleaMarketStatistics>> {
  return apiAdapter.get(
    () => http.get('/flea-market/statistics'),
    async () => ({
      totalGoods: 1286,
      onSaleGoods: 456,
      soldGoods: 789,
      draftGoods: 41,
      totalUsers: 2345,
      activeUsers: 1567,
      totalTransactions: 892,
      totalTransactionAmount: 156789,
      todayNewGoods: 23,
      todayTransactions: 15,
      popularCategories: [
        { categoryId: 1, categoryName: '数码电子', count: 456 },
        { categoryId: 2, categoryName: '生活用品', count: 234 },
        { categoryId: 3, categoryName: '图书文具', count: 189 }
      ]
    })
  )
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
  return apiAdapter.get(
    () => http.get('/flea-market/statistics/view-trend', { params }),
    async () => {
      const days = 7
      const data = []
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        data.push({
          date: date.toISOString().split('T')[0],
          views: Math.floor(Math.random() * 500) + 100,
          goods: Math.floor(Math.random() * 50) + 10
        })
      }
      return data
    }
  )
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
  return apiAdapter.get(
    () => http.get('/flea-market/statistics/popular-categories', { 
      params: { limit } 
    }),
    async () => [
      { categoryId: 1, categoryName: '数码电子', count: 456, percentage: 35.5 },
      { categoryId: 2, categoryName: '生活用品', count: 234, percentage: 18.2 },
      { categoryId: 3, categoryName: '图书文具', count: 189, percentage: 14.7 },
      { categoryId: 4, categoryName: '服装配饰', count: 156, percentage: 12.1 }
    ].slice(0, limit || 10)
  )
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
  return apiAdapter.get(
    () => http.get('/flea-market/statistics/user-activity', { params }),
    async () => {
      const days = 7
      const data = []
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        data.push({
          date: date.toISOString().split('T')[0],
          activeUsers: Math.floor(Math.random() * 200) + 50,
          newUsers: Math.floor(Math.random() * 20) + 5,
          transactions: Math.floor(Math.random() * 30) + 10
        })
      }
      return data
    }
  )
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
  return apiAdapter.post(
    () => {
      const formData = new FormData()
      formData.append('file', file)
      
      return http.post('/flea-market/upload/goods-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    },
    async () => ({
      url: '/mock/flea-market/images/' + file.name,
      name: file.name,
      size: file.size
    })
  )
}

/**
 * 批量上传商品图片
 */
export function uploadGoodsImages(files: File[]): Promise<ApiResponse<{
  url: string
  name: string
  size: number
}[]>> {
  return apiAdapter.post(
    () => {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })
      
      return http.post('/flea-market/upload/goods-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    },
    async () => files.map(file => ({
      url: '/mock/flea-market/images/' + file.name,
      name: file.name,
      size: file.size
    }))
  )
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