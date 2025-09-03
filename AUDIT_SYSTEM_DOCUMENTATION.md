# 统一审核中心系统文档

## 项目概述

统一审核中心是一个全面的内容审核管理系统，旨在为多业务场景提供集中化、智能化的审核服务。系统采用非侵入式设计，支持灵活的策略配置、实时监控、性能优化和数据分析。

### 核心特性

- **统一策略管理**: 集中管理所有业务线的审核策略
- **非侵入式集成**: 业务模块无需修改核心逻辑即可接入
- **智能任务分配**: AI驱动的任务分配和负载均衡
- **实时性能监控**: 全面的系统性能监控和优化建议
- **高可用架构**: 异步处理、熔断器、限流等可靠性保障
- **丰富的数据分析**: 多维度数据分析和可视化报告

## 系统架构

### 整体架构图

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   业务模块A     │    │   业务模块B     │    │   业务模块C     │
│ (论坛内容)      │    │ (二手市场)      │    │ (用户举报)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   审核节点层    │
                    │ (AuditNode)     │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   任务流程层    │
                    │ (TaskFlow)      │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   数据流处理    │
                    │ (DataFlow)      │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   异步处理器    │    │   告警系统      │    │   分析引擎      │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 技术栈

**前端技术栈:**
- Vue 3.x (Composition API)
- TypeScript 4.x
- Element Plus UI 组件库
- ECharts 图表库
- Vite 构建工具
- Vitest 测试框架

**后端技术栈:**
- Node.js Runtime
- 数据库: PostgreSQL (主要) + Redis (缓存)
- 消息队列: Redis/内存队列
- 监控: 自研监控系统

## 核心模块详解

### 1. 审核节点系统 (AuditNode)

#### 设计理念
审核节点系统采用抽象基类 + 具体实现的模式，为不同业务提供统一的审核接口。

#### 核心文件
- `src/api/auditNode.ts` - 抽象基类定义
- `src/api/nodes/contentAuditNode.ts` - 内容审核节点
- `src/api/nodes/fleaMarketAuditNode.ts` - 二手市场审核节点
- `src/api/auditNodeFactory.ts` - 节点工厂

#### 使用示例

```typescript
import { AuditNodeFactory } from '@/api/auditNodeFactory'

// 创建内容审核节点
const contentNode = AuditNodeFactory.createNode('content', {
  enableAI: true,
  sensitiveWordCheck: true
})

// 提交审核任务
const result = await contentNode.submitTask({
  id: 'task-001',
  type: 'forum_post',
  data: {
    content: '用户发布的内容',
    author: 'user123'
  }
})

console.log('审核结果:', result)
```

### 2. 任务流程管理 (TaskFlow)

#### 功能特性
- 状态机驱动的任务流程
- 自动状态转换和验证
- 可配置的流程回调
- 完整的审核历史记录

#### 状态定义

```typescript
enum TaskFlowStatus {
  DRAFT = 'draft',           // 草稿
  SUBMITTED = 'submitted',   // 已提交
  ASSIGNED = 'assigned',     // 已分配
  IN_PROGRESS = 'in_progress', // 审核中
  COMPLETED = 'completed',   // 已完成
  REJECTED = 'rejected',     // 已拒绝
  CANCELLED = 'cancelled'    // 已取消
}
```

#### 使用示例

```typescript
import { AuditTaskFlowManager } from '@/api/auditTaskFlow'

const flowManager = new AuditTaskFlowManager()

// 创建任务流
const flow = await flowManager.createFlow({
  taskId: 'task-001',
  bizType: 'content',
  priority: 1,
  data: { /* 任务数据 */ }
})

// 状态转换
await flow.transitionTo(TaskFlowStatus.ASSIGNED)
await flow.transitionTo(TaskFlowStatus.IN_PROGRESS)
await flow.transitionTo(TaskFlowStatus.COMPLETED)
```

### 3. 异步处理系统 (AsyncProcessor)

