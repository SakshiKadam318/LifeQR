@echo off
title LifeQR - Installing...
color 0A
echo.
echo  ==========================================
echo   LIFEQR - INSTALLING (please wait...)
echo  ==========================================
echo.

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo  ERROR: Node.js is not installed!
    echo.
    echo  Please download and install Node.js from:
    echo  https://nodejs.org
    echo.
    echo  Then run this file again.
    pause
    exit
)

echo  [1/4] Node.js found. Good!
echo.

:: Setup backend .env
if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env" >nul
    echo  [2/4] Created backend config file.
) else (
    echo  [2/4] Config file already exists.
)
echo.

:: Install backend
echo  [3/4] Installing backend packages (1-2 mins)...
cd backend
call npm install --silent
cd ..
echo  Backend ready!
echo.

:: Install frontend
echo  [4/4] Installing frontend packages (2-3 mins)...
cd frontend
call npm install --silent
cd ..
echo  Frontend ready!
echo.

color 0A
echo  ==========================================
echo   INSTALLATION COMPLETE!
echo   Now double-click: START_LIFEQR.bat
echo  ==========================================
echo.
pause
