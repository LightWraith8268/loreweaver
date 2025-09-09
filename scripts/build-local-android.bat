@echo off
echo ================================
echo    LOCAL ANDROID APK BUILD
echo ================================
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
echo SETUP INSTRUCTIONS (if not done already):
echo 1. Download Android Studio: https://developer.android.com/studio
echo 2. Install Android SDK (API level 30+)
echo 3. Set ANDROID_HOME environment variable
echo 4. Add Android SDK tools to PATH
echo.
set /p continue_local="Continue with local build? (Y/n): "
if /i "%continue_local%"=="n" (
    echo Build cancelled by user.
    pause
    exit /b
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

echo.
echo ================================
echo Step 2: Generate Native Project
echo ================================
echo This creates the android/ folder with native Android build files.
echo This may take a few minutes on first run...
npx expo prebuild --platform android --clean
set prebuild_exit_code=%errorlevel%

if %prebuild_exit_code% neq 0 (
    echo.
    echo ================================
    echo    PREBUILD FAILED!
    echo ================================
    echo Expo prebuild failed with exit code: %prebuild_exit_code%
    echo.
    echo COMMON ISSUES:
    echo - Android SDK not installed or not in PATH
    echo - ANDROID_HOME environment variable not set
    echo - Java JDK not installed or wrong version
    echo - Insufficient permissions
    echo.
    echo SETUP HELP:
    echo 1. Install Android Studio from https://developer.android.com/studio
    echo 2. Open Android Studio and install SDK
    echo 3. Set environment variables:
    echo    ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
    echo    Add to PATH: %%ANDROID_HOME%%\tools;%%ANDROID_HOME%%\platform-tools
    echo 4. Restart command prompt and try again
    echo.
    pause
    exit /b 1
)

echo.
echo ================================
echo Step 3: Building APK with Gradle
echo ================================
echo This builds the actual APK file - may take 5-15 minutes...

if not exist "android" (
    echo ERROR: Android folder not found! Prebuild may have failed.
    pause
    exit /b 1
)

cd android

echo Checking Gradle wrapper...
if exist "gradlew.bat" (
    echo Gradle wrapper found, using gradlew.bat
    .\gradlew assembleRelease
) else if exist "gradlew" (
    echo Using gradlew script
    .\gradlew assembleRelease
) else (
    echo No Gradle wrapper found, using system gradle
    gradle assembleRelease
)

set gradle_exit_code=%errorlevel%
cd ..

if %gradle_exit_code% equ 0 (
    echo.
    echo ================================
    echo    BUILD SUCCESSFUL!
    echo ================================
    echo Your Android APK has been built locally!
    echo.
    echo APK LOCATION:
    if exist "android\app\build\outputs\apk\release\app-release.apk" (
        echo SUCCESS: android\app\build\outputs\apk\release\app-release.apk
        echo.
        echo File details:
        dir "android\app\build\outputs\apk\release\app-release.apk" /Q
        echo.
        echo APK is ready to install!
    ) else (
        echo Warning: Release APK not found at expected location.
        echo Checking for debug APK...
        if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
            echo DEBUG APK found: android\app\build\outputs\apk\debug\app-debug.apk
            dir "android\app\build\outputs\apk\debug\app-debug.apk" /Q
        ) else (
            echo No APK files found. Build may have failed.
            echo Check the Gradle output above for errors.
        )
    )
    echo.
    echo INSTALLATION OPTIONS:
    echo 1. USB Install: adb install android\app\build\outputs\apk\release\app-release.apk
    echo 2. Manual: Copy APK to device and install
    echo 3. Email/Cloud: Send APK file to yourself
    echo.
    echo NOTE: Enable "Unknown sources" in Android settings if needed
    echo.
    pause
    exit /b 0
) else (
    echo.
    echo ================================
    echo    BUILD FAILED!
    echo ================================
    echo Gradle build failed with exit code: %gradle_exit_code%
    echo.
    echo COMMON SOLUTIONS:
    echo 1. Check Android SDK is properly installed
    echo 2. Verify ANDROID_HOME environment variable
    echo 3. Ensure Java JDK 11+ is installed
    echo 4. Clean build: cd android && .\gradlew clean
    echo 5. Update Android SDK and build tools
    echo 6. Check available disk space (need 2GB+)
    echo.
    echo ENVIRONMENT CHECK:
    echo ANDROID_HOME: %ANDROID_HOME%
    echo JAVA_HOME: %JAVA_HOME%
    echo.
    if exist "android\gradlew.bat" (
        echo Try manual clean: cd android && .\gradlew clean && .\gradlew assembleRelease
    )
    echo.
    echo Check the detailed Gradle error messages above for specific issues.
    pause
    exit /b 1
)