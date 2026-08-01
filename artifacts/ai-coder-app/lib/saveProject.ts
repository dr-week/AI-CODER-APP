import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

export type GeneratedProject = { name: string; files: Record<string, string> };
export type ProjectMeta = { name: string; created: string; fileCount: number };

const root = `${FileSystem.documentDirectory ?? ''}ai-coder/projects/`;
export const PROJECTS_KEY = 'ai-coder-projects';

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/^-|-$/g, '') || 'project';
}

export async function saveProject(project: GeneratedProject) {
  const directory = `${root}${safeName(project.name)}/`;
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  await Promise.all(Object.entries(project.files).map(([file, content]) =>
    FileSystem.writeAsStringAsync(`${directory}${file.replace(/^\/+/, '')}`, content)));
  const meta: ProjectMeta = { name: project.name, created: new Date().toISOString(), fileCount: Object.keys(project.files).length };
  const existing = JSON.parse((await AsyncStorage.getItem(PROJECTS_KEY)) ?? '[]') as ProjectMeta[];
  await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify([meta, ...existing.filter(item => item.name !== meta.name)]));
  return { ...meta, directory };
}

export async function listProjectFiles(name: string) {
  return FileSystem.readDirectoryAsync(`${root}${safeName(name)}/`);
}

export async function readProjectFile(name: string, file: string) {
  return FileSystem.readAsStringAsync(`${root}${safeName(name)}/${file}`);
}