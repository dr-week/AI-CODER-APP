import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRepo, importPublicGithubRepo } from '../lib/githubImport.ts';

test('parseRepo correctly extracts owner and repo', () => {
  const result = parseRepo('https://github.com/dr-week/AI-CODER-APP.git');
  assert.deepStrictEqual(result, { owner: 'dr-week', repo: 'AI-CODER-APP' });
});

test('parseRepo handles clean URLs without .git', () => {
  const result = parseRepo('https://github.com/facebook/react');
  assert.deepStrictEqual(result, { owner: 'facebook', repo: 'react' });
});

test('parseRepo throws an error for non-GitHub URLs', () => {
  assert.throws(
    () => parseRepo('https://gitlab.com/owner/repo'),
    /Enter a GitHub URL like https:\/\/github.com\/owner\/repository/
  );
});

test('importPublicGithubRepo throws for invalid URL before making network calls', async () => {
  await assert.rejects(
    async () => importPublicGithubRepo('invalid-url'),
    /Enter a GitHub URL/
  );
});
