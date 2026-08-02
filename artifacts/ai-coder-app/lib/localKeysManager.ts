import AsyncStorage from '@react-native-async-storage/async-storage';
import { SECRET_KEYS } from './localKeys.secrets';

export const LOCAL_KEYS = {
  Groq: SECRET_KEYS.GROQ_API_KEY,
  Gemini: SECRET_KEYS.GEMINI_API_KEY,
  OpenRouter: SECRET_KEYS.OPENROUTER_API_KEY,
  OpenAI: '',
  Anthropic: '',
  Ollama: '',
};

export const DEFAULT_PROVIDER = SECRET_KEYS.DEFAULT_PROVIDER;

/**
 * Auto-applies default keys to AsyncStorage if not already stored by the user.
 */
export async function initializeLocalKeys() {
  try {
    const existingKey = await AsyncStorage.getItem('ai-coder-key');
    const existingProvider = await AsyncStorage.getItem('ai-coder-provider');

    if (!existingKey) {
      await AsyncStorage.setItem('ai-coder-key', LOCAL_KEYS.Groq);
    }
    if (!existingProvider) {
      await AsyncStorage.setItem('ai-coder-provider', DEFAULT_PROVIDER);
    }

    // Save individual keys for all provided providers
    await AsyncStorage.setItem('ai-coder-key-Groq', LOCAL_KEYS.Groq);
    await AsyncStorage.setItem('ai-coder-key-Gemini', LOCAL_KEYS.Gemini);
    await AsyncStorage.setItem('ai-coder-key-OpenRouter', LOCAL_KEYS.OpenRouter);
  } catch (err) {
    console.warn('Failed to auto-apply local keys:', err);
  }
}
