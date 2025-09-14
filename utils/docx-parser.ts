import mammoth from 'mammoth';
import type { ImportedData } from '@/types/world';

export interface DocxParseResult {
  success: boolean;
  data?: ImportedData;
  error?: string;
}

export async function parseDocxFile(file: File): Promise<DocxParseResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;

    if (!text.trim()) {
      return {
        success: false,
        error: 'Document appears to be empty',
      };
    }

    const parsedData = parseWorldbuildingText(text);
    
    return {
      success: true,
      data: parsedData,
    };
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse document',
    };
  }
}

function parseWorldbuildingText(text: string): ImportedData {
  const data: ImportedData = {
    characters: [],
    locations: [],
    items: [],
    factions: [],
    magicSystems: [],
    mythologies: [],
    loreNotes: [],
  };

  // Split text into sections based on common headers
  const sections = splitIntoSections(text);

  sections.forEach(section => {
    const { type, content } = section;
    
    switch (type) {
      case 'character':
      case 'characters':
        data.characters?.push(...parseCharacters(content));
        break;
      case 'location':
      case 'locations':
      case 'place':
      case 'places':
        data.locations?.push(...parseLocations(content));
        break;
      case 'item':
      case 'items':
      case 'artifact':
      case 'artifacts':
        data.items?.push(...parseItems(content));
        break;
      case 'faction':
      case 'factions':
      case 'organization':
      case 'organizations':
        data.factions?.push(...parseFactions(content));
        break;
      case 'magic':
      case 'magic system':
      case 'magic systems':
        data.magicSystems?.push(...parseMagicSystems(content));
        break;
      case 'mythology':
      case 'mythologies':
      case 'religion':
      case 'religions':
      case 'pantheon':
        data.mythologies?.push(...parseMythologies(content));
        break;
      default:
        // Treat as lore note
        if (content.trim()) {
          data.loreNotes?.push({
            title: type || 'Imported Note',
            content: content.trim(),
            category: 'Imported',
            tags: ['imported'],
            linkedEntities: [],
          });
        }
        break;
    }
  });

  return data;
}

