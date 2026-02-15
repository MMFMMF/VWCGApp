@echo off
setlocal EnableDelayedExpansion
title VWCGApp Development Server

echo ====================================
echo   VWCGApp Development Server
echo ====================================
echo.

:: Change to the script's directory
cd /d "%~dp0"

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Show Node.js version
echo Node.js version:
node --version
echo.

:: Check if npm is available
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not available!
    pause
    exit /b 1
)

:: Install dependencies if node_modules doesn't exist
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: npm install failed!
        pause
        exit /b 1
    )
    echo.
)

echo Starting development server...
echo.
echo ====================================
echo   App URL: http://localhost:5173
echo   Press Ctrl+C to stop
echo ====================================
echo.

:: Open browser after 3 seconds (in background)
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5173"

:: Start the dev server
call npm run dev

pause
