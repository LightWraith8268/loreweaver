#!/bin/bash

# LoreWeaver Platform Selector - Bash Version

# Initialize error logging
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$(dirname "$SCRIPT_DIR")/logs"
ERROR_LOG="$LOG_DIR/build-errors-$(date +%Y%m%d-%H%M%S).log"

mkdir -p "$LOG_DIR"
echo "[$(date)] Build session started" > "$ERROR_LOG"
echo "[$(date)] Platform: Bash Script" >> "$ERROR_LOG"
echo "[$(date)] Working Directory: $(pwd)" >> "$ERROR_LOG"
echo "" >> "$ERROR_LOG"

# Set terminal title
echo -e '\033]2;LoreWeaver Platform Builder\007'

# Platform definitions
declare -A platforms=(
    ["android-apk"]="Android APK:5:Mobile:eas build --platform android --profile standalone-apk"
    ["android-aab"]="Android AAB:5:Mobile:eas build --platform android --profile production"
    ["ios-sim"]="iOS Simulator:8:Mobile:eas build --platform ios --profile preview"
    ["ios-store"]="iOS App Store:8:Mobile:eas build --platform ios --profile production"
    ["windows-exe"]="Windows EXE:2:Desktop:npx electron-builder --win"
    ["windows-msi"]="Windows MSI:3:Desktop:npx electron-builder --win nsis"
    ["macos-dmg"]="macOS DMG:3:Desktop:npx electron-builder --mac"
    ["linux-appimage"]="Linux AppImage:3:Desktop:npx electron-builder --linux AppImage"
    ["linux-snap"]="Linux Snap:4:Desktop:npx electron-builder --linux snap"
    ["web-pwa"]="Web PWA:1:Web:npm run build:web"
)

selected_platforms=()

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

