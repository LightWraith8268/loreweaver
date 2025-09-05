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

export default function FactionEditScreen() {
  const { id } = useLocalSearchParams();
  const { currentWorld, factions, createFaction, updateFaction } = useWorld();
  const { isGenerating, expandFaction } = useAI();
  
  const existingFaction = id !== 'new' ? factions.find(f => f.id === id) : null;
  
  const [name, setName] = useState(existingFaction?.name || '');
  const [type, setType] = useState(existingFaction?.type || '');
  const [ideology, setIdeology] = useState(existingFaction?.ideology || '');
  const [goals, setGoals] = useState<string[]>(existingFaction?.goals || []);
  const [newGoal, setNewGoal] = useState('');
  const [leaders, setLeaders] = useState<string[]>(existingFaction?.leaders || []);
  const [newLeader, setNewLeader] = useState('');
  const [allies, setAllies] = useState<string[]>(existingFaction?.allies || []);
  const [newAlly, setNewAlly] = useState('');
  const [enemies, setEnemies] = useState<string[]>(existingFaction?.enemies || []);
  const [newEnemy, setNewEnemy] = useState('');
  const [notes, setNotes] = useState(existingFaction?.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Faction name is required');
      return;
    }
    
    if (!currentWorld) {
      Alert.alert('Error', 'No world selected');
      return;
    }
    
    setIsSaving(true);
    try {
      const factionData = {
        worldId: currentWorld.id,
        name,
        type,
        ideology,
        goals,
        leaders,
        allies,
        enemies,
        notes,
        memberIds: existingFaction?.memberIds || [],
      };
      
      if (existingFaction) {
        await updateFaction(existingFaction.id, factionData);
      } else {
        await createFaction(factionData);
      }
      
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save faction');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleExpand = async () => {
    if (!existingFaction) {
      Alert.alert('Error', 'Save the faction first before expanding');
      return;
    }
    
    try {
      const expanded = await expandFaction(existingFaction);
      if (expanded.ideology) setIdeology(expanded.ideology);
      if (expanded.goals) setGoals(expanded.goals);
      if (expanded.notes) setNotes(expanded.notes);
      Alert.alert('Success', 'Faction expanded with AI');
    } catch {
      Alert.alert('Error', 'Failed to expand faction');
    }
  };
  
  const addGoal = () => {
    if (newGoal.trim()) {
      setGoals([...goals, newGoal.trim()]);
      setNewGoal('');
    }
  };
  
  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };
  
  const addLeader = () => {
    if (newLeader.trim()) {
      setLeaders([...leaders, newLeader.trim()]);
      setNewLeader('');
    }
  };
  
  const removeLeader = (index: number) => {
    setLeaders(leaders.filter((_, i) => i !== index));
  };
  
  const addAlly = () => {
    if (newAlly.trim()) {
      setAllies([...allies, newAlly.trim()]);
      setNewAlly('');
    }
  };
  
  const removeAlly = (index: number) => {
    setAllies(allies.filter((_, i) => i !== index));
  };
  
  const addEnemy = () => {
    if (newEnemy.trim()) {
      setEnemies([...enemies, newEnemy.trim()]);
      setNewEnemy('');
    }
  };
  
  const removeEnemy = (index: number) => {
    setEnemies(enemies.filter((_, i) => i !== index));
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {existingFaction ? 'Edit Faction' : 'New Faction'}
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
            placeholder="Faction name"
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Type</Text>
          <TextInput
            style={styles.input}
            value={type}
            onChangeText={setType}
            placeholder="e.g., Guild, Kingdom, Cult, Organization"
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Ideology</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={ideology}
            onChangeText={setIdeology}
            placeholder="Core beliefs and principles"
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            numberOfLines={3}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Goals</Text>
          <View style={styles.listInput}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={newGoal}
              onChangeText={setNewGoal}
              placeholder="Add a goal"
              placeholderTextColor={theme.colors.textTertiary}
              onSubmitEditing={addGoal}
            />
            <TouchableOpacity style={styles.addButton} onPress={addGoal}>
              <Plus size={20} color={theme.colors.background} />
            </TouchableOpacity>
          </View>
          <View style={styles.listItems}>
            {goals.map((goal, index) => (
              <TouchableOpacity
                key={index}
                style={styles.listBadge}
                onPress={() => removeGoal(index)}
              >
                <Text style={styles.listText}>{goal}</Text>
                <X size={14} color={theme.colors.warning} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Leaders</Text>
          <View style={styles.listInput}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={newLeader}
              onChangeText={setNewLeader}
              placeholder="Add a leader"
              placeholderTextColor={theme.colors.textTertiary}
              onSubmitEditing={addLeader}
            />
            <TouchableOpacity style={styles.addButton} onPress={addLeader}>
              <Plus size={20} color={theme.colors.background} />
            </TouchableOpacity>
          </View>
          <View style={styles.listItems}>
            {leaders.map((leader, index) => (
              <TouchableOpacity
                key={index}
                style={styles.listBadge}
                onPress={() => removeLeader(index)}
              >
                <Text style={styles.listText}>{leader}</Text>
                <X size={14} color={theme.colors.warning} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Allies</Text>
          <View style={styles.listInput}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={newAlly}
              onChangeText={setNewAlly}
              placeholder="Add an ally"
              placeholderTextColor={theme.colors.textTertiary}
              onSubmitEditing={addAlly}
            />
            <TouchableOpacity style={styles.addButton} onPress={addAlly}>
              <Plus size={20} color={theme.colors.background} />
            </TouchableOpacity>
          </View>
          <View style={styles.listItems}>
            {allies.map((ally, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.listBadge, { backgroundColor: theme.colors.success + '20' }]}
                onPress={() => removeAlly(index)}
              >
                <Text style={[styles.listText, { color: theme.colors.success }]}>{ally}</Text>
                <X size={14} color={theme.colors.success} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Enemies</Text>
          <View style={styles.listInput}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={newEnemy}
              onChangeText={setNewEnemy}
              placeholder="Add an enemy"
              placeholderTextColor={theme.colors.textTertiary}
              onSubmitEditing={addEnemy}
            />
            <TouchableOpacity style={styles.addButton} onPress={addEnemy}>
              <Plus size={20} color={theme.colors.background} />
            </TouchableOpacity>
          </View>
          <View style={styles.listItems}>
            {enemies.map((enemy, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.listBadge, { backgroundColor: theme.colors.error + '20' }]}
                onPress={() => removeEnemy(index)}
              >
                <Text style={[styles.listText, { color: theme.colors.error }]}>{enemy}</Text>
                <X size={14} color={theme.colors.error} />
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
        
        {existingFaction && (
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
  listInput: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  addButton: {
    backgroundColor: theme.colors.warning,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  listBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warning + '20',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs,
  },
  listText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.warning,
  },
  expandButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.warning,
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