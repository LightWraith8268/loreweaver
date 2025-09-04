import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import type { AppSettings, AISettings } from '@/types/world';

const DEFAULT_AI_SETTINGS: AISettings = {
  providers: {
    huggingface: { apiKey: 'hf_demo_key_12345', enabled: true },
    cohere: { apiKey: 'cohere_demo_key_67890', enabled: true },
  },
  defaultModels: {
    textGeneration: 'huggingface/microsoft/DialoGPT-medium',
    imageGeneration: 'huggingface/runwayml/stable-diffusion-v1-5',
    speechToText: 'huggingface/openai/whisper-base',
    textToSpeech: 'huggingface/microsoft/speecht5_tts',
    translation: 'huggingface/Helsinki-NLP/opus-mt-en-de',
    summarization: 'huggingface/facebook/bart-large-cnn',
  },
  freeKeys: {
    huggingface: 'hf_demo_key_12345',
    cohere: 'cohere_demo_key_67890',
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