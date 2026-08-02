@echo off
echo ======================================
echo Update Script - Pull latest code
echo ======================================
echo.

echo [1/3] Pull latest code from GitHub...
call git pull
if %errorlevel% neq 0 (
    echo Pull failed, please check git config or network.
    pause
    exit /b 1
)

echo.
echo [2/3] Install new dependencies...
call npm install

echo.
echo [3/3] Update database schema...
call npm run db:generate
call npm run db:push

echo.
echo ======================================
echo Update completed! Run start.bat to start server.
echo ======================================
pause
