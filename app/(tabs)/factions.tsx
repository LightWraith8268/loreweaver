import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Plus, Sparkles, Shield, Search, X, Wand2 } from 'lucide-react-native';
import { useWorld } from '@/hooks/world-context';
import { useAI } from '@/hooks/ai-context';
import { theme } from '@/constants/theme';
import { SelectWorldPrompt } from '@/components/SelectWorldPrompt';

export default function FactionsScreen() {
  const { currentWorld, factions, createFaction } = useWorld();
  const { isGenerating, generateName, generateContent } = useAI();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedFactionType, setSelectedFactionType] = useState<string>('guild');
  const [customPrompt, setCustomPrompt] = useState('');
  
  const factionTypes = [
    { id: 'guild', label: 'Guild', description: 'Professional or trade organization' },
    { id: 'kingdom', label: 'Kingdom', description: 'Ruling political entity' },
    { id: 'cult', label: 'Cult', description: 'Religious or mystical group' },
    { id: 'mercenary', label: 'Mercenary Company', description: 'Professional soldiers for hire' },
    { id: 'noble-house', label: 'Noble House', description: 'Aristocratic family or bloodline' },
    { id: 'criminal', label: 'Criminal Organization', description: 'Thieves guild or crime syndicate' },
    { id: 'military', label: 'Military Order', description: 'Organized fighting force' },
    { id: 'scholarly', label: 'Scholarly Society', description: 'Academic or research institution' },
    { id: 'rebel', label: 'Rebel Group', description: 'Revolutionary or resistance movement' },
    { id: 'secret', label: 'Secret Society', description: 'Hidden organization with agenda' },
  ];
  
  const filteredFactions = factions.filter(faction => 
    faction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faction.type.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleQuickCreate = async () => {
    if (!currentWorld) {
      Alert.alert('Error', 'Please select a world first');
      return;
    }
    
    setIsCreating(true);
    try {
      const name = await generateName('faction');
      await createFaction({
        worldId: currentWorld.id,
        name,
        type: 'Guild',
        ideology: '',
        goals: [],
        leaders: [],
        memberIds: [],
        allies: [],
        enemies: [],
        notes: '',
      });
      Alert.alert('Success', `Created faction: ${name}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create faction');
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleAIGenerate = async () => {
    if (!currentWorld) {
      Alert.alert('Error', 'Please select a world first');
      return;
    }
    
    setIsCreating(true);
    try {
      const selectedType = factionTypes.find(t => t.id === selectedFactionType);
      const typeDescription = selectedType?.description || 'faction';
      
      const prompt = `Generate a detailed ${selectedFactionType.replace('-', ' ')} faction for a ${currentWorld.genre} world.
      
World Context: ${currentWorld.name} - ${currentWorld.description}
      
Faction Type: ${typeDescription}
      ${customPrompt ? `\nAdditional Requirements: ${customPrompt}` : ''}
      
Generate:
      1. Name (appropriate for the world's genre and faction type)
      2. Core ideology and beliefs
      3. 3-5 primary goals or objectives
      4. Key leaders and their roles
      5. Organizational structure
      6. Resources and influence
      
      Return as JSON with fields: name, ideology, goals (array), leaders (array), notes`;
      
      const generated = await generateContent(prompt);
      const factionData = JSON.parse(generated);
      
      await createFaction({
        worldId: currentWorld.id,
        name: factionData.name || 'Generated Faction',
        type: selectedType?.label || 'Guild',
        ideology: factionData.ideology || '',
        goals: factionData.goals || [],
        leaders: factionData.leaders || [],
        memberIds: [],
        allies: [],
        enemies: [],
        notes: factionData.notes || '',
      });
      
      setShowAIModal(false);
      setCustomPrompt('');
      Alert.alert('Success', `Created faction: ${factionData.name}`);
    } catch (error) {
      console.error('AI generation error:', error);
      Alert.alert('Error', 'Failed to generate faction');
    } finally {
      setIsCreating(false);
    }
  };
  
  if (!currentWorld) {
    return (
      <View style={styles.container}>
        <SelectWorldPrompt
          title="Factions & Organizations"
          description="Select a world to create and manage factions, guilds, and organizations"
          customIcon={<Shield size={40} color={theme.colors.textTertiary} />}
          variant="inline"
          testID="factions-select-world"
        />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color={theme.colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search factions..."
          placeholderTextColor={theme.colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredFactions.length > 0 ? (
          <View style={styles.factionList}>
            {filteredFactions.map((faction) => (
              <TouchableOpacity
                key={faction.id}
                style={styles.factionCard}
                onPress={() => router.push({
                  pathname: '/faction-edit',
                  params: { id: faction.id }
                })}
              >
                <View style={styles.factionHeader}>
                  <View style={styles.factionIcon}>
                    <Shield size={24} color={theme.colors.warning} />
                  </View>
                  <View style={styles.factionInfo}>
                    <Text style={styles.factionName}>{faction.name}</Text>
                    <Text style={styles.factionType}>{faction.type}</Text>
                  </View>
                </View>
                {faction.ideology && (
                  <Text style={styles.factionIdeology} numberOfLines={2}>
                    {faction.ideology}
                  </Text>
                )}
                <View style={styles.factionStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{faction.memberIds.length}</Text>
                    <Text style={styles.statLabel}>Members</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{faction.allies.length}</Text>
                    <Text style={styles.statLabel}>Allies</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{faction.enemies.length}</Text>
                    <Text style={styles.statLabel}>Enemies</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Shield size={48} color={theme.colors.textTertiary} />
            <Text style={styles.emptyStateTitle}>No Factions Yet</Text>
            <Text style={styles.emptyStateDescription}>
              Create organizations and groups that shape your world
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.fab, styles.tertiaryFab]}
          onPress={() => setShowAIModal(true)}
          disabled={isCreating || isGenerating}
        >
          <Wand2 size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.fab, styles.secondaryFab]}
          onPress={handleQuickCreate}
          disabled={isCreating || isGenerating}
        >
          {isCreating || isGenerating ? (
            <ActivityIndicator color={theme.colors.text} />
          ) : (
            <Sparkles size={24} color={theme.colors.text} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => router.push({
            pathname: '/faction-edit',
            params: { id: 'new' }
          })}
        >
          <Plus size={28} color={theme.colors.background} />
        </TouchableOpacity>
      </View>
      
      {/* AI Generation Modal */}
      <Modal
        visible={showAIModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAIModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>AI Faction Generator</Text>
              <TouchableOpacity onPress={() => setShowAIModal(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.sectionLabel}>Faction Type</Text>
            <ScrollView style={styles.typeSelector} showsVerticalScrollIndicator={false}>
              {factionTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeOption,
                    selectedFactionType === type.id && styles.selectedTypeOption
                  ]}
                  onPress={() => setSelectedFactionType(type.id)}
                >
                  <Text style={[
                    styles.typeLabel,
                    selectedFactionType === type.id && styles.selectedTypeLabel
                  ]}>
                    {type.label}
                  </Text>
                  <Text style={styles.typeDescription}>{type.description}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <Text style={styles.sectionLabel}>Additional Requirements (Optional)</Text>
            <TextInput
              style={styles.promptInput}
              placeholder="e.g., controls the docks, worships ancient gods, seeks to overthrow the king..."
              placeholderTextColor={theme.colors.textTertiary}
              value={customPrompt}
              onChangeText={setCustomPrompt}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAIModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.generateButton}
                onPress={handleAIGenerate}
                disabled={isCreating || isGenerating}
              >
                {isCreating || isGenerating ? (
                  <ActivityIndicator color={theme.colors.background} />
                ) : (
                  <>
                    <Wand2 size={16} color={theme.colors.background} />
                    <Text style={styles.generateButtonText}>Generate</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    margin: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  factionList: {
    gap: theme.spacing.md,
  },
  factionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  factionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  factionIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  factionInfo: {
    flex: 1,
  },
  factionName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  factionType: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.warning,
  },
  factionIdeology: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginVertical: theme.spacing.sm,
  },
  factionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyStateTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  emptyStateDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  actionButtons: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  fab: {
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
  secondaryFab: {
    backgroundColor: theme.colors.warning,
    marginBottom: theme.spacing.md,
  },
  tertiaryFab: {
    backgroundColor: theme.colors.secondary,
    marginBottom: theme.spacing.md,
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  sectionLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  typeSelector: {
    maxHeight: 200,
    marginBottom: theme.spacing.lg,
  },
  typeOption: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  selectedTypeOption: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  typeLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  selectedTypeLabel: {
    color: theme.colors.primary,
  },
  typeDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  promptInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
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
  generateButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  generateButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.background,
  },
});