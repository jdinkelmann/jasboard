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
    # CRITICAL: Re-enable DPMS first so we can actually turn off the display
    # (The "on" command disables DPMS, so we must re-enable it here)
    /usr/bin/xset +dpms          # Enable DPMS
    /usr/bin/xset dpms force off # Force display off
    exit 0
else
    echo "Usage: $0 {on|off}"
    exit 1
fi
