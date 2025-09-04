import { Platform, Dimensions } from 'react-native';

// Get device dimensions for responsive design
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth >= 768;
const isLargeTablet = screenWidth >= 1024;
const isSmallScreen = screenWidth < 375;
const isLandscape = screenWidth > screenHeight;

// Responsive breakpoints
const breakpoints = {
  phone: 0,
  tablet: 768,
  largeTablet: 1024,
  desktop: 1440,
};

// Get responsive value based on screen size
const getResponsiveValue = <T>(values: {
  phone: T;
  tablet?: T;
  largeTablet?: T;
  desktop?: T;
}): T => {
  if (screenWidth >= breakpoints.desktop && values.desktop !== undefined) {
    return values.desktop;
  }
  if (screenWidth >= breakpoints.largeTablet && values.largeTablet !== undefined) {
    return values.largeTablet;
  }
  if (screenWidth >= breakpoints.tablet && values.tablet !== undefined) {
    return values.tablet;
  }
  return values.phone;
};

// Color schemes
const darkColors = {
  background: '#0A0E1A',
  surface: '#141824',
  surfaceLight: '#1C2333',
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  secondary: '#8B5CF6',
  accent: '#EC4899',
  text: '#E2E8F0',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  border: '#334155',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  fantasy: '#9333EA',
  scifi: '#06B6D4',
  cyberpunk: '#F97316',
  mythology: '#EAB308',
};

const lightColors = {
  background: '#FFFFFF',
  surface: '#F8FAFC',
  surfaceLight: '#F1F5F9',
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  secondary: '#8B5CF6',
  accent: '#EC4899',
  text: '#1E293B',
  textSecondary: '#475569',
  textTertiary: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  fantasy: '#9333EA',
  scifi: '#06B6D4',
  cyberpunk: '#F97316',
  mythology: '#EAB308',
};

