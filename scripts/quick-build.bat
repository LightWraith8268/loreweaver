@echo off
echo ================================
echo    LoreWeaver Quick Builder
echo ================================
echo.
echo Choose your quick build option:
echo.
echo 1. Mobile APK (Android - 5 min)
echo 2. Windows EXE (Desktop - 2 min)
echo 3. Web PWA (Web App - 1 min)
echo 4. All Quick Builds (8 min total)
echo.
set /p choice="Enter choice (1-4): "

if "%choice%"=="1" goto mobile_quick
if "%choice%"=="2" goto desktop_quick  
if "%choice%"=="3" goto web_quick
if "%choice%"=="4" goto all_quick
goto exit

:mobile_quick
echo.
echo ================================
echo   ANDROID APK BUILD OPTIONS
echo ================================
echo.
echo Choose your build method:
echo.
echo 1. Cloud Build (EAS) - Recommended
echo    - No local setup required
echo    - Professional signing
echo    - 5-10 minute build time
echo    - Download from https://expo.dev/builds
echo.
echo 2. Local Build (Experimental)
echo    - Requires Android SDK setup
echo    - Build APK on your machine
echo    - Faster for development
echo    - APK saved to android/app/build/outputs/apk/
echo.
set /p build_method="Choose build method (1-2): "
echo.

if "%build_method%"=="1" goto cloud_build
if "%build_method%"=="2" goto local_build
echo Invalid choice. Please try again.
echo.
goto mobile_quick

:cloud_build
echo ================================
echo    CLOUD BUILD (EAS)
echo ================================
echo.
echo Checking EAS CLI installation...
where eas
if errorlevel 1 (
    echo EAS CLI not found.
    set /p install_eas="Do you want to install EAS CLI? (Y/n): "
    if /i "%install_eas%"=="n" (
        echo Build cancelled - EAS CLI required for cloud builds.
        pause
        exit /b
    )
    echo Installing EAS CLI...
    npm install -g @expo/eas-cli
    if errorlevel 1 (
        echo ERROR: Failed to install EAS CLI
        pause
        exit /b 1
    )
    echo EAS CLI installed successfully.
) else (
    echo EAS CLI found.
)

echo Checking EAS login status...
eas whoami
if errorlevel 1 (
    echo.
    echo You need to login to Expo to build mobile apps.
    set /p do_login="Do you want to login now? (Y/n): "
    if /i "%do_login%"=="n" (
        echo Build cancelled - Login required for mobile builds.
        pause
        goto done
    )
    echo Starting login process...
    eas login
    if errorlevel 1 (
        echo ERROR: Login failed or was cancelled
        pause
        goto done
    )
)

echo Checking if project is configured for EAS...
if not exist "eas.json" (
    set /p configure_eas="Project not configured for EAS. Configure now? (Y/n): "
    if /i "%configure_eas%"=="n" (
        echo Build cancelled - EAS configuration required.
        pause
        goto done
    )
    echo Configuring project for EAS builds...
    eas build:configure --platform android
)

set /p install_deps="Install/update dependencies? (Y/n): "
if /i not "%install_deps%"=="n" (
    echo Installing dependencies...
    npm install
)

echo Starting Android build...
set /p start_build="Start Android build now? (Y/n): "
if /i "%start_build%"=="n" (
    echo Build cancelled by user.
    pause
    goto exit
)
echo Launching EAS cloud build...
eas build --platform android --profile preview
set build_exit_code=%errorlevel%

