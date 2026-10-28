@echo off
title Legal Case Tracker
echo ========================================================
echo               Legal Case Tracker ⚖️
echo ========================================================
echo.
echo Launching your local Legal Case Tracker application...
echo Server running at http://localhost:5000
echo.

cd /d "%~dp0backend"
if not exist "venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found in backend\venv.
    echo Please create the venv or run: python -m venv venv
    pause
    exit /b 1
)

start http://localhost:5000
venv\Scripts\python.exe app.py
pause
