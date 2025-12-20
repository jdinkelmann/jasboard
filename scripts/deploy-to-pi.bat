@echo off
REM JasBoard Deployment Script (Batch version)
REM Builds locally on Windows and deploys to Raspberry Pi

set PI_HOST=jasboard.local
set PI_USER=jas
set PI_PATH=~/jasboard

echo.
echo ================================
echo JasBoard Deployment to Pi
echo ================================
echo.

REM Step 1: Build locally
echo [1/5] Building project locally...
call npm ci
if errorlevel 1 (
    echo ERROR: npm ci failed
    exit /b 1
)

call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    exit /b 1
)
echo BUILD SUCCESSFUL
echo.

REM Step 2: Create zip (requires PowerShell)
echo [2/5] Creating deployment package...
powershell -Command "Compress-Archive -Path .next,package.json,package-lock.json,next.config.mjs,public -DestinationPath jasboard-build.zip -Force"
echo PACKAGE CREATED
echo.

REM Step 3: Upload to Pi
echo [3/5] Uploading to Pi...
scp jasboard-build.zip %PI_USER%@%PI_HOST%:/tmp/jasboard-build.zip
if errorlevel 1 (
    echo ERROR: Upload failed
    exit /b 1
)
echo UPLOAD COMPLETE
echo.

REM Step 4: Deploy on Pi
echo [4/5] Deploying on Pi...
ssh %PI_USER%@%PI_HOST% "cd %PI_PATH% && rm -rf .next && unzip -q /tmp/jasboard-build.zip -d . && rm /tmp/jasboard-build.zip && sudo systemctl restart jasboard && echo DEPLOYMENT COMPLETE"
echo.

REM Step 5: Cleanup
echo [5/5] Cleaning up...
del jasboard-build.zip
echo.

echo ================================
echo DEPLOYMENT SUCCESSFUL!
echo Dashboard: http://%PI_HOST%:3000
echo ================================
echo.
