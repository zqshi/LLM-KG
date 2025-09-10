// 完整的超级管理员权限配置
export const SUPER_ADMIN_PERMISSIONS = [
  // 仪表盘权限
  'dashboard:view', 'dashboard:stats', 'dashboard:export',
  
  // RBAC权限 - 组织架构
  'rbac:org:view', 'rbac:org:create', 'rbac:org:edit', 'rbac:org:delete', 'rbac:org:move',
  
  // RBAC权限 - 用户管理
  'rbac:user:view', 'rbac:user:create', 'rbac:user:edit', 'rbac:user:delete', 'rbac:user:assign',
  'rbac:user:resetpwd', 'rbac:user:export', 'rbac:user:import', 'rbac:user:toggle',
  
  // RBAC权限 - 角色管理
  'rbac:role:view', 'rbac:role:create', 'rbac:role:edit', 'rbac:role:delete', 'rbac:role:copy',
  'rbac:role:assign', 'rbac:role:export',
  
  // RBAC权限 - 权限管理
  'rbac:permission:view', 'rbac:permission:create', 'rbac:permission:edit', 'rbac:permission:delete',
  'rbac:permission:tree', 'rbac:permission:export',
  
  // RBAC权限 - 同步配置
  'rbac:sync:config', 'rbac:sync:execute', 'rbac:sync:history', 'rbac:sync:test',
  
  // 内容管理权限 - 所有模块
  'content:view', 'content:create', 'content:edit', 'content:delete', 'content:audit',
  'content:publish', 'content:unpublish', 'content:top', 'content:elite', 'content:lock',
  'content:category:view', 'content:category:create', 'content:category:edit', 'content:category:delete',
  'content:polls:view', 'content:polls:create', 'content:polls:edit', 'content:polls:delete',
  'content:dashboard:view', 'content:export', 'content:import', 'content:batch',
  
  // 资讯聚合管理权限
  'news:sources:view', 'news:sources:create', 'news:sources:edit', 'news:sources:delete',
  'news:content:view', 'news:content:edit', 'news:content:delete', 'news:content:audit',
  'news:content:publish', 'news:tasks:view', 'news:tasks:execute', 'news:export',
  
  // Banner管理权限
  'banner:view', 'banner:create', 'banner:edit', 'banner:delete', 'banner:audit',
  'banner:approve', 'banner:reject', 'banner:publish', 'banner:todo', 'banner:done',
  'banner:tracking', 'banner:export',
  
  // 跳蚤市场管理权限
  'flea:categories:view', 'flea:categories:create', 'flea:categories:edit', 'flea:categories:delete',
  'flea:goods:view', 'flea:goods:create', 'flea:goods:edit', 'flea:goods:delete',
  'flea:goods:audit', 'flea:reports:view', 'flea:reports:handle', 'flea:dashboard:view',
  'flea:export', 'flea:batch',
  
  // 领导名言管理权限
  'quotation:view', 'quotation:create', 'quotation:edit', 'quotation:delete',
  'quotation:audit', 'quotation:publish', 'quotation:display:config', 'quotation:export',
  
  // 统一审核中心权限
  'audit:center:view', 'audit:tasks:view', 'audit:tasks:handle', 'audit:policies:view',
  'audit:policies:config', 'audit:sensitive:view', 'audit:sensitive:manage',
  'audit:batch', 'audit:assign', 'audit:export',
  
  // 运营与推荐管理权限
  'operation:homepage:view', 'operation:homepage:config', 'operation:recommendations:view',
  'operation:recommendations:manage', 'operation:rankings:view', 'operation:rankings:manage',
  'operation:dashboard:view', 'operation:export',
  
  // 门户配置管理权限
  'portal:navigation:view', 'portal:navigation:manage', 'portal:entry:view', 'portal:entry:manage',
  'portal:version:view', 'portal:version:manage', 'portal:performance:view', 'portal:export',
  
  // 系统管理权限
  'system:settings:view', 'system:settings:edit', 'system:logs:view', 'system:logs:export',
  'system:alerts:view', 'system:alerts:manage', 'system:backup', 'system:restore',
  'system:cache:clear', 'system:maintenance'
]

