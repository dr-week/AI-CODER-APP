import test from 'node:test';
import assert from 'node:assert/strict';
import { detectPlatformRuntime, tetherMobileOllama } from '../lib/platformEnv.ts';

test('detectPlatformRuntime returns valid platform configuration', () => {
  const config = detectPlatformRuntime();
  assert.ok(['desktop', 'android', 'web'].includes(config.mode));
  assert.ok(typeof config.isTouch === 'boolean');
  assert.ok(config.defaultOllamaEndpoint.includes('11434'));
});

test('tetherMobileOllama handles LAN IP reachability and failover', async () => {
  const result = await tetherMobileOllama('192.168.1.100');
  assert.ok(typeof result.reachable === 'boolean');
  assert.ok(result.fallbackProvider === 'Groq' || result.fallbackProvider === 'Ollama-LAN');
});
