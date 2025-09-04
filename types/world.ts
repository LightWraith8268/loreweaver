export interface World {
  id: string;
  name: string;
  description: string;
  genre: WorldGenre;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  template?: WorldTemplate;
  tags?: string[];
  isOfflineMode?: boolean;
  series?: Series[];
}

export type WorldGenre = 
  | 'fantasy' | 'high-fantasy' | 'dark-fantasy' | 'urban-fantasy' | 'epic-fantasy'
  | 'sci-fi' | 'space-opera' | 'cyberpunk' | 'steampunk' | 'biopunk' | 'dystopian'
  | 'horror' | 'cosmic-horror' | 'gothic-horror' | 'supernatural-horror'
  | 'mystery' | 'detective' | 'noir' | 'thriller'
  | 'historical' | 'alternate-history' | 'historical-fiction'
  | 'mythology' | 'folklore' | 'legend'
  | 'adventure' | 'swashbuckling' | 'exploration'
  | 'romance' | 'paranormal-romance' | 'romantic-fantasy'
  | 'western' | 'weird-west' | 'space-western'
  | 'post-apocalyptic' | 'zombie' | 'survival'
  | 'superhero' | 'comic-book' | 'pulp'
  | 'slice-of-life' | 'contemporary' | 'literary'
  | 'comedy' | 'satire' | 'parody'
  | 'experimental' | 'surreal' | 'magical-realism'
  | 'custom';

export interface WorldTemplate {
  id: string;
  name: string;
  genre: string;
  description: string;
  presetCharacters?: Partial<Character>[];
  presetLocations?: Partial<Location>[];
  presetFactions?: Partial<Faction>[];
  presetMagicSystems?: Partial<MagicSystem>[];
  presetMythologies?: Partial<Mythology>[];
  governmentStructure?: GovernmentStructure;
  magicFramework?: MagicFramework;
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
  archetype?: CharacterArchetype;
  voicePattern?: string;
  portrait?: string;
  dependencies?: EntityDependency[];
  crossReferences?: CrossReference[];
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
  era?: string;
  region?: string;
  alternateVersions?: AlternateEvent[];
  dependencies?: string[];
}

export interface AlternateEvent {
  id: string;
  title: string;
  description: string;
  probability: number;
  consequences: string[];
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

export type EntityType = 'character' | 'location' | 'item' | 'faction' | 'lore' | 'timeline' | 'snapshot' | 'magicSystem' | 'mythology' | 'template' | 'research';

export interface CharacterArchetype {
  id: string;
  name: string;
  description: string;
  commonTraits: string[];
  typicalRoles: string[];
  motivations: string[];
  flaws: string[];
}

export interface GovernmentStructure {
  type: 'monarchy' | 'democracy' | 'theocracy' | 'oligarchy' | 'anarchy' | 'federation' | 'empire' | 'tribal' | 'custom';
  description: string;
  powerStructure: string[];
  laws: string[];
  institutions: string[];
}

export interface MagicFramework {
  type: 'hard' | 'soft' | 'hybrid';
  description: string;
  guidelines: string[];
  restrictions: string[];
  consequences: string[];
}

export interface CrossReference {
  entityId: string;
  entityType: EntityType;
  entityName: string;
  referenceType: 'mentioned' | 'related' | 'dependent' | 'conflicted';
  context: string;
}

export interface EntityDependency {
  dependsOn: string;
  dependencyType: 'requires' | 'enhances' | 'conflicts';
  description: string;
}

export interface ConsistencyWarning {
  id: string;
  type: 'contradiction' | 'missing_reference' | 'timeline_conflict' | 'relationship_mismatch';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedEntities: string[];
  suggestions: string[];
}

export interface PlotHook {
  id: string;
  title: string;
  description: string;
  involvedEntities: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  genre: string[];
  tags: string[];
}

export interface VoiceCapture {
  id: string;
  worldId: string;
  title: string;
  transcript: string;
  audioUrl?: string;
  processed: boolean;
  createdAt: string;
}

export interface ResearchNote {
  id: string;
  worldId: string;
  title: string;
  content: string;
  source: string;
  category: 'mythology' | 'history' | 'culture' | 'geography' | 'technology' | 'other';
  tags: string[];
  linkedEntities: LinkedEntity[];
  createdAt: string;
  updatedAt: string;
}

export interface ExportOptions {
  format: 'json' | 'pdf' | 'roll20' | 'foundry' | 'novel';
  includeImages: boolean;
  includePrivateNotes: boolean;
  sections: string[];
}

export interface Series {
  id: string;
  worldId: string;
  title: string;
  description: string;
  genre: string;
  status: 'planning' | 'writing' | 'editing' | 'published' | 'completed';
  books: Book[];
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  id: string;
  seriesId: string;
  title: string;
  description: string;
  status: 'planning' | 'outlining' | 'writing' | 'editing' | 'published' | 'completed';
  wordCount: number;
  targetWordCount?: number;
  chapters: Chapter[];
  outline: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  bookId: string;
  title: string;
  content: string;
  summary: string;
  wordCount: number;
  status: 'planning' | 'writing' | 'editing' | 'completed';
  order: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AISettings {
  providers: {
    openai?: { apiKey: string; enabled: boolean };
    anthropic?: { apiKey: string; enabled: boolean };
    google?: { apiKey: string; enabled: boolean };
    cohere?: { apiKey: string; enabled: boolean };
    huggingface?: { apiKey: string; enabled: boolean };
    groq?: { apiKey: string; enabled: boolean };
    together?: { apiKey: string; enabled: boolean };
    replicate?: { apiKey: string; enabled: boolean };
    fireworks?: { apiKey: string; enabled: boolean };
  };
  defaultModels: {
    textGeneration: string;
    imageGeneration: string;
    speechToText: string;
    textToSpeech: string;
    translation: string;
    summarization: string;
  };
  freeKeys: {
    huggingface: string;
    cohere: string;
    groq: string;
    together: string;
    replicate: string;
    fireworks: string;
  };
}

export interface TypographySettings {
  fontFamily: 'System' | 'Raleway' | 'Georgia' | 'Times' | 'Helvetica' | 'Arial';
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  lineHeight: 'tight' | 'normal' | 'relaxed' | 'loose';
}

export interface AppSettings {
  theme: 'dark' | 'light';
  ai: AISettings;
  offlineMode: boolean;
  autoSave: boolean;
  backupFrequency: 'never' | 'daily' | 'weekly' | 'monthly';
  exportFormat: 'json' | 'pdf';
  language: string;
  typography: TypographySettings;
}

export interface NovelExtraction {
  characters: Partial<Character>[];
  locations: Partial<Location>[];
  items: Partial<Item>[];
  factions: Partial<Faction>[];
  events: Partial<TimelineEvent>[];
  themes: string[];
  plotPoints: string[];
  worldBuilding: string[];
}