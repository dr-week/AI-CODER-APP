import type { GeneratedProject } from './saveProject.ts';

const MAX_FILE_BYTES = 1024 * 1024;
const SKIP = /\.(png|jpe?g|gif|webp|ico|zip|pdf|mp4|mov|woff2?|ttf)$/i;

export function parseRepo(url: string) {
  const match = url.trim().match(/github\.com\/([^/]+)\/([^/#?]+)/i);
  if (!match) throw new Error('Enter a GitHub URL like https://github.com/owner/repository.');
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

export async function importPublicGithubRepo(url: string, onProgress?: (message: string) => void): Promise<GeneratedProject & { previewUrl: string }> {
  const { owner, repo } = parseRepo(url);
  const headers = { Accept: 'application/vnd.github+json' };
  const treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`, { headers });
  if (!treeResponse.ok) throw new Error(`GitHub could not load this repository (${treeResponse.status}).`);
  const tree = await treeResponse.json();
  const files = (tree.tree ?? []).filter((item: { type: string; path: string; size?: number }) => item.type === 'blob' && (item.size ?? 0) <= MAX_FILE_BYTES && !SKIP.test(item.path)).slice(0, 80);
  if (!files.length) throw new Error('No readable source files were found in this repository.');
  const contents: Record<string, string> = {};
  for (let index = 0; index < files.length; index += 1) {
    const item = files[index];
    onProgress?.(`Importing ${index + 1} of ${files.length} files…`);
    const response = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${item.path}`);
    if (response.ok) contents[item.path] = await response.text();
  }
  return { name: repo, files: contents, previewUrl: `https://${owner}.github.io/${repo}/` };
}