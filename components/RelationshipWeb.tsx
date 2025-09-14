import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Users, ArrowRight } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import type { Character } from '@/types/world';

interface RelationshipWebProps {
  characters: Character[];
  onCharacterPress?: (character: Character) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function RelationshipWeb({ characters, onCharacterPress }: RelationshipWebProps) {
  const relationships = useMemo(() => {
    const connections: {
      from: Character;
      to: Character;
      type: string;
      description: string;
    }[] = [];
    
    characters.forEach(character => {
      character.relationships.forEach(rel => {
        const targetCharacter = characters.find(c => c.id === rel.characterId);
        if (targetCharacter) {
          connections.push({
            from: character,
            to: targetCharacter,
            type: rel.type,
            description: rel.description,
          });
        }
      });
    });
    
    return connections;
  }, [characters]);
  
  const getRelationshipColor = (type: string) => {
    const colors: Record<string, string> = {
      'friend': theme.colors.success,
      'enemy': theme.colors.error,
      'family': theme.colors.primary,
      'ally': theme.colors.secondary,
      'rival': theme.colors.warning,
      'mentor': theme.colors.accent,
      'student': theme.colors.accent,
    };
    return colors[type.toLowerCase()] || theme.colors.textSecondary;
  };
  
  if (characters.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Users size={48} color={theme.colors.textTertiary} />
        <Text style={styles.emptyText}>No characters to display</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Character Relationships</Text>
      
      {/* Character Grid */}
      <View style={styles.characterGrid}>
        {characters.map((character, index) => (
          <TouchableOpacity
            key={character.id}
            style={[
              styles.characterNode,
              {
                left: (index % 3) * (screenWidth / 3 - 20),
                top: Math.floor(index / 3) * 120,
              }
            ]}
            onPress={() => onCharacterPress?.(character)}
          >
            <View style={styles.characterAvatar}>
              <Users size={24} color={theme.colors.primary} />
            </View>
            <Text style={styles.characterName} numberOfLines={1}>
              {character.name}
            </Text>
            <Text style={styles.characterRole} numberOfLines={1}>
              {character.role}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Relationships List */}
      {relationships.length > 0 && (
        <View style={styles.relationshipsList}>
          <Text style={styles.sectionTitle}>Relationships</Text>
          {relationships.map((rel, index) => (
            <View key={index} style={styles.relationshipItem}>
              <View style={styles.relationshipFlow}>
                <Text style={styles.characterNameSmall}>{rel.from.name}</Text>
                <ArrowRight size={16} color={getRelationshipColor(rel.type)} />
                <Text style={styles.characterNameSmall}>{rel.to.name}</Text>
              </View>
              <View style={[
                styles.relationshipBadge,
                { backgroundColor: getRelationshipColor(rel.type) + '20' }
              ]}>
                <Text style={[
                  styles.relationshipType,
                  { color: getRelationshipColor(rel.type) }
                ]}>
                  {rel.type}
                </Text>
              </View>
              {rel.description && (
                <Text style={styles.relationshipDescription}>
                  {rel.description}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    padding: theme.spacing.md,
    textAlign: 'center',
  },
  characterGrid: {
    position: 'relative',
    height: Math.ceil(10 / 3) * 120, // Assuming max 10 characters
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  characterNode: {
    position: 'absolute',
    width: 80,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
  },
  characterAvatar: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  characterName: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    textAlign: 'center',
  },
  characterRole: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  relationshipsList: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  relationshipItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  relationshipFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  characterNameSmall: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  relationshipBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  relationshipType: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  relationshipDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.md,
  },
});