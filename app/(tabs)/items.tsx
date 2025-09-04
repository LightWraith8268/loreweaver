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
import { Plus, Sparkles, Package, Search } from 'lucide-react-native';
import { useWorld } from '@/hooks/world-context';
import { useAI } from '@/hooks/ai-context';
import { theme } from '@/constants/theme';

export default function ItemsScreen() {
  const { currentWorld, items, createItem } = useWorld();
  const { isGenerating, generateName } = useAI();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleQuickCreate = async () => {
    if (!currentWorld) {
      Alert.alert('Error', 'Please select a world first');
      return;
    }
    
    setIsCreating(true);
    try {
      const name = await generateName('item');
      await createItem({
        worldId: currentWorld.id,
        name,
        type: 'Artifact',
        description: '',
        powers: '',
        history: '',
        notes: '',
      });
      Alert.alert('Success', `Created item: ${name}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create item');
    } finally {
      setIsCreating(false);
    }
  };
  
  if (!currentWorld) {
    return (
      <View style={styles.emptyContainer}>
        <Package size={64} color={theme.colors.textTertiary} />
        <Text style={styles.emptyTitle}>No World Selected</Text>
        <Text style={styles.emptyDescription}>
          Select a world from the dashboard to manage items
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
          placeholder="Search items..."
          placeholderTextColor={theme.colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredItems.length > 0 ? (
          <View style={styles.itemGrid}>
            {filteredItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.itemCard}
                onPress={() => router.push({
                  pathname: '/item-edit',
                  params: { id: item.id }
                })}
              >
                <View style={styles.itemIcon}>
                  <Package size={32} color={theme.colors.accent} />
                </View>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.itemType}>{item.type}</Text>
                {item.powers && (
                  <View style={styles.powerIndicator}>
                    <Sparkles size={12} color={theme.colors.warning} />
                    <Text style={styles.powerText}>Enchanted</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Package size={48} color={theme.colors.textTertiary} />
            <Text style={styles.emptyStateTitle}>No Items Yet</Text>
            <Text style={styles.emptyStateDescription}>
              Create legendary artifacts and treasures for your world
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
            pathname: '/item-edit',
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
  itemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  itemCard: {
    width: '47%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  itemIcon: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  itemName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  itemType: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  powerIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  powerText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.warning,
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
    backgroundColor: theme.colors.accent,
    marginBottom: theme.spacing.md,
  },
});