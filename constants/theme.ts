import { Platform } from 'react-native';

export const theme = {
  colors: {
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
  },
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
  // Mobile-specific constants
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
      ios: 20, // Default, will be overridden by safe area
      android: 24, // Default, will be overridden by safe area
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
};

// Helper function to get platform-specific tab bar height with safe area
export const getTabBarHeight = (bottomInset: number) => {
  const baseHeight = Platform.OS === 'ios' ? theme.mobile.tabBarHeight.ios : theme.mobile.tabBarHeight.android;
  const minInset = Platform.OS === 'ios' ? 16 : 8;
  return baseHeight + Math.max(bottomInset, minInset);
};

// Helper function to get platform-specific header height with safe area
export const getHeaderHeight = (topInset: number) => {
  const baseHeight = Platform.OS === 'ios' ? theme.mobile.headerHeight.ios : theme.mobile.headerHeight.android;
  return baseHeight + topInset;
};