if %build_exit_code% equ 0 (
    echo.
    echo ================================
    echo    BUILD SUCCESSFUL!
    echo ================================
    echo Your Android APK cloud build has been submitted successfully!
    echo.
    echo APK LOCATION INFORMATION:
    echo - EAS Build Dashboard: https://expo.dev/builds
    echo - You will receive an email when the build is complete
    echo - Build status can be checked with: eas build:list
    echo - Once complete, APK download link will be in build details
    echo - Build typically takes 5-10 minutes to complete
    echo.
    echo WHAT HAPPENS NEXT:
    echo 1. EAS servers are now building your APK
    echo 2. You'll get email notification when ready
    echo 3. Download APK from the build dashboard
    echo 4. Install APK directly on Android devices for testing
    echo.
    pause
    exit /b
) else (
    echo.
    echo ================================
    echo    BUILD FAILED!
    echo ================================
    echo EAS build command failed with exit code: %build_exit_code%
    echo This could be due to:
    echo - Authentication issues ^(run 'eas login'^)
    echo - Configuration problems ^(check eas.json^)
    echo - Dependency conflicts ^(check package.json^)
    echo - Network connectivity issues
    echo - Project not configured for EAS builds
    echo.
    echo TROUBLESHOOTING STEPS:
    echo 1. Verify login: eas whoami
    echo 2. Check project config: eas build:configure
    echo 3. Review dependencies: npm install
    echo 4. Check build logs for specific errors
    echo.
    echo Please check the error messages above and try again.
    pause
    exit /b 1
)

:desktop_quick
echo.
echo Building Windows Desktop Application...
echo.

set /p install_deps="Install/update dependencies? (Y/n): "
if /i not "%install_deps%"=="n" (
    echo Installing dependencies...
    npm install
)

set /p build_web="Build web version first? (Y/n): "
if /i not "%build_web%"=="n" (
    echo Building web version...
    npm run build:web
    set web_exit_code=%errorlevel%
    if !web_exit_code! neq 0 (
        echo ERROR: Web build failed with exit code: !web_exit_code!
        echo Desktop build cannot continue without web build.
        pause
        exit /b 1
    )
)

echo Building Windows EXE...
set /p start_build="Start Windows build now? (Y/n): "
if /i "%start_build%"=="n" (
    echo Build cancelled by user.
    pause
    exit /b
)
echo Starting Electron build...
npx electron-builder --win --x64
set build_exit_code=%errorlevel%

if %build_exit_code% equ 0 (
    echo.
    echo ================================
    echo    BUILD SUCCESSFUL!
    echo ================================
    echo Windows EXE created successfully!
    echo.
    echo Built files location: dist\ folder
    if exist "dist\LoreWeaver Setup.exe" echo - LoreWeaver Setup.exe ^(Installer^)
    if exist "dist\LoreWeaver.exe" echo - LoreWeaver.exe ^(Portable^)
    if exist "dist\win-unpacked\LoreWeaver.exe" echo - win-unpacked\LoreWeaver.exe ^(Unpacked^)
    echo.
    pause
    exit /b
) else (
    echo.
    echo ================================
    echo    BUILD FAILED!
    echo ================================
    echo Electron build failed with exit code: %build_exit_code%
    echo This could be due to:
    echo - Missing dependencies ^(run npm install^)
    echo - Web build not completed ^(run npm run build:web first^)
    echo - Electron configuration issues ^(check package.json^)
    echo - Insufficient disk space or permissions
    echo.
    echo Please check the error messages above and try again.
    pause
    exit /b 1
)

:web_quick
echo.
echo Building Web PWA...
echo.

set /p start_build="Start web build now? (Y/n): "
if /i "%start_build%"=="n" (
    echo Build cancelled by user.
    pause
    exit /b
)
echo Building web PWA...
npm run build:web
set build_exit_code=%errorlevel%

if %build_exit_code% equ 0 (
    echo.
    echo ================================
    echo    BUILD SUCCESSFUL!
    echo ================================
    echo Web PWA built successfully!
    echo.
    echo Built files location: web-build\ folder
    if exist "web-build\index.html" echo - index.html found
    if exist "web-build\static" echo - static assets folder found
    if exist "web-build\manifest.json" echo - PWA manifest found
    echo.
    echo NEXT STEPS:
    echo - Deploy the 'web-build' folder to any hosting service
    echo - Can be installed as PWA on mobile and desktop browsers
    echo - Works offline once cached by browsers
    pause
    exit /b
) else (
    echo.
    echo ================================
    echo    BUILD FAILED!
    echo ================================
    echo Web build failed with exit code: %build_exit_code%
    echo This could be due to:
    echo - TypeScript compilation errors
    echo - Missing dependencies ^(run npm install^)
    echo - Configuration issues ^(check expo config^)
    echo - Insufficient disk space or permissions
    echo.
    echo Please check the error messages above and try again.
    pause
    exit /b 1
)

