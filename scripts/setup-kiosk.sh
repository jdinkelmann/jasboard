#!/bin/bash

###############################################################################
# JasBoard Kiosk Mode Setup Script
#
# This script configures Chromium to run in kiosk mode on boot
# for the JasBoard dashboard display.
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }

# Configuration
JASBOARD_URL="http://localhost:3000"
AUTOSTART_DIR="$HOME/.config/autostart"
AUTOSTART_FILE="$AUTOSTART_DIR/jasboard-kiosk.desktop"

echo ""
print_info "Setting up Chromium kiosk mode for JasBoard"
echo ""

###############################################################################
# Disable Screen Blanking and Screensaver
###############################################################################

print_info "Disabling screen blanking..."

# Create or update lightdm configuration
if [ -f /etc/lightdm/lightdm.conf ]; then
    # Backup original
    sudo cp /etc/lightdm/lightdm.conf /etc/lightdm/lightdm.conf.backup

    # Disable screen blanking in lightdm
    sudo bash -c 'cat >> /etc/lightdm/lightdm.conf << EOF

[Seat:*]
xserver-command=X -s 0 -dpms
EOF'
    print_success "Screen blanking disabled in lightdm"
fi

# Disable DPMS and screen blanking for X11
mkdir -p "$HOME/.config"
cat > "$HOME/.config/disable-screensaver.sh" << 'EOF'
#!/bin/bash
xset s off          # Disable screen saver
xset -dpms          # Disable DPMS (Energy Star) features
xset s noblank      # Don't blank the video device
EOF

chmod +x "$HOME/.config/disable-screensaver.sh"
print_success "Screen saver disabled"

###############################################################################
# Hide Mouse Cursor
###############################################################################

print_info "Configuring mouse cursor to hide..."

# unclutter should already be installed by main installer
# It will hide the cursor after 1 second of inactivity

print_success "Mouse cursor will auto-hide"

###############################################################################
# Create Autostart Entry
###############################################################################

print_info "Creating autostart entry..."

# Create autostart directory
mkdir -p "$AUTOSTART_DIR"

# Create desktop entry for kiosk mode
cat > "$AUTOSTART_FILE" << EOF
[Desktop Entry]
Type=Application
Name=JasBoard Kiosk
Comment=Start JasBoard dashboard in kiosk mode
Exec=/bin/bash $HOME/.config/jasboard-kiosk-start.sh
X-GNOME-Autostart-enabled=true
EOF

# Create the actual startup script
cat > "$HOME/.config/jasboard-kiosk-start.sh" << 'EOF'
#!/bin/bash

# Wait for network and JasBoard service to be ready
sleep 10

# Disable screensaver and power management
bash $HOME/.config/disable-screensaver.sh

# Hide mouse cursor (unclutter)
unclutter -idle 1 -root &

# Wait a bit more for JasBoard service
sleep 5

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

chmod +x "$HOME/.config/jasboard-kiosk-start.sh"

print_success "Autostart configured"

###############################################################################
# Display Rotation (Portrait Mode)
###############################################################################

print_info "Display is configured for landscape mode by default"
print_warning "For portrait mode (1080x1920), you need to rotate the display"
echo ""
print_info "To rotate display to portrait mode, edit /boot/config.txt:"
echo "  sudo nano /boot/config.txt"
echo ""
echo "Add this line:"
echo "  display_rotate=1    # 90 degrees (portrait)"
echo "  # or display_rotate=3  # 270 degrees (inverted portrait)"
echo ""
echo "Then reboot: sudo reboot"
echo ""

###############################################################################
# Completion
###############################################################################

echo ""
print_success "Kiosk mode setup complete!"
echo ""
print_info "The dashboard will start automatically on next boot"
print_info "To test now without rebooting:"
echo "  bash $HOME/.config/jasboard-kiosk-start.sh"
echo ""
print_info "To disable kiosk mode:"
echo "  rm $AUTOSTART_FILE"
echo ""
