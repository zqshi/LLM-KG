/**
 * 部门数据
 */

const departmentTree = [
  {
    id: '1',
    name: '技术部',
    parentId: null,
    children: [
      {
        id: '1-1',
        name: '前端开发组',
        parentId: '1',
        children: []
      },
      {
        id: '1-2',
        name: '后端开发组',
        parentId: '1',
        children: []
      },
      {
        id: '1-3',
        name: '测试组',
        parentId: '1',
        children: []
      }
    ]
  },
  {
    id: '2',
    name: '产品部',
    parentId: null,
    children: [
      {
        id: '2-1',
        name: '产品设计组',
        parentId: '2',
        children: []
      },
      {
        id: '2-2',
        name: '用户研究组',
        parentId: '2',
        children: []
      }
    ]
  },
  {
    id: '3',
    name: '人事部',
    parentId: null,
    children: [
      {
        id: '3-1',
        name: '招聘组',
        parentId: '3',
        children: []
      },
      {
        id: '3-2',
        name: '培训组',
        parentId: '3',
        children: []
      }
    ]
  },
  {
    id: '4',
    name: '市场部',
    parentId: null,
    children: [
      {
        id: '4-1',
        name: '品牌推广组',
        parentId: '4',
        children: []
      },
      {
        id: '4-2',
        name: '数据分析组',
        parentId: '4',
        children: []
      }
    ]
  }
];

module.exports = {
  departmentTree
};