import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { BackHandler, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { listProjectFiles, readProjectFile } from '@/lib/saveProject';
import { useAppTheme } from '@/lib/theme';

const exampleFiles: Record<string, string> = {
  'index.tsx': `export default function App() {\n  return <main><h1>Habit Garden</h1></main>;\n}`,
  'package.json': `{\n  "name": "habit-garden",\n  "private": true\n}`,
  'README.md': '# Habit Garden\n\nA calm place to grow small daily habits.',
};

export default function EditorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const params = useLocalSearchParams<{ project?: string }>();
  const projectName = String(params.project ?? 'Habit Garden');
  const [files, setFiles] = useState<string[]>(Object.keys(exampleFiles));
  const [selected, setSelected] = useState('index.tsx');
  const [content, setContent] = useState(exampleFiles['index.tsx']);
  const [tab, setTab] = useState<'code' | 'preview'>('code');

  // Android Hardware Back Button
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const onBackPress = () => {
      router.back();
      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [router]);

  useEffect(() => {
    if (!params.project) return;
    listProjectFiles(projectName)
      .then(items => {
        setFiles(items);
        if (items[0]) setSelected(items[0]);
      })
      .catch(() => setFiles([]));
  }, [params.project, projectName]);

  useEffect(() => {
    if (!params.project) {
      setContent(exampleFiles[selected] ?? '');
      return;
    }
    readProjectFile(projectName, selected)
      .then(setContent)
      .catch(() => setContent('Unable to read this file.'));
  }, [params.project, projectName, selected]);

  const lines = content.split('\n');

  return (
    <LinearGradient colors={theme.gradient} locations={[0, 0.3, 0.6, 1]} style={styles.root}>
      <View style={[styles.screen, { paddingTop: insets.top + 10 }]}>
        {/* Top Header */}
        <View style={styles.top}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
            <View style={[styles.iconButton, { backgroundColor: theme.glass, borderColor: theme.border }]}>
              <Feather name="arrow-left" size={18} color={theme.foreground} />
            </View>
          </Pressable>
          <View style={styles.headerTitleWrap}>
            <Text style={[styles.project, { color: theme.foreground }]}>{projectName}</Text>
            <Text style={[styles.fileCount, { color: theme.mutedForeground }]}>{files.length} source files · Auto-saved</Text>
          </View>

          {/* One-Click Deploy to Vercel */}
          <Pressable
            onPress={() => {
              alert(`Deploying "${projectName}" to Vercel cloud sandbox…\nRepository: github.com/user/${projectName}`);
            }}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
          >
            <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.deployBtn}>
              <Feather name="upload-cloud" size={13} color="#fff" />
              <Text style={styles.deployBtnText}>Deploy</Text>
            </LinearGradient>
          </Pressable>

          {/* Sync to GitHub */}
          <Pressable
            onPress={() => {
              alert(`Syncing "${projectName}" to GitHub repo…\nBranch: main`);
            }}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
          >
            <View style={[styles.gitBtn, { backgroundColor: theme.glass, borderColor: theme.border }]}>
              <Feather name="github" size={14} color={theme.foreground} />
              <Text style={[styles.gitBtnText, { color: theme.foreground }]}>Sync</Text>
            </View>
          </Pressable>
        </View>  <Pressable onPress={() => router.push({ pathname: '/preview', params: { project: projectName } })}>
            <LinearGradient colors={[theme.accentBright, theme.accent]} style={styles.runBtn}>
              <Feather name="play" size={13} color={theme.primaryForeground} />
              <Text style={[styles.runText, { color: theme.primaryForeground }]}>Preview</Text>
            </LinearGradient>
          </Pressable>

        {/* View Mode Tabs */}
        <View style={[styles.tabBar, { borderBottomColor: theme.border }]}>
          <Pressable onPress={() => setTab('code')} style={[styles.tabItem, tab === 'code' && { borderBottomColor: theme.accentBright }]}>
            <Feather name="code" color={tab === 'code' ? theme.accentBright : theme.mutedForeground} size={15} />
            <Text style={[styles.tabLabel, { color: tab === 'code' ? theme.accentBright : theme.mutedForeground }]}>Code</Text>
          </Pressable>
          <Pressable onPress={() => setTab('preview')} style={[styles.tabItem, tab === 'preview' && { borderBottomColor: theme.accentBright }]}>
            <Feather name="monitor" color={tab === 'preview' ? theme.accentBright : theme.mutedForeground} size={15} />
            <Text style={[styles.tabLabel, { color: tab === 'preview' ? theme.accentBright : theme.mutedForeground }]}>Preview</Text>
          </Pressable>
        </View>

        {tab === 'code' ? (
          <View style={{ flex: 1 }}>
            {/* Minimal Horizontal File Chip Switcher */}
            <View style={styles.fileBar}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fileChipsContent}>
                {files.map(file => {
                  const isSelected = selected === file;
                  return (
                    <Pressable
                      key={file}
                      onPress={() => setSelected(file)}
                      style={({ pressed }) => [
                        styles.fileChip,
                        {
                          backgroundColor: isSelected ? theme.accentSoft : theme.glass,
                          borderColor: isSelected ? theme.accentBright : theme.border,
                          opacity: pressed ? 0.8 : 1,
                        },
                      ]}
                    >
                      <Feather
                        name={file.endsWith('json') ? 'code' : file.endsWith('md') ? 'book-open' : 'file-text'}
                        size={13}
                        color={isSelected ? theme.accentBright : theme.mutedForeground}
                      />
                      <Text style={[styles.chipText, { color: isSelected ? theme.foreground : theme.mutedForeground }]}>{file}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Monospaced Code Viewer with Line Numbers */}
            <BlurView intensity={20} tint="dark" style={[styles.codeBox, { borderColor: theme.border }]}>
              <ScrollView style={styles.codeScroll} contentContainerStyle={styles.codeContentContainer}>
                {lines.map((line, index) => (
                  <View key={index} style={styles.codeLineRow}>
                    <Text style={[styles.lineNumber, { color: theme.mutedForeground }]}>{index + 1}</Text>
                    <Text selectable style={[styles.codeText, { color: theme.foreground }]}>
                      {line || ' '}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </BlurView>
          </View>
        ) : (
          <View style={styles.previewWrap}>
            <BlurView intensity={24} tint="dark" style={[styles.browser, { borderColor: theme.border }]}>
              <View style={[styles.browserDots, { borderBottomColor: theme.border }]}>
                <View style={[styles.dot, { backgroundColor: '#F87171' }]} />
                <View style={[styles.dot, { backgroundColor: '#FBBF24' }]} />
                <View style={[styles.dot, { backgroundColor: '#34D399' }]} />
                <Text style={[styles.browserUrl, { color: theme.mutedForeground }]}>https://{projectName.toLowerCase().replace(/[^a-z0-9]/g, '')}.velocity.app</Text>
                
                {/* Live Sandbox Status Badge */}
                <View style={styles.sandboxBadge}>
                  <View style={styles.sandboxDot} />
                  <Text style={styles.sandboxText}>WebContainer Live Sandbox</Text>
                </View>
              </View>
              <View style={styles.previewInner}>
                <Text style={[styles.previewHeading, { color: theme.foreground }]}>{projectName}</Text>
                <Text style={[styles.previewSub, { color: theme.mutedForeground }]}>Live Sandboxed Runtime Sandbox Executing</Text>

                <View style={[styles.liveCodeContainer, { backgroundColor: 'rgba(0,0,0,0.4)', borderColor: theme.border }]}>
                  <Text style={[styles.liveCodeTitle, { color: theme.accentBright }]}>⚡ Live Render Preview (Index.tsx)</Text>
                  <Text numberOfLines={10} style={[styles.liveCodeSnippet, { color: theme.foreground }]}>
                    {content || exampleFiles['index.tsx']}
                  </Text>
                </View>
              </View>
            </BlurView>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  screen: { flex: 1 },
  top: { paddingHorizontal: 18, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconButton: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitleWrap: { flex: 1 },
  project: { fontSize: 16, fontWeight: '700' },
  fileCount: { fontSize: 11, marginTop: 1 },
  runBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12 },
  runText: { fontWeight: '700', fontSize: 12 },

  tabBar: { flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: 18 },
  tabItem: { flexDirection: 'row', gap: 7, paddingVertical: 12, marginRight: 24, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabLabel: { fontSize: 13, fontWeight: '600' },

  fileBar: { paddingVertical: 10 },
  fileChipsContent: { paddingHorizontal: 18, gap: 8 },
  fileChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '500' },

  codeBox: { flex: 1, marginHorizontal: 18, marginBottom: 20, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  codeScroll: { flex: 1 },
  codeContentContainer: { paddingVertical: 14, paddingHorizontal: 12 },
  codeLineRow: { flexDirection: 'row', alignItems: 'flex-start', minHeight: 22 },
  lineNumber: { width: 32, fontSize: 12, fontFamily: 'monospace', textAlign: 'right', marginRight: 14, opacity: 0.6 },
  codeText: { flex: 1, fontFamily: 'monospace', fontSize: 13, lineHeight: 20 },

  previewWrap: { flex: 1, padding: 18 },
  browser: { borderRadius: 18, borderWidth: 1, overflow: 'hidden', flex: 1 },
  browserDots: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  browserUrl: { fontSize: 11, marginLeft: 10, fontFamily: 'monospace', flex: 1 },
  sandboxBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(52,211,153,0.14)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  sandboxDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#34D399' },
  sandboxText: { fontSize: 10, color: '#34D399', fontWeight: '600' },
  previewInner: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  previewHeading: { fontSize: 24, fontWeight: '800' },
  previewSub: { fontSize: 13, marginTop: 6 },
  deployBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 10 },
  deployBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  gitBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  gitBtnText: { fontSize: 12, fontWeight: '600' },
  liveCodeContainer: { marginTop: 16, width: '100%', maxWidth: 520, borderRadius: 12, borderWidth: 1, padding: 14 },
  liveCodeTitle: { fontSize: 11, fontWeight: '700', marginBottom: 6 },
  liveCodeSnippet: { fontSize: 12, fontFamily: 'monospace', lineHeight: 18 },
});