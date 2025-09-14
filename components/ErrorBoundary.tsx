import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { AlertTriangle, RefreshCw, Send, X, Home } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createTheme } from '@/constants/theme';
import { logReactError } from '@/utils/crash-logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  isDismissed: boolean;
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
      isDismissed: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorInfo: null,
      isDismissed: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Log the React error using the enhanced crash logger
    logReactError('ErrorBoundary', error, errorInfo);
    
    // Also log using the old method for backward compatibility
    this.logCrash(error, errorInfo);
    
    // Enhanced logging for Electron
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const electronAPI = (window as any).electronAPI;
      electronAPI.logError(error, 'React ErrorBoundary').catch((err: any) => {
        console.error('Failed to log error to Electron:', err);
      });
      
      // Create detailed error log for Electron
      const detailedLog = `[${new Date().toISOString()}] REACT ERROR BOUNDARY TRIGGERED
Error: ${error.name}: ${error.message}
Component Stack: ${errorInfo.componentStack || 'Not available'}
Error Stack: ${error.stack || 'Not available'}
Platform: ${Platform.OS}
URL: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}
User Agent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}

`;
      
      electronAPI.appendCrashLog('react-error-boundary.log', detailedLog).catch((err: any) => {
        console.error('Failed to append to React error boundary log:', err);
      });
    }

    // Auto-navigate to home screen after a delay for critical errors
    this.scheduleAutoRecovery(error);
  }

  private scheduleAutoRecovery = (error: Error) => {
    // For critical errors, automatically attempt to navigate to home after 5 seconds
    const isCriticalError = this.isCriticalError(error);
    
    if (isCriticalError) {
      console.log('Critical error detected, scheduling auto-recovery in 5 seconds');
      setTimeout(() => {
        if (this.state.hasError && !this.state.isDismissed) {
          this.navigateToHome();
        }
      }, 5000);
    }
  };

  private isCriticalError = (error: Error): boolean => {
    // Define what constitutes a critical error that should auto-recover
    const criticalPatterns = [
      /ChunkLoadError/i,
      /Loading chunk/i,
      /Loading CSS chunk/i,
      /Script error/i,
      /Network Error/i,
      /Failed to fetch/i,
      /Cannot read prop/i,
      /undefined is not a function/i,
      /Cannot access before initialization/i
    ];
    
    return criticalPatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.name) || pattern.test(error.stack || '')
    );
  };

  private navigateToHome = () => {
    try {
      console.log('Attempting to navigate to home screen after error...');
      
      // Clear error state and local storage issues
      localStorage.removeItem('lastRoute');
      sessionStorage.clear();
      
      // Multiple navigation strategies for reliability
      if (Platform.OS === 'web') {
        // Web-specific navigation
        window.location.hash = '#/';
        
        if (window.history && window.history.replaceState) {
          window.history.replaceState({}, '', '#/');
        }

        // Force page reload if on Electron to ensure clean state
        if (typeof window !== 'undefined' && (window as any).electronAPI?.isElectron) {
          console.log('Electron detected, triggering force navigation');
          window.dispatchEvent(new CustomEvent('force-home-navigation', {
            detail: { forced: true, fromErrorBoundary: true }
          }));
        } else {
          // Regular web browser - just reload to home
          window.location.href = window.location.origin + '/#/';
        }
      }
      
      // Clear the error state after successful navigation
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isDismissed: false,
      });
      
    } catch (navError) {
      console.error('Failed to navigate to home, performing hard reload:', navError);
      if (Platform.OS === 'web') {
        window.location.reload();
      }
    }
  };

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
      isDismissed: false,
    });
  };
  
  private handleDismiss = () => {
    this.setState({
      isDismissed: true,
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
    if (this.state.hasError && !this.state.isDismissed) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      const theme = createTheme('dark'); // Use dark theme for error boundary
      const styles = this.getStyles(theme);

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.header}>
              <AlertTriangle size={64} color={theme.colors.error} style={styles.icon} />
              <TouchableOpacity style={styles.closeButton} onPress={this.handleDismiss}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
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
              <TouchableOpacity style={styles.primaryButton} onPress={this.navigateToHome}>
                <Home size={20} color={theme.colors.background} />
                <Text style={styles.primaryButtonText}>Go to Home</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.secondaryButton} onPress={this.handleRestart}>
                <RefreshCw size={20} color={theme.colors.primary} />
                <Text style={styles.secondaryButtonText}>Restart App</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.tertiaryButton} onPress={this.handleSendReport}>
                <Send size={20} color={theme.colors.textSecondary} />
                <Text style={styles.tertiaryButtonText}>Send Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
  
  private getStyles = (theme: ReturnType<typeof createTheme>) => StyleSheet.create({
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
    header: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.lg,
    },
    closeButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.surface,
    },
    icon: {
      flex: 1,
      textAlign: 'center',
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
    tertiaryButton: {
      backgroundColor: 'transparent',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
    },
    tertiaryButtonText: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.medium,
    },
  });
}

export default ErrorBoundary;