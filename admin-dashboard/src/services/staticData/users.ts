/**
 * 用户管理静态数据
 */

import type { User, Role, Permission, UserGroup } from '@/types'

// 权限点数据
export const permissions: Permission[] = [
  // 仪表盘权限
  { id: 1, name: '仪表盘查看', code: 'dashboard:view', type: 'menu', parentId: null, sort: 1 },
  
  // RBAC权限
  { id: 10, name: 'RBAC管理', code: 'rbac', type: 'menu', parentId: null, sort: 10 },
  { id: 11, name: '组织管理', code: 'rbac:org:view', type: 'menu', parentId: 10, sort: 1 },
  { id: 12, name: '组织创建', code: 'rbac:org:create', type: 'action', parentId: 11, sort: 1 },
  { id: 13, name: '组织编辑', code: 'rbac:org:update', type: 'action', parentId: 11, sort: 2 },
  { id: 14, name: '组织删除', code: 'rbac:org:delete', type: 'action', parentId: 11, sort: 3 },
  
  { id: 15, name: '用户管理', code: 'rbac:user:view', type: 'menu', parentId: 10, sort: 2 },
  { id: 16, name: '用户创建', code: 'rbac:user:create', type: 'action', parentId: 15, sort: 1 },
  { id: 17, name: '用户编辑', code: 'rbac:user:update', type: 'action', parentId: 15, sort: 2 },
  { id: 18, name: '用户删除', code: 'rbac:user:delete', type: 'action', parentId: 15, sort: 3 },
  
  { id: 19, name: '角色管理', code: 'rbac:role:view', type: 'menu', parentId: 10, sort: 3 },
  { id: 20, name: '角色创建', code: 'rbac:role:create', type: 'action', parentId: 19, sort: 1 },
  { id: 21, name: '角色编辑', code: 'rbac:role:update', type: 'action', parentId: 19, sort: 2 },
  { id: 22, name: '角色删除', code: 'rbac:role:delete', type: 'action', parentId: 19, sort: 3 },
  
  { id: 23, name: '权限管理', code: 'rbac:permission:view', type: 'menu', parentId: 10, sort: 4 },
  { id: 24, name: '权限创建', code: 'rbac:permission:create', type: 'action', parentId: 23, sort: 1 },
  { id: 25, name: '权限编辑', code: 'rbac:permission:update', type: 'action', parentId: 23, sort: 2 },
  { id: 26, name: '权限删除', code: 'rbac:permission:delete', type: 'action', parentId: 23, sort: 3 },
  
  { id: 27, name: '用户授权', code: 'rbac:user:assign', type: 'menu', parentId: 10, sort: 5 },
  { id: 28, name: '数据同步', code: 'rbac:sync:config', type: 'menu', parentId: 10, sort: 6 },
  
  // 内容管理权限
  { id: 30, name: '内容管理', code: 'content:view', type: 'menu', parentId: null, sort: 20 },
  { id: 31, name: '版块管理', code: 'content:category:view', type: 'menu', parentId: 30, sort: 1 },
  { id: 32, name: '内容编辑', code: 'content:edit', type: 'action', parentId: 30, sort: 2 },
  { id: 33, name: '内容审核', code: 'content:audit', type: 'action', parentId: 30, sort: 3 },
  { id: 34, name: '投票管理', code: 'content:poll:view', type: 'menu', parentId: 30, sort: 4 },
  { id: 35, name: '置顶加精', code: 'content:feature:review', type: 'menu', parentId: 30, sort: 5 },
  
  // 审核权限
  { id: 40, name: '审核管理', code: 'audit:view', type: 'menu', parentId: null, sort: 30 },
  
  // 门户配置权限
  { id: 50, name: '门户配置', code: 'portal:config:view', type: 'menu', parentId: null, sort: 40 },
  { id: 51, name: '导航管理', code: 'portal:navigation:view', type: 'menu', parentId: 50, sort: 1 },
  { id: 52, name: '面板管理', code: 'portal:panel:view', type: 'menu', parentId: 50, sort: 2 },
  { id: 53, name: '版本管理', code: 'portal:version:view', type: 'menu', parentId: 50, sort: 3 },
  { id: 54, name: '门户预览', code: 'portal:preview:view', type: 'menu', parentId: 50, sort: 4 },
  { id: 55, name: '性能监控', code: 'portal:performance:view', type: 'menu', parentId: 50, sort: 5 },
  
  // 系统管理权限
  { id: 60, name: '系统管理', code: 'system:view', type: 'menu', parentId: null, sort: 50 },
  { id: 61, name: '系统配置', code: 'system:settings:view', type: 'menu', parentId: 60, sort: 1 },
  { id: 62, name: '审计日志', code: 'system:logs:view', type: 'menu', parentId: 60, sort: 2 }
]

