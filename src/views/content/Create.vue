<template>
  <div class="content-create">
    <h2>创建内容</h2>
    <el-card>
      <div class="content">
        <el-result
          icon="success"
          title="创建内容页面"
          sub-title="内容创建功能开发中..."
        >
          <template #extra>
            <el-button type="primary" @click="$router.push('/content/list')">返回列表</el-button>
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
.content-create {
  padding: 20px;
}

.content {
  text-align: center;
  padding: 40px;
}
</style>