#!/bin/bash

###############################################################################
# Fix JasBoard systemd service
# This script recreates the systemd service with the correct configuration
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
print_error() { echo -e "${RED}✗ $1${NC}"; }

echo ""
print_info "Fixing JasBoard systemd service..."
echo ""

# Get the install directory
INSTALL_DIR="$HOME/jasboard"

if [ ! -d "$INSTALL_DIR" ]; then
    print_error "JasBoard directory not found at $INSTALL_DIR"
    exit 1
fi

# Get the full path to node and npm
NODE_PATH=$(which node)
NPM_PATH=$(which npm)

print_info "Node path: $NODE_PATH"
print_info "NPM path: $NPM_PATH"
print_info "Install directory: $INSTALL_DIR"

# Stop the existing service if it's running
if sudo systemctl is-active jasboard.service &> /dev/null; then
    print_info "Stopping existing service..."
    sudo systemctl stop jasboard.service
fi

# Create the fixed systemd service file
print_info "Creating systemd service file..."

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
Environment=PATH=/usr/local/bin:/usr/bin:/bin
ExecStart=$NPM_PATH start --prefix $INSTALL_DIR
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

print_success "Service file created"

# Reload systemd daemon
print_info "Reloading systemd daemon..."
sudo systemctl daemon-reload

# Enable the service
print_info "Enabling service..."
sudo systemctl enable jasboard.service

# Start the service
print_info "Starting service..."
sudo systemctl start jasboard.service

# Wait a moment for service to start
sleep 3

# Check status
echo ""
if sudo systemctl is-active jasboard.service &> /dev/null; then
    print_success "Service is running!"
    echo ""
    print_info "Service status:"
    sudo systemctl status jasboard.service --no-pager -l | head -20
else
    print_error "Service failed to start"
    echo ""
    print_info "Checking logs..."
    sudo journalctl -u jasboard.service -n 30 --no-pager
    exit 1
fi

echo ""
print_success "Service fixed and started successfully!"
echo ""
print_info "Useful commands:"
echo "  • Check status:  sudo systemctl status jasboard.service"
echo "  • View logs:     sudo journalctl -u jasboard.service -f"
echo "  • Restart:       sudo systemctl restart jasboard.service"
echo ""