#### 架构特点
- 多队列支持 (内存/Redis)
- 智能负载均衡
- 熔断器模式
- 自动重试机制
- 实时性能监控

#### 配置选项

```typescript
const processor = new AuditAsyncProcessor({
  concurrency: 10,                    // 并发数
  queueType: 'redis',                // 队列类型
  enableCircuitBreaker: true,        // 启用熔断器
  circuitBreakerThreshold: 5,        // 熔断阈值
  enableRateLimiting: true,          // 启用限流
  rateLimit: 100,                    // 限流数量
  rateLimitWindow: 60000             // 限流窗口
})
```

#### 使用示例

```typescript
// 添加异步任务
await processor.addTask({
  taskId: 'async-task-001',
  bizType: 'content',
  priority: 1,
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
  data: { /* 任务数据 */ }
})

// 批量添加任务
await processor.addTasks([task1, task2, task3])

// 获取队列状态
const status = await processor.getQueueStatus()
console.log('队列状态:', status)
```

### 4. 性能优化系统 (DatabaseOptimizer)

#### 功能模块
- 慢查询检测和分析
- 索引优化建议
- 查询执行计划分析
- 连接池优化
- 自动性能报告生成

#### 使用示例

```typescript
import { auditDatabaseOptimizer } from '@/api/auditDatabaseOptimizer'

// 记录查询统计
auditDatabaseOptimizer.recordQueryStats(
  'SELECT * FROM audit_tasks WHERE status = ?',
  1200,  // 执行时间(ms)
  10     // 影响行数
)

// 获取慢查询
const slowQueries = auditDatabaseOptimizer.getSlowQueries(1000)

// 分析表索引
const suggestions = await auditDatabaseOptimizer.analyzeTableIndexes('audit_tasks')

// 生成优化报告
const report = await auditDatabaseOptimizer.generateOptimizationReport()
```

### 5. 告警系统 (AlertSystem)

#### 告警类型
- 系统性能告警
- 数据库慢查询告警
- 队列积压告警
- 错误率异常告警
- 自定义业务告警

#### 告警规则配置

```typescript
const alertRule: AlertRule = {
  id: 'high-response-time',
  name: '响应时间过长告警',
  type: AlertType.SYSTEM_PERFORMANCE,
  level: AlertLevel.WARNING,
  enabled: true,
  conditions: [{
    metric: 'response_time',
    operator: '>',
    threshold: 2000,
    duration: 300  // 持续5分钟
  }],
  actions: [{
    type: 'email',
    target: 'admin@example.com'
  }],
  cooldown: 1800  // 30分钟冷却
}

auditAlertSystem.addRule(alertRule)
```

#### 指标记录

```typescript
// 记录单个指标
auditAlertSystem.recordMetric('response_time', 1500)

// 批量记录指标
auditAlertSystem.recordMetrics([
  { metric: 'cpu_usage', value: 75 },
  { metric: 'memory_usage', value: 60 },
  { metric: 'error_rate', value: 2.5 }
])
```

### 6. 数据分析系统 (AnalyticsService)

#### 分析功能
- 审核趋势分析
- 审核员绩效分析
- 内容质量分析
- 漏斗分析
- 同期群分析
- 异常检测
- 预测分析

#### 查询接口

```typescript
// 获取审核任务趋势
const trends = await auditAnalyticsService.getAuditTaskTrends('content', '24h')

// 获取审核员绩效
const performance = await auditAnalyticsService.getAuditorPerformance('7d')

// 异常检测
const anomalies = await auditAnalyticsService.detectAnomalies('task_count', '7d')

// 预测分析
const forecast = await auditAnalyticsService.forecast('task_count', 7, '30d')
```

## 前端组件系统

### 核心组件

#### 1. 审核中心主页面 (`src/views/audit/Center.vue`)
- 数据看板展示
- 任务列表管理
- 批量操作支持
- 实时数据更新

#### 2. 性能监控组件 (`src/views/audit/components/PerformanceMonitor.vue`)
- 实时指标展示
- 响应时间趋势图
- 慢查询分析
- 优化建议展示

