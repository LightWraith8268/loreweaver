import React, { useState } from 'react';
import { Dimensions } from 'react-native';
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
  Platform,
} from 'react-native';
import {
  Lightbulb,
  Plus,
  X,
  Sparkles,
  Copy,
  ChevronDown,
  Check,
} from 'lucide-react-native';
import { useSettings } from '@/hooks/settings-context';
import { useWorld } from '@/hooks/world-context';
import { createTheme } from '@/constants/theme';
import { useResponsiveLayout, useResponsiveModal, useResponsiveSpacing, useResponsiveFontSize } from '@/hooks/responsive-layout';
import type { WorldGenre } from '@/types/world';

interface AIIdeasGeneratorProps {
  visible: boolean;
  onClose: () => void;
  contextType?: 'global' | 'world';
}

interface GeneratedIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  timestamp: string;
}

const GENRE_OPTIONS: { value: WorldGenre; label: string }[] = [
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'high-fantasy', label: 'High Fantasy' },
  { value: 'dark-fantasy', label: 'Dark Fantasy' },
  { value: 'urban-fantasy', label: 'Urban Fantasy' },
  { value: 'epic-fantasy', label: 'Epic Fantasy' },
  { value: 'sci-fi', label: 'Science Fiction' },
  { value: 'space-opera', label: 'Space Opera' },
  { value: 'cyberpunk', label: 'Cyberpunk' },
  { value: 'steampunk', label: 'Steampunk' },
  { value: 'biopunk', label: 'Biopunk' },
  { value: 'dystopian', label: 'Dystopian' },
  { value: 'horror', label: 'Horror' },
  { value: 'cosmic-horror', label: 'Cosmic Horror' },
  { value: 'gothic-horror', label: 'Gothic Horror' },
  { value: 'supernatural-horror', label: 'Supernatural Horror' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'detective', label: 'Detective' },
  { value: 'noir', label: 'Noir' },
  { value: 'thriller', label: 'Thriller' },
  { value: 'historical', label: 'Historical' },
  { value: 'alternate-history', label: 'Alternate History' },
  { value: 'historical-fiction', label: 'Historical Fiction' },
  { value: 'mythology', label: 'Mythology' },
  { value: 'folklore', label: 'Folklore' },
  { value: 'legend', label: 'Legend' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'swashbuckling', label: 'Swashbuckling' },
  { value: 'exploration', label: 'Exploration' },
  { value: 'romance', label: 'Romance' },
  { value: 'paranormal-romance', label: 'Paranormal Romance' },
  { value: 'romantic-fantasy', label: 'Romantic Fantasy' },
  { value: 'western', label: 'Western' },
  { value: 'weird-west', label: 'Weird West' },
  { value: 'space-western', label: 'Space Western' },
  { value: 'post-apocalyptic', label: 'Post-Apocalyptic' },
  { value: 'zombie', label: 'Zombie' },
  { value: 'survival', label: 'Survival' },
  { value: 'superhero', label: 'Superhero' },
  { value: 'comic-book', label: 'Comic Book' },
  { value: 'pulp', label: 'Pulp' },
  { value: 'slice-of-life', label: 'Slice of Life' },
  { value: 'contemporary', label: 'Contemporary' },
  { value: 'literary', label: 'Literary' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'satire', label: 'Satire' },
  { value: 'parody', label: 'Parody' },
  { value: 'experimental', label: 'Experimental' },
  { value: 'surreal', label: 'Surreal' },
  { value: 'magical-realism', label: 'Magical Realism' },
  { value: 'custom', label: 'Custom' },
];

const IDEA_CATEGORIES = [
  'Story Concepts',
  'Character Ideas',
  'World Building',
  'Plot Hooks',
  'Series Names',
  'Book Titles',
  'Chapter Content',
  'Magic Systems',
  'Locations',
  'Factions',
  'Items & Artifacts',
  'Mythology',
  'Conflicts',
  'Themes',
];

