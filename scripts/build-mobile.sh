#!/bin/bash

echo "================================"
echo "   LoreWeaver Mobile Builder"
echo "================================"
echo

show_menu() {
    echo "Select build option:"
    echo "1. Android APK (Preview/Testing)"
    echo "2. Android AAB (Play Store)"
    echo "3. iOS Simulator"
    echo "4. iOS App Store"
    echo "5. Build Both Android + iOS (Preview)"
    echo "6. Build Both Android + iOS (Production)"
    echo "7. Exit"
    echo
}

while true; do
    show_menu
    read -p "Enter your choice (1-7): " choice
    
    case $choice in
        1)
            echo
            echo "Building Android APK for testing..."
            eas build --platform android --profile preview
            ;;
        2)
            echo
            echo "Building Android AAB for Play Store..."
            eas build --platform android --profile production
            ;;
        3)
            echo
            echo "Building iOS for Simulator..."
            eas build --platform ios --profile preview
            ;;
        4)
            echo
            echo "Building iOS for App Store..."
            eas build --platform ios --profile production
            ;;
        5)
            echo
            echo "Building both platforms for preview..."
            eas build --platform all --profile preview
            ;;
        6)
            echo
            echo "Building both platforms for production..."
            eas build --platform all --profile production
            ;;
        7)
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
    echo "Check https://expo.dev for your builds"
    echo "================================"
    echo
    read -p "Press Enter to continue..."
done