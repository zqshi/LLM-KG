<template>
  <el-dialog
    v-model="visible"
    title="角色权限设置"
    width="500px"
    destroy-on-close
  >
    <div class="role-permission-setup">
      <div class="navigation-info">
        <el-alert
          :title="`正在为导航菜单「${navigationData?.name}」设置角色权限`"
          type="info"
          :closable="false"
          show-icon
        />
      </div>

      <div class="permission-content">
        <div class="permission-description">
          <p>请选择可以看到此导航菜单的用户角色：</p>
          <ul class="tips-list">
            <li>不选择任何角色表示对所有用户可见</li>
            <li>选择特定角色后，只有该角色的用户才能看到此导航菜单</li>
            <li>子级菜单会继承父级菜单的权限设置</li>
          </ul>
        </div>

        <div class="role-selection">
          <el-checkbox
            v-model="selectAll"
            :indeterminate="isIndeterminate"
            @change="handleSelectAll"
          >
            全选
          </el-checkbox>
          
          <el-divider />

          <el-checkbox-group v-model="selectedRoles" @change="handleRoleChange">
            <div class="role-grid">
              <el-checkbox
                v-for="role in availableRoles"
                :key="role.id"
                :value="role.id"
                class="role-item"
              >
                <div class="role-content">
                  <div class="role-name">{{ role.name }}</div>
                  <div class="role-description">{{ role.description }}</div>
                  <div class="role-stats">
                    <el-tag size="small" type="info">
                      {{ role.userCount || 0 }} 用户
                    </el-tag>
                  </div>
                </div>
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </div>

        <div v-if="selectedRoles.length > 0" class="permission-summary">
          <el-divider />
          <h4>权限摘要</h4>
          <div class="summary-content">
            <p>
              已选择 <strong>{{ selectedRoles.length }}</strong> 个角色，
              共影响 <strong>{{ totalUsers }}</strong> 个用户
            </p>
            <div class="selected-roles">
              <el-tag
                v-for="roleId in selectedRoles"
                :key="roleId"
                type="primary"
                size="small"
                class="selected-role-tag"
              >
                {{ getRoleName(roleId) }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="submitting">
          保存设置
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 导入API和类型
import { portalConfigApi } from '@/api/navigation'
import type { NavigationItem } from '@/types/navigation'

// ================================
// Props和Emits
// ================================

interface Props {
  visible: boolean
  navigationData?: NavigationItem | null
}

interface RoleInfo {
  id: number
  name: string
  description?: string
  userCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  navigationData: null
})

const emit = defineEmits<{
  'update:visible': [visible: boolean]
  success: []
}>()

// ================================
// 响应式数据
// ================================

const submitting = ref(false)
const selectedRoles = ref<number[]>([])
const availableRoles = ref<RoleInfo[]>([])

// ================================
// 计算属性
// ================================

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const selectAll = computed({
  get: () => selectedRoles.value.length === availableRoles.value.length && availableRoles.value.length > 0,
  set: (value) => {
    if (value) {
      selectedRoles.value = availableRoles.value.map(role => role.id)
    } else {
      selectedRoles.value = []
    }
  }
})

const isIndeterminate = computed(() => {
  const selectedCount = selectedRoles.value.length
  const totalCount = availableRoles.value.length
  return selectedCount > 0 && selectedCount < totalCount
})

const totalUsers = computed(() => {
  return selectedRoles.value.reduce((total, roleId) => {
    const role = availableRoles.value.find(r => r.id === roleId)
    return total + (role?.userCount || 0)
  }, 0)
})

// ================================
// 监听器
// ================================

watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    initRoleData()
    loadAvailableRoles()
  }
})

// ================================
// 生命周期
// ================================

onMounted(() => {
  loadAvailableRoles()
})

// ================================
// 方法
// ================================

/** 初始化角色数据 */
const initRoleData = async () => {
  if (!props.navigationData?.id) return

  try {
    const response = await portalConfigApi.navigation.getNavigationRoles(props.navigationData.id)
    selectedRoles.value = response.data || []
  } catch (error) {
    console.error('获取导航角色权限失败:', error)
    ElMessage.error('获取角色权限失败')
  }
}

