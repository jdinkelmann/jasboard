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

# Wait for X server and services to be ready
sleep 10

# Rotate display to portrait mode (redundant with /boot/config.txt but needed for Pi 4)
DISPLAY=:0 xrandr --output HDMI-2 --rotate right
sleep 2

# Disable screensaver and power management
bash $HOME/.config/disable-screensaver.sh

# Hide mouse cursor (unclutter)
unclutter -idle 1 -root &

# Wait for JasBoard service to be ready
sleep 5

# Start Chromium in kiosk mode with explicit window size for portrait mode
chromium \
  --kiosk \
  --window-size=1080,1920 \
  --force-device-scale-factor=1 \
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

print_info "Configuring display rotation for portrait mode..."

# Detect Pi model
PI_MODEL=$(cat /proc/device-tree/model 2>/dev/null || echo "Unknown")

if [[ "$PI_MODEL" == *"Raspberry Pi 4"* ]]; then
    print_warning "Raspberry Pi 4 detected"
    print_info "Pi 4 requires special display configuration for rotation"
    echo ""
fi

# Check if /boot/config.txt exists (could be /boot/firmware/config.txt on newer systems)
if [ -f /boot/firmware/config.txt ]; then
    BOOT_CONFIG="/boot/firmware/config.txt"
elif [ -f /boot/config.txt ]; then
    BOOT_CONFIG="/boot/config.txt"
else
    print_warning "Could not find boot config file"
    BOOT_CONFIG=""
fi

if [ -n "$BOOT_CONFIG" ]; then
    # Backup config
    sudo cp "$BOOT_CONFIG" "${BOOT_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"

    # Check if display_rotate is already set
    if grep -q "^display_rotate=" "$BOOT_CONFIG"; then
        print_success "display_rotate already configured in $BOOT_CONFIG"
    else
        print_info "Adding display_rotate to $BOOT_CONFIG..."

        # Add display_rotate for portrait mode (90 degrees clockwise)
        echo "" | sudo tee -a "$BOOT_CONFIG" > /dev/null
        echo "# JasBoard: Portrait mode rotation" | sudo tee -a "$BOOT_CONFIG" > /dev/null
        echo "display_rotate=1" | sudo tee -a "$BOOT_CONFIG" > /dev/null

        print_success "Display rotation configured (display_rotate=1)"
    fi

    # For Pi 4: Warn about dtoverlay conflict
    if [[ "$PI_MODEL" == *"Raspberry Pi 4"* ]]; then
        if grep -q "^dtoverlay=vc4-fkms-v3d" "$BOOT_CONFIG"; then
            print_warning "IMPORTANT: Pi 4 detected with vc4-fkms-v3d overlay"
            print_warning "This conflicts with display_rotate on Pi 4!"
            echo ""
            print_info "Commenting out dtoverlay=vc4-fkms-v3d..."

            sudo sed -i 's/^dtoverlay=vc4-fkms-v3d/#dtoverlay=vc4-fkms-v3d  # Disabled for display_rotate compatibility/' "$BOOT_CONFIG"

            print_success "dtoverlay commented out to enable rotation"
            print_info "The display will use legacy graphics driver instead"
        fi
    fi

    echo ""
    print_info "Display configuration summary:"
    echo "  • Rotation: 90° clockwise (portrait)"
    echo "  • Boot config: $BOOT_CONFIG"
    echo "  • Xrandr: Enabled in kiosk script (redundant but needed for Pi 4)"
    echo ""
    print_warning "REBOOT REQUIRED for display rotation to take effect"
else
    print_warning "Could not auto-configure display rotation"
    print_info "Please manually edit /boot/config.txt and add:"
    echo "  display_rotate=1"
fi

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
