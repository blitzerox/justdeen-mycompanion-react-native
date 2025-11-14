#!/bin/bash

# JustDeen MyCompanion - Android Simulator Testing Script
# This script builds and deploys the app to an Android emulator

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Get the absolute path to the script directory
SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"
ANDROID_DIR="$PROJECT_ROOT/android"
SCHEME="JustDeen"

# Load environment from .zshrc if ANDROID_HOME is not set
if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
    if [ -f "$HOME/.zshrc" ]; then
        # Source zshrc to get environment variables
        source "$HOME/.zshrc" 2>/dev/null || true
    fi
fi

# Set ANDROID_HOME if still not set but SDK exists in default location
if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
    if [ -d "$HOME/Library/Android/sdk" ]; then
        export ANDROID_HOME="$HOME/Library/Android/sdk"
        export PATH="$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools"
    fi
fi

# Set Java home if not set but Java is installed via Homebrew
if [ -z "$JAVA_HOME" ]; then
    if [ -d "/opt/homebrew/opt/openjdk@17" ]; then
        export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
        export PATH="$JAVA_HOME/bin:$PATH"
    fi
fi

# Print colored message
print_msg() {
    echo -e "${2}${1}${NC}"
}

# Print section header
print_header() {
    echo ""
    print_msg "═══════════════════════════════════════════════════════════" "$BLUE"
    print_msg "  $1" "$BOLD"
    print_msg "═══════════════════════════════════════════════════════════" "$BLUE"
    echo ""
}

# Print success message
print_success() {
    print_msg "✓ $1" "$GREEN"
}

# Print error message
print_error() {
    print_msg "✗ $1" "$RED"
}

# Print info message
print_info() {
    print_msg "==> $1" "$BLUE"
}

# Print warning message
print_warning() {
    print_msg "⚠ $1" "$YELLOW"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Cleanup function
cleanup() {
    if [ $? -ne 0 ]; then
        print_error "Build failed. Check the errors above."
    fi
}

trap cleanup EXIT

# ============================================================================
# MAIN SCRIPT
# ============================================================================

print_header "JustDeen MyCompanion - Android Testing"

# Verify we're in the project root
cd "$PROJECT_ROOT"
print_success "Project root: $PROJECT_ROOT"

# Check for required tools
print_info "Checking required tools..."

if ! command_exists node; then
    print_error "Node.js is not installed"
    exit 1
fi
print_success "Node.js: $(node --version)"

if ! command_exists npm; then
    print_error "npm is not installed"
    exit 1
fi
print_success "npm: $(npm --version)"

# Check for Android SDK
if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
    print_error "Android SDK not found. Please set ANDROID_HOME or ANDROID_SDK_ROOT"
    print_info "You can set it in your ~/.zshrc or ~/.bashrc:"
    print_info "  export ANDROID_HOME=\$HOME/Library/Android/sdk"
    print_info "  export PATH=\$PATH:\$ANDROID_HOME/emulator:\$ANDROID_HOME/tools:\$ANDROID_HOME/platform-tools"
    exit 1
fi

ANDROID_SDK="${ANDROID_HOME:-$ANDROID_SDK_ROOT}"
print_success "Android SDK: $ANDROID_SDK"

# Check for emulator command
if ! command_exists emulator; then
    print_error "Android emulator command not found"
    print_info "Make sure \$ANDROID_HOME/emulator is in your PATH"
    exit 1
fi

# Check for adb
if ! command_exists adb; then
    print_error "adb command not found"
    print_info "Make sure \$ANDROID_HOME/platform-tools is in your PATH"
    exit 1
fi
print_success "adb: $(adb --version | head -n1)"

# Parse command line arguments
CLEAN_BUILD=false
EMULATOR_NAME=""
AUTO_START_EMULATOR=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --clean)
            CLEAN_BUILD=true
            shift
            ;;
        --emulator)
            EMULATOR_NAME="$2"
            shift 2
            ;;
        --auto-start)
            AUTO_START_EMULATOR=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Usage: $0 [--clean] [--emulator EMULATOR_NAME] [--auto-start]"
            exit 1
            ;;
    esac
done