/** 加载可用角色 */
const loadAvailableRoles = async () => {
  try {
    // 这里应该从RBAC API获取角色列表
    // const response = await roleApi.getAllRoles()
    // availableRoles.value = response.data || []
    
    // 临时使用模拟数据
    availableRoles.value = [
      { id: 1, name: '系统管理员', description: '系统最高权限管理员', userCount: 3 },
      { id: 2, name: '普通用户', description: '系统普通用户', userCount: 156 },
      { id: 3, name: 'HR专员', description: '人力资源管理专员', userCount: 8 },
      { id: 4, name: '财务专员', description: '财务管理专员', userCount: 12 },
      { id: 5, name: '技术支持', description: '技术支持人员', userCount: 6 },
      { id: 6, name: '运营专员', description: '运营管理专员', userCount: 15 }
    ]
  } catch (error) {
    console.error('获取可用角色失败:', error)
    ElMessage.error('获取角色列表失败')
  }
}

/** 处理全选 */
const handleSelectAll = (value: boolean) => {
  selectAll.value = value
}

/** 处理角色选择变化 */
const handleRoleChange = (value: number[]) => {
  selectedRoles.value = value
}

/** 获取角色名称 */
const getRoleName = (roleId: number): string => {
  const role = availableRoles.value.find(r => r.id === roleId)
  return role?.name || `角色${roleId}`
}

/** 取消 */
const handleCancel = () => {
  visible.value = false
}

/** 确认保存 */
const handleConfirm = async () => {
  if (!props.navigationData?.id) return

  try {
    submitting.value = true
    await portalConfigApi.navigation.setNavigationRoles(
      props.navigationData.id,
      selectedRoles.value
    )
    ElMessage.success('角色权限设置成功')
    emit('success')
  } catch (error) {
    console.error('设置角色权限失败:', error)
    ElMessage.error('角色权限设置失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
// ================================
// 对话框样式优化
// ================================
:deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.18);
  
  .el-dialog__header {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: white;
    padding: 24px 32px;
    border: none;
    
    .el-dialog__title {
      font-size: 20px;
      font-weight: 700;
      color: white;
      display: flex;
      align-items: center;
      gap: 12px;
      
      &::before {
        content: '👥';
        font-size: 24px;
      }
    }
    
    .el-dialog__headerbtn {
      top: 20px;
      right: 20px;
      width: 36px;
      height: 36px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(255, 77, 79, 0.9);
        transform: scale(1.1) rotate(90deg);
        
        .el-dialog__close {
          color: white;
        }
      }
    }
  }
  
  .el-dialog__body {
    padding: 28px 32px;
    background: linear-gradient(135deg, #fafbfc 0%, #f1f5f9 100%);
  }
  
  .el-dialog__footer {
    background: white;
    padding: 20px 32px;
    border-top: 1px solid #e4e7ed;
  }
}

// ================================
// 角色权限设置主容器
// ================================
.role-permission-setup {
  // 导航信息提示
  .navigation-info {
    margin-bottom: 28px;
    
    :deep(.el-alert) {
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%);
      
      .el-alert__icon {
        color: #4facfe;
        font-size: 18px;
      }
      
      .el-alert__title {
        color: #1f2937;
        font-weight: 600;
        font-size: 15px;
      }
    }
  }

  .permission-content {
    // 权限说明
    .permission-description {
      margin-bottom: 28px;
      padding: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      p {
        margin: 0 0 16px 0;
        font-weight: 600;
        color: #1f2937;
        font-size: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        
        &::before {
          content: '🔐';
          font-size: 18px;
        }
      }

      .tips-list {
        margin: 0;
        padding-left: 24px;
        color: #6b7280;
        font-size: 14px;
        line-height: 1.6;

        li {
          margin-bottom: 8px;
          position: relative;
          
          &::before {
            content: '✨';
            position: absolute;
            left: -20px;
            top: 0;
          }
        }
      }
    }

    // 角色选择区域
    .role-selection {
      // 全选控制
      :deep(.el-checkbox) {
        &:first-child {
          margin-bottom: 16px;
          padding: 16px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          border: 2px solid transparent;
          transition: all 0.3s ease;
          
          &:hover {
            border-color: #4facfe;
            background: rgba(79, 172, 254, 0.02);
          }
          
          &.is-checked,
          &.is-indeterminate {
            border-color: #4facfe;
            background: rgba(79, 172, 254, 0.05);
          }
          
          .el-checkbox__label {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
          }
          
          .el-checkbox__input.is-checked .el-checkbox__inner,
          .el-checkbox__input.is-indeterminate .el-checkbox__inner {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            border-color: #4facfe;
          }
        }
      }
      
      // 角色网格
      .role-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
        margin-top: 20px;

        .role-item {
          padding: 20px;
          border: 2px solid transparent;
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          position: relative;
          overflow: hidden;
          
          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(79, 172, 254, 0.1), transparent);
            transition: left 0.5s ease;
          }

          &:hover {
            border-color: #4facfe;
            background: rgba(79, 172, 254, 0.02);
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(79, 172, 254, 0.15);
            
            &::before {
              left: 100%;
            }
          }
          
          &.is-checked {
            border-color: #4facfe;
            background: linear-gradient(135deg, rgba(79, 172, 254, 0.08) 0%, rgba(0, 242, 254, 0.08) 100%);
            box-shadow: 0 8px 24px rgba(79, 172, 254, 0.2);
          }

          :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            border-color: #4facfe;
          }

          :deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
            color: #4facfe;
          }
          
          :deep(.el-checkbox__label) {
            width: 100%;
            padding-left: 12px;
          }

          .role-content {
            .role-name {
              font-weight: 700;
              color: #1f2937;
              margin-bottom: 8px;
              font-size: 16px;
              display: flex;
              align-items: center;
              gap: 8px;
              
              &::before {
                content: '👤';
                font-size: 18px;
              }
            }

            .role-description {
              font-size: 13px;
              color: #6b7280;
              margin-bottom: 12px;
              line-height: 1.5;
            }

            .role-stats {
              display: flex;
              align-items: center;
              gap: 8px;
              
              .el-tag {
                border-radius: 20px;
                font-size: 11px;
                font-weight: 600;
                background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
                color: #0369a1;
                border: 1px solid #7dd3fc;
                padding: 4px 12px;
              }
            }
          }
        }
      }
    }

    // 权限摘要
    .permission-summary {
      margin-top: 28px;
      padding: 24px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      border-left: 4px solid #4facfe;
      
      h4 {
        margin: 0 0 16px 0;
        color: #1f2937;
        font-size: 18px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 8px;
        
        &::before {
          content: '📊';
          font-size: 20px;
        }
      }
      
      .summary-content {
        p {
          margin: 0 0 16px 0;
          color: #4b5563;
          font-size: 15px;
          line-height: 1.6;
          
          strong {
            color: #4facfe;
            font-weight: 700;
          }
        }

        .selected-roles {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 16px;

          .selected-role-tag {
            font-size: 12px;
            font-weight: 600;
            padding: 6px 12px;
            border-radius: 20px;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            border: none;
            box-shadow: 0 2px 8px rgba(79, 172, 254, 0.3);
            transition: all 0.3s ease;
            
            &:hover {
              transform: translateY(-1px) scale(1.05);
              box-shadow: 0 4px 12px rgba(79, 172, 254, 0.4);
            }
          }
        }
      }
    }
  }
}

