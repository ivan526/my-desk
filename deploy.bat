@echo off
chcp 65001 >nul
echo ======================================
echo 工作成果管理台 - 局域网部署脚本
echo ======================================
echo.

echo [1/7] 检查Node环境...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误：未找到Node.js，请先安装Node.js 18+
    pause
    exit /b 1
)
echo Node.js版本：
node -v
echo.

echo [2/6] 清理旧构建缓存...
if exist ".next" rmdir /s /q ".next"
echo 清理完成

echo [3/7] 安装依赖...
call npm install
if %errorlevel% neq 0 (
    echo 依赖安装失败，请检查网络或npm配置
    pause
    exit /b 1
)

:: 修复Next.js构建依赖缺失问题
if not exist "node_modules\baseline-browser-mapping" (
    echo 安装缺失的构建依赖...
    call npm install baseline-browser-mapping --no-save
)

echo [4/6] 清理旧Prisma客户端...
if exist "node_modules\.prisma" rmdir /s /q "node_modules\.prisma"

echo [5/6] 生成Prisma客户端...
call npx prisma generate
if %errorlevel% neq 0 (
    echo 生成Prisma客户端失败
    pause
    exit /b 1
)

echo [6/6] 同步数据库结构...
call npx prisma db push
if %errorlevel% neq 0 (
    echo 数据库同步失败
    pause
    exit /b 1
)

echo [7/7] 构建生产版本...
call npm run build
if %errorlevel% neq 0 (
    echo 构建失败，请检查代码错误
    pause
    exit /b 1
)

echo.
echo ======================================
echo 部署完成！
echo.
echo 👉 如果是首次部署，请新开一个终端窗口运行：npm run db:init-admin
echo    按照提示创建管理员账号
echo.
echo 🚀 启动服务命令：npm run start
echo.
echo 🌐 Web访问地址：
echo    本机访问：http://localhost:3000
echo    局域网访问：http://你的服务器IP:3000
echo.
echo 🔌 Agent连接地址：
echo    ws://你的服务器IP:3001
echo.
echo ⚠️  如果启动提示端口被占用，请关闭占用3000/3001端口的程序后重试
echo ======================================
echo.

set /p start_now="是否现在启动服务？(y/N): "
if /i "%start_now%"=="y" (
    echo 正在启动服务...
    call npm run start
) else (
    echo 部署完成，需要时手动运行 npm run start 启动服务
)
pause
