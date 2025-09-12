/**
 * 审核模块路由
 */

const express = require('express');
const { responseFormatter, logger } = require('../../utils/response');
const { paginate } = require('../../utils/pagination');
const { policies, tasks, auditors, stats, auditLogs } = require('./data');

const router = express.Router();

// 根据业务类型获取审核策略
router.get('/policies/by-biztype/:biztype', (req, res) => {
  const biztype = req.params.biztype;
  logger.info(`Audit policies requested for biztype: ${biztype}`);
  
  const bizTypePolicies = policies.filter(policy => policy.bizType === biztype);
  
  res.json(responseFormatter.success({
    policies: bizTypePolicies
  }, '获取审核策略成功'));
});

// 获取审核策略列表
router.get('/policies', (req, res) => {
  logger.info('Audit policies requested', req.query);
  const { page = 1, pageSize = 20, bizType = '' } = req.query;
  
  let filteredPolicies = [...policies];
  
  if (bizType) {
    filteredPolicies = filteredPolicies.filter(policy => policy.bizType === bizType);
  }
  
  const result = paginate(filteredPolicies, parseInt(page), parseInt(pageSize));
  
  res.json(responseFormatter.success(result, '获取审核策略列表成功'));
});

// 获取审核任务列表
router.get('/tasks', (req, res) => {
  logger.info('Audit tasks requested', req.query);
  const { keyword = '', page = 1, pageSize = 20, status = '', type = '' } = req.query;
  
  let filteredTasks = [...tasks];
  
  // 关键词过滤
  if (keyword) {
    filteredTasks = filteredTasks.filter(task => 
      task.title.includes(keyword) || task.assignee.name.includes(keyword)
    );
  }
  
  // 状态过滤
  if (status) {
    filteredTasks = filteredTasks.filter(task => task.status === status);
  }
  
  // 类型过滤
  if (type) {
    filteredTasks = filteredTasks.filter(task => task.type === type);
  }
  
  const result = paginate(filteredTasks, parseInt(page), parseInt(pageSize));
  
  res.json(responseFormatter.success(result, '获取审核任务列表成功'));
});

// 获取审核员列表
router.get('/auditors', (req, res) => {
  logger.info('Audit auditors requested', req.query);
  const { page = 1, pageSize = 20, status = '' } = req.query;
  
  let filteredAuditors = [...auditors];
  
  if (status) {
    filteredAuditors = filteredAuditors.filter(auditor => auditor.status === status);
  }
  
  const result = paginate(filteredAuditors, parseInt(page), parseInt(pageSize));
  
  res.json(responseFormatter.success(result, '获取审核员列表成功'));
});

// 获取审核统计数据
router.get('/stats', (req, res) => {
  logger.info('Audit statistics requested');
  
  res.json(responseFormatter.success(stats, '获取审核统计数据成功'));
});

// 创建全局审核日志
router.post('/global/logs', (req, res) => {
  logger.info('Global audit logs creation requested', req.body);
  
  const newLog = {
    id: Date.now(),
    action: req.body.action || 'UNKNOWN',
    resource_type: req.body.resource_type || 'unknown',
    resource_id: req.body.resource_id || '',
    user_id: req.body.user_id || 1,
    user_name: req.body.user_name || '系统用户',
    ip_address: req.body.ip_address || '127.0.0.1',
    user_agent: req.body.user_agent || 'Unknown',
    details: req.body.details || {},
    status: req.body.status || 'SUCCESS',
    created_at: new Date().toISOString()
  };
  
  // 将新日志添加到数据中（在真实应用中应该保存到数据库）
  auditLogs.unshift(newLog);
  
  res.json(responseFormatter.success(newLog, '创建审核日志成功'));
});

// 获取全局审核日志列表
router.get('/global/logs', (req, res) => {
  logger.info('Global audit logs list requested', req.query);
  const { 
    page = 1, 
    pageSize = 20, 
    action = '', 
    resource_type = '', 
    startTime = '', 
    endTime = '',
    user_name = ''
  } = req.query;
  
  let filteredLogs = [...auditLogs];
  
  // 操作类型过滤
  if (action) {
    filteredLogs = filteredLogs.filter(log => log.action === action);
  }
  
  // 资源类型过滤
  if (resource_type) {
    filteredLogs = filteredLogs.filter(log => log.resource_type === resource_type);
  }
  
  // 用户名过滤
  if (user_name) {
    filteredLogs = filteredLogs.filter(log => log.user_name.includes(user_name));
  }
  
  // 时间范围过滤
  if (startTime || endTime) {
    filteredLogs = filteredLogs.filter(log => {
      const logTime = new Date(log.created_at).getTime();
      const start = startTime ? new Date(startTime).getTime() : 0;
      const end = endTime ? new Date(endTime).getTime() : Date.now();
      return logTime >= start && logTime <= end;
    });
  }
  
  const result = paginate(filteredLogs, parseInt(page), parseInt(pageSize));
  
  res.json(responseFormatter.success(result, '获取审核日志列表成功'));
});

module.exports = router;