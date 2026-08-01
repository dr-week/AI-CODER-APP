import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { listProjectFiles, readProjectFile } from '@/lib/saveProject';

const exampleFiles: Record<string, string> = {
  'index.tsx': `export default function App() {\n  return <main><h1>Habit Garden</h1></main>;\n}`,
  'package.json': `{\n  "name": "habit-garden",\n  "private": true\n}`,
  'README.md': '# Habit Garden\n\nA calm place to grow small daily habits.',
};

export default function EditorScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ project?: string }>();
  const projectName = String(params.project ?? 'Habit Garden');
  const [files, setFiles] = useState<string[]>(Object.keys(exampleFiles));
  const [selected, setSelected] = useState('index.tsx');
  const [content, setContent] = useState(exampleFiles['index.tsx']);
  const [tab, setTab] = useState<'code' | 'preview'>('code');
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!params.project) return;
    listProjectFiles(projectName).then(items => {
      setFiles(items);
      if (items[0]) setSelected(items[0]);
    }).catch(() => setFiles([]));
  }, [params.project, projectName]);

  useEffect(() => {
    if (!params.project) {
      setContent(exampleFiles[selected] ?? '');
      return;
    }
    readProjectFile(projectName, selected).then(setContent).catch(() => setContent('Unable to read this file.'));
  }, [params.project, projectName, selected]);

  const run = () => { setRunning(true); setTimeout(() => setRunning(false), 1300); };
  return <View style={[styles.screen, { backgroundColor: colors.background }]}>
    <View style={styles.top}><Pressable onPress={() => router.back()}><Feather name="arrow-left" size={22} color={colors.foreground} /></Pressable><View style={{ flex: 1, marginLeft: 14 }}><Text style={[styles.project, { color: colors.foreground }]}>{projectName}</Text><Text style={{ color: colors.mutedForeground, fontSize: 11 }}>{files.length} files</Text></View><Pressable onPress={run} style={[styles.run, { backgroundColor: colors.primary }]}><Feather name={running ? 'loader' : 'play'} size={14} color={colors.primaryForeground} /><Text style={{ color: colors.primaryForeground, fontWeight: '700', fontSize: 12 }}>{running ? 'Running' : 'Run'}</Text></Pressable></View>
    <View style={[styles.tabs, { borderBottomColor: colors.border }]}><Pressable onPress={() => setTab('code')} style={[styles.tab, tab === 'code' && { borderBottomColor: colors.primary }]}><Feather name="code" color={tab === 'code' ? colors.primary : colors.mutedForeground} size={15} /><Text style={{ color: tab === 'code' ? colors.primary : colors.mutedForeground }}>Code</Text></Pressable><Pressable onPress={() => setTab('preview')} style={[styles.tab, tab === 'preview' && { borderBottomColor: colors.primary }]}><Feather name="monitor" color={tab === 'preview' ? colors.primary : colors.mutedForeground} size={15} /><Text style={{ color: tab === 'preview' ? colors.primary : colors.mutedForeground }}>Preview</Text></Pressable></View>
    {tab === 'code' ? <View style={{ flex: 1 }}><View style={styles.fileHeader}><Text style={[styles.label, { color: colors.mutedForeground }]}>FILES</Text>{files.map(file => <Pressable key={file} onPress={() => setSelected(file)} style={[styles.fileRow, { backgroundColor: selected === file ? colors.accent : 'transparent' }]}><Feather name={file.endsWith('json') ? 'code' : 'file'} size={15} color={selected === file ? colors.primary : colors.mutedForeground} /><Text style={{ color: selected === file ? colors.foreground : colors.mutedForeground, fontSize: 13 }}>{file}</Text></Pressable>)}</View><ScrollView horizontal style={[styles.codeBox, { backgroundColor: '#0E1714' }]}><ScrollView><Text selectable style={styles.code}>{content}</Text></ScrollView></ScrollView></View> : <View style={styles.previewWrap}><View style={[styles.browser, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.browserDots}><View style={[styles.dot, { backgroundColor: '#EF7D7D' }]} /><View style={[styles.dot, { backgroundColor: '#F2CB72' }]} /><View style={[styles.dot, { backgroundColor: colors.primary }]} /></View><View style={[styles.preview, { backgroundColor: '#F1F5F0' }]}><Text style={{ fontSize: 28, fontWeight: '700', color: '#17221E' }}>{projectName}</Text><Text style={{ color: '#607267', marginTop: 8 }}>Generated project preview</Text></View></View></View>}
  </View>;
}
const styles = StyleSheet.create({ screen: { flex: 1 }, top: { paddingHorizontal: 18, paddingTop: 54, paddingBottom: 16, flexDirection: 'row', alignItems: 'center' }, project: { fontSize: 16, fontWeight: '700' }, run: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 11 }, tabs: { flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: 18 }, tab: { flexDirection: 'row', gap: 7, paddingVertical: 13, marginRight: 24, borderBottomWidth: 2, borderBottomColor: 'transparent' }, fileHeader: { padding: 16, paddingBottom: 8 }, label: { fontSize: 10, letterSpacing: 1.5, fontWeight: '700', marginBottom: 9 }, fileRow: { flexDirection: 'row', gap: 9, alignItems: 'center', padding: 10, borderRadius: 8, marginBottom: 3 }, codeBox: { flex: 1, marginTop: 8 }, code: { color: '#D6E9DE', fontFamily: 'monospace', fontSize: 13, lineHeight: 21, padding: 18 }, previewWrap: { flex: 1, padding: 18 }, browser: { borderRadius: 18, borderWidth: 1, overflow: 'hidden', flex: 1 }, browserDots: { flexDirection: 'row', gap: 6, padding: 12 }, dot: { width: 8, height: 8, borderRadius: 4 }, preview: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 } });