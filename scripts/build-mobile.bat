@echo off
echo ================================
echo    LoreWeaver Mobile Builder
echo ================================
echo.

:menu
echo Select build option:
echo 1. Android APK (Preview/Testing)
echo 2. Android AAB (Play Store)
echo 3. iOS Simulator
echo 4. iOS App Store
echo 5. Build Both Android + iOS (Preview)
echo 6. Build Both Android + iOS (Production)
echo 7. Exit
echo.
set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" goto android_apk
if "%choice%"=="2" goto android_aab
if "%choice%"=="3" goto ios_sim
if "%choice%"=="4" goto ios_store
if "%choice%"=="5" goto both_preview
if "%choice%"=="6" goto both_production
if "%choice%"=="7" goto exit
goto menu

:android_apk
echo.
echo Building Android APK for testing...
call eas build --platform android --profile preview
goto done

:android_aab
echo.
echo Building Android AAB for Play Store...
call eas build --platform android --profile production
goto done

:ios_sim
echo.
echo Building iOS for Simulator...
call eas build --platform ios --profile preview
goto done

:ios_store
echo.
echo Building iOS for App Store...
call eas build --platform ios --profile production
goto done

:both_preview
echo.
echo Building both platforms for preview...
call eas build --platform all --profile preview
goto done

:both_production
echo.
echo Building both platforms for production...
call eas build --platform all --profile production
goto done

:done
echo.
echo ================================
echo Build completed!
echo Check https://expo.dev for your builds
echo ================================
pause
goto menu

:exit
echo Goodbye!
exit