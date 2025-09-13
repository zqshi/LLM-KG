/**
 * Mock 服务配置文件
 * 统一管理 Mock 服务的各项配置参数
 */

module.exports = {
  // 服务器配置
  server: {
    port: 3001,
    host: 'localhost',
    prefix: '/api' // API 前缀
  },

  // 响应延迟配置 (毫秒)
  delay: {
    min: 100,
    max: 800
  },

  // 错误模拟配置
  error: {
    rate: 0, // 错误率 (0-1)，设为0禁用错误模拟
    codes: [400, 401, 403, 404, 500]
  },

  // 分页配置
  pagination: {
    defaultPage: 1,
    defaultPageSize: 20,
    maxPageSize: 100
  },

  // 认证配置
  auth: {
    tokenExpiry: 7200, // token过期时间(秒)，2小时
    refreshTokenExpiry: 86400, // refresh token过期时间(秒)，24小时
    secretKey: 'mock-jwt-secret-key'
  },

  // 数据生成配置
  data: {
    userPool: 50,      // 用户池大小
    departmentPool: 10, // 部门池大小
    minListSize: 20,   // 列表最小数据量
    maxListSize: 100   // 列表最大数据量
  },

  // CORS 配置
  cors: {
    origin: ['http://localhost:3108', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
  },

  // 日志配置
  logging: {
    enabled: true,
    level: 'info', // 'error', 'warn', 'info', 'debug'
    logRequests: true,
    logResponses: false
  }
};