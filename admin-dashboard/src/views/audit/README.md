# 统一审核中心

## 概述

统一审核中心是企业内部门户-知识聚合分发平台的核心模块，旨在将分散的审核能力收归为一个平台级的中台服务，为所有需要审核的场景提供标准化、流程化、可配置的一站式审核解决方案。

## 核心功能

### 1. 统一任务管理
- **聚合待审任务**: 在一个界面展示全平台所有待审核任务
- **多维度筛选**: 支持按业务类型、优先级、时间范围、关键词等筛选
- **批量操作**: 支持批量通过、批量拒绝等操作
- **实时更新**: 任务状态实时同步，支持自动刷新

### 2. 审核策略配置
- **策略管理**: 为不同业务类型配置不同的审核流程
- **审核模式**: 支持先审后发、先发后审、抽审三种模式
- **分配规则**: 支持自动分配、手动分配、按角色分配
- **优先级设置**: 支持高、普通、低三种优先级

### 3. 敏感词管理
- **词库管理**: 统一管理平台敏感词库
- **处理动作**: 支持禁止、审核、替换三种处理方式
- **正则支持**: 支持正则表达式匹配
- **批量导入**: 支持批量导入敏感词
- **分类管理**: 支持按政治敏感、色情内容、暴力内容等分类

### 4. 审核员管理
- **人员管理**: 管理审核员信息、权限分配
- **工作量统计**: 实时统计审核员工作量、通过率等指标
- **任务分配**: 支持手动分配和批量分配任务
- **绩效分析**: 提供审核员绩效分析功能

### 5. 数据看板
- **实时统计**: 展示待审核总量、今日处理量、通过率等关键指标
- **趋势分析**: 展示审核数据的时间趋势
- **业务分析**: 按业务模块分析审核数据

## 技术架构

### 前端技术栈
- **Vue 3**: 使用 Composition API
- **TypeScript**: 提供类型安全
- **Element Plus**: UI组件库
- **Pinia**: 状态管理
- **Vue Router**: 路由管理

### 核心组件
- `Center.vue`: 主页面，包含数据看板和任务列表
- `AuditPolicySettings.vue`: 审核策略配置组件
- `SensitiveWordsSettings.vue`: 敏感词管理组件
- `AuditorManagement.vue`: 审核员管理组件

### 状态管理
- `audit.ts`: 审核中心的状态管理store
- 管理任务列表、策略配置、敏感词、审核员等状态

### API接口
- `audit.ts`: 审核相关的API接口
- 包含任务管理、策略配置、敏感词管理、审核员管理等接口

## 数据模型

### 审核任务 (AuditTask)
```typescript
interface AuditTask {
  id: number
  taskId: string
  bizType: BizType
  bizId: string
  title?: string
  content: string
  images?: string[]
  contentSnapshot: any
  submitterId: number
  submitterName: string
  status: AuditTaskStatus
  priority: Priority
  auditPolicyId?: number
  assigneeId?: number
  assigneeName?: string
  createTime: string
  updateTime?: string
  approveTime?: string
  rejectTime?: string
  rejectReason?: string
  rejectDetail?: string
}
```

### 审核策略 (AuditPolicy)
```typescript
interface AuditPolicy {
  id: number
  bizType: BizType
  name: string
  mode: AuditMode
  sampleRate?: number
  priority: Priority
  assignRule: AssignRule
  assigneeId?: number
  roleId?: number
  ruleConfig?: any
  isActive: boolean
  createTime: string
  updateTime?: string
}
```

### 敏感词 (SensitiveWord)
```typescript
interface SensitiveWord {
  id: number
  word: string
  isRegex: boolean
  action: SensitiveWordAction
  replaceWith?: string
  category: string
  hitCount: number
  remark?: string
  creator: string
  createTime: string
  updateTime?: string
}
```

### 审核员 (Auditor)
```typescript
interface Auditor {
  id: number
  name: string
  username: string
  role: AuditorRole
  department: string
  email: string
  phone: string
  permissions: BizType[]
  status: boolean
  pendingCount: number
  todayProcessed: number
  approvalRate: number
  remark?: string
  createTime: string
  updateTime?: string
}
```

## 使用流程

### 1. 审核员使用流程
1. 登录审核中心
2. 查看待审核任务列表
3. 筛选感兴趣的任务类型
4. 点击任务查看详情
5. 进行审核操作（通过/拒绝/转交）
6. 填写审核意见（如需要）

### 2. 管理员配置流程
1. 进入审核设置
2. 配置审核策略
3. 管理敏感词库
4. 管理审核员信息
5. 查看统计数据

### 3. 业务方接入流程
1. 调用审核API提交任务
2. 轮询或接收回调获取审核结果
3. 根据审核结果进行后续处理

## API接口

### 提交审核任务
```typescript
POST /audit/api/task/submit
{
  "bizType": "forum_post",
  "bizId": "123456",
  "content": {
    "title": "帖子标题",
    "content": "帖子正文...",
    "images": ["url1", "url2"]
  },
  "submitterId": 1001
}
```

### 查询审核结果
```typescript
GET /audit/api/task/result?bizType=forum_post&bizId=123456
```

### 获取任务列表
```typescript
GET /audit/console/api/tasks?bizType=forum_post&priority=high&page=1&size=20
```

## 权限控制

### 审核员权限
- `audit:view`: 查看审核任务
- `audit:approve`: 审核通过权限
- `audit:reject`: 审核拒绝权限
- `audit:transfer`: 任务转交权限

### 管理员权限
- `audit:policy:manage`: 策略管理权限
- `audit:sensitive:manage`: 敏感词管理权限
- `audit:auditor:manage`: 审核员管理权限
- `audit:stats:view`: 统计数据查看权限

## 部署说明

### 环境要求
- Node.js >= 16
- Vue 3
- Element Plus
- Pinia

### 安装依赖
```bash
npm install
```

### 开发环境
```bash
npm run dev
```

### 生产构建
```bash
npm run build
```

## 测试

### 单元测试
```bash
npm run test
```

### 测试覆盖率
```bash
npm run test:coverage
```

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request

## 许可证

MIT License
