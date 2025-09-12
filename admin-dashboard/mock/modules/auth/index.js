/**
 * 认证模块路由
 * 实现登录、登出、用户信息、权限验证等功能
 */

const express = require('express');
const { responseFormatter, logger } = require('../../utils/response');
const { validateMiddleware, commonRules } = require('../../utils/validators');
const {
  getUserByUsername,
  getUserById,
  buildMenuTree,
  generateCaptcha,
  validateCaptcha,
  generateToken,
  validateToken,
  refreshTokenData,
  users,
  permissions
} = require('./data');

const router = express.Router();

// 认证中间件
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(responseFormatter.unauthorized('请提供有效的访问令牌'));
  }
  
  const token = authHeader.substring(7);
  const tokenData = validateToken(token);
  
  if (!tokenData) {
    return res.status(401).json(responseFormatter.unauthorized('访问令牌已过期或无效'));
  }
  
  const user = getUserById(tokenData.userId);
  if (!user) {
    return res.status(401).json(responseFormatter.unauthorized('用户不存在'));
  }
  
  req.user = user;
  req.tokenData = tokenData;
  next();
};

// 登录接口
router.post('/login', validateMiddleware({
  username: commonRules.username,
  password: [{ type: 'required' }, { type: 'string', min: 1 }]
}), (req, res) => {
  const { username, password, remember, captcha } = req.body;
  
  try {
    // 查找用户
    const user = getUserByUsername(username);
    if (!user) {
      logger.warn('Login failed: user not found', { username });
      return res.status(401).json(responseFormatter.unauthorized('用户名或密码错误'));
    }
    
    // 检查用户状态
    if (user.status === 0) {
      logger.warn('Login failed: user disabled', { username });
      return res.status(401).json(responseFormatter.unauthorized('用户账号已被禁用'));
    }
    
    // 简化密码验证（在真实环境中应该使用加密比较）
    const validPasswords = {
      'admin': 'admin123',
      'content_admin': 'content123',
      'editor': 'editor123',
      'viewer': 'viewer123'
    };
    
    if (password !== validPasswords[username]) {
      logger.warn('Login failed: invalid password', { username });
      return res.status(401).json(responseFormatter.unauthorized('用户名或密码错误'));
    }
    
    // 生成Token
    const tokenData = generateToken(user);
    
    // 获取用户权限
    const userPermissions = user.roles.reduce((perms, role) => {
      role.permissions.forEach(perm => {
        if (!perms.includes(perm.permKey)) {
          perms.push(perm.permKey);
        }
      });
      return perms;
    }, []);
    
    // 构建菜单树
    const userMenuPermissions = user.roles.reduce((perms, role) => {
      return perms.concat(role.permissions);
    }, []);
    const menus = buildMenuTree(userMenuPermissions);
    
    // 更新用户最后登录时间
    user.lastLoginTime = new Date().toISOString();
    
    logger.info('User login successful', { 
      userId: user.id, 
      username: user.username,
      ip: req.ip
    });
    
    // 返回登录信息
    const response = {
      token: tokenData.token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        nickname: user.nickname,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        department: user.department,
        position: user.position,
        status: user.status,
        roles: user.roles.map(role => ({
          id: role.id,
          name: role.name,
          code: role.code,
          description: role.description
        })),
        lastLoginTime: user.lastLoginTime
      },
      permissions: userPermissions,
      menus
    };
    
    res.json(responseFormatter.success(response, '登录成功'));
    
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json(responseFormatter.serverError('登录失败，请稍后重试'));
  }
});

// 登出接口
router.post('/logout', authMiddleware, (req, res) => {
  try {
    logger.info('User logout', { 
      userId: req.user.id, 
      username: req.user.username 
    });
    
    // 在真实环境中，这里应该将token加入黑名单
    res.json(responseFormatter.success(null, '登出成功'));
    
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json(responseFormatter.serverError('登出失败'));
  }
});

// 获取当前用户信息
router.get('/user-info', authMiddleware, (req, res) => {
  try {
    const user = req.user;
    
    const userInfo = {
      id: user.id,
      username: user.username,
      name: user.name,
      nickname: user.nickname,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      groupId: user.groupId,
      group: user.group,
      department: user.department,
      position: user.position,
      bio: user.bio,
      status: user.status,
      roles: user.roles.map(role => ({
        id: role.id,
        name: role.name,
        code: role.code,
        description: role.description,
        dataScope: role.dataScope
      })),
      createTime: user.createTime,
      updateTime: user.updateTime,
      lastLoginTime: user.lastLoginTime
    };
    
    res.json(responseFormatter.success(userInfo, '获取用户信息成功'));
    
  } catch (error) {
    logger.error('Get user info error:', error);
    res.status(500).json(responseFormatter.serverError('获取用户信息失败'));
  }
});

