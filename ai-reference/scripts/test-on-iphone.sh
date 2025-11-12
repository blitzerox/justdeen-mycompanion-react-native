#!/bin/bash

###############################################################################
# JustDeen MyCompanion - iPhone Testing Script
###############################################################################
# This script automates the process of building, installing, and launching
# the app on a physical iPhone device for testing.
#
# Usage:
#   ./test-on-iphone.sh [options] [device-name-or-id]
#
# Examples:
#   ./test-on-iphone.sh                    # Auto-detect device, prompt for clean
#   ./test-on-iphone.sh --no-prompt        # Skip clean prompt, use existing build
#   ./test-on-iphone.sh --clean            # Clean everything automatically
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

# Clean options (set by flags or prompt)
CLEAN_XCODE=false
CLEAN_METRO=false
PROMPT_CLEAN=true

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
# Clean Build/Cache
###############################################################################

prompt_clean_build() {
    if [ "$PROMPT_CLEAN" = false ]; then
        return
    fi
    
    echo ""
    echo -e "${YELLOW}╔════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  Clean Build Options                       ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════╝${NC}"
    echo ""
    echo "  ${BLUE}1)${NC} No clean ${GREEN}(faster, use existing build)${NC}"
    echo "  ${BLUE}2)${NC} Clean Xcode build only"
    echo "  ${BLUE}3)${NC} Clean Metro cache only"
    echo "  ${BLUE}4)${NC} Clean both Xcode + Metro ${YELLOW}(recommended for issues)${NC}"
    echo ""
    read -p "Select option [1-4] (default: 1): " clean_choice
    clean_choice=${clean_choice:-1}
    
    case $clean_choice in
        1)
            print_success "Using existing build"
            CLEAN_XCODE=false
            CLEAN_METRO=false
            ;;
        2)
            print_warning "Will clean Xcode build"
            CLEAN_XCODE=true
            CLEAN_METRO=false
            ;;
        3)
            print_warning "Will clean Metro cache"
            CLEAN_XCODE=false
            CLEAN_METRO=true
            ;;
        4)
            print_warning "Will clean both Xcode + Metro"
            CLEAN_XCODE=true
            CLEAN_METRO=true
            ;;
        *)
            print_error "Invalid option. Using default (no clean)"
            CLEAN_XCODE=false
            CLEAN_METRO=false
            ;;
    esac
    echo ""
}

clean_xcode_build() {
    print_step "Cleaning Xcode build artifacts..."
    
    cd "$PROJECT_ROOT"
    
    # Clean workspace
    print_step "  Running xcodebuild clean..."
    xcodebuild clean \
        -workspace "$WORKSPACE" \
        -scheme "$SCHEME" \
        -configuration "$BUILD_CONFIG" \
        > /dev/null 2>&1
    
    # Remove DerivedData for this project
    print_step "  Removing DerivedData..."
    rm -rf ~/Library/Developer/Xcode/DerivedData/JustDeenMyCompanion-*
    
    # Clean build folder
    if [ -d "ios/build" ]; then
        print_step "  Removing ios/build folder..."
        rm -rf ios/build
    fi
    
    print_success "Xcode build cleaned"
}

clean_metro_cache() {
    print_step "Cleaning Metro bundler cache..."
    
    cd "$PROJECT_ROOT"
    
    # Stop Metro if running
    if lsof -i :8081 > /dev/null 2>&1; then
        print_warning "  Stopping existing Metro bundler..."
        stop_metro
        sleep 1
    fi
    
    # Clean Metro cache using expo
    print_step "  Clearing Metro cache..."
    npx expo start --clear > /dev/null 2>&1 &
    local pid=$!
    sleep 3
    kill $pid 2>/dev/null || true
    
    # Clean watchman if available
    if command -v watchman > /dev/null 2>&1; then
        print_step "  Clearing watchman watches..."
        watchman watch-del-all > /dev/null 2>&1 || true
    fi
    
    # Clean temp directories
    if [ -d ".expo" ]; then
        print_step "  Cleaning .expo directory..."
        rm -rf .expo
    fi
    
    # Clean node_modules cache (optional)
    if [ -d "node_modules/.cache" ]; then
        print_step "  Cleaning node_modules cache..."
        rm -rf node_modules/.cache
    fi
    
    print_success "Metro cache cleaned"
}

