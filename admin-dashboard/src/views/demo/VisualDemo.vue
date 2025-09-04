<template>
    <div class="demo-page">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="header-content">
                <h1 class="page-title">BlueTrade风格演示</h1>
                <p class="page-subtitle">
                    基于BlueTrade设计风格的管理后台视觉优化效果展示
                </p>
            </div>
        </div>

        <!-- 数据卡片展示 -->
        <div class="demo-section">
            <h2 class="section-title">数据展示卡片</h2>
            <el-row :gutter="24">
                <el-col :span="6" v-for="(card, index) in demoCards" :key="index">
                    <div class="data-display-card">
                        <div class="card-content">
                            <div class="card-icon-container">
                                <div class="card-icon" :class="card.type">
                                    <el-icon size="32">
                                        <component :is="card.icon" />
                                    </el-icon>
                                </div>
                                <div class="data-trend" :class="card.trendType">
                                    <el-icon size="12">
                                        <TrendCharts />
                                    </el-icon>
                                    <span>{{ card.trend }}</span>
                                </div>
                            </div>
                            <div class="card-info">
                                <div class="data-value">{{ card.value }}</div>
                                <div class="data-label">{{ card.label }}</div>
                                <div class="data-change">{{ card.change }}</div>
                            </div>
                        </div>
                    </div>
                </el-col>
            </el-row>
        </div>

        <!-- 现代化按钮组 -->
        <div class="demo-section">
            <h2 class="section-title">现代化按钮</h2>
            <div class="button-showcase">
                <el-button class="btn-gradient" size="large">
                    渐变按钮
                </el-button>
                <div class="modern-button-group">
                    <button class="modern-button active">已激活</button>
                    <button class="modern-button">普通状态</button>
                    <button class="modern-button">悬停试试</button>
                </div>
            </div>
        </div>

        <!-- 状态指示器 -->
        <div class="demo-section">
            <h2 class="section-title">状态指示器</h2>
            <div class="status-showcase">
                <div class="status-indicator online">在线</div>
                <div class="status-indicator offline">离线</div>
                <div class="status-indicator warning">警告</div>
                <div class="status-indicator error">错误</div>
            </div>
        </div>

        <!-- 现代化表格 -->
        <div class="demo-section">
            <h2 class="section-title">现代化表格</h2>
            <div class="modern-table">
                <el-table :data="demoTableData" style="width: 100%">
                    <el-table-column prop="name" label="项目名称" width="200" />
                    <el-table-column prop="status" label="状态" width="120">
                        <template #default="scope">
                            <div class="status-indicator" :class="scope.row.statusType">
                                {{ scope.row.status }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="progress" label="进度" width="150">
                        <template #default="scope">
                            <el-progress :percentage="scope.row.progress" :show-text="false" />
                            <span class="progress-text">{{ scope.row.progress }}%</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="value" label="数值" />
                    <el-table-column label="操作" width="200">
                        <template #default>
                            <div class="modern-button-group">
                                <button class="modern-button">编辑</button>
                                <button class="modern-button">删除</button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>

        <!-- 图表容器演示 -->
        <div class="demo-section">
            <h2 class="section-title">图表容器</h2>
            <div class="chart-container-enhanced">
                <div class="chart-header-modern">
                    <div>
                        <h3 class="chart-title-modern">数据趋势图</h3>
                        <div class="chart-subtitle-modern">展示最近30天的数据变化趋势</div>
                    </div>
                    <div class="modern-button-group">
                        <button class="modern-button active">30天</button>
                        <button class="modern-button">7天</button>
                        <button class="modern-button">今天</button>
                    </div>
                </div>
                <div class="chart-placeholder">
                    <div class="placeholder-content">
                        <el-icon size="64" color="#e5e7eb">
                            <DataLine />
                        </el-icon>
                        <p>图表内容区域</p>
                        <p class="placeholder-desc">这里会显示实际的图表内容</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- 浮动操作按钮 -->
        <div class="fab-container">
            <button class="fab-button">
                <el-icon size="24">
                    <Plus />
                </el-icon>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
    User, Document, Monitor, ShoppingCart,
    TrendCharts, DataLine, Plus
} from '@element-plus/icons-vue'

// 演示数据
const demoCards = ref([
    {
        icon: 'User',
        type: 'primary',
        value: '12,456',
        label: '活跃用户',
        trend: '+12.5%',
        trendType: 'positive',
        change: '较昨日增长'
    },
    {
        icon: 'Document',
        type: 'success',
        value: '8,234',
        label: '内容总数',
        trend: '+8.3%',
        trendType: 'positive',
        change: '持续增长'
    },
    {
        icon: 'Monitor',
        type: 'warning',
        value: '99.9%',
        label: '系统稳定性',
        trend: '-0.1%',
        trendType: 'negative',
        change: '轻微波动'
    },
    {
        icon: 'ShoppingCart',
        type: 'primary',
        value: '3,456',
        label: '交易量',
        trend: '+15.2%',
        trendType: 'positive',
        change: '显著提升'
    }
])

const demoTableData = ref([
    {
        name: '知识管理系统',
        status: '运行中',
        statusType: 'online',
        progress: 85,
        value: '₹23,495'
    },
    {
        name: '用户权限模块',
        status: '维护中',
        statusType: 'warning',
        progress: 60,
        value: '₹15,978'
    },
    {
        name: '内容审核流程',
        status: '已完成',
        statusType: 'online',
        progress: 100,
        value: '₹8,267'
    },
    {
        name: '数据分析平台',
        status: '错误',
        statusType: 'error',
        progress: 25,
        value: '₹495'
    }
])
</script>

<style scoped>
.demo-page {
    padding: var(--spacing-lg);
    background: var(--color-bg-page);
    min-height: 100vh;
}

.demo-section {
    margin-bottom: var(--spacing-xxl);
}

.section-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-lg);
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.card-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    height: 100%;
    padding: var(--spacing-lg);
}

.card-icon-container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--spacing-sm);
}

.card-icon {
    width: 64px;
    height: 64px;
    border-radius: var(--radius-xl);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    box-shadow: var(--shadow-card);
}

.card-icon.primary {
    background: var(--gradient-primary);
}

.card-icon.success {
    background: var(--gradient-success);
}

.card-icon.warning {
    background: var(--gradient-warning);
}

.card-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.data-change {
    font-size: 12px;
    color: var(--color-text-tertiary);
    font-weight: 400;
}

.button-showcase {
    display: flex;
    align-items: center;
    gap: var(--spacing-xl);
    flex-wrap: wrap;
}

.status-showcase {
    display: flex;
    gap: var(--spacing-lg);
    flex-wrap: wrap;
}

.chart-placeholder {
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--gradient-primary-soft);
    margin: var(--spacing-lg);
    border-radius: var(--radius-lg);
}

.placeholder-content {
    text-align: center;
    color: var(--color-text-secondary);
}

.placeholder-content p {
    margin: var(--spacing-sm) 0;
    font-size: 1.125rem;
    font-weight: 500;
}

.placeholder-desc {
    font-size: 0.875rem !important;
    font-weight: 400 !important;
    color: var(--color-text-tertiary) !important;
}

.progress-text {
    margin-left: var(--spacing-sm);
    font-size: 0.875rem;
    color: var(--color-text-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .demo-page {
        padding: var(--spacing-md);
    }

    .card-content {
        flex-direction: column;
        gap: var(--spacing-md);
        text-align: center;
    }

    .card-icon-container {
        align-items: center;
    }

    .button-showcase,
    .status-showcase {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>
