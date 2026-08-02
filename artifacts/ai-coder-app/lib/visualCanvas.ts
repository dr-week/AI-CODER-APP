/**
 * Bi-Directional Visual Canvas Engine (Click-to-Edit UI)
 * Maps live preview DOM elements back to exact source code lines using AST annotations,
 * allowing instant element selection and targeted diff patching.
 */

export interface CanvasElementTarget {
  elementTag: string;
  sourceFile: string;
  sourceLine: number;
  currentText?: string;
}

/**
 * Annotates JSX / HTML source code with data-source-file and data-source-line attributes.
 */
export function annotateSourceWithCanvasAttributes(filePath: string, codeContent: string): string {
  const lines = codeContent.split('\n');
  return lines.map((line, idx) => {
    const lineNo = idx + 1;
    // Annotate JSX tags like <div, <button, <h1, <section, <p
    return line.replace(/<(div|button|h1|h2|h3|p|section|span|header|footer|nav|form|input|a)(\s|>)/g, `<$1 data-source-file="${filePath}" data-source-line="${lineNo}"$2`);
  }).join('\n');
}

/**
 * Generates a targeted visual edit prompt for diffPatcher.ts when a visual canvas element is clicked.
 */
export function buildVisualEditPrompt(target: CanvasElementTarget, userEditInstruction: string): string {
  return `Visual Edit Target: File "${target.sourceFile}" at line ${target.sourceLine} (<${target.elementTag}>).\nInstruction: ${userEditInstruction}\nGenerate a <<<< SEARCH ... ==== REPLACE ... >>>> diff block targeting line ${target.sourceLine}.`;
}
