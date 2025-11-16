#!/bin/bash

###############################################################################
# JustDeen MyCompanion - iPhone Testing Script
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Project configuration
BUNDLE_ID="com.husainshah.justdeen"
BUILD_CONFIG="Debug"

# Clean options
CLEAN_XCODE=false
CLEAN_METRO=false
PROMPT_CLEAN=true

###############################################################################
# Find Project Root
###############################################################################

find_project_root() {
    local current_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    for i in {0..5}; do
        if [ -f "$current_dir/package.json" ] && [ -d "$current_dir/ios" ]; then
            echo "$current_dir"
            return 0
        fi
        current_dir="$(dirname "$current_dir")"
    done
    
    echo "$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
}

PROJECT_ROOT=$(find_project_root)

###############################################################################
# Helper Functions
###############################################################################

print_step() {
    printf "${BLUE}==>${NC} %s\n" "$1"
}

print_success() {
    printf "${GREEN}✓${NC} %s\n" "$1"
}

print_error() {
    printf "${RED}✗${NC} %s\n" "$1"
}

print_warning() {
    printf "${YELLOW}⚠${NC}  %s\n" "$1"
}

print_header() {
    printf "\n${BLUE}═══════════════════════════════════════════════════════════${NC}\n"
    printf "${BOLD}  %s${NC}\n" "$1"
    printf "${BLUE}═══════════════════════════════════════════════════════════${NC}\n\n"
}

print_progress() {
    printf "${CYAN}  ➤${NC} %s\n" "$1"
}

###############################################################################
# Detect iOS Workspace/Project
###############################################################################

detect_ios_workspace() {
    cd "$PROJECT_ROOT/ios"

    # Prioritize JustDeen.xcworkspace (the main workspace)
    if [ -d "JustDeen.xcworkspace" ]; then
        WORKSPACE="JustDeen.xcworkspace"
        SCHEME="JustDeen"
        BUILD_TYPE="workspace"
        return 0
    fi

    # Fallback to any workspace
    local workspace=$(find . -maxdepth 1 -name "*.xcworkspace" -type d | head -1)

    if [ -n "$workspace" ]; then
        WORKSPACE="${workspace#./}"
        SCHEME="${WORKSPACE%.xcworkspace}"
        BUILD_TYPE="workspace"
        return 0
    fi

    # Last resort: use project file
    local project=$(find . -maxdepth 1 -name "*.xcodeproj" -type d | head -1)

    if [ -n "$project" ]; then
        WORKSPACE="${project#./}"
        SCHEME="${WORKSPACE%.xcodeproj}"
        BUILD_TYPE="project"
        return 0
    fi

    return 1
}

###############################################################################
# Verify Project Structure
###############################################################################

verify_project() {
    if [ ! -d "$PROJECT_ROOT/ios" ]; then
        print_error "Could not find ios/ directory"
        printf "\n${YELLOW}Please ensure you're in a React Native project.${NC}\n\n"
        exit 1
    fi
    
    print_success "Project root: $PROJECT_ROOT"
    
    if ! detect_ios_workspace; then
        print_error "No iOS workspace or project found"
        printf "\n${YELLOW}You may need to run:${NC}\n"
        printf "  ${CYAN}npx expo prebuild${NC}\n\n"
        exit 1
    fi
    
    print_success "Found workspace: $WORKSPACE"
    print_success "Scheme: $SCHEME\n"
}

###############################################################################
# Clean Build/Cache
###############################################################################

