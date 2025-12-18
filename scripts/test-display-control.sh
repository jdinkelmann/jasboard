#!/bin/bash

################################################################################
# Display Control Test Script
# Tests different methods to turn display on/off
################################################################################

echo "=========================================="
echo "Testing Display Control Methods"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "Current display status:"
echo ""

# Method 1: vcgencmd
echo "1. Testing vcgencmd..."
if command -v vcgencmd &> /dev/null; then
    echo "   Current state: $(vcgencmd display_power)"
    echo -e "${YELLOW}   Turn OFF: vcgencmd display_power 0${NC}"
    echo -e "${YELLOW}   Turn ON:  vcgencmd display_power 1${NC}"
else
    echo -e "${RED}   vcgencmd not found${NC}"
fi
echo ""

# Method 2: tvservice
echo "2. Testing tvservice..."
if command -v tvservice &> /dev/null; then
    tvservice -s
    echo -e "${YELLOW}   Turn OFF: tvservice -o${NC}"
    echo -e "${YELLOW}   Turn ON:  tvservice -p && fbset -depth 8 && fbset -depth 16${NC}"
else
    echo -e "${RED}   tvservice not found${NC}"
fi
echo ""

# Method 3: xset
echo "3. Testing xset..."
if command -v xset &> /dev/null; then
    if [ -n "$DISPLAY" ]; then
        DISPLAY_VAR="$DISPLAY"
    else
        DISPLAY_VAR=":0"
    fi

    DISPLAY=$DISPLAY_VAR xset q | grep "DPMS" || echo "DPMS not available"
    echo -e "${YELLOW}   Turn OFF: DISPLAY=:0 xset dpms force off${NC}"
    echo -e "${YELLOW}   Turn ON:  DISPLAY=:0 xset dpms force on${NC}"
else
    echo -e "${RED}   xset not found${NC}"
fi
echo ""

# Method 4: CEC
echo "4. Testing HDMI CEC..."
if command -v cec-client &> /dev/null; then
    echo -e "${GREEN}   cec-client found${NC}"
    echo -e "${YELLOW}   Turn OFF: echo 'standby 0' | cec-client -s -d 1${NC}"
    echo -e "${YELLOW}   Turn ON:  echo 'on 0' | cec-client -s -d 1${NC}"
else
    echo -e "${RED}   cec-client not found${NC}"
    echo "   Install with: sudo apt install cec-utils"
fi
echo ""

echo "=========================================="
echo "Interactive Testing"
echo "=========================================="
echo ""
echo "Choose a method to test:"
echo "  1) vcgencmd (Raspberry Pi)"
echo "  2) tvservice (HDMI)"
echo "  3) xset (X Server DPMS)"
echo "  4) Skip testing"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "Testing vcgencmd..."
        echo "Turning OFF in 3 seconds..."
        sleep 3
        vcgencmd display_power 0
        echo "Display should be OFF. Check status:"
        vcgencmd display_power
        echo ""
        read -p "Press Enter to turn back ON..."
        vcgencmd display_power 1
        echo "Display should be ON. Status:"
        vcgencmd display_power
        ;;
    2)
        echo ""
        echo "Testing tvservice..."
        echo "Turning OFF in 3 seconds..."
        sleep 3
        sudo tvservice -o
        echo ""
        read -p "Press Enter to turn back ON..."
        sudo tvservice -p
        sudo fbset -depth 8
        sudo fbset -depth 16
        echo "Display should be back ON"
        ;;
    3)
        echo ""
        echo "Testing xset..."
        echo "Turning OFF in 3 seconds..."
        sleep 3
        DISPLAY=:0 xset dpms force off
        echo ""
        read -p "Press Enter to turn back ON..."
        DISPLAY=:0 xset dpms force on
        echo "Display should be back ON"
        ;;
    4)
        echo "Skipping test."
        ;;
    *)
        echo "Invalid choice."
        ;;
esac

echo ""
echo "=========================================="
echo "Recommendations:"
echo "=========================================="
echo ""
echo "Based on what works for your setup, you can:"
echo "1. Update scripts/setup-display-schedule.sh"
echo "2. Replace 'vcgencmd display_power' with the working command"
echo ""
