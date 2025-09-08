<template>
  <div class="content-edit">
    <UnifiedPageHeader 
      title="编辑内容" 
      description="编辑已有的内容信息和设置"
    />
    <el-card>
      <div class="content">
        <el-result
          icon="warning"
          title="编辑内容页面"
          sub-title="内容编辑功能开发中..."
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
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
// 占位组件，后续完善
</script>

<style scoped>
.content-edit {
  padding: 20px;
}

.content {
  text-align: center;
  padding: 40px;
}
</style>