import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { useResponsive, useBreakpoint, useMobile, useTouch, breakpoints } from '../useResponsive'

// Mock window properties
const mockWindow = {
  innerWidth: 1200,
  innerHeight: 800,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  setTimeout: vi.fn((cb, delay) => setTimeout(cb, delay)),
  matchMedia: vi.fn()
}

// Mock getComputedStyle
const mockGetComputedStyle = vi.fn(() => ({
  getPropertyValue: vi.fn((prop) => {
    const values: Record<string, string> = {
      '--safe-area-inset-top': '0',
      '--safe-area-inset-right': '0', 
      '--safe-area-inset-bottom': '0',
      '--safe-area-inset-left': '0'
    }
    return values[prop] || '0'
  })
}))

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
})

Object.defineProperty(global, 'getComputedStyle', {
  value: mockGetComputedStyle,
  writable: true
})

describe('useResponsive', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 重置window尺寸
    mockWindow.innerWidth = 1200
    mockWindow.innerHeight = 800
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('基础功能', () => {
    it('应该正确初始化窗口尺寸', () => {
      const { windowWidth, windowHeight } = useResponsive()
      
      expect(windowWidth.value).toBe(1200)
      expect(windowHeight.value).toBe(800)
    })

    it('应该正确注册和移除事件监听器', () => {
      const { } = useResponsive()
      
      expect(mockWindow.addEventListener).toHaveBeenCalledWith(
        'resize', 
        expect.any(Function),
        { passive: true }
      )
    })

    it('应该在窗口大小改变时更新尺寸', async () => {
      const { windowWidth, windowHeight } = useResponsive()
      
      // 模拟窗口大小改变
      mockWindow.innerWidth = 800
      mockWindow.innerHeight = 600
      
      // 获取事件处理器并调用
      const resizeHandler = mockWindow.addEventListener.mock.calls
        .find(call => call[0] === 'resize')?.[1] as Function
      
      resizeHandler()
      
      // 等待防抖完成
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(windowWidth.value).toBe(800)
      expect(windowHeight.value).toBe(600)
    })
  })

  describe('断点检测', () => {
    it('应该正确识别桌面端断点', () => {
      mockWindow.innerWidth = 1400
      const { currentBreakpoint } = useResponsive()
      
      expect(currentBreakpoint.value).toBe('xl')
    })

    it('应该正确识别移动端断点', () => {
      mockWindow.innerWidth = 400
      const { currentBreakpoint } = useResponsive()
      
      expect(currentBreakpoint.value).toBe('xs')
    })

    it('应该正确识别平板端断点', () => {
      mockWindow.innerWidth = 800
      const { currentBreakpoint } = useResponsive()
      
      expect(currentBreakpoint.value).toBe('sm')
    })

    it('应该正确识别各个断点', () => {
      const testCases = [
        { width: 300, expected: 'xs' },
        { width: 600, expected: 'sm' },
        { width: 900, expected: 'md' },
        { width: 1100, expected: 'lg' },
        { width: 1500, expected: 'xl' }
      ]
      
      testCases.forEach(({ width, expected }) => {
        mockWindow.innerWidth = width
        const { currentBreakpoint } = useResponsive()
        expect(currentBreakpoint.value).toBe(expected)
      })
    })
  })

  describe('断点匹配', () => {
    it('应该正确匹配向上断点', () => {
      mockWindow.innerWidth = 1000
      const { matches } = useResponsive()
      
      const matchesMd = matches('md', 'up')
      expect(matchesMd.value).toBe(true)
      
      const matchesXl = matches('xl', 'up')
      expect(matchesXl.value).toBe(false)
    })

    it('应该正确匹配向下断点', () => {
      mockWindow.innerWidth = 1000
      const { matches } = useResponsive()
      
      const matchesLg = matches('lg', 'down')
      expect(matchesLg.value).toBe(true)
      
      const matchesSm = matches('sm', 'down')
      expect(matchesSm.value).toBe(false)
    })

    it('应该正确匹配精确断点', () => {
      mockWindow.innerWidth = 800
      const { matches } = useResponsive()
      
      const matchesSm = matches('sm', 'only')
      expect(matchesSm.value).toBe(true)
      
      const matchesMd = matches('md', 'only')
      expect(matchesMd.value).toBe(false)
    })
  })

  describe('设备类型检测', () => {
    it('应该正确识别移动设备', () => {
      mockWindow.innerWidth = 600
      const { isMobile } = useResponsive()
      
      expect(isMobile.value).toBe(true)
    })

    it('应该正确识别平板设备', () => {
      mockWindow.innerWidth = 900
      const { isTablet } = useResponsive()
      
      expect(isTablet.value).toBe(true)
    })

    it('应该正确识别桌面设备', () => {
      mockWindow.innerWidth = 1400
      const { isDesktop } = useResponsive()
      
      expect(isDesktop.value).toBe(true)
    })

    it('应该正确检测触摸设备', () => {
      Object.defineProperty(window, 'ontouchstart', { value: true })
      const { isTouchDevice } = useResponsive()
      
      expect(isTouchDevice.value).toBe(true)
    })
  })

  describe('屏幕方向', () => {
    it('应该正确识别横屏', () => {
      mockWindow.innerWidth = 1200
      mockWindow.innerHeight = 800
      const { isLandscape, isPortrait } = useResponsive()
      
      expect(isLandscape.value).toBe(true)
      expect(isPortrait.value).toBe(false)
    })

    it('应该正确识别竖屏', () => {
      mockWindow.innerWidth = 800
      mockWindow.innerHeight = 1200
      const { isLandscape, isPortrait } = useResponsive()
      
      expect(isLandscape.value).toBe(false)
      expect(isPortrait.value).toBe(true)
    })
  })

  describe('工具函数', () => {
    it('getGridCols 应该根据屏幕宽度返回正确的列数', () => {
      const testCases = [
        { width: 400, expected: 1 },
        { width: 600, expected: 1 },
        { width: 800, expected: 2 },
        { width: 1000, expected: 3 },
        { width: 1300, expected: 4 },
        { width: 2000, expected: 5 }
      ]
      
      testCases.forEach(({ width, expected }) => {
        mockWindow.innerWidth = width
        const { getGridCols } = useResponsive()
        const cols = getGridCols()
        
        expect(cols.value).toBe(expected)
      })
    })

    it('getGridCols 应该支持自定义参数', () => {
      mockWindow.innerWidth = 800
      const { getGridCols } = useResponsive()
      const cols = getGridCols(2, 3, 4, 5, 6)
      
      expect(cols.value).toBe(3)
    })

    it('getSpacing 应该根据设备类型返回正确的间距', () => {
      const testCases = [
        { width: 400, multiplier: 0.5, expected: 8 },
        { width: 800, multiplier: 0.75, expected: 12 },
        { width: 1400, multiplier: 1, expected: 16 }
      ]
      
      testCases.forEach(({ width, expected }) => {
        mockWindow.innerWidth = width
        const { getSpacing } = useResponsive()
        const spacing = getSpacing()
        
        expect(spacing.value).toBe(expected)
      })
    })
  })

  describe('用户偏好检测', () => {
    beforeEach(() => {
      mockWindow.matchMedia = vi.fn()
    })

    it('应该正确检测深色主题偏好', () => {
      mockWindow.matchMedia.mockReturnValue({ matches: true })
      const { prefersDark } = useResponsive()
      
      expect(prefersDark.value).toBe(true)
      expect(mockWindow.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
    })

    it('应该正确检测减少动画偏好', () => {
      mockWindow.matchMedia.mockReturnValue({ matches: true })
      const { prefersReducedMotion } = useResponsive()
      
      expect(prefersReducedMotion.value).toBe(true)
      expect(mockWindow.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
    })

    it('应该正确检测高对比度偏好', () => {
      mockWindow.matchMedia.mockReturnValue({ matches: true })
      const { prefersHighContrast } = useResponsive()
      
      expect(prefersHighContrast.value).toBe(true)
      expect(mockWindow.matchMedia).toHaveBeenCalledWith('(prefers-contrast: high)')
    })
  })

  describe('安全区域支持', () => {
    it('应该正确获取安全区域信息', () => {
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: vi.fn((prop) => {
          const values: Record<string, string> = {
            '--safe-area-inset-top': '44px',
            '--safe-area-inset-right': '0px',
            '--safe-area-inset-bottom': '34px',
            '--safe-area-inset-left': '0px'
          }
          return values[prop] || '0px'
        })
      })
      
      const { safeAreaInsets } = useResponsive()
      
      expect(safeAreaInsets.value).toEqual({
        top: 44,
        right: 0,
        bottom: 34,
        left: 0
      })
    })
  })

  describe('性能优化', () => {
    it('应该使用防抖来处理resize事件', async () => {
      const { } = useResponsive()
      
      // 获取resize处理器
      const resizeHandler = mockWindow.addEventListener.mock.calls
        .find(call => call[0] === 'resize')?.[1] as Function
      
      // 快速多次调用
      resizeHandler()
      resizeHandler()
      resizeHandler()
      
      // 应该只有一个timer被设置
      expect(mockWindow.setTimeout).toHaveBeenCalledTimes(1)
    })
  })
})

