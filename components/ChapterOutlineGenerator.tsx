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
  Wand2,
  FileText,
  Plus,
  X,
  Target,
  Users,
  MapPin,
  Zap,
} from 'lucide-react-native';
import { useSettings } from '@/hooks/settings-context';
import { useAI } from '@/hooks/ai-context';
import { createTheme } from '@/constants/theme';
import type { Chapter } from '@/types/world';

interface ChapterOutlineGeneratorProps {
  visible: boolean;
  onClose: () => void;
  onOutlineGenerated: (outline: string) => void;
  bookTitle?: string;
  bookDescription?: string;
  existingChapters?: Chapter[];
}

interface OutlinePrompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: 'structure' | 'character' | 'plot' | 'world';
}

const OUTLINE_PROMPTS: OutlinePrompt[] = [
  {
    id: 'three-act',
    title: 'Three-Act Structure',
    description: 'Classic beginning, middle, and end structure',
    prompt: 'Create a detailed chapter outline using the three-act structure. Include character arcs, plot points, and pacing.',
    category: 'structure',
  },
  {
    id: 'heros-journey',
    title: "Hero's Journey",
    description: 'Follow the classic monomyth structure',
    prompt: 'Generate a chapter outline following the Hero\'s Journey structure with all 17 stages, adapted for the story.',
    category: 'structure',
  },
  {
    id: 'character-driven',
    title: 'Character-Driven',
    description: 'Focus on character development and relationships',
    prompt: 'Create a character-focused chapter outline that prioritizes character development, relationships, and internal conflicts.',
    category: 'character',
  },
  {
    id: 'mystery-structure',
    title: 'Mystery Structure',
    description: 'Perfect for mysteries and thrillers',
    prompt: 'Generate a mystery/thriller chapter outline with clues, red herrings, revelations, and a satisfying resolution.',
    category: 'plot',
  },
  {
    id: 'world-building',
    title: 'World-Building Focus',
    description: 'Emphasize world exploration and lore',
    prompt: 'Create a chapter outline that gradually reveals the world, its history, cultures, and unique elements through the story.',
    category: 'world',
  },
  {
    id: 'romance-arc',
    title: 'Romance Arc',
    description: 'Include romantic subplot development',
    prompt: 'Generate a chapter outline that weaves in a compelling romance arc with meet-cute, conflict, and resolution.',
    category: 'character',
  },
  {
    id: 'ensemble-cast',
    title: 'Ensemble Cast',
    description: 'Multiple POV characters and storylines',
    prompt: 'Create a multi-POV chapter outline that balances multiple characters and their interconnected storylines.',
    category: 'character',
  },
  {
    id: 'action-adventure',
    title: 'Action & Adventure',
    description: 'High-paced with exciting set pieces',
    prompt: 'Generate an action-packed chapter outline with exciting set pieces, escalating stakes, and thrilling sequences.',
    category: 'plot',
  },
];

