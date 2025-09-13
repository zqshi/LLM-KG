/**
 * API适配器 - 根据环境切换真实API和静态数据
 */

import type { ApiResponse } from '@/types'

// 检查是否启用静态数据模式
const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true'

// 模拟API响应延迟
const mockDelay = (min = 100, max = 500) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min
  return new Promise(resolve => setTimeout(resolve, delay))
}

// 通用的成功响应格式化
const successResponse = <T>(data: T, message = '操作成功'): ApiResponse<T> => ({
  code: 200,
  message,
  data
})

// 通用的错误响应格式化
const errorResponse = (message = '操作失败', code = 500): ApiResponse<null> => ({
  code,
  message,
  data: null
})

// 模拟分页功能
export const mockPagination = <T>(
  data: T[], 
  page = 1, 
  pageSize = 10,
  searchParams?: Record<string, any>
) => {
  let filteredData = [...data]
  
  // 简单的搜索过滤
  if (searchParams?.keyword) {
    const keyword = searchParams.keyword.toLowerCase()
    filteredData = filteredData.filter((item: any) => {
      return Object.values(item).some(value => 
        String(value).toLowerCase().includes(keyword)
      )
    })
  }
  
  // 状态过滤
  if (searchParams?.status !== undefined && searchParams?.status !== null && searchParams?.status !== '') {
    filteredData = filteredData.filter((item: any) => item.status === searchParams.status)
  }
  
  // 分页
  const total = filteredData.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = filteredData.slice(start, end)
  
  return {
    list,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  }
}

// 模拟CRUD操作
export const mockCrud = {
  // 模拟创建操作
  create: async <T>(data: T, message = '创建成功'): Promise<ApiResponse<T>> => {
    await mockDelay()
    // 为新创建的数据添加ID和时间戳
    const newData = {
      ...data,
      id: Date.now() + Math.floor(Math.random() * 1000),
      createTime: new Date().toISOString().replace('T', ' ').split('.')[0],
      updateTime: new Date().toISOString().replace('T', ' ').split('.')[0]
    }
    return successResponse(newData as T, message)
  },
  
  // 模拟更新操作
  update: async <T>(id: number | string, data: Partial<T>, message = '更新成功'): Promise<ApiResponse<T>> => {
    await mockDelay()
    const updatedData = {
      ...data,
      id,
      updateTime: new Date().toISOString().replace('T', ' ').split('.')[0]
    }
    return successResponse(updatedData as T, message)
  },
  
  // 模拟删除操作
  delete: async (id: number | string, message = '删除成功'): Promise<ApiResponse<null>> => {
    await mockDelay()
    return successResponse(null, message)
  },
  
  // 模拟批量删除操作
  batchDelete: async (ids: (number | string)[], message = '批量删除成功'): Promise<ApiResponse<null>> => {
    await mockDelay(200, 800)
    return successResponse(null, message)
  }
}

// API适配器主函数
export const apiAdapter = {
  // 获取数据适配器
  get: async <T>(
    realApiCall: () => Promise<ApiResponse<T>>,
    staticDataGetter: () => Promise<T>,
    options?: {
      mockPagination?: boolean
      paginationParams?: Record<string, any>
    }
  ): Promise<ApiResponse<T>> => {
    if (isStaticMode) {
      await mockDelay()
      try {
        const data = await staticDataGetter()
        
        // 如果需要分页处理
        if (options?.mockPagination) {
          // 如果数据本身就是分页格式（包含list和total属性）
          if (data && typeof data === 'object' && 'list' in data && 'total' in data) {
            const paginatedData = mockPagination(
              (data as any).list as any[],
              options.paginationParams?.page,
              options.paginationParams?.pageSize,
              options.paginationParams
            )
            return successResponse({
              ...(data as object),
              list: paginatedData.list,
              total: paginatedData.total
            } as T)
          }
          // 如果数据是数组
          else if (Array.isArray(data)) {
            const paginatedData = mockPagination(
              data as any[],
              options.paginationParams?.page,
              options.paginationParams?.pageSize,
              options.paginationParams
            )
            return successResponse({
              list: paginatedData.list,
              total: paginatedData.total
            } as T)
          }
          // 如果数据不是数组也不是分页格式，但需要分页处理，则将其包装为分页格式
          else {
            return successResponse({
              list: [],
              total: 0
            } as T)
          }
        }
        
        return successResponse(data)
      } catch (error) {
        console.error('Static data loading error:', error)
        return errorResponse('静态数据加载失败') as unknown as ApiResponse<T>
      }
    } else {
      return realApiCall()
    }
  },
  
  // 创建数据适配器
  post: async <T>(
    realApiCall: () => Promise<ApiResponse<T>>,
    mockData?: T,
    message = '创建成功'
  ): Promise<ApiResponse<T>> => {
    if (isStaticMode) {
      if (mockData) {
        return mockCrud.create(mockData, message)
      } else {
        await mockDelay()
        return successResponse({} as T, message)
      }
    } else {
      return realApiCall()
    }
  },
  
  // 更新数据适配器
  put: async <T>(
    realApiCall: () => Promise<ApiResponse<T>>,
    id: number | string,
    mockData?: Partial<T>,
    message = '更新成功'
  ): Promise<ApiResponse<T>> => {
    if (isStaticMode) {
      if (mockData) {
        return mockCrud.update(id, mockData, message)
      } else {
        await mockDelay()
        return successResponse({ id } as T, message)
      }
    } else {
      return realApiCall()
    }
  },
  
  // 删除数据适配器
  delete: async (
    realApiCall: () => Promise<ApiResponse<null>>,
    message = '删除成功'
  ): Promise<ApiResponse<null>> => {
    if (isStaticMode) {
      return mockCrud.delete(0, message)
    } else {
      return realApiCall()
    }
  },
  
  // 通用操作适配器（如密码重置、状态切换等）
  action: async <T>(
    realApiCall: () => Promise<ApiResponse<T>>,
    mockResult?: T,
    message = '操作成功'
  ): Promise<ApiResponse<T>> => {
    if (isStaticMode) {
      await mockDelay()
      return successResponse(mockResult || {} as T, message)
    } else {
      return realApiCall()
    }
  }
}

// 导出静态模式检查函数
export const getIsStaticMode = () => isStaticMode

// 导出模拟工具
export { mockDelay, successResponse, errorResponse }