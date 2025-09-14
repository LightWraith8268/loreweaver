import type { DocumentWithSync } from './firebase-advanced';
import type { World, Character, Location, Faction, Item, LoreNote } from '@/types/world';

export type ConflictResolutionStrategy = 'local-wins' | 'remote-wins' | 'merge' | 'manual';

export interface ConflictResolution<T> {
  strategy: ConflictResolutionStrategy;
  result: T;
  metadata: {
    mergedFields: string[];
    discardedChanges: Partial<T>;
    requiresManualReview: boolean;
    confidence: number; // 0-1, how confident the merge is
  };
}

export interface FieldConflict<T> {
  field: keyof T;
  localValue: any;
  remoteValue: any;
  baseValue?: any; // Original value before both changes
  canAutoMerge: boolean;
  importance: 'low' | 'medium' | 'high' | 'critical';
}

export class ConflictResolver {
  
  // Main conflict resolution entry point
  async resolveConflict<T extends Record<string, any> & { id: string }>(
    local: DocumentWithSync<T>,
    remote: DocumentWithSync<T>,
    base?: T, // Original version before conflicts
    strategy: ConflictResolutionStrategy = 'merge'
  ): Promise<ConflictResolution<T>> {
    
    const conflicts = this.analyzeFieldConflicts(local, remote, base);
    
    switch (strategy) {
      case 'local-wins':
        return this.resolveLocalWins(local, remote, conflicts);
      case 'remote-wins':
        return this.resolveRemoteWins(local, remote, conflicts);
      case 'merge':
        return await this.resolveAutoMerge(local, remote, base, conflicts);
      case 'manual':
        return this.prepareManualResolution(local, remote, conflicts);
    }
  }

  // Analyze conflicts between local and remote versions
  private analyzeFieldConflicts<T extends Record<string, any> & { id: string }>(
    local: DocumentWithSync<T>,
    remote: DocumentWithSync<T>,
    base?: T
  ): FieldConflict<T>[] {
    const conflicts: FieldConflict<T>[] = [];
    const allKeys = new Set([
      ...Object.keys(local),
      ...Object.keys(remote)
    ]);

    for (const key of allKeys) {
      if (key.startsWith('_sync') || key === 'id') continue;

      const field = key as keyof T;
      const localValue = local[field];
      const remoteValue = remote[field];
      const baseValue = base?.[field];

      // Skip if values are the same
      if (this.deepEqual(localValue, remoteValue)) continue;

      const importance = this.getFieldImportance(field);
      const canAutoMerge = this.canFieldAutoMerge(field, localValue, remoteValue, baseValue);

      conflicts.push({
        field,
        localValue,
        remoteValue,
        baseValue,
        canAutoMerge,
        importance
      });
    }

    return conflicts;
  }

  // Determine if a field can be automatically merged
  private canFieldAutoMerge<T extends Record<string, any>>(
    field: keyof T, 
    localValue: any, 
    remoteValue: any, 
    baseValue?: any
  ): boolean {
    // Arrays can often be merged
    if (Array.isArray(localValue) && Array.isArray(remoteValue)) {
      return this.canMergeArrays(localValue, remoteValue);
    }

    // Objects can be merged if they're not core entity properties
    if (typeof localValue === 'object' && typeof remoteValue === 'object') {
      return this.isNonCriticalObject(field);
    }

    // Timestamps - use the more recent one
    if (this.isTimestamp(localValue) && this.isTimestamp(remoteValue)) {
      return true;
    }

    // Some string fields can be concatenated
    if (typeof localValue === 'string' && typeof remoteValue === 'string') {
      return this.canConcatenateStrings(field, localValue, remoteValue);
    }

    return false;
  }

  // Auto-merge strategy
  private async resolveAutoMerge<T extends Record<string, any> & { id: string }>(
    local: DocumentWithSync<T>,
    remote: DocumentWithSync<T>,
    base: T | undefined,
    conflicts: FieldConflict<T>[]
  ): Promise<ConflictResolution<T>> {
    const merged = { ...local } as T;
    const mergedFields: string[] = [];
    const discardedChanges: Partial<T> = {};
    let requiresManualReview = false;
    let confidence = 1.0;

    for (const conflict of conflicts) {
      const { field, localValue, remoteValue, canAutoMerge, importance } = conflict;

      if (!canAutoMerge || importance === 'critical') {
        // Cannot auto-merge, requires manual review
        requiresManualReview = true;
        confidence *= 0.7; // Reduce confidence
        
        // For now, prefer remote changes for non-critical fields
        if (importance !== 'critical') {
          (merged as any)[field] = remoteValue;
          discardedChanges[field] = localValue;
          mergedFields.push(field as string);
        }
        continue;
      }

      // Auto-merge based on type
      if (Array.isArray(localValue) && Array.isArray(remoteValue)) {
        (merged as any)[field] = this.mergeArrays(localValue, remoteValue);
        mergedFields.push(field as string);
      } else if (this.isTimestamp(localValue) && this.isTimestamp(remoteValue)) {
        // Use the more recent timestamp
        (merged as any)[field] = localValue > remoteValue ? localValue : remoteValue;
        mergedFields.push(field as string);
      } else if (typeof localValue === 'string' && typeof remoteValue === 'string') {
        if (this.canConcatenateStrings(field, localValue, remoteValue)) {
          (merged as any)[field] = this.mergeStrings(localValue, remoteValue);
          mergedFields.push(field as string);
        } else {
          // Prefer remote for string conflicts
          (merged as any)[field] = remoteValue;
          (discardedChanges as any)[field] = localValue;
        }
      } else if (typeof localValue === 'object' && typeof remoteValue === 'object') {
        (merged as any)[field] = this.mergeObjects(localValue, remoteValue);
        mergedFields.push(field as string);
      }
    }

    return {
      strategy: 'merge',
      result: merged,
      metadata: {
        mergedFields,
        discardedChanges,
        requiresManualReview,
        confidence: Math.max(confidence, 0.1)
      }
    };
  }

