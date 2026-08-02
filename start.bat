@echo off
chcp 65001 >nul
echo ======================================
echo 工作成果管理台 - 一键启动脚本
echo ======================================
echo.

echo [1/5] 生成Prisma客户端...
call npm run db:generate
if %errorlevel% neq 0 (
    echo 生成Prisma客户端失败，请检查错误信息
    pause
    exit /b 1
)

echo.
echo [2/5] 同步数据库结构...
call npm run db:push
if %errorlevel% neq 0 (
    echo 数据库同步失败，请检查错误信息
    pause
    exit /b 1
)

echo.
echo [3/5] 检查是否需要初始化管理员...
if not exist "prisma\dev.db" (
    echo 首次运行，导入种子数据并创建默认管理员账号 admin / admin123 ...
    call npm run db:seed
) else (
    echo 数据库已存在，跳过种子数据导入
)

echo.
echo [4/5] 安装依赖（如果有新依赖）...
call npm install

echo.
echo [5/5] 启动开发服务器...
echo ======================================
echo 启动成功！访问 http://localhost:3000
echo 默认管理员账号：admin / admin123（如果是首次运行）
echo ======================================
echo.
call npm run dev
pause
