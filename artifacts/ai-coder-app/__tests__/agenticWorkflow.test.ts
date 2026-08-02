import test from 'node:test';
import assert from 'node:assert/strict';
import { discoverMCPTools } from '../lib/mcpClient.ts';
import { generateExecutableSpec, formatSpecMarkdown } from '../lib/sddCoordinator.ts';
import { compactConversationHistory } from '../lib/memoryManager.ts';

test('discoverMCPTools formats active MCP tools into payload', () => {
  const mcpPayload = discoverMCPTools();
  assert.ok(mcpPayload.includes('Local File System MCP Server'));
  assert.ok(mcpPayload.includes('PostgreSQL Database MCP Server'));
  assert.ok(mcpPayload.includes('GitHub API MCP Server'));
});

test('generateExecutableSpec builds SDD spec with scope and verifier criteria', () => {
  const spec = generateExecutableSpec('TodoApp', 'Build a todo app');
  assert.strictEqual(spec.title, 'Executable Spec: TodoApp');
  assert.ok(spec.verificationCriteria.length > 0);

  const md = formatSpecMarkdown(spec);
  assert.ok(md.includes('# Executable Spec: TodoApp'));
  assert.ok(md.includes('## 🎯 Scope Boundaries'));
});

test('compactConversationHistory compresses older messages into MEMORY.md summary', () => {
  const messages = [
    { id: '1', role: 'user' as const, content: 'First message' },
    { id: '2', role: 'assistant' as const, content: 'First response' },
    { id: '3', role: 'user' as const, content: 'Second message' },
    { id: '4', role: 'assistant' as const, content: 'Second response' },
    { id: '5', role: 'user' as const, content: 'Third message' },
    { id: '6', role: 'assistant' as const, content: 'Third response' },
  ];

  const { memorySummary, activeMessages } = compactConversationHistory(messages, 2);
  assert.strictEqual(activeMessages.length, 2);
  assert.ok(memorySummary.includes('# MEMORY.md'));
  assert.ok(memorySummary.includes('First message'));
});
