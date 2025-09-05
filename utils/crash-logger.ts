import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface CrashLog {
  id: string;
  timestamp: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  errorInfo?: any;
  platform: string;
  userAgent?: string;
  url?: string;
  deviceInfo: {
    platform: string;
    version?: string;
  };
  userId?: string;
  sessionId?: string;
  appVersion?: string;
  buildNumber?: string;
}

export interface JSError {
  message: string;
  source?: string;
  lineno?: number;
  colno?: number;
  error?: Error;
}

class CrashLogger {
  private static instance: CrashLogger;
  private sessionId: string;
  private userId?: string;
  private appVersion?: string;
  private buildNumber?: string;

  private constructor() {
    this.sessionId = Date.now().toString();
    this.setupGlobalErrorHandlers();
  }

  public static getInstance(): CrashLogger {
    if (!CrashLogger.instance) {
      CrashLogger.instance = new CrashLogger();
    }
    return CrashLogger.instance;
  }

  public setUserInfo(userId: string, appVersion?: string, buildNumber?: string) {
    this.userId = userId;
    this.appVersion = appVersion;
    this.buildNumber = buildNumber;
  }

  private setupGlobalErrorHandlers() {
    if (Platform.OS === 'web') {
      window.addEventListener('error', (event) => {
        this.logJSError({
          message: event.message,
          source: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error,
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.logError(new Error(`Unhandled Promise Rejection: ${event.reason}`));
      });
    } else {
      const originalConsoleError = console.error;
      console.error = (...args) => {
        if (args.length > 0 && typeof args[0] === 'string') {
          const message = args.join(' ');
          if (message.includes('Error:') || message.includes('TypeError:') || message.includes('ReferenceError:')) {
            this.logError(new Error(message));
          }
        }
        originalConsoleError.apply(console, args);
      };
    }
  }

  public async logError(error: Error, errorInfo?: any, additionalData?: Record<string, any>) {
    try {
      const crashLog: CrashLog = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
        userId: this.userId,
        sessionId: this.sessionId,
        appVersion: this.appVersion,
        buildNumber: this.buildNumber,
        ...additionalData,
      };

      await this.storeCrashLog(crashLog);
      console.log('Crash logged:', crashLog.id, error.message);
      
      return crashLog;
    } catch (logError) {
      console.error('Failed to log crash:', logError);
      return null;
    }
  }

  public async logJSError(jsError: JSError) {
    const error = jsError.error || new Error(jsError.message);
    const additionalData = {
      source: jsError.source,
      lineno: jsError.lineno,
      colno: jsError.colno,
    };
    
    return this.logError(error, null, additionalData);
  }

  private async storeCrashLog(crashLog: CrashLog) {
    try {
      const existingLogs = await AsyncStorage.getItem('crash_logs');
      const logs: CrashLog[] = existingLogs ? JSON.parse(existingLogs) : [];
      
      logs.push(crashLog);
      
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      await AsyncStorage.setItem('crash_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to store crash log:', error);
    }
  }

  public async getCrashLogs(): Promise<CrashLog[]> {
    try {
      const logs = await AsyncStorage.getItem('crash_logs');
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Failed to retrieve crash logs:', error);
      return [];
    }
  }

  public async clearCrashLogs(): Promise<void> {
    try {
      await AsyncStorage.removeItem('crash_logs');
      console.log('Crash logs cleared');
    } catch (error) {
      console.error('Failed to clear crash logs:', error);
    }
  }

  public async exportCrashLogs(): Promise<string> {
    try {
      const logs = await this.getCrashLogs();
      return JSON.stringify(logs, null, 2);
    } catch (error) {
      console.error('Failed to export crash logs:', error);
      return '[]';
    }
  }

  public async sendCrashReport(crashLog: CrashLog, userEmail?: string, userMessage?: string): Promise<boolean> {
    try {
      const reportData = {
        ...crashLog,
        userEmail,
        userMessage,
        reportedAt: new Date().toISOString(),
      };
      
      console.log('Crash report to send:', reportData);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Failed to send crash report:', error);
      return false;
    }
  }
}

export const crashLogger = CrashLogger.getInstance();

export const logError = (error: Error, errorInfo?: any, additionalData?: Record<string, any>) => {
  return crashLogger.logError(error, errorInfo, additionalData);
};

export const logJSError = (jsError: JSError) => {
  return crashLogger.logJSError(jsError);
};

export const getCrashLogs = () => {
  return crashLogger.getCrashLogs();
};

export const clearCrashLogs = () => {
  return crashLogger.clearCrashLogs();
};

export const exportCrashLogs = () => {
  return crashLogger.exportCrashLogs();
};

export const sendCrashReport = (crashLog: CrashLog, userEmail?: string, userMessage?: string) => {
  return crashLogger.sendCrashReport(crashLog, userEmail, userMessage);
};