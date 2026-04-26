@echo off
title LifeQR - Starting...
color 0A
echo.
echo  ==========================================
echo   LIFEQR - STARTING...
echo  ==========================================
echo.

:: Kill any old instances
taskkill /f /im "node.exe" >nul 2>&1

echo  Starting backend server (background)...
start /min "" cmd /c "cd /d %~dp0backend && npm run dev > ..\lifeqr-backend.log 2>&1"

echo  Waiting for backend to start...
timeout /t 4 /nobreak >nul

echo  Starting frontend (background)...
start /min "" cmd /c "cd /d %~dp0frontend && set BROWSER=none && npm start >> ..\lifeqr-frontend.log 2>&1"

echo  Waiting for frontend to start...
timeout /t 8 /nobreak >nul

echo  Opening LifeQR in your browser...
start http://localhost:3000

echo.
echo  ==========================================
echo   LIFEQR IS RUNNING!
echo   Open browser: http://localhost:3000
echo.
echo   To STOP the app, run: STOP_LIFEQR.bat
echo  ==========================================
echo.
echo  You can close this window now.
timeout /t 5 /nobreak >nul
