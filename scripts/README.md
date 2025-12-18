# JasBoard Scripts

This directory contains utility scripts for setting up and managing JasBoard on Raspberry Pi.

## Available Scripts

### 🖥️ setup-display-schedule.sh

Configures automatic monitor on/off scheduling using cron.

**Usage:**
```bash
bash scripts/setup-display-schedule.sh
```

**What it does:**
- Creates cron jobs to turn the display on/off automatically
- Monday-Friday: ON at 6am, OFF at 9pm
- Saturday-Sunday: ON at 10am, OFF at 9pm
- Backs up existing crontab before making changes
- Tests display control commands

**Manual control:**
```bash
vcgencmd display_power 1  # Turn ON
vcgencmd display_power 0  # Turn OFF
vcgencmd display_power    # Check status
```

**Customize schedule:**
```bash
crontab -e  # Edit schedule
crontab -l  # View current schedule
```

### 🚀 setup-kiosk.sh

Sets up Chromium in kiosk mode for full-screen display.

**Usage:**
```bash
bash scripts/setup-kiosk.sh
```

**What it does:**
- Configures Chromium to launch in kiosk mode on boot
- Disables screen blanking and cursor
- Creates autostart configuration
- Points to http://localhost:3000

### 🎨 setup-kiosk-lite.sh

Lightweight kiosk setup (alternative to setup-kiosk.sh).

**Usage:**
```bash
bash scripts/setup-kiosk-lite.sh
```

**What it does:**
- Minimal kiosk configuration
- Faster startup
- Good for testing

## Installation Order

When setting up a new Raspberry Pi:

1. **First**: Run main installer (from repo root)
   ```bash
   curl -sSL https://raw.githubusercontent.com/jdinkelmann/jasboard/main/install.sh | bash
   ```

2. **Then**: Set up kiosk mode
   ```bash
   cd ~/jasboard
   bash scripts/setup-kiosk.sh
   ```

3. **Optional**: Set up display schedule
   ```bash
   bash scripts/setup-display-schedule.sh
   ```

4. **Reboot** to apply all changes
   ```bash
   sudo reboot
   ```

## Troubleshooting

### Script won't run
Make sure scripts are executable:
```bash
chmod +x scripts/*.sh
```

### Cron jobs not working
Check cron logs:
```bash
sudo journalctl -u cron -f
grep CRON /var/log/syslog
```

### Display control not working
Test manually:
```bash
vcgencmd display_power
```

If command not found, ensure you're on a Raspberry Pi.

## See Also

- [CLAUDE.md](../CLAUDE.md) - Full project documentation
- [README.md](../README.md) - Project overview
- [install.sh](../install.sh) - Main installation script
- [update.sh](../update.sh) - Update script
