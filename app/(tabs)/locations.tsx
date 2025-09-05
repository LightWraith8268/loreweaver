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
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Plus, Sparkles, MapPin, Search, X, Wand2 } from 'lucide-react-native';
import { useWorld } from '@/hooks/world-context';
import { useAI } from '@/hooks/ai-context';
import { theme } from '@/constants/theme';
import { SelectWorldPrompt } from '@/components/SelectWorldPrompt';

export default function LocationsScreen() {
  const { currentWorld, locations, createLocation } = useWorld();
  const { isGenerating, generateName, generateContent } = useAI();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedLocationType, setSelectedLocationType] = useState<string>('city');
  const [customPrompt, setCustomPrompt] = useState('');
  
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
      
      Return as JSON with fields: name, description, significance, inhabitants (array), notes`;
      
      const generated = await generateContent(prompt);
      const locationData = JSON.parse(generated);
      
      await createLocation({
        worldId: currentWorld.id,
        name: locationData.name || 'Generated Location',
        type: selectedType?.label || 'City',
        description: locationData.description || '',
        significance: locationData.significance || '',
        inhabitants: locationData.inhabitants || [],
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
    <View style={styles.container}>
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
          <View style={styles.locationList}>
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
                  <MapPin size={24} color={theme.colors.secondary} />
                </View>
                <View style={styles.locationContent}>
                  <Text style={styles.locationName}>{location.name}</Text>
                  <Text style={styles.locationType}>{location.type}</Text>
                  {location.description && (
                    <Text style={styles.locationDescription} numberOfLines={2}>
                      {location.description}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MapPin size={48} color={theme.colors.textTertiary} />
            <Text style={styles.emptyStateTitle}>No Locations Yet</Text>
            <Text style={styles.emptyStateDescription}>
              Create your first location to map out your world
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.fab, styles.tertiaryFab]}
          onPress={() => setShowAIModal(true)}
          disabled={isCreating || isGenerating}
        >
          <Wand2 size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
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
            pathname: '/location-edit',
            params: { id: 'new' }
          })}
        >
          <Plus size={28} color={theme.colors.background} />
        </TouchableOpacity>
      </View>
      
      {/* AI Generation Modal */}
      <Modal
        visible={showAIModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAIModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>AI Location Generator</Text>
              <TouchableOpacity onPress={() => setShowAIModal(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
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
              placeholder="e.g., built on a floating island, haunted by spirits, center of trade..."
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
          </View>
        </View>
      </Modal>
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
  locationList: {
    gap: theme.spacing.md,
  },
  locationCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  locationIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.secondary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  locationContent: {
    flex: 1,
  },
  locationName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  locationType: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.secondary,
    marginTop: 2,
  },
  locationDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
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
  tertiaryFab: {
    backgroundColor: theme.colors.accent,
    marginBottom: theme.spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
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