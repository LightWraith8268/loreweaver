# LoreWeaver Desktop Builder - PowerShell Version
param(
    [string]$Platform = "menu",
    [switch]$AllPlatforms,
    [switch]$Development
)

Write-Host "================================" -ForegroundColor Green
Write-Host "  LoreWeaver Desktop Builder" -ForegroundColor Green  
Write-Host "================================" -ForegroundColor Green
Write-Host ""

function Show-Menu {
    Write-Host "Select build option:"
    Write-Host "1. Windows EXE (Current machine)" -ForegroundColor Cyan
    Write-Host "2. Windows EXE + MSI Installer" -ForegroundColor Cyan
    Write-Host "3. All Windows formats (EXE, MSI, ZIP)" -ForegroundColor Cyan
    Write-Host "4. Cross-compile for macOS" -ForegroundColor Yellow
    Write-Host "5. Cross-compile for Linux" -ForegroundColor Yellow
    Write-Host "6. Build for ALL platforms" -ForegroundColor Magenta
    Write-Host "7. Development mode (Electron window)" -ForegroundColor Green
    Write-Host "8. Web version only" -ForegroundColor Blue
    Write-Host "9. Exit" -ForegroundColor Red
    Write-Host ""
}

function Install-Dependencies {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
}

function Build-Web {
    Write-Host "Building web version..." -ForegroundColor Yellow
    npm run build:web
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to build web version!" -ForegroundColor Red
        exit 1
    }
}

function Build-Windows {
    param([string]$Type = "exe")
    
    Install-Dependencies
    Build-Web
    
    switch ($Type) {
        "exe" {
            Write-Host "Building Windows EXE..." -ForegroundColor Yellow
            npx electron-builder --win --x64
        }
        "installer" {
            Write-Host "Building Windows EXE + Installer..." -ForegroundColor Yellow
            npx electron-builder --win --x64 nsis
        }
        "all" {
            Write-Host "Building all Windows formats..." -ForegroundColor Yellow
            npx electron-builder --win --x64 --ia32
        }
    }
}

function Build-macOS {
    Install-Dependencies
    Build-Web
    Write-Host "Building macOS DMG..." -ForegroundColor Yellow
    npx electron-builder --mac --x64 --arm64
}

function Build-Linux {
    Install-Dependencies
    Build-Web
    Write-Host "Building Linux AppImage..." -ForegroundColor Yellow
    npx electron-builder --linux AppImage
}

function Build-AllPlatforms {
    Install-Dependencies
    Build-Web
    Write-Host "Building for ALL platforms..." -ForegroundColor Magenta
    Write-Host "This may take 10-15 minutes..." -ForegroundColor Yellow
    npx electron-builder --win --mac --linux
}

function Start-Development {
    Write-Host "Starting development mode..." -ForegroundColor Green
    Write-Host "Web server will start, then Electron window will open..." -ForegroundColor Yellow
    npm run electron:dev
}

function Build-WebOnly {
    Write-Host "Building web version only..." -ForegroundColor Blue
    npm run build:web
    Write-Host ""
    Write-Host "Web build complete! Files in: web-build/" -ForegroundColor Green
    Write-Host "You can deploy this folder to any web server." -ForegroundColor Yellow
}

function Show-Results {
    Write-Host ""
    Write-Host "================================" -ForegroundColor Green
    Write-Host "Build completed!" -ForegroundColor Green
    Write-Host "Check the 'dist' folder for your apps" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "File locations:"
    Write-Host "- Windows: dist\LoreWeaver Setup.exe" -ForegroundColor Cyan
    Write-Host "- macOS: dist\LoreWeaver.dmg" -ForegroundColor Cyan
    Write-Host "- Linux: dist\LoreWeaver.AppImage" -ForegroundColor Cyan
    Write-Host "- Web: web-build\ (deploy to web server)" -ForegroundColor Blue
    Write-Host ""
}

# Handle command line parameters
if ($Development) {
    Start-Development
    exit
}

if ($AllPlatforms) {
    Build-AllPlatforms
    Show-Results
    exit
}

if ($Platform -ne "menu") {
    switch ($Platform.ToLower()) {
        "windows" { Build-Windows "exe" }
        "windows-installer" { Build-Windows "installer" } 
        "windows-all" { Build-Windows "all" }
        "macos" { Build-macOS }
        "linux" { Build-Linux }
        "web" { Build-WebOnly }
        "dev" { Start-Development }
        default { 
            Write-Host "Unknown platform: $Platform" -ForegroundColor Red
            Write-Host "Available options: windows, windows-installer, windows-all, macos, linux, web, dev" -ForegroundColor Yellow
            exit 1
        }
    }
    Show-Results
    exit
}

# Interactive menu
while ($true) {
    Show-Menu
    $choice = Read-Host "Enter your choice (1-9)"
    
    switch ($choice) {
        1 { Build-Windows "exe" }
        2 { Build-Windows "installer" }
        3 { Build-Windows "all" }
        4 { Build-macOS }
        5 { Build-Linux }
        6 { Build-AllPlatforms }
        7 { Start-Development; continue }
        8 { Build-WebOnly }
        9 { Write-Host "Goodbye!" -ForegroundColor Green; exit }
        default { 
            Write-Host "Invalid choice. Please try again." -ForegroundColor Red
            continue
        }
    }
    
    Show-Results
    Read-Host "Press Enter to continue"
}