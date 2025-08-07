@echo off
echo 🚀 Starting Intus Corleone Backend Server...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Install dependencies if not present
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    copy server-package.json package.json
    npm install
)

REM Create files/allegati directory if it doesn't exist
if not exist "files\allegati" mkdir files\allegati

REM Start the server
echo 🌟 Starting server on port 3001...
echo 📁 Files will be saved to: files/allegati/
echo 🔗 Upload endpoint: http://localhost:3001/api/upload-allegato
echo 💻 Health check: http://localhost:3001/api/health
echo.
echo 🛑 Press Ctrl+C to stop the server
echo.

node server.js
pause
