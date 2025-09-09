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
echo Building Android APK for testing...
echo This will take about 5 minutes...
echo.

echo Checking EAS CLI installation...
where eas
if errorlevel 1 (
    echo EAS CLI not found.
    set /p install_eas="Do you want to install EAS CLI? (Y/n): "
    if /i "%install_eas%"=="n" (
        echo Build cancelled - EAS CLI required for mobile builds.
        pause
        goto done
    )
    echo Installing EAS CLI...
    npm install -g @expo/eas-cli
    if errorlevel 1 (
        echo ERROR: Failed to install EAS CLI
        pause
        goto done
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
    goto done
)
eas build --platform android --profile preview
goto done

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
)

echo Building Windows EXE...
set /p start_build="Start Windows build now? (Y/n): "
if /i "%start_build%"=="n" (
    echo Build cancelled by user.
    pause
    goto done
)
npx electron-builder --win --x64
goto done

:web_quick
echo.
echo Building Web PWA...
echo.

set /p start_build="Start web build now? (Y/n): "
if /i "%start_build%"=="n" (
    echo Build cancelled by user.
    pause
    goto done
)
echo Building web PWA...
npm run build:web
echo.
echo Web app built! Deploy the 'web-build' folder to any hosting service.
echo Can be installed as PWA on mobile and desktop browsers.
goto done

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

echo.
echo 1/3 Building Web PWA...
set /p build_web="Build Web PWA? (Y/n): "
if /i not "%build_web%"=="n" (
    npm run build:web
) else (
    echo Skipping Web build.
)

echo.
echo 2/3 Building Windows EXE...
set /p build_desktop="Build Windows EXE? (Y/n): "
if /i not "%build_desktop%"=="n" (
    npx electron-builder --win --x64
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
        eas build --platform android --profile preview
    ) else (
        echo Skipping Android build.
    )
)
goto done

:done
echo.
echo ================================
echo Quick Build Complete!
echo ================================
pause

:exit
exit