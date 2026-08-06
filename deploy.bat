@echo off
chcp 65001 >nul
echo ======================================
echo 工作成果管理台 - 局域网部署脚本
echo ======================================
echo.

echo [1/5] 安装生产依赖...
call npm install --production
if %errorlevel% neq 0 (
    echo 依赖安装失败
    pause
    exit /b 1
)

echo [2/5] 清理旧Prisma客户端...
if exist "node_modules\.prisma" rmdir /s /q "node_modules\.prisma"

echo [3/5] 生成Prisma客户端...
call npx prisma generate
if %errorlevel% neq 0 (
    echo 生成Prisma客户端失败
    pause
    exit /b 1
)

echo [4/5] 同步数据库...
call npx prisma db push
if %errorlevel% neq 0 (
    echo 数据库同步失败
    pause
    exit /b 1
)

echo [5/5] 构建生产版本...
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
echo 注意：如果3000/3001端口被占用，请手动停止对应进程
echo 启动服务命令：npm run start
echo.
echo Web访问地址：http://服务器IP:3000
echo WebSocket Agent地址：ws://服务器IP:3001
echo ======================================
echo.

echo 正在启动服务...
call npm run start
pause
