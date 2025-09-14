import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Globe, Plus } from 'lucide-react-native';
import { useSettings } from '@/hooks/settings-context';
import { createTheme, deviceInfo } from '@/constants/theme';
import { useResponsiveLayout, useResponsiveSpacing, useResponsiveFontSize } from '@/hooks/responsive-layout';

interface SelectWorldPromptProps {
  title?: string;
  description?: string;
  showCreateButton?: boolean;
  onCreateWorld?: () => void;
  customIcon?: React.ReactNode;
  pageIcon?: React.ReactNode;
  customAction?: {
    label: string;
    onPress: () => void;
    icon?: React.ReactNode;
  };
}

export function SelectWorldPrompt({
  title = "No World Selected",
  description = "Select or create a world to start building your universe",
  showCreateButton = true,
  onCreateWorld,
  customIcon,
  pageIcon,
  customAction,
}: SelectWorldPromptProps) {
  const { settings } = useSettings();
  const theme = createTheme(settings.theme);
  const { isTablet, isLandscape } = useResponsiveLayout();
  const { getScaledSpacing } = useResponsiveSpacing();
  const { getScaledSize } = useResponsiveFontSize();

  const handleSelectWorld = () => {
    router.push('/world-select' as any);
  };

  const handleCreateWorld = () => {
    if (onCreateWorld) {
      onCreateWorld();
    } else {
      router.push('/world-select' as any);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: getScaledSpacing(theme.spacing.xl),
      paddingVertical: getScaledSpacing(theme.spacing.xxl),
      backgroundColor: theme.colors.background,
      // Center content better on all platforms
      maxWidth: deviceInfo.isDesktop ? 600 : '100%',
      alignSelf: 'center',
      width: '100%',
    },
    iconContainer: {
      marginBottom: getScaledSpacing(theme.spacing.xl),
      opacity: 0.6,
    },
    title: {
      fontSize: getScaledSize(isTablet ? theme.fontSize.xxl : theme.fontSize.xl),
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: getScaledSpacing(theme.spacing.md),
    },
    description: {
      fontSize: getScaledSize(theme.fontSize.md),
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: getScaledSize(theme.fontSize.md * 1.5),
      marginBottom: getScaledSpacing(theme.spacing.xl),
      maxWidth: isTablet ? 600 : 300,
    },
    buttonsContainer: {
      flexDirection: (isTablet && isLandscape) || deviceInfo.isDesktop ? 'row' : 'column',
      gap: getScaledSpacing(theme.spacing.md),
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      maxWidth: deviceInfo.isDesktop ? 500 : (isTablet ? 400 : 280),
    },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: getScaledSpacing(deviceInfo.isDesktop ? theme.spacing.lg : theme.spacing.xl),
      paddingVertical: getScaledSpacing(deviceInfo.isDesktop ? theme.spacing.md : theme.spacing.lg),
      borderRadius: theme.borderRadius.full,
      minHeight: theme.responsive.buttonMinHeight,
      minWidth: ((isTablet && isLandscape) || deviceInfo.isDesktop) ? 180 : '100%',
      gap: getScaledSpacing(theme.spacing.sm),
      ...theme.shadows.large,
    },
    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: theme.colors.border,
      paddingHorizontal: getScaledSpacing(deviceInfo.isDesktop ? theme.spacing.lg : theme.spacing.xl),
      paddingVertical: getScaledSpacing(deviceInfo.isDesktop ? theme.spacing.md : theme.spacing.lg),
      borderRadius: theme.borderRadius.full,
      minHeight: theme.responsive.buttonMinHeight,
      minWidth: ((isTablet && isLandscape) || deviceInfo.isDesktop) ? 180 : '100%',
      gap: getScaledSpacing(theme.spacing.sm),
    },
    primaryButtonText: {
      fontSize: getScaledSize(theme.fontSize.md),
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.background,
    },
    secondaryButtonText: {
      fontSize: getScaledSize(theme.fontSize.md),
      fontWeight: theme.fontWeight.medium,
      color: theme.colors.text,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {customIcon || pageIcon || <Globe size={isTablet ? 80 : 64} color={theme.colors.textTertiary} />}
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleSelectWorld}
          activeOpacity={0.8}
        >
          <Globe size={20} color={theme.colors.background} />
          <Text style={styles.primaryButtonText}>Select World</Text>
        </TouchableOpacity>
        
        {showCreateButton && (
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleCreateWorld}
            activeOpacity={0.8}
          >
            <Plus size={20} color={theme.colors.text} />
            <Text style={styles.secondaryButtonText}>Create New World</Text>
          </TouchableOpacity>
        )}
        
        {customAction && (
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={customAction.onPress}
            activeOpacity={0.8}
          >
            {customAction.icon}
            <Text style={styles.secondaryButtonText}>{customAction.label}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}