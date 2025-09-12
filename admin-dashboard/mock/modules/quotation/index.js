/**
 * 语录管理模块路由
 */

const express = require('express');
const { responseFormatter, logger } = require('../../utils/response');
const { paginate } = require('../../utils/pagination');
const { quotationList, tags, statistics, playlists, dailyQuoteConfig } = require('./data');

const router = express.Router();

// 获取语录列表
router.get('/', (req, res) => {
  logger.info('Quotation list requested', req.query);
  const { 
    page = 1, 
    pageSize = 20, 
    keyword = '', 
    category = '', 
    status = '', 
    author = '',
    tag = ''
  } = req.query;
  
  let filteredQuotations = [...quotationList];
  
  // 关键词搜索
  if (keyword) {
    filteredQuotations = filteredQuotations.filter(quote => 
      quote.content.includes(keyword) || 
      quote.author.includes(keyword) ||
      quote.source.includes(keyword)
    );
  }
  
  // 分类过滤
  if (category) {
    filteredQuotations = filteredQuotations.filter(quote => quote.category === category);
  }
  
  // 状态过滤
  if (status) {
    filteredQuotations = filteredQuotations.filter(quote => quote.status === status);
  }
  
  // 作者过滤
  if (author) {
    filteredQuotations = filteredQuotations.filter(quote => quote.author.includes(author));
  }
  
  // 标签过滤
  if (tag) {
    filteredQuotations = filteredQuotations.filter(quote => quote.tags.includes(tag));
  }
  
  // 分页
  const result = paginate(filteredQuotations, parseInt(page), parseInt(pageSize));
  
  res.json(responseFormatter.success(result, '获取语录列表成功'));
});

// 获取标签列表
router.get('/tags', (req, res) => {
  logger.info('Quotation tags requested');
  res.json(responseFormatter.success(tags, '获取标签列表成功'));
});

// 获取统计信息
router.get('/statistics', (req, res) => {
  logger.info('Quotation statistics requested');
  res.json(responseFormatter.success(statistics, '获取统计信息成功'));
});

// 获取播放列表
router.get('/playlists', (req, res) => {
  logger.info('Quotation playlists requested');
  res.json(responseFormatter.success(playlists, '获取播放列表成功'));
});

// 获取每日语录配置
router.get('/daily-quote/config', (req, res) => {
  logger.info('Daily quote config requested');
  res.json(responseFormatter.success(dailyQuoteConfig, '获取每日语录配置成功'));
});

// 获取热门语录
router.get('/popular', (req, res) => {
  logger.info('Popular quotations requested');
  const { limit = 10 } = req.query;
  
  const popularQuotes = quotationList
    .filter(quote => quote.status === 'published')
    .sort((a, b) => b.likeCount - a.likeCount)
    .slice(0, parseInt(limit));
  
  res.json(responseFormatter.success(popularQuotes, '获取热门语录成功'));
});

// 创建语录
router.post('/', (req, res) => {
  logger.info('Create quotation requested', req.body);
  const newQuotation = {
    id: quotationList.length + 1,
    ...req.body,
    showCount: 0,
    viewCount: 0,
    likeCount: 0,
    status: req.body.status || 'draft',
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  quotationList.push(newQuotation);
  
  res.json(responseFormatter.success(newQuotation, '创建语录成功'));
});

// 更新语录
router.put('/:id', (req, res) => {
  const quotationId = parseInt(req.params.id);
  logger.info(`Update quotation requested for ID: ${quotationId}`, req.body);
  
  const quotationIndex = quotationList.findIndex(q => q.id === quotationId);
  if (quotationIndex === -1) {
    return res.status(404).json(responseFormatter.notFound('语录不存在'));
  }
  
  quotationList[quotationIndex] = {
    ...quotationList[quotationIndex],
    ...req.body,
    updateTime: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  res.json(responseFormatter.success(quotationList[quotationIndex], '更新语录成功'));
});

// 删除语录
router.delete('/:id', (req, res) => {
  const quotationId = parseInt(req.params.id);
  logger.info(`Delete quotation requested for ID: ${quotationId}`);
  
  const quotationIndex = quotationList.findIndex(q => q.id === quotationId);
  if (quotationIndex === -1) {
    return res.status(404).json(responseFormatter.notFound('语录不存在'));
  }
  
  quotationList.splice(quotationIndex, 1);
  
  res.json(responseFormatter.success(null, '删除语录成功'));
});

module.exports = router;