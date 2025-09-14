import { useEffect, useCallback, useState } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useWorld } from '@/hooks/world-context';

export function useElectronMenuIntegration() {
  const router = useRouter();
  const { currentWorld } = useWorld();
  const [showCrashLogs, setShowCrashLogs] = useState(false);
  
  // Safe type checking for Electron API
  const electronAPI = typeof window !== 'undefined' ? (window as any).electronAPI : null;
  const isElectron = electronAPI && electronAPI.isElectron;

  // Update Electron menu when world selection changes
  useEffect(() => {
    if (isElectron && Platform.OS === 'web' && electronAPI?.updateWorldState) {
      const worldSelected = !!currentWorld;
      
      electronAPI.updateWorldState(worldSelected).catch((error: any) => {
        console.error('Failed to update Electron menu state:', error);
      });
    }
  }, [currentWorld, isElectron, electronAPI]);

  // Handle navigation from Electron menu
  useEffect(() => {
    if (!isElectron || Platform.OS !== 'web') {
      return;
    }

    const handleElectronNavigation = (event: any) => {
      try {
        // Safely extract route from event
        const route = event?.detail?.route || '/';
        console.log('Electron navigation requested:', route);
        
        // Navigate using Expo Router
        if (route === '/') {
          router.push('/' as any);
        } else if (typeof route === 'string' && route.startsWith('/')) {
          router.push(route as any);
        } else {
          // Invalid route, go to home
          router.push('/' as any);
        }
      } catch (error) {
        console.error('Failed to navigate from Electron menu:', error);
        // Fallback to home on navigation error
        try {
          router.push('/' as any);
        } catch (fallbackError) {
          console.error('Fallback navigation failed:', fallbackError);
          window.location.hash = '#/';
        }
      }
    };

    const handleForceHomeNavigation = (event: any) => {
      console.log('Force home navigation requested by Electron');
      try {
        router.replace('/' as any);
      } catch (error) {
        console.error('Force home navigation failed:', error);
        window.location.hash = '#/';
        window.location.reload();
      }
    };

    const handleOpenCrashLogs = (event: any) => {
      console.log('Open crash logs requested by Electron menu');
      try {
        // Navigate to settings screen to show crash logs
        router.push('/settings' as any);
        // Set a timeout to trigger crash logs modal after navigation completes
        setTimeout(() => {
          setShowCrashLogs(true);
        }, 100);
      } catch (error) {
        console.error('Failed to open crash logs:', error);
      }
    };

    // Listen for regular navigation events
    window.addEventListener('electron-navigate', handleElectronNavigation);
    
    // Listen for forced home navigation events
    window.addEventListener('force-home-navigation', handleForceHomeNavigation);
    
    // Listen for crash logs requests from Electron menu
    window.addEventListener('electron-open-crash-logs', handleOpenCrashLogs);

    // Also set up the IPC handler if available
    let cleanup: (() => void) | undefined;
    if (electronAPI?.onNavigate) {
      cleanup = electronAPI.onNavigate(handleElectronNavigation);
    }

    return () => {
      window.removeEventListener('electron-navigate', handleElectronNavigation);
      window.removeEventListener('force-home-navigation', handleForceHomeNavigation);
      window.removeEventListener('electron-open-crash-logs', handleOpenCrashLogs);
      cleanup?.();
    };
  }, [router, isElectron, electronAPI]);

  // Function to programmatically update menu state
  const updateMenuWorldState = useCallback((worldSelected: boolean) => {
    if (isElectron && Platform.OS === 'web' && electronAPI?.updateWorldState) {
      electronAPI.updateWorldState(worldSelected).catch((error: any) => {
        console.error('Failed to update Electron menu state:', error);
      });
    }
  }, [isElectron, electronAPI]);

  return {
    isElectron,
    updateMenuWorldState,
    showCrashLogs,
    setShowCrashLogs,
  };
}

export default useElectronMenuIntegration;