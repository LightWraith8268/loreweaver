import type { AISettings } from '@/types/world';
import { obfuscateApiKey } from '@/utils/security';

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  completion: string;
  model?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface ProviderConfig {
  apiKey: string;
  enabled: boolean;
  baseUrl?: string;
  models?: string[];
}

export class AIProviderService {
  private static instance: AIProviderService;
  private settings: AISettings | null = null;

  private constructor() {}

  public static getInstance(): AIProviderService {
    if (!AIProviderService.instance) {
      AIProviderService.instance = new AIProviderService();
    }
    return AIProviderService.instance;
  }

  public updateSettings(settings: AISettings) {
    this.settings = settings;
  }

  public async makeRequest(messages: AIMessage[], options?: {
    provider?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<AIResponse> {
    if (!this.settings) {
      throw new Error('AI settings not configured');
    }

    // Get enabled providers in priority order
    const enabledProviders = this.getEnabledProviders();
    
    if (enabledProviders.length === 0) {
      throw new Error('No AI providers are enabled');
    }

    // Use specified provider or fall back to first enabled provider
    const providerName = options?.provider || enabledProviders[0];
    const provider = (this.settings.providers as any)[providerName];

    if (!provider || !provider.enabled) {
      throw new Error(`Provider ${providerName} is not enabled`);
    }

    // Try the request with fallback to other providers
    for (const fallbackProvider of [providerName, ...enabledProviders.filter(p => p !== providerName)]) {
      try {
        return await this.makeProviderRequest(fallbackProvider, messages, options);
      } catch (error) {
        console.warn(`Provider ${fallbackProvider} failed, trying next:`, error);
        // Continue to next provider
      }
    }

    throw new Error('All AI providers failed');
  }

  private async makeProviderRequest(
    providerName: string, 
    messages: AIMessage[], 
    options?: any
  ): Promise<AIResponse> {
    const provider = (this.settings!.providers as any)[providerName];
    
    switch (providerName) {
      case 'rork':
        // Rork provider temporarily disabled
        throw new Error('Rork provider temporarily unavailable');
      
      case 'openai':
        return this.makeOpenAIRequest(provider, messages, options);
      
      case 'anthropic':
        return this.makeAnthropicRequest(provider, messages, options);
      
      case 'huggingface':
        return this.makeHuggingFaceRequest(provider, messages, options);
      
      case 'groq':
        return this.makeGroqRequest(provider, messages, options);
      
      case 'cohere':
        return this.makeCohereRequest(provider, messages, options);
      
      case 'google':
        return this.makeGoogleRequest(provider, messages, options);
      
      case 'mistral':
        return this.makeMistralRequest(provider, messages, options);
      
      case 'together':
        return this.makeTogetherRequest(provider, messages, options);
      
      case 'fireworks':
        return this.makeFireworksRequest(provider, messages, options);
      
      case 'replicate':
        return this.makeReplicateRequest(provider, messages, options);
      
      case 'perplexity':
        return this.makePerplexityRequest(provider, messages, options);
      
      case 'deepseek':
        return this.makeDeepSeekRequest(provider, messages, options);
      
      case 'ollama':
        return this.makeOllamaRequest(provider, messages, options);
      
      case 'lmstudio':
        return this.makeLMStudioRequest(provider, messages, options);
      
      default:
        throw new Error(`Unsupported provider: ${providerName}`);
    }
  }

  // Rork provider method removed

  private async makeOpenAIRequest(provider: ProviderConfig, messages: AIMessage[], options?: any): Promise<AIResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: options?.model || 'gpt-3.5-turbo',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API failed: ${response.status}`);
    }

    const data = await response.json();
    return { 
      completion: data.choices[0]?.message?.content || '',
      model: data.model,
      usage: data.usage
    };
  }

  private async makeAnthropicRequest(provider: ProviderConfig, messages: AIMessage[], options?: any): Promise<AIResponse> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': provider.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: options?.model || 'claude-3-haiku-20240307',
        max_tokens: options?.maxTokens || 1000,
        messages: messages.filter(m => m.role !== 'system'),
        system: messages.find(m => m.role === 'system')?.content
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API failed: ${response.status}`);
    }

