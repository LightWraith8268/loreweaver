const { app, BrowserWindow, ipcMain, dialog, shell, protocol, Menu } = require('electron');
const path = require('path');

// Safely determine if we're in development
let isDev = false;
try {
  isDev = require('electron-is-dev');
} catch (error) {
  // If electron-is-dev fails to load, use fallback detection
  isDev = process.env.NODE_ENV === 'development' || 
          process.defaultApp || 
          /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || 
          /[\\/]electron[\\/]/.test(process.execPath);
}

let mainWindow;
let hasWorldSelected = false;

// Menu management functions
function createApplicationMenu(worldSelected = false) {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Select World',
          click: () => navigateToRoute('/world-select')
        },
        {
          type: 'separator'
        },
        {
          label: 'Import World',
          enabled: true,
          click: () => {
            // TODO: Implement import functionality
            console.log('Import world clicked');
          }
        },
        {
          label: 'Export World',
          enabled: worldSelected,
          click: () => {
            // TODO: Implement export functionality
            console.log('Export world clicked');
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Settings',
          click: () => navigateToRoute('/settings')
        },
        {
          type: 'separator'
        },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Navigate',
      submenu: [
        {
          label: 'Dashboard',
          accelerator: 'Ctrl+1',
          click: () => navigateToRoute('/(tabs)')
        },
        {
          type: 'separator'
        },
        {
          label: 'Projects',
          accelerator: 'Ctrl+2',
          click: () => navigateToRoute('/(tabs)/projects')
        },
        {
          label: 'Entities',
          accelerator: 'Ctrl+3',
          enabled: worldSelected,
          click: () => navigateToRoute('/(tabs)/entities')
        },
        {
          label: 'World Systems',
          accelerator: 'Ctrl+4',
          enabled: worldSelected,
          click: () => navigateToRoute('/(tabs)/world-systems')
        },
        {
          label: 'Content',
          accelerator: 'Ctrl+5',
          enabled: worldSelected,
          click: () => navigateToRoute('/(tabs)/content')
        },
        {
          label: 'Tools',
          accelerator: 'Ctrl+6',
          enabled: worldSelected,
          click: () => navigateToRoute('/(tabs)/tools')
        },
        {
          label: 'Settings',
          accelerator: 'Ctrl+7',
          click: () => navigateToRoute('/(tabs)/app-settings')
        }
      ]
    },
    {
      label: 'Entities',
      submenu: [
        {
          label: 'Characters',
          enabled: worldSelected,
          click: () => navigateToRoute('/(tabs)/characters')
        },
        {
          label: 'Locations',
          enabled: worldSelected,
          click: () => navigateToRoute('/(tabs)/locations')
        },
        {
          label: 'Factions',
          enabled: worldSelected,
          click: () => navigateToRoute('/(tabs)/factions')
        },
        {
          label: 'Items',
          enabled: worldSelected,
          click: () => navigateToRoute('/(tabs)/items')
        },
        {
          label: 'Organizations',
          enabled: worldSelected,
          click: () => navigateToRoute('/(tabs)/organizations')
        },
        {
          label: 'Species',
          enabled: worldSelected,
          click: () => navigateToRoute('/(tabs)/species')
        },
        {
          label: 'Artifacts',
          enabled: worldSelected,
          click: () => navigateToRoute('/(tabs)/artifacts')
        }
      ]
    },
    {
      label: 'World Systems',
      submenu: [
        {
          label: 'Magic Systems',
          enabled: worldSelected,
          click: () => navigateToRoute('/(tabs)/magic')
        },
        {
          label: 'Mythology',
          enabled: worldSelected,
          click: () => navigateToRoute('/(tabs)/mythology')
        },
        {
          label: 'Timeline',
          enabled: worldSelected,
          click: () => navigateToRoute('/(tabs)/timeline')
        },
        {
          label: 'Relationships',
          enabled: worldSelected,
          click: () => navigateToRoute('/(tabs)/relationships')
        }
      ]
    },
    {
      label: 'Advanced Tools',
      submenu: [
        {
          label: 'Meta Tools',
          enabled: worldSelected,
          click: () => navigateToRoute('/(tabs)/meta-tools')
        },
        {
          label: 'Bonus Content',
          enabled: worldSelected,
          click: () => navigateToRoute('/(tabs)/bonus')
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Actual Size',
          accelerator: 'CmdOrCtrl+0',
          click: (item, focusedWindow) => {
            if (focusedWindow) focusedWindow.webContents.setZoomLevel(0);
          }
        },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          click: (item, focusedWindow) => {
            if (focusedWindow) {
              const currentZoom = focusedWindow.webContents.getZoomLevel();
              focusedWindow.webContents.setZoomLevel(currentZoom + 0.5);
            }
          }
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: (item, focusedWindow) => {
            if (focusedWindow) {
              const currentZoom = focusedWindow.webContents.getZoomLevel();
              focusedWindow.webContents.setZoomLevel(currentZoom - 0.5);
            }
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Toggle Fullscreen',
          accelerator: process.platform === 'darwin' ? 'Ctrl+Cmd+F' : 'F11',
          click: (item, focusedWindow) => {
            if (focusedWindow) {
              focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
            }
          }
        }
      ]
    },
    {
      label: 'Developer',
      submenu: [
        {
          label: 'View Crash Logs',
          accelerator: 'CmdOrCtrl+Shift+L',
          click: () => {
            if (mainWindow && mainWindow.webContents) {
              const openCrashLogsScript = `
                (function() {
                  try {
                    console.log('Opening crash logs from menu');
                    
                    // Dispatch custom event to open crash logs
                    window.dispatchEvent(new CustomEvent('electron-open-crash-logs', {
                      detail: { source: 'menu' }
                    }));
                    
                    console.log('Crash logs menu event dispatched');
                  } catch (error) {
                    console.error('Failed to open crash logs:', error);
                  }
                })();
              `;
              
              mainWindow.webContents.executeJavaScript(openCrashLogsScript).catch(err => {
                console.error('Failed to execute crash logs script:', err);
              });
            }
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Open Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'F12',
          click: (item, focusedWindow) => {
            if (focusedWindow) focusedWindow.toggleDevTools();
          }
        },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: (item, focusedWindow) => {
            if (focusedWindow) focusedWindow.reload();
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About LoreWeaver',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About LoreWeaver',
              message: 'LoreWeaver',
              detail: `Version: ${app.getVersion()}\nAI Worldbuilding Hub for writers, game masters, and creators\n\nBuilt with Electron and React Native Web`
            });
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Learn More',
          click: () => shell.openExternal('https://github.com/LightWraith8268/loreweaver')
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        {
          label: 'About ' + app.getName(),
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About LoreWeaver',
              message: 'LoreWeaver',
              detail: `Version: ${app.getVersion()}\nAI Worldbuilding Hub for writers, game masters, and creators`
            });
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Services',
          role: 'services',
          submenu: []
        },
        {
          type: 'separator'
        },
        {
          label: 'Hide ' + app.getName(),
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Alt+H',
          role: 'hideothers'
        },
        {
          label: 'Show All',
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => app.quit()
        }
      ]
    });
  }

  return Menu.buildFromTemplate(template);
}

