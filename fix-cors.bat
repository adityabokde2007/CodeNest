@echo off
echo ================================================
echo   CodeNest CORS Fix Script
echo ================================================
echo.
echo This script will apply CORS configuration to your Firebase Storage bucket.
echo.
pause

cd /d "%~dp0"

echo.
echo Checking if gsutil is installed...
where gsutil >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] gsutil is not installed or not in PATH
    echo.
    echo Please install Google Cloud CLI from:
    echo https://cloud.google.com/sdk/docs/install#windows
    echo.
    echo After installation:
    echo 1. Restart this terminal
    echo 2. Run: gcloud auth login
    echo 3. Run: gcloud config set project codenest-63572
    echo 4. Run this script again
    echo.
    pause
    exit /b 1
)

echo [OK] gsutil found
echo.

echo Applying CORS to codenest-63572.appspot.com...
gsutil cors set cors.json gs://codenest-63572.appspot.com
if %ERRORLEVEL% EQU 0 (
    echo [OK] CORS applied to .appspot.com bucket
) else (
    echo [WARNING] Failed to apply to .appspot.com bucket (it might not exist)
)

echo.
echo Applying CORS to codenest-63572.firebasestorage.app...
gsutil cors set cors.json gs://codenest-63572.firebasestorage.app
if %ERRORLEVEL% EQU 0 (
    echo [OK] CORS applied to .firebasestorage.app bucket
) else (
    echo [WARNING] Failed to apply to .firebasestorage.app bucket (it might not exist)
)

echo.
echo ================================================
echo Verifying CORS configuration...
echo ================================================
echo.

echo Checking .appspot.com bucket:
gsutil cors get gs://codenest-63572.appspot.com

echo.
echo Checking .firebasestorage.app bucket:
gsutil cors get gs://codenest-63572.firebasestorage.app

echo.
echo ================================================
echo NEXT STEPS:
echo ================================================
echo.
echo 1. Clear your browser cache (Ctrl+Shift+Delete)
echo 2. Hard refresh (Ctrl+Shift+R)
echo 3. Or test in Incognito mode (Ctrl+Shift+N)
echo 4. Try uploading an image again
echo.
echo If you see JSON output above with "localhost:5173",
echo CORS is configured correctly!
echo.
pause
