import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Search, Filter, X } from 'lucide-react-native';
import { createTheme } from '@/constants/theme';
import { useSettings } from '@/hooks/settings-context';
import type { EntityType } from '@/types/world';

interface SearchFilters {
  entityTypes: EntityType[];
  genres: string[];
  tags: string[];
  dateRange: {
    start?: string;
    end?: string;
  };
}

interface AdvancedSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  placeholder?: string;
}

export default function AdvancedSearch({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  placeholder = 'Search...',
}: AdvancedSearchProps) {
  const { settings } = useSettings();
  const theme = createTheme(settings.theme);
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState<SearchFilters>(filters);

  const entityTypeOptions: { type: EntityType; label: string }[] = [
    { type: 'character', label: 'Characters' },
    { type: 'location', label: 'Locations' },
    { type: 'item', label: 'Items' },
    { type: 'faction', label: 'Factions' },
    { type: 'lore', label: 'Lore Notes' },
    { type: 'timeline', label: 'Timeline' },
  ];

  const genreOptions = [
    'fantasy',
    'sci-fi',
    'cyberpunk',
    'mythology',
    'custom',
  ];

  const toggleEntityType = (type: EntityType) => {
    const newTypes = tempFilters.entityTypes.includes(type)
      ? tempFilters.entityTypes.filter(t => t !== type)
      : [...tempFilters.entityTypes, type];
    
    setTempFilters({
      ...tempFilters,
      entityTypes: newTypes,
    });
  };

  const toggleGenre = (genre: string) => {
    const newGenres = tempFilters.genres.includes(genre)
      ? tempFilters.genres.filter(g => g !== genre)
      : [...tempFilters.genres, genre];
    
    setTempFilters({
      ...tempFilters,
      genres: newGenres,
    });
  };

  const applyFilters = () => {
    onFiltersChange(tempFilters);
    setShowFilters(false);
  };

  const resetFilters = () => {
    const emptyFilters: SearchFilters = {
      entityTypes: [],
      genres: [],
      tags: [],
      dateRange: {},
    };
    setTempFilters(emptyFilters);
    onFiltersChange(emptyFilters);
    setShowFilters(false);
  };

  const hasActiveFilters = 
    filters.entityTypes.length > 0 ||
    filters.genres.length > 0 ||
    filters.tags.length > 0 ||
    filters.dateRange.start ||
    filters.dateRange.end;

  const styles = StyleSheet.create({
    container: {
      marginBottom: theme.spacing.md,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginHorizontal: theme.spacing.md,
    },
    searchInput: {
      flex: 1,
      marginLeft: theme.spacing.sm,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
    },
    filterButton: {
      padding: theme.spacing.xs,
    },
    filterButtonActive: {
      backgroundColor: theme.colors.primary + '20',
      borderRadius: theme.borderRadius.sm,
    },
    activeFilters: {
      marginTop: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    activeFilterChip: {
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
      marginRight: theme.spacing.sm,
    },
    activeFilterText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.primary,
      fontWeight: theme.fontWeight.medium,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
    },
    filterContent: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    filterSection: {
      marginBottom: theme.spacing.lg,
    },
    filterSectionTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    filterOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    filterOption: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    filterOptionActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    filterOptionText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
    },
    filterOptionTextActive: {
      color: theme.colors.background,
    },
    modalActions: {
      flexDirection: 'row',
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    resetButton: {
      flex: 1,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },
    resetButtonText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
    },
    applyButton: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
    },
    applyButtonText: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.background,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color={theme.colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textTertiary}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        <TouchableOpacity
          style={[
            styles.filterButton,
            hasActiveFilters && styles.filterButtonActive
          ]}
          onPress={() => setShowFilters(true)}
        >
          <Filter size={20} color={hasActiveFilters ? theme.colors.primary : theme.colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeFilters}>
          {filters.entityTypes.map(type => (
            <View key={type} style={styles.activeFilterChip}>
              <Text style={styles.activeFilterText}>
                {entityTypeOptions.find(opt => opt.type === type)?.label}
              </Text>
            </View>
          ))}
          {filters.genres.map(genre => (
            <View key={genre} style={styles.activeFilterChip}>
              <Text style={styles.activeFilterText}>{genre}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Search Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterContent} showsVerticalScrollIndicator={false}>
              {/* Entity Types */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Content Types</Text>
                <View style={styles.filterOptions}>
                  {entityTypeOptions.map(option => (
                    <TouchableOpacity
                      key={option.type}
                      style={[
                        styles.filterOption,
                        tempFilters.entityTypes.includes(option.type) && styles.filterOptionActive
                      ]}
                      onPress={() => toggleEntityType(option.type)}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        tempFilters.entityTypes.includes(option.type) && styles.filterOptionTextActive
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Genres */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Genres</Text>
                <View style={styles.filterOptions}>
                  {genreOptions.map(genre => (
                    <TouchableOpacity
                      key={genre}
                      style={[
                        styles.filterOption,
                        tempFilters.genres.includes(genre) && styles.filterOptionActive
                      ]}
                      onPress={() => toggleGenre(genre)}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        tempFilters.genres.includes(genre) && styles.filterOptionTextActive
                      ]}>
                        {genre}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

