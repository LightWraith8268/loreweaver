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
  format: 'json' | 'docx' | 'pdf' | 'txt' | 'markdown' | 'roll20' | 'foundry' | 'novel' | 'epub';
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
    rork?: { apiKey: string; enabled: boolean };
    openai?: { apiKey: string; enabled: boolean };
    anthropic?: { apiKey: string; enabled: boolean };
    google?: { apiKey: string; enabled: boolean };
    cohere?: { apiKey: string; enabled: boolean };
    huggingface?: { apiKey: string; enabled: boolean };
    groq?: { apiKey: string; enabled: boolean };
    together?: { apiKey: string; enabled: boolean };
    replicate?: { apiKey: string; enabled: boolean };
    fireworks?: { apiKey: string; enabled: boolean };
    perplexity?: { apiKey: string; enabled: boolean };
    mistral?: { apiKey: string; enabled: boolean };
    deepseek?: { apiKey: string; enabled: boolean };
    ollama?: { apiKey: string; enabled: boolean };
    lmstudio?: { apiKey: string; enabled: boolean };
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
    rork: string;
    huggingface: string;
    cohere: string;
    groq: string;
    together: string;
    replicate: string;
    fireworks: string;
    perplexity: string;
    mistral: string;
    google: string;
    deepseek: string;
    ollama: string;
    lmstudio: string;
  };
}

