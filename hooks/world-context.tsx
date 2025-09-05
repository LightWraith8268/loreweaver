import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';

import type { World, Character, Location, Item, Faction, Timeline, LoreNote, WorldSnapshot, EntityType, MagicSystem, Mythology, ImportedData } from '@/types/world';

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
  
  const magicSystemsQuery = useQuery({
    queryKey: ['magicSystems', currentWorld?.id],
    queryFn: async () => {
      if (!currentWorld) return [];
      const data = await AsyncStorage.getItem(`magicSystems_${currentWorld.id}`);
      return data ? JSON.parse(data) : [];
    },
    enabled: !!currentWorld,
  });
  
  const mythologiesQuery = useQuery({
    queryKey: ['mythologies', currentWorld?.id],
    queryFn: async () => {
      if (!currentWorld) return [];
      const data = await AsyncStorage.getItem(`mythologies_${currentWorld.id}`);
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
      await AsyncStorage.removeItem(`magicSystems_${id}`);
      await AsyncStorage.removeItem(`mythologies_${id}`);
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
        magicSystems: magicSystemsQuery.data || [],
        mythologies: mythologiesQuery.data || [],
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
    
    return results;
  }, [searchQuery, currentWorld, charactersQuery.data, locationsQuery.data, itemsQuery.data, factionsQuery.data, loreNotesQuery.data, magicSystemsQuery.data, mythologiesQuery.data]);
  
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
    
    magicSystems: magicSystemsQuery.data || [],
    createMagicSystem: async (magicSystem: Omit<MagicSystem, 'id' | 'createdAt' | 'updatedAt'>) => { await createEntityMutation('magicSystem').mutateAsync(magicSystem); },
    updateMagicSystem: async (id: string, updates: Partial<MagicSystem>) => { await updateEntityMutation('magicSystem').mutateAsync({ id, updates }); },
    deleteMagicSystem: async (id: string) => { await deleteEntityMutation('magicSystem').mutateAsync(id); },
    
    mythologies: mythologiesQuery.data || [],
    createMythology: async (mythology: Omit<Mythology, 'id' | 'createdAt' | 'updatedAt'>) => { await createEntityMutation('mythology').mutateAsync(mythology); },
    updateMythology: async (id: string, updates: Partial<Mythology>) => { await updateEntityMutation('mythology').mutateAsync({ id, updates }); },
    deleteMythology: async (id: string) => { await deleteEntityMutation('mythology').mutateAsync(id); },
    
    snapshots: snapshotsQuery.data || [],
    createSnapshot: async (name: string) => { await createSnapshotMutation.mutateAsync(name); },
    restoreSnapshot: async (snapshotId: string) => { await restoreSnapshotMutation.mutateAsync(snapshotId); },
    deleteSnapshot: async (id: string) => { await deleteEntityMutation('snapshot').mutateAsync(id); },
    
    searchQuery,
    setSearchQuery,
    searchResults,
    
    importData: async (data: ImportedData) => {
      if (!currentWorld) throw new Error('No world selected');
      
      // Import each entity type
      if (data.characters) {
        for (const char of data.characters) {
          if (char.name) {
            await createEntityMutation('character').mutateAsync({
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
            await createEntityMutation('location').mutateAsync({
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
            await createEntityMutation('item').mutateAsync({
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
            await createEntityMutation('faction').mutateAsync({
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
            await createEntityMutation('magicSystem').mutateAsync({
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
            await createEntityMutation('mythology').mutateAsync({
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
      
      if (data.loreNotes) {
        for (const note of data.loreNotes) {
          if (note.title) {
            await createEntityMutation('lore').mutateAsync({
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
        exportedAt: new Date().toISOString(),
      };
      
      return JSON.stringify(worldData, null, 2);
    },
    
    isLoading: worldsQuery.isLoading || charactersQuery.isLoading || locationsQuery.isLoading,
  };
});