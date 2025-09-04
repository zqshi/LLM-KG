/**
 * HTTP请求工具类
 * 
 * 提供统一的API请求封装
 */

import axios from 'axios'
import type { ApiResponse } from '@/types'
import { ElMessage } from 'element-plus'

// 创建axios实例
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem('enterprise-portal-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  (response) => {
    const { data } = response
    
    // 统一处理业务错误
    if (data.code && data.code !== 200) {
      ElMessage.error(data.message || '请求失败')
      return Promise.reject(new Error(data.message || '请求失败'))
    }
    
    return data
  },
  (error) => {
    console.error('响应错误:', error)
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          ElMessage.error('未授权，请重新登录')
          // 清除本地token
          localStorage.removeItem('enterprise-portal-token')
          localStorage.removeItem('enterprise-portal-user')
          // 跳转到登录页
          window.location.href = '/login'
          break
          
        case 403:
          ElMessage.error('访问被禁止')
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
      ElMessage.error('网络连接失败，请检查网络')
    } else {
      ElMessage.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

/**
 * GET请求
 */
const get = <T = any>(url: string, config?: any): Promise<ApiResponse<T>> => {
  return http.get(url, config)
}

/**
 * POST请求
 */
const post = <T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> => {
  return http.post(url, data, config)
}

/**
 * PUT请求
 */
const put = <T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> => {
  return http.put(url, data, config)
}

/**
 * DELETE请求
 */
const del = <T = any>(url: string, config?: any): Promise<ApiResponse<T>> => {
  return http.delete(url, config)
}

/**
 * PATCH请求
 */
const patch = <T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> => {
  return http.patch(url, data, config)
}

/**
 * 文件上传
 */
const upload = <T = any>(url: string, file: File, config?: any): Promise<ApiResponse<T>> => {
  const formData = new FormData()
  formData.append('file', file)
  
  return http.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    ...config
  })
}

/**
 * 文件下载
 */
const download = (url: string, filename?: string, config?: any): Promise<void> => {
  return http.get(url, {
    responseType: 'blob',
    ...config
  }).then((response: any) => {
    const blob = new Blob([response], { type: response.type })
    const downloadUrl = window.URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = filename || 'download'
    document.body.appendChild(a)
    a.click()
    
    window.URL.revokeObjectURL(downloadUrl)
    document.body.removeChild(a)
  })
}

export {
  http as default,
  get,
  post,
  put,
  del as delete,
  patch,
  upload,
  download
}

// 兼容现有的导出方式
export { http }