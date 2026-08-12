@echo off
TITLE Krishna Polymer Industry - Django Launcher
COLOR 0B

echo ===============================================================================
echo            KRISHNA POLYMER INDUSTRY - APPLICATION LAUNCHER
echo ===============================================================================
echo.

set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

echo [1/2] Applying database migrations...
python manage.py migrate

echo [2/2] Starting Django Server (Port 8000)...
start "Krishna Polymer - Django Server" cmd /k "cd /d ""%PROJECT_DIR%"" && python manage.py runserver 127.0.0.1:8000"

timeout /t 2 /nobreak >nul

echo Launching browser...
start http://127.0.0.1:8000/

echo.
echo ===============================================================================
echo                          SERVER IS RUNNING!
echo ===============================================================================
echo  - Main Website:        http://127.0.0.1:8000/
echo  - Admin Dashboard:     http://127.0.0.1:8000/admin/
echo    ^> Default Password: admin123
echo ===============================================================================
echo.
echo Leave the opened Django Server window open while using the website.
pause
