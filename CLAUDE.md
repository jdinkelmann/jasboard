# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JasBoard is a personal information dashboard designed to run on a Raspberry Pi in portrait mode (1080x1920). It replaces DakBoard and displays:
- Shared Google Calendar events
- Weather information with forecast
- Google Photos slideshow
- FAA METAR aviation weather data

The system consists of two components:
1. **Display app** - Full-screen browser view for the Raspberry Pi
2. **Admin interface** - Web-based configuration accessible from any device on the local network

## Architecture Principles

- **Lightweight**: Must run efficiently on Raspberry Pi hardware
- **Browser-based**: Both display and admin run in standard web browsers
- **Local network**: Admin interface accessible only on home network for security
- **API-driven**: Integrates with Google Calendar API, Google Photos API, weather services, and FAA METAR feeds
- **Portrait-first**: UI designed for 1080x1920 portrait orientation

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Runtime**: Node.js 18+ (runs on Raspberry Pi 4)
- **Language**: TypeScript (recommended) or JavaScript
- **Styling**: Tailwind CSS (lightweight, easy responsive design for portrait mode)
- **Data fetching**: Next.js API routes for backend integration

### Project Structure

```
/app
  /page.tsx                 # Main display (portrait dashboard)
  /admin
    /page.tsx              # Admin configuration interface
  /api
    /calendar/route.ts     # Google Calendar API proxy
    /photos/route.ts       # Google Photos API proxy
    /weather/route.ts      # Weather API integration
    /metar/route.ts        # FAA METAR data fetching
/components
  /widgets
    /Calendar.tsx          # Calendar widget
    /Weather.tsx           # Weather display
    /Photos.tsx            # Photo slideshow
    /Metar.tsx            # METAR widget
/lib
  /google-auth.ts          # Google OAuth helpers
  /config.ts              # Configuration management
/public                    # Static assets
```

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (access at http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server (for Raspberry Pi)
npm run start

# Type checking (if using TypeScript)
npm run type-check

# Linting
npm run lint
```

### Raspberry Pi Deployment

```bash
# On Pi: Install dependencies and build
npm ci --omit=dev
npm run build

# Run in production mode
npm run start

# Or use PM2 for auto-restart
npm install -g pm2
pm2 start npm --name "jasboard" -- start
pm2 save
pm2 startup
```

## Key Integration Points

### Google Calendar API
- **API Route**: `/api/calendar/route.ts`
- Requires OAuth 2.0 authentication (credentials stored in `.env.local`)
- Use `googleapis` npm package
- Displays shared calendar events
- Should handle multiple calendars if needed
- Refresh tokens automatically using refresh token flow
- Cache responses with Next.js caching to reduce API calls

### Google Photos API
- **API Route**: `/api/photos/route.ts`
- Requires OAuth 2.0 authentication
- Use `googleapis` npm package
- Fetch photos from specific album IDs (configured in admin)
- Client-side rotation/slideshow logic
- Consider caching image URLs for offline operation

### Weather Data
- **API Route**: `/api/weather/route.ts`
- Use National Weather Service API (free, no key required) or OpenWeatherMap
- Location-based forecast (latitude/longitude from config)
- Return current conditions and 5-day forecast
- Update frequency: every 30-60 minutes
- Use Next.js Route Handler caching: `export const revalidate = 1800` (30 min)

### FAA METAR Data
- **API Route**: `/api/metar/route.ts`
- Fetch from https://aviationweather.gov/api/data/metar or https://www.aviationweather.gov/adds/dataserver_current/
- Parse METAR format for display (consider `metar-parser` npm package)
- Airport code from configuration (e.g., "KBOS")
- Update frequency: every 15-30 minutes
- Cache with revalidation

## Configuration Management

### Environment Variables (`.env.local`)
```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback
NEXTAUTH_SECRET=...  # for admin authentication
ADMIN_PASSWORD=...   # simple password for admin access
```

### User Configuration (stored in JSON file or database)
The admin interface (`/admin`) allows configuring:
- Calendar IDs to display
- Photo album IDs
- Weather location (lat/lon or zip code)
- METAR airport code (e.g., "KBOS")
- Refresh intervals for each widget
- Display layout/widget positions
- Portrait mode orientation settings

Configuration persists in `config.json` or a lightweight database (SQLite) on the Pi.

## Raspberry Pi Deployment

### Auto-start on Boot
1. Next.js app runs with PM2: `pm2 start npm --name "jasboard" -- start`
2. Chromium launches in kiosk mode pointing to `http://localhost:3000`

Create autostart script at `~/.config/autostart/jasboard.desktop`:
```
[Desktop Entry]
Type=Application
Name=JasBoard
Exec=chromium-browser --kiosk --noerrdialogs --disable-infobars http://localhost:3000
```

### Kiosk Mode Setup
- Fullscreen browser with no chrome
- Disable screensaver/sleep
- Hide cursor after inactivity
- Auto-reload page on errors

### Performance Optimization
- Use Next.js Image component for optimized images
- Implement proper caching headers
- Lazy load off-screen content
- Use React.memo for widgets to prevent unnecessary re-renders
- Consider static generation where possible

## Security Considerations

- Admin interface should require authentication
- Only accessible on local network (no external exposure)
- API credentials stored securely (environment variables or encrypted config)
- Google OAuth tokens refreshed automatically
- HTTPS recommended even for local network

## Debugging on Raspberry Pi

### Current Deployment Status (December 2025)

**Automated Installer Available:**
- Location: `install.sh` in repository root
- Install command: `curl -sSL https://raw.githubusercontent.com/jdinkelmann/jasboard/main/install.sh | bash`
- Installs: Node.js 22, systemd service, Chromium kiosk mode
- Network access: `http://jasboard.local:3000`

**Key Files:**
- Main installer: `/install.sh`
- Update script: `/update.sh`
- Kiosk setup: `/scripts/setup-kiosk.sh`
- Systemd service: `/etc/systemd/system/jasboard.service`
- Install directory: `~/jasboard`
- Environment config: `~/jasboard/.env.local`
- User config: `~/jasboard/config.json`

### Common Issues and Solutions

#### Build Failures

**Issue: "Module not found: Can't resolve '@/lib/google-auth'"**
- **Cause**: Missing lib files in repository
- **Solution**: Ensure all files are committed and pushed to GitHub
  ```bash
  # On development machine:
  git add -A
  git commit -m "Add missing lib files"
  git push

  # On Pi:
  cd ~/jasboard
  git pull
  npm ci
  npm run build
  npm prune --production  # Optional: save space by removing devDependencies
  ```

**Issue: "JavaScript heap out of memory" during build**
- **Cause**: Insufficient memory on Raspberry Pi
- **Solution**:
  ```bash
  # Option 1: Increase Node.js heap size
  NODE_OPTIONS="--max-old-space-size=2048" npm run build

  # Option 2: Also increase swap space
  sudo dphys-swapfile swapoff
  sudo sed -i 's/^CONF_SWAPSIZE=.*/CONF_SWAPSIZE=1024/' /etc/dphys-swapfile
  sudo dphys-swapfile setup
  sudo dphys-swapfile swapon

  # Then rebuild with increased heap
  NODE_OPTIONS="--max-old-space-size=2048" npm run build

  # Option 3: Build on development machine and copy .next folder
  # On dev machine: npm run build, then rsync .next to Pi
  ```

**Issue: npm ci fails or hangs**
- **Cause**: Network issues, corrupted cache
- **Solution**:
  ```bash
  npm cache clean --force
  rm -rf node_modules package-lock.json
  npm install
  npm run build
  ```

#### Service Issues

**Check service status:**
```bash
# View current status
sudo systemctl status jasboard.service

# View live logs
sudo journalctl -u jasboard.service -f

# Restart service
sudo systemctl restart jasboard.service

# Stop service
sudo systemctl stop jasboard.service

# Start service
sudo systemctl start jasboard.service
```

**Service won't start:**
1. Check if port 3000 is in use: `sudo lsof -i :3000`
2. Check environment variables: `cat ~/jasboard/.env.local`
3. Check if build succeeded: `ls ~/jasboard/.next/`
4. Test manually: `cd ~/jasboard && npm start`

#### Network Access Issues

**Can't access jasboard.local:**
```bash
# Check Avahi is running
sudo systemctl status avahi-daemon

# Restart Avahi
sudo systemctl restart avahi-daemon

# Check hostname
hostname  # Should show "jasboard"

# Find IP address
hostname -I
```

**Access via IP instead:** `http://192.168.x.x:3000`

#### Kiosk Mode Issues

**Chromium not starting:**
```bash
# Check autostart file
cat ~/.config/autostart/jasboard-kiosk.desktop

# Test startup script manually
bash ~/.config/jasboard-kiosk-start.sh

# Check if X server is running
ps aux | grep X

# Restart X server (requires reboot)
sudo reboot
```

**Black screen in kiosk:**
- JasBoard service might not be running
- Check logs: `sudo journalctl -u jasboard.service -n 50`
- Verify app is accessible: `curl http://localhost:3000`

#### Google OAuth Issues

**"Invalid credentials" or OAuth errors:**
1. Check `.env.local` has correct credentials
2. Verify redirect URI in Google Console matches:
   - `http://jasboard.local:3000/api/auth/google/callback`
   - `http://localhost:3000/api/auth/google/callback`
3. Check Google API scopes are enabled:
   - Google Calendar API
   - Google Photos Picker API

**Token expired:**
- Tokens are auto-refreshed
- Check `config.json` for token data
- Delete `config.json` to force re-auth

#### Performance Issues

**App is slow:**
```bash
# Check CPU/memory usage
top

# Check Pi temperature
vcgencmd measure_temp

# Check available memory
free -h

# Check disk space
df -h
```

**High memory usage:**
- Normal for Node.js + Chromium on Pi
- Consider reducing photo resolution
- Limit number of calendar events shown
- Increase swap if needed:
  ```bash
  sudo dphys-swapfile swapoff
  sudo nano /etc/dphys-swapfile  # Set CONF_SWAPSIZE=1024
  sudo dphys-swapfile setup
  sudo dphys-swapfile swapon
  ```

### Useful Debugging Commands

```bash
# View all logs
sudo journalctl -u jasboard.service --since today

# Follow logs in real-time
sudo journalctl -u jasboard.service -f

# Check Node.js version
node -v  # Should be v22.x.x

# Check npm version
npm -v

# Test app locally
cd ~/jasboard
npm start
# Then visit http://localhost:3000

# Check what's using port 3000
sudo lsof -i :3000

# View environment variables
cd ~/jasboard
cat .env.local

# Check config file
cat ~/jasboard/config.json

# View systemd service file
cat /etc/systemd/system/jasboard.service

# Reload systemd after editing service
sudo systemctl daemon-reload
sudo systemctl restart jasboard.service

# Check if Chromium is running
ps aux | grep chromium

# Kill Chromium (for testing)
killall chromium

# Update to latest code
cd ~/jasboard
bash update.sh
```

### Manual Installation Steps (if installer fails)

```bash
# 1. Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 2. Install system dependencies
sudo apt update
sudo apt install -y git xinit xserver-xorg x11-xserver-utils chromium unclutter avahi-daemon

# 3. Clone repository
git clone https://github.com/jdinkelmann/jasboard.git ~/jasboard
cd ~/jasboard

# 4. Set up environment
cp .env.local.example .env.local
nano .env.local  # Add Google OAuth credentials

# 5. Build application
npm ci --omit=dev
npm run build

# 6. Create systemd service (see install.sh for full service file)
sudo nano /etc/systemd/system/jasboard.service
sudo systemctl daemon-reload
sudo systemctl enable jasboard.service
sudo systemctl start jasboard.service

# 7. Set up kiosk mode
bash scripts/setup-kiosk.sh

# 8. Set hostname
echo "jasboard" | sudo tee /etc/hostname
sudo sed -i 's/raspberrypi/jasboard/g' /etc/hosts
sudo reboot
```

### Getting Help

When asking for help, provide:
1. Output of: `sudo journalctl -u jasboard.service -n 50`
2. Output of: `node -v && npm -v`
3. Output of: `cat ~/jasboard/.env.local` (redact credentials!)
4. Output of: `sudo systemctl status jasboard.service`
5. Description of what's not working
6. Any error messages you see

## Future Considerations

- Multiple display layouts/themes
- Additional data sources (news, stocks, etc.)
- Mobile app for quick admin access
- Multiple board configurations for different displays
