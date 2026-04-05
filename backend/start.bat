@echo off
echo ============================================
echo   CodeSleuth AI — Backend Startup
echo ============================================
call .venv\Scripts\activate
echo [1/2] Virtual environment activated.
echo [2/2] Starting uvicorn on http://localhost:8000
echo        Docs: http://localhost:8000/docs
echo.
python -m uvicorn main:app --reload --port 8000
