import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { MapPin, Plus, Search, Upload, Clock, Network } from 'lucide-react-native';
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

export default function WorldScreen() {
  const { currentWorld, locations, timelines, importData } = useWorld();
  const [searchQuery, setSearchQuery] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async (type: 'locations') => {
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

  const filteredLocations = locations.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalEvents = timelines.reduce((sum, timeline) => sum + timeline.events.length, 0);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'World',
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={20} color={theme.colors.textTertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search world elements..."
                placeholderTextColor={theme.colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <View style={styles.categoriesContainer}>
            <CategoryCard
              title="Locations"
              count={filteredLocations.length}
              icon={<MapPin size={24} color={theme.colors.primary} />}
              onPress={() => router.push('/locations')}
              onAdd={() => router.push('/location-edit')}
              onImport={() => handleImport('locations')}
            />

            <TouchableOpacity style={styles.categoryCard} onPress={() => router.push('/timeline')}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryIcon}>
                  <Clock size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryTitle}>Timeline</Text>
                  <Text style={styles.categoryCount}>{totalEvents} events</Text>
                </View>
              </View>
              
              <View style={styles.categoryActions}>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => router.push('/timeline')}
                >
                  <Plus size={16} color={theme.colors.primary} />
                  <Text style={styles.actionButtonText}>Add Event</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.categoryCard} onPress={() => router.push('/relationships')}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryIcon}>
                  <Network size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryTitle}>Relationships</Text>
                  <Text style={styles.categoryCount}>Visual connections</Text>
                </View>
              </View>
              
              <View style={styles.categoryActions}>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => router.push('/relationships')}
                >
                  <Text style={styles.actionButtonText}>View Web</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>

          {searchQuery && (
            <View style={styles.searchResults}>
              <Text style={styles.searchResultsTitle}>Search Results</Text>
              
              {filteredLocations.length > 0 && (
                <View style={styles.resultSection}>
                  <Text style={styles.resultSectionTitle}>Locations ({filteredLocations.length})</Text>
                  {filteredLocations.slice(0, 5).map(location => (
                    <TouchableOpacity
                      key={location.id}
                      style={styles.resultItem}
                      onPress={() => router.push(`/location-edit?id=${location.id}`)}
                    >
                      <Text style={styles.resultItemName}>{location.name}</Text>
                      <Text style={styles.resultItemDetail}>{location.type}</Text>
                    </TouchableOpacity>
                  ))}
                  {filteredLocations.length > 5 && (
                    <TouchableOpacity
                      style={styles.viewAllButton}
                      onPress={() => router.push('/locations')}
                    >
                      <Text style={styles.viewAllText}>View all {filteredLocations.length} locations</Text>
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
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
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