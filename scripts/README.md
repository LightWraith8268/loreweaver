# 🚀 LoreWeaver Build Scripts

Automated build scripts for compiling LoreWeaver across all platforms.

## 📋 Quick Start

### 🎯 **Platform Selector (Recommended)**

**The easiest way to build for any platform:**

```bash
# Windows - Interactive checkbox interface
scripts\build-selector.bat

# PowerShell with command-line options
scripts\build-selector.ps1 -Essential
scripts\build-selector.ps1 -Platforms android-apk,windows-exe

# macOS/Linux - Full-color terminal interface
chmod +x scripts/build-selector.sh
scripts/build-selector.sh --essential
```

**Features:**
- ✅ **Interactive checkboxes** - Select multiple platforms visually  
- ⚡ **Quick presets** - Essential, All Mobile, All Desktop, Everything
- ⏱️ **Real-time estimates** - See build time before starting
- 🎨 **Beautiful interface** - Color-coded with progress tracking
- 🔧 **Non-interactive mode** - Perfect for automation/CI

### 1️⃣ First Time Setup
```bash
# Windows
scripts\setup-build-environment.bat

# macOS/Linux  
chmod +x scripts/*.sh
```

### 2️⃣ Alternative: Individual Quick Builds
```bash
# Windows
scripts\quick-build.bat

# Choose from:
# - Mobile APK (5 min)
# - Windows EXE (2 min)  
# - Web PWA (1 min)
# - All Quick Builds (8 min)
```

## 📱 Mobile App Scripts

### Windows
- `build-mobile.bat` - Interactive mobile builder
- Double-click to run, choose from menu

### macOS/Linux
- `build-mobile.sh` - Interactive mobile builder
- `chmod +x build-mobile.sh && ./build-mobile.sh`

**Options:**
1. Android APK (Preview/Testing)
2. Android AAB (Play Store)  
3. iOS Simulator
4. iOS App Store
5. Build Both Platforms (Preview)
6. Build Both Platforms (Production)

## 💻 Desktop App Scripts

### Windows
- `build-desktop.bat` - Interactive desktop builder
- `build-desktop.ps1` - PowerShell version with parameters

**PowerShell Examples:**
```powershell
# Interactive menu
.\scripts\build-desktop.ps1

# Direct commands
.\scripts\build-desktop.ps1 -Platform windows
.\scripts\build-desktop.ps1 -Platform macos
.\scripts\build-desktop.ps1 -AllPlatforms
.\scripts\build-desktop.ps1 -Development
```

### macOS/Linux
- `build-desktop.sh` - Interactive desktop builder
- `./scripts/build-desktop.sh`

**Options:**
1. Windows EXE (Cross-compile)
2. macOS DMG 
3. Linux AppImage
4. All Platforms
5. Development Mode
6. Web Only

## 🎯 Platform Selector Scripts

The platform selector is the **most advanced build interface**, offering:

### Available Scripts
- `build-selector.bat` - **Windows batch** with checkbox interface
- `build-selector.ps1` - **PowerShell** with command-line parameters  
- `build-selector.sh` - **Bash** for macOS/Linux with full color support

### 10 Platform Options
1. **Android APK** - Direct install (5 min)
2. **Android AAB** - Google Play Store (5 min)  
3. **iOS Simulator** - Testing build (8 min)
4. **iOS App Store** - Production build (8 min)
5. **Windows EXE** - Portable executable (2 min)
6. **Windows MSI** - Professional installer (3 min)
7. **macOS DMG** - Mac disk image (3 min)
8. **Linux AppImage** - Portable Linux app (3 min)
9. **Linux Snap** - Ubuntu package (4 min)
10. **Web PWA** - Progressive web app (1 min)

### Quick Presets
- **A. All Mobile** - Android APK + AAB, iOS Simulator + Store
- **B. Mobile Production** - Android AAB + iOS Store only
- **C. Mobile Testing** - Android APK + iOS Simulator only
- **D. All Desktop** - Windows EXE + MSI, macOS DMG, Linux AppImage + Snap  
- **E. Essential** - Android APK + Windows EXE + Web PWA (8 min total)
- **F. Everything** - All 10 platforms (60+ min total)

### Command-Line Usage
```bash
# PowerShell examples
scripts\build-selector.ps1 -Essential
scripts\build-selector.ps1 -Everything -NonInteractive
scripts\build-selector.ps1 -AllMobile
scripts\build-selector.ps1 -Platforms android-apk,windows-exe,web-pwa

# Bash examples  
scripts/build-selector.sh --essential
scripts/build-selector.sh --everything
scripts/build-selector.sh android-apk windows-exe
```

