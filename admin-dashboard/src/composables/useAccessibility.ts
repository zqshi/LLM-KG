import { ref, nextTick, onMounted, onUnmounted, Ref } from 'vue'

export interface FocusableElement extends HTMLElement {
  focus(): void
  blur(): void
}

export function useKeyboardNavigation() {
  const isKeyboardUser = ref(false)
  
  // 检测是否为键盘用户
  const detectKeyboardUser = () => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        isKeyboardUser.value = true
        document.body.classList.add('keyboard-navigation')
      }
    }
    
    const handleMouseDown = () => {
      isKeyboardUser.value = false
      document.body.classList.remove('keyboard-navigation')
    }
    
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }
  
  return {
    isKeyboardUser,
    detectKeyboardUser
  }
}

export function useFocusManagement() {
  const currentFocusedElement = ref<FocusableElement | null>(null)
  
  // 获取可聚焦元素
  const getFocusableElements = (container: HTMLElement = document.body): FocusableElement[] => {
    const selectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '.el-button:not([disabled])',
      '.el-input:not([disabled])',
      '.el-select:not([disabled])'
    ]
    
    return Array.from(container.querySelectorAll(selectors.join(','))) as FocusableElement[]
  }
  
  // 聚焦到元素
  const focusElement = (element: FocusableElement | null) => {
    if (element && typeof element.focus === 'function') {
      element.focus()
      currentFocusedElement.value = element
    }
  }
  
  // 聚焦到第一个可聚焦元素
  const focusFirst = (container?: HTMLElement) => {
    const focusableElements = getFocusableElements(container)
    if (focusableElements.length > 0) {
      focusElement(focusableElements[0])
    }
  }
  
  // 聚焦到最后一个可聚焦元素
  const focusLast = (container?: HTMLElement) => {
    const focusableElements = getFocusableElements(container)
    if (focusableElements.length > 0) {
      focusElement(focusableElements[focusableElements.length - 1])
    }
  }
  
  // 循环导航
  const navigateWithinContainer = (
    container: HTMLElement,
    direction: 'next' | 'prev'
  ) => {
    const focusableElements = getFocusableElements(container)
    const currentIndex = focusableElements.indexOf(document.activeElement as FocusableElement)
    
    if (currentIndex === -1) {
      focusFirst(container)
      return
    }
    
    let nextIndex
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % focusableElements.length
    } else {
      nextIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length
    }
    
    focusElement(focusableElements[nextIndex])
  }
  
  return {
    currentFocusedElement,
    getFocusableElements,
    focusElement,
    focusFirst,
    focusLast,
    navigateWithinContainer
  }
}

export function useFocusTrap(containerRef: Ref<HTMLElement | null>) {
  const { getFocusableElements, focusElement } = useFocusManagement()
  
  const trapFocus = (e: KeyboardEvent) => {
    if (!containerRef.value || e.key !== 'Tab') return
    
    const focusableElements = getFocusableElements(containerRef.value)
    if (focusableElements.length === 0) return
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault()
        focusElement(lastElement)
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault()
        focusElement(firstElement)
      }
    }
  }
  
  const activateTrap = () => {
    if (containerRef.value) {
      document.addEventListener('keydown', trapFocus)
      // 聚焦到容器内第一个可聚焦元素
      nextTick(() => {
        const focusableElements = getFocusableElements(containerRef.value!)
        if (focusableElements.length > 0) {
          focusElement(focusableElements[0])
        }
      })
    }
  }
  
  const deactivateTrap = () => {
    document.removeEventListener('keydown', trapFocus)
  }
  
  return {
    activateTrap,
    deactivateTrap
  }
}

export function useAriaAnnouncer() {
  let announcer: HTMLElement | null = null
  
  // 创建ARIA live region
  const createAnnouncer = () => {
    if (announcer) return
    
    announcer = document.createElement('div')
    announcer.setAttribute('aria-live', 'polite')
    announcer.setAttribute('aria-atomic', 'true')
    announcer.className = 'sr-only'
    announcer.id = 'aria-announcer'
    document.body.appendChild(announcer)
  }
  
  // 宣布消息
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcer) createAnnouncer()
    
    if (announcer) {
      announcer.setAttribute('aria-live', priority)
      announcer.textContent = message
      
      // 清空内容，以便下次相同消息也能被读出
      setTimeout(() => {
        if (announcer) announcer.textContent = ''
      }, 1000)
    }
  }
  
  // 清理
  const cleanup = () => {
    if (announcer) {
      document.body.removeChild(announcer)
      announcer = null
    }
  }
  
  return {
    announce,
    cleanup
  }
}

export function useSkipLinks() {
  const createSkipLinks = () => {
    const skipLinksContainer = document.createElement('div')
    skipLinksContainer.className = 'skip-links'
    
    const skipLinks = [
      { href: '#main-content', text: '跳转到主要内容' },
      { href: '#main-navigation', text: '跳转到主导航' },
      { href: '#search', text: '跳转到搜索' }
    ]
    
    skipLinks.forEach(link => {
      const skipLink = document.createElement('a')
      skipLink.href = link.href
      skipLink.textContent = link.text
      skipLink.className = 'skip-link'
      skipLinksContainer.appendChild(skipLink)
    })
    
    document.body.insertBefore(skipLinksContainer, document.body.firstChild)
  }
  
  return {
    createSkipLinks
  }
}

// 全局无障碍初始化
export function useAccessibility() {
  const { detectKeyboardUser } = useKeyboardNavigation()
  const { announce } = useAriaAnnouncer()
  const { createSkipLinks } = useSkipLinks()
  
  let cleanup: (() => void) | null = null
  
  onMounted(() => {
    cleanup = detectKeyboardUser()
    createSkipLinks()
    
    // 添加页面加载完成的通知
    nextTick(() => {
      announce('页面加载完成，您可以开始导航')
    })
  })
  
  onUnmounted(() => {
    if (cleanup) cleanup()
  })
  
  return {
    announce
  }
}