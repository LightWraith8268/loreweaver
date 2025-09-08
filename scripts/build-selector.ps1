# LoreWeaver Platform Selector - PowerShell Version
param(
    [string[]]$Platforms = @(),
    [switch]$AllMobile,
    [switch]$AllDesktop,
    [switch]$Essential,
    [switch]$Everything,
    [switch]$NonInteractive
)

# Initialize error logging
$LogDir = Join-Path (Split-Path $PSScriptRoot -Parent) "logs"
$ErrorLog = Join-Path $LogDir ("build-errors-{0}.log" -f (Get-Date).ToString("yyyyMMdd-HHmmss"))

if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

Add-Content -Path $ErrorLog -Value "[$(Get-Date)] Build session started"
Add-Content -Path $ErrorLog -Value "[$(Get-Date)] Platform: PowerShell Script"
Add-Content -Path $ErrorLog -Value "[$(Get-Date)] Working Directory: $(Get-Location)"
Add-Content -Path $ErrorLog -Value ""

$Host.UI.RawUI.WindowTitle = "LoreWeaver Platform Builder"

# Platform definitions
$PlatformDefs = @{
    "android-apk" = @{ Name = "Android APK"; Time = 5; Type = "Mobile"; Command = "eas build --platform android --profile standalone-apk" }
    "android-aab" = @{ Name = "Android AAB"; Time = 5; Type = "Mobile"; Command = "eas build --platform android --profile production" }
    "ios-sim" = @{ Name = "iOS Simulator"; Time = 8; Type = "Mobile"; Command = "eas build --platform ios --profile preview" }
    "ios-store" = @{ Name = "iOS App Store"; Time = 8; Type = "Mobile"; Command = "eas build --platform ios --profile production" }
    "windows-exe" = @{ Name = "Windows EXE"; Time = 2; Type = "Desktop"; Command = "npx electron-builder --win" }
    "windows-msi" = @{ Name = "Windows MSI"; Time = 3; Type = "Desktop"; Command = "npx electron-builder --win nsis" }
    "macos-dmg" = @{ Name = "macOS DMG"; Time = 3; Type = "Desktop"; Command = "npx electron-builder --mac" }
    "linux-appimage" = @{ Name = "Linux AppImage"; Time = 3; Type = "Desktop"; Command = "npx electron-builder --linux AppImage" }
    "linux-snap" = @{ Name = "Linux Snap"; Time = 4; Type = "Desktop"; Command = "npx electron-builder --linux snap" }
    "web-pwa" = @{ Name = "Web PWA"; Time = 1; Type = "Web"; Command = "npm run build:web" }
}

$SelectedPlatforms = @()

function Show-Header {
    Clear-Host
    Write-Host "╔══════════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                                                                      ║" -ForegroundColor Green
    Write-Host "║                  🎯 LoreWeaver Platform Builder 🎯                  ║" -ForegroundColor Yellow
    Write-Host "║                                                                      ║" -ForegroundColor Green
    Write-Host "║           Select platforms to build with checkboxes below:          ║" -ForegroundColor White
    Write-Host "║                                                                      ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
}

