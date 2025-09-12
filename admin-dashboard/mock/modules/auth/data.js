/**
 * 认证模块数据
 * 包含用户、角色、权限等基础数据
 */

const { userGenerator, dateGenerator, random } = require('../../utils/generators');

// 权限数据
const permissions = [
  // 系统管理权限
  { id: 1, permKey: 'system', name: '系统管理', type: 'menu', icon: 'setting', sort: 1 },
  { id: 2, permKey: 'system:user', name: '用户管理', type: 'menu', parentId: 1, path: '/system/users', icon: 'user', sort: 1 },
  { id: 3, permKey: 'system:user:view', name: '查看用户', type: 'button', parentId: 2, sort: 1 },
  { id: 4, permKey: 'system:user:add', name: '新增用户', type: 'button', parentId: 2, sort: 2 },
  { id: 5, permKey: 'system:user:edit', name: '编辑用户', type: 'button', parentId: 2, sort: 3 },
  { id: 6, permKey: 'system:user:delete', name: '删除用户', type: 'button', parentId: 2, sort: 4 },
  
  { id: 7, permKey: 'system:role', name: '角色管理', type: 'menu', parentId: 1, path: '/system/roles', icon: 'team', sort: 2 },
  { id: 8, permKey: 'system:role:view', name: '查看角色', type: 'button', parentId: 7, sort: 1 },
  { id: 9, permKey: 'system:role:add', name: '新增角色', type: 'button', parentId: 7, sort: 2 },
  { id: 10, permKey: 'system:role:edit', name: '编辑角色', type: 'button', parentId: 7, sort: 3 },
  { id: 11, permKey: 'system:role:delete', name: '删除角色', type: 'button', parentId: 7, sort: 4 },

  // 内容管理权限
  { id: 20, permKey: 'content', name: '内容管理', type: 'menu', icon: 'file-text', sort: 2 },
  { id: 21, permKey: 'content:post', name: '帖子管理', type: 'menu', parentId: 20, path: '/content/posts', icon: 'edit', sort: 1 },
  { id: 22, permKey: 'content:post:view', name: '查看帖子', type: 'button', parentId: 21, sort: 1 },
  { id: 23, permKey: 'content:post:add', name: '发布帖子', type: 'button', parentId: 21, sort: 2 },
  { id: 24, permKey: 'content:post:edit', name: '编辑帖子', type: 'button', parentId: 21, sort: 3 },
  { id: 25, permKey: 'content:post:delete', name: '删除帖子', type: 'button', parentId: 21, sort: 4 },

  { id: 26, permKey: 'content:category', name: '分类管理', type: 'menu', parentId: 20, path: '/content/categories', icon: 'folder', sort: 2 },
  { id: 27, permKey: 'content:category:view', name: '查看分类', type: 'button', parentId: 26, sort: 1 },
  { id: 28, permKey: 'content:category:add', name: '新增分类', type: 'button', parentId: 26, sort: 2 },
  { id: 29, permKey: 'content:category:edit', name: '编辑分类', type: 'button', parentId: 26, sort: 3 },
  { id: 30, permKey: 'content:category:delete', name: '删除分类', type: 'button', parentId: 26, sort: 4 },

  // 审核管理权限
  { id: 40, permKey: 'audit', name: '审核管理', type: 'menu', icon: 'check-circle', sort: 3 },
  { id: 41, permKey: 'audit:task', name: '审核任务', type: 'menu', parentId: 40, path: '/audit/tasks', icon: 'check', sort: 1 },
  { id: 42, permKey: 'audit:task:view', name: '查看审核', type: 'button', parentId: 41, sort: 1 },
  { id: 43, permKey: 'audit:task:approve', name: '审核通过', type: 'button', parentId: 41, sort: 2 },
  { id: 44, permKey: 'audit:task:reject', name: '审核拒绝', type: 'button', parentId: 41, sort: 3 },

  // 仪表盘权限
  { id: 60, permKey: 'dashboard', name: '仪表盘', type: 'menu', path: '/dashboard', icon: 'dashboard', sort: 0 },
  { id: 61, permKey: 'dashboard:view', name: '查看仪表盘', type: 'button', parentId: 60, sort: 1 }
];

