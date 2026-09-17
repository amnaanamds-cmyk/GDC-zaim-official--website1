@echo off
REM Double-click this file on Windows to set up and start the site.
REM Equivalent to: npm install && npm run setup && npm run dev
cd /d "%~dp0"

echo.
echo   Government Degree College Zaim - Website ^& Management Portal
echo   ===========================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo   Node.js is not installed. Get it from https://nodejs.org ^(LTS version^),
  echo   then run this again.
  echo.
  pause
  exit /b 1
)

if not exist node_modules (
  echo   Installing dependencies ^(first run only, this takes a few minutes^)...
  call npm install
  if errorlevel 1 (
    echo.
    echo   Installation failed. The message above says why.
    pause
    exit /b 1
  )
)

call npm run setup
if errorlevel 1 (
  echo.
  echo   Setup did not finish. The message above says why.
  pause
  exit /b 1
)

echo.
echo   Starting the site. Open http://localhost:3000 in your browser.
echo   Press Ctrl+C in this window to stop it.
echo.
call npm run dev
pause
