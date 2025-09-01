<template>
  <div class="placeholder-page">
    <h2>操作告警</h2>
    <el-card>
      <div class="content">
        <el-result
          icon="info"
          title="操作告警"
          sub-title="操作告警功能开发中..."
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
.placeholder-page {
  padding: 20px;
}

.content {
  text-align: center;
  padding: 40px;
}
</style>
