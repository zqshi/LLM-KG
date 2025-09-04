#!/usr/bin/env node

/**
 * LLM+KG 缓存管理工具 - 命令行版本
 * 用于清理浏览器localStorage中的缓存数据
 */

const fs = require('fs');
const path = require('path');

// 颜色输出工具
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m', 
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function colorLog(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// 帮助信息
function showHelp() {
    colorLog('cyan', '\n🛠️  LLM+KG 缓存管理工具');
    colorLog('cyan', '=============================\n');
    
    console.log('用法:');
    console.log('  node scripts/clear-cache.js [选项]\n');
    
    console.log('选项:');
    console.log('  --menu, -m     仅清除菜单缓存');
    console.log('  --auth, -a     清除认证相关缓存');
    console.log('  --all, -A      清除所有缓存');
    console.log('  --help, -h     显示帮助信息');
    console.log('  --status, -s   查看缓存状态\n');
    
    console.log('示例:');
    console.log('  npm run clear-cache        # 交互式选择');
    console.log('  npm run clear-cache -- -m  # 仅清除菜单缓存'); 
    console.log('  npm run clear-cache -- -a  # 清除认证缓存');
    console.log('  npm run clear-cache -- -A  # 清除所有缓存\n');
}

// 生成清理脚本内容
function generateClearScript(type) {
    const scripts = {
        menu: `
// 清除菜单缓存
console.log('🔄 开始清除菜单缓存...');
localStorage.removeItem('menus');
console.log('✅ 菜单缓存已清除');
console.log('🔄 正在刷新页面...');
setTimeout(() => {
    window.location.href = '/dashboard';
}, 500);
        `,
        auth: `
// 清除认证缓存  
console.log('🔐 开始清除认证缓存...');
localStorage.removeItem('auth_token');
localStorage.removeItem('user_info');
localStorage.removeItem('permissions');
console.log('✅ 认证缓存已清除');
console.log('🔄 正在跳转到登录页...');
setTimeout(() => {
    window.location.href = '/login';
}, 500);
        `,
        all: `
// 清除所有缓存
console.log('🧹 开始清除所有缓存...');
const keys = Object.keys(localStorage);
console.log('📋 发现缓存项:', keys.length > 0 ? keys.join(', ') : '无');
localStorage.clear();
console.log('✅ 所有缓存已清除');
console.log('🔄 正在跳转到登录页...');
setTimeout(() => {
    window.location.href = '/login'; 
}, 500);
        `,
        status: `
// 检查缓存状态
console.log('📊 当前缓存状态:');
console.log('==================');
const cacheKeys = ['auth_token', 'user_info', 'permissions', 'menus'];
cacheKeys.forEach(key => {
    const exists = localStorage.getItem(key) !== null;
    const status = exists ? '✅ 存在' : '❌ 不存在';
    console.log(\`\${key.padEnd(15)} : \${status}\`);
});
console.log('==================');
        `
    };
    
    return scripts[type] || scripts.status;
}

// 创建并打开清理脚本
function createClearScript(type, typeName) {
    const scriptContent = generateClearScript(type);
    const tempFile = path.join(__dirname, '../temp-clear-cache.js');
    
    // 写入临时脚本文件
    fs.writeFileSync(tempFile, scriptContent.trim());
    
    colorLog('green', `✅ ${typeName}脚本已生成`);
    colorLog('yellow', '\n📋 使用方法:');
    colorLog('cyan', '1. 打开浏览器开发者工具 (F12)');
    colorLog('cyan', '2. 切换到 Console (控制台) 标签页');
    colorLog('cyan', '3. 复制以下代码并粘贴到控制台中按回车执行:\n');
    
    console.log('━'.repeat(50));
    console.log(scriptContent);
    console.log('━'.repeat(50));
    
    colorLog('yellow', '\n💡 提示: 执行完成后页面会自动跳转');
    
    // 清理临时文件
    setTimeout(() => {
        try {
            fs.unlinkSync(tempFile);
        } catch (e) {
            // 忽略删除失败
        }
    }, 1000);
}

// 交互式选择
function interactiveMode() {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    colorLog('cyan', '\n🛠️  LLM+KG 缓存管理工具');
    colorLog('cyan', '=============================\n');
    
    console.log('请选择要执行的操作:');
    console.log('1. 🔄 仅清除菜单缓存 (适用于导航菜单未更新)');
    console.log('2. 🔐 清除认证缓存 (适用于权限或用户信息异常)');
    console.log('3. 🧹 清除所有缓存 (彻底清理，需要重新登录)');
    console.log('4. 📊 查看缓存状态');
    console.log('5. ❌ 退出\n');
    
    rl.question('请输入选项 (1-5): ', (answer) => {
        switch (answer.trim()) {
            case '1':
                createClearScript('menu', '菜单缓存清理');
                break;
            case '2':
                createClearScript('auth', '认证缓存清理');
                break;
            case '3':
                createClearScript('all', '全部缓存清理');
                break;
            case '4':
                createClearScript('status', '缓存状态检查');
                break;
            case '5':
                colorLog('green', '👋 再见！');
                break;
            default:
                colorLog('red', '❌ 无效选项，请重新运行');
                break;
        }
        rl.close();
    });
}

// 主函数
function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        showHelp();
        return;
    }
    
    if (args.includes('--menu') || args.includes('-m')) {
        createClearScript('menu', '菜单缓存清理');
    } else if (args.includes('--auth') || args.includes('-a')) {
        createClearScript('auth', '认证缓存清理');
    } else if (args.includes('--all') || args.includes('-A')) {
        createClearScript('all', '全部缓存清理');
    } else if (args.includes('--status') || args.includes('-s')) {
        createClearScript('status', '缓存状态检查');
    } else {
        // 没有参数时进入交互模式
        interactiveMode();
    }
}

// 检查是否在scripts目录下运行
if (!fs.existsSync(path.join(__dirname, '../package.json'))) {
    colorLog('red', '❌ 请在项目根目录下运行此脚本');
    process.exit(1);
}

main();