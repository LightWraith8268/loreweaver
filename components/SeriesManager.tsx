import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import {
  Book,
  Plus,
  FileText,
  Upload,
  Eye,
  BookOpen,
  PenTool,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react-native';
import { useSettings } from '@/hooks/settings-context';
import { useWorld } from '@/hooks/world-context';
import { createTheme } from '@/constants/theme';
import { StandardModal } from '@/components/StandardModal';
import { analyzeNovelSeries } from '@/utils/novel-extraction';
import type { Series, Book as BookType, Chapter } from '@/types/world';

interface SeriesManagerProps {
  visible: boolean;
  onClose: () => void;
}

export function SeriesManager({ visible, onClose }: SeriesManagerProps) {
  const { settings } = useSettings();
  const { currentWorld, importData } = useWorld();
  const theme = createTheme(settings.theme);
  const [series, setSeries] = useState<Series[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
  const [showCreateSeries, setShowCreateSeries] = useState(false);
  const [showCreateBook, setShowCreateBook] = useState(false);
  const [showChapterEditor, setShowChapterEditor] = useState(false);
  const [showNovelExtractor, setShowNovelExtractor] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [newSeriesTitle, setNewSeriesTitle] = useState('');
  const [newSeriesDescription, setNewSeriesDescription] = useState('');
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookDescription, setNewBookDescription] = useState('');
  const [isGeneratingSeriesName, setIsGeneratingSeriesName] = useState(false);
  const [isGeneratingBookName, setIsGeneratingBookName] = useState(false);
  const [isGeneratingChapterContent, setIsGeneratingChapterContent] = useState(false);

  const handleCreateSeries = () => {
    if (!newSeriesTitle.trim()) {
      Alert.alert('Error', 'Please enter a series title');
      return;
    }

    const newSeries: Series = {
      id: Date.now().toString(),
      worldId: currentWorld?.id || '',
      title: newSeriesTitle,
      description: newSeriesDescription,
      genre: currentWorld?.genre || 'fantasy',
      status: 'planning',
      targetAudience: '',
      themes: [],
      books: [],
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSeries(prev => [...prev, newSeries]);
    setNewSeriesTitle('');
    setNewSeriesDescription('');
    setShowCreateSeries(false);
  };

  const handleCreateBook = () => {
    if (!newBookTitle.trim() || !selectedSeries) {
      Alert.alert('Error', 'Please enter a book title');
      return;
    }

    const newBook: BookType = {
      id: Date.now().toString(),
      seriesId: selectedSeries.id,
      title: newBookTitle,
      description: newBookDescription,
      synopsis: '',
      genre: '',
      status: 'planning',
      wordCount: 0,
      chapters: [],
      characters: [],
      outline: '',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSeries(prev => prev.map(s => 
      s.id === selectedSeries.id 
        ? { ...s, books: [...s.books, newBook] }
        : s
    ));

    setNewBookTitle('');
    setNewBookDescription('');
    setShowCreateBook(false);
  };

  const handleExtractFromNovels = async () => {
    if (!selectedSeries || selectedSeries.books.length === 0) {
      Alert.alert('Error', 'Please select a series with books first');
      return;
    }

    setIsExtracting(true);
    try {
      const novels = selectedSeries.books
        .filter(book => book.chapters.length > 0)
        .map(book => ({
          title: book.title,
          content: book.chapters.map(chapter => chapter.content).join('\n\n')
        }));

      if (novels.length === 0) {
        Alert.alert('Error', 'No book content found to extract from');
        return;
      }

      const result = await analyzeNovelSeries(novels);

      if (result.success && result.data) {
        await importData({
          characters: result.data.characters,
          locations: result.data.locations,
          items: result.data.items,
          factions: result.data.factions,
        });

        Alert.alert(
          'Extraction Complete',
          `Successfully extracted world elements from ${novels.length} book(s)`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to extract world elements');
      }
    } catch (error) {
      console.error('Novel extraction error:', error);
      Alert.alert('Error', 'Failed to extract world elements');
    } finally {
      setIsExtracting(false);
      setShowNovelExtractor(false);
    }
  };

  const generateSeriesName = async () => {
    setIsGeneratingSeriesName(true);
    try {
      const genre = currentWorld?.genre || 'fantasy';
      const prompt = `Generate 3 compelling series names for a ${genre} story series. Each name should be unique, memorable, and suitable for the genre. Provide just the names, one per line.`;

      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate series names');
      }

      const data = await response.json();
      const names = data.completion.split('\n').filter((name: string) => name.trim());
      if (names.length > 0) {
        setNewSeriesTitle(names[0].trim());
      }
    } catch (error) {
      console.error('Error generating series name:', error);
      Alert.alert('Error', 'Failed to generate series name. Please try again.');
    } finally {
      setIsGeneratingSeriesName(false);
    }
  };

  const generateBookName = async () => {
    if (!selectedSeries) return;
    
    setIsGeneratingBookName(true);
    try {
      const genre = currentWorld?.genre || 'fantasy';
      const seriesContext = `Series: ${selectedSeries.title} - ${selectedSeries.description}`;
      const bookNumber = selectedSeries.books.length + 1;
      
      const prompt = `Generate 3 compelling book titles for book ${bookNumber} in the series "${selectedSeries.title}". Genre: ${genre}. ${seriesContext}. Each title should fit the series theme and be suitable for the genre. Provide just the titles, one per line.`;

      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate book names');
      }

      const data = await response.json();
      const names = data.completion.split('\n').filter((name: string) => name.trim());
      if (names.length > 0) {
        setNewBookTitle(names[0].trim());
      }
    } catch (error) {
      console.error('Error generating book name:', error);
      Alert.alert('Error', 'Failed to generate book name. Please try again.');
    } finally {
      setIsGeneratingBookName(false);
    }
  };

  const generateChapterContent = async (book: BookType, chapterTitle: string) => {
    setIsGeneratingChapterContent(true);
    try {
      const genre = currentWorld?.genre || 'fantasy';
      const seriesContext = selectedSeries ? `Series: ${selectedSeries.title} - ${selectedSeries.description}` : '';
      const bookContext = `Book: ${book.title} - ${book.description}`;
      const chapterNumber = book.chapters.length + 1;
      
      const prompt = `Write a compelling chapter content for "${chapterTitle}" (Chapter ${chapterNumber}) in the book "${book.title}". Genre: ${genre}. ${seriesContext}. ${bookContext}. Write approximately 1000-1500 words of engaging narrative content that fits the story and genre.`;

      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate chapter content');
      }

      const data = await response.json();
      
      // Create new chapter with generated content
      const newChapter: Chapter = {
        id: Date.now().toString(),
        bookId: book.id,
        title: chapterTitle,
        content: data.completion,
        summary: `Chapter ${chapterNumber} of ${book.title}`,
        wordCount: data.completion.split(' ').length,
        status: 'completed',
        order: chapterNumber,
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Update the book with the new chapter
      setSeries(prev => prev.map(s => 
        s.id === book.seriesId 
          ? {
              ...s,
              books: s.books.map(b => 
                b.id === book.id 
                  ? {
                      ...b,
                      chapters: [...b.chapters, newChapter],
                      wordCount: b.wordCount + newChapter.wordCount,
                      updatedAt: new Date().toISOString(),
                    }
                  : b
              )
            }
          : s
      ));

      Alert.alert('Success', `Chapter "${chapterTitle}" has been generated and added to the book.`);
    } catch (error) {
      console.error('Error generating chapter content:', error);
      Alert.alert('Error', 'Failed to generate chapter content. Please try again.');
    } finally {
      setIsGeneratingChapterContent(false);
    }
  };

  const styles = StyleSheet.create({
    modalBody: {
      flex: 1,
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
      width: '95%',
      maxWidth: 800,
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
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    seriesCard: {
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    seriesHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    seriesTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      flex: 1,
    },
    seriesStatus: {
      fontSize: theme.fontSize.xs,
      fontWeight: theme.fontWeight.medium,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.primary + '20',
      color: theme.colors.primary,
    },
    seriesDescription: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    seriesStats: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    statText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textTertiary,
    },
    booksList: {
      marginTop: theme.spacing.md,
    },
    bookCard: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    bookHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    bookTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      flex: 1,
    },
    bookStatus: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textTertiary,
    },
    bookDescription: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    bookStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    actionButtons: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.primary + '20',
      gap: theme.spacing.xs,
    },
    actionButtonText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.primary,
    },
    createButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.primary,
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    createButtonText: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.background,
    },
    input: {
      backgroundColor: theme.colors.surfaceLight,
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
    saveButton: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
    },
    saveButtonText: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.background,
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
    extractButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.secondary + '20',
      borderWidth: 1,
      borderColor: theme.colors.secondary,
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    extractButtonText: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.medium,
      color: theme.colors.secondary,
    },
    aiButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 40,
      marginLeft: theme.spacing.sm,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: theme.spacing.sm,
    },
    inputFlex: {
      flex: 1,
    },
  });

  if (!visible) return null;

  return (
    <StandardModal
      visible={visible}
      onClose={onClose}
      title="Series & Books Manager"
      size="fullscreen"
      scrollable={true}
    >
      <View style={styles.modalBody}>
            {/* Create Series Button */}
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowCreateSeries(true)}
            >
              <Plus size={20} color={theme.colors.background} />
              <Text style={styles.createButtonText}>Create New Series</Text>
            </TouchableOpacity>

            {/* Series List */}
            {series.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Series</Text>
                {series.map((seriesItem) => (
                  <View key={seriesItem.id} style={styles.seriesCard}>
                    <View style={styles.seriesHeader}>
                      <Text style={styles.seriesTitle}>{seriesItem.title}</Text>
                      <Text style={styles.seriesStatus}>{seriesItem.status}</Text>
                    </View>
                    
                    <Text style={styles.seriesDescription}>
                      {seriesItem.description}
                    </Text>
                    
                    <View style={styles.seriesStats}>
                      <View style={styles.statItem}>
                        <Book size={12} color={theme.colors.textTertiary} />
                        <Text style={styles.statText}>
                          {seriesItem.books.length} book{seriesItem.books.length !== 1 ? 's' : ''}
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <FileText size={12} color={theme.colors.textTertiary} />
                        <Text style={styles.statText}>
                          {seriesItem.books.reduce((total, book) => total + book.wordCount, 0).toLocaleString()} words
                        </Text>
                      </View>
                    </View>

                    {/* Books List */}
                    <View style={styles.booksList}>
                      {seriesItem.books.map((book) => (
                        <View key={book.id} style={styles.bookCard}>
                          <View style={styles.bookHeader}>
                            <Text style={styles.bookTitle}>{book.title}</Text>
                            <Text style={styles.bookStatus}>{book.status}</Text>
                          </View>
                          
                          <Text style={styles.bookDescription}>
                            {book.description}
                          </Text>
                          
                          <View style={styles.bookStats}>
                            <Text style={styles.statText}>
                              {book.chapters.length} chapters • {book.wordCount.toLocaleString()} words
                            </Text>
                            
                            <View style={styles.actionButtons}>
                              <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => {
                                  setSelectedBook(book);
                                  setShowChapterEditor(true);
                                }}
                              >
                                <PenTool size={12} color={theme.colors.primary} />
                                <Text style={styles.actionButtonText}>Edit</Text>
                              </TouchableOpacity>
                              
                              <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => {
                                  const chapterTitle = `Chapter ${book.chapters.length + 1}`;
                                  Alert.alert(
                                    'Generate Chapter',
                                    `Generate AI content for "${chapterTitle}"?`,
                                    [
                                      { text: 'Cancel', style: 'cancel' },
                                      {
                                        text: 'Generate',
                                        onPress: () => generateChapterContent(book, chapterTitle)
                                      }
                                    ]
                                  );
                                }}
                                disabled={isGeneratingChapterContent}
                              >
                                {isGeneratingChapterContent ? (
                                  <ActivityIndicator size={12} color={theme.colors.primary} />
                                ) : (
                                  <Sparkles size={12} color={theme.colors.primary} />
                                )}
                                <Text style={styles.actionButtonText}>AI Chapter</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      ))}
                      
                      {/* Add Book Button */}
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                          setSelectedSeries(seriesItem);
                          setShowCreateBook(true);
                        }}
                      >
                        <Plus size={12} color={theme.colors.primary} />
                        <Text style={styles.actionButtonText}>Add Book</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Extract World Elements Button */}
                    {seriesItem.books.some(book => book.chapters.length > 0) && (
                      <TouchableOpacity
                        style={styles.extractButton}
                        onPress={() => {
                          setSelectedSeries(seriesItem);
                          setShowNovelExtractor(true);
                        }}
                        disabled={isExtracting}
                      >
                        {isExtracting ? (
                          <ActivityIndicator size="small" color={theme.colors.secondary} />
                        ) : (
                          <Upload size={16} color={theme.colors.secondary} />
                        )}
                        <Text style={styles.extractButtonText}>
                          {isExtracting ? 'Extracting...' : 'Extract World Elements'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <BookOpen size={64} color={theme.colors.textTertiary} />
                <Text style={styles.emptyTitle}>No Series Yet</Text>
                <Text style={styles.emptyDescription}>
                  Create your first series to start organizing your books and stories
                </Text>
              </View>
            )}
      </View>

      {/* Create Series Modal */}
      <Modal
        visible={showCreateSeries}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateSeries(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Series</Text>
              <TouchableOpacity onPress={() => setShowCreateSeries(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Series Title</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputFlex, { marginBottom: 0 }]}
                placeholder="Enter series title"
                placeholderTextColor={theme.colors.textTertiary}
                value={newSeriesTitle}
                onChangeText={setNewSeriesTitle}
              />
              <TouchableOpacity
                style={styles.aiButton}
                onPress={generateSeriesName}
                disabled={isGeneratingSeriesName}
              >
                {isGeneratingSeriesName ? (
                  <ActivityIndicator size="small" color={theme.colors.background} />
                ) : (
                  <Wand2 size={16} color={theme.colors.background} />
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter series description"
              placeholderTextColor={theme.colors.textTertiary}
              value={newSeriesDescription}
              onChangeText={setNewSeriesDescription}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowCreateSeries(false);
                  setNewSeriesTitle('');
                  setNewSeriesDescription('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleCreateSeries}
              >
                <Text style={styles.saveButtonText}>Create Series</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Book Modal */}
      <Modal
        visible={showCreateBook}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateBook(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Book</Text>
              <TouchableOpacity onPress={() => setShowCreateBook(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Book Title</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputFlex, { marginBottom: 0 }]}
                placeholder="Enter book title"
                placeholderTextColor={theme.colors.textTertiary}
                value={newBookTitle}
                onChangeText={setNewBookTitle}
              />
              <TouchableOpacity
                style={styles.aiButton}
                onPress={generateBookName}
                disabled={isGeneratingBookName}
              >
                {isGeneratingBookName ? (
                  <ActivityIndicator size="small" color={theme.colors.background} />
                ) : (
                  <Wand2 size={16} color={theme.colors.background} />
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter book description"
              placeholderTextColor={theme.colors.textTertiary}
              value={newBookDescription}
              onChangeText={setNewBookDescription}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowCreateBook(false);
                  setNewBookTitle('');
                  setNewBookDescription('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleCreateBook}
              >
                <Text style={styles.saveButtonText}>Add Book</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Novel Extractor Modal */}
      <Modal
        visible={showNovelExtractor}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNovelExtractor(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Extract World Elements</Text>
              <TouchableOpacity onPress={() => setShowNovelExtractor(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>AI World Extraction</Text>
            <Text style={styles.emptyDescription}>
              This will analyze your book content and automatically extract characters, locations, 
              items, factions, and other world-building elements to add to your world.
            </Text>

            {selectedSeries && (
              <View style={styles.section}>
                <Text style={styles.inputLabel}>Series: {selectedSeries.title}</Text>
                <Text style={styles.inputLabel}>
                  Books to analyze: {selectedSeries.books.filter(b => b.chapters.length > 0).length}
                </Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowNovelExtractor(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleExtractFromNovels}
                disabled={isExtracting}
              >
                {isExtracting ? (
                  <ActivityIndicator size="small" color={theme.colors.background} />
                ) : (
                  <Text style={styles.saveButtonText}>Extract Elements</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </StandardModal>
  );
}