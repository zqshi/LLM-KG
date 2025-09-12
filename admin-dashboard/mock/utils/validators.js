/**
 * 参数验证工具
 * 提供通用的参数验证功能
 */

// 基础验证函数
const validators = {
  // 必填验证
  required: (value, fieldName = '字段') => {
    if (value === null || value === undefined || value === '') {
      return `${fieldName}不能为空`;
    }
    return null;
  },

  // 字符串长度验证
  stringLength: (value, min = 0, max = Infinity, fieldName = '字段') => {
    if (typeof value !== 'string') {
      return `${fieldName}必须是字符串`;
    }
    if (value.length < min) {
      return `${fieldName}长度不能少于${min}个字符`;
    }
    if (value.length > max) {
      return `${fieldName}长度不能超过${max}个字符`;
    }
    return null;
  },

  // 数字验证
  number: (value, fieldName = '字段') => {
    if (isNaN(Number(value))) {
      return `${fieldName}必须是有效的数字`;
    }
    return null;
  },

  // 数字范围验证
  numberRange: (value, min = -Infinity, max = Infinity, fieldName = '字段') => {
    const num = Number(value);
    if (isNaN(num)) {
      return `${fieldName}必须是有效的数字`;
    }
    if (num < min) {
      return `${fieldName}不能小于${min}`;
    }
    if (num > max) {
      return `${fieldName}不能大于${max}`;
    }
    return null;
  },

  // 整数验证
  integer: (value, fieldName = '字段') => {
    const num = Number(value);
    if (isNaN(num) || !Number.isInteger(num)) {
      return `${fieldName}必须是整数`;
    }
    return null;
  },

  // 邮箱验证
  email: (value, fieldName = '邮箱') => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return `${fieldName}格式不正确`;
    }
    return null;
  },

  // 手机号验证
  phone: (value, fieldName = '手机号') => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(value)) {
      return `${fieldName}格式不正确`;
    }
    return null;
  },

  // URL验证
  url: (value, fieldName = 'URL') => {
    try {
      new URL(value);
      return null;
    } catch {
      return `${fieldName}格式不正确`;
    }
  },

  // 日期验证
  date: (value, fieldName = '日期') => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return `${fieldName}格式不正确`;
    }
    return null;
  },

  // 枚举值验证
  enum: (value, allowedValues = [], fieldName = '字段') => {
    if (!allowedValues.includes(value)) {
      return `${fieldName}必须是以下值之一: ${allowedValues.join(', ')}`;
    }
    return null;
  },

  // 数组验证
  array: (value, fieldName = '字段') => {
    if (!Array.isArray(value)) {
      return `${fieldName}必须是数组`;
    }
    return null;
  },

  // 数组长度验证
  arrayLength: (value, min = 0, max = Infinity, fieldName = '数组') => {
    if (!Array.isArray(value)) {
      return `${fieldName}必须是数组`;
    }
    if (value.length < min) {
      return `${fieldName}长度不能少于${min}`;
    }
    if (value.length > max) {
      return `${fieldName}长度不能超过${max}`;
    }
    return null;
  },

  // 对象验证
  object: (value, fieldName = '对象') => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return `${fieldName}必须是对象`;
    }
    return null;
  },

  // 布尔值验证
  boolean: (value, fieldName = '字段') => {
    if (typeof value !== 'boolean') {
      return `${fieldName}必须是布尔值`;
    }
    return null;
  },

  // 正则表达式验证
  pattern: (value, regex, fieldName = '字段', message = '格式不正确') => {
    if (!regex.test(value)) {
      return `${fieldName}${message}`;
    }
    return null;
  },

  // 自定义验证
  custom: (value, validator, fieldName = '字段') => {
    try {
      const result = validator(value);
      if (result === true || result === null || result === undefined) {
        return null;
      }
      return typeof result === 'string' ? result : `${fieldName}验证失败`;
    } catch (error) {
      return `${fieldName}验证出错: ${error.message}`;
    }
  }
};

// 验证器类
class Validator {
  constructor() {
    this.rules = {};
    this.errors = {};
  }

  // 添加验证规则
  rule(field, validations) {
    this.rules[field] = Array.isArray(validations) ? validations : [validations];
    return this;
  }

  // 执行验证
  validate(data) {
    this.errors = {};
    let hasErrors = false;

    Object.keys(this.rules).forEach(field => {
      const value = this.getNestedValue(data, field);
      const fieldRules = this.rules[field];
      
      for (const validation of fieldRules) {
        const error = this.executeValidation(value, validation, field);
        if (error) {
          this.errors[field] = error;
          hasErrors = true;
          break; // 只记录第一个错误
        }
      }
    });

    return !hasErrors;
  }

