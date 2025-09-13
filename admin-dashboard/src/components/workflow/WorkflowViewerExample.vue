<template>
  <div class="workflow-viewer-example">
    <div class="example-header">
      <h2>统一工作流查看器使用示例</h2>
      <p class="description">
        展示 UnifiedWorkflowViewer 组件的各种使用方式和配置选项
      </p>
    </div>

    <div class="example-sections">
      <!-- 基本使用示例 -->
      <section class="example-section">
        <h3>基本使用</h3>
        <p>最简单的使用方式，传入工作流数据即可：</p>
        
        <div class="demo-container">
          <UnifiedWorkflowViewer
            :workflow-data="basicWorkflowData"
            :banner-info="sampleBannerInfo"
          />
        </div>
        
        <details class="code-example">
          <summary>查看代码</summary>
          <pre><code>&lt;UnifiedWorkflowViewer
  :workflow-data="workflowData"
  :banner-info="bannerInfo"
/&gt;</code></pre>
        </details>
      </section>

      <!-- 仅步骤视图示例 -->
      <section class="example-section">
        <h3>仅步骤视图</h3>
        <p>固定为步骤视图模式，不显示模式切换开关：</p>
        
        <div class="demo-container">
          <UnifiedWorkflowViewer
            :workflow-data="stepOnlyWorkflowData"
            :banner-info="sampleBannerInfo"
            view-mode="steps"
            :show-mode-switch="false"
          />
        </div>
        
        <details class="code-example">
          <summary>查看代码</summary>
          <pre><code>&lt;UnifiedWorkflowViewer
  :workflow-data="workflowData"
  :banner-info="bannerInfo"
  view-mode="steps"
  :show-mode-switch="false"
/&gt;</code></pre>
        </details>
      </section>

      <!-- 仅流程图视图示例 -->
      <section class="example-section">
        <h3>仅流程图视图</h3>
        <p>固定为流程图视图模式，包含详细的审批信息：</p>
        
        <div class="demo-container">
          <UnifiedWorkflowViewer
            :workflow-data="diagramWorkflowData"
            :banner-info="sampleBannerInfo"
            view-mode="diagram"
            :show-mode-switch="false"
          />
        </div>
        
        <details class="code-example">
          <summary>查看代码</summary>
          <pre><code>&lt;UnifiedWorkflowViewer
  :workflow-data="workflowData"
  :banner-info="bannerInfo"
  view-mode="diagram"
  :show-mode-switch="false"
/&gt;</code></pre>
        </details>
      </section>

      <!-- 简化版示例 -->
      <section class="example-section">
        <h3>简化版（无Banner信息）</h3>
        <p>不显示Banner信息卡片，专注于工作流展示：</p>
        
        <div class="demo-container">
          <UnifiedWorkflowViewer
            :workflow-data="simpleWorkflowData"
            :show-banner-info="false"
            @mode-change="onModeChange"
          />
        </div>
        
        <details class="code-example">
          <summary>查看代码</summary>
          <pre><code>&lt;UnifiedWorkflowViewer
  :workflow-data="workflowData"
  :show-banner-info="false"
  @mode-change="onModeChange"
/&gt;</code></pre>
        </details>
      </section>

      <section class="example-section">
        <h3>空状态展示</h3>
        <p>当没有工作流数据时的展示效果：</p>
        
        <div class="demo-container">
          <UnifiedWorkflowViewer
            :workflow-data="emptyWorkflowData"
            :banner-info="sampleBannerInfo"
          />
        </div>
        
        <details class="code-example">
          <summary>查看代码</summary>
          <pre><code>&lt;UnifiedWorkflowViewer
  :workflow-data="{ steps: [] }"
  :banner-info="bannerInfo"
