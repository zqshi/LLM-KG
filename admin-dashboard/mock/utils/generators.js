/**
 * 数据生成器工具
 * 提供各种类型的模拟数据生成函数
 */

const config = require('../config');

// 随机工具函数
const random = {
  // 生成随机整数
  int: (min = 0, max = 100) => Math.floor(Math.random() * (max - min + 1)) + min,
  
  // 生成随机浮点数
  float: (min = 0, max = 100, decimals = 2) => {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
  },
  
  // 从数组中随机选择一个元素
  pick: (array) => array[Math.floor(Math.random() * array.length)],
  
  // 从数组中随机选择多个元素
  picks: (array, count = 1) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
  },
  
  // 生成随机布尔值
  boolean: (probability = 0.5) => Math.random() < probability,
  
  // 生成随机UUID
  uuid: () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
};

// 时间生成器
const dateGenerator = {
  // 生成随机日期
  random: (startDate = new Date(2020, 0, 1), endDate = new Date()) => {
    const start = startDate.getTime();
    const end = endDate.getTime();
    return new Date(start + Math.random() * (end - start));
  },
  
  // 生成最近N天的随机日期
  recentDays: (days = 30) => {
    const now = new Date();
    const past = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return dateGenerator.random(past, now);
  },
  
  // 格式化为ISO字符串
  toISO: (date = new Date()) => date.toISOString(),
  
  // 生成创建时间和更新时间
  createdUpdated: () => {
    const created = dateGenerator.recentDays(90);
    const updated = dateGenerator.random(created, new Date());
    return {
      createdAt: dateGenerator.toISO(created),
      updatedAt: dateGenerator.toISO(updated)
    };
  }
};

// 文本生成器
const textGenerator = {
  // 中文姓名
  chineseName: () => {
    const surnames = ['张', '王', '李', '赵', '陈', '刘', '杨', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡', '林', '郭', '何', '高', '罗'];
    const names = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '艳', '勇', '涛', '明', '超', '秀英', '霞', '平', '刚', '桂英'];
    return random.pick(surnames) + random.pick(names) + (random.boolean(0.3) ? random.pick(names) : '');
  },
  
  // 生成随机标题
  title: (minWords = 3, maxWords = 8) => {
    const words = ['技术', '创新', '发展', '管理', '系统', '平台', '服务', '解决方案', '优化', '升级', '功能', '模块', '界面', '体验', '效率', '质量', '安全', '稳定', '可靠', '智能'];
    const wordCount = random.int(minWords, maxWords);
    return random.picks(words, wordCount).join('');
  },
  
  // 生成随机内容
  content: (sentences = 3) => {
    const templates = [
      '这是一个{adjective}的{noun}，能够有效{verb}各种{noun}需求。',
      '通过{adjective}的{noun}设计，我们实现了{verb}的目标。',
      '该{noun}具有{adjective}的特点，可以{verb}用户体验。',
      '在{noun}方面，我们采用了{adjective}的{verb}方案。'
    ];
    const adjectives = ['先进', '高效', '稳定', '可靠', '创新', '智能', '灵活', '安全'];
    const nouns = ['系统', '平台', '模块', '功能', '服务', '方案', '架构', '设计'];
    const verbs = ['提升', '优化', '改善', '增强', '完善', '升级', '简化', '统一'];
    
    const result = [];
    for (let i = 0; i < sentences; i++) {
      let sentence = random.pick(templates);
      sentence = sentence.replace(/{adjective}/g, random.pick(adjectives));
      sentence = sentence.replace(/{noun}/g, random.pick(nouns));
      sentence = sentence.replace(/{verb}/g, random.pick(verbs));
      result.push(sentence);
    }
    return result.join(' ');
  },
  
  // 生成随机标签
  tags: (count = 3) => {
    const tagList = ['前端', '后端', '数据库', '算法', 'UI/UX', '测试', '运维', '安全', '性能', '架构', '移动端', '人工智能', '大数据', '云计算', '微服务'];
    return random.picks(tagList, count);
  }
};

