#!/bin/bash

################################################################################
# Display Control Wrapper Script
# Properly handles X server access for cron jobs
################################################################################

# Set up X display environment
export DISPLAY=:0

# Try to find the X authority file
if [ -f "$HOME/.Xauthority" ]; then
    export XAUTHORITY="$HOME/.Xauthority"
elif [ -f "/home/jas/.Xauthority" ]; then
    export XAUTHORITY="/home/jas/.Xauthority"
fi

# Get the command (on/off)
COMMAND="$1"

if [ "$COMMAND" = "on" ]; then
    /usr/bin/xset dpms force on
    # Also wake up the display if it's in standby
    /usr/bin/xset -dpms
    /usr/bin/xset s off
    /usr/bin/xset +dpms
    exit 0
elif [ "$COMMAND" = "off" ]; then
    /usr/bin/xset dpms force off
    exit 0
else
    echo "Usage: $0 {on|off}"
    exit 1
fi
