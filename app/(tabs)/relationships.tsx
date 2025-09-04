import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Users, Filter } from 'lucide-react-native';
import { useWorld } from '@/hooks/world-context';
import { theme } from '@/constants/theme';
import RelationshipWeb from '@/components/RelationshipWeb';
import AdvancedSearch from '@/components/AdvancedSearch';
import type { Character, EntityType } from '@/types/world';

interface SearchFilters {
  entityTypes: EntityType[];
  genres: string[];
  tags: string[];
  dateRange: {
    start?: string;
    end?: string;
  };
}

export default function RelationshipsScreen() {
  const { currentWorld, characters } = useWorld();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    entityTypes: [],
    genres: [],
    tags: [],
    dateRange: {},
  });

  const filteredCharacters = characters.filter(char => {
    const matchesSearch = char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         char.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Only show characters with relationships
    const hasRelationships = char.relationships.length > 0;
    
    return matchesSearch && hasRelationships;
  });

  const handleCharacterPress = (character: Character) => {
    router.push({
      pathname: '/character-edit',
      params: { id: character.id }
    });
  };

  if (!currentWorld) {
    return (
      <View style={styles.emptyContainer}>
        <Users size={64} color={theme.colors.textTertiary} />
        <Text style={styles.emptyTitle}>No World Selected</Text>
        <Text style={styles.emptyDescription}>
          Select a world from the dashboard to view relationships
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
      <AdvancedSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFiltersChange={setFilters}
        placeholder="Search characters with relationships..."
      />
      
      {filteredCharacters.length > 0 ? (
        <RelationshipWeb
          characters={filteredCharacters}
          onCharacterPress={handleCharacterPress}
        />
      ) : (
        <View style={styles.emptyState}>
          <Users size={48} color={theme.colors.textTertiary} />
          <Text style={styles.emptyStateTitle}>No Relationships Found</Text>
          <Text style={styles.emptyStateDescription}>
            {characters.length === 0 
              ? 'Create characters and add relationships between them to see the relationship web'
              : 'Add relationships to your characters to see them here'
            }
          </Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => router.push('/characters')}
          >
            <Text style={styles.createButtonText}>Manage Characters</Text>
          </TouchableOpacity>
        </View>
      )}
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
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
  createButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.lg,
  },
  createButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.background,
  },
});