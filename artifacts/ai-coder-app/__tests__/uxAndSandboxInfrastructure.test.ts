import test from 'node:test';
import assert from 'node:assert/strict';
import { annotateSourceWithCanvasAttributes, buildVisualEditPrompt } from '../lib/visualCanvas.ts';
import { initializeSandboxRuntime, updateSandboxFile } from '../lib/sandboxRuntime.ts';
import { deployToVercelCloud } from '../lib/cloudDeploy.ts';

test('annotateSourceWithCanvasAttributes adds data-source attributes to JSX tags', () => {
  const code = `export function App() {\n  return <div><h1>Hello</h1></div>;\n}`;
  const annotated = annotateSourceWithCanvasAttributes('src/App.tsx', code);
  assert.ok(annotated.includes('data-source-file="src/App.tsx"'));
  assert.ok(annotated.includes('data-source-line="2"'));
});

test('buildVisualEditPrompt formats visual element prompt targeting diffPatcher', () => {
  const prompt = buildVisualEditPrompt({ elementTag: 'h1', sourceFile: 'src/App.tsx', sourceLine: 5 }, 'Change text to Welcome');
  assert.ok(prompt.includes('Visual Edit Target: File "src/App.tsx" at line 5 (<h1>)'));
  assert.ok(prompt.includes('Change text to Welcome'));
});

test('initializeSandboxRuntime mounts in-browser sandbox dev server', () => {
  const sandbox = initializeSandboxRuntime('MyProj', { 'index.tsx': 'code' });
  assert.strictEqual(sandbox.mounted, true);
  assert.strictEqual(sandbox.status, 'running');
  assert.ok(sandbox.devUrl.includes('velocity.sandbox.app'));

  const updated = updateSandboxFile(sandbox, 'index.tsx', 'new code');
  assert.strictEqual(updated.hmrConnected, true);
});

test('deployToVercelCloud returns production deploy URL and Supabase environment variables', async () => {
  const result = await deployToVercelCloud('MyAwesomeApp', { 'index.tsx': 'code' });
  assert.strictEqual(result.success, true);
  assert.ok(result.deployUrl.includes('myawesomeapp.vercel.app'));
  assert.ok(result.environmentVariables.NEXT_PUBLIC_SUPABASE_URL.includes('supabase.co'));
});