function navigateToRoute(route) {
  if (mainWindow && mainWindow.webContents) {
    // Navigate using React Router by injecting navigation JavaScript
    const navigationScript = `
      (function() {
        try {
          console.log('Navigating to route:', '${route}');
          
          if (window.location.hash !== '#${route}') {
            window.location.hash = '#${route}';
          }
          
          // Also try React Router navigation if available
          if (window.__REACT_ROUTER_HISTORY__) {
            window.__REACT_ROUTER_HISTORY__.push('${route}');
          }
          
          // Expo Router navigation
          if (window.expo && window.expo.modules && window.expo.modules.Router) {
            window.expo.modules.Router.push('${route}');
          }
          
          // Dispatch a custom event that the React app can listen for
          window.dispatchEvent(new CustomEvent('electron-navigate', {
            detail: { route: '${route}' }
          }));
          
          console.log('Navigation completed successfully');
        } catch (navError) {
          console.error('Navigation error:', navError);
          // Force reload to home if navigation fails
          if ('${route}' === '/') {
            window.location.reload();
          }
        }
      })();
    `;
    
    mainWindow.webContents.executeJavaScript(navigationScript).catch(err => {
      console.error('Navigation failed:', err);
      // If we can't navigate, try to reload the page
      if (route === '/') {
        mainWindow.webContents.reload();
      }
    });
  }
}

