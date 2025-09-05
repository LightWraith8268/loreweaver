import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { getResponsiveLayout } from '@/constants/theme';

interface ResponsiveLayoutState {
  dimensions: ScaledSize;
  isTablet: boolean;
  isLargeTablet: boolean;
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
  const isLandscape = dimensions.width > dimensions.height;
  const isPortrait = dimensions.height > dimensions.width;

  const layout = getResponsiveLayout();

  return {
    dimensions,
    isTablet,
    isLargeTablet,
    isLandscape,
    isPortrait,
    orientation,
    columns: layout.columns,
    shouldUseSidebar: layout.shouldUseSidebar,
    shouldUseGrid: layout.shouldUseGrid,
    sidebarWidth: layout.sidebarWidth,
    contentMaxWidth: layout.contentMaxWidth,
  };
}

// Hook for responsive grid layout
export function useResponsiveGrid(itemCount: number) {
  const { isTablet, isLargeTablet, isLandscape } = useResponsiveLayout();
  
  const getColumns = () => {
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
    shouldUseGrid: isTablet,
  };
}

// Hook for responsive modal sizing
export function useResponsiveModal() {
  const { isTablet, isLargeTablet } = useResponsiveLayout();

  const getModalDimensions = () => {
    if (isLargeTablet) {
      return {
        width: '60%',
        maxWidth: 800,
        maxHeight: '85%',
      };
    }
    if (isTablet) {
      return {
        width: '70%',
        maxWidth: 600,
        maxHeight: '85%',
      };
    }
    return {
      width: '90%',
      maxWidth: 400,
      maxHeight: '85%',
    };
  };

  return getModalDimensions();
}

// Hook for responsive font sizes
export function useResponsiveFontSize() {
  const { isTablet, isLargeTablet } = useResponsiveLayout();

  const getScaledSize = (baseSize: number) => {
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
  const { isTablet, isLargeTablet } = useResponsiveLayout();

  const getScaledSpacing = (baseSpacing: number) => {
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