const express = require('express')
const cors = require('cors')

const app = express()
const PORT = 3007

app.use(cors())
app.use(express.json())

// Mock 数据
const mockData = {
  // 用户数据
  users: [
    {
      id: '1',
      name: '张三',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      department: '技术部',
      position: '高级工程师',
      email: 'zhangsan@company.com',
      phone: '13800138000',
      joinDate: '2022-01-15',
      points: 2580,
      level: '钻石会员'
    }
  ],

  // Banner 数据
  banners: [
    {
      id: '1',
      title: '2024年度表彰大会',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=400&fit=crop',
      link: '/news/1',
      description: '表彰优秀员工，分享成功经验',
      startTime: '2024-01-01',
      endTime: '2024-12-31',
      status: 'active'
    },
    {
      id: '2',
      title: '新产品发布会',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=400&fit=crop',
      link: '/news/2',
      description: '公司最新产品即将面世',
      startTime: '2024-01-01',
      endTime: '2024-12-31',
      status: 'active'
    }
  ],

  // 资讯数据
  news: [
    {
      id: '1',
      title: '公司荣获"最佳雇主"奖项',
      content: `
        <p>近日，公司在行业评选中荣获"最佳雇主"称号，这是对我们在人才管理和企业文化建设方面成就的重要认可。</p>
        
        <h3>评选背景</h3>
        <p>本次评选由权威机构举办，从员工满意度、薪酬福利、职业发展、工作环境等多个维度进行综合评估。</p>
        
        <h3>获奖原因</h3>
        <ul>
          <li>完善的员工培训体系</li>
          <li>具有竞争力的薪酬福利</li>
          <li>良好的工作氛围</li>
          <li>明确的职业发展通道</li>
        </ul>
        
        <h3>未来展望</h3>
        <p>公司将继续秉承"以人为本"的理念，为员工创造更好的发展平台，共同推动企业和个人的成长。</p>
      `,
      summary: '公司在人才管理和企业文化建设方面的成就得到了业界认可',
      author: '人力资源部',
      category: '公司新闻',
      tags: ['荣誉', '人才管理', '企业文化'],
      publishTime: '2024-01-15 10:00:00',
      readCount: 1250,
      likeCount: 89,
      commentCount: 23,
      coverImage: 'https://images.unsplash.com/photo-1556155092-8707de31f9c4?w=400&h=200&fit=crop',
      source: '公司官网',
      isTop: true
    },
    {
      id: '2',
      title: '新技术栈培训计划启动',
      content: `
        <p>为提升团队技术能力，公司正式启动新技术栈培训计划，覆盖前端、后端、DevOps等多个技术领域。</p>
        
        <h3>培训内容</h3>
        <p>本次培训计划包含以下内容：</p>
        <ul>
          <li>Vue 3 + TypeScript 前端开发</li>
          <li>Node.js + Express 后端开发</li>
          <li>Docker + Kubernetes 容器化部署</li>
          <li>微服务架构设计</li>
        </ul>
        
        <p>培训将采用理论与实践相结合的方式，确保学员能够学以致用。</p>
      `,
      summary: '覆盖前端、后端、DevOps等多个技术领域的全面培训',
      author: '技术部',
      category: '培训通知',
      tags: ['培训', '技术栈', '能力提升'],
      publishTime: '2024-01-14 14:30:00',
      readCount: 890,
      likeCount: 67,
      commentCount: 15,
      source: '内部通知',
      isTop: false
    }
  ],

  // 知识库数据
  knowledge: [
    {
      id: '1',
      title: 'Vue 3 开发最佳实践',
      content: `
        <h2>Vue 3 开发最佳实践</h2>
        
        <p>Vue 3 带来了许多新特性和改进，本文档详细介绍Vue 3的新特性、组合式API等核心概念。</p>
        
        <h3>组合式 API</h3>
        <p>Vue 3 引入的组合式 API 提供了更灵活的代码组织方式：</p>
        
        <pre><code>
import { ref, computed } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const doubleCount = computed(() => count.value * 2)
    
    return {
      count,
      doubleCount
    }
  }
}
        </code></pre>
        
        <h3>性能优化</h3>
        <ul>
          <li>使用 v-memo 进行条件记忆</li>
          <li>合理使用 watchEffect</li>
          <li>避免不必要的响应式转换</li>
        </ul>
      `,
      summary: '详细介绍Vue 3的新特性、组合式API等核心概念',
      author: '张三',
      department: '技术部',
      category: '前端技术',
      tags: ['Vue3', '前端', '开发规范'],
      createTime: '2024-01-10 16:00:00',
      updateTime: '2024-01-15 10:30:00',
      readCount: 456,
      likeCount: 78,
      downloadCount: 123,
      fileType: 'doc',
      status: 'published'
    }
  ],

  // 论坛帖子数据
  forumPosts: [
    {
      id: '1',
      title: '关于新办公区域的建议',
      content: '随着公司规模的扩大，新办公区域的设计应该更加注重员工的工作体验...',
      author: {
        id: '2',
        name: '王五',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b45c0c46?w=100&h=100&fit=crop&crop=face',
        department: '行政部',
        position: '行政专员',
        email: 'wangwu@company.com',
        phone: '13800138001',
        joinDate: '2023-03-20',
        points: 1200,
        level: '黄金会员'
      },
      category: '公司建议',
      tags: ['办公环境', '建议'],
      createTime: '2024-01-15 11:20:00',
      updateTime: '2024-01-15 11:20:00',
      viewCount: 234,
      likeCount: 45,
      replyCount: 12,
      isTop: true,
      isHighlight: false,
      replies: []
    }
  ],

  // 跳蚤市场数据
  marketItems: [
    {
      id: '1',
      title: 'iPhone 13 Pro Max 256GB',
      description: '9成新，无磕碰，配件齐全，因升级新机出售',
      price: 6800,
      originalPrice: 9999,
      condition: 'like-new',
      category: '数码产品',
      images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop'],
      seller: {
        id: '3',
        name: '赵六',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        department: '市场部',
        position: '市场专员',
        email: 'zhaoliu@company.com',
        phone: '13800138002',
        joinDate: '2022-08-15',
        points: 1800,
        level: '钻石会员'
      },
      createTime: '2024-01-14 20:15:00',
      status: 'available',
      location: '公司内部',
      contactInfo: '微信: zhaoliu123'
    }
  ],

  // 领导名言数据
  quotes: [
    {
      id: '1',
      content: '创新是企业发展的第一动力，我们要敢于突破，勇于尝试。',
      author: '张总',
      position: 'CEO',
      context: '在2024年新年致辞中提到',
      createTime: '2024-01-01 00:00:00'
    },
    {
      id: '2',
      content: '员工是公司最宝贵的财富，我们要为员工创造更好的发展平台。',
      author: '李总',
      position: 'CTO',
      context: '在技术部门会议中强调',
      createTime: '2024-01-05 14:30:00'
    }
  ],

  // 推荐数据
  recommendations: [
    {
      id: '1',
      type: 'news',
      title: '技术部门2024年规划发布',
      summary: '详细介绍技术部门今年的重点工作和发展方向',
      link: '/news/tech-plan-2024',
      score: 0.95,
      reason: '基于你的技术背景推荐'
    },
    {
      id: '2',
      type: 'knowledge',
      title: 'React 18 新特性详解',
      summary: 'React 18引入的并发特性和新的Hook详细解析',
      link: '/knowledge/react18-features',
      score: 0.88,
      reason: '你最近查看了前端相关内容'
    }
  ]
}

