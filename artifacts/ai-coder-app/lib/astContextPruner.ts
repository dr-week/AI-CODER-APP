/**
 * AST & Context Pruner
 * Extracts imports, export function signatures, interfaces, and type definitions
 * from project source files to prune token context before LLM invocation.
 */

export function pruneFileContext(fileContent: string, maxLines = 80): string {
  const lines = fileContent.split('\n');
  if (lines.length <= maxLines) return fileContent;

  const prunedLines: string[] = [];
  let inFunctionBody = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Preserve imports, exports, interfaces, types, and component definitions
    if (
      trimmed.startsWith('import ') ||
      trimmed.startsWith('export interface') ||
      trimmed.startsWith('export type') ||
      trimmed.startsWith('export const') ||
      trimmed.startsWith('export function') ||
      trimmed.startsWith('export default function')
    ) {
      prunedLines.push(line);
      inFunctionBody = true;
    } else if (trimmed.startsWith('return ') || trimmed === '}' || trimmed === '};') {
      if (inFunctionBody) {
        prunedLines.push('  // ... [implementation details pruned for token efficiency] ...');
        prunedLines.push(line);
        inFunctionBody = false;
      }
    }
  }

  return prunedLines.length > 5 ? prunedLines.join('\n') : lines.slice(0, maxLines).join('\n') + '\n// ... [remaining content pruned]';
}
