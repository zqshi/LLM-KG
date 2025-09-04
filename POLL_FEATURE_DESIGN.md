# 投票帖功能设计文档

## 📋 功能概述

基于产品需求文档，设计了完整的论坛投票帖功能，支持管理员创建投票帖、用户参与投票、结果统计分析等核心功能。

## 🏗️ 架构设计

### 系统分层
```
┌─────────────────┬─────────────────┐
│   Admin Portal  │   User Portal   │
├─────────────────┼─────────────────┤
│ 投票帖管理       │ 投票参与        │
│ 结果统计        │ 结果查看        │
│ 奖励配置        │ 奖励获取        │
└─────────────────┴─────────────────┘
┌─────────────────────────────────────┐
│         API 接口层                  │
├─────────────────────────────────────┤
│ PollAdminAPI | PollUserAPI         │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│         数据模型层                  │
├─────────────────────────────────────┤
│ PollPost | PollOption | PollVote   │
└─────────────────────────────────────┘
```

## 📊 数据模型设计

### 核心实体

#### 1. 投票帖主体 (PollPost)
```typescript
interface PollPost {
  id: number
  title: string           // 帖子标题
  content: string         // 帖子内容
  question: string        // 投票问题
  
  // 投票配置
  type: PollType         // 单选/多选
  maxChoices?: number    // 多选最大选择数
  options: PollOption[]  // 投票选项
  
  // 时间控制
  startTime: string      // 开始时间
  endTime: string        // 结束时间
  
  // 权限控制
  scopeConfig: PollScopeConfig    // 参与范围
  resultVisibility: ResultVisibility // 结果可见性
  
  // 奖励系统
  rewards: PollReward[]  // 奖励配置
  hasRewards: boolean    // 是否有奖励
  
  // 统计数据
  totalVotes: number     // 总票数
  participantCount: number // 参与人数
}
```

#### 2. 投票选项 (PollOption)
```typescript
interface PollOption {
  id: number
  text: string           // 选项文本
  description?: string   // 选项描述
  image?: string         // 选项图片
  voteCount: number      // 得票数
  percentage: number     // 得票百分比
}
```

#### 3. 奖励配置 (PollReward)
```typescript
interface PollReward {
  id: number
  name: string           // 奖励名称
  description: string    // 奖励描述
  type: 'points' | 'badge' | 'gift' | 'voucher'
  value?: number         // 奖励价值
  condition: 'participate' | 'winner' | 'all_participants'
}
```

### 权限控制模型

#### 投票范围配置
```typescript
interface PollScopeConfig {
  scope: 'all' | 'category' | 'department' | 'role' | 'custom'
  departments?: string[]    // 指定部门
  roles?: string[]         // 指定角色
  userIds?: number[]       // 自定义用户列表
  categoryIds?: number[]   // 版块范围
}
```

#### 结果可见性
- `real_time`: 实时可见投票结果
- `after_end`: 投票结束后可见
- `never`: 仅管理员可见

## 🔗 API接口设计

### 管理端API (PollAdminAPI)

#### 投票帖管理
```typescript
// 获取投票帖列表
GET /admin/polls?page=1&pageSize=20&status=ongoing

// 创建投票帖
POST /admin/polls
{
  "title": "下一个最期待的功能是什么？",
  "content": "大家好，我们计划下个季度进行开发...",
  "question": "请选择您最期待的功能",
  "type": "single",
  "options": [
    {"text": "深色模式", "description": "支持夜间浏览"},
    {"text": "数据导出", "description": "导出个人数据"}
  ],
  "startTime": "2024-01-01T10:00:00Z",
  "endTime": "2024-01-07T18:00:00Z",
  "scopeConfig": {
    "scope": "all"
  },
  "resultVisibility": "real_time",
  "rewards": [
    {
      "name": "参与积分",
      "type": "points",
      "value": 10,
      "condition": "participate"
    }
  ]
}
```

