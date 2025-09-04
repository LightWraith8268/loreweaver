import createContextHook from '@nkzw/create-context-hook';
import { useState } from 'react';
import { useWorld } from '@/hooks/world-context';
import type { Character, Location, Item, Faction, LoreNote, EntityType } from '@/types/world';

interface AIContextType {
  isGenerating: boolean;
  expandCharacter: (character: Character) => Promise<Partial<Character>>;
  expandLocation: (location: Location) => Promise<Partial<Location>>;
  expandItem: (item: Item) => Promise<Partial<Item>>;
  expandFaction: (faction: Faction) => Promise<Partial<Faction>>;
  generateLoreNote: (prompt: string) => Promise<Partial<LoreNote>>;
  checkConsistency: () => Promise<string>;
  generateName: (type: EntityType) => Promise<string>;
  generateImage: (prompt: string) => Promise<string>;
  generateContent: (prompt: string, world?: any) => Promise<string>;
}

export const [AIProvider, useAI] = createContextHook<AIContextType>(() => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { currentWorld, characters, locations, items, factions, loreNotes } = useWorld();
  
  const getWorldContext = () => {
    if (!currentWorld) return '';
    
    return `World: ${currentWorld.name}
Genre: ${currentWorld.genre}
Description: ${currentWorld.description}

Characters: ${characters.map(c => c.name).join(', ')}
Locations: ${locations.map(l => l.name).join(', ')}
Factions: ${factions.map(f => f.name).join(', ')}
Items: ${items.map(i => i.name).join(', ')}`;
  };
  
  const makeAIRequest = async (messages: any[]) => {
    const response = await fetch('https://toolkit.rork.com/text/llm/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    
    if (!response.ok) throw new Error('AI request failed');
    const data = await response.json();
    return data.completion;
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

  return {
    isGenerating,
    expandCharacter,
    expandLocation,
    expandItem,
    expandFaction,
    generateLoreNote,
    checkConsistency,
    generateName,
    generateImage,
    generateContent,
  };
});