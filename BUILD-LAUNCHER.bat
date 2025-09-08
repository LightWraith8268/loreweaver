@echo off
:start
color 0A
echo.
echo ████████████████████████████████████████████████████████████████
echo ██                                                            ██
echo ██            🌟 LoreWeaver Build Launcher 🌟                ██
echo ██                                                            ██  
echo ██        Choose your build adventure below!                  ██
echo ██                                                            ██
echo ████████████████████████████████████████████████████████████████
echo.
echo 🚀 QUICK START OPTIONS:
echo.
echo   1. 📱 Quick Mobile Build     (Android APK - 5 min)
echo   2. 💻 Quick Desktop Build    (Windows EXE - 2 min)  
echo   3. 🌐 Quick Web Build        (PWA - 1 min)
echo   4. ⚡ All Quick Builds       (Essential apps - 8 min)
echo.
echo 🎯 ADVANCED BUILD OPTIONS:
echo.
echo   5. 🎯 Platform Selector      (Choose multiple platforms)
echo   6. 📱 Mobile Builder         (All mobile formats)
echo   7. 💻 Desktop Builder        (All desktop formats)
echo   8. 🌍 Universal Builder      (ALL platforms - 60 min)
echo.
echo 🛠️  SETUP & TOOLS:
echo.
echo   9. ⚙️  Setup Environment     (Install build tools)
echo  10. 🔧 Development Mode       (Live testing)
echo  11. 📚 Build Documentation    (How-to guides)
echo.
echo  12. ❌ Exit
echo.
echo ████████████████████████████████████████████████████████████████
echo.
set /p choice="Enter your choice (1-12): "

if "%choice%"=="1" goto quick_mobile
if "%choice%"=="2" goto quick_desktop
if "%choice%"=="3" goto quick_web
if "%choice%"=="4" goto quick_all
if "%choice%"=="5" goto platform_selector
if "%choice%"=="6" goto mobile_builder
if "%choice%"=="7" goto desktop_builder
if "%choice%"=="8" goto universal_builder
if "%choice%"=="9" goto setup
if "%choice%"=="10" goto dev_mode
if "%choice%"=="11" goto documentation
if "%choice%"=="12" goto exit
echo Invalid choice. Please try again.
goto menu

:quick_mobile
echo.
echo 📱 Launching Quick Mobile Build...
call scripts\quick-build.bat
goto restart

:quick_desktop
echo.
echo 💻 Launching Quick Desktop Build...
call scripts\build-desktop.bat
goto restart

:quick_web
echo.
echo 🌐 Building Web PWA...
call npm run build:web
echo.
echo ✅ Web build complete! Check 'web-build' folder.
pause
goto restart

:quick_all
echo.
echo ⚡ Launching All Quick Builds...
call scripts\quick-build.bat
goto restart

:platform_selector
echo.
echo 🎯 Launching Platform Selector...
if exist scripts\build-selector.bat (
    call scripts\build-selector.bat
) else (
    echo Error: Platform selector script not found!
    pause
)
goto restart

:mobile_builder
echo.
echo 📱 Launching Mobile Builder...
if exist scripts\build-mobile.bat (
    call scripts\build-mobile.bat
) else (
    echo Error: Mobile builder script not found!
    pause
)
goto restart

:desktop_builder
echo.
echo 💻 Launching Desktop Builder...  
if exist scripts\build-desktop.bat (
    call scripts\build-desktop.bat
) else (
    echo Error: Desktop builder script not found!
    pause
)
goto restart

:universal_builder
echo.
echo 🌍 Launching Universal Builder...
call scripts\build-all.bat
goto restart

:setup
echo.
echo ⚙️ Setting up build environment...
if exist scripts\setup-build-environment.bat (
    call scripts\setup-build-environment.bat
) else (
    echo Error: Setup script not found!
    pause
)
goto restart

:dev_mode
echo.
echo 🔧 Starting development mode...
echo Choose development option:
echo 1. Mobile (Expo)
echo 2. Desktop (Electron)  
echo 3. Web (Browser)
set /p dev_choice="Enter choice (1-3): "

if "%dev_choice%"=="1" (
    echo Starting mobile development...
    call npm start
) else if "%dev_choice%"=="2" (
    echo Starting desktop development...
    call npm run electron:dev
) else if "%dev_choice%"=="3" (
    echo Starting web development...
    call npm run start-web
) else (
    echo Invalid choice.
)
goto restart

:documentation
echo.
echo 📚 Opening build documentation...
start "" "BUILD_GUIDE.md"
start "" "scripts\README.md"
echo Documentation opened in your default editor.
pause
goto restart

:restart
echo.
echo ████████████████████████████████████████████████████████████████
echo.
set /p continue="Return to main menu? (Y/n): "
if /i "%continue%"=="n" goto exit
cls
goto menu

:exit
echo.
echo Thanks for using LoreWeaver Build Launcher! 🚀
echo Your worlds await across all platforms! 🌟
echo.
pause
exit

:menu
cls