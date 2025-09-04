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
import { Plus, Sparkles, User, Search } from 'lucide-react-native';
import { useWorld } from '@/hooks/world-context';
import { useAI } from '@/hooks/ai-context';
import { theme } from '@/constants/theme';

export default function CharactersScreen() {
  const { currentWorld, characters, createCharacter } = useWorld();
  const { isGenerating, generateName } = useAI();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const filteredCharacters = characters.filter(char => 
    char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    char.role.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleQuickCreate = async () => {
    if (!currentWorld) {
      Alert.alert('Error', 'Please select a world first');
      return;
    }
    
    setIsCreating(true);
    try {
      const name = await generateName('character');
      await createCharacter({
        worldId: currentWorld.id,
        name,
        role: 'Adventurer',
        traits: ['Brave', 'Curious'],
        appearance: '',
        backstory: '',
        relationships: [],
        factionIds: [],
        locationIds: [],
        notes: '',
      });
      Alert.alert('Success', `Created character: ${name}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create character');
    } finally {
      setIsCreating(false);
    }
  };
  
  if (!currentWorld) {
    return (
      <View style={styles.emptyContainer}>
        <User size={64} color={theme.colors.textTertiary} />
        <Text style={styles.emptyTitle}>No World Selected</Text>
        <Text style={styles.emptyDescription}>
          Select a world from the dashboard to manage characters
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
          placeholder="Search characters..."
          placeholderTextColor={theme.colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredCharacters.length > 0 ? (
          <View style={styles.characterGrid}>
            {filteredCharacters.map((character) => (
              <TouchableOpacity
                key={character.id}
                style={styles.characterCard}
                onPress={() => router.push({
                  pathname: '/character-edit',
                  params: { id: character.id }
                })}
              >
                <View style={styles.characterAvatar}>
                  <User size={32} color={theme.colors.primary} />
                </View>
                <Text style={styles.characterName} numberOfLines={1}>
                  {character.name}
                </Text>
                <Text style={styles.characterRole} numberOfLines={1}>
                  {character.role}
                </Text>
                <View style={styles.characterTraits}>
                  {character.traits.slice(0, 2).map((trait, index) => (
                    <View key={index} style={styles.traitBadge}>
                      <Text style={styles.traitText}>{trait}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <User size={48} color={theme.colors.textTertiary} />
            <Text style={styles.emptyStateTitle}>No Characters Yet</Text>
            <Text style={styles.emptyStateDescription}>
              Create your first character to bring your world to life
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
            pathname: '/character-edit',
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
  characterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  characterCard: {
    width: '47%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  characterAvatar: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  characterName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  characterRole: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  characterTraits: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  traitBadge: {
    backgroundColor: theme.colors.primary + '30',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  traitText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
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
    backgroundColor: theme.colors.secondary,
    marginBottom: theme.spacing.md,
  },
});