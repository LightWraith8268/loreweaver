import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { 
  Upload, 
  Search, 
  Shuffle, 
  CheckCircle, 
  FileText, 
  Database,
  Settings,
  Mic
} from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useWorld } from '@/hooks/world-context';
import { useAI } from '@/hooks/ai-context';
import { exportWorldData, exportToJSON, exportToMarkdown, shareData, parseJsonFile, createFileInput } from '@/utils/export';
import { parseDocxFile } from '@/utils/docx-parser';
import NameGenerator from '@/components/NameGenerator';
import AdvancedSearch from '@/components/AdvancedSearch';
import { VoiceCaptureComponent } from '@/components/VoiceCaptureComponent';
import { EnhancedExportSystem } from '@/components/EnhancedExportSystem';
import type { EntityType, VoiceCapture } from '@/types/world';

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
}

function ToolCard({ title, description, icon, onPress, disabled = false }: ToolCardProps) {
  return (
    <TouchableOpacity 
      style={[styles.toolCard, disabled && styles.toolCardDisabled]} 
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.toolIcon}>
        {icon}
      </View>
      <View style={styles.toolInfo}>
        <Text style={[styles.toolTitle, disabled && styles.toolTitleDisabled]}>{title}</Text>
        <Text style={[styles.toolDescription, disabled && styles.toolDescriptionDisabled]}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ToolsScreen() {
  const { currentWorld, importData } = useWorld();
  const { checkConsistency, isGenerating } = useAI();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showNameGenerator, setShowNameGenerator] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showVoiceCapture, setShowVoiceCapture] = useState(false);
  const [showEnhancedExport, setShowEnhancedExport] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    entityTypes: [] as EntityType[],
    genres: [] as string[],
    tags: [] as string[],
    dateRange: {}
  });

  const handleExportJSON = async () => {
    if (!currentWorld) {
      Alert.alert('Error', 'Please select a world first');
      return;
    }

    setIsExporting(true);
    try {
      const worldData = await exportWorldData(currentWorld.id);
      if (worldData) {
        const jsonContent = exportToJSON(worldData);
        const filename = `${currentWorld.name.replace(/[^a-zA-Z0-9]/g, '_')}_export.json`;
        await shareData(jsonContent, filename, 'application/json');
      } else {
        Alert.alert('Error', 'Failed to export world data');
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export world');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportMarkdown = async () => {
    if (!currentWorld) {
      Alert.alert('Error', 'Please select a world first');
      return;
    }

    setIsExporting(true);
    try {
      const worldData = await exportWorldData(currentWorld.id);
      if (worldData) {
        const markdownContent = exportToMarkdown(worldData);
        const filename = `${currentWorld.name.replace(/[^a-zA-Z0-9]/g, '_')}_export.md`;
        await shareData(markdownContent, filename, 'text/markdown');
      } else {
        Alert.alert('Error', 'Failed to export world data');
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export world');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportWorld = async () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Import', 'File import is only available on web');
      return;
    }

    setIsImporting(true);
    
    createFileInput('.json', async (file) => {
      try {
        const result = await parseJsonFile(file);

        if (!result.success) {
          Alert.alert('Import Error', result.error || 'Failed to parse file');
          return;
        }

        if (result.world && result.data) {
          // Full world import
          // For now, just import the data components
          await importData(result.data);
          const success = true;

          if (success) {
            Alert.alert(
              'Import Successful',
              `Successfully imported world "${result.world.name}"`,
              [{ text: 'OK', onPress: () => router.push('/world-select') }]
            );
          } else {
            Alert.alert('Error', 'Failed to import world');
          }
        } else if (result.data) {
          // Component data import
          await importData(result.data);
          
          const totalItems = Object.values(result.data).reduce((sum, arr) => sum + (arr?.length || 0), 0);
          Alert.alert(
            'Import Successful',
            `Successfully imported ${totalItems} items`,
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Import error:', error);
        Alert.alert('Error', 'Failed to import file');
      } finally {
        setIsImporting(false);
      }
    });
  };

  const handleImportComponents = async () => {
    if (!currentWorld) {
      Alert.alert('Error', 'Please select a world first');
      return;
    }

    if (Platform.OS !== 'web') {
      Alert.alert('Import', 'File import is only available on web');
      return;
    }

    setIsImporting(true);
    
    createFileInput('.docx,.json', async (file) => {
      try {
        let result;
        
        if (file.name.endsWith('.docx')) {
          result = await parseDocxFile(file);
        } else if (file.name.endsWith('.json')) {
          result = await parseJsonFile(file);
        } else {
          Alert.alert('Error', 'Unsupported file type. Please use .docx or .json files.');
          return;
        }

        if (!result.success) {
          Alert.alert('Import Error', result.error || 'Failed to parse file');
          return;
        }

        if (result.data) {
          await importData(result.data);
          
          const totalItems = Object.values(result.data).reduce((sum, arr) => sum + (arr?.length || 0), 0);
          Alert.alert(
            'Import Successful',
            `Successfully imported ${totalItems} items`,
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Import error:', error);
        Alert.alert('Error', 'Failed to import file');
      } finally {
        setIsImporting(false);
      }
    });
  };

  const handleConsistencyCheck = async () => {
    if (!currentWorld) {
      Alert.alert('Error', 'Please select a world first');
      return;
    }

    try {
      const report = await checkConsistency();
      Alert.alert(
        'Consistency Check',
        report,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Consistency check error:', error);
      Alert.alert('Error', 'Failed to check consistency');
    }
  };

  if (!currentWorld) {
    return (
      <View style={styles.emptyContainer}>
        <Settings size={64} color={theme.colors.textTertiary} />
        <Text style={styles.emptyTitle}>No World Selected</Text>
        <Text style={styles.emptyDescription}>
          Select a world to access tools
        </Text>
        <TouchableOpacity 
          style={styles.selectWorldButton}
          onPress={() => router.push('/world-select')}
          testID="select-world-button"
        >
          <Text style={styles.selectWorldButtonText}>Select a World</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Tools',
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Export</Text>
            <View style={styles.toolsGrid}>
              <ToolCard
                title="Export as JSON"
                description="Export complete world data as JSON file"
                icon={<Database size={24} color={theme.colors.primary} />}
                onPress={handleExportJSON}
                disabled={!currentWorld || isExporting}
              />
              
              <ToolCard
                title="Export as Markdown"
                description="Export world data as readable markdown"
                icon={<FileText size={24} color={theme.colors.primary} />}
                onPress={handleExportMarkdown}
                disabled={!currentWorld || isExporting}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Import</Text>
            <View style={styles.toolsGrid}>
              <ToolCard
                title="Import World"
                description="Import complete world from JSON export"
                icon={<Upload size={24} color={theme.colors.primary} />}
                onPress={handleImportWorld}
                disabled={isImporting || Platform.OS !== 'web'}
              />
              
              <ToolCard
                title="Import Components"
                description="Import specific components from DOCX or JSON"
                icon={<Upload size={24} color={theme.colors.secondary} />}
                onPress={handleImportComponents}
                disabled={!currentWorld || isImporting || Platform.OS !== 'web'}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Tools</Text>
            <View style={styles.toolsGrid}>
              <ToolCard
                title="Consistency Check"
                description="AI-powered world consistency analysis"
                icon={<CheckCircle size={24} color={theme.colors.success} />}
                onPress={handleConsistencyCheck}
                disabled={!currentWorld || isGenerating}
              />
              
              <ToolCard
                title="Name Generator"
                description="Generate names for characters, places, and more"
                icon={<Shuffle size={24} color={theme.colors.primary} />}
                onPress={() => setShowNameGenerator(true)}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Utilities</Text>
            <View style={styles.toolsGrid}>
              <ToolCard
                title="Advanced Search"
                description="Search across all world elements"
                icon={<Search size={24} color={theme.colors.primary} />}
                onPress={() => setShowAdvancedSearch(true)}
                disabled={!currentWorld}
              />
              
              <ToolCard
                title="Voice Capture"
                description="Record and transcribe voice notes"
                icon={<Mic size={24} color={theme.colors.primary} />}
                onPress={() => setShowVoiceCapture(true)}
                disabled={!currentWorld}
              />
              
              <ToolCard
                title="Enhanced Export"
                description="Professional export for multiple platforms"
                icon={<FileText size={24} color={theme.colors.primary} />}
                onPress={() => setShowEnhancedExport(true)}
                disabled={!currentWorld}
              />
              
              <ToolCard
                title="World Settings"
                description="Configure world preferences and settings"
                icon={<Settings size={24} color={theme.colors.textSecondary} />}
                onPress={() => {
                  Alert.alert('Coming Soon', 'World settings will be available in a future update');
                }}
              />
            </View>
          </View>

          {Platform.OS !== 'web' && (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>
                📱 Some import/export features are only available on web due to platform limitations.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <NameGenerator
        visible={showNameGenerator}
        onClose={() => setShowNameGenerator(false)}
        onSelectName={(name) => {
          console.log('Selected name:', name);
          setShowNameGenerator(false);
        }}
        entityType="character"
        genre={currentWorld?.genre || 'fantasy'}
      />

      {showAdvancedSearch && (
        <AdvancedSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={searchFilters}
          onFiltersChange={setSearchFilters}
          placeholder="Search across all world elements..."
        />
      )}

      {showVoiceCapture && (
        <VoiceCaptureComponent
          onCaptureComplete={(capture: VoiceCapture) => {
            console.log('Voice capture completed:', capture);
            setShowVoiceCapture(false);
          }}
        />
      )}

      {showEnhancedExport && (
        <EnhancedExportSystem
          onExportComplete={(format: string, data: string) => {
            console.log('Export completed:', format, data.length);
            setShowEnhancedExport(false);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
  },
  emptyDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  selectWorldButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.lg,
  },
  selectWorldButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.xl,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  toolsGrid: {
    gap: theme.spacing.md,
  },
  toolCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  toolCardDisabled: {
    opacity: 0.5,
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolInfo: {
    flex: 1,
  },
  toolTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  toolTitleDisabled: {
    color: theme.colors.textTertiary,
  },
  toolDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  toolDescriptionDisabled: {
    color: theme.colors.textTertiary,
  },
  notice: {
    backgroundColor: theme.colors.warning + '20',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.warning + '40',
  },
  noticeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    textAlign: 'center',
  },
});