export type GeneratedProject = { name: string; files: Record<string, string> };
export type ProjectMeta = { name: string; created: string; fileCount: number };

export const PROJECTS_KEY = 'ai-coder-projects';
export const PREVIEW_URLS_KEY = 'ai-coder-preview-urls';

export function safeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/^-+|-+$/g, '') || 'project';
}

export function formatProjectMeta(project: GeneratedProject): ProjectMeta {
  return {
    name: project.name,
    created: new Date().toISOString(),
    fileCount: Object.keys(project.files).length,
  };
}
