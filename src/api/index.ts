// 统一导出API
export { http } from './request'
export { authApi } from './auth'
export { contentApi } from './content'
export { quotationApi } from './quotation'
export { fleaMarketApi } from './fleaMarket'
export { 
  userApi, 
  roleApi, 
  permissionApi, 
  groupApi, 
  syncApi 
} from './rbac'
export { 
  globalAuditApi,
  systemConfigApi, 
  systemHealthApi
} from './system'

// 导入所有API
import { authApi } from './auth'
import { contentApi } from './content'
import { quotationApi } from './quotation'
import { fleaMarketApi } from './fleaMarket'
import { 
  userApi, 
  roleApi, 
  permissionApi, 
  groupApi, 
  syncApi 
} from './rbac'
import { 
  globalAuditApi,
  systemConfigApi, 
  systemHealthApi
} from './system'

// 导出所有API的统一对象
export const api = {
  auth: authApi,
  content: contentApi,
  quotation: quotationApi,
  fleaMarket: fleaMarketApi,
  user: userApi,
  role: roleApi,
  permission: permissionApi,
  group: groupApi,
  sync: syncApi,
  // 系统API
  globalAudit: globalAuditApi,
  systemConfig: systemConfigApi,
  systemHealth: systemHealthApi
}

export default api