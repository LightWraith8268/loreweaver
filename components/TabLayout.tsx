import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '@/constants/theme';
import { LucideIcon } from 'lucide-react-native';

export interface TabItem {
  key: string;
  label: string;
  icon: LucideIcon;
}

interface TabLayoutProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
  children: React.ReactNode;
  scrollable?: boolean;
}

export const TabLayout: React.FC<TabLayoutProps> = ({
  tabs,
  activeTab,
  onTabChange,
  children,
  scrollable = false
}) => {
  const getTabStyle = (isActive: boolean) => [
    styles.tab,
    isActive && styles.activeTab,
    scrollable ? styles.scrollableTab : styles.fixedTab
  ];

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView 
          horizontal={scrollable}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={!scrollable ? styles.tabContainerFixed : styles.tabContainerScrollable}
        >
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.key;
            
            return (
              <TouchableOpacity
                key={tab.key}
                style={getTabStyle(isActive)}
                onPress={() => onTabChange(tab.key)}
              >
                <IconComponent 
                  size={20} 
                  color={isActive ? theme.colors.primary : theme.colors.textSecondary} 
                />
                <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabContainer: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabContainerFixed: {
    flexDirection: 'row',
  },
  tabContainerScrollable: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  fixedTab: {
    flex: 1,
  },
  scrollableTab: {
    minWidth: 120,
    flex: 0,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
  },
});