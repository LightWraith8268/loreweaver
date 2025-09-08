import createContextHook from '@nkzw/create-context-hook';
import { useState } from 'react';
import { useWorld } from '@/hooks/world-context';
import { requireInternetConnection } from '@/utils/network';
import type { Character, Location, Item, Faction, LoreNote, EntityType, MagicSystem, Mythology, ConsistencyWarning, PlotHook, VoiceCapture } from '@/types/world';
import { Platform } from 'react-native';

type CoreMessage = 
  | { role: 'system'; content: string; }
  | { role: 'user'; content: string | Array<{ type: 'text'; text: string; } | { type: 'image'; image: string; }>; }
  | { role: 'assistant'; content: string; };

interface AIContextType {
  isGenerating: boolean;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  expandCharacter: (character: Character) => Promise<Partial<Character>>;
  expandLocation: (location: Location) => Promise<Partial<Location>>;
  expandItem: (item: Item) => Promise<Partial<Item>>;
  expandFaction: (faction: Faction) => Promise<Partial<Faction>>;
  generateLoreNote: (prompt: string) => Promise<Partial<LoreNote>>;
  checkConsistency: () => Promise<string>;
  generateName: (type: EntityType) => Promise<string>;
  generateImage: (prompt: string) => Promise<string>;
  generateContent: (prompt: string, world?: any) => Promise<string>;
  expandMagicSystem: (magicSystem: MagicSystem) => Promise<Partial<MagicSystem>>;
  expandMythology: (mythology: Mythology) => Promise<Partial<Mythology>>;
  analyzeWorldConsistency: () => Promise<ConsistencyWarning[]>;
  generatePlotHooks: (count?: number) => Promise<PlotHook[]>;
  generateCharacterDialogue: (character: Character, context: string) => Promise<string>;
  suggestWorldExpansions: () => Promise<string[]>;
  generateCharacterPortrait: (character: Character) => Promise<string>;
  generateLocationArt: (location: Location) => Promise<string>;
  transcribeAudio: (audioFile: File | { uri: string; name: string; type: string }, language?: string) => Promise<{ text: string; language: string }>;
  editImage: (prompt: string, images: string[]) => Promise<string>;
}

