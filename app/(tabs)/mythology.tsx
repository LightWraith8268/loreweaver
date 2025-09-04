import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { Plus, Crown, Users, BookOpen, Star } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useWorld } from '@/hooks/world-context';
import { useAI } from '@/hooks/ai-context';
import type { Mythology } from '@/types/world';

export default function MythologyScreen() {
  const { currentWorld, mythologies, deleteMythology } = useWorld();
  const { generateContent } = useAI();
  const [expandingId, setExpandingId] = useState<string | null>(null);

  if (!currentWorld) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Mythology' }} />
        <View style={styles.emptyState}>
          <Crown size={64} color={theme.colors.textTertiary} />
          <Text style={styles.emptyTitle}>No World Selected</Text>
          <Text style={styles.emptyText}>Select a world to manage mythologies</Text>
        </View>
      </View>
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
          <Text style={styles.emptyText}>Create your first mythology to get started</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/mythology-edit')}
          >
            <Plus size={20} color={theme.colors.background} />
            <Text style={styles.createButtonText}>Create Mythology</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {mythologies.map(renderMythology)}
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