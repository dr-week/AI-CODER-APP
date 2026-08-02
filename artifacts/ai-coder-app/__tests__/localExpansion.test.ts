import test from 'node:test';
import assert from 'node:assert/strict';
import { formatOllamaLocalRequest } from '../lib/ollamaAdapter.ts';
import { getThemePack } from '../lib/themeRegistry.ts';

test('formatOllamaLocalRequest formats zero-cost local LLM request', () => {
  const req = formatOllamaLocalRequest('Build a Vue dashboard', 'You are an AI builder', 'qwen2.5-coder:7b');
  assert.strictEqual(req.url, 'http://localhost:11434/api/chat');
  assert.strictEqual(req.body.model, 'qwen2.5-coder:7b');
  assert.strictEqual(req.body.messages.length, 2);
});

test('getThemePack loads Vue 3 + Pinia + Tailwind theme pack correctly', () => {
  const vuePack = getThemePack('vue-pinia-tailwind');
  assert.strictEqual(vuePack.name, 'Vue 3 + Pinia + Tailwind Pack');
  assert.ok(vuePack.components.some(c => c.key === 'VueHeaderNav'));
});
