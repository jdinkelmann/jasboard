# JasBoard Deployment Guide

This guide explains how to build JasBoard locally on Windows and deploy to your Raspberry Pi.

## Why Deploy This Way?

The Raspberry Pi struggles with memory-intensive builds. By building on your development machine and deploying just the compiled output, deployments are:
- ⚡ **10x faster** (seconds vs minutes)
- 💾 **More reliable** (no out-of-memory errors)
- 🔋 **Easier on the Pi** (no heavy CPU/RAM usage)

## Prerequisites

### 1. OpenSSH (Windows)

Windows 10/11 includes OpenSSH by default. Verify it's installed:

```powershell
ssh -V
scp
```

If not installed, enable it:
1. Settings → Apps → Optional Features
2. Add "OpenSSH Client"

### 2. SSH Key Setup (Recommended)

Set up passwordless SSH to avoid entering passwords on every deployment:

#### On Windows (PowerShell):

```powershell
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy public key to Pi
type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh jas@jasboard.local "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

# Test passwordless login
ssh jas@jasboard.local
```

### 3. Install `xdotool` on Pi (Optional - for browser refresh)

```bash
ssh jas@jasboard.local
sudo apt install -y xdotool
```

## Deployment Scripts

Two deployment scripts are provided:

### Option 1: PowerShell Script (Recommended)

```powershell
# Default deployment
.\deploy-to-pi.ps1

# Custom Pi hostname/user
.\deploy-to-pi.ps1 -PiHost "192.168.1.100" -PiUser "myuser"
```

### Option 2: Batch Script

```cmd
deploy-to-pi.bat
```

To customize, edit the variables at the top of the file:
```batch
set PI_HOST=jasboard.local
set PI_USER=jas
set PI_PATH=~/jasboard
```

## What the Script Does

1. **🏗️ Build Locally**
   - Runs `npm ci` to install dependencies
   - Runs `npm run build` to compile the app
   - Much faster than building on Pi

2. **📦 Package**
   - Creates a zip file with:
     - `.next/` (compiled output)
     - `package.json`, `package-lock.json`
     - `next.config.mjs`
     - `public/` (images, assets)

3. **📤 Upload**
   - Uses `scp` to copy zip to Pi (`/tmp/`)

4. **🚀 Deploy**
   - SSH into Pi
   - Remove old `.next` folder
   - Extract new build
   - Restart systemd service
   - Clean up temp files

5. **🔄 Refresh Browser**
   - Sends F5 to Chromium (if `xdotool` installed)
   - Dashboard automatically shows new version

## Troubleshooting

### "ssh: command not found"

Install OpenSSH (see Prerequisites above).

### "Permission denied (publickey)"

Set up SSH keys (see Prerequisites above) or use password authentication:

```powershell
# PowerShell will prompt for password
.\deploy-to-pi.ps1
```

### "Connection refused"

Check that:
- Pi is powered on and connected to network
- SSH is enabled: `sudo systemctl status ssh`
- Hostname is correct (try IP address instead)

### Build succeeds but site doesn't update

1. Check service status:
   ```bash
   ssh jas@jasboard.local
   sudo systemctl status jasboard
   ```

2. View logs:
   ```bash
   sudo journalctl -u jasboard -f
   ```

3. Manually restart service:
   ```bash
   sudo systemctl restart jasboard
   ```

4. Clear browser cache:
   ```bash
   ssh jas@jasboard.local
   rm -rf ~/.cache/chromium
   ```

## Quick Reference

```powershell
# Deploy
.\deploy-to-pi.ps1

# View logs (from Windows)
ssh jas@jasboard.local "sudo journalctl -u jasboard -f"

# Restart service
ssh jas@jasboard.local "sudo systemctl restart jasboard"

# Check status
ssh jas@jasboard.local "sudo systemctl status jasboard"
```

## Manual Deployment (Without Script)

If you prefer to deploy manually:

```powershell
# 1. Build locally
npm ci
npm run build

# 2. Create package
Compress-Archive -Path .next,package.json,package-lock.json,next.config.mjs,public -DestinationPath build.zip

# 3. Upload
scp build.zip jas@jasboard.local:/tmp/

# 4. Deploy on Pi
ssh jas@jasboard.local
cd ~/jasboard
rm -rf .next
unzip /tmp/build.zip
rm /tmp/build.zip
sudo systemctl restart jasboard
```

## Performance

Typical deployment times:
- **Local build**: 30-60 seconds
- **Upload**: 5-10 seconds
- **Pi deployment**: 2-3 seconds
- **Total**: ~1 minute

Compare to building on Pi: 5-10 minutes (often fails due to memory)

## Next Steps

After deployment:
1. Check dashboard: http://jasboard.local:3000
2. View logs: `ssh jas@jasboard.local "sudo journalctl -u jasboard -f"`
3. Make changes, then run `.\deploy-to-pi.ps1` again!
