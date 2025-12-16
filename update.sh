#!/bin/bash

###############################################################################
# JasBoard Update Script
#
# This script updates JasBoard to the latest version from git
#
# Usage: bash update.sh
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
BACKUP_DIR="$HOME/jasboard-backups"

###############################################################################
# Helper Functions
###############################################################################

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

###############################################################################
# Update Functions
###############################################################################

check_directory() {
    if [ ! -d "$INSTALL_DIR" ]; then
        print_error "JasBoard installation not found at $INSTALL_DIR"
        print_info "Please run the install script first"
        exit 1
    fi

    cd "$INSTALL_DIR"
}

backup_config() {
    print_step "Backing up configuration"

    # Create backup directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"

    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/config_backup_$TIMESTAMP.tar.gz"

    # Backup config files
    tar -czf "$BACKUP_FILE" \
        .env.local \
        config.json \
        2>/dev/null || true

    if [ -f "$BACKUP_FILE" ]; then
        print_success "Configuration backed up to $BACKUP_FILE"
    else
        print_warning "No configuration files to backup"
    fi
}

check_for_updates() {
    print_step "Checking for updates"

    # Fetch latest changes
    git fetch origin

    # Get current and remote commit hashes
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse @{u})

    if [ "$LOCAL" = "$REMOTE" ]; then
        print_success "JasBoard is already up to date"
        read -p "Do you want to rebuild anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 0
        fi
    else
        print_info "Updates available"

        # Show what changed
        echo ""
        print_info "Changes since your version:"
        git log --oneline HEAD..@{u} | head -5
        echo ""
    fi
}

pull_updates() {
    print_step "Pulling latest code"

    git pull origin main || git pull origin master

    print_success "Code updated"
}

update_dependencies() {
    print_step "Updating dependencies"

    print_info "Checking for dependency changes..."

    # Clean install dependencies
    npm ci --production

    print_success "Dependencies updated"
}

rebuild_application() {
    print_step "Rebuilding application"

    print_info "Building..."
    npm run build

    print_success "Build completed"
}

restart_service() {
    print_step "Restarting JasBoard service"

    if sudo systemctl is-active --quiet jasboard.service; then
        sudo systemctl restart jasboard.service

        # Wait for service to start
        sleep 3

        if sudo systemctl is-active --quiet jasboard.service; then
            print_success "JasBoard service restarted successfully"
        else
            print_error "JasBoard service failed to restart"
            print_info "Check logs with: sudo journalctl -u jasboard.service -f"
            exit 1
        fi
    else
        print_warning "JasBoard service is not running"
        print_info "Starting service..."
        sudo systemctl start jasboard.service

        sleep 3

        if sudo systemctl is-active --quiet jasboard.service; then
            print_success "JasBoard service started"
        else
            print_error "Failed to start JasBoard service"
            exit 1
        fi
    fi
}

print_completion() {
    print_step "Update Complete!"

    # Get IP address
    IP_ADDRESS=$(hostname -I | awk '{print $1}')

    echo ""
    print_success "JasBoard has been updated successfully!"
    echo ""
    print_info "Access your dashboard at:"
    echo -e "  ${GREEN}• http://jasboard.local:3000${NC}"
    echo -e "  ${GREEN}• http://$IP_ADDRESS:3000${NC}"
    echo ""
    print_info "View logs: sudo journalctl -u jasboard.service -f"
    echo ""
}

###############################################################################
# Main Update Flow
###############################################################################

main() {
    # Redirect output to log file as well as console
    exec > >(tee -a "$INSTALL_DIR/update.log")
    exec 2>&1

    echo ""
    print_info "JasBoard Update Script"
    print_info "======================="
    echo ""

    check_directory
    backup_config
    check_for_updates
    pull_updates
    update_dependencies
    rebuild_application
    restart_service
    print_completion
}

# Run main function
main
