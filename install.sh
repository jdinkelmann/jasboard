#!/bin/bash

###############################################################################
# JasBoard Installation Script for Raspberry Pi
#
# This script automates the installation of JasBoard on a Raspberry Pi.
# It will install all dependencies, build the application, and set up
# kiosk mode for 24/7 operation.
#
# Usage:
#   Local: bash install.sh
#   Remote: curl -sSL https://raw.githubusercontent.com/YOUR_REPO/main/install.sh | bash
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
INSTALL_DIR="$HOME/jasboard"
NODE_VERSION="22"
REQUIRED_MEMORY_MB=1024

###############################################################################
# Helper Functions
###############################################################################

print_header() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                   JasBoard Installer                         ║"
    echo "║              Personal Information Dashboard                  ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_step() {
    echo ""
    echo -e "${BLUE}━━━ $1 ━━━${NC}"
}

check_raspberry_pi() {
    print_step "Checking if running on Raspberry Pi"

    if [ ! -f /proc/device-tree/model ]; then
        print_error "This doesn't appear to be a Raspberry Pi"
        exit 1
    fi

    PI_MODEL=$(cat /proc/device-tree/model)
    print_success "Detected: $PI_MODEL"

    # Check available memory
    AVAILABLE_MEMORY=$(free -m | awk '/^Mem:/{print $2}')
    print_info "Available memory: ${AVAILABLE_MEMORY}MB"

    if [ "$AVAILABLE_MEMORY" -lt "$REQUIRED_MEMORY_MB" ]; then
        print_warning "Low memory detected. JasBoard may run slowly."
        print_warning "Consider using a Pi 3B+ or Pi 4 for best performance."
    fi
}

check_internet() {
    print_step "Checking internet connection"

    if ping -c 1 google.com &> /dev/null; then
        print_success "Internet connection OK"
    else
        print_error "No internet connection detected"
        print_info "Please connect to the internet and try again"
        exit 1
    fi
}

install_nodejs() {
    print_step "Installing Node.js ${NODE_VERSION}"

    # Check if Node.js is already installed
    if command -v node &> /dev/null; then
        CURRENT_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$CURRENT_VERSION" -ge "$NODE_VERSION" ]; then
            print_success "Node.js $CURRENT_VERSION is already installed"
            return
        fi
    fi

    print_info "Installing Node.js ${NODE_VERSION}..."

    # Add NodeSource repository with GPG policy bypass
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash - || {
        print_warning "Standard setup had warnings, continuing anyway..."
    }

    # Update package lists and install, bypassing GPG checks if needed
    sudo apt update --allow-releaseinfo-change 2>&1 | grep -v "Policy will reject" || true

    # Try normal install first
    if sudo apt install -y nodejs 2>&1 | grep -v "Policy will reject"; then
        print_success "Node.js installed successfully"
    elif sudo apt install -y nodejs --allow-unauthenticated 2>&1 | grep -v "Policy will reject"; then
        print_warning "Node.js installed with authentication bypass"
    else
        print_error "Failed to install via apt, trying alternative method..."

        # Fallback: Install using n (node version manager)
        curl -fsSL https://raw.githubusercontent.com/tj/n/master/bin/n -o /tmp/n
        sudo bash /tmp/n lts
        sudo npm install -g n
        sudo n ${NODE_VERSION}
    fi

    # Verify installation
    if command -v node &> /dev/null; then
        print_success "Node.js $(node -v) installed"
        print_success "npm $(npm -v) installed"
    else
        print_error "Node.js installation failed"
        exit 1
    fi
}

install_system_dependencies() {
    print_step "Installing system dependencies"

    print_info "Updating package lists..."
    sudo apt update

    print_info "Installing required packages..."
    sudo apt install \
        git \
        xinit \
        xserver-xorg \
        x11-xserver-utils \
        chromium \
        unclutter \
        avahi-daemon -y

    print_success "System dependencies installed"
}

clone_or_update_repo() {
    print_step "Setting up JasBoard repository"

    if [ -d "$INSTALL_DIR" ]; then
        print_warning "JasBoard directory already exists"
        read -p "Do you want to update the existing installation? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cd "$INSTALL_DIR"
            print_info "Pulling latest changes..."
            git pull
            print_success "Repository updated"
        else
            print_info "Using existing installation"
        fi
    else
        print_info "Cloning repository to $INSTALL_DIR..."
        git clone https://github.com/jdinkelmann/jasboard.git "$INSTALL_DIR"
        print_success "Repository cloned"
    fi
}

setup_environment() {
    print_step "Setting up environment configuration"

    cd "$INSTALL_DIR"

    if [ ! -f .env.local ]; then
        if [ -f .env.local.example ]; then
            print_info "Creating .env.local from example..."
            cp .env.local.example .env.local

            print_warning "Important: You need to configure Google OAuth credentials!"
            print_info "Edit $INSTALL_DIR/.env.local and add your credentials"
            print_info "Get credentials from: https://console.cloud.google.com/apis/credentials"

            read -p "Press Enter to continue after you've added credentials, or Ctrl+C to exit and configure later..."
        else
            print_error ".env.local.example not found"
            print_info "You'll need to create .env.local manually"
        fi
    else
        print_success ".env.local already exists"
    fi
}

