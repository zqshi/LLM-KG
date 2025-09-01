<template>
  <div class="operation-dashboard">
    <h2>运营数据看板</h2>
    <el-card>
      <div class="content">
        <el-result
          icon="info"
          title="运营数据看板"
          sub-title="运营数据可视化功能开发中..."
        >
          <template #extra>
            <el-button type="primary">返回首页</el-button>
          </template>
        </el-result>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 占位组件，后续完善
</script>

<style scoped>
.operation-dashboard {
  padding: 20px;
}

.content {
  text-align: center;
  padding: 40px;
}
</style>