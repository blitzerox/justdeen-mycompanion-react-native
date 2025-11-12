#!/bin/bash

###############################################################################
# JustDeen MyCompanion - iPhone Testing Script
###############################################################################
# This script automates the process of building, installing, and launching
# the app on a physical iPhone device for testing.
#
# Usage:
#   ./test-on-iphone.sh [device-name-or-id]
#
# Examples:
#   ./test-on-iphone.sh                    # Auto-detect connected device
#   ./test-on-iphone.sh "Husain's iPhone"  # Use specific device name
#   ./test-on-iphone.sh 00008140-001C...   # Use device UDID
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WORKSPACE="ios/JustDeenMyCompanion.xcworkspace"
SCHEME="JustDeenMyCompanion"
BUNDLE_ID="com.husainshah.justdeen"
BUILD_CONFIG="Debug"

###############################################################################
# Helper Functions
###############################################################################

print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

###############################################################################
# Device Detection
###############################################################################

detect_device() {
    print_step "Detecting connected iPhone devices..."

    # Get list of connected devices
    local devices=$(xcrun devicectl list devices 2>&1)

    if [ $? -ne 0 ]; then
        print_error "Failed to list devices. Is your iPhone connected and trusted?"
        exit 1
    fi

    # Extract device information
    # Format: Name, Hostname, Identifier, State, Model
    local device_count=$(echo "$devices" | grep -c "iPhone" || true)

    if [ "$device_count" -eq 0 ]; then
        print_error "No iPhone devices found. Please connect your iPhone and trust this computer."
        exit 1
    fi

    print_success "Found $device_count iPhone device(s)"

    # Parse device UDID using regex pattern (format: 8-4-4-4-12 hex digits)
    # Example line: Husain's iPhone   Husains-iPhone.coredevice.local   6DAECA40-FB8A-5C63-9A94-E63F3E8DA6DC   connected   iPhone 16 Plus (iPhone17,4)
    DEVICE_ID=$(echo "$devices" | grep "iPhone" | grep "connected" | head -1 | grep -o '[A-F0-9]\{8\}-[A-F0-9]\{4\}-[A-F0-9]\{4\}-[A-F0-9]\{4\}-[A-F0-9]\{12\}')

    if [ -z "$DEVICE_ID" ]; then
        print_error "Could not extract device UDID. Please check device connection."
        echo ""
        echo "Available devices:"
        echo "$devices"
        exit 1
    fi

    # Get device name for display (extract text before the first tab/multiple spaces)
    local device_name=$(echo "$devices" | grep "iPhone" | grep "connected" | head -1 | sed 's/  .*$//')

    print_success "Using device: $device_name ($DEVICE_ID)"
}

###############################################################################
# Build Process
###############################################################################

build_app() {
    print_step "Building iOS app..."

    cd "$PROJECT_ROOT"

    # Clean previous builds (optional, can be commented out for faster builds)
    # xcodebuild clean -workspace "$WORKSPACE" -scheme "$SCHEME" -configuration "$BUILD_CONFIG" > /dev/null 2>&1

    # Build the app
    xcodebuild \
        -workspace "$WORKSPACE" \
        -scheme "$SCHEME" \
        -configuration "$BUILD_CONFIG" \
        -destination "id=$DEVICE_ID" \
        build \
        CODE_SIGN_IDENTITY="" \
        CODE_SIGNING_REQUIRED=NO \
        CODE_SIGNING_ALLOWED=NO \
        | grep -E "error:|warning:|BUILD|note:" || true

    if [ ${PIPESTATUS[0]} -ne 0 ]; then
        print_error "Build failed. Check the errors above."
        exit 1
    fi

    print_success "Build completed successfully"
}

###############################################################################
# Find Built App
###############################################################################

find_built_app() {
    print_step "Locating built app..."

    # Find the .app bundle in DerivedData
    APP_PATH=$(find ~/Library/Developer/Xcode/DerivedData/JustDeenMyCompanion-* \
        -name "$SCHEME.app" \
        -path "*/$BUILD_CONFIG-iphoneos/*" \
        -type d \
        2>/dev/null | head -1)

    if [ -z "$APP_PATH" ]; then
        print_error "Could not find built .app bundle"
        exit 1
    fi

    print_success "Found app at: $APP_PATH"
}

