/**
 * Delta Encoding & Search/Replace Block Patcher
 * Allows editing large project files using targeted search/replace blocks,
 * cutting token consumption by avoiding full-file rewrites.
 */

export interface DiffBlock {
  search: string;
  replace: string;
}

/**
 * Parses search/replace diff blocks from AI output.
 * Format:
 * <<<< SEARCH
 * original line 1
 * original line 2
 * ====
 * replacement line 1
 * replacement line 2
 * >>>>
 */
export function parseDiffBlocks(diffText: string): DiffBlock[] {
  const blocks: DiffBlock[] = [];
  const regex = /<<<<\s*SEARCH\r?\n([\s\S]*?)\r?\n====\r?\n([\s\S]*?)\r?\n>>>>/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(diffText)) !== null) {
    blocks.push({
      search: match[1],
      replace: match[2],
    });
  }

  return blocks;
}

/**
 * Applies search/replace diff blocks to original file content.
 */
export function applyDiffPatch(originalContent: string, diffText: string): string {
  const blocks = parseDiffBlocks(diffText);
  if (!blocks.length) return originalContent;

  let patched = originalContent;
  for (const block of blocks) {
    if (patched.includes(block.search)) {
      patched = patched.replace(block.search, block.replace);
    }
  }

  return patched;
}