function splitIntoSections(text: string): Array<{ type: string; content: string }> {
  const sections: Array<{ type: string; content: string }> = [];
  
  // Common section headers
  const headerPatterns = [
    /^(#{1,6}\s*)?(.+?)$/gm, // Markdown headers
    /^(.+?)\n[-=]{3,}$/gm, // Underlined headers
    /^([A-Z][A-Z\s]+)$/gm, // ALL CAPS headers
  ];

  // Split by double newlines first
  const paragraphs = text.split(/\n\s*\n/);
  let currentSection = { type: '', content: '' };

  paragraphs.forEach(paragraph => {
    const trimmed = paragraph.trim();
    if (!trimmed) return;

    // Check if this looks like a header
    const isHeader = headerPatterns.some(pattern => {
      pattern.lastIndex = 0;
      return pattern.test(trimmed) && trimmed.length < 100;
    });

    if (isHeader) {
      // Save previous section
      if (currentSection.content.trim()) {
        sections.push({ ...currentSection });
      }
      
      // Start new section
      currentSection = {
        type: trimmed.toLowerCase().replace(/[#\-=]/g, '').trim(),
        content: '',
      };
    } else {
      // Add to current section
      currentSection.content += (currentSection.content ? '\n\n' : '') + trimmed;
    }
  });

  // Add final section
  if (currentSection.content.trim()) {
    sections.push(currentSection);
  }

  return sections;
}

function parseCharacters(content: string): Array<Partial<import('@/types/world').Character>> {
  const characters: Array<Partial<import('@/types/world').Character>> = [];
  const entries = splitEntries(content);

  entries.forEach(entry => {
    const name = extractField(entry, ['name', 'character']) || extractFirstLine(entry);
    if (name) {
      characters.push({
        name,
        role: extractField(entry, ['role', 'class', 'profession', 'job']) || '',
        traits: extractList(entry, ['traits', 'characteristics', 'personality']),
        appearance: extractField(entry, ['appearance', 'looks', 'description']) || '',
        backstory: extractField(entry, ['backstory', 'background', 'history']) || '',
        relationships: [],
        factionIds: [],
        locationIds: [],
        notes: entry,
      });
    }
  });

  return characters;
}

function parseLocations(content: string): Array<Partial<import('@/types/world').Location>> {
  const locations: Array<Partial<import('@/types/world').Location>> = [];
  const entries = splitEntries(content);

  entries.forEach(entry => {
    const name = extractField(entry, ['name', 'location', 'place']) || extractFirstLine(entry);
    if (name) {
      locations.push({
        name,
        type: extractField(entry, ['type', 'kind']) || '',
        description: extractField(entry, ['description', 'details']) || '',
        significance: extractField(entry, ['significance', 'importance']) || '',
        inhabitants: extractList(entry, ['inhabitants', 'residents', 'people']),
        connectedLocations: extractList(entry, ['connected', 'nearby', 'adjacent']),
        notes: entry,
      });
    }
  });

  return locations;
}

function parseItems(content: string): Array<Partial<import('@/types/world').Item>> {
  const items: Array<Partial<import('@/types/world').Item>> = [];
  const entries = splitEntries(content);

  entries.forEach(entry => {
    const name = extractField(entry, ['name', 'item', 'artifact']) || extractFirstLine(entry);
    if (name) {
      items.push({
        name,
        type: extractField(entry, ['type', 'kind', 'category']) || '',
        description: extractField(entry, ['description', 'details']) || '',
        powers: extractField(entry, ['powers', 'abilities', 'magic']) || '',
        history: extractField(entry, ['history', 'origin', 'background']) || '',
        currentOwner: extractField(entry, ['owner', 'holder', 'wielder']) || '',
        notes: entry,
      });
    }
  });

  return items;
}

function parseFactions(content: string): Array<Partial<import('@/types/world').Faction>> {
  const factions: Array<Partial<import('@/types/world').Faction>> = [];
  const entries = splitEntries(content);

  entries.forEach(entry => {
    const name = extractField(entry, ['name', 'faction', 'organization']) || extractFirstLine(entry);
    if (name) {
      factions.push({
        name,
        type: extractField(entry, ['type', 'kind']) || '',
        ideology: extractField(entry, ['ideology', 'beliefs', 'philosophy']) || '',
        goals: extractList(entry, ['goals', 'objectives', 'aims']),
        leaders: extractList(entry, ['leaders', 'leadership', 'rulers']),
        memberIds: [],
        allies: extractList(entry, ['allies', 'friends', 'partners']),
        enemies: extractList(entry, ['enemies', 'rivals', 'opponents']),
        notes: entry,
      });
    }
  });

  return factions;
}

function parseMagicSystems(content: string): Array<Partial<import('@/types/world').MagicSystem>> {
  const magicSystems: Array<Partial<import('@/types/world').MagicSystem>> = [];
  const entries = splitEntries(content);

  entries.forEach(entry => {
    const name = extractField(entry, ['name', 'system', 'magic']) || extractFirstLine(entry);
    if (name) {
      magicSystems.push({
        name,
        type: extractField(entry, ['type', 'kind', 'category']) || '',
        source: extractField(entry, ['source', 'origin']) || '',
        rules: extractList(entry, ['rules', 'laws', 'principles']),
        limitations: extractList(entry, ['limitations', 'restrictions', 'costs']),
        practitioners: extractList(entry, ['practitioners', 'users', 'mages']),
        schools: extractList(entry, ['schools', 'disciplines', 'branches']),
        artifacts: extractList(entry, ['artifacts', 'items', 'tools']),
        history: extractField(entry, ['history', 'background', 'development']) || '',
        notes: entry,
      });
    }
  });

  return magicSystems;
}

function parseMythologies(content: string): Array<Partial<import('@/types/world').Mythology>> {
  const mythologies: Array<Partial<import('@/types/world').Mythology>> = [];
  const entries = splitEntries(content);

  entries.forEach(entry => {
    const name = extractField(entry, ['name', 'mythology', 'religion']) || extractFirstLine(entry);
    if (name) {
      mythologies.push({
        name,
        type: 'belief' as const,
        origin: extractField(entry, ['origin', 'creation', 'beginning']) || '',
        deities: [],
        beliefs: extractList(entry, ['beliefs', 'tenets', 'doctrines']),
        rituals: extractList(entry, ['rituals', 'ceremonies', 'practices']),
        followers: extractList(entry, ['followers', 'believers', 'adherents']),
        holyTexts: extractList(entry, ['texts', 'books', 'scriptures']),
        symbols: extractList(entry, ['symbols', 'icons', 'emblems']),
        history: extractField(entry, ['history', 'development']) || '',
        notes: entry,
      });
    }
  });

  return mythologies;
}

function splitEntries(content: string): string[] {
  // Split by bullet points, numbers, or double newlines
  const entries = content.split(/(?:\n\s*[-*•]\s*|\n\s*\d+\.\s*|\n\s*\n)/);
  return entries.filter(entry => entry.trim().length > 10);
}

function extractField(text: string, fieldNames: string[]): string | null {
  for (const fieldName of fieldNames) {
    const patterns = [
      new RegExp(`${fieldName}\\s*:(.+?)(?:\n|$)`, 'i'),
      new RegExp(`${fieldName}\\s*-(.+?)(?:\n|$)`, 'i'),
      new RegExp(`${fieldName}\\s*=(.+?)(?:\n|$)`, 'i'),
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
  }
  return null;
}

function extractList(text: string, fieldNames: string[]): string[] {
  const items: string[] = [];
  
  for (const fieldName of fieldNames) {
    const patterns = [
      new RegExp(`${fieldName}\\s*:(.+?)(?:\n\n|\n[A-Z]|$)`, 'is'),
      new RegExp(`${fieldName}\\s*-(.+?)(?:\n\n|\n[A-Z]|$)`, 'is'),
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const content = match[1].trim();
        // Split by commas, semicolons, or bullet points
        const splitItems = content.split(/[,;]|\n\s*[-*•]\s*/)
          .map(item => item.trim())
          .filter(item => item.length > 0);
        items.push(...splitItems);
        break;
      }
    }
  }

  return [...new Set(items)]; // Remove duplicates
}

function extractFirstLine(text: string): string {
  const lines = text.split('\n');
  const firstLine = lines[0].trim();
  
  // Remove common prefixes
  return firstLine
    .replace(/^[-*•]\s*/, '')
    .replace(/^\d+\.\s*/, '')
    .replace(/^name\s*[:=]\s*/i, '')
    .trim();
}

export type ParsedDocx = { blocks: any[] };

export function parseDocxContent(input?: ArrayBuffer | Uint8Array | string): ParsedDocx {
  // TODO: wire real parser; stub unblocks build
  return { blocks: [] };
}