// 角色数据
export const roles: Role[] = [
  {
    id: 1,
    name: '超级管理员',
    code: 'super_admin',
    description: '拥有系统所有权限',
    dataScope: 'all',
    status: 1,
    sort: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    permissions: permissions
  },
  {
    id: 2,
    name: '系统管理员',
    code: 'admin',
    description: '系统管理员，除系统配置外的所有权限',
    dataScope: 'all',
    status: 1,
    sort: 2,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    permissions: permissions.filter(p => !p.code.startsWith('system:'))
  },
  {
    id: 3,
    name: '内容管理员',
    code: 'content_manager',
    description: '负责内容管理相关功能',
    dataScope: 'department',
    status: 1,
    sort: 3,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    permissions: permissions.filter(p => p.code.startsWith('content:') || p.code === 'dashboard:view')
  },
  {
    id: 4,
    name: '审核管理员',
    code: 'audit_manager',
    description: '负责内容审核相关功能',
    dataScope: 'department',
    status: 1,
    sort: 4,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    permissions: permissions.filter(p => p.code.startsWith('audit:') || p.code.startsWith('content:') || p.code === 'dashboard:view')
  },
  {
    id: 5,
    name: '运营管理员',
    code: 'operation_manager',
    description: '负责运营推荐管理',
    dataScope: 'self',
    status: 1,
    sort: 5,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    permissions: permissions.filter(p => p.code.includes('operation') || p.code === 'dashboard:view')
  },
  {
    id: 6,
    name: '普通编辑',
    code: 'editor',
    description: '基础内容编辑权限',
    dataScope: 'self',
    status: 1,
    sort: 6,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    permissions: [permissions.find(p => p.code === 'dashboard:view')!, permissions.find(p => p.code === 'content:edit')!]
  }
]

// 组织架构数据
export const organizations: UserGroup[] = [
  {
    id: 1,
    name: '总公司',
    code: 'headquarters',
    parentId: null,
    level: 1,
    sort: 1,
    description: '公司总部',
    status: 1,
    createTime: '2024-01-01 10:00:00',
    userCount: 25,
    children: [
      {
        id: 2,
        name: '技术部',
        code: 'tech_dept',
        parentId: 1,
        level: 2,
        sort: 1,
        description: '技术研发部门',
        status: 1,
        createTime: '2024-01-01 10:00:00',
        userCount: 12,
        children: [
          {
            id: 3,
            name: '前端组',
            code: 'frontend_team',
            parentId: 2,
            level: 3,
            sort: 1,
            description: '前端开发团队',
            status: 1,
            createTime: '2024-01-01 10:00:00',
            userCount: 5
          },
          {
            id: 4,
            name: '后端组',
            code: 'backend_team',
            parentId: 2,
            level: 3,
            sort: 2,
            description: '后端开发团队',
            status: 1,
            createTime: '2024-01-01 10:00:00',
            userCount: 7
          }
        ]
      },
      {
        id: 5,
        name: '产品部',
        code: 'product_dept',
        parentId: 1,
        level: 2,
        sort: 2,
        description: '产品设计部门',
        status: 1,
        createTime: '2024-01-01 10:00:00',
        userCount: 8
      },
      {
        id: 6,
        name: '运营部',
        code: 'operation_dept',
        parentId: 1,
        level: 2,
        sort: 3,
        description: '运营推广部门',
        status: 1,
        createTime: '2024-01-01 10:00:00',
        userCount: 5
      }
    ]
  }
]

