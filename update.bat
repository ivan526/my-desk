@echo off
echo ======================================
echo Update Script - Pull latest code
echo ======================================
echo.

echo [0/4] Stopping existing Node processes to release file locks...
taskkill /f /im node.exe >nul 2>&1
timeout /t 1 /nobreak >nul
echo Done.
echo.

echo [1/4] Pull latest code from GitHub...
call git pull
if %errorlevel% neq 0 (
    echo Pull failed, please check git config or network.
    pause
    exit /b 1
)

echo.
echo [2/4] Install new dependencies...
call npm install

echo.
echo [3/4] Clean old Prisma client...
if exist "node_modules\.prisma" rmdir /s /q "node_modules\.prisma"
echo Done.
echo.

echo [4/4] Update database schema...
call npx prisma generate
call npx prisma db push

echo.
echo ======================================
echo Update completed! Run start.bat to start server.
echo ======================================
pause
