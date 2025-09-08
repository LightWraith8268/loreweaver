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
import { Plus, Sparkles, User, Search, X, Wand2 } from 'lucide-react-native';
import { useWorld } from '@/hooks/world-context';
import { useAI } from '@/hooks/ai-context';
import { theme, responsive } from '@/constants/theme';
import { SelectWorldPrompt } from '@/components/SelectWorldPrompt';

const { getResponsiveValue } = responsive;

export default function CharactersScreen() {
  const { currentWorld, characters, createCharacter } = useWorld();
  const { isGenerating, generateName, generateContent } = useAI();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedCharacterType, setSelectedCharacterType] = useState<string>('main-character');
  const [customPrompt, setCustomPrompt] = useState('');
  
  const characterTypes = [
    { id: 'main-character', label: 'Main Character', description: 'Protagonist or central figure' },
    { id: 'secondary-character', label: 'Secondary Character', description: 'Supporting character with important role' },
    { id: 'villain', label: 'Villain', description: 'Antagonist or enemy' },
    { id: 'mentor', label: 'Mentor', description: 'Wise guide or teacher' },
    { id: 'ally', label: 'Ally', description: 'Friend or companion' },
    { id: 'neutral', label: 'Neutral NPC', description: 'Background character or neutral party' },
    { id: 'mysterious', label: 'Mysterious Figure', description: 'Enigmatic character with hidden motives' },
    { id: 'comic-relief', label: 'Comic Relief', description: 'Humorous or lighthearted character' },
  ];
  
  const filteredCharacters = characters.filter(char => 
    char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    char.role.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleQuickCreate = async () => {
    if (!currentWorld) {
      Alert.alert('Error', 'Please select a world first');
      return;
    }
    
    setIsCreating(true);
    try {
      const name = await generateName('character');
      await createCharacter({
        worldId: currentWorld.id,
        name,
        role: 'Adventurer',
        traits: ['Brave', 'Curious'],
        appearance: '',
        backstory: '',
        relationships: [],
        factionIds: [],
        locationIds: [],
        notes: '',
      });
      Alert.alert('Success', `Created character: ${name}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create character');
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
      const selectedType = characterTypes.find(t => t.id === selectedCharacterType);
      const typeDescription = selectedType?.description || 'character';
      
      const prompt = `Generate a detailed ${selectedCharacterType.replace('-', ' ')} character for a ${currentWorld.genre} world.
      
World Context: ${currentWorld.name} - ${currentWorld.description}
      
Character Type: ${typeDescription}
      ${customPrompt ? `\nAdditional Requirements: ${customPrompt}` : ''}
      
Generate:
      1. Name (appropriate for the world's genre)
      2. Role/occupation
      3. 4-6 personality traits
      4. Physical appearance
      5. Detailed backstory
      6. Motivations and goals
      
      Return as JSON with fields: name, role, traits (array), appearance, backstory, notes`;
      
      const generated = await generateContent(prompt);
      const characterData = JSON.parse(generated);
      
      await createCharacter({
        worldId: currentWorld.id,
        name: characterData.name || 'Generated Character',
        role: characterData.role || 'Adventurer',
        traits: characterData.traits || ['Mysterious'],
        appearance: characterData.appearance || '',
        backstory: characterData.backstory || '',
        relationships: [],
        factionIds: [],
        locationIds: [],
        notes: characterData.notes || '',
      });
      
      setShowAIModal(false);
      setCustomPrompt('');
      Alert.alert('Success', `Created character: ${characterData.name}`);
    } catch (error) {
      console.error('AI generation error:', error);
      Alert.alert('Error', 'Failed to generate character');
    } finally {
      setIsCreating(false);
    }
  };
  
  if (!currentWorld) {
    return (
      <SelectWorldPrompt
        title="Characters"
        description="Select a world to create and manage characters for your stories"
        customIcon={<User size={64} color={theme.colors.textTertiary} />}
      />
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color={theme.colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search characters..."
          placeholderTextColor={theme.colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredCharacters.length > 0 ? (
          <View style={styles.characterGrid}>
            {filteredCharacters.map((character) => (
              <TouchableOpacity
                key={character.id}
                style={styles.characterCard}
                onPress={() => router.push({
                  pathname: '/character-edit',
                  params: { id: character.id }
                })}
              >
                <View style={styles.characterAvatar}>
                  <User size={32} color={theme.colors.primary} />
                </View>
                <Text style={styles.characterName} numberOfLines={1}>
                  {character.name}
                </Text>
                <Text style={styles.characterRole} numberOfLines={1}>
                  {character.role}
                </Text>
                <View style={styles.characterTraits}>
                  {character.traits.slice(0, 2).map((trait, index) => (
                    <View key={index} style={styles.traitBadge}>
                      <Text style={styles.traitText}>{trait}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <User size={48} color={theme.colors.textTertiary} />
            <Text style={styles.emptyStateTitle}>No Characters Yet</Text>
            <Text style={styles.emptyStateDescription}>
              Create your first character to bring your world to life
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
            pathname: '/character-edit',
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
              <Text style={styles.modalTitle}>AI Character Generator</Text>
              <TouchableOpacity onPress={() => setShowAIModal(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.sectionLabel}>Character Type</Text>
            <ScrollView style={styles.typeSelector} showsVerticalScrollIndicator={false}>
              {characterTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeOption,
                    selectedCharacterType === type.id && styles.selectedTypeOption
                  ]}
                  onPress={() => setSelectedCharacterType(type.id)}
                >
                  <Text style={[
                    styles.typeLabel,
                    selectedCharacterType === type.id && styles.selectedTypeLabel
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
              placeholder="e.g., has a mysterious past, skilled in magic, comes from a noble family..."
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
    paddingHorizontal: getResponsiveValue({ 
      phone: theme.spacing.md,
      tablet: theme.spacing.lg 
    }),
    paddingVertical: getResponsiveValue({ 
      phone: theme.spacing.sm,
      tablet: theme.spacing.md 
    }),
    margin: getResponsiveValue({ 
      phone: theme.spacing.md,
      tablet: theme.spacing.lg,
      largeTablet: theme.spacing.xl 
    }),
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    padding: getResponsiveValue({ 
      phone: theme.spacing.md,
      tablet: theme.spacing.lg,
      largeTablet: theme.spacing.xl 
    }),
  },
  characterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveValue({ 
      phone: theme.spacing.md,
      tablet: theme.spacing.lg,
      largeTablet: theme.spacing.xl 
    }),
  },
  characterCard: {
    width: getResponsiveValue({ 
      phone: '47%',
      tablet: '30%',
      largeTablet: '22%' 
    }),
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: getResponsiveValue({ 
      phone: theme.spacing.md,
      tablet: theme.spacing.lg,
      largeTablet: theme.spacing.xl 
    }),
    alignItems: 'center',
  },
  characterAvatar: {
    width: getResponsiveValue({ 
      phone: 64,
      tablet: 80,
      largeTablet: 96 
    }),
    height: getResponsiveValue({ 
      phone: 64,
      tablet: 80,
      largeTablet: 96 
    }),
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getResponsiveValue({ 
      phone: theme.spacing.sm,
      tablet: theme.spacing.md 
    }),
  },
  characterName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  characterRole: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  characterTraits: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  traitBadge: {
    backgroundColor: theme.colors.primary + '30',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  traitText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: getResponsiveValue({ 
      phone: theme.spacing.xxl,
      tablet: theme.spacing.xxl * 1.5,
      largeTablet: theme.spacing.xxl * 2 
    }),
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
    bottom: getResponsiveValue({ 
      phone: theme.spacing.lg,
      tablet: theme.spacing.xl,
      largeTablet: theme.spacing.xxl 
    }),
    right: getResponsiveValue({ 
      phone: theme.spacing.lg,
      tablet: theme.spacing.xl,
      largeTablet: theme.spacing.xxl 
    }),
    gap: getResponsiveValue({ 
      phone: theme.spacing.md,
      tablet: theme.spacing.lg 
    }),
  },
  fab: {
    width: getResponsiveValue({ 
      phone: 56,
      tablet: 64,
      largeTablet: 72 
    }),
    height: getResponsiveValue({ 
      phone: 56,
      tablet: 64,
      largeTablet: 72 
    }),
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
    backgroundColor: theme.colors.secondary,
    marginBottom: theme.spacing.md,
  },
  tertiaryFab: {
    backgroundColor: theme.colors.accent,
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