// 用户数据
export const users: User[] = [
  {
    id: 1,
    username: 'admin',
    name: '系统管理员',
    email: 'admin@company.com',
    phone: '13800138000',
    avatar: '/avatars/admin.jpg',
    status: 1,
    group: organizations[0].children![0],
    roles: [roles[0]],
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00',
    lastLoginTime: '2024-12-14 15:30:00'
  },
  {
    id: 2,
    username: 'zhangsan',
    name: '张三',
    email: 'zhangsan@company.com',
    phone: '13800138001',
    avatar: '/avatars/zhangsan.jpg',
    status: 1,
    group: organizations[0].children![0].children![0],
    roles: [roles[2]],
    createTime: '2024-01-02 10:00:00',
    updateTime: '2024-01-02 10:00:00',
    lastLoginTime: '2024-12-14 14:20:00'
  },
  {
    id: 3,
    username: 'lisi',
    name: '李四',
    email: 'lisi@company.com',
    phone: '13800138002',
    avatar: '/avatars/lisi.jpg',
    status: 1,
    group: organizations[0].children![0].children![1],
    roles: [roles[2]],
    createTime: '2024-01-03 10:00:00',
    updateTime: '2024-01-03 10:00:00',
    lastLoginTime: '2024-12-14 13:45:00'
  },
  {
    id: 4,
    username: 'wangwu',
    name: '王五',
    email: 'wangwu@company.com',
    phone: '13800138003',
    avatar: '/avatars/wangwu.jpg',
    status: 1,
    group: organizations[0].children![1],
    roles: [roles[3]],
    createTime: '2024-01-04 10:00:00',
    updateTime: '2024-01-04 10:00:00',
    lastLoginTime: '2024-12-14 12:15:00'
  },
  {
    id: 5,
    username: 'zhaoliu',
    name: '赵六',
    email: 'zhaoliu@company.com',
    phone: '13800138004',
    avatar: '/avatars/zhaoliu.jpg',
    status: 1,
    group: organizations[0].children![2],
    roles: [roles[4]],
    createTime: '2024-01-05 10:00:00',
    updateTime: '2024-01-05 10:00:00',
    lastLoginTime: '2024-12-14 11:30:00'
  },
  {
    id: 6,
    username: 'sunqi',
    name: '孙七',
    email: 'sunqi@company.com',
    phone: '13800138005',
    avatar: '/avatars/sunqi.jpg',
    status: 1,
    group: organizations[0].children![0].children![0],
    roles: [roles[5]],
    createTime: '2024-01-06 10:00:00',
    updateTime: '2024-01-06 10:00:00',
    lastLoginTime: '2024-12-14 10:45:00'
  },
  {
    id: 7,
    username: 'zhouba',
    name: '周八',
    email: 'zhouba@company.com',
    phone: '13800138006',
    avatar: '/avatars/zhouba.jpg',
    status: 0,
    group: organizations[0].children![0].children![1],
    roles: [roles[5]],
    createTime: '2024-01-07 10:00:00',
    updateTime: '2024-01-07 10:00:00',
    lastLoginTime: '2024-12-10 16:20:00'
  },
  {
    id: 8,
    username: 'wujiu',
    name: '吴九',
    email: 'wujiu@company.com',
    phone: '13800138007',
    avatar: '/avatars/wujiu.jpg',
    status: 1,
    group: organizations[0].children![1],
    roles: [roles[3]],
    createTime: '2024-01-08 10:00:00',
    updateTime: '2024-01-08 10:00:00',
    lastLoginTime: '2024-12-14 09:30:00'
  },
  {
    id: 9,
    username: 'zhengshi',
    name: '郑十',
    email: 'zhengshi@company.com',
    phone: '13800138008',
    avatar: '/avatars/zhengshi.jpg',
    status: 1,
    group: organizations[0].children![2],
    roles: [roles[4]],
    createTime: '2024-01-09 10:00:00',
    updateTime: '2024-01-09 10:00:00',
    lastLoginTime: '2024-12-14 08:45:00'
  },
  {
    id: 10,
    username: 'chenyi',
    name: '陈一',
    email: 'chenyi@company.com',
    phone: '13800138009',
    avatar: '/avatars/chenyi.jpg',
    status: 1,
    group: organizations[0].children![0].children![0],
    roles: [roles[5]],
    createTime: '2024-01-10 10:00:00',
    updateTime: '2024-01-10 10:00:00',
    lastLoginTime: '2024-12-13 17:30:00'
  }
]

// 同步配置数据
export const syncConfigs = [
  {
    id: 1,
    name: 'LDAP用户同步',
    type: 'ldap',
    config: {
      server: 'ldap://company-ldap.com:389',
      baseDN: 'ou=users,dc=company,dc=com',
      bindDN: 'cn=admin,dc=company,dc=com',
      syncInterval: 3600
    },
    status: 1,
    lastSyncTime: '2024-12-14 06:00:00',
    nextSyncTime: '2024-12-14 07:00:00',
    createTime: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    name: 'AD域用户同步',
    type: 'ad',
    config: {
      server: 'ad.company.com',
      domain: 'COMPANY',
      syncInterval: 7200
    },
    status: 0,
    lastSyncTime: '2024-12-13 06:00:00',
    nextSyncTime: null,
    createTime: '2024-01-01 10:00:00'
  }
]