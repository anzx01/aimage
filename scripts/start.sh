#!/usr/bin/env bash
# AIMAGE startup script (Unix/macOS)
# Starts backend + frontend

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "[AIMAGE] Starting backend..."
cd "$PROJECT_ROOT/backend"
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload &
BACKEND_PID=$!
echo "[AIMAGE] Backend PID: $BACKEND_PID"

echo "[AIMAGE] Starting frontend..."
cd "$PROJECT_ROOT/frontend"
pnpm dev -p 3002 &
FRONTEND_PID=$!
echo "[AIMAGE] Frontend PID: $FRONTEND_PID"

echo ""
echo "[AIMAGE] Services starting:"
echo "  Backend:  http://localhost:8001"
echo "  Frontend: http://localhost:3002"
echo ""

# Save PIDs for stop script
echo "$BACKEND_PID" > /tmp/aimage_backend.pid
echo "$FRONTEND_PID" > /tmp/aimage_frontend.pid

# Wait for background processes
wait