// Create theme function that accepts theme mode
export const createTheme = (mode: 'dark' | 'light' = 'dark') => ({
  colors: mode === 'dark' ? darkColors : lightColors,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  fontSize: {
    xs: Platform.OS === 'ios' ? 12 : 11,
    sm: Platform.OS === 'ios' ? 14 : 13,
    md: Platform.OS === 'ios' ? 16 : 15,
    lg: Platform.OS === 'ios' ? 18 : 17,
    xl: Platform.OS === 'ios' ? 24 : 22,
    xxl: Platform.OS === 'ios' ? 32 : 28,
    xxxl: Platform.OS === 'ios' ? 40 : 36,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  // Responsive design constants
  responsive: {
    minTouchTarget: getResponsiveValue({
      phone: Platform.OS === 'android' ? 48 : 44,
      tablet: Platform.OS === 'android' ? 52 : 48,
      largeTablet: Platform.OS === 'android' ? 56 : 52,
    }),
    tabBarHeight: {
      ios: getResponsiveValue({ phone: 49, tablet: 56, largeTablet: 64 }),
      android: getResponsiveValue({ phone: 56, tablet: 64, largeTablet: 72 }),
    },
    headerHeight: {
      ios: getResponsiveValue({ phone: 44, tablet: 52, largeTablet: 60 }),
      android: getResponsiveValue({ phone: 56, tablet: 64, largeTablet: 72 }),
    },
    statusBarHeight: {
      ios: 20, // Default, will be overridden by safe area
      android: 24, // Default, will be overridden by safe area
    },
    // Enhanced responsive touch and interaction constants
    cardMinHeight: getResponsiveValue({
      phone: Platform.OS === 'android' ? 56 : 52,
      tablet: Platform.OS === 'android' ? 64 : 60,
      largeTablet: Platform.OS === 'android' ? 72 : 68,
    }),
    buttonMinHeight: getResponsiveValue({
      phone: Platform.OS === 'android' ? 48 : 44,
      tablet: Platform.OS === 'android' ? 52 : 48,
      largeTablet: Platform.OS === 'android' ? 56 : 52,
    }),
    inputMinHeight: getResponsiveValue({
      phone: Platform.OS === 'android' ? 48 : 44,
      tablet: Platform.OS === 'android' ? 52 : 48,
      largeTablet: Platform.OS === 'android' ? 56 : 52,
    }),
    fabSize: getResponsiveValue({ phone: 56, tablet: 64, largeTablet: 72 }),
    iconButtonSize: getResponsiveValue({
      phone: Platform.OS === 'android' ? 48 : 44,
      tablet: Platform.OS === 'android' ? 52 : 48,
      largeTablet: Platform.OS === 'android' ? 56 : 52,
    }),
    // Device info
    isTablet,
    isLargeTablet,
    isSmallScreen,
    isLandscape,
    screenWidth,
    screenHeight,
    breakpoints,
    // Adaptive spacing based on screen size
    adaptiveSpacing: {
      xs: getResponsiveValue({ phone: isSmallScreen ? 2 : 4, tablet: 6, largeTablet: 8 }),
      sm: getResponsiveValue({ phone: isSmallScreen ? 6 : 8, tablet: 12, largeTablet: 16 }),
      md: getResponsiveValue({ phone: isSmallScreen ? 12 : 16, tablet: 20, largeTablet: 24 }),
      lg: getResponsiveValue({ phone: isSmallScreen ? 18 : 24, tablet: 32, largeTablet: 40 }),
      xl: getResponsiveValue({ phone: isSmallScreen ? 24 : 32, tablet: 40, largeTablet: 48 }),
      xxl: getResponsiveValue({ phone: isSmallScreen ? 36 : 48, tablet: 64, largeTablet: 80 }),
    },
    // Tablet-specific layout constants
    tablet: {
      sidebarWidth: getResponsiveValue({ phone: 0, tablet: 280, largeTablet: 320 }),
      contentMaxWidth: getResponsiveValue({ phone: screenWidth, tablet: 800, largeTablet: 1000 }),
      gridColumns: getResponsiveValue({ phone: 1, tablet: 2, largeTablet: 3 }),
      modalWidth: getResponsiveValue({ phone: '90%', tablet: '70%', largeTablet: '60%' }),
      modalMaxWidth: getResponsiveValue({ phone: 400, tablet: 600, largeTablet: 800 }),
    },
  },
  // Legacy mobile constants for backward compatibility
  mobile: {
    minTouchTarget: Platform.OS === 'android' ? 48 : 44,
    tabBarHeight: {
      ios: 49,
      android: 56,
    },
    headerHeight: {
      ios: 44,
      android: 56,
    },
    statusBarHeight: {
      ios: 20,
      android: 24,
    },
    cardMinHeight: Platform.OS === 'android' ? 56 : 52,
    buttonMinHeight: Platform.OS === 'android' ? 48 : 44,
    inputMinHeight: Platform.OS === 'android' ? 48 : 44,
    fabSize: 56,
    iconButtonSize: Platform.OS === 'android' ? 48 : 44,
    isTablet,
    isSmallScreen,
    screenWidth,
    screenHeight,
    adaptiveSpacing: {
      xs: isSmallScreen ? 2 : 4,
      sm: isSmallScreen ? 6 : 8,
      md: isSmallScreen ? 12 : 16,
      lg: isSmallScreen ? 18 : 24,
      xl: isSmallScreen ? 24 : 32,
      xxl: isSmallScreen ? 36 : 48,
    },
  },
  // Platform-specific shadows
  shadows: {
    small: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
    medium: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      default: {},
    }),
    large: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
});

// Default theme (dark mode)
export const theme = createTheme('dark');

