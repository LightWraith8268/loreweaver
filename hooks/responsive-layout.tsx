import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize, Platform } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { getResponsiveLayout, deviceInfo } from '@/constants/theme';

interface ResponsiveLayoutState {
  dimensions: ScaledSize;
  isTablet: boolean;
  isLargeTablet: boolean;
  isDesktop: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  orientation: ScreenOrientation.Orientation;
  columns: number;
  shouldUseSidebar: boolean;
  shouldUseGrid: boolean;
  sidebarWidth: number;
  contentMaxWidth: number;
}

export function useResponsiveLayout(): ResponsiveLayoutState {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));
  const [orientation, setOrientation] = useState<ScreenOrientation.Orientation>(
    ScreenOrientation.Orientation.PORTRAIT_UP
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    const getOrientation = async () => {
      try {
        const currentOrientation = await ScreenOrientation.getOrientationAsync();
        setOrientation(currentOrientation);
      } catch (error) {
        console.log('Error getting orientation:', error);
      }
    };

    getOrientation();

    const subscription = ScreenOrientation.addOrientationChangeListener((event: ScreenOrientation.OrientationChangeEvent) => {
      setOrientation(event.orientationInfo.orientation);
    });

    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
    };
  }, []);

  const isTablet = dimensions.width >= 768;
  const isLargeTablet = dimensions.width >= 1024;
  const isDesktop = deviceInfo.isDesktop;
  const isLandscape = dimensions.width > dimensions.height;
  const isPortrait = dimensions.height > dimensions.width;

  const layout = getResponsiveLayout();

  return {
    dimensions,
    isTablet,
    isLargeTablet,
    isDesktop,
    isLandscape,
    isPortrait,
    orientation,
    columns: layout.columns,
    shouldUseSidebar: layout.shouldUseSidebar || isDesktop,
    shouldUseGrid: layout.shouldUseGrid || isDesktop,
    sidebarWidth: layout.sidebarWidth,
    contentMaxWidth: layout.contentMaxWidth,
  };
}

// Hook for responsive grid layout
export function useResponsiveGrid(itemCount: number) {
  const { isTablet, isLargeTablet, isDesktop, isLandscape } = useResponsiveLayout();
  
  const getColumns = () => {
    if (isDesktop) {
      return isLandscape ? 5 : 4;
    }
    if (isLargeTablet) {
      return isLandscape ? 4 : 3;
    }
    if (isTablet) {
      return isLandscape ? 3 : 2;
    }
    return 1;
  };

  const columns = getColumns();
  const rows = Math.ceil(itemCount / columns);

  return {
    columns,
    rows,
    itemWidth: `${100 / columns}%`,
    shouldUseGrid: isTablet || isDesktop,
  };
}

// Hook for responsive modal sizing
export function useResponsiveModal() {
  const { isTablet, isLargeTablet, isDesktop } = useResponsiveLayout();

  const getModalDimensions = () => {
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;
    
    if (isDesktop) {
      return {
        width: Math.min(windowWidth * 0.5, 700),
        maxHeight: windowHeight * 0.8,
      };
    }
    if (isLargeTablet) {
      return {
        width: Math.min(windowWidth * 0.6, 800),
        maxHeight: windowHeight * 0.85,
      };
    }
    if (isTablet) {
      return {
        width: Math.min(windowWidth * 0.7, 600),
        maxHeight: windowHeight * 0.85,
      };
    }
    return {
      width: Math.min(windowWidth * 0.9, 400),
      maxHeight: windowHeight * 0.85,
    };
  };

  return getModalDimensions();
}

// Hook for responsive font sizes
export function useResponsiveFontSize() {
  const { isTablet, isLargeTablet, isDesktop } = useResponsiveLayout();

  const getScaledSize = (baseSize: number) => {
    if (isDesktop) {
      return Math.round(baseSize * 0.9); // Slightly smaller for desktop
    }
    if (isLargeTablet) {
      return baseSize + 4;
    }
    if (isTablet) {
      return baseSize + 2;
    }
    return baseSize;
  };

  return { getScaledSize };
}

// Hook for responsive spacing
export function useResponsiveSpacing() {
  const { isTablet, isLargeTablet, isDesktop } = useResponsiveLayout();

  const getScaledSpacing = (baseSpacing: number) => {
    if (isDesktop) {
      return Math.round(baseSpacing * 0.8); // Tighter spacing for desktop
    }
    if (isLargeTablet) {
      return Math.round(baseSpacing * 1.5);
    }
    if (isTablet) {
      return Math.round(baseSpacing * 1.25);
    }
    return baseSpacing;
  };

  return { getScaledSpacing };
}

// Hook for screen rotation lock/unlock
export function useScreenRotation() {
  const lockToPortrait = async () => {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    } catch (error) {
      console.log('Error locking to portrait:', error);
    }
  };

  const lockToLandscape = async () => {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } catch (error) {
      console.log('Error locking to landscape:', error);
    }
  };

  const unlockOrientation = async () => {
    try {
      await ScreenOrientation.unlockAsync();
    } catch (error) {
      console.log('Error unlocking orientation:', error);
    }
  };

  return {
    lockToPortrait,
    lockToLandscape,
    unlockOrientation,
  };
}