# RBAC模块部署指南

## 🎯 部署概述

统一认证与权限管理(RBAC)模块已完成前端开发，可部署到web环境。

## 📋 模块功能

### 已完成功能 (7个核心页面)
1. **组织架构管理** - 树形部门结构，支持拖拽排序
2. **用户管理** - 用户CRUD，批量操作，密码重置
3. **角色管理** - 角色配置，数据权限范围，权限分配
4. **权限点管理** - 树形权限结构，菜单/按钮/API权限
5. **用户授权** - 用户角色分配，权限预览
6. **数据同步配置** - 企业微信、LDAP、AD、钉钉集成
7. **审计日志** - 操作审计和导出功能

### 技术架构
- **前端框架**: Vue 3 + TypeScript + Composition API
- **UI组件**: Element Plus
- **状态管理**: Pinia
- **路由管理**: Vue Router 4 with 权限守卫
- **构建工具**: Vite

## 🚀 快速部署

### 方式一：使用部署脚本
```bash
./deploy.sh
```

### 方式二：手动部署
```bash
# 1. 安装依赖
npm install

# 2. 构建生产版本
npm run build

# 3. 预览测试
npm run preview
```

## 🌐 web环境部署

### 1. 构建产物
构建完成后，所有静态资源位于 `dist/` 目录：
```
dist/
├── index.html          # 入口页面
├── assets/            # 静态资源
│   ├── *.js          # JavaScript文件
│   ├── *.css         # 样式文件
│   └── ...
```

### 2. 服务器配置

#### Nginx 配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/rbac-admin/dist;
    index index.html;
    
    # 处理SPA路由
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API代理（如果需要）
    location /api {
        proxy_pass http://backend-server;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Apache 配置示例
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/rbac-admin/dist
    
    # 处理SPA路由
    <Directory "/var/www/rbac-admin/dist">
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

## 🔧 环境配置

### 生产环境变量
创建 `.env.production` 文件：
```env
VITE_API_BASE_URL=https://api.company.com/v1
VITE_APP_TITLE=企业知识聚合平台
VITE_APP_VERSION=1.0.0
```

## 🧪 部署验证

### 1. 功能验证清单
- [ ] 页面正常加载
- [ ] 路由跳转正常
- [ ] 权限模块可访问
  - [ ] /rbac/organizations - 组织架构管理
  - [ ] /rbac/users - 用户管理
  - [ ] /rbac/roles - 角色管理
  - [ ] /rbac/permissions - 权限点管理
  - [ ] /rbac/user-roles - 用户授权
  - [ ] /rbac/sync-config - 数据同步配置
  - [ ] /rbac/audit-logs - 审计日志
- [ ] Mock数据正常显示
- [ ] 交互功能正常

### 2. 性能指标
- 首屏加载时间 < 3秒
- 页面切换响应时间 < 500ms
- 静态资源正确缓存

## 📊 构建统计

当前构建产物信息：
- 总文件数: 140+ 个文件
- 总大小: ~2.5MB (压缩后)
- 主要资源:
  - JavaScript: ~800KB (gzip压缩后)
  - CSS: ~50KB (gzip压缩后)
  - Vue组件: 7个RBAC模块组件

## 🔒 安全配置

### Content Security Policy (CSP)
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-eval'; 
               style-src 'self' 'unsafe-inline';
               img-src 'self' data:;">
```

### HTTPS强制跳转
```nginx
if ($scheme != "https") {
    return 301 https://$server_name$request_uri;
}
```

## 🐛 常见问题

### 1. 路由404问题
确保服务器配置了SPA路由fallback到index.html

### 2. API请求跨域
配置正确的CORS策略或使用代理

### 3. 静态资源404
检查构建产物路径和服务器静态资源配置

## 📞 技术支持

如遇部署问题，请检查：
1. Node.js版本 >= 16
2. npm版本 >= 8
3. 服务器配置是否正确
4. 网络连接是否正常

## 🔄 后续开发

前端RBAC模块已完成，接下来可以：
1. 对接后端API接口
2. 替换Mock数据为真实数据
3. 添加更多业务功能
4. 进行性能优化