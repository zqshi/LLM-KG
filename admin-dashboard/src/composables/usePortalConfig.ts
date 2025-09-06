/**
 * 门户配置管理组合式API
 * 提供统一的配置管理逻辑和状态管理
 */

import { computed, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { navigationApi } from '@/api/navigation'
import { entryPanelApi } from '@/api/entryPanel'
import type { NavigationItem, EntryPanel, ConfigVersion } from '@/types/navigation'
import { usePerformanceMonitor } from '@/utils/performance-monitor'
import { debounce } from 'lodash-es'

interface ConfigState {
  navigationData: NavigationItem[]
  entryPanelData: EntryPanel[]
  currentVersion: ConfigVersion | null
  isDirty: boolean
  loading: boolean
  error: string | null
}

export function usePortalConfig() {
  const { monitorApiRequest, recordInteraction, recordError } = usePerformanceMonitor()

  // 状态管理
  const state = reactive<ConfigState>({
    navigationData: [],
    entryPanelData: [],
    currentVersion: null,
    isDirty: false,
    loading: false,
    error: null
  })

  // 计算属性
  const activeNavigations = computed(() => 
    state.navigationData.filter(nav => nav.status === 'active')
  )

  const activePanels = computed(() => 
    state.entryPanelData.filter(panel => panel.status === 'active')
  )

  const totalItems = computed(() => 
    state.navigationData.length + 
    state.entryPanelData.reduce((sum, panel) => sum + (panel.items?.length || 0), 0)
  )

  const configSummary = computed(() => ({
    navigationCount: state.navigationData.length,
    activeNavigationCount: activeNavigations.value.length,
    panelCount: state.entryPanelData.length,
    activePanelCount: activePanels.value.length,
    totalItemCount: totalItems.value,
    lastModified: state.currentVersion?.updated_at || null
  }))

  // 数据加载
  const loadData = async () => {
    state.loading = true
    state.error = null

    try {
      const [navResponse, panelResponse] = await Promise.all([
        monitorApiRequest('navigation-list', () => navigationApi.getNavigations()),
        monitorApiRequest('entry-panel-list', () => entryPanelApi.getPanels())
      ])

      state.navigationData = navResponse.data || []
      state.entryPanelData = panelResponse.data || []
      
      recordInteraction('data-loaded', 'portal-config')
      ElMessage.success('配置数据加载成功')
    } catch (error) {
      state.error = error instanceof Error ? error.message : '加载失败'
      recordError(error as Error, 'load-data')
      ElMessage.error('配置数据加载失败')
    } finally {
      state.loading = false
    }
  }

  // 保存配置（草稿）
  const saveConfig = async () => {
    if (!state.isDirty) {
      ElMessage.info('没有需要保存的更改')
      return
    }

    state.loading = true

    try {
      // 批量保存导航和面板配置
      await Promise.all([
        monitorApiRequest('save-navigation', () => 
          navigationApi.batchUpdateNavigations(state.navigationData)
        ),
        monitorApiRequest('save-entry-panels', () => 
          entryPanelApi.batchUpdatePanels(state.entryPanelData)
        )
      ])

      state.isDirty = false
      recordInteraction('config-saved', 'draft')
      ElMessage.success('配置已保存为草稿')
    } catch (error) {
      recordError(error as Error, 'save-config')
      ElMessage.error('保存配置失败')
      throw error
    } finally {
      state.loading = false
    }
  }

  // 发布配置
  const publishConfig = async () => {
    try {
      await ElMessageBox.confirm(
        '发布后配置将立即生效，是否确认发布？',
        '确认发布',
        {
          confirmButtonText: '确认发布',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      state.loading = true

      // 先保存草稿
      if (state.isDirty) {
        await saveConfig()
      }

      // 发布配置
      await monitorApiRequest('publish-config', async () => {
        const publishData = {
          navigationData: state.navigationData,
          entryPanelData: state.entryPanelData,
          publishTime: new Date().toISOString()
        }
        
        // 这里调用发布API
        return await fetch('/api/portal-config/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(publishData)
        }).then(res => res.json())
      })

      recordInteraction('config-published')
      ElMessage.success('配置发布成功')
      
      // 重新加载数据以获取最新状态
      await loadData()
    } catch (error) {
      if (error !== 'cancel') {
        recordError(error as Error, 'publish-config')
        ElMessage.error('发布配置失败')
      }
    } finally {
      state.loading = false
    }
  }

  // 创建快照
  const createSnapshot = async (name: string, description?: string) => {
    state.loading = true

    try {
      const snapshotData = {
        name,
        description,
        navigationData: state.navigationData,
        entryPanelData: state.entryPanelData,
        createdAt: new Date().toISOString()
      }

      await monitorApiRequest('create-snapshot', () =>
        fetch('/api/portal-config/snapshots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(snapshotData)
        }).then(res => res.json())
      )

      recordInteraction('snapshot-created')
      ElMessage.success('快照创建成功')
    } catch (error) {
      recordError(error as Error, 'create-snapshot')
      ElMessage.error('创建快照失败')
      throw error
    } finally {
      state.loading = false
    }
  }

  // 回滚到指定版本
  const rollbackToVersion = async (versionId: number) => {
    try {
      await ElMessageBox.confirm(
        '回滚操作将覆盖当前配置，是否确认回滚？',
        '确认回滚',
        {
          confirmButtonText: '确认回滚',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      state.loading = true

      const rollbackData = await monitorApiRequest('rollback-version', () =>
        fetch(`/api/portal-config/rollback/${versionId}`, {
          method: 'POST'
        }).then(res => res.json())
      )

      state.navigationData = rollbackData.navigationData || []
      state.entryPanelData = rollbackData.entryPanelData || []
      state.isDirty = true

      recordInteraction('config-rollback', `version-${versionId}`)
      ElMessage.success('回滚成功')
    } catch (error) {
      if (error !== 'cancel') {
        recordError(error as Error, 'rollback-version')
        ElMessage.error('回滚失败')
      }
    } finally {
      state.loading = false
    }
  }

  // 标记为已修改
  const markDirty = () => {
    state.isDirty = true
    recordInteraction('config-modified')
  }

  // 标记为已保存
  const markClean = () => {
    state.isDirty = false
  }

  // 自动保存机制
  const autoSave = debounce(async () => {
    if (state.isDirty && !state.loading) {
      try {
        await saveConfig()
        console.log('自动保存成功')
      } catch (error) {
        console.error('自动保存失败:', error)
      }
    }
  }, 30000) // 30秒自动保存

  // 监听数据变化，触发自动保存
  watch(
    [() => state.navigationData, () => state.entryPanelData],
    () => {
      if (!state.loading) {
        markDirty()
        autoSave()
      }
    },
    { deep: true }
  )

  // 导航管理相关方法
  const navigationActions = {
    addNavigation: (navigation: Omit<NavigationItem, 'id'>) => {
      const newNav: NavigationItem = {
        ...navigation,
        id: Date.now(), // 临时ID，保存时会被服务器分配的ID替换
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      state.navigationData.push(newNav)
      markDirty()
      recordInteraction('navigation-added')
    },

    updateNavigation: (id: number, updates: Partial<NavigationItem>) => {
      const index = state.navigationData.findIndex(nav => nav.id === id)
      if (index > -1) {
        state.navigationData[index] = {
          ...state.navigationData[index],
          ...updates,
          updated_at: new Date().toISOString()
        }
        markDirty()
        recordInteraction('navigation-updated')
      }
    },

    deleteNavigation: async (id: number) => {
      try {
        await ElMessageBox.confirm(
          '删除后不可恢复，是否确认删除？',
          '确认删除',
          {
            confirmButtonText: '确认删除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const index = state.navigationData.findIndex(nav => nav.id === id)
        if (index > -1) {
          state.navigationData.splice(index, 1)
          markDirty()
          recordInteraction('navigation-deleted')
          ElMessage.success('删除成功')
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    },

    reorderNavigations: (newOrder: NavigationItem[]) => {
      state.navigationData = newOrder.map((nav, index) => ({
        ...nav,
        sortOrder: index,
        updated_at: new Date().toISOString()
      }))
      markDirty()
      recordInteraction('navigation-reordered')
    }
  }

  // 入口面板管理相关方法
  const panelActions = {
    addPanel: (panel: Omit<EntryPanel, 'id'>) => {
      const newPanel: EntryPanel = {
        ...panel,
        id: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      state.entryPanelData.push(newPanel)
      markDirty()
      recordInteraction('panel-added')
    },

    updatePanel: (id: number, updates: Partial<EntryPanel>) => {
      const index = state.entryPanelData.findIndex(panel => panel.id === id)
      if (index > -1) {
        state.entryPanelData[index] = {
          ...state.entryPanelData[index],
          ...updates,
          updated_at: new Date().toISOString()
        }
        markDirty()
        recordInteraction('panel-updated')
      }
    },

    deletePanel: async (id: number) => {
      try {
        await ElMessageBox.confirm(
          '删除面板将同时删除其下所有入口项，是否确认删除？',
          '确认删除',
          {
            confirmButtonText: '确认删除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const index = state.entryPanelData.findIndex(panel => panel.id === id)
        if (index > -1) {
          state.entryPanelData.splice(index, 1)
          markDirty()
          recordInteraction('panel-deleted')
          ElMessage.success('删除成功')
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }
  }

  // 预览相关方法
  const previewActions = {
    generatePreviewConfig: () => ({
      navigation: activeNavigations.value.map(nav => ({
        ...nav,
        children: nav.children?.filter(child => child.status === 'active')
      })),
      entryPanels: activePanels.value.map(panel => ({
        ...panel,
        items: panel.items?.filter(item => item.status === 'active')
      })),
      timestamp: Date.now()
    }),

    openPreview: () => {
      const previewUrl = '/portal-config/preview'
      window.open(previewUrl, '_blank')
      recordInteraction('preview-opened')
    }
  }

  return {
    // 状态
    state: readonly(state),
    
    // 计算属性
    activeNavigations,
    activePanels,
    totalItems,
    configSummary,
    
    // 基础操作
    loadData,
    saveConfig,
    publishConfig,
    createSnapshot,
    rollbackToVersion,
    markDirty,
    markClean,
    
    // 导航操作
    ...navigationActions,
    
    // 面板操作
    ...panelActions,
    
    // 预览操作
    ...previewActions
  }
}

export type PortalConfigComposable = ReturnType<typeof usePortalConfig>