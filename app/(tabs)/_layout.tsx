import { Tabs } from "expo-router";
import { Home, Users, MapPin, Sparkles, ScrollText, Settings } from "lucide-react-native";
import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme, getTabBarHeight, getHeaderHeight, getTouchableStyle } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/responsive-layout";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { isTablet, isLargeTablet, shouldUseSidebar } = useResponsiveLayout();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
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
          zIndex: 1000,
          ...theme.shadows.large,
        },
        tabBarLabelStyle: {
          fontSize: isTablet 
            ? (Platform.OS === 'ios' ? theme.fontSize.sm : theme.fontSize.sm - 1)
            : (Platform.OS === 'ios' ? theme.fontSize.xs : theme.fontSize.xs - 1),
          fontWeight: theme.fontWeight.medium,
          marginTop: Platform.OS === 'ios' ? (isTablet ? 6 : 4) : (isTablet ? 4 : 2),
          marginBottom: Platform.OS === 'ios' ? (isTablet ? 4 : 2) : (isTablet ? 2 : 1),
        },
        tabBarIconStyle: {
          marginTop: Platform.OS === 'ios' ? (isTablet ? 6 : 4) : (isTablet ? 4 : 2),
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
          paddingVertical: Platform.OS === 'ios' ? (isTablet ? 6 : 4) : (isTablet ? 4 : 2),
          minHeight: theme.responsive.minTouchTarget,
        },
        tabBarAllowFontScaling: false,
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
          title: "Dashboard",
          headerShown: false,
          tabBarIcon: ({ color }) => <Home size={isTablet ? 28 : 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="entities"
        options={{
          title: "Entities",
          tabBarIcon: ({ color }) => <Users size={isTablet ? 28 : 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="world"
        options={{
          title: "World",
          tabBarIcon: ({ color }) => <MapPin size={isTablet ? 28 : 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="systems"
        options={{
          title: "Systems",
          tabBarIcon: ({ color }) => <Sparkles size={isTablet ? 28 : 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="lore"
        options={{
          title: "Lore",
          tabBarIcon: ({ color }) => <ScrollText size={isTablet ? 28 : 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: "Tools",
          tabBarIcon: ({ color }) => <Settings size={isTablet ? 28 : 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="characters"
        options={{
          href: null,
          title: "Characters",
        }}
      />
      <Tabs.Screen
        name="items"
        options={{
          href: null,
          title: "Items",
        }}
      />
      <Tabs.Screen
        name="factions"
        options={{
          href: null,
          title: "Factions",
        }}
      />
      <Tabs.Screen
        name="locations"
        options={{
          href: null,
          title: "Locations",
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          href: null,
          title: "Timeline",
        }}
      />
      <Tabs.Screen
        name="relationships"
        options={{
          href: null,
          title: "Relationships",
        }}
      />
      <Tabs.Screen
        name="magic"
        options={{
          href: null,
          title: "Magic Systems",
        }}
      />
      <Tabs.Screen
        name="mythology"
        options={{
          href: null,
          title: "Mythology",
        }}
      />
    </Tabs>
  );
}