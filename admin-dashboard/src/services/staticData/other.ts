/**
 * 其他模块静态数据
 */

import type { QuotationStatus } from '@/types'

// Banner管理数据
export const banners = [
  {
    id: 1,
    title: '企业知识分享平台正式上线',
    image: '/images/banner1.jpg',
    link: '/announcement/1',
    position: 'homepage',
    status: 1,
    sort: 1,
    startTime: '2024-12-01 00:00:00',
    endTime: '2024-12-31 23:59:59',
    viewCount: 12456,
    clickCount: 1234,
    createTime: '2024-11-30 10:00:00'
  },
  {
    id: 2,
    title: '年度优秀员工评选活动开始',
    image: '/images/banner2.jpg',
    link: '/activity/annual-award',
    position: 'homepage',
    status: 1,
    sort: 2,
    startTime: '2024-12-10 00:00:00',
    endTime: '2024-12-25 23:59:59',
    viewCount: 8901,
    clickCount: 890,
    createTime: '2024-12-09 15:00:00'
  },
  {
    id: 3,
    title: '技术分享会报名开始',
    image: '/images/banner3.jpg',
    link: '/events/tech-sharing',
    position: 'tech',
    status: 1,
    sort: 1,
    startTime: '2024-12-12 00:00:00',
    endTime: '2024-12-20 23:59:59',
    viewCount: 5678,
    clickCount: 567,
    createTime: '2024-12-11 14:00:00'
  }
]

// 跳蚤市场数据
export const fleaMarket = {
  categories: [
    { id: 1, name: '数码产品', icon: 'Monitor', sort: 1, status: 1, goodsCount: 45 },
    { id: 2, name: '办公用品', icon: 'OfficeBuilding', sort: 2, status: 1, goodsCount: 23 },
    { id: 3, name: '书籍资料', icon: 'Reading', sort: 3, status: 1, goodsCount: 67 },
    { id: 4, name: '生活用品', icon: 'House', sort: 4, status: 1, goodsCount: 34 },
    { id: 5, name: '其他', icon: 'More', sort: 5, status: 1, goodsCount: 12 }
  ],
  goods: [
    {
      id: 1,
      title: '二手iPhone 13',
      description: '95成新，无拆无修，配件齐全',
      price: 3999,
      originalPrice: 5999,
      categoryId: 1,
      category: '数码产品',
      images: ['/images/goods/iphone13-1.jpg', '/images/goods/iphone13-2.jpg'],
      seller: {
        id: 2,
        name: '张三',
        avatar: '/avatars/zhangsan.jpg',
        department: '技术部'
      },
      status: 1, // 1:在售 2:已售 3:下架
      viewCount: 234,
      favoriteCount: 12,
      createTime: '2024-12-10 14:30:00'
    },
    {
      id: 2,
      title: '办公桌椅一套',
      description: '人体工学椅+升降桌，搬家出售',
      price: 500,
      originalPrice: 1200,
      categoryId: 2,
      category: '办公用品',
      images: ['/images/goods/desk-chair-1.jpg'],
      seller: {
        id: 3,
        name: '李四',
        avatar: '/avatars/lisi.jpg',
        department: '产品部'
      },
      status: 1 as 1 | 0,
      viewCount: 156,
      favoriteCount: 8,
      createTime: '2024-12-09 16:20:00'
    }
  ],
  reports: [
    {
      id: 1,
      goodsId: 1,
      goods: '二手iPhone 13',
      reason: '价格虚高',
      description: '同款商品市场价格明显低于此价格',
      reporter: {
        id: 4,
        name: '王五',
        avatar: '/avatars/wangwu.jpg'
      },
      status: 1, // 1:待处理 2:已处理 3:已驳回
      createTime: '2024-12-11 10:30:00'
    }
  ]
}

