# JasBoard Deployment Script
# Builds locally on Windows and deploys to Raspberry Pi

param(
    [string]$PiHost = "jasboard.local",
    [string]$PiUser = "jas",
    [string]$PiPath = "~/jasboard"
)

Write-Host "🚀 JasBoard Deployment to Raspberry Pi" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Build locally
Write-Host "📦 Building project locally..." -ForegroundColor Yellow

# Skip npm ci - assumes dependencies are already installed
# Uncomment the lines below if you want to reinstall dependencies
# npm ci
# if ($LASTEXITCODE -ne 0) {
#     Write-Host "❌ npm ci failed" -ForegroundColor Red
#     exit 1
# }

npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful`n" -ForegroundColor Green

# Step 2: Create deployment package
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$zipFile = "jasboard-build-$timestamp.zip"

# Create zip with .next folder and necessary files
Compress-Archive -Path .next,package.json,package-lock.json,next.config.js,public -DestinationPath $zipFile -Force

Write-Host "✅ Package created: $zipFile`n" -ForegroundColor Green

# Step 3: Copy to Pi
Write-Host "📤 Uploading to Pi ($PiHost)..." -ForegroundColor Yellow
scp $zipFile "${PiUser}@${PiHost}:/tmp/$zipFile"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Upload failed. Make sure SSH is configured and Pi is reachable." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Upload complete`n" -ForegroundColor Green

# Step 4: Deploy on Pi
Write-Host "🔄 Deploying on Pi..." -ForegroundColor Yellow

$deployScript = @"
cd $PiPath && \
echo '🗑️  Removing old build...' && \
rm -rf .next && \
echo '📦 Extracting new build...' && \
unzip -q /tmp/$zipFile -d . && \
rm /tmp/$zipFile && \
echo '🔄 Restarting service...' && \
sudo systemctl restart jasboard && \
sleep 2 && \
echo '✅ Deployment complete!' && \
sudo systemctl status jasboard --no-pager -l
"@

ssh "${PiUser}@${PiHost}" ($deployScript -replace "`r", "")
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}

# Step 5: Refresh Chromium (optional - requires X display access)
Write-Host "`n🔄 Refreshing browser..." -ForegroundColor Yellow
ssh "${PiUser}@${PiHost}" "DISPLAY=:0 xdotool search --class chromium key F5 2>/dev/null || echo 'Note: Browser refresh requires xdotool to be installed'"

# Cleanup local zip
Remove-Item $zipFile -Force

Write-Host "`n✨ Deployment complete! Check the dashboard at http://$PiHost`:3000" -ForegroundColor Green
Write-Host "📊 View logs: ssh ${PiUser}@${PiHost} 'sudo journalctl -u jasboard -f'`n" -ForegroundColor Cyan
