/**
 * 公共模块路由
 */

const express = require('express');
const { responseFormatter, logger } = require('../../utils/response');
const { roles, departments, categories } = require('./data');
const { departmentTree } = require('../../data/departments');

const router = express.Router();

// 获取角色列表
router.get('/roles', (req, res) => {
  logger.info('Roles requested');
  res.json(responseFormatter.success(roles, '获取角色列表成功'));
});

// 获取部门列表
router.get('/departments', (req, res) => {
  logger.info('Departments requested');
  res.json(responseFormatter.success(departmentTree, '获取部门列表成功'));
});

// 获取组织架构树
router.get('/organization/tree', (req, res) => {
  logger.info('Organization tree requested');
  res.json(responseFormatter.success(departmentTree, '获取组织架构树成功'));
});

// 获取分类列表
router.get('/categories', (req, res) => {
  logger.info('Categories requested');
  res.json(responseFormatter.success(categories, '获取分类列表成功'));
});

module.exports = router;