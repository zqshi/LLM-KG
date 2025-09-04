import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'auto'

export const useThemeStore = defineStore('theme', () => {
  // 当前主题
  const currentTheme = ref<Theme>('light')
  
  // 系统偏好的主题
  const systemTheme = ref<'light' | 'dark'>('light')
  
  // 实际应用的主题
  const appliedTheme = ref<'light' | 'dark'>('light')

  // 检测系统主题偏好
  const detectSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      systemTheme.value = mediaQuery.matches ? 'dark' : 'light'
      
      // 监听系统主题变化
      mediaQuery.addEventListener('change', (e) => {
        systemTheme.value = e.matches ? 'dark' : 'light'
        updateAppliedTheme()
      })
    }
  }

  // 更新实际应用的主题
  const updateAppliedTheme = () => {
    let newTheme: 'light' | 'dark' = 'light'
    
    if (currentTheme.value === 'auto') {
      newTheme = systemTheme.value
    } else {
      newTheme = currentTheme.value
    }
    
    appliedTheme.value = newTheme
    
    // 应用到DOM
    if (typeof document !== 'undefined') {
      if (newTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark')
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.removeAttribute('data-theme')
        document.documentElement.classList.remove('dark')
      }
    }
  }

  // 设置主题
  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
    
    // 保存到localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme-preference', theme)
    }
    
    updateAppliedTheme()
  }

  // 从localStorage初始化主题
  const initTheme = () => {
    if (typeof localStorage !== 'undefined') {
      const savedTheme = localStorage.getItem('theme-preference') as Theme
      if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
        currentTheme.value = savedTheme
      }
    }
    
    detectSystemTheme()
    updateAppliedTheme()
  }

  // 切换主题
  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'auto']
    const currentIndex = themes.indexOf(currentTheme.value)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  // 获取主题显示名称
  const getThemeDisplayName = (theme: Theme) => {
    const names = {
      light: '浅色模式',
      dark: '深色模式', 
      auto: '跟随系统'
    }
    return names[theme]
  }

  // 获取主题图标
  const getThemeIcon = (theme: Theme) => {
    const icons = {
      light: 'Sunny',
      dark: 'Moon',
      auto: 'Monitor'
    }
    return icons[theme]
  }

  // 监听主题变化
  watch(systemTheme, () => {
    if (currentTheme.value === 'auto') {
      updateAppliedTheme()
    }
  })

  return {
    currentTheme,
    systemTheme,
    appliedTheme,
    setTheme,
    toggleTheme,
    initTheme,
    getThemeDisplayName,
    getThemeIcon
  }
})