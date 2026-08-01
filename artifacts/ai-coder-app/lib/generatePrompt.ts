export const SYSTEM_PROMPT =
  'Reply ONLY with a JSON object: {"files":{"filename":"content",...}}. No prose.';

export function buildGenerationPrompt(description: string, name: string) {
  return `${description.trim().slice(0, 700)} App name: ${name}. Files: index.tsx, package.json, README.md.`;
}