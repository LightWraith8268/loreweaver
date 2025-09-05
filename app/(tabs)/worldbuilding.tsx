import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import {
  Globe,
  Mountain,
  Users,
  Crown,
  Coins,
  Zap,
  Church,
  Home,
  Plus,
  Edit3,
  Trash2,
  Sparkles,
  X,
} from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useWorld } from '@/hooks/world-context';
import { useAI } from '@/hooks/ai-context';

interface WorldbuildingItem {
  id: string;
  type: 'cosmology' | 'geography' | 'cultures' | 'politics' | 'economics' | 'technology' | 'religion' | 'dailyLife';
  title: string;
  description: string;
  details: Record<string, any>;
  worldId: string;
  createdAt: string;
  updatedAt: string;
}

const WorldbuildingScreen: React.FC = () => {
  const { currentWorld } = useWorld();
  const { isGenerating } = useAI();
  const [activeTab, setActiveTab] = useState<'cosmology' | 'geography' | 'cultures' | 'politics' | 'economics' | 'technology' | 'religion' | 'dailyLife'>('cosmology');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<WorldbuildingItem | null>(null);
  const [items, setItems] = useState<WorldbuildingItem[]>([]);
  const [formData, setFormData] = useState<Partial<WorldbuildingItem>>({});

  const tabs = [
    { key: 'cosmology' as const, label: 'Cosmology', icon: Globe },
    { key: 'geography' as const, label: 'Geography', icon: Mountain },
    { key: 'cultures' as const, label: 'Cultures', icon: Users },
    { key: 'politics' as const, label: 'Politics', icon: Crown },
    { key: 'economics' as const, label: 'Economics', icon: Coins },
    { key: 'technology' as const, label: 'Technology', icon: Zap },
    { key: 'religion' as const, label: 'Religion', icon: Church },
    { key: 'dailyLife' as const, label: 'Daily Life', icon: Home },
  ];

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ type: activeTab });
    setShowModal(true);
  };

  const handleEdit = (item: WorldbuildingItem) => {
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!currentWorld || !formData.title) return;

    try {
      const newItem: WorldbuildingItem = {
        ...formData,
        id: editingItem?.id || Date.now().toString(),
        type: activeTab,
        worldId: currentWorld.id,
        createdAt: editingItem?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as WorldbuildingItem;

      if (editingItem) {
        setItems(prev => prev.map(item => item.id === editingItem.id ? newItem : item));
      } else {
        setItems(prev => [...prev, newItem]);
      }

      setShowModal(false);
      setFormData({});
    } catch {
      Alert.alert('Error', 'Failed to save item');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setItems(prev => prev.filter(item => item.id !== id)),
        },
      ]
    );
  };

  const generateWithAI = async () => {
    if (!currentWorld) return;

    try {
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are a worldbuilding assistant. Generate ${activeTab} content for a ${currentWorld.genre || 'fantasy'} world named "${currentWorld.name || 'Untitled World'}".`,
            },
            {
              role: 'user',
              content: `Generate detailed ${activeTab} information for this world. Include specific examples, names, and cultural details. Be creative and immersive.`,
            },
          ],
        }),
      });

      const data = await response.json();
      
      setFormData({
        type: activeTab,
        title: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} - ${currentWorld.name}`,
        description: data.completion,
        details: {},
      });
      
      setEditingItem(null);
      setShowModal(true);
    } catch {
      Alert.alert('Error', 'Failed to generate AI content');
    }
  };

  const currentItems = items.filter(item => item.type === activeTab);

  const renderTabContent = () => {
    const TabIcon = tabs.find(tab => tab.key === activeTab)?.icon || Globe;
    
    return (
      <View style={styles.tabContent}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <TabIcon size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>
              {tabs.find(tab => tab.key === activeTab)?.label}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.aiButton}
              onPress={generateWithAI}
              disabled={isGenerating}
            >
              <Sparkles size={16} color={theme.colors.primary} />
              <Text style={styles.aiButtonText}>AI Generate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleCreate}
            >
              <Plus size={16} color={theme.colors.surface} />
              <Text style={styles.addButtonText}>Add {tabs.find(tab => tab.key === activeTab)?.label}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {currentItems.length === 0 ? (
          <View style={styles.emptyState}>
            <TabIcon size={48} color={theme.colors.textTertiary} />
            <Text style={styles.emptyStateText}>No {activeTab} items yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Create detailed {activeTab} elements for your world
            </Text>
          </View>
        ) : (
          currentItems.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    onPress={() => handleEdit(item)}
                    style={styles.actionButton}
                  >
                    <Edit3 size={16} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    style={styles.actionButton}
                  >
                    <Trash2 size={16} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.cardContent}>{item.description}</Text>
            </View>
          ))
        )}
      </View>
    );
  };

  const renderModal = () => {
    return (
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Edit' : 'Create'} {tabs.find(tab => tab.key === activeTab)?.label}
            </Text>
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={styles.closeButton}
            >
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.fieldLabel}>Title</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title || ''}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              placeholder={`Enter ${activeTab} title`}
            />
            
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={styles.textArea}
              value={formData.description || ''}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder={`Describe the ${activeTab} details...`}
              multiline
              numberOfLines={8}
            />
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  if (!currentWorld) {
    return (
      <View style={styles.container}>
        <View style={styles.noWorldContainer}>
          <Text style={styles.noWorldText}>No world selected</Text>
          <Text style={styles.noWorldSubtext}>Please select a world to manage worldbuilding</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.key;
          
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
            >
              <TabIcon size={18} color={isActive ? theme.colors.primary : theme.colors.textSecondary} />
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>
      
      {renderModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  noWorldContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  noWorldText: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  noWorldSubtext: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  tabBar: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    maxHeight: 60,
  },
  tabBarContent: {
    paddingHorizontal: theme.spacing.md,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
    minWidth: 100,
  },
  activeTab: {
    backgroundColor: theme.colors.primary + '20',
  },
  tabText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    gap: theme.spacing.xs,
  },
  aiButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  addButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.surface,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  emptyStateText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  emptyStateSubtext: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    maxWidth: 300,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    padding: theme.spacing.xs,
  },
  cardContent: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  fieldLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  textArea: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.surface,
  },
});

export default WorldbuildingScreen;