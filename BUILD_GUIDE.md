# 🚀 LoreWeaver Build Guide

Complete guide to compile LoreWeaver into native apps for all platforms.

## 📋 Prerequisites

### For All Platforms:
```bash
npm install -g @expo/eas-cli
npm install  # Install dependencies
```

### For iOS (macOS only):
- Xcode 14+ 
- Apple Developer Account ($99/year for App Store)

### For Android:
- Android Studio or Android SDK
- Java Development Kit (JDK) 11+

### For Desktop:
- Node.js 18+
- Platform-specific build tools (automatically installed)

---

## 📱 **Mobile Apps**

### **Android APK/AAB**
```bash
# Setup (first time only)
eas login
eas build:configure

# Build for testing (.apk)
eas build --platform android --profile preview

# Build for Play Store (.aab)
eas build --platform android --profile production
```

### **iOS App**
```bash
# Setup (first time only)  
eas login
eas build:configure

# Build for simulator
eas build --platform ios --profile preview

# Build for App Store
eas build --platform ios --profile production
```

**📦 Download & Install:**
- Builds appear at: https://expo.dev/accounts/[username]/projects/loreweaver/builds
- Android APK: Download and install directly
- iOS IPA: Use TestFlight or Xcode for installation

---

## 💻 **Desktop Apps**

### **Windows/macOS/Linux (Electron)**

```bash
# Install desktop dependencies
npm install

# Build web version first
npm run build:web

# Development (runs in Electron window)
npm run electron:dev

# Build desktop apps for current platform
npm run build:electron

# Build for all platforms (requires platform-specific tools)
npm run dist
```

**Output Files:**
- Windows: `dist/LoreWeaver Setup.exe`
- macOS: `dist/LoreWeaver.dmg`  
- Linux: `dist/LoreWeaver.AppImage`

---

## 🌐 **Web App (PWA)**

```bash
# Build optimized web version
npm run build:web

# Files generated in: web-build/
# Deploy to any web server (Netlify, Vercel, etc.)
```

**Features:**
- Installable as Progressive Web App
- Works offline with cached data
- Cross-platform compatibility

---

## 📊 **Build Comparison**

| Platform | File Size | Performance | Distribution | Development Time |
|----------|-----------|-------------|--------------|------------------|
| iOS App | ~50MB | Excellent | App Store | Medium (requires dev account) |
| Android APK | ~30MB | Excellent | Direct install | Easy |
| Windows EXE | ~150MB | Good | Direct install | Easy |
| macOS DMG | ~150MB | Good | Direct install | Medium (code signing) |
| Linux AppImage | ~150MB | Good | Direct install | Easy |
| Web PWA | ~10MB | Good | Web hosting | Very Easy |

---

## 🔧 **Advanced Configuration**

### **Custom App Icons**
Replace these files with your custom icons:
- `assets/images/icon.png` (1024x1024)
- `assets/images/adaptive-icon.png` (1024x1024) 
- `assets/images/favicon.png` (256x256)

### **App Signing (Production)**

**Android:**
```bash
# Generate keystore
keytool -genkey -v -keystore loreweaver.keystore -alias loreweaver -keyalg RSA -keysize 2048 -validity 10000

# Add to eas.json credentials
eas credentials
```

**iOS:**
```bash
# Automatic signing via EAS
eas build --platform ios --auto-submit
```

### **Environment Variables**
Create `.env` files for different environments:
```bash
# .env.production
EXPO_PUBLIC_API_URL=https://api.loreweaver.com
EXPO_PUBLIC_ENV=production

# .env.development  
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_ENV=development
```

---

## 🚀 **Quick Start Commands**

```bash
# Mobile apps (both platforms)
eas build --platform all --profile preview

# Desktop apps (current platform)
npm run build:web && npm run build:electron

# Web deployment
npm run build:web
# Then upload web-build/ to hosting service

# Development testing
npm run electron:dev  # Desktop
npm start              # Mobile (via Expo Go app)
```

---

## 📱 **Platform-Specific Features**

### **iOS Exclusive:**
- Face ID / Touch ID integration ready
- iOS-specific navigation patterns
- Optimized for iPad with responsive design

### **Android Exclusive:**
- Material Design 3 components
- Android-specific back gesture handling
- Adaptive icons with background color

### **Desktop Exclusive:**
- Native menu bar integration
- Keyboard shortcuts (Ctrl/Cmd+N for new world)
- Window state persistence
- File system access for exports

### **Web Exclusive:**
- Installable as PWA on mobile/desktop
- Share API integration
- Clipboard access for data transfer

---

## 🔐 **Distribution**

### **App Stores:**
- **iOS App Store**: Requires Apple Developer account ($99/year)
- **Google Play Store**: One-time $25 registration fee
- **Microsoft Store**: Free for desktop apps

### **Direct Distribution:**
- **Android**: APK files can be installed directly (enable "Unknown sources")
- **Desktop**: Executable files work immediately
- **Web**: Host anywhere (Netlify, Vercel, GitHub Pages)

---

## 🛠 **Troubleshooting**

### **Common Issues:**

**Build Fails:**
```bash
# Clear caches
expo r -c
npm run build:web -- --clear

# Update dependencies
npm update
```

**Electron Issues:**
```bash
# Rebuild native modules
npm rebuild
npm run electron:dev
```

**Mobile Build Issues:**
```bash
# Check EAS status
eas build:list
eas doctor
```

**Performance:**
- Use `--profile preview` for faster builds during development
- Enable build caching in EAS for faster subsequent builds

---

## 📈 **Next Steps**

1. **Test on target devices** before production builds
2. **Set up CI/CD** for automated builds (GitHub Actions + EAS)
3. **Configure analytics** and crash reporting
4. **Optimize bundle sizes** with code splitting
5. **Plan update strategies** (OTA updates for mobile, auto-updater for desktop)

---

**🎉 Your LoreWeaver app is now ready for distribution across all major platforms!**