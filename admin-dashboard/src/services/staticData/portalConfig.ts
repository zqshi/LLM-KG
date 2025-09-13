/**
 * 门户配置管理静态数据
 */

import type {
  NavigationItem,
  EntryPanel,
  EntryItem,
  ConfigVersion,
  AuditLog,
  PortalStatistics
} from '@/types/navigation'
import {
  NavigationType,
  NavigationStatus,
  PanelDisplayMode,
  ConfigVersionType,
  AuditAction,
  ResourceType,
  AuditStatus
} from '@/types/navigation'

// 模拟导航数据
export const navigationItems: NavigationItem[] = [
  {
    id: 1,
    title: '首页',
    path: '/dashboard',
    icon: 'Home',
    type: NavigationType.INTERNAL,
    status: NavigationStatus.ACTIVE,
    sort_order: 1,
    created_at: '2024-01-01 10:00:00',
    updated_at: '2024-01-01 10:00:00',
    meta: {
      requiresAuth: true,
      cache: true
    }
  },
  {
    id: 2,
    title: '内容管理',
    icon: 'Document',
    type: NavigationType.DROPDOWN,
    status: NavigationStatus.ACTIVE,
    sort_order: 2,
    created_at: '2024-01-01 10:00:00',
    updated_at: '2024-01-01 10:00:00',
    children: [
      {
        id: 3,
        title: '文章管理',
        path: '/dashboard/content/articles',
        icon: 'Edit',
        type: NavigationType.INTERNAL,
        status: NavigationStatus.ACTIVE,
        sort_order: 1,
        parent_id: 2,
        created_at: '2024-01-01 10:00:00',
        updated_at: '2024-01-01 10:00:00'
      },
      {
        id: 4,
        title: '分类管理',
        path: '/dashboard/content/categories',
        icon: 'Folder',
        type: NavigationType.INTERNAL,
        status: NavigationStatus.ACTIVE,
        sort_order: 2,
        parent_id: 2,
        created_at: '2024-01-01 10:00:00',
        updated_at: '2024-01-01 10:00:00'
      }
    ]
  },
  {
    id: 5,
    title: '用户管理',
    path: '/dashboard/users',
    icon: 'User',
    type: NavigationType.INTERNAL,
    status: NavigationStatus.ACTIVE,
    sort_order: 3,
    created_at: '2024-01-01 10:00:00',
    updated_at: '2024-01-01 10:00:00'
  },
  {
    id: 6,
    title: '系统设置',
    icon: 'Setting',
    type: NavigationType.DROPDOWN,
    status: NavigationStatus.ACTIVE,
    sort_order: 4,
    created_at: '2024-01-01 10:00:00',
    updated_at: '2024-01-01 10:00:00',
    children: [
      {
        id: 7,
        title: '权限管理',
        path: '/dashboard/system/permissions',
        icon: 'Lock',
        type: NavigationType.INTERNAL,
        status: NavigationStatus.ACTIVE,
        sort_order: 1,
        parent_id: 6,
        created_at: '2024-01-01 10:00:00',
        updated_at: '2024-01-01 10:00:00'
      },
      {
        id: 8,
        title: '日志管理',
        path: '/dashboard/system/logs',
        icon: 'Document',
        type: NavigationType.INTERNAL,
        status: NavigationStatus.ACTIVE,
        sort_order: 2,
        parent_id: 6,
        created_at: '2024-01-01 10:00:00',
        updated_at: '2024-01-01 10:00:00'
      }
    ]
  },
  {
    id: 9,
    title: '外部链接',
    path: 'https://example.com',
    icon: 'Link',
    type: NavigationType.EXTERNAL,
    status: NavigationStatus.ACTIVE,
    sort_order: 5,
    target: '_blank',
    created_at: '2024-01-01 10:00:00',
    updated_at: '2024-01-01 10:00:00'
  }
]

// 模拟入口面板数据
export const entryPanels: EntryPanel[] = [
  {
    id: 1,
    name: 'quick-access',
    title: '快捷访问',
    description: '常用功能快速入口',
    icon: 'Bolt',
    display_mode: PanelDisplayMode.GRID,
    sort_order: 1,
    status: 'active',
    created_at: '2024-01-01 10:00:00',
    updated_at: '2024-01-01 10:00:00',
    config: {
      columns: 4,
      showHeader: true,
      showDescription: true
    },
    statistics: {
      totalItems: 8,
      activeItems: 8,
      clickCount: 1250
    }
  },
  {
    id: 2,
    name: 'recent-activity',
    title: '最近活动',
    description: '最近访问的功能模块',
    icon: 'Clock',
    display_mode: PanelDisplayMode.LIST,
    sort_order: 2,
    status: 'active',
    created_at: '2024-01-01 10:00:00',
    updated_at: '2024-01-01 10:00:00',
    config: {
      showHeader: true,
      showDescription: true,
      maxItems: 10
    }
  }
]

