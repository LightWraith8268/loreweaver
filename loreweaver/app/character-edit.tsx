import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Save, Sparkles, X, Plus, Trash2 } from 'lucide-react-native';
import { useWorld } from '@/hooks/world-context';
import { useAI } from '@/hooks/ai-context';
import { theme } from '@/constants/theme';
import type { Character } from '@/types/world';

export default function CharacterEditScreen() {
  const { id } = useLocalSearchParams();
  const { currentWorld, characters, createCharacter, updateCharacter } = useWorld();
  const { isGenerating, expandCharacter } = useAI();
  
  const existingCharacter = id !== 'new' ? characters.find(c => c.id === id) : null;
  
  const [name, setName] = useState(existingCharacter?.name || '');
  const [role, setRole] = useState(existingCharacter?.role || '');
  const [appearance, setAppearance] = useState(existingCharacter?.appearance || '');
  const [backstory, setBackstory] = useState(existingCharacter?.backstory || '');
  const [traits, setTraits] = useState<string[]>(existingCharacter?.traits || []);
  const [newTrait, setNewTrait] = useState('');
  const [notes, setNotes] = useState(existingCharacter?.notes || '');
  const [relationships, setRelationships] = useState(existingCharacter?.relationships || []);
  const [newRelationshipCharacterId, setNewRelationshipCharacterId] = useState('');
  const [newRelationshipType, setNewRelationshipType] = useState('');
  const [newRelationshipDescription, setNewRelationshipDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Character name is required');
      return;
    }
    
    if (!currentWorld) {
      Alert.alert('Error', 'No world selected');
      return;
    }
    
    setIsSaving(true);
    try {
      const characterData = {
        worldId: currentWorld.id,
        name,
        role,
        appearance,
        backstory,
        traits,
        notes,
        relationships,
        factionIds: existingCharacter?.factionIds || [],
        locationIds: existingCharacter?.locationIds || [],
      };
      
      if (existingCharacter) {
        await updateCharacter(existingCharacter.id, characterData);
      } else {
        await createCharacter(characterData);
      }
      
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save character');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleExpand = async () => {
    if (!existingCharacter) {
      Alert.alert('Error', 'Save the character first before expanding');
      return;
    }
    
    try {
      const expanded = await expandCharacter(existingCharacter);
      if (expanded.traits) setTraits(expanded.traits);
      if (expanded.appearance) setAppearance(expanded.appearance);
      if (expanded.backstory) setBackstory(expanded.backstory);
      if (expanded.notes) setNotes(expanded.notes);
      Alert.alert('Success', 'Character expanded with AI');
    } catch (error) {
      Alert.alert('Error', 'Failed to expand character');
    }
  };
  
  const addTrait = () => {
    if (newTrait.trim()) {
      setTraits([...traits, newTrait.trim()]);
      setNewTrait('');
    }
  };
  
  const removeTrait = (index: number) => {
    setTraits(traits.filter((_, i) => i !== index));
  };
  
  const addRelationship = () => {
    if (newRelationshipCharacterId && newRelationshipType) {
      const targetCharacter = characters.find(c => c.id === newRelationshipCharacterId);
      if (targetCharacter) {
        const newRelationship = {
          characterId: newRelationshipCharacterId,
          characterName: targetCharacter.name,
          type: newRelationshipType,
          description: newRelationshipDescription,
        };
        setRelationships([...relationships, newRelationship]);
        setNewRelationshipCharacterId('');
        setNewRelationshipType('');
        setNewRelationshipDescription('');
      }
    }
  };
  
  const removeRelationship = (index: number) => {
    setRelationships(relationships.filter((_, i) => i !== index));
  };
  
  const availableCharacters = characters.filter(c => 
    c.id !== existingCharacter?.id && 
    !relationships.some(r => r.characterId === c.id)
  );
  
  const relationshipTypes = [
    'Friend', 'Enemy', 'Family', 'Ally', 'Rival', 'Mentor', 'Student', 'Lover', 'Colleague'
  ];
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {existingCharacter ? 'Edit Character' : 'New Character'}
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <Save size={24} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Character name"
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Role</Text>
          <TextInput
            style={styles.input}
            value={role}
            onChangeText={setRole}
            placeholder="e.g., Hero, Villain, Mentor"
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Appearance</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={appearance}
            onChangeText={setAppearance}
            placeholder="Physical description"
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            numberOfLines={3}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Backstory</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={backstory}
            onChangeText={setBackstory}
            placeholder="Character history and background"
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            numberOfLines={4}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Traits</Text>
          <View style={styles.traitInput}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={newTrait}
              onChangeText={setNewTrait}
              placeholder="Add a trait"
              placeholderTextColor={theme.colors.textTertiary}
              onSubmitEditing={addTrait}
            />
            <TouchableOpacity style={styles.addButton} onPress={addTrait}>
              <Plus size={20} color={theme.colors.background} />
            </TouchableOpacity>
          </View>
          <View style={styles.traitList}>
            {traits.map((trait, index) => (
              <TouchableOpacity
                key={index}
                style={styles.traitBadge}
                onPress={() => removeTrait(index)}
              >
                <Text style={styles.traitText}>{trait}</Text>
                <X size={14} color={theme.colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional notes"
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            numberOfLines={3}
          />
        </View>
        
        {/* Relationships */}
        <View style={styles.section}>
          <Text style={styles.label}>Relationships</Text>
          
          {availableCharacters.length > 0 && (
            <View style={styles.relationshipForm}>
              <View style={styles.relationshipInputRow}>
                <View style={styles.relationshipSelect}>
                  <Text style={styles.relationshipSelectLabel}>Character:</Text>
                  {availableCharacters.map(char => (
                    <TouchableOpacity
                      key={char.id}
                      style={[
                        styles.relationshipOption,
                        newRelationshipCharacterId === char.id && styles.relationshipOptionSelected
                      ]}
                      onPress={() => setNewRelationshipCharacterId(char.id)}
                    >
                      <Text style={[
                        styles.relationshipOptionText,
                        newRelationshipCharacterId === char.id && styles.relationshipOptionTextSelected
                      ]}>
                        {char.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <View style={styles.relationshipSelect}>
                  <Text style={styles.relationshipSelectLabel}>Type:</Text>
                  {relationshipTypes.map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.relationshipOption,
                        newRelationshipType === type && styles.relationshipOptionSelected
                      ]}
                      onPress={() => setNewRelationshipType(type)}
                    >
                      <Text style={[
                        styles.relationshipOptionText,
                        newRelationshipType === type && styles.relationshipOptionTextSelected
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <TextInput
                style={[styles.input, { marginTop: theme.spacing.sm }]}
                value={newRelationshipDescription}
                onChangeText={setNewRelationshipDescription}
                placeholder="Relationship description (optional)"
                placeholderTextColor={theme.colors.textTertiary}
              />
              
              <TouchableOpacity 
                style={styles.addRelationshipButton} 
                onPress={addRelationship}
                disabled={!newRelationshipCharacterId || !newRelationshipType}
              >
                <Plus size={16} color={theme.colors.background} />
                <Text style={styles.addRelationshipButtonText}>Add Relationship</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.relationshipsList}>
            {relationships.map((relationship, index) => (
              <View key={index} style={styles.relationshipItem}>
                <View style={styles.relationshipInfo}>
                  <Text style={styles.relationshipName}>{relationship.characterName}</Text>
                  <Text style={styles.relationshipType}>{relationship.type}</Text>
                  {relationship.description && (
                    <Text style={styles.relationshipDescription}>{relationship.description}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.removeRelationshipButton}
                  onPress={() => removeRelationship(index)}
                >
                  <Trash2 size={16} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
        
        {existingCharacter && (
          <TouchableOpacity
            style={styles.expandButton}
            onPress={handleExpand}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator color={theme.colors.background} />
            ) : (
              <>
                <Sparkles size={20} color={theme.colors.background} />
                <Text style={styles.expandButtonText}>Expand with AI</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  traitInput: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  traitList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  traitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs,
  },
  traitText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
  },
  expandButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  expandButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.background,
  },
  relationshipForm: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  relationshipInputRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  relationshipSelect: {
    flex: 1,
  },
  relationshipSelectLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  relationshipOption: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  relationshipOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  relationshipOptionText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
  },
  relationshipOptionTextSelected: {
    color: theme.colors.background,
  },
  addRelationshipButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  addRelationshipButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.background,
  },
  relationshipsList: {
    gap: theme.spacing.sm,
  },
  relationshipItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  relationshipInfo: {
    flex: 1,
  },
  relationshipName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  relationshipType: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    marginTop: 2,
  },
  relationshipDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  removeRelationshipButton: {
    padding: theme.spacing.sm,
  },
});