/&gt;</code></pre>
        </details>
      </section>

      <section class="example-section">
        <h3>API 文档</h3>
        
        <div class="api-docs">
          <h4>Props</h4>
          <table class="api-table">
            <thead>
              <tr>
                <th>参数</th>
                <th>说明</th>
                <th>类型</th>
                <th>默认值</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>workflow-data</code></td>
                <td>工作流数据，包含步骤和操作历史</td>
                <td><code>WorkflowData</code></td>
                <td>-</td>
              </tr>
              <tr>
                <td><code>banner-info</code></td>
                <td>Banner基本信息</td>
                <td><code>BannerInfo</code></td>
                <td>-</td>
              </tr>
              <tr>
                <td><code>view-mode</code></td>
                <td>展示模式：steps(步骤视图) | diagram(流程图) | auto(自动选择)</td>
                <td><code>string</code></td>
                <td><code>'auto'</code></td>
              </tr>
              <tr>
                <td><code>show-mode-switch</code></td>
                <td>是否显示模式切换开关</td>
                <td><code>boolean</code></td>
                <td><code>true</code></td>
              </tr>
              <tr>
                <td><code>show-banner-info</code></td>
                <td>是否显示Banner信息卡片</td>
                <td><code>boolean</code></td>
                <td><code>true</code></td>
              </tr>
              <tr>
                <td><code>responsive</code></td>
                <td>是否开启响应式自动切换</td>
                <td><code>boolean</code></td>
                <td><code>true</code></td>
              </tr>
            </tbody>
          </table>

          <h4>Events</h4>
          <table class="api-table">
            <thead>
              <tr>
                <th>事件名</th>
                <th>说明</th>
                <th>回调参数</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>mode-change</code></td>
                <td>视图模式改变时触发</td>
                <td><code>(mode: 'steps' | 'diagram') => void</code></td>
              </tr>
              <tr>
                <td><code>step-click</code></td>
                <td>点击步骤节点时触发</td>
                <td><code>(step: WorkflowStep) => void</code></td>
              </tr>
              <tr>
                <td><code>fullscreen-change</code></td>
                <td>全屏状态改变时触发</td>
                <td><code>(isFullscreen: boolean) => void</code></td>
              </tr>
            </tbody>
          </table>

          <h4>数据结构</h4>
          <details class="type-definitions">
            <summary>WorkflowData 接口</summary>
            <pre><code>interface WorkflowData {
  steps: WorkflowStep[]           // 工作流步骤数组
  operationHistory?: OperationRecord[]  // 操作历史记录
  currentStatus?: string          // 当前状态
  totalDuration?: string          // 总耗时
}</code></pre>
          </details>

          <details class="type-definitions">
            <summary>WorkflowStep 接口</summary>
            <pre><code>interface WorkflowStep {
  id: string | number            // 步骤ID
  name: string                   // 步骤名称
  status: 'pending' | 'processing' | 'approved' | 'rejected'  // 步骤状态
  approvers?: string[]           // 审批人列表
  processTime?: string           // 处理时间
  comment?: string               // 审批意见
  duration?: string              // 处理耗时
  approvalType?: 'any' | 'all'   // 审批类型
}</code></pre>
          </details>

          <details class="type-definitions">
            <summary>BannerInfo 接口</summary>
            <pre><code>interface BannerInfo {
  id: number                     // Banner ID
  title: string                  // Banner标题
  imageUrl: string               // 图片URL
  linkUrl: string                // 跳转链接
  startTime: string              // 开始时间
  endTime: string                // 结束时间
  status: BannerStatus           // Banner状态
  description?: string           // 描述
  creator?: string               // 创建人
  createTime?: string            // 创建时间
}</code></pre>
          </details>
        </div>
      </section>
    </div>

    <div class="example-footer">
      <p>
        <strong>提示：</strong>在实际使用中，可以根据业务需求灵活配置各种参数，
        组件会自动处理响应式布局和状态展示。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UnifiedWorkflowViewer from './UnifiedWorkflowViewer.vue'
import type { WorkflowData, BannerInfo } from './UnifiedWorkflowViewer.vue'

