<template>
  <div class="permission-test">
    <el-card>
      <template #header>
        <span>超级管理员权限验证</span>
      </template>
      <div class="permission-summary">
        <el-descriptions title="用户信息" :column="2" border>
          <el-descriptions-item label="用户名">{{ currentUser?.username }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ currentUser?.name }}</el-descriptions-item>
          <el-descriptions-item label="角色">{{ currentUser?.roles?.map(r => r.name).join(', ') }}</el-descriptions-item>
          <el-descriptions-item label="数据权限">{{ getDataScopeName() }}</el-descriptions-item>
          <el-descriptions-item label="是否超级管理员">
            <el-tag :type="isSuperAdmin ? 'success' : 'danger'">
              {{ isSuperAdmin ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="权限总数">{{ totalPermissions }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <el-divider />

      <div class="permission-groups">
        <el-row :gutter="16">
          <el-col :span="24">
            <h3>权限模块验证</h3>
            <div class="permission-tags">
              <el-tag 
                v-for="(group, key) in PERMISSION_GROUPS" 
                :key="key"
                :type="checkModulePermissions(key) ? 'success' : 'danger'"
                size="large"
                style="margin: 4px;"
              >
                {{ group.name }} ({{ getModulePermissionCount(key) }})
              </el-tag>
            </div>
          </el-col>
        </el-row>

        <el-divider />

        <el-row :gutter="16">
          <el-col :span="24">
            <h3>详细权限检查</h3>
            <el-collapse v-model="activeKeys">
              <el-collapse-item
                v-for="(group, key) in PERMISSION_GROUPS"
                :key="key"
                :name="key"
                :title="`${group.name} (${getModulePermissionCount(key)} 项权限)`"
              >
                <div v-if="group.children">
                  <div v-for="(childGroup, childKey) in group.children" :key="childKey" class="permission-child-group">
                    <h4>{{ childGroup.name }}</h4>
                    <div class="permission-tags">
                      <el-tag 
                        v-for="perm in childGroup.permissions" 
                        :key="perm.key"
                        :type="checkPermission(perm.key) ? 'success' : 'danger'"
                        size="small"
                        style="margin: 2px;"
                      >
                        {{ perm.name }}
                      </el-tag>
                    </div>
                  </div>
                </div>
                <div v-else>
                  <div class="permission-tags">
                    <el-tag 
                      v-for="perm in group.permissions" 
                      :key="perm.key"
                      :type="checkPermission(perm.key) ? 'success' : 'danger'"
                      size="small"
                      style="margin: 2px;"
                    >
                      {{ perm.name }}
                    </el-tag>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-col>
        </el-row>
      </div>

      <el-divider />

      <div class="permission-actions">
        <el-space>
          <el-button type="primary" @click="exportPermissions">
            导出权限配置
          </el-button>
          <el-button @click="validateAllPermissions">
            验证所有权限
          </el-button>
          <el-button @click="clearCache">
            清除缓存
          </el-button>
        </el-space>
      </div>

      <el-divider />

      <div class="permission-stats">
        <el-row :gutter="16">
          <el-col :span="6">
            <el-statistic title="拥有权限" :value="ownedPermissions" suffix="项" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="缺失权限" :value="missingPermissions" suffix="项" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="权限覆盖率" :value="permissionCoverage" suffix="%" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="可访问模块" :value="accessibleModules" suffix="个" />
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { PERMISSION_GROUPS, SUPER_ADMIN_PERMISSIONS, DATA_SCOPES, isSuperAdmin as checkIsSuperAdmin } from '@/stores/permissions'
import { ElMessage as message } from 'element-plus'

const authStore = useAuthStore()
const activeKeys = ref<string[]>([])

const currentUser = computed(() => authStore.currentUser)
const isSuperAdmin = computed(() => checkIsSuperAdmin(currentUser.value))
const totalPermissions = computed(() => SUPER_ADMIN_PERMISSIONS.length)

// 检查权限
const checkPermission = (permission: string) => {
  return authStore.checkPermission(permission)
}

// 检查模块权限
const checkModulePermissions = (moduleKey: string) => {
  const group = PERMISSION_GROUPS[moduleKey as keyof typeof PERMISSION_GROUPS]
  if (!group) return false
  
  if (group.children) {
    return Object.values(group.children).every((childGroup: any) => 
      childGroup.permissions.every((perm: any) => checkPermission(perm.key))
    )
  } else if (group.permissions) {
    return group.permissions.every((perm: any) => checkPermission(perm.key))
  }
  return false
}

// 获取模块权限数量
const getModulePermissionCount = (moduleKey: string) => {
  const group = PERMISSION_GROUPS[moduleKey as keyof typeof PERMISSION_GROUPS]
  if (!group) return 0
  
  if (group.children) {
    return Object.values(group.children).reduce((count: number, childGroup: any) => 
      count + (childGroup.permissions?.length || 0), 0
    )
  } else if (group.permissions) {
    return group.permissions.length
  }
  return 0
}

// 获取数据权限名称
const getDataScopeName = () => {
  const user = currentUser.value
  if (!user?.roles?.length) return '未知'
  
  const dataScope = user.roles[0].dataScope
  return DATA_SCOPES[dataScope as keyof typeof DATA_SCOPES]?.name || '未知'
}

// 统计信息
const ownedPermissions = computed(() => {
  let count = 0
  Object.values(PERMISSION_GROUPS).forEach(group => {
    if (group.children) {
      Object.values(group.children).forEach((childGroup: any) => {
        count += childGroup.permissions?.filter((perm: any) => checkPermission(perm.key)).length || 0
      })
    } else if (group.permissions) {
      count += group.permissions.filter((perm: any) => checkPermission(perm.key)).length || 0
    }
  })
  return count
})

const missingPermissions = computed(() => {
  let total = 0
  Object.values(PERMISSION_GROUPS).forEach(group => {
    if (group.children) {
      Object.values(group.children).forEach((childGroup: any) => {
        total += childGroup.permissions?.length || 0
      })
    } else if (group.permissions) {
      total += group.permissions.length || 0
    }
  })
  return total - ownedPermissions.value
})

const permissionCoverage = computed(() => {
  const total = ownedPermissions.value + missingPermissions.value
  return total > 0 ? Math.round((ownedPermissions.value / total) * 100) : 0
})

const accessibleModules = computed(() => {
  return Object.keys(PERMISSION_GROUPS).filter(key => checkModulePermissions(key)).length
})

// 导出权限配置
const exportPermissions = () => {
  const permissionData = {
    user: currentUser.value,
    isSuperAdmin: isSuperAdmin.value,
    permissions: authStore.permissions,
    permissionGroups: PERMISSION_GROUPS,
    dataScopes: DATA_SCOPES,
    stats: {
      total: totalPermissions.value,
      owned: ownedPermissions.value,
      missing: missingPermissions.value,
      coverage: permissionCoverage.value,
      accessibleModules: accessibleModules.value
    }
  }
  
  const blob = new Blob([JSON.stringify(permissionData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `permissions-${currentUser.value?.username}-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
  
  message.success('权限配置导出成功')
}

// 验证所有权限
const validateAllPermissions = () => {
  const results = SUPER_ADMIN_PERMISSIONS.map(permission => ({
    permission,
    hasAccess: checkPermission(permission)
  }))
  
  const failedPermissions = results.filter(r => !r.hasAccess)
  
  if (failedPermissions.length === 0) {
    message.success('所有权限验证通过！超级管理员拥有完整的系统权限。')
  } else {
    message.error(`发现 ${failedPermissions.length} 个权限缺失，请检查权限配置。`)
    console.error('缺失的权限:', failedPermissions)
  }
}

// 清除缓存
const clearCache = () => {
  authStore.clearAllCache()
  message.success('缓存已清除，请重新登录')
  setTimeout(() => {
    window.location.reload()
  }, 1000)
}

onMounted(() => {
  // 默认展开第一个权限组
  activeKeys.value = [Object.keys(PERMISSION_GROUPS)[0]]
})
</script>

<style scoped>
.permission-test {
  padding: 20px;
}

.permission-summary {
  margin-bottom: 20px;
}

.permission-child-group {
  margin-bottom: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
}

.permission-child-group h4 {
  margin: 0 0 8px 0;
  color: #1f2937;
}

.permission-actions {
  text-align: center;
}

.permission-stats {
  margin-top: 20px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
}

.permission-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>