import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'element-plus/dist/index.css'
import './styles/index.css'

// 导入 ECharts 核心模块
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

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 注册 VChart 组件
app.component('VChart', VChart)

// 初始化stores
import { useUserStore } from './stores/user'
import { useContentStore } from './stores/content'

const userStore = useUserStore()
const contentStore = useContentStore()

// 初始化用户状态
if (userStore.isLoggedIn) {
  userStore.fetchNotifications()
}

// 初始化内容
contentStore.initializeContent()

app.mount('#app')