:all_quick
echo.
echo Building all quick formats...
echo This will build: Web PWA, Windows EXE, and Android APK
echo.

echo Checking EAS CLI installation...
where eas
if errorlevel 1 (
    echo EAS CLI not found.
    set /p install_eas="Do you want to install EAS CLI? (Y/n): "
    if /i "%install_eas%"=="n" (
        echo Skipping Android build - EAS CLI required.
        set skip_android=1
    ) else (
        echo Installing EAS CLI...
        npm install -g @expo/eas-cli
        if errorlevel 1 (
            echo ERROR: Failed to install EAS CLI - Skipping Android build
            set skip_android=1
        ) else (
            echo EAS CLI installed successfully.
        )
    )
) else (
    echo EAS CLI found.
)

if not defined skip_android (
    echo Checking EAS login status...
    eas whoami
    if errorlevel 1 (
        echo.
        echo You need to login to Expo to build mobile apps.
        set /p do_login="Do you want to login now? (Y/n): "
        if /i "%do_login%"=="n" (
            echo Skipping Android build - Login required.
            set skip_android=1
        ) else (
            echo Starting login process...
            eas login
            if errorlevel 1 (
                echo ERROR: Login failed - Skipping Android build
                set skip_android=1
            )
        )
    )
)

set /a success_count=0
set /a total_builds=0
set web_built=0
set desktop_built=0
set android_built=0

echo.
echo 1/3 Building Web PWA...
set /p build_web="Build Web PWA? (Y/n): "
if /i not "%build_web%"=="n" (
    set /a total_builds+=1
    npm run build:web
    set web_exit_code=!errorlevel!
    if !web_exit_code! equ 0 (
        set /a success_count+=1
        set web_built=1
        echo Web PWA: SUCCESS
    ) else (
        echo Web PWA: FAILED ^(exit code !web_exit_code!^)
    )
) else (
    echo Skipping Web build.
)

echo.
echo 2/3 Building Windows EXE...
set /p build_desktop="Build Windows EXE? (Y/n): "
if /i not "%build_desktop%"=="n" (
    set /a total_builds+=1
    npx electron-builder --win --x64
    set desktop_exit_code=!errorlevel!
    if !desktop_exit_code! equ 0 (
        set /a success_count+=1
        set desktop_built=1
        echo Windows EXE: SUCCESS
    ) else (
        echo Windows EXE: FAILED ^(exit code !desktop_exit_code!^)
    )
) else (
    echo Skipping Windows build.
)

echo.
if defined skip_android (
    echo 3/3 Skipping Android APK build.
) else (
    echo 3/3 Building Android APK...
    set /p build_android="Build Android APK? (Y/n): "
    if /i not "%build_android%"=="n" (
        set /a total_builds+=1
        eas build --platform android --profile preview
        set android_exit_code=!errorlevel!
        if !android_exit_code! equ 0 (
            set /a success_count+=1
            set android_built=1
            echo Android APK: SUCCESS
        ) else (
            echo Android APK: FAILED ^(exit code !android_exit_code!^)
        )
    ) else (
        echo Skipping Android build.
    )
)

echo.
echo ================================
echo BUILD SUMMARY
echo ================================
echo Total builds attempted: %total_builds%
echo Successful builds: %success_count%
set /a failed_builds=total_builds-success_count
echo Failed builds: %failed_builds%
echo.
if %web_built%==1 echo SUCCESS: Web PWA - Check web-build\ folder
if %desktop_built%==1 echo SUCCESS: Windows EXE - Check dist\ folder
if %android_built%==1 echo SUCCESS: Android APK - Check https://expo.dev/builds
echo.
if %success_count% equ 0 (
    echo All builds failed. Please check error messages above.
    pause
    exit /b 1
) else if %success_count% equ %total_builds% (
    echo All builds completed successfully!
    pause
    exit /b 0
) else (
    echo Some builds failed. Check individual results above.
    pause
    exit /b 1
)
goto done

:done
echo.
echo ================================
echo Quick Build Complete!
echo ================================
pause
exit /b

:exit
exit /b