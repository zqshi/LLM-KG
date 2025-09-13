import type { Category, CategoryStats } from '@/api/categories'

/**
 * 版块静态数据
 */
export const categories = async (): Promise<Category[]> => {
  return [
    {
      id: 1,
      name: '技术讨论',
      code: 'tech',
      description: '分享技术心得，讨论技术问题',
      icon: 'code',
      sortOrder: 1,
      isPublic: true,
      isActive: true,
      auditMode: 'post',
      postPermissions: ['all'],
      postCount: 1245,
      todayPosts: 12,
      moderators: [
        { id: 1, name: '技术管理员', avatar: '/avatars/admin1.jpg' },
        { id: 2, name: '开发组长', avatar: '/avatars/admin2.jpg' }
      ],
      createdAt: '2024-01-01 09:00:00',
      updatedAt: '2024-01-15 14:30:00',
      visibleDepartments: [],
      sampleRate: 10
    },
    {
      id: 2,
      name: '产品设计',
      code: 'design',
      description: '产品设计相关讨论',
      icon: 'design',
      sortOrder: 2,
      isPublic: true,
      isActive: true,
      auditMode: 'pre',
      postPermissions: ['design_team', 'product_team'],
      postCount: 856,
      todayPosts: 8,
      moderators: [
        { id: 3, name: '设计总监', avatar: '/avatars/admin3.jpg' }
      ],
      createdAt: '2024-01-02 10:15:00',
      updatedAt: '2024-01-14 16:20:00',
      visibleDepartments: ['design', 'product'],
      sampleRate: 20
    },
    {
      id: 3,
      name: '内部公告',
      code: 'announcement',
      description: '公司内部重要公告发布',
      icon: 'announcement',
      sortOrder: 3,
      isPublic: false,
      isActive: true,
      auditMode: 'none',
      postPermissions: ['admin', 'hr'],
      postCount: 156,
      todayPosts: 2,
      moderators: [
        { id: 4, name: 'HR主管', avatar: '/avatars/admin4.jpg' },
        { id: 5, name: '行政经理', avatar: '/avatars/admin5.jpg' }
      ],
      createdAt: '2024-01-03 08:30:00',
      updatedAt: '2024-01-15 09:45:00',
      visibleDepartments: ['all'],
      sampleRate: 0
    },
    {
      id: 4,
      name: '随便聊聊',
      code: 'general',
      description: '闲聊交流，放松心情',
      icon: 'chat',
      sortOrder: 4,
      isPublic: true,
      isActive: true,
      auditMode: 'sample',
      postPermissions: ['all'],
      postCount: 2345,
      todayPosts: 25,
      moderators: [
        { id: 6, name: '社区管理员', avatar: '/avatars/admin6.jpg' }
      ],
      createdAt: '2024-01-04 15:45:00',
      updatedAt: '2024-01-13 11:30:00',
      visibleDepartments: [],
      sampleRate: 5
    },
    {
      id: 5,
      name: '建议反馈',
      code: 'feedback',
      description: '对平台的建议和问题反馈',
      icon: 'feedback',
      sortOrder: 5,
      isPublic: true,
      isActive: false,
      auditMode: 'pre',
      postPermissions: ['all'],
      postCount: 423,
      todayPosts: 0,
      moderators: [
        { id: 7, name: '客服主管', avatar: '/avatars/admin7.jpg' }
      ],
      createdAt: '2024-01-05 12:00:00',
      updatedAt: '2024-01-10 14:15:00',
      visibleDepartments: [],
      sampleRate: 50
    }
  ]
}

/**
 * 版块统计数据
 */
export const categoryStats = async (): Promise<CategoryStats> => {
  return {
    total: 5,
    active: 4,
    inactive: 1,
    totalPosts: 5025,
    todayPosts: 47,
    moderators: 7
  }
}

/**
 * 部门树结构数据
 */
export const departmentTree = async () => {
  return [
    {
      id: 1,
      name: '技术部',
      code: 'tech',
      children: [
        { id: 11, name: '前端组', code: 'frontend' },
        { id: 12, name: '后端组', code: 'backend' },
        { id: 13, name: '测试组', code: 'test' }
      ]
    },
    {
      id: 2,
      name: '产品部',
      code: 'product',
      children: [
        { id: 21, name: '产品设计', code: 'design' },
        { id: 22, name: '用户研究', code: 'research' }
      ]
    },
    {
      id: 3,
      name: '运营部',
      code: 'operation',
      children: [
        { id: 31, name: '市场营销', code: 'marketing' },
        { id: 32, name: '内容运营', code: 'content' }
      ]
    },
    {
      id: 4,
      name: '人事部',
      code: 'hr',
      children: []
    }
  ]
}

/**
 * 用户搜索数据
 */
export const searchUsers = async (keyword: string) => {
  const allUsers = [
    { id: 1, name: '张三', username: 'zhangsan', email: 'zhangsan@example.com', department: '技术部', avatar: '/avatars/user1.jpg' },
    { id: 2, name: '李四', username: 'lisi', email: 'lisi@example.com', department: '产品部', avatar: '/avatars/user2.jpg' },
    { id: 3, name: '王五', username: 'wangwu', email: 'wangwu@example.com', department: '设计部', avatar: '/avatars/user3.jpg' },
    { id: 4, name: '赵六', username: 'zhaoliu', email: 'zhaoliu@example.com', department: '运营部', avatar: '/avatars/user4.jpg' },
    { id: 5, name: '钱七', username: 'qianqi', email: 'qianqi@example.com', department: '人事部', avatar: '/avatars/user5.jpg' }
  ]
  
  if (keyword) {
    return allUsers.filter(user => 
      user.name.includes(keyword) || 
      user.username.includes(keyword) || 
      user.email.includes(keyword)
    )
  }
  return allUsers.slice(0, 10)
}

/**
 * 版块最新帖子数据
 */
export const latestPosts = async (categoryId: number) => {
  return [
    {
      id: 1,
      title: 'Vue 3新特性探讨',
      author: '前端开发者',
      createTime: '2024-01-15 14:30:00',
      replyCount: 8,
      viewCount: 125
    },
    {
      id: 2,
      title: 'React vs Vue选择问题',
      author: '技术爱好者',
      createTime: '2024-01-15 13:45:00',
      replyCount: 12,
      viewCount: 256
    },
    {
      id: 3,
      title: '微前端架构实践分享',
      author: '架构师',
      createTime: '2024-01-15 11:20:00',
      replyCount: 6,
      viewCount: 89
    },
    {
      id: 4,
      title: 'TypeScript最佳实践',
      author: '全栈工程师',
      createTime: '2024-01-15 09:15:00',
      replyCount: 15,
      viewCount: 345
    },
    {
      id: 5,
      title: '性能优化心得体会',
      author: '性能专家',
      createTime: '2024-01-14 16:30:00',
      replyCount: 9,
      viewCount: 198
    }
  ]
}