// 用户数据生成器
const userGenerator = {
  // 生成单个用户
  single: (id = random.int(1, 10000)) => ({
    id: id.toString(),
    username: `user_${id}`,
    name: textGenerator.chineseName(),
    email: `user${id}@example.com`,
    phone: `1${random.int(30, 99)}${random.int(10000000, 99999999)}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
    status: random.pick(['active', 'inactive']),
    role: random.pick(['admin', 'editor', 'viewer']),
    department: {
      id: random.int(1, 10).toString(),
      name: random.pick(['技术部', '产品部', '运营部', '市场部', '人事部'])
    },
    lastLoginAt: dateGenerator.toISO(dateGenerator.recentDays(7)),
    ...dateGenerator.createdUpdated()
  }),
  
  // 生成用户池
  pool: (size = config.data.userPool) => {
    const users = [];
    for (let i = 1; i <= size; i++) {
      users.push(userGenerator.single(i));
    }
    return users;
  }
};

// 分类数据生成器
const categoryGenerator = {
  // 生成单个分类
  single: (id = random.int(1, 100)) => ({
    id: id.toString(),
    name: random.pick(['科技', '娱乐', '体育', '教育', '健康', '美食', '旅游', '时尚', '财经', '汽车']),
    slug: `category-${id}`,
    description: textGenerator.content(1),
    icon: `icon-${random.pick(['tech', 'game', 'sport', 'book', 'heart'])}`,
    color: random.pick(['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF']),
    status: random.pick(['active', 'inactive']),
    sort: random.int(0, 99),
    postCount: random.int(0, 500),
    ...dateGenerator.createdUpdated()
  }),
  
  // 生成分类列表
  list: (count = 10) => {
    const categories = [];
    for (let i = 1; i <= count; i++) {
      categories.push(categoryGenerator.single(i));
    }
    return categories;
  }
};

// 文章/帖子数据生成器
const postGenerator = {
  // 生成单个帖子
  single: (id = random.int(1, 10000)) => ({
    id: id.toString(),
    title: textGenerator.title(),
    content: textGenerator.content(random.int(3, 8)),
    excerpt: textGenerator.content(1),
    status: random.pick(['draft', 'published', 'archived']),
    type: random.pick(['article', 'question', 'discussion']),
    author: userGenerator.single(random.int(1, 50)),
    category: categoryGenerator.single(random.int(1, 10)),
    tags: textGenerator.tags(random.int(1, 5)),
    viewCount: random.int(0, 10000),
    likeCount: random.int(0, 1000),
    commentCount: random.int(0, 100),
    shareCount: random.int(0, 50),
    isPinned: random.boolean(0.1),
    isRecommended: random.boolean(0.2),
    publishedAt: dateGenerator.toISO(dateGenerator.recentDays(30)),
    ...dateGenerator.createdUpdated()
  }),
  
  // 生成帖子列表
  list: (count = 20) => {
    const posts = [];
    for (let i = 1; i <= count; i++) {
      posts.push(postGenerator.single(i));
    }
    return posts;
  }
};

// 统计数据生成器
const statsGenerator = {
  // 生成趋势数据
  trend: (days = 30, baseValue = 100, variance = 0.2) => {
    const data = [];
    let currentValue = baseValue;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      
      // 添加一些随机波动
      const change = (Math.random() - 0.5) * 2 * variance;
      currentValue = Math.max(0, currentValue * (1 + change));
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(currentValue)
      });
    }
    return data;
  },
  
  // 生成环状图数据
  pie: (labels, total = 1000) => {
    const data = [];
    let remaining = total;
    
    labels.forEach((label, index) => {
      if (index === labels.length - 1) {
        data.push({ label, value: remaining });
      } else {
        const value = random.int(Math.round(remaining * 0.1), Math.round(remaining * 0.4));
        data.push({ label, value });
        remaining -= value;
      }
    });
    
    return data;
  },
  
  // 生成仪表盘统计
  dashboard: () => ({
    totalUsers: random.int(8000, 12000),
    activeUsers: random.int(5000, 8000),
    totalPosts: random.int(15000, 25000),
    todayPosts: random.int(50, 200),
    totalComments: random.int(30000, 50000),
    todayComments: random.int(100, 500),
    totalViews: random.int(100000, 200000),
    todayViews: random.int(2000, 8000)
  })
};

// 地址生成器
const addressGenerator = {
  province: () => random.pick(['北京市', '上海市', '广东省', '浙江省', '江苏省', '山东省', '河南省', '湖北省', '湖南省', '四川省']),
  city: () => random.pick(['北京市', '上海市', '广州市', '深圳市', '杭州市', '南京市', '武汉市', '成都市', '重庆市', '西安市']),
  full: () => {
    const province = addressGenerator.province();
    const city = addressGenerator.city();
    const district = random.pick(['朝阳区', '海淀区', '西城区', '东城区', '丰台区']);
    const street = `${random.pick(['中山', '解放', '建设', '人民', '和平'])}路${random.int(1, 999)}号`;
    return `${province}${city}${district}${street}`;
  }
};

module.exports = {
  random,
  dateGenerator,
  textGenerator,
  userGenerator,
  categoryGenerator,
  postGenerator,
  statsGenerator,
  addressGenerator
};