// 权限分组和描述
export const PERMISSION_GROUPS = {
  dashboard: {
    name: '仪表盘',
    permissions: [
      { key: 'dashboard:view', name: '查看仪表盘', type: 'view' },
      { key: 'dashboard:stats', name: '查看统计数据', type: 'view' },
      { key: 'dashboard:export', name: '导出数据', type: 'action' }
    ]
  },
  rbac: {
    name: '认证与权限管理',
    children: {
      org: {
        name: '组织架构',
        permissions: [
          { key: 'rbac:org:view', name: '查看组织架构', type: 'view' },
          { key: 'rbac:org:create', name: '创建组织', type: 'action' },
          { key: 'rbac:org:edit', name: '编辑组织', type: 'action' },
          { key: 'rbac:org:delete', name: '删除组织', type: 'action' },
          { key: 'rbac:org:move', name: '移动组织', type: 'action' }
        ]
      },
      user: {
        name: '用户管理',
        permissions: [
          { key: 'rbac:user:view', name: '查看用户', type: 'view' },
          { key: 'rbac:user:create', name: '创建用户', type: 'action' },
          { key: 'rbac:user:edit', name: '编辑用户', type: 'action' },
          { key: 'rbac:user:delete', name: '删除用户', type: 'action' },
          { key: 'rbac:user:assign', name: '分配角色', type: 'action' },
          { key: 'rbac:user:resetpwd', name: '重置密码', type: 'action' },
          { key: 'rbac:user:export', name: '导出用户数据', type: 'action' },
          { key: 'rbac:user:import', name: '导入用户数据', type: 'action' },
          { key: 'rbac:user:toggle', name: '启用/禁用用户', type: 'action' }
        ]
      },
      role: {
        name: '角色管理',
        permissions: [
          { key: 'rbac:role:view', name: '查看角色', type: 'view' },
          { key: 'rbac:role:create', name: '创建角色', type: 'action' },
          { key: 'rbac:role:edit', name: '编辑角色', type: 'action' },
          { key: 'rbac:role:delete', name: '删除角色', type: 'action' },
          { key: 'rbac:role:copy', name: '复制角色', type: 'action' },
          { key: 'rbac:role:assign', name: '分配权限', type: 'action' },
          { key: 'rbac:role:export', name: '导出角色数据', type: 'action' }
        ]
      },
      permission: {
        name: '权限管理',
        permissions: [
          { key: 'rbac:permission:view', name: '查看权限', type: 'view' },
          { key: 'rbac:permission:create', name: '创建权限', type: 'action' },
          { key: 'rbac:permission:edit', name: '编辑权限', type: 'action' },
          { key: 'rbac:permission:delete', name: '删除权限', type: 'action' },
          { key: 'rbac:permission:tree', name: '查看权限树', type: 'view' },
          { key: 'rbac:permission:export', name: '导出权限数据', type: 'action' }
        ]
      },
      sync: {
        name: '数据同步配置',
        permissions: [
          { key: 'rbac:sync:config', name: '配置同步', type: 'action' },
          { key: 'rbac:sync:execute', name: '执行同步', type: 'action' },
          { key: 'rbac:sync:history', name: '查看同步历史', type: 'view' },
          { key: 'rbac:sync:test', name: '测试连接', type: 'action' }
        ]
      }
    }
  },
  content: {
    name: '内容管理',
    permissions: [
      { key: 'content:view', name: '查看内容', type: 'view' },
      { key: 'content:create', name: '创建内容', type: 'action' },
      { key: 'content:edit', name: '编辑内容', type: 'action' },
      { key: 'content:delete', name: '删除内容', type: 'action' },
      { key: 'content:audit', name: '审核内容', type: 'action' },
      { key: 'content:publish', name: '发布内容', type: 'action' },
      { key: 'content:unpublish', name: '下线内容', type: 'action' },
      { key: 'content:top', name: '置顶内容', type: 'action' },
      { key: 'content:elite', name: '精华内容', type: 'action' },
      { key: 'content:lock', name: '锁定内容', type: 'action' },
      { key: 'content:category:view', name: '查看版块', type: 'view' },
      { key: 'content:category:create', name: '创建版块', type: 'action' },
      { key: 'content:category:edit', name: '编辑版块', type: 'action' },
      { key: 'content:category:delete', name: '删除版块', type: 'action' },
      { key: 'content:polls:view', name: '查看投票', type: 'view' },
      { key: 'content:polls:create', name: '创建投票', type: 'action' },
      { key: 'content:polls:edit', name: '编辑投票', type: 'action' },
      { key: 'content:polls:delete', name: '删除投票', type: 'action' },
      { key: 'content:dashboard:view', name: '查看数据看板', type: 'view' },
      { key: 'content:export', name: '导出内容数据', type: 'action' },
      { key: 'content:import', name: '导入内容数据', type: 'action' },
      { key: 'content:batch', name: '批量操作', type: 'action' }
    ]
  },
  news: {
    name: '资讯聚合管理',
    permissions: [
      { key: 'news:sources:view', name: '查看资讯源', type: 'view' },
      { key: 'news:sources:create', name: '创建资讯源', type: 'action' },
      { key: 'news:sources:edit', name: '编辑资讯源', type: 'action' },
      { key: 'news:sources:delete', name: '删除资讯源', type: 'action' },
      { key: 'news:content:view', name: '查看资讯内容', type: 'view' },
      { key: 'news:content:edit', name: '编辑资讯', type: 'action' },
      { key: 'news:content:delete', name: '删除资讯', type: 'action' },
      { key: 'news:content:audit', name: '审核资讯', type: 'action' },
      { key: 'news:content:publish', name: '发布资讯', type: 'action' },
      { key: 'news:tasks:view', name: '查看任务监控', type: 'view' },
      { key: 'news:tasks:execute', name: '执行爬取任务', type: 'action' },
      { key: 'news:export', name: '导出资讯数据', type: 'action' }
    ]
  },
  banner: {
    name: 'Banner管理',
    permissions: [
      { key: 'banner:view', name: '查看Banner', type: 'view' },
      { key: 'banner:create', name: '创建Banner', type: 'action' },
      { key: 'banner:edit', name: '编辑Banner', type: 'action' },
      { key: 'banner:delete', name: '删除Banner', type: 'action' },
      { key: 'banner:audit', name: '审核Banner', type: 'action' },
      { key: 'banner:approve', name: '批准Banner', type: 'action' },
      { key: 'banner:reject', name: '拒绝Banner', type: 'action' },
      { key: 'banner:publish', name: '发布Banner', type: 'action' },
      { key: 'banner:todo', name: '查看我的待办', type: 'view' },
      { key: 'banner:done', name: '查看我的已办', type: 'view' },
      { key: 'banner:tracking', name: '状态追踪', type: 'view' },
      { key: 'banner:export', name: '导出Banner数据', type: 'action' }
    ]
  },
  flea: {
    name: '跳蚤市场管理',
    permissions: [
      { key: 'flea:categories:view', name: '查看分类', type: 'view' },
      { key: 'flea:categories:create', name: '创建分类', type: 'action' },
      { key: 'flea:categories:edit', name: '编辑分类', type: 'action' },
      { key: 'flea:categories:delete', name: '删除分类', type: 'action' },
      { key: 'flea:goods:view', name: '查看商品', type: 'view' },
      { key: 'flea:goods:create', name: '创建商品', type: 'action' },
      { key: 'flea:goods:edit', name: '编辑商品', type: 'action' },
      { key: 'flea:goods:delete', name: '删除商品', type: 'action' },
      { key: 'flea:goods:audit', name: '审核商品', type: 'action' },
      { key: 'flea:reports:view', name: '查看举报', type: 'view' },
      { key: 'flea:reports:handle', name: '处理举报', type: 'action' },
      { key: 'flea:dashboard:view', name: '查看数据看板', type: 'view' },
      { key: 'flea:export', name: '导出数据', type: 'action' },
      { key: 'flea:batch', name: '批量操作', type: 'action' }
    ]
  },
  quotation: {
    name: '领导名言管理',
    permissions: [
      { key: 'quotation:view', name: '查看名言', type: 'view' },
      { key: 'quotation:create', name: '创建名言', type: 'action' },
      { key: 'quotation:edit', name: '编辑名言', type: 'action' },
      { key: 'quotation:delete', name: '删除名言', type: 'action' },
      { key: 'quotation:audit', name: '审核名言', type: 'action' },
      { key: 'quotation:publish', name: '发布名言', type: 'action' },
      { key: 'quotation:display:config', name: '展示配置', type: 'action' },
      { key: 'quotation:export', name: '导出数据', type: 'action' }
    ]
  },
  audit: {
    name: '统一审核中心',
    permissions: [
      { key: 'audit:center:view', name: '查看审核中心', type: 'view' },
      { key: 'audit:tasks:view', name: '查看审核任务', type: 'view' },
      { key: 'audit:tasks:handle', name: '处理审核任务', type: 'action' },
      { key: 'audit:policies:view', name: '查看审核策略', type: 'view' },
      { key: 'audit:policies:config', name: '配置审核策略', type: 'action' },
      { key: 'audit:sensitive:view', name: '查看敏感词', type: 'view' },
      { key: 'audit:sensitive:manage', name: '管理敏感词', type: 'action' },
      { key: 'audit:batch', name: '批量审核', type: 'action' },
      { key: 'audit:assign', name: '分配任务', type: 'action' },
      { key: 'audit:export', name: '导出数据', type: 'action' }
    ]
  },
  operation: {
    name: '运营与推荐管理',
    permissions: [
      { key: 'operation:homepage:view', name: '查看首页配置', type: 'view' },
      { key: 'operation:homepage:config', name: '配置首页', type: 'action' },
      { key: 'operation:recommendations:view', name: '查看推荐位', type: 'view' },
      { key: 'operation:recommendations:manage', name: '管理推荐位', type: 'action' },
      { key: 'operation:rankings:view', name: '查看榜单', type: 'view' },
      { key: 'operation:rankings:manage', name: '管理榜单', type: 'action' },
      { key: 'operation:dashboard:view', name: '查看数据看板', type: 'view' },
      { key: 'operation:export', name: '导出数据', type: 'action' }
    ]
  },
  portal: {
    name: '门户配置管理',
    permissions: [
      { key: 'portal:navigation:view', name: '查看导航管理', type: 'view' },
      { key: 'portal:navigation:manage', name: '管理导航', type: 'action' },
      { key: 'portal:entry:view', name: '查看入口面板', type: 'view' },
      { key: 'portal:entry:manage', name: '管理入口面板', type: 'action' },
      { key: 'portal:version:view', name: '查看版本管理', type: 'view' },
      { key: 'portal:version:manage', name: '版本管理', type: 'action' },
      { key: 'portal:performance:view', name: '查看性能监控', type: 'view' },
      { key: 'portal:export', name: '导出数据', type: 'action' }
    ]
  },
  system: {
    name: '配置与审计',
    permissions: [
      { key: 'system:settings:view', name: '查看系统配置', type: 'view' },
      { key: 'system:settings:edit', name: '修改系统配置', type: 'action' },
      { key: 'system:logs:view', name: '查看审计日志', type: 'view' },
      { key: 'system:logs:export', name: '导出日志', type: 'action' },
      { key: 'system:alerts:view', name: '查看操作告警', type: 'view' },
      { key: 'system:alerts:manage', name: '管理告警', type: 'action' },
      { key: 'system:backup', name: '数据备份', type: 'action' },
      { key: 'system:restore', name: '数据恢复', type: 'action' },
      { key: 'system:cache:clear', name: '清理缓存', type: 'action' },
      { key: 'system:maintenance', name: '系统维护', type: 'action' }
    ]
  }
}

