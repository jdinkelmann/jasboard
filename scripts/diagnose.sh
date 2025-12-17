#!/bin/bash

###############################################################################
# JasBoard Diagnostic Script
# Run this on your Raspberry Pi to check service status and configuration
###############################################################################

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
print_header() { echo -e "\n${BLUE}━━━ $1 ━━━${NC}\n"; }

print_header "JasBoard Diagnostic Report"

###############################################################################
# Check installation directory
###############################################################################

print_header "Installation Directory"

if [ -d ~/jasboard ]; then
    print_success "JasBoard directory exists at ~/jasboard"
    cd ~/jasboard
    pwd
else
    print_error "JasBoard directory NOT found at ~/jasboard"
    exit 1
fi

###############################################################################
# Check if .next folder exists
###############################################################################

print_header "Build Status"

if [ -d ~/jasboard/.next ]; then
    print_success ".next folder exists (build completed)"
    echo "Build time: $(stat -c %y ~/jasboard/.next 2>/dev/null || stat -f '%Sm' ~/jasboard/.next 2>/dev/null)"
else
    print_error ".next folder MISSING - application has not been built!"
    echo ""
    print_info "To build the application, run:"
    echo "  cd ~/jasboard"
    echo "  npm run build"
    echo ""
fi

###############################################################################
# Check node_modules
###############################################################################

print_header "Dependencies"

if [ -d ~/jasboard/node_modules ]; then
    print_success "node_modules exists"
else
    print_error "node_modules MISSING - dependencies not installed!"
    echo ""
    print_info "To install dependencies, run:"
    echo "  cd ~/jasboard"
    echo "  npm ci"
    echo ""
fi

###############################################################################
# Check Node.js version
###############################################################################

print_header "Node.js Environment"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js installed: $NODE_VERSION"
else
    print_error "Node.js NOT installed!"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_success "npm installed: $NPM_VERSION"
else
    print_error "npm NOT installed!"
fi

###############################################################################
# Check systemd service
###############################################################################

print_header "Systemd Service"

if [ -f /etc/systemd/system/jasboard.service ]; then
    print_success "jasboard.service file exists"

    if systemctl is-enabled jasboard.service &> /dev/null; then
        print_success "Service is enabled (will start on boot)"
    else
        print_warning "Service is NOT enabled"
        echo "  Run: sudo systemctl enable jasboard.service"
    fi

    if systemctl is-active jasboard.service &> /dev/null; then
        print_success "Service is RUNNING"
    else
        print_error "Service is NOT running"
        echo ""
        print_info "Service status:"
        systemctl status jasboard.service --no-pager -l
        echo ""
        print_info "Recent logs:"
        journalctl -u jasboard.service -n 20 --no-pager
    fi
else
    print_error "jasboard.service NOT found!"
    echo ""
    print_info "Service should be at: /etc/systemd/system/jasboard.service"
fi

###############################################################################
# Check if port 3000 is in use
###############################################################################

print_header "Network Status"

if command -v lsof &> /dev/null; then
    if sudo lsof -i :3000 &> /dev/null; then
        print_success "Port 3000 is in use:"
        sudo lsof -i :3000
    else
        print_warning "Port 3000 is NOT in use (server not running)"
    fi
else
    print_info "lsof not available, skipping port check"
fi

# Try to connect to the server
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_success "Server is responding on http://localhost:3000"
else
    print_error "Server is NOT responding on http://localhost:3000"
fi

###############################################################################
# Check environment file
###############################################################################

print_header "Configuration"

if [ -f ~/jasboard/.env.local ]; then
    print_success ".env.local exists"
    print_info "Environment variables set:"
    grep -E '^[A-Z_]+=' ~/jasboard/.env.local | cut -d'=' -f1 | sed 's/^/  - /'
else
    print_warning ".env.local NOT found"
fi

if [ -f ~/jasboard/config.json ]; then
    print_success "config.json exists"
else
    print_info "config.json not yet created (will be created on first run)"
fi

###############################################################################
# Summary and recommendations
###############################################################################

print_header "Summary"

# Determine what needs to be fixed
NEEDS_BUILD=false
NEEDS_DEPS=false
NEEDS_SERVICE_START=false

[ ! -d ~/jasboard/.next ] && NEEDS_BUILD=true
[ ! -d ~/jasboard/node_modules ] && NEEDS_DEPS=true
! systemctl is-active jasboard.service &> /dev/null && NEEDS_SERVICE_START=true

if [ "$NEEDS_DEPS" = true ] || [ "$NEEDS_BUILD" = true ] || [ "$NEEDS_SERVICE_START" = true ]; then
    print_warning "Issues detected. Follow these steps to fix:\n"

    if [ "$NEEDS_DEPS" = true ]; then
        echo "1. Install dependencies:"
        echo "   cd ~/jasboard && npm ci"
        echo ""
    fi

    if [ "$NEEDS_BUILD" = true ]; then
        echo "2. Build the application:"
        echo "   cd ~/jasboard && npm run build"
        echo ""
    fi

    if [ "$NEEDS_SERVICE_START" = true ]; then
        echo "3. Start the service:"
        echo "   sudo systemctl start jasboard.service"
        echo "   sudo systemctl enable jasboard.service"
        echo ""
    fi

    echo "4. Check status:"
    echo "   sudo systemctl status jasboard.service"
    echo ""
else
    print_success "Everything looks good!"
fi

print_header "End of Diagnostic Report"
