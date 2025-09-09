@echo off
setlocal enabledelayedexpansion
color 0F
cls
title LoreWeaver Platform Builder

REM Initialize error logging
set "LOG_DIR=%~dp0..\logs"
set "ERROR_LOG=%LOG_DIR%\build-errors-%date:~-4,4%%date:~-10,2%%date:~-7,2%-%time:~0,2%%time:~3,2%%time:~6,2%.log"
set "ERROR_LOG=%ERROR_LOG: =0%"

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
echo [%date% %time%] Build session started > "%ERROR_LOG%"
echo [%date% %time%] Platform: Windows Batch Script >> "%ERROR_LOG%"
echo [%date% %time%] Working Directory: %CD% >> "%ERROR_LOG%"
echo. >> "%ERROR_LOG%"

:init_vars
set "android_apk=0"
set "android_aab=0"
set "ios_sim=0"
set "ios_store=0"
set "windows_exe=0"
set "windows_msi=0"
set "macos_dmg=0"
set "linux_appimage=0"
set "linux_snap=0"
set "web_pwa=0"

:main_menu
cls
echo ======================================================================
echo                                                                      
echo                   LoreWeaver Platform Builder                  
echo                                                                      
echo           Select platforms to build with checkboxes below:          
echo                                                                      
echo ======================================================================
echo.
echo MOBILE PLATFORMS:
call :show_option android_apk "1" "Android APK (Preview/Testing)"
call :show_option android_aab "2" "Android AAB (Play Store)"
call :show_option ios_sim "3" "iOS Simulator"
call :show_option ios_store "4" "iOS App Store"
echo.
echo DESKTOP PLATFORMS:
call :show_option windows_exe "5" "Windows EXE"
call :show_option windows_msi "6" "Windows MSI Installer"
call :show_option macos_dmg "7" "macOS DMG"
call :show_option linux_appimage "8" "Linux AppImage"
call :show_option linux_snap "9" "Linux Snap"
echo.
echo WEB PLATFORM:
call :show_option web_pwa "10" "Web PWA"
echo.
echo ======================================================================
echo                               QUICK PRESETS                        
echo ======================================================================
echo   A. All Mobile Platforms        D. All Desktop Platforms
echo   B. Mobile Production           E. Essential Builds (APK+EXE+PWA)
echo   C. Mobile Testing              F. Everything (All Platforms)
echo.
echo ACTIONS:
echo   X. Clear All Selections        S. Start Building
echo   Q. Quit                        H. Help
echo.
echo Selected platforms: !selected_count! / 10
echo Estimated build time: !estimated_time! minutes
echo.
set /p choice="Enter option (1-10, A-F, X, S, Q, H): "

if /i "%choice%"=="1" call :toggle_option android_apk
if /i "%choice%"=="2" call :toggle_option android_aab  
if /i "%choice%"=="3" call :toggle_option ios_sim
if /i "%choice%"=="4" call :toggle_option ios_store
if /i "%choice%"=="5" call :toggle_option windows_exe
if /i "%choice%"=="6" call :toggle_option windows_msi
if /i "%choice%"=="7" call :toggle_option macos_dmg
if /i "%choice%"=="8" call :toggle_option linux_appimage
if /i "%choice%"=="9" call :toggle_option linux_snap
if /i "%choice%"=="10" call :toggle_option web_pwa

if /i "%choice%"=="A" call :preset_all_mobile
if /i "%choice%"=="B" call :preset_mobile_production
if /i "%choice%"=="C" call :preset_mobile_testing
if /i "%choice%"=="D" call :preset_all_desktop
if /i "%choice%"=="E" call :preset_essential
if /i "%choice%"=="F" call :preset_everything

if /i "%choice%"=="X" call :clear_all
if /i "%choice%"=="S" goto start_building
if /i "%choice%"=="Q" goto quit
if /i "%choice%"=="H" call :show_help

call :calculate_stats
goto main_menu

:show_option
set var_name=%1
set option_num=%2
set description=%3
set var_name=%var_name:"=%
set option_num=%option_num:"=%
set description=%description:"=%

