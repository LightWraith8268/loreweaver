@echo off
setlocal EnableDelayedExpansion
echo Starting build-local-android.bat
timeout /t 2 /nobreak >nul
echo ================================
echo    LOCAL ANDROID APK BUILD
echo ================================
echo DEBUG: Script started successfully
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
echo DEBUG: About to check Android SDK

call :check_android_sdk
echo DEBUG: Returned from check_android_sdk with errorlevel: %errorlevel%

if errorlevel 1 (
    echo.
    echo MANUAL SETUP INSTRUCTIONS (if auto-detection failed):
    echo 1. Download Android Studio: https://developer.android.com/studio
    echo 2. Install Android SDK (API level 30+)
    echo 3. Set ANDROID_HOME environment variable
    echo 4. Add Android SDK tools to PATH
    echo.
    echo DEBUG: SDK check failed, but continuing...
    pause
)

echo.
echo DEBUG: About to ask user to continue...
set /p continue_local="Continue with local build? (Y/n): "
echo DEBUG: User response: "%continue_local%"
if "%continue_local%"=="" set continue_local=Y
echo DEBUG: Processed response: "%continue_local%"
if /i "%continue_local%"=="n" (
    echo Build cancelled by user.
    pause
    exit /b
)
echo DEBUG: User chose to continue, proceeding with build...

echo.
echo ================================
echo Step 1: Installing Dependencies
echo ================================
echo DEBUG: About to run npm install...
npm install
set npm_exit_code=%errorlevel%
echo DEBUG: npm install completed with exit code: %npm_exit_code%
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo DEBUG: Step 1 completed successfully, proceeding to Step 2...
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

echo DEBUG: Step 2 completed successfully, proceeding to Step 3...
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

:: ================================
:: Android SDK Auto-Detection Function
:: ================================
:check_android_sdk
echo DEBUG: Starting Android SDK detection...
echo DEBUG: Inside check_android_sdk function

:: Check if ANDROID_HOME is already set
echo DEBUG: Checking ANDROID_HOME variable...
if defined ANDROID_HOME (
    echo DEBUG: ANDROID_HOME is defined
    echo ✓ Found ANDROID_HOME: %ANDROID_HOME%
    echo DEBUG: About to validate SDK
    pause
    call :validate_sdk "%ANDROID_HOME%"
    if errorlevel 1 (
        echo ✗ ANDROID_HOME is set but SDK is invalid
        call :auto_detect_sdk
    ) else (
        echo ✓ Android SDK validation passed
        call :set_android_paths "%ANDROID_HOME%"
        exit /b 0
    )
) else (
    echo DEBUG: ANDROID_HOME is not defined
    echo ⚠ ANDROID_HOME not set, attempting auto-detection...
    echo DEBUG: About to call auto_detect_sdk
    call :auto_detect_sdk
)
exit /b %errorlevel%

:auto_detect_sdk
echo DEBUG: Attempting to auto-detect Android SDK...
echo DEBUG: Inside auto_detect_sdk function

:: Test common Android SDK locations one by one
echo DEBUG: Testing path 1: %LOCALAPPDATA%\Android\Sdk
if exist "%LOCALAPPDATA%\Android\Sdk" (
    echo Found potential SDK at: %LOCALAPPDATA%\Android\Sdk
    set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
    call :set_android_paths "%LOCALAPPDATA%\Android\Sdk"
    echo DEBUG: SDK setup completed, returning from auto_detect_sdk
    exit /b 0
)

echo DEBUG: Testing path 2: %USERPROFILE%\AppData\Local\Android\Sdk
if exist "%USERPROFILE%\AppData\Local\Android\Sdk" (
    echo Found potential SDK at: %USERPROFILE%\AppData\Local\Android\Sdk
    set "ANDROID_HOME=%USERPROFILE%\AppData\Local\Android\Sdk"
    call :set_android_paths "%USERPROFILE%\AppData\Local\Android\Sdk"
    echo DEBUG: SDK setup completed, returning from auto_detect_sdk
    exit /b 0
)

echo DEBUG: Testing path 3: C:\Android\Sdk
if exist "C:\Android\Sdk" (
    echo Found potential SDK at: C:\Android\Sdk
    set "ANDROID_HOME=C:\Android\Sdk"
    call :set_android_paths "C:\Android\Sdk"
    echo DEBUG: SDK setup completed, returning from auto_detect_sdk
    exit /b 0
)

