import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform, Share, Modal } from 'react-native';
import { Bug, Trash2, Send, Download, RefreshCw, Clock, Smartphone, Globe, X } from 'lucide-react-native';
import { createTheme } from '@/constants/theme';
import { useSettings } from '@/hooks/settings-context';
import { StandardModal } from '@/components/StandardModal';
import { CrashLog, getCrashLogs, clearCrashLogs, exportCrashLogs, sendCrashReport } from '@/utils/crash-logger';

interface CrashLogsViewerProps {
  visible?: boolean;
  onClose?: () => void;
}

export default function CrashLogsViewer({ visible = true, onClose }: CrashLogsViewerProps) {
  const { settings } = useSettings();
  const theme = createTheme(settings.theme);
  const [logs, setLogs] = useState<CrashLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<CrashLog | null>(null);

  useEffect(() => {
    loadCrashLogs();
  }, []);

  const loadCrashLogs = async () => {
    try {
      setLoading(true);
      const crashLogs = await getCrashLogs();
      setLogs(crashLogs.reverse()); // Show newest first
    } catch (error) {
      console.error('Failed to load crash logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = () => {
    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to clear all crash logs? This action cannot be undone.')) {
        clearAllLogs();
      }
    } else {
      Alert.alert(
        'Clear Crash Logs',
        'Are you sure you want to clear all crash logs? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear', style: 'destructive', onPress: clearAllLogs },
        ]
      );
    }
  };

  const clearAllLogs = async () => {
    try {
      await clearCrashLogs();
      setLogs([]);
      setSelectedLog(null);
      if (Platform.OS === 'web') {
        alert('Crash logs cleared successfully.');
      } else {
        Alert.alert('Success', 'Crash logs cleared successfully.');
      }
    } catch (error) {
      console.error('Failed to clear crash logs:', error);
      if (Platform.OS === 'web') {
        alert('Failed to clear crash logs.');
      } else {
        Alert.alert('Error', 'Failed to clear crash logs.');
      }
    }
  };

  const handleExportLogs = async () => {
    try {
      const exportData = await exportCrashLogs();
      
      if (Platform.OS === 'web') {
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `crash-logs-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        await Share.share({
          message: exportData,
          title: 'Crash Logs Export',
        });
      }
    } catch (error) {
      console.error('Failed to export crash logs:', error);
      if (Platform.OS === 'web') {
        alert('Failed to export crash logs.');
      } else {
        Alert.alert('Error', 'Failed to export crash logs.');
      }
    }
  };

  const handleSendReport = async (crashLog: CrashLog) => {
    try {
      const success = await sendCrashReport(crashLog);
      if (success) {
        if (Platform.OS === 'web') {
          alert('Crash report sent successfully.');
        } else {
          Alert.alert('Success', 'Crash report sent successfully.');
        }
      } else {
        throw new Error('Failed to send report');
      }
    } catch (error) {
      console.error('Failed to send crash report:', error);
      if (Platform.OS === 'web') {
        alert('Failed to send crash report.');
      } else {
        Alert.alert('Error', 'Failed to send crash report.');
      }
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getPlatformIcon = (platform: string) => {
    return platform === 'web' ? Globe : Smartphone;
  };

  const styles = React.useMemo(() => StyleSheet.create({
    modalBody: {
      flex: 1,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    title: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
    },
    headerActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    actionButton: {
      padding: theme.spacing.sm,
    },
    backButton: {
      padding: theme.spacing.sm,
    },
    backButtonText: {
      color: theme.colors.primary,
      fontSize: theme.fontSize.md,
    },
    sendButton: {
      padding: theme.spacing.sm,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    loadingText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    emptyTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    emptyMessage: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    logCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    logHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    logInfo: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    errorName: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.error,
      marginBottom: 2,
    },
    errorMessage: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
      lineHeight: 18,
    },
    platformBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
    },
    platformText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textSecondary,
      textTransform: 'capitalize',
    },
    logFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    timestampContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    timestamp: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textSecondary,
    },
    sendReportButton: {
      padding: 4,
    },
    metadataContainer: {
      marginBottom: theme.spacing.md,
      gap: 4,
    },
    metadataRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metadataText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    stackTraceContainer: {
      marginBottom: theme.spacing.md,
    },
    stackTraceTitle: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    stackTraceScroll: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.sm,
    },
    stackTraceText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textSecondary,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      lineHeight: 16,
    },
    errorInfoContainer: {
      marginBottom: theme.spacing.md,
    },
    errorInfoTitle: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    errorInfoText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textSecondary,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      backgroundColor: theme.colors.background,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
    },
    deviceInfoContainer: {
      backgroundColor: theme.colors.background,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
    },
    deviceInfoTitle: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    deviceInfoText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textSecondary,
      marginBottom: 2,
    },
  }), [theme]);

  if (!visible) return null;

  if (loading) {
    const loadingContent = (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <RefreshCw size={32} color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading crash logs...</Text>
        </View>
      </View>
    );

    if (onClose) {
      return (
        <StandardModal
          visible={visible}
          onClose={onClose}
          title="Crash Logs"
          size="large"
          scrollable={true}
        >
          <View style={styles.modalBody}>
            {loadingContent}
          </View>
        </StandardModal>
      );
    }

    return loadingContent;
  }

  if (selectedLog) {
    const detailContent = (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedLog(null)} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Crash Details</Text>
          <TouchableOpacity onPress={() => handleSendReport(selectedLog)} style={styles.sendButton}>
            <Send size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.logCard}>
            <View style={styles.logHeader}>
              <View style={styles.logInfo}>
                <Text style={styles.errorName}>{selectedLog.error.name}</Text>
                <Text style={styles.errorMessage}>{selectedLog.error.message}</Text>
              </View>
              <View style={styles.platformBadge}>
                {React.createElement(getPlatformIcon(selectedLog.platform), {
                  size: 16,
                  color: theme.colors.textSecondary,
                })}
                <Text style={styles.platformText}>{selectedLog.platform}</Text>
              </View>
            </View>

            <View style={styles.metadataContainer}>
              <View style={styles.metadataRow}>
                <Clock size={16} color={theme.colors.textSecondary} />
                <Text style={styles.metadataText}>{formatDate(selectedLog.timestamp)}</Text>
              </View>
              <Text style={styles.metadataText}>ID: {selectedLog.id}</Text>
              {selectedLog.sessionId && (
                <Text style={styles.metadataText}>Session: {selectedLog.sessionId}</Text>
              )}
            </View>

            {selectedLog.error.stack && (
              <View style={styles.stackTraceContainer}>
                <Text style={styles.stackTraceTitle}>Stack Trace:</Text>
                <ScrollView horizontal style={styles.stackTraceScroll}>
                  <Text style={styles.stackTraceText}>{selectedLog.error.stack}</Text>
                </ScrollView>
              </View>
            )}

            {selectedLog.errorInfo && (
              <View style={styles.errorInfoContainer}>
                <Text style={styles.errorInfoTitle}>Error Info:</Text>
                <Text style={styles.errorInfoText}>
                  {JSON.stringify(selectedLog.errorInfo, null, 2)}
                </Text>
              </View>
            )}

            <View style={styles.deviceInfoContainer}>
              <Text style={styles.deviceInfoTitle}>Device Info:</Text>
              <Text style={styles.deviceInfoText}>
                Platform: {selectedLog.deviceInfo.platform}
              </Text>
              {selectedLog.deviceInfo.version && (
                <Text style={styles.deviceInfoText}>
                  Version: {selectedLog.deviceInfo.version}
                </Text>
              )}
              {selectedLog.userAgent && (
                <Text style={styles.deviceInfoText}>
                  User Agent: {selectedLog.userAgent}
                </Text>
              )}
              {selectedLog.url && (
                <Text style={styles.deviceInfoText}>
                  URL: {selectedLog.url}
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    );

    if (onClose) {
      return (
        <StandardModal
          visible={visible}
          onClose={onClose}
          title="Crash Details"
          size="large"
          scrollable={true}
        >
          <View style={styles.modalBody}>
            {detailContent}
          </View>
        </StandardModal>
      );
    }

    return detailContent;
  }

  const mainContent = (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Bug size={24} color={theme.colors.primary} />
          <Text style={styles.title}>Crash Logs ({logs.length})</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleExportLogs} style={styles.actionButton}>
            <Download size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClearLogs} style={styles.actionButton}>
            <Trash2 size={20} color={theme.colors.error} />
          </TouchableOpacity>
          <TouchableOpacity onPress={loadCrashLogs} style={styles.actionButton}>
            <RefreshCw size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {logs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Bug size={64} color={theme.colors.textSecondary} />
          <Text style={styles.emptyTitle}>No Crash Logs</Text>
          <Text style={styles.emptyMessage}>
            Great! Your app hasn&apos;t crashed recently. Crash logs will appear here when errors occur.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {logs.map((log) => (
            <TouchableOpacity
              key={log.id}
              style={styles.logCard}
              onPress={() => setSelectedLog(log)}
            >
              <View style={styles.logHeader}>
                <View style={styles.logInfo}>
                  <Text style={styles.errorName}>{log.error.name}</Text>
                  <Text style={styles.errorMessage} numberOfLines={2}>
                    {log.error.message}
                  </Text>
                </View>
                <View style={styles.platformBadge}>
                  {React.createElement(getPlatformIcon(log.platform), {
                    size: 16,
                    color: theme.colors.textSecondary,
                  })}
                  <Text style={styles.platformText}>{log.platform}</Text>
                </View>
              </View>
              <View style={styles.logFooter}>
                <View style={styles.timestampContainer}>
                  <Clock size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.timestamp}>{formatDate(log.timestamp)}</Text>
                </View>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleSendReport(log);
                  }}
                  style={styles.sendReportButton}
                >
                  <Send size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  if (onClose) {
    return (
      <StandardModal
        visible={visible}
        onClose={onClose}
        title={`Crash Logs (${logs.length})`}
        size="fullscreen"
        scrollable={true}
      >
        <View style={styles.modalBody}>
          {mainContent}
        </View>
      </StandardModal>
    );
  }

  return mainContent;
}

