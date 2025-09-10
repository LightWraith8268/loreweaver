import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { theme } from '@/constants/theme';

interface StandardModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  scrollable?: boolean;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  showCloseButton?: boolean;
  headerActions?: React.ReactNode;
}

export const StandardModal: React.FC<StandardModalProps> = ({
  visible,
  onClose,
  title,
  children,
  scrollable = true,
  size = 'medium',
  showCloseButton = true,
  headerActions,
}) => {
  const getModalStyle = () => {
    switch (size) {
      case 'small':
        return styles.modalSmall;
      case 'large':
        return styles.modalLarge;
      case 'fullscreen':
        return styles.modalFullscreen;
      default:
        return styles.modalMedium;
    }
  };

  const ContentWrapper = scrollable ? ScrollView : View;
  const contentProps = scrollable 
    ? { showsVerticalScrollIndicator: false, style: styles.scrollContent }
    : { style: styles.staticContent };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={size === 'fullscreen' ? 'fullScreen' : 'pageSheet'}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.modal, getModalStyle()]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerContent}>
              <Text style={styles.modalTitle}>{title}</Text>
              {headerActions && (
                <View style={styles.headerActions}>
                  {headerActions}
                </View>
              )}
            </View>
            {showCloseButton && (
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Content */}
          <ContentWrapper {...contentProps}>
            {children}
          </ContentWrapper>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modal: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalSmall: {
    maxHeight: '40%',
    marginTop: '60%',
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
  },
  modalMedium: {
    maxHeight: '80%',
    marginTop: '20%',
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
  },
  modalLarge: {
    maxHeight: '90%',
    marginTop: '10%',
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
  },
  modalFullscreen: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    minHeight: 60,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: theme.spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    flex: 1,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  staticContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
});