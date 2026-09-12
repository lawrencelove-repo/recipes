@echo off
cd /d "%~dp0"
echo Serving Recipes at http://127.0.0.1:8099/
echo Press Ctrl+C to stop.
start "" "http://127.0.0.1:8099/"
python -m http.server 8099
pause
