import test from 'node:test';
import assert from 'node:assert/strict';
import { SYSTEM_PROMPT, buildGenerationPrompt } from '../lib/generatePrompt.ts';

test('SYSTEM_PROMPT is properly formatted JSON instruction', () => {
  assert.ok(SYSTEM_PROMPT.includes('Reply ONLY with a JSON object'));
  assert.ok(SYSTEM_PROMPT.includes('"files":{"filename":"content",...}'));
});

test('buildGenerationPrompt formats prompt and truncates long descriptions', () => {
  const shortPrompt = buildGenerationPrompt('  Create a todo app  ', 'TodoApp');
  assert.strictEqual(shortPrompt, 'Create a todo app App name: TodoApp. Files: index.tsx, package.json, README.md.');

  const longDesc = 'a'.repeat(1000);
  const longPrompt = buildGenerationPrompt(longDesc, 'BigApp');
  assert.ok(longPrompt.startsWith('a'.repeat(700)));
  assert.ok(longPrompt.includes('App name: BigApp. Files: index.tsx, package.json, README.md.'));
});