// Helper function to get platform-specific tab bar height with safe area
export const getTabBarHeight = (bottomInset: number) => {
  const baseHeight = Platform.OS === 'ios' ? theme.responsive.tabBarHeight.ios : theme.responsive.tabBarHeight.android;
  const minInset = Platform.OS === 'ios' ? 16 : 8;
  return baseHeight + Math.max(bottomInset, minInset);
};

// Helper function to get platform-specific header height with safe area
export const getHeaderHeight = (topInset: number) => {
  const baseHeight = Platform.OS === 'ios' ? theme.responsive.headerHeight.ios : theme.responsive.headerHeight.android;
  return baseHeight + topInset;
};

// Helper function for responsive layout
export const getResponsiveLayout = () => {
  return {
    isTablet,
    isLargeTablet,
    isLandscape,
    columns: theme.responsive.tablet.gridColumns,
    sidebarWidth: theme.responsive.tablet.sidebarWidth,
    contentMaxWidth: theme.responsive.tablet.contentMaxWidth,
    shouldUseSidebar: isTablet && isLandscape,
    shouldUseGrid: isTablet,
  };
};

// Helper function for responsive spacing
export const getResponsiveSpacing = (size: keyof typeof theme.responsive.adaptiveSpacing) => {
  return theme.responsive.adaptiveSpacing[size];
};

// Helper function for responsive font sizes
export const getResponsiveFontSize = (baseSize: keyof typeof theme.fontSize) => {
  const base = theme.fontSize[baseSize];
  return getResponsiveValue({
    phone: base,
    tablet: base + 2,
    largeTablet: base + 4,
  });
};

// Helper function to get safe content padding
export const getSafeContentPadding = (insets: { top: number; bottom: number; left: number; right: number }) => {
  return {
    paddingTop: Math.max(insets.top, Platform.OS === 'ios' ? 8 : 4),
    paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 8 : 4),
    paddingLeft: Math.max(insets.left, 0),
    paddingRight: Math.max(insets.right, 0),
  };
};

// Helper function for touch target sizing
export const getTouchableStyle = (minSize?: number) => {
  const size = minSize || theme.responsive.minTouchTarget;
  return {
    minWidth: size,
    minHeight: size,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };
};

// Helper function for responsive spacing
export const getAdaptiveSpacing = (size: keyof typeof theme.mobile.adaptiveSpacing) => {
  return theme.mobile.adaptiveSpacing[size];
};

// Helper function for responsive font scaling
export const getScaledFontSize = (size: number) => {
  const scale = isSmallScreen ? 0.9 : isTablet ? 1.1 : 1;
  return Math.round(size * scale);
};

// Helper function for keyboard-aware padding
export const getKeyboardAwarePadding = (baseInset: number) => {
  return {
    paddingBottom: Math.max(baseInset, Platform.OS === 'ios' ? 16 : 8),
  };
};

// Helper function for modal sizing
export const getModalDimensions = () => {
  return {
    width: theme.responsive.tablet.modalWidth,
    maxWidth: theme.responsive.tablet.modalMaxWidth,
    maxHeight: '85%',
  };
};

// Helper function for grid layout
export const getGridLayout = (itemCount: number) => {
  const columns = theme.responsive.tablet.gridColumns;
  const rows = Math.ceil(itemCount / columns);
  return {
    columns,
    rows,
    itemWidth: `${100 / columns}%`,
  };
};

// Helper function for orientation-aware dimensions
export const getOrientationDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return {
    width,
    height,
    isLandscape: width > height,
    isPortrait: height > width,
    aspectRatio: width / height,
  };
};

// Export device info for components
export const deviceInfo = {
  isTablet,
  isLargeTablet,
  isSmallScreen,
  isLandscape,
  screenWidth,
  screenHeight,
  breakpoints,
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  isWeb: Platform.OS === 'web',
  getResponsiveValue,
};

// Export responsive utilities
export const responsive = {
  getResponsiveValue,
  getResponsiveLayout,
  getResponsiveSpacing,
  getGridLayout,
  getOrientationDimensions,
};