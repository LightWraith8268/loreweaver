import { Tabs } from "expo-router";
import { Home, Users, MapPin, Sparkles, ScrollText, Settings } from "lucide-react-native";
import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme, getTabBarHeight, getHeaderHeight, getTouchableStyle } from "@/constants/theme";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 8),
          paddingTop: Platform.OS === 'ios' ? 8 : 6,
          height: getTabBarHeight(insets.bottom),
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          // Ensure tab bar is above content
          zIndex: 1000,
          ...theme.shadows.large,
        },
        tabBarLabelStyle: {
          fontSize: Platform.OS === 'ios' ? theme.fontSize.xs : theme.fontSize.xs - 1,
          fontWeight: theme.fontWeight.medium,
          marginTop: Platform.OS === 'ios' ? 4 : 2,
          marginBottom: Platform.OS === 'ios' ? 2 : 1,
        },
        tabBarIconStyle: {
          marginTop: Platform.OS === 'ios' ? 4 : 2,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
          height: getHeaderHeight(insets.top),
          ...theme.shadows.medium,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: theme.fontWeight.semibold,
          fontSize: Platform.OS === 'ios' ? theme.fontSize.lg : theme.fontSize.lg + 1,
        },
        tabBarItemStyle: {
          paddingVertical: Platform.OS === 'ios' ? 4 : 2,
          // Ensure proper touch target size
          minHeight: theme.mobile.minTouchTarget,
        },
        tabBarAllowFontScaling: false, // Prevent font scaling issues
        // Optimize for mobile performance
        tabBarHideOnKeyboard: Platform.OS === 'android',
        tabBarVisibilityAnimationConfig: {
          show: {
            animation: 'timing',
            config: {
              duration: 200,
            },
          },
          hide: {
            animation: 'timing',
            config: {
              duration: 200,
            },
          },
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "LoreWeaver",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="entities"
        options={{
          title: "Entities",
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="world"
        options={{
          title: "World",
          tabBarIcon: ({ color }) => <MapPin size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="systems"
        options={{
          title: "Systems",
          tabBarIcon: ({ color }) => <Sparkles size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="lore"
        options={{
          title: "Lore",
          tabBarIcon: ({ color }) => <ScrollText size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: "Tools",
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="characters"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="items"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="factions"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="locations"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="relationships"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="magic"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="mythology"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}