// 模拟入口项目数据
export const entryItems: EntryItem[] = [
  {
    id: 1,
    panel_id: 1,
    title: '新建文章',
    description: '创建新的内容文章',
    icon: 'Edit',
    url: '/dashboard/content/articles/create',
    target: '_self',
    sort_order: 1,
    status: 'active',
    created_at: '2024-01-01 10:00:00',
    updated_at: '2024-01-01 10:00:00',
    statistics: {
      clickCount: 125,
      lastAccessed: '2024-01-15 14:30:00'
    }
  },
  {
    id: 2,
    panel_id: 1,
    title: '用户管理',
    description: '管理系统用户和权限',
    icon: 'User',
    url: '/dashboard/users',
    target: '_self',
    sort_order: 2,
    status: 'active',
    created_at: '2024-01-01 10:00:00',
    updated_at: '2024-01-01 10:00:00',
    statistics: {
      clickCount: 89,
      lastAccessed: '2024-01-15 11:20:00'
    }
  },
  {
    id: 3,
    panel_id: 1,
    title: '数据统计',
    description: '查看系统运行数据',
    icon: 'DataLine',
    url: '/dashboard/analytics',
    target: '_self',
    sort_order: 3,
    status: 'active',
    created_at: '2024-01-01 10:00:00',
    updated_at: '2024-01-01 10:00:00',
    statistics: {
      clickCount: 210,
      lastAccessed: '2024-01-15 16:45:00'
    }
  },
  {
    id: 4,
    panel_id: 1,
    title: '系统设置',
    description: '配置系统参数',
    icon: 'Setting',
    url: '/dashboard/system/settings',
    target: '_self',
    sort_order: 4,
    status: 'active',
    created_at: '2024-01-01 10:00:00',
    updated_at: '2024-01-01 10:00:00',
    statistics: {
      clickCount: 67,
      lastAccessed: '2024-01-14 09:15:00'
    }
  }
]

// 模拟配置版本数据
export const configVersions: ConfigVersion[] = [
  {
    id: 1,
    name: '初始版本',
    description: '系统初始配置',
    type: ConfigVersionType.MANUAL,
    version_number: 'v1.0.0',
    status: 'archived',
    created_by: 1,
    is_current: false,
    created_at: '2024-01-01 10:00:00',
    updated_at: '2024-01-01 10:00:00',
    data: {
      navigations: navigationItems,
      entryPanels: entryPanels,
      metadata: {
        totalNavigations: navigationItems.length,
        totalPanels: entryPanels.length,
        totalEntryItems: entryItems.length,
        configHash: 'abc123'
      }
    }
  },
  {
    id: 2,
    name: '当前版本',
    description: '当前生效的配置',
    type: ConfigVersionType.MANUAL,
    version_number: 'v1.1.0',
    status: 'active',
    created_by: 1,
    is_current: true,
    created_at: '2024-01-10 15:30:00',
    updated_at: '2024-01-10 15:30:00',
    data: {
      navigations: navigationItems,
      entryPanels: entryPanels,
      metadata: {
        totalNavigations: navigationItems.length,
        totalPanels: entryPanels.length,
        totalEntryItems: entryItems.length,
        configHash: 'def456'
      }
    }
  }
]

// 模拟审计日志数据
export const auditLogs: AuditLog[] = [
  {
    id: 1,
    user_id: 1,
    user_name: '管理员',
    action: AuditAction.CREATE,
    resource_type: ResourceType.NAVIGATION,
    resource_id: 9,
    resource_name: '外部链接',
    status: AuditStatus.SUCCESS,
    ip_address: '192.168.1.100',
    created_at: '2024-01-15 14:30:00',
    updated_at: '2024-01-15 14:30:00',
    details: {
      after: {
        title: '外部链接',
        path: 'https://example.com',
        type: 'external'
      }
    },
    duration_ms: 120
  },
  {
    id: 2,
    user_id: 1,
    user_name: '管理员',
    action: AuditAction.UPDATE,
    resource_type: ResourceType.ENTRY_PANEL,
    resource_id: 1,
    resource_name: '快捷访问',
    status: AuditStatus.SUCCESS,
    ip_address: '192.168.1.100',
    created_at: '2024-01-14 09:15:00',
    updated_at: '2024-01-14 09:15:00',
    details: {
      before: {
        title: '快速访问'
      },
      after: {
        title: '快捷访问'
      },
      changes: ['title']
    },
    duration_ms: 85
  }
]

// 模拟门户统计信息
export const portalStatistics: PortalStatistics = {
  navigation: {
    total: navigationItems.length,
    active: navigationItems.filter(n => n.status === NavigationStatus.ACTIVE).length,
    inactive: navigationItems.filter(n => n.status === NavigationStatus.INACTIVE).length,
    draft: navigationItems.filter(n => n.status === NavigationStatus.DRAFT).length
  },
  entryPanel: {
    total: entryPanels.length,
    totalItems: entryItems.length,
    activeItems: entryItems.filter(i => i.status === 'active').length
  },
  version: {
    total: configVersions.length,
    current: configVersions.find(v => v.is_current)?.version_number || 'N/A',
    lastBackup: '2024-01-10 15:30:00'
  },
  audit: {
    totalLogs: auditLogs.length,
    todayLogs: auditLogs.filter(log => 
      new Date(log.created_at).toDateString() === new Date().toDateString()
    ).length,
    errorLogs: auditLogs.filter(log => log.status === AuditStatus.FAILED).length,
    activeUsers: 1
  }
}