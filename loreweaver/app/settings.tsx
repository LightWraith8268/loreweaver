import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { Stack, router } from 'expo-router';
import {
  Bot,
  Key,
  RotateCcw,
  X,
  ChevronRight,
  Type,
  Palette,
  Bug,
} from 'lucide-react-native';
import { useSettings } from '@/hooks/settings-context';
import { createTheme, getFontSize, getFontFamily, type ThemeMode } from '@/constants/theme';
import type { AISettings } from '@/types/world';
import CrashLogsViewer from '@/components/CrashLogsViewer';

const AI_PROVIDERS = [
  { key: 'rork', name: 'Rork AI (Free)', description: 'Free AI API with GPT-4o-mini, DALL-E 3, Whisper' },
  { key: 'huggingface', name: 'Hugging Face (Free)', description: 'Open source models with generous free tier' },
  { key: 'groq', name: 'Groq (Free)', description: 'Ultra-fast inference with free tier' },
  { key: 'cohere', name: 'Cohere (Free Trial)', description: 'Command models with free trial credits' },
  { key: 'together', name: 'Together AI (Free)', description: 'Open source models with free credits' },
  { key: 'fireworks', name: 'Fireworks AI (Free)', description: 'Fast inference with free tier' },
  { key: 'perplexity', name: 'Perplexity (Free)', description: 'Search-augmented AI with free tier' },
  { key: 'mistral', name: 'Mistral AI (Free)', description: 'European AI with free tier access' },
  { key: 'google', name: 'Google AI (Free)', description: 'Gemini models with free tier' },
  { key: 'deepseek', name: 'DeepSeek (Free)', description: 'Chinese AI models with free access' },
  { key: 'ollama', name: 'Ollama (Local)', description: 'Run AI models locally, completely free' },
  { key: 'lmstudio', name: 'LM Studio (Local)', description: 'Local AI inference, completely free' },
  { key: 'replicate', name: 'Replicate', description: 'Pay-per-use with free credits' },
  { key: 'anthropic', name: 'Anthropic', description: 'Claude models (limited free tier)' },
  { key: 'openai', name: 'OpenAI', description: 'GPT models (requires paid account)' },
] as const;

const AI_MODEL_TYPES = [
  { key: 'textGeneration', name: 'Text Generation', description: 'For generating stories, descriptions, and dialogue' },
  { key: 'imageGeneration', name: 'Image Generation', description: 'For creating character portraits and location art' },
  { key: 'speechToText', name: 'Speech to Text', description: 'For voice note transcription' },
  { key: 'textToSpeech', name: 'Text to Speech', description: 'For audio narration' },
  { key: 'translation', name: 'Translation', description: 'For multi-language support' },
  { key: 'summarization', name: 'Summarization', description: 'For content summarization' },
] as const;

