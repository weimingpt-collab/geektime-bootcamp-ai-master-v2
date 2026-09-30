#!/bin/bash

echo "Starting Project Alpha..."

# Start backend
echo "Starting backend..."
cd backend || exit
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend to start
sleep 2

# Start frontend
echo "Starting frontend..."
cd ../frontend || exit
yarn preview --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!

echo ""
echo "=========================================="
echo "Project Alpha is running!"
echo "=========================================="
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:8000"
echo "API Docs: http://localhost:8000/api/v1/docs"
echo ""
echo "Press Ctrl+C to stop"
echo "=========================================="

# Wait for Ctrl+C
trap 'echo ""; echo "Stopping servers..."; kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null; exit' INT
wait
