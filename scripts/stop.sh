#!/usr/bin/env bash
# AIMAGE stop script (Unix/macOS)
# Stops backend + frontend

echo "[AIMAGE] Stopping services..."

if [ -f /tmp/aimage_backend.pid ]; then
    PID=$(cat /tmp/aimage_backend.pid)
    kill "$PID" 2>/dev/null && echo "[AIMAGE] Backend stopped (PID $PID)"
    rm -f /tmp/aimage_backend.pid
fi

if [ -f /tmp/aimage_frontend.pid ]; then
    PID=$(cat /tmp/aimage_frontend.pid)
    kill "$PID" 2>/dev/null && echo "[AIMAGE] Frontend stopped (PID $PID)"
    rm -f /tmp/aimage_frontend.pid
fi

echo "[AIMAGE] All services stopped."
