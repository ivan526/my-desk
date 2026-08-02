@echo off
chcp 65001 >nul
echo ======================================
echo 代码更新脚本 - 拉取最新代码并同步数据库
echo ======================================
echo.

echo [1/3] 拉取最新代码...
call git pull
if %errorlevel% neq 0 (
    echo 拉取代码失败，请检查网络或Git配置
    pause
    exit /b 1
)

echo.
echo [2/3] 安装新依赖...
call npm install

echo.
echo [3/3] 更新数据库结构...
call npm run db:generate
call npm run db:push

echo.
echo ======================================
echo 更新完成！可以运行 start.bat 启动服务
echo ======================================
pause