#### 统计分析
```typescript
// 获取投票统计
GET /admin/polls/{id}/statistics
{
  "data": {
    "totalVotes": 284,
    "participantCount": 284,
    "participationRate": 85.2,
    "optionStats": [
      {
        "optionId": 1,
        "optionText": "深色模式",
        "voteCount": 120,
        "percentage": 42.3
      }
    ],
    "departmentStats": [...],
    "hourlyStats": [...]
  }
}
```

### 用户端API (PollUserAPI)

#### 投票参与
```typescript
// 获取投票帖详情
GET /user/polls/{id}
{
  "data": {
    "id": 123,
    "title": "下一个最期待的功能是什么？",
    "poll": {
      "question": "请选择您最期待的功能",
      "options": [...],
      "userVoted": false,
      "canVote": true,
      "canViewResult": true
    }
  }
}

// 提交投票
POST /user/polls/vote
{
  "pollId": "123",
  "optionIds": [2]
}
```

## 🎯 核心功能实现

### 1. 管理后台功能

#### 版块管理页面升级
- 在现有 `Categories.vue` 基础上添加"创建投票帖"按钮
- 新增投票帖管理面板
- 支持版块内投票帖快速创建

#### 投票帖创建流程
1. **基础信息设置**：标题、内容、投票问题
2. **选项配置**：支持文本、描述、图片
3. **时间设置**：开始时间、结束时间
4. **权限配置**：参与范围、结果可见性
5. **奖励设置**：奖励类型、条件、数量
6. **预览确认**：预览效果、发布投票

#### 统计分析面板
- 实时投票统计
- 参与度分析
- 部门分布统计
- 时间趋势分析
- 数据导出功能

### 2. 用户端功能

#### 投票帖展示
- 论坛列表中标识投票帖（📊图标）
- 显示投票状态和截止时间
- 投票帖详情页面优化

#### 投票交互流程
1. **权限验证**：检查用户投票权限
2. **选项展示**：清晰的选项布局
3. **投票提交**：防重复提交保护
4. **结果展示**：图表化结果显示
5. **奖励提示**：获得奖励通知

#### 投票结果可视化
- 水平柱状图展示各选项得票
- 实时更新票数和百分比
- 总参与人数显示
- 支持按部门、时间等维度筛选

## 🏆 奖励系统设计

### 奖励类型
- **积分奖励**：参与投票获得积分
- **徽章奖励**：特殊投票活动徽章
- **实物礼品**：热门投票奖品
- **优惠券**：企业内部优惠券

### 奖励发放条件
- **参与奖励**：投票即可获得
- **获胜者奖励**：选择获胜选项
- **全员奖励**：所有参与者共享

## 🔒 权限控制设计

### 投票权限
- **全员投票**：所有注册用户
- **版块权限**：特定版块成员
- **部门权限**：指定部门员工
- **角色权限**：特定角色用户
- **自定义**：手动指定用户列表

### 结果查看权限
- **实时可见**：投票过程中可查看结果
- **结束后可见**：投票结束后显示
- **仅管理员**：只有管理员可查看

## 📈 数据分析功能

### 统计维度
1. **整体统计**：总票数、参与率、完成率
2. **选项分析**：各选项得票分布
3. **用户分析**：部门参与情况、活跃用户
4. **时间分析**：投票时间分布、高峰时段
5. **地域分析**：不同地区参与情况

### 导出功能
- **Excel导出**：详细投票数据
- **PDF报告**：图表化统计报告
- **CSV数据**：原始投票记录

## 🚀 后续扩展

### V2.0 规划
- 投票模板系统
- 投票提醒通知
- 匿名投票支持
- 投票评论功能
- 投票分享机制

### 集成扩展
- 企业微信通知
- 邮件提醒系统
- 移动端适配
- API开放接口

---

## 📋 实施计划

1. ✅ **数据模型设计** - 已完成
2. ⏳ **管理后台升级** - 进行中
3. ⏸️ **用户端功能实现**
4. ⏸️ **统计分析面板**
5. ⏸️ **测试用例编写**
6. ⏸️ **代码质量检查**

该设计完全符合PRD需求，提供了企业级的投票帖功能解决方案。