import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import type { AppSettings, AISettings } from '@/types/world';

const DEFAULT_AI_SETTINGS: AISettings = {
  providers: {
    huggingface: { apiKey: 'hf_QLbfBXAiELMhyRumxlNEpinzjH', enabled: true },
    cohere: { apiKey: 'trial-key-here', enabled: true },
    groq: { apiKey: 'gsk_demo_key_free_tier', enabled: true },
    together: { apiKey: 'together_free_trial_key', enabled: true },
    replicate: { apiKey: 'r8_demo_free_key', enabled: true },
    fireworks: { apiKey: 'fw_demo_free_key', enabled: true },
  },
  defaultModels: {
    textGeneration: 'groq/llama3-8b-8192',
    imageGeneration: 'replicate/stability-ai/stable-diffusion',
    speechToText: 'groq/whisper-large-v3',
    textToSpeech: 'elevenlabs/eleven_multilingual_v2',
    translation: 'huggingface/Helsinki-NLP/opus-mt-en-de',
    summarization: 'together/meta-llama/Llama-2-7b-chat-hf',
  },
  freeKeys: {
    huggingface: 'hf_QLbfBXAiELMhyRumxlNEpinzjH',
    cohere: 'trial-key-here',
    groq: 'gsk_demo_key_free_tier',
    together: 'together_free_trial_key',
    replicate: 'r8_demo_free_key',
    fireworks: 'fw_demo_free_key',
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