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
timeout /t 1 /nobreak >nul
where eas >nul 2>&1
if errorlevel 1 (
    echo EAS CLI not found. Installing...
    call npm install -g @expo/eas-cli
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
timeout /t 1 /nobreak >nul
eas whoami --non-interactive >nul 2>&1
if errorlevel 1 (
    echo.
    echo WARNING: You need to login to Expo to build mobile apps.
    echo Please run: eas login
    echo Then try the build again.
    pause
    goto done
) else (
    echo Logged in to EAS.
)

echo Checking if project is configured for EAS...
if not exist "eas.json" (
    echo Configuring project for EAS builds...
    call eas build:configure --platform android
)

echo Installing dependencies...
call npm install

echo Starting Android build...
call eas build --platform android --profile preview --non-interactive
goto done

:desktop_quick
echo.
echo Installing dependencies...
call npm install
echo Building web version...
call npm run build:web
echo Building Windows EXE...
call npx electron-builder --win --x64
goto done

:web_quick
echo.
echo Building web PWA...
call npm run build:web
echo.
echo Web app built! Deploy the 'web-build' folder to any hosting service.
echo Can be installed as PWA on mobile and desktop browsers.
goto done

:all_quick
echo.
echo Building all quick formats...
echo.

echo Checking EAS CLI installation...
timeout /t 1 /nobreak >nul
where eas >nul 2>&1
if errorlevel 1 (
    echo EAS CLI not found. Installing...
    call npm install -g @expo/eas-cli
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
timeout /t 1 /nobreak >nul
eas whoami --non-interactive >nul 2>&1
if errorlevel 1 (
    echo.
    echo WARNING: You need to login to Expo to build mobile apps.
    echo Please run: eas login
    echo Then try the build again.
    pause
    goto done
) else (
    echo Logged in to EAS.
)

echo 1/3 Building Web PWA...
call npm run build:web
echo.
echo 2/3 Building Windows EXE...
call npx electron-builder --win --x64  
echo.
echo 3/3 Building Android APK...
call eas build --platform android --profile preview --non-interactive
goto done

:done
echo.
echo ================================
echo Quick Build Complete!
echo ================================
pause

:exit
exit