// 获取用户菜单
router.get('/menus', authMiddleware, (req, res) => {
  try {
    const user = req.user;
    
    // 获取用户的所有权限
    const userPermissions = user.roles.reduce((perms, role) => {
      return perms.concat(role.permissions);
    }, []);
    
    // 构建菜单树
    const menus = buildMenuTree(userPermissions);
    
    res.json(responseFormatter.success(menus, '获取用户菜单成功'));
    
  } catch (error) {
    logger.error('Get user menus error:', error);
    res.status(500).json(responseFormatter.serverError('获取用户菜单失败'));
  }
});

// 获取用户权限
router.get('/permissions', authMiddleware, (req, res) => {
  try {
    const user = req.user;
    
    // 获取用户权限列表
    const userPermissions = user.roles.reduce((perms, role) => {
      role.permissions.forEach(perm => {
        if (!perms.includes(perm.permKey)) {
          perms.push(perm.permKey);
        }
      });
      return perms;
    }, []);
    
    res.json(responseFormatter.success(userPermissions, '获取用户权限成功'));
    
  } catch (error) {
    logger.error('Get user permissions error:', error);
    res.status(500).json(responseFormatter.serverError('获取用户权限失败'));
  }
});

// 刷新Token
router.post('/refresh-token', validateMiddleware({
  refreshToken: [{ type: 'required' }]
}), (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    const newTokenData = refreshTokenData(refreshToken);
    if (!newTokenData) {
      return res.status(401).json(responseFormatter.unauthorized('刷新令牌无效或已过期'));
    }
    
    logger.info('Token refreshed', { userId: newTokenData.userId });
    
    res.json(responseFormatter.success({
      token: newTokenData.token
    }, 'Token刷新成功'));
    
  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(500).json(responseFormatter.serverError('刷新Token失败'));
  }
});

// 修改密码
router.put('/change-password', authMiddleware, validateMiddleware({
  oldPassword: [{ type: 'required' }],
  newPassword: commonRules.password
}), (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = req.user;
    
    // 简化的密码验证（在真实环境中应该验证加密密码）
    const validPasswords = {
      'admin': 'admin123',
      'content_admin': 'content123',
      'editor': 'editor123',
      'viewer': 'viewer123'
    };
    
    if (oldPassword !== validPasswords[user.username]) {
      return res.status(400).json(responseFormatter.badRequest('原密码错误'));
    }
    
    if (oldPassword === newPassword) {
      return res.status(400).json(responseFormatter.badRequest('新密码不能与原密码相同'));
    }
    
    logger.info('Password changed', { 
      userId: user.id, 
      username: user.username 
    });
    
    // 在真实环境中，这里应该更新数据库中的密码
    res.json(responseFormatter.success(null, '密码修改成功'));
    
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json(responseFormatter.serverError('修改密码失败'));
  }
});

// 权限校验
router.post('/check-permission', authMiddleware, validateMiddleware({
  permission: [{ type: 'required' }]
}), (req, res) => {
  try {
    const { permission } = req.body;
    const user = req.user;
    
    // 获取用户权限列表
    const userPermissions = user.roles.reduce((perms, role) => {
      role.permissions.forEach(perm => {
        if (!perms.includes(perm.permKey)) {
          perms.push(perm.permKey);
        }
      });
      return perms;
    }, []);
    
    const hasPermission = userPermissions.includes(permission);
    
    res.json(responseFormatter.success({
      hasPermission
    }, hasPermission ? '用户拥有此权限' : '用户没有此权限'));
    
  } catch (error) {
    logger.error('Check permission error:', error);
    res.status(500).json(responseFormatter.serverError('权限校验失败'));
  }
});

// 获取验证码
router.get('/captcha', (req, res) => {
  try {
    const { captcha, key } = generateCaptcha();
    
    // 生成SVG验证码图片（简化版本）
    const svg = `
      <svg width="100" height="40" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="40" fill="#f0f0f0"/>
        <text x="50" y="25" font-family="Arial" font-size="18" font-weight="bold" 
              text-anchor="middle" fill="#333">${captcha}</text>
        <line x1="0" y1="20" x2="100" y2="20" stroke="#ccc" stroke-width="1"/>
      </svg>
    `;
    
    const captchaDataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    
    res.json(responseFormatter.success({
      captcha: captchaDataUrl,
      key
    }, '获取验证码成功'));
    
  } catch (error) {
    logger.error('Get captcha error:', error);
    res.status(500).json(responseFormatter.serverError('获取验证码失败'));
  }
});

// 统计信息（开发辅助接口）
router.get('/stats', (req, res) => {
  try {
    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 1).length,
      totalPermissions: permissions.length,
      menuPermissions: permissions.filter(p => p.type === 'menu').length,
      buttonPermissions: permissions.filter(p => p.type === 'button').length,
      onlineUsers: Array.from(new Set([...tokenStore.values()].map(t => t.userId))).length
    };
    
    res.json(responseFormatter.success(stats, '获取统计信息成功'));
    
  } catch (error) {
    logger.error('Get auth stats error:', error);
    res.status(500).json(responseFormatter.serverError('获取统计信息失败'));
  }
});

module.exports = router;