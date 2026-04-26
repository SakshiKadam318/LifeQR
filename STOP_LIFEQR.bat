@echo off
title LifeQR - Stopping...
color 0C
echo.
echo  ==========================================
echo   LIFEQR - STOPPING ALL SERVERS...
echo  ==========================================
echo.

taskkill /f /im "node.exe" >nul 2>&1
echo  All LifeQR servers stopped.
echo.
echo  You can now close this window.
timeout /t 3 /nobreak >nul