function Run-Command {
    param(
        [string]$Command,
        [string]$Description
    )
    
    Add-Content -Path $ErrorLog -Value "[$(Get-Date)] Executing: $Command"
    Add-Content -Path $ErrorLog -Value "[$(Get-Date)] Description: $Description"
    
    Write-Host "  ⚡ $Description..." -ForegroundColor Cyan
    
    try {
        Invoke-Expression $Command *>>$ErrorLog
        $exitCode = $LASTEXITCODE
        
        if ($exitCode -eq 0) {
            Add-Content -Path $ErrorLog -Value "[$(Get-Date)] SUCCESS: $Description completed"
            Write-Host "  ✓ $Description completed" -ForegroundColor Green
            return $true
        } else {
            Add-Content -Path $ErrorLog -Value "[$(Get-Date)] ERROR: Command failed with exit code $exitCode"
            Add-Content -Path $ErrorLog -Value "[$(Get-Date)] Command: $Command"
            Write-Host "  ❌ $Description failed (Exit code: $exitCode)" -ForegroundColor Red
            return $false
        }
    } catch {
        Add-Content -Path $ErrorLog -Value "[$(Get-Date)] EXCEPTION: $($_.Exception.Message)"
        Write-Host "  ❌ $Description failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Show-ErrorSummary {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║                           ❌ BUILD FAILED ❌                           ║" -ForegroundColor Red
    Write-Host "╚══════════════════════════════════════════════════════════════════════╝" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error details have been logged to:" -ForegroundColor Yellow
    Write-Host $ErrorLog -ForegroundColor White
    Write-Host ""
    Add-Content -Path $ErrorLog -Value "[$(Get-Date)] Build process failed"
    Add-Content -Path $ErrorLog -Value "[$(Get-Date)] Error details logged above"
    
    Write-Host "Common solutions:" -ForegroundColor Yellow
    Write-Host "  1. Check if all dependencies are installed (npm install)" -ForegroundColor White
    Write-Host "  2. Verify EAS CLI is logged in (eas login)" -ForegroundColor White
    Write-Host "  3. Check network connection for mobile builds" -ForegroundColor White
    Write-Host "  4. Ensure Electron dependencies for desktop builds" -ForegroundColor White
    Write-Host ""
}

function Show-PlatformMenu {
    Show-Header
    
    Write-Host "📱 MOBILE PLATFORMS:" -ForegroundColor Yellow
    Show-Platform "android-apk" "1" 
    Show-Platform "android-aab" "2"
    Show-Platform "ios-sim" "3"
    Show-Platform "ios-store" "4"
    
    Write-Host ""
    Write-Host "💻 DESKTOP PLATFORMS:" -ForegroundColor Green
    Show-Platform "windows-exe" "5"
    Show-Platform "windows-msi" "6" 
    Show-Platform "macos-dmg" "7"
    Show-Platform "linux-appimage" "8"
    Show-Platform "linux-snap" "9"
    
    Write-Host ""
    Write-Host "🌐 WEB PLATFORM:" -ForegroundColor Blue
    Show-Platform "web-pwa" "10"
    
    Write-Host ""
    Write-Host "████████████████████████████████████████████████████████████████" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⚡ QUICK PRESETS:" -ForegroundColor Magenta
    Write-Host "   A. All Mobile Platforms        D. All Desktop Platforms"
    Write-Host "   B. Mobile Production           E. Essential Builds (APK+EXE+PWA)" 
    Write-Host "   C. Mobile Testing              F. Everything (All Platforms)"
    Write-Host ""
    Write-Host "🛠️  ACTIONS:" -ForegroundColor White
    Write-Host "   X. Clear All Selections        S. Start Building"
    Write-Host "   Q. Quit                        H. Help"
    Write-Host ""
    
    $count = $SelectedPlatforms.Count
    $time = ($SelectedPlatforms | ForEach-Object { $PlatformDefs[$_].Time } | Measure-Object -Sum).Sum
    Write-Host "Selected platforms: $count / 10" -ForegroundColor White
    Write-Host "Estimated build time: $time minutes" -ForegroundColor White
    Write-Host ""
}

function Show-Platform {
    param($PlatformKey, $Number)
    
    $platform = $PlatformDefs[$PlatformKey]
    $selected = $SelectedPlatforms -contains $PlatformKey
    $checkbox = if ($selected) { "[X]" } else { "[ ]" }
    $color = if ($selected) { "Green" } else { "Gray" }
    
    Write-Host "   $checkbox $Number. $($platform.Name)" -ForegroundColor $color
}

function Toggle-Platform {
    param($PlatformKey)
    
    if ($SelectedPlatforms -contains $PlatformKey) {
        $script:SelectedPlatforms = $SelectedPlatforms | Where-Object { $_ -ne $PlatformKey }
    } else {
        $script:SelectedPlatforms += $PlatformKey
    }
}

function Set-Preset {
    param($PresetName)
    
    switch ($PresetName) {
        "AllMobile" {
            $script:SelectedPlatforms = @("android-apk", "android-aab", "ios-sim", "ios-store")
        }
        "MobileProduction" {
            $script:SelectedPlatforms = @("android-aab", "ios-store")
        }
        "MobileTesting" {
            $script:SelectedPlatforms = @("android-apk", "ios-sim")
        }
        "AllDesktop" {
            $script:SelectedPlatforms = @("windows-exe", "windows-msi", "macos-dmg", "linux-appimage", "linux-snap")
        }
        "Essential" {
            $script:SelectedPlatforms = @("android-apk", "windows-exe", "web-pwa")
        }
        "Everything" {
            $script:SelectedPlatforms = $PlatformDefs.Keys
        }
    }
}

function Show-Help {
    Clear-Host
    Write-Host "████████████████████████████████████████████████████████████████" -ForegroundColor Cyan
    Write-Host "██                      📚 HELP GUIDE 📚                      ██" -ForegroundColor Cyan
    Write-Host "████████████████████████████████████████████████████████████████" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "COMMAND LINE USAGE:" -ForegroundColor Yellow
    Write-Host "  .\build-selector.ps1 -Platforms android-apk,windows-exe"
    Write-Host "  .\build-selector.ps1 -Essential"
    Write-Host "  .\build-selector.ps1 -Everything -NonInteractive"
    Write-Host ""
    
    Write-Host "PLATFORM DESCRIPTIONS:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📱 MOBILE:" -ForegroundColor Green
    Write-Host "   • android-apk    - Direct install file for testing"
    Write-Host "   • android-aab    - Google Play Store format"
    Write-Host "   • ios-sim        - For testing on iOS Simulator"
    Write-Host "   • ios-store      - For App Store submission"
    Write-Host ""
    Write-Host "💻 DESKTOP:" -ForegroundColor Green
    Write-Host "   • windows-exe    - Portable executable"
    Write-Host "   • windows-msi    - Professional installer"
    Write-Host "   • macos-dmg      - Mac disk image installer"
    Write-Host "   • linux-appimage - Portable Linux executable"
    Write-Host "   • linux-snap     - Ubuntu Snap package"
    Write-Host ""
    Write-Host "🌐 WEB:" -ForegroundColor Green
    Write-Host "   • web-pwa        - Progressive Web App (works everywhere)"
    Write-Host ""
    
    Read-Host "Press Enter to continue"
}

function Start-Building {
    if ($SelectedPlatforms.Count -eq 0) {
        Write-Host "❌ No platforms selected! Please select at least one platform." -ForegroundColor Red
        Read-Host "Press Enter to continue"
        return $false
    }
    
    Clear-Host
    Write-Host "████████████████████████████████████████████████████████████████" -ForegroundColor Green
    Write-Host "██                  🚀 STARTING BUILD PROCESS 🚀              ██" -ForegroundColor Green
    Write-Host "████████████████████████████████████████████████████████████████" -ForegroundColor Green
    Write-Host ""
    
    $count = $SelectedPlatforms.Count
    $time = ($SelectedPlatforms | ForEach-Object { $PlatformDefs[$_].Time } | Measure-Object -Sum).Sum
    
    Write-Host "Selected platforms: $count" -ForegroundColor White
    Write-Host "Estimated time: $time minutes" -ForegroundColor White
    Write-Host ""
    Write-Host "Building the following platforms:" -ForegroundColor White
    
    foreach ($platform in $SelectedPlatforms) {
        Write-Host "   ✓ $($PlatformDefs[$platform].Name)" -ForegroundColor Green
    }
    Write-Host ""
    
    if (-not $NonInteractive) {
        $confirm = Read-Host "Continue with build? (Y/N)"
        if ($confirm -ne "Y" -and $confirm -ne "y") {
            return $false
        }
    }
    
    # Install dependencies
    Write-Host "================================" -ForegroundColor Yellow
    Write-Host "Step 1: Installing Dependencies" -ForegroundColor Yellow
    Write-Host "================================" -ForegroundColor Yellow
    if (-not (Run-Command "npm install" "Installing dependencies")) {
        Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
        Show-ErrorSummary
        return $false
    }
    
    # Build web if needed for desktop platforms
    $desktopPlatforms = @("windows-exe", "windows-msi", "macos-dmg", "linux-appimage", "linux-snap")
    $needsWeb = ($SelectedPlatforms | Where-Object { $desktopPlatforms -contains $_ -or $_ -eq "web-pwa" }).Count -gt 0
    
    if ($needsWeb) {
        Write-Host ""
        Write-Host "================================" -ForegroundColor Yellow
        Write-Host "Step 2: Building Web Version" -ForegroundColor Yellow  
        Write-Host "================================" -ForegroundColor Yellow
        if (-not (Run-Command "npm run build:web" "Building web version")) {
            Write-Host "❌ Failed to build web version!" -ForegroundColor Red
            Show-ErrorSummary
            return $false
        }
    }
    
    # Build mobile platforms
    $mobilePlatforms = $SelectedPlatforms | Where-Object { $PlatformDefs[$_].Type -eq "Mobile" }
    if ($mobilePlatforms.Count -gt 0) {
        Write-Host ""
        Write-Host "================================" -ForegroundColor Yellow
        Write-Host "Step 3: Building Mobile Apps ($($mobilePlatforms.Count) builds)" -ForegroundColor Yellow
        Write-Host "================================" -ForegroundColor Yellow
        
        foreach ($platform in $mobilePlatforms) {
            Write-Host "Building $($PlatformDefs[$platform].Name)..." -ForegroundColor White
            $command = $PlatformDefs[$platform].Command
            # Show standalone message for Android APK builds
            if ($platform -eq "android-apk") {
                Write-Host "   ✓ Standalone APK (No Server Required)" -ForegroundColor Yellow
            }
            if ($NonInteractive) {
                $command += " --non-interactive"
            }
            Invoke-Expression $command
        }
    }
    
    # Build desktop platforms
    $desktopSelected = $SelectedPlatforms | Where-Object { $PlatformDefs[$_].Type -eq "Desktop" }
    if ($desktopSelected.Count -gt 0) {
        Write-Host ""
        Write-Host "================================" -ForegroundColor Yellow
        Write-Host "Step 4: Building Desktop Apps ($($desktopSelected.Count) builds)" -ForegroundColor Yellow
        Write-Host "================================" -ForegroundColor Yellow
        
        foreach ($platform in $desktopSelected) {
            Write-Host "Building $($PlatformDefs[$platform].Name)..." -ForegroundColor White
            $command = $PlatformDefs[$platform].Command
            Invoke-Expression $command
            if ($LASTEXITCODE -ne 0) {
                Write-Host "⚠️  Warning: $($PlatformDefs[$platform].Name) build may have failed" -ForegroundColor Yellow
            }
        }
    }
    
    # Show results
    Write-Host ""
    Write-Host "████████████████████████████████████████████████████████████████" -ForegroundColor Green
    Write-Host "██                    🎉 BUILD COMPLETE! 🎉                   ██" -ForegroundColor Green
    Write-Host "████████████████████████████████████████████████████████████████" -ForegroundColor Green
    Write-Host ""
    Write-Host "Successfully built $count platform(s)!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📁 YOUR APPS ARE READY:" -ForegroundColor White
    Write-Host ""
    
    foreach ($platform in $SelectedPlatforms) {
        $def = $PlatformDefs[$platform]
        switch ($def.Type) {
            "Mobile" { 
                Write-Host "   📱 $($def.Name): Check https://expo.dev/builds" -ForegroundColor Cyan
            }
            "Desktop" {
                $file = switch ($platform) {
                    "windows-exe" { "dist\LoreWeaver.exe" }
                    "windows-msi" { "dist\LoreWeaver Setup.exe" }
                    "macos-dmg" { "dist\LoreWeaver.dmg" }
                    "linux-appimage" { "dist\LoreWeaver.AppImage" }
                    "linux-snap" { "dist\loreweaver_*.snap" }
                }
                Write-Host "   💻 $($def.Name): $file" -ForegroundColor Green
            }
            "Web" {
                Write-Host "   🌐 $($def.Name): web-build\ folder (deploy to hosting)" -ForegroundColor Blue
            }
        }
    }
    
    Write-Host ""
    Write-Host "🚀 NEXT STEPS:" -ForegroundColor Yellow
    Write-Host "   • Test your apps on target devices"
    Write-Host "   • Set up code signing for production distribution"
    Write-Host "   • Submit to app stores if building for production"
    Write-Host "   • Deploy web version to hosting service"
    Write-Host ""
    
    return $true
}

# Handle command line parameters
if ($Platforms.Count -gt 0) {
    $SelectedPlatforms = $Platforms
    $NonInteractive = $true
} elseif ($AllMobile) {
    Set-Preset "AllMobile"
    $NonInteractive = $true
} elseif ($AllDesktop) {
    Set-Preset "AllDesktop" 
    $NonInteractive = $true
} elseif ($Essential) {
    Set-Preset "Essential"
    $NonInteractive = $true
} elseif ($Everything) {
    Set-Preset "Everything"
    $NonInteractive = $true
}

if ($NonInteractive) {
    Start-Building
    exit
}

# Interactive menu
while ($true) {
    Show-PlatformMenu
    $choice = Read-Host "Enter option (1-10, A-F, X, S, Q, H)"
    
    switch ($choice.ToUpper()) {
        "1" { Toggle-Platform "android-apk" }
        "2" { Toggle-Platform "android-aab" }
        "3" { Toggle-Platform "ios-sim" }
        "4" { Toggle-Platform "ios-store" }
        "5" { Toggle-Platform "windows-exe" }
        "6" { Toggle-Platform "windows-msi" }
        "7" { Toggle-Platform "macos-dmg" }
        "8" { Toggle-Platform "linux-appimage" }
        "9" { Toggle-Platform "linux-snap" }
        "10" { Toggle-Platform "web-pwa" }
        "A" { Set-Preset "AllMobile" }
        "B" { Set-Preset "MobileProduction" }
        "C" { Set-Preset "MobileTesting" }
        "D" { Set-Preset "AllDesktop" }
        "E" { Set-Preset "Essential" }
        "F" { Set-Preset "Everything" }
        "X" { $SelectedPlatforms = @() }
        "S" { 
            $buildResult = Start-Building
            if ($buildResult) {
                $continue = Read-Host "Build another combination? (Y/N)"
                if ($continue.ToUpper() -ne "Y") { break }
            }
        }
        "H" { Show-Help }
        "Q" { break }
        default { 
            Write-Host "Invalid choice. Please try again." -ForegroundColor Red
            Start-Sleep 1
        }
    }
}

Write-Host ""
Write-Host "Thanks for using LoreWeaver Platform Selector! 🚀" -ForegroundColor Green
Write-Host ""