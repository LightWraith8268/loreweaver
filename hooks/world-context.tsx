import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import type { World, Character, Location, Item, Faction, Timeline, LoreNote, WorldSnapshot, EntityType } from '@/types/world';

interface WorldContextType {
  // Current world
  currentWorld: World | null;
  setCurrentWorld: (world: World | null) => void;
  
  // Worlds
  worlds: World[];
  createWorld: (world: Omit<World, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateWorld: (id: string, updates: Partial<World>) => Promise<void>;
  deleteWorld: (id: string) => Promise<void>;
  
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
  
  // Snapshots
  snapshots: WorldSnapshot[];
  createSnapshot: (name: string) => Promise<void>;
  restoreSnapshot: (snapshotId: string) => Promise<void>;
  deleteSnapshot: (id: string) => Promise<void>;
  
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
  
  // Load all data from AsyncStorage
  const worldsQuery = useQuery({
    queryKey: ['worlds'],
    queryFn: async () => {
      const data = await AsyncStorage.getItem('worlds');
      return data ? JSON.parse(data) : [];
    },
  });
  
  const charactersQuery = useQuery({
    queryKey: ['characters', currentWorld?.id],
    queryFn: async () => {
      if (!currentWorld) return [];
      const data = await AsyncStorage.getItem(`characters_${currentWorld.id}`);
      return data ? JSON.parse(data) : [];
    },
    enabled: !!currentWorld,
  });
  
  const locationsQuery = useQuery({
    queryKey: ['locations', currentWorld?.id],
    queryFn: async () => {
      if (!currentWorld) return [];
      const data = await AsyncStorage.getItem(`locations_${currentWorld.id}`);
      return data ? JSON.parse(data) : [];
    },
    enabled: !!currentWorld,
  });
  
  const itemsQuery = useQuery({
    queryKey: ['items', currentWorld?.id],
    queryFn: async () => {
      if (!currentWorld) return [];
      const data = await AsyncStorage.getItem(`items_${currentWorld.id}`);
      return data ? JSON.parse(data) : [];
    },
    enabled: !!currentWorld,
  });
  
  const factionsQuery = useQuery({
    queryKey: ['factions', currentWorld?.id],
    queryFn: async () => {
      if (!currentWorld) return [];
      const data = await AsyncStorage.getItem(`factions_${currentWorld.id}`);
      return data ? JSON.parse(data) : [];
    },
    enabled: !!currentWorld,
  });
  
  const timelinesQuery = useQuery({
    queryKey: ['timelines', currentWorld?.id],
    queryFn: async () => {
      if (!currentWorld) return [];
      const data = await AsyncStorage.getItem(`timelines_${currentWorld.id}`);
      return data ? JSON.parse(data) : [];
    },
    enabled: !!currentWorld,
  });
  
  const loreNotesQuery = useQuery({
    queryKey: ['loreNotes', currentWorld?.id],
    queryFn: async () => {
      if (!currentWorld) return [];
      const data = await AsyncStorage.getItem(`loreNotes_${currentWorld.id}`);
      return data ? JSON.parse(data) : [];
    },
    enabled: !!currentWorld,
  });
  
  const snapshotsQuery = useQuery({
    queryKey: ['snapshots', currentWorld?.id],
    queryFn: async () => {
      if (!currentWorld) return [];
      const data = await AsyncStorage.getItem(`snapshots_${currentWorld.id}`);
      return data ? JSON.parse(data) : [];
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
  
  // World mutations
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
      await AsyncStorage.setItem('worlds', JSON.stringify(updated));
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
      await AsyncStorage.setItem('worlds', JSON.stringify(updated));
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
      await AsyncStorage.setItem('worlds', JSON.stringify(updated));
      // Clean up all related data
      await AsyncStorage.removeItem(`characters_${id}`);
      await AsyncStorage.removeItem(`locations_${id}`);
      await AsyncStorage.removeItem(`items_${id}`);
      await AsyncStorage.removeItem(`factions_${id}`);
      await AsyncStorage.removeItem(`timelines_${id}`);
      await AsyncStorage.removeItem(`loreNotes_${id}`);
      await AsyncStorage.removeItem(`snapshots_${id}`);
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['worlds'], data);
      if (currentWorld && !data.find((w: World) => w.id === currentWorld.id)) {
        setCurrentWorld(null);
      }
    },
  });
  
