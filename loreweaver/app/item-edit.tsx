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
import { Save, Sparkles, X } from 'lucide-react-native';
import { useWorld } from '@/hooks/world-context';
import { useAI } from '@/hooks/ai-context';
import { theme } from '@/constants/theme';

export default function ItemEditScreen() {
  const { id } = useLocalSearchParams();
  const { currentWorld, items, createItem, updateItem } = useWorld();
  const { isGenerating, expandItem } = useAI();
  
  const existingItem = id !== 'new' ? items.find(i => i.id === id) : null;
  
  const [name, setName] = useState(existingItem?.name || '');
  const [type, setType] = useState(existingItem?.type || '');
  const [description, setDescription] = useState(existingItem?.description || '');
  const [powers, setPowers] = useState(existingItem?.powers || '');
  const [history, setHistory] = useState(existingItem?.history || '');
  const [currentOwner, setCurrentOwner] = useState(existingItem?.currentOwner || '');
  const [notes, setNotes] = useState(existingItem?.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Item name is required');
      return;
    }
    
    if (!currentWorld) {
      Alert.alert('Error', 'No world selected');
      return;
    }
    
    setIsSaving(true);
    try {
      const itemData = {
        worldId: currentWorld.id,
        name,
        type,
        description,
        powers,
        history,
        currentOwner,
        notes,
      };
      
      if (existingItem) {
        await updateItem(existingItem.id, itemData);
      } else {
        await createItem(itemData);
      }
      
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save item');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleExpand = async () => {
    if (!existingItem) {
      Alert.alert('Error', 'Save the item first before expanding');
      return;
    }
    
    try {
      const expanded = await expandItem(existingItem);
      if (expanded.description) setDescription(expanded.description);
      if (expanded.powers) setPowers(expanded.powers);
      if (expanded.history) setHistory(expanded.history);
      if (expanded.notes) setNotes(expanded.notes);
      Alert.alert('Success', 'Item expanded with AI');
    } catch {
      Alert.alert('Error', 'Failed to expand item');
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {existingItem ? 'Edit Item' : 'New Item'}
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
            placeholder="Item name"
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Type</Text>
          <TextInput
            style={styles.input}
            value={type}
            onChangeText={setType}
            placeholder="e.g., Weapon, Armor, Artifact, Tool"
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Physical appearance and basic properties"
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            numberOfLines={3}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Powers & Abilities</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={powers}
            onChangeText={setPowers}
            placeholder="Magical or special properties"
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            numberOfLines={3}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>History</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={history}
            onChangeText={setHistory}
            placeholder="Origin story and past owners"
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            numberOfLines={4}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Current Owner</Text>
          <TextInput
            style={styles.input}
            value={currentOwner}
            onChangeText={setCurrentOwner}
            placeholder="Who currently possesses this item?"
            placeholderTextColor={theme.colors.textTertiary}
          />
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
        
        {existingItem && (
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
  expandButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.accent,
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