function forceNavigateToHome() {
  if (mainWindow && mainWindow.webContents) {
    console.log('Force navigating to home screen...');
    
    const forceHomeScript = `
      (function() {
        try {
          console.log('Forcing navigation to home screen');
          
          // Clear any error states
          sessionStorage.clear();
          localStorage.removeItem('lastRoute');
          
          // Multiple navigation strategies
          window.location.hash = '#/';
          
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, null, '#/');
          }
          
          // React Router fallback
          if (window.__REACT_ROUTER_HISTORY__) {
            window.__REACT_ROUTER_HISTORY__.replace('/');
          }
          
          // Expo Router fallback
          if (window.expo && window.expo.modules && window.expo.modules.Router) {
            window.expo.modules.Router.replace('/');
          }
          
          // Custom event for React app
          window.dispatchEvent(new CustomEvent('force-home-navigation', {
            detail: { forced: true, timestamp: Date.now() }
          }));
          
          console.log('Forced navigation to home completed');
        } catch (error) {
          console.error('Force navigation failed, reloading:', error);
          window.location.reload();
        }
      })();
    `;
    
    mainWindow.webContents.executeJavaScript(forceHomeScript).catch(err => {
      console.error('Force navigation failed, performing hard reload:', err);
      mainWindow.webContents.reloadIgnoringCache();
    });
  }
}