echo ✗ Could not auto-detect Android SDK
echo.
echo ANDROID SDK NOT FOUND - Options:
echo 1. Install Android Studio (recommended): https://developer.android.com/studio
echo 2. Install command-line tools only: https://developer.android.com/studio/index.html#command-tools
echo 3. Set ANDROID_HOME manually if SDK is installed elsewhere
echo.
echo DEBUG: About to exit auto_detect_sdk with error code 1
pause
exit /b 1

:validate_sdk
set "sdk_path=%~1"
echo DEBUG: Validating SDK at: %sdk_path%

:: Check for essential SDK components
set "missing_components="
if not exist "%sdk_path%\platform-tools\adb.exe" (
    echo ✗ Missing platform-tools/adb.exe
    set "missing_components=!missing_components! platform-tools"
)

if not exist "%sdk_path%\build-tools" (
    echo ✗ Missing build-tools directory
    set "missing_components=!missing_components! build-tools"
)

if not exist "%sdk_path%\platforms" (
    echo ✗ Missing platforms directory  
    set "missing_components=!missing_components! platforms"
)

:: If components are missing, offer to install them
if defined missing_components (
    echo.
    echo MISSING SDK COMPONENTS:!missing_components!
    call :offer_component_install "%sdk_path%"
    exit /b 1
)

:: Check for at least one Android platform (API 30+)
set "found_platform=0"
for /d %%d in ("%sdk_path%\platforms\android-*") do (
    set "found_platform=1"
    goto :platform_found
)
:platform_found
if "%found_platform%"=="0" (
    echo ✗ No Android platforms found
    exit /b 1
)

echo ✓ SDK validation successful
exit /b 0

:set_android_paths
set "sdk_path=%~1"
echo DEBUG: Setting up Android SDK environment...
echo DEBUG: Inside set_android_paths function with path: %sdk_path%

:: Set environment variables for this session
set "ANDROID_HOME=%sdk_path%"
set "ANDROID_SDK_ROOT=%sdk_path%"

:: Add Android tools to PATH for this session
set "PATH=%sdk_path%\platform-tools;%sdk_path%\tools;%sdk_path%\tools\bin;%PATH%"

echo ✓ Android SDK environment configured for this session
echo   ANDROID_HOME: %ANDROID_HOME%
echo   Platform tools: %sdk_path%\platform-tools
echo   Build tools: %sdk_path%\build-tools

:: Test ADB
echo DEBUG: About to test ADB...
"%sdk_path%\platform-tools\adb.exe" version >nul 2>&1
if errorlevel 1 (
    echo ⚠ Warning: ADB test failed
) else (
    echo ✓ ADB is working correctly
)

echo DEBUG: ADB test completed, about to exit set_android_paths function
exit /b 0

:offer_component_install
set "sdk_path=%~1"
echo.
echo AUTOMATIC COMPONENT INSTALLATION:
echo.
echo The Android SDK was found at: %sdk_path%
echo But some required components are missing.
echo.
echo Would you like to try automatic installation? (Y/n)
set /p install_choice=""
if "%install_choice%"=="" set install_choice=Y

if /i "%install_choice%"=="y" (
    call :install_sdk_components "%sdk_path%"
) else (
    echo.
    echo MANUAL INSTALLATION REQUIRED:
    echo 1. Open Android Studio
    echo 2. Go to Tools → SDK Manager
    echo 3. Install missing components: platform-tools, build-tools, Android platforms
    echo 4. Or use command line: sdkmanager "platform-tools" "build-tools;latest" "platforms;android-30"
)
exit /b 0

:install_sdk_components
set "sdk_path=%~1"
echo.
echo Attempting to install missing SDK components...

:: Check if sdkmanager exists
set "sdkmanager=%sdk_path%\cmdline-tools\latest\bin\sdkmanager.bat"
if not exist "%sdkmanager%" (
    set "sdkmanager=%sdk_path%\tools\bin\sdkmanager.bat"
)
if not exist "%sdkmanager%" (
    echo ✗ sdkmanager not found. Please install command-line tools manually.
    echo Download from: https://developer.android.com/studio/index.html#command-tools
    exit /b 1
)

echo ✓ Found sdkmanager: %sdkmanager%
echo Installing essential components...

:: Install essential components
"%sdkmanager%" "platform-tools" "build-tools;latest" "platforms;android-30" "platforms;android-33"
if errorlevel 1 (
    echo ✗ Component installation failed
    echo Try installing manually through Android Studio SDK Manager
    exit /b 1
) else (
    echo ✓ Components installed successfully
    echo Please restart the build process
)

exit /b 0