// ================================
// 对话框底部按钮
// ================================
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  
  .el-button {
    padding: 12px 24px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }
    
    &.el-button--primary {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      border: none;
      
      &:hover {
        background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
        box-shadow: 0 8px 24px rgba(79, 172, 254, 0.4);
      }
    }
    
    &.el-button--default {
      background: white;
      border: 1px solid #e4e7ed;
      color: #606266;
      
      &:hover {
        background: #f8fafc;
        border-color: #4facfe;
        color: #4facfe;
      }
    }
  }
}

// ================================
// 全局复选框样式
// ================================
:deep(.el-checkbox) {
  align-items: flex-start;
  margin-bottom: 0;
  
  .el-checkbox__input {
    .el-checkbox__inner {
      border-radius: 6px;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: #4facfe;
      }
    }
    
    &.is-checked .el-checkbox__inner {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      border-color: #4facfe;
    }
    
    &.is-indeterminate .el-checkbox__inner {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      border-color: #4facfe;
    }
  }
  
  .el-checkbox__label {
    color: #374151;
    font-weight: 500;
    line-height: 1.5;
    transition: color 0.3s ease;
  }
}

// ================================
// 响应式设计
// ================================
@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 95% !important;
    margin: 16px auto !important;
  }
  
  .role-permission-setup {
    .permission-content {
      .permission-description {
        padding: 16px;
      }
      
      .role-selection .role-grid .role-item {
        padding: 16px;
      }
    }
  }
  
  .dialog-footer {
    flex-direction: column-reverse;
    gap: 12px;
    
    .el-button {
      width: 100%;
    }
  }
}
</style>