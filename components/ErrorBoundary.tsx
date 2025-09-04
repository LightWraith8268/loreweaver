import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { AlertTriangle, RefreshCw, Send } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '@/constants/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

interface CrashLog {
  id: string;
  timestamp: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  errorInfo: any;
  platform: string;
  userAgent?: string;
  url?: string;
  deviceInfo: {
    platform: string;
    version?: string;
  };
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Log the crash
    this.logCrash(error, errorInfo);
  }

  private async logCrash(error: Error, errorInfo: any) {
    try {
      const crashLog: CrashLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        errorInfo,
        platform: Platform.OS,
        userAgent: Platform.OS === 'web' ? navigator.userAgent : undefined,
        url: Platform.OS === 'web' ? window.location.href : undefined,
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version?.toString(),
        },
      };

      // Store crash log locally
      const existingLogs = await AsyncStorage.getItem('crash_logs');
      const logs: CrashLog[] = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(crashLog);
      
      // Keep only last 50 crash logs
      if (logs.length > 50) {
        logs.splice(0, logs.length - 50);
      }
      
      await AsyncStorage.setItem('crash_logs', JSON.stringify(logs));
      
      console.log('Crash logged successfully:', crashLog.id);
    } catch (logError) {
      console.error('Failed to log crash:', logError);
    }
  }

  private handleRestart = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleSendReport = async () => {
    if (!this.state.error) return;

    try {
      const crashLog: CrashLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        error: {
          name: this.state.error.name,
          message: this.state.error.message,
          stack: this.state.error.stack,
        },
        errorInfo: this.state.errorInfo,
        platform: Platform.OS,
        userAgent: Platform.OS === 'web' ? navigator.userAgent : undefined,
        url: Platform.OS === 'web' ? window.location.href : undefined,
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version?.toString(),
        },
      };

      // In a real app, you would send this to your crash reporting service
      // For now, we'll just show the user that the report was "sent"
      console.log('Crash report to send:', crashLog);
      
      if (Platform.OS === 'web') {
        alert('Crash report prepared. In a production app, this would be sent to the development team.');
      } else {
        Alert.alert(
          'Report Sent',
          'Crash report prepared. In a production app, this would be sent to the development team.',
          [{ text: 'OK' }]
        );
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

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <AlertTriangle size={64} color={theme.colors.error} style={styles.icon} />
            
            <Text style={styles.title}>Something went wrong</Text>
            
            <Text style={styles.message}>
              The app encountered an unexpected error. You can try restarting or send a report to help us fix this issue.
            </Text>
            
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Error Details (Development Mode):</Text>
                <Text style={styles.errorText}>{this.state.error.message}</Text>
                {this.state.error.stack && (
                  <Text style={styles.stackTrace}>{this.state.error.stack}</Text>
                )}
              </View>
            )}
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.primaryButton} onPress={this.handleRestart}>
                <RefreshCw size={20} color={theme.colors.background} />
                <Text style={styles.primaryButtonText}>Restart App</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.secondaryButton} onPress={this.handleSendReport}>
                <Send size={20} color={theme.colors.primary} />
                <Text style={styles.secondaryButtonText}>Send Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  icon: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  errorDetails: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xl,
    width: '100%',
    maxHeight: 200,
  },
  errorTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.error,
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  stackTrace: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  buttonContainer: {
    width: '100%',
    gap: theme.spacing.md,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  primaryButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
});

export default ErrorBoundary;