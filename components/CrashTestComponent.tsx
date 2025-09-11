import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Bug, Zap, AlertTriangle } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { logError, logWarning, logNetworkError, logPerformanceIssue, logReactError } from '@/utils/crash-logger';

interface CrashTestComponentProps {
  onClose?: () => void;
}

export default function CrashTestComponent({ onClose }: CrashTestComponentProps) {
  const triggerJSError = () => {
    try {
      // Intentionally cause a TypeError
      const obj: any = null;
      obj.nonExistentMethod();
    } catch (error) {
      logError(error as Error, { context: 'Manual JS Error Test', userAction: 'triggerJSError' });
      
      if (Platform.OS === 'web') {
        alert('JavaScript error logged! Check the crash logs in Settings > Developer > Crash Logs');
      } else {
        Alert.alert('Error Logged', 'JavaScript error logged! Check the crash logs in Settings > Developer > Crash Logs');
      }
    }
  };

  const triggerReferenceError = () => {
    try {
      // Intentionally cause a ReferenceError
      const undefinedVar = (window as any).undefinedVariable;
      console.log(undefinedVar.someProperty);
    } catch (error) {
      logError(error as Error, { context: 'Manual Reference Error Test', userAction: 'triggerReferenceError' });
      
      if (Platform.OS === 'web') {
        alert('Reference error logged! Check the crash logs in Settings.');
      } else {
        Alert.alert('Error Logged', 'Reference error logged! Check the crash logs in Settings.');
      }
    }
  };

  const triggerAsyncError = async () => {
    try {
      // Simulate an async operation that fails
      await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Simulated async operation failed'));
        }, 100);
      });
    } catch (error) {
      logError(error as Error, { 
        context: 'Async Operation Test', 
        userAction: 'triggerAsyncError',
        additionalInfo: 'This was a simulated network request failure'
      });
      
      if (Platform.OS === 'web') {
        alert('Async error logged! Check the crash logs in Settings.');
      } else {
        Alert.alert('Error Logged', 'Async error logged! Check the crash logs in Settings.');
      }
    }
  };

  const triggerWarning = () => {
    logWarning('This is a test warning message', { 
      userAction: 'triggerWarning',
      additionalInfo: 'Testing non-fatal warning logging'
    }, 'warning');
    
    if (Platform.OS === 'web') {
      alert('Warning logged! Check the crash logs in Settings.');
    } else {
      Alert.alert('Warning Logged', 'Warning logged! Check the crash logs in Settings.');
    }
  };

  const triggerNetworkError = () => {
    const mockError = new Error('Network timeout after 30 seconds');
    logNetworkError('https://api.example.com/test', mockError, {
      method: 'POST',
      timeout: 30000,
      userAction: 'triggerNetworkError'
    });
    
    if (Platform.OS === 'web') {
      alert('Network error logged! Check the crash logs in Settings.');
    } else {
      Alert.alert('Network Error Logged', 'Network error logged! Check the crash logs in Settings.');
    }
  };

  const triggerPerformanceIssue = () => {
    logPerformanceIssue('Slow component render detected', {
      renderTime: 2500,
      component: 'CrashTestComponent',
      threshold: 1000,
      userAction: 'triggerPerformanceIssue'
    });
    
    if (Platform.OS === 'web') {
      alert('Performance issue logged! Check the crash logs in Settings.');
    } else {
      Alert.alert('Performance Issue Logged', 'Performance issue logged! Check the crash logs in Settings.');
    }
  };

  const triggerConsoleWarning = () => {
    console.warn('This is a test console warning that should be captured');
    console.error('This is a test console error that should be captured');
    
    if (Platform.OS === 'web') {
      alert('Console messages logged! Check the crash logs in Settings.');
    } else {
      Alert.alert('Console Logged', 'Console messages logged! Check the crash logs in Settings.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Bug size={32} color={theme.colors.error} />
        <Text style={styles.title}>Crash Test Component</Text>
        <Text style={styles.subtitle}>
          Test the enhanced crash logging system by triggering different types of errors, warnings, and issues
        </Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.testButton} onPress={triggerJSError}>
          <AlertTriangle size={20} color={theme.colors.background} />
          <Text style={styles.testButtonText}>Trigger JavaScript Error</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={triggerReferenceError}>
          <Zap size={20} color={theme.colors.background} />
          <Text style={styles.testButtonText}>Trigger Reference Error</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={triggerAsyncError}>
          <Bug size={20} color={theme.colors.background} />
          <Text style={styles.testButtonText}>Trigger Async Error</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.testButton, styles.warningButton]} onPress={triggerWarning}>
          <AlertTriangle size={20} color={theme.colors.background} />
          <Text style={styles.testButtonText}>Trigger Warning</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.testButton, styles.networkButton]} onPress={triggerNetworkError}>
          <Zap size={20} color={theme.colors.background} />
          <Text style={styles.testButtonText}>Trigger Network Error</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.testButton, styles.performanceButton]} onPress={triggerPerformanceIssue}>
          <Bug size={20} color={theme.colors.background} />
          <Text style={styles.testButtonText}>Trigger Performance Issue</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.testButton, styles.consoleButton]} onPress={triggerConsoleWarning}>
          <AlertTriangle size={20} color={theme.colors.background} />
          <Text style={styles.testButtonText}>Trigger Console Messages</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>How to View Crash Logs:</Text>
          <Text style={styles.infoText}>
            1. Go to Settings (gear icon in top right)
          </Text>
          <Text style={styles.infoText}>
            2. Scroll to Developer section
          </Text>
          <Text style={styles.infoText}>
            3. Tap &quot;View Logs&quot; under Crash Logs
          </Text>
          <Text style={styles.infoText}>
            4. View, export, or send crash reports
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  testButton: {
    backgroundColor: theme.colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  testButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  warningButton: {
    backgroundColor: '#f59e0b', // Amber color for warnings
  },
  networkButton: {
    backgroundColor: '#3b82f6', // Blue color for network errors
  },
  performanceButton: {
    backgroundColor: '#8b5cf6', // Purple color for performance issues
  },
  consoleButton: {
    backgroundColor: '#6b7280', // Gray color for console messages
  },
  infoBox: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
});