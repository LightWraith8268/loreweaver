#!/bin/bash

echo "================================"
echo "  LoreWeaver Desktop Builder"
echo "================================"
echo

show_menu() {
    echo "Select build option:"
    echo "1. macOS DMG (Current machine)"
    echo "2. macOS Universal Binary (Intel + Apple Silicon)"
    echo "3. Linux AppImage"
    echo "4. Linux Snap Package"
    echo "5. Cross-compile for Windows"
    echo "6. Build for ALL platforms"
    echo "7. Development mode (Electron window)"
    echo "8. Web version only"
    echo "9. Exit"
    echo
}

while true; do
    show_menu
    read -p "Enter your choice (1-9): " choice
    
    case $choice in
        1)
            echo
            echo "Installing dependencies..."
            npm install
            echo "Building web version..."
            npm run build:web
            echo "Building macOS DMG..."
            npx electron-builder --mac
            ;;
        2)
            echo
            echo "Installing dependencies..."
            npm install
            echo "Building web version..."
            npm run build:web
            echo "Building macOS Universal Binary..."
            npx electron-builder --mac --x64 --arm64
            ;;
        3)
            echo
            echo "Installing dependencies..."
            npm install
            echo "Building web version..."
            npm run build:web
            echo "Building Linux AppImage..."
            npx electron-builder --linux AppImage
            ;;
        4)
            echo
            echo "Installing dependencies..."
            npm install
            echo "Building web version..."
            npm run build:web
            echo "Building Linux Snap..."
            npx electron-builder --linux snap
            ;;
        5)
            echo
            echo "Installing dependencies..."
            npm install
            echo "Building web version..."
            npm run build:web
            echo "Cross-compiling for Windows..."
            npx electron-builder --win --x64
            ;;
        6)
            echo
            echo "Installing dependencies..."
            npm install
            echo "Building web version..."
            npm run build:web
            echo "Building for ALL platforms..."
            echo "This may take 10-15 minutes..."
            npx electron-builder --win --mac --linux
            ;;
        7)
            echo
            echo "Starting development mode..."
            echo "Web server will start, then Electron window will open..."
            npm run electron:dev
            continue
            ;;
        8)
            echo
            echo "Building web version only..."
            npm run build:web
            echo
            echo "Web build complete! Files in: web-build/"
            echo "You can deploy this folder to any web server."
            ;;
        9)
            echo "Goodbye!"
            exit 0
            ;;
        *)
            echo "Invalid choice. Please try again."
            continue
            ;;
    esac
    
    echo
    echo "================================"
    echo "Build completed!"
    echo "Check the 'dist' folder for your apps"
    echo "================================"
    echo
    echo "File locations:"
    echo "- Windows: dist/LoreWeaver Setup.exe"
    echo "- macOS: dist/LoreWeaver.dmg"
    echo "- Linux: dist/LoreWeaver.AppImage"
    echo "- Web: web-build/ (deploy to web server)"
    echo
    read -p "Press Enter to continue..."
done