// 名言管理数据
export const quotations = [
  {
    id: 1,
    content: '创新是企业发展的第一动力',
    contentHtml: '<p>创新是企业发展的第一动力</p>',
    leaderId: 1,
    leader: {
      id: 1,
      name: 'CEO',
      username: 'ceo',
      email: 'ceo@company.com',
      avatar: '',
      groupId: 1,
      roles: [],
      status: 1 as 1 | 0,
      createTime: '2024-12-01 10:00:00',
      updateTime: '2024-12-01 10:00:00'
    },
    occasion: '公司年会',
    occurrenceTime: '2024-12-01',
    background: '在公司年会上发表重要讲话',
    status: 'published' as QuotationStatus,
    version: 1,
    creatorId: 1,
    creator: {
      id: 1,
      name: 'CEO',
      username: 'ceo',
      email: 'ceo@company.com',
      avatar: '',
      groupId: 1,
      roles: [],
      status: 1 as 1 | 0,
      createTime: '2024-12-01 10:00:00',
      updateTime: '2024-12-01 10:00:00'
    },
    reviewerId: 1,
    reviewer: {
      id: 1,
      name: 'CEO',
      username: 'ceo',
      email: 'ceo@company.com',
      avatar: '',
      groupId: 1,
      roles: [],
      status: 1 as 1 | 0,
      createTime: '2024-12-01 10:00:00',
      updateTime: '2024-12-01 10:00:00'
    },
    publishTime: '2024-12-01 10:00:00',
    showCount: 1234,
    likeCount: 89,
    tags: ['创新', '发展'],
    createTime: '2024-12-01 10:00:00',
    updateTime: '2024-12-01 10:00:00'
  },
  {
    id: 2,
    content: '团队合作是成功的基石',
    contentHtml: '<p>团队合作是成功的基石</p>',
    leaderId: 2,
    leader: {
      id: 2,
      name: 'CTO',
      username: 'cto',
      email: 'cto@company.com',
      avatar: '',
      groupId: 1,
      roles: [],
      status: 1 as 1 | 0,
      createTime: '2024-12-02 14:30:00',
      updateTime: '2024-12-02 14:30:00'
    },
    occasion: '技术分享会',
    occurrenceTime: '2024-12-02',
    background: '在技术分享会上发表重要讲话',
    status: 'published' as QuotationStatus,
    version: 1,
    creatorId: 2,
    creator: {
      id: 2,
      name: 'CTO',
      username: 'cto',
      email: 'cto@company.com',
      avatar: '',
      groupId: 1,
      roles: [],
      status: 1 as 1 | 0,
      createTime: '2024-12-02 14:30:00',
      updateTime: '2024-12-02 14:30:00'
    },
    reviewerId: 2,
    reviewer: {
      id: 2,
      name: 'CTO',
      username: 'cto',
      email: 'cto@company.com',
      avatar: '',
      groupId: 1,
      roles: [],
      status: 1 as 1 | 0,
      createTime: '2024-12-02 14:30:00',
      updateTime: '2024-12-02 14:30:00'
    },
    publishTime: '2024-12-02 14:30:00',
    showCount: 987,
    likeCount: 67,
    tags: ['团队', '合作'],
    createTime: '2024-12-02 14:30:00',
    updateTime: '2024-12-02 14:30:00'
  },
  {
    id: 3,
    content: '持续学习，永远年轻',
    contentHtml: '<p>持续学习，永远年轻</p>',
    leaderId: 3,
    leader: {
      id: 3,
      name: 'CPO',
      username: 'cpo',
      email: 'cpo@company.com',
      avatar: '',
      groupId: 1,
      roles: [],
      status: 1 as 1 | 0,
      createTime: '2024-12-03 09:15:00',
      updateTime: '2024-12-03 09:15:00'
    },
    occasion: '新员工培训',
    occurrenceTime: '2024-12-03',
    background: '在新员工培训上发表重要讲话',
    status: 'published' as QuotationStatus,
    version: 1,
    creatorId: 3,
    creator: {
      id: 3,
      name: 'CPO',
      username: 'cpo',
      email: 'cpo@company.com',
      avatar: '',
      groupId: 1,
      roles: [],
      status: 1 as 1 | 0,
      createTime: '2024-12-03 09:15:00',
      updateTime: '2024-12-03 09:15:00'
    },
    reviewerId: 3,
    reviewer: {
      id: 3,
      name: 'CPO',
      username: 'cpo',
      email: 'cpo@company.com',
      avatar: '',
      groupId: 1,
      roles: [],
      status: 1 as 1 | 0,
      createTime: '2024-12-03 09:15:00',
      updateTime: '2024-12-03 09:15:00'
    },
    publishTime: '2024-12-03 09:15:00',
    showCount: 765,
    likeCount: 45,
    tags: ['学习', '成长'],
    createTime: '2024-12-03 09:15:00',
    updateTime: '2024-12-03 09:15:00'
  }
]

