import test from 'node:test';
import assert from 'node:assert/strict';
import { safeName, formatProjectMeta, PROJECTS_KEY, PREVIEW_URLS_KEY } from '../lib/projectUtils.ts';

test('safeName converts strings to URL-friendly slugs', () => {
  assert.strictEqual(safeName('My Cool App!'), 'my-cool-app');
  assert.strictEqual(safeName('  ---Special @#$ Name--- '), 'special-name');
  assert.strictEqual(safeName('---'), 'project');
  assert.strictEqual(safeName(''), 'project');
});

test('formatProjectMeta creates correct project metadata', () => {
  const meta = formatProjectMeta({
    name: 'Sample App',
    files: { 'index.tsx': 'console.log("hello")', 'package.json': '{}' },
  });
  assert.strictEqual(meta.name, 'Sample App');
  assert.strictEqual(meta.fileCount, 2);
  assert.ok(!isNaN(Date.parse(meta.created)));
});

test('storage keys are defined constants', () => {
  assert.strictEqual(PROJECTS_KEY, 'ai-coder-projects');
  assert.strictEqual(PREVIEW_URLS_KEY, 'ai-coder-preview-urls');
});
