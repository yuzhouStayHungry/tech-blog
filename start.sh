#!/bin/bash

echo "🚀 启动个人技术博客系统"

# 检查依赖
if ! command -v node &> /dev/null
then
    echo "❌ 请先安装 Node.js 18+"
    exit 1
fi

if ! command -v go &> /dev/null
then
    echo "❌ 请先安装 Go 1.21+"
    exit 1
fi

echo "📦 安装前端依赖..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ 前端依赖安装失败"
    exit 1
fi

echo "🏗️  构建前端静态文件..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 前端构建失败"
    exit 1
fi

echo "📦 安装后端依赖..."
cd ../backend
go mod tidy
if [ $? -ne 0 ]; then
    echo "❌ 后端依赖安装失败"
    exit 1
fi

echo "🚀 启动后端服务..."
go run main.go &
BACKEND_PID=$!

echo "🌐 启动前端开发服务器..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ 服务启动成功！"
echo "前端地址：http://localhost:3000"
echo "后端地址：http://localhost:8080"
echo "后台地址：http://localhost:8080/admin"
echo ""
echo "默认管理员账号：admin / admin123"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
trap "echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