export function AIIdeasGenerator({ visible, onClose, contextType = 'global' }: AIIdeasGeneratorProps) {
  const { settings } = useSettings();
  const { currentWorld } = useWorld();
  const theme = createTheme(settings.theme);
  const { isTablet, isLandscape } = useResponsiveLayout();
  const modalDimensions = useResponsiveModal();
  const { getScaledSpacing } = useResponsiveSpacing();
  const { getScaledSize } = useResponsiveFontSize();
  
  const [selectedGenres, setSelectedGenres] = useState<WorldGenre[]>(
    contextType === 'world' && currentWorld ? [currentWorld.genre] : []
  );
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [ideaCount, setIdeaCount] = useState<number>(3);
  const [selectedCategory, setSelectedCategory] = useState<string>('Story Concepts');
  const [newAuthor, setNewAuthor] = useState('');
  const [generatedIdeas, setGeneratedIdeas] = useState<GeneratedIdea[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const handleAddAuthor = () => {
    if (newAuthor.trim() && selectedAuthors.length < 5) {
      setSelectedAuthors(prev => [...prev, newAuthor.trim()]);
      setNewAuthor('');
    }
  };

  const handleRemoveAuthor = (author: string) => {
    setSelectedAuthors(prev => prev.filter(a => a !== author));
  };

  const handleToggleGenre = (genre: WorldGenre) => {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) {
        return prev.filter(g => g !== genre);
      } else if (prev.length < 3) {
        return [...prev, genre];
      }
      return prev;
    });
  };

  const generateIdeas = async () => {
    if (selectedGenres.length === 0) {
      Alert.alert('Error', 'Please select at least one genre');
      return;
    }

    setIsGenerating(true);
    try {
      const genreText = selectedGenres.map(g => GENRE_OPTIONS.find(opt => opt.value === g)?.label || g).join(', ');
      const authorText = selectedAuthors.length > 0 ? `\nInfluenced by authors: ${selectedAuthors.join(', ')}` : '';
      const contextText = contextType === 'world' && currentWorld 
        ? `\nWorld context: ${currentWorld.name} - ${currentWorld.description}` 
        : contextType === 'global' ? '\nGeneral creative writing context - no specific world constraints' : '';
      
      const prompt = `Generate ${ideaCount} creative ${selectedCategory.toLowerCase()} for ${genreText} stories.${authorText}${contextText}\n\nUser prompt: ${customPrompt}\n\nProvide each idea with a compelling title and detailed description. Make them unique, engaging, and suitable for the specified genre(s).`;

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
        throw new Error('Failed to generate ideas');
      }

      const data = await response.json();
      const ideas = parseGeneratedIdeas(data.completion, selectedCategory);
      setGeneratedIdeas(ideas);
    } catch (error) {
      console.error('Error generating ideas:', error);
      Alert.alert('Error', 'Failed to generate ideas. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const parseGeneratedIdeas = (content: string, category: string): GeneratedIdea[] => {
    const lines = content.split('\n').filter(line => line.trim());
    const ideas: GeneratedIdea[] = [];
    let currentIdea: Partial<GeneratedIdea> = {};
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check if this is a title line (starts with number or bullet)
      if (/^\d+\.|^[•\-\*]/.test(trimmedLine)) {
        // Save previous idea if it exists
        if (currentIdea.title && currentIdea.description) {
          ideas.push({
            id: Date.now().toString() + Math.random(),
            title: currentIdea.title,
            description: currentIdea.description,
            category,
            timestamp: new Date().toISOString(),
          });
        }
        
        // Start new idea
        currentIdea = {
          title: trimmedLine.replace(/^\d+\.|^[•\-\*]\s*/, '').trim(),
          description: '',
        };
      } else if (trimmedLine && currentIdea.title) {
        // Add to description
        currentIdea.description = currentIdea.description 
          ? `${currentIdea.description} ${trimmedLine}`
          : trimmedLine;
      }
    }
    
    // Don't forget the last idea
    if (currentIdea.title && currentIdea.description) {
      ideas.push({
        id: Date.now().toString() + Math.random(),
        title: currentIdea.title,
        description: currentIdea.description,
        category,
        timestamp: new Date().toISOString(),
      });
    }
    
    return ideas.slice(0, ideaCount);
  };

  const copyToClipboard = async (text: string) => {
    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(text);
        Alert.alert('Copied', 'Idea copied to clipboard');
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    } else {
      // For mobile, we'd use Expo Clipboard, but it's not available in this context
      Alert.alert('Copy', text);
    }
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: getScaledSpacing(theme.spacing.md),
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: getScaledSpacing(theme.spacing.lg),
      ...modalDimensions,
      maxHeight: Math.floor(Dimensions.get('window').height * (isTablet ? 85 : 90) / 100),
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    modalTitle: {
      fontSize: getScaledSize(theme.fontSize.xl),
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
    },
    content: {
      flex: 1,
    },
    section: {
      marginBottom: getScaledSpacing(theme.spacing.lg),
    },
    sectionTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    inputLabel: {
      fontSize: getScaledSize(theme.fontSize.sm),
      color: theme.colors.textSecondary,
      marginBottom: getScaledSpacing(theme.spacing.sm),
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
    dropdown: {
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.md,
    },
    dropdownButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
    },
    dropdownButtonText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      flex: 1,
    },
    dropdownList: {
      maxHeight: 200,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    dropdownItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    dropdownItemText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
    },
    genreChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: getScaledSpacing(theme.spacing.sm),
      marginBottom: getScaledSpacing(theme.spacing.md),
    },
    genreChip: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primary + '20',
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    genreChipSelected: {
      backgroundColor: theme.colors.primary,
    },
    genreChipText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.primary,
    },
    genreChipTextSelected: {
      color: theme.colors.background,
    },
    authorChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    authorChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.secondary + '20',
      borderWidth: 1,
      borderColor: theme.colors.secondary,
      gap: theme.spacing.sm,
    },
    authorChipText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.secondary,
    },
    authorInput: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      alignItems: 'flex-end',
    },
    authorInputField: {
      flex: 1,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 50,
    },
    countSelector: {
      flexDirection: isTablet && isLandscape ? 'row' : 'row',
      flexWrap: isTablet ? 'nowrap' : 'wrap',
      gap: getScaledSpacing(theme.spacing.sm),
      marginBottom: getScaledSpacing(theme.spacing.md),
      justifyContent: isTablet ? 'flex-start' : 'center',
    },
    countButton: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceLight,
    },
    countButtonSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    countButtonText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
    },
    countButtonTextSelected: {
      color: theme.colors.background,
    },
    generateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.primary,
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    generateButtonText: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.background,
    },
    generateButtonDisabled: {
      backgroundColor: theme.colors.textTertiary,
    },
    ideasList: {
      gap: theme.spacing.md,
    },
    ideaCard: {
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    ideaHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.md,
    },
    ideaTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      flex: 1,
      marginRight: theme.spacing.md,
    },
    ideaCategory: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.primary,
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
    },
    ideaDescription: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      lineHeight: theme.fontSize.md * 1.5,
      marginBottom: theme.spacing.md,
    },
    ideaActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    copyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.primary + '20',
      gap: theme.spacing.xs,
    },
    copyButtonText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.primary,
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
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, isTablet && isLandscape && { flexDirection: 'row', gap: getScaledSpacing(theme.spacing.lg) }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {contextType === 'world' && currentWorld ? `${currentWorld.name} - AI Ideas` : 'AI Ideas Generator'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Category Selection */}
            <View style={styles.section}>
              <Text style={styles.inputLabel}>Idea Category</Text>
              <View style={styles.dropdown}>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                  <Text style={styles.dropdownButtonText}>{selectedCategory}</Text>
                  <ChevronDown size={20} color={theme.colors.text} />
                </TouchableOpacity>
                {showCategoryDropdown && (
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                    {IDEA_CATEGORIES.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSelectedCategory(category);
                          setShowCategoryDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{category}</Text>
                        {selectedCategory === category && (
                          <Check size={16} color={theme.colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>

            {/* Genre Selection */}
            <View style={styles.section}>
              <Text style={styles.inputLabel}>
                Genres (1-3 required)
                {contextType === 'world' && currentWorld && (
                  <Text style={{ color: theme.colors.primary, fontSize: theme.fontSize.xs }}>
                    {' '}• Current world: {GENRE_OPTIONS.find(opt => opt.value === currentWorld.genre)?.label || currentWorld.genre}
                  </Text>
                )}
              </Text>
              <View style={styles.dropdown}>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowGenreDropdown(!showGenreDropdown)}
                >
                  <Text style={styles.dropdownButtonText}>
                    {selectedGenres.length > 0 
                      ? `${selectedGenres.length} genre${selectedGenres.length > 1 ? 's' : ''} selected`
                      : 'Select genres'}
                  </Text>
                  <ChevronDown size={20} color={theme.colors.text} />
                </TouchableOpacity>
                {showGenreDropdown && (
                  <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                    {GENRE_OPTIONS.map((genre) => (
                      <TouchableOpacity
                        key={genre.value}
                        style={styles.dropdownItem}
                        onPress={() => handleToggleGenre(genre.value)}
                      >
                        <Text style={styles.dropdownItemText}>{genre.label}</Text>
                        {selectedGenres.includes(genre.value) && (
                          <Check size={16} color={theme.colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
              
              {selectedGenres.length > 0 && (
                <View style={styles.genreChips}>
                  {selectedGenres.map((genre) => {
                    const genreOption = GENRE_OPTIONS.find(opt => opt.value === genre);
                    return (
                      <TouchableOpacity
                        key={genre}
                        style={[styles.genreChip, styles.genreChipSelected]}
                        onPress={() => handleToggleGenre(genre)}
                      >
                        <Text style={[styles.genreChipText, styles.genreChipTextSelected]}>
                          {genreOption?.label || genre} ×
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Authors Selection */}
            <View style={styles.section}>
              <Text style={styles.inputLabel}>Favorite Authors (up to 5, optional)</Text>
              
              {selectedAuthors.length > 0 && (
                <View style={styles.authorChips}>
                  {selectedAuthors.map((author) => (
                    <TouchableOpacity
                      key={author}
                      style={styles.authorChip}
                      onPress={() => handleRemoveAuthor(author)}
                    >
                      <Text style={styles.authorChipText}>{author}</Text>
                      <X size={12} color={theme.colors.secondary} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              {selectedAuthors.length < 5 && (
                <View style={styles.authorInput}>
                  <TextInput
                    style={[styles.input, styles.authorInputField, { marginBottom: 0 }]}
                    placeholder="Enter author name"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={newAuthor}
                    onChangeText={setNewAuthor}
                    onSubmitEditing={handleAddAuthor}
                  />
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddAuthor}
                    disabled={!newAuthor.trim()}
                  >
                    <Plus size={20} color={theme.colors.background} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Custom Prompt */}
            <View style={styles.section}>
              <Text style={styles.inputLabel}>Custom Prompt (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add specific requirements or themes..."
                placeholderTextColor={theme.colors.textTertiary}
                value={customPrompt}
                onChangeText={setCustomPrompt}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Idea Count Selection */}
            <View style={styles.section}>
              <Text style={styles.inputLabel}>Number of Ideas</Text>
              <View style={styles.countSelector}>
                {[1, 2, 3, 4, 5].map((count) => (
                  <TouchableOpacity
                    key={count}
                    style={[
                      styles.countButton,
                      ideaCount === count && styles.countButtonSelected,
                    ]}
                    onPress={() => setIdeaCount(count)}
                  >
                    <Text
                      style={[
                        styles.countButtonText,
                        ideaCount === count && styles.countButtonTextSelected,
                      ]}
                    >
                      {count}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Generate Button */}
            <TouchableOpacity
              style={[
                styles.generateButton,
                (isGenerating || selectedGenres.length === 0) && styles.generateButtonDisabled,
              ]}
              onPress={generateIdeas}
              disabled={isGenerating || selectedGenres.length === 0}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color={theme.colors.background} />
              ) : (
                <Sparkles size={20} color={theme.colors.background} />
              )}
              <Text style={styles.generateButtonText}>
                {isGenerating ? 'Generating Ideas...' : 'Generate Ideas'}
              </Text>
            </TouchableOpacity>

            {/* Generated Ideas */}
            {generatedIdeas.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.ideasList}>
                  {generatedIdeas.map((idea) => (
                    <View key={idea.id} style={styles.ideaCard}>
                      <View style={styles.ideaHeader}>
                        <Text style={styles.ideaTitle}>{idea.title}</Text>
                        <Text style={styles.ideaCategory}>{idea.category}</Text>
                      </View>
                      
                      <Text style={styles.ideaDescription}>{idea.description}</Text>
                      
                      <View style={styles.ideaActions}>
                        <TouchableOpacity
                          style={styles.copyButton}
                          onPress={() => copyToClipboard(`${idea.title}\n\n${idea.description}`)}
                        >
                          <Copy size={14} color={theme.colors.primary} />
                          <Text style={styles.copyButtonText}>Copy</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : !isGenerating && (
              <View style={styles.emptyState}>
                <Lightbulb size={64} color={theme.colors.textTertiary} />
                <Text style={styles.emptyTitle}>Ready to Generate Ideas</Text>
                <Text style={styles.emptyDescription}>
                  Configure your preferences above and click &quot;Generate Ideas&quot; to get started
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

