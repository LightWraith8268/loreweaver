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
import { Plus, Sparkles, MapPin, Search, Wand2, Map, Globe } from 'lucide-react-native';
import { useWorld } from '@/hooks/world-context';
import { useAI } from '@/hooks/ai-context';
import { theme, responsive } from '@/constants/theme';
import { SelectWorldPrompt } from '@/components/SelectWorldPrompt';
import { TabLayout, TabItem } from '@/components/TabLayout';
import { StandardModal } from '@/components/StandardModal';

const { getResponsiveValue } = responsive;

export default function LocationsScreen() {
  const { currentWorld, locations, createLocation } = useWorld();
  const { isGenerating, generateName, generateContent } = useAI();
  const [activeTab, setActiveTab] = useState<string>('places');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedLocationType, setSelectedLocationType] = useState<string>('city');
  const [customPrompt, setCustomPrompt] = useState('');
  
  const tabs: TabItem[] = [
    { key: 'places', label: 'Places', icon: MapPin },
    { key: 'maps', label: 'Maps', icon: Map },
    { key: 'regions', label: 'Regions', icon: Globe },
  ];
  
  const locationTypes = [
    { id: 'city', label: 'City', description: 'Large urban settlement' },
    { id: 'town', label: 'Town', description: 'Medium-sized settlement' },
    { id: 'village', label: 'Village', description: 'Small rural community' },
    { id: 'dungeon', label: 'Dungeon', description: 'Underground complex or ruins' },
    { id: 'castle', label: 'Castle', description: 'Fortified stronghold' },
    { id: 'temple', label: 'Temple', description: 'Religious or sacred site' },
    { id: 'wilderness', label: 'Wilderness', description: 'Natural area or landmark' },
    { id: 'tavern', label: 'Tavern/Inn', description: 'Meeting place or lodging' },
    { id: 'market', label: 'Market', description: 'Trading hub or bazaar' },
    { id: 'academy', label: 'Academy', description: 'School or place of learning' },
    { id: 'mysterious', label: 'Mysterious Site', description: 'Strange or unexplained location' },
  ];
  
  const filteredLocations = locations.filter(loc => 
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleQuickCreate = async () => {
    if (!currentWorld) {
      Alert.alert('Error', 'Please select a world first');
      return;
    }
    
    setIsCreating(true);
    try {
      const name = await generateName('location');
      await createLocation({
        worldId: currentWorld.id,
        name,
        type: 'City',
        description: '',
        significance: '',
        inhabitants: [],
        connectedLocations: [],
        notes: '',
      });
      Alert.alert('Success', `Created location: ${name}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create location');
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleAIGenerate = async () => {
    if (!currentWorld) {
      Alert.alert('Error', 'Please select a world first');
      return;
    }
    
    setIsCreating(true);
    try {
      const selectedType = locationTypes.find(t => t.id === selectedLocationType);
      const typeDescription = selectedType?.description || 'location';
      
      const prompt = `Generate a detailed ${selectedLocationType} location for a ${currentWorld.genre} world.
      
World Context: ${currentWorld.name} - ${currentWorld.description}
      
Location Type: ${typeDescription}
      ${customPrompt ? `\nAdditional Requirements: ${customPrompt}` : ''}
      
Generate:
      1. Name (appropriate for the world's genre and location type)
      2. Detailed description of the location
      3. Historical significance or background
      4. Notable inhabitants or visitors
      5. Unique features or landmarks
      6. Atmosphere and mood
      
      Return as JSON with fields: name, type, description, significance, notes`;
      
      const generated = await generateContent(prompt);
      const locationData = JSON.parse(generated);
      
      await createLocation({
        worldId: currentWorld.id,
        name: locationData.name || 'Generated Location',
        type: locationData.type || selectedType?.label || 'Place',
        description: locationData.description || '',
        significance: locationData.significance || '',
        inhabitants: [],
        connectedLocations: [],
        notes: locationData.notes || '',
      });
      
      setShowAIModal(false);
      setCustomPrompt('');
      Alert.alert('Success', `Created location: ${locationData.name}`);
    } catch (error) {
      console.error('AI generation error:', error);
      Alert.alert('Error', 'Failed to generate location');
    } finally {
      setIsCreating(false);
    }
  };
  
  const renderPlacesTab = () => (
    <>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color={theme.colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search locations..."
          placeholderTextColor={theme.colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredLocations.length > 0 ? (
          <View style={styles.locationGrid}>
            {filteredLocations.map((location) => (
              <TouchableOpacity
                key={location.id}
                style={styles.locationCard}
                onPress={() => router.push({
                  pathname: '/location-edit',
                  params: { id: location.id }
                })}
              >
                <View style={styles.locationIcon}>
                  <MapPin size={32} color={theme.colors.primary} />
                </View>
                <Text style={styles.locationName} numberOfLines={1}>
                  {location.name}
                </Text>
                <Text style={styles.locationType} numberOfLines={1}>
                  {location.type}
                </Text>
                <Text style={styles.locationDescription} numberOfLines={2}>
                  {location.description || 'No description'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MapPin size={48} color={theme.colors.textTertiary} />
            <Text style={styles.emptyStateTitle}>No Locations Yet</Text>
            <Text style={styles.emptyStateDescription}>
              Create your first location to build your world
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.fab, styles.tertiaryFab]}
          onPress={handleQuickCreate}
          disabled={isCreating}
        >
          {isCreating ? (
            <ActivityIndicator color={theme.colors.surface} />
          ) : (
            <Sparkles size={getResponsiveValue({ phone: 24, tablet: 28 })} color={theme.colors.surface} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.fab, styles.secondaryFab]}
          onPress={() => setShowAIModal(true)}
          disabled={isCreating || isGenerating}
        >
          <Wand2 size={getResponsiveValue({ phone: 24, tablet: 28 })} color={theme.colors.surface} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => router.push({
            pathname: '/location-edit',
            params: { id: 'new' }
          })}
        >
          <Plus size={getResponsiveValue({ phone: 28, tablet: 32 })} color={theme.colors.background} />
        </TouchableOpacity>
      </View>
    </>
  );
  
  const renderMapsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.emptyState}>
        <Map size={48} color={theme.colors.textTertiary} />
        <Text style={styles.emptyStateTitle}>World Maps</Text>
        <Text style={styles.emptyStateDescription}>
          Create and manage maps of your world and regions
        </Text>
      </View>
    </View>
  );
  
  const renderRegionsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.emptyState}>
        <Globe size={48} color={theme.colors.textTertiary} />
        <Text style={styles.emptyStateTitle}>World Regions</Text>
        <Text style={styles.emptyStateDescription}>
          Organize locations into regions, countries, and continents
        </Text>
      </View>
    </View>
  );
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'places':
        return renderPlacesTab();
      case 'maps':
        return renderMapsTab();
      case 'regions':
        return renderRegionsTab();
      default:
        return renderPlacesTab();
    }
  };
  
  if (!currentWorld) {
    return (
      <SelectWorldPrompt
        title="Locations"
        description="Select a world to create and manage locations for your stories"
        customIcon={<MapPin size={64} color={theme.colors.textTertiary} />}
      />
    );
  }
  
  return (
    <TabLayout
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderTabContent()}
      
      {/* AI Generation Modal */}
      <StandardModal
        visible={showAIModal}
        onClose={() => setShowAIModal(false)}
        title="Generate Location"
        size="large"
      >
        <Text style={styles.sectionLabel}>Location Type</Text>
        <ScrollView style={styles.typeSelector} showsVerticalScrollIndicator={false}>
          {locationTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeOption,
                selectedLocationType === type.id && styles.selectedTypeOption
              ]}
              onPress={() => setSelectedLocationType(type.id)}
            >
              <Text style={[
                styles.typeLabel,
                selectedLocationType === type.id && styles.selectedTypeLabel
              ]}>
                {type.label}
              </Text>
              <Text style={styles.typeDescription}>{type.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <Text style={styles.sectionLabel}>Additional Requirements (Optional)</Text>
        <TextInput
          style={styles.promptInput}
          placeholder="e.g., ancient ruins, bustling marketplace, hidden from outsiders..."
          placeholderTextColor={theme.colors.textTertiary}
          value={customPrompt}
          onChangeText={setCustomPrompt}
          multiline
          numberOfLines={3}
        />
        
        <View style={styles.modalActions}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setShowAIModal(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.generateButton}
            onPress={handleAIGenerate}
            disabled={isCreating || isGenerating}
          >
            {isCreating || isGenerating ? (
              <ActivityIndicator color={theme.colors.background} />
            ) : (
              <>
                <Wand2 size={16} color={theme.colors.background} />
                <Text style={styles.generateButtonText}>Generate</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </StandardModal>
    </TabLayout>
  );
}

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: getResponsiveValue({ 
      phone: theme.spacing.md,
      tablet: theme.spacing.lg 
    }),
    paddingVertical: getResponsiveValue({ 
      phone: theme.spacing.sm,
      tablet: theme.spacing.md 
    }),
    margin: getResponsiveValue({ 
      phone: theme.spacing.md,
      tablet: theme.spacing.lg,
      largeTablet: theme.spacing.xl 
    }),
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    padding: getResponsiveValue({ 
      phone: theme.spacing.md,
      tablet: theme.spacing.lg,
      largeTablet: theme.spacing.xl 
    }),
  },
  locationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveValue({ 
      phone: theme.spacing.md,
      tablet: theme.spacing.lg,
      largeTablet: theme.spacing.xl 
    }),
  },
  locationCard: {
    width: getResponsiveValue({ 
      phone: '47%',
      tablet: '30%',
      largeTablet: '22%' 
    }),
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: getResponsiveValue({ 
      phone: theme.spacing.md,
      tablet: theme.spacing.lg,
      largeTablet: theme.spacing.xl 
    }),
    alignItems: 'center',
  },
  locationIcon: {
    width: getResponsiveValue({ 
      phone: 64,
      tablet: 80,
      largeTablet: 96 
    }),
    height: getResponsiveValue({ 
      phone: 64,
      tablet: 80,
      largeTablet: 96 
    }),
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getResponsiveValue({ 
      phone: theme.spacing.sm,
      tablet: theme.spacing.md 
    }),
  },
  locationName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  locationType: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  locationDescription: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: getResponsiveValue({ 
      phone: theme.spacing.xxl,
      tablet: theme.spacing.xxl * 1.5,
      largeTablet: theme.spacing.xxl * 2 
    }),
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
    bottom: getResponsiveValue({ 
      phone: theme.spacing.lg,
      tablet: theme.spacing.xl,
      largeTablet: theme.spacing.xxl 
    }),
    right: getResponsiveValue({ 
      phone: theme.spacing.lg,
      tablet: theme.spacing.xl,
      largeTablet: theme.spacing.xxl 
    }),
    gap: getResponsiveValue({ 
      phone: theme.spacing.md,
      tablet: theme.spacing.lg 
    }),
  },
  fab: {
    width: getResponsiveValue({ 
      phone: 56,
      tablet: 64,
      largeTablet: 72 
    }),
    height: getResponsiveValue({ 
      phone: 56,
      tablet: 64,
      largeTablet: 72 
    }),
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
  tertiaryFab: {
    backgroundColor: theme.colors.accent,
    marginBottom: theme.spacing.md,
  },
  sectionLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  typeSelector: {
    maxHeight: 200,
    marginBottom: theme.spacing.lg,
  },
  typeOption: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  selectedTypeOption: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  typeLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  selectedTypeLabel: {
    color: theme.colors.primary,
  },
  typeDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  promptInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  generateButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  generateButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.background,
  },
});