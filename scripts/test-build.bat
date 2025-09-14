@echo off
echo ================================
echo    TEST BUILD SCRIPT
echo ================================
echo This is a test to see if batch scripts work properly.
pause
echo You pressed a key, continuing...
set /p continue_test="Continue with test? (Y/n): "
if "%continue_test%"=="" set continue_test=Y
echo You entered: %continue_test%
if /i "%continue_test%"=="n" (
    echo Test cancelled.
    pause
    exit /b 1
)
echo Test completed successfully!
pause
exit /b 0