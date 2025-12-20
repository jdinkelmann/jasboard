#!/bin/bash

# Wait for X server to be fully ready
sleep 15

# Rotate display to portrait mode (adjust "left" to "right" if upside down)
DISPLAY=:0 xrandr --output HDMI-2 --rotate right
sleep 2

# Disable screensaver and power management
bash $HOME/.config/disable-screensaver.sh

# Hide mouse cursor (unclutter)
unclutter -idle 1 -root &

# Wait for JasBoard service to be ready
sleep 5

# Start Chromium in kiosk mode with explicit window size for portrait mode
chromium \
  --kiosk \
  --window-size=1080,1920 \
  --force-device-scale-factor=1 \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-component-update \
  --check-for-update-interval=31536000 \
  --app=http://localhost:3000
