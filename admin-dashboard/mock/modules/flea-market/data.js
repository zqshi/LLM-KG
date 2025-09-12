/**
 * 跳蚤市场模块数据
 */

const reports = [
  { id: 1, goodsId: 1, goodsName: '二手笔记本电脑', sellerId: 1, sellerName: '张三', reportUserId: 3, reportUserName: '李四', reason: '虚假商品', description: '商品描述与实物不符，配置有夸大成分', status: 'pending', priority: 'high', evidence: ['https://picsum.photos/300/200?random=10'], createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 2, goodsId: 2, goodsName: '人体工学办公椅', sellerId: 2, sellerName: '王五', reportUserId: 4, reportUserName: '赵六', reason: '价格欺诈', description: '标价过高，市场价格远低于此价', status: 'processing', priority: 'medium', evidence: ['https://picsum.photos/300/200?random=11'], createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
  { id: 3, goodsId: 3, goodsName: '智能手机iPhone 12', sellerId: 3, sellerName: '刘七', reportUserId: 1, reportUserName: '张三', reason: '商品质量问题', description: '收到商品后发现有严重划痕，与描述不符', status: 'resolved', priority: 'high', evidence: ['https://picsum.photos/300/200?random=12', 'https://picsum.photos/300/200?random=13'], resolution: '经核实属实，已对卖家进行警告处理，买家获得退款', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 4, goodsId: 4, goodsName: '设计类图书套装', sellerId: 4, sellerName: '陈八', reportUserId: 2, reportUserName: '王五', reason: '虚假描述', description: '书籍严重破损，有缺页现象，与"九成新"描述严重不符', status: 'pending', priority: 'medium', evidence: ['https://picsum.photos/300/200?random=14'], createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 5, goodsId: 1, goodsName: '二手笔记本电脑', sellerId: 1, sellerName: '张三', reportUserId: 5, reportUserName: '周九', reason: '联系方式虚假', description: '提供的联系方式无法接通，疑似虚假信息', status: 'rejected', priority: 'low', evidence: [], resolution: '经核实，联系方式有效，可能是网络问题导致，举报不成立', createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
];

const categories = [
  { id: 1, name: '电子产品', code: 'electronics', description: '各类电子设备和配件', icon: 'Monitor', parentId: null, sort: 1, status: 'active', createdAt: new Date().toISOString() },
  { id: 2, name: '家居用品', code: 'home', description: '各类家居生活物品', icon: 'Home', parentId: null, sort: 2, status: 'active', createdAt: new Date().toISOString() },
  { id: 3, name: '办公用品', code: 'office', description: '办公所需的各类物品', icon: 'Briefcase', parentId: null, sort: 3, status: 'active', createdAt: new Date().toISOString() },
  { id: 4, name: '图书文具', code: 'books-stationery', description: '各类图书和文具用品', icon: 'Book', parentId: null, sort: 4, status: 'active', createdAt: new Date().toISOString() },
  { id: 5, name: '服装鞋包', code: 'clothing-shoes', description: '服装、鞋子和包包', icon: 'Shirt', parentId: null, sort: 5, status: 'active', createdAt: new Date().toISOString() }
];

const goods = [
  { id: 1, name: '二手笔记本电脑', categoryId: 1, price: 3500, originalPrice: 5000, description: 'ThinkPad X1 Carbon，使用一年，性能良好，配置i7处理器16GB内存', images: ['https://picsum.photos/200/200?random=1'], status: 'on_sale', userId: 1, location: '北京海淀区', contactPhone: '138****5678', createdAt: new Date().toISOString() },
  { id: 2, name: '人体工学办公椅', categoryId: 3, price: 800, originalPrice: 1200, description: 'Herman Miller Aeron椅，九成新，支持腰部支撑，透气舒适', images: ['https://picsum.photos/200/200?random=2'], status: 'on_sale', userId: 2, location: '上海浦东区', contactPhone: '139****1234', createdAt: new Date().toISOString() },
  { id: 3, name: '智能手机iPhone 12', categoryId: 1, price: 2800, originalPrice: 4000, description: '128GB储存，9成新，无磕碰，原装配件齐全', images: ['https://picsum.photos/200/200?random=3'], status: 'on_sale', userId: 3, location: '广州天河区', contactPhone: '136****9876', createdAt: new Date().toISOString() },
  { id: 4, name: '设计类图书套装', categoryId: 4, price: 150, originalPrice: 280, description: '包含《设计心理学》《用户体验要素》等经典设计书籍，7本套装', images: ['https://picsum.photos/200/200?random=4'], status: 'on_sale', userId: 4, location: '深圳南山区', contactPhone: '135****4567', createdAt: new Date().toISOString() },
  { id: 5, name: '品牌运动鞋', categoryId: 5, price: 450, originalPrice: 699, description: 'Nike Air Max 270，42码，仅试穿未下地，鞋盒标签完整', images: ['https://picsum.photos/200/200?random=5'], status: 'sold', userId: 5, location: '杭州西湖区', contactPhone: '137****7890', createdAt: new Date().toISOString() }
];

module.exports = {
  reports,
  categories,
  goods
};