## 🌐 Universal Scripts

### Complete Build Suite
- `build-all.bat` - Builds EVERYTHING (30-60 min)
  - All mobile formats
  - All desktop formats  
  - Web PWA

### Quick Builds
- `quick-build.bat` - Fast essential builds (8 min)
  - Android APK
  - Windows EXE
  - Web PWA

## 📦 Output Locations

After building, find your apps here:

```
📱 MOBILE APPS:
├── Check https://expo.dev/builds for downloads
├── Android: .apk (direct install) or .aab (Play Store)
└── iOS: .ipa (TestFlight/App Store)

💻 DESKTOP APPS:
├── dist/
├── ├── LoreWeaver Setup.exe (Windows)
├── ├── LoreWeaver.dmg (macOS)
└── └── LoreWeaver.AppImage (Linux)

🌐 WEB APP:
└── web-build/ (deploy to any hosting)
```

## ⚙️ Script Parameters

### Mobile Builds
```bash
# Non-interactive builds
eas build --platform android --profile preview
eas build --platform ios --profile production
eas build --platform all --profile preview
```

### Desktop Builds  
```bash
# Single platform
npx electron-builder --win
npx electron-builder --mac  
npx electron-builder --linux

# All platforms
npx electron-builder --win --mac --linux

# Development
npm run electron:dev
```

### Web Builds
```bash
# Standard web build
npm run build:web

# With development debugging
npm run start-web-dev
```

## 🔧 Prerequisites

### Required (All Platforms)
- Node.js 18+
- npm or yarn

### Mobile Builds
- EAS CLI: `npm install -g @expo/eas-cli`
- Expo account: https://expo.dev

### iOS Builds (macOS only)  
- Xcode 14+
- Apple Developer Account ($99/year)

### Android Builds
- Android Studio (optional)
- Or use EAS cloud builds

### Desktop Cross-Platform
- Windows: Visual Studio Build Tools
- macOS: Xcode Command Line Tools
- Linux: Standard build tools

## 🚨 Troubleshooting

### Common Issues

**"Command not found" errors:**
```bash
# Make scripts executable (macOS/Linux)
chmod +x scripts/*.sh

# Run setup script first
scripts\setup-build-environment.bat
```

**Mobile builds failing:**
```bash
# Check EAS setup
eas doctor
eas whoami

# Re-login if needed
eas login
```

**Desktop builds failing:**
```bash
# Clear caches
npm run build:web -- --clear
rm -rf dist/

# Rebuild node modules
rm -rf node_modules/
npm install
```

**Permission errors:**
```bash
# Windows: Run as Administrator
# macOS/Linux: Check file permissions
chmod +x scripts/*
```

## 🎯 Build Strategies

### Development Builds
- Use `preview` profile for mobile
- Use `electron:dev` for desktop testing
- Use `npm start` for live development

### Production Builds  
- Use `production` profile for app stores
- Sign desktop apps for distribution
- Test on multiple devices before release

### CI/CD Integration
```yaml
# Example GitHub Actions
- name: Build Mobile
  run: eas build --platform all --non-interactive

- name: Build Desktop  
  run: |
    npm run build:web
    npx electron-builder --publish never
```

## 📊 Build Times (Approximate)

| Platform | Time | Size | Notes |
|----------|------|------|--------|
| Web PWA | 1 min | ~10MB | Instant deploy |
| Windows EXE | 2 min | ~150MB | Local build |
| Android APK | 5 min | ~30MB | Cloud build |
| iOS IPA | 8 min | ~50MB | Cloud build |
| macOS DMG | 3 min | ~150MB | Local build |
| Linux AppImage | 3 min | ~150MB | Local build |
| **All Platforms** | **30-60 min** | **~500MB** | Complete suite |

## 🔑 Environment Variables

Create `.env` files for different environments:

```bash
# .env.production
EXPO_PUBLIC_API_URL=https://api.loreweaver.com
EXPO_PUBLIC_VERSION=1.0.0

# .env.development
EXPO_PUBLIC_API_URL=http://localhost:3000  
EXPO_PUBLIC_VERSION=dev
```

## 📈 Next Steps

1. **Run setup script** to install all tools
2. **Test with quick build** to verify setup
3. **Build for your target platform**
4. **Set up signing certificates** for production
5. **Configure CI/CD** for automated builds

---

**🎉 Happy Building!** Your apps will be ready for distribution across all major platforms.