  // 执行单个验证
  executeValidation(value, validation, field) {
    if (typeof validation === 'function') {
      return validation(value, field);
    }

    if (typeof validation === 'object') {
      const { type, ...options } = validation;
      switch (type) {
        case 'required':
          return validators.required(value, options.message || field);
        case 'string':
          return validators.stringLength(value, options.min, options.max, options.message || field);
        case 'number':
          return validators.numberRange(value, options.min, options.max, options.message || field);
        case 'integer':
          return validators.integer(value, options.message || field);
        case 'email':
          return validators.email(value, options.message || field);
        case 'phone':
          return validators.phone(value, options.message || field);
        case 'url':
          return validators.url(value, options.message || field);
        case 'date':
          return validators.date(value, options.message || field);
        case 'enum':
          return validators.enum(value, options.values, options.message || field);
        case 'array':
          return validators.arrayLength(value, options.min, options.max, options.message || field);
        case 'object':
          return validators.object(value, options.message || field);
        case 'boolean':
          return validators.boolean(value, options.message || field);
        case 'pattern':
          return validators.pattern(value, options.regex, options.message || field, options.error);
        default:
          return null;
      }
    }

    return null;
  }

  // 获取嵌套属性值
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  // 获取错误信息
  getErrors() {
    return this.errors;
  }

  // 获取第一个错误
  getFirstError() {
    const fields = Object.keys(this.errors);
    return fields.length > 0 ? this.errors[fields[0]] : null;
  }

  // 清空验证规则和错误
  clear() {
    this.rules = {};
    this.errors = {};
    return this;
  }
}

// 便捷函数：创建验证器
const createValidator = () => {
  return new Validator();
};

// 便捷函数：快速验证
const quickValidate = (data, rules) => {
  const validator = new Validator();
  
  Object.keys(rules).forEach(field => {
    validator.rule(field, rules[field]);
  });
  
  const isValid = validator.validate(data);
  return {
    isValid,
    errors: validator.getErrors(),
    firstError: validator.getFirstError()
  };
};

// 常用验证规则预设
const commonRules = {
  // ID验证
  id: [
    { type: 'required' },
    value => validators.pattern(value, /^[0-9a-zA-Z-_]+$/, 'ID', '只能包含字母、数字、横线和下划线')
  ],

  // 用户名验证
  username: [
    { type: 'required' },
    { type: 'string', min: 3, max: 20 },
    value => validators.pattern(value, /^[a-zA-Z0-9_]+$/, '用户名', '只能包含字母、数字和下划线')
  ],

  // 密码验证
  password: [
    { type: 'required' },
    { type: 'string', min: 6, max: 20 },
    value => validators.pattern(value, /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/, '密码', '必须包含大小写字母和数字')
  ],

  // 名称验证
  name: [
    { type: 'required' },
    { type: 'string', min: 1, max: 50 }
  ],

  // 标题验证
  title: [
    { type: 'required' },
    { type: 'string', min: 1, max: 100 }
  ],

  // 描述验证
  description: [
    { type: 'string', max: 500 }
  ],

  // 状态验证
  status: [
    { type: 'required' },
    { type: 'enum', values: ['active', 'inactive', 'pending', 'draft', 'published', 'archived'] }
  ],

  // 分页参数验证
  page: [
    { type: 'integer' },
    { type: 'number', min: 1 }
  ],

  pageSize: [
    { type: 'integer' },
    { type: 'number', min: 1, max: 100 }
  ]
};

// 中间件：Express参数验证
const validateMiddleware = (rules) => {
  return (req, res, next) => {
    const validator = createValidator();
    
    Object.keys(rules).forEach(field => {
      validator.rule(field, rules[field]);
    });
    
    // 合并所有参数源
    const allParams = {
      ...req.params,
      ...req.query,
      ...req.body
    };
    
    if (!validator.validate(allParams)) {
      const errors = validator.getErrors();
      const firstError = validator.getFirstError();
      
      return res.status(400).json({
        code: 400,
        message: '参数验证失败',
        error: {
          field: Object.keys(errors)[0],
          detail: firstError,
          errors
        },
        timestamp: new Date().toISOString()
      });
    }
    
    next();
  };
};

module.exports = {
  validators,
  Validator,
  createValidator,
  quickValidate,
  commonRules,
  validateMiddleware
};