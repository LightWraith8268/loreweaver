import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SecurityConfig {
  enableEncryption: boolean;
  keyRotationInterval: number; // minutes
  maxFailedAttempts: number;
  lockoutDuration: number; // minutes
}

const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  enableEncryption: true,
  keyRotationInterval: 15,
  maxFailedAttempts: 3,
  lockoutDuration: 5,
};

class SecurityManager {
  private static instance: SecurityManager;
  private currentKeys: Map<string, string> = new Map();
  private keyRotationTimer?: number;
  private failedAttempts: Map<string, number> = new Map();
  private lockouts: Map<string, number> = new Map();

  private constructor() {
    this.initializeKeys();
    this.setupKeyRotation();
  }

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  private async initializeKeys() {
    try {
      const config = await this.getSecurityConfig();
      
      // Generate initial encryption keys for different data types
      const keyTypes = ['settings', 'ai', 'user_data', 'crash_logs', 'export_prefs'];
      for (const type of keyTypes) {
        this.currentKeys.set(type, this.generateSecureKey());
      }
    } catch (error) {
      console.error('Failed to initialize security keys:', error);
    }
  }

  private setupKeyRotation() {
    const config = this.getSecurityConfigSync();
    if (config.keyRotationInterval > 0) {
      this.keyRotationTimer = setInterval(() => {
        this.rotateKeys();
      }, config.keyRotationInterval * 60 * 1000) as unknown as number;
    }
  }

  private generateSecureKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private rotateKeys() {
    try {
      console.log('Rotating encryption keys for enhanced security...');
      for (const [type] of this.currentKeys) {
        this.currentKeys.set(type, this.generateSecureKey());
      }
    } catch (error) {
      console.error('Failed to rotate keys:', error);
    }
  }

  public getKey(keyType: string): string {
    return this.currentKeys.get(keyType) || this.generateSecureKey();
  }

  public async isUserLocked(userId: string): Promise<boolean> {
    const lockoutTime = this.lockouts.get(userId);
    if (!lockoutTime) return false;
    
    const config = await this.getSecurityConfig();
    const lockoutEnd = lockoutTime + (config.lockoutDuration * 60 * 1000);
    
    if (Date.now() > lockoutEnd) {
      // Lockout expired
      this.lockouts.delete(userId);
      this.failedAttempts.delete(userId);
      return false;
    }
    
    return true;
  }

  public async recordFailedAttempt(userId: string): Promise<boolean> {
    const config = await this.getSecurityConfig();
    const attempts = (this.failedAttempts.get(userId) || 0) + 1;
    this.failedAttempts.set(userId, attempts);
    
    if (attempts >= config.maxFailedAttempts) {
      this.lockouts.set(userId, Date.now());
      console.warn(`User ${userId} locked out due to too many failed attempts`);
      return true; // User is now locked
    }
    
    return false; // User not locked yet
  }

  public clearFailedAttempts(userId: string) {
    this.failedAttempts.delete(userId);
  }

  public sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') return data;
    
    const sanitized = { ...data };
    
    // Remove potentially sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'apiKey'];
    
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        delete sanitized[field];
      }
    }
    
    return sanitized;
  }

  public validateApiKey(apiKey: string): boolean {
    if (!apiKey || typeof apiKey !== 'string') return false;
    
    // Basic validation rules
    if (apiKey.length < 8) return false;
    if (apiKey === 'demo' || apiKey === 'test' || apiKey === 'default') return false;
    
    // Check for common patterns that indicate demo/test keys
    const demoPatterns = [
      /^demo/i,
      /^test/i,
      /^fake/i,
      /^mock/i,
      /^placeholder/i
    ];
    
    return !demoPatterns.some(pattern => pattern.test(apiKey));
  }

  public obfuscateApiKey(apiKey: string): string {
    if (!apiKey || apiKey.length < 8) return '[INVALID]';
    
    const start = apiKey.substring(0, 3);
    const end = apiKey.substring(apiKey.length - 3);
    const middle = '*'.repeat(Math.max(apiKey.length - 6, 4));
    
    return `${start}${middle}${end}`;
  }

  public async getSecurityConfig(): Promise<SecurityConfig> {
    try {
      const config = await AsyncStorage.getItem('security_config');
      return config ? { ...DEFAULT_SECURITY_CONFIG, ...JSON.parse(config) } : DEFAULT_SECURITY_CONFIG;
    } catch (error) {
      console.error('Failed to load security config:', error);
      return DEFAULT_SECURITY_CONFIG;
    }
  }

  private getSecurityConfigSync(): SecurityConfig {
    // Synchronous version for internal use
    return DEFAULT_SECURITY_CONFIG;
  }

  public async updateSecurityConfig(updates: Partial<SecurityConfig>): Promise<void> {
    try {
      const current = await this.getSecurityConfig();
      const updated = { ...current, ...updates };
      await AsyncStorage.setItem('security_config', JSON.stringify(updated));
      
      // Update key rotation if interval changed
      if (updates.keyRotationInterval !== undefined) {
        if (this.keyRotationTimer) {
          clearInterval(this.keyRotationTimer);
        }
        this.setupKeyRotation();
      }
    } catch (error) {
      console.error('Failed to update security config:', error);
    }
  }

  public generateSecureId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `${timestamp}_${randomPart}`;
  }

  public hashSensitiveData(data: string): string {
    // Simple hash function - use crypto.subtle.digest in production
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  public destroy() {
    if (this.keyRotationTimer) {
      clearInterval(this.keyRotationTimer);
    }
    this.currentKeys.clear();
    this.failedAttempts.clear();
    this.lockouts.clear();
  }
}

export const securityManager = SecurityManager.getInstance();

// Utility functions
export const isUserLocked = (userId: string) => securityManager.isUserLocked(userId);
export const recordFailedAttempt = (userId: string) => securityManager.recordFailedAttempt(userId);
export const clearFailedAttempts = (userId: string) => securityManager.clearFailedAttempts(userId);
export const sanitizeData = (data: any) => securityManager.sanitizeData(data);
export const validateApiKey = (apiKey: string) => securityManager.validateApiKey(apiKey);
export const obfuscateApiKey = (apiKey: string) => securityManager.obfuscateApiKey(apiKey);
export const generateSecureId = () => securityManager.generateSecureId();
export const hashSensitiveData = (data: string) => securityManager.hashSensitiveData(data);