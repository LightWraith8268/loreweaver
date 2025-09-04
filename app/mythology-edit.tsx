import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Save, Plus, X, Crown, Star } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useWorld } from '@/hooks/world-context';
import { useAI } from '@/hooks/ai-context';
import type { Mythology, Deity } from '@/types/world';

export default function MythologyEditScreen() {
  const { id, expandedContent } = useLocalSearchParams<{ id?: string; expandedContent?: string }>();
  const { currentWorld, mythologies, createMythology, updateMythology } = useWorld();
  const { generateContent } = useAI();
  
  const existingMythology = id ? mythologies.find(m => m.id === id) : null;
  const isEditing = !!existingMythology;

  const [formData, setFormData] = useState<{
    name: string;
    type: 'pantheon' | 'religion' | 'belief' | 'legend' | 'myth';
    origin: string;
    deities: Deity[];
    beliefs: string[];
    rituals: string[];
    followers: string[];
    holyTexts: string[];
    symbols: string[];
    history: string;
    notes: string;
  }>({
    name: '',
    type: 'belief',
    origin: '',
    deities: [],
    beliefs: [],
    rituals: [],
    followers: [],
    holyTexts: [],
    symbols: [],
    history: '',
    notes: '',
  });

  const [newBelief, setNewBelief] = useState('');
  const [newRitual, setNewRitual] = useState('');
  const [newFollower, setNewFollower] = useState('');
  const [newHolyText, setNewHolyText] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Deity form
  const [showDeityForm, setShowDeityForm] = useState(false);
  const [deityForm, setDeityForm] = useState({
    name: '',
    domain: [] as string[],
    description: '',
    symbols: [] as string[],
    relationships: [] as string[],
  });
  const [newDomain, setNewDomain] = useState('');
  const [newDeitySymbol, setNewDeitySymbol] = useState('');
  const [newRelationship, setNewRelationship] = useState('');

  useEffect(() => {
    if (existingMythology) {
      setFormData({
        name: existingMythology.name,
        type: existingMythology.type,
        origin: existingMythology.origin,
        deities: existingMythology.deities,
        beliefs: existingMythology.beliefs,
        rituals: existingMythology.rituals,
        followers: existingMythology.followers,
        holyTexts: existingMythology.holyTexts,
        symbols: existingMythology.symbols,
        history: existingMythology.history,
        notes: existingMythology.notes,
      });
    }
  }, [existingMythology]);

  useEffect(() => {
    if (expandedContent) {
      setFormData(prev => ({
        ...prev,
        notes: prev.notes + '\n\n' + expandedContent,
      }));
    }
  }, [expandedContent]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a name for the mythology');
      return;
    }

    if (!currentWorld) {
      Alert.alert('Error', 'No world selected');
      return;
    }

    try {
      const mythologyData = {
        ...formData,
        worldId: currentWorld.id,
      };

      if (isEditing && existingMythology) {
        await updateMythology(existingMythology.id, mythologyData);
      } else {
        await createMythology(mythologyData);
      }
      router.back();
    } catch (error) {
      console.error('Failed to save mythology:', error);
      Alert.alert('Error', 'Failed to save mythology');
    }
  };

  const handleGenerate = async () => {
    if (!currentWorld || !formData.name.trim()) {
      Alert.alert('Error', 'Please enter a name first');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Generate a detailed mythology called "${formData.name}" of type "${formData.type}" for a ${currentWorld.genre} world. Include origin, deities, beliefs, rituals, followers, and cultural significance.`;
      const generated = await generateContent(prompt, currentWorld);
      
      setFormData(prev => ({
        ...prev,
        notes: prev.notes + '\n\n' + generated,
      }));
    } catch (error) {
      console.error('Failed to generate content:', error);
      Alert.alert('Error', 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const addToArray = (field: keyof typeof formData, value: string, setter: (value: string) => void) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()],
      }));
      setter('');
    }
  };

  const removeFromArray = (field: keyof typeof formData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  };

  const addDeity = () => {
    if (deityForm.name.trim()) {
      const newDeity: Deity = {
        id: Date.now().toString(),
        name: deityForm.name.trim(),
        domain: deityForm.domain,
        description: deityForm.description,
        symbols: deityForm.symbols,
        relationships: deityForm.relationships,
      };
      
      setFormData(prev => ({
        ...prev,
        deities: [...prev.deities, newDeity],
      }));
      
      setDeityForm({
        name: '',
        domain: [],
        description: '',
        symbols: [],
        relationships: [],
      });
      setShowDeityForm(false);
    }
  };

  const removeDeity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      deities: prev.deities.filter((_, i) => i !== index),
    }));
  };

  const addToDeityArray = (field: keyof typeof deityForm, value: string, setter: (value: string) => void) => {
    if (value.trim()) {
      setDeityForm(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()],
      }));
      setter('');
    }
  };

  const removeFromDeityArray = (field: keyof typeof deityForm, index: number) => {
    setDeityForm(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  };

  const renderArrayInput = (
    title: string,
    field: keyof typeof formData,
    value: string,
    setValue: (value: string) => void,
    placeholder: string
  ) => (
    <View style={styles.section}>
      <Text style={styles.label}>{title}</Text>
      <View style={styles.arrayInput}>
        <TextInput
          style={styles.arrayTextInput}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textTertiary}
        />
        <TouchableOpacity
          onPress={() => addToArray(field, value, setValue)}
          style={styles.addButton}
        >
          <Plus size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.tagContainer}>
        {(formData[field] as string[]).map((item, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{item}</Text>
            <TouchableOpacity
              onPress={() => removeFromArray(field, index)}
              style={styles.removeTag}
            >
              <X size={14} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: isEditing ? 'Edit Mythology' : 'New Mythology',
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Save size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Enter mythology name"
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.typeContainer}>
              {(['pantheon', 'religion', 'belief', 'legend', 'myth'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    formData.type === type && styles.typeButtonActive,
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, type: type as 'pantheon' | 'religion' | 'belief' | 'legend' | 'myth' }))}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      formData.type === type && styles.typeButtonTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Origin</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.origin}
              onChangeText={(text) => setFormData(prev => ({ ...prev, origin: text }))}
              placeholder="Describe the origin and creation of this mythology"
              placeholderTextColor={theme.colors.textTertiary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Deities</Text>
              <TouchableOpacity
                onPress={() => setShowDeityForm(true)}
                style={styles.addButton}
              >
                <Plus size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            
            {formData.deities.map((deity, index) => (
              <View key={deity.id} style={styles.deityCard}>
                <View style={styles.deityHeader}>
                  <View style={styles.deityTitle}>
                    <Crown size={16} color={theme.colors.primary} />
                    <Text style={styles.deityName}>{deity.name}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeDeity(index)}
                    style={styles.removeButton}
                  >
                    <X size={16} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.deityDescription}>{deity.description}</Text>
                {deity.domain.length > 0 && (
                  <View style={styles.tagContainer}>
                    {deity.domain.map((domain, i) => (
                      <View key={i} style={styles.domainTag}>
                        <Text style={styles.domainTagText}>{domain}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}

            {showDeityForm && (
              <View style={styles.deityForm}>
                <Text style={styles.formTitle}>Add Deity</Text>
                
                <TextInput
                  style={styles.input}
                  value={deityForm.name}
                  onChangeText={(text) => setDeityForm(prev => ({ ...prev, name: text }))}
                  placeholder="Deity name"
                  placeholderTextColor={theme.colors.textTertiary}
                />

                <View style={styles.arrayInput}>
                  <TextInput
                    style={styles.arrayTextInput}
                    value={newDomain}
                    onChangeText={setNewDomain}
                    placeholder="Add domain (e.g., War, Love, Nature)"
                    placeholderTextColor={theme.colors.textTertiary}
                  />
                  <TouchableOpacity
                    onPress={() => addToDeityArray('domain', newDomain, setNewDomain)}
                    style={styles.addButton}
                  >
                    <Plus size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
                <View style={styles.tagContainer}>
                  {deityForm.domain.map((domain, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{domain}</Text>
                      <TouchableOpacity
                        onPress={() => removeFromDeityArray('domain', index)}
                        style={styles.removeTag}
                      >
                        <X size={14} color={theme.colors.primary} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={deityForm.description}
                  onChangeText={(text) => setDeityForm(prev => ({ ...prev, description: text }))}
                  placeholder="Deity description"
                  placeholderTextColor={theme.colors.textTertiary}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                <View style={styles.formActions}>
                  <TouchableOpacity
                    onPress={() => setShowDeityForm(false)}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={addDeity}
                    style={styles.addDeityButton}
                  >
                    <Text style={styles.addDeityButtonText}>Add Deity</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {renderArrayInput('Core Beliefs', 'beliefs', newBelief, setNewBelief, 'Add a belief')}
          {renderArrayInput('Rituals', 'rituals', newRitual, setNewRitual, 'Add a ritual')}
          {renderArrayInput('Followers', 'followers', newFollower, setNewFollower, 'Add a follower group')}
          {renderArrayInput('Holy Texts', 'holyTexts', newHolyText, setNewHolyText, 'Add a holy text')}
          {renderArrayInput('Symbols', 'symbols', newSymbol, setNewSymbol, 'Add a symbol')}

          <View style={styles.section}>
            <Text style={styles.label}>History</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.history}
              onChangeText={(text) => setFormData(prev => ({ ...prev, history: text }))}
              placeholder="Describe the historical development and significance"
              placeholderTextColor={theme.colors.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.section}>
            <View style={styles.notesHeader}>
              <Text style={styles.label}>Notes</Text>
              <TouchableOpacity
                onPress={handleGenerate}
                disabled={isGenerating}
                style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
              >
                <Star size={16} color={isGenerating ? theme.colors.textTertiary : theme.colors.primary} />
                <Text style={[styles.generateButtonText, isGenerating && styles.generateButtonTextDisabled]}>
                  {isGenerating ? 'Generating...' : 'AI Expand'}
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
              placeholder="Additional notes and details"
              placeholderTextColor={theme.colors.textTertiary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  textArea: {
    minHeight: 100,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  typeButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  typeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  typeButtonTextActive: {
    color: theme.colors.background,
  },
  arrayInput: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  arrayTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  addButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs,
  },
  tagText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  removeTag: {
    padding: 2,
  },
  deityCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  deityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deityTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  deityName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  deityDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  domainTag: {
    backgroundColor: '#9333ea20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  domainTagText: {
    fontSize: theme.fontSize.xs,
    color: '#9333ea',
    fontWeight: theme.fontWeight.medium,
  },
  removeButton: {
    padding: theme.spacing.xs,
  },
  deityForm: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  formTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  formActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  addDeityButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
  },
  addDeityButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.background,
    fontWeight: theme.fontWeight.medium,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  generateButtonTextDisabled: {
    color: theme.colors.textTertiary,
  },
  saveButton: {
    padding: theme.spacing.sm,
  },
});