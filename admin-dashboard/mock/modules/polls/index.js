/**
 * 投票管理模块路由
 */

const express = require('express');
const { responseFormatter, logger } = require('../../utils/response');
const { paginate } = require('../../utils/pagination');
const { overviewStats, polls, generateVoteTimeline } = require('./data');

const router = express.Router();

// 获取投票概览统计
router.get('/overview-stats', (req, res) => {
  logger.info('Poll overview stats requested');
  res.json(responseFormatter.success(overviewStats, '获取投票概览统计成功'));
});

// 获取投票列表
router.get('/', (req, res) => {
  logger.info('Polls list requested', req.query);
  const { page = 1, pageSize = 20, keyword = '', status = '' } = req.query;
  
  let filteredPolls = [...polls];
  
  // 关键词过滤
  if (keyword) {
    filteredPolls = filteredPolls.filter(poll => 
      poll.title.includes(keyword) || poll.description.includes(keyword)
    );
  }
  
  // 状态过滤
  if (status) {
    filteredPolls = filteredPolls.filter(poll => poll.status === status);
  }
  
  // 分页
  const result = paginate(filteredPolls, parseInt(page), parseInt(pageSize));
  
  res.json(responseFormatter.success(result, '获取投票列表成功'));
});

// 获取投票统计详情
router.get('/:id/statistics', (req, res) => {
  const pollId = parseInt(req.params.id);
  logger.info(`Poll statistics requested for ID: ${pollId}`);
  
  const poll = polls.find(p => p.id === pollId);
  if (!poll) {
    return res.status(404).json(responseFormatter.notFound('投票不存在'));
  }
  
  const statistics = {
    pollId: poll.id,
    title: poll.title,
    totalVotes: poll.totalVotes,
    participationRate: (poll.totalVotes / 200 * 100).toFixed(1), // 假设总员工200人
    options: poll.options.map(option => ({
      ...option,
      percentage: (option.votes / poll.totalVotes * 100).toFixed(1)
    })),
    demographics: {
      byDepartment: [
        { departmentName: '技术部', votes: Math.floor(poll.totalVotes * 0.4) },
        { departmentName: '产品部', votes: Math.floor(poll.totalVotes * 0.3) },
        { departmentName: '运营部', votes: Math.floor(poll.totalVotes * 0.3) }
      ],
      byRole: [
        { roleName: '普通员工', votes: Math.floor(poll.totalVotes * 0.7) },
        { roleName: '主管', votes: Math.floor(poll.totalVotes * 0.2) },
        { roleName: '经理', votes: Math.floor(poll.totalVotes * 0.1) }
      ]
    },
    timeline: generateVoteTimeline(poll.totalVotes)
  };
  
  res.json(responseFormatter.success(statistics, '获取投票统计成功'));
});

module.exports = router;