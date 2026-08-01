import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildGenerationPrompt, SYSTEM_PROMPT } from './generatePrompt';

export function useGenerate() {
  return async (description: string) => {
    const name = description.trim().split(/\s+/).slice(0, 3).join('-').replace(/[^a-zA-Z0-9-]/g, '') || 'new-project';
    const provider = (await AsyncStorage.getItem('ai-coder-provider')) ?? 'Groq';
    const key = await AsyncStorage.getItem('ai-coder-key');
    if (!key) throw new Error(`Add a ${provider} key in Settings first.`);
    const body = { model: provider === 'Groq' ? 'llama-3.1-8b-instant' : 'llama3.2', messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: buildGenerationPrompt(description, name) }], temperature: 0.2 };
    const url = provider === 'Groq' ? 'https://api.groq.com/openai/v1/chat/completions' : provider === 'Ollama' ? `${key.replace(/\/$/, '')}/api/chat` : 'https://api.openai.com/v1/chat/completions';
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(provider !== 'Ollama' ? { Authorization: `Bearer ${key}` } : {}) }, body: JSON.stringify(body) });
    if (!response.ok) throw new Error(`Generation failed (${response.status}). Check your provider settings.`);
    const data = await response.json();
    const text = provider === 'Ollama' ? data.message?.content : data.choices?.[0]?.message?.content;
    if (!text) throw new Error('The provider returned no content.');
    const parsed = JSON.parse(text.replace(/^```json\s*|\s*```$/g, '').trim());
    if (!parsed.files || typeof parsed.files !== 'object') throw new Error('The provider returned an invalid file bundle.');
    return { name, files: parsed.files as Record<string, string> };
  };
}