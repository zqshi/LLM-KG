/**
 * 响应格式化工具
 * 提供统一的响应格式和日志功能
 */

const config = require('../config');

// 日志工具
const logger = {
  info: (message, data) => {
    if (config.logging.enabled && config.logging.level !== 'error') {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data || '');
    }
  },
  warn: (message, data) => {
    if (config.logging.enabled && ['warn', 'info', 'debug'].includes(config.logging.level)) {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || '');
    }
  },
  error: (message, data) => {
    if (config.logging.enabled) {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, data || '');
    }
  },
  debug: (message, data) => {
    if (config.logging.enabled && config.logging.level === 'debug') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data || '');
    }
  }
};

// 响应格式化器
const responseFormatter = {
  // 成功响应
  success: (data = null, message = 'success') => ({
    code: 200,
    message,
    data,
    timestamp: new Date().toISOString()
  }),

  // 分页成功响应
  paginated: (list = [], total = 0, page = 1, pageSize = 20, message = 'success') => ({
    code: 200,
    message,
    data: {
      list,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(total / pageSize),
      hasNext: page < Math.ceil(total / pageSize),
      hasPrev: page > 1
    },
    timestamp: new Date().toISOString()
  }),

  // 错误响应
  error: (code = 500, message = '服务器错误', detail = null) => ({
    code,
    message,
    error: detail,
    timestamp: new Date().toISOString()
  }),

  // 参数错误响应
  badRequest: (message = '请求参数错误', field = null, detail = null) => ({
    code: 400,
    message,
    error: {
      field,
      detail
    },
    timestamp: new Date().toISOString()
  }),

  // 未授权响应
  unauthorized: (message = '未授权访问') => ({
    code: 401,
    message,
    timestamp: new Date().toISOString()
  }),

  // 权限不足响应
  forbidden: (message = '权限不足') => ({
    code: 403,
    message,
    timestamp: new Date().toISOString()
  }),

  // 资源不存在响应
  notFound: (message = '资源不存在') => ({
    code: 404,
    message,
    timestamp: new Date().toISOString()
  }),

  // 服务器错误响应
  serverError: (message = '服务器内部错误', detail = null) => ({
    code: 500,
    message,
    error: detail,
    timestamp: new Date().toISOString()
  })
};

// 延迟函数
const delay = (min = 100, max = 500) => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, ms));
};

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  // 如果响应已经发送，则委托给默认的 Express 错误处理程序
  if (res.headersSent) {
    return next(err);
  }

  // 根据错误类型返回适当的响应
  if (err.name === 'ValidationError') {
    return res.status(400).json(responseFormatter.badRequest(err.message));
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json(responseFormatter.badRequest('无效的ID格式'));
  }
  
  if (err.code === 11000) { // MongoDB 重复键错误
    return res.status(409).json(responseFormatter.error(409, '资源已存在'));
  }

  // 默认服务器错误
  res.status(500).json(responseFormatter.serverError());
};

// 响应包装中间件
const responseWrapper = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    if (config.logging.enabled && config.logging.logResponses) {
      logger.debug(`Response for ${req.method} ${req.path}:`, data);
    }
    return originalJson.call(this, data);
  };
  
  next();
};

// 请求验证工具
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const field = error.details[0]?.path?.join('.') || 'unknown';
      const message = error.details[0]?.message || '参数验证失败';
      return res.status(400).json(responseFormatter.badRequest('请求参数错误', field, message));
    }
    next();
  };
};

// 分页参数解析
const parsePagination = (req) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const pageSize = Math.min(
    config.pagination.maxPageSize, 
    Math.max(1, parseInt(req.query.pageSize) || config.pagination.defaultPageSize)
  );
  const skip = (page - 1) * pageSize;
  
  return { page, pageSize, skip };
};

// 排序参数解析
const parseSort = (req, allowedFields = []) => {
  const sortBy = req.query.sortBy;
  const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
  
  if (!sortBy || !allowedFields.includes(sortBy)) {
    return { createdAt: -1 }; // 默认按创建时间降序
  }
  
  return { [sortBy]: sortOrder };
};

// 过滤参数解析
const parseFilters = (req, allowedFields = []) => {
  const filters = {};
  
  Object.keys(req.query).forEach(key => {
    if (allowedFields.includes(key) && req.query[key]) {
      filters[key] = req.query[key];
    }
  });
  
  return filters;
};

module.exports = {
  logger,
  responseFormatter,
  delay,
  errorHandler,
  responseWrapper,
  validateRequest,
  parsePagination,
  parseSort,
  parseFilters
};