#### 3. 告警管理组件 (`src/views/audit/components/AlertManagement.vue`)
- 活跃告警列表
- 告警规则管理
- 告警趋势分析
- 通知配置

#### 4. 数据分析仪表板 (`src/views/audit/components/AnalyticsDashboard.vue`)
- 多维度数据可视化
- 自定义分析工具
- 报告生成功能

### 组件使用示例

```vue
<template>
  <div class="audit-center">
    <!-- 性能监控 -->
    <el-dialog v-model="showPerformanceMonitor">
      <PerformanceMonitor />
    </el-dialog>
    
    <!-- 告警管理 -->
    <AlertManagement v-if="showAlertManagement" />
    
    <!-- 数据分析仪表板 -->
    <AnalyticsDashboard />
  </div>
</template>

<script setup lang="ts">
import PerformanceMonitor from './components/PerformanceMonitor.vue'
import AlertManagement from './components/AlertManagement.vue'
import AnalyticsDashboard from './components/AnalyticsDashboard.vue'
</script>
```

## 配置管理

### 动态策略配置

系统支持运行时动态调整审核策略，无需重启服务。

```typescript
import { auditPolicyDynamicManager } from '@/api/auditPolicyDynamic'

// 创建动态规则
await auditPolicyDynamicManager.createRule({
  name: '高峰期策略调整',
  trigger: {
    type: 'time',
    config: {
      schedule: '0 20 * * *'  // 每天20点触发
    }
  },
  actions: [{
    type: 'update_policy',
    config: {
      bizType: 'content',
      changes: {
        manualReviewThreshold: 0.7  // 降低人工审核阈值
      }
    }
  }]
})
```

### 环境配置

```typescript
// 开发环境配置
export const devConfig = {
  asyncProcessor: {
    queueType: 'memory',
    concurrency: 2
  },
  database: {
    slowQueryThreshold: 500
  },
  alerts: {
    enabled: false
  }
}

// 生产环境配置
export const prodConfig = {
  asyncProcessor: {
    queueType: 'redis',
    concurrency: 20
  },
  database: {
    slowQueryThreshold: 1000
  },
  alerts: {
    enabled: true
  }
}
```

## API 接口文档

### 审核任务接口

#### 提交审核任务
```http
POST /api/audit/tasks
Content-Type: application/json

{
  "bizType": "content",
  "data": {
    "content": "待审核内容",
    "author": "user123"
  },
  "priority": 1
}
```

#### 获取任务状态
```http
GET /api/audit/tasks/{taskId}

Response:
{
  "taskId": "task-001",
  "status": "completed",
  "result": {
    "decision": "approved",
    "confidence": 0.95,
    "reasons": ["内容符合社区规范"]
  }
}
```

### 性能监控接口

#### 获取系统指标
```http
GET /api/admin/metrics/system

Response:
{
  "cpu": 45.2,
  "memory": 67.8,
  "responseTime": 234,
  "throughput": 12.5,
  "errorRate": 0.8
}
```

#### 获取数据库指标
```http
GET /api/admin/database/metrics

Response:
{
  "connectionPoolSize": 20,
  "activeConnections": 12,
  "slowQueries": 3,
  "cacheHitRatio": 0.94
}
```

## 部署指南

### 环境要求
- Node.js 16+
- PostgreSQL 13+
- Redis 6+ (可选)
- 内存: 4GB+ (推荐 8GB+)
- CPU: 4核+ (推荐 8核+)

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd audit-system
```

2. **安装依赖**
```bash
npm install
```

3. **环境配置**
```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等
```

4. **数据库初始化**
```bash
npm run db:migrate
npm run db:seed
```

5. **构建项目**
```bash
npm run build
```

6. **启动服务**
```bash
# 开发环境
npm run dev

# 生产环境
npm run start
```

### Docker 部署

```dockerfile
FROM node:16-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY public ./public

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# 构建镜像
docker build -t audit-system .

