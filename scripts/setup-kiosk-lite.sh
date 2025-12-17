#!/bin/bash

###############################################################################
# JasBoard Kiosk Mode Setup for Raspberry Pi OS Lite
#
# This script configures X server to auto-start on boot with Chromium
# in kiosk mode for headless/Lite installations.
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }

echo ""
print_info "Setting up Kiosk Mode for Raspberry Pi OS Lite"
echo ""

###############################################################################
# Create .xinitrc
###############################################################################

print_info "Creating X server startup configuration..."

cat > ~/.xinitrc << 'EOF'
#!/bin/bash

# Disable screensaver and power management
xset s off
xset -dpms
xset s noblank

# Hide mouse cursor
unclutter -idle 1 -root &

# Wait for JasBoard service to be ready
sleep 15

# Start Chromium in kiosk mode
chromium-browser \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-component-update \
  --check-for-update-interval=31536000 \
  --app=http://localhost:3000
EOF

chmod +x ~/.xinitrc
print_success ".xinitrc created"

###############################################################################
# Configure Auto-start X on Login
###############################################################################

print_info "Configuring auto-start X on login..."

# Backup existing .bash_profile if it exists
if [ -f ~/.bash_profile ]; then
    cp ~/.bash_profile ~/.bash_profile.backup
    print_info "Backed up existing .bash_profile"
fi

# Check if auto-start X is already configured
if ! grep -q "startx" ~/.bash_profile 2>/dev/null; then
    cat >> ~/.bash_profile << 'EOF'

# Auto-start X server on tty1 (only if not already running)
if [ -z "$DISPLAY" ] && [ "$(tty)" = "/dev/tty1" ]; then
    startx
fi
EOF
    print_success "Auto-start X configured in .bash_profile"
else
    print_warning "Auto-start X already configured in .bash_profile"
fi

###############################################################################
# Enable Console Autologin
###############################################################################

print_info "Enabling console autologin..."

# Use raspi-config to enable autologin to console
# B2 = Console Autologin (text console, automatically logged in)
if command -v raspi-config &> /dev/null; then
    sudo raspi-config nonint do_boot_behaviour B2
    print_success "Console autologin enabled"
else
    print_warning "raspi-config not found, skipping autologin setup"
    print_info "You may need to manually enable autologin"
fi

###############################################################################
# Display Rotation Configuration
###############################################################################

echo ""
print_info "Display Configuration"
echo ""
print_info "Display is configured for landscape mode by default"
print_warning "For portrait mode (1080x1920), edit /boot/config.txt"
echo ""
echo "  sudo nano /boot/config.txt"
echo ""
echo "Add one of these lines:"
echo "  display_rotate=1    # 90° clockwise (portrait)"
echo "  display_rotate=3    # 270° clockwise (inverted portrait)"
echo ""

###############################################################################
# Completion
###############################################################################

echo ""
print_success "Kiosk mode setup complete!"
echo ""
print_info "To activate the kiosk mode:"
echo "  1. Reboot: sudo reboot"
echo "  2. The Pi will auto-login and start X server"
echo "  3. Chromium will launch in kiosk mode"
echo ""
print_info "To test without rebooting:"
echo "  startx"
echo ""
print_info "To exit kiosk mode (if running):"
echo "  Press Ctrl+Alt+F2 to get to terminal"
echo "  Then: killall chromium-browser && killall X"
echo ""
print_warning "Ready to reboot? Run: sudo reboot"
echo ""
