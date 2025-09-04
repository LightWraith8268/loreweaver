import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Download, FileText, Image, Settings, Check, Loader } from 'lucide-react-native';
import { useWorld } from '@/hooks/world-context';
import { useAI } from '@/hooks/ai-context';
import { theme } from '@/constants/theme';
import type { ExportOptions } from '@/types/world';

interface EnhancedExportSystemProps {
  onExportComplete: (format: string, data: string) => void;
}

export const EnhancedExportSystem: React.FC<EnhancedExportSystemProps> = ({
  onExportComplete
}) => {
  const { currentWorld, exportWorld, characters, locations, factions, loreNotes, magicSystems, mythologies } = useWorld();
  const { generateImage, isGenerating } = useAI();
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includeImages: false,
    includePrivateNotes: true,
    sections: ['characters', 'locations', 'factions', 'lore', 'magic', 'mythology']
  });
  const [isExporting, setIsExporting] = useState(false);

  const exportFormats = [
    { id: 'json', name: 'JSON Data', description: 'Raw data export for backup', icon: FileText },
    { id: 'pdf', name: 'PDF World Bible', description: 'Professional world documentation', icon: FileText },
    { id: 'roll20', name: 'Roll20 Campaign', description: 'Export for Roll20 platform', icon: Settings },
    { id: 'foundry', name: 'Foundry VTT', description: 'Export for Foundry Virtual Tabletop', icon: Settings },
    { id: 'novel', name: 'Novel Writing', description: 'Character/location sheets for writers', icon: FileText }
  ];

  const availableSections = [
    { id: 'characters', name: 'Characters', count: characters.length },
    { id: 'locations', name: 'Locations', count: locations.length },
    { id: 'factions', name: 'Factions', count: factions.length },
    { id: 'lore', name: 'Lore Notes', count: loreNotes.length },
    { id: 'magic', name: 'Magic Systems', count: magicSystems.length },
    { id: 'mythology', name: 'Mythology', count: mythologies.length }
  ];

  const toggleSection = (sectionId: string) => {
    setExportOptions(prev => ({
      ...prev,
      sections: prev.sections.includes(sectionId)
        ? prev.sections.filter(s => s !== sectionId)
        : [...prev.sections, sectionId]
    }));
  };

  const generatePDFWorldBible = async () => {
    if (!currentWorld) return '';

    const worldData = {
      world: currentWorld,
      characters: exportOptions.sections.includes('characters') ? characters : [],
      locations: exportOptions.sections.includes('locations') ? locations : [],
      factions: exportOptions.sections.includes('factions') ? factions : [],
      loreNotes: exportOptions.sections.includes('lore') ? loreNotes : [],
      magicSystems: exportOptions.sections.includes('magic') ? magicSystems : [],
      mythologies: exportOptions.sections.includes('mythology') ? mythologies : []
    };

    // Generate a structured document format
    let document = `# ${currentWorld.name} - World Bible\\n\\n`;
    document += `**Genre:** ${currentWorld.genre}\\n`;
    document += `**Description:** ${currentWorld.description}\\n\\n`;

    if (worldData.characters.length > 0) {
      document += `## Characters\\n\\n`;
      worldData.characters.forEach(char => {
        document += `### ${char.name}\\n`;
        document += `**Role:** ${char.role}\\n`;
        document += `**Traits:** ${char.traits.join(', ')}\\n`;
        document += `**Backstory:** ${char.backstory}\\n\\n`;
      });
    }

    if (worldData.locations.length > 0) {
      document += `## Locations\\n\\n`;
      worldData.locations.forEach(loc => {
        document += `### ${loc.name}\\n`;
        document += `**Type:** ${loc.type}\\n`;
        document += `**Description:** ${loc.description}\\n`;
        document += `**Significance:** ${loc.significance}\\n\\n`;
      });
    }

    if (worldData.factions.length > 0) {
      document += `## Factions\\n\\n`;
      worldData.factions.forEach(faction => {
        document += `### ${faction.name}\\n`;
        document += `**Type:** ${faction.type}\\n`;
        document += `**Ideology:** ${faction.ideology}\\n`;
        document += `**Goals:** ${faction.goals.join(', ')}\\n\\n`;
      });
    }

    return document;
  };

  const generateRoll20Export = async () => {
    if (!currentWorld) return '';

    const roll20Data = {
      campaign: {
        name: currentWorld.name,
        description: currentWorld.description,
        genre: currentWorld.genre
      },
      handouts: [
        ...characters.map(char => ({
          name: char.name,
          type: 'character',
          content: `**Role:** ${char.role}\\n**Traits:** ${char.traits.join(', ')}\\n\\n${char.backstory}`,
          avatar: exportOptions.includeImages ? 'character-portrait-url' : null
        })),
        ...locations.map(loc => ({
          name: loc.name,
          type: 'location',
          content: `**Type:** ${loc.type}\\n\\n${loc.description}\\n\\n**Significance:** ${loc.significance}`,
          map: exportOptions.includeImages ? 'location-map-url' : null
        }))
      ],
      tokens: characters.map(char => ({
        name: char.name,
        represents: char.id,
        imgsrc: exportOptions.includeImages ? 'token-image-url' : null
      }))
    };

    return JSON.stringify(roll20Data, null, 2);
  };

  const generateFoundryExport = async () => {
    if (!currentWorld) return '';

    const foundryData = {
      world: {
        name: currentWorld.name,
        description: currentWorld.description,
        system: 'generic'
      },
      actors: characters.map(char => ({
        name: char.name,
        type: 'character',
        data: {
          details: {
            biography: char.backstory,
            appearance: char.appearance
          },
          traits: char.traits,
          relationships: char.relationships
        },
        img: exportOptions.includeImages ? 'actor-portrait-url' : null
      })),
      scenes: locations.map(loc => ({
        name: loc.name,
        navName: loc.name,
        notes: loc.description,
        img: exportOptions.includeImages ? 'scene-background-url' : null
      })),
      journal: [
        ...factions.map(faction => ({
          name: faction.name,
          content: `<h2>${faction.name}</h2><p><strong>Type:</strong> ${faction.type}</p><p><strong>Ideology:</strong> ${faction.ideology}</p><p><strong>Goals:</strong> ${faction.goals.join(', ')}</p>`
        })),
        ...loreNotes.map(note => ({
          name: note.title,
          content: `<h2>${note.title}</h2><p>${note.content}</p>`
        }))
      ]
    };

    return JSON.stringify(foundryData, null, 2);
  };

  const generateNovelWritingExport = async () => {
    if (!currentWorld) return '';

    const novelData = {
      world: {
        name: currentWorld.name,
        genre: currentWorld.genre,
        description: currentWorld.description
      },
      characterSheets: characters.map(char => ({
        name: char.name,
        role: char.role,
        physicalDescription: char.appearance,
        personality: char.traits,
        background: char.backstory,
        relationships: char.relationships.map(rel => ({
          character: rel.characterName,
          relationship: rel.type,
          description: rel.description
        })),
        notes: char.notes
      })),
      locationGuide: locations.map(loc => ({
        name: loc.name,
        type: loc.type,
        description: loc.description,
        atmosphere: loc.significance,
        inhabitants: loc.inhabitants,
        notes: loc.notes
      })),
      plotElements: {
        factions: factions.map(f => ({
          name: f.name,
          motivation: f.ideology,
          goals: f.goals,
          conflicts: f.enemies
        })),
        lore: loreNotes.map(note => ({
          title: note.title,
          content: note.content,
          category: note.category,
          relevance: note.tags
        }))
      }
    };

    return JSON.stringify(novelData, null, 2);
  };

  const handleExport = async () => {
    if (!currentWorld) {
      Alert.alert('Error', 'No world selected for export');
      return;
    }

    setIsExporting(true);
    try {
      let exportData = '';

      switch (exportOptions.format) {
        case 'json':
          exportData = await exportWorld();
          break;
        case 'pdf':
          exportData = await generatePDFWorldBible();
          break;
        case 'roll20':
          exportData = await generateRoll20Export();
          break;
        case 'foundry':
          exportData = await generateFoundryExport();
          break;
        case 'novel':
          exportData = await generateNovelWritingExport();
          break;
        default:
          throw new Error('Unsupported export format');
      }

      onExportComplete(exportOptions.format, exportData);
      Alert.alert('Success', `World exported as ${exportOptions.format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert('Error', 'Failed to export world. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const generateWorldImages = async () => {
    if (!currentWorld) return;

    try {
      // Generate character portraits
      for (const character of characters.slice(0, 3)) {
        const portrait = await generateImage(
          `Portrait of ${character.name}, ${character.appearance || 'fantasy character'}, ${character.role}`
        );
        console.log(`Generated portrait for ${character.name}:`, portrait);
      }

      // Generate location artwork
      for (const location of locations.slice(0, 3)) {
        const artwork = await generateImage(
          `${location.name}, ${location.description}, ${location.type}, fantasy landscape`
        );
        console.log(`Generated artwork for ${location.name}:`, artwork);
      }

      Alert.alert('Success', 'World images generated successfully!');
    } catch (error) {
      console.error('Failed to generate images:', error);
      Alert.alert('Error', 'Failed to generate world images.');
    }
  };

  if (!currentWorld) {
    return (
      <View style={styles.emptyContainer}>
        <Download size={64} color={theme.colors.textSecondary} />
        <Text style={styles.emptyTitle}>No World Selected</Text>
        <Text style={styles.emptyText}>Select a world to export</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Enhanced Export System</Text>
      <Text style={styles.subtitle}>Export your world for different platforms and uses</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Export Format</Text>
        {exportFormats.map(format => {
          const IconComponent = format.icon;
          const isSelected = exportOptions.format === format.id;
          
          return (
            <TouchableOpacity
              key={format.id}
              style={[styles.formatOption, isSelected && styles.formatOptionSelected]}
              onPress={() => setExportOptions(prev => ({ ...prev, format: format.id as any }))}
            >
              <IconComponent size={24} color={isSelected ? theme.colors.primary : theme.colors.textSecondary} />
              <View style={styles.formatInfo}>
                <Text style={[styles.formatName, isSelected && styles.formatNameSelected]}>
                  {format.name}
                </Text>
                <Text style={styles.formatDescription}>{format.description}</Text>
              </View>
              {isSelected && <Check size={20} color={theme.colors.primary} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Include Sections</Text>
        {availableSections.map(section => {
          const isSelected = exportOptions.sections.includes(section.id);
          
          return (
            <TouchableOpacity
              key={section.id}
              style={[styles.sectionOption, isSelected && styles.sectionOptionSelected]}
              onPress={() => toggleSection(section.id)}
            >
              <View style={styles.sectionInfo}>
                <Text style={[styles.sectionName, isSelected && styles.sectionNameSelected]}>
                  {section.name}
                </Text>
                <Text style={styles.sectionCount}>{section.count} items</Text>
              </View>
              {isSelected && <Check size={20} color={theme.colors.primary} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Options</Text>
        
        <TouchableOpacity
          style={[styles.optionRow, exportOptions.includeImages && styles.optionRowSelected]}
          onPress={() => setExportOptions(prev => ({ ...prev, includeImages: !prev.includeImages }))}
        >
          <Image size={20} color={exportOptions.includeImages ? theme.colors.primary : theme.colors.textSecondary} />
          <Text style={[styles.optionText, exportOptions.includeImages && styles.optionTextSelected]}>
            Include Generated Images
          </Text>
          {exportOptions.includeImages && <Check size={16} color={theme.colors.primary} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionRow, exportOptions.includePrivateNotes && styles.optionRowSelected]}
          onPress={() => setExportOptions(prev => ({ ...prev, includePrivateNotes: !prev.includePrivateNotes }))}
        >
          <FileText size={20} color={exportOptions.includePrivateNotes ? theme.colors.primary : theme.colors.textSecondary} />
          <Text style={[styles.optionText, exportOptions.includePrivateNotes && styles.optionTextSelected]}>
            Include Private Notes
          </Text>
          {exportOptions.includePrivateNotes && <Check size={16} color={theme.colors.primary} />}
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.generateImagesButton, isGenerating && styles.buttonDisabled]}
          onPress={generateWorldImages}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <Loader size={20} color={theme.colors.surface} />
          ) : (
            <Image size={20} color={theme.colors.surface} />
          )}
          <Text style={styles.buttonText}>
            {isGenerating ? 'Generating...' : 'Generate Images'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.exportButton, isExporting && styles.buttonDisabled]}
          onPress={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader size={20} color={theme.colors.surface} />
          ) : (
            <Download size={20} color={theme.colors.surface} />
          )}
          <Text style={styles.buttonText}>
            {isExporting ? 'Exporting...' : 'Export World'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  section: {
    margin: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  formatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  formatOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceLight,
  },
  formatInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  formatName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  formatNameSelected: {
    color: theme.colors.primary,
  },
  formatDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  sectionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceLight,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  sectionNameSelected: {
    color: theme.colors.primary,
  },
  sectionCount: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  optionRowSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceLight,
  },
  optionText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  optionTextSelected: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  actions: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  generateImagesButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.warning,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.surface,
  },
});