export default function SettingsScreen() {
  const { settings, updateSettings, updateAISettings, resetSettings } = useSettings();
  const theme = createTheme(settings.theme);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showCrashLogs, setShowCrashLogs] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<keyof AISettings['providers'] | null>(null);
  const [tempApiKey, setTempApiKey] = useState('');
  const [tempAISettings, setTempAISettings] = useState<AISettings>(settings.ai);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [selectedModelType, setSelectedModelType] = useState<keyof AISettings['defaultModels'] | null>(null);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showFontSelector, setShowFontSelector] = useState(false);

  const handleThemeChange = async (newTheme: ThemeMode) => {
    try {
      await updateSettings({ theme: newTheme });
    } catch (error) {
      console.error('Failed to update theme:', error);
      Alert.alert('Error', 'Failed to update theme');
    }
  };

  const handleFontChange = async (fontFamily: 'System' | 'Raleway' | 'Georgia' | 'Times' | 'Helvetica' | 'Arial') => {
    try {
      await updateSettings({ 
        typography: { ...settings.typography, fontFamily }
      });
      setShowFontSelector(false);
    } catch (error) {
      console.error('Failed to update font:', error);
      Alert.alert('Error', 'Failed to update font');
    }
  };

  const handleSaveAISettings = async () => {
    try {
      await updateAISettings(tempAISettings);
      setShowAIModal(false);
      Alert.alert('Success', 'AI settings saved successfully');
    } catch (error) {
      console.error('Failed to save AI settings:', error);
      Alert.alert('Error', 'Failed to save AI settings');
    }
  };

  const handleProviderKeyUpdate = () => {
    if (!selectedProvider) return;
    
    setTempAISettings(prev => ({
      ...prev,
      providers: {
        ...prev.providers,
        [selectedProvider]: {
          apiKey: tempApiKey,
          enabled: tempApiKey.length > 0,
        },
      },
    }));
    
    setShowProviderModal(false);
    setSelectedProvider(null);
    setTempApiKey('');
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetSettings();
              Alert.alert('Success', 'Settings reset to default');
            } catch (error) {
              console.error('Failed to reset settings:', error);
              Alert.alert('Error', 'Failed to reset settings');
            }
          },
        },
      ]
    );
  };

  const openProviderModal = (provider: keyof AISettings['providers']) => {
    setSelectedProvider(provider);
    setTempApiKey(settings.ai.providers[provider]?.apiKey || '');
    setShowProviderModal(true);
  };

  const styles = React.useMemo(() => {
    const fontFamily = getFontFamily(settings.typography.fontFamily);
    const getScaledFontSize = (baseSize: number) => getFontSize(baseSize, settings.typography.fontSize);
    
    return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: theme.spacing.lg,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: getScaledFontSize(theme.fontSize.lg),
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      fontFamily,
    },
    settingCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    settingInfo: {
      flex: 1,
      marginRight: theme.spacing.md,
    },
    settingTitle: {
      fontSize: getScaledFontSize(theme.fontSize.md),
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: 4,
      fontFamily,
    },
    settingDescription: {
      fontSize: getScaledFontSize(theme.fontSize.sm),
      color: theme.colors.textSecondary,
      fontFamily,
    },
    themeButtons: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    themeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: theme.spacing.xs,
    },
    themeButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    themeButtonText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
    },
    themeButtonTextActive: {
      color: theme.colors.background,
    },
    aiButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.primary + '20',
      gap: theme.spacing.sm,
    },
    aiButtonText: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.medium,
      color: theme.colors.primary,
    },
    resetButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.error,
      gap: theme.spacing.sm,
      marginTop: theme.spacing.lg,
    },
    resetButtonText: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.medium,
      color: theme.colors.error,
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
      maxWidth: 500,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    modalTitle: {
      fontSize: getScaledFontSize(theme.fontSize.xl),
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      fontFamily,
    },
    providerCard: {
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    providerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    providerName: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
    },
    providerDescription: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    providerStatus: {
      fontSize: theme.fontSize.xs,
      fontWeight: theme.fontWeight.medium,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
    },
    providerStatusEnabled: {
      backgroundColor: theme.colors.success + '20',
      color: theme.colors.success,
    },
    providerStatusDisabled: {
      backgroundColor: theme.colors.error + '20',
      color: theme.colors.error,
    },
    configureButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.primary + '20',
      gap: theme.spacing.xs,
    },
    configureButtonText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.primary,
    },
    modelTypeCard: {
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    modelTypeName: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: 4,
    },
    modelTypeDescription: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    currentModel: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.primary,
      fontFamily: 'monospace',
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
    inputLabel: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    freeKeysInfo: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.colors.primary + '10',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    freeKeysText: {
      flex: 1,
      fontSize: theme.fontSize.sm,
      color: theme.colors.primary,
      lineHeight: 20,
    },
    providerStatusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    freeKeyBadge: {
      fontSize: theme.fontSize.xs,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.success,
      backgroundColor: theme.colors.success + '20',
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
    },
    freeKeyNotice: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.colors.success + '10',
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      marginTop: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    freeKeyNoticeText: {
      flex: 1,
      fontSize: theme.fontSize.xs,
      color: theme.colors.success,
      lineHeight: 16,
    },
    dropdownButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surfaceLight,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: theme.spacing.sm,
    },
    dropdownText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
    },
    fontSizeButtons: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    fontSizeButton: {
      width: 32,
      height: 32,
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    fontSizeButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    fontSizeButtonText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.text,
      fontWeight: theme.fontWeight.medium,
    },
    fontSizeButtonTextActive: {
      color: theme.colors.background,
    },
    modelSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      marginTop: theme.spacing.sm,
    },
  });
  }, [theme, settings.typography]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Appearance Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appearance</Text>
            
            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Theme</Text>
                  <Text style={styles.settingDescription}>
                    Choose from multiple beautiful themes
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowThemeSelector(true)}
                >
                  <Palette size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.dropdownText}>
                    {settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1)}
                  </Text>
                  <ChevronRight size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Typography Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Typography</Text>
            
            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Font Family</Text>
                  <Text style={styles.settingDescription}>
                    Choose your preferred font for reading (Raleway available)
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowFontSelector(true)}
                >
                  <Type size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.dropdownText}>{settings.typography.fontFamily}</Text>
                  <ChevronRight size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Font Size</Text>
                  <Text style={styles.settingDescription}>
                    Adjust text size for better readability
                  </Text>
                </View>
                <View style={styles.fontSizeButtons}>
                  {(['small', 'medium', 'large', 'extra-large'] as const).map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.fontSizeButton,
                        settings.typography.fontSize === size && styles.fontSizeButtonActive,
                      ]}
                      onPress={async () => {
                        try {
                          await updateSettings({ 
                            typography: { ...settings.typography, fontSize: size }
                          });
                        } catch (error) {
                          console.error('Failed to update font size:', error);
                          Alert.alert('Error', 'Failed to update font size');
                        }
                      }}
                    >
                      <Text style={[
                        styles.fontSizeButtonText,
                        settings.typography.fontSize === size && styles.fontSizeButtonTextActive,
                      ]}>
                        {size === 'extra-large' ? 'XL' : size.charAt(0).toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* AI Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Configuration</Text>
            
            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>AI Providers & Models</Text>
                  <Text style={styles.settingDescription}>
                    Configure API keys and default models for AI features
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.aiButton}
                  onPress={() => {
                    setTempAISettings(settings.ai);
                    setShowAIModal(true);
                  }}
                >
                  <Bot size={16} color={theme.colors.primary} />
                  <Text style={styles.aiButtonText}>Configure</Text>
                  <ChevronRight size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* App Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Settings</Text>
            
            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Offline Mode</Text>
                  <Text style={styles.settingDescription}>
                    Work without internet connection (limited features)
                  </Text>
                </View>
                <Switch
                  value={settings.offlineMode}
                  onValueChange={(value) => updateSettings({ offlineMode: value })}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                  thumbColor={settings.offlineMode ? theme.colors.primary : theme.colors.textTertiary}
                />
              </View>
            </View>
            
            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Auto Save</Text>
                  <Text style={styles.settingDescription}>
                    Automatically save changes as you work
                  </Text>
                </View>
                <Switch
                  value={settings.autoSave}
                  onValueChange={(value) => updateSettings({ autoSave: value })}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                  thumbColor={settings.autoSave ? theme.colors.primary : theme.colors.textTertiary}
                />
              </View>
            </View>
          </View>

          {/* Developer Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Developer</Text>
            
            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Crash Logs</Text>
                  <Text style={styles.settingDescription}>
                    View and manage app crash reports for debugging
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.aiButton}
                  onPress={() => setShowCrashLogs(true)}
                >
                  <Bug size={16} color={theme.colors.primary} />
                  <Text style={styles.aiButtonText}>View Logs</Text>
                  <ChevronRight size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Reset Section */}
          <TouchableOpacity style={styles.resetButton} onPress={handleResetSettings}>
            <RotateCcw size={20} color={theme.colors.error} />
            <Text style={styles.resetButtonText}>Reset All Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* AI Configuration Modal */}
      <Modal
        visible={showAIModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAIModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>AI Configuration</Text>
              <TouchableOpacity onPress={() => setShowAIModal(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionTitle}>API Providers</Text>
              {AI_PROVIDERS.map((provider) => {
                const providerKey = provider.key as keyof AISettings['providers'];
                const isEnabled = tempAISettings.providers[providerKey]?.enabled || false;
                const hasKey = (tempAISettings.providers[providerKey]?.apiKey?.length || 0) > 0;
                const isFreeProvider = ['rork', 'huggingface', 'groq', 'cohere', 'together', 'fireworks', 'perplexity', 'mistral', 'google', 'deepseek', 'ollama', 'lmstudio'].includes(provider.key);
                
                return (
                  <View key={provider.key} style={styles.providerCard}>
                    <View style={styles.providerHeader}>
                      <View style={styles.providerStatusContainer}>
                        <Text style={styles.providerName}>{provider.name}</Text>
                        {isFreeProvider && (
                          <Text style={styles.freeKeyBadge}>FREE</Text>
                        )}
                      </View>
                      <View style={styles.providerStatus}>
                        <Text style={[
                          styles.providerStatus,
                          isEnabled ? styles.providerStatusEnabled : styles.providerStatusDisabled
                        ]}>
                          {isEnabled ? 'Enabled' : 'Disabled'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.providerDescription}>{provider.description}</Text>
                    {isFreeProvider && (
                      <View style={styles.freeKeyNotice}>
                        <Text style={styles.freeKeyNoticeText}>
                          ✨ This provider offers free access! {provider.key === 'rork' ? 'Uses Rork\'s own free AI API.' : 'No API key required for basic usage.'}
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.configureButton}
                      onPress={() => openProviderModal(providerKey)}
                    >
                      <Key size={12} color={theme.colors.primary} />
                      <Text style={styles.configureButtonText}>
                        {hasKey ? 'Update API Key' : (isFreeProvider ? 'Configure (Optional)' : 'Add API Key')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}

              <Text style={[styles.sectionTitle, { marginTop: theme.spacing.lg }]}>Default Models</Text>
              {AI_MODEL_TYPES.map((modelType) => {
                const modelKey = modelType.key as keyof AISettings['defaultModels'];
                const currentModel = tempAISettings.defaultModels[modelKey];
                

                
                return (
                  <View key={modelType.key} style={styles.modelTypeCard}>
                    <Text style={styles.modelTypeName}>{modelType.name}</Text>
                    <Text style={styles.modelTypeDescription}>{modelType.description}</Text>
                    <TouchableOpacity
                      style={styles.modelSelector}
                      onPress={() => {
                        setSelectedModelType(modelKey);
                        setShowModelSelector(true);
                      }}
                    >
                      <Text style={styles.currentModel}>Current: {currentModel}</Text>
                      <ChevronRight size={16} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAIModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveAISettings}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Provider API Key Modal */}
      <Modal
        visible={showProviderModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProviderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedProvider ? AI_PROVIDERS.find(p => p.key === selectedProvider)?.name : ''} API Key
              </Text>
              <TouchableOpacity onPress={() => setShowProviderModal(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>API Key</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your API key"
              placeholderTextColor={theme.colors.textTertiary}
              value={tempApiKey}
              onChangeText={setTempApiKey}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowProviderModal(false);
                  setTempApiKey('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleProviderKeyUpdate}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Model Selector Modal */}
      <Modal
        visible={showModelSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModelSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select Model for {selectedModelType ? AI_MODEL_TYPES.find(t => t.key === selectedModelType)?.name : ''}
              </Text>
              <TouchableOpacity onPress={() => setShowModelSelector(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                // Rork's free models
                'rork/gpt-4o-mini',
                'rork/gpt-4o',
                'rork/claude-3-5-sonnet',
                'rork/claude-3-5-haiku',
                'rork/gemini-1.5-flash',
                'rork/gemini-1.5-pro',
                'rork/dall-e-3',
                'rork/whisper-large-v3',
                'rork/tts-1',
                // Free tier models
                'groq/llama-3.1-70b-versatile',
                'groq/llama-3.1-8b-instant',
                'groq/mixtral-8x7b-32768',
                'groq/whisper-large-v3',
                'huggingface/microsoft/DialoGPT-large',
                'huggingface/facebook/blenderbot-400M-distill',
                'huggingface/Helsinki-NLP/opus-mt-en-de',
                'cohere/command-r',
                'cohere/command-r-plus',
                'together/meta-llama/Llama-2-7b-chat-hf',
                'together/meta-llama/Llama-2-13b-chat-hf',
                'together/mistralai/Mixtral-8x7B-Instruct-v0.1',
                'fireworks/accounts/fireworks/models/llama-v2-7b-chat',
                'fireworks/accounts/fireworks/models/mixtral-8x7b-instruct',
                'perplexity/llama-3.1-sonar-small-128k-online',
                'perplexity/llama-3.1-sonar-large-128k-online',
                'mistral/mistral-7b-instruct',
                'mistral/mixtral-8x7b-instruct',
                'google/gemini-1.5-flash',
                'google/gemini-1.5-pro',
                'deepseek/deepseek-chat',
                'deepseek/deepseek-coder',
                'ollama/llama3.1:8b',
                'ollama/codellama:7b',
                'ollama/mistral:7b',
                'lmstudio/local-model',
                // Paid models
                'openai/gpt-4o-mini',
                'openai/gpt-4o',
                'openai/gpt-4-turbo',
                'anthropic/claude-3-5-sonnet-20241022',
                'anthropic/claude-3-5-haiku-20241022',
                'replicate/stability-ai/stable-diffusion'
              ].map((model) => {
                const isSelected = selectedModelType && tempAISettings.defaultModels[selectedModelType] === model;
                
                return (
                  <TouchableOpacity
                    key={model}
                    style={[
                      styles.providerCard,
                      isSelected && { borderColor: theme.colors.primary, borderWidth: 2 }
                    ]}
                    onPress={() => {
                      if (selectedModelType) {
                        setTempAISettings(prev => ({
                          ...prev,
                          defaultModels: {
                            ...prev.defaultModels,
                            [selectedModelType]: model
                          }
                        }));
                      }
                      setShowModelSelector(false);
                      setSelectedModelType(null);
                    }}
                  >
                    <Text style={[
                      styles.providerName,
                      isSelected && { color: theme.colors.primary }
                    ]}>
                      {model}
                    </Text>
                    <Text style={styles.providerDescription}>
                      {model.includes('rork/') ? '🆓 Rork Free AI Model' :
                       model.includes('groq/') ? '🆓 Groq Fast Inference' :
                       model.includes('huggingface/') ? '🆓 Hugging Face Open Source' :
                       model.includes('cohere/') ? '🆓 Cohere Free Trial' :
                       model.includes('together/') ? '🆓 Together AI Free Credits' :
                       model.includes('fireworks/') ? '🆓 Fireworks AI Free Tier' :
                       model.includes('perplexity/') ? '🆓 Perplexity Search AI' :
                       model.includes('mistral/') ? '🆓 Mistral AI Free Tier' :
                       model.includes('google/') ? '🆓 Google AI Free Tier' :
                       model.includes('deepseek/') ? '🆓 DeepSeek Free Access' :
                       model.includes('ollama/') ? '🆓 Ollama Local AI' :
                       model.includes('lmstudio/') ? '🆓 LM Studio Local AI' :
                       model.includes('openai/') ? '💰 OpenAI (Paid)' :
                       model.includes('anthropic/') ? '💰 Anthropic (Paid)' :
                       model.includes('replicate/') ? '💰 Replicate (Pay-per-use)' :
                       'AI Model'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowModelSelector(false);
                  setSelectedModelType(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Theme Selector Modal */}
      <Modal
        visible={showThemeSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowThemeSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Theme</Text>
              <TouchableOpacity onPress={() => setShowThemeSelector(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {([
                { key: 'dark', name: 'Dark', description: 'Classic dark theme for comfortable reading' },
                { key: 'light', name: 'Light', description: 'Clean light theme for bright environments' },
                { key: 'sepia', name: 'Sepia', description: 'Warm, paper-like theme for extended reading' },
                { key: 'forest', name: 'Forest', description: 'Nature-inspired green theme' },
                { key: 'ocean', name: 'Ocean', description: 'Deep blue theme inspired by the sea' },
                { key: 'sunset', name: 'Sunset', description: 'Warm orange and red tones' },
                { key: 'cyberpunk', name: 'Cyberpunk', description: 'Neon colors for sci-fi worlds' },
                { key: 'royal', name: 'Royal', description: 'Rich purple theme for fantasy settings' },
                { key: 'mint', name: 'Mint', description: 'Fresh green theme for a clean look' },
              ] as const).map((themeOption) => {
                const isSelected = settings.theme === themeOption.key;
                
                return (
                  <TouchableOpacity
                    key={themeOption.key}
                    style={[
                      styles.providerCard,
                      isSelected && { borderColor: theme.colors.primary, borderWidth: 2 }
                    ]}
                    onPress={() => {
                      handleThemeChange(themeOption.key as ThemeMode);
                      setShowThemeSelector(false);
                    }}
                  >
                    <Text style={[
                      styles.providerName,
                      isSelected && { color: theme.colors.primary }
                    ]}>
                      {themeOption.name}
                    </Text>
                    <Text style={styles.providerDescription}>
                      {themeOption.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowThemeSelector(false)}
              >
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Font Selector Modal */}
      <Modal
        visible={showFontSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFontSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Font</Text>
              <TouchableOpacity onPress={() => setShowFontSelector(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {([
                { key: 'System', name: 'System Default', description: 'Use the device\'s default font' },
                { key: 'Raleway', name: 'Raleway', description: 'Modern, elegant sans-serif font' },
                { key: 'Georgia', name: 'Georgia', description: 'Classic serif font, great for reading' },
                { key: 'Times', name: 'Times', description: 'Traditional serif font' },
                { key: 'Helvetica', name: 'Helvetica', description: 'Clean, professional sans-serif' },
                { key: 'Arial', name: 'Arial', description: 'Widely used sans-serif font' },
              ] as const).map((fontOption) => {
                const isSelected = settings.typography.fontFamily === fontOption.key;
                
                return (
                  <TouchableOpacity
                    key={fontOption.key}
                    style={[
                      styles.providerCard,
                      isSelected && { borderColor: theme.colors.primary, borderWidth: 2 }
                    ]}
                    onPress={() => handleFontChange(fontOption.key)}
                  >
                    <Text style={[
                      styles.providerName,
                      isSelected && { color: theme.colors.primary },
                      { fontFamily: fontOption.key === 'System' ? undefined : fontOption.key }
                    ]}>
                      {fontOption.name}
                    </Text>
                    <Text style={styles.providerDescription}>
                      {fontOption.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowFontSelector(false)}
              >
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Crash Logs Modal */}
      <CrashLogsViewer 
        visible={showCrashLogs}
        onClose={() => setShowCrashLogs(false)} 
      />
    </View>
  );
}