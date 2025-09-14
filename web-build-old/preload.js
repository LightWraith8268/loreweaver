const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  
  // Check if running in Electron
  isElectron: true,
  
  // Crash logging for Electron
  writeCrashLog: (filename, content) => ipcRenderer.invoke('write-crash-log', filename, content),
  appendCrashLog: (filename, content) => ipcRenderer.invoke('append-crash-log', filename, content),
  getCrashLogsDirectory: () => ipcRenderer.invoke('get-crash-logs-directory'),
  
  // Enhanced error reporting
  logError: (error, context = '') => {
    const errorLog = `[${new Date().toISOString()}] ERROR${context ? ` (${context})` : ''}: ${error.message || error}
Stack: ${error.stack || 'No stack trace available'}
User Agent: ${navigator.userAgent}
URL: ${window.location.href}

`;
    return ipcRenderer.invoke('append-crash-log', 'electron-errors.log', errorLog);
  }
});