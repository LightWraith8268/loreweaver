import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Plus, Globe, Search, Settings, Download, Upload, History, FileText, Sparkles, Lightbulb, Mic, Edit, BookOpen } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWorld } from '@/hooks/world-context';
import { useAI } from '@/hooks/ai-context';
import { theme, getTabBarHeight, deviceInfo, responsive } from '@/constants/theme';
import { useResponsiveModal } from '@/hooks/responsive-layout';
import NameGenerator from '@/components/NameGenerator';
import { AIIdeasGenerator } from '@/components/AIIdeasGenerator';
import { VoiceCaptureComponent } from '@/components/VoiceCaptureComponent';
import { SeriesManager } from '@/components/SeriesManager';
import { SelectWorldPrompt } from '@/components/SelectWorldPrompt';
import type { World, WorldGenre } from '@/types/world';

const { getResponsiveValue } = responsive;

export default function DashboardScreen() {
  const { 
    currentWorld, 
    createWorld,
    searchQuery,
    searchResults,
    characters,
    locations,
    items,
    factions,
    loreNotes,
    magicSystems,
    mythologies,
    createSnapshot,
    exportWorld,
    importData: importWorldData,
  } = useWorld();
  const { checkConsistency } = useAI();
  const insets = useSafeAreaInsets();
  const modalDimensions = useResponsiveModal();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorldName, setNewWorldName] = useState('');
  const [newWorldDescription, setNewWorldDescription] = useState('');
  const [newWorldGenre, setNewWorldGenre] = useState<World['genre']>('fantasy');
  const [isCreating, setIsCreating] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showNameGenerator, setShowNameGenerator] = useState(false);
  const [nameGeneratorType, setNameGeneratorType] = useState<'character' | 'location' | 'item' | 'faction'>('character');
  const [showAIIdeas, setShowAIIdeas] = useState(false);
  const [showVoiceCapture, setShowVoiceCapture] = useState(false);
  const [showSeriesManager, setShowSeriesManager] = useState(false);
  const [showManualEditor, setShowManualEditor] = useState(false);
  
  const handleCreateWorld = async () => {
    if (!newWorldName.trim()) {
      Alert.alert('Error', 'Please enter a world name');
      return;
    }
    
    setIsCreating(true);
    try {
      await createWorld({
        name: newWorldName,
        description: newWorldDescription,
        genre: newWorldGenre,
      });
      setShowCreateModal(false);
      setNewWorldName('');
      setNewWorldDescription('');
      setNewWorldGenre('fantasy');
    } catch (error) {
      Alert.alert('Error', 'Failed to create world');
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleCreateSnapshot = async () => {
    if (!currentWorld) return;
    
    Alert.prompt(
      'Create Snapshot',
      'Enter a name for this snapshot:',
      async (name) => {
        if (name) {
          try {
            await createSnapshot(name);
            Alert.alert('Success', 'Snapshot created successfully');
          } catch (error) {
            Alert.alert('Error', 'Failed to create snapshot');
          }
        }
      },
      'plain-text',
      `Snapshot ${new Date().toLocaleDateString()}`
    );
  };
  
  const handleExportWorld = async (format: 'json' | 'markdown') => {
    if (!currentWorld) {
      Alert.alert('Error', 'No world selected');
      return;
    }
    
    setIsExporting(true);
    try {
      const content = await exportWorld();
      const filename = `${currentWorld.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
      
      if (Platform.OS === 'web') {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        Alert.alert('Export Complete', 'World data copied to clipboard', [
          { text: 'OK' }
        ]);
      }
      
      setShowExportModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to export world');
    } finally {
      setIsExporting(false);
    }
  };
  
  const validateImportData = (data: any): boolean => {
    try {
      // Check if it's an object
      if (!data || typeof data !== 'object') {
        return false;
      }
      
      // Check if it has expected structure for world data
      if (data.world) {
        // Full world export format
        return (
          typeof data.world.name === 'string' &&
          typeof data.world.id === 'string' &&
          Array.isArray(data.characters || []) &&
          Array.isArray(data.locations || []) &&
          Array.isArray(data.items || []) &&
          Array.isArray(data.factions || [])
        );
      }
      
      // Partial import format - at least one valid array
      const hasValidData = 
        Array.isArray(data.characters) ||
        Array.isArray(data.locations) ||
        Array.isArray(data.items) ||
        Array.isArray(data.factions) ||
        Array.isArray(data.loreNotes) ||
        Array.isArray(data.magicSystems) ||
        Array.isArray(data.mythologies);
        
      return hasValidData;
    } catch {
      return false;
    }
  };

  const handleImportWorld = async () => {
    if (!importData.trim()) {
      Alert.alert('Error', 'Please paste the world data');
      return;
    }
    
    setIsImporting(true);
    try {
      let data;
      
      // Safely parse JSON with validation
      try {
        data = JSON.parse(importData);
      } catch (parseError) {
        throw new Error('Invalid JSON format. Please check your data and try again.');
      }
      
      // Validate data structure
      if (!validateImportData(data)) {
        throw new Error('Invalid world data format. The data must contain valid world entities.');
      }
      
      // Additional safety checks
      if (data.world && (!data.world.name || data.world.name.length > 100)) {
        throw new Error('World name is required and must be less than 100 characters.');
      }
      
      await importWorldData(data);
      
      Alert.alert('Success', 'World data imported successfully');
      setShowImportModal(false);
      setImportData('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid world data format';
      Alert.alert('Import Error', errorMessage);
    } finally {
      setIsImporting(false);
    }
  };
  
  const handleCheckConsistency = async () => {
    if (!currentWorld) {
      Alert.alert('Error', 'No world selected');
      return;
    }
    
    try {
      const report = await checkConsistency();
      Alert.alert('Consistency Report', report, [{ text: 'OK' }]);
    } catch (error) {
      Alert.alert('Error', 'Failed to check consistency');
    }
  };
  
  
  const stats = currentWorld ? [
    { label: 'Characters', count: characters.length, color: theme.colors.primary },
    { label: 'Locations', count: locations.length, color: theme.colors.secondary },
    { label: 'Items', count: items.length, color: theme.colors.accent },
    { label: 'Factions', count: factions.length, color: theme.colors.warning },
    { label: 'Magic Systems', count: magicSystems.length, color: '#9333ea' },
    { label: 'Mythologies', count: mythologies.length, color: '#dc2626' },
    { label: 'Lore Notes', count: loreNotes.length, color: theme.colors.success },
  ] : [];
  
  // const { columns } = useResponsiveGrid(stats.length);  // Unused for now
  
  const genreColors: Record<WorldGenre, string> = {
    fantasy: theme.colors.fantasy,
    'high-fantasy': theme.colors.fantasy,
    'dark-fantasy': '#4c1d95',
    'urban-fantasy': '#7c3aed',
    'epic-fantasy': '#8b5cf6',
    'sci-fi': theme.colors.scifi,
    'space-opera': theme.colors.scifi,
    cyberpunk: theme.colors.cyberpunk,
    steampunk: '#92400e',
    biopunk: '#059669',
    dystopian: '#374151',
    horror: '#7f1d1d',
    'cosmic-horror': '#1f2937',
    'gothic-horror': '#581c87',
    'supernatural-horror': '#6b21a8',
    mystery: '#1e40af',
    detective: '#1d4ed8',
    noir: '#111827',
    thriller: '#dc2626',
    historical: '#92400e',
    'alternate-history': '#a16207',
    'historical-fiction': '#d97706',
    mythology: theme.colors.mythology,
    folklore: '#059669',
    legend: '#0d9488',
    adventure: '#ea580c',
    swashbuckling: '#c2410c',
    exploration: '#16a34a',
    romance: '#e11d48',
    'paranormal-romance': '#be185d',
    'romantic-fantasy': '#db2777',
    western: '#a16207',
    'weird-west': '#78350f',
    'space-western': '#451a03',
    'post-apocalyptic': '#6b7280',
    zombie: '#374151',
    survival: '#4b5563',
    superhero: '#2563eb',
    'comic-book': '#1d4ed8',
    pulp: '#7c2d12',
    'slice-of-life': '#65a30d',
    contemporary: '#84cc16',
    literary: '#a3a3a3',
    comedy: '#facc15',
    satire: '#eab308',
    parody: '#ca8a04',
    experimental: '#8b5cf6',
    surreal: '#a855f7',
    'magical-realism': '#c084fc',
    custom: theme.colors.primary,
  };
  
  const getGenreColor = (genre: WorldGenre): string => {
    return genreColors[genre] || theme.colors.primary;
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitles}>
            <Text style={styles.title} testID="header-title">LoreWeaver</Text>
            <Text style={styles.subtitle} testID="header-subtitle">Dashboard</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => router.push('/app-settings' as any)}
              accessibilityLabel="Open settings"
              accessibilityHint="Navigate to app settings and preferences"
              accessibilityRole="button"
            >
              <Settings size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => router.push('/world-select' as any)}
              accessibilityLabel="Select world"
              accessibilityHint="Choose or create a world to work with"
              accessibilityRole="button"
            >
              <Globe size={24} color={theme.colors.text} />
            </TouchableOpacity>
            {currentWorld && (
              <>
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={() => setShowExportModal(true)}
                  accessibilityLabel="Export world"
                  accessibilityHint="Export current world data to file"
                  accessibilityRole="button"
                >
                  <Download size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={handleCreateSnapshot}
                  accessibilityLabel="Create snapshot"
                  accessibilityHint="Save a snapshot of current world state"
                  accessibilityRole="button"
                >
                  <History size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => setShowImportModal(true)}
              accessibilityLabel="Import world data"
              accessibilityHint="Import world data from file or text"
              accessibilityRole="button"
            >
              <Upload size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Search Bar */}
        <TouchableOpacity 
          style={styles.searchContainer}
          onPress={() => Alert.alert('Info', 'Advanced search feature coming soon')}
          accessibilityLabel="Open search"
          accessibilityHint="Basic search functionality"
          accessibilityRole="button"
        >
          <Search size={20} color={theme.colors.textTertiary} />
          <Text style={[styles.searchPlaceholder, { color: theme.colors.textTertiary }]}>
            Search across all content...
          </Text>
          <View style={[styles.searchBadge, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.searchBadgeText}>Advanced</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingBottom: theme.spacing.xl + 40 // Removed tab bar dependency
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {currentWorld ? (
          <>
            {/* Current World Card */}
            <View style={[styles.worldCard, { borderColor: getGenreColor(currentWorld.genre) }]}>
              <View style={styles.worldCardHeader}>
                <Text style={styles.worldName}>{currentWorld.name}</Text>
                <View style={[styles.genreBadge, { backgroundColor: getGenreColor(currentWorld.genre) }]}>
                  <Text style={styles.genreText}>{currentWorld.genre}</Text>
                </View>
              </View>
              <Text style={styles.worldDescription}>{currentWorld.description}</Text>
              
              {/* Stats Grid */}
              <View style={styles.statsGrid}>
                {stats.map((stat, index) => (
                  <View key={index} style={styles.statCard}>
                    <Text style={[styles.statCount, { color: stat.color }]}>{stat.count}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            {/* Quick Actions */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <TouchableOpacity 
                style={styles.quickExportButton}
                onPress={() => handleExportWorld('json')}
                disabled={isExporting}
                accessibilityLabel="Export world as JSON"
                accessibilityHint="Download world data in JSON format"
                accessibilityRole="button"
                accessibilityState={{ disabled: isExporting }}
              >
                {isExporting ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <Download size={16} color={theme.colors.primary} />
                )}
                <Text style={styles.quickExportText}>Export JSON</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActions}>
              <TouchableOpacity 
                style={[styles.actionCard, { backgroundColor: theme.colors.primary + '20' }]}
                onPress={() => setShowManualEditor(true)}
                accessibilityLabel="Manual Editor"
                accessibilityHint="Open text editor for direct writing"
                accessibilityRole="button"
              >
                <Edit size={32} color={theme.colors.primary} />
                <Text style={styles.actionText}>Manual Editor</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionCard, { backgroundColor: theme.colors.secondary + '20' }]}
                onPress={() => setShowVoiceCapture(true)}
                accessibilityLabel="Voice Capture"
                accessibilityHint="Record and transcribe voice notes"
                accessibilityRole="button"
              >
                <Mic size={32} color={theme.colors.secondary} />
                <Text style={styles.actionText}>Voice Capture</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionCard, { backgroundColor: theme.colors.accent + '20' }]}
                onPress={() => setShowSeriesManager(true)}
                accessibilityLabel="Series & Books"
                accessibilityHint="Manage book series and extract elements"
                accessibilityRole="button"
              >
                <BookOpen size={32} color={theme.colors.accent} />
                <Text style={styles.actionText}>Series & Books</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionCard, { backgroundColor: theme.colors.success + '20' }]}
                onPress={() => {
                  setNameGeneratorType('character');
                  setShowNameGenerator(true);
                }}
                accessibilityLabel="Name Generator"
                accessibilityHint="Generate names for characters, places, and more"
                accessibilityRole="button"
              >
                <Sparkles size={32} color={theme.colors.success} />
                <Text style={styles.actionText}>Name Generator</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionCard, { backgroundColor: theme.colors.warning + '20' }]}
                onPress={() => setShowAIIdeas(true)}
                accessibilityLabel="AI Ideas Generator"
                accessibilityHint="Generate creative ideas for stories and worldbuilding"
                accessibilityRole="button"
              >
                <Lightbulb size={32} color={theme.colors.warning} />
                <Text style={styles.actionText}>AI Ideas</Text>
              </TouchableOpacity>
            </ScrollView>
            
            {/* Search Results */}
            {searchQuery && searchResults.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Search Results</Text>
                <View style={styles.searchResults}>
                  {searchResults.slice(0, 5).map((result, index) => (
                    <TouchableOpacity key={index} style={styles.searchResult}>
                      <View style={[styles.resultTypeBadge, { backgroundColor: getGenreColor(currentWorld.genre) }]}>
                        <Text style={styles.resultTypeText}>{result.type}</Text>
                      </View>
                      <View style={styles.resultContent}>
                        <Text style={styles.resultName}>{result.name || result.title}</Text>
                        <Text style={styles.resultDescription} numberOfLines={1}>
                          {result.description || result.content || result.role || result.type}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </>
        ) : (
          <SelectWorldPrompt
            title="Welcome to LoreWeaver"
            description="Create your first world to start building your universe, or use our AI tools to get inspired"
            onCreateWorld={() => setShowCreateModal(true)}
            customAction={{
              label: "AI Ideas Generator",
              onPress: () => setShowAIIdeas(true),
              icon: <Lightbulb size={20} color={theme.colors.text} />
            }}
          />
        )}
      </ScrollView>
      
      {/* Create World Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.modalContent, modalDimensions]}>
            <Text style={styles.modalTitle}>Create New World</Text>
            
            <TextInput
              style={styles.input}
              placeholder="World Name"
              placeholderTextColor={theme.colors.textTertiary}
              value={newWorldName}
              onChangeText={setNewWorldName}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              placeholderTextColor={theme.colors.textTertiary}
              value={newWorldDescription}
              onChangeText={setNewWorldDescription}
              multiline
              numberOfLines={3}
            />
            
            <Text style={styles.inputLabel}>Genre</Text>
            <View style={styles.genreOptions}>
              {(['fantasy', 'sci-fi', 'cyberpunk', 'mythology', 'custom'] as const).map((genre) => (
                <TouchableOpacity
                  key={genre}
                  style={[
                    styles.genreOption,
                    newWorldGenre === genre && { backgroundColor: getGenreColor(genre) }
                  ]}
                  onPress={() => setNewWorldGenre(genre)}
                >
                  <Text style={[
                    styles.genreOptionText,
                    newWorldGenre === genre && { color: theme.colors.background }
                  ]}>
                    {genre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleCreateWorld}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator color={theme.colors.background} />
                ) : (
                  <Text style={styles.confirmButtonText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Export Modal */}
      <Modal
        visible={showExportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, modalDimensions]}>
            <Text style={styles.modalTitle}>Export World</Text>
            
            <Text style={styles.modalDescription}>
              Choose the format to export your world data:
            </Text>
            
            <TouchableOpacity
              style={styles.exportOption}
              onPress={() => handleExportWorld('json')}
              disabled={isExporting}
            >
              <FileText size={24} color={theme.colors.primary} />
              <View style={styles.exportOptionContent}>
                <Text style={styles.exportOptionTitle}>JSON Format</Text>
                <Text style={styles.exportOptionDescription}>
                  Complete data export for backup and sharing
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.exportOption}
              onPress={() => handleExportWorld('markdown')}
              disabled={isExporting}
            >
              <FileText size={24} color={theme.colors.secondary} />
              <View style={styles.exportOptionContent}>
                <Text style={styles.exportOptionTitle}>Markdown Format</Text>
                <Text style={styles.exportOptionDescription}>
                  Human-readable format for documentation
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowExportModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Import Modal */}
      <Modal
        visible={showImportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowImportModal(false);
          setImportData('');
        }}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.modalContent, modalDimensions]}>
              <Text style={styles.modalTitle}>Import World</Text>
            
            <Text style={styles.modalDescription}>
              Paste the JSON world data below:
            </Text>
            
            <TextInput
              style={[styles.input, styles.importTextArea]}
              placeholder="Paste world JSON data here..."
              placeholderTextColor={theme.colors.textTertiary}
              value={importData}
              onChangeText={setImportData}
              multiline
              numberOfLines={8}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowImportModal(false);
                  setImportData('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleImportWorld}
                disabled={isImporting}
              >
                {isImporting ? (
                  <ActivityIndicator color={theme.colors.background} />
                ) : (
                  <Text style={styles.confirmButtonText}>Import</Text>
                )}
              </TouchableOpacity>
            </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Name Generator Modal */}
      <NameGenerator
        visible={showNameGenerator}
        onClose={() => setShowNameGenerator(false)}
        onSelectName={(name) => {
          console.log('Selected name:', name);
          setShowNameGenerator(false);
        }}
        entityType={nameGeneratorType}
        genre={currentWorld?.genre}
      />
      
      <AIIdeasGenerator
        visible={showAIIdeas}
        onClose={() => setShowAIIdeas(false)}
        contextType={currentWorld ? 'world' : 'global'}
      />
      
      <VoiceCaptureComponent
        visible={showVoiceCapture}
        onClose={() => setShowVoiceCapture(false)}
        onCaptureComplete={(capture) => {
          console.log('Voice capture completed:', capture);
          setShowVoiceCapture(false);
        }}
      />

      <SeriesManager
        visible={showSeriesManager}
        onClose={() => setShowSeriesManager(false)}
      />

      {/* Manual Editor Modal */}
      <Modal
        visible={showManualEditor}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowManualEditor(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, modalDimensions]}>
            <Text style={styles.modalTitle}>Manual Text Editor</Text>
            
            <Text style={styles.modalDescription}>
              Write and edit text content directly:
            </Text>
            
            <TextInput
              style={[styles.input, styles.importTextArea]}
              placeholder="Start writing your content here..."
              placeholderTextColor={theme.colors.textTertiary}
              multiline
              numberOfLines={12}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowManualEditor(false)}
              >
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={() => {
                  Alert.alert('Save', 'Content saved to drafts');
                  setShowManualEditor(false);
                }}
              >
                <Text style={styles.confirmButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* FAB */}
      {currentWorld && (
        <TouchableOpacity 
          style={[
            styles.fab,
            {
              bottom: theme.spacing.lg + 20 // Adjusted for drawer
            }
          ]}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={28} color={theme.colors.background} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === 'android' ? 0 : 0, // Status bar handled by navigation
  },
  header: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: getResponsiveValue({ phone: theme.spacing.md, tablet: theme.spacing.lg, largeTablet: theme.spacing.xl }),
    paddingTop: getResponsiveValue({ 
      phone: Platform.OS === 'ios' ? theme.spacing.sm : theme.spacing.md, 
      tablet: theme.spacing.lg,
      largeTablet: theme.spacing.xl 
    }),
    paddingBottom: getResponsiveValue({ phone: theme.spacing.sm, tablet: theme.spacing.md }),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    elevation: Platform.OS === 'android' ? 2 : 0,
    shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 1 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
    shadowRadius: Platform.OS === 'ios' ? 2 : 0,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  headerTitles: {
    flexDirection: 'column',
  },
  subtitle: {
    marginTop: 2,
    fontSize: Platform.OS === 'ios' ? theme.fontSize.lg : (theme.fontSize.lg + 1 as number),
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  iconButton: {
    padding: deviceInfo.isDesktop ? theme.spacing.xs : theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    minWidth: deviceInfo.isDesktop ? theme.responsive.minTouchTarget : undefined,
    minHeight: deviceInfo.isDesktop ? theme.responsive.minTouchTarget : undefined,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.fontSize.md,
  },
  searchBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  searchBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: getResponsiveValue({ 
      phone: theme.spacing.md, 
      tablet: theme.spacing.lg,
      largeTablet: theme.spacing.xl 
    }),
    paddingTop: getResponsiveValue({ 
      phone: Platform.OS === 'ios' ? theme.spacing.sm : theme.spacing.md,
      tablet: theme.spacing.lg,
      largeTablet: theme.spacing.xl 
    }),
  },
  worldCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: getResponsiveValue({ 
      phone: theme.spacing.lg, 
      tablet: theme.spacing.xl,
      largeTablet: theme.spacing.xxl 
    }),
    marginBottom: getResponsiveValue({ 
      phone: theme.spacing.lg, 
      tablet: theme.spacing.xl 
    }),
    borderWidth: 2,
  },
  worldCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  worldName: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  genreBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  genreText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.background,
  },
  worldDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveValue({ 
      phone: theme.spacing.sm, 
      tablet: theme.spacing.md,
      largeTablet: theme.spacing.lg 
    }),
  },
  statCard: {
    flex: 1,
    minWidth: getResponsiveValue({ 
      phone: Platform.OS === 'ios' ? '30%' : '32%', 
      tablet: '22%',
      largeTablet: '20%' 
    }),
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    padding: getResponsiveValue({ 
      phone: Platform.OS === 'ios' ? theme.spacing.md : theme.spacing.md + 2,
      tablet: theme.spacing.lg,
      largeTablet: theme.spacing.xl 
    }),
    alignItems: 'center',
    elevation: Platform.OS === 'android' ? 1 : 0,
    shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 1 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.05 : 0,
    shadowRadius: Platform.OS === 'ios' ? 2 : 0,
  },
  statCount: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  quickActions: {
    marginBottom: getResponsiveValue({ 
      phone: theme.spacing.lg, 
      tablet: theme.spacing.xl,
      largeTablet: theme.spacing.xxl 
    }),
  },
  actionCard: {
    width: getResponsiveValue({ 
      phone: Platform.OS === 'ios' ? 120 : 130,
      tablet: 140,
      largeTablet: 160,
      desktop: 110 
    }),
    height: getResponsiveValue({ 
      phone: Platform.OS === 'ios' ? 120 : 130,
      tablet: 140,
      largeTablet: 160,
      desktop: 110 
    }),
    borderRadius: theme.borderRadius.lg,
    padding: getResponsiveValue({ 
      phone: theme.spacing.md,
      tablet: theme.spacing.lg,
      largeTablet: theme.spacing.xl,
      desktop: theme.spacing.md 
    }),
    marginRight: getResponsiveValue({ 
      phone: theme.spacing.md,
      tablet: theme.spacing.lg,
      desktop: theme.spacing.sm 
    }),
    alignItems: 'center',
    justifyContent: 'center',
    // Ensure proper touch target - smaller for desktop
    minWidth: deviceInfo.isDesktop ? theme.responsive.minTouchTarget * 2.2 : theme.mobile.minTouchTarget * 2.5,
    minHeight: deviceInfo.isDesktop ? theme.responsive.minTouchTarget * 2.2 : theme.mobile.minTouchTarget * 2.5,
    ...theme.shadows.medium,
  },
  actionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  searchResults: {
    gap: theme.spacing.sm,
  },
  searchResult: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    minHeight: Platform.OS === 'android' ? 56 : 52,
    elevation: Platform.OS === 'android' ? 1 : 0,
    shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 1 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.05 : 0,
    shadowRadius: Platform.OS === 'ios' ? 2 : 0,
  },
  resultTypeBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.md,
  },
  resultTypeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.background,
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  resultDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
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
    paddingHorizontal: theme.spacing.xl,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.lg,
    alignItems: 'center',
    minHeight: theme.mobile.buttonMinHeight,
    ...theme.shadows.large,
  },
  createButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.background,
    marginLeft: theme.spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 20 : 0,
    paddingBottom: Platform.OS === 'android' ? 20 : 0,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: getResponsiveValue({ 
      phone: deviceInfo.isSmallScreen ? theme.spacing.md : theme.spacing.lg,
      tablet: theme.spacing.xl,
      largeTablet: theme.spacing.xxl 
    }),
    margin: getResponsiveValue({ 
      phone: theme.spacing.md,
      tablet: theme.spacing.lg,
      largeTablet: theme.spacing.xl 
    }),
    ...theme.shadows.large,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  input: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  genreOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  genreOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  genreOptionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    minHeight: theme.mobile.buttonMinHeight,
    justifyContent: 'center',
    backgroundColor: Platform.OS === 'android' ? theme.colors.surfaceLight : 'transparent',
  },
  cancelButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    minHeight: theme.mobile.buttonMinHeight,
    justifyContent: 'center',
    ...theme.shadows.medium,
  },
  confirmButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.background,
  },
  modalDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    minHeight: Platform.OS === 'android' ? 56 : 52,
    elevation: Platform.OS === 'android' ? 1 : 0,
    shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 1 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'ios' ? 0.05 : 0,
    shadowRadius: Platform.OS === 'ios' ? 2 : 0,
  },
  exportOptionContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  exportOptionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  exportOptionDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  importTextArea: {
    minHeight: 120,
    textAlignVertical: 'top',
    fontFamily: 'monospace',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  quickExportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs,
  },
  quickExportText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    width: deviceInfo.isDesktop ? 48 : theme.mobile.fabSize,
    height: deviceInfo.isDesktop ? 48 : theme.mobile.fabSize,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.large,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.responsive.adaptiveSpacing.md,
    marginBottom: theme.spacing.lg,
  },
  actionCardGrid: {
    width: Math.floor(Dimensions.get('window').width * (100 / 3 - 2) / 100),
    height: theme.responsive.isTablet ? 140 : 120,
    marginRight: 0,
    minWidth: theme.responsive.minTouchTarget * 2.5,
    minHeight: theme.responsive.minTouchTarget * 2.5,
  },
});