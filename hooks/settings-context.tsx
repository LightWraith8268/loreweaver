import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import type { AppSettings, AISettings } from '@/types/world';

const DEFAULT_AI_SETTINGS: AISettings = {
  providers: {
    // Rork's own free AI API
    rork: { apiKey: 'free-tier-access', enabled: true },
    // Hugging Face - Free tier with generous limits
    huggingface: { apiKey: 'hf_QLbfBXAiELMhyRumxlNEpinzjH', enabled: true },
    // Cohere - Free trial with good limits
    cohere: { apiKey: 'trial-key-here', enabled: true },
    // Groq - Very fast inference, free tier
    groq: { apiKey: 'gsk_demo_key_free_tier', enabled: true },
    // Together AI - Free credits for new users
    together: { apiKey: 'together_free_trial_key', enabled: true },
    // Replicate - Pay per use, but has free credits
    replicate: { apiKey: 'r8_demo_free_key', enabled: true },
    // Fireworks AI - Fast inference, free tier
    fireworks: { apiKey: 'fw_demo_free_key', enabled: true },
    // Perplexity - Free tier available
    perplexity: { apiKey: 'pplx_free_tier_key', enabled: true },
    // Mistral AI - Free tier with good models
    mistral: { apiKey: 'mistral_free_key', enabled: true },
    // Anthropic - Free tier (limited)
    anthropic: { apiKey: 'claude_free_tier', enabled: false },
    // OpenAI - Requires paid account but widely used
    openai: { apiKey: '', enabled: false },
    // Google AI - Free tier available
    google: { apiKey: 'google_ai_free_key', enabled: true },
    // DeepSeek - Chinese AI with free tier
    deepseek: { apiKey: 'deepseek_free_key', enabled: true },
    // Ollama - Local AI, completely free
    ollama: { apiKey: 'local_ollama_instance', enabled: true },
    // LM Studio - Local AI, completely free
    lmstudio: { apiKey: 'local_lmstudio_instance', enabled: true },
  },
  defaultModels: {
    textGeneration: 'rork/gpt-4o-mini',
    imageGeneration: 'rork/dall-e-3',
    speechToText: 'rork/whisper-large-v3',
    textToSpeech: 'rork/tts-1',
    translation: 'rork/gpt-4o-mini',
    summarization: 'rork/gpt-4o-mini',
  },
  freeKeys: {
    rork: 'free-tier-access',
    huggingface: 'hf_QLbfBXAiELMhyRumxlNEpinzjH',
    cohere: 'trial-key-here',
    groq: 'gsk_demo_key_free_tier',
    together: 'together_free_trial_key',
    replicate: 'r8_demo_free_key',
    fireworks: 'fw_demo_free_key',
    perplexity: 'pplx_free_tier_key',
    mistral: 'mistral_free_key',
    google: 'google_ai_free_key',
    deepseek: 'deepseek_free_key',
    ollama: 'local_ollama_instance',
    lmstudio: 'local_lmstudio_instance',
  },
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  ai: DEFAULT_AI_SETTINGS,
  offlineMode: false,
  autoSave: true,
  backupFrequency: 'weekly',
  exportFormat: 'json',
  language: 'en',
  typography: {
    fontFamily: 'System',
    fontSize: 'medium',
    lineHeight: 'normal',
  },
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  updateAISettings: (updates: Partial<AISettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  isLoading: boolean;
}

export const [SettingsProvider, useSettings] = createContextHook<SettingsContextType>(() => {
  const queryClient = useQueryClient();
  
  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const data = await AsyncStorage.getItem('app_settings');
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    },
  });
  
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<AppSettings>) => {
      const current = settingsQuery.data || DEFAULT_SETTINGS;
      const updated = { ...current, ...updates };
      await AsyncStorage.setItem('app_settings', JSON.stringify(updated));
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['settings'], data);
    },
  });
  
  const updateAISettingsMutation = useMutation({
    mutationFn: async (updates: Partial<AISettings>) => {
      const current = settingsQuery.data || DEFAULT_SETTINGS;
      const updated = { 
        ...current, 
        ai: { ...current.ai, ...updates }
      };
      await AsyncStorage.setItem('app_settings', JSON.stringify(updated));
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['settings'], data);
    },
  });
  
  const resetSettingsMutation = useMutation({
    mutationFn: async () => {
      await AsyncStorage.setItem('app_settings', JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['settings'], data);
    },
  });
  
  const { mutateAsync: updateSettingsAsync } = updateSettingsMutation;
  const { mutateAsync: updateAISettingsAsync } = updateAISettingsMutation;
  const { mutateAsync: resetSettingsAsync } = resetSettingsMutation;
  
  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    await updateSettingsAsync(updates);
  }, [updateSettingsAsync]);
  
  const updateAISettings = useCallback(async (updates: Partial<AISettings>) => {
    await updateAISettingsAsync(updates);
  }, [updateAISettingsAsync]);
  
  const resetSettings = useCallback(async () => {
    await resetSettingsAsync();
  }, [resetSettingsAsync]);
  
  return useMemo(() => ({
    settings: settingsQuery.data || DEFAULT_SETTINGS,
    updateSettings,
    updateAISettings,
    resetSettings,
    isLoading: settingsQuery.isLoading,
  }), [settingsQuery.data, settingsQuery.isLoading, updateSettings, updateAISettings, resetSettings]);
});