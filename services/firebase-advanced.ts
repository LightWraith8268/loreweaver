import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  writeBatch,
  runTransaction,
  Timestamp,
  DocumentReference,
  DocumentSnapshot,
  QuerySnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { CrashLog } from '@/utils/crash-logger';
import { securityManager } from '@/utils/security';
import { checkInternetConnection } from '@/utils/network';
import { firestore, auth, storage } from '@/firebase.config';
import type { World, Character, Location, Faction, Item, MagicSystem, Mythology, LoreNote, Timeline, Series, Book, Chapter, AppSettings, AISettings, VoiceCapture } from '@/types/world';

export interface ExportPreferences {
  format: 'json' | 'pdf' | 'docx' | 'txt';
  includeImages: boolean;
  includeSnapshots: boolean;
  includePrivateNotes: boolean;
  compression: 'none' | 'zip' | 'gzip';
  customFields: string[];
  templateId?: string;
  lastUsedFormats: string[];
  autoExportEnabled: boolean;
  exportSchedule?: 'daily' | 'weekly' | 'monthly';
}

export interface SyncMetadata {
  lastModified: Timestamp;
  modifiedBy: string;
  version: number;
  deviceId: string;
  changeVector: string;
  conflictResolved?: boolean;
}

export type DocumentWithSync<T extends Record<string, any>> = T & {
  _sync: SyncMetadata;
};

export interface UserData {
  settings: AppSettings;
  aiSettings: AISettings;
  series: Series[];
  books: Book[];
  voiceRecordings: VoiceCapture[];
  exportPreferences: any;
  crashLogs: any[];
}

export interface EncryptedField {
  encrypted: string;
  salt: string;
}

export class AdvancedFirebaseService {
  private userId: string | null = null;
  private deviceId: string;
  private listeners: Map<string, () => void> = new Map();

  constructor() {
    this.deviceId = this.generateDeviceId();
    
    // Listen for auth changes
    auth.onAuthStateChanged((user) => {
      this.userId = user?.uid || null;
    });
  }

  private generateDeviceId(): string {
    return 'device_' + Math.random().toString(36).substr(2, 9);
  }

  private getUserCollection(collectionName: string) {
    if (!this.userId) {
      throw new Error('User not authenticated');
    }
    return collection(firestore, 'users', this.userId, collectionName);
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substring(2);
  }

  private createSyncMetadata(): SyncMetadata {
    return {
      lastModified: serverTimestamp() as Timestamp,
      modifiedBy: this.userId || 'anonymous',
      version: 1,
      deviceId: this.deviceId,
      changeVector: this.generateChangeVector(),
    };
  }

