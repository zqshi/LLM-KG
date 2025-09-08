import { useBreakpoints } from '@vueuse/core'

// 响应式断点组合式函数
export function useResponsiveBreakpoints() {
  const breakpoints = useBreakpoints({
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  })

  const isMobile = breakpoints.smaller('mobile')
  const isTablet = breakpoints.between('mobile', 'desktop')
  const isDesktop = breakpoints.greater('desktop')

  return {
    isMobile,
    isTablet,
    isDesktop
  }
}