/**
 * 入口面板 API
 * 企业知识聚合平台 - 门户配置模块
 */

import { httpClient } from '@/utils/http'
import type { EntryPanel, CreateEntryPanelDto, UpdateEntryPanelDto } from '@/types/navigation'

export const entryPanelApi = {
  /**
   * 获取入口面板列表
   */
  async getPanels(params?: {
    page?: number
    pageSize?: number
    search?: string
    categoryId?: string
    status?: 'active' | 'inactive'
  }) {
    return httpClient.get<{
      data: EntryPanel[]
      total: number
      page: number
      pageSize: number
    }>('/api/entry-panels', { params })
  },

  /**
   * 获取入口面板详情
   */
  async getPanel(id: string) {
    return httpClient.get<{ data: EntryPanel }>(`/api/entry-panels/${id}`)
  },

  /**
   * 创建入口面板
   */
  async createPanel(data: CreateEntryPanelDto) {
    return httpClient.post<{ data: EntryPanel }>('/api/entry-panels', data)
  },

  /**
   * 更新入口面板
   */
  async updatePanel(id: string, data: UpdateEntryPanelDto) {
    return httpClient.put<{ data: EntryPanel }>(`/api/entry-panels/${id}`, data)
  },

  /**
   * 删除入口面板
   */
  async deletePanel(id: string) {
    return httpClient.delete(`/api/entry-panels/${id}`)
  },

  /**
   * 批量删除入口面板
   */
  async deletePanels(ids: string[]) {
    return httpClient.post('/api/entry-panels/batch-delete', { ids })
  },

  /**
   * 更新入口面板状态
   */
  async updatePanelStatus(id: string, status: 'active' | 'inactive') {
    return httpClient.patch(`/api/entry-panels/${id}/status`, { status })
  },

  /**
   * 更新入口面板排序
   */
  async updatePanelsOrder(panels: Array<{ id: string; order: number }>) {
    return httpClient.patch('/api/entry-panels/order', { panels })
  },

  /**
   * 获取入口面板分类
   */
  async getPanelCategories() {
    return httpClient.get<{
      data: Array<{
        id: string
        name: string
        code: string
        description?: string
        panelCount: number
      }>
    }>('/api/entry-panels/categories')
  },

  /**
   * 预览入口面板配置
   */
  async previewPanel(id: string) {
    return httpClient.get<{ data: EntryPanel }>(`/api/entry-panels/${id}/preview`)
  },

  /**
   * 复制入口面板
   */
  async copyPanel(id: string, newName: string) {
    return httpClient.post<{ data: EntryPanel }>(`/api/entry-panels/${id}/copy`, { 
      name: newName 
    })
  },

  /**
   * 获取入口面板使用统计
   */
  async getPanelStats(id: string, dateRange?: { start: string; end: string }) {
    return httpClient.get<{
      data: {
        clickCount: number
        uniqueVisitors: number
        clickTrend: Array<{ date: string; count: number }>
        topReferrers: Array<{ source: string; count: number }>
      }
    }>(`/api/entry-panels/${id}/stats`, { params: dateRange })
  }
}

// 默认导出
export default entryPanelApi