describe('useBreakpoint', () => {
  it('应该正确工作', () => {
    mockWindow.innerWidth = 1000
    const matches = useBreakpoint('md')
    
    expect(matches.value).toBe(true)
  })

  it('应该支持不同方向', () => {
    mockWindow.innerWidth = 1000
    
    const matchesUp = useBreakpoint('md', 'up')
    const matchesDown = useBreakpoint('lg', 'down')
    
    expect(matchesUp.value).toBe(true)
    expect(matchesDown.value).toBe(true)
  })
})

describe('useMobile', () => {
  it('应该正确检测移动设备', () => {
    mockWindow.innerWidth = 600
    const isMobile = useMobile()
    
    expect(isMobile.value).toBe(true)
  })

  it('应该正确检测非移动设备', () => {
    mockWindow.innerWidth = 1200
    const isMobile = useMobile()
    
    expect(isMobile.value).toBe(false)
  })
})

describe('useTouch', () => {
  it('应该正确检测触摸设备', () => {
    Object.defineProperty(window, 'ontouchstart', { value: true })
    const isTouchDevice = useTouch()
    
    expect(isTouchDevice.value).toBe(true)
  })

  it('应该正确检测非触摸设备', () => {
    Object.defineProperty(window, 'ontouchstart', { value: undefined })
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 0 })
    
    const isTouchDevice = useTouch()
    
    expect(isTouchDevice.value).toBe(false)
  })
})

describe('breakpoints 常量', () => {
  it('应该有正确的断点值', () => {
    expect(breakpoints).toEqual({
      xs: 480,
      sm: 768,
      md: 992,
      lg: 1200,
      xl: 1920
    })
  })
})