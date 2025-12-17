#!/bin/bash

###############################################################################
# Rebuild JasBoard Application
# This script cleanly rebuilds the Next.js application
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

INSTALL_DIR="$HOME/jasboard"

echo ""
print_info "Rebuilding JasBoard Application"
echo ""

# Check directory exists
if [ ! -d "$INSTALL_DIR" ]; then
    print_error "JasBoard directory not found at $INSTALL_DIR"
    exit 1
fi

cd "$INSTALL_DIR"

# Stop the service first
print_info "Stopping JasBoard service..."
sudo systemctl stop jasboard.service
print_success "Service stopped"

# Clean old build
print_info "Cleaning old build files..."
rm -rf .next
print_success "Old build files removed"

# Ensure dependencies are installed
print_info "Checking dependencies..."
if [ ! -d "node_modules" ]; then
    print_info "Installing dependencies..."
    npm ci
else
    print_success "Dependencies already installed"
fi

# Build application
print_info "Building application (this may take 5-10 minutes)..."
echo ""

# Set Node options for memory-constrained devices
export NODE_OPTIONS="--max-old-space-size=2048"

if npm run build; then
    echo ""
    print_success "Build completed successfully!"
else
    echo ""
    print_error "Build failed!"
    print_info "Check the error messages above"
    exit 1
fi

# Verify build output
echo ""
print_info "Verifying build output..."

REQUIRED_FILES=(
    ".next/BUILD_ID"
    ".next/prerender-manifest.json"
    ".next/routes-manifest.json"
    ".next/build-manifest.json"
)

ALL_GOOD=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file exists"
    else
        print_error "$file is MISSING"
        ALL_GOOD=false
    fi
done

if [ "$ALL_GOOD" = false ]; then
    print_error "Build verification failed - some files are missing"
    exit 1
fi

echo ""
print_success "Build verification passed!"

# Start the service
echo ""
print_info "Starting JasBoard service..."
sudo systemctl start jasboard.service

# Wait for service to start
sleep 3

# Check if service is running
if sudo systemctl is-active jasboard.service &> /dev/null; then
    print_success "Service is running!"

    # Wait for server to respond
    print_info "Waiting for server to respond..."
    MAX_ATTEMPTS=30
    ATTEMPT=0
    until curl -s http://localhost:3000 > /dev/null 2>&1; do
        ATTEMPT=$((ATTEMPT + 1))
        if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
            print_error "Server did not respond after $MAX_ATTEMPTS seconds"
            print_info "Check logs with: sudo journalctl -u jasboard.service -f"
            exit 1
        fi
        sleep 1
    done

    print_success "Server is responding at http://localhost:3000"
else
    print_error "Service failed to start"
    print_info "Checking logs..."
    echo ""
    sudo journalctl -u jasboard.service -n 20 --no-pager
    exit 1
fi

echo ""
print_success "Rebuild complete! JasBoard is running successfully."
echo ""
print_info "Access your dashboard at:"
echo "  • http://localhost:3000"
echo "  • http://jasboard.local:3000"
echo ""
print_info "View logs with: sudo journalctl -u jasboard.service -f"
echo ""
