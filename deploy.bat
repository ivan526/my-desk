@echo off
chcp 65001 >nul
echo ======================================
echo 工作成果管理台 - 局域网部署脚本
echo ======================================
echo.

echo [1/6] 停止现有Node进程...
taskkill /f /im node.exe >nul 2>&1
timeout /t 1 /nobreak >nul
echo Done.
echo.

echo [2/6] 安装依赖...
call npm install --production
if %errorlevel% neq 0 (
    echo 依赖安装失败
    pause
    exit /b 1
)

echo [3/6] 清理旧Prisma客户端...
if exist "node_modules\.prisma" rmdir /s /q "node_modules\.prisma"

echo [4/6] 生成Prisma客户端...
call npx prisma generate
if %errorlevel% neq 0 (
    echo 生成Prisma客户端失败
    pause
    exit /b 1
)

echo [5/6] 同步数据库...
call npx prisma db push
if %errorlevel% neq 0 (
    echo 数据库同步失败
    pause
    exit /b 1
)

echo [6/6] 构建生产版本...
call npm run build
if %errorlevel% neq 0 (
    echo 构建失败
    pause
    exit /b 1
)

echo.
echo ======================================
echo 部署完成！
echo.
echo 启动服务：npm run start
echo 默认监听地址：http://0.0.0.0:3000
echo 局域网访问地址：http://你的服务器IP:3000
echo.
echo WebSocket Agent端口：3001
echo Agent连接地址：ws://你的服务器IP:3001
echo ======================================
echo.

call npm run start
pause
