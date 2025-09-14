import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as ScreenOrientation from "expo-screen-orientation";
import React, { useEffect, useCallback } from "react";
import { Platform, StatusBar, Dimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { WorldProvider } from "@/hooks/world-context";
import { AIProvider } from "@/hooks/ai-context";
import { SettingsProvider, useSettings } from "@/hooks/settings-context";
import { AuthProvider } from "@/hooks/auth-context";
import { createTheme } from "@/constants/theme";
import ErrorBoundary from "@/components/ErrorBoundary";
import { crashLogger } from "@/utils/crash-logger";
import { useElectronMenuIntegration } from "@/hooks/electron-menu";
import CrashLogsViewer from "@/components/CrashLogsViewer";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      // Mobile optimization
      refetchOnWindowFocus: Platform.OS === 'web',
      refetchOnReconnect: true,
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
});

function RootLayoutNav() {
  const { settings } = useSettings();
  const theme = createTheme(settings.theme);
  
  // Apply global font settings
  const getFontSize = useCallback((baseSize: number) => {
    const multiplier = {
      'small': 0.85,
      'medium': 1,
      'large': 1.15,
      'extra-large': 1.3
    }[settings.typography.fontSize];
    return Math.round(baseSize * multiplier);
  }, [settings.typography.fontSize]);
  
  const getFontFamily = useCallback(() => {
    return settings.typography.fontFamily === 'System' ? undefined : settings.typography.fontFamily;
  }, [settings.typography.fontFamily]);
  
  return (
    <Stack screenOptions={{ 
      headerBackTitle: Platform.OS === 'ios' ? "Back" : "",
      headerStyle: {
        backgroundColor: theme.colors.surface,
        ...(Platform.OS === 'android' && { elevation: 4 }),
        ...(Platform.OS === 'ios' && {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }),
      },
      headerTintColor: theme.colors.text,
      headerTitleStyle: {
        fontWeight: theme.fontWeight.semibold,
        fontSize: getFontSize(Platform.OS === 'ios' ? theme.fontSize.lg : theme.fontSize.lg + 1),
        fontFamily: getFontFamily(),
      },
      contentStyle: {
        backgroundColor: theme.colors.background,
      },
      animation: Platform.OS === 'ios' ? 'slide_from_right' : 'slide_from_right',
      // Mobile-specific optimizations
      gestureEnabled: Platform.OS === 'ios',
      gestureDirection: 'horizontal',
      animationDuration: Platform.OS === 'android' ? 250 : 350,
    }}>
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      <Stack.Screen name="world-select" options={{ 
        title: "Select World",
        presentation: "modal",
      }} />
      <Stack.Screen name="character-edit" options={{ 
        title: "Edit Character",
        presentation: "modal",
      }} />
      <Stack.Screen name="location-edit" options={{ 
        title: "Edit Location",
        presentation: "modal",
      }} />
      <Stack.Screen name="item-edit" options={{ 
        title: "Edit Item",
        presentation: "modal",
      }} />
      <Stack.Screen name="faction-edit" options={{ 
        title: "Edit Faction",
        presentation: "modal",
      }} />
      <Stack.Screen name="lore-edit" options={{ 
        title: "Edit Lore Note",
        presentation: "modal",
      }} />
      <Stack.Screen name="magic-edit" options={{ 
        title: "Edit Magic System",
        presentation: "modal",
      }} />
      <Stack.Screen name="mythology-edit" options={{ 
        title: "Edit Mythology",
        presentation: "modal",
      }} />
      <Stack.Screen name="settings" options={{ 
        title: "Settings",
        presentation: "modal",
      }} />
    </Stack>
  );
}

function ThemedRootLayout() {
  const { settings } = useSettings();
  const theme = createTheme(settings.theme);
  
  // Initialize Electron menu integration
  const { showCrashLogs, setShowCrashLogs } = useElectronMenuIntegration();
  
  useEffect(() => {
    // Configure status bar for mobile
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(theme.colors.surface, true);
      StatusBar.setBarStyle(settings.theme === 'light' ? 'dark-content' : 'light-content', true);
    }
  }, [theme.colors.surface, settings.theme]);

  useEffect(() => {
    // Configure orientation based on device type
    const configureOrientation = async () => {
      // Skip orientation management on Electron/web
      if (Platform.OS === 'web') {
        return;
      }
      
      const { width } = Dimensions.get('window');
      const isTablet = width >= 768;
      
      try {
        if (isTablet) {
          // Allow all orientations for tablets
          await ScreenOrientation.unlockAsync();
        } else {
          // Lock to portrait for phones
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        }
      } catch (error) {
        // Silently ignore orientation errors (e.g., on Electron)
        console.log('Orientation management not available');
      }
    };
    
    configureOrientation();
  }, []);
  
  return (
    <>
      <StatusBar 
        barStyle={settings.theme === 'light' ? 'dark-content' : 'light-content'} 
        backgroundColor={theme.colors.background}
        translucent={false}
        animated={true}
      />
      <RootLayoutNav />
      <CrashLogsViewer 
        visible={showCrashLogs} 
        onClose={() => setShowCrashLogs(false)} 
      />
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // Initialize crash logger with app info
    crashLogger.setUserInfo('anonymous', '1.0.9', '9');
    
    // File logging is now automatically enabled for all mobile platforms
    if (Platform.OS !== 'web') {
      console.log('Automatic crash log file logging initialized');
    }
    
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ErrorBoundary>
            <AuthProvider>
              <SettingsProvider>
                <WorldProvider>
                  <AIProvider>
                    <ThemedRootLayout />
                  </AIProvider>
                </WorldProvider>
              </SettingsProvider>
            </AuthProvider>
          </ErrorBoundary>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}