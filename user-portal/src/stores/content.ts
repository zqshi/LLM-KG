import { defineStore } from 'pinia'
import type { Banner, News, Knowledge, ForumPost, MarketItem, Quote, Recommendation } from '@/types'

interface ContentState {
  banners: Banner[]
  news: News[]
  knowledge: Knowledge[]
  forumPosts: ForumPost[]
  marketItems: MarketItem[]
  quotes: Quote[]
  recommendations: Recommendation[]
  loading: boolean
}

export const useContentStore = defineStore('content', {
  state: (): ContentState => ({
    banners: [],
    news: [],
    knowledge: [],
    forumPosts: [],
    marketItems: [],
    quotes: [],
    recommendations: [],
    loading: false
  }),

  getters: {
    activeBanners: (state) => 
      state.banners.filter(b => b.status === 'active'),
    
    latestNews: (state) => 
      state.news.slice(0, 10),
    
    topForumPosts: (state) => 
      state.forumPosts.filter(p => p.isTop),
    
    availableMarketItems: (state) => 
      state.marketItems.filter(i => i.status === 'available'),

    randomQuote: (state) => {
      if (state.quotes.length === 0) return null
      return state.quotes[Math.floor(Math.random() * state.quotes.length)]
    }
  },

  actions: {
    // 获取轮播图
    async fetchBanners() {
      const mockBanners: Banner[] = [
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
        },
        {
          id: '3',
          title: '团建活动预告',
          image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop',
          link: '/news/3',
          description: '春季团建活动等你参与',
          startTime: '2024-01-01',
          endTime: '2024-12-31',
          status: 'active'
        }
      ]
      
      this.banners = mockBanners
    },

    // 获取资讯
    async fetchNews() {
      const mockNews: News[] = [
        {
          id: '1',
          title: '公司荣获"最佳雇主"奖项',
          content: '近日，公司在行业评选中荣获"最佳雇主"称号...',
          summary: '公司在人才管理和企业文化建设方面的成就得到了业界认可',
          author: '人力资源部',
          category: '公司新闻',
          tags: ['荣誉', '人才管理', '企业文化'],
          publishTime: '2024-01-15 10:00:00',
          readCount: 1250,
          likeCount: 89,
          commentCount: 23,
          source: '公司官网',
          isTop: true
        },
        {
          id: '2',
          title: '新技术栈培训计划启动',
          content: '为提升团队技术能力，公司启动新技术栈培训计划...',
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
      ]
      
      this.news = mockNews
    },

    // 获取知识库
    async fetchKnowledge() {
      const mockKnowledge: Knowledge[] = [
        {
          id: '1',
          title: 'Vue 3 开发最佳实践',
          content: 'Vue 3 带来了许多新特性和改进...',
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
        },
        {
          id: '2',
          title: '项目管理流程规范',
          content: '为规范项目管理流程，提高项目成功率...',
          summary: '详细的项目管理流程，包括需求分析、设计、开发、测试等阶段',
          author: '李四',
          department: '项目管理部',
          category: '管理制度',
          tags: ['项目管理', '流程', '规范'],
          createTime: '2024-01-08 09:00:00',
          updateTime: '2024-01-12 15:20:00',
          readCount: 789,
          likeCount: 45,
          downloadCount: 234,
          fileType: 'pdf',
          status: 'published'
        }
      ]
      
      this.knowledge = mockKnowledge
    },

    // 获取论坛帖子
    async fetchForumPosts() {
      const mockPosts: ForumPost[] = [
        {
          id: '1',
          title: '关于新办公区域的建议',
          content: '随着公司规模的扩大，新办公区域的设计应该考虑...',
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
        },
        {
          id: '2',
          title: '下一个季度最期待的功能是什么？',
          content: '我们正在规划下个季度的产品功能，希望听听大家的想法。请大家投票选出最期待的功能。',
          author: {
            id: '1',
            name: '产品团队',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
            department: '产品部',
            position: '产品经理',
            email: 'product@company.com',
            phone: '13800138000',
            joinDate: '2022-01-01',
            points: 3000,
            level: '钻石会员'
          },
          category: '产品反馈',
          tags: ['产品规划', '功能需求', '用户反馈'],
          createTime: '2024-01-16 09:00:00',
          updateTime: '2024-01-16 09:00:00',
          viewCount: 456,
          likeCount: 23,
          replyCount: 8,
          isTop: false,
          isHighlight: true,
          replies: [],
          poll: {
            question: '下一个季度最期待的功能是什么？',
            isMultiChoice: false,
            startTime: '2024-01-16 09:00:00',
            endTime: '2024-01-25 18:00:00',
            status: 'ongoing',
            userVoted: false,
            userChoices: [],
            resultVisible: 'real_time',
            totalVoters: 124,
            options: [
              {
                id: 1,
                text: '深色模式',
                count: 45,
                percent: 36.3,
                isSelected: false
              },
              {
                id: 2,
                text: '数据导出功能',
                count: 38,
                percent: 30.6,
                isSelected: false
              },
              {
                id: 3,
                text: '移动端App',
                count: 28,
                percent: 22.6,
                isSelected: false
              },
              {
                id: 4,
                text: '多语言支持',
                count: 13,
                percent: 10.5,
                isSelected: false
              }
            ]
          }
        },
        {
          id: '3',
          title: '年会节目投票（多选）',
          content: '年会即将到来，我们准备了丰富的节目表演。请大家投票选择最想看的节目（可多选）。',
          author: {
            id: '3',
            name: '行政部',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b45c0c46?w=100&h=100&fit=crop&crop=face',
            department: '行政部',
            position: '行政主管',
            email: 'admin@company.com',
            phone: '13800138003',
            joinDate: '2021-03-15',
            points: 2500,
            level: '白金会员'
          },
          category: '活动组织',
          tags: ['年会', '节目', '投票'],
          createTime: '2024-01-14 14:30:00',
          updateTime: '2024-01-14 14:30:00',
          viewCount: 289,
          likeCount: 34,
          replyCount: 15,
          isTop: false,
          isHighlight: false,
          replies: [],
          poll: {
            question: '你最想看哪些年会节目？',
            isMultiChoice: true,
            startTime: '2024-01-14 14:30:00',
            endTime: '2024-01-20 23:59:59',
            status: 'ongoing',
            userVoted: true,
            userChoices: [1, 3],
            resultVisible: 'after_end',
            totalVoters: 95,
            options: [
              {
                id: 1,
                text: '歌曲演唱',
                count: 0,
                percent: 0,
                isSelected: true
              },
              {
                id: 2,
                text: '舞蹈表演',
                count: 0,
                percent: 0,
                isSelected: false
              },
              {
                id: 3,
                text: '小品相声',
                count: 0,
                percent: 0,
                isSelected: true
              },
              {
                id: 4,
                text: '魔术表演',
                count: 0,
                percent: 0,
                isSelected: false
              },
              {
                id: 5,
                text: '乐器演奏',
                count: 0,
                percent: 0,
                isSelected: false
              }
            ]
          }
        }
      ]
      
      this.forumPosts = mockPosts
    },

    // 获取跳蚤市场
    async fetchMarketItems() {
      const mockItems: MarketItem[] = [
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
      ]
      
      this.marketItems = mockItems
    },

    // 获取领导名言
    async fetchQuotes() {
      const mockQuotes: Quote[] = [
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
        },
        {
          id: '3',
          content: '质量是企业的生命线，任何时候都不能放松对质量的要求。',
          author: '王总',
          position: 'COO',
          context: '在质量管理会议上的讲话',
          createTime: '2024-01-08 16:00:00'
        }
      ]
      
      this.quotes = mockQuotes
    },

    // 获取个性化推荐
    async fetchRecommendations() {
      const mockRecommendations: Recommendation[] = [
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
        },
        {
          id: '3',
          type: 'forum',
          title: '关于代码审查流程的讨论',
          summary: '如何建立有效的代码审查机制，提高代码质量',
          link: '/forum/post/code-review',
          score: 0.82,
          reason: '热门技术讨论'
        }
      ]
      
      this.recommendations = mockRecommendations
    },

    // 初始化所有内容
    async initializeContent() {
      this.loading = true
      try {
        await Promise.all([
          this.fetchBanners(),
          this.fetchNews(),
          this.fetchKnowledge(),
          this.fetchForumPosts(),
          this.fetchMarketItems(),
          this.fetchQuotes(),
          this.fetchRecommendations()
        ])
      } finally {
        this.loading = false
      }
    }
  }
})