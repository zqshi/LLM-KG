/**
 * 语录管理模块数据
 */

const quotationList = [
  {
    id: 1,
    content: '成功不是终点，失败不是末日，勇气才是最重要的。',
    author: '温斯顿·丘吉尔',
    source: '演讲',
    category: '成功励志',
    tags: ['成功', '勇气', '坚持'],
    status: 'published',
    showCount: 1250,
    viewCount: 1250,
    likeCount: 89,
    occasion: '企业年会',
    leader: { id: 1, name: '张明' },
    createTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    content: '教育的目的在于培养性格。',
    author: '斯宾塞',
    source: '教育论',
    category: '教育哲学',
    tags: ['教育', '性格', '哲学'],
    status: 'published',
    showCount: 980,
    viewCount: 980,
    likeCount: 76,
    occasion: '教育论坛',
    leader: { id: 2, name: '李华' },
    createTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    content: '学而时习之，不亦说乎？',
    author: '孔子',
    source: '论语·学而',
    category: '学习成长',
    tags: ['学习', '经典', '国学'],
    status: 'published',
    showCount: 1580,
    viewCount: 1580,
    likeCount: 142,
    occasion: '学习分享会',
    leader: { id: 3, name: '王强' },
    createTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 4,
    content: '团队合作是成功的基石。',
    author: '亨利·福特',
    source: '企业管理',
    category: '团队管理',
    tags: ['团队', '合作', '成功'],
    status: 'published',
    showCount: 820,
    viewCount: 820,
    likeCount: 65,
    occasion: '团队建设会议',
    leader: { id: 4, name: '赵敏' },
    createTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 5,
    content: '创新是企业发展的不竭动力。',
    author: '史蒂夫·乔布斯',
    source: '苹果发布会',
    category: '创新创业',
    tags: ['创新', '发展', '企业'],
    status: 'draft',
    showCount: 0,
    viewCount: 0,
    likeCount: 0,
    occasion: '产品发布会',
    leader: { id: 5, name: '刘伟' },
    createTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const tags = [
  { id: 1, name: '成功', count: 45, color: '#1890ff' },
  { id: 2, name: '勇气', count: 32, color: '#52c41a' },
  { id: 3, name: '坚持', count: 28, color: '#722ed1' },
  { id: 4, name: '教育', count: 36, color: '#fa8c16' },
  { id: 5, name: '性格', count: 19, color: '#eb2f96' },
  { id: 6, name: '哲学', count: 24, color: '#13c2c2' },
  { id: 7, name: '学习', count: 41, color: '#f759ab' },
  { id: 8, name: '经典', count: 33, color: '#597ef7' },
  { id: 9, name: '国学', count: 27, color: '#73d13d' },
  { id: 10, name: '团队', count: 38, color: '#ffec3d' }
];

const statistics = {
  total: quotationList.length,
  published: quotationList.filter(q => q.status === 'published').length,
  draft: quotationList.filter(q => q.status === 'draft').length,
  totalViews: quotationList.reduce((sum, q) => sum + q.viewCount, 0),
  totalLikes: quotationList.reduce((sum, q) => sum + q.likeCount, 0),
  todayViews: 245,
  todayLikes: 18
};

const playlists = [
  { id: 1, name: '励志名言集', count: 25 },
  { id: 2, name: '经典语录', count: 18 },
  { id: 3, name: '管理智慧', count: 12 },
  { id: 4, name: '学习感悟', count: 15 }
];

const dailyQuoteConfig = {
  enabled: true,
  displayTime: '08:00',
  category: '成功励志',
  shuffleEnabled: true
};

module.exports = {
  quotationList,
  tags,
  statistics,
  playlists,
  dailyQuoteConfig
};