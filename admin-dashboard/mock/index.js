/**
 * Mock Server 主入口文件
 * 负责启动 Express 服务器并加载所有模块
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const { logger, delay, errorHandler, responseFormatter } = require('./utils/response');

const app = express();

// 中间件配置
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors(config.cors));

// 日志中间件
if (config.logging.enabled && config.logging.logRequests) {
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
      query: req.query,
      body: req.method !== 'GET' ? req.body : undefined
    });
    next();
  });
}

// 响应延迟中间件
app.use(async (req, res, next) => {
  await delay(config.delay.min, config.delay.max);
  next();
});

// 错误模拟中间件
app.use((req, res, next) => {
  if (Math.random() < config.error.rate) {
    const errorCode = config.error.codes[Math.floor(Math.random() * config.error.codes.length)];
    return res.status(errorCode).json(responseFormatter.error(errorCode, getErrorMessage(errorCode)));
  }
  next();
});

// 动态加载模块路由
function loadModules() {
  const modulesPath = path.join(__dirname, 'modules');
  const modules = fs.readdirSync(modulesPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  modules.forEach(moduleName => {
    const modulePath = path.join(modulesPath, moduleName);
    const indexPath = path.join(modulePath, 'index.js');
    
    if (fs.existsSync(indexPath)) {
      try {
        const moduleRouter = require(indexPath);
        app.use(`${config.server.prefix}/${moduleName}`, moduleRouter);
        logger.info(`Loaded module: ${moduleName}`);
      } catch (error) {
        logger.error(`Failed to load module ${moduleName}:`, error.message);
      }
    }
  });
}

// 健康检查端点
app.get('/health', (req, res) => {
  res.json(responseFormatter.success({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: require('../package.json').version || '1.0.0'
  }));
});

// API 信息端点
app.get('/api', (req, res) => {
  res.json(responseFormatter.success({
    name: 'Admin Dashboard Mock API',
    version: '1.0.0',
    description: '管理后台 Mock API 服务',
    endpoints: {
      health: '/health',
      documentation: '/docs'
    }
  }));
});

// 加载所有模块
loadModules();

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json(responseFormatter.error(404, `接口不存在: ${req.originalUrl}`));
});

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
const server = app.listen(config.server.port, config.server.host, () => {
  logger.info(`Mock Server started at http://${config.server.host}:${config.server.port}`);
  logger.info(`API Base URL: http://${config.server.host}:${config.server.port}${config.server.prefix}`);
  logger.info(`Health Check: http://${config.server.host}:${config.server.port}/health`);
});

// 优雅关闭
process.on('SIGINT', () => {
  logger.info('Shutting down Mock Server...');
  server.close(() => {
    logger.info('Mock Server closed');
    process.exit(0);
  });
});

function getErrorMessage(code) {
  const messages = {
    400: '请求参数错误',
    401: '未授权访问',
    403: '权限不足',
    404: '资源不存在', 
    500: '服务器内部错误'
  };
  return messages[code] || '未知错误';
}

module.exports = app;