// 角色数据
const roles = [
  {
    id: 1,
    name: '超级管理员',
    code: 'super_admin',
    description: '系统超级管理员，拥有所有权限',
    permissions: permissions,
    dataScope: 'ALL',
    status: 1,
    createTime: '2023-01-01T00:00:00.000Z',
    updateTime: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    name: '内容管理员',
    code: 'content_admin',
    description: '负责内容审核和管理',
    permissions: permissions.filter(p => p.permKey.includes('content') || p.permKey.includes('audit') || p.permKey === 'dashboard' || p.permKey === 'dashboard:view'),
    dataScope: 'DEPT',
    status: 1,
    createTime: '2023-01-01T00:00:00.000Z',
    updateTime: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 3,
    name: '普通编辑',
    code: 'editor',
    description: '内容编辑人员',
    permissions: permissions.filter(p => 
      p.permKey.includes('content:post') || 
      p.permKey.includes('content:category:view') ||
      p.permKey === 'dashboard' || 
      p.permKey === 'dashboard:view'
    ),
    dataScope: 'SELF',
    status: 1,
    createTime: '2023-01-01T00:00:00.000Z',
    updateTime: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 4,
    name: '访客',
    code: 'viewer',
    description: '只读权限的访客用户',
    permissions: [
      permissions.find(p => p.permKey === 'dashboard'),
      permissions.find(p => p.permKey === 'dashboard:view')
    ].filter(Boolean),
    dataScope: 'SELF',
    status: 1,
    createTime: '2023-01-01T00:00:00.000Z',
    updateTime: '2023-01-01T00:00:00.000Z'
  }
];

// 用户组数据
const userGroups = [
  { id: 1, name: '管理组', description: '系统管理员组', status: 1 },
  { id: 2, name: '编辑组', description: '内容编辑组', status: 1 },
  { id: 3, name: '用户组', description: '普通用户组', status: 1 }
];

// 生成用户数据
const generateUsers = () => {
  const users = [];

  // 管理员用户
  users.push({
    id: 1,
    username: 'admin',
    name: '超级管理员',
    nickname: '管理员',
    email: 'admin@example.com',
    phone: '13800138001',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    groupId: 1,
    group: userGroups[0],
    department: '技术部',
    position: '系统管理员',
    bio: '负责系统整体管理和维护',
    status: 1,
    roles: [roles[0]],
    createTime: '2023-01-01T00:00:00.000Z',
    updateTime: '2023-01-01T00:00:00.000Z',
    lastLoginTime: new Date().toISOString()
  });

  // 内容管理员
  users.push({
    id: 2,
    username: 'content_admin',
    name: '内容管理员',
    nickname: '小李',
    email: 'content@example.com',
    phone: '13800138002',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=content',
    groupId: 2,
    group: userGroups[1],
    department: '内容部',
    position: '内容管理员',
    bio: '负责内容审核和管理工作',
    status: 1,
    roles: [roles[1]],
    createTime: '2023-01-01T00:00:00.000Z',
    updateTime: '2023-01-01T00:00:00.000Z',
    lastLoginTime: dateGenerator.toISO(dateGenerator.recentDays(1))
  });

  // 编辑用户
  users.push({
    id: 3,
    username: 'editor',
    name: '张编辑',
    nickname: '小张',
    email: 'editor@example.com',
    phone: '13800138003',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor',
    groupId: 2,
    group: userGroups[1],
    department: '编辑部',
    position: '内容编辑',
    bio: '负责日常内容编辑和发布',
    status: 1,
    roles: [roles[2]],
    createTime: '2023-01-01T00:00:00.000Z',
    updateTime: '2023-01-01T00:00:00.000Z',
    lastLoginTime: dateGenerator.toISO(dateGenerator.recentDays(2))
  });

  // 访客用户
  users.push({
    id: 4,
    username: 'viewer',
    name: '访客用户',
    nickname: '访客',
    email: 'viewer@example.com',
    phone: '13800138004',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=viewer',
    groupId: 3,
    group: userGroups[2],
    department: '外部',
    position: '访客',
    bio: '系统访客用户',
    status: 1,
    roles: [roles[3]],
    createTime: '2023-01-01T00:00:00.000Z',
    updateTime: '2023-01-01T00:00:00.000Z',
    lastLoginTime: dateGenerator.toISO(dateGenerator.recentDays(7))
  });

  return users;
};