# 运行容器
docker run -p 3000:3000 -e NODE_ENV=production audit-system
```

## 测试指南

### 运行测试

```bash
# 运行所有测试
npm run test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 测试覆盖率
npm run test:coverage
```

### 测试结构

```
src/
├── api/
│   ├── __tests__/                    # API 测试
│   │   ├── auditAsyncProcessor.test.ts
│   │   ├── auditDatabaseOptimizer.test.ts
│   │   └── auditAlertSystem.test.ts
│   └── ...
├── views/
│   └── audit/
│       └── components/
│           └── __tests__/             # 组件测试
│               └── PerformanceMonitor.test.ts
└── ...
```

### 测试示例

```typescript
// API 测试示例
describe('AuditAsyncProcessor', () => {
  let processor: AuditAsyncProcessor

  beforeEach(() => {
    processor = new AuditAsyncProcessor({
      queueType: 'memory',
      concurrency: 2
    })
  })

  it('should add task to queue successfully', async () => {
    const task = {
      taskId: 'test-task',
      bizType: 'content',
      data: {}
    }

    await processor.addTask(task)
    const status = await processor.getQueueStatus()
    
    expect(status.size).toBeGreaterThan(0)
  })
})
```

## 监控和运维

### 系统监控

1. **性能指标监控**
   - CPU、内存、磁盘使用率
   - 网络I/O和数据库连接
   - 应用响应时间和吞吐量

2. **业务指标监控**
   - 审核任务处理量
   - 审核员工作效率
   - 系统错误率和可用性

3. **自动告警**
   - 系统异常自动通知
   - 性能阈值触发告警
   - 业务指标异常告警

### 日志管理

```typescript
// 日志配置示例
import { createLogger, format, transports } from 'winston'

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
})
```

### 健康检查

```typescript
// 健康检查端点
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: Date.now(),
    services: {
      database: await checkDatabaseHealth(),
      cache: await checkCacheHealth(),
      queue: await checkQueueHealth()
    }
  }

  const isHealthy = Object.values(health.services).every(service => service === 'ok')
  
  res.status(isHealthy ? 200 : 503).json(health)
})
```

## 常见问题解答

### Q: 如何添加新的业务类型？

A: 1. 在 `src/types/index.ts` 中添加新的 BizType
   2. 创建对应的 AuditNode 实现类
   3. 在 AuditNodeFactory 中注册新的节点类型

### Q: 如何自定义审核策略？

A: 1. 在审核中心的策略配置页面创建新策略
   2. 配置敏感词库、AI模型参数等
   3. 设置动态调整规则（可选）

### Q: 系统性能优化建议？

A: 1. 定期查看性能监控报告
   2. 根据数据库优化建议创建索引
   3. 调整异步处理器并发数
   4. 启用 Redis 缓存

### Q: 如何扩展告警通知方式？

A: 1. 实现 AlertNotifier 接口
   2. 在 AuditAlertSystem 中注册新的通知器
   3. 在告警规则中配置新的通知方式

## 更新日志

### v1.0.0 (2024-12-28)

**新增功能:**
- 统一审核中心基础架构
- 非侵入式审核节点系统
- 异步任务处理机制
- 实时性能监控
- 智能告警系统
- 数据分析和可视化
- 动态策略配置

**技术特性:**
- Vue 3 + TypeScript 前端架构
- 高性能异步处理
- 数据库查询优化
- 全面的单元测试
- Docker 容器化支持

## 贡献指南

我们欢迎社区贡献！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支: `git checkout -b feature/new-feature`
3. 提交更改: `git commit -m 'Add new feature'`
4. 推送分支: `git push origin feature/new-feature`
5. 提交 Pull Request

### 代码规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 配置规则
- 编写单元测试
- 更新相关文档

## 许可证

本项目采用 MIT 许可证。详见 LICENSE 文件。

## 联系方式

- 项目维护者: [维护者姓名]
- 邮箱: [联系邮箱]
- 项目主页: [项目 URL]
- 问题反馈: [Issues URL]