export const [AIProvider, useAI] = createContextHook<AIContextType>(() => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { currentWorld, characters, locations, items, factions, loreNotes, magicSystems, mythologies } = useWorld();
  
  const getWorldContext = () => {
    if (!currentWorld) return '';
    
    return `World: ${currentWorld.name}
Genre: ${currentWorld.genre}
Description: ${currentWorld.description}

Characters: ${characters.map(c => c.name).join(', ')}
Locations: ${locations.map(l => l.name).join(', ')}
Factions: ${factions.map(f => f.name).join(', ')}
Items: ${items.map(i => i.name).join(', ')}
Magic Systems: ${magicSystems.map(m => m.name).join(', ')}
Mythologies: ${mythologies.map(m => m.name).join(', ')}`;
  };
  
  const makeAIRequest = async (messages: any[]) => {
    // Require internet connection for all AI requests
    await requireInternetConnection();
    
    try {
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI request failed:', response.status, errorText);
        throw new Error(`AI request failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.completion;
    } catch (error) {
      console.error('AI request error:', error);
      throw error;
    }
  };
  
  const expandCharacter = async (character: Character): Promise<Partial<Character>> => {
    setIsGenerating(true);
    try {
      const prompt = `You are a creative worldbuilding assistant. Expand this character with more details:

${getWorldContext()}

Character: ${character.name}
Role: ${character.role}
Current traits: ${character.traits.join(', ')}
Current backstory: ${character.backstory}

Generate an expanded version with:
1. More detailed personality traits (5-7 traits)
2. Physical appearance description
3. Expanded backstory with specific events
4. Potential relationships with other characters
5. Personal goals and motivations

Return as JSON with fields: traits (array), appearance, backstory, notes`;
      
      const completion = await makeAIRequest([
        { role: 'system', content: 'You are a creative worldbuilding assistant. Always return valid JSON.' },
        { role: 'user', content: prompt }
      ]);
      
      return JSON.parse(completion);
    } catch (error) {
      console.error('Error expanding character:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };
  
  const expandLocation = async (location: Location): Promise<Partial<Location>> => {
    setIsGenerating(true);
    try {
      const prompt = `Expand this location with more details:

${getWorldContext()}

Location: ${location.name}
Type: ${location.type}
Current description: ${location.description}

Generate an expanded version with:
1. Detailed description of the location
2. Historical significance
3. Notable inhabitants or visitors
4. Connected locations and travel routes
5. Unique features or landmarks

Return as JSON with fields: description, significance, inhabitants (array), notes`;
      
      const completion = await makeAIRequest([
        { role: 'system', content: 'You are a creative worldbuilding assistant. Always return valid JSON.' },
        { role: 'user', content: prompt }
      ]);
      
      return JSON.parse(completion);
    } catch (error) {
      console.error('Error expanding location:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };
  
  const expandItem = async (item: Item): Promise<Partial<Item>> => {
    setIsGenerating(true);
    try {
      const prompt = `Expand this item with more details:

${getWorldContext()}

Item: ${item.name}
Type: ${item.type}
Current description: ${item.description}

Generate an expanded version with:
1. Detailed physical description
2. Magical or technological properties
3. Historical background and creation story
4. Previous owners and their fates
5. Legends or rumors about the item

Return as JSON with fields: description, powers, history, notes`;
      
      const completion = await makeAIRequest([
        { role: 'system', content: 'You are a creative worldbuilding assistant. Always return valid JSON.' },
        { role: 'user', content: prompt }
      ]);
      
      return JSON.parse(completion);
    } catch (error) {
      console.error('Error expanding item:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };
  
  const expandFaction = async (faction: Faction): Promise<Partial<Faction>> => {
    setIsGenerating(true);
    try {
      const prompt = `Expand this faction with more details:

${getWorldContext()}

Faction: ${faction.name}
Type: ${faction.type}
Current ideology: ${faction.ideology}

Generate an expanded version with:
1. Detailed ideology and beliefs
2. Organizational structure
3. Short and long-term goals (3-5 each)
4. Key leaders and their roles
5. Relationships with other factions

Return as JSON with fields: ideology, goals (array), notes`;
      
      const completion = await makeAIRequest([
        { role: 'system', content: 'You are a creative worldbuilding assistant. Always return valid JSON.' },
        { role: 'user', content: prompt }
      ]);
      
      return JSON.parse(completion);
    } catch (error) {
      console.error('Error expanding faction:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generateLoreNote = async (prompt: string): Promise<Partial<LoreNote>> => {
    setIsGenerating(true);
    try {
      const aiPrompt = `Generate a lore note for this world based on the following prompt:

${getWorldContext()}

User prompt: ${prompt}

Create an interesting piece of lore that fits the world's genre and existing elements.

Return as JSON with fields: title, content, category, tags (array)`;
      
      const completion = await makeAIRequest([
        { role: 'system', content: 'You are a creative worldbuilding assistant. Always return valid JSON.' },
        { role: 'user', content: aiPrompt }
      ]);
      
      return JSON.parse(completion);
    } catch (error) {
      console.error('Error generating lore note:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };
  
  const checkConsistency = async (): Promise<string> => {
    setIsGenerating(true);
    try {
      const prompt = `Analyze this world for consistency issues:

${getWorldContext()}

Characters:
${characters.map(c => `- ${c.name}: ${c.role}`).join('\n')}

Locations:
${locations.map(l => `- ${l.name}: ${l.type}`).join('\n')}

Factions:
${factions.map(f => `- ${f.name}: ${f.ideology}`).join('\n')}

Check for:
1. Timeline inconsistencies
2. Character relationship conflicts
3. Geographic impossibilities
4. Technology/magic level inconsistencies
5. Faction ideology conflicts

Provide a brief report of any issues found or confirm consistency.`;
      
      const completion = await makeAIRequest([
        { role: 'system', content: 'You are a worldbuilding consistency checker.' },
        { role: 'user', content: prompt }
      ]);
      
      return completion;
    } catch (error) {
      console.error('Error checking consistency:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generateName = async (type: EntityType): Promise<string> => {
    setIsGenerating(true);
    try {
      const prompt = `Generate a unique ${type} name for this ${currentWorld?.genre || 'fantasy'} world.

${getWorldContext()}

Generate a single, creative name that fits the world's genre and naming conventions.
Return only the name, nothing else.`;
      
      const completion = await makeAIRequest([
        { role: 'system', content: 'You are a creative name generator. Return only the name.' },
        { role: 'user', content: prompt }
      ]);
      
      return completion.trim();
    } catch (error) {
      console.error('Error generating name:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generateImage = async (prompt: string): Promise<string> => {
    setIsGenerating(true);
    try {
      const response = await fetch('https://toolkit.rork.com/images/generate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `${currentWorld?.genre || 'fantasy'} style: ${prompt}`,
          size: '1024x1024'
        }),
      });
      
      if (!response.ok) throw new Error('Image generation failed');
      const data = await response.json();
      return `data:${data.image.mimeType};base64,${data.image.base64Data}`;
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const editImage = async (prompt: string, images: string[]): Promise<string> => {
    setIsGenerating(true);
    try {
      const response = await fetch('https://toolkit.rork.com/images/edit/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          images: images.map(image => ({ type: 'image', image: image.replace(/^data:image\/[^;]+;base64,/, '') })),
        }),
      });

      if (!response.ok) throw new Error('Failed to edit image');
      const data = await response.json();
      return `data:${data.image.mimeType};base64,${data.image.base64Data}`;
    } catch (error) {
      console.error('Error editing image:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const transcribeAudio = async (audioFile: File | { uri: string; name: string; type: string }, language?: string): Promise<{ text: string; language: string }> => {
    setIsGenerating(true);
    try {
      const formData = new FormData();
      
      if (Platform.OS === 'web') {
        formData.append('audio', audioFile as File);
      } else {
        formData.append('audio', audioFile as any);
      }
      
      if (language) {
        formData.append('language', language);
      }

      const response = await fetch('https://toolkit.rork.com/stt/transcribe/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to transcribe audio');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generateContent = async (prompt: string, world?: any): Promise<string> => {
    setIsGenerating(true);
    try {
      const contextPrompt = world ? `World Context: ${world.name} (${world.genre})\n\n${prompt}` : prompt;
      
      const completion = await makeAIRequest([
        { role: 'system', content: 'You are a creative worldbuilding assistant.' },
        { role: 'user', content: contextPrompt }
      ]);
      
      return completion;
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const expandMagicSystem = async (magicSystem: MagicSystem): Promise<Partial<MagicSystem>> => {
    setIsGenerating(true);
    try {
      const prompt = `Expand this magic system with more details:

${getWorldContext()}

Magic System: ${magicSystem.name}
Type: ${magicSystem.type}
Source: ${magicSystem.source}
Current rules: ${magicSystem.rules.join(', ')}

Generate an expanded version with:
1. More detailed rules and mechanics
2. Additional limitations and costs
3. Famous practitioners and their abilities
4. Magical schools or traditions
5. Legendary artifacts related to this system

Return as JSON with fields: rules (array), limitations (array), practitioners (array), schools (array), artifacts (array), history, notes`;
      
      const completion = await makeAIRequest([
        { role: 'system', content: 'You are a creative worldbuilding assistant. Always return valid JSON.' },
        { role: 'user', content: prompt }
      ]);
      
      return JSON.parse(completion);
    } catch (error) {
      console.error('Error expanding magic system:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const expandMythology = async (mythology: Mythology): Promise<Partial<Mythology>> => {
    setIsGenerating(true);
    try {
      const prompt = `Expand this mythology with more details:

${getWorldContext()}

Mythology: ${mythology.name}
Type: ${mythology.type}
Origin: ${mythology.origin}
Current beliefs: ${mythology.beliefs.join(', ')}

Generate an expanded version with:
1. More detailed beliefs and doctrines
2. Sacred rituals and ceremonies
3. Followers and their practices
4. Holy texts and scriptures
5. Religious symbols and their meanings

Return as JSON with fields: beliefs (array), rituals (array), followers (array), holyTexts (array), symbols (array), history, notes`;
      
      const completion = await makeAIRequest([
        { role: 'system', content: 'You are a creative worldbuilding assistant. Always return valid JSON.' },
        { role: 'user', content: prompt }
      ]);
      
      return JSON.parse(completion);
    } catch (error) {
      console.error('Error expanding mythology:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const [isRecording, setIsRecording] = useState(false);

  const analyzeWorldConsistency = async (): Promise<ConsistencyWarning[]> => {
    const worldData = {
      world: currentWorld,
      characters,
      locations,
      items,
      factions,
      loreNotes,
      magicSystems,
      mythologies
    };
    
    const systemPrompt = `You are a world-building consistency checker. Analyze the provided world data and identify potential contradictions, missing references, timeline conflicts, and relationship mismatches. Return a JSON array of consistency warnings.`;
    
    const prompt = `Analyze this world data for consistency issues:\n\n${JSON.stringify(worldData, null, 2)}\n\nIdentify contradictions, missing references, timeline conflicts, and relationship mismatches. Return only a JSON array of warnings with id, type, severity, description, affectedEntities, and suggestions fields.`;
    
    try {
      const result = await makeAIRequest([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ]);
      return JSON.parse(result);
    } catch (error) {
      console.error('Error analyzing world consistency:', error);
      return [];
    }
  };

  const generatePlotHooks = async (count = 5): Promise<PlotHook[]> => {
    const worldData = {
      world: currentWorld,
      characters: characters.slice(0, 10),
      locations: locations.slice(0, 10),
      factions: factions.slice(0, 5)
    };
    
    const systemPrompt = `You are a creative plot hook generator for tabletop RPGs and storytelling. Generate engaging plot hooks based on the world data provided.`;
    
    const prompt = `Based on this world data, generate ${count} creative plot hooks:\n\n${JSON.stringify(worldData, null, 2)}\n\nReturn only a JSON array of plot hooks with id, title, description, involvedEntities, difficulty, genre, and tags fields.`;
    
    try {
      const result = await makeAIRequest([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ]);
      return JSON.parse(result);
    } catch (error) {
      console.error('Error generating plot hooks:', error);
      return [];
    }
  };

  const generateCharacterDialogue = async (character: Character, context: string): Promise<string> => {
    const systemPrompt = `You are a character dialogue generator. Create authentic dialogue that matches the character's personality, background, and speech patterns.`;
    
    const prompt = `Generate dialogue for this character in the given context:\n\nCharacter: ${JSON.stringify(character, null, 2)}\n\nContext: ${context}\n\nReturn only the dialogue text, staying true to the character's voice and personality.`;
    
    return await makeAIRequest([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ]);
  };

  const suggestWorldExpansions = async (): Promise<string[]> => {
    const worldData = {
      world: currentWorld,
      characters: characters.length,
      locations: locations.length,
      factions: factions.length,
      magicSystems: magicSystems.length,
      mythologies: mythologies.length
    };
    
    const systemPrompt = `You are a world-building advisor. Analyze the provided world and suggest missing elements, cultures, conflicts, and other expansions that would enrich the setting.`;
    
    const prompt = `Analyze this world and suggest expansions:\n\n${JSON.stringify(worldData, null, 2)}\n\nSuggest missing elements like cultures, conflicts, locations, factions, or other world-building elements. Return a JSON array of suggestion strings.`;
    
    try {
      const result = await makeAIRequest([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ]);
      return JSON.parse(result);
    } catch (error) {
      console.error('Error suggesting world expansions:', error);
      return [];
    }
  };

  const generateCharacterPortrait = async (character: Character): Promise<string> => {
    const prompt = `A detailed portrait of ${character.name}, ${character.appearance || 'a fantasy character'}. ${character.role ? `They are a ${character.role}.` : ''} High quality digital art, fantasy style, detailed facial features, professional character portrait.`;
    
    return await generateImage(prompt);
  };

  const generateLocationArt = async (location: Location): Promise<string> => {
    const prompt = `A beautiful landscape artwork of ${location.name}, ${location.description || 'a fantasy location'}. ${location.type ? `This is a ${location.type}.` : ''} High quality digital art, detailed environment, atmospheric lighting, fantasy/sci-fi style.`;
    
    return await generateImage(prompt);
  };

  return {
    isGenerating,
    isRecording,
    setIsRecording,
    expandCharacter,
    expandLocation,
    expandItem,
    expandFaction,
    generateLoreNote,
    checkConsistency,
    generateName,
    generateImage,
    generateContent,
    expandMagicSystem,
    expandMythology,
    analyzeWorldConsistency,
    generatePlotHooks,
    generateCharacterDialogue,
    suggestWorldExpansions,
    generateCharacterPortrait,
    generateLocationArt,
    transcribeAudio,
    editImage,
  };
});