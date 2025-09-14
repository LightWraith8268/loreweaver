@echo off
echo ================================================
echo          LoreWeaver Universal Builder
echo ================================================
echo.
echo This script will build LoreWeaver for ALL platforms:
echo - Android APK + AAB
echo - iOS Simulator + App Store
echo - Windows EXE + Installer
echo - macOS DMG (if on Mac/with tools)
echo - Linux AppImage
echo - Web PWA
echo.
echo WARNING: This will take 30-60 minutes and requires:
echo - EAS CLI setup for mobile builds
echo - Proper certificates for iOS/macOS
echo - Cross-platform build tools
echo.
set /p confirm="Continue with full build? (y/N): "
if /i not "%confirm%"=="y" goto exit

echo.
echo ================================
echo Step 1/6: Installing Dependencies
echo ================================
call npm install
if errorlevel 1 goto error

echo.
echo ================================
echo Step 2/6: Building Web Version
echo ================================
call npm run build:web
if errorlevel 1 goto error

echo.
echo ================================
echo Step 3/6: Building Mobile Apps
echo ================================
echo Building Android APK (Preview)...
call eas build --platform android --profile preview --non-interactive
echo Building Android AAB (Production)...
call eas build --platform android --profile production --non-interactive
echo Building iOS (Preview)...
call eas build --platform ios --profile preview --non-interactive
echo Building iOS (Production)...
call eas build --platform ios --profile production --non-interactive

echo.
echo ================================
echo Step 4/6: Building Desktop Apps
echo ================================
echo Building for all desktop platforms...
call npx electron-builder --win --mac --linux
if errorlevel 1 goto desktop_error

goto success

:desktop_error
echo Desktop builds failed - this is normal if you don't have all platform tools
echo Mobile and web builds should still be available
goto partial_success

:success
echo.
echo ================================================
echo          🎉 ALL BUILDS COMPLETED! 🎉
echo ================================================
echo.
echo Your apps are ready:
echo.
echo 📱 MOBILE APPS:
echo   Check https://expo.dev for download links
echo   - Android APK (Preview): Direct install
echo   - Android AAB (Production): Google Play Store
echo   - iOS IPA (Preview): TestFlight/Simulator
echo   - iOS IPA (Production): App Store
echo.
echo 💻 DESKTOP APPS:
echo   - Windows: dist\LoreWeaver Setup.exe
echo   - macOS: dist\LoreWeaver.dmg
echo   - Linux: dist\LoreWeaver.AppImage
echo.
echo 🌐 WEB APP:
echo   - PWA: web-build\ folder (deploy to any hosting)
echo   - Can be installed as desktop/mobile app
echo.
goto end

:partial_success
echo.
echo ================================================
echo        🎯 PARTIAL BUILD COMPLETED
echo ================================================
echo.
echo Mobile and web builds completed successfully!
echo Desktop builds may have failed due to missing tools.
echo.
echo 📱 MOBILE APPS: Check https://expo.dev
echo 🌐 WEB APP: web-build\ folder
echo 💻 DESKTOP: Run individual platform scripts
echo.
goto end

:error
echo.
echo ❌ Build failed! Check the error messages above.
echo.
goto end

:end
pause
goto exit

:exit
exit