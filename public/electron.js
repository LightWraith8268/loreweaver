const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

// Early crash logging setup - before anything else
function setupEarlyCrashLogging() {
  const fs = require('fs');
  
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    logStartupCrash(error, 'uncaughtException');
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    logStartupCrash(new Error(`Unhandled Promise Rejection: ${reason}`), 'unhandledRejection');
    process.exit(1);
  });
}

function logStartupCrash(error, type) {
  try {
    const fs = require('fs');
    
    let crashLogsDir;
    if (isDev) {
      const appPath = app.getAppPath();
      crashLogsDir = path.join(appPath, 'logs');
    } else {
      const execPath = process.execPath;
      const appDir = path.dirname(execPath);
      crashLogsDir = path.join(appDir, 'logs');
    }

    // Ensure directory exists
    fs.mkdirSync(crashLogsDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `startup-crash-${timestamp}.log`;
    const filePath = path.join(crashLogsDir, filename);

    const crashLog = `========== ELECTRON STARTUP CRASH ==========
Timestamp: ${new Date().toISOString()}
Type: ${type}
Error Name: ${error.name}
Error Message: ${error.message}
Stack Trace:
${error.stack}

Environment:
- Platform: ${process.platform}
- Architecture: ${process.arch}
- Node Version: ${process.version}
- Electron Version: ${process.versions.electron}
- Chrome Version: ${process.versions.chrome}
- App Path: ${app.getAppPath()}
- Executable Path: ${process.execPath}
- Working Directory: ${process.cwd()}
- isDev: ${isDev}

Command Line Arguments:
${process.argv.join('\n')}

Environment Variables:
${Object.keys(process.env).filter(key => key.includes('ELECTRON') || key.includes('NODE')).map(key => `${key}=${process.env[key]}`).join('\n')}
`;

    fs.writeFileSync(filePath, crashLog);
    console.log(`Startup crash logged to: ${filePath}`);
  } catch (logError) {
    console.error('Failed to log startup crash:', logError);
  }
}

// Initialize early crash logging
setupEarlyCrashLogging();

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/images/icon.png'),
    titleBarStyle: 'default',
    show: false
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:8083' 
    : `file://${path.join(__dirname, '../web-build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Open DevTools in development
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // On macOS, keep app running when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // Re-create window on macOS when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// IPC handlers for file operations
ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-platform', () => {
  return process.platform;
});

// Crash logging IPC handlers
ipcMain.handle('write-crash-log', async (event, filename, content) => {
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    let crashLogsDir;
    
    if (isDev) {
      // In development, use project root directory
      const appPath = app.getAppPath();
      crashLogsDir = path.join(appPath, 'logs');
    } else {
      // In production, use directory where executable is located
      const execPath = process.execPath;
      const appDir = path.dirname(execPath);
      crashLogsDir = path.join(appDir, 'logs');
    }
    
    // Ensure directory exists
    await fs.mkdir(crashLogsDir, { recursive: true });
    
    const filePath = path.join(crashLogsDir, filename);
    await fs.writeFile(filePath, content, 'utf8');
    
    return { success: true, path: filePath };
  } catch (error) {
    console.error('Failed to write crash log:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-crash-logs-directory', () => {
  const path = require('path');
  
  if (isDev) {
    // In development, use project root directory
    const appPath = app.getAppPath();
    return path.join(appPath, 'logs');
  } else {
    // In production, use directory where executable is located
    const execPath = process.execPath;
    const appDir = path.dirname(execPath);
    return path.join(appDir, 'logs');
  }
});

// Enhanced crash log handler that can append to existing files
ipcMain.handle('append-crash-log', async (event, filename, content) => {
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    let crashLogsDir;
    
    if (isDev) {
      const appPath = app.getAppPath();
      crashLogsDir = path.join(appPath, 'logs');
    } else {
      const execPath = process.execPath;
      const appDir = path.dirname(execPath);
      crashLogsDir = path.join(appDir, 'logs');
    }
    
    await fs.mkdir(crashLogsDir, { recursive: true });
    const filePath = path.join(crashLogsDir, filename);
    
    // Check if file exists and append, otherwise create with content
    try {
      const existingContent = await fs.readFile(filePath, 'utf8');
      await fs.writeFile(filePath, existingContent + content, 'utf8');
    } catch (readError) {
      // File doesn't exist, create it
      if (filename === 'crash-log-master.log') {
        // Add header for master log
        const header = `# LoreWeaver Crash Log Master File\n# Generated on ${new Date().toISOString()}\n# Format: Timestamp | Severity | Category | Error | Build Type | Platform\n\n`;
        await fs.writeFile(filePath, header + content, 'utf8');
      } else {
        await fs.writeFile(filePath, content, 'utf8');
      }
    }
    
    return { success: true, path: filePath };
  } catch (error) {
    console.error('Failed to append crash log:', error);
    return { success: false, error: error.message };
  }
});

// Handle file protocol for development
if (isDev) {
  try {
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
      hardResetMethod: 'exit'
    });
  } catch (e) {
    // electron-reload is optional for development
    console.log('electron-reload not available, continuing without auto-reload');
  }
}