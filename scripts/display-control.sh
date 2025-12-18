#!/bin/bash

################################################################################
# Display Control Wrapper Script
# Properly handles X server access and power management for cron jobs
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
    # Turn display on
    /usr/bin/xset dpms force on

    # CRITICAL: Disable automatic power management to prevent auto-shutoff
    # This ensures the display stays on until the "off" cron job runs
    /usr/bin/xset s off          # Disable screen saver
    /usr/bin/xset s noblank      # Don't blank the screen
    /usr/bin/xset -dpms          # Disable DPMS (Display Power Management)

    exit 0
elif [ "$COMMAND" = "off" ]; then
    # Turn display off
    # Note: We could re-enable DPMS here, but it's not necessary
    # since we're forcing the display off anyway
    /usr/bin/xset dpms force off
    exit 0
else
    echo "Usage: $0 {on|off}"
    exit 1
fi
