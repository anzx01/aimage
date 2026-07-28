@echo off
REM AIMAGE startup script (Windows)
REM Starts backend + frontend

echo [AIMAGE] Starting backend...
cd /d "%~dp0..\backend"
start "AIMAGE Backend" cmd /k "python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload"

echo [AIMAGE] Starting frontend...
cd /d "%~dp0..\frontend"
start "AIMAGE Frontend" cmd /k "pnpm dev -p 3002"

echo [AIMAGE] Services starting:
echo   Backend:  http://localhost:8001
echo   Frontend: http://localhost:3002
echo.
echo Close the backend and frontend windows to stop the services.
