import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// 全局测试设置
beforeAll(() => {
  // Mock全局对象
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // Mock console methods for cleaner test output
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterAll(() => {
  vi.restoreAllMocks()
})

// Vue Test Utils 全局配置
config.global.mocks = {
  $t: (key: string) => key, // Mock i18n
  $route: {
    path: '/',
    query: {},
    params: {},
    name: 'test'
  },
  $router: {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  }
}

// Mock Element Plus 消息组件
config.global.mocks.$message = {
  success: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
  info: vi.fn()
}

config.global.mocks.$msgbox = vi.fn().mockResolvedValue('confirm')
config.global.mocks.$alert = vi.fn().mockResolvedValue('confirm')
config.global.mocks.$confirm = vi.fn().mockResolvedValue('confirm')

// 全局组件存根
config.global.stubs = {
  'el-icon': true,
  'el-loading': true,
  'router-link': true,
  'router-view': true
}