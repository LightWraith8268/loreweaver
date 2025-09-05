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
  BookOpen,
  Lightbulb,
  Target,
  Palette,
  Plus,
  Edit3,
  Trash2,
  Sparkles,
  X,
} from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useWorld } from '@/hooks/world-context';
import { Premise, GenreStyleNotes, SeriesScope } from '@/types/world';

const FoundationsScreen: React.FC = () => {
  const { currentWorld } = useWorld();
  const [activeTab, setActiveTab] = useState<'premise' | 'style' | 'scope'>('premise');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'premise' | 'style' | 'scope' | 'arc'>('premise');
  const [editingItem, setEditingItem] = useState<any>(null);

  // Mock data - replace with actual data management
  const [premises, setPremises] = useState<Premise[]>([]);
  const [styleNotes, setStyleNotes] = useState<GenreStyleNotes[]>([]);
  const [seriesScopes, setSeriesScopes] = useState<SeriesScope[]>([]);

  const [formData, setFormData] = useState<any>({});

  const handleCreate = (type: 'premise' | 'style' | 'scope' | 'arc') => {
    setModalType(type);
    setEditingItem(null);
    setFormData({});
    setShowModal(true);
  };

  const handleEdit = (item: any, type: 'premise' | 'style' | 'scope' | 'arc') => {
    setModalType(type);
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!currentWorld) return;

    try {
      const newItem = {
        ...formData,
        id: editingItem?.id || Date.now().toString(),
        worldId: currentWorld.id,
        createdAt: editingItem?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      switch (modalType) {
        case 'premise':
          if (editingItem) {
            setPremises(prev => prev.map(p => p.id === editingItem.id ? newItem : p));
          } else {
            setPremises(prev => [...prev, newItem]);
          }
          break;
        case 'style':
          if (editingItem) {
            setStyleNotes(prev => prev.map(s => s.id === editingItem.id ? newItem : s));
          } else {
            setStyleNotes(prev => [...prev, newItem]);
          }
          break;
        case 'scope':
          if (editingItem) {
            setSeriesScopes(prev => prev.map(s => s.id === editingItem.id ? newItem : s));
          } else {
            setSeriesScopes(prev => [...prev, newItem]);
          }
          break;
      }

      setShowModal(false);
      setFormData({});
    } catch {
      Alert.alert('Error', 'Failed to save item');
    }
  };

  const handleDelete = (id: string, type: 'premise' | 'style' | 'scope') => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            switch (type) {
              case 'premise':
                setPremises(prev => prev.filter(p => p.id !== id));
                break;
              case 'style':
                setStyleNotes(prev => prev.filter(s => s.id !== id));
                break;
              case 'scope':
                setSeriesScopes(prev => prev.filter(s => s.id !== id));
                break;
            }
          },
        },
      ]
    );
  };

  const generateWithAI = async (type: string) => {
    try {
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are a worldbuilding assistant. Generate ${type} content for a ${currentWorld?.genre || 'fantasy'} world named "${currentWorld?.name || 'Untitled World'}".`,
            },
            {
              role: 'user',
              content: `Generate a detailed ${type} for this world. Be creative and specific.`,
            },
          ],
        }),
      });

      const data = await response.json();
      
      // Parse AI response and populate form
      const aiContent = data.completion;
      
      switch (type) {
        case 'premise':
          setFormData({
            centralIdea: aiContent,
            tone: 'Epic and adventurous',
            motifs: ['heroism', 'sacrifice', 'discovery'],
            themes: ['good vs evil', 'coming of age', 'power and responsibility'],
          });
          break;
        case 'style':
          setFormData({
            toneRules: [aiContent],
            pacingGuidelines: ['Fast-paced action', 'Slower character moments'],
            humorLevel: 'moderate',
            seriousnessLevel: 'moderate',
            narrativeStyle: 'Third person limited',
          });
          break;
        case 'scope':
          setFormData({
            plannedBooks: 3,
            arcs: [],
            metaStoryOverview: aiContent,
          });
          break;
      }
      
      setModalType(type as any);
      setEditingItem(null);
      setShowModal(true);
    } catch {
      Alert.alert('Error', 'Failed to generate AI content');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'premise':
        return (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Premise & Themes</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.aiButton}
                  onPress={() => generateWithAI('premise')}
                >
                  <Sparkles size={16} color={theme.colors.primary} />
                  <Text style={styles.aiButtonText}>AI Generate</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => handleCreate('premise')}
                >
                  <Plus size={16} color={theme.colors.primary} />
                  <Text style={styles.addButtonText}>Add Premise</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {premises.length === 0 ? (
              <View style={styles.emptyState}>
                <BookOpen size={48} color={theme.colors.textTertiary} />
                <Text style={styles.emptyStateText}>No premises created yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Define the central ideas, themes, and tone of your world
                </Text>
              </View>
            ) : (
              premises.map((premise) => (
                <View key={premise.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Central Idea</Text>
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        onPress={() => handleEdit(premise, 'premise')}
                        style={styles.actionButton}
                      >
                        <Edit3 size={16} color={theme.colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(premise.id, 'premise')}
                        style={styles.actionButton}
                      >
                        <Trash2 size={16} color={theme.colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.cardContent}>{premise.centralIdea}</Text>
                  
                  <Text style={styles.cardSubtitle}>Tone: {premise.tone}</Text>
                  
                  <View style={styles.tagContainer}>
                    <Text style={styles.tagLabel}>Themes:</Text>
                    {premise.themes.map((theme, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{theme}</Text>
                      </View>
                    ))}
                  </View>
                  
                  <View style={styles.tagContainer}>
                    <Text style={styles.tagLabel}>Motifs:</Text>
                    {premise.motifs.map((motif, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{motif}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))
            )}
          </View>
        );

      case 'style':
        return (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Genre & Style Notes</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.aiButton}
                  onPress={() => generateWithAI('style')}
                >
                  <Sparkles size={16} color={theme.colors.primary} />
                  <Text style={styles.aiButtonText}>AI Generate</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => handleCreate('style')}
                >
                  <Plus size={16} color={theme.colors.primary} />
                  <Text style={styles.addButtonText}>Add Style Guide</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {styleNotes.length === 0 ? (
              <View style={styles.emptyState}>
                <Palette size={48} color={theme.colors.textTertiary} />
                <Text style={styles.emptyStateText}>No style notes created yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Define tone rules, pacing, and narrative style guidelines
                </Text>
              </View>
            ) : (
              styleNotes.map((style) => (
                <View key={style.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Style Guide</Text>
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        onPress={() => handleEdit(style, 'style')}
                        style={styles.actionButton}
                      >
                        <Edit3 size={16} color={theme.colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(style.id, 'style')}
                        style={styles.actionButton}
                      >
                        <Trash2 size={16} color={theme.colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.styleMetrics}>
                    <View style={styles.styleMetric}>
                      <Text style={styles.metricLabel}>Humor Level</Text>
                      <Text style={styles.metricValue}>{style.humorLevel}</Text>
                    </View>
                    <View style={styles.styleMetric}>
                      <Text style={styles.metricLabel}>Seriousness</Text>
                      <Text style={styles.metricValue}>{style.seriousnessLevel}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.cardSubtitle}>Narrative Style: {style.narrativeStyle}</Text>
                  
                  <View style={styles.listSection}>
                    <Text style={styles.listTitle}>Tone Rules:</Text>
                    {style.toneRules.map((rule, index) => (
                      <Text key={index} style={styles.listItem}>• {rule}</Text>
                    ))}
                  </View>
                  
                  <View style={styles.listSection}>
                    <Text style={styles.listTitle}>Pacing Guidelines:</Text>
                    {style.pacingGuidelines.map((guideline, index) => (
                      <Text key={index} style={styles.listItem}>• {guideline}</Text>
                    ))}
                  </View>
                </View>
              ))
            )}
          </View>
        );

      case 'scope':
        return (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Series Scope</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.aiButton}
                  onPress={() => generateWithAI('scope')}
                >
                  <Sparkles size={16} color={theme.colors.primary} />
                  <Text style={styles.aiButtonText}>AI Generate</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => handleCreate('scope')}
                >
                  <Plus size={16} color={theme.colors.primary} />
                  <Text style={styles.addButtonText}>Add Series Scope</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {seriesScopes.length === 0 ? (
              <View style={styles.emptyState}>
                <Target size={48} color={theme.colors.textTertiary} />
                <Text style={styles.emptyStateText}>No series scope defined yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Plan your series structure, arcs, and meta-story overview
                </Text>
              </View>
            ) : (
              seriesScopes.map((scope) => (
                <View key={scope.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Series Overview</Text>
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        onPress={() => handleEdit(scope, 'scope')}
                        style={styles.actionButton}
                      >
                        <Edit3 size={16} color={theme.colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(scope.id, 'scope')}
                        style={styles.actionButton}
                      >
                        <Trash2 size={16} color={theme.colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <Text style={styles.cardSubtitle}>Planned Books: {scope.plannedBooks}</Text>
                  <Text style={styles.cardContent}>{scope.metaStoryOverview}</Text>
                  
                  <View style={styles.arcsSection}>
                    <View style={styles.arcsSectionHeader}>
                      <Text style={styles.listTitle}>Story Arcs:</Text>
                      <TouchableOpacity
                        style={styles.addArcButton}
                        onPress={() => handleCreate('arc')}
                      >
                        <Plus size={14} color={theme.colors.primary} />
                        <Text style={styles.addArcText}>Add Arc</Text>
                      </TouchableOpacity>
                    </View>
                    
                    {scope.arcs.map((arc, index) => (
                      <View key={arc.id} style={styles.arcCard}>
                        <Text style={styles.arcTitle}>{arc.name}</Text>
                        <Text style={styles.arcRange}>
                          Books {arc.bookRange.start}-{arc.bookRange.end}
                        </Text>
                        <Text style={styles.arcDescription}>{arc.description}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))
            )}
          </View>
        );

      default:
        return null;
    }
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
              {editingItem ? 'Edit' : 'Create'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
            </Text>
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={styles.closeButton}
            >
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {modalType === 'premise' && (
              <>
                <Text style={styles.fieldLabel}>Central Idea</Text>
                <TextInput
                  style={styles.textArea}
                  value={formData.centralIdea || ''}
                  onChangeText={(text) => setFormData((prev: any) => ({ ...prev, centralIdea: text }))}
                  placeholder="What is the core concept of your world?"
                  multiline
                  numberOfLines={4}
                />
                
                <Text style={styles.fieldLabel}>Tone</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.tone || ''}
                  onChangeText={(text) => setFormData((prev: any) => ({ ...prev, tone: text }))}
                  placeholder="Epic, dark, whimsical, etc."
                />
                
                <Text style={styles.fieldLabel}>Themes (comma-separated)</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.themes?.join(', ') || ''}
                  onChangeText={(text) => setFormData((prev: any) => ({ 
                    ...prev, 
                    themes: text.split(',').map(t => t.trim()).filter(t => t) 
                  }))}
                  placeholder="good vs evil, coming of age, redemption"
                />
                
                <Text style={styles.fieldLabel}>Motifs (comma-separated)</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.motifs?.join(', ') || ''}
                  onChangeText={(text) => setFormData((prev: any) => ({ 
                    ...prev, 
                    motifs: text.split(',').map(t => t.trim()).filter(t => t) 
                  }))}
                  placeholder="heroism, sacrifice, discovery"
                />
              </>
            )}
            
            {modalType === 'style' && (
              <>
                <Text style={styles.fieldLabel}>Narrative Style</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.narrativeStyle || ''}
                  onChangeText={(text) => setFormData((prev: any) => ({ ...prev, narrativeStyle: text }))}
                  placeholder="Third person limited, first person, etc."
                />
                
                <Text style={styles.fieldLabel}>Humor Level</Text>
                <View style={styles.pickerContainer}>
                  {['none', 'light', 'moderate', 'heavy'].map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.pickerOption,
                        formData.humorLevel === level && styles.pickerOptionSelected
                      ]}
                      onPress={() => setFormData((prev: any) => ({ ...prev, humorLevel: level }))}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        formData.humorLevel === level && styles.pickerOptionTextSelected
                      ]}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <Text style={styles.fieldLabel}>Seriousness Level</Text>
                <View style={styles.pickerContainer}>
                  {['light', 'moderate', 'serious', 'dark'].map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.pickerOption,
                        formData.seriousnessLevel === level && styles.pickerOptionSelected
                      ]}
                      onPress={() => setFormData((prev: any) => ({ ...prev, seriousnessLevel: level }))}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        formData.seriousnessLevel === level && styles.pickerOptionTextSelected
                      ]}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
            
            {modalType === 'scope' && (
              <>
                <Text style={styles.fieldLabel}>Planned Books</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.plannedBooks?.toString() || ''}
                  onChangeText={(text) => setFormData((prev: any) => ({ 
                    ...prev, 
                    plannedBooks: parseInt(text) || 1 
                  }))}
                  placeholder="3"
                  keyboardType="numeric"
                />
                
                <Text style={styles.fieldLabel}>Meta-Story Overview</Text>
                <TextInput
                  style={styles.textArea}
                  value={formData.metaStoryOverview || ''}
                  onChangeText={(text) => setFormData((prev: any) => ({ ...prev, metaStoryOverview: text }))}
                  placeholder="Describe the overarching narrative across all books"
                  multiline
                  numberOfLines={6}
                />
              </>
            )}
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
          <Text style={styles.noWorldSubtext}>Please select a world to manage foundations</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'premise' && styles.activeTab]}
          onPress={() => setActiveTab('premise')}
        >
          <Lightbulb size={20} color={activeTab === 'premise' ? theme.colors.primary : theme.colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'premise' && styles.activeTabText]}>Premise</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'style' && styles.activeTab]}
          onPress={() => setActiveTab('style')}
        >
          <Palette size={20} color={activeTab === 'style' ? theme.colors.primary : theme.colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'style' && styles.activeTabText]}>Style</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'scope' && styles.activeTab]}
          onPress={() => setActiveTab('scope')}
        >
          <Target size={20} color={activeTab === 'scope' ? theme.colors.primary : theme.colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'scope' && styles.activeTabText]}>Scope</Text>
        </TouchableOpacity>
      </View>
      
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
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
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
    marginBottom: theme.spacing.md,
  },
  cardSubtitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  tagLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginRight: theme.spacing.xs,
  },
  tag: {
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  tagText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
  styleMetrics: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  styleMetric: {
    flex: 1,
  },
  metricLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.xs,
  },
  metricValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  listSection: {
    marginBottom: theme.spacing.md,
  },
  listTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  listItem: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.xs,
  },
  arcsSection: {
    marginTop: theme.spacing.md,
  },
  arcsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  addArcButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.borderRadius.sm,
    gap: theme.spacing.xs,
  },
  addArcText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
  arcCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  arcTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  arcRange: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
    marginBottom: theme.spacing.xs,
  },
  arcDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  pickerOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pickerOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  pickerOptionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  pickerOptionTextSelected: {
    color: theme.colors.surface,
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

export default FoundationsScreen;