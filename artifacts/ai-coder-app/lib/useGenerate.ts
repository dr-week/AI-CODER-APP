import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildGenerationPrompt, SYSTEM_PROMPT } from './generatePrompt';
import { LOCAL_KEYS } from './localKeysManager';
import { scaffoldGitHubRepoFiles } from './githubTemplates';
import { injectThemeComponentFiles } from './themeRegistry';
import { generateExecutableSpec, formatSpecMarkdown } from './sddCoordinator';

export function useGenerate() {
  return async (description: string, targetDirectory = 'src/app') => {
    const name =
      description.trim().split(/\s+/).slice(0, 3).join('-').replace(/[^a-zA-Z0-9-]/g, '') ||
      'new-project';
    const provider = (await AsyncStorage.getItem('ai-coder-provider')) ?? 'Groq';
    let key = await AsyncStorage.getItem('ai-coder-key');

    // Fallback to local keys if empty
    if (!key && provider in LOCAL_KEYS) {
      key = LOCAL_KEYS[provider as keyof typeof LOCAL_KEYS];
    }

    if (!key) throw new Error(`Add a ${provider} key in Settings first.`);

    let model = 'llama-3.1-8b-instant';
    let url = 'https://api.groq.com/openai/v1/chat/completions';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    if (provider === 'Groq') {
      model = 'llama-3.1-8b-instant';
      url = 'https://api.groq.com/openai/v1/chat/completions';
      headers.Authorization = `Bearer ${key}`;
    } else if (provider === 'Gemini') {
      model = 'gemini-1.5-flash';
      url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    } else if (provider === 'OpenRouter') {
      model = 'meta-llama/llama-3.1-8b-instruct:free';
      url = 'https://openrouter.ai/api/v1/chat/completions';
      headers.Authorization = `Bearer ${key}`;
    } else if (provider === 'Ollama') {
      model = 'llama3.2';
      url = `${key.replace(/\/$/, '')}/api/chat`;
    } else {
      model = 'gpt-4o-mini';
      url = 'https://api.openai.com/v1/chat/completions';
      headers.Authorization = `Bearer ${key}`;
    }

    // ── Self-Healing Refactoring Loop (Auto-Correction) ──
    let attempts = 0;
    const maxAttempts = 3;
    let lastError = '';
    let currentPrompt = buildGenerationPrompt(description, name);

    while (attempts < maxAttempts) {
      attempts++;
      try {
        let response: Response;
        if (provider === 'Gemini') {
          const body = {
            contents: [
              {
                parts: [
                  { text: SYSTEM_PROMPT },
                  { text: currentPrompt + (lastError ? `\nFIX THIS ERROR LOG: ${lastError}` : '') },
                ],
              },
            ],
          };
          response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
        } else {
          const body = {
            model,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              {
                role: 'user',
                content: currentPrompt + (lastError ? `\nFIX THIS ERROR LOG: ${lastError}` : ''),
              },
            ],
            temperature: 0.2,
          };
          response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
        }

        if (!response.ok) {
          throw new Error(`Generation failed (${response.status}). Check your ${provider} key/settings.`);
        }

        const data = await response.json();
        let text = '';

        if (provider === 'Gemini') {
          text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        } else if (provider === 'Ollama') {
          text = data.message?.content;
        } else {
          text = data.choices?.[0]?.message?.content;
        }

        if (!text) throw new Error('The provider returned no content.');

        const cleaned = text.replace(/^```json\s*|\s*```$/g, '').trim();
        const parsed = JSON.parse(cleaned);

        if (!parsed.files || typeof parsed.files !== 'object') {
          throw new Error('Invalid JSON format: missing "files" map object.');
        }

        const files = parsed.files as Record<string, string>;

        // ── Spec-Driven Development (SDD) & SPEC.md Scaffolding ──
        const spec = generateExecutableSpec(name, description);
        if (!files['SPEC.md']) {
          files['SPEC.md'] = formatSpecMarkdown(spec);
        }

        // ── Automated Backend & Deployment Auto-Provisioning ──
        if (!files['lib/supabase.ts'] && !files['lib/db.ts']) {
          files['lib/supabase.ts'] = `import { createClient } from '@supabase/supabase-js';\n\nconst supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';\nconst supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';\n\nexport const supabase = createClient(supabaseUrl, supabaseAnonKey);\n`;
          files['schema.sql'] = `-- Auto-provisioned Database Schema\nCREATE TABLE IF NOT EXISTS items (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  title TEXT NOT NULL,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);\n`;
        }

        // ── Automated Theme Pack Components Auto-Injection ──
        const activeThemePack = (await AsyncStorage.getItem('ai-coder-theme-pack')) || 'glassmorphism-dark';
        injectThemeComponentFiles(files, activeThemePack);

        // ── Automated GitHub Repository Templates Scaffolding ──
        const ghFiles = scaffoldGitHubRepoFiles(name, description);
        for (const [path, content] of Object.entries(ghFiles)) {
          if (!files[path]) {
            files[path] = content;
          }
        }

        return { name, files };
      } catch (e) {
        lastError = e instanceof Error ? e.message : 'Unknown generation error';
        if (attempts >= maxAttempts) {
          throw new Error(`Self-healing loop reached max retries (${maxAttempts}). Last error: ${lastError}`);
        }
      }
    }

    throw new Error('Self-healing agent failed to produce valid code.');
  };
}