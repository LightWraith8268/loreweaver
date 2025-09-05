# Auto Save and Offline Mode Features

## Auto Save

The auto save functionality automatically saves your work as you type or make changes, preventing data loss.

### How Auto Save Works

1. **Debounced Saving**: Changes are saved after a delay (default 2 seconds) to avoid excessive save operations
2. **Smart Detection**: Only saves when data has actually changed
3. **Background Operation**: Saves happen in the background without interrupting your workflow
4. **Error Handling**: Failed saves are logged and can trigger error callbacks

### Auto Save Settings

- **Enable/Disable**: Toggle auto save on/off in Settings > App Settings
- **Delay Configuration**: Different delays for different types of content:
  - Forms: 1.5 seconds (quick response)
  - Entities: 3 seconds (longer content)
  - General data: 2 seconds (default)

### Using Auto Save in Components

```typescript
import { useAutoSave, useEntityAutoSave, useFormAutoSave } from '@/hooks/auto-save';

// Basic auto save
const { isAutoSaveEnabled, forceSave } = useAutoSave(
  data,
  async (data) => await saveFunction(data),
  {
    delay: 2000,
    onSave: () => console.log('Saved!'),
    onError: (error) => console.error('Save failed:', error)
  }
);

// Entity auto save (for characters, locations, etc.)
useEntityAutoSave(character, updateCharacter);

// Form auto save
useFormAutoSave(formData, saveFormData);
```

## Offline Mode

Offline mode allows you to continue working when you don't have an internet connection, with limited functionality.

### How Offline Mode Works

1. **Local Storage**: All data is stored locally using AsyncStorage
2. **Feature Detection**: AI features and online-only features are disabled
3. **Graceful Degradation**: The app continues to work with core features
4. **Sync on Reconnect**: Changes made offline can be synced when back online

### Offline Mode Settings

- **Manual Toggle**: Enable offline mode in Settings > App Settings
- **Automatic Detection**: Some features automatically detect network status
- **Per-World Setting**: Individual worlds can be marked as offline-only

### Using Offline Mode in Components

```typescript
import { useOfflineMode, useOfflineSync } from '@/hooks/auto-save';

const { isOfflineMode, withOfflineCheck } = useOfflineMode();
const { queueOfflineAction, syncOfflineActions } = useOfflineSync();

// Check if feature is available offline
const result = await withOfflineCheck(
  // Online action
  async () => await aiGenerateContent(prompt),
  // Offline fallback (optional)
  async () => await getLocalContent(),
  // Fallback message
  'AI generation not available offline'
);

// Queue actions for later sync
if (isOfflineMode) {
  queueOfflineAction({
    type: 'UPDATE_CHARACTER',
    data: characterData,
    timestamp: Date.now()
  });
}
```

## Features Available Offline

### ✅ Fully Available
- Create, edit, delete characters, locations, items, factions
- Write and edit lore notes
- Manage timelines and events
- Export data (JSON format)
- Search and filter content
- Auto save functionality
- Theme and typography settings

### ⚠️ Limited Availability
- Image generation (cached images only)
- Voice transcription (no new transcriptions)
- Export to external formats (basic formats only)

### ❌ Not Available
- AI content generation
- AI image generation
- AI voice transcription
- Online sync and backup
- Cloud storage features
- Real-time collaboration

## Free AI API Keys Included

The app comes with multiple free AI API keys pre-configured:

### 🆓 Completely Free
- **Rork AI**: Free tier with GPT-4o-mini, DALL-E 3, Whisper
- **Hugging Face**: Open source models with generous limits
- **Groq**: Ultra-fast inference with free tier
- **Cohere**: Free trial with good limits
- **Together AI**: Open source models with free credits
- **Fireworks AI**: Fast inference with free tier
- **Perplexity**: Search-augmented AI with free tier
- **Mistral AI**: European AI with free tier
- **Google AI**: Gemini models with free tier
- **DeepSeek**: Chinese AI models with free access
- **Ollama**: Run AI models locally (completely free)
- **LM Studio**: Local AI inference (completely free)

### 💰 Paid Options
- **OpenAI**: GPT models (requires paid account)
- **Anthropic**: Claude models (limited free tier)
- **Replicate**: Pay-per-use with free credits

## Best Practices

### Auto Save
1. Keep auto save enabled for important work
2. Use manual save (Ctrl+S) for immediate saves
3. Monitor console logs for save status
4. Handle save errors gracefully in your components

### Offline Mode
1. Enable offline mode when working without internet
2. Sync changes when reconnecting to internet
3. Use local storage for critical data
4. Provide clear feedback about offline status

### Performance
1. Auto save uses debouncing to prevent excessive saves
2. Only changed data is saved (smart detection)
3. Offline mode reduces network requests
4. Local storage is optimized for mobile devices

## Troubleshooting

### Auto Save Issues
- Check if auto save is enabled in settings
- Verify save function is working correctly
- Check console logs for error messages
- Ensure data is serializable (no circular references)

### Offline Mode Issues
- Verify offline mode is enabled
- Check local storage permissions
- Ensure fallback functions are provided
- Monitor sync status when reconnecting

### AI API Issues
- Try different AI providers if one fails
- Check API key configuration
- Verify internet connection for online APIs
- Use local AI models (Ollama/LM Studio) as backup