export interface World {
  id: string;
  name: string;
  description: string;
  genre: 'fantasy' | 'sci-fi' | 'cyberpunk' | 'mythology' | 'custom';
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
}

export interface Character {
  id: string;
  worldId: string;
  name: string;
  role: string;
  traits: string[];
  appearance: string;
  backstory: string;
  relationships: Relationship[];
  factionIds: string[];
  locationIds: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  worldId: string;
  name: string;
  type: string;
  description: string;
  significance: string;
  inhabitants: string[];
  connectedLocations: string[];
  notes: string;
  coordinates?: { x: number; y: number };
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  worldId: string;
  name: string;
  type: string;
  description: string;
  powers?: string;
  history: string;
  currentOwner?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Faction {
  id: string;
  worldId: string;
  name: string;
  type: string;
  ideology: string;
  goals: string[];
  leaders: string[];
  memberIds: string[];
  allies: string[];
  enemies: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Timeline {
  id: string;
  worldId: string;
  events: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  involvedCharacters: string[];
  involvedLocations: string[];
  significance: 'minor' | 'moderate' | 'major' | 'worldchanging';
}

export interface LoreNote {
  id: string;
  worldId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  linkedEntities: LinkedEntity[];
  createdAt: string;
  updatedAt: string;
}

export interface LinkedEntity {
  type: 'character' | 'location' | 'item' | 'faction';
  id: string;
  name: string;
}

export interface Relationship {
  characterId: string;
  characterName: string;
  type: string;
  description: string;
}

export interface MagicSystem {
  id: string;
  worldId: string;
  name: string;
  type: string;
  source: string;
  rules: string[];
  limitations: string[];
  practitioners: string[];
  schools?: string[];
  artifacts: string[];
  history: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Mythology {
  id: string;
  worldId: string;
  name: string;
  type: 'pantheon' | 'religion' | 'belief' | 'legend' | 'myth';
  origin: string;
  deities: Deity[];
  beliefs: string[];
  rituals: string[];
  followers: string[];
  holyTexts: string[];
  symbols: string[];
  history: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deity {
  id: string;
  name: string;
  domain: string[];
  description: string;
  symbols: string[];
  relationships: string[];
}

export interface WorldSnapshot {
  id: string;
  worldId: string;
  name: string;
  data: string;
  createdAt: string;
}

export interface ImportedData {
  characters?: Partial<Character>[];
  locations?: Partial<Location>[];
  items?: Partial<Item>[];
  factions?: Partial<Faction>[];
  magicSystems?: Partial<MagicSystem>[];
  mythologies?: Partial<Mythology>[];
  loreNotes?: Partial<LoreNote>[];
}

export type EntityType = 'character' | 'location' | 'item' | 'faction' | 'lore' | 'timeline' | 'snapshot' | 'magicSystem' | 'mythology';