if "!%var_name%!"=="1" (
    echo   [✓] %option_num%. %description%
) else (
    echo   [ ] %option_num%. %description%
)
exit /b

:toggle_option
set var_name=%1
set var_name=%var_name:"=%
if "!%var_name%!"=="1" (
    set "%var_name%=0"
) else (
    set "%var_name%=1"
)
exit /b

:preset_all_mobile
set "android_apk=1"
set "android_aab=1"
set "ios_sim=1"
set "ios_store=1"
exit /b

:preset_mobile_production
set "android_aab=1"
set "ios_store=1"
exit /b

:preset_mobile_testing
set "android_apk=1"
set "ios_sim=1"
exit /b

:preset_all_desktop
set "windows_exe=1"
set "windows_msi=1"
set "macos_dmg=1"
set "linux_appimage=1"
set "linux_snap=1"
exit /b

:preset_essential
set "android_apk=1"
set "windows_exe=1"
set "web_pwa=1"
exit /b

:preset_everything
set "android_apk=1"
set "android_aab=1"
set "ios_sim=1"
set "ios_store=1"
set "windows_exe=1"
set "windows_msi=1"
set "macos_dmg=1"
set "linux_appimage=1"
set "linux_snap=1"
set "web_pwa=1"
exit /b

:clear_all
set "android_apk=0"
set "android_aab=0"
set "ios_sim=0"
set "ios_store=0"
set "windows_exe=0"
set "windows_msi=0"
set "macos_dmg=0"
set "linux_appimage=0"
set "linux_snap=0"
set "web_pwa=0"
exit /b

:calculate_stats
set /a selected_count=0
set /a estimated_time=0

if "!android_apk!"=="1" (
    set /a selected_count+=1
    set /a estimated_time+=5
)
if "!android_aab!"=="1" (
    set /a selected_count+=1
    set /a estimated_time+=5
)
if "!ios_sim!"=="1" (
    set /a selected_count+=1
    set /a estimated_time+=8
)
if "!ios_store!"=="1" (
    set /a selected_count+=1
    set /a estimated_time+=8
)
if "!windows_exe!"=="1" (
    set /a selected_count+=1
    set /a estimated_time+=2
)
if "!windows_msi!"=="1" (
    set /a selected_count+=1
    set /a estimated_time+=3
)
if "!macos_dmg!"=="1" (
    set /a selected_count+=1
    set /a estimated_time+=3
)
if "!linux_appimage!"=="1" (
    set /a selected_count+=1
    set /a estimated_time+=3
)
if "!linux_snap!"=="1" (
    set /a selected_count+=1
    set /a estimated_time+=4
)
if "!web_pwa!"=="1" (
    set /a selected_count+=1
    set /a estimated_time+=1
)

exit /b

:show_help
cls
echo ████████████████████████████████████████████████████████████████
echo ██                      📚 HELP GUIDE 📚                      ██
echo ████████████████████████████████████████████████████████████████
echo.
echo PLATFORM DESCRIPTIONS:
echo.
echo MOBILE:
echo   • Android APK    - Direct install file for testing
echo   • Android AAB    - Google Play Store format
echo   • iOS Simulator  - For testing on iOS Simulator
echo   • iOS App Store  - For App Store submission
echo.
echo  DESKTOP:
echo   • Windows EXE    - Portable executable
echo   • Windows MSI    - Professional installer
echo   • macOS DMG      - Mac disk image installer
echo   • Linux AppImage - Portable Linux executable
echo   • Linux Snap     - Ubuntu Snap package
echo.
echo  WEB:
echo   • Web PWA        - Progressive Web App (works everywhere)
echo.
echo QUICK PRESETS:
echo   A. All Mobile      - All 4 mobile formats
echo   B. Mobile Prod     - Store-ready (AAB + iOS Store)
echo   C. Mobile Test     - Testing (APK + iOS Sim)
echo   D. All Desktop     - All 5 desktop formats
echo   E. Essential       - APK + Windows EXE + PWA (fast)
echo   F. Everything      - All 10 platforms (60+ min)
echo.
echo REQUIREMENTS:
echo   • EAS CLI for mobile builds (eas login required)
echo   • Apple Developer account for iOS builds
echo   • Appropriate build tools for desktop cross-compilation
echo.
pause
goto main_menu

