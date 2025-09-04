import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Globe, Trash2, Check, Edit3, Plus, X } from 'lucide-react-native';
import { useWorld } from '@/hooks/world-context';
import { theme } from '@/constants/theme';
import type { World } from '@/types/world';

export default function WorldSelectScreen() {
  const { worlds, currentWorld, setCurrentWorld, createWorld, updateWorld, deleteWorld } = useWorld();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWorld, setEditingWorld] = useState<World | null>(null);
  const [newWorldName, setNewWorldName] = useState('');
  const [newWorldDescription, setNewWorldDescription] = useState('');
  const [newWorldGenre, setNewWorldGenre] = useState<World['genre']>('fantasy');
  const [isCreating, setIsCreating] = useState(false);
  
  const handleSelectWorld = (world: typeof worlds[0]) => {
    setCurrentWorld(world);
    router.back();
  };
  
  const handleCreateWorld = async () => {
    if (!newWorldName.trim()) {
      Alert.alert('Error', 'Please enter a world name');
      return;
    }
    
    setIsCreating(true);
    try {
      await createWorld({
        name: newWorldName,
        description: newWorldDescription,
        genre: newWorldGenre,
      });
      setShowCreateModal(false);
      resetModal();
    } catch {
      Alert.alert('Error', 'Failed to create world');
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleEditWorld = (world: World) => {
    setEditingWorld(world);
    setNewWorldName(world.name);
    setNewWorldDescription(world.description);
    setNewWorldGenre(world.genre);
    setShowEditModal(true);
  };
  
  const handleUpdateWorld = async () => {
    if (!editingWorld || !newWorldName.trim()) {
      Alert.alert('Error', 'Please enter a world name');
      return;
    }
    
    setIsCreating(true);
    try {
      await updateWorld(editingWorld.id, {
        name: newWorldName,
        description: newWorldDescription,
        genre: newWorldGenre,
      });
      setShowEditModal(false);
      resetModal();
    } catch {
      Alert.alert('Error', 'Failed to update world');
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleDeleteWorld = (world: World) => {
    Alert.alert(
      'Delete World',
      `Are you sure you want to delete "${world.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWorld(world.id);
              if (currentWorld?.id === world.id) {
                setCurrentWorld(null);
              }
            } catch {
              Alert.alert('Error', 'Failed to delete world');
            }
          },
        },
      ]
    );
  };
  
  const resetModal = () => {
    setNewWorldName('');
    setNewWorldDescription('');
    setNewWorldGenre('fantasy');
    setEditingWorld(null);
  };
  
  const genreColors = {
    fantasy: theme.colors.fantasy,
    'sci-fi': theme.colors.scifi,
    cyberpunk: theme.colors.cyberpunk,
    mythology: theme.colors.mythology,
    custom: theme.colors.primary,
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select World</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={20} color={theme.colors.background} />
          <Text style={styles.createButtonText}>New World</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {worlds.length > 0 ? (
          <View style={styles.worldList}>
            {worlds.map((world) => (
              <View key={world.id} style={styles.worldCard}>
                <TouchableOpacity
                  style={[
                    styles.worldCardContent,
                    { borderColor: genreColors[world.genre] },
                    currentWorld?.id === world.id && styles.selectedCard
                  ]}
                  onPress={() => handleSelectWorld(world)}
                >
                  <View style={styles.worldHeader}>
                    <View style={styles.worldInfo}>
                      <Text style={styles.worldName}>{world.name}</Text>
                      <View style={[styles.genreBadge, { backgroundColor: genreColors[world.genre] }]}>
                        <Text style={styles.genreText}>{world.genre}</Text>
                      </View>
                    </View>
                    {currentWorld?.id === world.id && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentText}>Current</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.worldDescription} numberOfLines={2}>
                    {world.description}
                  </Text>
                  <Text style={styles.worldDate}>
                    Created {new Date(world.createdAt).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                
                <View style={styles.worldActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditWorld(world)}
                  >
                    <Edit3 size={16} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteWorld(world)}
                  >
                    <Trash2 size={16} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Globe size={64} color={theme.colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Worlds Yet</Text>
            <Text style={styles.emptyDescription}>
              Create your first world to start building your universe
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* Create World Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowCreateModal(false);
          resetModal();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New World</Text>
              <TouchableOpacity onPress={() => {
                setShowCreateModal(false);
                resetModal();
              }}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="World Name"
              placeholderTextColor={theme.colors.textTertiary}
              value={newWorldName}
              onChangeText={setNewWorldName}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              placeholderTextColor={theme.colors.textTertiary}
              value={newWorldDescription}
              onChangeText={setNewWorldDescription}
              multiline
              numberOfLines={3}
            />
            
            <Text style={styles.inputLabel}>Genre</Text>
            <View style={styles.genreOptions}>
              {(['fantasy', 'sci-fi', 'cyberpunk', 'mythology', 'custom'] as const).map((genre) => (
                <TouchableOpacity
                  key={genre}
                  style={[
                    styles.genreOption,
                    newWorldGenre === genre && { backgroundColor: genreColors[genre] }
                  ]}
                  onPress={() => setNewWorldGenre(genre)}
                >
                  <Text style={[
                    styles.genreOptionText,
                    newWorldGenre === genre && { color: theme.colors.background }
                  ]}>
                    {genre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowCreateModal(false);
                  resetModal();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleCreateWorld}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator color={theme.colors.background} />
                ) : (
                  <Text style={styles.confirmButtonText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Edit World Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowEditModal(false);
          resetModal();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit World</Text>
              <TouchableOpacity onPress={() => {
                setShowEditModal(false);
                resetModal();
              }}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="World Name"
              placeholderTextColor={theme.colors.textTertiary}
              value={newWorldName}
              onChangeText={setNewWorldName}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              placeholderTextColor={theme.colors.textTertiary}
              value={newWorldDescription}
              onChangeText={setNewWorldDescription}
              multiline
              numberOfLines={3}
            />
            
            <Text style={styles.inputLabel}>Genre</Text>
            <View style={styles.genreOptions}>
              {(['fantasy', 'sci-fi', 'cyberpunk', 'mythology', 'custom'] as const).map((genre) => (
                <TouchableOpacity
                  key={genre}
                  style={[
                    styles.genreOption,
                    newWorldGenre === genre && { backgroundColor: genreColors[genre] }
                  ]}
                  onPress={() => setNewWorldGenre(genre)}
                >
                  <Text style={[
                    styles.genreOptionText,
                    newWorldGenre === genre && { color: theme.colors.background }
                  ]}>
                    {genre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowEditModal(false);
                  resetModal();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleUpdateWorld}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator color={theme.colors.background} />
                ) : (
                  <Text style={styles.confirmButtonText}>Update</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  createButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  worldList: {
    gap: theme.spacing.md,
  },
  worldCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  worldCardContent: {
    flex: 1,
    padding: theme.spacing.lg,
    borderLeftWidth: 4,
  },
  selectedCard: {
    backgroundColor: theme.colors.success + '10',
  },
  worldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  worldInfo: {
    flex: 1,
  },
  worldName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  genreBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  genreText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.background,
  },
  currentBadge: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  currentText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.background,
  },
  worldDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  worldDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
  },
  worldActions: {
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
  },
  actionButton: {
    padding: theme.spacing.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
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
    paddingHorizontal: theme.spacing.xl,
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
  input: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  genreOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  genreOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  genreOptionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  confirmButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.background,
  },
});