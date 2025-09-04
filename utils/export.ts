import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import type { World, Character, Location, Item, Faction, Timeline, LoreNote, WorldSnapshot } from '@/types/world';

export interface WorldExportData {
  world: World;
  characters: Character[];
  locations: Location[];
  items: Item[];
  factions: Faction[];
  timelines: Timeline[];
  loreNotes: LoreNote[];
  snapshots: WorldSnapshot[];
  exportedAt: string;
  version: string;
}

export const exportWorldData = async (worldId: string): Promise<WorldExportData | null> => {
  try {
    const worldsData = await AsyncStorage.getItem('worlds');
    const worlds: World[] = worldsData ? JSON.parse(worldsData) : [];
    const world = worlds.find(w => w.id === worldId);
    
    if (!world) {
      throw new Error('World not found');
    }
    
    const [characters, locations, items, factions, timelines, loreNotes, snapshots] = await Promise.all([
      AsyncStorage.getItem(`characters_${worldId}`).then(data => data ? JSON.parse(data) : []),
      AsyncStorage.getItem(`locations_${worldId}`).then(data => data ? JSON.parse(data) : []),
      AsyncStorage.getItem(`items_${worldId}`).then(data => data ? JSON.parse(data) : []),
      AsyncStorage.getItem(`factions_${worldId}`).then(data => data ? JSON.parse(data) : []),
      AsyncStorage.getItem(`timelines_${worldId}`).then(data => data ? JSON.parse(data) : []),
      AsyncStorage.getItem(`loreNotes_${worldId}`).then(data => data ? JSON.parse(data) : []),
      AsyncStorage.getItem(`snapshots_${worldId}`).then(data => data ? JSON.parse(data) : []),
    ]);
    
    return {
      world,
      characters,
      locations,
      items,
      factions,
      timelines,
      loreNotes,
      snapshots,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
  } catch (error) {
    console.error('Export error:', error);
    return null;
  }
};

export const importWorldData = async (data: WorldExportData): Promise<boolean> => {
  try {
    // Generate new IDs to avoid conflicts
    const newWorldId = Date.now().toString();
    const newWorld: World = {
      ...data.world,
      id: newWorldId,
      name: `${data.world.name} (Imported)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Update all entity world IDs
    const characters = data.characters.map(c => ({ ...c, worldId: newWorldId }));
    const locations = data.locations.map(l => ({ ...l, worldId: newWorldId }));
    const items = data.items.map(i => ({ ...i, worldId: newWorldId }));
    const factions = data.factions.map(f => ({ ...f, worldId: newWorldId }));
    const timelines = data.timelines.map(t => ({ ...t, worldId: newWorldId }));
    const loreNotes = data.loreNotes.map(n => ({ ...n, worldId: newWorldId }));
    const snapshots = data.snapshots.map(s => ({ ...s, worldId: newWorldId }));
    
    // Add world to worlds list
    const worldsData = await AsyncStorage.getItem('worlds');
    const worlds: World[] = worldsData ? JSON.parse(worldsData) : [];
    worlds.push(newWorld);
    await AsyncStorage.setItem('worlds', JSON.stringify(worlds));
    
    // Save all entity data
    await Promise.all([
      AsyncStorage.setItem(`characters_${newWorldId}`, JSON.stringify(characters)),
      AsyncStorage.setItem(`locations_${newWorldId}`, JSON.stringify(locations)),
      AsyncStorage.setItem(`items_${newWorldId}`, JSON.stringify(items)),
      AsyncStorage.setItem(`factions_${newWorldId}`, JSON.stringify(factions)),
      AsyncStorage.setItem(`timelines_${newWorldId}`, JSON.stringify(timelines)),
      AsyncStorage.setItem(`loreNotes_${newWorldId}`, JSON.stringify(loreNotes)),
      AsyncStorage.setItem(`snapshots_${newWorldId}`, JSON.stringify(snapshots)),
    ]);
    
    return true;
  } catch (error) {
    console.error('Import error:', error);
    return false;
  }
};

export const exportToJSON = (data: WorldExportData): string => {
  return JSON.stringify(data, null, 2);
};

export const exportToMarkdown = (data: WorldExportData): string => {
  let markdown = `# ${data.world.name}\n\n`;
  markdown += `**Genre:** ${data.world.genre}\n`;
  markdown += `**Description:** ${data.world.description}\n\n`;
  
  if (data.characters.length > 0) {
    markdown += `## Characters (${data.characters.length})\n\n`;
    data.characters.forEach(char => {
      markdown += `### ${char.name}\n`;
      markdown += `**Role:** ${char.role}\n`;
      if (char.traits.length > 0) {
        markdown += `**Traits:** ${char.traits.join(', ')}\n`;
      }
      if (char.appearance) {
        markdown += `**Appearance:** ${char.appearance}\n`;
      }
      if (char.backstory) {
        markdown += `**Backstory:** ${char.backstory}\n`;
      }
      if (char.notes) {
        markdown += `**Notes:** ${char.notes}\n`;
      }
      markdown += '\n';
    });
  }
  
  if (data.locations.length > 0) {
    markdown += `## Locations (${data.locations.length})\n\n`;
    data.locations.forEach(loc => {
      markdown += `### ${loc.name}\n`;
      markdown += `**Type:** ${loc.type}\n`;
      if (loc.description) {
        markdown += `**Description:** ${loc.description}\n`;
      }
      if (loc.significance) {
        markdown += `**Significance:** ${loc.significance}\n`;
      }
      if (loc.inhabitants.length > 0) {
        markdown += `**Inhabitants:** ${loc.inhabitants.join(', ')}\n`;
      }
      if (loc.notes) {
        markdown += `**Notes:** ${loc.notes}\n`;
      }
      markdown += '\n';
    });
  }
  
  if (data.items.length > 0) {
    markdown += `## Items (${data.items.length})\n\n`;
    data.items.forEach(item => {
      markdown += `### ${item.name}\n`;
      markdown += `**Type:** ${item.type}\n`;
      if (item.description) {
        markdown += `**Description:** ${item.description}\n`;
      }
      if (item.powers) {
        markdown += `**Powers:** ${item.powers}\n`;
      }
      if (item.history) {
        markdown += `**History:** ${item.history}\n`;
      }
      if (item.currentOwner) {
        markdown += `**Current Owner:** ${item.currentOwner}\n`;
      }
      if (item.notes) {
        markdown += `**Notes:** ${item.notes}\n`;
      }
      markdown += '\n';
    });
  }
  
  if (data.factions.length > 0) {
    markdown += `## Factions (${data.factions.length})\n\n`;
    data.factions.forEach(faction => {
      markdown += `### ${faction.name}\n`;
      markdown += `**Type:** ${faction.type}\n`;
      if (faction.ideology) {
        markdown += `**Ideology:** ${faction.ideology}\n`;
      }
      if (faction.goals.length > 0) {
        markdown += `**Goals:**\n${faction.goals.map(g => `- ${g}`).join('\n')}\n`;
      }
      if (faction.leaders.length > 0) {
        markdown += `**Leaders:** ${faction.leaders.join(', ')}\n`;
      }
      if (faction.allies.length > 0) {
        markdown += `**Allies:** ${faction.allies.join(', ')}\n`;
      }
      if (faction.enemies.length > 0) {
        markdown += `**Enemies:** ${faction.enemies.join(', ')}\n`;
      }
      if (faction.notes) {
        markdown += `**Notes:** ${faction.notes}\n`;
      }
      markdown += '\n';
    });
  }
  
  if (data.loreNotes.length > 0) {
    markdown += `## Lore Notes (${data.loreNotes.length})\n\n`;
    data.loreNotes.forEach(note => {
      markdown += `### ${note.title}\n`;
      markdown += `**Category:** ${note.category}\n`;
      if (note.tags.length > 0) {
        markdown += `**Tags:** ${note.tags.join(', ')}\n`;
      }
      if (note.content) {
        markdown += `\n${note.content}\n`;
      }
      markdown += '\n';
    });
  }
  
  if (data.timelines.length > 0 && data.timelines[0].events.length > 0) {
    markdown += `## Timeline (${data.timelines[0].events.length} events)\n\n`;
    const sortedEvents = [...data.timelines[0].events].sort((a, b) => a.date.localeCompare(b.date));
    sortedEvents.forEach(event => {
      markdown += `### ${event.date} - ${event.title}\n`;
      markdown += `**Significance:** ${event.significance}\n`;
      if (event.description) {
        markdown += `\n${event.description}\n`;
      }
      markdown += '\n';
    });
  }
  
  markdown += `\n---\n*Exported from LoreWeaver on ${new Date(data.exportedAt).toLocaleDateString()}*\n`;
  
  return markdown;
};

export const shareData = async (content: string, filename: string, mimeType: string) => {
  try {
    if (Platform.OS === 'web') {
      // Web: Create download link
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      Alert.alert(
        'Export Complete',
        `Your world data has been downloaded as ${filename}`,
        [{ text: 'OK' }]
      );
    } else {
      // Mobile: Copy to clipboard and show alert with data preview
      const preview = content.length > 200 ? content.substring(0, 200) + '...' : content;
      Alert.alert(
        'Export Ready',
        `Your world data is ready to share:\n\n${preview}\n\nIn a full implementation, this would be shared via the native sharing system.`,
        [
          { text: 'Copy to Clipboard', onPress: () => {
            // In a real app, you'd use expo-clipboard
            console.log('Copied to clipboard:', content);
          }},
          { text: 'OK' }
        ]
      );
    }
  } catch (error) {
    console.error('Share error:', error);
    Alert.alert('Error', 'Failed to export data');
  }
};