  private generateChangeVector(): string {
    return `${this.deviceId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async ensureNetworkConnection(): Promise<void> {
    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      throw new Error('Network connection required for sync operations. Please check your internet connection.');
    }
  }

  private async retryOperation<T>(
    operation: () => Promise<T>, 
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error = new Error('Unknown error');
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Check network connection before retry
        try {
          await this.ensureNetworkConnection();
        } catch (networkError) {
          throw networkError; // Don't retry if network is down
        }
      }
    }
    
    throw new Error(`Operation failed after ${maxRetries + 1} attempts: ${lastError.message}`);
  }

  private async getDocumentWithConflictCheck<T extends Record<string, any>>(
    docRef: DocumentReference, 
    expectedVersion?: number
  ): Promise<DocumentWithSync<T> | null> {
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;

    const data = docSnap.data() as DocumentWithSync<T>;
    
    // Check for version conflicts
    if (expectedVersion && data._sync.version !== expectedVersion) {
      throw new Error(`Version conflict: expected ${expectedVersion}, got ${data._sync.version}`);
    }

    return data;
  }

  // Advanced CRUD Operations with Conflict Detection

  async createDocument<T extends Record<string, any> & { id: string }>(
    collectionName: string, 
    data: T
  ): Promise<DocumentWithSync<T>> {
    await this.ensureNetworkConnection();
    
    return await this.retryOperation(async () => {
      const docRef = doc(this.getUserCollection(collectionName), data.id);
      const docWithSync: DocumentWithSync<T> = {
        ...data,
        _sync: this.createSyncMetadata()
      };

      await setDoc(docRef, docWithSync);
      return docWithSync;
    });
  }

  async updateDocument<T extends Record<string, any> & { id: string }>(
    collectionName: string, 
    data: Partial<T> & { id: string },
    expectedVersion?: number
  ): Promise<DocumentWithSync<T>> {
    await this.ensureNetworkConnection();
    
    return await this.retryOperation(async () => {
      const docRef = doc(this.getUserCollection(collectionName), data.id);
    
    return await runTransaction(firestore, async (transaction) => {
      const docSnap = await transaction.get(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Document does not exist');
      }

      const existingData = docSnap.data() as DocumentWithSync<T>;
      
      // Version conflict check
      if (expectedVersion && existingData._sync.version !== expectedVersion) {
        throw new Error(`Version conflict: expected ${expectedVersion}, got ${existingData._sync.version}`);
      }

      const updatedData: DocumentWithSync<T> = {
        ...existingData,
        ...data,
        _sync: {
          ...existingData._sync,
          lastModified: serverTimestamp() as Timestamp,
          modifiedBy: this.userId || 'anonymous',
          version: existingData._sync.version + 1,
          deviceId: this.deviceId,
          changeVector: this.generateChangeVector(),
        }
      };

      transaction.set(docRef, updatedData);
      return updatedData;
    });
    });
  }

  async deleteDocument(collectionName: string, id: string): Promise<void> {
    await this.ensureNetworkConnection();
    
    return await this.retryOperation(async () => {
      const docRef = doc(this.getUserCollection(collectionName), id);
      await deleteDoc(docRef);
    });
  }

  async getDocument<T extends Record<string, any>>(collectionName: string, id: string): Promise<DocumentWithSync<T> | null> {
    await this.ensureNetworkConnection();
    
    return await this.retryOperation(async () => {
      const docRef = doc(this.getUserCollection(collectionName), id);
      return await this.getDocumentWithConflictCheck<T>(docRef);
    });
  }

  async getCollection<T extends Record<string, any>>(
    collectionName: string, 
    orderByField?: string,
    filters?: Array<{ field: string; operator: any; value: any }>
  ): Promise<DocumentWithSync<T>[]> {
    let q = query(this.getUserCollection(collectionName));

    // Apply filters
    if (filters) {
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });
    }

    // Apply ordering
    if (orderByField) {
      q = query(q, orderBy(orderByField));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as DocumentWithSync<T>);
  }

  // Real-time Listeners with Advanced Features

  subscribeToCollection<T extends Record<string, any>>(
    collectionName: string,
    callback: (data: DocumentWithSync<T>[], changes: { type: string; doc: DocumentWithSync<T> }[]) => void,
    options?: { includeMetadataChanges?: boolean }
  ): string {
    const q = query(this.getUserCollection(collectionName), orderBy('_sync.lastModified', 'desc'));
    const listenerId = `${collectionName}_${Date.now()}`;

    const unsubscribe = onSnapshot(
      q, 
      { includeMetadataChanges: options?.includeMetadataChanges || true },
      (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data() as DocumentWithSync<T>);
        const changes = snapshot.docChanges().map(change => ({
          type: change.type,
          doc: change.doc.data() as DocumentWithSync<T>
        }));

        callback(data, changes);
      },
      (error) => {
        console.error(`Error in ${collectionName} listener:`, error);
      }
    );

    this.listeners.set(listenerId, unsubscribe);
    return listenerId;
  }

  subscribeToDocument<T extends Record<string, any>>(
    collectionName: string,
    id: string,
    callback: (data: DocumentWithSync<T> | null) => void
  ): string {
    const docRef = doc(this.getUserCollection(collectionName), id);
    const listenerId = `${collectionName}_${id}_${Date.now()}`;

    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        const data = doc.exists() ? doc.data() as DocumentWithSync<T> : null;
        callback(data);
      },
      (error) => {
        console.error(`Error in ${collectionName}/${id} listener:`, error);
      }
    );

    this.listeners.set(listenerId, unsubscribe);
    return listenerId;
  }

  unsubscribe(listenerId: string): void {
    const unsubscribe = this.listeners.get(listenerId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(listenerId);
    }
  }

  unsubscribeAll(): void {
    this.listeners.forEach((unsubscribe) => unsubscribe());
    this.listeners.clear();
  }

  // Batch Operations for Performance

  async batchWrite(operations: Array<{
    type: 'create' | 'update' | 'delete';
    collection: string;
    id: string;
    data?: any;
  }>): Promise<void> {
    const batch = writeBatch(firestore);

    for (const operation of operations) {
      const docRef = doc(this.getUserCollection(operation.collection), operation.id);

      switch (operation.type) {
        case 'create':
        case 'update':
          const docWithSync = {
            ...operation.data,
            _sync: this.createSyncMetadata()
          };
          batch.set(docRef, docWithSync);
          break;
        case 'delete':
          batch.delete(docRef);
          break;
      }
    }

    await batch.commit();
  }

  // Conflict Resolution Helpers

  async detectConflicts<T extends Record<string, any> & { id: string }>(
    collectionName: string, 
    localData: DocumentWithSync<T>[]
  ): Promise<Array<{
    local: DocumentWithSync<T>;
    remote: DocumentWithSync<T>;
    conflictType: 'version' | 'concurrent' | 'deleted';
  }>> {
    const conflicts: Array<{
      local: DocumentWithSync<T>;
      remote: DocumentWithSync<T>;
      conflictType: 'version' | 'concurrent' | 'deleted';
    }> = [];

    for (const localDoc of localData) {
      const remoteDoc = await this.getDocument<T>(collectionName, localDoc.id);
      
      if (!remoteDoc) {
        // Document was deleted remotely
        continue;
      }

      // Check for version conflicts
      if (localDoc._sync.version !== remoteDoc._sync.version) {
        conflicts.push({
          local: localDoc,
          remote: remoteDoc,
          conflictType: 'version'
        });
      }
      // Check for concurrent modifications
      else if (localDoc._sync.changeVector !== remoteDoc._sync.changeVector) {
        conflicts.push({
          local: localDoc,
          remote: remoteDoc,
          conflictType: 'concurrent'
        });
      }
    }

    return conflicts;
  }

  // Data Migration and Sync Status

  async getMigrationStatus(): Promise<{
    hasLocalData: boolean;
    hasRemoteData: boolean;
    lastSyncTime?: Timestamp;
  }> {
    // Check if user has remote data
    const worldsCollection = this.getUserCollection('worlds');
    const worldsSnapshot = await getDocs(query(worldsCollection));
    const hasRemoteData = !worldsSnapshot.empty;

    // This would check AsyncStorage for local data
    // Implementation depends on the existing local storage structure

    return {
      hasLocalData: false, // Will be implemented based on existing AsyncStorage check
      hasRemoteData,
    };
  }

  // User Settings Management
  async syncUserSettings(settings: AppSettings): Promise<void> {
    if (!this.userId) throw new Error('User not authenticated');
    
    await setDoc(doc(firestore, 'users', this.userId, 'data', 'settings'), {
      ...settings,
      _sync: this.createSyncMetadata()
    });
  }

  async getUserSettings(): Promise<AppSettings | null> {
    if (!this.userId) return null;
    
    const docRef = doc(firestore, 'users', this.userId, 'data', 'settings');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      delete data._sync;
      return data as AppSettings;
    }
    return null;
  }

  // AI Settings with Encryption
  async syncAISettings(aiSettings: AISettings): Promise<void> {
    if (!this.userId) throw new Error('User not authenticated');
    
    // Encrypt sensitive API keys
    const encryptedSettings = await this.encryptSensitiveData(aiSettings);
    
    await setDoc(doc(firestore, 'users', this.userId, 'data', 'aiSettings'), {
      ...encryptedSettings,
      _sync: this.createSyncMetadata()
    });
  }

  async getAISettings(): Promise<AISettings | null> {
    if (!this.userId) return null;
    
    const docRef = doc(firestore, 'users', this.userId, 'data', 'aiSettings');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      delete data._sync;
      // Decrypt sensitive data
      return await this.decryptSensitiveData(data as any) as AISettings;
    }
    return null;
  }

  // Series Management
  async createSeries(series: Omit<Series, 'id' | 'createdAt' | 'updatedAt'>): Promise<Series> {
    if (!this.userId) throw new Error('User not authenticated');
    
    const newSeries: Series = {
      ...series,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await this.createDocument('series', newSeries);
    return newSeries;
  }

  async updateSeries(id: string, updates: Partial<Series>): Promise<void> {
    const updateData = {
      id,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await this.updateDocument('series', updateData);
  }

  async deleteSeries(id: string): Promise<void> {
    await this.deleteDocument('series', id);
  }

  async getUserSeries(): Promise<Series[]> {
    if (!this.userId) return [];
    
    const querySnapshot = await getDocs(
      collection(firestore, 'users', this.userId, 'series')
    );
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Series));
  }

  // Books Management
  async createBook(book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Promise<Book> {
    if (!this.userId) throw new Error('User not authenticated');
    
    const newBook: Book = {
      ...book,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await this.createDocument('books', newBook);
    return newBook;
  }

  async updateBook(id: string, updates: Partial<Book>): Promise<void> {
    const updateData = {
      id,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await this.updateDocument('books', updateData);
  }

  async deleteBook(id: string): Promise<void> {
    await this.deleteDocument('books', id);
  }

  async getUserBooks(seriesId?: string): Promise<Book[]> {
    if (!this.userId) return [];
    
    let q = query(
      collection(firestore, 'books'),
      where('userId', '==', this.userId)
    );
    
    if (seriesId) {
      q = query(q, where('seriesId', '==', seriesId));
    }
    
    q = query(q, orderBy('updatedAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book));
  }

  // Voice Recordings Management
  async syncVoiceRecording(recording: VoiceCapture, audioBlob?: Blob): Promise<void> {
    if (!this.userId) throw new Error('User not authenticated');
    
    let audioUrl = recording.audioUrl;
    
    // Upload audio to Firebase Storage if blob provided
    if (audioBlob) {
      const storageRef = ref(storage, `voice-recordings/${this.userId}/${recording.id}.webm`);
      const uploadResult = await uploadBytes(storageRef, audioBlob);
      audioUrl = await getDownloadURL(uploadResult.ref);
    }
    
    const recordingWithUrl = {
      ...recording,
      audioUrl,
      userId: this.userId,
      _sync: this.createSyncMetadata()
    };
    
    await setDoc(doc(firestore, 'voiceRecordings', recording.id), recordingWithUrl);
  }

  async getUserVoiceRecordings(): Promise<VoiceCapture[]> {
    if (!this.userId) return [];
    
    const q = query(
      collection(firestore, 'voiceRecordings'),
      where('userId', '==', this.userId),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      delete data._sync;
      return data as VoiceCapture;
    });
  }

  // Export Preferences
  async syncExportPreferences(preferences: any): Promise<void> {
    if (!this.userId) throw new Error('User not authenticated');
    
    await setDoc(doc(firestore, 'users', this.userId, 'data', 'exportPreferences'), {
      ...preferences,
      _sync: this.createSyncMetadata()
    });
  }

  async getExportPreferences(): Promise<any> {
    if (!this.userId) return null;
    
    const docRef = doc(firestore, 'users', this.userId, 'data', 'exportPreferences');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      delete data._sync;
      return data;
    }
    return null;
  }

  // Crash Logs
  async syncCrashLog(crashLog: any): Promise<void> {
    if (!this.userId) return; // Don't require auth for crash logs
    
    const logId = crypto.randomUUID();
    await setDoc(doc(firestore, 'crashLogs', logId), {
      ...crashLog,
      userId: this.userId,
      timestamp: serverTimestamp(),
      _sync: this.createSyncMetadata()
    });
  }

  async getCrashLogs(): Promise<any[]> {
    if (!this.userId) return [];
    
    const querySnapshot = await getDocs(
      query(collection(firestore, 'crashLogs'), where('userId', '==', this.userId))
    );
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      delete data._sync;
      return data;
    });
  }



  // Enhanced encryption for sensitive data
  async encryptSensitiveData(data: any): Promise<any> {
    if (!data) return data;
    
    // Clone the data to avoid modifying the original
    const encrypted = { ...data };
    
    // Encrypt API keys in providers
    if (encrypted.providers) {
      for (const [provider, config] of Object.entries(encrypted.providers)) {
        if (config && typeof config === 'object' && (config as any).apiKey) {
          encrypted.providers[provider] = {
            ...config,
            apiKey: this.advancedEncrypt((config as any).apiKey)
          };
        }
      }
    }
    
    // Encrypt free keys if they exist
    if (encrypted.freeKeys) {
      for (const [provider, key] of Object.entries(encrypted.freeKeys)) {
        if (key && typeof key === 'string') {
          encrypted.freeKeys[provider] = this.advancedEncrypt(key);
        }
      }
    }
    
    return encrypted;
  }

  async decryptSensitiveData(encrypted: any): Promise<any> {
    if (!encrypted) return encrypted;
    
    // Clone the data
    const decrypted = { ...encrypted };
    
    // Decrypt API keys in providers
    if (decrypted.providers) {
      for (const [provider, config] of Object.entries(decrypted.providers)) {
        if (config && typeof config === 'object' && (config as any).apiKey) {
          decrypted.providers[provider] = {
            ...config,
            apiKey: this.advancedDecrypt((config as any).apiKey)
          };
        }
      }
    }
    
    // Decrypt free keys if they exist
    if (decrypted.freeKeys) {
      for (const [provider, key] of Object.entries(decrypted.freeKeys)) {
        if (key && typeof key === 'string') {
          decrypted.freeKeys[provider] = this.advancedDecrypt(key);
        }
      }
    }
    
    return decrypted;
  }

  private advancedEncrypt(text: string): string {
    if (!text) return text;
    
    try {
      // Multi-layer encryption: XOR + Caesar cipher + Base64
      // Use security manager's rotating key for enhanced security
      const baseKey = this.userId || 'fallback-key';
      const rotatingKey = securityManager.getKey('ai');
      const key = baseKey + rotatingKey;
      
      // Layer 1: Caesar cipher with dynamic shift
      const shift = key.length % 26;
      let caesarResult = '';
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char.match(/[a-zA-Z]/)) {
          const base = char >= 'A' && char <= 'Z' ? 65 : 97;
          caesarResult += String.fromCharCode((char.charCodeAt(0) - base + shift) % 26 + base);
        } else {
          caesarResult += char;
        }
      }
      
      // Layer 2: XOR with rotating key
      let xorResult = '';
      for (let i = 0; i < caesarResult.length; i++) {
        const keyChar = key[i % key.length];
        xorResult += String.fromCharCode(caesarResult.charCodeAt(i) ^ keyChar.charCodeAt(0));
      }
      
      // Layer 3: Base64 with checksum
      const checksum = this.generateChecksum(text);
      const payload = checksum + ':' + xorResult;
      
      return 'enc_v2:' + btoa(payload);
    } catch (error) {
      console.error('Encryption failed:', error);
      return this.simpleEncrypt(text); // Fallback to simple encryption
    }
  }

  private advancedDecrypt(encrypted: string): string {
    if (!encrypted) return encrypted;
    
    try {
      // Check if it's the new encryption format
      if (encrypted.startsWith('enc_v2:')) {
        const baseKey = this.userId || 'fallback-key';
        const rotatingKey = securityManager.getKey('ai');
        const key = baseKey + rotatingKey;
        const payload = atob(encrypted.substring(7));
        const [checksum, encryptedData] = payload.split(':', 2);
        
        if (!encryptedData) throw new Error('Invalid encrypted format');
        
        // Reverse Layer 2: XOR
        let xorResult = '';
        for (let i = 0; i < encryptedData.length; i++) {
          const keyChar = key[i % key.length];
          xorResult += String.fromCharCode(encryptedData.charCodeAt(i) ^ keyChar.charCodeAt(0));
        }
        
        // Reverse Layer 1: Caesar cipher
        const shift = key.length % 26;
        let result = '';
        for (let i = 0; i < xorResult.length; i++) {
          const char = xorResult[i];
          if (char.match(/[a-zA-Z]/)) {
            const base = char >= 'A' && char <= 'Z' ? 65 : 97;
            result += String.fromCharCode((char.charCodeAt(0) - base - shift + 26) % 26 + base);
          } else {
            result += char;
          }
        }
        
        // Verify checksum
        if (this.generateChecksum(result) !== checksum) {
          throw new Error('Checksum verification failed');
        }
        
        return result;
      } else {
        // Fallback to simple decryption for old format
        return this.simpleDecrypt(encrypted);
      }
    } catch (error) {
      console.error('Decryption failed:', error);
      return this.simpleDecrypt(encrypted); // Fallback to simple decryption
    }
  }

  private generateChecksum(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36).padStart(6, '0');
  }

  private simpleEncrypt(text: string): string {
    // Simple XOR encryption - use proper encryption in production
    const key = this.userId || 'default-key';
    let result = 'enc:';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result);
  }

  private simpleDecrypt(encrypted: string): string {
    try {
      const decoded = atob(encrypted);
      if (!decoded.startsWith('enc:')) return encrypted;
      
      const text = decoded.substring(4);
      const key = this.userId || 'default-key';
      let result = '';
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return result;
    } catch {
      return encrypted; // Return as-is if decryption fails
    }
  }
}

export const firebaseService = new AdvancedFirebaseService();