    const data = await response.json();
    return { 
      completion: data.content[0]?.text || '',
      model: data.model,
      usage: data.usage
    };
  }

  private async makeHuggingFaceRequest(provider: ProviderConfig, messages: AIMessage[], options?: any): Promise<AIResponse> {
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: messages.map(m => m.content).join('\n'),
        parameters: {
          temperature: options?.temperature || 0.7,
          max_new_tokens: options?.maxTokens || 1000
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API failed: ${response.status}`);
    }

    const data = await response.json();
    return { completion: data[0]?.generated_text || '' };
  }

  private async makeGroqRequest(provider: ProviderConfig, messages: AIMessage[], options?: any): Promise<AIResponse> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: options?.model || 'mixtral-8x7b-32768',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1000
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API failed: ${response.status}`);
    }

    const data = await response.json();
    return { 
      completion: data.choices[0]?.message?.content || '',
      model: data.model,
      usage: data.usage
    };
  }

  private async makeCohereRequest(provider: ProviderConfig, messages: AIMessage[], options?: any): Promise<AIResponse> {
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    
    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: 'command',
        prompt,
        max_tokens: options?.maxTokens || 1000,
        temperature: options?.temperature || 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`Cohere API failed: ${response.status}`);
    }

    const data = await response.json();
    return { completion: data.generations[0]?.text || '' };
  }

  private async makeGoogleRequest(provider: ProviderConfig, messages: AIMessage[], options?: any): Promise<AIResponse> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${provider.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: messages.map(m => m.content).join('\n') }]
        }],
        generationConfig: {
          temperature: options?.temperature || 0.7,
          maxOutputTokens: options?.maxTokens || 1000
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Google AI API failed: ${response.status}`);
    }

    const data = await response.json();
    return { completion: data.candidates[0]?.content?.parts[0]?.text || '' };
  }

  private async makeMistralRequest(provider: ProviderConfig, messages: AIMessage[], options?: any): Promise<AIResponse> {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: options?.model || 'mistral-tiny',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1000
      }),
    });

    if (!response.ok) {
      throw new Error(`Mistral API failed: ${response.status}`);
    }

    const data = await response.json();
    return { 
      completion: data.choices[0]?.message?.content || '',
      model: data.model,
      usage: data.usage
    };
  }

  private async makeTogetherRequest(provider: ProviderConfig, messages: AIMessage[], options?: any): Promise<AIResponse> {
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: options?.model || 'togethercomputer/RedPajama-INCITE-Chat-3B-v1',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1000
      }),
    });

    if (!response.ok) {
      throw new Error(`Together API failed: ${response.status}`);
    }

    const data = await response.json();
    return { 
      completion: data.choices[0]?.message?.content || '',
      model: data.model,
      usage: data.usage
    };
  }

  private async makeFireworksRequest(provider: ProviderConfig, messages: AIMessage[], options?: any): Promise<AIResponse> {
    const response = await fetch('https://api.fireworks.ai/inference/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: options?.model || 'accounts/fireworks/models/mixtral-8x7b-instruct',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1000
      }),
    });

    if (!response.ok) {
      throw new Error(`Fireworks API failed: ${response.status}`);
    }

    const data = await response.json();
    return { 
      completion: data.choices[0]?.message?.content || '',
      model: data.model,
      usage: data.usage
    };
  }

  private async makeReplicateRequest(provider: ProviderConfig, messages: AIMessage[], options?: any): Promise<AIResponse> {
    // Replicate has a different API pattern, this is a simplified version
    const prompt = messages.map(m => m.content).join('\n');
    
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${provider.apiKey}`
      },
      body: JSON.stringify({
        version: "13c3cdee13ee059ab779f0291d29054dab00a47dad8261375654de5540165fb0",
        input: { prompt }
      }),
    });

    if (!response.ok) {
      throw new Error(`Replicate API failed: ${response.status}`);
    }

    const data = await response.json();
    return { completion: data.output?.join('') || '' };
  }

  private async makePerplexityRequest(provider: ProviderConfig, messages: AIMessage[], options?: any): Promise<AIResponse> {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: options?.model || 'llama-3.1-sonar-small-128k-online',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1000
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API failed: ${response.status}`);
    }

    const data = await response.json();
    return { 
      completion: data.choices[0]?.message?.content || '',
      model: data.model,
      usage: data.usage
    };
  }

  private async makeDeepSeekRequest(provider: ProviderConfig, messages: AIMessage[], options?: any): Promise<AIResponse> {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: options?.model || 'deepseek-chat',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1000
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API failed: ${response.status}`);
    }

    const data = await response.json();
    return { 
      completion: data.choices[0]?.message?.content || '',
      model: data.model,
      usage: data.usage
    };
  }

  private async makeOllamaRequest(provider: ProviderConfig, messages: AIMessage[], options?: any): Promise<AIResponse> {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options?.model || 'llama2',
        messages,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API failed: ${response.status}`);
    }

    const data = await response.json();
    return { completion: data.message?.content || '' };
  }

  private async makeLMStudioRequest(provider: ProviderConfig, messages: AIMessage[], options?: any): Promise<AIResponse> {
    const response = await fetch('http://localhost:1234/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options?.model || 'local-model',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1000
      }),
    });

    if (!response.ok) {
      throw new Error(`LM Studio API failed: ${response.status}`);
    }

    const data = await response.json();
    return { 
      completion: data.choices[0]?.message?.content || '',
      model: data.model,
      usage: data.usage
    };
  }

  private getEnabledProviders(): string[] {
    if (!this.settings) return [];
    
    return Object.entries(this.settings.providers)
      .filter(([_, config]) => config.enabled && config.apiKey)
      .map(([name, _]) => name)
      .sort((a, b) => {
        // Prioritize free providers
        const freePriority = ['huggingface', 'groq', 'cohere', 'google', 'mistral'];
        const aIndex = freePriority.indexOf(a);
        const bIndex = freePriority.indexOf(b);
        
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return 0;
      });
  }

  public getAvailableProviders(): Array<{ name: string; enabled: boolean; hasKey: boolean }> {
    if (!this.settings) return [];
    
    return Object.entries(this.settings.providers).map(([name, config]) => ({
      name,
      enabled: config.enabled,
      hasKey: !!config.apiKey && config.apiKey !== ''
    }));
  }
}

export const aiProviderService = AIProviderService.getInstance();