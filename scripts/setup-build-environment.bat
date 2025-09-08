@echo off
echo ================================================
echo       LoreWeaver Build Environment Setup
echo ================================================
echo.
echo This script will install all necessary tools for building LoreWeaver across all platforms.
echo.

:check_node
echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found!
    echo Please install Node.js 18+ from: https://nodejs.org
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do echo ✅ Node.js %%i found
)

:check_npm
echo Checking npm installation...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm not found!
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do echo ✅ npm %%i found
)

:install_global_tools
echo.
echo ================================
echo Installing Global Tools
echo ================================

echo Installing EAS CLI for mobile builds...
call npm install -g @expo/eas-cli
if errorlevel 1 (
    echo ⚠️  EAS CLI installation failed - mobile builds may not work
) else (
    echo ✅ EAS CLI installed
)

echo Installing Expo CLI...
call npm install -g @expo/cli
if errorlevel 1 (
    echo ⚠️  Expo CLI installation failed - mobile builds may not work  
) else (
    echo ✅ Expo CLI installed
)

:install_project_deps
echo.
echo ================================
echo Installing Project Dependencies
echo ================================

echo Installing main dependencies...
call npm install
if errorlevel 1 goto error

:check_optional_tools
echo.
echo ================================
echo Checking Optional Build Tools
echo ================================

echo Checking for Windows SDK (for Windows builds)...
where signtool >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Windows SDK not found - Windows code signing will not work
    echo   Install from: https://developer.microsoft.com/windows/downloads/windows-sdk/
) else (
    echo ✅ Windows SDK found
)

echo Checking for Python (for native modules)...
python --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Python not found - some native modules may fail to build
    echo   Install from: https://www.python.org/downloads/
) else (
    for /f "tokens=*" %%i in ('python --version') do echo ✅ Python %%i found
)

echo Checking for Visual Studio Build Tools...
where cl >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Visual Studio Build Tools not found - Windows builds may fail
    echo   Install from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
) else (
    echo ✅ Visual Studio Build Tools found
)

:create_folders
echo.
echo ================================
echo Creating Build Directories
echo ================================

if not exist "dist" mkdir dist
if not exist "web-build" mkdir "web-build"
if not exist "assets\images" mkdir "assets\images"

echo ✅ Build directories created

:setup_complete
echo.
echo ================================================
echo         🎉 SETUP COMPLETE! 🎉
echo ================================================
echo.
echo Your build environment is ready!
echo.
echo 📋 NEXT STEPS:
echo.
echo 📱 For Mobile Builds:
echo   1. Create account at https://expo.dev
echo   2. Run: eas login
echo   3. Run: eas build:configure
echo.
echo 🍎 For iOS Builds (Mac only):
echo   1. Install Xcode from Mac App Store
echo   2. Get Apple Developer account ($99/year)
echo   3. Configure certificates in Xcode
echo.
echo 🤖 For Android Builds:
echo   1. Install Android Studio (optional but recommended)
echo   2. Builds will work with EAS cloud service
echo.
echo 💻 For Desktop Builds:
echo   Ready to go! Run desktop build scripts.
echo.
echo 🌐 For Web Builds:
echo   Ready to go! No additional setup needed.
echo.
echo 🚀 QUICK START:
echo   - Mobile: Run scripts\build-mobile.bat
echo   - Desktop: Run scripts\build-desktop.bat
echo   - All platforms: Run scripts\build-all.bat
echo.
goto end

:error
echo.
echo ❌ Setup failed! Check the error messages above.
echo.

:end
pause
exit