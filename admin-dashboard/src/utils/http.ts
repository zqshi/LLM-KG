/**
 * HTTP 客户端工具
 * 企业知识聚合平台 - 统一 API 请求处理
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

// API 响应数据结构
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
  timestamp?: number
}

// 创建 axios 实例
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      // 添加认证 token
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      // 添加请求时间戳
      if (config.method === 'get') {
        config.params = {
          ...config.params,
          _t: Date.now()
        }
      }

      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // 响应拦截器
  instance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      const { data } = response
      
      // 检查业务状态码
      if (data.success === false) {
        ElMessage.error(data.message || '请求失败')
        return Promise.reject(new Error(data.message || '请求失败'))
      }

      return response
    },
    (error) => {
      // 处理 HTTP 错误状态码
      if (error.response) {
        const { status, data } = error.response
        
        switch (status) {
          case 401:
            ElMessage.error('未授权，请重新登录')
            // 清除本地存储的认证信息
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user_info')
            // 跳转到登录页
            window.location.href = '/login'
            break
          case 403:
            ElMessage.error('没有权限访问该资源')
            break
          case 404:
            ElMessage.error('请求的资源不存在')
            break
          case 500:
            ElMessage.error('服务器内部错误')
            break
          default:
            ElMessage.error(data?.message || `请求失败 (${status})`)
        }
      } else if (error.request) {
        ElMessage.error('网络错误，请检查网络连接')
      } else {
        ElMessage.error(error.message || '请求失败')
      }

      return Promise.reject(error)
    }
  )

  return instance
}

// HTTP 客户端类
export class HttpClient {
  private instance: AxiosInstance

  constructor() {
    this.instance = createAxiosInstance()
  }

  // GET 请求
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.get<ApiResponse<T>>(url, config)
    return response.data
  }

  // POST 请求
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.post<ApiResponse<T>>(url, data, config)
    return response.data
  }

  // PUT 请求
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config)
    return response.data
  }

  // PATCH 请求
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.patch<ApiResponse<T>>(url, data, config)
    return response.data
  }

  // DELETE 请求
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config)
    return response.data
  }

  // 上传文件
  async upload<T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await this.instance.post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(progress)
        }
      }
    })

    return response.data
  }

  // 下载文件
  async download(
    url: string,
    filename?: string,
    config?: AxiosRequestConfig
  ): Promise<void> {
    const response = await this.instance.get(url, {
      ...config,
      responseType: 'blob'
    })

    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }

  // 获取原始 axios 实例（用于特殊情况）
  getInstance(): AxiosInstance {
    return this.instance
  }
}

// 创建并导出 HTTP 客户端实例
export const httpClient = new HttpClient()

// 默认导出
export default httpClient

// 请求工具函数
export const request = {
  get: httpClient.get.bind(httpClient),
  post: httpClient.post.bind(httpClient),
  put: httpClient.put.bind(httpClient),
  patch: httpClient.patch.bind(httpClient),
  delete: httpClient.delete.bind(httpClient),
  upload: httpClient.upload.bind(httpClient),
  download: httpClient.download.bind(httpClient)
}

// 常用状态码
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const

// 错误处理工具
export const handleApiError = (error: any): string => {
  if (error.response) {
    return error.response.data?.message || `请求失败 (${error.response.status})`
  } else if (error.request) {
    return '网络错误，请检查网络连接'
  } else {
    return error.message || '未知错误'
  }
}