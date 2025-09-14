import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useCallback } from 'react';

import type { World, Character, Location, Item, Faction, Timeline, LoreNote, WorldSnapshot, EntityType, MagicSystem, Mythology, ImportedData, Series, Book, VoiceCapture } from '@/types/world';
import { syncManager, type SyncStatus, type SyncConflict } from '@/services/sync-manager';
import { useAuth } from '@/hooks/auth-context';
import { firebaseService } from '@/services/firebase-advanced';

interface WorldContextType {
  // Current world
  currentWorld: World | null;
  setCurrentWorld: (world: World | null) => void;
  
  // Worlds
  worlds: World[];
  createWorld: (world: Omit<World, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateWorld: (id: string, updates: Partial<World>) => Promise<void>;
  deleteWorld: (id: string) => Promise<void>;
  
  // Sync features
  syncStatus: SyncStatus;
  syncConflicts: SyncConflict[];
  syncWorld: (worldId?: string) => Promise<void>;
  enableSyncForWorld: (worldId: string) => Promise<void>;
  disableSyncForWorld: (worldId: string) => Promise<void>;
  resolveConflict: (conflictId: string, resolution: any) => Promise<void>;
  isOnline: boolean;
  syncEnabled: boolean;
  
  // Characters
  characters: Character[];
  createCharacter: (character: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCharacter: (id: string, updates: Partial<Character>) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;
  
  // Locations
  locations: Location[];
  createLocation: (location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateLocation: (id: string, updates: Partial<Location>) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  
  // Items
  items: Item[];
  createItem: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  
  // Factions
  factions: Faction[];
  createFaction: (faction: Omit<Faction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateFaction: (id: string, updates: Partial<Faction>) => Promise<void>;
  deleteFaction: (id: string) => Promise<void>;
  
  // Timelines
  timelines: Timeline[];
  createTimeline: (timeline: Omit<Timeline, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTimeline: (id: string, updates: Partial<Timeline>) => Promise<void>;
  deleteTimeline: (id: string) => Promise<void>;
  
  // Lore Notes
  loreNotes: LoreNote[];
  createLoreNote: (note: Omit<LoreNote, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateLoreNote: (id: string, updates: Partial<LoreNote>) => Promise<void>;
  deleteLoreNote: (id: string) => Promise<void>;
  
  // Magic Systems
  magicSystems: MagicSystem[];
  createMagicSystem: (magicSystem: Omit<MagicSystem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMagicSystem: (id: string, updates: Partial<MagicSystem>) => Promise<void>;
  deleteMagicSystem: (id: string) => Promise<void>;
  
  // Mythologies
  mythologies: Mythology[];
  createMythology: (mythology: Omit<Mythology, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMythology: (id: string, updates: Partial<Mythology>) => Promise<void>;
  deleteMythology: (id: string) => Promise<void>;
  
  // Series
  series: Series[];
  createSeries: (series: Omit<Series, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSeries: (id: string, updates: Partial<Series>) => Promise<void>;
  deleteSeries: (id: string) => Promise<void>;
  
  // Books
  books: Book[];
  createBook: (book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBook: (id: string, updates: Partial<Book>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  
  // Voice Recordings
  voiceCaptures: VoiceCapture[];
  createVoiceCapture: (capture: Omit<VoiceCapture, 'id' | 'createdAt'>) => Promise<void>;
  updateVoiceCapture: (id: string, updates: Partial<VoiceCapture>) => Promise<void>;
  deleteVoiceCapture: (id: string) => Promise<void>;
  
  // Snapshots
  snapshots: WorldSnapshot[];
  createSnapshot: (name: string) => Promise<void>;
  restoreSnapshot: (snapshotId: string) => Promise<void>;
  deleteSnapshot: (id: string) => Promise<void>;
  
  // Import/Export
  importData: (data: ImportedData) => Promise<void>;
  exportWorld: () => Promise<string>;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: any[];
  
  // Loading states
  isLoading: boolean;
}

export const [WorldProvider, useWorld] = createContextHook<WorldContextType>(() => {
  const queryClient = useQueryClient();
  const [currentWorld, setCurrentWorld] = useState<World | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(syncManager.getSyncStatus());
  const [syncConflicts, setSyncConflicts] = useState<SyncConflict[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  
  const { user, syncEnabled } = useAuth();
  
  // Initialize sync listeners
  useEffect(() => {
    const statusListener = 'world-context-status';
    syncManager.addStatusListener(statusListener, setSyncStatus);
    
    // Update conflicts periodically
    const updateConflicts = () => {
      setSyncConflicts(syncManager.getConflicts());
    };
    updateConflicts();
    const conflictInterval = setInterval(updateConflicts, 5000);
    
    return () => {
      syncManager.removeStatusListener(statusListener);
      clearInterval(conflictInterval);
    };
  }, []);
  
  // Monitor network status
  useEffect(() => {
    const checkOnlineStatus = () => {
      // In a real app, this would use NetInfo from @react-native-community/netinfo
      // For now, we'll assume online status
      const online = navigator?.onLine ?? true;
      setIsOnline(online);
      syncManager.setOnlineStatus(online);
    };
    
    checkOnlineStatus();
    
    // Listen for network changes
    if (typeof window !== 'undefined') {
      window.addEventListener('online', checkOnlineStatus);
      window.addEventListener('offline', checkOnlineStatus);
      
      return () => {
        window.removeEventListener('online', checkOnlineStatus);
        window.removeEventListener('offline', checkOnlineStatus);
      };
    }
  }, []);
  
  // Hybrid data loading - local with sync fallback
  const worldsQuery = useQuery({
    queryKey: ['worlds'],
    queryFn: async () => {
      if (syncEnabled && user) {
        try {
          const remoteWorlds = await firebaseService.getCollection('worlds');
          return remoteWorlds;
        } catch (error) {
          console.warn('Failed to load from Firebase, falling back to local:', error);
        }
      }
      const data = await AsyncStorage.getItem('worlds');
      return data ? JSON.parse(data) : [];
    },
  });
  
  // Helper function for hybrid data loading
  const loadEntityData = useCallback(async (entityType: string, worldId: string) => {
    if (syncEnabled && user) {
      try {
        const remoteData = await firebaseService.getCollection(entityType, '_sync.lastModified');
        return remoteData;
      } catch (error) {
        console.warn(`Failed to load ${entityType} from Firebase, falling back to local:`, error);
      }
    }
    const data = await AsyncStorage.getItem(`${entityType}_${worldId}`);
    return data ? JSON.parse(data) : [];
  }, [syncEnabled, user]);
  
  const charactersQuery = useQuery({
    queryKey: ['characters', currentWorld?.id, syncEnabled],
    queryFn: async () => {
      if (!currentWorld) return [];
      return await loadEntityData('characters', currentWorld.id);
    },
    enabled: !!currentWorld,
  });
  
  const locationsQuery = useQuery({
    queryKey: ['locations', currentWorld?.id, syncEnabled],
    queryFn: async () => {
      if (!currentWorld) return [];
      return await loadEntityData('locations', currentWorld.id);
    },
    enabled: !!currentWorld,
  });
  
  const itemsQuery = useQuery({
    queryKey: ['items', currentWorld?.id, syncEnabled],
    queryFn: async () => {
      if (!currentWorld) return [];
      return await loadEntityData('items', currentWorld.id);
    },
    enabled: !!currentWorld,
  });
  
  const factionsQuery = useQuery({
    queryKey: ['factions', currentWorld?.id, syncEnabled],
    queryFn: async () => {
      if (!currentWorld) return [];
      return await loadEntityData('factions', currentWorld.id);
    },
    enabled: !!currentWorld,
  });
  
  const timelinesQuery = useQuery({
    queryKey: ['timelines', currentWorld?.id, syncEnabled],
    queryFn: async () => {
      if (!currentWorld) return [];
      return await loadEntityData('timelines', currentWorld.id);
    },
    enabled: !!currentWorld,
  });
  
  const loreNotesQuery = useQuery({
    queryKey: ['loreNotes', currentWorld?.id, syncEnabled],
    queryFn: async () => {
      if (!currentWorld) return [];
      return await loadEntityData('loreNotes', currentWorld.id);
    },
    enabled: !!currentWorld,
  });
  
  const magicSystemsQuery = useQuery({
    queryKey: ['magicSystems', currentWorld?.id, syncEnabled],
    queryFn: async () => {
      if (!currentWorld) return [];
      return await loadEntityData('magicSystems', currentWorld.id);
    },
    enabled: !!currentWorld,
  });
  
  const mythologiesQuery = useQuery({
    queryKey: ['mythologies', currentWorld?.id, syncEnabled],
    queryFn: async () => {
      if (!currentWorld) return [];
      return await loadEntityData('mythologies', currentWorld.id);
    },
    enabled: !!currentWorld,
  });

  const seriesQuery = useQuery({
    queryKey: ['series', currentWorld?.id, syncEnabled],
    queryFn: async () => {
      if (!currentWorld) return [];
      return await loadEntityData('series', currentWorld.id);
    },
    enabled: !!currentWorld,
  });

  const booksQuery = useQuery({
    queryKey: ['books', currentWorld?.id, syncEnabled],
    queryFn: async () => {
      if (!currentWorld) return [];
      return await loadEntityData('books', currentWorld.id);
    },
    enabled: !!currentWorld,
  });

  const voiceCapturesQuery = useQuery({
    queryKey: ['voiceCaptures', currentWorld?.id, syncEnabled],
    queryFn: async () => {
      if (!currentWorld) return [];
      return await loadEntityData('voiceCaptures', currentWorld.id);
    },
    enabled: !!currentWorld,
  });
  
  const snapshotsQuery = useQuery({
    queryKey: ['snapshots', currentWorld?.id, syncEnabled],
    queryFn: async () => {
      if (!currentWorld) return [];
      return await loadEntityData('snapshots', currentWorld.id);
    },
    enabled: !!currentWorld,
  });
  
  // Load current world on mount
  useEffect(() => {
    AsyncStorage.getItem('currentWorldId').then(id => {
      if (id && worldsQuery.data) {
        const world = worldsQuery.data.find((w: World) => w.id === id);
        if (world) setCurrentWorld(world);
      }
    });
  }, [worldsQuery.data]);
  
  // Save current world ID
  useEffect(() => {
    if (currentWorld) {
      AsyncStorage.setItem('currentWorldId', currentWorld.id);
    } else {
      AsyncStorage.removeItem('currentWorldId');
    }
  }, [currentWorld]);
  
  // Helper function for hybrid entity operations
  const saveEntityData = useCallback(async (entityType: string, data: any, worldId?: string) => {
    const key = worldId ? `${entityType}_${worldId}` : entityType;
    
    // Save locally first for offline capability
    await AsyncStorage.setItem(key, JSON.stringify(data));
    
    // If sync is enabled, also save to Firebase
    if (syncEnabled && user) {
      try {
        if (Array.isArray(data)) {
          // Handle array updates (collections)
          for (const item of data) {
            if (item.id) {
              await syncManager.queueOperation('update', entityType as any, item);
            }
          }
        } else {
          // Handle single item
          await syncManager.queueOperation('update', entityType as any, data);
        }
      } catch (error) {
        console.warn(`Failed to sync ${entityType} to Firebase:`, error);
      }
    }
  }, [syncEnabled, user]);
  
  // World mutations with sync support
  const createWorldMutation = useMutation({
    mutationFn: async (world: Omit<World, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newWorld: World = {
        ...world,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const worlds = worldsQuery.data || [];
      const updated = [...worlds, newWorld];
      await saveEntityData('worlds', updated);
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['worlds'], data);
    },
  });
  
  const updateWorldMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<World> }) => {
      const worlds = worldsQuery.data || [];
      const updated = worlds.map((w: World) => 
        w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w
      );
      await saveEntityData('worlds', updated);
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['worlds'], data);
    },
  });
  
  const deleteWorldMutation = useMutation({
    mutationFn: async (id: string) => {
      const worlds = worldsQuery.data || [];
      const updated = worlds.filter((w: World) => w.id !== id);
      await saveEntityData('worlds', updated);
      
      // Clean up all related data locally
      const entityTypes = ['characters', 'locations', 'items', 'factions', 'timelines', 'loreNotes', 'magicSystems', 'mythologies', 'series', 'books', 'voiceCaptures', 'snapshots'];
      for (const entityType of entityTypes) {
        await AsyncStorage.removeItem(`${entityType}_${id}`);
        
        // Also queue delete operations for sync if enabled
        if (syncEnabled && user) {
          try {
            await syncManager.queueOperation('delete', entityType as any, { id });
          } catch (error) {
            console.warn(`Failed to queue delete for ${entityType}:`, error);
          }
        }
      }
      
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['worlds'], data);
      if (currentWorld && !data.find((w: World) => w.id === currentWorld.id)) {
        setCurrentWorld(null);
      }
    },
  });
  
  // Create mutation instances for each entity type
  const createCharacterMutation = useMutation({
    mutationFn: async (entity: any) => {
      if (!currentWorld) throw new Error('No world selected');
      const key = `characters_${currentWorld.id}`;
      const existing = await AsyncStorage.getItem(key);
      const entities = existing ? JSON.parse(existing) : [];
      const newEntity = {
        ...entity,
        id: Date.now().toString(),
        worldId: currentWorld.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [...entities, newEntity];
      await saveEntityData('characters', updated, currentWorld.id);
      
      if (syncEnabled && user) {
        try {
          await syncManager.queueOperation('create', 'characters', newEntity);
        } catch (error) {
          console.warn('Failed to queue create for character:', error);
        }
      }
      
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['characters', currentWorld?.id], data);
    },
  });

  
  // Generic entity mutations with sync support
  const useCreateEntityMutation = (type: EntityType) => useMutation({
    mutationFn: async (entity: any) => {
      if (!currentWorld) throw new Error('No world selected');
      const key = `${type}s_${currentWorld.id}`;
      const existing = await AsyncStorage.getItem(key);
      const entities = existing ? JSON.parse(existing) : [];
      const newEntity = {
        ...entity,
        id: Date.now().toString(),
        worldId: currentWorld.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [...entities, newEntity];
      await saveEntityData(`${type}s`, updated, currentWorld.id);
      
      // Queue create operation for sync
      if (syncEnabled && user) {
        try {
          await syncManager.queueOperation('create', `${type}s` as any, newEntity);
        } catch (error) {
          console.warn(`Failed to queue create for ${type}:`, error);
        }
      }
      
      return updated;
    },
    onSuccess: (data, _, context) => {
      queryClient.setQueryData([`${type}s`, currentWorld?.id], data);
    },
  });
  
  const useUpdateEntityMutation = (type: EntityType) => useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      if (!currentWorld) throw new Error('No world selected');
      const key = `${type}s_${currentWorld.id}`;
      const existing = await AsyncStorage.getItem(key);
      const entities = existing ? JSON.parse(existing) : [];
      const updatedEntity = entities.find((e: any) => e.id === id);
      if (!updatedEntity) throw new Error('Entity not found');
      
      const merged = { ...updatedEntity, ...updates, updatedAt: new Date().toISOString() };
      const updated = entities.map((e: any) => e.id === id ? merged : e);
      await saveEntityData(`${type}s`, updated, currentWorld.id);
      
      // Queue update operation for sync
      if (syncEnabled && user) {
        try {
          await syncManager.queueOperation('update', `${type}s` as any, merged);
        } catch (error) {
          console.warn(`Failed to queue update for ${type}:`, error);
        }
      }
      
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData([`${type}s`, currentWorld?.id], data);
    },
  });
  
  const useDeleteEntityMutation = (type: EntityType) => useMutation({
    mutationFn: async (id: string) => {
      if (!currentWorld) throw new Error('No world selected');
      const key = `${type}s_${currentWorld.id}`;
      const existing = await AsyncStorage.getItem(key);
      const entities = existing ? JSON.parse(existing) : [];
      const updated = entities.filter((e: any) => e.id !== id);
      await saveEntityData(`${type}s`, updated, currentWorld.id);
      
      // Queue delete operation for sync
      if (syncEnabled && user) {
        try {
          await syncManager.queueOperation('delete', `${type}s` as any, { id });
        } catch (error) {
          console.warn(`Failed to queue delete for ${type}:`, error);
        }
      }
      
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData([`${type}s`, currentWorld?.id], data);
    },
  });
  
  // Individual entity mutations to avoid Hook Rule violations
  const updateCharacterMutation = useUpdateEntityMutation('character');
  const deleteCharacterMutation = useDeleteEntityMutation('character');
  
  const createLocationMutation = useCreateEntityMutation('location');
  const updateLocationMutation = useUpdateEntityMutation('location');
  const deleteLocationMutation = useDeleteEntityMutation('location');
  
  const createItemMutation = useCreateEntityMutation('item');
  const updateItemMutation = useUpdateEntityMutation('item');
  const deleteItemMutation = useDeleteEntityMutation('item');
  
  const createFactionMutation = useCreateEntityMutation('faction');
  const updateFactionMutation = useUpdateEntityMutation('faction');
  const deleteFactionMutation = useDeleteEntityMutation('faction');
  
  const createTimelineMutation = useCreateEntityMutation('timeline');
  const updateTimelineMutation = useUpdateEntityMutation('timeline');
  const deleteTimelineMutation = useDeleteEntityMutation('timeline');
  
  const createLoreNoteMutation = useCreateEntityMutation('lore');
  const updateLoreNoteMutation = useUpdateEntityMutation('lore');
  const deleteLoreNoteMutation = useDeleteEntityMutation('lore');
  
  const createMagicSystemMutation = useCreateEntityMutation('magicSystem');
  const updateMagicSystemMutation = useUpdateEntityMutation('magicSystem');
  const deleteMagicSystemMutation = useDeleteEntityMutation('magicSystem');
  
  const createMythologyMutation = useCreateEntityMutation('mythology');
  const updateMythologyMutation = useUpdateEntityMutation('mythology');
  const deleteMythologyMutation = useDeleteEntityMutation('mythology');
  
  const createSeriesMutation = useCreateEntityMutation('series');
  const updateSeriesMutation = useUpdateEntityMutation('series');
  const deleteSeriesMutation = useDeleteEntityMutation('series');
  
  const createBookMutation = useCreateEntityMutation('book');
  const updateBookMutation = useUpdateEntityMutation('book');
  const deleteBookMutation = useDeleteEntityMutation('book');
  
  const createVoiceCaptureMutation = useCreateEntityMutation('voiceCapture');
  const updateVoiceCaptureMutation = useUpdateEntityMutation('voiceCapture');
  const deleteVoiceCaptureMutation = useDeleteEntityMutation('voiceCapture');
  
  const deleteSnapshotMutation = useDeleteEntityMutation('snapshot');
  
  // Snapshot mutations
  const createSnapshotMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!currentWorld) throw new Error('No world selected');
      
      const snapshotData = {
        world: currentWorld,
        characters: charactersQuery.data || [],
        locations: locationsQuery.data || [],
        items: itemsQuery.data || [],
        factions: factionsQuery.data || [],
        timelines: timelinesQuery.data || [],
        loreNotes: loreNotesQuery.data || [],
        magicSystems: magicSystemsQuery.data || [],
        mythologies: mythologiesQuery.data || [],
        series: seriesQuery.data || [],
        books: booksQuery.data || [],
        voiceCaptures: voiceCapturesQuery.data || [],
      };
      
      const snapshot: WorldSnapshot = {
        id: Date.now().toString(),
        worldId: currentWorld.id,
        name,
        data: JSON.stringify(snapshotData),
        createdAt: new Date().toISOString(),
      };
      
      const key = `snapshots_${currentWorld.id}`;
      const existing = await AsyncStorage.getItem(key);
      const snapshots = existing ? JSON.parse(existing) : [];
      const updated = [...snapshots, snapshot];
      await AsyncStorage.setItem(key, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['snapshots', currentWorld?.id], data);
    },
  });
  
  const restoreSnapshotMutation = useMutation({
    mutationFn: async (snapshotId: string) => {
      if (!currentWorld) throw new Error('No world selected');
      
      const snapshots = snapshotsQuery.data || [];
      const snapshot = snapshots.find((s: WorldSnapshot) => s.id === snapshotId);
      if (!snapshot) throw new Error('Snapshot not found');
      
      const data = JSON.parse(snapshot.data);
      
      // Restore all data
      await AsyncStorage.setItem(`characters_${currentWorld.id}`, JSON.stringify(data.characters));
      await AsyncStorage.setItem(`locations_${currentWorld.id}`, JSON.stringify(data.locations));
      await AsyncStorage.setItem(`items_${currentWorld.id}`, JSON.stringify(data.items));
      await AsyncStorage.setItem(`factions_${currentWorld.id}`, JSON.stringify(data.factions));
      await AsyncStorage.setItem(`timelines_${currentWorld.id}`, JSON.stringify(data.timelines));
      await AsyncStorage.setItem(`loreNotes_${currentWorld.id}`, JSON.stringify(data.loreNotes));
      await AsyncStorage.setItem(`magicSystems_${currentWorld.id}`, JSON.stringify(data.magicSystems));
      await AsyncStorage.setItem(`mythologies_${currentWorld.id}`, JSON.stringify(data.mythologies));
      await AsyncStorage.setItem(`series_${currentWorld.id}`, JSON.stringify(data.series));
      await AsyncStorage.setItem(`books_${currentWorld.id}`, JSON.stringify(data.books));
      await AsyncStorage.setItem(`voiceCaptures_${currentWorld.id}`, JSON.stringify(data.voiceCaptures));
      
      return data;
    },
    onSuccess: (data) => {
      // Invalidate all queries to reload data
      queryClient.invalidateQueries({ queryKey: ['characters', currentWorld?.id] });
      queryClient.invalidateQueries({ queryKey: ['locations', currentWorld?.id] });
      queryClient.invalidateQueries({ queryKey: ['items', currentWorld?.id] });
      queryClient.invalidateQueries({ queryKey: ['factions', currentWorld?.id] });
      queryClient.invalidateQueries({ queryKey: ['timelines', currentWorld?.id] });
      queryClient.invalidateQueries({ queryKey: ['loreNotes', currentWorld?.id] });
      queryClient.invalidateQueries({ queryKey: ['magicSystems', currentWorld?.id] });
      queryClient.invalidateQueries({ queryKey: ['mythologies', currentWorld?.id] });
      queryClient.invalidateQueries({ queryKey: ['series', currentWorld?.id] });
      queryClient.invalidateQueries({ queryKey: ['books', currentWorld?.id] });
      queryClient.invalidateQueries({ queryKey: ['voiceCaptures', currentWorld?.id] });
    },
  });
  
  // Search functionality
  const searchResults = useMemo(() => {
    if (!searchQuery || !currentWorld) return [];
    
    const query = searchQuery.toLowerCase();
    const results: any[] = [];
    
    // Search characters
    (charactersQuery.data || []).forEach((char: Character) => {
      if (char.name.toLowerCase().includes(query) || 
          char.role.toLowerCase().includes(query) ||
          char.backstory.toLowerCase().includes(query)) {
        results.push({ ...char, type: 'character' });
      }
    });
    
    // Search locations
    (locationsQuery.data || []).forEach((loc: Location) => {
      if (loc.name.toLowerCase().includes(query) || 
          loc.description.toLowerCase().includes(query)) {
        results.push({ ...loc, type: 'location' });
      }
    });
    
    // Search items
    (itemsQuery.data || []).forEach((item: Item) => {
      if (item.name.toLowerCase().includes(query) || 
          item.description.toLowerCase().includes(query)) {
        results.push({ ...item, type: 'item' });
      }
    });
    
    // Search factions
    (factionsQuery.data || []).forEach((faction: Faction) => {
      if (faction.name.toLowerCase().includes(query) || 
          faction.ideology.toLowerCase().includes(query)) {
        results.push({ ...faction, type: 'faction' });
      }
    });
    
    // Search lore notes
    (loreNotesQuery.data || []).forEach((note: LoreNote) => {
      if (note.title.toLowerCase().includes(query) || 
          note.content.toLowerCase().includes(query)) {
        results.push({ ...note, type: 'lore' });
      }
    });
    
    // Search magic systems
    (magicSystemsQuery.data || []).forEach((magic: MagicSystem) => {
      if (magic.name.toLowerCase().includes(query) || 
          magic.type.toLowerCase().includes(query) ||
          magic.source.toLowerCase().includes(query)) {
        results.push({ ...magic, type: 'magicSystem' });
      }
    });
    
    // Search mythologies
    (mythologiesQuery.data || []).forEach((myth: Mythology) => {
      if (myth.name.toLowerCase().includes(query) || 
          myth.origin.toLowerCase().includes(query)) {
        results.push({ ...myth, type: 'mythology' });
      }
    });
    
    // Search series
    (seriesQuery.data || []).forEach((series: Series) => {
      if (series.title.toLowerCase().includes(query) || 
          series.description?.toLowerCase().includes(query) ||
          series.genre?.toLowerCase().includes(query)) {
        results.push({ ...series, type: 'series' });
      }
    });
    
    // Search books
    (booksQuery.data || []).forEach((book: Book) => {
      if (book.title.toLowerCase().includes(query) || 
          book.description?.toLowerCase().includes(query) ||
          book.outline?.toLowerCase().includes(query)) {
        results.push({ ...book, type: 'book' });
      }
    });
    
    // Search voice captures
    (voiceCapturesQuery.data || []).forEach((voice: VoiceCapture) => {
      if (voice.title.toLowerCase().includes(query) || 
          voice.transcript.toLowerCase().includes(query)) {
        results.push({ ...voice, type: 'voiceCapture' });
      }
    });
    
    return results;
  }, [searchQuery, currentWorld, charactersQuery.data, locationsQuery.data, itemsQuery.data, factionsQuery.data, loreNotesQuery.data, magicSystemsQuery.data, mythologiesQuery.data, seriesQuery.data, booksQuery.data, voiceCapturesQuery.data]);
  
  // Sync-specific functions
  const syncWorld = useCallback(async (worldId?: string) => {
    try {
      const targetWorldId = worldId || currentWorld?.id;
      if (!targetWorldId) throw new Error('No world specified for sync');
      
      await syncManager.syncAll();
      
      // Invalidate all queries to refresh with synced data
      queryClient.invalidateQueries({ queryKey: ['worlds'] });
      queryClient.invalidateQueries({ queryKey: ['characters', targetWorldId] });
      queryClient.invalidateQueries({ queryKey: ['locations', targetWorldId] });
      queryClient.invalidateQueries({ queryKey: ['items', targetWorldId] });
      queryClient.invalidateQueries({ queryKey: ['factions', targetWorldId] });
      queryClient.invalidateQueries({ queryKey: ['timelines', targetWorldId] });
      queryClient.invalidateQueries({ queryKey: ['loreNotes', targetWorldId] });
      queryClient.invalidateQueries({ queryKey: ['magicSystems', targetWorldId] });
      queryClient.invalidateQueries({ queryKey: ['mythologies', targetWorldId] });
      queryClient.invalidateQueries({ queryKey: ['series', targetWorldId] });
      queryClient.invalidateQueries({ queryKey: ['books', targetWorldId] });
      queryClient.invalidateQueries({ queryKey: ['voiceCaptures', targetWorldId] });
    } catch (error) {
      console.error('Failed to sync world:', error);
      throw error;
    }
  }, [currentWorld, queryClient]);
  
  const enableSyncForWorld = useCallback(async (worldId: string) => {
    try {
      await syncManager.updateSettings({ enabled: true });
      await syncManager.migrateToSync();
      await syncWorld(worldId);
    } catch (error) {
      console.error('Failed to enable sync for world:', error);
      throw error;
    }
  }, [syncWorld]);
  
  const disableSyncForWorld = useCallback(async (worldId: string) => {
    try {
      await syncManager.updateSettings({ enabled: false });
    } catch (error) {
      console.error('Failed to disable sync for world:', error);
      throw error;
    }
  }, []);
  
  const resolveConflict = useCallback(async (conflictId: string, resolution: any) => {
    try {
      await syncManager.resolveConflict(conflictId, resolution);
      setSyncConflicts(syncManager.getConflicts());
      
      // Refresh relevant queries after conflict resolution
      if (currentWorld) {
        queryClient.invalidateQueries({ queryKey: ['characters', currentWorld.id] });
        queryClient.invalidateQueries({ queryKey: ['locations', currentWorld.id] });
        queryClient.invalidateQueries({ queryKey: ['items', currentWorld.id] });
        queryClient.invalidateQueries({ queryKey: ['factions', currentWorld.id] });
        queryClient.invalidateQueries({ queryKey: ['timelines', currentWorld.id] });
        queryClient.invalidateQueries({ queryKey: ['loreNotes', currentWorld.id] });
        queryClient.invalidateQueries({ queryKey: ['magicSystems', currentWorld.id] });
        queryClient.invalidateQueries({ queryKey: ['mythologies', currentWorld.id] });
        queryClient.invalidateQueries({ queryKey: ['series', currentWorld.id] });
        queryClient.invalidateQueries({ queryKey: ['books', currentWorld.id] });
        queryClient.invalidateQueries({ queryKey: ['voiceCaptures', currentWorld.id] });
      }
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      throw error;
    }
  }, [currentWorld, queryClient]);
  
  return {
    currentWorld,
    setCurrentWorld,
    
    worlds: worldsQuery.data || [],
    createWorld: async (world: Omit<World, 'id' | 'createdAt' | 'updatedAt'>) => { await createWorldMutation.mutateAsync(world); },
    updateWorld: async (id: string, updates: Partial<World>) => { await updateWorldMutation.mutateAsync({ id, updates }); },
    deleteWorld: async (id: string) => { await deleteWorldMutation.mutateAsync(id); },
    
    characters: charactersQuery.data || [],
    createCharacter: async (character: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => { await createCharacterMutation.mutateAsync(character); },
    updateCharacter: async (id: string, updates: Partial<Character>) => { await updateCharacterMutation.mutateAsync({ id, updates }); },
    deleteCharacter: async (id: string) => { await deleteCharacterMutation.mutateAsync(id); },
    
    locations: locationsQuery.data || [],
    createLocation: async (location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>) => { await createLocationMutation.mutateAsync(location); },
    updateLocation: async (id: string, updates: Partial<Location>) => { await updateLocationMutation.mutateAsync({ id, updates }); },
    deleteLocation: async (id: string) => { await deleteLocationMutation.mutateAsync(id); },
    
    items: itemsQuery.data || [],
    createItem: async (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => { await createItemMutation.mutateAsync(item); },
    updateItem: async (id: string, updates: Partial<Item>) => { await updateItemMutation.mutateAsync({ id, updates }); },
    deleteItem: async (id: string) => { await deleteItemMutation.mutateAsync(id); },
    
    factions: factionsQuery.data || [],
    createFaction: async (faction: Omit<Faction, 'id' | 'createdAt' | 'updatedAt'>) => { await createFactionMutation.mutateAsync(faction); },
    updateFaction: async (id: string, updates: Partial<Faction>) => { await updateFactionMutation.mutateAsync({ id, updates }); },
    deleteFaction: async (id: string) => { await deleteFactionMutation.mutateAsync(id); },
    
    timelines: timelinesQuery.data || [],
    createTimeline: async (timeline: Omit<Timeline, 'id' | 'createdAt' | 'updatedAt'>) => { await createTimelineMutation.mutateAsync(timeline); },
    updateTimeline: async (id: string, updates: Partial<Timeline>) => { await updateTimelineMutation.mutateAsync({ id, updates }); },
    deleteTimeline: async (id: string) => { await deleteTimelineMutation.mutateAsync(id); },
    
    loreNotes: loreNotesQuery.data || [],
    createLoreNote: async (note: Omit<LoreNote, 'id' | 'createdAt' | 'updatedAt'>) => { await createLoreNoteMutation.mutateAsync(note); },
    updateLoreNote: async (id: string, updates: Partial<LoreNote>) => { await updateLoreNoteMutation.mutateAsync({ id, updates }); },
    deleteLoreNote: async (id: string) => { await deleteLoreNoteMutation.mutateAsync(id); },
    
    magicSystems: magicSystemsQuery.data || [],
    createMagicSystem: async (magicSystem: Omit<MagicSystem, 'id' | 'createdAt' | 'updatedAt'>) => { await createMagicSystemMutation.mutateAsync(magicSystem); },
    updateMagicSystem: async (id: string, updates: Partial<MagicSystem>) => { await updateMagicSystemMutation.mutateAsync({ id, updates }); },
    deleteMagicSystem: async (id: string) => { await deleteMagicSystemMutation.mutateAsync(id); },
    
    mythologies: mythologiesQuery.data || [],
    createMythology: async (mythology: Omit<Mythology, 'id' | 'createdAt' | 'updatedAt'>) => { await createMythologyMutation.mutateAsync(mythology); },
    updateMythology: async (id: string, updates: Partial<Mythology>) => { await updateMythologyMutation.mutateAsync({ id, updates }); },
    deleteMythology: async (id: string) => { await deleteMythologyMutation.mutateAsync(id); },
    
    series: seriesQuery.data || [],
    createSeries: async (series: Omit<Series, 'id' | 'createdAt' | 'updatedAt'>) => { await createSeriesMutation.mutateAsync(series); },
    updateSeries: async (id: string, updates: Partial<Series>) => { await updateSeriesMutation.mutateAsync({ id, updates }); },
    deleteSeries: async (id: string) => { await deleteSeriesMutation.mutateAsync(id); },
    
    books: booksQuery.data || [],
    createBook: async (book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => { await createBookMutation.mutateAsync(book); },
    updateBook: async (id: string, updates: Partial<Book>) => { await updateBookMutation.mutateAsync({ id, updates }); },
    deleteBook: async (id: string) => { await deleteBookMutation.mutateAsync(id); },
    
    voiceCaptures: voiceCapturesQuery.data || [],
    createVoiceCapture: async (capture: Omit<VoiceCapture, 'id' | 'createdAt'>) => { await createVoiceCaptureMutation.mutateAsync(capture); },
    updateVoiceCapture: async (id: string, updates: Partial<VoiceCapture>) => { await updateVoiceCaptureMutation.mutateAsync({ id, updates }); },
    deleteVoiceCapture: async (id: string) => { await deleteVoiceCaptureMutation.mutateAsync(id); },
    
    snapshots: snapshotsQuery.data || [],
    createSnapshot: async (name: string) => { await createSnapshotMutation.mutateAsync(name); },
    restoreSnapshot: async (snapshotId: string) => { await restoreSnapshotMutation.mutateAsync(snapshotId); },
    deleteSnapshot: async (id: string) => { await deleteSnapshotMutation.mutateAsync(id); },
    
    searchQuery,
    setSearchQuery,
    searchResults,
    
    // Sync features
    syncStatus,
    syncConflicts,
    syncWorld,
    enableSyncForWorld,
    disableSyncForWorld,
    resolveConflict,
    isOnline,
    syncEnabled,
    
    importData: async (data: ImportedData) => {
      if (!currentWorld) throw new Error('No world selected');
      
      // Import each entity type
      if (data.characters) {
        for (const char of data.characters) {
          if (char.name) {
            await createCharacterMutation.mutateAsync({
              worldId: currentWorld.id,
              name: char.name,
              role: char.role || '',
              traits: char.traits || [],
              appearance: char.appearance || '',
              backstory: char.backstory || '',
              relationships: char.relationships || [],
              factionIds: char.factionIds || [],
              locationIds: char.locationIds || [],
              notes: char.notes || '',
            });
          }
        }
      }
      
      if (data.locations) {
        for (const loc of data.locations) {
          if (loc.name) {
            await createLocationMutation.mutateAsync({
              worldId: currentWorld.id,
              name: loc.name,
              type: loc.type || '',
              description: loc.description || '',
              significance: loc.significance || '',
              inhabitants: loc.inhabitants || [],
              connectedLocations: loc.connectedLocations || [],
              notes: loc.notes || '',
            });
          }
        }
      }
      
      if (data.items) {
        for (const item of data.items) {
          if (item.name) {
            await createItemMutation.mutateAsync({
              worldId: currentWorld.id,
              name: item.name,
              type: item.type || '',
              description: item.description || '',
              powers: item.powers || '',
              history: item.history || '',
              currentOwner: item.currentOwner || '',
              notes: item.notes || '',
            });
          }
        }
      }
      
      if (data.factions) {
        for (const faction of data.factions) {
          if (faction.name) {
            await createFactionMutation.mutateAsync({
              worldId: currentWorld.id,
              name: faction.name,
              type: faction.type || '',
              ideology: faction.ideology || '',
              goals: faction.goals || [],
              leaders: faction.leaders || [],
              memberIds: faction.memberIds || [],
              allies: faction.allies || [],
              enemies: faction.enemies || [],
              notes: faction.notes || '',
            });
          }
        }
      }
      
      if (data.magicSystems) {
        for (const magic of data.magicSystems) {
          if (magic.name) {
            await createMagicSystemMutation.mutateAsync({
              worldId: currentWorld.id,
              name: magic.name,
              type: magic.type || '',
              source: magic.source || '',
              rules: magic.rules || [],
              limitations: magic.limitations || [],
              practitioners: magic.practitioners || [],
              schools: magic.schools || [],
              artifacts: magic.artifacts || [],
              history: magic.history || '',
              notes: magic.notes || '',
            });
          }
        }
      }
      
      if (data.mythologies) {
        for (const myth of data.mythologies) {
          if (myth.name) {
            await createMythologyMutation.mutateAsync({
              worldId: currentWorld.id,
              name: myth.name,
              type: myth.type || 'belief',
              origin: myth.origin || '',
              deities: myth.deities || [],
              beliefs: myth.beliefs || [],
              rituals: myth.rituals || [],
              followers: myth.followers || [],
              holyTexts: myth.holyTexts || [],
              symbols: myth.symbols || [],
              history: myth.history || '',
              notes: myth.notes || '',
            });
          }
        }
      }
      
      if (data.series) {
        for (const series of data.series) {
          if (series.title) {
            await createSeriesMutation.mutateAsync({
              worldId: currentWorld.id,
              title: series.title,
              description: series.description || '',
              genre: series.genre || '',
              status: series.status || 'planning',
              targetAudience: series.targetAudience || '',
              themes: series.themes || [],
              books: series.books || [],
              notes: series.notes || '',
            });
          }
        }
      }
      
      if (data.books) {
        for (const book of data.books) {
          if (book.title) {
            await createBookMutation.mutateAsync({
              worldId: currentWorld.id,
              title: book.title,
              seriesId: book.seriesId || null,
              synopsis: book.synopsis || '',
              genre: book.genre || '',
              status: book.status || 'planning',
              wordCount: book.wordCount || 0,
              chapters: book.chapters || [],
              characters: book.characters || [],
              notes: book.notes || '',
            });
          }
        }
      }
      
      if (data.voiceCaptures) {
        for (const voice of data.voiceCaptures) {
          if (voice.title) {
            await createVoiceCaptureMutation.mutateAsync({
              worldId: currentWorld.id,
              title: voice.title,
              transcript: voice.transcript || '',
              audioUrl: voice.audioUrl,
              processed: voice.processed || false,
            });
          }
        }
      }
      
      if (data.loreNotes) {
        for (const note of data.loreNotes) {
          if (note.title) {
            await createLoreNoteMutation.mutateAsync({
              worldId: currentWorld.id,
              title: note.title,
              content: note.content || '',
              category: note.category || '',
              tags: note.tags || [],
              linkedEntities: note.linkedEntities || [],
            });
          }
        }
      }
    },
    
    exportWorld: async () => {
      if (!currentWorld) throw new Error('No world selected');
      
      const worldData = {
        world: currentWorld,
        characters: charactersQuery.data || [],
        locations: locationsQuery.data || [],
        items: itemsQuery.data || [],
        factions: factionsQuery.data || [],
        timelines: timelinesQuery.data || [],
        loreNotes: loreNotesQuery.data || [],
        magicSystems: magicSystemsQuery.data || [],
        mythologies: mythologiesQuery.data || [],
        series: seriesQuery.data || [],
        books: booksQuery.data || [],
        voiceCaptures: voiceCapturesQuery.data || [],
        exportedAt: new Date().toISOString(),
      };
      
      return JSON.stringify(worldData, null, 2);
    },
    
    isLoading: worldsQuery.isLoading || charactersQuery.isLoading || locationsQuery.isLoading,
  };
});

