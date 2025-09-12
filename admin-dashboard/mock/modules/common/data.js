/**
 * 公共模块数据
 */

const roles = [
  { id: 1, name: '管理员', code: 'admin' },
  { id: 2, name: '内容编辑', code: 'content_editor' },
  { id: 3, name: '审核员', code: 'auditor' },
  { id: 4, name: '普通用户', code: 'user' }
];

const departments = [
  { id: '1', name: '技术部', parentId: null },
  { id: '2', name: '产品部', parentId: null },
  { id: '3', name: '运营部', parentId: null },
  { id: '4', name: '前端组', parentId: '1' },
  { id: '5', name: '后端组', parentId: '1' }
];

const categories = [
  { id: 1, name: '技术讨论', code: 'tech_discussion' },
  { id: 2, name: '产品建议', code: 'product_suggestion' },
  { id: 3, name: '公司事务', code: 'company_affairs' },
  { id: 4, name: '员工福利', code: 'employee_benefits' }
];

module.exports = {
  roles,
  departments,
  categories
};