/**
 * 分页处理工具
 * 提供分页、排序、过滤等数据处理功能
 */

const config = require('../config');

// 分页处理器
class Paginator {
  constructor(data = [], options = {}) {
    this.data = Array.isArray(data) ? data : [];
    this.options = {
      defaultPage: options.defaultPage || config.pagination.defaultPage,
      defaultPageSize: options.defaultPageSize || config.pagination.defaultPageSize,
      maxPageSize: options.maxPageSize || config.pagination.maxPageSize,
      ...options
    };
  }

  // 应用过滤器
  filter(filters = {}) {
    if (!filters || Object.keys(filters).length === 0) {
      return this;
    }

    this.data = this.data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        
        // 支持点号路径访问嵌套属性
        const itemValue = this.getNestedValue(item, key);
        
        // 字符串模糊匹配
        if (typeof itemValue === 'string' && typeof value === 'string') {
          return itemValue.toLowerCase().includes(value.toLowerCase());
        }
        
        // 数组包含检查
        if (Array.isArray(itemValue)) {
          return itemValue.some(v => 
            typeof v === 'string' ? v.toLowerCase().includes(value.toLowerCase()) : v === value
          );
        }
        
        // 精确匹配
        return itemValue === value;
      });
    });
    
    return this;
  }

  // 应用搜索
  search(keyword = '', fields = []) {
    if (!keyword || fields.length === 0) {
      return this;
    }

    const searchLower = keyword.toLowerCase();
    this.data = this.data.filter(item => {
      return fields.some(field => {
        const value = this.getNestedValue(item, field);
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchLower);
        }
        if (Array.isArray(value)) {
          return value.some(v => 
            typeof v === 'string' && v.toLowerCase().includes(searchLower)
          );
        }
        return false;
      });
    });

    return this;
  }

  // 应用排序
  sort(sortBy = 'createdAt', sortOrder = 'desc') {
    if (!sortBy) return this;

    this.data.sort((a, b) => {
      const aValue = this.getNestedValue(a, sortBy);
      const bValue = this.getNestedValue(b, sortBy);
      
      let comparison = 0;
      
      // 处理不同数据类型的比较
      if (aValue === null || aValue === undefined) {
        comparison = 1;
      } else if (bValue === null || bValue === undefined) {
        comparison = -1;
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        // 转换为字符串比较
        comparison = String(aValue).localeCompare(String(bValue));
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return this;
  }

  // 应用分页
  paginate(page = 1, pageSize = null) {
    const currentPage = Math.max(1, parseInt(page) || 1);
    const currentPageSize = Math.min(
      this.options.maxPageSize,
      Math.max(1, parseInt(pageSize) || this.options.defaultPageSize)
    );
    
    const total = this.data.length;
    const totalPages = Math.ceil(total / currentPageSize);
    const startIndex = (currentPage - 1) * currentPageSize;
    const endIndex = startIndex + currentPageSize;
    
    const list = this.data.slice(startIndex, endIndex);
    
    return {
      list,
      total,
      page: currentPage,
      pageSize: currentPageSize,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, total)
    };
  }

  // 获取嵌套属性值
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  // 获取所有数据
  getData() {
    return this.data;
  }

  // 获取数据总数
  getTotal() {
    return this.data.length;
  }
}

// 便捷函数：创建分页器
const createPaginator = (data, options = {}) => {
  return new Paginator(data, options);
};

// 便捷函数：快速分页
const quickPaginate = (data = [], query = {}) => {
  const {
    page = 1,
    pageSize = config.pagination.defaultPageSize,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    search = '',
    searchFields = ['name', 'title'],
    ...filters
  } = query;

  const paginator = new Paginator(data);
  
  // 应用过滤
  if (Object.keys(filters).length > 0) {
    paginator.filter(filters);
  }
  
  // 应用搜索
  if (search) {
    paginator.search(search, searchFields);
  }
  
  // 应用排序
  paginator.sort(sortBy, sortOrder);
  
  // 应用分页
  return paginator.paginate(page, pageSize);
};

// 数据范围过滤器
const dateRangeFilter = (data, dateField = 'createdAt', startDate = null, endDate = null) => {
  if (!startDate && !endDate) return data;
  
  return data.filter(item => {
    const itemDate = new Date(item[dateField]);
    if (isNaN(itemDate.getTime())) return true;
    
    if (startDate && itemDate < new Date(startDate)) return false;
    if (endDate && itemDate > new Date(endDate)) return false;
    
    return true;
  });
};

// 状态过滤器
const statusFilter = (data, status = null, statusField = 'status') => {
  if (!status) return data;
  
  if (Array.isArray(status)) {
    return data.filter(item => status.includes(item[statusField]));
  }
  
  return data.filter(item => item[statusField] === status);
};

// 数值范围过滤器
const numberRangeFilter = (data, field, min = null, max = null) => {
  if (min === null && max === null) return data;
  
  return data.filter(item => {
    const value = Number(item[field]);
    if (isNaN(value)) return true;
    
    if (min !== null && value < min) return false;
    if (max !== null && value > max) return false;
    
    return true;
  });
};

// 关键词高亮处理
const highlightKeyword = (text, keyword, className = 'highlight') => {
  if (!text || !keyword) return text;
  
  const regex = new RegExp(`(${keyword})`, 'gi');
  return text.replace(regex, `<span class="${className}">$1</span>`);
};

// 排序配置生成器
const createSortConfig = (allowedFields = [], defaultField = 'createdAt', defaultOrder = 'desc') => {
  return {
    allowedFields,
    defaultField,
    defaultOrder,
    validate: (sortBy, sortOrder) => {
      const validSortBy = allowedFields.includes(sortBy) ? sortBy : defaultField;
      const validSortOrder = ['asc', 'desc'].includes(sortOrder) ? sortOrder : defaultOrder;
      return { sortBy: validSortBy, sortOrder: validSortOrder };
    }
  };
};

// 过滤配置生成器
const createFilterConfig = (allowedFilters = [], searchFields = []) => {
  return {
    allowedFilters,
    searchFields,
    validate: (filters) => {
      const validFilters = {};
      allowedFilters.forEach(field => {
        if (filters[field] !== undefined && filters[field] !== '') {
          validFilters[field] = filters[field];
        }
      });
      return validFilters;
    }
  };
};

module.exports = {
  Paginator,
  createPaginator,
  quickPaginate,
  dateRangeFilter,
  statusFilter,
  numberRangeFilter,
  highlightKeyword,
  createSortConfig,
  createFilterConfig
};