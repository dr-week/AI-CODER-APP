import test from 'node:test';
import assert from 'node:assert/strict';
import { getRouteSkills, buildRoutedSkillsPrompt } from '../lib/skillsRouter.ts';
import { applyDiffPatch, parseDiffBlocks } from '../lib/diffPatcher.ts';
import { pruneFileContext } from '../lib/astContextPruner.ts';

test('getRouteSkills routes backend & git skills based on prompt keywords', () => {
  const backendSkills = getRouteSkills('Build a database app with Supabase auth');
  assert.ok(backendSkills.some(s => s.id === 'bfa'));

  const gitSkills = getRouteSkills('Deploy project to Vercel and GitHub');
  assert.ok(gitSkills.some(s => s.id === 'git'));
});

test('applyDiffPatch applies search and replace blocks accurately', () => {
  const original = `const count = 1;\nconsole.log(count);`;
  const diff = `<<<< SEARCH\nconst count = 1;\n====\nconst count = 42;\n>>>>`;
  const patched = applyDiffPatch(original, diff);
  assert.strictEqual(patched, `const count = 42;\nconsole.log(count);`);
});

test('pruneFileContext prunes large implementation details while keeping exports', () => {
  const code = `import React from 'react';\nexport function App() {\n  const x = 1;\n  const y = 2;\n  return <div>App</div>;\n}\n`;
  const pruned = pruneFileContext(code, 3);
  assert.ok(pruned.includes('export function App'));
});
