import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIcons from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import { setupRouterGuards } from './router/guards'
import { useAuthStore } from './stores/auth'
import 'element-plus/dist/index.css'
import './styles/design-system.css'
import './styles/index.css'
import './styles/modal.css'

// 导入部署后修复工具
import { initDeploymentFixes } from './utils/deploymentFixes'

// 导入 ECharts 核心模块和组件
import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import type { Component } from 'vue'

// 注册 ECharts 组件
echarts.use([
  BarChart,
  LineChart, 
  PieChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  CanvasRenderer
])

console.log('=== 应用开始启动 ===')
console.log('=== 环境信息诊断 ===')
console.log('BASE_URL:', import.meta.env.BASE_URL)
console.log('VITE_STATIC_MODE:', import.meta.env.VITE_STATIC_MODE)
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)
console.log('当前URL:', window.location.href)
console.log('Hash值:', window.location.hash)
console.log('=== 环境信息诊断结束 ===')

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 注册所有 Element Plus 图标组件
for (const [key, component] of Object.entries(ElementPlusIcons)) {
  app.component(key, component)
}

// 注册 VChart 组件
app.component('VChart', VChart as unknown as Component)

console.log('=== Pinia和Router初始化完成 ===')

// 初始化auth store
const authStore = useAuthStore()

// 注释掉自动清除缓存的代码，避免登录状态丢失
// if (import.meta.env.DEV) {
//   console.log('开发环境：清除缓存数据')
//   localStorage.clear()
// }

authStore.initAuth()

console.log('=== Auth Store初始化完成 ===')
console.log('初始登录状态:', authStore.isLoggedIn)

// 初始化主题 store
import { useThemeStore } from './stores/theme'
const themeStore = useThemeStore()
themeStore.initTheme()

console.log('=== Theme Store初始化完成 ===')
console.log('当前主题:', themeStore.appliedTheme)

// 初始化反馈和A/B测试系统
import { useFeedbackStore } from './stores/feedback'
const feedbackStore = useFeedbackStore()
feedbackStore.restoreABTestVariants()
feedbackStore.initABTests()
feedbackStore.cleanupOldData()

console.log('=== Feedback Store初始化完成 ===')
console.log('A/B测试配置:', feedbackStore.abTests)

// 记录应用启动
feedbackStore.trackUserAction('app_started', {
  timestamp: Date.now(),
  userAgent: navigator.userAgent,
  url: window.location.href
})

// 初始化审核节点系统
import { AuditNodeFactory } from './api/auditNodeFactory'
console.log('=== 开始初始化审核节点系统 ===')

AuditNodeFactory.initializeAllNodes().then(() => {
  console.log('=== 审核节点系统初始化完成 ===')
}).catch(error => {
  console.error('=== 审核节点系统初始化失败 ===', error)
  // 审核节点初始化失败不应该阻止应用启动
})

// 设置路由守卫
setupRouterGuards(router)

console.log('=== 路由守卫设置完成，准备挂载应用 ===')

// 挂载应用
app.mount('#app')

// 执行部署后修复
initDeploymentFixes()

console.log('=== 应用挂载完成 ===')