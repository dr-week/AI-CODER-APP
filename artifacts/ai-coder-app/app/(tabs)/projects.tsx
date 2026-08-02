import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { importPublicGithubRepo } from '@/lib/githubImport';
import { PROJECTS_KEY, ProjectMeta, saveProject, setPreviewUrl } from '@/lib/saveProject';
import { useAppTheme } from '@/lib/theme';

export default function ProjectsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const [projects, setProjects] = useState<ProjectMeta[]>([]);
  const [repoUrl, setRepoUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(PROJECTS_KEY).then(v => v && setProjects(JSON.parse(v)));
  }, []);

  const importRepo = async () => {
    if (!repoUrl.trim() || importing) return;
    setImporting(true); setMessage('');
    try {
      const project = await importPublicGithubRepo(repoUrl, setMessage);
      const saved = await saveProject(project);
      await setPreviewUrl(saved.name, project.previewUrl);
      setProjects(cur => [saved, ...cur.filter(p => p.name !== saved.name)]);
      setRepoUrl(''); setMessage('Imported successfully.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'GitHub import failed.');
    } finally { setImporting(false); }
  };

  return (
    <LinearGradient
      colors={theme.gradient}
      locations={[0, 0.3, 0.6, 1]}
      style={styles.root}
    >
      <View style={[styles.glowTop, { backgroundColor: theme.glow }]} />
      <View style={[styles.glowBottom, { backgroundColor: theme.glowSecondary }]} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.kicker, { color: theme.accentBright }]}>WORKSPACE</Text>
            <Text style={[styles.title, { color: theme.foreground }]}>Your projects</Text>
          </View>
          <Pressable onPress={() => router.push('/editor')} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
            <LinearGradient colors={[theme.accentBright, theme.accent]} style={styles.addBtn}>
              <Feather name="plus" size={20} color={theme.primaryForeground} />
            </LinearGradient>
          </Pressable>
        </View>

        {/* GitHub Import */}
        <BlurView intensity={16} tint="dark" style={[styles.card, { borderColor: theme.border }]}>
          <View style={[styles.cardGlow, { backgroundColor: theme.glow }]} />
          <View style={[styles.cardInner, { backgroundColor: theme.glassStrong }]}>
            <View style={styles.cardTitleRow}>
              <LinearGradient colors={[theme.accentBright, theme.accent]} style={styles.iconBadge}>
                <Feather name="github" size={14} color={theme.primaryForeground} />
              </LinearGradient>
              <Text style={[styles.cardTitle, { color: theme.foreground }]}>Import from GitHub</Text>
            </View>
            <Text style={[styles.cardSub, { color: theme.mutedForeground }]}>Paste a public repository URL. Files are saved locally on this device.</Text>
            <View style={styles.importRow}>
              <TextInput
                value={repoUrl}
                onChangeText={setRepoUrl}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="https://github.com/owner/repo"
                placeholderTextColor={theme.mutedForeground}
                style={[styles.repoInput, { color: theme.foreground, backgroundColor: theme.accentSoft, borderColor: theme.border }]}
              />
              <Pressable onPress={importRepo} style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}>
                <LinearGradient colors={[theme.accentBright, theme.accent]} style={styles.importBtn}>
                  <Text style={[styles.importBtnText, { color: theme.primaryForeground }]}>{importing ? '…' : 'Import'}</Text>
                </LinearGradient>
              </Pressable>
            </View>
            {!!message && (
              <Text style={[styles.statusText, { color: importing ? theme.mutedForeground : theme.accentBright }]}>{message}</Text>
            )}
          </View>
        </BlurView>

        {/* New project shortcut */}
        <Pressable onPress={() => router.push('/')} style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}>
          <BlurView intensity={14} tint="dark" style={[styles.card, styles.newCard, { borderColor: theme.border }]}>
            <View style={[styles.newGlow, { backgroundColor: theme.glow }]} />
            <View style={[styles.cardInner, { backgroundColor: theme.glass, flexDirection: 'row', alignItems: 'center', gap: 14 }]}>
              <LinearGradient colors={[theme.accentBright, theme.accent]} style={styles.iconBadgeLg}>
                <Feather name="zap" size={18} color={theme.primaryForeground} />
              </LinearGradient>
              <View>
                <Text style={[styles.cardTitle, { color: theme.foreground }]}>Start a new project</Text>
                <Text style={[styles.cardSub, { color: theme.mutedForeground }]}>Describe your idea and build it with AI</Text>
              </View>
            </View>
          </BlurView>
        </Pressable>

        {/* Project list */}
        {projects.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: theme.mutedForeground }]}>ALL PROJECTS</Text>
            {projects.map((project, i) => (
              <Pressable
                key={project.name}
                onPress={() => router.push({ pathname: '/editor', params: { project: project.name } })}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              >
                <BlurView intensity={14} tint="dark" style={[styles.card, { marginBottom: 10, borderColor: theme.border }]}>
                  <View style={[styles.cardGlow, { backgroundColor: theme.glow }]} />
                  <View style={[styles.cardInner, { backgroundColor: theme.glass, flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
                    <View style={[styles.folderIcon, { backgroundColor: theme.accentSoft }]}>
                      <Feather name="folder" size={18} color={theme.accentBright} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cardTitle, { color: theme.foreground }]}>{project.name}</Text>
                      <Text style={[styles.cardSub, { color: theme.mutedForeground }]}>{project.fileCount} files · {new Date(project.created).toLocaleDateString()}</Text>
                    </View>
                    <Pressable onPress={() => router.push({ pathname: '/preview', params: { project: project.name } })}>
                      <Feather name="monitor" size={17} color={theme.accentBright} />
                    </Pressable>
                  </View>
                </BlurView>
              </Pressable>
            ))}
          </>
        )}

        {!projects.length && (
          <Text style={[styles.emptyText, { color: theme.mutedForeground }]}>No projects yet. Generate one or import a GitHub repo.</Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },
  glowTop: { position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(249,115,22,0.22)' },
  glowBottom: { position: 'absolute', bottom: 100, left: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(234,88,12,0.15)' },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  kicker: { fontSize: 11, letterSpacing: 2.5, fontWeight: '700', color: '#F97316', marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '800', color: '#FFFFFF' },
  addBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },

  card: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,140,40,0.2)', marginBottom: 14 },
  newCard: {},
  cardGlow: { position: 'absolute', bottom: -20, left: '20%', width: 140, height: 60, borderRadius: 70, backgroundColor: 'rgba(249,115,22,0.18)' },
  newGlow: { position: 'absolute', top: -10, right: 20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(249,115,22,0.28)' },
  cardInner: { padding: 18, backgroundColor: 'rgba(18,8,2,0.58)' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  cardSub: { fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 17 },
  iconBadge: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  iconBadgeLg: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },

  importRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  repoInput: { flex: 1, color: '#FFFFFF', fontSize: 13, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  importBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, justifyContent: 'center' },
  importBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  statusText: { fontSize: 12, marginTop: 8 },

  folderIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { fontSize: 11, letterSpacing: 2, fontWeight: '700', color: 'rgba(255,255,255,0.45)', marginBottom: 12, marginTop: 4 },
  emptyText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center', marginTop: 40, lineHeight: 22 },
});
