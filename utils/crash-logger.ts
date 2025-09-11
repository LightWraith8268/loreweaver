import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, DeviceEventEmitter } from 'react-native';
import { firebaseService } from '@/services/firebase-advanced';
import * as FileSystem from 'expo-file-system';

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
    model?: string;
    brand?: string;
    systemVersion?: string;
    manufacturer?: string;
  };
  userId?: string;
  sessionId?: string;
  appVersion?: string;
  buildNumber?: string;
  buildType?: 'development' | 'preview' | 'production';
  memoryInfo?: {
    usedJSHeapSize?: number;
    totalJSHeapSize?: number;
    jsHeapSizeLimit?: number;
  };
  nativeStackTrace?: string;
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
  private syncEnabled: boolean = false;
  private logFileDirectory?: string;
  private enableFileLogging: boolean = false;

  private constructor() {
    this.sessionId = Date.now().toString();
    this.setupGlobalErrorHandlers();
    this.setupNativeErrorHandlers();
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

  public enableSync(enabled: boolean) {
    this.syncEnabled = enabled;
  }

  public enableFileLogs(enabled: boolean, customDirectory?: string) {
    this.enableFileLogging = enabled;
    
    if (enabled && Platform.OS !== 'web') {
      // Set default directory or use custom one
      this.logFileDirectory = customDirectory || 
        `${FileSystem.documentDirectory}crash-logs/`;
      
      // Ensure directory exists
      this.ensureLogDirectoryExists();
    }
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
      // Set up React Native error reporting
      const ErrorUtils = require('ErrorUtils');
      const originalGlobalHandler = ErrorUtils.getGlobalHandler();

      ErrorUtils.setGlobalHandler((error: Error, isFatal: boolean) => {
        console.error('Global Error Handler:', error, 'isFatal:', isFatal);
        this.logError(error, { isFatal, source: 'global' });
        originalGlobalHandler(error, isFatal);
      });

      // Also capture console.error for additional logging
      const originalConsoleError = console.error;
      console.error = (...args) => {
        if (args.length > 0 && typeof args[0] === 'string') {
          const message = args.join(' ');
          if (message.includes('Error:') || message.includes('TypeError:') || message.includes('ReferenceError:')) {
            this.logError(new Error(message), { source: 'console' });
          }
        }
        originalConsoleError.apply(console, args);
      };
    }
  }

  private setupNativeErrorHandlers() {
    if (Platform.OS === 'android') {
      try {
        // Listen for native crashes (if available)
        const subscription = DeviceEventEmitter.addListener('RCTLog', (log: any) => {
          if (log.level === 'error' || log.level === 'fatal') {
            this.logError(new Error(`Native Error: ${log.message}`), { 
              source: 'native',
              level: log.level,
              tag: log.tag 
            });
          }
        });

        // Store subscription for cleanup if needed
        (this as any).nativeErrorSubscription = subscription;
      } catch (error) {
        console.warn('Could not set up native error handlers:', error);
      }
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
        deviceInfo: await this.getDeviceInfo(),
        buildType: this.getBuildType(),
        memoryInfo: this.getMemoryInfo(),
        userId: this.userId,
        sessionId: this.sessionId,
        appVersion: this.appVersion,
        buildNumber: this.buildNumber,
        ...additionalData,
      };

      await this.storeCrashLog(crashLog);
      
      // Write to log file if enabled
      if (this.enableFileLogging && Platform.OS !== 'web') {
        await this.writeToLogFile(crashLog);
      }
      
      // Sync to Firebase if enabled and user is authenticated
      if (this.syncEnabled && this.userId) {
        try {
          await firebaseService.syncCrashLog(crashLog);
        } catch (syncError) {
          console.error('Failed to sync crash log:', syncError);
        }
      }
      
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
      // Get local logs
      const localLogs = await AsyncStorage.getItem('crash_logs');
      const logs: CrashLog[] = localLogs ? JSON.parse(localLogs) : [];
      
      // Get Firebase logs if sync is enabled and user is authenticated
      if (this.syncEnabled && this.userId) {
        try {
          const firebaseLogs = await firebaseService.getCrashLogs();
          
          // Merge and deduplicate logs
          const allLogs = [...logs, ...firebaseLogs];
          const uniqueLogs = allLogs.filter((log, index, self) => 
            index === self.findIndex(l => l.id === log.id)
          );
          
          return uniqueLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        } catch (syncError) {
          console.error('Failed to get Firebase crash logs:', syncError);
        }
      }
      
      return logs;
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

  private async getDeviceInfo() {
    try {
      if (Platform.OS === 'web') {
        return {
          platform: Platform.OS,
          version: Platform.Version?.toString(),
          userAgent: navigator.userAgent,
        };
      } else if (Platform.OS === 'android') {
        // Try to get device info from React Native
        const deviceInfo = {
          platform: Platform.OS,
          version: Platform.Version?.toString(),
        };

        try {
          // Try to import expo-constants for additional device info
          const Constants = require('expo-constants').default;
          return {
            ...deviceInfo,
            brand: Constants.platform?.android?.brand,
            manufacturer: Constants.platform?.android?.manufacturer,
            model: Constants.deviceName,
            systemVersion: Constants.systemVersion,
          };
        } catch {
          // Fallback if expo-constants not available
          return deviceInfo;
        }
      } else {
        return {
          platform: Platform.OS,
          version: Platform.Version?.toString(),
        };
      }
    } catch (error) {
      return {
        platform: Platform.OS,
        version: Platform.Version?.toString(),
      };
    }
  }

  private getBuildType(): 'development' | 'preview' | 'production' {
    if (__DEV__) {
      return 'development';
    }
    
    try {
      // Check for EAS Build environment variables or constants
      const Constants = require('expo-constants').default;
      if (Constants.executionEnvironment === 'storeClient') {
        return 'production';
      } else if (Constants.executionEnvironment === 'standalone') {
        return 'preview';
      }
    } catch {
      // Fallback if expo-constants not available
    }
    
    return 'production';
  }

  private getMemoryInfo() {
    try {
      if (Platform.OS === 'web' && (window as any).performance && (window as any).performance.memory) {
        const memory = (window as any).performance.memory;
        return {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        };
      }
    } catch (error) {
      console.warn('Could not get memory info:', error);
    }
    return undefined;
  }

  private async ensureLogDirectoryExists() {
    if (!this.logFileDirectory || Platform.OS === 'web') return;
    
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.logFileDirectory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.logFileDirectory, { intermediates: true });
        console.log('Created crash log directory:', this.logFileDirectory);
      }
    } catch (error) {
      console.error('Failed to create crash log directory:', error);
    }
  }

  private async writeToLogFile(crashLog: CrashLog) {
    if (!this.logFileDirectory || Platform.OS === 'web') return;
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `crash-${timestamp}-${crashLog.id}.log`;
      const filePath = `${this.logFileDirectory}${fileName}`;
      
      // Format log entry for file
      const logEntry = this.formatLogEntry(crashLog);
      
      await FileSystem.writeAsStringAsync(filePath, logEntry);
      console.log('Crash log written to file:', filePath);
      
      // Also append to a master log file
      await this.appendToMasterLog(crashLog, logEntry);
      
    } catch (error) {
      console.error('Failed to write crash log to file:', error);
    }
  }

  private async appendToMasterLog(crashLog: CrashLog, logEntry: string) {
    if (!this.logFileDirectory) return;
    
    try {
      const masterLogPath = `${this.logFileDirectory}crash-log-master.log`;
      const shortEntry = `${crashLog.timestamp} | ${crashLog.error.name}: ${crashLog.error.message} | ${crashLog.buildType} | ${crashLog.deviceInfo.platform} ${crashLog.deviceInfo.version}\n`;
      
      // Check if master log exists and append or create
      const masterLogInfo = await FileSystem.getInfoAsync(masterLogPath);
      if (masterLogInfo.exists) {
        const existingContent = await FileSystem.readAsStringAsync(masterLogPath);
        await FileSystem.writeAsStringAsync(masterLogPath, existingContent + shortEntry);
      } else {
        // Create new master log with header
        const header = `# LoreWeaver Crash Log Master File\n# Generated on ${new Date().toISOString()}\n# Format: Timestamp | Error | Build Type | Platform\n\n`;
        await FileSystem.writeAsStringAsync(masterLogPath, header + shortEntry);
      }
    } catch (error) {
      console.error('Failed to append to master log:', error);
    }
  }

  private formatLogEntry(crashLog: CrashLog): string {
    const sections = [];
    
    // Header
    sections.push(`========== CRASH LOG ==========`);
    sections.push(`ID: ${crashLog.id}`);
    sections.push(`Timestamp: ${crashLog.timestamp}`);
    sections.push(`Session ID: ${crashLog.sessionId}`);
    sections.push('');
    
    // Error Information
    sections.push('--- ERROR DETAILS ---');
    sections.push(`Type: ${crashLog.error.name}`);
    sections.push(`Message: ${crashLog.error.message}`);
    if (crashLog.error.stack) {
      sections.push('Stack Trace:');
      sections.push(crashLog.error.stack);
    }
    sections.push('');
    
    // Environment Information
    sections.push('--- ENVIRONMENT ---');
    sections.push(`Platform: ${crashLog.platform}`);
    sections.push(`Build Type: ${crashLog.buildType}`);
    sections.push(`App Version: ${crashLog.appVersion || 'Unknown'}`);
    sections.push(`Build Number: ${crashLog.buildNumber || 'Unknown'}`);
    sections.push('');
    
    // Device Information
    sections.push('--- DEVICE INFO ---');
    Object.entries(crashLog.deviceInfo).forEach(([key, value]) => {
      if (value !== undefined) {
        sections.push(`${key}: ${value}`);
      }
    });
    sections.push('');
    
    // Additional Info
    if (crashLog.errorInfo) {
      sections.push('--- ERROR CONTEXT ---');
      sections.push(JSON.stringify(crashLog.errorInfo, null, 2));
      sections.push('');
    }
    
    if (crashLog.memoryInfo) {
      sections.push('--- MEMORY INFO ---');
      Object.entries(crashLog.memoryInfo).forEach(([key, value]) => {
        sections.push(`${key}: ${value}`);
      });
      sections.push('');
    }
    
    if (crashLog.userAgent) {
      sections.push('--- USER AGENT ---');
      sections.push(crashLog.userAgent);
      sections.push('');
    }
    
    if (crashLog.url) {
      sections.push('--- URL ---');
      sections.push(crashLog.url);
      sections.push('');
    }
    
    sections.push(`========== END LOG ==========\n\n`);
    
    return sections.join('\n');
  }

  public async getLogFilesDirectory(): Promise<string | null> {
    return this.logFileDirectory || null;
  }

  public async clearLogFiles(): Promise<void> {
    if (!this.logFileDirectory || Platform.OS === 'web') return;
    
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.logFileDirectory);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(this.logFileDirectory, { idempotent: true });
        await this.ensureLogDirectoryExists();
        console.log('Cleared crash log files');
      }
    } catch (error) {
      console.error('Failed to clear crash log files:', error);
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

export const enableFileLogs = (enabled: boolean, customDirectory?: string) => {
  return crashLogger.enableFileLogs(enabled, customDirectory);
};

export const getLogFilesDirectory = () => {
  return crashLogger.getLogFilesDirectory();
};

export const clearLogFiles = () => {
  return crashLogger.clearLogFiles();
};