// API 路由
app.get('/api/banners', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: mockData.banners,
    success: true
  })
})

app.get('/api/news', (req, res) => {
  const { category, keyword, page = 1, pageSize = 10 } = req.query
  let news = [...mockData.news]
  
  // 分类筛选
  if (category && category !== 'all') {
    news = news.filter(item => item.category === category)
  }
  
  // 关键词搜索
  if (keyword) {
    news = news.filter(item => 
      item.title.includes(keyword) || 
      item.summary.includes(keyword)
    )
  }
  
  // 分页
  const start = (page - 1) * pageSize
  const items = news.slice(start, start + parseInt(pageSize))
  
  res.json({
    code: 200,
    message: 'success',
    data: {
      items,
      total: news.length,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    },
    success: true
  })
})

app.get('/api/news/:id', (req, res) => {
  const { id } = req.params
  const news = mockData.news.find(item => item.id === id)
  
  if (news) {
    res.json({
      code: 200,
      message: 'success',
      data: news,
      success: true
    })
  } else {
    res.status(404).json({
      code: 404,
      message: 'News not found',
      success: false
    })
  }
})

app.get('/api/knowledge', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: mockData.knowledge,
    success: true
  })
})

app.get('/api/forum/posts', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: mockData.forumPosts,
    success: true
  })
})

app.get('/api/market/items', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: mockData.marketItems,
    success: true
  })
})

app.get('/api/quotes', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: mockData.quotes,
    success: true
  })
})

app.get('/api/recommendations', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: mockData.recommendations,
    success: true
  })
})

// 用户登录
app.post('/api/login', (req, res) => {
  const { username, password } = req.body
  
  // 简单的登录验证
  if (username && password) {
    res.json({
      code: 200,
      message: 'Login successful',
      data: mockData.users[0],
      success: true
    })
  } else {
    res.status(401).json({
      code: 401,
      message: 'Invalid credentials',
      success: false
    })
  }
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`)
})