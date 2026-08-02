/**
 * Evaluator-Optimizer & Intelligent Human-in-the-Loop Handoff Engine
 * Scores code against verification criteria and hands off to human developer
 * when architectural flaws exceed automated refactoring capabilities.
 */

export interface EvaluationResult {
  score: number; // 0 - 100
  passed: boolean;
  issues: string[];
  requiresHumanHandoff: boolean;
  handoffPrompt?: string;
}

/**
 * Evaluates generated files against architectural specifications and verification criteria.
 */
export function evaluateCodeQuality(
  files: Record<string, string>,
  attemptCount: number,
  maxAttempts = 3
): EvaluationResult {
  const issues: string[] = [];
  let score = 100;

  if (!files['index.tsx'] && !files['App.tsx']) {
    issues.push('Missing main entry file (index.tsx or App.tsx).');
    score -= 40;
  }

  if (!files['package.json']) {
    issues.push('Missing package.json file.');
    score -= 20;
  }

  const indexContent = files['index.tsx'] || files['App.tsx'] || '';
  if (indexContent.length < 50) {
    issues.push('Main component code is under minimum viable length.');
    score -= 30;
  }

  const passed = score >= 80 && issues.length === 0;
  const requiresHumanHandoff = !passed && attemptCount >= maxAttempts;

  let handoffPrompt: string | undefined;
  if (requiresHumanHandoff) {
    handoffPrompt = `🤖 Intelligent Handoff Required:\nAutomated self-healing reached max retries (${maxAttempts}) with score ${score}/100.\nIssues detected:\n${issues.map(i => `- ${i}`).join('\n')}\n\nDeveloper Action Needed: Please review the architectural schema or clarify project constraints.`;
  }

  return {
    score,
    passed,
    issues,
    requiresHumanHandoff,
    handoffPrompt,
  };
}
