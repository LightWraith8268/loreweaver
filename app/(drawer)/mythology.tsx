import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { Plus, Crown, Users, BookOpen, Star, Wand2 } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useWorld } from '@/hooks/world-context';
import { useAI } from '@/hooks/ai-context';
import { SelectWorldPrompt } from '@/components/SelectWorldPrompt';
import { StandardModal } from '@/components/StandardModal';
import type { Mythology } from '@/types/world';

export default function MythologyScreen() {
  const { currentWorld, mythologies, deleteMythology, createMythology } = useWorld();
  const { generateContent, isGenerating } = useAI();
  const [expandingId, setExpandingId] = useState<string | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedMythologyType, setSelectedMythologyType] = useState<string>('pantheon');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const mythologyTypes = [
    { id: 'pantheon', label: 'Pantheon', description: 'Collection of gods and deities' },
    { id: 'religion', label: 'Religion', description: 'Organized belief system with doctrine' },
    { id: 'belief', label: 'Cultural Belief', description: 'Folk beliefs and traditions' },
    { id: 'legend', label: 'Legend', description: 'Heroic tales and epic stories' },
    { id: 'myth', label: 'Creation Myth', description: 'Origin stories of the world' },
    { id: 'prophecy', label: 'Prophecy', description: 'Foretelling of future events' },
    { id: 'afterlife', label: 'Afterlife Beliefs', description: 'What happens after death' },
    { id: 'cosmology', label: 'Cosmology', description: 'Structure and nature of the universe' },
  ];

  if (!currentWorld) {
    return (
      <SelectWorldPrompt
        title="Mythology & Religion"
        description="Select a world to create pantheons, religions, and belief systems"
        customIcon={<Crown size={64} color={theme.colors.textTertiary} />}
      />
    );
  }

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Mythology',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMythology(id),
        },
      ]
    );
  };

  const handleExpand = async (mythology: Mythology) => {
    setExpandingId(mythology.id);
    try {
      const prompt = `Expand on this mythology: ${mythology.name}. Type: ${mythology.type}. Origin: ${mythology.origin}. Current beliefs: ${mythology.beliefs.join(', ')}. Add more detailed lore, deities, and cultural significance.`;
      const expanded = await generateContent(prompt, currentWorld);
      
      router.push({
        pathname: '/mythology-edit',
        params: { 
          id: mythology.id,
          expandedContent: expanded
        }
      });
    } catch (error) {
      console.error('Failed to expand mythology:', error);
      Alert.alert('Error', 'Failed to expand mythology');
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
      const selectedType = mythologyTypes.find(t => t.id === selectedMythologyType);
      const typeDescription = selectedType?.description || 'mythology';
      
      const prompt = `Generate a detailed ${selectedMythologyType} mythology for a ${currentWorld.genre} world.
      
World Context: ${currentWorld.name} - ${currentWorld.description}
      
Mythology Type: ${typeDescription}
      ${customPrompt ? `\nAdditional Requirements: ${customPrompt}` : ''}
      
Generate:
      1. Name (appropriate for the world's genre and mythology type)
      2. Origin story or historical background
      3. Core beliefs and doctrines (array)
      4. Key deities or figures with names and domains
      5. Sacred texts, rituals, or practices
      6. Followers and cultural groups
      
      Return as JSON with fields: name, type, origin, beliefs (array), deities (array with name and domain), followers (array), practices (array), notes`;
      
      const generated = await generateContent(prompt);
      const mythologyData = JSON.parse(generated);
      
      // Map the selected type to the allowed Mythology type
      const getMythologyType = (selected: string): 'pantheon' | 'religion' | 'belief' | 'legend' | 'myth' => {
        switch (selected) {
          case 'pantheon': return 'pantheon';
          case 'religion': return 'religion';
          case 'belief': return 'belief';
          case 'legend': return 'legend';
          case 'myth': return 'myth';
          case 'prophecy': return 'legend';
          case 'afterlife': return 'belief';
          case 'cosmology': return 'myth';
          default: return 'myth';
        }
      };
      
      await createMythology({
        worldId: currentWorld.id,
        name: mythologyData.name || 'Generated Mythology',
        type: getMythologyType(selectedMythologyType),
        origin: mythologyData.origin || '',
        beliefs: mythologyData.beliefs || [],
        deities: mythologyData.deities || [],
        followers: mythologyData.followers || [],
        rituals: mythologyData.practices || [],
        holyTexts: [],
        symbols: [],
        history: '',
        notes: mythologyData.notes || '',
      });
      
      setShowAIModal(false);
      setCustomPrompt('');
      Alert.alert('Success', `Created mythology: ${mythologyData.name}`);
    } catch (error) {
      console.error('AI generation error:', error);
      Alert.alert('Error', 'Failed to generate mythology');
    } finally {
      setIsCreating(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pantheon': return '#9333ea';
      case 'religion': return '#dc2626';
      case 'belief': return '#059669';
      case 'legend': return '#ea580c';
      case 'myth': return '#0284c7';
      default: return theme.colors.primary;
    }
  };

  const renderMythology = (mythology: Mythology) => (
    <TouchableOpacity
      key={mythology.id}
      style={styles.card}
      onPress={() => router.push({ pathname: '/mythology-edit', params: { id: mythology.id } })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <Crown size={20} color={getTypeColor(mythology.type)} />
          <Text style={styles.cardName}>{mythology.name}</Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleExpand(mythology);
            }}
            disabled={expandingId === mythology.id}
            style={[styles.actionButton, expandingId === mythology.id && styles.actionButtonDisabled]}
          >
            <Star size={16} color={expandingId === mythology.id ? theme.colors.textTertiary : theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleDelete(mythology.id, mythology.name);
            }}
            style={styles.actionButton}
          >
            <Text style={styles.deleteText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.tagContainer}>
          <View style={[styles.tag, { backgroundColor: getTypeColor(mythology.type) + '20' }]}>
            <Text style={[styles.tagText, { color: getTypeColor(mythology.type) }]}>
              {mythology.type.charAt(0).toUpperCase() + mythology.type.slice(1)}
            </Text>
          </View>
        </View>
        
        {mythology.origin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Origin</Text>
            <Text style={styles.sectionText} numberOfLines={2}>
              {mythology.origin}
            </Text>
          </View>
        )}
        
        {mythology.deities.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Crown size={14} color={theme.colors.textSecondary} />
              <Text style={styles.sectionTitle}>Deities</Text>
            </View>
            <Text style={styles.sectionText} numberOfLines={1}>
              {mythology.deities.slice(0, 3).map(d => d.name).join(', ')}
              {mythology.deities.length > 3 && '...'}
            </Text>
          </View>
        )}
        
        {mythology.beliefs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <BookOpen size={14} color={theme.colors.textSecondary} />
              <Text style={styles.sectionTitle}>Core Beliefs</Text>
            </View>
            <Text style={styles.sectionText} numberOfLines={2}>
              {mythology.beliefs.slice(0, 2).join(', ')}
              {mythology.beliefs.length > 2 && '...'}
            </Text>
          </View>
        )}
        
        {mythology.followers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Users size={14} color={theme.colors.textSecondary} />
              <Text style={styles.sectionTitle}>Followers</Text>
            </View>
            <Text style={styles.sectionText} numberOfLines={1}>
              {mythology.followers.slice(0, 3).join(', ')}
              {mythology.followers.length > 3 && '...'}
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
          title: 'Mythology',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/mythology-edit')}
              style={styles.addButton}
            >
              <Plus size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      {mythologies.length === 0 ? (
        <View style={styles.emptyState}>
          <Crown size={64} color={theme.colors.textTertiary} />
          <Text style={styles.emptyTitle}>No Mythologies</Text>
          <Text style={styles.emptyDescription}>Create your first mythology to get started</Text>
          <View style={styles.emptyActions}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowAIModal(true)}
            >
              <Wand2 size={20} color={theme.colors.background} />
              <Text style={styles.createButtonText}>Generate Mythology</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.createButton, styles.manualButton]}
              onPress={() => router.push('/mythology-edit')}
            >
              <Plus size={20} color={theme.colors.primary} />
              <Text style={[styles.createButtonText, styles.manualButtonText]}>Create Manually</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {mythologies.map(renderMythology)}
          </View>
        </ScrollView>
      )}
      
      {/* AI Generation Modal */}
      <StandardModal
        visible={showAIModal}
        onClose={() => setShowAIModal(false)}
        title="AI Mythology Generator"
        size="large"
        scrollable={true}
      >
        <View style={styles.modalBody}>
          <Text style={styles.sectionLabel}>Mythology Type</Text>
          <ScrollView style={styles.typeSelector} showsVerticalScrollIndicator={false}>
            {mythologyTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeOption,
                  selectedMythologyType === type.id && styles.selectedTypeOption
                ]}
                onPress={() => setSelectedMythologyType(type.id)}
              >
                <Text style={[
                  styles.typeLabel,
                  selectedMythologyType === type.id && styles.selectedTypeLabel
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
            placeholder="e.g., based on Norse mythology, includes trickster gods, emphasizes balance..."
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
  emptyState: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
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
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  tagText: {
    fontSize: theme.fontSize.sm,
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
});