/**
 * 内容管理模块路由
 */

const express = require('express');
const { responseFormatter, logger } = require('../../utils/response');
const { contentList, contentStats, hotContent } = require('./data');

const router = express.Router();

// 获取内容列表
router.get('/list', (req, res) => {
  logger.info('Content list requested');
  res.json(responseFormatter.success({
    list: contentList,
    total: contentList.length
  }, '获取内容列表成功'));
});

// 获取内容统计
router.get('/stats', (req, res) => {
  logger.info('Content stats requested');
  res.json(responseFormatter.success(contentStats, '获取内容统计成功'));
});

// 获取热门内容
router.get('/hot', (req, res) => {
  logger.info('Hot content requested');
  res.json(responseFormatter.success(hotContent, '获取热门内容成功'));
});

module.exports = router;