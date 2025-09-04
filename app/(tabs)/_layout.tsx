import { Tabs } from "expo-router";
import { Home, Users, MapPin, Sparkles, ScrollText, Settings } from "lucide-react-native";
import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";

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
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : theme.spacing.sm,
          paddingTop: theme.spacing.sm,
          height: Platform.OS === 'ios' ? 84 + insets.bottom : 68,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarLabelStyle: {
          fontSize: theme.fontSize.xs,
          fontWeight: theme.fontWeight.medium,
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
          height: Platform.OS === 'ios' ? 44 + insets.top : 56 + insets.top,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: theme.fontWeight.semibold,
          fontSize: theme.fontSize.lg,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
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