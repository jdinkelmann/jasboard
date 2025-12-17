#!/bin/bash

###############################################################################
# Install Emoji Font Support for Raspberry Pi
# This fixes the issue where emojis show as square boxes in Chromium
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

echo ""
print_info "Installing emoji font support for Chromium..."
echo ""

# Update package lists
print_info "Updating package lists..."
sudo apt update

# Install emoji fonts
print_info "Installing emoji fonts..."
sudo apt install -y \
    fonts-noto-color-emoji \
    fonts-symbola

print_success "Emoji fonts installed!"

# Clear font cache
print_info "Clearing font cache..."
fc-cache -f -v > /dev/null 2>&1

print_success "Font cache updated!"

# Test emoji rendering
echo ""
print_info "Testing emoji rendering:"
echo "  Weather icons: ☀️ ⛅ ☁️ 🌧️ ⛈️ 🌨️ 🌫️ 🌤️"
echo ""

print_success "Setup complete!"
echo ""
print_warning "If Chromium is currently running, restart it to see the changes:"
echo "  killall chromium"
echo "  Or reboot: sudo reboot"
echo ""