// 数据权限范围
export const DATA_SCOPES = {
  1: { name: '全部数据权限', description: '可以查看和操作系统内所有数据' },
  2: { name: '本部门数据权限', description: '只能查看和操作本部门的数据' },
  3: { name: '本部门及子部门数据权限', description: '可以查看和操作本部门及其下级部门的数据' },
  4: { name: '本人数据权限', description: '只能查看和操作自己创建的数据' }
}

// 验证用户是否拥有超级管理员权限
export function isSuperAdmin(user: any): boolean {
  if (!user || !user.roles) return false
  
  return user.roles.some((role: any) => 
    ['super_admin', 'system_admin', 'admin'].includes(role.code) || 
    user.username === 'admin'
  )
}

// 验证用户是否拥有特定权限
export function hasPermission(user: any, permission: string): boolean {
  // 超级管理员拥有所有权限
  if (isSuperAdmin(user)) return true
  
  // 检查用户权限列表
  if (!user || !user.roles) return false
  
  return user.roles.some((role: any) => 
    role.permissions && role.permissions.includes(permission)
  )
}

// 验证用户是否拥有多个权限（AND关系）
export function hasPermissions(user: any, permissions: string[]): boolean {
  return permissions.every(permission => hasPermission(user, permission))
}

// 验证用户是否拥有任意权限（OR关系）
export function hasAnyPermission(user: any, permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(user, permission))
}