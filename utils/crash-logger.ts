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
  severity: 'fatal' | 'error' | 'warning' | 'info';
  category: 'crash' | 'error' | 'warning' | 'network' | 'performance' | 'react';
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
    this.setupConsoleInterception();
    this.setupUnhandledRejectionHandler();
    
    // Enable file logging on non-web platforms OR Electron
    if (Platform.OS !== 'web' || this.isElectron()) {
      this.enableFileLogging = true;
      
      if (this.isElectron()) {
        // Electron: Use IPC to get crash logs directory
        this.setupElectronLogging();
      } else {
        // Native: Use FileSystem
        this.logFileDirectory = `${FileSystem.documentDirectory}crash-logs/`;
        this.ensureLogDirectoryExists();
      }
    }
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

  private isElectron(): boolean {
    // Check if running in Electron environment
    return typeof window !== 'undefined' && 
           window.electronAPI && 
           window.electronAPI.isElectron === true;
  }

  private async setupElectronLogging(): Promise<void> {
    if (this.isElectron()) {
      try {
        this.logFileDirectory = await window.electronAPI.getCrashLogsDirectory();
      } catch (error) {
        console.warn('Failed to setup Electron crash logging:', error);
      }
    }
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
      try {
        const ErrorUtils = require('ErrorUtils');
        const originalGlobalHandler = ErrorUtils.getGlobalHandler();

        ErrorUtils.setGlobalHandler((error: Error, isFatal: boolean) => {
        console.error('Global Error Handler:', error, 'isFatal:', isFatal);
        this.logError(error, { isFatal, source: 'global' }, {}, isFatal ? 'fatal' : 'error', 'crash');
        originalGlobalHandler(error, isFatal);
      });
      } catch (error) {
        // ErrorUtils not available in this environment (EAS build)
        console.warn('ErrorUtils not available, skipping React Native global error handler');
      }

      // This will be handled by setupConsoleInterception
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
            }, {}, log.level === 'fatal' ? 'fatal' : 'error', 'crash');
          }
        });

        // Store subscription for cleanup if needed
        (this as any).nativeErrorSubscription = subscription;
      } catch (error) {
        console.warn('Could not set up native error handlers:', error);
      }
    }
  }

  private setupConsoleInterception() {
    // Intercept console.error
    const originalConsoleError = console.error;
    console.error = (...args) => {
      this.logConsoleMessage('error', args);
      originalConsoleError.apply(console, args);
    };

    // Intercept console.warn
    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
      this.logConsoleMessage('warn', args);
      originalConsoleWarn.apply(console, args);
    };

    // Store original methods for potential restoration
    (this as any).originalConsoleError = originalConsoleError;
    (this as any).originalConsoleWarn = originalConsoleWarn;
  }

  private setupUnhandledRejectionHandler() {
    if (Platform.OS === 'web') {
      // Already handled in setupGlobalErrorHandlers
      return;
    }

    // Set up tracking for unhandled promise rejections in React Native
    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
      const message = args.join(' ');
      if (message.includes('Possible Unhandled Promise Rejection')) {
        this.logError(
          new Error(`Unhandled Promise Rejection: ${message}`),
          { source: 'unhandledRejection', args },
          {},
          'warning',
          'error'
        );
      }
      originalConsoleWarn.apply(console, args);
    };
  }

  private logConsoleMessage(level: 'error' | 'warn', args: any[]) {
    try {
      const message = args.join(' ');
      
      // Skip logging our own crash logger messages to avoid recursion
      if (message.includes('Crash logged:') || 
          message.includes('Crash log written to file:') ||
          message.includes('Created crash log directory:')) {
        return;
      }

      // Determine if this looks like an error or just a regular log
      const isError = level === 'error' || 
        message.includes('Error:') || 
        message.includes('TypeError:') || 
        message.includes('ReferenceError:') ||
        message.includes('SyntaxError:') ||
        message.includes('RangeError:') ||
        message.includes('Cannot read property') ||
        message.includes('Cannot access before initialization') ||
        message.includes('is not a function') ||
        message.includes('is not defined');

      const isWarning = level === 'warn' ||
        message.includes('Warning:') ||
        message.includes('deprecated') ||
        message.includes('will be removed') ||
        message.includes('Performance warning') ||
        message.includes('Memory warning');

      // Only log significant console messages
      if (isError || isWarning) {
        const error = new Error(`Console ${level}: ${message}`);
        const severity = isError ? 'error' : 'warning';
        const category = this.categorizeConsoleMessage(message);

        this.logError(
          error,
          { 
            source: 'console',
            level,
            originalArgs: args,
            consoleMessage: true
          },
          {},
          severity,
          category
        );
      }
    } catch (error) {
      // Avoid infinite recursion if logging itself fails
    }
  }

  private categorizeConsoleMessage(message: string): 'crash' | 'error' | 'warning' | 'network' | 'performance' | 'react' {
    if (message.includes('Network') || message.includes('fetch') || message.includes('XMLHttpRequest')) {
      return 'network';
    }
    if (message.includes('Performance') || message.includes('Memory') || message.includes('slow')) {
      return 'performance';
    }
    if (message.includes('React') || message.includes('Component') || message.includes('Hook') || message.includes('render')) {
      return 'react';
    }
    if (message.includes('Error:') || message.includes('TypeError:') || message.includes('ReferenceError:')) {
      return 'error';
    }
    if (message.includes('Warning:') || message.includes('deprecated')) {
      return 'warning';
    }
    return 'error';
  }

  public async logError(
    error: Error, 
    errorInfo?: any, 
    additionalData?: Record<string, any>,
    severity: 'fatal' | 'error' | 'warning' | 'info' = 'error',
    category: 'crash' | 'error' | 'warning' | 'network' | 'performance' | 'react' = 'error'
  ) {
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
        severity,
        category,
        ...additionalData,
      };

      await this.storeCrashLog(crashLog);
      
      // Always write to log file on mobile platforms
      if (Platform.OS !== 'web') {
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

  public async logWarning(message: string, context?: any, category: 'warning' | 'network' | 'performance' | 'react' = 'warning') {
    const warning = new Error(message);
    warning.name = 'Warning';
    return this.logError(warning, context, {}, 'warning', category);
  }

  public async logInfo(message: string, context?: any, category: 'error' | 'warning' | 'network' | 'performance' | 'react' = 'warning') {
    const info = new Error(message);
    info.name = 'Info';
    return this.logError(info, context, {}, 'info', category);
  }

  public async logNetworkError(url: string, error: Error, requestInfo?: any) {
    const networkError = new Error(`Network Error: ${error.message} [${url}]`);
    networkError.name = 'NetworkError';
    return this.logError(
      networkError, 
      { url, requestInfo, originalError: error }, 
      {}, 
      'error', 
      'network'
    );
  }

  public async logPerformanceIssue(message: string, metrics?: any) {
    const perfError = new Error(`Performance Issue: ${message}`);
    perfError.name = 'PerformanceIssue';
    return this.logError(perfError, { metrics }, {}, 'warning', 'performance');
  }

  public async logReactError(component: string, error: Error, errorInfo?: any) {
    const reactError = new Error(`React Error in ${component}: ${error.message}`);
    reactError.name = 'ReactError';
    reactError.stack = error.stack;
    return this.logError(reactError, { component, errorInfo }, {}, 'error', 'react');
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
    if (Platform.OS === 'web') return;
    
    // Set up directory if not already set
    if (!this.logFileDirectory) {
      this.logFileDirectory = `${FileSystem.documentDirectory}crash-logs/`;
    }
    
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
    if (Platform.OS === 'web') return;
    
    // Ensure file logging is set up
    if (!this.logFileDirectory) {
      this.logFileDirectory = `${FileSystem.documentDirectory}crash-logs/`;
      await this.ensureLogDirectoryExists();
    }
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `crash-${timestamp}-${crashLog.id}.log`;
      const filePath = `${this.logFileDirectory}${fileName}`;
      
      // Format log entry for file
      const logEntry = this.formatLogEntry(crashLog);
      
      if (this.isElectron()) {
        // Use Electron IPC for file operations
        const result = await window.electronAPI.writeCrashLog(fileName, logEntry);
        if (result.success) {
          console.log('Crash log written to file:', result.path);
        } else {
          console.error('Failed to write crash log via Electron IPC:', result.error);
        }
      } else {
        // Use Expo FileSystem for native platforms
        await FileSystem.writeAsStringAsync(filePath, logEntry);
        console.log('Crash log written to file:', filePath);
      }
      
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
      const shortEntry = `${crashLog.timestamp} | ${crashLog.severity.toUpperCase()} | ${crashLog.category} | ${crashLog.error.name}: ${crashLog.error.message} | ${crashLog.buildType} | ${crashLog.deviceInfo.platform} ${crashLog.deviceInfo.version}\n`;
      
      if (this.isElectron()) {
        // For Electron, append to master log (file will be created with header if it doesn't exist)
        const result = await window.electronAPI.appendCrashLog('crash-log-master.log', shortEntry);
        if (!result.success) {
          console.error('Failed to append to master log via Electron IPC:', result.error);
        }
      } else {
        // Check if master log exists and append or create
        const masterLogInfo = await FileSystem.getInfoAsync(masterLogPath);
        if (masterLogInfo.exists) {
          const existingContent = await FileSystem.readAsStringAsync(masterLogPath);
          await FileSystem.writeAsStringAsync(masterLogPath, existingContent + shortEntry);
        } else {
          // Create new master log with header
          const header = `# LoreWeaver Crash Log Master File\n# Generated on ${new Date().toISOString()}\n# Format: Timestamp | Severity | Category | Error | Build Type | Platform\n\n`;
          await FileSystem.writeAsStringAsync(masterLogPath, header + shortEntry);
        }
      }
    } catch (error) {
      console.error('Failed to append to master log:', error);
    }
  }

  private formatLogEntry(crashLog: CrashLog): string {
    const sections = [];
    
    // Header
    sections.push(`========== ${crashLog.severity.toUpperCase()} LOG ==========`);
    sections.push(`ID: ${crashLog.id}`);
    sections.push(`Timestamp: ${crashLog.timestamp}`);
    sections.push(`Session ID: ${crashLog.sessionId}`);
    sections.push(`Severity: ${crashLog.severity}`);
    sections.push(`Category: ${crashLog.category}`);
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

export const logWarning = (message: string, context?: any, category?: 'warning' | 'network' | 'performance' | 'react') => {
  return crashLogger.logWarning(message, context, category);
};

export const logInfo = (message: string, context?: any, category?: 'error' | 'warning' | 'network' | 'performance' | 'react') => {
  return crashLogger.logInfo(message, context, category);
};

export const logNetworkError = (url: string, error: Error, requestInfo?: any) => {
  return crashLogger.logNetworkError(url, error, requestInfo);
};

export const logPerformanceIssue = (message: string, metrics?: any) => {
  return crashLogger.logPerformanceIssue(message, metrics);
};

export const logReactError = (component: string, error: Error, errorInfo?: any) => {
  return crashLogger.logReactError(component, error, errorInfo);
};