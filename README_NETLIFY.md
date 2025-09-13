# Netlify 部署指南

本指南将帮助您在 Netlify 上成功部署本项目。

## 部署配置

### Netlify.toml 配置

项目根目录下的 `netlify.toml` 文件包含了部署配置：

```toml
[build]
  command = "cd admin-dashboard && npm ci && npm run build"
  publish = "admin-dashboard/dist"
  base = "/"

[build.environment]
  VITE_STATIC_MODE = "true"
  VITE_API_BASE_URL = ""
  NODE_ENV = "production"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"
```

### 关键配置说明

1. **构建命令**: `cd admin-dashboard && npm ci && npm run build`
   - 进入 admin-dashboard 目录
   - 使用 npm ci 安装依赖（比 npm install 更快更可靠）
   - 运行构建命令

2. **发布目录**: `admin-dashboard/dist`
   - 指定构建产物的目录

3. **环境变量**:
   - `VITE_STATIC_MODE = "true"`: 启用静态模式，不调用真实API
   - `VITE_API_BASE_URL = ""`: API基础URL为空
   - `NODE_ENV = "production"`: 设置生产环境

4. **重定向规则**:
   - 所有请求都重定向到 `/index.html`，支持 Vue Router 的 history 模式

## 部署步骤

1. 将代码推送到 GitHub 仓库
2. 在 Netlify 控制台创建新站点
3. 选择您的 GitHub 仓库
4. Netlify 会自动检测 `netlify.toml` 配置文件
5. 点击部署按钮

## 环境变量配置

项目使用静态数据模式，无需配置额外的环境变量。所有数据都来自本地静态文件。

## 自定义域名

如果需要使用自定义域名，请在 Netlify 控制台的 "Domain management" 部分进行配置。

## 故障排除

### 常见问题

1. **页面刷新后显示 404**
   - 确保 `netlify.toml` 中的重定向规则正确配置

2. **静态资源加载失败**
   - 检查 `vite.config.ts` 中的 `base` 配置是否正确

3. **API 调用失败**
   - 确保 `VITE_STATIC_MODE` 环境变量设置为 `"true"`

### 构建失败

如果构建失败，请检查：
1. Node.js 版本是否兼容（项目要求 >=18.0.0）
2. 依赖是否正确安装
3. TypeScript 编译是否有错误

## 本地开发与生产环境的区别

| 配置项 | 本地开发 | Netlify 生产环境 |
|--------|----------|------------------|
| 静态模式 | 可配置 | 强制启用 |
| API 调用 | 可调用真实API | 仅使用静态数据 |
| 环境变量 | 从 .env 文件读取 | 从 Netlify 控制台或 netlify.toml 读取 |

## 支持

如有部署问题，请联系项目维护者或查看相关文档。