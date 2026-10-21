@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Install Node.js 22.13 or newer, then run this file again.
  pause
  exit /b 1
)
if not exist node_modules (
  call npx --yes pnpm@11.25.0 install
  if errorlevel 1 (
    echo Dependency installation failed. Check the error above.
    pause
    exit /b 1
  )
)
echo Starting DHIYA. Open the localhost URL shown below.
call npx --yes pnpm@11.25.0 dev
pause
