import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Platform, StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { WorldProvider } from "@/hooks/world-context";
import { AIProvider } from "@/hooks/ai-context";
import { theme } from "@/constants/theme";

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
        fontSize: Platform.OS === 'ios' ? theme.fontSize.lg : theme.fontSize.lg + 1,
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
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // Configure status bar for mobile
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(theme.colors.surface, true);
      StatusBar.setBarStyle('light-content', true);
    }
    
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar 
            barStyle="light-content" 
            backgroundColor={theme.colors.surface}
            translucent={Platform.OS === 'android'}
          />
          <WorldProvider>
            <AIProvider>
              <RootLayoutNav />
            </AIProvider>
          </WorldProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}