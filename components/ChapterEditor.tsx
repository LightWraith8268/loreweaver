import React, { useState, useCallback, useEffect } from 'react';
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
  Save,
  X,
  FileText,
  Download,
  Upload,
  Wand2,
  Eye,
  EyeOff,
  Settings,
  BookOpen,
  Target,
  Clock,
  Edit3,
} from 'lucide-react-native';
import { useSettings } from '@/hooks/settings-context';
import { useAI } from '@/hooks/ai-context';
import { createTheme } from '@/constants/theme';
import { RichTextEditor } from './RichTextEditor';
import { ChapterOutlineGenerator } from './ChapterOutlineGenerator';
import { parseDocxContent } from '@/utils/docx-parser';
import type { Chapter, Book as BookType } from '@/types/world';

interface ChapterEditorProps {
  visible: boolean;
  onClose: () => void;
  chapter: Chapter;
  book: BookType;
  onSave: (chapter: Chapter) => void;
  onExport?: (chapter: Chapter, format: 'docx' | 'pdf' | 'txt') => void;
}

export function ChapterEditor({
  visible,
  onClose,
  chapter,
  book,
  onSave,
  onExport,
}: ChapterEditorProps) {
  const { settings } = useSettings();
  const { generateContent } = useAI();
  const theme = createTheme(settings.theme);
  const [editedChapter, setEditedChapter] = useState<Chapter>(chapter);
  const [showOutlineGenerator, setShowOutlineGenerator] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [wordCountTarget, setWordCountTarget] = useState(2000);
  const [showPreview, setShowPreview] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    setEditedChapter(chapter);
    setHasUnsavedChanges(false);
  }, [chapter]);

  useEffect(() => {
    const wordCount = editedChapter.content.split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount !== editedChapter.wordCount) {
      setEditedChapter(prev => ({ ...prev, wordCount }));
      setHasUnsavedChanges(true);
    }
  }, [editedChapter.content]);

  const handleSave = useCallback(() => {
    const updatedChapter = {
      ...editedChapter,
      updatedAt: new Date().toISOString(),
    };
    onSave(updatedChapter);
    setHasUnsavedChanges(false);
  }, [editedChapter, onSave]);

  const handleAutoSave = useCallback(() => {
    if (autoSave && hasUnsavedChanges) {
      handleSave();
    }
  }, [autoSave, hasUnsavedChanges, handleSave]);

  const handleContentChange = useCallback((content: string) => {
    setEditedChapter(prev => ({ ...prev, content }));
    setHasUnsavedChanges(true);
  }, []);

  const handleTitleChange = useCallback((title: string) => {
    setEditedChapter(prev => ({ ...prev, title }));
    setHasUnsavedChanges(true);
  }, []);

  const handleSummaryChange = useCallback((summary: string) => {
    setEditedChapter(prev => ({ ...prev, summary }));
    setHasUnsavedChanges(true);
  }, []);

  const handleNotesChange = useCallback((notes: string) => {
    setEditedChapter(prev => ({ ...prev, notes }));
    setHasUnsavedChanges(true);
  }, []);

  const handleStatusChange = useCallback((status: Chapter['status']) => {
    setEditedChapter(prev => ({ ...prev, status }));
    setHasUnsavedChanges(true);
  }, []);

  const handleGenerateContent = useCallback(async (prompt: string) => {
    setIsGenerating(true);
    try {
      const contextPrompt = `
Book: ${book.title}
Book Description: ${book.description}
Chapter: ${editedChapter.title}
Chapter Summary: ${editedChapter.summary}
Current Content: ${editedChapter.content.substring(0, 500)}...

${prompt}

Generate content that fits naturally with the existing story and maintains consistency with the book's tone and style.`;
      
      const generatedContent = await generateContent(contextPrompt);
      
      // Append or replace content based on user choice
      Alert.alert(
        'Generated Content',
        'How would you like to use the generated content?',
        [
          {
            text: 'Append',
            onPress: () => {
              const newContent = editedChapter.content + '\n\n' + generatedContent;
              handleContentChange(newContent);
            },
          },
          {
            text: 'Replace',
            onPress: () => {
              handleContentChange(generatedContent);
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.error('Content generation error:', error);
      Alert.alert('Error', 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  }, [editedChapter, book, generateContent, handleContentChange]);

  const handleImportDocx = useCallback(async () => {
    try {
      // In a real app, this would open a file picker
      // For now, we'll show a placeholder
      Alert.alert(
        'Import DOCX',
        'DOCX import functionality would be implemented here. This would allow importing existing novel chapters directly into the editor.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('DOCX import error:', error);
      Alert.alert('Error', 'Failed to import DOCX file');
    }
  }, []);

  const handleExport = useCallback((format: 'docx' | 'pdf' | 'txt') => {
    if (onExport) {
      onExport(editedChapter, format);
    } else {
      Alert.alert(
        'Export Chapter',
        `Export to ${format.toUpperCase()} functionality would be implemented here.`,
        [{ text: 'OK' }]
      );
    }
  }, [editedChapter, onExport]);

  const handleOutlineGenerated = useCallback((outline: string) => {
    // Add the outline to chapter notes or content
    Alert.alert(
      'Use Outline',
      'Where would you like to add the generated outline?',
      [
        {
          text: 'Chapter Notes',
          onPress: () => {
            const newNotes = editedChapter.notes + '\n\nGenerated Outline:\n' + outline;
            handleNotesChange(newNotes);
          },
        },
        {
          text: 'Chapter Content',
          onPress: () => {
            const newContent = outline + '\n\n' + editedChapter.content;
            handleContentChange(newContent);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, [editedChapter, handleNotesChange, handleContentChange]);

  const getProgressPercentage = () => {
    return Math.min((editedChapter.wordCount / wordCountTarget) * 100, 100);
  };

  const getStatusColor = (status: Chapter['status']) => {
    switch (status) {
      case 'planning': return theme.colors.warning;
      case 'writing': return theme.colors.primary;
      case 'editing': return theme.colors.secondary;
      case 'completed': return theme.colors.success;
      default: return theme.colors.textTertiary;
    }
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    headerTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    headerButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surfaceLight,
    },
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: hasUnsavedChanges ? theme.colors.primary : theme.colors.success,
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.xs,
    },
    saveButtonText: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.medium,
      color: theme.colors.background,
    },
    chapterInfo: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    titleInput: {
      fontSize: theme.fontSize.xl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      backgroundColor: 'transparent',
      borderWidth: 0,
      padding: 0,
      marginBottom: theme.spacing.md,
    },
    chapterMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    statusButton: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
    },
    statusText: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.medium,
      textTransform: 'capitalize',
    },
    progressContainer: {
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    progressLabel: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    progressBar: {
      height: 4,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
    },
    summaryInput: {
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
      minHeight: 60,
      textAlignVertical: 'top',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    toolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      gap: theme.spacing.sm,
    },
    toolbarButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.sm,
      gap: theme.spacing.xs,
    },
    toolbarButtonText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.text,
    },
    editorContainer: {
      flex: 1,
    },
    sidebar: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      width: 300,
      backgroundColor: theme.colors.surface,
      borderLeftWidth: 1,
      borderLeftColor: theme.colors.border,
      padding: theme.spacing.lg,
    },
    sidebarTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    notesInput: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
      minHeight: 120,
      textAlignVertical: 'top',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    aiPromptContainer: {
      marginTop: theme.spacing.lg,
    },
    aiPromptInput: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
      minHeight: 80,
      textAlignVertical: 'top',
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.sm,
    },
    generateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.xs,
    },
    generateButtonText: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.medium,
      color: theme.colors.background,
    },
    settingsModal: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      margin: theme.spacing.lg,
      maxHeight: '80%',
    },
    settingsTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.lg,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    settingLabel: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
    },
    settingInput: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
      width: 80,
      textAlign: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={() => {
        if (hasUnsavedChanges) {
          Alert.alert(
            'Unsaved Changes',
            'You have unsaved changes. Do you want to save before closing?',
            [
              { text: 'Don\'t Save', onPress: onClose },
              { text: 'Save', onPress: () => { handleSave(); onClose(); } },
              { text: 'Cancel', style: 'cancel' },
            ]
          );
        } else {
          onClose();
        }
      }}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chapter Editor</Text>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 
                <EyeOff size={20} color={theme.colors.text} /> : 
                <Eye size={20} color={theme.colors.text} />
              }
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowSettings(true)}
            >
              <Settings size={20} color={theme.colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Save size={16} color={theme.colors.background} />
              <Text style={styles.saveButtonText}>
                {hasUnsavedChanges ? 'Save' : 'Saved'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chapter Info */}
        <View style={styles.chapterInfo}>
          <TextInput
            style={styles.titleInput}
            value={editedChapter.title}
            onChangeText={handleTitleChange}
            placeholder="Chapter Title"
            placeholderTextColor={theme.colors.textTertiary}
          />
          
          <View style={styles.chapterMeta}>
            <View style={styles.statusContainer}>
              {(['planning', 'writing', 'editing', 'completed'] as const).map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusButton,
                    {
                      borderColor: editedChapter.status === status ? getStatusColor(status) : theme.colors.border,
                      backgroundColor: editedChapter.status === status ? getStatusColor(status) + '20' : 'transparent',
                    },
                  ]}
                  onPress={() => handleStatusChange(status)}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: editedChapter.status === status ? getStatusColor(status) : theme.colors.textSecondary,
                      },
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>
                {editedChapter.wordCount.toLocaleString()} / {wordCountTarget.toLocaleString()} words ({getProgressPercentage().toFixed(0)}%)
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${getProgressPercentage()}%` },
                  ]}
                />
              </View>
            </View>
          </View>
          
          <TextInput
            style={styles.summaryInput}
            value={editedChapter.summary}
            onChangeText={handleSummaryChange}
            placeholder="Chapter summary (optional)"
            placeholderTextColor={theme.colors.textTertiary}
            multiline
          />
        </View>

        {/* Toolbar */}
        <View style={styles.toolbar}>
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => setShowOutlineGenerator(true)}
          >
            <Wand2 size={16} color={theme.colors.text} />
            <Text style={styles.toolbarButtonText}>Generate Outline</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={handleImportDocx}
          >
            <Upload size={16} color={theme.colors.text} />
            <Text style={styles.toolbarButtonText}>Import DOCX</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => handleExport('docx')}
          >
            <Download size={16} color={theme.colors.text} />
            <Text style={styles.toolbarButtonText}>Export</Text>
          </TouchableOpacity>
        </View>

        {/* Editor */}
        <View style={styles.editorContainer}>
          <RichTextEditor
            content={editedChapter.content}
            onContentChange={handleContentChange}
            placeholder="Start writing your chapter..."
            autoSave={autoSave}
            onSave={handleAutoSave}
          />
        </View>

        {/* Sidebar */}
        <View style={styles.sidebar}>
          <Text style={styles.sidebarTitle}>Chapter Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={editedChapter.notes}
            onChangeText={handleNotesChange}
            placeholder="Add notes, research, or reminders for this chapter..."
            placeholderTextColor={theme.colors.textTertiary}
            multiline
          />
          
          <View style={styles.aiPromptContainer}>
            <Text style={styles.sidebarTitle}>AI Writing Assistant</Text>
            <TextInput
              style={styles.aiPromptInput}
              placeholder="Describe what you want to write about..."
              placeholderTextColor={theme.colors.textTertiary}
              multiline
              onSubmitEditing={(event) => {
                const prompt = event.nativeEvent.text;
                if (prompt.trim()) {
                  handleGenerateContent(prompt);
                }
              }}
            />
            <TouchableOpacity
              style={styles.generateButton}
              onPress={() => {
                // This would use the text from the input above
                handleGenerateContent('Continue the story from where it left off, maintaining the same tone and style.');
              }}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color={theme.colors.background} />
              ) : (
                <Wand2 size={16} color={theme.colors.background} />
              )}
              <Text style={styles.generateButtonText}>
                {isGenerating ? 'Generating...' : 'Generate Content'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Outline Generator Modal */}
      <ChapterOutlineGenerator
        visible={showOutlineGenerator}
        onClose={() => setShowOutlineGenerator(false)}
        onOutlineGenerated={handleOutlineGenerated}
        bookTitle={book.title}
        bookDescription={book.description}
        existingChapters={book.chapters}
      />

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.settingsModal}>
            <Text style={styles.settingsTitle}>Chapter Settings</Text>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Auto-save</Text>
              <TouchableOpacity
                onPress={() => setAutoSave(!autoSave)}
                style={{
                  width: 50,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: autoSave ? theme.colors.primary : theme.colors.border,
                  justifyContent: 'center',
                  alignItems: autoSave ? 'flex-end' : 'flex-start',
                  paddingHorizontal: 2,
                }}
              >
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: theme.colors.background,
                  }}
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Word Count Target</Text>
              <TextInput
                style={styles.settingInput}
                value={wordCountTarget.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text) || 0;
                  setWordCountTarget(num);
                }}
                keyboardType="numeric"
              />
            </View>
            
            <TouchableOpacity
              style={[styles.generateButton, { marginTop: theme.spacing.lg }]}
              onPress={() => setShowSettings(false)}
            >
              <Text style={styles.generateButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}