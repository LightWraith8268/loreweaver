import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Save,
  Eye,
  EyeOff,
  Undo,
  Redo,
  Type,
  Palette,
} from 'lucide-react-native';
import { useSettings } from '@/hooks/settings-context';
import { createTheme } from '@/constants/theme';

interface RichTextEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  placeholder?: string;
  autoSave?: boolean;
  onSave?: () => void;
}

interface FormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  alignment: 'left' | 'center' | 'right';
  heading: 'none' | 'h1' | 'h2' | 'h3';
  list: 'none' | 'bullet' | 'number';
  quote: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

export function RichTextEditor({
  content,
  onContentChange,
  placeholder = 'Start writing your chapter...',
  autoSave = true,
  onSave,
}: RichTextEditorProps) {
  const { settings } = useSettings();
  const theme = createTheme(settings.theme);
  const textInputRef = useRef<TextInput>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [formatState, setFormatState] = useState<FormatState>({
    bold: false,
    italic: false,
    underline: false,
    alignment: 'left',
    heading: 'none',
    list: 'none',
    quote: false,
  });

  const addToUndoStack = useCallback((text: string) => {
    setUndoStack(prev => [...prev.slice(-19), text]);
    setRedoStack([]);
  }, []);

  const handleContentChange = useCallback((text: string) => {
    onContentChange(text);
    if (autoSave) {
      // Auto-save after 2 seconds of inactivity
      const timeoutId = setTimeout(() => {
        onSave?.();
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [onContentChange, autoSave, onSave]);

  const insertText = useCallback((insertText: string, prefix = '', suffix = '') => {
    const beforeText = content.substring(0, selectionStart);
    const selectedText = content.substring(selectionStart, selectionEnd);
    const afterText = content.substring(selectionEnd);
    
    const newText = beforeText + prefix + (selectedText || insertText) + suffix + afterText;
    addToUndoStack(content);
    handleContentChange(newText);
    
    // Update cursor position
    const newCursorPos = selectionStart + prefix.length + (selectedText || insertText).length + suffix.length;
    setTimeout(() => {
      textInputRef.current?.setNativeProps({
        selection: { start: newCursorPos, end: newCursorPos }
      });
    }, 10);
  }, [content, selectionStart, selectionEnd, addToUndoStack, handleContentChange]);

  const toggleFormat = useCallback((format: keyof FormatState) => {
    const selectedText = content.substring(selectionStart, selectionEnd);
    
    if (!selectedText) {
      Alert.alert('No Selection', 'Please select text to format');
      return;
    }

    switch (format) {
      case 'bold':
        insertText('', '**', '**');
        break;
      case 'italic':
        insertText('', '*', '*');
        break;
      case 'underline':
        insertText('', '<u>', '</u>');
        break;
      case 'heading':
        const currentHeading = formatState.heading;
        const nextHeading = currentHeading === 'none' ? 'h1' : 
                           currentHeading === 'h1' ? 'h2' : 
                           currentHeading === 'h2' ? 'h3' : 'none';
        const headingPrefix = nextHeading === 'h1' ? '# ' : 
                             nextHeading === 'h2' ? '## ' : 
                             nextHeading === 'h3' ? '### ' : '';
        insertText('', headingPrefix, '');
        setFormatState(prev => ({ ...prev, heading: nextHeading }));
        break;
      case 'quote':
        insertText('', '> ', '');
        break;
    }
  }, [content, selectionStart, selectionEnd, formatState.heading, insertText]);

  const insertList = useCallback((type: 'bullet' | 'number') => {
    const prefix = type === 'bullet' ? '- ' : '1. ';
    insertText('', prefix, '');
  }, [insertText]);

  const undo = useCallback(() => {
    if (undoStack.length > 0) {
      const previousText = undoStack[undoStack.length - 1];
      setRedoStack(prev => [content, ...prev]);
      setUndoStack(prev => prev.slice(0, -1));
      onContentChange(previousText);
    }
  }, [undoStack, content, onContentChange]);

  const redo = useCallback(() => {
    if (redoStack.length > 0) {
      const nextText = redoStack[0];
      setUndoStack(prev => [...prev, content]);
      setRedoStack(prev => prev.slice(1));
      onContentChange(nextText);
    }
  }, [redoStack, content, onContentChange]);

  const renderPreview = () => {
    // Simple markdown-like preview rendering
    let previewText = content;
    
    // Headers
    previewText = previewText.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    previewText = previewText.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    previewText = previewText.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    // Bold and italic
    previewText = previewText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    previewText = previewText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Quotes
    previewText = previewText.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');
    
    // Lists
    previewText = previewText.replace(/^- (.*$)/gm, '• $1');
    previewText = previewText.replace(/^\d+\. (.*$)/gm, '1. $1');
    
    return previewText;
  };

  const getFontSize = () => {
    switch (settings.typography.fontSize) {
      case 'small': return theme.fontSize.sm;
      case 'medium': return theme.fontSize.md;
      case 'large': return theme.fontSize.lg;
      case 'extra-large': return theme.fontSize.xl;
      default: return theme.fontSize.md;
    }
  };

  const getFontFamily = () => {
    switch (settings.typography.fontFamily) {
      case 'Raleway': return Platform.OS === 'ios' ? 'Raleway' : 'Raleway-Regular';
      case 'Georgia': return 'Georgia';
      case 'Times': return Platform.OS === 'ios' ? 'Times New Roman' : 'serif';
      case 'Helvetica': return Platform.OS === 'ios' ? 'Helvetica' : 'sans-serif';
      case 'Arial': return 'Arial';
      default: return Platform.OS === 'ios' ? 'System' : 'Roboto';
    }
  };

  const getLineHeight = () => {
    const fontSize = getFontSize();
    switch (settings.typography.lineHeight) {
      case 'tight': return fontSize * 1.2;
      case 'normal': return fontSize * 1.4;
      case 'relaxed': return fontSize * 1.6;
      case 'loose': return fontSize * 1.8;
      default: return fontSize * 1.4;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    toolbar: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    toolbarButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surfaceLight,
      minWidth: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    toolbarButtonActive: {
      backgroundColor: theme.colors.primary + '20',
    },
    toolbarSeparator: {
      width: 1,
      backgroundColor: theme.colors.border,
      marginHorizontal: theme.spacing.xs,
    },
    editorContainer: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    textInput: {
      flex: 1,
      fontSize: getFontSize(),
      fontFamily: getFontFamily(),
      lineHeight: getLineHeight(),
      color: theme.colors.text,
      textAlignVertical: 'top',
      minHeight: 400,
    },
    previewContainer: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    previewText: {
      fontSize: getFontSize(),
      fontFamily: getFontFamily(),
      lineHeight: getLineHeight(),
      color: theme.colors.text,
    },
    statusBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    statusText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textTertiary,
    },
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.sm,
      gap: theme.spacing.xs,
    },
    saveButtonText: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.medium,
      color: theme.colors.background,
    },
  });

  return (
    <View style={styles.container}>
      {/* Toolbar */}
      <ScrollView 
        horizontal 
        style={styles.toolbar} 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        {/* Undo/Redo */}
        <TouchableOpacity
          style={[styles.toolbarButton, undoStack.length === 0 && { opacity: 0.5 }]}
          onPress={undo}
          disabled={undoStack.length === 0}
        >
          <Undo size={18} color={theme.colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.toolbarButton, redoStack.length === 0 && { opacity: 0.5 }]}
          onPress={redo}
          disabled={redoStack.length === 0}
        >
          <Redo size={18} color={theme.colors.text} />
        </TouchableOpacity>
        
        <View style={styles.toolbarSeparator} />
        
        {/* Text Formatting */}
        <TouchableOpacity
          style={[styles.toolbarButton, formatState.bold && styles.toolbarButtonActive]}
          onPress={() => toggleFormat('bold')}
        >
          <Bold size={18} color={theme.colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.toolbarButton, formatState.italic && styles.toolbarButtonActive]}
          onPress={() => toggleFormat('italic')}
        >
          <Italic size={18} color={theme.colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.toolbarButton, formatState.underline && styles.toolbarButtonActive]}
          onPress={() => toggleFormat('underline')}
        >
          <Underline size={18} color={theme.colors.text} />
        </TouchableOpacity>
        
        <View style={styles.toolbarSeparator} />
        
        {/* Headings */}
        <TouchableOpacity
          style={[styles.toolbarButton, formatState.heading !== 'none' && styles.toolbarButtonActive]}
          onPress={() => toggleFormat('heading')}
        >
          {formatState.heading === 'h1' ? <Heading1 size={18} color={theme.colors.text} /> :
           formatState.heading === 'h2' ? <Heading2 size={18} color={theme.colors.text} /> :
           formatState.heading === 'h3' ? <Heading3 size={18} color={theme.colors.text} /> :
           <Type size={18} color={theme.colors.text} />}
        </TouchableOpacity>
        
        <View style={styles.toolbarSeparator} />
        
        {/* Lists */}
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => insertList('bullet')}
        >
          <List size={18} color={theme.colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => insertList('number')}
        >
          <ListOrdered size={18} color={theme.colors.text} />
        </TouchableOpacity>
        
        {/* Quote */}
        <TouchableOpacity
          style={[styles.toolbarButton, formatState.quote && styles.toolbarButtonActive]}
          onPress={() => toggleFormat('quote')}
        >
          <Quote size={18} color={theme.colors.text} />
        </TouchableOpacity>
        
        <View style={styles.toolbarSeparator} />
        
        {/* Preview Toggle */}
        <TouchableOpacity
          style={[styles.toolbarButton, isPreviewMode && styles.toolbarButtonActive]}
          onPress={() => setIsPreviewMode(!isPreviewMode)}
        >
          {isPreviewMode ? 
            <EyeOff size={18} color={theme.colors.text} /> : 
            <Eye size={18} color={theme.colors.text} />
          }
        </TouchableOpacity>
      </ScrollView>
      
      {/* Editor/Preview */}
      {isPreviewMode ? (
        <ScrollView style={styles.previewContainer}>
          <Text style={styles.previewText}>{renderPreview()}</Text>
        </ScrollView>
      ) : (
        <View style={styles.editorContainer}>
          <TextInput
            ref={textInputRef}
            style={styles.textInput}
            value={content}
            onChangeText={handleContentChange}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            scrollEnabled
            onSelectionChange={(event) => {
              setSelectionStart(event.nativeEvent.selection.start);
              setSelectionEnd(event.nativeEvent.selection.end);
            }}
          />
        </View>
      )}
      
      {/* Status Bar */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {content.length} characters • {content.split(/\s+/).filter(word => word.length > 0).length} words
        </Text>
        
        {onSave && (
          <TouchableOpacity style={styles.saveButton} onPress={onSave}>
            <Save size={14} color={theme.colors.background} />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}