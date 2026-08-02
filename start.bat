@echo off
echo ======================================
echo Work Achievement Platform - Startup
echo ======================================
echo.

echo [1/5] Generate Prisma Client...
call npm run db:generate
if %errorlevel% neq 0 (
    echo Generate Prisma Client failed, please check error.
    pause
    exit /b 1
)

echo.
echo [2/5] Sync database schema...
call npm run db:push
if %errorlevel% neq 0 (
    echo Database sync failed, please check error.
    pause
    exit /b 1
)

echo.
echo [3/5] Check database initialization...
if not exist "prisma\dev.db" (
    echo First run, seeding default data and admin account: admin / admin123 ...
    call npm run db:seed
) else (
    echo Database exists, skip seeding.
)

echo.
echo [4/5] Install dependencies...
call npm install

echo.
echo [5/5] Starting dev server...
echo ======================================
echo Server started! Visit http://localhost:3000
echo Default admin: admin / admin123 (first run only)
echo ======================================
echo.
call npm run dev
pause
