import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import {
  safeName,
  formatProjectMeta,
  PROJECTS_KEY,
  PREVIEW_URLS_KEY,
  GeneratedProject,
  ProjectMeta,
} from './projectUtils';

export * from './projectUtils';

import { detectPlatformRuntime } from './platformEnv';

const isWeb = Platform.OS === 'web';
const platformEnv = detectPlatformRuntime();
const root = `${FileSystem.documentDirectory ?? ''}ai-coder/projects/`;

const FILE_STORAGE_KEY_PREFIX = 'ai-coder-files-';

export async function saveProject(project: GeneratedProject) {
  const slug = safeName(project.name);
  const meta: ProjectMeta = {
    name: project.name,
    created: new Date().toISOString(),
    fileCount: Object.keys(project.files).length,
  };

  if (isWeb) {
    // Web: Save files directly to AsyncStorage
    await AsyncStorage.setItem(
      `${FILE_STORAGE_KEY_PREFIX}${slug}`,
      JSON.stringify(project.files)
    );
  } else {
    // Native (iOS/Android): Use FileSystem
    try {
      const directory = `${root}${slug}/`;
      await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      await Promise.all(
        Object.entries(project.files).map(async ([file, content]) => {
          const relativePath = file.replace(/^\/+/, '');
          const parts = relativePath.split('/');
          parts.pop();
          if (parts.length) {
            await FileSystem.makeDirectoryAsync(`${directory}${parts.join('/')}/`, {
              intermediates: true,
            });
          }
          await FileSystem.writeAsStringAsync(`${directory}${relativePath}`, content);
        })
      );
    } catch (err) {
      // Fallback to AsyncStorage if FileSystem is unavailable
      await AsyncStorage.setItem(
        `${FILE_STORAGE_KEY_PREFIX}${slug}`,
        JSON.stringify(project.files)
      );
    }
  }

  // Update project metadata list
  const existing = JSON.parse(
    (await AsyncStorage.getItem(PROJECTS_KEY)) ?? '[]'
  ) as ProjectMeta[];
  await AsyncStorage.setItem(
    PROJECTS_KEY,
    JSON.stringify([meta, ...existing.filter(item => item.name !== meta.name)])
  );

  return { ...meta, directory: `${root}${slug}/` };
}

export async function listProjectFiles(name: string): Promise<string[]> {
  const slug = safeName(name);
  if (isWeb) {
    const raw = await AsyncStorage.getItem(`${FILE_STORAGE_KEY_PREFIX}${slug}`);
    if (raw) {
      const filesMap = JSON.parse(raw) as Record<string, string>;
      return Object.keys(filesMap);
    }
    return [];
  }
  try {
    return await FileSystem.readDirectoryAsync(`${root}${slug}/`);
  } catch {
    const raw = await AsyncStorage.getItem(`${FILE_STORAGE_KEY_PREFIX}${slug}`);
    if (raw) {
      const filesMap = JSON.parse(raw) as Record<string, string>;
      return Object.keys(filesMap);
    }
    return [];
  }
}

export async function readProjectFile(name: string, file: string): Promise<string> {
  const slug = safeName(name);
  if (isWeb) {
    const raw = await AsyncStorage.getItem(`${FILE_STORAGE_KEY_PREFIX}${slug}`);
    if (raw) {
      const filesMap = JSON.parse(raw) as Record<string, string>;
      return filesMap[file] ?? '';
    }
    return '';
  }
  try {
    return await FileSystem.readAsStringAsync(`${root}${slug}/${file}`);
  } catch {
    const raw = await AsyncStorage.getItem(`${FILE_STORAGE_KEY_PREFIX}${slug}`);
    if (raw) {
      const filesMap = JSON.parse(raw) as Record<string, string>;
      return filesMap[file] ?? '';
    }
    return '';
  }
}

export async function setPreviewUrl(name: string, url: string) {
  const values = JSON.parse(
    (await AsyncStorage.getItem(PREVIEW_URLS_KEY)) ?? '{}'
  ) as Record<string, string>;
  if (url.trim()) values[name] = url.trim();
  else delete values[name];
  await AsyncStorage.setItem(PREVIEW_URLS_KEY, JSON.stringify(values));
}

export async function getPreviewUrl(name: string) {
  const values = JSON.parse(
    (await AsyncStorage.getItem(PREVIEW_URLS_KEY)) ?? '{}'
  ) as Record<string, string>;
  return values[name] ?? '';
}