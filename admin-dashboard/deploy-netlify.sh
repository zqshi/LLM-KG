#!/bin/bash

# 部署管理后台到Netlify的脚本

echo "开始部署管理后台到Netlify..."

# 检查是否安装了Netlify CLI
if ! command -v netlify &> /dev/null
then
    echo "Netlify CLI 未安装，正在安装..."
    npm install -g netlify-cli
fi

# 进入管理后台目录
cd "$(dirname "$0")"

# 设置环境变量
export VITE_STATIC_MODE=true
export VITE_API_BASE_URL=

# 安装依赖
echo "安装依赖..."
npm ci

# 构建项目
echo "构建项目..."
npm run build

# 检查构建是否成功
if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    echo "构建失败或dist目录为空"
    exit 1
fi

# 部署到Netlify
echo "部署到Netlify..."
netlify deploy --prod --dir=dist

echo "部署完成！"