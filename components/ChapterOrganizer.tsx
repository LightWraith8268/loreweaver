import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Move,
  X,
  FileText,
  Clock,
  Target,
  CheckCircle,
  Circle,
  MoreHorizontal,
  Shuffle,
  Filter,
} from 'lucide-react-native';
import { useSettings } from '@/hooks/settings-context';
import { createTheme } from '@/constants/theme';
import type { Chapter, Book as BookType } from '@/types/world';

interface ChapterOrganizerProps {
  visible: boolean;
  onClose: () => void;
  book: BookType;
  onUpdateBook: (book: BookType) => void;
  onEditChapter: (chapter: Chapter) => void;
}

interface ChapterFilter {
  status: 'all' | 'planning' | 'writing' | 'editing' | 'completed';
  sortBy: 'order' | 'title' | 'wordCount' | 'status' | 'lastModified';
  sortDirection: 'asc' | 'desc';
}

export function ChapterOrganizer({
  visible,
  onClose,
  book,
  onUpdateBook,
  onEditChapter,
}: ChapterOrganizerProps) {
  const { settings } = useSettings();
  const theme = createTheme(settings.theme);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [filter, setFilter] = useState<ChapterFilter>({
    status: 'all',
    sortBy: 'order',
    sortDirection: 'asc',
  });
  const [showNewChapterModal, setShowNewChapterModal] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterSummary, setNewChapterSummary] = useState('');

  const filteredAndSortedChapters = useCallback(() => {
    let chapters = [...book.chapters];

    // Filter by status
    if (filter.status !== 'all') {
      chapters = chapters.filter(chapter => chapter.status === filter.status);
    }

    // Sort chapters
    chapters.sort((a, b) => {
      let comparison = 0;
      
      switch (filter.sortBy) {
        case 'order':
          comparison = a.order - b.order;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'wordCount':
          comparison = a.wordCount - b.wordCount;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'lastModified':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }

      return filter.sortDirection === 'desc' ? -comparison : comparison;
    });

    return chapters;
  }, [book.chapters, filter]);

  const handleCreateChapter = useCallback(() => {
    if (!newChapterTitle.trim()) {
      Alert.alert('Error', 'Please enter a chapter title');
      return;
    }

    const newChapter: Chapter = {
      id: Date.now().toString(),
      bookId: book.id,
      title: newChapterTitle,
      content: '',
      summary: newChapterSummary,
      wordCount: 0,
      status: 'planning',
      order: book.chapters.length + 1,
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedBook = {
      ...book,
      chapters: [...book.chapters, newChapter],
    };

    onUpdateBook(updatedBook);
    setNewChapterTitle('');
    setNewChapterSummary('');
    setShowNewChapterModal(false);
  }, [newChapterTitle, newChapterSummary, book, onUpdateBook]);

  const handleMoveChapter = useCallback((chapterId: string, direction: 'up' | 'down') => {
    const chapters = [...book.chapters];
    const chapterIndex = chapters.findIndex(ch => ch.id === chapterId);
    
    if (chapterIndex === -1) return;
    
    const newIndex = direction === 'up' ? chapterIndex - 1 : chapterIndex + 1;
    
    if (newIndex < 0 || newIndex >= chapters.length) return;

    // Swap chapters
    [chapters[chapterIndex], chapters[newIndex]] = [chapters[newIndex], chapters[chapterIndex]];
    
    // Update order numbers
    chapters.forEach((chapter, index) => {
      chapter.order = index + 1;
    });

    onUpdateBook({ ...book, chapters });
  }, [book, onUpdateBook]);

  const handleDeleteChapter = useCallback((chapterId: string) => {
    Alert.alert(
      'Delete Chapter',
      'Are you sure you want to delete this chapter? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedChapters = book.chapters
              .filter(ch => ch.id !== chapterId)
              .map((chapter, index) => ({ ...chapter, order: index + 1 }));
            
            onUpdateBook({ ...book, chapters: updatedChapters });
          },
        },
      ]
    );
  }, [book, onUpdateBook]);

  const handleDuplicateChapter = useCallback((chapterId: string) => {
    const originalChapter = book.chapters.find(ch => ch.id === chapterId);
    if (!originalChapter) return;

    const duplicatedChapter: Chapter = {
      ...originalChapter,
      id: Date.now().toString(),
      title: `${originalChapter.title} (Copy)`,
      order: book.chapters.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onUpdateBook({
      ...book,
      chapters: [...book.chapters, duplicatedChapter],
    });
  }, [book, onUpdateBook]);

  const handleBulkStatusChange = useCallback((status: Chapter['status']) => {
    const updatedChapters = book.chapters.map(chapter =>
      selectedChapters.includes(chapter.id)
        ? { ...chapter, status, updatedAt: new Date().toISOString() }
        : chapter
    );

    onUpdateBook({ ...book, chapters: updatedChapters });
    setSelectedChapters([]);
    setShowBulkActions(false);
  }, [book, selectedChapters, onUpdateBook]);

  const handleBulkDelete = useCallback(() => {
    Alert.alert(
      'Delete Chapters',
      `Are you sure you want to delete ${selectedChapters.length} chapter(s)? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedChapters = book.chapters
              .filter(ch => !selectedChapters.includes(ch.id))
              .map((chapter, index) => ({ ...chapter, order: index + 1 }));
            
            onUpdateBook({ ...book, chapters: updatedChapters });
            setSelectedChapters([]);
            setShowBulkActions(false);
          },
        },
      ]
    );
  }, [book, selectedChapters, onUpdateBook]);

  const toggleChapterSelection = useCallback((chapterId: string) => {
    setSelectedChapters(prev =>
      prev.includes(chapterId)
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  }, []);

  const getStatusColor = (status: Chapter['status']) => {
    switch (status) {
      case 'planning': return theme.colors.warning;
      case 'writing': return theme.colors.primary;
      case 'editing': return theme.colors.secondary;
      case 'completed': return theme.colors.success;
      default: return theme.colors.textTertiary;
    }
  };

  const getStatusIcon = (status: Chapter['status']) => {
    switch (status) {
      case 'planning': return <Circle size={16} color={getStatusColor(status)} />;
      case 'writing': return <Edit3 size={16} color={getStatusColor(status)} />;
      case 'editing': return <FileText size={16} color={getStatusColor(status)} />;
      case 'completed': return <CheckCircle size={16} color={getStatusColor(status)} />;
      default: return <Circle size={16} color={getStatusColor(status)} />;
    }
  };

  const styles = StyleSheet.create({
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
      width: '95%',
      maxWidth: 900,
      maxHeight: '90%',
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
    bookInfo: {
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    bookTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    bookStats: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    statText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    toolbar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    filterContainer: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      flex: 1,
    },
    filterButton: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surfaceLight,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    filterButtonActive: {
      backgroundColor: theme.colors.primary + '20',
      borderColor: theme.colors.primary,
    },
    filterText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textSecondary,
    },
    filterTextActive: {
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
      color: theme.colors.background,
    },
    bulkActionsBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.primary + '10',
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    bulkActionsText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.primary,
      fontWeight: theme.fontWeight.medium,
    },
    bulkActionsButtons: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    bulkActionButton: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.sm,
    },
    bulkActionButtonText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.background,
    },
    chaptersList: {
      flex: 1,
    },
    chapterCard: {
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    chapterCardSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10',
    },
    chapterHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    chapterInfo: {
      flex: 1,
    },
    chapterTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    chapterMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.xs,
    },
    chapterOrder: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textTertiary,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
    },
    chapterStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    chapterStatusText: {
      fontSize: theme.fontSize.xs,
      textTransform: 'capitalize',
    },
    chapterSummary: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      lineHeight: theme.fontSize.sm * 1.4,
    },
    chapterActions: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    actionButton: {
      padding: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.background,
    },
    chapterStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    wordCount: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textTertiary,
    },
    lastModified: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textTertiary,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xxl,
    },
    emptyTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      marginTop: theme.spacing.md,
    },
    emptyDescription: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
    },
    input: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
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
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      marginTop: theme.spacing.lg,
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
    createButton: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
    },
    createButtonText: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.background,
    },
  });

  if (!visible) return null;

  const chapters = filteredAndSortedChapters();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chapter Organization</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Book Info */}
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle}>{book.title}</Text>
            <View style={styles.bookStats}>
              <View style={styles.statItem}>
                <FileText size={14} color={theme.colors.textSecondary} />
                <Text style={styles.statText}>{book.chapters.length} chapters</Text>
              </View>
              <View style={styles.statItem}>
                <Target size={14} color={theme.colors.textSecondary} />
                <Text style={styles.statText}>{book.wordCount.toLocaleString()} words</Text>
              </View>
            </View>
          </View>

          {/* Toolbar */}
          <View style={styles.toolbar}>
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filter.status === 'all' && styles.filterButtonActive,
                ]}
                onPress={() => setFilter(prev => ({ ...prev, status: 'all' }))}
              >
                <Text style={[
                  styles.filterText,
                  filter.status === 'all' && styles.filterTextActive,
                ]}>
                  All
                </Text>
              </TouchableOpacity>
              
              {(['planning', 'writing', 'editing', 'completed'] as const).map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterButton,
                    filter.status === status && styles.filterButtonActive,
                  ]}
                  onPress={() => setFilter(prev => ({ ...prev, status }))}
                >
                  <Text style={[
                    styles.filterText,
                    filter.status === status && styles.filterTextActive,
                  ]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowNewChapterModal(true)}
            >
              <Plus size={16} color={theme.colors.background} />
              <Text style={styles.addButtonText}>Add Chapter</Text>
            </TouchableOpacity>
          </View>

          {/* Bulk Actions */}
          {selectedChapters.length > 0 && (
            <View style={styles.bulkActionsBar}>
              <Text style={styles.bulkActionsText}>
                {selectedChapters.length} chapter(s) selected
              </Text>
              <View style={styles.bulkActionsButtons}>
                <TouchableOpacity
                  style={styles.bulkActionButton}
                  onPress={() => handleBulkStatusChange('completed')}
                >
                  <Text style={styles.bulkActionButtonText}>Complete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.bulkActionButton}
                  onPress={handleBulkDelete}
                >
                  <Text style={styles.bulkActionButtonText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.bulkActionButton}
                  onPress={() => setSelectedChapters([])}
                >
                  <Text style={styles.bulkActionButtonText}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Chapters List */}
          <ScrollView style={styles.chaptersList} showsVerticalScrollIndicator={false}>
            {chapters.length > 0 ? (
              chapters.map((chapter) => (
                <TouchableOpacity
                  key={chapter.id}
                  style={[
                    styles.chapterCard,
                    selectedChapters.includes(chapter.id) && styles.chapterCardSelected,
                  ]}
                  onPress={() => toggleChapterSelection(chapter.id)}
                  onLongPress={() => onEditChapter(chapter)}
                >
                  <View style={styles.chapterHeader}>
                    <View style={styles.chapterInfo}>
                      <Text style={styles.chapterTitle}>{chapter.title}</Text>
                      
                      <View style={styles.chapterMeta}>
                        <Text style={styles.chapterOrder}>Ch. {chapter.order}</Text>
                        <View style={styles.chapterStatus}>
                          {getStatusIcon(chapter.status)}
                          <Text
                            style={[
                              styles.chapterStatusText,
                              { color: getStatusColor(chapter.status) },
                            ]}
                          >
                            {chapter.status}
                          </Text>
                        </View>
                      </View>
                      
                      {chapter.summary && (
                        <Text style={styles.chapterSummary} numberOfLines={2}>
                          {chapter.summary}
                        </Text>
                      )}
                    </View>

                    <View style={styles.chapterActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleMoveChapter(chapter.id, 'up')}
                        disabled={chapter.order === 1}
                      >
                        <ArrowUp
                          size={16}
                          color={chapter.order === 1 ? theme.colors.textTertiary : theme.colors.text}
                        />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleMoveChapter(chapter.id, 'down')}
                        disabled={chapter.order === book.chapters.length}
                      >
                        <ArrowDown
                          size={16}
                          color={chapter.order === book.chapters.length ? theme.colors.textTertiary : theme.colors.text}
                        />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => onEditChapter(chapter)}
                      >
                        <Edit3 size={16} color={theme.colors.text} />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDuplicateChapter(chapter.id)}
                      >
                        <Copy size={16} color={theme.colors.text} />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteChapter(chapter.id)}
                      >
                        <Trash2 size={16} color={theme.colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.chapterStats}>
                    <Text style={styles.wordCount}>
                      {chapter.wordCount.toLocaleString()} words
                    </Text>
                    <Text style={styles.lastModified}>
                      Modified {new Date(chapter.updatedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <FileText size={64} color={theme.colors.textTertiary} />
                <Text style={styles.emptyTitle}>No Chapters Yet</Text>
                <Text style={styles.emptyDescription}>
                  Create your first chapter to start organizing your book
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* New Chapter Modal */}
      <Modal
        visible={showNewChapterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNewChapterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Chapter</Text>
              <TouchableOpacity onPress={() => setShowNewChapterModal(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Chapter Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter chapter title"
              placeholderTextColor={theme.colors.textTertiary}
              value={newChapterTitle}
              onChangeText={setNewChapterTitle}
            />

            <Text style={styles.inputLabel}>Chapter Summary (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Brief summary of what happens in this chapter"
              placeholderTextColor={theme.colors.textTertiary}
              value={newChapterSummary}
              onChangeText={setNewChapterSummary}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowNewChapterModal(false);
                  setNewChapterTitle('');
                  setNewChapterSummary('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateChapter}
              >
                <Text style={styles.createButtonText}>Create Chapter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}