import { http } from './request'
import { apiAdapter } from './adapter'
import { fleaMarket } from '@/services/staticData/other'

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
      // 转换静态数据以匹配FleaGoods类型
      const goodsList: any[] = fleaMarket.goods.map((item: any) => ({
        ...item,
        condition: 'almost_new',
        transactionMethod: 'self_pickup',
        sellerId: item.seller.id,
        likeCount: item.favoriteCount || 0,
        updateTime: item.createTime,
        status: item.status === 1 ? 'published' : 'offline'
      }))
      return { list: goodsList, total: goodsList.length }
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
      const goods = fleaMarket.goods.find((g: any) => g.id === id)
      if (!goods) {
        throw new Error('商品不存在')
      }
      // 转换静态数据以匹配FleaGoodsDetail类型
      const goodsDetail: any = {
        ...goods,
        condition: 'almost_new',
        transactionMethod: 'self_pickup',
        sellerId: goods.seller.id,
        likeCount: goods.favoriteCount || 0,
        updateTime: goods.createTime,
        status: goods.status === 1 ? 'published' : 'offline'
      }
      return goodsDetail
    }
  )
}

/**
 * 创建商品
 */
export function createGoods(data: FleaGoodsForm): Promise<ApiResponse<FleaGoods>> {
  return apiAdapter.post<FleaGoods>(
    () => http.post('/flea-market/goods', data),
    undefined,
    '创建成功'
  )
}

/**
 * 更新商品
 */
export function updateGoods(id: number, data: FleaGoodsForm): Promise<ApiResponse<FleaGoods>> {
  return apiAdapter.put(
    () => http.put(`/flea-market/goods/${id}`, data),
    id,
    {
      ...data,
      updateTime: new Date().toISOString()
    } as unknown as Partial<FleaGoods>
  )
}

/**
 * 删除商品
 */
export function deleteGoods(id: number): Promise<ApiResponse<null>> {
  return apiAdapter.action<null>(
    () => http.delete(`/flea-market/goods/${id}`),
    null,
    '删除成功'
  )
}

/**
 * 批量操作商品
 */
export function batchOperateGoods(data: FleaGoodsBatchOperation): Promise<ApiResponse<null>> {
  return apiAdapter.action<null>(
    () => http.post('/flea-market/goods/batch', data),
    null,
    '批量操作成功'
  )
}

/**
 * 审核商品（通过）
 */
export function approveGoods(id: number, remark?: string): Promise<ApiResponse<null>> {
  return apiAdapter.action<null>(
    () => http.post(`/flea-market/goods/${id}/approve`, { remark }),
    null,
    '审核通过成功'
  )
}

/**
 * 审核商品（拒绝）
 */
export function rejectGoods(id: number, reason: string): Promise<ApiResponse<null>> {
  return apiAdapter.action<null>(
    () => http.post(`/flea-market/goods/${id}/reject`, { reason }),
    null,
    '审核拒绝成功'
  )
}

/**
 * 上架商品
 */
export function publishGoods(id: number): Promise<ApiResponse<null>> {
  return apiAdapter.action<null>(
    () => http.post(`/flea-market/goods/${id}/publish`),
    null,
    '上架成功'
  )
}

/**
 * 下架商品
 */
export function offlineGoods(id: number, reason?: string): Promise<ApiResponse<null>> {
  return apiAdapter.action<null>(
    () => http.post(`/flea-market/goods/${id}/offline`, { reason }),
    null,
    '下架成功'
  )
}

/**
 * 标记商品为已售出
 */
export function markGoodsAsSold(id: number): Promise<ApiResponse<null>> {
  return apiAdapter.action<null>(
    () => http.post(`/flea-market/goods/${id}/sold`),
    null,
    '标记已售出成功'
  )
}

/**
 * 获取用户的商品统计
 */
export function getUserGoodsStats(userId: number): Promise<ApiResponse<UserGoodsStats>> {
  return apiAdapter.get(
    () => http.get(`/flea-market/users/${userId}/goods-stats`),
    async () => ({
      published: 15,
      sold: 8,
      offline: 2,
      underReview: 0,
      totalViews: 1250,
      totalLikes: 89
    } as UserGoodsStats)
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
    {
      id: Date.now(),
      ...data,
      createTime: new Date().toISOString()
    } as FleaCategory
  )
}