show_header() {
    clear
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                                      ║${NC}"
    echo -e "${GREEN}║${YELLOW}                  🎯 LoreWeaver Platform Builder 🎯${GREEN}                  ║${NC}"
    echo -e "${GREEN}║                                                                      ║${NC}"
    echo -e "${GREEN}║${WHITE}           Select platforms to build with checkboxes below:${GREEN}          ║${NC}"
    echo -e "${GREEN}║                                                                      ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

run_command() {
    local command="$1"
    local description="$2"
    
    echo "[$(date)] Executing: $command" >> "$ERROR_LOG"
    echo "[$(date)] Description: $description" >> "$ERROR_LOG"
    
    echo -e "  ${CYAN}⚡ $description...${NC}"
    
    if eval "$command" 2>>"$ERROR_LOG"; then
        echo "[$(date)] SUCCESS: $description completed" >> "$ERROR_LOG"
        echo -e "  ${GREEN}✓ $description completed${NC}"
        return 0
    else
        local exit_code=$?
        echo "[$(date)] ERROR: Command failed with exit code $exit_code" >> "$ERROR_LOG"
        echo "[$(date)] Command: $command" >> "$ERROR_LOG"
        echo -e "  ${RED}❌ $description failed (Exit code: $exit_code)${NC}"
        return $exit_code
    fi
}

show_error_summary() {
    echo ""
    echo -e "${RED}╔══════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                           ❌ BUILD FAILED ❌                           ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Error details have been logged to:${NC}"
    echo -e "${WHITE}$ERROR_LOG${NC}"
    echo ""
    echo "[$(date)] Build process failed" >> "$ERROR_LOG"
    echo "[$(date)] Error details logged above" >> "$ERROR_LOG"
    
    echo -e "${YELLOW}Common solutions:${NC}"
    echo -e "${WHITE}  1. Check if all dependencies are installed (npm install)${NC}"
    echo -e "${WHITE}  2. Verify EAS CLI is logged in (eas login)${NC}"
    echo -e "${WHITE}  3. Check network connection for mobile builds${NC}"
    echo -e "${WHITE}  4. Ensure Electron dependencies for desktop builds${NC}"
    echo ""
}

is_selected() {
    local platform=$1
    for selected in "${selected_platforms[@]}"; do
        if [[ "$selected" == "$platform" ]]; then
            return 0
        fi
    done
    return 1
}

show_platform() {
    local key=$1
    local num=$2
    local info=(${platforms[$key]//:/ })
    local name="${info[0]}"
    
    if is_selected "$key"; then
        echo -e "   ${GREEN}[✓] $num. $name${NC}"
    else
        echo -e "   ${GRAY}[ ] $num. $name${NC}"
    fi
}

toggle_platform() {
    local platform=$1
    if is_selected "$platform"; then
        # Remove platform
        selected_platforms=($(printf '%s\n' "${selected_platforms[@]}" | grep -v "^$platform$"))
    else
        # Add platform
        selected_platforms+=("$platform")
    fi
}

calculate_stats() {
    local count=${#selected_platforms[@]}
    local total_time=0
    
    for platform in "${selected_platforms[@]}"; do
        local info=(${platforms[$platform]//:/ })
        local time="${info[1]}"
        total_time=$((total_time + time))
    done
    
    echo "$count:$total_time"
}

show_menu() {
    show_header
    
    echo -e "${YELLOW}📱 MOBILE PLATFORMS:${NC}"
    show_platform "android-apk" "1"
    show_platform "android-aab" "2"
    show_platform "ios-sim" "3"
    show_platform "ios-store" "4"
    
    echo ""
    echo -e "${GREEN}💻 DESKTOP PLATFORMS:${NC}"
    show_platform "windows-exe" "5"
    show_platform "windows-msi" "6"
    show_platform "macos-dmg" "7"
    show_platform "linux-appimage" "8"
    show_platform "linux-snap" "9"
    
    echo ""
    echo -e "${BLUE}🌐 WEB PLATFORM:${NC}"
    show_platform "web-pwa" "10"
    
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║${MAGENTA}                              ⚡ QUICK PRESETS${GREEN}                        ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════╝${NC}"
    echo "   A. All Mobile Platforms        D. All Desktop Platforms"
    echo "   B. Mobile Production           E. Essential Builds (APK+EXE+PWA)"
    echo "   C. Mobile Testing              F. Everything (All Platforms)"
    echo ""
    echo -e "${WHITE}🛠️  ACTIONS:${NC}"
    echo "   X. Clear All Selections        S. Start Building"
    echo "   Q. Quit                        H. Help"
    echo ""
    
    local stats=$(calculate_stats)
    local count=$(echo "$stats" | cut -d: -f1)
    local time=$(echo "$stats" | cut -d: -f2)
    
    echo -e "${WHITE}Selected platforms: $count / 10${NC}"
    echo -e "${WHITE}Estimated build time: $time minutes${NC}"
    echo ""
}

set_preset() {
    case $1 in
        "A"|"a")
            selected_platforms=("android-apk" "android-aab" "ios-sim" "ios-store")
            ;;
        "B"|"b")
            selected_platforms=("android-aab" "ios-store")
            ;;
        "C"|"c")
            selected_platforms=("android-apk" "ios-sim")
            ;;
        "D"|"d")
            selected_platforms=("windows-exe" "windows-msi" "macos-dmg" "linux-appimage" "linux-snap")
            ;;
        "E"|"e")
            selected_platforms=("android-apk" "windows-exe" "web-pwa")
            ;;
        "F"|"f")
            selected_platforms=("android-apk" "android-aab" "ios-sim" "ios-store" "windows-exe" "windows-msi" "macos-dmg" "linux-appimage" "linux-snap" "web-pwa")
            ;;
    esac
}

show_help() {
    clear
    echo -e "${CYAN}████████████████████████████████████████████████████████████████${NC}"
    echo -e "${CYAN}██                      📚 HELP GUIDE 📚                      ██${NC}"
    echo -e "${CYAN}████████████████████████████████████████████████████████████████${NC}"
    echo ""
    
    echo -e "${YELLOW}COMMAND LINE USAGE:${NC}"
    echo "  ./build-selector.sh android-apk windows-exe"
    echo "  ./build-selector.sh --essential"
    echo "  ./build-selector.sh --everything"
    echo ""
    
    echo -e "${YELLOW}PLATFORM DESCRIPTIONS:${NC}"
    echo ""
    echo -e "${GREEN}📱 MOBILE:${NC}"
    echo "   • android-apk    - Direct install file for testing"
    echo "   • android-aab    - Google Play Store format"
    echo "   • ios-sim        - For testing on iOS Simulator"
    echo "   • ios-store      - For App Store submission"
    echo ""
    echo -e "${GREEN}💻 DESKTOP:${NC}"
    echo "   • windows-exe    - Portable executable"
    echo "   • windows-msi    - Professional installer"
    echo "   • macos-dmg      - Mac disk image installer"
    echo "   • linux-appimage - Portable Linux executable"
    echo "   • linux-snap     - Ubuntu Snap package"
    echo ""
    echo -e "${GREEN}🌐 WEB:${NC}"
    echo "   • web-pwa        - Progressive Web App (works everywhere)"
    echo ""
    
    read -p "Press Enter to continue..."
}

