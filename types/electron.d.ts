export interface ElectronAPI {
  showSaveDialog: (options: any) => Promise<any>;
  showOpenDialog: (options: any) => Promise<any>;
  getAppVersion: () => Promise<string>;
  getPlatform: () => Promise<string>;
  isElectron: boolean;
  writeCrashLog: (filename: string, content: string) => Promise<{success: boolean, path?: string, error?: string}>;
  appendCrashLog: (filename: string, content: string) => Promise<{success: boolean, path?: string, error?: string}>;
  getCrashLogsDirectory: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};