@echo off
REM AIMAGE stop script (Windows)
REM Stops backend + frontend

echo [AIMAGE] Stopping services...

REM Kill uvicorn (backend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /PID %%a /F 2>nul
    echo [AIMAGE] Backend stopped (PID %%a)
)

REM Kill Next.js dev server (frontend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /PID %%a /F 2>nul
    echo [AIMAGE] Frontend stopped (PID %%a)
)

echo [AIMAGE] All services stopped.
