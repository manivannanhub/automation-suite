@echo off
setlocal

cd /d "%~dp0"

if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    exit /b 1
  )
)

start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3005"

npm start
