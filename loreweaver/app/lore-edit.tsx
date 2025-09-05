import React, { useState } from 'react';
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
import { Save, Sparkles, X, Plus } from 'lucide-react-native';
import { useWorld } from '@/hooks/world-context';
import { useAI } from '@/hooks/ai-context';
import { theme } from '@/constants/theme';

export default function LoreEditScreen() {
  const { id } = useLocalSearchParams();
  const { currentWorld, loreNotes, createLoreNote, updateLoreNote } = useWorld();
  const { isGenerating, generateLoreNote } = useAI();
  
  const existingNote = id !== 'new' ? loreNotes.find(n => n.id === id) : null;
  
  const [title, setTitle] = useState(existingNote?.title || '');
  const [content, setContent] = useState(existingNote?.content || '');
  const [category, setCategory] = useState(existingNote?.category || '');
  const [tags, setTags] = useState<string[]>(existingNote?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Lore title is required');
      return;
    }
    
    if (!currentWorld) {
      Alert.alert('Error', 'No world selected');
      return;
    }
    
    setIsSaving(true);
    try {
      const noteData = {
        worldId: currentWorld.id,
        title,
        content,
        category,
        tags,
        linkedEntities: existingNote?.linkedEntities || [],
      };
      
      if (existingNote) {
        await updateLoreNote(existingNote.id, noteData);
      } else {
        await createLoreNote(noteData);
      }
      
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save lore note');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleGenerate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title first to guide the generation');
      return;
    }
    
    try {
      const generated = await generateLoreNote(title);
      if (generated.content) setContent(generated.content);
      if (generated.category) setCategory(generated.category);
      if (generated.tags) setTags([...tags, ...generated.tags.filter(tag => !tags.includes(tag))]);
      Alert.alert('Success', 'Lore content generated with AI');
    } catch {
      Alert.alert('Error', 'Failed to generate lore content');
    }
  };
  
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };
  
  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {existingNote ? 'Edit Lore Note' : 'New Lore Note'}
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
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Lore note title"
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="e.g., History, Mythology, Culture, Religion"
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>
        
        <View style={styles.section}>
          <View style={styles.contentHeader}>
            <Text style={styles.label}>Content</Text>
            {!existingNote && (
              <TouchableOpacity
                style={styles.generateButton}
                onPress={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <ActivityIndicator size="small" color={theme.colors.success} />
                ) : (
                  <>
                    <Sparkles size={16} color={theme.colors.success} />
                    <Text style={styles.generateButtonText}>Generate</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={content}
            onChangeText={setContent}
            placeholder="Write your lore content here..."
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            numberOfLines={8}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Tags</Text>
          <View style={styles.tagInput}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={newTag}
              onChangeText={setNewTag}
              placeholder="Add a tag"
              placeholderTextColor={theme.colors.textTertiary}
              onSubmitEditing={addTag}
            />
            <TouchableOpacity style={styles.addButton} onPress={addTag}>
              <Plus size={20} color={theme.colors.background} />
            </TouchableOpacity>
          </View>
          <View style={styles.tagList}>
            {tags.map((tag, index) => (
              <TouchableOpacity
                key={index}
                style={styles.tagBadge}
                onPress={() => removeTag(index)}
              >
                <Text style={styles.tagText}>{tag}</Text>
                <X size={14} color={theme.colors.success} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {existingNote && (
          <TouchableOpacity
            style={styles.expandButton}
            onPress={handleGenerate}
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
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success + '20',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs,
  },
  generateButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.success,
    fontWeight: theme.fontWeight.medium,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  tagInput: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  addButton: {
    backgroundColor: theme.colors.success,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success + '20',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs,
  },
  tagText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.success,
  },
  expandButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.success,
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
});