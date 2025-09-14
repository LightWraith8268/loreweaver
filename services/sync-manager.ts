import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseService, type DocumentWithSync } from './firebase-advanced';
import { conflictResolver, type ConflictResolution } from './conflict-resolver';
import type { World, Character, Location, Faction, Item, LoreNote, MagicSystem, Mythology, Timeline } from '@/types/world';

export type SyncableEntity = World | Character | Location | Faction | Item | LoreNote | MagicSystem | Mythology | Timeline;
export type SyncableEntityType = 'worlds' | 'characters' | 'locations' | 'factions' | 'items' | 'loreNotes' | 'magicSystems' | 'mythologies' | 'timelines';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingChanges: number;
  conflictsCount: number;
  syncEnabled: boolean;
}

export interface SyncConflict<T extends Record<string, any> = any> {
  id: string;
  entityType: SyncableEntityType;
  local: DocumentWithSync<T>;
  remote: DocumentWithSync<T>;
  resolution?: ConflictResolution<T>;
  timestamp: Date;
}

export interface SyncSettings {
  enabled: boolean;
  autoSync: boolean;
  syncInterval: number; // minutes
  conflictResolution: 'ask' | 'local-wins' | 'remote-wins' | 'auto-merge';
  maxOfflineChanges: number;
  compressSync: boolean;
}

export class SyncManager {
  private listeners: Map<string, (status: SyncStatus) => void> = new Map();
  private syncStatus: SyncStatus = {
    isOnline: true,
    isSyncing: false,
    lastSyncTime: null,
    pendingChanges: 0,
    conflictsCount: 0,
    syncEnabled: false
  };
  
  private pendingOperations: Map<string, {
    type: 'create' | 'update' | 'delete';
    entityType: SyncableEntityType;
    data: any;
    timestamp: Date;
  }> = new Map();

  private conflicts: SyncConflict[] = [];
  private settings: SyncSettings = {
    enabled: false,
    autoSync: true,
    syncInterval: 5,
    conflictResolution: 'ask',
    maxOfflineChanges: 100,
    compressSync: true
  };

  constructor() {
    this.loadSettings();
    this.startAutoSync();
  }