export function ChapterOutlineGenerator({
  visible,
  onClose,
  onOutlineGenerated,
  bookTitle = '',
  bookDescription = '',
  existingChapters = [],
}: ChapterOutlineGeneratorProps) {
  const { settings } = useSettings();
  const { generateContent } = useAI();
  const theme = createTheme(settings.theme);
  const [selectedPrompt, setSelectedPrompt] = useState<OutlinePrompt | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [targetChapters, setTargetChapters] = useState('12');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutline, setGeneratedOutline] = useState('');
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);

  const handleGenerateOutline = useCallback(async () => {
    if (!selectedPrompt && !customPrompt.trim()) {
      Alert.alert('Error', 'Please select a prompt or enter a custom one');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = selectedPrompt?.prompt || customPrompt;
      const existingChapterInfo = existingChapters.length > 0 
        ? `\n\nExisting chapters:\n${existingChapters.map((ch, i) => `${i + 1}. ${ch.title}: ${ch.summary}`).join('\n')}`
        : '';

      const fullPrompt = `
Book Title: ${bookTitle}
Book Description: ${bookDescription}
Target Number of Chapters: ${targetChapters}
${existingChapterInfo}

${prompt}

Please provide a detailed chapter-by-chapter outline with:
- Chapter titles
- Brief summaries (2-3 sentences each)
- Key plot points and character moments
- Pacing notes
- Word count estimates

Format as a clear, organized outline.`;

      const result = await generateContent(fullPrompt);
      
      setGeneratedOutline(result);
    } catch (error) {
      console.error('Outline generation error:', error);
      Alert.alert('Error', 'Failed to generate chapter outline');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedPrompt, customPrompt, bookTitle, bookDescription, targetChapters, existingChapters, generateContent]);

  const handleUseOutline = useCallback(() => {
    if (generatedOutline) {
      onOutlineGenerated(generatedOutline);
      onClose();
    }
  }, [generatedOutline, onOutlineGenerated, onClose]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'structure': return <FileText size={16} color={theme.colors.primary} />;
      case 'character': return <Users size={16} color={theme.colors.secondary} />;
      case 'plot': return <Zap size={16} color={theme.colors.accent} />;
      case 'world': return <MapPin size={16} color={theme.colors.success} />;
      default: return <Target size={16} color={theme.colors.text} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'structure': return theme.colors.primary;
      case 'character': return theme.colors.secondary;
      case 'plot': return theme.colors.accent;
      case 'world': return theme.colors.success;
      default: return theme.colors.text;
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
    content: {
      flex: 1,
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
    bookInfo: {
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    bookTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    bookDescription: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    promptGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    promptCard: {
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      width: '48%',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    promptCardSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10',
    },
    promptHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    promptTitle: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      flex: 1,
    },
    promptDescription: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textSecondary,
      lineHeight: theme.fontSize.xs * 1.4,
    },
    categoryBadge: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
      alignSelf: 'flex-start',
      marginTop: theme.spacing.xs,
    },
    categoryText: {
      fontSize: theme.fontSize.xs,
      fontWeight: theme.fontWeight.medium,
      textTransform: 'capitalize',
    },
    customPromptButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    customPromptButtonActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10',
    },
    customPromptText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
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
      minHeight: 100,
      textAlignVertical: 'top',
    },
    inputLabel: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    settingsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    settingsInput: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
      width: 80,
      textAlign: 'center',
    },
    generateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.primary,
      gap: theme.spacing.sm,
      marginTop: theme.spacing.lg,
    },
    generateButtonDisabled: {
      backgroundColor: theme.colors.textTertiary,
    },
    generateButtonText: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.background,
    },
    outlineContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.lg,
      marginTop: theme.spacing.lg,
      maxHeight: 300,
    },
    outlineText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
      lineHeight: theme.fontSize.sm * 1.5,
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
    useButton: {
      flex: 1,
      backgroundColor: theme.colors.success,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
    },
    useButtonText: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.background,
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
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chapter Outline Generator</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Book Info */}
            {(bookTitle || bookDescription) && (
              <View style={styles.bookInfo}>
                {bookTitle && <Text style={styles.bookTitle}>{bookTitle}</Text>}
                {bookDescription && <Text style={styles.bookDescription}>{bookDescription}</Text>}
              </View>
            )}

            {/* Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Outline Settings</Text>
              <View style={styles.settingsRow}>
                <Text style={styles.inputLabel}>Target Chapters:</Text>
                <TextInput
                  style={styles.settingsInput}
                  value={targetChapters}
                  onChangeText={setTargetChapters}
                  keyboardType="numeric"
                  placeholder="12"
                  placeholderTextColor={theme.colors.textTertiary}
                />
              </View>
            </View>

            {/* Prompt Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose Outline Style</Text>
              <View style={styles.promptGrid}>
                {OUTLINE_PROMPTS.map((prompt) => (
                  <TouchableOpacity
                    key={prompt.id}
                    style={[
                      styles.promptCard,
                      selectedPrompt?.id === prompt.id && styles.promptCardSelected,
                    ]}
                    onPress={() => {
                      setSelectedPrompt(prompt);
                      setShowCustomPrompt(false);
                    }}
                  >
                    <View style={styles.promptHeader}>
                      {getCategoryIcon(prompt.category)}
                      <Text style={styles.promptTitle}>{prompt.title}</Text>
                    </View>
                    <Text style={styles.promptDescription}>{prompt.description}</Text>
                    <View
                      style={[
                        styles.categoryBadge,
                        { backgroundColor: getCategoryColor(prompt.category) + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          { color: getCategoryColor(prompt.category) },
                        ]}
                      >
                        {prompt.category}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom Prompt Option */}
              <TouchableOpacity
                style={[
                  styles.customPromptButton,
                  showCustomPrompt && styles.customPromptButtonActive,
                ]}
                onPress={() => {
                  setShowCustomPrompt(!showCustomPrompt);
                  setSelectedPrompt(null);
                }}
              >
                <Plus size={16} color={theme.colors.textSecondary} />
                <Text style={styles.customPromptText}>Custom Prompt</Text>
              </TouchableOpacity>

              {showCustomPrompt && (
                <View>
                  <Text style={styles.inputLabel}>Custom Outline Instructions</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe the type of outline you want..."
                    placeholderTextColor={theme.colors.textTertiary}
                    value={customPrompt}
                    onChangeText={setCustomPrompt}
                    multiline
                    numberOfLines={4}
                  />
                </View>
              )}
            </View>

            {/* Generate Button */}
            <TouchableOpacity
              style={[
                styles.generateButton,
                (!selectedPrompt && !customPrompt.trim()) && styles.generateButtonDisabled,
              ]}
              onPress={handleGenerateOutline}
              disabled={isGenerating || (!selectedPrompt && !customPrompt.trim())}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color={theme.colors.background} />
              ) : (
                <Wand2 size={20} color={theme.colors.background} />
              )}
              <Text style={styles.generateButtonText}>
                {isGenerating ? 'Generating...' : 'Generate Outline'}
              </Text>
            </TouchableOpacity>

            {/* Generated Outline */}
            {generatedOutline && (
              <View style={styles.outlineContainer}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.outlineText}>{generatedOutline}</Text>
                </ScrollView>
              </View>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            {generatedOutline && (
              <TouchableOpacity style={styles.useButton} onPress={handleUseOutline}>
                <Text style={styles.useButtonText}>Use This Outline</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}