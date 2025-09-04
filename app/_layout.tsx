import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { WorldProvider } from "@/hooks/world-context";
import { AIProvider } from "@/hooks/ai-context";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ 
      headerBackTitle: "Back",
      headerStyle: {
        backgroundColor: '#141824',
      },
      headerTintColor: '#E2E8F0',
      contentStyle: {
        backgroundColor: '#0A0E1A',
      },
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
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <WorldProvider>
          <AIProvider>
            <RootLayoutNav />
          </AIProvider>
        </WorldProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}