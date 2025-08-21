#!/bin/bash

echo "🚀 启动HTML存储管理器..."

# 创建数据目录
mkdir -p data

# 启动后端API
echo "📡 启动后端API服务..."
npm run dev:server &
SERVER_PID=$!

# 等待后端启动
sleep 3

# 启动前端开发环境
echo "🎨 启动前端开发环境..."
npm run dev

# 清理进程
trap "kill $SERVER_PID" EXIT