/**
 * 仪表盘模块路由
 */

const express = require('express');
const { responseFormatter, logger } = require('../../utils/response');
const { dashboardOverview, generateActivityTrendData } = require('./data');

const router = express.Router();

// 获取仪表盘概览
router.get('/overview', (req, res) => {
  logger.info('Dashboard overview requested');
  res.json(dashboardOverview);
});

// 获取仪表盘指标
router.get('/metrics', (req, res) => {
  logger.info('Dashboard metrics requested');
  const metrics = {
    ...dashboardOverview.data.metrics,
    todayActiveUsers: dashboardOverview.data.metrics.todayActiveUsers + Math.floor(Math.random() * 20 - 10),
    lastUpdateTime: new Date().toISOString()
  };
  res.json(responseFormatter.success(metrics, '获取仪表盘指标成功'));
});

// 获取活动趋势
router.get('/activity-trend', (req, res) => {
  logger.info('Activity trend requested');
  res.json(responseFormatter.success(generateActivityTrendData(), '获取活动趋势成功'));
});

// 获取内容分布
router.get('/content-distribution', (req, res) => {
  logger.info('Content distribution requested');
  res.json(responseFormatter.success(dashboardOverview.data.contentDistribution, '获取内容分布成功'));
});

// 获取部门贡献
router.get('/department-contributions', (req, res) => {
  logger.info('Department contributions requested');
  res.json(responseFormatter.success(dashboardOverview.data.departmentContributions, '获取部门贡献成功'));
});

// 获取系统资源
router.get('/system-resources', (req, res) => {
  logger.info('System resources requested');
  res.json(responseFormatter.success(dashboardOverview.data.systemResources, '获取系统资源成功'));
});

// 获取最近反馈
router.get('/recent-feedback', (req, res) => {
  logger.info('Recent feedback requested');
  res.json(responseFormatter.success(dashboardOverview.data.recentFeedback, '获取最近反馈成功'));
});

module.exports = router;