ensure_swap_space() {
    print_step "Checking swap space"

    # Check current swap size
    CURRENT_SWAP=$(free -m | grep Swap | awk '{print $2}')

    if [ "$CURRENT_SWAP" -lt 1024 ]; then
        print_warning "Swap space is ${CURRENT_SWAP}MB (recommended: 1024MB+)"
        print_info "Increasing swap to 1024MB for build process..."

        sudo dphys-swapfile swapoff 2>/dev/null || true
        sudo sed -i 's/^CONF_SWAPSIZE=.*/CONF_SWAPSIZE=1024/' /etc/dphys-swapfile
        sudo dphys-swapfile setup
        sudo dphys-swapfile swapon

        print_success "Swap increased to 1024MB"
    else
        print_success "Swap space is adequate (${CURRENT_SWAP}MB)"
    fi
}

build_application() {
    print_step "Building JasBoard application"

    cd "$INSTALL_DIR"

    print_info "Installing dependencies (this may take a few minutes)..."
    npm ci

    print_info "Building application (this may take 5-10 minutes on Pi)..."
    # Increase Node.js heap size for build on memory-constrained devices
    NODE_OPTIONS="--max-old-space-size=2048" npm run build

    print_info "Removing devDependencies to save space..."
    npm prune --production

    print_success "Application built successfully"
}

setup_systemd_service() {
    print_step "Setting up systemd service"

    # Create systemd service file
    sudo tee /etc/systemd/system/jasboard.service > /dev/null <<EOF
[Unit]
Description=JasBoard Dashboard
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$INSTALL_DIR
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    # Reload systemd and enable service
    sudo systemctl daemon-reload
    sudo systemctl enable jasboard.service
    sudo systemctl start jasboard.service

    print_success "JasBoard service installed and started"

    # Check service status
    sleep 2
    if sudo systemctl is-active --quiet jasboard.service; then
        print_success "JasBoard service is running"
    else
        print_warning "JasBoard service may not have started correctly"
        print_info "Check logs with: sudo journalctl -u jasboard.service -f"
    fi
}

setup_hostname() {
    print_step "Setting up hostname"

    CURRENT_HOSTNAME=$(hostname)

    if [ "$CURRENT_HOSTNAME" != "jasboard" ]; then
        print_info "Setting hostname to 'jasboard'..."
        echo "jasboard" | sudo tee /etc/hostname > /dev/null
        sudo sed -i "s/$CURRENT_HOSTNAME/jasboard/g" /etc/hosts
        print_success "Hostname set to 'jasboard' (will take effect after reboot)"
    else
        print_success "Hostname already set to 'jasboard'"
    fi

    # Ensure Avahi is running for mDNS
    sudo systemctl enable avahi-daemon
    sudo systemctl start avahi-daemon
    print_success "mDNS configured (accessible at jasboard.local)"
}

setup_kiosk_mode() {
    print_step "Setting up Chromium kiosk mode"

    # Run the kiosk setup script
    if [ -f "$INSTALL_DIR/scripts/setup-kiosk.sh" ]; then
        bash "$INSTALL_DIR/scripts/setup-kiosk.sh"
        print_success "Kiosk mode configured"
    else
        print_warning "Kiosk setup script not found"
        print_info "You can set up kiosk mode manually later"
    fi
}

print_completion() {
    print_step "Installation Complete!"

    # Get IP address
    IP_ADDRESS=$(hostname -I | awk '{print $1}')

    echo ""
    print_success "JasBoard has been successfully installed!"
    echo ""
    print_info "Access your dashboard at:"
    echo -e "  ${GREEN}• http://jasboard.local:3000${NC}"
    echo -e "  ${GREEN}• http://$IP_ADDRESS:3000${NC}"
    echo ""
    print_info "Admin interface:"
    echo -e "  ${GREEN}• http://jasboard.local:3000/admin${NC}"
    echo ""
    print_info "Useful commands:"
    echo "  • View logs:    sudo journalctl -u jasboard.service -f"
    echo "  • Restart:      sudo systemctl restart jasboard.service"
    echo "  • Update:       cd $INSTALL_DIR && bash update.sh"
    echo "  • Reboot Pi:    sudo reboot"
    echo ""

    if [ "$CURRENT_HOSTNAME" != "jasboard" ]; then
        print_warning "Reboot required for hostname change to take effect"
        read -p "Reboot now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Rebooting..."
            sudo reboot
        fi
    fi

    print_info "Installation log saved to: $INSTALL_DIR/install.log"
}

###############################################################################
# Main Installation Flow
###############################################################################

main() {
    # Redirect output to log file as well as console
    exec > >(tee -a "$HOME/jasboard-install.log")
    exec 2>&1

    print_header

    print_info "Starting installation..."
    print_info "This will take approximately 10-15 minutes"
    echo ""

    check_raspberry_pi
    check_internet
    install_nodejs
    install_system_dependencies
    clone_or_update_repo
    setup_environment
    ensure_swap_space
    build_application
    setup_systemd_service
    setup_hostname
    setup_kiosk_mode
    print_completion
}

# Run main function
main