// 构建菜单树
const buildMenuTree = (permissions, parentId = null) => {
  return permissions
    .filter(p => p.parentId === parentId && p.type === 'menu')
    .map(p => ({
      id: p.id,
      name: p.name,
      path: p.path,
      icon: p.icon,
      meta: {
        hideInMenu: false,
        title: p.name,
        icon: p.icon
      },
      children: buildMenuTree(permissions, p.id).length > 0 ? buildMenuTree(permissions, p.id) : undefined
    }))
    .sort((a, b) => (a.sort || 0) - (b.sort || 0));
};

// 模拟验证码数据存储
const captchaStore = new Map();

// 生成验证码
const generateCaptcha = () => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let captcha = '';
  for (let i = 0; i < 4; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const key = random.uuid();
  
  // 存储验证码，5分钟后过期
  captchaStore.set(key, {
    code: captcha,
    expires: Date.now() + 5 * 60 * 1000
  });
  
  return { captcha, key };
};

// 验证验证码
const validateCaptcha = (key, code) => {
  const captchaData = captchaStore.get(key);
  if (!captchaData) return false;
  
  if (Date.now() > captchaData.expires) {
    captchaStore.delete(key);
    return false;
  }
  
  const isValid = captchaData.code.toLowerCase() === code.toLowerCase();
  if (isValid) {
    captchaStore.delete(key); // 验证成功后删除
  }
  
  return isValid;
};

// Token存储
const tokenStore = new Map();

// 生成Token
const generateToken = (user) => {
  const token = `mock_token_${user.id}_${Date.now()}`;
  const refreshToken = `mock_refresh_${user.id}_${Date.now()}`;
  
  const tokenData = {
    token,
    refreshToken,
    userId: user.id,
    expires: Date.now() + 2 * 60 * 60 * 1000, // 2小时
    refreshExpires: Date.now() + 24 * 60 * 60 * 1000 // 24小时
  };
  
  tokenStore.set(token, tokenData);
  return tokenData;
};

// 验证Token
const validateToken = (token) => {
  const tokenData = tokenStore.get(token);
  if (!tokenData) return null;
  
  if (Date.now() > tokenData.expires) {
    tokenStore.delete(token);
    return null;
  }
  
  return tokenData;
};

// 刷新Token
const refreshTokenData = (refreshToken) => {
  const tokenData = Array.from(tokenStore.values()).find(t => t.refreshToken === refreshToken);
  if (!tokenData || Date.now() > tokenData.refreshExpires) {
    return null;
  }
  
  // 删除旧token
  tokenStore.delete(tokenData.token);
  
  // 生成新token
  const user = getUserById(tokenData.userId);
  if (!user) return null;
  
  return generateToken(user);
};

// 根据ID获取用户
const getUserById = (id) => {
  return generateUsers().find(u => u.id === parseInt(id));
};

// 根据用户名获取用户
const getUserByUsername = (username) => {
  return generateUsers().find(u => u.username === username);
};

module.exports = {
  permissions,
  roles,
  userGroups,
  users: generateUsers(),
  getUserById,
  getUserByUsername,
  buildMenuTree,
  generateCaptcha,
  validateCaptcha,
  generateToken,
  validateToken,
  refreshTokenData
};