prompt_clean_build() {
    if [ "$PROMPT_CLEAN" = false ]; then
        return
    fi
    
    printf "\n${YELLOW}╔════════════════════════════════════════════╗${NC}\n"
    printf "${YELLOW}║${NC}  ${BOLD}Clean Build Options${NC}                       ${YELLOW}║${NC}\n"
    printf "${YELLOW}╚════════════════════════════════════════════╝${NC}\n\n"
    printf "  ${BLUE}1)${NC} No clean ${GREEN}(faster, use existing build)${NC}\n"
    printf "  ${BLUE}2)${NC} Clean Xcode build only\n"
    printf "  ${BLUE}3)${NC} Clean Metro cache only\n"
    printf "  ${BLUE}4)${NC} Clean both Xcode + Metro ${YELLOW}(recommended for issues)${NC}\n\n"
    
    read -p "Select option [1-4] (default: 1): " clean_choice
    clean_choice=${clean_choice:-1}
    
    case $clean_choice in
        1)
            printf "\n"
            print_success "Using existing build"
            ;;
        2)
            printf "\n"
            print_warning "Will clean Xcode build"
            CLEAN_XCODE=true
            ;;
        3)
            printf "\n"
            print_warning "Will clean Metro cache"
            CLEAN_METRO=true
            ;;
        4)
            printf "\n"
            print_warning "Will clean both Xcode + Metro"
            CLEAN_XCODE=true
            CLEAN_METRO=true
            ;;
        *)
            printf "\n"
            print_error "Invalid option. Using default (no clean)"
            ;;
    esac
    printf "\n"
}

clean_xcode_build() {
    print_step "Cleaning Xcode build artifacts..."

    cd "$PROJECT_ROOT"

    print_progress "Running xcodebuild clean..."
    if [ "$BUILD_TYPE" = "workspace" ]; then
        xcodebuild clean \
            -workspace "ios/$WORKSPACE" \
            -scheme "$SCHEME" \
            -configuration "$BUILD_CONFIG" \
            > /dev/null 2>&1
    else
        xcodebuild clean \
            -project "ios/$WORKSPACE" \
            -scheme "$SCHEME" \
            -configuration "$BUILD_CONFIG" \
            > /dev/null 2>&1
    fi

    print_progress "Removing DerivedData..."
    rm -rf ~/Library/Developer/Xcode/DerivedData/${SCHEME}-* 2>/dev/null || true

    if [ -d "ios/build" ]; then
        print_progress "Removing ios/build folder..."
        rm -rf ios/build
    fi

    print_success "Xcode build cleaned\n"

    # After cleaning, regenerate CocoaPods to fix missing generated files
    print_step "Regenerating CocoaPods dependencies..."
    cd "$PROJECT_ROOT/ios"

    print_progress "Running pod install (this may take a minute)..."
    if pod install 2>&1 | grep -E "Installing|Using|Generating|Pod installation|^$" | tail -5; then
        print_success "Pods regenerated successfully\n"
    else
        print_warning "Pod install had some issues, but continuing...\n"
    fi

    cd "$PROJECT_ROOT"
}

