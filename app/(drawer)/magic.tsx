import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { Plus, Sparkles, Wand2, BookOpen, Users } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useWorld } from '@/hooks/world-context';
import { useAI } from '@/hooks/ai-context';
import { SelectWorldPrompt } from '@/components/SelectWorldPrompt';
import { StandardModal } from '@/components/StandardModal';
import type { MagicSystem } from '@/types/world';

export default function MagicSystemsScreen() {
  const { currentWorld, magicSystems, deleteMagicSystem, createMagicSystem } = useWorld();
  const { generateContent, isGenerating } = useAI();
  const [expandingId, setExpandingId] = useState<string | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedMagicType, setSelectedMagicType] = useState<string>('elemental');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const magicTypes = [
    { id: 'elemental', label: 'Elemental Magic', description: 'Control over fire, water, earth, air' },
    { id: 'divine', label: 'Divine Magic', description: 'Power granted by gods or deities' },
    { id: 'arcane', label: 'Arcane Magic', description: 'Scholarly study of magical forces' },
    { id: 'nature', label: 'Nature Magic', description: 'Harmony with natural world and life' },
    { id: 'blood', label: 'Blood Magic', description: 'Power through sacrifice and life force' },
    { id: 'shadow', label: 'Shadow Magic', description: 'Manipulation of darkness and void' },
    { id: 'time', label: 'Time Magic', description: 'Control over temporal forces' },
    { id: 'mind', label: 'Mind Magic', description: 'Telepathy, illusion, and mental control' },
    { id: 'necromancy', label: 'Necromancy', description: 'Magic dealing with death and undeath' },
    { id: 'alchemy', label: 'Alchemy', description: 'Transformation through magical chemistry' },
  ];

  if (!currentWorld) {
    return (
      <SelectWorldPrompt
        title="Magic Systems"
        description="Select a world to create and manage magical systems and schools of magic"
        customIcon={<Sparkles size={64} color={theme.colors.textTertiary} />}
      />
    );
  }

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Magic System',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMagicSystem(id),
        },
      ]
    );
  };

  const handleExpand = async (magicSystem: MagicSystem) => {
    setExpandingId(magicSystem.id);
    try {
      const prompt = `Expand on this magic system: ${magicSystem.name}. Type: ${magicSystem.type}. Source: ${magicSystem.source}. Current rules: ${magicSystem.rules.join(', ')}. Add more detailed rules, limitations, and lore.`;
      const expanded = await generateContent(prompt, currentWorld);
      
      router.push({
        pathname: '/magic-edit',
        params: { 
          id: magicSystem.id,
          expandedContent: expanded
        }
      });
    } catch (error) {
      console.error('Failed to expand magic system:', error);
      Alert.alert('Error', 'Failed to expand magic system');
    } finally {
      setExpandingId(null);
    }
  };
  
  const handleAIGenerate = async () => {
    if (!currentWorld) {
      Alert.alert('Error', 'Please select a world first');
      return;
    }
    
    setIsCreating(true);
    try {
      const selectedType = magicTypes.find(t => t.id === selectedMagicType);
      const typeDescription = selectedType?.description || 'magic system';
      
      const prompt = `Generate a detailed ${selectedMagicType.replace('-', ' ')} magic system for a ${currentWorld.genre} world.
      
World Context: ${currentWorld.name} - ${currentWorld.description}
      
Magic Type: ${typeDescription}
      ${customPrompt ? `\nAdditional Requirements: ${customPrompt}` : ''}
      
Generate:
      1. Name (appropriate for the world's genre and magic type)
      2. Source of magical power
      3. 5-8 fundamental rules and mechanics
      4. Limitations and costs
      5. Notable practitioners or schools
      6. Artifacts or focuses used
      
      Return as JSON with fields: name, type, source, rules (array), limitations (array), practitioners (array), schools (array), artifacts (array), notes`;
      
      const generated = await generateContent(prompt);
      const magicData = JSON.parse(generated);
      
      await createMagicSystem({
        worldId: currentWorld.id,
        name: magicData.name || 'Generated Magic System',
        type: selectedType?.label || 'Arcane',
        source: magicData.source || 'Unknown',
        rules: magicData.rules || [],
        limitations: magicData.limitations || [],
        practitioners: magicData.practitioners || [],
        schools: magicData.schools || [],
        artifacts: magicData.artifacts || [],
        history: magicData.history || '',
        notes: magicData.notes || '',
      });
      
      setShowAIModal(false);
      setCustomPrompt('');
      Alert.alert('Success', `Created magic system: ${magicData.name}`);
    } catch (error) {
      console.error('AI generation error:', error);
      Alert.alert('Error', 'Failed to generate magic system');
    } finally {
      setIsCreating(false);
    }
  };

  const renderMagicSystem = (magicSystem: MagicSystem) => (
    <TouchableOpacity
      key={magicSystem.id}
      style={styles.card}
      onPress={() => router.push({ pathname: '/magic-edit', params: { id: magicSystem.id } })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <Wand2 size={20} color={theme.colors.primary} />
          <Text style={styles.cardName}>{magicSystem.name}</Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleExpand(magicSystem);
            }}
            disabled={expandingId === magicSystem.id}
            style={[styles.actionButton, expandingId === magicSystem.id && styles.actionButtonDisabled]}
          >
            <Sparkles size={16} color={expandingId === magicSystem.id ? theme.colors.textTertiary : theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleDelete(magicSystem.id, magicSystem.name);
            }}
            style={styles.actionButton}
          >
            <Text style={styles.deleteText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.tagContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{magicSystem.type}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{magicSystem.source}</Text>
          </View>
        </View>
        
        {magicSystem.rules.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rules</Text>
            <Text style={styles.sectionText} numberOfLines={2}>
              {magicSystem.rules.slice(0, 2).join(', ')}
              {magicSystem.rules.length > 2 && '...'}
            </Text>
          </View>
        )}
        
        {magicSystem.practitioners.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Users size={14} color={theme.colors.textSecondary} />
              <Text style={styles.sectionTitle}>Practitioners</Text>
            </View>
            <Text style={styles.sectionText} numberOfLines={1}>
              {magicSystem.practitioners.slice(0, 3).join(', ')}
              {magicSystem.practitioners.length > 3 && '...'}
            </Text>
          </View>
        )}
        
        {magicSystem.schools && magicSystem.schools.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <BookOpen size={14} color={theme.colors.textSecondary} />
              <Text style={styles.sectionTitle}>Schools</Text>
            </View>
            <Text style={styles.sectionText} numberOfLines={1}>
              {magicSystem.schools.slice(0, 3).join(', ')}
              {magicSystem.schools.length > 3 && '...'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Magic Systems',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/magic-edit')}
              style={styles.addButton}
            >
              <Plus size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      {magicSystems.length === 0 ? (
        <View style={styles.emptyState}>
          <Sparkles size={64} color={theme.colors.textTertiary} />
          <Text style={styles.emptyTitle}>No Magic Systems</Text>
          <Text style={styles.emptyDescription}>Create your first magic system to get started</Text>
          <View style={styles.emptyActions}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowAIModal(true)}
            >
              <Wand2 size={20} color={theme.colors.background} />
              <Text style={styles.createButtonText}>Generate Magic System</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.createButton, styles.manualButton]}
              onPress={() => router.push('/magic-edit')}
            >
              <Plus size={20} color={theme.colors.primary} />
              <Text style={[styles.createButtonText, styles.manualButtonText]}>Create Manually</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {magicSystems.map(renderMagicSystem)}
          </View>
        </ScrollView>
      )}
      
      {/* AI Generation Modal */}
      <StandardModal
        visible={showAIModal}
        onClose={() => setShowAIModal(false)}
        title="AI Magic System Generator"
        size="large"
        scrollable={true}
      >
        <View style={styles.modalBody}>
          <Text style={styles.sectionLabel}>Magic Type</Text>
          <ScrollView style={styles.typeSelector} showsVerticalScrollIndicator={false}>
            {magicTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeOption,
                  selectedMagicType === type.id && styles.selectedTypeOption
                ]}
                onPress={() => setSelectedMagicType(type.id)}
              >
                <Text style={[
                  styles.typeLabel,
                  selectedMagicType === type.id && styles.selectedTypeLabel
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
            placeholder="e.g., requires rare crystals, has dangerous side effects, limited by moon phases..."
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
      </StandardModal>
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
  emptyState: {
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
  },
  emptyDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
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
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  createButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
  },
  addButton: {
    padding: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  cardName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  cardActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  deleteText: {
    fontSize: 18,
    color: theme.colors.error,
    fontWeight: theme.fontWeight.bold,
  },
  cardContent: {
    gap: theme.spacing.md,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  tag: {
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  tagText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  section: {
    gap: theme.spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  sectionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 20,
  },
  emptyActions: {
    gap: theme.spacing.md,
    alignItems: 'center',
  },
  manualButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  manualButtonText: {
    color: theme.colors.primary,
  },
  modalBody: {
    flex: 1,
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