/**
 * 更新分类
 */
export function updateCategory(id: number, data: Omit<FleaCategory, 'id' | 'createTime'>): Promise<ApiResponse<FleaCategory>> {
  return apiAdapter.put(
    () => http.put(`/flea-market/categories/${id}`, data),
    id,
    {
      id,
      ...data,
      createTime: new Date().toISOString()
    } as FleaCategory
  )
}

/**
 * 删除分类
 */
export function deleteCategory(id: number): Promise<ApiResponse<null>> {
  return apiAdapter.delete(
    () => http.delete(`/flea-market/categories/${id}`)
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
          reporterId: 2,
          reporter: { id: 2, name: '举报用户', avatar: '' },
          reason: '虚假信息',
          status: 'pending',
          createTime: new Date().toISOString()
        }
      ],
      total: 1
    } as { list: FleaReport[]; total: number }),
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
      reporterId: 2,
      reporter: { id: 2, name: '举报用户', avatar: '' },
      reason: '虚假信息',
      status: 'pending',
      createTime: new Date().toISOString()
    } as FleaReport)
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
    {
      id: Date.now(),
      targetType: data.targetType,
      targetId: data.targetId,
      reporterId: 1,
      reporter: { id: 1, name: '当前用户', avatar: '' },
      reason: data.reason,
      status: 'pending',
      createTime: new Date().toISOString()
    } as FleaReport
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
    undefined
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
          goods: {
            id: 1,
            title: '二手iPhone',
            description: '几乎全新',
            price: 3000,
            categoryId: 1,
            category: {
              id: 1,
              name: '数码电子',
              sort: 1,
              createTime: new Date().toISOString()
            },
            condition: 'almost_new',
            transactionMethod: 'self_pickup',
            status: 'published',
            sellerId: 1,
            seller: { 
              id: 1, 
              username: 'seller', 
              name: '卖家', 
              email: 'seller@example.com', 
              groupId: 1, 
              status: 1, 
              roles: [], 
              createTime: new Date().toISOString(), 
              updateTime: new Date().toISOString() 
            },
            viewCount: 100,
            likeCount: 10,
            images: [],
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString()
          },
          buyerId: 2,
          buyer: { 
            id: 2, 
            username: 'buyer', 
            name: '买家', 
            email: 'buyer@example.com', 
            groupId: 1, 
            status: 1, 
            roles: [], 
            createTime: new Date().toISOString(), 
            updateTime: new Date().toISOString() 
          },
          sellerId: 1,
          seller: { 
            id: 1, 
            username: 'seller', 
            name: '卖家', 
            email: 'seller@example.com', 
            groupId: 1, 
            status: 1, 
            roles: [], 
            createTime: new Date().toISOString(), 
            updateTime: new Date().toISOString() 
          },
          createTime: new Date().toISOString()
        }
      ],
      total: 1
    } as { list: FleaChatSession[]; total: number }),
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
      goods: {
        id: 1,
        title: '二手iPhone',
        description: '几乎全新',
        price: 3000,
        categoryId: 1,
        category: {
          id: 1,
          name: '数码电子',
          sort: 1,
          createTime: new Date().toISOString()
        },
        condition: 'almost_new',
        transactionMethod: 'self_pickup',
        status: 'published',
        sellerId: 1,
        seller: { 
          id: 1, 
          username: 'seller', 
          name: '卖家', 
          email: 'seller@example.com', 
          groupId: 1, 
          status: 1, 
          roles: [], 
          createTime: new Date().toISOString(), 
          updateTime: new Date().toISOString() 
        },
        viewCount: 100,
        likeCount: 10,
        images: [],
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      },
      buyerId: 2,
      buyer: { 
        id: 2, 
        username: 'buyer', 
        name: '买家', 
        email: 'buyer@example.com', 
        groupId: 1, 
        status: 1, 
        roles: [], 
        createTime: new Date().toISOString(), 
        updateTime: new Date().toISOString() 
      },
      sellerId: 1,
      seller: { 
        id: 1, 
        username: 'seller', 
        name: '卖家', 
        email: 'seller@example.com', 
        groupId: 1, 
        status: 1, 
        roles: [], 
        createTime: new Date().toISOString(), 
        updateTime: new Date().toISOString() 
      },
      createTime: new Date().toISOString()
    } as FleaChatSession)
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
    {
      id: Date.now(),
      goodsId: data.goodsId,
      goods: {
        id: data.goodsId,
        title: '商品标题',
        description: '商品描述',
        price: 100,
        categoryId: 1,
        category: {
          id: 1,
          name: '分类名称',
          sort: 1,
          createTime: new Date().toISOString()
        },
        condition: 'almost_new',
        transactionMethod: 'self_pickup',
        status: 'published',
        sellerId: 1,
        seller: { 
          id: 1, 
          username: 'seller', 
          name: '卖家', 
          email: 'seller@example.com', 
          groupId: 1, 
          status: 1, 
          roles: [], 
          createTime: new Date().toISOString(), 
          updateTime: new Date().toISOString() 
        },
        viewCount: 0,
        likeCount: 0,
        images: [],
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      },
      buyerId: data.buyerId,
      buyer: { 
        id: data.buyerId, 
        username: 'buyer', 
        name: '买家', 
        email: 'buyer@example.com', 
        groupId: 1, 
        status: 1, 
        roles: [], 
        createTime: new Date().toISOString(), 
        updateTime: new Date().toISOString() 
      },
      sellerId: 1,
      seller: { 
        id: 1, 
        username: 'seller', 
        name: '卖家', 
        email: 'seller@example.com', 
        groupId: 1, 
        status: 1, 
        roles: [], 
        createTime: new Date().toISOString(), 
        updateTime: new Date().toISOString() 
      },
      createTime: new Date().toISOString()
    } as FleaChatSession,
    '创建成功'
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
          sender: { 
            id: 1, 
            username: 'sender1', 
            name: '卖家', 
            email: 'sender1@example.com', 
            groupId: 1, 
            status: 1, 
            roles: [], 
            createTime: new Date().toISOString(), 
            updateTime: new Date().toISOString() 
          },
          content: '您好，这个商品还在吗？',
          createTime: new Date().toISOString()
        },
        {
          id: 2,
          sessionId,
          senderId: 2,
          sender: { 
            id: 2, 
            username: 'sender2', 
            name: '买家', 
            email: 'sender2@example.com', 
            groupId: 1, 
            status: 1, 
            roles: [], 
            createTime: new Date().toISOString(), 
            updateTime: new Date().toISOString() 
          },
          content: '在的，请问有什么问题吗？',
          createTime: new Date().toISOString()
        }
      ],
      total: 2
    } as { list: FleaChatMessage[]; total: number }),
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
    {
      id: Date.now(),
      sessionId,
      senderId: 1,
      sender: { 
        id: 1, 
        username: 'current_user', 
        name: '当前用户', 
        email: 'current_user@example.com', 
        groupId: 1, 
        status: 1, 
        roles: [], 
        createTime: new Date().toISOString(), 
        updateTime: new Date().toISOString() 
      },
      content: data.content,
      createTime: new Date().toISOString()
    } as FleaChatMessage,
    '发送成功'
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
      publishedGoods: 456,
      pendingGoods: 23,
      soldGoods: 789,
      offlineGoods: 41,
      todayNewGoods: 23,
      weeklyNewGoods: 156,
      monthlyNewGoods: 456,
      totalUsers: 2345,
      activeUsers: 1567,
      totalSales: 892,
      averagePrice: 175.5,
      popularCategories: [
        { categoryId: 1, categoryName: '数码电子', count: 456 },
        { categoryId: 2, categoryName: '生活用品', count: 234 },
        { categoryId: 3, categoryName: '图书文具', count: 189 }
      ],
      recentReports: 12,
      pendingReports: 5
    } as FleaMarketStatistics)
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
    {
      url: '/mock/flea-market/images/' + file.name,
      name: file.name,
      size: file.size
    },
    '上传成功'
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
    files.map(file => ({
      url: '/mock/flea-market/images/' + file.name,
      name: file.name,
      size: file.size
    })),
    '上传成功'
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