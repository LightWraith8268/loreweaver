# Changelog

All notable changes to LoreWeaver will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.17] - 2025-01-13

### 🎉 Major Changes - Navigation System Overhaul
- **BREAKING**: Complete migration from tab-based to drawer navigation system
- **NEW**: Modern hamburger menu navigation with gesture support
- **NEW**: 26 specialized worldbuilding screens (up from 14 tabs)

### ✨ Added
- **Navigation**: Modern drawer navigation with @react-navigation/drawer
- **New Screens**: Added 26 comprehensive worldbuilding categories:
  - Natural Laws - Define fundamental rules governing your world
  - Ecosystems - Environmental and biological systems
  - Technology - Technological advancement levels and artifacts  
  - Social Systems - Cultural structures and societies
  - Geography - Physical world features and terrain
  - Projects - Manage multiple worldbuilding projects
  - Entities - Centralized entity management
  - Plot - Story elements and narrative structures
  - Foundations - Core worldbuilding principles
  - Relationships - Entity connections and networks
  - Worldbuilding - General world development tools
  - Tools - Utility functions and helpers
  - Notes - General note-taking system
  - Documentation - Project documentation management
  - Content Archive - Historical content storage
- **Dependencies**: Added react-native-reanimated ~3.17.4 for smooth drawer animations
- **Mobile UX**: Enhanced gesture-based navigation optimized for touch devices
- **File Organization**: Clean separation of drawer screens in `app/(drawer)/` directory

### 🔄 Changed
- **Navigation**: Replaced bottom tab navigation with side drawer navigation
- **File Structure**: Moved from `app/(tabs)/` to `app/(drawer)/` architecture
- **Version**: Updated from 1.0.16 to 1.0.17 across all configuration files
- **Android versionCode**: Incremented from 16 to 17 for Play Store compatibility
- **Documentation**: Updated README.md to reflect new navigation system and features
- **Build Process**: Enhanced Windows build script to handle new structure

### 🗑️ Removed
- **Legacy Navigation**: Completely removed old `app/(tabs)` directory and tab navigation system
- **Build Artifacts**: Cleaned up legacy build directories (dist-new, old Windows builds)
- **Unused Dependencies**: Removed tab navigation related packages

### 🔧 Fixed
- **Startup Crashes**: Resolved "No route named 'natural-laws' exists" error
- **Route Discovery**: Fixed Metro bundler caching issues preventing new routes from being recognized
- **Android Builds**: Fixed missing react-native-reanimated dependency in EAS builds
- **Navigation Consistency**: All screens now follow consistent navigation patterns
- **Cache Issues**: Implemented proper cache clearing for fresh builds

### 🏗️ Technical Improvements
- **Build System**: Streamlined Windows build process with proper cache management
- **Route Resolution**: Improved route discovery and bundle generation
- **Error Handling**: Enhanced error boundaries for navigation crashes
- **Performance**: Optimized drawer animations and gesture handling
- **Code Organization**: Better separation of concerns with drawer-based architecture

### 🚀 Deployment
- **Windows**: Successfully built and tested Windows executable with new navigation
- **Android**: Prepared for EAS cloud build with proper dependency management
- **Git**: Comprehensive cleanup with 545k+ deletions of legacy build artifacts

---

## [1.0.16] - Previous Version

### Features
- Tab-based navigation system (deprecated in 1.0.17)
- 14 core worldbuilding tabs
- Basic mobile optimization
- Initial crash logging implementation

---

## Future Versions

### Planned for 1.0.18
- **Mobile Polish**: Enhanced mobile gestures and animations
- **Performance**: Lazy loading for drawer screens
- **UI/UX**: Improved drawer customization and themes
- **Testing**: Comprehensive test coverage for navigation system

### Planned for 1.1.x
- **Advanced Navigation**: Nested drawer categories and search
- **Accessibility**: Full screen reader and keyboard navigation support
- **Multi-Platform**: Enhanced desktop navigation patterns
- **Sync**: Real-time navigation state synchronization across devices

---

## Migration Guide

### From 1.0.16 to 1.0.17

#### Navigation Changes
- **Before**: Bottom tabs with 14 screens
- **After**: Side drawer with 26 screens
- **User Impact**: More organized navigation with better categorization

#### New Screens Available
All previous functionality maintained, plus new specialized screens:
- Natural Laws, Ecosystems, Technology, Social Systems, Geography
- Projects, Entities, Plot, Foundations, Relationships
- Worldbuilding, Tools, Notes, Documentation, Content Archive

#### Developer Changes
- Update navigation references from tab-based to drawer-based
- Screens moved from `app/(tabs)/` to `app/(drawer)/`
- New dependency: react-native-reanimated for animations

#### No Data Loss
- All existing world data fully preserved
- Automatic migration to new navigation structure
- No user action required for existing worlds

---

## Breaking Changes

### 1.0.17
- **Navigation API**: Tab navigation components replaced with drawer navigation
- **File Paths**: Screen components moved to new directory structure
- **Route Names**: Some route names changed for better organization

---

## Dependencies

### Added in 1.0.17
- `react-native-reanimated: ~3.17.4` - For smooth drawer animations
- `@react-navigation/drawer: ^6.6.15` - Core drawer navigation

### Updated in 1.0.17
- `package.json version: 1.0.17`
- `app.json expo.version: 1.0.17`
- `app.json expo.android.versionCode: 17`

---

## Build Information

### 1.0.17 Build Process
1. Complete cache cleanup (`rm -rf .expo dist win`)
2. Fresh package installation (`npm install`)
3. Web build generation (`expo export --platform web`)
4. Electron path fixes (`node scripts/fix-electron-paths.js`)
5. Windows executable generation (`electron-builder --win`)
6. Android APK cloud build (`eas build --platform android`)

### Build Artifacts
- **Windows**: `win/unpacked/LoreWeaver.exe` (development)
- **Windows**: `win/LoreWeaver-Setup.exe` (distribution installer)
- **Android**: EAS cloud build APK (via Expo)
- **Web**: Progressive Web App build in `dist/`

---

## Statistics

### 1.0.17 Changes
- **Files Added**: 15+ new drawer screen components
- **Files Removed**: 545,587 deletions (build artifacts cleanup)
- **Lines Changed**: Major navigation system rewrite
- **New Features**: 12 additional worldbuilding categories
- **Dependencies**: 1 major addition (react-native-reanimated)

---

*This changelog is automatically maintained and tracks all significant changes to the LoreWeaver application.*