# Clean build options (interactive if not specified)
if [ "$CLEAN_BUILD" = false ]; then
    echo ""
    print_msg "╔════════════════════════════════════════════╗" "$YELLOW"
    print_msg "║  ${BOLD}Clean Build Options${NC}${YELLOW}                       ║" "$YELLOW"
    print_msg "╚════════════════════════════════════════════╝" "$YELLOW"
    echo ""
    print_msg "  ${BLUE}1)${NC} No clean ${GREEN}(faster, use existing build)${NC}"
    print_msg "  ${BLUE}2)${NC} Clean Gradle build only"
    print_msg "  ${BLUE}3)${NC} Clean Metro cache only"
    print_msg "  ${BLUE}4)${NC} Clean both Gradle + Metro ${YELLOW}(recommended for issues)${NC}"
    echo ""

    read -p "$(echo -e ${NC}Choose option [1-4]: )" choice

    case $choice in
        1)
            print_success "Using existing build"
            ;;
        2)
            print_info "Cleaning Gradle build..."
            cd "$ANDROID_DIR"
            ./gradlew clean
            cd "$PROJECT_ROOT"
            print_success "Gradle cleaned"
            ;;
        3)
            print_info "Cleaning Metro cache..."
            rm -rf "$PROJECT_ROOT/.metro"
            npx expo start --clear --dev-client &
            METRO_PID=$!
            sleep 3
            kill $METRO_PID 2>/dev/null || true
            print_success "Metro cache cleaned"
            ;;
        4)
            print_info "Cleaning Gradle build..."
            cd "$ANDROID_DIR"
            ./gradlew clean
            cd "$PROJECT_ROOT"
            print_info "Cleaning Metro cache..."
            rm -rf "$PROJECT_ROOT/.metro"
            npx expo start --clear --dev-client &
            METRO_PID=$!
            sleep 3
            kill $METRO_PID 2>/dev/null || true
            print_success "Gradle and Metro cleaned"
            ;;
        *)
            print_error "Invalid option"
            exit 1
            ;;
    esac
fi

# ============================================================================
# EMULATOR DETECTION & SELECTION
# ============================================================================

print_header "Emulator Detection"

# List available emulators
print_info "Detecting available Android emulators..."
AVAILABLE_EMULATORS=$(emulator -list-avds)

if [ -z "$AVAILABLE_EMULATORS" ]; then
    print_error "No Android emulators found"
    print_info "Please create an emulator using Android Studio:"
    print_info "  Tools > Device Manager > Create Device"
    exit 1
fi

echo "$AVAILABLE_EMULATORS" | while read -r emulator; do
    print_msg "  - $emulator" "$BLUE"
done

# Check for running emulators
print_info "Checking for running emulators..."
RUNNING_DEVICES=$(adb devices | grep -w "device" | grep "emulator" | awk '{print $1}')

if [ -z "$RUNNING_DEVICES" ]; then
    print_warning "No running emulators found"

    if [ "$AUTO_START_EMULATOR" = true ] || [ -n "$EMULATOR_NAME" ]; then
        # Auto-start mode or emulator specified
        if [ -z "$EMULATOR_NAME" ]; then
            # Pick first available emulator
            EMULATOR_NAME=$(echo "$AVAILABLE_EMULATORS" | head -n1)
        fi

        print_info "Starting emulator: $EMULATOR_NAME"
        emulator -avd "$EMULATOR_NAME" -no-snapshot-load &
        EMULATOR_PID=$!

        print_info "Waiting for emulator to boot..."
        adb wait-for-device

        # Wait for boot to complete
        while [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" != "1" ]; do
            sleep 2
        done

        print_success "Emulator started and booted"
        SELECTED_DEVICE=$(adb devices | grep -w "device" | grep "emulator" | awk '{print $1}' | head -n1)
    else
        # Interactive mode
        echo ""
        print_msg "╔════════════════════════════════════════════╗" "$YELLOW"
        print_msg "║  ${BOLD}Emulator Options${NC}${YELLOW}                          ║" "$YELLOW"
        print_msg "╚════════════════════════════════════════════╝" "$YELLOW"
        echo ""
        print_msg "  ${BLUE}1)${NC} Start an emulator"
        print_msg "  ${BLUE}2)${NC} Exit (start emulator manually)"
        echo ""

        read -p "$(echo -e ${NC}Choose option [1-2]: )" emulator_choice

        case $emulator_choice in
            1)
                # List emulators with numbers
                echo ""
                print_msg "Available emulators:" "$BOLD"
                i=1
                echo "$AVAILABLE_EMULATORS" | while read -r emulator; do
                    print_msg "  ${BLUE}$i)${NC} $emulator"
                    i=$((i+1))
                done
                echo ""

                read -p "$(echo -e ${NC}Select emulator number: )" emulator_num
                SELECTED_EMULATOR=$(echo "$AVAILABLE_EMULATORS" | sed -n "${emulator_num}p")

                if [ -z "$SELECTED_EMULATOR" ]; then
                    print_error "Invalid emulator selection"
                    exit 1
                fi

                print_info "Starting emulator: $SELECTED_EMULATOR"
                emulator -avd "$SELECTED_EMULATOR" -no-snapshot-load &
                EMULATOR_PID=$!

                print_info "Waiting for emulator to boot..."
                adb wait-for-device

                # Wait for boot to complete
                while [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" != "1" ]; do
                    sleep 2
                done

                print_success "Emulator started and booted"
                SELECTED_DEVICE=$(adb devices | grep -w "device" | grep "emulator" | awk '{print $1}' | head -n1)
                ;;
            2)
                print_info "Please start an emulator manually and run this script again"
                exit 0
                ;;
            *)
                print_error "Invalid option"
                exit 1
                ;;
        esac
    fi
