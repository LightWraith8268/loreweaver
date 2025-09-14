import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { Platform } from 'react-native';
import { 
  Home, 
  BookOpen, 
  Users, 
  Globe, 
  ScrollText, 
  Wrench, 
  Settings,
  FileText,
  Archive,
  Lightbulb,
  Map,
  Sparkles,
  Clock,
  Heart,
  Trees,
  Zap,
  Mountain
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '@/hooks/settings-context';
import { createTheme } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/responsive-layout';

export default function DrawerLayout() {
  const insets = useSafeAreaInsets();
  const { isTablet } = useResponsiveLayout();
  const { settings } = useSettings();
  const theme = createTheme(settings.theme);
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: true,
          drawerStyle: {
            backgroundColor: theme.colors.surface,
            width: isTablet ? 320 : 280,
          },
          headerStyle: {
            backgroundColor: theme.colors.surface,
            paddingTop: Platform.OS === 'android' ? insets.top : 0,
            paddingHorizontal: isTablet ? 20 : 16,
            ...theme.shadows.medium,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: theme.fontWeight.semibold,
            fontSize: Platform.OS === 'ios' ? theme.fontSize.lg : theme.fontSize.lg + 1,
          },
          drawerActiveTintColor: theme.colors.primary,
          drawerInactiveTintColor: theme.colors.textSecondary,
          drawerActiveBackgroundColor: theme.colors.primary + '15',
          drawerItemStyle: {
            marginHorizontal: 8,
            marginVertical: 2,
            borderRadius: 8,
          },
          drawerLabelStyle: {
            fontSize: theme.fontSize.md,
            fontWeight: theme.fontWeight.medium,
            marginLeft: -16,
          },
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: "Dashboard",
            drawerIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        
        <Drawer.Screen
          name="projects"
          options={{
            title: "Projects",
            drawerIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
          }}
        />
        
        <Drawer.Screen
          name="entities"
          options={{
            title: "Entities",
            drawerIcon: ({ color, size }) => <Users size={size} color={color} />,
          }}
        />
        
        <Drawer.Screen
          name="characters"
          options={{
            title: "Characters",
            drawerIcon: ({ color, size }) => <Users size={size} color={color} />,
          }}
        />
        
        <Drawer.Screen
          name="locations"
          options={{
            title: "Locations",
            drawerIcon: ({ color, size }) => <Map size={size} color={color} />,
          }}
        />
        
        <Drawer.Screen
          name="factions"
          options={{
            title: "Factions",
            drawerIcon: ({ color, size }) => <Users size={size} color={color} />,
          }}
        />
        
        <Drawer.Screen
          name="items"
          options={{
            title: "Items",
            drawerIcon: ({ color, size }) => <Archive size={size} color={color} />,
          }}
        />
        
        <Drawer.Screen
          name="magic"
          options={{
            title: "Magic Systems",
            drawerIcon: ({ color, size }) => <Sparkles size={size} color={color} />,
          }}
        />
        
        <Drawer.Screen
          name="mythology"
          options={{
            title: "Mythology",
            drawerIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
          }}
        />
        
        <Drawer.Screen
          name="timeline"
          options={{
            title: "Timeline",
            drawerIcon: ({ color, size }) => <Clock size={size} color={color} />,
          }}
        />
        
        <Drawer.Screen
          name="lore"
          options={{
            title: "Lore & History",
            drawerIcon: ({ color, size }) => <ScrollText size={size} color={color} />,
          }}
        />
        
        <Drawer.Screen
          name="plot"
          options={{
            title: "Plot & Stories",
            drawerIcon: ({ color, size }) => <FileText size={size} color={color} />,
          }}
        />
        
        <Drawer.Screen
          name="foundations"
          options={{
            title: "Foundations",
            drawerIcon: ({ color, size }) => <Mountain size={size} color={color} />,
          }}
        />
        
        <Drawer.Screen
          name="relationships"
          options={{
            title: "Relationships",
            drawerIcon: ({ color, size }) => <Heart size={size} color={color} />,
          }}
        />
        
        <Drawer.Screen
          name="worldbuilding"
          options={{
            title: "World Building",
            drawerIcon: ({ color, size }) => <Globe size={size} color={color} />,
          }}
        />
        
        <Drawer.Screen
          name="tools"
          options={{
            title: "Tools",
            drawerIcon: ({ color, size }) => <Wrench size={size} color={color} />,
          }}
        />
        
        <Drawer.Screen
          name="notes"
          options={{
            title: "Notes & Ideas",
            drawerIcon: ({ color, size }) => <Lightbulb size={size} color={color} />,
          }}
        />
        
        <Drawer.Screen
          name="documentation"
          options={{
            title: "Documentation",
            drawerIcon: ({ color, size }) => <FileText size={size} color={color} />,
          }}
        />
        
        <Drawer.Screen
          name="content-archive"
          options={{
            title: "Archive",
            drawerIcon: ({ color, size }) => <Archive size={size} color={color} />,
          }}
        />
        
        <Drawer.Screen
          name="geography"
          options={{
            title: "Geography",
            drawerIcon: ({ color, size }) => <Globe size={size} color={color} />,
          }}
        />
        
        <Drawer.Screen
          name="ecosystems"
          options={{
            title: "Ecosystems",
            drawerIcon: ({ color, size }) => <Trees size={size} color={color} />,
          }}
        />
        
        <Drawer.Screen
          name="technology"
          options={{
            title: "Technology",
            drawerIcon: ({ color, size }) => <Zap size={size} color={color} />,
          }}
        />
        
        <Drawer.Screen
          name="social-systems"
          options={{
            title: "Social Systems",
            drawerIcon: ({ color, size }) => <Users size={size} color={color} />,
          }}
        />
        
        <Drawer.Screen
          name="natural-laws"
          options={{
            title: "Natural Laws",
            drawerIcon: ({ color, size }) => <Mountain size={size} color={color} />,
          }}
        />
        
        <Drawer.Screen
          name="app-settings"
          options={{
            title: "Settings",
            drawerIcon: ({ color, size }) => <Settings size={size} color={color} />,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}