import test from 'node:test';
import assert from 'node:assert/strict';
import { createMRTRHeaders, executeStatelessMCPTool } from '../lib/mcpClient.ts';
import { planOrchestrationTasks, executeParallelWorkers } from '../lib/orchestratorWorker.ts';
import { evaluateCodeQuality } from '../lib/evaluatorOptimizer.ts';

test('createMRTRHeaders generates Stateless July 2026 spec headers', () => {
  const headers = createMRTRHeaders('sess-123456789', 2);
  assert.strictEqual(headers['X-MCP-Spec-Version'], '2026-07-01');
  assert.strictEqual(headers['X-MCP-Session-ID'], 'sess-123456789');
  assert.strictEqual(headers['X-MCP-Round-Trip'], '2');
});

test('executeStatelessMCPTool executes tool in stateless mode', async () => {
  const server = { id: 'fs', name: 'FS', transport: 'stateless-http' as const, endpoint: 'http://test', tools: [] };
  const res = await executeStatelessMCPTool(server, 'read_file', { path: 'README.md' });
  assert.strictEqual(res.jsonrpc, '2.0');
  assert.strictEqual(res.result.tool, 'read_file');
});

test('orchestrator worker parallelization executes workers concurrently', async () => {
  const tasks = planOrchestrationTasks('App', 'Desc');
  assert.strictEqual(tasks.length, 3);

  const synthesized = await executeParallelWorkers(tasks, async task => ({
    workerId: task.workerId,
    files: { [`${task.workerId}.ts`]: `// ${task.role}` },
  }));

  assert.ok(synthesized['w-backend.ts']);
  assert.ok(synthesized['w-state.ts']);
  assert.ok(synthesized['w-layout.ts']);
});

test('evaluateCodeQuality triggers intelligent handoff on low score after max retries', () => {
  const badFiles = { 'index.tsx': 'export default function App() {}' };
  const evalResult = evaluateCodeQuality(badFiles, 3, 3);
  assert.strictEqual(evalResult.passed, false);
  assert.strictEqual(evalResult.requiresHumanHandoff, true);
  assert.ok(evalResult.handoffPrompt?.includes('Intelligent Handoff Required'));
});
