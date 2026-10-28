@echo off
title Build Legal Case Tracker Frontend
echo ========================================================
echo        Building Frontend Assets (Vite Production)
echo ========================================================
echo.
cd /d "%~dp0frontend"
call npm run build
echo.
echo Build complete! The backend will now serve the updated files.
pause
