@echo off
echo ================================
echo    LOCAL ANDROID APK BUILD
echo ================================
echo DEBUG: Script starting...
timeout /t 1 /nobreak >nul
echo.
echo This will build the APK locally on your machine.
echo The APK file will be created in: android\app\build\outputs\apk\release\
echo.
echo REQUIREMENTS:
echo - Android SDK and development tools
echo - Java Development Kit (JDK 11 or later)  
echo - Android Studio or Android command line tools
echo - Gradle (included with Android SDK)
echo.
echo CHECKING ANDROID SDK CONFIGURATION...
echo ================================
echo.

REM Check if ANDROID_HOME is set
if defined ANDROID_HOME (
    echo Found ANDROID_HOME: %ANDROID_HOME%
) else (
    echo ANDROID_HOME not set, checking common locations...
    
    REM Check common Android SDK locations
    if exist "%LOCALAPPDATA%\Android\Sdk" (
        echo Found Android SDK at: %LOCALAPPDATA%\Android\Sdk
        set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
    ) else if exist "%USERPROFILE%\AppData\Local\Android\Sdk" (
        echo Found Android SDK at: %USERPROFILE%\AppData\Local\Android\Sdk
        set "ANDROID_HOME=%USERPROFILE%\AppData\Local\Android\Sdk"
    ) else if exist "C:\Android\Sdk" (
        echo Found Android SDK at: C:\Android\Sdk
        set "ANDROID_HOME=C:\Android\Sdk"
    ) else (
        echo.
        echo ANDROID SDK NOT FOUND!
        echo Please install Android Studio or set ANDROID_HOME manually.
        echo Download from: https://developer.android.com/studio
        echo.
        pause
        exit /b 1
    )
)

echo.
echo Android SDK configured: %ANDROID_HOME%
echo.

set /p continue_local="Continue with local build? (Y/n): "
if "%continue_local%"=="" set continue_local=Y
if /i "%continue_local%"=="n" (
    echo Build cancelled by user.
    pause
    exit /b 1
)

echo.
echo ================================
echo Step 1: Installing Dependencies
echo ================================
npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo DEBUG: npm install completed successfully, continuing to Step 2...
pause

echo.
echo ================================  
echo Step 2: Initialize EAS (if needed)
echo ================================
echo Checking if EAS is initialized...
npx eas init --non-interactive --skip-project-configuration 2>nul || echo EAS already initialized or skipped

echo.
echo ================================  
echo Step 3: Generate Native Project
echo ================================  
echo DEBUG: Starting Step 3...
echo This creates the android/ folder...
npx expo prebuild --platform android --clean --package-manager npm
if errorlevel 1 (
    echo ERROR: Expo prebuild failed
    pause
    exit /b 1
)

echo.
echo ================================
echo Step 4: Building APK with Gradle
echo ================================
if not exist "android" (
    echo ERROR: Android folder not found!
    pause
    exit /b 1
)

cd android
if exist "gradlew.bat" (
    .\gradlew assembleRelease
) else (
    gradle assembleRelease
)

if errorlevel 1 (
    echo BUILD FAILED!
    pause
    exit /b 1
) else (
    echo BUILD SUCCESSFUL!
    pause
)

cd ..
exit /b 0