import { ref, computed, onMounted, onUnmounted } from 'vue'

// 断点定义
export const breakpoints = {
  xs: 480,
  sm: 768,
  md: 992,
  lg: 1200,
  xl: 1920
} as const

export type BreakpointKey = keyof typeof breakpoints

export function useResponsive() {
  const windowWidth = ref(window.innerWidth)
  const windowHeight = ref(window.innerHeight)

  // 更新窗口尺寸
  const updateWindowSize = () => {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
  }

  // 防抖处理
  let resizeTimer: number | undefined
  const debouncedUpdate = () => {
    clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(updateWindowSize, 100)
  }

  onMounted(() => {
    window.addEventListener('resize', debouncedUpdate, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('resize', debouncedUpdate)
    clearTimeout(resizeTimer)
  })

  // 计算当前断点
  const currentBreakpoint = computed<BreakpointKey>(() => {
    const width = windowWidth.value
    if (width < breakpoints.xs) return 'xs'
    if (width < breakpoints.sm) return 'sm'  
    if (width < breakpoints.md) return 'md'
    if (width < breakpoints.lg) return 'lg'
    return 'xl'
  })

  // 断点匹配器
  const matches = (breakpoint: BreakpointKey, direction: 'up' | 'down' | 'only' = 'up') => {
    const width = windowWidth.value
    const bp = breakpoints[breakpoint]

    switch (direction) {
      case 'up':
        return computed(() => width >= bp)
      case 'down':
        return computed(() => width < bp)
      case 'only':
        const breakpointKeys = Object.keys(breakpoints) as BreakpointKey[]
        const currentIndex = breakpointKeys.indexOf(breakpoint)
        const nextBreakpoint = breakpointKeys[currentIndex + 1]
        const nextBp = nextBreakpoint ? breakpoints[nextBreakpoint] : Infinity
        return computed(() => width >= bp && width < nextBp)
      default:
        return computed(() => width >= bp)
    }
  }

  // 移动端检测
  const isMobile = computed(() => windowWidth.value < breakpoints.sm)
  const isTablet = computed(() => 
    windowWidth.value >= breakpoints.sm && windowWidth.value < breakpoints.lg
  )
  const isDesktop = computed(() => windowWidth.value >= breakpoints.lg)

  // 屏幕方向
  const isLandscape = computed(() => windowWidth.value > windowHeight.value)
  const isPortrait = computed(() => windowWidth.value <= windowHeight.value)

  // 响应式网格列数计算
  const getGridCols = (
    xs = 1, 
    sm = 2, 
    md = 3, 
    lg = 4, 
    xl = 5
  ) => {
    return computed(() => {
      const width = windowWidth.value
      if (width < breakpoints.xs) return xs
      if (width < breakpoints.sm) return xs
      if (width < breakpoints.md) return sm
      if (width < breakpoints.lg) return md
      if (width < breakpoints.xl) return lg
      return xl
    })
  }

  // 响应式间距计算
  const getSpacing = (
    baseSpacing = 16,
    mobileMultiplier = 0.5,
    tabletMultiplier = 0.75
  ) => {
    return computed(() => {
      if (isMobile.value) return baseSpacing * mobileMultiplier
      if (isTablet.value) return baseSpacing * tabletMultiplier
      return baseSpacing
    })
  }

  // 触摸设备检测
  const isTouchDevice = computed(() => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  })

  // 安全区域支持（用于 iOS 刘海屏等）
  const safeAreaInsets = computed(() => {
    const style = getComputedStyle(document.documentElement)
    return {
      top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
      right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
      bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
      left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0')
    }
  })

  // 暗色主题检测
  const prefersDark = computed(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // 减少动画偏好检测
  const prefersReducedMotion = computed(() => {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  // 高对比度偏好检测
  const prefersHighContrast = computed(() => {
    return window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches
  })

  return {
    // 基础数据
    windowWidth: computed(() => windowWidth.value),
    windowHeight: computed(() => windowHeight.value),
    currentBreakpoint,
    
    // 匹配器
    matches,
    
    // 设备类型
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    
    // 屏幕方向
    isLandscape,
    isPortrait,
    
    // 工具函数
    getGridCols,
    getSpacing,
    safeAreaInsets,
    
    // 用户偏好
    prefersDark,
    prefersReducedMotion,
    prefersHighContrast,
    
    // 断点常量
    breakpoints
  }
}

// 全局响应式工具函数
export const useBreakpoint = (breakpoint: BreakpointKey, direction: 'up' | 'down' | 'only' = 'up') => {
  const { matches } = useResponsive()
  return matches(breakpoint, direction)
}

// 简化的移动端检测
export const useMobile = () => {
  const { isMobile } = useResponsive()
  return isMobile
}

// 简化的触摸设备检测
export const useTouch = () => {
  const { isTouchDevice } = useResponsive()
  return isTouchDevice
}