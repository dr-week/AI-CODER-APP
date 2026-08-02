/**
 * Spec-Driven Development (SDD) & Multi-Agent Coordinator Engine
 * Enforces strict Coordinator -> Implementor -> Verifier multi-agent pipeline.
 */

export interface ExecutableSpec {
  title: string;
  scopeBoundaries: string[];
  constraints: string[];
  verificationCriteria: string[];
}

export function generateExecutableSpec(projectName: string, promptText: string): ExecutableSpec {
  return {
    title: `Executable Spec: ${projectName}`,
    scopeBoundaries: [
      'Must implement clean React / Next.js / TypeScript structure.',
      'Must isolate state management and backend database access.',
      'Must use responsive theme tokens without broken layouts.',
    ],
    constraints: [
      'No raw 500-line CSS files (Use Theme Pack component blocks).',
      'No unverified external npm imports.',
      'Must pass TypeScript strict mode typechecking.',
    ],
    verificationCriteria: [
      'Verification 1: index.tsx exports valid React component without syntax errors.',
      'Verification 2: lib/supabase.ts client initializes without runtime crashes.',
      'Verification 3: vercel.json and .github/workflows/ci.yml exist in project bundle.',
    ],
  };
}

export function formatSpecMarkdown(spec: ExecutableSpec): string {
  return `# ${spec.title}

## 🎯 Scope Boundaries
${spec.scopeBoundaries.map(s => `- ${s}`).join('\n')}

## 🛑 Architectural Constraints
${spec.constraints.map(c => `- ${c}`).join('\n')}

## 🧪 Verifier Criteria
${spec.verificationCriteria.map(v => `- ${v}`).join('\n')}
`;
}
