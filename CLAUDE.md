# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LoreWeaver is a comprehensive React Native/Expo worldbuilding application for writers, game masters, and creators. It combines powerful organizational tools with AI assistance to help create rich, detailed fictional worlds.

## Development Commands

### Building and Development
```bash
# Start development server
npm run start
# or with specific port
bunx rork start -p 30y02utmvl8n9rx3krk3d --tunnel

# Start web version
npm run start-web

# Start web with debug output
npm run start-web-dev

# Lint code
npm run lint
# or
expo lint
```

### TypeScript Commands
```bash
# Type check (no dedicated script, use expo/metro built-in)
npx tsc --noEmit

# Build for production
expo build
```

## Architecture Overview

### Project Structure
- `loreweaver/app/` - Main application screens using Expo Router
- `loreweaver/components/` - Reusable UI components
- `loreweaver/hooks/` - Custom React hooks for state management
- `loreweaver/utils/` - Utility functions (export, crash logging, novel extraction)
- `loreweaver/types/` - TypeScript type definitions
- `loreweaver/constants/` - App constants and themes

### Key Architecture Patterns

**State Management**: Uses React Query for server state and React Context for app state. The main contexts are:
- `WorldContext` - Manages world data and CRUD operations
- `SettingsContext` - App settings and preferences
- `AIContext` - AI provider configuration and requests

**Navigation**: Uses Expo Router with tab-based navigation. Main tabs include Characters, Locations, Factions, Items, Magic, Mythology, Lore, Timeline, and Tools.

**Data Storage**: All data is stored locally using AsyncStorage. No cloud storage - complete offline functionality.

**AI Integration**: Supports multiple AI providers (OpenAI, Anthropic, Rork, Hugging Face, etc.) through a unified interface.

## Critical Development Notes

### Known Issues to Address First
1. **Hook Rules Violations** in `hooks/world-context.tsx:472-514` - Hooks called inside async functions
2. **Memory Leaks** in `hooks/responsive-layout.tsx:26-32` - Dimension listener cleanup issues  
3. **Security Risk** - API keys stored in plain text in settings context
4. **Performance Issues** - Large AsyncStorage operations block UI

### Mobile-Specific Considerations
- App is optimized for cross-platform (iOS, Android, Web)
- Uses responsive design with orientation change handling
- **All AI features require internet connection** - Core worldbuilding functionality works offline
- Large datasets stored locally may impact performance

### TypeScript Configuration
- Strict mode enabled
- Path aliases: `@/*` maps to root directory
- Extends Expo's base TypeScript configuration

### Testing and Quality
- ESLint configured with Expo rules
- No dedicated test framework currently configured
- Error boundaries implemented for crash protection
- Comprehensive crash logging system

## Common Development Tasks

### Adding New Worldbuilding Entities
1. Define types in `types/world.ts`
2. Add CRUD operations in `hooks/world-context.tsx`
3. Create edit screen in `app/[entity]-edit.tsx`
4. Add to main navigation in `app/(tabs)/[category].tsx`

### AI Feature Integration
1. Add provider to `hooks/ai-context.tsx`
2. Implement request handling with proper error management and internet connectivity checks
3. Test with multiple AI providers for fallback behavior
4. **Ensure all AI features check internet connection first** using `requireInternetConnection()`

### Export System Updates
1. Modify export functions in `utils/export.ts`
2. Handle large dataset serialization carefully
3. Test with various world sizes

## Development Best Practices

### Performance
- Use React Query for data fetching and caching
- Implement proper loading states for AsyncStorage operations
- Avoid large object serialization in main thread
- Use FlatList for large datasets

### Error Handling
- Always wrap AsyncStorage operations in try-catch
- Use ErrorBoundary components for crash protection
- Implement proper fallback UI states
- Log errors using the crash logging system

### Mobile Optimization
- Test on multiple screen sizes and orientations
- Ensure minimum 44pt touch target sizes
- Add proper accessibility labels
- Handle platform-specific behaviors (iOS/Android/Web)

### Security
- **API Key Management**: Uses multi-layer obfuscation system in `utils/key-obfuscator.ts`
  - XOR encryption with rotating keys
  - Base64 encoding with checksums  
  - Caesar cipher for additional layer
  - Automatic key rotation every 15 minutes
- **Secure Key Storage**: `utils/secure-key-manager.ts` provides enterprise-grade key management
- **Free Provider Keys**: Pre-configured demo keys for 15+ AI providers with free tiers
- Never commit real production API keys to repository
- Use secure storage for sensitive user data
- Validate all user inputs before processing
- Sanitize exported data

## AI Providers Configuration

The app includes pre-configured access to 15+ AI providers with obfuscated demo keys:

### Free Tier Providers (Active)
- **Rork AI**: Your platform's free tier with GPT-4o-mini access
- **Hugging Face**: 15k tokens/month free (Inference API)
- **Groq**: 14k tokens/day free (Ultra-fast inference)
- **Google AI**: 60 queries/minute free (Gemini models)
- **Mistral AI**: 1M tokens/month free (Mistral-7B)
- **Cohere**: 100 API calls/month free
- **Together AI**: $25/month free credits
- **Fireworks AI**: 40k tokens/day free
- **DeepSeek**: 10k tokens/day free
- **Perplexity**: 5 queries/4 hours free

### Local Providers (Unlimited)
- **Ollama**: Local AI models (http://localhost:11434)
- **LM Studio**: Local inference server (http://localhost:1234)
- **Text Generation WebUI**: Oobabooga server (http://localhost:5000)
- **KoboldCpp**: Local AI server (http://localhost:5001)

### Premium Providers (Require User Keys)
- **OpenAI**: GPT models (paid only)
- **Anthropic**: Claude models (limited free tier)
- **Replicate**: Pay-per-use with free credits

### Key Security Features
- Multi-layer obfuscation (XOR + Caesar + Base64)
- Automatic key rotation every 15 minutes
- Checksum validation
- Support for key variants
- Local keys remain unobfuscated

## Key Dependencies

- **expo**: ~53.0.4 - Development platform
- **react**: 19.0.0 - UI library
- **react-native**: 0.79.1 - Mobile framework
- **@tanstack/react-query**: ^5.83.0 - Data fetching/caching
- **zustand**: ^5.0.2 - State management
- **nativewind**: ^4.1.23 - Styling
- **expo-router**: ~5.0.3 - Navigation

## Running Quality Checks

Before committing changes, run these commands:
```bash
# Check for TypeScript errors
npx tsc --noEmit

# Lint code
npm run lint

# Test build process
expo export

# Check bundle size
npx expo install --fix
```