// 示例数据
const sampleBannerInfo: BannerInfo = {
  id: 1,
  title: '春节活动推广Banner',
  imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkY2QjZCIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPuiJueS9nOiKseW+iemHj+WKoOi9veS4lueVjOaUtuS4nOe7n+WKoOi9veS4lueVjOWksei0pTwvdGV4dD4KPC9zdmc+',
  linkUrl: 'https://example.com/spring-festival',
  startTime: '2024-02-01 00:00:00',
  endTime: '2024-02-29 23:59:59',
  status: 'reviewing',
  description: '春节活动推广Banner，需要快速上线',
  creator: '张三',
  createTime: '2024-01-25 10:00:00'
}

// 基本工作流数据
const basicWorkflowData: WorkflowData = {
  steps: [
    {
      id: 1,
      name: '内容初审',
      status: 'approved',
      approvers: ['李四'],
      processTime: '2024-01-25 14:30:00',
      comment: '内容符合规范，通过审核',
      duration: '4小时30分钟'
    },
    {
      id: 2,
      name: '运营审核',
      status: 'processing',
      approvers: ['王五', '赵六'],
      processTime: '2024-01-26 09:00:00',
      approvalType: 'any'
    },
    {
      id: 3,
      name: '最终审批',
      status: 'pending',
      approvers: ['孙七'],
      approvalType: 'any'
    }
  ],
  operationHistory: [
    {
      time: '2024-01-25 10:00:00',
      operator: '张三',
      action: 'submit',
      comment: '提交春节活动Banner审批',
      node: '提交'
    },
    {
      time: '2024-01-25 14:30:00',
      operator: '李四',
      action: 'approve',
      comment: '内容符合规范，通过审核',
      node: '内容初审',
      duration: '4小时30分钟'
    }
  ]
}

// 仅步骤视图数据
const stepOnlyWorkflowData: WorkflowData = {
  steps: [
    {
      id: 1,
      name: '提交审核',
      status: 'approved',
      approvers: ['系统'],
      processTime: '2024-01-25 10:00:00',
      comment: '已提交审核'
    },
    {
      id: 2,
      name: '自动审核',
      status: 'approved',
      approvers: ['智能审核系统'],
      processTime: '2024-01-25 10:05:00',
      comment: '图片质量检查通过，文本内容合规',
      duration: '5分钟'
    },
    {
      id: 3,
      name: '人工复审',
      status: 'processing',
      approvers: ['审核员A'],
      processTime: '2024-01-25 11:00:00'
    }
  ]
}

// 流程图视图数据（更详细）
const diagramWorkflowData: WorkflowData = {
  steps: [
    {
      id: 1,
      name: '部门主管审核',
      status: 'approved',
      approvers: ['张主管'],
      processTime: '2024-01-25 14:30:00',
      comment: '设计符合品牌规范，内容准确无误',
      duration: '2小时15分钟',
      approvalType: 'any'
    },
    {
      id: 2,
      name: '运营总监审核',
      status: 'approved',
      approvers: ['李总监'],
      processTime: '2024-01-26 10:15:00',
      comment: '营销策略合理，时间节点合适',
      duration: '1小时45分钟',
      approvalType: 'any'
    },
    {
      id: 3,
      name: '法务合规审核',
      status: 'processing',
      approvers: ['王律师', '刘合规'],
      processTime: '2024-01-26 15:30:00',
      approvalType: 'all'
    },
    {
      id: 4,
      name: '总经理最终审批',
      status: 'pending',
      approvers: ['陈总'],
      approvalType: 'any'
    }
  ],
  operationHistory: [
    {
      time: '2024-01-25 10:00:00',
      operator: '张三',
      action: 'submit',
      comment: '提交春节活动Banner审批申请',
      node: '申请提交'
    },
    {
      time: '2024-01-25 14:30:00',
      operator: '张主管',
      action: 'approve',
      comment: '设计符合品牌规范，内容准确无误',
      node: '部门主管审核',
      duration: '2小时15分钟'
    },
    {
      time: '2024-01-26 10:15:00',
      operator: '李总监',
      action: 'approve',
      comment: '营销策略合理，时间节点合适',
      node: '运营总监审核',
      duration: '1小时45分钟'
    }
  ],
  totalDuration: '1天5小时30分钟'
}