###############################################################################
# Install App
###############################################################################

install_app() {
    print_step "Installing app on device..."

    xcrun devicectl device install app \
        --device "$DEVICE_ID" \
        "$APP_PATH" \
        2>&1 | grep -E "App installed|bundleID|error" || true

    if [ ${PIPESTATUS[0]} -ne 0 ]; then
        print_error "Installation failed"
        exit 1
    fi

    print_success "App installed successfully"
}

###############################################################################
# Start Metro Bundler
###############################################################################

start_metro() {
    print_step "Starting Metro bundler..."

    cd "$PROJECT_ROOT"

    # Check if Metro is already running
    if lsof -i :8081 > /dev/null 2>&1; then
        print_warning "Metro bundler already running on port 8081"
        return 0
    fi

    # Start Metro in background
    npx expo start --dev-client > metro.log 2>&1 &
    METRO_PID=$!

    # Wait for Metro to start
    print_step "Waiting for Metro to start..."
    local timeout=30
    local elapsed=0

    while [ $elapsed -lt $timeout ]; do
        if lsof -i :8081 > /dev/null 2>&1; then
            print_success "Metro bundler started (PID: $METRO_PID)"
            echo "$METRO_PID" > .metro.pid
            return 0
        fi
        sleep 1
        elapsed=$((elapsed + 1))
    done

    print_error "Metro bundler failed to start within $timeout seconds"
    exit 1
}

###############################################################################
# Launch App
###############################################################################

launch_app() {
    print_step "Launching app on device..."

    xcrun devicectl device process launch \
        --device "$DEVICE_ID" \
        "$BUNDLE_ID" \
        2>&1 | grep -E "Launched|error" || true

    if [ ${PIPESTATUS[0]} -ne 0 ]; then
        print_error "Failed to launch app"
        exit 1
    fi

    print_success "App launched successfully"
}

###############################################################################
# Stop Metro
###############################################################################

stop_metro() {
    if [ -f "$PROJECT_ROOT/.metro.pid" ]; then
        local pid=$(cat "$PROJECT_ROOT/.metro.pid")
        if ps -p $pid > /dev/null 2>&1; then
            print_step "Stopping Metro bundler (PID: $pid)..."
            kill $pid 2>/dev/null || true
            rm "$PROJECT_ROOT/.metro.pid"
            print_success "Metro bundler stopped"
        fi
    fi
}

###############################################################################
# Main Execution
###############################################################################

main() {
    print_header "JustDeen MyCompanion - iPhone Testing"

    # Handle device parameter
    if [ -n "$1" ]; then
        DEVICE_ID="$1"
        print_step "Using specified device: $DEVICE_ID"
    else
        detect_device
    fi

    # Execute build and deployment steps
    build_app
    find_built_app
    install_app
    start_metro
    launch_app

    print_header "Testing Complete!"

    echo -e "${GREEN}App is now running on your iPhone!${NC}"
    echo ""
    echo "Metro bundler is running in the background."
    echo "Check your iPhone to test the app."
    echo ""
    echo "Logs:"
    echo "  Metro bundler: $PROJECT_ROOT/metro.log"
    echo ""
    echo "To stop Metro bundler:"
    echo "  $0 --stop-metro"
    echo ""
}

###############################################################################
# Command Line Options
###############################################################################

case "${1:-}" in
    --stop-metro)
        stop_metro
        exit 0
        ;;
    --help|-h)
        echo "Usage: $0 [device-name-or-id]"
        echo ""
        echo "Options:"
        echo "  --stop-metro    Stop the Metro bundler"
        echo "  --help, -h      Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0                          # Auto-detect device"
        echo "  $0 \"Husain's iPhone\"        # Use specific device"
        echo "  $0 00008140-001C2CC8...    # Use device UDID"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