clean_metro_cache() {
    print_step "Cleaning Metro bundler cache..."
    
    cd "$PROJECT_ROOT"
    
    if lsof -i :8081 > /dev/null 2>&1; then
        print_progress "Stopping existing Metro bundler..."
        stop_metro
        sleep 1
    fi
    
    print_progress "Clearing Metro cache..."
    npx expo start --clear > /dev/null 2>&1 &
    local pid=$!
    sleep 3
    kill $pid 2>/dev/null || true
    
    if command -v watchman > /dev/null 2>&1; then
        print_progress "Clearing watchman watches..."
        watchman watch-del-all > /dev/null 2>&1 || true
    fi
    
    if [ -d ".expo" ]; then
        print_progress "Cleaning .expo directory..."
        rm -rf .expo
    fi
    
    if [ -d "node_modules/.cache" ]; then
        print_progress "Cleaning node_modules cache..."
        rm -rf node_modules/.cache
    fi
    
    print_success "Metro cache cleaned\n"
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

    # Get device list
    local devices=$(xcrun xctrace list devices 2>&1)

    if [ $? -ne 0 ]; then
        print_error "Failed to list devices"
        exit 1
    fi

    # Parse physical devices (exclude Simulators and Mac)
    # Format: "Device Name (iOS Version) (UDID)"
    declare -a device_names=()
    declare -a device_udids=()
    
    while IFS= read -r line; do
        # Extract device name (everything before the first opening parenthesis)
        local name=$(echo "$line" | sed 's/ (.*//' | xargs)
        
        # Extract UDID (24-character hex with dashes: XXXXXXXX-XXXXXXXXXXXXXXXX)
        local udid=$(echo "$line" | grep -o '[0-9A-Fa-f]\{8\}-[0-9A-Fa-f]\{16\}')
        
        if [ -n "$name" ] && [ -n "$udid" ]; then
            device_names+=("$name")
            device_udids+=("$udid")
        fi
    done < <(echo "$devices" | grep -E "iPhone|iPad|iPod" | grep -v "Simulator" | grep -v "Mac")

    local device_count=${#device_names[@]}

    if [ "$device_count" -eq 0 ]; then
        print_error "No physical iOS devices found."
        printf "\n${YELLOW}Please:${NC}\n"
        printf "  1. Connect your iPhone via USB\n"
        printf "  2. Unlock your iPhone\n"
        printf "  3. Trust this computer if prompted\n\n"
        exit 1
    fi

    print_success "Found $device_count physical device(s)\n"

    # If only one device, auto-select it
    if [ "$device_count" -eq 1 ]; then
        DEVICE_NAME="${device_names[0]}"
        DEVICE_UDID="${device_udids[0]}"
        print_success "Auto-selected: $DEVICE_NAME"
    else
        # Multiple devices - let user choose
        printf "${YELLOW}╔════════════════════════════════════════════╗${NC}\n"
        printf "${YELLOW}║${NC}  ${BOLD}Select Device${NC}                              ${YELLOW}║${NC}\n"
        printf "${YELLOW}╚════════════════════════════════════════════╝${NC}\n\n"
        
        for i in "${!device_names[@]}"; do
            local idx=$((i + 1))
            printf "  ${BLUE}%d)${NC} %s\n" "$idx" "${device_names[$i]}"
        done
        
        printf "\n"
        read -p "Select device [1-$device_count] (default: 1): " device_choice
        device_choice=${device_choice:-1}
        
        # Validate choice
        if ! [[ "$device_choice" =~ ^[0-9]+$ ]] || [ "$device_choice" -lt 1 ] || [ "$device_choice" -gt "$device_count" ]; then
            printf "\n"
            print_error "Invalid choice. Using first device."
            device_choice=1
        fi
        
        local selected_idx=$((device_choice - 1))
        DEVICE_NAME="${device_names[$selected_idx]}"
        DEVICE_UDID="${device_udids[$selected_idx]}"
        
        printf "\n"
        print_success "Selected: $DEVICE_NAME"
    fi

    # Get devicectl ID for installation/launching
    local devicectl_devices=$(xcrun devicectl list devices 2>&1)
    DEVICECTL_ID=$(echo "$devicectl_devices" | grep "$DEVICE_NAME" | grep "connected" | grep -o '[A-F0-9]\{8\}-[A-F0-9]\{4\}-[A-F0-9]\{4\}-[A-F0-9]\{4\}-[A-F0-9]\{12\}')

    printf "${CYAN}           UDID: ${NC}%s\n\n" "$DEVICE_UDID"
}

###############################################################################
# Build Process
###############################################################################

build_app() {
    print_step "Building iOS app with Expo..."
    printf "${CYAN}  This may take a few minutes...${NC}\n\n"

    cd "$PROJECT_ROOT"

    # Use npx expo build for building
    npx expo build 2>&1 | tee /tmp/expo-build.log | grep -E "error:|warning:|Build|Succeeded|Successfully" || true

    if [ ${PIPESTATUS[0]} -ne 0 ]; then
        printf "\n"
        print_error "Build failed. Check the errors above."
        exit 1
    fi

    printf "\n"
    print_success "Build completed successfully\n"
}

###############################################################################
# Run on Device (Install, Start Metro, and Launch)
###############################################################################

run_on_device() {
    print_step "Running app on device with Expo..."
    printf "${CYAN}  This will build, install, and launch the app...${NC}\n\n"

    cd "$PROJECT_ROOT"

    # Use npx expo run:ios --device to handle everything
    npx expo run:ios --device 2>&1 | tee /tmp/expo-run.log | grep -E "error:|warning:|Build|Installing|Opening|Successfully|Bundling" || true

    if [ ${PIPESTATUS[0]} -ne 0 ]; then
        printf "\n"
        print_error "Failed to run app on device"
        exit 1
    fi

    printf "\n"
    print_success "App is running on device\n"
}

###############################################################################
# Stop Metro
###############################################################################

stop_metro() {
    if [ -f "$PROJECT_ROOT/.metro.pid" ]; then
        local pid=$(cat "$PROJECT_ROOT/.metro.pid")
        if ps -p $pid > /dev/null 2>&1; then
            kill $pid 2>/dev/null || true
            rm "$PROJECT_ROOT/.metro.pid"
        fi
    fi
    
    local port_pid=$(lsof -ti:8081 2>/dev/null)
    if [ -n "$port_pid" ]; then
        kill $port_pid 2>/dev/null || true
    fi
}

###############################################################################
# Main Execution
###############################################################################

main() {
    print_header "JustDeen MyCompanion - iPhone Testing"

    verify_project
    prompt_clean_build
    perform_clean

    if [ -n "$DEVICE_PARAM" ]; then
        DEVICE_NAME="$DEVICE_PARAM"
        print_step "Using specified device: $DEVICE_NAME"
        printf "\n"
    else
        detect_device
    fi

    print_header "Building & Deploying with Expo"

    # Option to just build or build + run
    if [ "$BUILD_ONLY" = true ]; then
        build_app
    else
        # Run on device (builds, installs, starts metro, and launches)
        run_on_device
    fi

    print_header "Testing Complete!"

    printf "${GREEN}✓ App is now running on your iPhone!${NC}\n\n"
    printf "📱 ${BOLD}Device:${NC}     %s\n" "$DEVICE_NAME"
    printf "📦 ${BOLD}Bundle ID:${NC}  %s\n" "$BUNDLE_ID"
    printf "🚀 ${BOLD}Metro:${NC}      http://localhost:8081\n"
    printf "📄 ${BOLD}Logs:${NC}       /tmp/expo-run.log\n\n"
    printf "${CYAN}To stop Metro:${NC} %s --stop-metro\n" "$0"
    printf "${CYAN}To clean:${NC}      %s --clean\n\n" "$0"
}

###############################################################################
# Parse Arguments
###############################################################################

parse_args() {
    DEVICE_PARAM=""
    BUILD_ONLY=false

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
            --build-only)
                BUILD_ONLY=true
                shift
                ;;
            --stop-metro)
                PROJECT_ROOT=$(find_project_root)
                cd "$PROJECT_ROOT"
                stop_metro
                print_success "Metro bundler stopped"
                exit 0
                ;;
            --help|-h)
                printf "JustDeen MyCompanion - iPhone Testing Script (Expo)\n\n"
                printf "Usage: %s [options] [device-name]\n\n" "$0"
                printf "Options:\n"
                printf "  --clean           Clean both Xcode + Metro\n"
                printf "  --clean-xcode     Clean only Xcode build\n"
                printf "  --clean-metro     Clean only Metro cache\n"
                printf "  --no-prompt       Skip prompt, use existing build\n"
                printf "  --build-only      Only build (don't run on device)\n"
                printf "  --stop-metro      Stop Metro bundler\n"
                printf "  --help, -h        Show this help\n\n"
                printf "Commands used:\n"
                printf "  Build:            npx expo build\n"
                printf "  Run on device:    npx expo run:ios --device\n\n"
                printf "Examples:\n"
                printf "  %s                       # Interactive prompt\n" "$0"
                printf "  %s --no-prompt           # Fast run\n" "$0"
                printf "  %s --clean               # Clean everything\n" "$0"
                printf "  %s --build-only          # Just build\n" "$0"
                printf "  %s \"Husain's iPhone\"     # Specific device\n\n" "$0"
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
# Entry Point
###############################################################################

parse_args "$@"
main