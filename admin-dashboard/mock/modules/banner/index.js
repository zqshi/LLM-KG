/**
 * 横幅管理模块路由
 */

const express = require('express');
const { responseFormatter, logger } = require('../../utils/response');
const { paginate } = require('../../utils/pagination');
const { banners } = require('./data');

const router = express.Router();

// 获取横幅列表
router.get('/', (req, res) => {
  logger.info('Banner list requested', req.query);
  const { title = '', status = '', page = 1, pageSize = 20 } = req.query;
  
  let filteredBanners = [...banners];
  
  // 标题过滤
  if (title) {
    filteredBanners = filteredBanners.filter(banner => 
      banner.title.toLowerCase().includes(title.toLowerCase())
    );
  }
  
  // 状态过滤
  if (status) {
    filteredBanners = filteredBanners.filter(banner => banner.status === status);
  }
  
  const result = paginate(filteredBanners, parseInt(page), parseInt(pageSize));
  
  res.json(responseFormatter.success(result, '获取横幅列表成功'));
});

// 获取横幅详情
router.get('/:id', (req, res) => {
  const bannerId = parseInt(req.params.id);
  logger.info(`Banner detail requested for ID: ${bannerId}`);
  
  const banner = banners.find(b => b.id === bannerId);
  if (!banner) {
    return res.status(404).json(responseFormatter.notFound('横幅不存在'));
  }
  
  res.json(responseFormatter.success(banner, '获取横幅详情成功'));
});

// 创建横幅
router.post('/', (req, res) => {
  logger.info('Create banner requested', req.body);
  const newBanner = {
    id: banners.length + 1,
    ...req.body,
    creator: req.body.creator || '管理员',
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString()
  };
  banners.push(newBanner);
  
  res.json(responseFormatter.success(newBanner, '创建横幅成功'));
});

// 更新横幅
router.put('/:id', (req, res) => {
  const bannerId = parseInt(req.params.id);
  logger.info(`Update banner requested for ID: ${bannerId}`, req.body);
  
  const bannerIndex = banners.findIndex(b => b.id === bannerId);
  if (bannerIndex === -1) {
    return res.status(404).json(responseFormatter.notFound('横幅不存在'));
  }
  
  banners[bannerIndex] = {
    ...banners[bannerIndex],
    ...req.body,
    updateTime: new Date().toISOString()
  };
  
  res.json(responseFormatter.success(banners[bannerIndex], '更新横幅成功'));
});

// 删除横幅
router.delete('/:id', (req, res) => {
  const bannerId = parseInt(req.params.id);
  logger.info(`Delete banner requested for ID: ${bannerId}`);
  
  const bannerIndex = banners.findIndex(b => b.id === bannerId);
  if (bannerIndex === -1) {
    return res.status(404).json(responseFormatter.notFound('横幅不存在'));
  }
  
  banners.splice(bannerIndex, 1);
  
  res.json(responseFormatter.success(null, '删除横幅成功'));
});

// 更新横幅状态
router.patch('/:id/status', (req, res) => {
  const bannerId = parseInt(req.params.id);
  logger.info(`Update banner status requested for ID: ${bannerId}`, req.body);
  
  const bannerIndex = banners.findIndex(b => b.id === bannerId);
  if (bannerIndex === -1) {
    return res.status(404).json(responseFormatter.notFound('横幅不存在'));
  }
  
  banners[bannerIndex] = {
    ...banners[bannerIndex],
    status: req.body.status,
    auditTaskId: req.body.auditTaskId,
    updateTime: new Date().toISOString()
  };
  
  res.json(responseFormatter.success(banners[bannerIndex], '更新横幅状态成功'));
});

// 发布横幅
router.post('/:id/publish', (req, res) => {
  const bannerId = parseInt(req.params.id);
  logger.info(`Publish banner requested for ID: ${bannerId}`);
  
  const bannerIndex = banners.findIndex(b => b.id === bannerId);
  if (bannerIndex === -1) {
    return res.status(404).json(responseFormatter.notFound('横幅不存在'));
  }
  
  banners[bannerIndex].status = 'published';
  banners[bannerIndex].updateTime = new Date().toISOString();
  
  res.json(responseFormatter.success(banners[bannerIndex], '发布横幅成功'));
});

// 下线横幅
router.post('/:id/offline', (req, res) => {
  const bannerId = parseInt(req.params.id);
  logger.info(`Offline banner requested for ID: ${bannerId}`);
  
  const bannerIndex = banners.findIndex(b => b.id === bannerId);
  if (bannerIndex === -1) {
    return res.status(404).json(responseFormatter.notFound('横幅不存在'));
  }
  
  banners[bannerIndex].status = 'offline';
  banners[bannerIndex].updateTime = new Date().toISOString();
  
  res.json(responseFormatter.success(banners[bannerIndex], '下线横幅成功'));
});

module.exports = router;