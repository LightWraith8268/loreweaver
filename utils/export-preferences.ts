import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseService, type ExportPreferences } from '@/services/firebase-advanced';

const DEFAULT_EXPORT_PREFERENCES: ExportPreferences = {
  format: 'json',
  includeImages: true,
  includeSnapshots: false,
  includePrivateNotes: false,
  compression: 'none',
  customFields: [],
  lastUsedFormats: ['json'],
  autoExportEnabled: false,
};

class ExportPreferencesManager {
  private static instance: ExportPreferencesManager;
  private userId?: string;
  private syncEnabled: boolean = false;

  private constructor() {}

  public static getInstance(): ExportPreferencesManager {
    if (!ExportPreferencesManager.instance) {
      ExportPreferencesManager.instance = new ExportPreferencesManager();
    }
    return ExportPreferencesManager.instance;
  }

  public setUserInfo(userId: string) {
    this.userId = userId;
  }

  public enableSync(enabled: boolean) {
    this.syncEnabled = enabled;
  }

  public async getExportPreferences(): Promise<ExportPreferences> {
    try {
      // Get local preferences
      const localPrefs = await AsyncStorage.getItem('export_preferences');
      let preferences: ExportPreferences = localPrefs 
        ? { ...DEFAULT_EXPORT_PREFERENCES, ...JSON.parse(localPrefs) }
        : DEFAULT_EXPORT_PREFERENCES;

      // Get Firebase preferences if sync is enabled and user is authenticated
      if (this.syncEnabled && this.userId) {
        try {
          const firebasePrefs = await firebaseService.getExportPreferences();
          if (firebasePrefs) {
            preferences = { ...preferences, ...firebasePrefs };
          }
        } catch (syncError) {
          console.error('Failed to get Firebase export preferences:', syncError);
        }
      }

      return preferences;
    } catch (error) {
      console.error('Failed to get export preferences:', error);
      return DEFAULT_EXPORT_PREFERENCES;
    }
  }

  public async updateExportPreferences(updates: Partial<ExportPreferences>): Promise<void> {
    try {
      const current = await this.getExportPreferences();
      const updated = { ...current, ...updates };

      // Save locally
      await AsyncStorage.setItem('export_preferences', JSON.stringify(updated));

      // Sync to Firebase if enabled and user is authenticated
      if (this.syncEnabled && this.userId) {
        try {
          await firebaseService.syncExportPreferences(updated);
        } catch (syncError) {
          console.error('Failed to sync export preferences:', syncError);
        }
      }
    } catch (error) {
      console.error('Failed to update export preferences:', error);
    }
  }

  public async addUsedFormat(format: string): Promise<void> {
    const preferences = await this.getExportPreferences();
    const lastUsedFormats = [...preferences.lastUsedFormats];
    
    // Remove if already exists and add to front
    const index = lastUsedFormats.indexOf(format);
    if (index > -1) {
      lastUsedFormats.splice(index, 1);
    }
    lastUsedFormats.unshift(format);
    
    // Keep only last 5 formats
    if (lastUsedFormats.length > 5) {
      lastUsedFormats.splice(5);
    }

    await this.updateExportPreferences({
      format: format as ExportPreferences['format'],
      lastUsedFormats
    });
  }

  public async clearPreferences(): Promise<void> {
    try {
      await AsyncStorage.removeItem('export_preferences');
      console.log('Export preferences cleared');
    } catch (error) {
      console.error('Failed to clear export preferences:', error);
    }
  }

  public async resetToDefaults(): Promise<void> {
    await this.updateExportPreferences(DEFAULT_EXPORT_PREFERENCES);
  }
}

export const exportPreferencesManager = ExportPreferencesManager.getInstance();

export const getExportPreferences = () => {
  return exportPreferencesManager.getExportPreferences();
};

export const updateExportPreferences = (updates: Partial<ExportPreferences>) => {
  return exportPreferencesManager.updateExportPreferences(updates);
};

export const addUsedFormat = (format: string) => {
  return exportPreferencesManager.addUsedFormat(format);
};

export const resetExportPreferences = () => {
  return exportPreferencesManager.resetToDefaults();
};

export const clearExportPreferences = () => {
  return exportPreferencesManager.clearPreferences();
};