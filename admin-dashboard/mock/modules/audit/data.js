/**
 * 审核模块数据
 */

const policies = [
  {
    id: 1,
    name: '内容审核策略',
    bizType: 'content',
    enabled: true,
    isActive: true,
    mode: 'all',
    priority: 'high',
    rules: [],
    createTime: new Date().toISOString()
  },
  {
    id: 2,
    name: '名言审核策略',
    bizType: 'quotation',
    enabled: true,
    isActive: true,
    mode: 'all',
    priority: 'medium',
    rules: [],
    createTime: new Date().toISOString()
  },
  {
    id: 3,
    name: '横幅审核策略',
    bizType: 'banner',
    enabled: true,
    isActive: true,
    mode: 'selective',
    priority: 'normal',
    rules: [],
    createTime: new Date().toISOString()
  }
];

const tasks = [
  {
    id: 1,
    title: '内容审核任务',
    type: 'content',
    status: 'pending',
    priority: 'high',
    assignee: { id: 1, name: '张三' },
    createTime: new Date().toISOString(),
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    title: '名言审核任务',
    type: 'quotation',
    status: 'in_progress', 
    priority: 'medium',
    assignee: { id: 2, name: '李四' },
    createTime: new Date().toISOString(),
    deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    title: '横幅内容审核',
    type: 'banner',
    status: 'completed',
    priority: 'low',
    assignee: { id: 3, name: '王五' },
    createTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    deadline: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  }
];

const auditors = [
  { id: 1, name: '张三', role: '高级审核员', status: 'active', workload: 15 },
  { id: 2, name: '李四', role: '审核员', status: 'active', workload: 8 },
  { id: 3, name: '王五', role: '审核员', status: 'busy', workload: 20 },
  { id: 4, name: '赵六', role: '初级审核员', status: 'active', workload: 5 }
];

const stats = {
  totalTasks: 156,
  pendingTasks: 23,
  completedTasks: 133,
  todayCompleted: 12,
  averageProcessTime: 45 // minutes
};

const auditLogs = [
  {
    id: 1,
    action: 'CREATE',
    resource_type: 'quotation',
    resource_id: '123',
    user_id: 1,
    user_name: '张明',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    details: { content: '创建了新的名言' },
    status: 'SUCCESS',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 2,
    action: 'UPDATE', 
    resource_type: 'banner',
    resource_id: '456',
    user_id: 2,
    user_name: '李华',
    ip_address: '192.168.1.101',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    details: { content: '更新了横幅信息' },
    status: 'SUCCESS',
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString()
  },
  {
    id: 3,
    action: 'DELETE',
    resource_type: 'content',
    resource_id: '789',
    user_id: 3,
    user_name: '王强',
    ip_address: '192.168.1.102',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    details: { content: '删除了违规内容' },
    status: 'SUCCESS',
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString()
  },
  {
    id: 4,
    action: 'APPROVE',
    resource_type: 'quotation',
    resource_id: '234',
    user_id: 1,
    user_name: '张明',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    details: { content: '审核通过名言内容' },
    status: 'SUCCESS',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  },
  {
    id: 5,
    action: 'REJECT',
    resource_type: 'content',
    resource_id: '567',
    user_id: 2,
    user_name: '李华',
    ip_address: '192.168.1.101',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    details: { content: '审核拒绝，内容违规' },
    status: 'SUCCESS',
    created_at: new Date(Date.now() - 1000 * 60 * 150).toISOString()
  }
];

module.exports = {
  policies,
  tasks,
  auditors,
  stats,
  auditLogs
};