// 资讯聚合数据
export const news = {
  sources: [
    {
      id: 1,
      name: '36氪',
      url: 'https://36kr.com',
      type: 'tech',
      status: 1 as 1 | 0,
      updateInterval: 3600,
      lastUpdateTime: '2024-12-14 16:00:00',
      articleCount: 234
    },
    {
      id: 2,
      name: '虎嗅网',
      url: 'https://huxiu.com',
      type: 'business',
      status: 1 as 1 | 0,
      updateInterval: 7200,
      lastUpdateTime: '2024-12-14 15:30:00',
      articleCount: 156
    }
  ],
  articles: [
    {
      id: 1,
      title: 'AI助力企业数字化转型新趋势',
      summary: '随着人工智能技术的快速发展，越来越多的企业开始探索AI在数字化转型中的应用...',
      sourceId: 1,
      sourceName: '36氪',
      url: 'https://36kr.com/article/1',
      publishTime: '2024-12-14 14:30:00',
      fetchTime: '2024-12-14 15:00:00',
      status: 1 as 1 | 0,
      viewCount: 456
    },
    {
      id: 2,
      title: '2024年企业管理新模式解析',
      summary: '后疫情时代，企业管理模式发生了深刻变化，远程办公、弹性工作制等新模式逐渐普及...',
      sourceId: 2,
      sourceName: '虎嗅网',
      url: 'https://huxiu.com/article/1',
      publishTime: '2024-12-14 13:45:00',
      fetchTime: '2024-12-14 14:15:00',
      status: 1 as 1 | 0,
      viewCount: 323
    }
  ]
}

// 审核中心数据
export const auditCenter = {
  tasks: [
    {
      id: 1,
      type: 'content',
      title: 'React Hooks 深度解析',
      content: '最近在项目中大量使用了 React Hooks，想分享一些使用心得...',
      author: {
        id: 3,
        name: '李四',
        avatar: '/avatars/lisi.jpg'
      },
      status: 1, // 1:待审核 2:已通过 3:已拒绝
      priority: 'normal',
      createTime: '2024-12-14 16:30:00',
      assignee: {
        id: 1,
        name: '系统管理员'
      }
    },
    {
      id: 2,
      type: 'goods',
      title: '二手MacBook Pro',
      content: '2022款MacBook Pro，16寸，M1 Max芯片...',
      author: {
        id: 5,
        name: '赵六',
        avatar: '/avatars/zhaoliu.jpg'
      },
      status: 1 as 1 | 0,
      priority: 'low',
      createTime: '2024-12-14 15:45:00',
      assignee: null
    }
  ],
  statistics: {
    total: 156,
    pending: 23,
    approved: 120,
    rejected: 13,
    todayProcessed: 8
  }
}