  // Settings Management
  async loadSettings(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('syncSettings');
      if (stored) {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
        this.syncStatus.syncEnabled = this.settings.enabled;
      }
    } catch (error) {
      console.error('Failed to load sync settings:', error);
    }
  }

  async updateSettings(newSettings: Partial<SyncSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    this.syncStatus.syncEnabled = this.settings.enabled;
    
    try {
      await AsyncStorage.setItem('syncSettings', JSON.stringify(this.settings));
      this.notifyListeners();
      
      if (this.settings.enabled && newSettings.enabled) {
        this.syncAll();
      }
    } catch (error) {
      console.error('Failed to save sync settings:', error);
    }
  }

  // Status Management
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  addStatusListener(id: string, callback: (status: SyncStatus) => void): void {
    this.listeners.set(id, callback);
    callback(this.getSyncStatus());
  }

  removeStatusListener(id: string): void {
    this.listeners.delete(id);
  }

  private notifyListeners(): void {
    const status = this.getSyncStatus();
    this.listeners.forEach(callback => callback(status));
  }

  // Core Sync Operations

  async syncAll(): Promise<void> {
    if (!this.settings.enabled || this.syncStatus.isSyncing) return;

    this.syncStatus.isSyncing = true;
    this.notifyListeners();

    try {
      // Sync each entity type
      const entityTypes: SyncableEntityType[] = [
        'worlds', 'characters', 'locations', 'factions', 
        'items', 'loreNotes', 'magicSystems', 'mythologies', 'timelines'
      ];

      for (const entityType of entityTypes) {
        await this.syncEntityType(entityType);
      }

      // Process pending operations
      await this.processPendingOperations();

      this.syncStatus.lastSyncTime = new Date();
      await AsyncStorage.setItem('lastSyncTime', this.syncStatus.lastSyncTime.toISOString());

    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncStatus.isSyncing = false;
      this.notifyListeners();
    }
  }

  async syncEntityType(entityType: SyncableEntityType): Promise<void> {
    try {
      // Get local data
      const localData = await this.getLocalData<any>(entityType);
      
      // Get remote data
      const remoteData = await firebaseService.getCollection<any>(entityType);

      // Detect conflicts
      const conflicts = await this.detectConflicts(localData, remoteData, entityType);
      
      if (conflicts.length > 0) {
        await this.handleConflicts(conflicts);
      }

      // Sync non-conflicting changes
      await this.syncNonConflictingChanges(localData, remoteData, entityType);

    } catch (error) {
      console.error(`Failed to sync ${entityType}:`, error);
    }
  }

  private async getLocalData<T extends Record<string, any> & { id: string; updatedAt?: string; createdAt?: string }>(entityType: SyncableEntityType): Promise<DocumentWithSync<T>[]> {
    try {
      const data = await AsyncStorage.getItem(entityType);
      const parsed = data ? JSON.parse(data) : [];
      
      // Convert local data to sync format (add sync metadata)
      return parsed.map((item: T) => ({
        ...item,
        _sync: {
          lastModified: new Date(item.updatedAt || item.createdAt || Date.now()),
          modifiedBy: 'local',
          version: 1,
          deviceId: 'local',
          changeVector: `local_${item.id}_${Date.now()}`
        }
      }));
    } catch (error) {
      console.error(`Failed to get local ${entityType}:`, error);
      return [];
    }
  }

  private async detectConflicts<T extends { id: string }>(
    localData: DocumentWithSync<T>[],
    remoteData: DocumentWithSync<T>[],
    entityType: SyncableEntityType
  ): Promise<SyncConflict<T>[]> {
    const conflicts: SyncConflict<T>[] = [];
    
    for (const localDoc of localData) {
      const remoteDoc = remoteData.find(r => r.id === localDoc.id);
      
      if (remoteDoc) {
        // Check for conflicts
        if (localDoc._sync.changeVector !== remoteDoc._sync.changeVector) {
          conflicts.push({
            id: localDoc.id,
            entityType,
            local: localDoc,
            remote: remoteDoc,
            timestamp: new Date()
          });
        }
      }
    }

    this.conflicts.push(...conflicts);
    this.syncStatus.conflictsCount = this.conflicts.length;
    this.notifyListeners();
    
    return conflicts;
  }

  private async handleConflicts<T extends { id: string }>(conflicts: SyncConflict<T>[]): Promise<void> {
    for (const conflict of conflicts) {
      try {
        let resolution: ConflictResolution<T>;

        switch (this.settings.conflictResolution) {
          case 'auto-merge':
            resolution = await conflictResolver.resolveConflict(
              conflict.local,
              conflict.remote,
              undefined,
              'merge'
            );
            break;
          case 'local-wins':
            resolution = await conflictResolver.resolveConflict(
              conflict.local,
              conflict.remote,
              undefined,
              'local-wins'
            );
            break;
          case 'remote-wins':
            resolution = await conflictResolver.resolveConflict(
              conflict.local,
              conflict.remote,
              undefined,
              'remote-wins'
            );
            break;
          case 'ask':
          default:
            // Store conflict for manual resolution
            conflict.resolution = await conflictResolver.resolveConflict(
              conflict.local,
              conflict.remote,
              undefined,
              'manual'
            );
            continue;
        }

        // Apply resolution
        await this.applyConflictResolution(conflict, resolution);
        
      } catch (error) {
        console.error(`Failed to resolve conflict for ${conflict.id}:`, error);
      }
    }
  }

  private async applyConflictResolution<T extends { id: string }>(
    conflict: SyncConflict<T>,
    resolution: ConflictResolution<T>
  ): Promise<void> {
    try {
      // Update both local and remote with resolved data
      const resolvedData = resolution.result;
      
      // Update local storage
      await this.updateLocalData(conflict.entityType, resolvedData);
      
      // Update remote
      await firebaseService.updateDocument(conflict.entityType, resolvedData);
      
      // Remove from conflicts
      this.conflicts = this.conflicts.filter(c => c.id !== conflict.id);
      this.syncStatus.conflictsCount = this.conflicts.length;
      
    } catch (error) {
      console.error('Failed to apply conflict resolution:', error);
    }
  }

  private async syncNonConflictingChanges<T extends { id: string }>(
    localData: DocumentWithSync<T>[],
    remoteData: DocumentWithSync<T>[],
    entityType: SyncableEntityType
  ): Promise<void> {
    // Find items that exist in local but not remote (new local items)
    for (const localDoc of localData) {
      const remoteDoc = remoteData.find(r => r.id === localDoc.id);
      if (!remoteDoc) {
        // Create in remote
        await firebaseService.createDocument(entityType, localDoc);
      }
    }

    // Find items that exist in remote but not local (new remote items)
    for (const remoteDoc of remoteData) {
      const localDoc = localData.find(l => l.id === remoteDoc.id);
      if (!localDoc) {
        // Add to local
        await this.updateLocalData(entityType, remoteDoc);
      }
    }
  }

  private async updateLocalData<T extends { id: string }>(
    entityType: SyncableEntityType,
    data: T
  ): Promise<void> {
    try {
      const existing = await this.getLocalData(entityType);
      const updated = existing.filter(item => item.id !== data.id);
      updated.push(data as any);
      
      await AsyncStorage.setItem(entityType, JSON.stringify(updated));
    } catch (error) {
      console.error(`Failed to update local ${entityType}:`, error);
    }
  }

  // Offline Operations Queue

  async queueOperation(
    type: 'create' | 'update' | 'delete',
    entityType: SyncableEntityType,
    data: any
  ): Promise<void> {
    const operation = {
      type,
      entityType,
      data,
      timestamp: new Date()
    };

    const operationId = `${entityType}_${data.id}_${Date.now()}`;
    this.pendingOperations.set(operationId, operation);
    
    this.syncStatus.pendingChanges = this.pendingOperations.size;
    this.notifyListeners();

    // Try to sync immediately if online
    if (this.syncStatus.isOnline && this.settings.enabled) {
      this.processPendingOperations();
    }

    // Save pending operations to storage
    await this.savePendingOperations();
  }

  private async processPendingOperations(): Promise<void> {
    for (const [operationId, operation] of this.pendingOperations) {
      try {
        switch (operation.type) {
          case 'create':
            await firebaseService.createDocument(operation.entityType, operation.data);
            break;
          case 'update':
            await firebaseService.updateDocument(operation.entityType, operation.data);
            break;
          case 'delete':
            await firebaseService.deleteDocument(operation.entityType, operation.data.id);
            break;
        }
        
        this.pendingOperations.delete(operationId);
      } catch (error) {
        console.error(`Failed to process operation ${operationId}:`, error);
      }
    }

    this.syncStatus.pendingChanges = this.pendingOperations.size;
    this.notifyListeners();
    
    await this.savePendingOperations();
  }

  private async savePendingOperations(): Promise<void> {
    try {
      const operations = Array.from(this.pendingOperations.entries());
      await AsyncStorage.setItem('pendingOperations', JSON.stringify(operations));
    } catch (error) {
      console.error('Failed to save pending operations:', error);
    }
  }

  private async loadPendingOperations(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem('pendingOperations');
      if (data) {
        const operations = JSON.parse(data);
        this.pendingOperations = new Map(operations);
        this.syncStatus.pendingChanges = this.pendingOperations.size;
      }
    } catch (error) {
      console.error('Failed to load pending operations:', error);
    }
  }

  // Auto-sync
  private startAutoSync(): void {
    if (this.settings.autoSync && this.settings.enabled) {
      setInterval(() => {
        if (this.syncStatus.isOnline && !this.syncStatus.isSyncing) {
          this.syncAll();
        }
      }, this.settings.syncInterval * 60 * 1000);
    }
  }

  // Manual Conflict Resolution
  getConflicts(): SyncConflict[] {
    return [...this.conflicts];
  }

  async resolveConflict<T extends { id: string }>(
    conflictId: string,
    resolution: ConflictResolution<T>
  ): Promise<void> {
    const conflict = this.conflicts.find(c => c.id === conflictId);
    if (conflict) {
      await this.applyConflictResolution(conflict, resolution);
    }
  }

  // Network Status
  setOnlineStatus(isOnline: boolean): void {
    this.syncStatus.isOnline = isOnline;
    this.notifyListeners();
    
    if (isOnline && this.settings.enabled && this.pendingOperations.size > 0) {
      this.processPendingOperations();
    }
  }

  // Migration from local-only to sync
  async migrateToSync(): Promise<void> {
    if (!this.settings.enabled) return;

    try {
      this.syncStatus.isSyncing = true;
      this.notifyListeners();

      // Get migration status
      const migrationStatus = await firebaseService.getMigrationStatus();
      
      if (!migrationStatus.hasRemoteData && migrationStatus.hasLocalData) {
        // First sync - upload all local data
        await this.uploadAllLocalData();
      } else {
        // Normal sync
        await this.syncAll();
      }

    } finally {
      this.syncStatus.isSyncing = false;
      this.notifyListeners();
    }
  }

  private async uploadAllLocalData(): Promise<void> {
    const entityTypes: SyncableEntityType[] = [
      'worlds', 'characters', 'locations', 'factions', 
      'items', 'loreNotes', 'magicSystems', 'mythologies', 'timelines'
    ];

    for (const entityType of entityTypes) {
      const localData = await this.getLocalData(entityType);
      
      const operations = localData.map(item => ({
        type: 'create' as const,
        collection: entityType,
        id: item.id,
        data: item
      }));

      if (operations.length > 0) {
        await firebaseService.batchWrite(operations);
      }
    }
  }
}

export const syncManager = new SyncManager();