perform_clean() {
    if [ "$CLEAN_XCODE" = true ] || [ "$CLEAN_METRO" = true ]; then
        print_header "Cleaning Build Artifacts"
    fi
    
    if [ "$CLEAN_XCODE" = true ]; then
        clean_xcode_build
    fi
    
    if [ "$CLEAN_METRO" = true ]; then
        clean_metro_cache
    fi
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
    local device_count=$(echo "$devices" | grep -c "iPhone" || true)

    if [ "$device_count" -eq 0 ]; then
        print_error "No iPhone devices found. Please connect your iPhone and trust this computer."
        exit 1
    fi

    print_success "Found $device_count iPhone device(s)"

    # Parse device UDID using regex pattern
    DEVICE_ID=$(echo "$devices" | grep "iPhone" | grep "connected" | head -1 | grep -o '[A-F0-9]\{8\}-[A-F0-9]\{4\}-[A-F0-9]\{4\}-[A-F0-9]\{4\}-[A-F0-9]\{12\}')

    if [ -z "$DEVICE_ID" ]; then
        print_error "Could not extract device UDID. Please check device connection."
        echo ""
        echo "Available devices:"
        echo "$devices"
        exit 1
    fi

    # Get device name for display
    local device_name=$(echo "$devices" | grep "iPhone" | grep "connected" | head -1 | sed 's/  .*$//')

    print_success "Using device: $device_name ($DEVICE_ID)"
}

###############################################################################
# Build Process
###############################################################################

build_app() {
    print_step "Building iOS app..."

    cd "$PROJECT_ROOT"

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
    
    # Also kill any process on port 8081
    local port_pid=$(lsof -ti:8081)
    if [ -n "$port_pid" ]; then
        kill $port_pid 2>/dev/null || true
    fi
}

###############################################################################
# Main Execution
###############################################################################

main() {
    print_header "JustDeen MyCompanion - iPhone Testing"

    # Prompt for clean options (unless disabled)
    prompt_clean_build
    
    # Perform cleaning if requested
    perform_clean

    # Handle device parameter
    if [ -n "$DEVICE_PARAM" ]; then
        DEVICE_ID="$DEVICE_PARAM"
        print_step "Using specified device: $DEVICE_ID"
    else
        detect_device
    fi

    # Execute build and deployment steps
    print_header "Building & Deploying"
    build_app
    find_built_app
    install_app
    start_metro
    launch_app

    print_header "Testing Complete!"

    echo -e "${GREEN}✓ App is now running on your iPhone!${NC}"
    echo ""
    echo "📱 Device: $DEVICE_ID"
    echo "📦 Bundle ID: $BUNDLE_ID"
    echo "🚀 Metro: Running on http://localhost:8081"
    echo ""
    echo "Logs:"
    echo "  Metro bundler: $PROJECT_ROOT/metro.log"
    echo ""
    echo "To stop Metro bundler:"
    echo "  $0 --stop-metro"
    echo ""
    echo "To clean build next time:"
    echo "  $0 --clean"
    echo ""
}

###############################################################################
# Parse Command Line Arguments
###############################################################################

parse_args() {
    DEVICE_PARAM=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --clean)
                CLEAN_XCODE=true
                CLEAN_METRO=true
                PROMPT_CLEAN=false
                shift
                ;;
            --clean-xcode)
                CLEAN_XCODE=true
                PROMPT_CLEAN=false
                shift
                ;;
            --clean-metro)
                CLEAN_METRO=true
                PROMPT_CLEAN=false
                shift
                ;;
            --no-prompt)
                PROMPT_CLEAN=false
                shift
                ;;
            --stop-metro)
                stop_metro
                exit 0
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                DEVICE_PARAM="$1"
                shift
                ;;
        esac
    done
}

###############################################################################
# Help Message
###############################################################################

show_help() {
    echo "JustDeen MyCompanion - iPhone Testing Script"
    echo ""
    echo "Usage: $0 [options] [device-name-or-id]"
    echo ""
    echo "Options:"
    echo "  --clean           Clean both Xcode + Metro before building"
    echo "  --clean-xcode     Clean only Xcode build artifacts"
    echo "  --clean-metro     Clean only Metro cache"
    echo "  --no-prompt       Skip clean prompt, use existing build"
    echo "  --stop-metro      Stop the Metro bundler and exit"
    echo "  --help, -h        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                          # Auto-detect device, prompt for clean"
    echo "  $0 --clean                  # Clean everything, auto-detect device"
    echo "  $0 --no-prompt              # Skip prompt, use existing build"
    echo "  $0 --clean-xcode            # Clean Xcode only"
    echo "  $0 \"Husain's iPhone\"        # Use specific device name"
    echo "  $0 00008140-001C2CC8...    # Use device UDID"
    echo "  $0 --stop-metro             # Stop Metro bundler"
    echo ""
    echo "Clean Options (when prompted):"
    echo "  1) No clean (fastest, recommended for quick iterations)"
    echo "  2) Clean Xcode only (fixes build-related issues)"
    echo "  3) Clean Metro only (fixes JavaScript bundle issues)"
    echo "  4) Clean both (recommended when troubleshooting)"
    echo ""
}

###############################################################################
# Entry Point
###############################################################################

# Parse command line arguments
parse_args "$@"

# Run main function
main