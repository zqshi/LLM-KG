import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { title: '登录', hideInMenu: true }
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '全局仪表盘', icon: 'Monitor', permission: 'dashboard:view' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/PersonalInfo.vue'),
        meta: { title: '个人资料', icon: 'User' }
      },
      {
        path: 'demo',
        name: 'Demo',
        component: () => import('@/views/demo/VisualDemo.vue'),
        meta: { title: 'BlueTrade风格演示', icon: 'DataLine' }
      },
      {
        path: 'rbac',
        name: 'RBAC',
        redirect: '/rbac/organizations',
        meta: { title: '认证与权限管理', icon: 'Lock' },
        children: [
          {
            path: 'organizations',
            name: 'RBACOrganizations',
            component: () => import('@/views/rbac/Organizations.vue'),
            meta: { title: '组织架构', icon: 'OfficeBuilding', permission: 'rbac:org:view' }
          },
          {
            path: 'users',
            name: 'RBACUsers',
            component: () => import('@/views/rbac/Users.vue'),
            meta: { title: '用户管理', icon: 'User', permission: 'rbac:user:view' }
          },
          {
            path: 'roles',
            name: 'RBACRoles',
            component: () => import('@/views/rbac/Roles.vue'),
            meta: { title: '角色管理', icon: 'UserFilled', permission: 'rbac:role:view' }
          },
          {
            path: 'permissions',
            name: 'RBACPermissions',
            component: () => import('@/views/rbac/Permissions.vue'),
            meta: { title: '权限点管理', icon: 'Key', permission: 'rbac:permission:view' }
          },
          {
            path: 'user-roles',
            name: 'RBACUserRoles',
            component: () => import('@/views/rbac/UserRoles.vue'),
            meta: { title: '用户授权', icon: 'Avatar', permission: 'rbac:user:assign' }
          },
          {
            path: 'sync-config',
            name: 'RBACSyncConfig',
            component: () => import('@/views/rbac/SyncConfig.vue'),
            meta: { title: '数据同步配置', icon: 'Refresh', permission: 'rbac:sync:config' }
          }
        ]
      },
      {
        path: 'content',
        name: 'Content',
        redirect: '/content/categories',
        meta: { title: '内容管理', icon: 'Document', permission: 'content:view' },
        children: [
          {
            path: 'categories',
            name: 'ContentCategories',
            component: () => import('@/views/content/Categories.vue'),
            meta: { title: '版块管理', icon: 'FolderOpened', permission: 'content:category:view' }
          },
          {
            path: 'polls',
            name: 'ContentPolls',
            component: () => import('@/views/content/Polls.vue'),
            meta: { title: '投票管理', icon: 'DataBoard', permission: 'content:poll:view' }
          },
          {
            path: 'dashboard',
            name: 'ContentDashboard',
            component: () => import('@/views/content/Dashboard.vue'),
            meta: { title: '数据看板', icon: 'DataBoard', permission: 'content:view' }
          },
          {
            path: 'list',
            name: 'ContentList',
            component: () => import('@/views/content/List.vue'),
            meta: { title: '内容列表', icon: 'Document', permission: 'content:view' }
          },
          {
            path: 'detail/:id',
            name: 'ContentDetail',
            component: () => import('@/views/content/Detail.vue'),
            meta: { title: '内容详情', hideInMenu: true, permission: 'content:view' }
          },
          {
            path: 'edit/:id',
            name: 'ContentEdit',
            component: () => import('@/views/content/Edit.vue'),
            meta: { title: '编辑内容', hideInMenu: true, permission: 'content:edit' }
          },
          {
            path: 'feature-requests',
            name: 'ContentFeatureRequests',
            component: () => import('@/views/content/FeatureRequests.vue'),
            meta: { title: '置顶/加精申请', icon: 'Star', permission: 'content:feature:review' }
          },

          {
            path: 'category/:code',
            name: 'ContentCategoryHome',
            component: () => import('@/views/content/Category.vue'),
            meta: { title: '版块专属页', hideInMenu: true, permission: 'content:view' }
          },
          {
            path: 'category/:categoryId/:categoryName',
            name: 'ContentCategory',
            component: () => import('@/views/content/Category.vue'),
            meta: { title: '版块详情', hideInMenu: true, permission: 'content:view' }
          }
        ]
      },
      {
        path: 'news',
        name: 'News',
        redirect: '/news/sources',
        meta: { title: '资讯聚合管理', icon: 'Newspaper' },
        children: [
          {
            path: 'sources',
            name: 'NewsSources',
            component: () => import('@/views/news/Sources.vue'),
            meta: { title: '资讯源管理', icon: 'Connection' }
          },
          {
            path: 'content-pool',
            name: 'NewsContentPool',
            component: () => import('@/views/news/ContentPool.vue'),
            meta: { title: '资讯内容池', icon: 'DataBoard' }
          },
          {
            path: 'task-monitor',
            name: 'NewsTaskMonitor',
            component: () => import('@/views/news/TaskMonitor.vue'),
            meta: { title: '任务监控', icon: 'Monitor' }
          }
        ]
      },
      {
        path: 'banner',
        name: 'Banner',
        redirect: '/banner/list',
        meta: { title: 'Banner管理', icon: 'Picture' },
        children: [
          {
            path: 'list',
            name: 'BannerList',
            component: () => import('@/views/banner/List.vue'),
            meta: { title: 'Banner列表', icon: 'Picture' }
          },
          {
            path: 'my-todo',
            name: 'BannerMyTodo',
            component: () => import('@/views/banner/MyTodo.vue'),
            meta: { title: '我的待办', icon: 'Bell' }
          },
          {
            path: 'my-done',
            name: 'BannerMyDone',
            component: () => import('@/views/banner/MyDone.vue'),
            meta: { title: '我的已办', icon: 'CircleCheck' }
          },
          {
            path: 'status-tracking',
            name: 'BannerStatusTracking',
            component: () => import('@/views/banner/StatusTracking.vue'),
            meta: { title: '状态追踪', icon: 'DataLine' }
          }
        ]
      },
      {
        path: 'flea-market',
        name: 'FleaMarket',
        redirect: '/flea-market/categories',
        meta: { title: '跳蚤市场管理', icon: 'ShoppingCart' },
        children: [
          {
            path: 'categories',
            name: 'FleaMarketCategories',
            component: () => import('@/views/flea-market/Categories.vue'),
            meta: { title: '分类管理', icon: 'Menu' }
          },
          {
            path: 'goods',
            name: 'FleaMarketGoods',
            component: () => import('@/views/flea-market/Goods.vue'),
            meta: { title: '商品管理', icon: 'Goods' }
          },
          {
            path: 'reports',
            name: 'FleaMarketReports',
            component: () => import('@/views/flea-market/Reports.vue'),
            meta: { title: '举报管理', icon: 'Warning' }
          },
          {
            path: 'dashboard',
            name: 'FleaMarketDashboard',
            component: () => import('@/views/flea-market/Dashboard.vue'),
            meta: { title: '数据看板', icon: 'DataBoard' }
          }
        ]
      },
      {
        path: 'quotation',
        name: 'Quotation',
        redirect: '/quotation/list',
        meta: { title: '领导名言管理', icon: 'ChatDotRound' },
        children: [
          {
            path: 'list',
            name: 'QuotationList',
            component: () => import('@/views/quotation/List.vue'),
            meta: { title: '名言管理', icon: 'ChatDotRound' }
          },
          {
            path: 'display',
            name: 'QuotationDisplay',
            component: () => import('@/views/quotation/Display.vue'),
            meta: { title: '展示配置', icon: 'Setting' }
          }
        ]
      },
      {
        path: 'audit',
        name: 'Audit',
        redirect: '/audit/center',
        meta: { title: '统一审核中心', icon: 'Check', permission: 'audit:view' },
        children: [
          {
            path: 'center',
            name: 'AuditCenter',
            component: () => import('@/views/audit/Center.vue'),
            meta: { title: '审核中心', icon: 'Check', permission: 'audit:view' }
          }
        ]
      },
      {
        path: 'operation',
        name: 'Operation',
        redirect: '/operation/homepage',
        meta: { title: '运营与推荐管理', icon: 'Setting' },
        children: [
          {
            path: 'homepage',
            name: 'Homepage',
            component: () => import('@/views/operation/Homepage.vue'),
            meta: { title: '首页配置', icon: 'House' }
          },
          {
            path: 'recommendations',
            name: 'Recommendations',
            component: () => import('@/views/operation/Recommendations.vue'),
            meta: { title: '推荐位管理', icon: 'Star' }
          },
          {
            path: 'rankings',
            name: 'Rankings',
            component: () => import('@/views/operation/Rankings.vue'),
            meta: { title: '榜单管理', icon: 'TrendCharts' }
          },
          {
            path: 'dashboard',
            name: 'OperationDashboard',
            component: () => import('@/views/operation/Dashboard.vue'),
            meta: { title: '数据看板', icon: 'DataBoard' }
          },
          {
            path: 'ai-tools',
            name: 'AITools',
            redirect: '/operation/ai-tools/tools',
            meta: { title: '工具箱管理', icon: 'Tools' },
            children: [
              {
                path: 'tags',
                name: 'AIToolTags',
                component: () => import('@/views/operation/ai-tools/Tags.vue'),
                meta: { title: '工具标签', icon: 'Collection' }
              },
              {
                path: 'tools',
                name: 'AIToolsList',
                component: () => import('@/views/operation/ai-tools/Tools.vue'),
                meta: { title: '工具列表', icon: 'Box' }
              }
            ]
          },
          {
            path: 'feedback',
            name: 'FeedbackManagement',
            component: () => import('@/views/operation/feedback/List.vue'),
            meta: { title: '问题反馈管理', icon: 'ChatDotRound' }
          },
          {
            path: 'feedback/:id',
            name: 'FeedbackDetail',
            component: () => import('@/views/operation/feedback/Detail.vue'),
            meta: { title: '反馈详情', hideInMenu: true }
          }
        ]
      },
      {
        path: 'portal-config',
        name: 'PortalConfig',
        redirect: '/portal-config/navigation',
        meta: { title: '门户配置管理', icon: 'Grid', permission: 'portal:config:view' },
        children: [
          {
            path: 'navigation',
            name: 'PortalNavigation',
            component: () => import('@/views/portal-config/Navigation.vue'),
            meta: { title: '导航管理', icon: 'Menu', permission: 'portal:navigation:view' }
          },
          {
            path: 'entry-panel',
            name: 'PortalEntryPanel',
            component: () => import('@/views/portal-config/EntryPanel.vue'),
            meta: { title: '入口面板', icon: 'Grid', permission: 'portal:panel:view' }
          },
          {
            path: 'version-control',
            name: 'PortalVersionControl',
            component: () => import('@/views/portal-config/VersionControl.vue'),
            meta: { title: '版本管理', icon: 'Clock', permission: 'portal:version:view' }
          },

          {
            path: 'preview',
            name: 'PortalPreview',
            component: () => import('@/views/portal-config/PreviewPage.vue'),
            meta: { title: '门户预览', icon: 'View', permission: 'portal:preview:view', hideInMenu: true }
          },
          {
            path: 'performance',
            name: 'PortalPerformance',
            component: () => import('@/views/portal-config/PerformanceDashboard.vue'),
            meta: { title: '性能监控', icon: 'Monitor', permission: 'portal:performance:view' }
          }
        ]
      },
      {
        path: 'system',
        name: 'System',
        redirect: '/system/settings',
        meta: { title: '配置与审计', icon: 'Tools' },
        children: [
          {
            path: 'settings',
            name: 'SystemSettings',
            component: () => import('@/views/system/Settings.vue'),
            meta: { title: '系统配置', icon: 'Setting' }
          },
          {
            path: 'logs',
            name: 'SystemLogs',
            component: () => import('@/views/system/Logs.vue'),
            meta: { title: '审计日志', icon: 'Document', permission: 'system:logs:view' }
          },
          {
            path: 'alerts',
            name: 'SystemAlerts',
            component: () => import('@/views/system/Alerts.vue'),
            meta: { title: '操作告警', icon: 'Bell' }
          },
          {
            path: 'permissions-test',
            name: 'PermissionsTest',
            component: () => import('@/views/system/permissions-test.vue'),
            meta: { title: '权限验证', icon: 'Key', permission: 'system:settings:view', hideInMenu: true }
          }
        ]
      }
    ]
  },
  // 明确禁止访问的审计日志路径
  {
    path: '/rbac/audit-logs',
    redirect: '/system/logs'
  },
  {
    path: '/content/audit-logs',
    redirect: '/system/logs'
  },
  {
    path: '/audit/logs',
    redirect: '/system/logs'
  },
  {
    path: '/portal-config/audit-logs',
    redirect: '/system/logs'
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面未找到', hideInMenu: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
