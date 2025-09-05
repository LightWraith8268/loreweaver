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
import { createTheme } from '@/constants/theme';
import { useResponsiveLayout, useResponsiveSpacing, useResponsiveFontSize } from '@/hooks/responsive-layout';

type PromptVariant = 'page' | 'inline';

type SelectWorldPromptProps = {
  title?: string;
  description?: string;
  showCreateButton?: boolean;
  onCreateWorld?: () => void;
  customIcon?: React.ReactNode;
  customAction?: {
    label: string;
    onPress: () => void;
    icon?: React.ReactNode;
  };
  variant?: PromptVariant;
  testID?: string;
};

export function SelectWorldPrompt({
  title = 'No World Selected',
  description = 'Select or create a world to start building your universe',
  showCreateButton = true,
  onCreateWorld,
  customIcon,
  customAction,
  variant = 'page',
  testID,
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

  const isInline = variant === 'inline';

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: getScaledSpacing(isInline ? theme.spacing.md : theme.spacing.xl),
      paddingVertical: getScaledSpacing(isInline ? theme.spacing.lg : theme.spacing.xxl),
      backgroundColor: theme.colors.background,
      ...(isInline ? {} : { flex: 1 }),
    },
    iconContainer: {
      marginBottom: getScaledSpacing(isInline ? theme.spacing.md : theme.spacing.xl),
      opacity: 0.6,
    },
    title: {
      fontSize: getScaledSize(isInline ? theme.fontSize.lg : (isTablet ? theme.fontSize.xxl : theme.fontSize.xl)),
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: getScaledSpacing(isInline ? theme.spacing.xs : theme.spacing.md),
    },
    description: {
      fontSize: getScaledSize(isInline ? theme.fontSize.sm : theme.fontSize.md),
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: getScaledSize((isInline ? theme.fontSize.sm : theme.fontSize.md) * 1.5),
      marginBottom: getScaledSpacing(isInline ? theme.spacing.md : theme.spacing.xl),
      maxWidth: isTablet ? 600 : 320,
    },
    buttonsContainer: {
      flexDirection: isTablet && isLandscape ? 'row' : 'column',
      gap: getScaledSpacing(isInline ? theme.spacing.sm : theme.spacing.md),
      alignItems: 'center',
      width: '100%',
      maxWidth: isTablet ? 420 : 320,
    },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: getScaledSpacing(isInline ? theme.spacing.lg : theme.spacing.xl),
      paddingVertical: getScaledSpacing(isInline ? theme.spacing.md : theme.spacing.lg),
      borderRadius: theme.borderRadius.full,
      minHeight: isTablet ? 52 : theme.mobile.buttonMinHeight,
      minWidth: isTablet && isLandscape ? 180 : '100%',
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
      paddingHorizontal: getScaledSpacing(isInline ? theme.spacing.lg : theme.spacing.xl),
      paddingVertical: getScaledSpacing(isInline ? theme.spacing.md : theme.spacing.lg),
      borderRadius: theme.borderRadius.full,
      minHeight: isTablet ? 52 : theme.mobile.buttonMinHeight,
      minWidth: isTablet && isLandscape ? 180 : '100%',
      gap: getScaledSpacing(theme.spacing.sm),
    },
    primaryButtonText: {
      fontSize: getScaledSize(isInline ? theme.fontSize.sm : theme.fontSize.md),
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.background,
    },
    secondaryButtonText: {
      fontSize: getScaledSize(isInline ? theme.fontSize.sm : theme.fontSize.md),
      fontWeight: theme.fontWeight.medium,
      color: theme.colors.text,
    },
  });

  return (
    <View style={styles.container} testID={testID ?? 'select-world-prompt'}>
      <View style={styles.iconContainer}>
        {customIcon || <Globe size={isInline ? 40 : (isTablet ? 80 : 64)} color={theme.colors.textTertiary} />}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSelectWorld}
          activeOpacity={0.8}
          testID="select-world-button"
        >
          <Globe size={18} color={theme.colors.background} />
          <Text style={styles.primaryButtonText}>Select World</Text>
        </TouchableOpacity>
        {showCreateButton && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleCreateWorld}
            activeOpacity={0.8}
            testID="create-world-button"
          >
            <Plus size={18} color={theme.colors.text} />
            <Text style={styles.secondaryButtonText}>Create New World</Text>
          </TouchableOpacity>
        )}
        {customAction && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={customAction.onPress}
            activeOpacity={0.8}
            testID="custom-action-button"
          >
            {customAction.icon}
            <Text style={styles.secondaryButtonText}>{customAction.label}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}