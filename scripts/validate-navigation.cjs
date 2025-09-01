#!/usr/bin/env node

/**
 * 导航结构验证脚本
 * 用于验证新的导航结构是否符合要求
 */

const fs = require('fs')
const path = require('path')

// 颜色输出函数
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`
}

function log(level, message) {
  const timestamp = new Date().toISOString()
  switch (level) {
    case 'success':
      console.log(`${colors.green('✓')} ${message}`)
      break
    case 'error':
      console.log(`${colors.red('✗')} ${message}`)
      break
    case 'warning':
      console.log(`${colors.yellow('⚠')} ${message}`)
      break
    case 'info':
      console.log(`${colors.blue('ℹ')} ${message}`)
      break
    default:
      console.log(`${message}`)
  }
}

// 验证路由文件结构
function validateRouterStructure() {
  log('info', '验证路由文件结构...')
  
  const routerPath = path.join(__dirname, '../src/router/index.ts')
  if (!fs.existsSync(routerPath)) {
    log('error', '路由文件不存在')
    return false
  }
  
  const routerContent = fs.readFileSync(routerPath, 'utf8')
  
  // 检查重要的路由路径
  const requiredRoutes = [
    'dashboard',
    'rbac',
    'content', 
    'news',
    'banner',
    'flea-market',
    'quotation',
    'operation',
    'system'
  ]
  
  const missingRoutes = []
  requiredRoutes.forEach(route => {
    if (!routerContent.includes(`path: '${route}'`)) {
      missingRoutes.push(route)
    }
  })
  
  if (missingRoutes.length > 0) {
    log('error', `缺少必要的路由: ${missingRoutes.join(', ')}`)
    return false
  }
  
  // 检查重定向设置
  const redirects = [
    'redirect: \'/content/categories\'',
    'redirect: \'/flea-market/categories\'',
    'redirect: \'/banner/list\'',
  ]
  
  const missingRedirects = []
  redirects.forEach(redirect => {
    if (!routerContent.includes(redirect)) {
      missingRedirects.push(redirect)
    }
  })
  
  if (missingRedirects.length > 0) {
    log('warning', `缺少一些重定向设置: ${missingRedirects.length}个`)
  }
  
  log('success', '路由文件结构验证通过')
  return true
}

// 验证菜单过滤器
function validateMenuFilter() {
  log('info', '验证菜单过滤器...')
  
  const menuFilterPath = path.join(__dirname, '../src/composables/useMenuFilter.ts')
  if (!fs.existsSync(menuFilterPath)) {
    log('error', '菜单过滤器文件不存在')
    return false
  }
  
  const menuFilterContent = fs.readFileSync(menuFilterPath, 'utf8')
  
  // 检查角色定义
  const requiredRoles = [
    'SUPER_ADMIN',
    'ADMIN', 
    'CONTENT_MANAGER',
    'AUDIT_MANAGER',
    'OPERATION_MANAGER',
    'EDITOR',
    'VIEWER'
  ]
  
  const missingRoles = []
  requiredRoles.forEach(role => {
    if (!menuFilterContent.includes(role)) {
      missingRoles.push(role)
    }
  })
  
  if (missingRoles.length > 0) {
    log('error', `缺少角色定义: ${missingRoles.join(', ')}`)
    return false
  }
  
  log('success', '菜单过滤器验证通过')
  return true
}

// 验证布局组件
function validateLayoutComponent() {
  log('info', '验证布局组件...')
  
  const layoutPath = path.join(__dirname, '../src/layout/index.vue')
  if (!fs.existsSync(layoutPath)) {
    log('error', '布局组件文件不存在')
    return false
  }
  
  const layoutContent = fs.readFileSync(layoutPath, 'utf8')
  
  // 检查是否使用了菜单过滤器
  if (!layoutContent.includes('useMenuFilter')) {
    log('error', '布局组件未使用菜单过滤器')
    return false
  }
  
  // 检查用户角色显示
  if (!layoutContent.includes('user-role')) {
    log('warning', '布局组件可能缺少用户角色显示')
  }
  
  log('success', '布局组件验证通过')
  return true
}

// 验证Store文件
function validateAuthStore() {
  log('info', '验证认证Store...')
  
  const authStorePath = path.join(__dirname, '../src/stores/auth.ts')
  if (!fs.existsSync(authStorePath)) {
    log('error', '认证Store文件不存在')
    return false
  }
  
  const authStoreContent = fs.readFileSync(authStorePath, 'utf8')
  
  // 检查默认菜单生成函数
  if (!authStoreContent.includes('generateDefaultMenus')) {
    log('error', '认证Store缺少默认菜单生成函数')
    return false
  }
  
  // 检查更新后的菜单结构
  const updatedMenuItems = [
    '板块管理',
    'Banner列表',
    '分类管理',
    '举报管理',
    '审计日志'
  ]
  
  const missingMenuItems = []
  updatedMenuItems.forEach(item => {
    if (!authStoreContent.includes(item)) {
      missingMenuItems.push(item)
    }
  })
  
  if (missingMenuItems.length > 0) {
    log('warning', `Store中可能缺少更新的菜单项: ${missingMenuItems.length}个`)
  }
  
  log('success', '认证Store验证通过')
  return true
}

// 验证测试文件
function validateTests() {
  log('info', '验证测试文件...')
  
  const testFiles = [
    '../src/composables/__tests__/useMenuFilter.test.ts',
    '../tests/unit/router-navigation-structure.test.ts'
  ]
  
  let allTestsExist = true
  testFiles.forEach(testFile => {
    const testPath = path.join(__dirname, testFile)
    if (!fs.existsSync(testPath)) {
      log('error', `测试文件不存在: ${testFile}`)
      allTestsExist = false
    }
  })
  
  if (!allTestsExist) {
    return false
  }
  
  log('success', '测试文件验证通过')
  return true
}

// 验证文件结构
function validateProjectStructure() {
  log('info', '验证项目结构...')
  
  const requiredDirectories = [
    '../src/composables',
    '../src/stores', 
    '../src/router',
    '../src/layout',
    '../src/views/rbac',
    '../src/views/content',
    '../src/views/banner',
    '../src/views/flea-market',
    '../src/views/quotation',
    '../src/views/operation',
    '../src/views/system',
    '../src/views/news'
  ]
  
  let allDirsExist = true
  requiredDirectories.forEach(dir => {
    const dirPath = path.join(__dirname, dir)
    if (!fs.existsSync(dirPath)) {
      log('error', `必要目录不存在: ${dir}`)
      allDirsExist = false
    }
  })
  
  if (!allDirsExist) {
    return false
  }
  
  log('success', '项目结构验证通过')
  return true
}

// 主验证函数
async function runValidation() {
  console.log(colors.cyan('🚀 开始验证导航结构调整...'))
  console.log('')
  
  const validations = [
    { name: '项目结构', fn: validateProjectStructure },
    { name: '路由文件', fn: validateRouterStructure },
    { name: '菜单过滤器', fn: validateMenuFilter },
    { name: '布局组件', fn: validateLayoutComponent },
    { name: '认证Store', fn: validateAuthStore },
    { name: '测试文件', fn: validateTests }
  ]
  
  let passedCount = 0
  let totalCount = validations.length
  
  for (const validation of validations) {
    try {
      const result = validation.fn()
      if (result) {
        passedCount++
      }
    } catch (error) {
      log('error', `验证 ${validation.name} 时发生错误: ${error.message}`)
    }
    console.log('')
  }
  
  // 总结
  console.log(colors.cyan('📊 验证结果总结:'))
  console.log(`总计: ${totalCount} 项验证`)
  console.log(`通过: ${colors.green(passedCount)} 项`)
  console.log(`失败: ${colors.red(totalCount - passedCount)} 项`)
  
  if (passedCount === totalCount) {
    console.log('')
    console.log(colors.green('🎉 所有验证都通过了！导航结构调整成功完成。'))
    console.log('')
    console.log(colors.blue('主要改进包括:'))
    console.log(colors.blue('• 调整了菜单顺序以符合业务逻辑'))
    console.log(colors.blue('• 实现了基于角色的动态菜单系统'))
    console.log(colors.blue('• 更新了Banner管理的子菜单结构'))
    console.log(colors.blue('• 优化了跳蚤市场和内容管理的页面顺序'))
    console.log(colors.blue('• 完善了权限控制和用户体验'))
    console.log('')
    process.exit(0)
  } else {
    console.log('')
    console.log(colors.red('❌ 部分验证失败，请检查上述错误信息'))
    process.exit(1)
  }
}

// 运行验证
if (require.main === module) {
  runValidation().catch(console.error)
}

module.exports = {
  runValidation,
  validateRouterStructure,
  validateMenuFilter,
  validateLayoutComponent,
  validateAuthStore,
  validateTests,
  validateProjectStructure
}