export interface TypographySettings {
  fontFamily: 'System' | 'Raleway' | 'Georgia' | 'Times' | 'Helvetica' | 'Arial';
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  lineHeight: 'tight' | 'normal' | 'relaxed' | 'loose';
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'sepia' | 'forest' | 'ocean' | 'sunset' | 'cyberpunk' | 'royal' | 'mint';
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

// 1. Foundations
export interface Premise {
  id: string;
  worldId: string;
  centralIdea: string;
  tone: string;
  motifs: string[];
  themes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GenreStyleNotes {
  id: string;
  worldId: string;
  toneRules: string[];
  pacingGuidelines: string[];
  humorLevel: 'none' | 'light' | 'moderate' | 'heavy';
  seriousnessLevel: 'light' | 'moderate' | 'serious' | 'dark';
  narrativeStyle: string;
  createdAt: string;
  updatedAt: string;
}

export interface SeriesScope {
  id: string;
  worldId: string;
  plannedBooks: number;
  arcs: SeriesArc[];
  metaStoryOverview: string;
  createdAt: string;
  updatedAt: string;
}

export interface SeriesArc {
  id: string;
  name: string;
  description: string;
  bookRange: { start: number; end: number };
  themes: string[];
  keyEvents: string[];
}

// 2. Worldbuilding
export interface Cosmology {
  id: string;
  worldId: string;
  creationMyths: string[];
  gods: Deity[];
  spirits: Spirit[];
  legends: Legend[];
  cosmicLaws: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Spirit {
  id: string;
  name: string;
  type: string;
  domain: string[];
  description: string;
  powers: string[];
  weaknesses: string[];
}

export interface Legend {
  id: string;
  title: string;
  summary: string;
  fullStory: string;
  culturalSignificance: string;
  involvedEntities: string[];
}

export interface Geography {
  id: string;
  worldId: string;
  continents: Continent[];
  planets: Planet[];
  starSystems: StarSystem[];
  climates: Climate[];
  terrain: TerrainType[];
  travelRoutes: TravelRoute[];
  createdAt: string;
  updatedAt: string;
}

export interface Continent {
  id: string;
  name: string;
  description: string;
  size: string;
  climate: string;
  majorFeatures: string[];
  nations: string[];
}

export interface Planet {
  id: string;
  name: string;
  type: string;
  size: string;
  atmosphere: string;
  gravity: string;
  dayLength: string;
  yearLength: string;
  moons: string[];
  continents: string[];
}

export interface StarSystem {
  id: string;
  name: string;
  starType: string;
  planets: string[];
  asteroidBelts: string[];
  specialFeatures: string[];
}

export interface Climate {
  id: string;
  name: string;
  temperature: string;
  precipitation: string;
  seasons: string[];
  weatherPatterns: string[];
}

export interface TerrainType {
  id: string;
  name: string;
  description: string;
  commonFeatures: string[];
  resources: string[];
  dangers: string[];
}

export interface TravelRoute {
  id: string;
  name: string;
  startLocation: string;
  endLocation: string;
  distance: string;
  travelTime: string;
  difficulty: 'easy' | 'moderate' | 'hard' | 'extreme';
  dangers: string[];
  waypoints: string[];
}

export interface Culture {
  id: string;
  worldId: string;
  name: string;
  type: 'nation' | 'tribe' | 'faction' | 'society';
  socialHierarchy: string[];
  customs: string[];
  traditions: string[];
  values: string[];
  taboos: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Politics {
  id: string;
  worldId: string;
  governmentType: string;
  keyLeaders: Leader[];
  powerStructures: PowerStructure[];
  currentConflicts: Conflict[];
  alliances: Alliance[];
  createdAt: string;
  updatedAt: string;
}

export interface Leader {
  id: string;
  name: string;
  title: string;
  faction: string;
  personality: string[];
  goals: string[];
  allies: string[];
  enemies: string[];
}

export interface PowerStructure {
  id: string;
  name: string;
  type: string;
  hierarchy: string[];
  influence: 'local' | 'regional' | 'national' | 'global';
  resources: string[];
}

export interface Conflict {
  id: string;
  name: string;
  type: 'war' | 'political' | 'economic' | 'social' | 'religious';
  parties: string[];
  causes: string[];
  currentStatus: string;
  potentialOutcomes: string[];
}

export interface Alliance {
  id: string;
  name: string;
  members: string[];
  purpose: string;
  terms: string[];
  duration: string;
  benefits: string[];
}

export interface Economics {
  id: string;
  worldId: string;
  currencies: Currency[];
  resources: Resource[];
  tradeHubs: TradeHub[];
  blackMarkets: BlackMarket[];
  economicSystems: EconomicSystem[];
  createdAt: string;
  updatedAt: string;
}

export interface Currency {
  id: string;
  name: string;
  type: 'coin' | 'paper' | 'digital' | 'barter' | 'energy' | 'other';
  value: string;
  acceptedRegions: string[];
  appearance: string;
  history: string;
}

export interface Resource {
  id: string;
  name: string;
  type: 'natural' | 'manufactured' | 'magical' | 'technological';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  uses: string[];
  locations: string[];
  value: string;
}

export interface TradeHub {
  id: string;
  name: string;
  location: string;
  specialties: string[];
  majorTraders: string[];
  regulations: string[];
  reputation: string;
}

export interface BlackMarket {
  id: string;
  name: string;
  location: string;
  goods: string[];
  contacts: string[];
  risks: string[];
  accessRequirements: string[];
}

export interface EconomicSystem {
  id: string;
  name: string;
  type: 'capitalism' | 'socialism' | 'feudalism' | 'barter' | 'gift' | 'mixed' | 'other';
  description: string;
  regions: string[];
  advantages: string[];
  disadvantages: string[];
}

export interface Technology {
  id: string;
  worldId: string;
  name: string;
  type: 'mechanical' | 'electrical' | 'digital' | 'biological' | 'magical' | 'hybrid';
  description: string;
  capabilities: string[];
  limitations: string[];
  requirements: string[];
  inventors: string[];
  users: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Religion {
  id: string;
  worldId: string;
  name: string;
  type: 'monotheistic' | 'polytheistic' | 'pantheistic' | 'animistic' | 'philosophical' | 'cult';
  deities: string[];
  beliefs: string[];
  rituals: Ritual[];
  sacredTexts: SacredText[];
  taboos: string[];
  clergy: string[];
  followers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Ritual {
  id: string;
  name: string;
  purpose: string;
  participants: string[];
  requirements: string[];
  steps: string[];
  frequency: string;
  significance: string;
}

export interface SacredText {
  id: string;
  title: string;
  author: string;
  content: string;
  significance: string;
  interpretations: string[];
}

export interface DailyLife {
  id: string;
  worldId: string;
  culture: string;
  food: FoodCulture;
  fashion: Fashion;
  architecture: Architecture;
  festivals: Festival[];
  slang: SlangTerm[];
  etiquette: EtiquetteRule[];
  createdAt: string;
  updatedAt: string;
}

export interface FoodCulture {
  staples: string[];
  delicacies: string[];
  cookingMethods: string[];
  mealTimes: string[];
  dietaryRestrictions: string[];
  beverages: string[];
}

export interface Fashion {
  commonClothing: string[];
  formalWear: string[];
  materials: string[];
  colors: string[];
  accessories: string[];
  seasonalVariations: string[];
}

export interface Architecture {
  housingTypes: string[];
  publicBuildings: string[];
  materials: string[];
  styles: string[];
  decorativeElements: string[];
  cityPlanning: string[];
}

export interface Festival {
  id: string;
  name: string;
  purpose: string;
  duration: string;
  activities: string[];
  traditions: string[];
  participants: string[];
  significance: string;
}

export interface SlangTerm {
  term: string;
  meaning: string;
  usage: string;
  origin: string;
  commonality: 'rare' | 'uncommon' | 'common' | 'widespread';
}

export interface EtiquetteRule {
  situation: string;
  rule: string;
  importance: 'minor' | 'moderate' | 'major' | 'critical';
  consequences: string;
}

// 3. Enhanced Characters
export interface CharacterProfile {
  id: string;
  worldId: string;
  basicInfo: Character;
  personality: PersonalityProfile;
  arc: CharacterArc;
  relationships: DetailedRelationship[];
  secrets: Secret[];
  goals: Goal[];
  fears: Fear[];
  createdAt: string;
  updatedAt: string;
}

export interface PersonalityProfile {
  traits: string[];
  strengths: string[];
  weaknesses: string[];
  motivations: string[];
  flaws: string[];
  quirks: string[];
  speechPatterns: string[];
  mannerisms: string[];
}

export interface CharacterArc {
  startingPoint: string;
  keyMilestones: Milestone[];
  endingPoint: string;
  growth: string[];
  challenges: string[];
  transformations: string[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  bookNumber?: number;
  chapterNumber?: number;
  significance: string;
}

export interface DetailedRelationship {
  characterId: string;
  characterName: string;
  type: string;
  description: string;
  history: string;
  currentStatus: string;
  dynamics: string[];
  conflicts: string[];
  development: string[];
}

export interface Secret {
  id: string;
  title: string;
  description: string;
  knownBy: string[];
  consequences: string[];
  revealConditions: string[];
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'planning' | 'active' | 'completed' | 'failed' | 'abandoned';
  obstacles: string[];
  progress: string[];
}

export interface Fear {
  id: string;
  title: string;
  description: string;
  origin: string;
  severity: 'mild' | 'moderate' | 'severe' | 'phobic';
  triggers: string[];
  coping: string[];
}

// 4. Species & Peoples
export interface Species {
  id: string;
  worldId: string;
  name: string;
  type: 'humanoid' | 'beast' | 'elemental' | 'construct' | 'undead' | 'plant' | 'other';
  physicalTraits: PhysicalTraits;
  abilities: SpeciesAbility[];
  culture: string;
  language: Language;
  reproduction: ReproductionInfo;
  lifespan: string;
  habitat: string[];
  diet: string;
  socialStructure: string;
  createdAt: string;
  updatedAt: string;
}

export interface PhysicalTraits {
  averageHeight: string;
  averageWeight: string;
  appearance: string[];
  distinctiveFeatures: string[];
  variations: string[];
  senses: SenseInfo[];
}

export interface SenseInfo {
  sense: 'sight' | 'hearing' | 'smell' | 'taste' | 'touch' | 'other';
  acuity: 'poor' | 'normal' | 'enhanced' | 'supernatural';
  specialProperties: string[];
}

export interface SpeciesAbility {
  id: string;
  name: string;
  description: string;
  type: 'natural' | 'magical' | 'technological' | 'psionic';
  limitations: string[];
  development: string;
}

export interface Language {
  id: string;
  name: string;
  type: 'spoken' | 'written' | 'gestural' | 'telepathic' | 'chemical' | 'other';
  phonetics: string;
  writingSystem: string;
  grammar: string[];
  vocabulary: VocabularyEntry[];
  dialects: string[];
  speakers: string[];
}

export interface VocabularyEntry {
  word: string;
  meaning: string;
  pronunciation: string;
  usage: string;
  etymology: string;
}

export interface ReproductionInfo {
  method: string;
  gestation: string;
  maturity: string;
  fertility: string;
  specialRequirements: string[];
}

// 5. Enhanced Factions & Organizations
export interface Organization {
  id: string;
  worldId: string;
  name: string;
  type: 'military' | 'guild' | 'corporation' | 'resistance' | 'religious' | 'academic' | 'criminal' | 'other';
  purpose: string;
  structure: OrganizationStructure;
  membership: MembershipInfo;
  resources: OrganizationResource[];
  operations: Operation[];
  reputation: ReputationInfo;
  history: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationStructure {
  hierarchy: string[];
  leadership: string[];
  departments: Department[];
  decisionMaking: string;
  communication: string[];
}

export interface Department {
  id: string;
  name: string;
  purpose: string;
  head: string;
  members: string[];
  responsibilities: string[];
}

export interface MembershipInfo {
  totalMembers: number;
  requirements: string[];
  benefits: string[];
  obligations: string[];
  ranks: Rank[];
  recruitment: string[];
}

export interface Rank {
  id: string;
  name: string;
  level: number;
  requirements: string[];
  privileges: string[];
  responsibilities: string[];
}

export interface OrganizationResource {
  type: 'financial' | 'material' | 'information' | 'personnel' | 'magical' | 'technological';
  description: string;
  quantity: string;
  accessibility: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
}

export interface Operation {
  id: string;
  name: string;
  type: 'ongoing' | 'planned' | 'completed' | 'failed' | 'cancelled';
  description: string;
  objectives: string[];
  participants: string[];
  timeline: string;
  status: string;
  secrecy: 'public' | 'internal' | 'classified' | 'top-secret';
}

export interface ReputationInfo {
  public: string;
  government: string;
  rivals: string;
  allies: string;
  factors: string[];
}

// 6. Enhanced Systems & Rules
export interface PhysicsRules {
  id: string;
  worldId: string;
  gravity: string;
  physics: string[];
  naturalLaws: string[];
  exceptions: string[];
  magicalInteractions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TimeSystem {
  id: string;
  worldId: string;
  dayLength: string;
  weekLength: string;
  monthLength: string;
  yearLength: string;
  seasons: Season[];
  calendar: CalendarSystem;
  timeZones: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Season {
  name: string;
  duration: string;
  characteristics: string[];
  festivals: string[];
  activities: string[];
}

export interface CalendarSystem {
  name: string;
  type: string;
  months: Month[];
  weekdays: string[];
  holidays: Holiday[];
  eras: Era[];
}

export interface Month {
  name: string;
  days: number;
  season: string;
  significance: string;
}

export interface Holiday {
  name: string;
  date: string;
  type: 'religious' | 'cultural' | 'political' | 'seasonal' | 'personal';
  celebration: string[];
  significance: string;
}

export interface Era {
  name: string;
  startYear: number;
  endYear?: number;
  description: string;
  keyEvents: string[];
}

export interface Ecology {
  id: string;
  worldId: string;
  ecosystems: Ecosystem[];
  flora: Flora[];
  fauna: Fauna[];
  naturalHazards: NaturalHazard[];
  foodChains: FoodChain[];
  createdAt: string;
  updatedAt: string;
}

export interface Ecosystem {
  id: string;
  name: string;
  type: string;
  climate: string;
  keySpecies: string[];
  plantLife: string[];
  animalLife: string[];
  threats: string[];
  balance: string;
}

export interface Flora {
  id: string;
  name: string;
  type: string;
  habitat: string[];
  appearance: string;
  properties: string[];
  uses: string[];
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  seasonality: string;
}

export interface Fauna {
  id: string;
  name: string;
  type: string;
  habitat: string[];
  appearance: string;
  behavior: string[];
  diet: string;
  abilities: string[];
  threat: 'harmless' | 'minor' | 'moderate' | 'dangerous' | 'deadly';
  intelligence: string;
}

export interface NaturalHazard {
  id: string;
  name: string;
  type: string;
  frequency: string;
  severity: string;
  affectedAreas: string[];
  warnings: string[];
  mitigation: string[];
}

export interface FoodChain {
  id: string;
  ecosystem: string;
  levels: FoodChainLevel[];
  keyRelationships: string[];
  disruptions: string[];
}

export interface FoodChainLevel {
  level: number;
  name: string;
  organisms: string[];
  role: string;
}

// 7. Plot Infrastructure
export interface PlotArc {
  id: string;
  worldId: string;
  title: string;
  type: 'main' | 'subplot' | 'character' | 'world' | 'mystery';
  scope: 'chapter' | 'book' | 'series';
  description: string;
  beats: PlotBeat[];
  themes: string[];
  characters: string[];
  locations: string[];
  foreshadowing: ForeshadowingElement[];
  createdAt: string;
  updatedAt: string;
}

export interface PlotBeat {
  id: string;
  title: string;
  description: string;
  type: 'setup' | 'inciting' | 'plot1' | 'midpoint' | 'plot2' | 'climax' | 'resolution';
  order: number;
  bookNumber?: number;
  chapterNumber?: number;
  characters: string[];
  locations: string[];
  consequences: string[];
}

export interface ForeshadowingElement {
  id: string;
  title: string;
  description: string;
  plantLocation: string;
  payoffLocation: string;
  subtlety: 'obvious' | 'moderate' | 'subtle' | 'hidden';
  type: 'event' | 'character' | 'object' | 'dialogue' | 'symbol';
}

export interface RecurringSymbol {
  id: string;
  worldId: string;
  name: string;
  type: 'visual' | 'auditory' | 'object' | 'concept' | 'phrase';
  description: string;
  meaning: string[];
  appearances: SymbolAppearance[];
  evolution: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SymbolAppearance {
  location: string;
  context: string;
  significance: string;
  bookNumber?: number;
  chapterNumber?: number;
}

// 8. Artifacts & Objects
export interface Artifact {
  id: string;
  worldId: string;
  name: string;
  type: 'weapon' | 'armor' | 'tool' | 'jewelry' | 'book' | 'relic' | 'technology' | 'other';
  description: string;
  appearance: string;
  powers: ArtifactPower[];
  history: ArtifactHistory;
  requirements: string[];
  limitations: string[];
  currentLocation: string;
  currentOwner?: string;
  significance: 'minor' | 'moderate' | 'major' | 'legendary';
  createdAt: string;
  updatedAt: string;
}

export interface ArtifactPower {
  name: string;
  description: string;
  activation: string;
  cost: string;
  limitations: string[];
  sideEffects: string[];
}

export interface ArtifactHistory {
  origin: string;
  creator: string;
  previousOwners: PreviousOwner[];
  keyEvents: string[];
  legends: string[];
}

export interface PreviousOwner {
  name: string;
  period: string;
  relationship: string;
  fate: string;
}

export interface TradeGood {
  id: string;
  worldId: string;
  name: string;
  type: string;
  description: string;
  value: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'exotic';
  sources: string[];
  uses: string[];
  markets: string[];
  regulations: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Text {
  id: string;
  worldId: string;
  title: string;
  type: 'prophecy' | 'history' | 'manual' | 'fiction' | 'religious' | 'scientific' | 'magical';
  author: string;
  content: string;
  language: string;
  age: string;
  condition: string;
  copies: number;
  significance: string;
  interpretations: string[];
  createdAt: string;
  updatedAt: string;
}

// 9. Meta Tools
export interface GlossaryEntry {
  id: string;
  worldId: string;
  term: string;
  definition: string;
  pronunciation?: string;
  category: string;
  relatedTerms: string[];
  examples: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StyleGuide {
  id: string;
  worldId: string;
  namingRules: NamingRule[];
  capitalization: CapitalizationRule[];
  pronunciation: PronunciationGuide[];
  consistency: ConsistencyRule[];
  createdAt: string;
  updatedAt: string;
}

export interface NamingRule {
  category: string;
  pattern: string;
  examples: string[];
  exceptions: string[];
}

export interface CapitalizationRule {
  type: string;
  rule: string;
  examples: string[];
}

export interface PronunciationGuide {
  term: string;
  pronunciation: string;
  audioFile?: string;
  notes: string;
}

export interface ConsistencyRule {
  element: string;
  rule: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  examples: string[];
}

export interface VisualReference {
  id: string;
  worldId: string;
  title: string;
  type: 'map' | 'sketch' | 'heraldry' | 'clothing' | 'architecture' | 'creature' | 'other';
  description: string;
  imageUrl?: string;
  tags: string[];
  relatedEntities: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ContinuityTracker {
  id: string;
  worldId: string;
  rules: ContinuityRule[];
  violations: ContinuityViolation[];
  lastCheck: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContinuityRule {
  id: string;
  category: string;
  rule: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  checkMethod: string;
}

export interface ContinuityViolation {
  id: string;
  ruleId: string;
  description: string;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  affectedEntities: string[];
  suggestions: string[];
  resolved: boolean;
  discoveredAt: string;
}

export interface SeriesBible {
  id: string;
  worldId: string;
  version: string;
  lastUpdated: string;
  changes: BibleChange[];
  sections: BibleSection[];
  createdAt: string;
}

export interface BibleChange {
  id: string;
  date: string;
  description: string;
  category: string;
  impact: 'minor' | 'moderate' | 'major';
  author: string;
}

export interface BibleSection {
  id: string;
  title: string;
  content: string;
  lastModified: string;
  version: string;
}

// 10. Bonus Content
export interface BonusStory {
  id: string;
  worldId: string;
  title: string;
  type: 'short-story' | 'myth' | 'legend' | 'historical-account' | 'character-backstory';
  content: string;
  characters: string[];
  locations: string[];
  timeframe: string;
  canonStatus: 'canon' | 'semi-canon' | 'non-canon' | 'alternate';
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoreEntry {
  id: string;
  worldId: string;
  title: string;
  type: 'myth' | 'legend' | 'history' | 'culture' | 'technology' | 'magic' | 'other';
  content: string;
  sources: string[];
  reliability: 'factual' | 'mostly-true' | 'disputed' | 'legendary' | 'mythical';
  relatedEntities: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// AI Generation Types
export interface AIGenerationRequest {
  type: 'character' | 'location' | 'item' | 'faction' | 'magic' | 'mythology' | 'lore' | 'timeline' | 'species' | 'organization';
  subtype?: string;
  worldContext?: string;
  additionalPrompts?: string[];
  count?: number;
  style?: string;
  complexity?: 'simple' | 'moderate' | 'complex' | 'detailed';
}

export interface CharacterGenerationOptions {
  archetype: 'main-character' | 'secondary-character' | 'villain' | 'mentor' | 'comic-relief' | 'love-interest' | 'rival' | 'ally' | 'neutral' | 'random';
  role?: string;
  faction?: string;
  species?: string;
  personalityTraits?: string[];
  background?: string;
}

export interface LocationGenerationOptions {
  type: 'city' | 'village' | 'wilderness' | 'dungeon' | 'castle' | 'temple' | 'ruins' | 'landmark' | 'region' | 'random';
  size?: 'small' | 'medium' | 'large' | 'massive';
  climate?: string;
  culture?: string;
  significance?: string;
}

export interface ItemGenerationOptions {
  type: 'weapon' | 'armor' | 'tool' | 'artifact' | 'consumable' | 'treasure' | 'mundane' | 'magical' | 'technological' | 'random';
  rarity?: 'common' | 'uncommon' | 'rare' | 'legendary';
  power?: 'none' | 'minor' | 'moderate' | 'major' | 'legendary';
  origin?: string;
}

export interface FactionGenerationOptions {
  type: 'government' | 'military' | 'religious' | 'criminal' | 'merchant' | 'academic' | 'secret' | 'rebel' | 'tribal' | 'random';
  size?: 'small' | 'medium' | 'large' | 'massive';
  influence?: 'local' | 'regional' | 'national' | 'global';
  alignment?: string;
  goals?: string[];
}

export interface MagicGenerationOptions {
  type: 'elemental' | 'divine' | 'arcane' | 'natural' | 'blood' | 'mind' | 'time' | 'space' | 'death' | 'life' | 'random';
  complexity?: 'simple' | 'moderate' | 'complex';
  restrictions?: string[];
  source?: string;
}

export interface MythologyGenerationOptions {
  type: 'pantheon' | 'religion' | 'cult' | 'philosophy' | 'legend' | 'myth' | 'folklore' | 'random';
  scope?: 'local' | 'regional' | 'global';
  theme?: string;
  deityCount?: number;
}