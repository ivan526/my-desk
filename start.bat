@echo off
chcp 65001 >nul
echo ======================================
echo Work Achievement Platform - Startup
echo ======================================
echo.

echo [1/5] Generate Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo Generate Prisma Client failed, please check error.
    echo If file is locked, please close other running node processes.
    pause
    exit /b 1
)

echo.
echo [2/5] Sync database schema...
call npx prisma db push
if %errorlevel% neq 0 (
    echo Database sync failed, please check error.
    pause
    exit /b 1
)

echo.
echo [3/5] Check database initialization...
if not exist "prisma\dev.db" (
    echo First run, seeding default data and admin account: admin / admin123 ...
    call npx tsx prisma/seed.ts
) else (
    echo Database exists, skip seeding.
)

echo.
echo [4/5] Install dependencies...
call npm install

echo.
echo [5/5] Starting dev server...
echo ======================================
echo Server started! Visit http://localhost:3000 or http://your-ip:3000
echo Default admin: admin / admin123 (first run only)
echo Press Ctrl+C to stop server
echo ======================================
echo.
call npm run dev
pause
