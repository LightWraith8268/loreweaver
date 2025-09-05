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


export default function LocationEditScreen() {
  const { id } = useLocalSearchParams();
  const { currentWorld, locations, createLocation, updateLocation } = useWorld();
  const { isGenerating, expandLocation } = useAI();
  
  const existingLocation = id !== 'new' ? locations.find(l => l.id === id) : null;
  
  const [name, setName] = useState(existingLocation?.name || '');
  const [type, setType] = useState(existingLocation?.type || '');
  const [description, setDescription] = useState(existingLocation?.description || '');
  const [significance, setSignificance] = useState(existingLocation?.significance || '');
  const [inhabitants, setInhabitants] = useState<string[]>(existingLocation?.inhabitants || []);
  const [newInhabitant, setNewInhabitant] = useState('');
  const [notes, setNotes] = useState(existingLocation?.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Location name is required');
      return;
    }
    
    if (!currentWorld) {
      Alert.alert('Error', 'No world selected');
      return;
    }
    
    setIsSaving(true);
    try {
      const locationData = {
        worldId: currentWorld.id,
        name,
        type,
        description,
        significance,
        inhabitants,
        notes,
        connectedLocations: existingLocation?.connectedLocations || [],
        coordinates: existingLocation?.coordinates,
      };
      
      if (existingLocation) {
        await updateLocation(existingLocation.id, locationData);
      } else {
        await createLocation(locationData);
      }
      
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save location');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleExpand = async () => {
    if (!existingLocation) {
      Alert.alert('Error', 'Save the location first before expanding');
      return;
    }
    
    try {
      const expanded = await expandLocation(existingLocation);
      if (expanded.description) setDescription(expanded.description);
      if (expanded.significance) setSignificance(expanded.significance);
      if (expanded.inhabitants) setInhabitants(expanded.inhabitants);
      if (expanded.notes) setNotes(expanded.notes);
      Alert.alert('Success', 'Location expanded with AI');
    } catch (error) {
      Alert.alert('Error', 'Failed to expand location');
    }
  };
  
  const addInhabitant = () => {
    if (newInhabitant.trim()) {
      setInhabitants([...inhabitants, newInhabitant.trim()]);
      setNewInhabitant('');
    }
  };
  
  const removeInhabitant = (index: number) => {
    setInhabitants(inhabitants.filter((_, i) => i !== index));
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {existingLocation ? 'Edit Location' : 'New Location'}
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
            placeholder="Location name"
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Type</Text>
          <TextInput
            style={styles.input}
            value={type}
            onChangeText={setType}
            placeholder="e.g., City, Forest, Mountain, Dungeon"
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Physical description and atmosphere"
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            numberOfLines={4}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Significance</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={significance}
            onChangeText={setSignificance}
            placeholder="Historical or cultural importance"
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            numberOfLines={3}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Inhabitants</Text>
          <View style={styles.inhabitantInput}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={newInhabitant}
              onChangeText={setNewInhabitant}
              placeholder="Add an inhabitant"
              placeholderTextColor={theme.colors.textTertiary}
              onSubmitEditing={addInhabitant}
            />
            <TouchableOpacity style={styles.addButton} onPress={addInhabitant}>
              <Plus size={20} color={theme.colors.background} />
            </TouchableOpacity>
          </View>
          <View style={styles.inhabitantList}>
            {inhabitants.map((inhabitant, index) => (
              <TouchableOpacity
                key={index}
                style={styles.inhabitantBadge}
                onPress={() => removeInhabitant(index)}
              >
                <Text style={styles.inhabitantText}>{inhabitant}</Text>
                <X size={14} color={theme.colors.secondary} />
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
        
        {existingLocation && (
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
  inhabitantInput: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  addButton: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inhabitantList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  inhabitantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary + '20',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs,
  },
  inhabitantText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.secondary,
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
});