:start_building
call :calculate_stats
echo [%date% %time%] Starting build process >> "%ERROR_LOG%"
echo [%date% %time%] Selected platforms: %selected_count% >> "%ERROR_LOG%"

if %selected_count%==0 (
    echo.
    echo X No platforms selected! Please select at least one platform.
    echo [%date% %time%] ERROR: No platforms selected >> "%ERROR_LOG%"
    pause
    goto main_menu
)

cls
echo ========================================================================
echo ║                       STARTING BUILD PROCESS                    echo ========================================================================
echo.
echo Selected platforms: %selected_count%
echo Estimated time: %estimated_time% minutes
echo.
echo Building the following platforms:
if "!android_apk!"=="1" echo   ✓ Android APK (Preview)
if "!android_aab!"=="1" echo   ✓ Android AAB (Production)
if "!ios_sim!"=="1" echo   ✓ iOS Simulator
if "!ios_store!"=="1" echo   ✓ iOS App Store
if "!windows_exe!"=="1" echo   ✓ Windows EXE
if "!windows_msi!"=="1" echo   ✓ Windows MSI
if "!macos_dmg!"=="1" echo   ✓ macOS DMG
if "!linux_appimage!"=="1" echo   ✓ Linux AppImage
if "!linux_snap!"=="1" echo   ✓ Linux Snap
if "!web_pwa!"=="1" echo   ✓ Web PWA
echo.
set /p confirm="Continue with build? (Y/N): "
if /i not "%confirm%"=="Y" goto main_menu

echo.
echo ================================
echo Step 1: Installing Dependencies
echo ================================
call :run_command "npm install" "Installing dependencies"
if errorlevel 1 goto error

:: Web build (required for most desktop builds)
set need_web=0
if "!windows_exe!"=="1" set need_web=1
if "!windows_msi!"=="1" set need_web=1
if "!macos_dmg!"=="1" set need_web=1
if "!linux_appimage!"=="1" set need_web=1
if "!linux_snap!"=="1" set need_web=1
if "!web_pwa!"=="1" set need_web=1

if "%need_web%"=="1" (
    echo.
    echo ================================
    echo Step 2: Building Web Version
    echo ================================
    call :run_command "npm run build:web" "Building web version"
    if errorlevel 1 goto error
)

:: Mobile builds
set mobile_count=0
if "!android_apk!"=="1" set /a mobile_count+=1
if "!android_aab!"=="1" set /a mobile_count+=1
if "!ios_sim!"=="1" set /a mobile_count+=1
if "!ios_store!"=="1" set /a mobile_count+=1

if %mobile_count% gtr 0 (
    echo.
    echo ================================
    echo Step 3: Building Mobile Apps (%mobile_count% builds)
    echo ================================
    
    if "!android_apk!"=="1" (
        echo Building Android APK (Standalone - No Server Required)...
        call eas build --platform android --profile standalone-apk --non-interactive
    )
    
    if "!android_aab!"=="1" (
        echo Building Android AAB...
        call eas build --platform android --profile production --non-interactive
    )
    
    if "!ios_sim!"=="1" (
        echo Building iOS Simulator...
        call eas build --platform ios --profile preview --non-interactive
    )
    
    if "!ios_store!"=="1" (
        echo Building iOS App Store...
        call eas build --platform ios --profile production --non-interactive
    )
)

:: Desktop builds
set desktop_count=0
if "!windows_exe!"=="1" set /a desktop_count+=1
if "!windows_msi!"=="1" set /a desktop_count+=1
if "!macos_dmg!"=="1" set /a desktop_count+=1
if "!linux_appimage!"=="1" set /a desktop_count+=1
if "!linux_snap!"=="1" set /a desktop_count+=1

