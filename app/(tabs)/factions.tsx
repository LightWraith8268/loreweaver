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
} from 'react-native';
import { router } from 'expo-router';
import { Plus, Sparkles, Shield, Search } from 'lucide-react-native';
import { useWorld } from '@/hooks/world-context';
import { useAI } from '@/hooks/ai-context';
import { theme } from '@/constants/theme';

export default function FactionsScreen() {
  const { currentWorld, factions, createFaction } = useWorld();
  const { isGenerating, generateName } = useAI();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const filteredFactions = factions.filter(faction => 
    faction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faction.type.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleQuickCreate = async () => {
    if (!currentWorld) {
      Alert.alert('Error', 'Please select a world first');
      return;
    }
    
    setIsCreating(true);
    try {
      const name = await generateName('faction');
      await createFaction({
        worldId: currentWorld.id,
        name,
        type: 'Guild',
        ideology: '',
        goals: [],
        leaders: [],
        memberIds: [],
        allies: [],
        enemies: [],
        notes: '',
      });
      Alert.alert('Success', `Created faction: ${name}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create faction');
    } finally {
      setIsCreating(false);
    }
  };
  
  if (!currentWorld) {
    return (
      <View style={styles.emptyContainer}>
        <Shield size={64} color={theme.colors.textTertiary} />
        <Text style={styles.emptyTitle}>No World Selected</Text>
        <Text style={styles.emptyDescription}>
          Select a world from the dashboard to manage factions
        </Text>
        <TouchableOpacity 
          style={styles.selectWorldButton}
          onPress={() => router.push('/')}
        >
          <Text style={styles.selectWorldButtonText}>Go to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color={theme.colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search factions..."
          placeholderTextColor={theme.colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredFactions.length > 0 ? (
          <View style={styles.factionList}>
            {filteredFactions.map((faction) => (
              <TouchableOpacity
                key={faction.id}
                style={styles.factionCard}
                onPress={() => router.push({
                  pathname: '/faction-edit',
                  params: { id: faction.id }
                })}
              >
                <View style={styles.factionHeader}>
                  <View style={styles.factionIcon}>
                    <Shield size={24} color={theme.colors.warning} />
                  </View>
                  <View style={styles.factionInfo}>
                    <Text style={styles.factionName}>{faction.name}</Text>
                    <Text style={styles.factionType}>{faction.type}</Text>
                  </View>
                </View>
                {faction.ideology && (
                  <Text style={styles.factionIdeology} numberOfLines={2}>
                    {faction.ideology}
                  </Text>
                )}
                <View style={styles.factionStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{faction.memberIds.length}</Text>
                    <Text style={styles.statLabel}>Members</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{faction.allies.length}</Text>
                    <Text style={styles.statLabel}>Allies</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{faction.enemies.length}</Text>
                    <Text style={styles.statLabel}>Enemies</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Shield size={48} color={theme.colors.textTertiary} />
            <Text style={styles.emptyStateTitle}>No Factions Yet</Text>
            <Text style={styles.emptyStateDescription}>
              Create organizations and groups that shape your world
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
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
            pathname: '/faction-edit',
            params: { id: 'new' }
          })}
        >
          <Plus size={28} color={theme.colors.background} />
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    margin: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  factionList: {
    gap: theme.spacing.md,
  },
  factionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  factionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  factionIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  factionInfo: {
    flex: 1,
  },
  factionName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  factionType: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.warning,
  },
  factionIdeology: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginVertical: theme.spacing.sm,
  },
  factionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
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
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  fab: {
    width: 56,
    height: 56,
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
    backgroundColor: theme.colors.warning,
    marginBottom: theme.spacing.md,
  },
});