  // Simple resolution strategies
  private resolveLocalWins<T extends Record<string, any> & { id: string }>(
    local: DocumentWithSync<T>,
    remote: DocumentWithSync<T>,
    conflicts: FieldConflict<T>[]
  ): ConflictResolution<T> {
    return {
      strategy: 'local-wins',
      result: local,
      metadata: {
        mergedFields: [],
        discardedChanges: this.extractConflictValues(remote, conflicts, 'remote'),
        requiresManualReview: false,
        confidence: 1.0
      }
    };
  }

  private resolveRemoteWins<T extends Record<string, any> & { id: string }>(
    local: DocumentWithSync<T>,
    remote: DocumentWithSync<T>,
    conflicts: FieldConflict<T>[]
  ): ConflictResolution<T> {
    return {
      strategy: 'remote-wins',
      result: remote,
      metadata: {
        mergedFields: [],
        discardedChanges: this.extractConflictValues(local, conflicts, 'local'),
        requiresManualReview: false,
        confidence: 1.0
      }
    };
  }

  private prepareManualResolution<T extends Record<string, any> & { id: string }>(
    local: DocumentWithSync<T>,
    remote: DocumentWithSync<T>,
    conflicts: FieldConflict<T>[]
  ): ConflictResolution<T> {
    return {
      strategy: 'manual',
      result: local, // Temporary result
      metadata: {
        mergedFields: [],
        discardedChanges: {},
        requiresManualReview: true,
        confidence: 0.0
      }
    };
  }

  // Helper methods for merge logic

  private getFieldImportance<T extends Record<string, any>>(field: keyof T): 'low' | 'medium' | 'high' | 'critical' {
    const fieldStr = field as string;
    
    // Critical fields that should never be auto-merged
    if (['name', 'title', 'id'].includes(fieldStr)) {
      return 'critical';
    }
    
    // High importance fields
    if (['description', 'content', 'type', 'role'].includes(fieldStr)) {
      return 'high';
    }
    
    // Medium importance fields  
    if (['tags', 'categories', 'properties', 'attributes'].includes(fieldStr)) {
      return 'medium';
    }
    
    // Low importance fields
    return 'low';
  }

  private canMergeArrays(arr1: any[], arr2: any[]): boolean {
    // Arrays of primitives can usually be merged
    return arr1.every(item => typeof item !== 'object') && 
           arr2.every(item => typeof item !== 'object');
  }

  private mergeArrays(arr1: any[], arr2: any[]): any[] {
    // Merge arrays, removing duplicates
    const merged = [...arr1];
    for (const item of arr2) {
      if (!merged.includes(item)) {
        merged.push(item);
      }
    }
    return merged;
  }

  private isNonCriticalObject<T extends Record<string, any>>(field: keyof T): boolean {
    const fieldStr = field as string;
    // Objects that are safe to deep merge
    return ['metadata', 'properties', 'attributes', 'stats'].includes(fieldStr);
  }

  private mergeObjects(obj1: any, obj2: any): any {
    return { ...obj1, ...obj2 };
  }

  private isTimestamp(value: any): boolean {
    return value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)));
  }

  private canConcatenateStrings<T extends Record<string, any>>(field: keyof T, str1: string, str2: string): boolean {
    const fieldStr = field as string;
    // Only concatenate for certain fields like descriptions or notes
    return ['notes', 'description', 'content'].includes(fieldStr) && 
           str1.trim() !== str2.trim();
  }

  private mergeStrings(str1: string, str2: string): string {
    // Simple merge: combine with separator if different
    if (str1.includes(str2) || str2.includes(str1)) {
      return str1.length > str2.length ? str1 : str2;
    }
    return `${str1}\n\n---\n\n${str2}`;
  }

  private extractConflictValues<T extends Record<string, any>>(
    doc: DocumentWithSync<T>, 
    conflicts: FieldConflict<T>[], 
    source: 'local' | 'remote'
  ): Partial<T> {
    const values: Partial<T> = {};
    for (const conflict of conflicts) {
      values[conflict.field] = source === 'local' ? conflict.localValue : conflict.remoteValue;
    }
    return values;
  }

  private deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!this.deepEqual(a[i], b[i])) return false;
      }
      return true;
    }
    if (typeof a === 'object' && typeof b === 'object') {
      const keys = Object.keys(a);
      if (keys.length !== Object.keys(b).length) return false;
      for (const key of keys) {
        if (!this.deepEqual(a[key], b[key])) return false;
      }
      return true;
    }
    return false;
  }
}

export const conflictResolver = new ConflictResolver();