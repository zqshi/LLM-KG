import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/Home.vue'),
    meta: {
      title: '首页',
      requiresAuth: false
    }
  },
  {
    path: '/news',
    name: 'News',
    component: () => import('@/views/news/News.vue'),
    meta: {
      title: '资讯中心',
      requiresAuth: false
    }
  },
  {
    path: '/news/:id',
    name: 'NewsDetail',
    component: () => import('@/views/news/NewsDetail.vue'),
    meta: {
      title: '资讯详情',
      requiresAuth: false
    }
  },
  {
    path: '/knowledge',
    name: 'Knowledge',
    component: () => import('@/views/knowledge/Knowledge.vue'),
    meta: {
      title: '知识平台',
      requiresAuth: false
    }
  },
  {
    path: '/knowledge/:id',
    name: 'KnowledgeDetail',
    component: () => import('@/views/knowledge/KnowledgeDetail.vue'),
    meta: {
      title: '知识详情',
      requiresAuth: false
    }
  },
  {
    path: '/forum',
    name: 'Forum',
    component: () => import('@/views/forum/Forum.vue'),
    meta: {
      title: '企业论坛',
      requiresAuth: false
    }
  },
  {
    path: '/forum/post/:id',
    name: 'ForumPost',
    component: () => import('@/views/forum/PostDetail.vue'),
    meta: {
      title: '帖子详情',
      requiresAuth: false
    }
  },
  {
    path: '/forum/create',
    name: 'CreatePost',
    component: () => import('@/views/forum/CreatePost.vue'),
    meta: {
      title: '发布帖子',
      requiresAuth: true
    }
  },
  {
    path: '/forum/poll/:id',
    name: 'PollPost',
    component: () => import('@/views/forum/PollPost.vue'),
    meta: {
      title: '投票帖详情',
      requiresAuth: false
    }
  },
  {
    path: '/market',
    name: 'Market',
    component: () => import('@/views/market/Market.vue'),
    meta: {
      title: '跳蚤市场',
      requiresAuth: false
    }
  },
  {
    path: '/market/:id',
    name: 'MarketDetail',
    component: () => import('@/views/market/ItemDetail.vue'),
    meta: {
      title: '商品详情',
      requiresAuth: false
    }
  },
  {
    path: '/market/publish',
    name: 'PublishItem',
    component: () => import('@/views/market/PublishItem.vue'),
    meta: {
      title: '发布商品',
      requiresAuth: true
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/profile/Profile.vue'),
    meta: {
      title: '个人中心',
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '页面未找到',
      requiresAuth: false
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 企业门户系统`
  }
  
  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    const isLoggedIn = localStorage.getItem('enterprise-portal-user')
    if (!isLoggedIn) {
      next('/login')
      return
    }
  }
  
  next()
})

export default router