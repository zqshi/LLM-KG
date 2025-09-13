/**
 * 部署后修复工具
 * 解决导航未显示和样式异常问题
 */

// 修复 Permissions-Policy 头部配置
export function fixPermissionsPolicy() {
  // 在开发环境中跳过检查
  if (import.meta.env.DEV) {
    return
  }
  
  // 在客户端无法直接修改服务器响应头，但可以记录问题
  console.log('Permissions-Policy 头部配置问题需要在服务器端解决')
  console.log('请检查 netlify.toml 或服务器配置文件')
}

// 确保菜单正确显示
export function ensureMenuVisibility() {
  // 在开发环境中跳过检查
  if (import.meta.env.DEV) {
    return true
  }
  
  // 检查是否存在菜单元素
  const menuElement = document.querySelector('.el-menu-vertical')
  if (!menuElement) {
    console.warn('未找到菜单元素，可能需要重新加载页面')
    return false
  }
  
  // 检查菜单是否可见
  const isVisible = menuElement.offsetWidth > 0 && menuElement.offsetHeight > 0
  if (!isVisible) {
    console.warn('菜单元素存在但不可见，尝试修复样式')
    menuElement.style.display = 'block'
    return true
  }
  
  console.log('菜单显示正常')
  return true
}

// 修复样式问题
export function fixStyles() {
  // 检查是否存在样式问题
  const body = document.body
  const computedStyle = window.getComputedStyle(body)
  const fontFamily = computedStyle.fontFamily
  
  // 如果字体未正确应用，可能样式未加载
  if (!fontFamily.includes('Inter') && !fontFamily.includes('sans-serif')) {
    console.warn('字体样式未正确应用，尝试重新应用')
    body.style.fontFamily = 'var(--font-family-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif'
  }
  
  // 检查CSS变量是否正确应用
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary')
  if (!primaryColor) {
    console.warn('CSS变量未正确应用，可能需要重新加载样式')
    // 尝试重新加载样式表
    reloadStylesheets()
  }
  
  console.log('样式修复完成')
}

// 重新加载样式表
function reloadStylesheets() {
  const links = document.querySelectorAll('link[rel="stylesheet"]')
  links.forEach(link => {
    const href = link.href
    link.href = ''
    setTimeout(() => {
      link.href = href
    }, 10)
  })
}

// 初始化修复
export function initDeploymentFixes() {
  console.log('开始执行部署后修复...')
  
  // 修复 Permissions-Policy 头部
  fixPermissionsPolicy()
  
  // 确保菜单可见
  ensureMenuVisibility()
  
  // 修复样式问题
  fixStyles()
  
  console.log('部署后修复完成')
}

// 页面加载完成后执行修复
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDeploymentFixes)
} else {
  initDeploymentFixes()
}