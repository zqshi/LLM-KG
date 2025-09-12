/**
 * 仪表盘模块数据
 */

function generateActivityTrendData() {
  const data = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toISOString().split('T')[0],
      activeUsers: 1200 + Math.floor(Math.random() * 200),
      newContent: 30 + Math.floor(Math.random() * 20),
      auditedContent: 25 + Math.floor(Math.random() * 15)
    });
  }

  return data;
}

const dashboardOverview = {
  code: 200,
  message: 'success',
  data: {
    metrics: {
      todayActiveUsers: 1248,
      todayNewContent: 36,
      pendingAuditCount: 8,
      systemHealthStatus: 'good',
      todayActiveUsersTrend: 12.5,
      todayNewContentTrend: 8.3,
      systemCpuUsage: 45,
      systemMemoryUsage: 62,
      systemDiskUsage: 28,
      lastUpdateTime: new Date().toISOString()
    },
    pendingTasks: [
      {
        id: 1,
        type: 'content_audit',
        title: '待审核内容',
        priority: 'high',
        count: 8,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        type: 'user_report',
        title: '用户举报处理',
        priority: 'medium',
        count: 3,
        createdAt: new Date().toISOString()
      }
    ],
    quickActions: [
      {
        id: 'content_audit',
        name: '内容审核',
        path: '/audit/center',
        icon: 'View',
        type: 'primary',
        permission: 'content:audit',
        visible: true
      },
      {
        id: 'user_management',
        name: '用户管理',
        path: '/rbac/users',
        icon: 'User',
        type: 'success',
        permission: 'rbac:user:view',
        visible: true
      }
    ],
    activityTrend: generateActivityTrendData(),
    contentDistribution: [
      { type: 'article', name: '技术文章', count: 1286, percentage: 42.5, color: '#667eea' },
      { type: 'post', name: '论坛帖子', count: 932, percentage: 30.8, color: '#52c41a' },
      { type: 'product', name: '商品信息', count: 456, percentage: 15.0, color: '#faad14' }
    ],
    departmentContributions: [
      {
        departmentId: 1,
        departmentName: '技术部',
        contentCount: 320,
        userCount: 45,
        trend: 15.2
      },
      { departmentId: 2, departmentName: '产品部', contentCount: 280, userCount: 38, trend: 8.5 }
    ],
    systemResources: [
      { name: 'CPU使用率', type: 'cpu', usage: 45, status: 'normal', unit: '%' },
      { name: '内存使用率', type: 'memory', usage: 62, status: 'warning', unit: '%' }
    ],
    systemAnnouncement: {
      id: 1,
      title: '系统维护通知',
      content: '定于本周日凌晨2:00-4:00进行系统例行维护',
      type: 'maintenance',
      publisher: '系统管理员',
      publishedAt: new Date().toISOString()
    },
    recentFeedback: [
      {
        id: 1,
        user: { id: 4, nickname: '王五', username: 'wangwu' },
        content: '希望能增加移动端的支持',
        createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString()
      }
    ]
  }
};

module.exports = {
  dashboardOverview,
  generateActivityTrendData
};