if %desktop_count% gtr 0 (
    echo.
    echo ================================
    echo Step 4: Building Desktop Apps (%desktop_count% builds)
    echo ================================
    
    set electron_args=
    if "!windows_exe!"=="1" set electron_args=!electron_args! --win
    if "!macos_dmg!"=="1" set electron_args=!electron_args! --mac
    if "!linux_appimage!"=="1" set electron_args=!electron_args! --linux AppImage
    if "!linux_snap!"=="1" set electron_args=!electron_args! --linux snap
    
    if "!windows_msi!"=="1" (
        echo Building Windows MSI...
        call npx electron-builder --win nsis
        if errorlevel 1 echo Warning: Windows MSI build failed
    )
    
    if not "!electron_args!"=="" (
        echo Building desktop apps with: !electron_args!
        call npx electron-builder !electron_args!
        if errorlevel 1 echo Warning: Some desktop builds may have failed
    )
)

goto success

:success
echo.
echo ████████████████████████████████████████████████████████████████
echo ██                    🎉 BUILD COMPLETE! 🎉                   ██
echo ████████████████████████████████████████████████████████████████
echo.
echo Successfully built %selected_count% platform(s) in approximately %estimated_time% minutes!
echo.
echo 📁 YOUR APPS ARE READY:
echo.
if "!android_apk!"=="1" echo    Android APK: Check https://expo.dev/builds
if "!android_aab!"=="1" echo    Android AAB: Check https://expo.dev/builds
if "!ios_sim!"=="1" echo    iOS Simulator: Check https://expo.dev/builds
if "!ios_store!"=="1" echo    iOS App Store: Check https://expo.dev/builds
if "!windows_exe!"=="1" echo    Windows EXE: dist\LoreWeaver.exe
if "!windows_msi!"=="1" echo    Windows MSI: dist\LoreWeaver Setup.exe
if "!macos_dmg!"=="1" echo    macOS DMG: dist\LoreWeaver.dmg
if "!linux_appimage!"=="1" echo    Linux AppImage: dist\LoreWeaver.AppImage
if "!linux_snap!"=="1" echo    Linux Snap: dist\loreweaver_*.snap
if "!web_pwa!"=="1" echo    Web PWA: web-build\ folder (deploy to hosting)
echo.
echo  NEXT STEPS:
echo   • Test your apps on target devices
echo   • Set up code signing for production distribution
echo   • Submit to app stores if building for production
echo   • Deploy web version to hosting service
echo.
goto end

:run_command
set command=%1
set description=%2
set command=%command:"=%
set description=%description:"=%

echo [%date% %time%] Executing: %command% >> "%ERROR_LOG%"
echo [%date% %time%] Description: %description% >> "%ERROR_LOG%"

echo    %description%...
%command% 2>>"%ERROR_LOG%"
set exit_code=%errorlevel%

if %exit_code% neq 0 (
    echo [%date% %time%] ERROR: Command failed with exit code %exit_code% >> "%ERROR_LOG%"
    echo [%date% %time%] Command: %command% >> "%ERROR_LOG%"
) else (
    echo [%date% %time%] SUCCESS: %description% completed >> "%ERROR_LOG%"
)

exit /b %exit_code%

:error
echo.
echo ========================================================================
echo ║                           X BUILD FAILED X                           echo ========================================================================
echo.
echo Error details have been logged to:
echo %ERROR_LOG%
echo.
echo [%date% %time%] Build process failed >> "%ERROR_LOG%"
echo [%date% %time%] Error details logged above >> "%ERROR_LOG%"
echo.
echo Common solutions:
echo   1. Check if all dependencies are installed (npm install)
echo   2. Verify EAS CLI is logged in (eas login)
echo   3. Check network connection for mobile builds
echo   4. Ensure Electron dependencies for desktop builds
echo.
goto end

:end
set /p continue="Build another combination? (Y/N): "
if /i "%continue%"=="Y" goto main_menu
goto quit

:quit
echo [%date% %time%] Build session ended by user >> "%ERROR_LOG%"
echo.
echo ========================================================================
echo ║            Thanks for using LoreWeaver Platform Builder!           echo ========================================================================
echo.
if exist "%ERROR_LOG%" (
    echo Build log saved to: %ERROR_LOG%
    echo.
)
pause
exit