// 简化版数据
const simpleWorkflowData: WorkflowData = {
  steps: [
    {
      id: 1,
      name: '自动检查',
      status: 'approved',
      approvers: ['系统'],
      processTime: '2024-01-25 10:00:00',
      duration: '30秒'
    },
    {
      id: 2,
      name: '人工审核',
      status: 'processing',
      approvers: ['审核员'],
      processTime: '2024-01-25 10:30:00'
    }
  ]
}

// 空状态数据
const emptyWorkflowData: WorkflowData = {
  steps: []
}

// 事件处理
const onModeChange = (mode: 'steps' | 'diagram') => {
  console.log('视图模式已切换为:', mode)
}
</script>

<style scoped>
.workflow-viewer-example {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.example-header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid #ebeef5;
}

.example-header h2 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 28px;
  font-weight: 600;
}

.description {
  margin: 0;
  color: #606266;
  font-size: 16px;
  line-height: 1.6;
}

.example-sections {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.example-section {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.example-section h3 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
  padding: 20px 24px 0;
}

.example-section > p {
  margin: 0 0 20px 0;
  color: #606266;
  line-height: 1.6;
  padding: 0 24px;
}

.demo-container {
  padding: 24px;
  background: #fafafa;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
}

.code-example {
  margin: 0;
  padding: 16px 24px;
  background: #f8f9fa;
}

.code-example summary {
  cursor: pointer;
  color: #409eff;
  font-weight: 500;
  outline: none;
}

.code-example pre {
  margin: 12px 0 0 0;
  padding: 16px;
  background: #2d3748;
  color: #e2e8f0;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 14px;
  line-height: 1.5;
}

.code-example code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.api-docs {
  padding: 24px;
}

.api-docs h4 {
  margin: 24px 0 16px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.api-docs h4:first-child {
  margin-top: 0;
}

.api-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 24px;
  font-size: 14px;
}

.api-table th,
.api-table td {
  padding: 12px;
  text-align: left;
  border: 1px solid #ebeef5;
}

.api-table th {
  background: #f5f7fa;
  color: #303133;
  font-weight: 600;
}

.api-table td {
  color: #606266;
}

.api-table code {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 13px;
  color: #e83e8c;
}

.type-definitions {
  margin: 16px 0;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.type-definitions summary {
  padding: 12px 16px;
  background: #f5f7fa;
  cursor: pointer;
  font-weight: 500;
  color: #409eff;
  border-bottom: 1px solid #ebeef5;
  outline: none;
}

.type-definitions pre {
  margin: 0;
  padding: 16px;
  background: #fafbfc;
  color: #24292e;
  font-size: 13px;
  line-height: 1.5;
  overflow-x: auto;
}

.example-footer {
  margin-top: 40px;
  padding: 20px 24px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
}

.example-footer p {
  margin: 0;
  color: #0369a1;
  line-height: 1.6;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .workflow-viewer-example {
    padding: 16px;
  }
  
  .example-header {
    margin-bottom: 24px;
    padding-bottom: 16px;
  }
  
  .example-header h2 {
    font-size: 24px;
  }
  
  .example-sections {
    gap: 24px;
  }
  
  .example-section h3 {
    font-size: 18px;
    padding: 16px 20px 0;
  }
  
  .example-section > p {
    padding: 0 20px;
  }
  
  .demo-container {
    padding: 16px;
  }
  
  .code-example {
    padding: 12px 16px;
  }
  
  .api-docs {
    padding: 16px;
  }
  
  .api-table {
    font-size: 12px;
  }
  
  .api-table th,
  .api-table td {
    padding: 8px;
  }
}
</style>