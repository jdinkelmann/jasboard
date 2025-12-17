# JasBoard Deployment Guide

Complete guide for deploying JasBoard on a Raspberry Pi for 24/7 operation.

## Table of Contents

- [Hardware Requirements](#hardware-requirements)
- [Initial Setup](#initial-setup)
- [Installation](#installation)
- [Configuration](#configuration)
- [Network Access](#network-access)
- [Kiosk Mode](#kiosk-mode)
- [Updating](#updating)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

## Hardware Requirements

### Recommended
- **Raspberry Pi 4 Model B** (2GB RAM or higher)
- MicroSD card (16GB minimum, 32GB recommended)
- Power supply (official Pi 4 power supply recommended)
- Display with HDMI input
- Portrait-oriented display (1080x1920) or landscape

### Also Compatible
- Raspberry Pi 3 Model B+ (minimum 1GB RAM)
- Raspberry Pi 5

### Display
- HDMI-compatible display
- Recommended: 1080x1920 portrait orientation
- Alternative: Any resolution in landscape or portrait

## Initial Setup

### 1. Flash Raspberry Pi OS

Use [Raspberry Pi Imager](https://www.raspberrypi.com/software/) to flash the SD card.

**Recommended OS:**
- **Raspberry Pi OS Lite (32-bit)** - For Pi 3 or memory-constrained setups
- **Raspberry Pi OS Lite (64-bit)** - For Pi 4/5 (better performance)

**Important Settings (in Advanced Options):**
- Enable SSH
- Set hostname: `jasboard`
- Configure WiFi (if using wireless)
- Set username and password (default: `pi`)

### 2. First Boot

```bash
# Insert SD card and boot the Pi
# Find the IP address or use hostname

# SSH into the Pi
ssh pi@jasboard.local
# or
ssh pi@<IP_ADDRESS>

# Update system (optional but recommended)
sudo apt update && sudo apt upgrade -y
```

## Installation

### Quick Installation

Run this single command to install everything:

```bash
curl -sSL https://raw.githubusercontent.com/jdinkelmann/jasboard/main/install.sh | bash
```

### Manual Installation

If you prefer to review the script first:

```bash
# Download the installer
curl -O https://raw.githubusercontent.com/jdinkelmann/jasboard/main/install.sh

# Review it
cat install.sh

# Make it executable and run
chmod +x install.sh
bash install.sh
```

### What the Installer Does

1. Checks for Raspberry Pi hardware
2. Installs Node.js 18
3. Installs system dependencies (X server, Chromium, etc.)
4. Clones the JasBoard repository to `~/jasboard`
5. Prompts for environment configuration
6. Builds the application
7. Sets up systemd service for auto-start
8. Configures hostname as `jasboard.local`
9. Sets up Chromium kiosk mode
10. Starts the service

### Installation Time

- Pi 4: ~10-15 minutes
- Pi 3: ~15-20 minutes

## Configuration

### Google OAuth Setup

JasBoard requires Google OAuth credentials for Calendar and Photos API access.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable APIs:
   - Google Calendar API
   - Google Photos Picker API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://jasboard.local:3000/api/auth/google/callback`
     - `http://<YOUR_PI_IP>:3000/api/auth/google/callback`
     - `http://localhost:3000/api/auth/google/callback`
5. Copy Client ID and Client Secret

### Environment Variables

Edit `.env.local` in the JasBoard directory:

```bash
cd ~/jasboard
nano .env.local
```

Add your credentials:

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://jasboard.local:3000/api/auth/google/callback
```

After editing, restart the service:

```bash
sudo systemctl restart jasboard.service
```

## Network Access

### Local Network Access

Once installed, access JasBoard from any device on your network:

**Using hostname:**
- Display: `http://jasboard.local:3000`
- Admin: `http://jasboard.local:3000/admin`

**Using IP address:**
- Display: `http://<PI_IP_ADDRESS>:3000`
- Admin: `http://<PI_IP_ADDRESS>:3000/admin`

### Find Your Pi's IP Address

```bash
# On the Pi
hostname -I

# From another computer
ping jasboard.local
```

### Admin Interface

The admin interface (`/admin`) allows you to:
- Configure Google Calendar IDs
- Select photos from Google Photos
- Set weather location
- Configure METAR airport code
- View system status (when accessed from Pi)

## Kiosk Mode

The kiosk mode setup makes Chromium launch fullscreen on boot.

### Features

- Fullscreen display (no browser UI)
- Auto-start on boot
- Screen blanking disabled
- Mouse cursor hidden
- Auto-recovery from crashes

### Testing Kiosk Mode

```bash
# Test without rebooting
bash ~/.config/jasboard-kiosk-start.sh

# Exit kiosk mode
# Press Alt+F4 or Ctrl+W
```

### Disable Kiosk Mode

```bash
rm ~/.config/autostart/jasboard-kiosk.desktop
```

### Portrait Mode Setup

For portrait orientation (1080x1920):

1. Edit boot config:
   ```bash
   sudo nano /boot/config.txt
   ```

2. Add rotation line:
   ```
   # For 90° rotation (portrait)
   display_rotate=1

   # For 270° rotation (inverted portrait)
   display_rotate=3
   ```

3. Reboot:
   ```bash
   sudo reboot
   ```

## Updating

### Update JasBoard

```bash
cd ~/jasboard
bash update.sh
```

The update script will:
1. Backup your configuration
2. Pull latest code from git
3. Update dependencies
4. Rebuild the application
5. Restart the service

### Update System

```bash
sudo apt update && sudo apt upgrade -y
```

## Troubleshooting

### Service Won't Start

```bash
# Check service status
sudo systemctl status jasboard.service

# View logs
sudo journalctl -u jasboard.service -f

# Restart service
sudo systemctl restart jasboard.service
```

### Can't Access on Network

```bash
# Check if service is running
sudo systemctl is-active jasboard.service

# Check if port 3000 is listening
sudo netstat -tlnp | grep 3000

# Restart Avahi for mDNS
sudo systemctl restart avahi-daemon
```

### Kiosk Mode Not Starting

```bash
# Check if autostart file exists
ls -la ~/.config/autostart/jasboard-kiosk.desktop

# Check startup script
cat ~/.config/jasboard-kiosk-start.sh

# Test manually
bash ~/.config/jasboard-kiosk-start.sh
```

### Display Issues

```bash
# Check if X server is running
ps aux | grep X

# Check Chromium process
ps aux | grep chromium
```

### Memory Issues (Pi 3)

If running out of memory:

1. Increase swap:
   ```bash
   sudo dphys-swapfile swapoff
   sudo nano /etc/dphys-swapfile
   # Set CONF_SWAPSIZE=1024
   sudo dphys-swapfile setup
   sudo dphys-swapfile swapon
   ```

2. Reduce Chromium memory:
   Edit `~/.config/jasboard-kiosk-start.sh` and add:
   ```bash
   --disk-cache-size=10485760 \
   --media-cache-size=10485760
   ```

### OAuth Not Working

1. Verify credentials in `.env.local`
2. Check redirect URI matches Google Console
3. Clear browser cache and retry
4. Check service logs for errors

## Advanced Configuration

### Change Port

Edit systemd service:

```bash
sudo nano /etc/systemd/system/jasboard.service

# Change PORT=3000 to desired port
# Save and reload
sudo systemctl daemon-reload
sudo systemctl restart jasboard.service
```

### Custom Hostname

```bash
# Change hostname
echo "mycustomname" | sudo tee /etc/hostname
sudo sed -i 's/jasboard/mycustomname/g' /etc/hosts
sudo reboot
```

### Static IP Address

For consistent access without mDNS:

```bash
sudo nano /etc/dhcpcd.conf

# Add:
interface wlan0  # or eth0 for ethernet
static ip_address=192.168.1.100/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1 8.8.8.8
```

### Performance Monitoring

```bash
# CPU temperature
vcgencmd measure_temp

# Memory usage
free -h

# Service resource usage
systemctl status jasboard.service

# Detailed logs
sudo journalctl -u jasboard.service --since today
```

### Backup Configuration

```bash
# Manual backup
cd ~/jasboard
tar -czf ~/jasboard-backup-$(date +%Y%m%d).tar.gz .env.local config.json

# Restore from backup
cd ~/jasboard
tar -xzf ~/jasboard-backup-YYYYMMDD.tar.gz
sudo systemctl restart jasboard.service
```

## Security Notes

- JasBoard is designed for local network use only
- Do not expose port 3000 to the internet without additional security
- Keep your Pi's system updated
- Use strong passwords for SSH access
- Consider changing default Pi username
- Google OAuth tokens are stored locally in `config.json`

## Support

For issues or questions:
- Check the [GitHub Issues](https://github.com/jdinkelmann/jasboard/issues)
- Review logs: `sudo journalctl -u jasboard.service -f`
- Verify configuration: `cat ~/jasboard/.env.local`

## Uninstallation

To completely remove JasBoard:

```bash
# Stop and disable service
sudo systemctl stop jasboard.service
sudo systemctl disable jasboard.service
sudo rm /etc/systemd/system/jasboard.service
sudo systemctl daemon-reload

# Remove kiosk mode
rm ~/.config/autostart/jasboard-kiosk.desktop
rm ~/.config/jasboard-kiosk-start.sh
rm ~/.config/disable-screensaver.sh

# Remove application
rm -rf ~/jasboard

# Optional: Remove Node.js and dependencies
sudo apt remove -y nodejs chromium-browser
sudo apt autoremove -y
```