start_building() {
    if [ ${#selected_platforms[@]} -eq 0 ]; then
        echo -e "${RED}❌ No platforms selected! Please select at least one platform.${NC}"
        read -p "Press Enter to continue..."
        return 1
    fi
    
    clear
    echo -e "${GREEN}████████████████████████████████████████████████████████████████${NC}"
    echo -e "${GREEN}██                  🚀 STARTING BUILD PROCESS 🚀              ██${NC}"
    echo -e "${GREEN}████████████████████████████████████████████████████████████████${NC}"
    echo ""
    
    local stats=$(calculate_stats)
    local count=$(echo "$stats" | cut -d: -f1)
    local time=$(echo "$stats" | cut -d: -f2)
    
    echo -e "${WHITE}Selected platforms: $count${NC}"
    echo -e "${WHITE}Estimated time: $time minutes${NC}"
    echo ""
    echo -e "${WHITE}Building the following platforms:${NC}"
    
    for platform in "${selected_platforms[@]}"; do
        local info=(${platforms[$platform]//:/ })
        local name="${info[0]}"
        echo -e "   ${GREEN}✓ $name${NC}"
    done
    echo ""
    
    if [[ "$1" != "--non-interactive" ]]; then
        read -p "Continue with build? (Y/N): " confirm
        if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
            return 1
        fi
    fi
    
    # Install dependencies
    echo ""
    echo -e "${YELLOW}================================${NC}"
    echo -e "${YELLOW}Step 1: Installing Dependencies${NC}"
    echo -e "${YELLOW}================================${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install dependencies!${NC}"
        return 1
    fi
    
    # Check if we need web build
    local needs_web=false
    for platform in "${selected_platforms[@]}"; do
        if [[ "$platform" =~ ^(windows-exe|windows-msi|macos-dmg|linux-appimage|linux-snap|web-pwa)$ ]]; then
            needs_web=true
            break
        fi
    done
    
    if $needs_web; then
        echo ""
        echo -e "${YELLOW}================================${NC}"
        echo -e "${YELLOW}Step 2: Building Web Version${NC}"
        echo -e "${YELLOW}================================${NC}"
        npm run build:web
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Failed to build web version!${NC}"
            return 1
        fi
    fi
    
    # Build mobile platforms
    local mobile_platforms=()
    for platform in "${selected_platforms[@]}"; do
        local info=(${platforms[$platform]//:/ })
        local type="${info[2]}"
        if [[ "$type" == "Mobile" ]]; then
            mobile_platforms+=("$platform")
        fi
    done
    
    if [ ${#mobile_platforms[@]} -gt 0 ]; then
        echo ""
        echo -e "${YELLOW}================================${NC}"
        echo -e "${YELLOW}Step 3: Building Mobile Apps (${#mobile_platforms[@]} builds)${NC}"
        echo -e "${YELLOW}================================${NC}"
        
        for platform in "${mobile_platforms[@]}"; do
            local info=(${platforms[$platform]//:/ })
            local name="${info[0]}"
            local command="${info[3]}"
            
            echo -e "${WHITE}Building $name...${NC}"
            # Show standalone message for Android APK builds
            if [[ "$platform" == "android-apk" ]]; then
                echo -e "${YELLOW}   ✓ Standalone APK (No Server Required)${NC}"
            fi
            if [[ "$1" == "--non-interactive" ]]; then
                command="$command --non-interactive"
            fi
            eval $command
        done
    fi
    
    # Build desktop platforms
    local desktop_platforms=()
    for platform in "${selected_platforms[@]}"; do
        local info=(${platforms[$platform]//:/ })
        local type="${info[2]}"
        if [[ "$type" == "Desktop" ]]; then
            desktop_platforms+=("$platform")
        fi
    done
    
    if [ ${#desktop_platforms[@]} -gt 0 ]; then
        echo ""
        echo -e "${YELLOW}================================${NC}"
        echo -e "${YELLOW}Step 4: Building Desktop Apps (${#desktop_platforms[@]} builds)${NC}"
        echo -e "${YELLOW}================================${NC}"
        
        for platform in "${desktop_platforms[@]}"; do
            local info=(${platforms[$platform]//:/ })
            local name="${info[0]}"
            local command="${info[3]}"
            
            echo -e "${WHITE}Building $name...${NC}"
            eval $command
            if [ $? -ne 0 ]; then
                echo -e "${YELLOW}⚠️  Warning: $name build may have failed${NC}"
            fi
        done
    fi
    
    # Show results
    echo ""
    echo -e "${GREEN}████████████████████████████████████████████████████████████████${NC}"
    echo -e "${GREEN}██                    🎉 BUILD COMPLETE! 🎉                   ██${NC}"
    echo -e "${GREEN}████████████████████████████████████████████████████████████████${NC}"
    echo ""
    echo -e "${GREEN}Successfully built $count platform(s)!${NC}"
    echo ""
    echo -e "${WHITE}📁 YOUR APPS ARE READY:${NC}"
    echo ""
    
    for platform in "${selected_platforms[@]}"; do
        local info=(${platforms[$platform]//:/ })
        local name="${info[0]}"
        local type="${info[2]}"
        
        case $type in
            "Mobile")
                echo -e "   ${CYAN}📱 $name: Check https://expo.dev/builds${NC}"
                ;;
            "Desktop")
                case $platform in
                    "windows-exe")
                        echo -e "   ${GREEN}💻 $name: dist/LoreWeaver.exe${NC}"
                        ;;
                    "windows-msi")
                        echo -e "   ${GREEN}💻 $name: dist/LoreWeaver Setup.exe${NC}"
                        ;;
                    "macos-dmg")
                        echo -e "   ${GREEN}💻 $name: dist/LoreWeaver.dmg${NC}"
                        ;;
                    "linux-appimage")
                        echo -e "   ${GREEN}💻 $name: dist/LoreWeaver.AppImage${NC}"
                        ;;
                    "linux-snap")
                        echo -e "   ${GREEN}💻 $name: dist/loreweaver_*.snap${NC}"
                        ;;
                esac
                ;;
            "Web")
                echo -e "   ${BLUE}🌐 $name: web-build/ folder (deploy to hosting)${NC}"
                ;;
        esac
    done
    
    echo ""
    echo -e "${YELLOW}🚀 NEXT STEPS:${NC}"
    echo "   • Test your apps on target devices"
    echo "   • Set up code signing for production distribution"
    echo "   • Submit to app stores if building for production"
    echo "   • Deploy web version to hosting service"
    echo ""
    
    return 0
}

# Handle command line arguments
if [ $# -gt 0 ]; then
    case "$1" in
        "--essential")
            selected_platforms=("android-apk" "windows-exe" "web-pwa")
            start_building --non-interactive
            exit $?
            ;;
        "--everything")
            selected_platforms=("android-apk" "android-aab" "ios-sim" "ios-store" "windows-exe" "windows-msi" "macos-dmg" "linux-appimage" "linux-snap" "web-pwa")
            start_building --non-interactive
            exit $?
            ;;
        "--all-mobile")
            selected_platforms=("android-apk" "android-aab" "ios-sim" "ios-store")
            start_building --non-interactive
            exit $?
            ;;
        "--all-desktop")
            selected_platforms=("windows-exe" "windows-msi" "macos-dmg" "linux-appimage" "linux-snap")
            start_building --non-interactive
            exit $?
            ;;
        *)
            # Treat arguments as platform names
            for arg in "$@"; do
                if [[ -n "${platforms[$arg]}" ]]; then
                    selected_platforms+=("$arg")
                fi
            done
            if [ ${#selected_platforms[@]} -gt 0 ]; then
                start_building --non-interactive
                exit $?
            else
                echo -e "${RED}❌ Invalid platform names provided!${NC}"
                echo "Valid platforms: ${!platforms[@]}"
                exit 1
            fi
            ;;
    esac
fi

# Interactive menu
while true; do
    show_menu
    read -p "Enter option (1-10, A-F, X, S, Q, H): " choice
    
    case "${choice^^}" in
        "1") toggle_platform "android-apk" ;;
        "2") toggle_platform "android-aab" ;;
        "3") toggle_platform "ios-sim" ;;
        "4") toggle_platform "ios-store" ;;
        "5") toggle_platform "windows-exe" ;;
        "6") toggle_platform "windows-msi" ;;
        "7") toggle_platform "macos-dmg" ;;
        "8") toggle_platform "linux-appimage" ;;
        "9") toggle_platform "linux-snap" ;;
        "10") toggle_platform "web-pwa" ;;
        "A") set_preset "A" ;;
        "B") set_preset "B" ;;
        "C") set_preset "C" ;;
        "D") set_preset "D" ;;
        "E") set_preset "E" ;;
        "F") set_preset "F" ;;
        "X") selected_platforms=() ;;
        "S") 
            start_building
            if [ $? -eq 0 ]; then
                read -p "Build another combination? (Y/N): " continue
                if [[ ! "$continue" =~ ^[Yy]$ ]]; then
                    break
                fi
            fi
            ;;
        "H") show_help ;;
        "Q") break ;;
        *)
            echo -e "${RED}Invalid choice. Please try again.${NC}"
            sleep 1
            ;;
    esac
done

echo ""
echo -e "${GREEN}Thanks for using LoreWeaver Platform Selector! 🚀${NC}"
echo ""