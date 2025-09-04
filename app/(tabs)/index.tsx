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
} from 'react-native';
import { router } from 'expo-router';
import { Plus, Globe, Search, Settings, Download, Upload, History, Users, MapPin, Package, Shield, FileText, CheckCircle, Sparkles, Network, Crown } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWorld } from '@/hooks/world-context';
import { useAI } from '@/hooks/ai-context';
import { theme } from '@/constants/theme';

import NameGenerator from '@/components/NameGenerator';
import type { World } from '@/types/world';

export default function DashboardScreen() {
  const { 
    worlds, 
    currentWorld, 
    setCurrentWorld, 
    createWorld,
    searchQuery,
    setSearchQuery,
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
  const { checkConsistency, isGenerating } = useAI();
  const insets = useSafeAreaInsets();
  
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
  
  const handleImportWorld = async () => {
    if (!importData.trim()) {
      Alert.alert('Error', 'Please paste the world data');
      return;
    }
    
    setIsImporting(true);
    try {
      const data = JSON.parse(importData);
      await importWorldData(data);
      
      Alert.alert('Success', 'World data imported successfully');
      setShowImportModal(false);
      setImportData('');
    } catch (error) {
      Alert.alert('Error', 'Invalid world data format');
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
  
  const genreColors = {
    fantasy: theme.colors.fantasy,
    'sci-fi': theme.colors.scifi,
    cyberpunk: theme.colors.cyberpunk,
    mythology: theme.colors.mythology,
    custom: theme.colors.primary,
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>LoreWeaver</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => router.push('/world-select' as any)}
            >
              <Globe size={24} color={theme.colors.text} />
            </TouchableOpacity>
            {currentWorld && (
              <>
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={() => setShowExportModal(true)}
                >
                  <Download size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={handleCreateSnapshot}
                >
                  <History size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => setShowImportModal(true)}
            >
              <Upload size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color={theme.colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search across all content..."
            placeholderTextColor={theme.colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === 'ios' ? 84 + insets.bottom + theme.spacing.lg : 68 + theme.spacing.lg }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {currentWorld ? (
          <>
            {/* Current World Card */}
            <View style={[styles.worldCard, { borderColor: genreColors[currentWorld.genre] }]}>
              <View style={styles.worldCardHeader}>
                <Text style={styles.worldName}>{currentWorld.name}</Text>
                <View style={[styles.genreBadge, { backgroundColor: genreColors[currentWorld.genre] }]}>
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
                onPress={() => router.push('/characters')}
              >
                <Users size={32} color={theme.colors.primary} />
                <Text style={styles.actionText}>New Character</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionCard, { backgroundColor: theme.colors.secondary + '20' }]}
                onPress={() => router.push('/locations')}
              >
                <MapPin size={32} color={theme.colors.secondary} />
                <Text style={styles.actionText}>New Location</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionCard, { backgroundColor: theme.colors.accent + '20' }]}
                onPress={() => router.push('/items')}
              >
                <Package size={32} color={theme.colors.accent} />
                <Text style={styles.actionText}>New Item</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionCard, { backgroundColor: theme.colors.warning + '20' }]}
                onPress={() => router.push('/factions')}
              >
                <Shield size={32} color={theme.colors.warning} />
                <Text style={styles.actionText}>New Faction</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionCard, { backgroundColor: theme.colors.success + '20' }]}
                onPress={handleCheckConsistency}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <ActivityIndicator color={theme.colors.success} />
                ) : (
                  <CheckCircle size={32} color={theme.colors.success} />
                )}
                <Text style={styles.actionText}>Check Consistency</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionCard, { backgroundColor: theme.colors.accent + '20' }]}
                onPress={() => router.push('/relationships')}
              >
                <Network size={32} color={theme.colors.accent} />
                <Text style={styles.actionText}>View Relations</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionCard, { backgroundColor: '#9333ea20' }]}
                onPress={() => router.push('/magic')}
              >
                <Sparkles size={32} color="#9333ea" />
                <Text style={styles.actionText}>Magic Systems</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionCard, { backgroundColor: '#dc262620' }]}
                onPress={() => router.push('/mythology')}
              >
                <Crown size={32} color="#dc2626" />
                <Text style={styles.actionText}>Mythologies</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionCard, { backgroundColor: theme.colors.secondary + '20' }]}
                onPress={() => {
                  setNameGeneratorType('character');
                  setShowNameGenerator(true);
                }}
              >
                <Sparkles size={32} color={theme.colors.secondary} />
                <Text style={styles.actionText}>Name Generator</Text>
              </TouchableOpacity>
            </ScrollView>
            
            {/* Search Results */}
            {searchQuery && searchResults.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Search Results</Text>
                <View style={styles.searchResults}>
                  {searchResults.slice(0, 5).map((result, index) => (
                    <TouchableOpacity key={index} style={styles.searchResult}>
                      <View style={[styles.resultTypeBadge, { backgroundColor: genreColors[currentWorld.genre] }]}>
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
          <View style={styles.emptyState}>
            <Globe size={64} color={theme.colors.textTertiary} />
            <Text style={styles.emptyTitle}>No World Selected</Text>
            <Text style={styles.emptyDescription}>
              Create your first world to start building your universe
            </Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Plus size={20} color={theme.colors.background} />
              <Text style={styles.createButtonText}>Create World</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      
      {/* Create World Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
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
                    newWorldGenre === genre && { backgroundColor: genreColors[genre] }
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
        </View>
      </Modal>
      
      {/* Export Modal */}
      <Modal
        visible={showExportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
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
        </View>
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
      
      {/* FAB */}
      {currentWorld && (
        <TouchableOpacity 
          style={styles.fab}
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
  },
  header: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  iconButton: {
    padding: theme.spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.md,
  },
  worldCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
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
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
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
    marginBottom: theme.spacing.lg,
  },
  actionCard: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginRight: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    width: '90%',
    maxWidth: 400,
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
    bottom: Platform.OS === 'ios' ? 84 + theme.spacing.lg + 16 : 68 + theme.spacing.lg,
    right: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});