else
    # Running emulator found
    DEVICE_COUNT=$(echo "$RUNNING_DEVICES" | wc -l | tr -d ' ')

    if [ "$DEVICE_COUNT" -eq 1 ]; then
        SELECTED_DEVICE=$(echo "$RUNNING_DEVICES" | head -n1)
        print_success "Found running emulator: $SELECTED_DEVICE"
    else
        # Multiple emulators running - let user choose
        print_warning "Multiple emulators running:"
        i=1
        echo "$RUNNING_DEVICES" | while read -r device; do
            DEVICE_MODEL=$(adb -s "$device" shell getprop ro.product.model 2>/dev/null | tr -d '\r')
            print_msg "  ${BLUE}$i)${NC} $device ($DEVICE_MODEL)"
            i=$((i+1))
        done
        echo ""

        read -p "$(echo -e ${NC}Select device number: )" device_num
        SELECTED_DEVICE=$(echo "$RUNNING_DEVICES" | sed -n "${device_num}p")

        if [ -z "$SELECTED_DEVICE" ]; then
            print_error "Invalid device selection"
            exit 1
        fi
    fi
fi

DEVICE_MODEL=$(adb -s "$SELECTED_DEVICE" shell getprop ro.product.model 2>/dev/null | tr -d '\r')
ANDROID_VERSION=$(adb -s "$SELECTED_DEVICE" shell getprop ro.build.version.release 2>/dev/null | tr -d '\r')

echo ""
print_msg "╔════════════════════════════════════════════╗" "$GREEN"
print_msg "║  ${BOLD}Target Device${NC}${GREEN}                             ║" "$GREEN"
print_msg "╚════════════════════════════════════════════╝" "$GREEN"
print_msg "  Device: $DEVICE_MODEL" "$GREEN"
print_msg "  Android: $ANDROID_VERSION" "$GREEN"
print_msg "  Serial: $SELECTED_DEVICE" "$GREEN"
echo ""

# ============================================================================
# BUILD & DEPLOY
# ============================================================================

print_header "Building & Deploying"

# Kill any running Metro bundlers
print_info "Stopping any running Metro bundlers..."
pkill -f "expo start" 2>/dev/null || true
pkill -f "react-native start" 2>/dev/null || true
sleep 2

# Start Metro bundler in background
print_info "Starting Metro bundler..."
npx expo start --dev-client --android &
METRO_PID=$!
sleep 5

print_success "Metro bundler started (PID: $METRO_PID)"

# Build and install the app
print_info "Building Android app..."
print_msg "  This may take a few minutes..." "$BLUE"
echo ""

cd "$PROJECT_ROOT"

# Use expo run:android with specific device
if npx expo run:android --device "$SELECTED_DEVICE"; then
    echo ""
    print_header "✓ Deployment Successful!"

    print_success "App installed on $DEVICE_MODEL"
    print_success "Metro bundler running on http://localhost:8081"
    echo ""
    print_msg "╔════════════════════════════════════════════╗" "$GREEN"
    print_msg "║  ${BOLD}Testing Instructions${NC}${GREEN}                      ║" "$GREEN"
    print_msg "╚════════════════════════════════════════════╝" "$GREEN"
    print_msg "  1. App should launch automatically" "$BLUE"
    print_msg "  2. Navigate to Reflect tab (Home)" "$BLUE"
    print_msg "  3. Check 'Overview' section with activity cards" "$BLUE"
    print_msg "  4. Tap cards to see analytics screens" "$BLUE"
    print_msg "  5. Test time range selectors and navigation" "$BLUE"
    echo ""
    print_msg "  Press Ctrl+C to stop Metro bundler" "$YELLOW"
    echo ""

    # Keep Metro running
    wait $METRO_PID
else
    echo ""
    print_error "Build failed. Check the errors above."
    kill $METRO_PID 2>/dev/null || true
    exit 1
fi
