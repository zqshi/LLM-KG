// 简单的登录测试脚本
console.log('=== 登录测试开始 ===');

// 检查环境变量
console.log('VITE_STATIC_MODE:', import.meta.env.VITE_STATIC_MODE);
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);

// 模拟登录请求
const loginData = {
  username: 'admin',
  password: 'admin123'
};

console.log('发送登录请求:', loginData);

// 检查是否启用了静态模式
const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
  import.meta.env.VITE_API_BASE_URL === '' || 
  !import.meta.env.VITE_API_BASE_URL;

console.log('静态模式状态:', isStaticMode);

if (isStaticMode) {
  console.log('使用静态数据模式登录');
  // 模拟静态登录逻辑
  try {
    // 这里应该调用authApi.login
    console.log('模拟调用authApi.login');
    // 模拟成功响应
    const mockResponse = {
      code: 200,
      message: '登录成功',
      data: {
        token: 'static_token_test',
        user: {
          id: 1,
          username: 'admin',
          name: '系统管理员'
        },
        permissions: ['dashboard:view'],
        menus: []
      }
    };
    console.log('模拟登录响应:', mockResponse);
  } catch (error) {
    console.error('登录失败:', error);
  }
} else {
  console.log('使用真实API模式登录');
}

console.log('=== 登录测试结束 ===');