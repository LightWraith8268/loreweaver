import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { Users, Package, Shield, Plus, Search, Upload, Download } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { useWorld } from '@/hooks/world-context';
import { parseDocxFile } from '@/utils/docx-parser';
import { parseJsonFile, createFileInput } from '@/utils/export';

interface CategoryCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  onPress: () => void;
  onAdd: () => void;
  onImport: () => void;
}

function CategoryCard({ title, count, icon, onPress, onAdd, onImport }: CategoryCardProps) {
  return (
    <TouchableOpacity style={styles.categoryCard} onPress={onPress}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryIcon}>
          {icon}
        </View>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryTitle}>{title}</Text>
          <Text style={styles.categoryCount}>{count} items</Text>
        </View>
      </View>
      
      <View style={styles.categoryActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onAdd}>
          <Plus size={16} color={theme.colors.primary} />
          <Text style={styles.actionButtonText}>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onImport}>
          <Upload size={16} color={theme.colors.primary} />
          <Text style={styles.actionButtonText}>Import</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function EntitiesScreen() {
  const { currentWorld, characters, items, factions, importData } = useWorld();
  const [searchQuery, setSearchQuery] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const insets = useSafeAreaInsets();

  const handleImport = async (type: 'characters' | 'items' | 'factions') => {
    if (!currentWorld) {
      Alert.alert('Error', 'Please select a world first');
      return;
    }

    if (Platform.OS !== 'web') {
      Alert.alert('Import', 'File import is only available on web');
      return;
    }

    setIsImporting(true);
    
    createFileInput('.docx,.json', async (file) => {
      try {
        let result;
        
        if (file.name.endsWith('.docx')) {
          result = await parseDocxFile(file);
        } else if (file.name.endsWith('.json')) {
          result = await parseJsonFile(file);
        } else {
          Alert.alert('Error', 'Unsupported file type. Please use .docx or .json files.');
          return;
        }

        if (!result.success) {
          Alert.alert('Import Error', result.error || 'Failed to parse file');
          return;
        }

        if (result.data) {
          // Filter data based on type
          const filteredData = {
            [type]: result.data[type] || [],
          };
          
          await importData(filteredData);
          
          const count = result.data[type]?.length || 0;
          Alert.alert(
            'Import Successful',
            `Successfully imported ${count} ${type}`,
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Import error:', error);
        Alert.alert('Error', 'Failed to import file');
      } finally {
        setIsImporting(false);
      }
    });
  };

  const filteredCharacters = characters.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFactions = factions.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Entities',
          headerRight: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => {
                // TODO: Add bulk import functionality
                Alert.alert('Bulk Import', 'Import multiple entity types from a single file');
              }}
            >
              <Download size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === 'ios' ? 84 + insets.bottom + theme.spacing.lg : 68 + theme.spacing.lg }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={20} color={theme.colors.textTertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search entities..."
                placeholderTextColor={theme.colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <View style={styles.categoriesContainer}>
            <CategoryCard
              title="Characters"
              count={filteredCharacters.length}
              icon={<Users size={24} color={theme.colors.primary} />}
              onPress={() => router.push('/characters')}
              onAdd={() => router.push('/character-edit')}
              onImport={() => handleImport('characters')}
            />

            <CategoryCard
              title="Items"
              count={filteredItems.length}
              icon={<Package size={24} color={theme.colors.primary} />}
              onPress={() => router.push('/items')}
              onAdd={() => router.push('/item-edit')}
              onImport={() => handleImport('items')}
            />

            <CategoryCard
              title="Factions"
              count={filteredFactions.length}
              icon={<Shield size={24} color={theme.colors.primary} />}
              onPress={() => router.push('/factions')}
              onAdd={() => router.push('/faction-edit')}
              onImport={() => handleImport('factions')}
            />
          </View>

          {searchQuery && (
            <View style={styles.searchResults}>
              <Text style={styles.searchResultsTitle}>Search Results</Text>
              
              {filteredCharacters.length > 0 && (
                <View style={styles.resultSection}>
                  <Text style={styles.resultSectionTitle}>Characters ({filteredCharacters.length})</Text>
                  {filteredCharacters.slice(0, 3).map(character => (
                    <TouchableOpacity
                      key={character.id}
                      style={styles.resultItem}
                      onPress={() => router.push(`/character-edit?id=${character.id}`)}
                    >
                      <Text style={styles.resultItemName}>{character.name}</Text>
                      <Text style={styles.resultItemDetail}>{character.role}</Text>
                    </TouchableOpacity>
                  ))}
                  {filteredCharacters.length > 3 && (
                    <TouchableOpacity
                      style={styles.viewAllButton}
                      onPress={() => router.push('/characters')}
                    >
                      <Text style={styles.viewAllText}>View all {filteredCharacters.length} characters</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {filteredItems.length > 0 && (
                <View style={styles.resultSection}>
                  <Text style={styles.resultSectionTitle}>Items ({filteredItems.length})</Text>
                  {filteredItems.slice(0, 3).map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.resultItem}
                      onPress={() => router.push(`/item-edit?id=${item.id}`)}
                    >
                      <Text style={styles.resultItemName}>{item.name}</Text>
                      <Text style={styles.resultItemDetail}>{item.type}</Text>
                    </TouchableOpacity>
                  ))}
                  {filteredItems.length > 3 && (
                    <TouchableOpacity
                      style={styles.viewAllButton}
                      onPress={() => router.push('/items')}
                    >
                      <Text style={styles.viewAllText}>View all {filteredItems.length} items</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {filteredFactions.length > 0 && (
                <View style={styles.resultSection}>
                  <Text style={styles.resultSectionTitle}>Factions ({filteredFactions.length})</Text>
                  {filteredFactions.slice(0, 3).map(faction => (
                    <TouchableOpacity
                      key={faction.id}
                      style={styles.resultItem}
                      onPress={() => router.push(`/faction-edit?id=${faction.id}`)}
                    >
                      <Text style={styles.resultItemName}>{faction.name}</Text>
                      <Text style={styles.resultItemDetail}>{faction.type}</Text>
                    </TouchableOpacity>
                  ))}
                  {filteredFactions.length > 3 && (
                    <TouchableOpacity
                      style={styles.viewAllButton}
                      onPress={() => router.push('/factions')}
                    >
                      <Text style={styles.viewAllText}>View all {filteredFactions.length} factions</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  headerButton: {
    padding: theme.spacing.sm,
  },
  searchContainer: {
    marginBottom: theme.spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  categoriesContainer: {
    gap: theme.spacing.md,
  },
  categoryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  categoryCount: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  searchResults: {
    gap: theme.spacing.lg,
  },
  searchResultsTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  resultSection: {
    gap: theme.spacing.sm,
  },
  resultSectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  resultItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  resultItemName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  resultItemDetail: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  viewAllButton: {
    padding: theme.spacing.sm,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
});