function updateMenuWorldState(worldSelected) {
  hasWorldSelected = worldSelected;
  const menu = createApplicationMenu(worldSelected);
  Menu.setApplicationMenu(menu);
}

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
      // In development, use current working directory
      crashLogsDir = path.join(process.cwd(), 'logs');
    } else {
      // In production, use directory where executable is located
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
- Electron Version: ${process.versions.electron || 'unknown'}
- Chrome Version: ${process.versions.chrome || 'unknown'}
- Executable Path: ${process.execPath}
- Working Directory: ${process.cwd()}
- isDev: ${isDev}
- App Ready: ${app ? app.isReady() : 'app not available'}

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
    : `file://${path.join(process.resourcesPath, 'dist/index.html')}`;
  
  // Always ensure we start with home route
  const homeUrl = startUrl + (startUrl.includes('#') ? '' : '#/');
  mainWindow.loadURL(homeUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Force navigation to home screen after load
    setTimeout(() => {
      forceNavigateToHome();
    }, 2000);
    
    // Open DevTools in development
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Enhanced error logging for renderer process
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer ${level}] ${message} (${sourceId}:${line})`);
    
    // Log errors and warnings to crash log
    if (level >= 2) { // Error level
      try {
        const logEntry = `[${new Date().toISOString()}] RENDERER ERROR: ${message} at ${sourceId}:${line}\n`;
        logStartupCrash(new Error(message), `renderer-error-safe`);
      } catch (logError) {
        console.error('Failed to log renderer error:', logError);
      }
    }
  });

  // Capture renderer process crashes
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('Renderer process crashed:', details);
    const crashData = {
      reason: details.reason,
      exitCode: details.exitCode,
      timestamp: new Date().toISOString()
    };
    logStartupCrash(new Error(`Renderer process crashed: ${details.reason}`), 'renderer-process-crash');
    
    // Force restart to home screen after crash
    setTimeout(() => {
      console.log('Reloading after renderer crash...');
      const homeUrl = isDev 
        ? 'http://localhost:8083#/' 
        : `file://${path.join(process.resourcesPath, 'dist/index.html')}#/`;
      mainWindow.loadURL(homeUrl);
    }, 1000);
  });

  // Handle page load errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Page failed to load:', errorCode, errorDescription, validatedURL);
    
    // If it's not a simple navigation error, force navigate to home
    if (errorCode !== -3) { // -3 is ERR_ABORTED (user navigation)
      console.log('Force navigating to home due to load failure');
      setTimeout(() => forceNavigateToHome(), 500);
    }
  });

  // Capture page errors and unhandled exceptions from React app
  mainWindow.webContents.executeJavaScript(`
    window.addEventListener('error', (event) => {
      console.error('JavaScript Error:', event.error);
      if (window.electronAPI && window.electronAPI.appendCrashLog) {
        const errorLog = \`[\${new Date().toISOString()}] JS ERROR: \${event.error.message} at \${event.filename}:\${event.lineno}:\${event.colno}
Stack: \${event.error.stack}

\`;
        window.electronAPI.appendCrashLog('javascript-errors.log', errorLog);
      }
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      if (window.electronAPI && window.electronAPI.appendCrashLog) {
        const errorLog = \`[\${new Date().toISOString()}] UNHANDLED REJECTION: \${event.reason}

\`;
        window.electronAPI.appendCrashLog('javascript-errors.log', errorLog);
      }
    });

    // Override console.error to capture all error messages
    const originalConsoleError = console.error;
    console.error = function(...args) {
      originalConsoleError.apply(console, args);
      if (window.electronAPI && window.electronAPI.appendCrashLog) {
        const errorLog = \`[\${new Date().toISOString()}] CONSOLE ERROR: \${args.join(' ')}

\`;
        window.electronAPI.appendCrashLog('console-errors.log', errorLog);
      }
    };

    // React error boundary fallback
    window.addEventListener('DOMContentLoaded', () => {
      console.log('React app loading...');
      setTimeout(() => {
        const rootElement = document.getElementById('root');
        if (rootElement && rootElement.children.length === 0) {
          console.error('React app failed to mount - root element is empty');
          if (window.electronAPI && window.electronAPI.appendCrashLog) {
            window.electronAPI.appendCrashLog('react-mount-error.log', \`[\${new Date().toISOString()}] React app failed to mount - root element is empty\n\`);
          }
        } else {
          console.log('React app mounted successfully');
        }
      }, 3000);
    });
  `, true).catch(err => {
    console.error('Failed to inject error handling:', err);
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
app.whenReady().then(() => {
  createWindow();
  
  // Initialize the menu
  const initialMenu = createApplicationMenu(false);
  Menu.setApplicationMenu(initialMenu);
});

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
      // In development, use current working directory
      crashLogsDir = path.join(process.cwd(), 'logs');
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
    // In development, use current working directory
    return path.join(process.cwd(), 'logs');
  } else {
    // In production, use directory where executable is located
    const execPath = process.execPath;
    const appDir = path.dirname(execPath);
    return path.join(appDir, 'logs');
  }
});

// Menu management IPC handlers
ipcMain.handle('update-world-state', (event, worldSelected) => {
  console.log('World state updated:', worldSelected);
  updateMenuWorldState(worldSelected);
  return { success: true };
});

ipcMain.handle('get-world-state', () => {
  return hasWorldSelected;
});

// Enhanced crash log handler that can append to existing files
ipcMain.handle('append-crash-log', async (event, filename, content) => {
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    let crashLogsDir;
    
    if (isDev) {
      // In development, use current working directory
      crashLogsDir = path.join(process.cwd(), 'logs');
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