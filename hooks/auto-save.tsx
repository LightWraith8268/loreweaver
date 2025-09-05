import { useEffect, useRef, useCallback } from 'react';
import { useSettings } from '@/hooks/settings-context';
import { useWorld } from '@/hooks/world-context';

interface UseAutoSaveOptions {
  delay?: number; // Debounce delay in milliseconds
  onSave?: () => void;
  onError?: (error: Error) => void;
}

export function useAutoSave(
  data: any,
  saveFunction: (data: any) => Promise<void>,
  options: UseAutoSaveOptions = {}
) {
  const { settings } = useSettings();
  const { delay = 2000, onSave, onError } = options;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousDataRef = useRef<any>(null);
  const isSavingRef = useRef(false);

  const debouncedSave = useCallback(async () => {
    if (!settings.autoSave || isSavingRef.current) return;

    try {
      isSavingRef.current = true;
      console.log('Auto-saving data...');
      await saveFunction(data);
      previousDataRef.current = data;
      onSave?.();
      console.log('Auto-save completed');
    } catch (error) {
      console.error('Auto-save failed:', error);
      onError?.(error as Error);
    } finally {
      isSavingRef.current = false;
    }
  }, [data, saveFunction, settings.autoSave, onSave, onError]);

  useEffect(() => {
    if (!settings.autoSave) return;

    // Don't save if data hasn't changed
    if (JSON.stringify(data) === JSON.stringify(previousDataRef.current)) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(debouncedSave, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, debouncedSave, delay, settings.autoSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isAutoSaveEnabled: settings.autoSave,
    forceSave: debouncedSave,
  };
}

// Hook for auto-saving world entities
export function useEntityAutoSave<T extends { id: string }>(
  entity: T | null,
  updateFunction: (id: string, updates: Partial<T>) => Promise<void>
) {
  return useAutoSave(
    entity,
    async (data: T) => {
      if (data?.id) {
        await updateFunction(data.id, data);
      }
    },
    {
      delay: 3000, // Longer delay for entity updates
      onSave: () => console.log(`Auto-saved ${entity?.id || 'entity'}`),
      onError: (error) => console.error('Entity auto-save failed:', error),
    }
  );
}

// Hook for auto-saving form data
export function useFormAutoSave<T>(
  formData: T,
  saveFunction: (data: T) => Promise<void>
) {
  return useAutoSave(
    formData,
    saveFunction,
    {
      delay: 1500, // Shorter delay for forms
      onSave: () => console.log('Form auto-saved'),
      onError: (error) => console.error('Form auto-save failed:', error),
    }
  );
}

// Hook for offline mode detection and handling
export function useOfflineMode() {
  const { settings } = useSettings();
  const { currentWorld } = useWorld();

  const isOfflineMode = settings.offlineMode || currentWorld?.isOfflineMode || false;

  const withOfflineCheck = useCallback(
    async function<T>(
      onlineAction: () => Promise<T>,
      offlineAction?: () => Promise<T> | T,
      fallbackMessage?: string
    ): Promise<T | null> {
      if (isOfflineMode) {
        if (offlineAction) {
          try {
            return await offlineAction();
          } catch (error) {
            console.warn('Offline action failed:', error);
            return null;
          }
        } else {
          console.warn(fallbackMessage || 'Feature not available in offline mode');
          return null;
        }
      }

      try {
        return await onlineAction();
      } catch (error) {
        console.error('Online action failed:', error);
        if (offlineAction) {
          console.log('Falling back to offline action...');
          try {
            return await offlineAction();
          } catch (offlineError) {
            console.error('Offline fallback also failed:', offlineError);
          }
        }
        throw error;
      }
    },
    [isOfflineMode]
  );

  return {
    isOfflineMode,
    withOfflineCheck,
  };
}

// Hook for managing offline data sync
export function useOfflineSync() {
  const { settings } = useSettings();

  const queueOfflineAction = useCallback(
    (action: { type: string; data: any; timestamp: number }) => {
      // In a real implementation, you'd store this in AsyncStorage
      // and sync when coming back online
      console.log('Queuing offline action:', action);
    },
    []
  );

  const syncOfflineActions = useCallback(async () => {
    if (settings.offlineMode) return;

    // In a real implementation, you'd retrieve queued actions
    // from AsyncStorage and execute them
    console.log('Syncing offline actions...');
  }, [settings.offlineMode]);

  return {
    queueOfflineAction,
    syncOfflineActions,
  };
}