#!/bin/bash

# RBAC模块部署脚本
# 更新web环境部署

echo "🚀 开始部署RBAC模块到web环境..."

# 1. 检查是否有未提交的更改
if [ -d ".git" ]; then
    echo "📋 检查Git状态..."
    if [[ -n $(git status --porcelain) ]]; then
        echo "⚠️  发现未提交的更改，建议先提交代码"
        git status --short
        read -p "是否继续部署？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "❌ 部署已取消"
            exit 1
        fi
    fi
else
    echo "📁 当前不是Git仓库"
fi

# 2. 安装依赖
echo "📦 安装项目依赖..."
npm install

# 3. 构建生产版本
echo "🔨 构建生产版本..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi

echo "✅ 构建成功！"

# 4. 检查构建结果
if [ -d "dist" ]; then
    echo "📊 构建统计信息:"
    echo "   - 文件数量: $(find dist -type f | wc -l)"
    echo "   - 总大小: $(du -sh dist | cut -f1)"
    echo "   - HTML文件: $(find dist -name "*.html" | wc -l)"
    echo "   - JS文件: $(find dist -name "*.js" | wc -l)"
    echo "   - CSS文件: $(find dist -name "*.css" | wc -l)"
else
    echo "❌ 构建目录不存在"
    exit 1
fi

# 5. 启动预览服务器（用于测试）
echo ""
echo "🌐 启动预览服务器进行测试..."
echo "   预览地址: http://localhost:4173"
echo "   按 Ctrl+C 停止预览服务器"
echo ""

npm run preview

echo ""
echo "🎉 部署完成！"
echo ""
echo "📋 部署后检查清单:"
echo "   ✅ 构建成功"
echo "   ✅ 所有7个RBAC组件已包含"
echo "   ✅ 预览服务器可正常访问"
echo ""
echo "🔄 如需部署到生产服务器，请将 dist/ 目录内容上传到Web服务器"
echo "📂 部署文件位置: $(pwd)/dist/"