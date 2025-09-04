import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { Plus, Sparkles, Wand2, BookOpen, Users } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useWorld } from '@/hooks/world-context';
import { useAI } from '@/hooks/ai-context';
import type { MagicSystem } from '@/types/world';

export default function MagicSystemsScreen() {
  const { currentWorld, magicSystems, deleteMagicSystem } = useWorld();
  const { generateContent } = useAI();
  const [expandingId, setExpandingId] = useState<string | null>(null);

  if (!currentWorld) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Magic Systems' }} />
        <View style={styles.emptyState}>
          <Sparkles size={64} color={theme.colors.textTertiary} />
          <Text style={styles.emptyTitle}>No World Selected</Text>
          <Text style={styles.emptyText}>Select a world to manage magic systems</Text>
        </View>
      </View>
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
          <Text style={styles.emptyText}>Create your first magic system to get started</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/magic-edit')}
          >
            <Plus size={20} color={theme.colors.background} />
            <Text style={styles.createButtonText}>Create Magic System</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {magicSystems.map(renderMagicSystem)}
          </View>
        </ScrollView>
      )}
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
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
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
});