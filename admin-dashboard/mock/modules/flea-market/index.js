/**
 * 跳蚤市场模块路由
 */

const express = require('express');
const { responseFormatter, logger } = require('../../utils/response');
const { paginate } = require('../../utils/pagination');
const { reports, categories, goods } = require('./data');

const router = express.Router();

// 获取举报列表
router.get('/reports', (req, res) => {
  logger.info('Flea market reports requested', req.query);
  const { page = 1, pageSize = 20, status = '', priority = '', reason = '', keyword = '' } = req.query;
  
  let filteredReports = [...reports];
  
  // 状态过滤
  if (status) {
    filteredReports = filteredReports.filter(report => report.status === status);
  }
  
  // 优先级过滤
  if (priority) {
    filteredReports = filteredReports.filter(report => report.priority === priority);
  }
  
  // 举报原因过滤
  if (reason) {
    filteredReports = filteredReports.filter(report => report.reason === reason);
  }
  
  // 关键词搜索
  if (keyword) {
    filteredReports = filteredReports.filter(report => 
      report.goodsName.includes(keyword) || 
      report.sellerName.includes(keyword) || 
      report.reportUserName.includes(keyword) ||
      report.description.includes(keyword)
    );
  }
  
  // 分页
  const result = paginate(filteredReports, parseInt(page), parseInt(pageSize));
  
  res.json(responseFormatter.success(result, '获取举报列表成功'));
});

// 获取举报详情
router.get('/reports/:id', (req, res) => {
  const reportId = parseInt(req.params.id);
  const report = reports.find(r => r.id === reportId);
  
  if (!report) {
    return res.status(404).json(responseFormatter.notFound('举报记录不存在'));
  }
  
  res.json(responseFormatter.success(report, '获取举报详情成功'));
});

// 更新举报状态
router.patch('/reports/:id/status', (req, res) => {
  const reportId = parseInt(req.params.id);
  const { status, resolution } = req.body;
  
  const report = reports.find(r => r.id === reportId);
  if (!report) {
    return res.status(404).json(responseFormatter.notFound('举报记录不存在'));
  }
  
  // 更新状态
  report.status = status;
  if (resolution) {
    report.resolution = resolution;
  }
  report.updatedAt = new Date().toISOString();
  
  logger.info('Report status updated', { reportId, status, resolution });
  
  res.json(responseFormatter.success(report, '举报状态更新成功'));
});

// 批量更新举报状态
router.patch('/reports/batch', (req, res) => {
  const { reportIds, status, resolution } = req.body;
  
  if (!reportIds || !Array.isArray(reportIds)) {
    return res.status(400).json(responseFormatter.badRequest('举报ID列表不能为空'));
  }
  
  const updatedReports = [];
  reportIds.forEach(id => {
    const report = reports.find(r => r.id === parseInt(id));
    if (report) {
      report.status = status;
      if (resolution) {
        report.resolution = resolution;
      }
      report.updatedAt = new Date().toISOString();
      updatedReports.push(report);
    }
  });
  
  logger.info('Batch report status updated', { reportIds, status });
  
  res.json(responseFormatter.success(updatedReports, `批量更新 ${updatedReports.length} 条举报状态成功`));
});

// 获取分类列表
router.get('/categories', (req, res) => {
  res.json(responseFormatter.success(categories, '获取分类列表成功'));
});

// 获取商品列表
router.get('/goods', (req, res) => {
  const { page = 1, pageSize = 20, status = '', categoryId = '', keyword = '', userId = '' } = req.query;
  
  let filteredGoods = [...goods];
  
  // 状态过滤
  if (status) {
    filteredGoods = filteredGoods.filter(good => good.status === status);
  }
  
  // 分类过滤
  if (categoryId) {
    filteredGoods = filteredGoods.filter(good => good.categoryId === parseInt(categoryId));
  }
  
  // 用户过滤
  if (userId) {
    filteredGoods = filteredGoods.filter(good => good.userId === parseInt(userId));
  }
  
  // 关键词搜索
  if (keyword) {
    filteredGoods = filteredGoods.filter(good => 
      good.name.includes(keyword) || 
      good.description.includes(keyword)
    );
  }
  
  // 添加分类名称
  const goodsWithCategory = filteredGoods.map(good => ({
    ...good,
    categoryName: categories.find(c => c.id === good.categoryId)?.name || '未知分类'
  }));
  
  // 生成更多商品数据（模拟）
  const additionalGoods = [];
  for (let i = 6; i <= 50; i++) {
    const categoryIdx = (i % categories.length);
    const category = categories[categoryIdx];
    additionalGoods.push({
      id: i,
      name: `商品${i}`,
      categoryId: category.id,
      categoryName: category.name,
      price: Math.floor(Math.random() * 1000) + 100,
      originalPrice: Math.floor(Math.random() * 2000) + 500,
      description: `这是商品${i}的详细描述`,
      images: [`https://picsum.photos/200/200?random=${i}`],
      status: ['on_sale', 'sold', 'removed'][Math.floor(Math.random() * 3)],
      userId: Math.floor(Math.random() * 10) + 1,
      location: ['北京', '上海', '广州', '深圳', '杭州'][Math.floor(Math.random() * 5)],
      contactPhone: `138****${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  const allGoods = [...goodsWithCategory, ...additionalGoods];
  
  // 应用过滤条件到所有商品
  let filteredAllGoods = allGoods;
  if (status) {
    filteredAllGoods = filteredAllGoods.filter(good => good.status === status);
  }
  if (categoryId) {
    filteredAllGoods = filteredAllGoods.filter(good => good.categoryId === parseInt(categoryId));
  }
  if (keyword) {
    filteredAllGoods = filteredAllGoods.filter(good => 
      good.name.includes(keyword) || good.description.includes(keyword)
    );
  }
  
  // 分页
  const result = paginate(filteredAllGoods, parseInt(page), parseInt(pageSize));
  
  res.json(responseFormatter.success(result, '获取商品列表成功'));
});

module.exports = router;