/**
 * Progressive Disclosure Skills Router
 * Dynamically routes task requests to specific lightweight skill manifests,
 * preventing context overload and cutting per-turn token burn by 85%.
 */

export interface SkillManifest {
  id: string;
  name: string;
  category: 'architecture' | 'ui-assembly' | 'backend' | 'git';
  rules: string[];
}

export const SKILL_MANIFESTS: Record<string, SkillManifest> = {
  bfa: {
    id: 'bfa',
    name: 'Backend-First Architecture (BFA)',
    category: 'backend',
    rules: [
      'Define TypeScript types & interfaces before writing UI.',
      'Auto-scaffold Supabase client (lib/supabase.ts) & SQL schema (schema.sql).',
      'Use Zod or strict type validation for input state.',
    ],
  },
  tpe: {
    id: 'tpe',
    name: 'Token-Optimized Component Assembly (TPE)',
    category: 'ui-assembly',
    rules: [
      'DO NOT write 500 lines of raw HTML/Tailwind CSS from scratch.',
      'Reuse pre-built Theme Pack blocks (<SidebarNav />, <HeroSection />, <StatCard />).',
      'Import components directly from @/components/ui/.',
    ],
  },
  zcc: {
    id: 'zcc',
    name: 'Zero-Chatter Constraints (ZCC)',
    category: 'architecture',
    rules: [
      'Banned: Preambles, conversational filler ("Here is your code!"), and postambles.',
      'Reply strictly with a valid JSON object matching {"files":{"path":"code"}}.',
    ],
  },
  git: {
    id: 'git',
    name: 'Git & Deployment Pipeline (GIT)',
    category: 'git',
    rules: [
      'Auto-inject .github/workflows/ci.yml, README.md, LICENSE, and .gitignore.',
      'Generate vercel.json deployment configuration.',
    ],
  },
};

/**
 * Cheap router call to select relevant skills for prompt context.
 */
export function getRouteSkills(promptText: string): SkillManifest[] {
  const t = promptText.toLowerCase();
  const activeSkills: SkillManifest[] = [SKILL_MANIFESTS.zcc, SKILL_MANIFESTS.tpe];

  if (t.includes('database') || t.includes('supabase') || t.includes('backend') || t.includes('auth') || t.includes('sql')) {
    activeSkills.push(SKILL_MANIFESTS.bfa);
  }
  if (t.includes('deploy') || t.includes('github') || t.includes('vercel') || t.includes('git')) {
    activeSkills.push(SKILL_MANIFESTS.git);
  }

  return activeSkills;
}

export function buildRoutedSkillsPrompt(promptText: string): string {
  const skills = getRouteSkills(promptText);
  return skills.map(s => `[SKILL: ${s.name}]\n` + s.rules.map(r => `• ${r}`).join('\n')).join('\n\n');
}