  // Generic entity mutations
  const createEntityMutation = (type: EntityType) => useMutation({
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
      await AsyncStorage.setItem(key, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (data, _, context) => {
      queryClient.setQueryData([`${type}s`, currentWorld?.id], data);
    },
  });
  
  const updateEntityMutation = (type: EntityType) => useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      if (!currentWorld) throw new Error('No world selected');
      const key = `${type}s_${currentWorld.id}`;
      const existing = await AsyncStorage.getItem(key);
      const entities = existing ? JSON.parse(existing) : [];
      const updated = entities.map((e: any) => 
        e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
      );
      await AsyncStorage.setItem(key, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData([`${type}s`, currentWorld?.id], data);
    },
  });
  
  const deleteEntityMutation = (type: EntityType) => useMutation({
    mutationFn: async (id: string) => {
      if (!currentWorld) throw new Error('No world selected');
      const key = `${type}s_${currentWorld.id}`;
      const existing = await AsyncStorage.getItem(key);
      const entities = existing ? JSON.parse(existing) : [];
      const updated = entities.filter((e: any) => e.id !== id);
      await AsyncStorage.setItem(key, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData([`${type}s`, currentWorld?.id], data);
    },
  });
  
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
    
    return results;
  }, [searchQuery, currentWorld, charactersQuery.data, locationsQuery.data, itemsQuery.data, factionsQuery.data, loreNotesQuery.data]);
  
  return {
    currentWorld,
    setCurrentWorld,
    
    worlds: worldsQuery.data || [],
    createWorld: async (world: Omit<World, 'id' | 'createdAt' | 'updatedAt'>) => { await createWorldMutation.mutateAsync(world); },
    updateWorld: async (id: string, updates: Partial<World>) => { await updateWorldMutation.mutateAsync({ id, updates }); },
    deleteWorld: async (id: string) => { await deleteWorldMutation.mutateAsync(id); },
    
    characters: charactersQuery.data || [],
    createCharacter: async (character: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => { await createEntityMutation('character').mutateAsync(character); },
    updateCharacter: async (id: string, updates: Partial<Character>) => { await updateEntityMutation('character').mutateAsync({ id, updates }); },
    deleteCharacter: async (id: string) => { await deleteEntityMutation('character').mutateAsync(id); },
    
    locations: locationsQuery.data || [],
    createLocation: async (location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>) => { await createEntityMutation('location').mutateAsync(location); },
    updateLocation: async (id: string, updates: Partial<Location>) => { await updateEntityMutation('location').mutateAsync({ id, updates }); },
    deleteLocation: async (id: string) => { await deleteEntityMutation('location').mutateAsync(id); },
    
    items: itemsQuery.data || [],
    createItem: async (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => { await createEntityMutation('item').mutateAsync(item); },
    updateItem: async (id: string, updates: Partial<Item>) => { await updateEntityMutation('item').mutateAsync({ id, updates }); },
    deleteItem: async (id: string) => { await deleteEntityMutation('item').mutateAsync(id); },
    
    factions: factionsQuery.data || [],
    createFaction: async (faction: Omit<Faction, 'id' | 'createdAt' | 'updatedAt'>) => { await createEntityMutation('faction').mutateAsync(faction); },
    updateFaction: async (id: string, updates: Partial<Faction>) => { await updateEntityMutation('faction').mutateAsync({ id, updates }); },
    deleteFaction: async (id: string) => { await deleteEntityMutation('faction').mutateAsync(id); },
    
    timelines: timelinesQuery.data || [],
    createTimeline: async (timeline: Omit<Timeline, 'id' | 'createdAt' | 'updatedAt'>) => { await createEntityMutation('timeline').mutateAsync(timeline); },
    updateTimeline: async (id: string, updates: Partial<Timeline>) => { await updateEntityMutation('timeline').mutateAsync({ id, updates }); },
    deleteTimeline: async (id: string) => { await deleteEntityMutation('timeline').mutateAsync(id); },
    
    loreNotes: loreNotesQuery.data || [],
    createLoreNote: async (note: Omit<LoreNote, 'id' | 'createdAt' | 'updatedAt'>) => { await createEntityMutation('lore').mutateAsync(note); },
    updateLoreNote: async (id: string, updates: Partial<LoreNote>) => { await updateEntityMutation('lore').mutateAsync({ id, updates }); },
    deleteLoreNote: async (id: string) => { await deleteEntityMutation('lore').mutateAsync(id); },
    
    snapshots: snapshotsQuery.data || [],
    createSnapshot: async (name: string) => { await createSnapshotMutation.mutateAsync(name); },
    restoreSnapshot: async (snapshotId: string) => { await restoreSnapshotMutation.mutateAsync(snapshotId); },
    deleteSnapshot: async (id: string) => { await deleteEntityMutation('snapshot').mutateAsync(id); },
    
    searchQuery,
    setSearchQuery,
    searchResults,
    
    isLoading: worldsQuery.isLoading || charactersQuery.isLoading || locationsQuery.isLoading,
  };
});