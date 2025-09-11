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
import { Plus, Sparkles, Package, Search, Wand2, Zap, Shield, Coins } from 'lucide-react-native';
import { useWorld } from '@/hooks/world-context';
import { useAI } from '@/hooks/ai-context';
import { theme, responsive } from '@/constants/theme';
import { SelectWorldPrompt } from '@/components/SelectWorldPrompt';
import { TabLayout, TabItem } from '@/components/TabLayout';
import { StandardModal } from '@/components/StandardModal';

const { getResponsiveValue } = responsive;

export default function ItemsScreen() {
  const { currentWorld, items, createItem } = useWorld();
  const { isGenerating, generateName, generateContent } = useAI();
  const [activeTab, setActiveTab] = useState<string>('artifacts');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedItemType, setSelectedItemType] = useState<string>('weapon');
  const [customPrompt, setCustomPrompt] = useState('');
  
  const tabs: TabItem[] = [
    { key: 'artifacts', label: 'Artifacts', icon: Zap },
    { key: 'equipment', label: 'Equipment', icon: Shield },
    { key: 'resources', label: 'Resources', icon: Coins },
  ];
  
  const itemTypes = [
    { id: 'weapon', label: 'Weapon', description: 'Sword, bow, staff, or other combat tool' },
    { id: 'armor', label: 'Armor', description: 'Protective gear or clothing' },
    { id: 'artifact', label: 'Artifact', description: 'Powerful magical or ancient item' },
    { id: 'tool', label: 'Tool', description: 'Utility item or instrument' },
    { id: 'jewelry', label: 'Jewelry', description: 'Ring, amulet, or ornamental item' },
    { id: 'potion', label: 'Potion', description: 'Consumable magical brew' },
    { id: 'book', label: 'Book/Scroll', description: 'Written knowledge or spells' },
    { id: 'treasure', label: 'Treasure', description: 'Valuable or precious item' },
    { id: 'cursed', label: 'Cursed Item', description: 'Item with negative effects' },
    { id: 'mundane', label: 'Mundane Item', description: 'Common everyday object' },
  ];
  
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Filter items by category for each tab
  const artifactItems = filteredItems.filter(item => 
    ['artifact', 'cursed', 'jewelry', 'book'].includes(item.type.toLowerCase())
  );
  
  const equipmentItems = filteredItems.filter(item => 
    ['weapon', 'armor', 'tool'].includes(item.type.toLowerCase())
  );
  
  const resourceItems = filteredItems.filter(item => 
    ['potion', 'treasure', 'mundane'].includes(item.type.toLowerCase())
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
        rarity: 'common',
        properties: [],
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
  
  const handleAIGenerate = async () => {
    if (!currentWorld) {
      Alert.alert('Error', 'Please select a world first');
      return;
    }
    
    setIsCreating(true);
    try {
      const selectedType = itemTypes.find(t => t.id === selectedItemType);
      const typeDescription = selectedType?.description || 'item';
      
      const prompt = `Generate a detailed ${selectedItemType} item for a ${currentWorld.genre} world.
      
World Context: ${currentWorld.name} - ${currentWorld.description}
      
Item Type: ${typeDescription}
      ${customPrompt ? `\nAdditional Requirements: ${customPrompt}` : ''}
      
Generate:
      1. Name (appropriate for the world's genre and item type)
      2. Detailed description of appearance and function
      3. Rarity level (common, uncommon, rare, epic, legendary)
      4. Special properties or abilities
      5. History or origin story
      6. Material composition
      
      Return as JSON with fields: name, type, description, rarity, properties (array), notes`;
      
      const generated = await generateContent(prompt);
      const itemData = JSON.parse(generated);
      
      await createItem({
        worldId: currentWorld.id,
        name: itemData.name || 'Generated Item',
        type: itemData.type || selectedType?.label || 'Artifact',
        description: itemData.description || '',
        rarity: itemData.rarity || 'common',
        properties: itemData.properties || [],
        history: itemData.history || '',
        notes: itemData.notes || '',
      });
      
      setShowAIModal(false);
      setCustomPrompt('');
      Alert.alert('Success', `Created item: ${itemData.name}`);
    } catch (error) {
      console.error('AI generation error:', error);
      Alert.alert('Error', 'Failed to generate item');
    } finally {
      setIsCreating(false);
    }
  };
  
  const renderItemsList = (itemsList: any[], emptyMessage: string) => (
    <>
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
        {itemsList.length > 0 ? (
          <View style={styles.itemGrid}>
            {itemsList.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.itemCard}
                onPress={() => router.push({
                  pathname: '/item-edit',
                  params: { id: item.id }
                })}
              >
                <View style={styles.itemIcon}>
                  <Package size={32} color={theme.colors.primary} />
                </View>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.itemType} numberOfLines={1}>
                  {item.type}
                </Text>
                <View style={styles.rarityBadge}>
                  <Text style={styles.rarityText}>
                    {item.rarity?.toUpperCase() || 'COMMON'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Package size={48} color={theme.colors.textTertiary} />
            <Text style={styles.emptyStateTitle}>No Items Yet</Text>
            <Text style={styles.emptyStateDescription}>
              {emptyMessage}
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* Action Buttons - Only show for active tab */}
      {(activeTab === 'artifacts' || itemsList.length > 0) && (
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
              pathname: '/item-edit',
              params: { id: 'new' }
            })}
          >
            <Plus size={getResponsiveValue({ phone: 28, tablet: 32 })} color={theme.colors.background} />
          </TouchableOpacity>
        </View>
      )}
    </>
  );
  
  const renderArtifactsTab = () => renderItemsList(
    artifactItems, 
    'Create magical artifacts, ancient relics, and powerful items'
  );
  
  const renderEquipmentTab = () => renderItemsList(
    equipmentItems,
    'Create weapons, armor, and tools for your characters'
  );
  
  const renderResourcesTab = () => renderItemsList(
    resourceItems,
    'Create potions, treasures, and consumable items'
  );
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'artifacts':
        return renderArtifactsTab();
      case 'equipment':
        return renderEquipmentTab();
      case 'resources':
        return renderResourcesTab();
      default:
        return renderArtifactsTab();
    }
  };
  
  if (!currentWorld) {
    return (
      <SelectWorldPrompt
        title="Items"
        description="Select a world to create and manage items for your stories"
        customIcon={<Package size={64} color={theme.colors.textTertiary} />}
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
        title="Generate Item"
        size="large"
      >
        <Text style={styles.sectionLabel}>Item Type</Text>
        <ScrollView style={styles.typeSelector} showsVerticalScrollIndicator={false}>
          {itemTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeOption,
                selectedItemType === type.id && styles.selectedTypeOption
              ]}
              onPress={() => setSelectedItemType(type.id)}
            >
              <Text style={[
                styles.typeLabel,
                selectedItemType === type.id && styles.selectedTypeLabel
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
          placeholder="e.g., glows with inner light, forged by ancient dwarves, cursed with dark magic..."
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
  itemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveValue({ 
      phone: theme.spacing.md,
      tablet: theme.spacing.lg,
      largeTablet: theme.spacing.xl 
    }),
  },
  itemCard: {
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
  itemIcon: {
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
  itemName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  itemType: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  rarityBadge: {
    backgroundColor: theme.colors.secondary + '30',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  rarityText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.secondary,
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
    paddingHorizontal: theme.spacing.lg,
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