#!/bin/bash

################################################################################
# JasBoard Display Schedule Setup
#
# Sets up cron jobs to automatically turn the monitor on/off:
# - Monday-Friday: ON at 6am, OFF at 9pm
# - Saturday-Sunday: ON at 10am, OFF at 9pm
################################################################################

set -e

echo "=========================================="
echo "JasBoard Display Schedule Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Detect which display control method to use
echo "Detecting display control method..."
CONTROL_METHOD=""
CONTROL_CMD_OFF=""
CONTROL_CMD_ON=""

# Try vcgencmd first
if command -v vcgencmd &> /dev/null && vcgencmd display_power > /dev/null 2>&1; then
    CONTROL_METHOD="vcgencmd"
    CONTROL_CMD_OFF="/usr/bin/vcgencmd display_power 0"
    CONTROL_CMD_ON="/usr/bin/vcgencmd display_power 1"
    echo -e "${GREEN}✓ Using vcgencmd${NC}"
# Try xset (for X server / kiosk mode)
elif command -v xset &> /dev/null; then
    CONTROL_METHOD="xset"
    CONTROL_CMD_OFF="DISPLAY=:0 /usr/bin/xset dpms force off"
    CONTROL_CMD_ON="DISPLAY=:0 /usr/bin/xset dpms force on"
    echo -e "${GREEN}✓ Using xset (X server DPMS)${NC}"
# Try tvservice
elif command -v tvservice &> /dev/null; then
    CONTROL_METHOD="tvservice"
    CONTROL_CMD_OFF="/usr/bin/tvservice -o"
    CONTROL_CMD_ON="/usr/bin/tvservice -p && /bin/fbset -depth 8 && /bin/fbset -depth 16"
    echo -e "${GREEN}✓ Using tvservice${NC}"
else
    echo -e "${RED}ERROR: No display control method found${NC}"
    echo "Please run scripts/test-display-control.sh to find a working method"
    exit 1
fi

echo "  Method: $CONTROL_METHOD"
echo "  OFF command: $CONTROL_CMD_OFF"
echo "  ON command: $CONTROL_CMD_ON"

echo ""
echo "Schedule to be configured:"
echo "  Monday-Friday:"
echo "    - Turn ON at 6:00 AM"
echo "    - Turn OFF at 9:00 PM"
echo "  Saturday-Sunday:"
echo "    - Turn ON at 10:00 AM"
echo "    - Turn OFF at 9:00 PM"
echo ""

# Backup existing crontab
echo "Creating backup of current crontab..."
BACKUP_FILE="/tmp/crontab_backup_$(date +%Y%m%d_%H%M%S).txt"
crontab -l > "$BACKUP_FILE" 2>/dev/null || echo "# New crontab" > "$BACKUP_FILE"
echo -e "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"

# Get current crontab
CURRENT_CRON=$(crontab -l 2>/dev/null || echo "")

# Check if display schedule already exists
if echo "$CURRENT_CRON" | grep -q -E "vcgencmd display_power|xset dpms force|tvservice -[op]"; then
    echo -e "${YELLOW}Display schedule entries already exist in crontab${NC}"
    echo ""
    read -p "Do you want to remove existing entries and add fresh ones? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled. No changes made."
        exit 0
    fi

    # Remove existing display schedule entries
    echo "Removing existing display schedule entries..."
    CURRENT_CRON=$(echo "$CURRENT_CRON" | grep -v -E "vcgencmd display_power|xset dpms force|tvservice -[op]|JasBoard Display Schedule")
fi

# Create new cron entries
echo ""
echo "Adding new display schedule entries..."

# Create temporary file with new crontab
TEMP_CRON=$(mktemp)

# Add existing cron jobs (if any)
if [ -n "$CURRENT_CRON" ]; then
    echo "$CURRENT_CRON" > "$TEMP_CRON"
    echo "" >> "$TEMP_CRON"
fi

# Add display schedule entries
cat >> "$TEMP_CRON" << EOF
# JasBoard Display Schedule (using $CONTROL_METHOD)
# Monday-Friday: Turn ON at 6am
0 6 * * 1-5 $CONTROL_CMD_ON > /dev/null 2>&1

# Monday-Friday: Turn OFF at 9pm
0 21 * * 1-5 $CONTROL_CMD_OFF > /dev/null 2>&1

# Saturday-Sunday: Turn ON at 10am
0 10 * * 0,6 $CONTROL_CMD_ON > /dev/null 2>&1

# Saturday-Sunday: Turn OFF at 9pm
0 21 * * 0,6 $CONTROL_CMD_OFF > /dev/null 2>&1
EOF

# Install new crontab
crontab "$TEMP_CRON"
rm "$TEMP_CRON"

echo -e "${GREEN}✓ Display schedule installed${NC}"
echo ""

# Show current crontab
echo "Current crontab:"
echo "----------------------------------------"
crontab -l
echo "----------------------------------------"
echo ""

# Test the commands
echo "Testing display control..."
if [ "$CONTROL_METHOD" = "vcgencmd" ]; then
    echo "Current display power state:"
    vcgencmd display_power
fi

echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo "Manual control commands (using $CONTROL_METHOD):"
echo "  Turn display ON:  $CONTROL_CMD_ON"
echo "  Turn display OFF: $CONTROL_CMD_OFF"
echo ""
echo "To view your cron jobs:"
echo "  crontab -l"
echo ""
echo "To remove the schedule:"
echo "  crontab -e"
echo "  (then delete the JasBoard Display Schedule lines)"
echo ""
echo "To restore from backup:"
echo "  crontab $BACKUP_FILE"
echo ""
