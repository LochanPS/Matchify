@echo off
echo ========================================
echo    STARTING MATCHIFY FRONTEND ONLY
echo    (UI Preview - No Backend)
echo ========================================
echo.

echo Starting frontend...
cd frontend
start "MATCHIFY Frontend" cmd /k "npm start"
echo.

echo ========================================
echo    MATCHIFY FRONTEND STARTING!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo.
echo Note: Some features won't work without backend
echo But you can see the UI and design!
echo.
timeout /t 5
start http://localhost:3000
