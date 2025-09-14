@echo off
echo ================================
echo   LoreWeaver Desktop Builder
echo ================================
echo.

:menu
echo Select build option:
echo 1. Windows EXE (Current machine)
echo 2. Windows EXE + MSI Installer
echo 3. All Windows formats (EXE, MSI, ZIP)
echo 4. Cross-compile for macOS (requires tools)
echo 5. Cross-compile for Linux (AppImage)
echo 6. Build for ALL platforms
echo 7. Development mode (Electron window)
echo 8. Web version only
echo 9. Exit
echo.
set /p choice="Enter your choice (1-9): "

if "%choice%"=="1" goto windows_exe
if "%choice%"=="2" goto windows_installer
if "%choice%"=="3" goto windows_all
if "%choice%"=="4" goto macos_build
if "%choice%"=="5" goto linux_build
if "%choice%"=="6" goto all_platforms
if "%choice%"=="7" goto dev_mode
if "%choice%"=="8" goto web_only
if "%choice%"=="9" goto exit
goto menu

:windows_exe
echo.
echo Installing dependencies...
call npm install
echo Building web version...
call npm run build:web
echo Building Windows EXE...
call npx electron-builder --win --x64
goto done

:windows_installer
echo.
echo Installing dependencies...
call npm install
echo Building web version...
call npm run build:web
echo Building Windows EXE + Installer...
call npx electron-builder --win --x64 nsis
goto done

:windows_all
echo.
echo Installing dependencies...
call npm install
echo Building web version...
call npm run build:web
echo Building all Windows formats...
call npx electron-builder --win --x64 --ia32
goto done

:macos_build
echo.
echo Installing dependencies...
call npm install
echo Building web version...
call npm run build:web
echo Building macOS DMG...
call npx electron-builder --mac --x64 --arm64
goto done

:linux_build
echo.
echo Installing dependencies...
call npm install
echo Building web version...
call npm run build:web
echo Building Linux AppImage...
call npx electron-builder --linux AppImage
goto done

:all_platforms
echo.
echo Installing dependencies...
call npm install
echo Building web version...
call npm run build:web
echo Building for ALL platforms...
echo This may take 10-15 minutes...
call npx electron-builder --win --mac --linux
goto done

:dev_mode
echo.
echo Starting development mode...
echo Web server will start, then Electron window will open...
call npm run electron:dev
goto menu

:web_only
echo.
echo Building web version only...
call npm run build:web
echo.
echo Web build complete! Files in: web-build/
echo You can deploy this folder to any web server.
goto done

:done
echo.
echo ================================
echo Build completed!
echo Check the 'dist' folder for your apps
echo ================================
echo.
echo File locations:
echo - Windows: dist\LoreWeaver Setup.exe
echo - macOS: dist\LoreWeaver.dmg
echo - Linux: dist\LoreWeaver.AppImage
echo - Web: web-build\ (deploy to web server)
echo.
pause
goto menu

:exit
echo Goodbye!
exit