import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Save, Plus, X, Sparkles } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useWorld } from '@/hooks/world-context';
import { useAI } from '@/hooks/ai-context';
import type { MagicSystem } from '@/types/world';

export default function MagicSystemEditScreen() {
  const { id, expandedContent } = useLocalSearchParams<{ id?: string; expandedContent?: string }>();
  const { currentWorld, magicSystems, createMagicSystem, updateMagicSystem } = useWorld();
  const { generateContent } = useAI();
  
  const existingMagicSystem = id ? magicSystems.find(m => m.id === id) : null;
  const isEditing = !!existingMagicSystem;

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    source: '',
    rules: [] as string[],
    limitations: [] as string[],
    practitioners: [] as string[],
    schools: [] as string[],
    artifacts: [] as string[],
    history: '',
    notes: '',
  });

  const [newRule, setNewRule] = useState('');
  const [newLimitation, setNewLimitation] = useState('');
  const [newPractitioner, setNewPractitioner] = useState('');
  const [newSchool, setNewSchool] = useState('');
  const [newArtifact, setNewArtifact] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (existingMagicSystem) {
      setFormData({
        name: existingMagicSystem.name,
        type: existingMagicSystem.type,
        source: existingMagicSystem.source,
        rules: existingMagicSystem.rules,
        limitations: existingMagicSystem.limitations,
        practitioners: existingMagicSystem.practitioners,
        schools: existingMagicSystem.schools || [],
        artifacts: existingMagicSystem.artifacts,
        history: existingMagicSystem.history,
        notes: existingMagicSystem.notes,
      });
    }
  }, [existingMagicSystem]);

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
      Alert.alert('Error', 'Please enter a name for the magic system');
      return;
    }

    if (!currentWorld) {
      Alert.alert('Error', 'No world selected');
      return;
    }

    try {
      const magicSystemData = {
        ...formData,
        worldId: currentWorld.id,
      };

      if (isEditing && existingMagicSystem) {
        await updateMagicSystem(existingMagicSystem.id, magicSystemData);
      } else {
        await createMagicSystem(magicSystemData);
      }
      router.back();
    } catch (error) {
      console.error('Failed to save magic system:', error);
      Alert.alert('Error', 'Failed to save magic system');
    }
  };

  const handleGenerate = async () => {
    if (!currentWorld || !formData.name.trim()) {
      Alert.alert('Error', 'Please enter a name first');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Generate a detailed magic system called "${formData.name}" for a ${currentWorld.genre} world. Include type, source, rules, limitations, practitioners, schools, artifacts, and history.`;
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
          title: isEditing ? 'Edit Magic System' : 'New Magic System',
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
              placeholder="Enter magic system name"
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.section, styles.flex]}>
              <Text style={styles.label}>Type</Text>
              <TextInput
                style={styles.input}
                value={formData.type}
                onChangeText={(text) => setFormData(prev => ({ ...prev, type: text }))}
                placeholder="e.g., Elemental, Divine, Arcane"
                placeholderTextColor={theme.colors.textTertiary}
              />
            </View>

            <View style={[styles.section, styles.flex]}>
              <Text style={styles.label}>Source</Text>
              <TextInput
                style={styles.input}
                value={formData.source}
                onChangeText={(text) => setFormData(prev => ({ ...prev, source: text }))}
                placeholder="e.g., Natural, Learned, Inherited"
                placeholderTextColor={theme.colors.textTertiary}
              />
            </View>
          </View>

          {renderArrayInput('Rules', 'rules', newRule, setNewRule, 'Add a rule')}
          {renderArrayInput('Limitations', 'limitations', newLimitation, setNewLimitation, 'Add a limitation')}
          {renderArrayInput('Practitioners', 'practitioners', newPractitioner, setNewPractitioner, 'Add a practitioner')}
          {renderArrayInput('Schools', 'schools', newSchool, setNewSchool, 'Add a school')}
          {renderArrayInput('Artifacts', 'artifacts', newArtifact, setNewArtifact, 'Add an artifact')}

          <View style={styles.section}>
            <Text style={styles.label}>History</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.history}
              onChangeText={(text) => setFormData(prev => ({ ...prev, history: text }))}
              placeholder="Describe the history and origins of this magic system"
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
                <Sparkles size={16} color={isGenerating ? theme.colors.textTertiary : theme.colors.primary} />
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
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  flex: {
    flex: 1,
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