// 运营管理数据
export const operation = {
  homepage: {
    banners: banners.filter(b => b.position === 'homepage'),
    announcements: [
      {
        id: 1,
        title: '系统维护通知',
        content: '系统将于今晚进行维护',
        type: 'system',
        status: 1 as 1 | 0,
        sort: 1
      }
    ],
    quickLinks: [
      { id: 1, name: '技术讨论', icon: 'Monitor', url: '/content/categories/1', sort: 1 },
      { id: 2, name: '员工福利', icon: 'Present', url: '/content/categories/4', sort: 2 },
      { id: 3, name: '跳蚤市场', icon: 'ShoppingCart', url: '/flea-market', sort: 3 }
    ]
  },
  recommendations: [
    {
      id: 1,
      title: 'Vue 3 最佳实践',
      type: 'content',
      targetId: 1,
      position: 'homepage_top',
      status: 1 as 1 | 0,
      sort: 1,
      startTime: '2024-12-10 00:00:00',
      endTime: '2024-12-20 23:59:59'
    }
  ],
  rankings: [
    {
      id: 1,
      name: '本周热门文章',
      type: 'weekly_hot',
      status: 1 as 1 | 0,
      items: [
        { rank: 1, title: '2024年度员工大会通知', score: 2345 },
        { rank: 2, title: '年终奖发放时间确认', score: 1890 },
        { rank: 3, title: 'Vue 3 Composition API 最佳实践分享', score: 1245 }
      ]
    }
  ]
}

// 门户配置数据
export const portalConfig = {
  navigation: [
    {
      id: 1,
      name: '首页',
      path: '/',
      icon: 'House',
      sort: 1,
      status: 1 as 1 | 0,
      children: []
    },
    {
      id: 2,
      name: '技术讨论',
      path: '/tech',
      icon: 'Monitor',
      sort: 2,
      status: 1 as 1 | 0,
      children: [
        { id: 21, name: '前端技术', path: '/tech/frontend', sort: 1, status: 1 },
        { id: 22, name: '后端技术', path: '/tech/backend', sort: 2, status: 1 }
      ]
    }
  ],
  entryPanels: [
    {
      id: 1,
      name: '快速入口',
      type: 'grid',
      position: 'main',
      config: {
        columns: 4,
        items: [
          { name: '发布文章', icon: 'Edit', url: '/content/create' },
          { name: '我的草稿', icon: 'Document', url: '/content/drafts' },
          { name: '消息中心', icon: 'Bell', url: '/messages' },
          { name: '个人资料', icon: 'User', url: '/profile' }
        ]
      },
      status: 1 as 1 | 0,
      sort: 1
    }
  ]
}

// 系统配置数据
export const systemConfig = {
  settings: {
    siteName: '企业内部门户系统',
    siteDescription: '企业内部知识分享与协作平台',
    siteKeywords: '企业,知识分享,协作,管理',
    uploadMaxSize: 10,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
    enableRegistration: false,
    enableEmailNotification: true,
    enableSmsNotification: false
  },
  logs: [
    {
      id: 1,
      user: '张三',
      action: '登录系统',
      ip: '192.168.1.100',
      userAgent: 'Chrome/120.0.0.0',
      createTime: '2024-12-14 16:30:00'
    },
    {
      id: 2,
      user: '李四',
      action: '发布文章',
      detail: 'React Hooks 深度解析',
      ip: '192.168.1.101',
      userAgent: 'Chrome/120.0.0.0',
      createTime: '2024-12-14 16:25:00'
    }
  ],
  alerts: [
    {
      id: 1,
      type: 'error',
      title: '数据库连接异常',
      message: '数据库连接超时，请检查网络连接',
      level: 'high',
      status: 1 as 1 | 0,
      createTime: '2024-12-14 15:30:00'
    },
    {
      id: 2,
      type: 'warning',
      title: '磁盘空间不足',
      message: '系统磁盘使用率已达到85%',
      level: 'medium',
      status: 1 as 1 | 0,
      createTime: '2024-12-14 14:20:00'
    }
  ]
}