/**
 * 统一组件导出文件
 * 企业知识聚合平台 - 设计系统组件库
 */

// 导入组件
import Button from './Button.vue'
import Table from './Table.vue'
import TableCell from './TableCell.vue'
import Form from './Form.vue'
import FormItem from './FormItem.vue'
import Modal from './Modal.vue'
import ContentCard from './ContentCard.vue'
import PageHeader from './PageHeader.vue'

// 组件类型定义
export type { TableColumn, TableAction, BatchAction } from './Table.vue'
export type { ValidationRule, FormConfig } from './Form.vue'
export type { ModalAction, ModalStep } from './Modal.vue'

// 导出组件
export {
  Button,
  Table,
  TableCell,
  Form,
  FormItem,
  Modal,
  ContentCard,
  PageHeader
}

// 批量注册组件的安装函数
import type { App } from 'vue'

const components = [
  Button,
  Table,
  TableCell,
  Form,
  FormItem,
  Modal,
  ContentCard,
  PageHeader
]

// 单独导出安装函数
export const install = (app: App): void => {
  components.forEach(component => {
    app.component(component.name || component.__name, component)
  })
}

// 默认导出安装函数
export default {
  install
}

// 组件配置常量
export const COMPONENT_CONFIG = {
  // 表格默认配置
  TABLE_DEFAULTS: {
    pageSize: 20,
    pageSizes: [10, 20, 50, 100],
    paginationLayout: 'total, sizes, prev, pager, next, jumper'
  },
  
  // 表单默认配置
  FORM_DEFAULTS: {
    layout: 'vertical',
    size: 'default',
    labelWidth: '100px',
    validateOnRuleChange: true,
    showMessage: true
  },
  
  // 模态框默认配置
  MODAL_DEFAULTS: {
    width: '50%',
    closeOnClickModal: true,
    closeOnPressEscape: true,
    appendToBody: false,
    lockScroll: true,
    showClose: true
  },
  
  // 断点配置
  BREAKPOINTS: {
    xs: 480,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  }
}

// 工具函数导出
export const utils = {
  /**
   * 生成唯一ID
   */
  generateId: (): string => {
    return `component-${Math.random().toString(36).substr(2, 9)}`
  },
  
  /**
   * 格式化文件大小
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },
  
  /**
   * 格式化数字
   */
  formatNumber: (num: number, decimals = 2): string => {
    return num.toLocaleString('zh-CN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    })
  },
  
  /**
   * 防抖函数
   */
  debounce: <T extends (...args: any[]) => void>(func: T, wait: number): T => {
    let timeout: NodeJS.Timeout
    return ((...args: any[]) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(this, args), wait)
    }) as T
  },
  
  /**
   * 节流函数
   */
  throttle: <T extends (...args: any[]) => void>(func: T, wait: number): T => {
    let inThrottle: boolean
    return ((...args: any[]) => {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, wait)
      }
    }) as T
  },
  
  /**
   * 深拷贝对象
   */
  deepClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime()) as any
    if (obj instanceof Array) return obj.map(item => utils.deepClone(item)) as any
    if (typeof obj === 'object') {
      const cloned: any = {}
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = utils.deepClone(obj[key])
        }
      }
      return cloned
    }
    return obj
  },
  
  /**
   * 获取嵌套对象属性
   */
  getNestedProperty: (obj: any, path: string): any => {
    return path.split('.').reduce((o, p) => o && o[p], obj)
  },
  
  /**
   * 设置嵌套对象属性
   */
  setNestedProperty: (obj: any, path: string, value: any): void => {
    const keys = path.split('.')
    const lastKey = keys.pop()!
    const target = keys.reduce((o, k) => o[k] = o[k] || {}, obj)
    target[lastKey] = value
  },
  
  /**
   * 检查是否为移动设备
   */
  isMobile: (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  },
  
  /**
   * 获取当前断点
   */
  getCurrentBreakpoint: (): string => {
    const width = window.innerWidth
    const breakpoints = COMPONENT_CONFIG.BREAKPOINTS
    
    if (width < breakpoints.sm) return 'xs'
    if (width < breakpoints.md) return 'sm'
    if (width < breakpoints.lg) return 'md'
    if (width < breakpoints.xl) return 'lg'
    if (width < breakpoints['2xl']) return 'xl'
    return '2xl'
  }
}

// 验证器集合
export const validators = {
  /**
   * 邮箱验证
   */
  email: (rule: any, value: any, callback: (error?: string) => void) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (value && !emailRegex.test(value)) {
      callback('请输入正确的邮箱格式')
    } else {
      callback()
    }
  },
  
  /**
   * 手机号验证
   */
  phone: (rule: any, value: any, callback: (error?: string) => void) => {
    const phoneRegex = /^1[3-9]\d{9}$/
    if (value && !phoneRegex.test(value)) {
      callback('请输入正确的手机号格式')
    } else {
      callback()
    }
  },
  
  /**
   * 密码强度验证
   */
  password: (rule: any, value: any, callback: (error?: string) => void) => {
    if (value && value.length < 8) {
      callback('密码长度至少8个字符')
    } else if (value && !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/.test(value)) {
      callback('密码必须包含字母和数字')
    } else {
      callback()
    }
  },
  
  /**
   * URL验证
   */
  url: (rule: any, value: any, callback: (error?: string) => void) => {
    try {
      if (value) {
        new URL(value)
      }
      callback()
    } catch {
      callback('请输入正确的URL格式')
    }
  },
  
  /**
   * 身份证验证
   */
  idCard: (rule: any, value: any, callback: (error?: string) => void) => {
    const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    if (value && !idCardRegex.test(value)) {
      callback('请输入正确的身份证号格式')
    } else {
      callback()
    }
  }
}