@echo off

cd /d E:\real-time-object-detection-api

call venv\Scripts\activate

start cmd /k "cd /d E:\real-time-object-detection-api && venv\Scripts\activate && uvicorn app.main:app --host 0.0.0.0 --port 8000"

start cmd /k "cd /d E:\real-time-object-detection-api\frontend && npm run dev -- --host"

timeout /t 6 > nul

start http://localhost:5173