/**
 * 投票管理模块数据
 */

const overviewStats = {
  totalPolls: 5,
  ongoingPolls: 4,
  endedPolls: 1,
  totalVotes: 869,
  avgParticipationRate: 82.3,
  todayPolls: 2,
  todayVotes: 167
};

const polls = [
  {
    id: 1,
    title: '团建活动地点投票',
    description: '请大家投票选择下次团建活动的地点',
    question: '您希望下次团建活动在哪里举办？',
    status: 'ongoing',
    type: 'single',
    creatorId: 1,
    creatorName: '管理员',
    categoryId: 4,
    categoryName: '员工福利',
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    totalVotes: 89,
    participantCount: 89,
    hasRewards: true,
    isAnonymous: false,
    allowMultiple: false,
    options: [
      { id: 1, text: '海边度假村', votes: 45, percentage: 50.6 },
      { id: 2, text: '山区温泉', votes: 32, percentage: 36.0 },
      { id: 3, text: '城市公园', votes: 12, percentage: 13.4 }
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    title: '新办公楼食堂菜品调研',
    description: '为了提升员工用餐体验，征集大家对食堂菜品的意见',
    question: '您最希望食堂增加哪些菜系？（可多选）',
    status: 'ongoing',
    type: 'multiple',
    creatorId: 3,
    creatorName: '行政主管',
    categoryId: 4,
    categoryName: '员工福利',
    startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    totalVotes: 234,
    participantCount: 128,
    hasRewards: false,
    isAnonymous: true,
    allowMultiple: true,
    options: [
      { id: 1, text: '川菜', votes: 89, percentage: 38.0 },
      { id: 2, text: '粤菜', votes: 67, percentage: 28.6 },
      { id: 3, text: '湘菜', votes: 45, percentage: 19.2 },
      { id: 4, text: '西式简餐', votes: 33, percentage: 14.1 }
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    title: '技术分享主题征集',
    description: '下个月的技术分享会，大家最想听什么主题呢？',
    question: '您最感兴趣的技术分享主题是？',
    status: 'ongoing',
    type: 'single',
    creatorId: 2,
    creatorName: '技术负责人',
    categoryId: 1,
    categoryName: '技术讨论',
    startTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    totalVotes: 156,
    participantCount: 156,
    hasRewards: true,
    isAnonymous: false,
    allowMultiple: false,
    options: [
      { id: 1, text: '微服务架构最佳实践', votes: 67, percentage: 42.9 },
      { id: 2, text: '前端性能优化技巧', votes: 45, percentage: 28.8 },
      { id: 3, text: '数据库设计与优化', votes: 32, percentage: 20.5 },
      { id: 4, text: 'DevOps自动化流程', votes: 12, percentage: 7.7 }
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 4,
    title: '办公环境改善建议',
    description: '为了营造更好的办公氛围，欢迎大家提出改善建议',
    question: '您认为办公环境最需要改善的是什么？',
    status: 'ongoing',
    type: 'multiple',
    creatorId: 4,
    creatorName: '人事主管',
    categoryId: 3,
    categoryName: '公司事务',
    startTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    totalVotes: 298,
    participantCount: 187,
    hasRewards: false,
    isAnonymous: true,
    allowMultiple: true,
    options: [
      { id: 1, text: '增加绿植装饰', votes: 89, percentage: 29.9 },
      { id: 2, text: '改善照明设备', votes: 76, percentage: 25.5 },
      { id: 3, text: '设置更多休息区', votes: 67, percentage: 22.5 },
      { id: 4, text: '添置咖啡机等设备', votes: 45, percentage: 15.1 },
      { id: 5, text: '调整温度控制', votes: 21, percentage: 7.0 }
    ],
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 5,
    title: '员工培训需求调研',
    description: '了解大家的培训需求，制定更有针对性的培训计划',
    question: '您最需要哪方面的培训？',
    status: 'ended',
    type: 'single',
    creatorId: 5,
    creatorName: '培训主管',
    categoryId: 4,
    categoryName: '员工福利',
    startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    totalVotes: 92,
    participantCount: 92,
    hasRewards: false,
    isAnonymous: true,
    allowMultiple: false,
    options: [
      { id: 1, text: '专业技能提升', votes: 38, percentage: 41.3 },
      { id: 2, text: '沟通协作能力', votes: 27, percentage: 29.3 },
      { id: 3, text: '领导力培养', votes: 16, percentage: 17.4 },
      { id: 4, text: '时间管理', votes: 11, percentage: 12.0 }
    ],
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// 生成投票时间线数据
function generateVoteTimeline(totalVotes) {
  const timeline = [];
  const hours = 24;
  const votesPerHour = Math.floor(totalVotes / hours);
  
  for (let i = 0; i < hours; i++) {
    const time = new Date(Date.now() - (hours - i) * 60 * 60 * 1000);
    timeline.push({
      time: time.toISOString(),
      votes: votesPerHour + Math.floor(Math.random() * 10),
      cumulativeVotes: (i + 1) * votesPerHour
    });
  }
  
  return timeline;
}

module.exports = {
  overviewStats,
  polls,
  generateVoteTimeline
};