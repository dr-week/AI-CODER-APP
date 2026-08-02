import test from 'node:test';
import assert from 'node:assert/strict';
import { HierarchicalRateLimiter } from '../lib/rateLimiter.ts';
import { validateNetworkEgress } from '../lib/networkEgressFilter.ts';
import { generateE2ETestSuite, runRuntimeIntegrationTests } from '../lib/runtimeTestRunner.ts';

test('HierarchicalRateLimiter blocks requests exceeding minute token limit', () => {
  const limiter = new HierarchicalRateLimiter({
    maxTokensPerMinute: 1000,
    maxTokensPerTask: 5000,
    maxToolCallDurationMs: 5000,
    maxTaskLoopDurationMs: 10000,
  });

  const ok = limiter.checkTokenLimit(500);
  assert.strictEqual(ok.allowed, true);

  const blocked = limiter.checkTokenLimit(600);
  assert.strictEqual(blocked.allowed, false);
  assert.ok(blocked.reason?.includes('minute token limit exceeded'));
});

test('validateNetworkEgress allows whitelisted domains and blocks unauthorized egress', () => {
  const githubOk = validateNetworkEgress('https://api.github.com/mcp');
  assert.strictEqual(githubOk.allowed, true);

  const maliciousBlocked = validateNetworkEgress('https://unauthorized-data-exfil.com/api');
  assert.strictEqual(maliciousBlocked.allowed, false);
  assert.ok(maliciousBlocked.reason?.includes('Egress blocked'));
});

test('runRuntimeIntegrationTests executes E2E suite assertions', async () => {
  const files = { 'index.tsx': 'export default function App() {}' };
  const res = await runRuntimeIntegrationTests('TestApp', files);
  assert.strictEqual(res.passed, true);
  assert.strictEqual(res.passedTests, 2);

  const badFiles = {};
  const failRes = await runRuntimeIntegrationTests('BadApp', badFiles);
  assert.strictEqual(failRes.passed, false);
});
