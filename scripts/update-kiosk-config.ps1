# Update Kiosk Configuration on Raspberry Pi
# Uploads the kiosk startup script and restarts the kiosk

param(
    [string]$PiHost = "jasboard.local",
    [string]$PiUser = "jas"
)

Write-Host "🔧 Updating Kiosk Configuration on Pi" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# Step 1: Upload kiosk startup script
Write-Host "📤 Uploading kiosk startup script..." -ForegroundColor Yellow
scp scripts/jasboard-kiosk-start.sh "${PiUser}@${PiHost}:~/.config/jasboard-kiosk-start.sh"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Upload failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Script uploaded`n" -ForegroundColor Green

# Step 2: Make it executable and restart kiosk
Write-Host "🔄 Restarting kiosk..." -ForegroundColor Yellow
$restartScript = @"
chmod +x ~/.config/jasboard-kiosk-start.sh && \
killall chromium && \
sleep 3 && \
DISPLAY=:0 nohup bash ~/.config/jasboard-kiosk-start.sh > /dev/null 2>&1 &
"@

ssh "${PiUser}@${PiHost}" ($restartScript -replace "`r", "")
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Restart failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Kiosk restarted successfully!`n" -ForegroundColor Green
Write-Host "The display should now be properly sized in portrait mode." -ForegroundColor Cyan
