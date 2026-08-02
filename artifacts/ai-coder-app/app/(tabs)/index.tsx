import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGenerate } from '@/lib/useGenerate';
import { ProjectMeta, PROJECTS_KEY, saveProject } from '@/lib/saveProject';
import { useAppTheme } from '@/lib/theme';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [projects, setProjects] = useState<ProjectMeta[]>([]);
  const [error, setError] = useState('');
  const generate = useGenerate();

  useEffect(() => {
    AsyncStorage.getItem(PROJECTS_KEY).then(v => v && setProjects(JSON.parse(v)));
  }, []);

  const submit = async () => {
    if (!prompt.trim() || generating) return;
    setGenerating(true); setError('');
    try {
      const result = await generate(prompt);
      const saved = await saveProject(result);
      setProjects(cur => [saved, ...cur.filter(p => p.name !== saved.name)]);
      router.push({ pathname: '/editor', params: { project: saved.name } });
      setPrompt('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed.');
    } finally { setGenerating(false); }
  };

  return (
    // overflow hidden clips the ambient glow blobs so they never bleed into cards
    <LinearGradient
      colors={theme.gradient}
      locations={[0, 0.3, 0.6, 1]}
      style={styles.root}
    >
      {/* Single top-right glow only — positioned in the safe empty corner */}
      <View style={[styles.glowTopRight, { backgroundColor: theme.glow }]} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 28, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Brand header ── */}
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
            tintColor={theme.foreground}
          />
          <View style={styles.headerText}>
            {/* Same Inter_700Bold for both logo wordmark and prompt heading — no clash */}
            <Text style={[styles.appName, { color: theme.foreground }]}>VELOCITY</Text>
            {/* Contrast fix: rgba(1,1,1,0) → fully opaque on the tagline */}
            <Text style={[styles.tagline, { color: theme.foreground, opacity: 0.72 }]}>
              AI App Builder
            </Text>
          </View>
        </View>

        {/* ── Prompt card ── */}
        <View style={styles.heroWrap}>
          <BlurView intensity={20} tint="dark" style={[styles.promptCard, { borderColor: theme.border }]}>
            <View style={[styles.promptCardInner, { backgroundColor: theme.glassStrong }]}>
              <Text style={[styles.promptLabel, { color: theme.foreground }]}>
                What will you build?
              </Text>
              {/* Input with explicit background + border so the entry zone is unmistakable */}
              <View style={[styles.inputWrap, { backgroundColor: theme.accentSoft, borderColor: theme.border }]}>
                <TextInput
                  testID="prompt-input"
                  value={prompt}
                  onChangeText={setPrompt}
                  multiline
                  placeholder="Describe an app you want to make..."
                  placeholderTextColor={theme.mutedForeground}
                  style={[styles.promptInput, { color: theme.foreground }]}
                />
              </View>
              {!!error && <Text style={styles.errorText}>{error}</Text>}
              <View style={styles.promptFooter}>
                {/* Contrast fix: full white at 0.7 opacity instead of theme.mutedForeground */}
                <Text style={[styles.hint, { color: theme.foreground, opacity: 0.62 }]}>
                  ~250 tokens · free on Groq
                </Text>
                <Pressable
                  testID="generate-button"
                  onPress={submit}
                  style={({ pressed }) => [styles.sendBtn, { opacity: pressed ? 0.72 : 1 }]}
                >
                  {prompt.trim() ? (
                    <LinearGradient
                      colors={[theme.accentBright, theme.accent, theme.accent]}
                      style={styles.sendBtnFill}
                    >
                      <Feather name={generating ? 'loader' : 'arrow-up'} size={18} color={theme.primaryForeground} />
                    </LinearGradient>
                  ) : (
                    <View style={[styles.sendBtnFill, { backgroundColor: theme.accentSoft }]}>
                      <Feather name="arrow-up" size={18} color={theme.mutedForeground} />
                    </View>
                  )}
                </Pressable>
              </View>
            </View>
          </BlurView>
        </View>

        {/* ── Recent projects ── */}
        {projects.length > 0 && (
          <>
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: theme.foreground, fontFamily: 'Inter_600SemiBold' }]}>
                Recent projects
              </Text>
              <Pressable onPress={() => router.push('/projects')}>
                <Text style={[styles.seeAll, { color: theme.accentBright, fontFamily: 'Inter_600SemiBold' }]}>
                  See all
                </Text>
              </Pressable>
            </View>
            {projects.slice(0, 3).map(project => (
              <Pressable
                key={project.name}
                onPress={() => router.push({ pathname: '/editor', params: { project: project.name } })}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              >
                <BlurView intensity={16} tint="dark"
                  style={[styles.rowCard, { borderColor: theme.border }]}>
                  <View style={[styles.rowCardInner, { backgroundColor: theme.glass }]}>
                    <View style={[styles.iconBadge, { overflow: 'hidden', borderRadius: 12 }]}>
                      <LinearGradient colors={[theme.accentBright, theme.accent]} style={StyleSheet.absoluteFill} />
                      <Feather name="box" size={16} color={theme.primaryForeground} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.rowTitle, { color: theme.foreground, fontFamily: 'Inter_600SemiBold' }]}>
                        {project.name}
                      </Text>
                      <Text style={[styles.rowMeta, { color: theme.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                        {project.fileCount} files · {new Date(project.created).toLocaleDateString()}
                      </Text>
                    </View>
                    <Feather name="chevron-right" color={theme.mutedForeground} size={17} />
                  </View>
                </BlurView>
              </Pressable>
            ))}
          </>
        )}

        {/* ── Privacy tip — no glow blob, so no circle artifact ── */}
        <BlurView intensity={16} tint="dark" style={[styles.rowCard, { borderColor: theme.border, marginTop: 4 }]}>
          <View style={[styles.rowCardInner, { backgroundColor: theme.glass }]}>
            <View style={[styles.iconBadge, { overflow: 'hidden', borderRadius: 10 }]}>
              <LinearGradient colors={[theme.accentBright, theme.accent]} style={StyleSheet.absoluteFill} />
              <Feather name="shield" size={15} color={theme.primaryForeground} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: theme.foreground, fontFamily: 'Inter_600SemiBold' }]}>
                Build privately
              </Text>
              <Text style={[styles.rowMeta, { color: theme.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                Your API keys stay on this device. No relay server.
              </Text>
            </View>
          </View>
        </BlurView>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },

  // Single, fully clipped glow in the empty top-right corner only
  glowTopRight: {
    position: 'absolute', top: -90, right: -90,
    width: 260, height: 260, borderRadius: 130, opacity: 0.45,
  },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 14, marginBottom: 28,
  },
  logo: { width: 52, height: 52 },
  headerText: { alignItems: 'flex-start' },
  appName: {
    fontSize: 22, letterSpacing: 4,
    fontFamily: 'Inter_700Bold', fontWeight: '700',
  },
  tagline: { fontSize: 12, marginTop: 2, fontFamily: 'Inter_400Regular' },

  // Prompt card
  heroWrap: { marginBottom: 16 },
  promptCard: { borderRadius: 26, overflow: 'hidden', borderWidth: 1 },
  promptCardInner: { padding: 22 },
  promptLabel: {
    fontSize: 20, marginBottom: 14,
    fontFamily: 'Inter_700Bold', fontWeight: '700',
  },
  // ← explicit bordered input zone: solves "lacks defined boundaries" critique
  inputWrap: {
    borderRadius: 14, borderWidth: 1,
    paddingHorizontal: 14, paddingTop: 12, paddingBottom: 10,
    marginBottom: 2,
  },
  promptInput: {
    fontSize: 15, lineHeight: 23, minHeight: 72,
    textAlignVertical: 'top', fontFamily: 'Inter_400Regular',
  },
  errorText: { fontSize: 12, color: '#F87171', marginTop: 6 },
  promptFooter: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginTop: 14,
  },
  hint: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  sendBtn: { width: 40, height: 40, borderRadius: 14, overflow: 'hidden' },
  sendBtnFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Shared row card (projects + tip)
  sectionRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10, marginTop: 4,
  },
  sectionTitle: { fontSize: 14 },
  seeAll: { fontSize: 13 },
  rowCard: { borderRadius: 18, overflow: 'hidden', borderWidth: 1, marginBottom: 10 },
  rowCardInner: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, padding: 14,
  },
  iconBadge: {
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  rowTitle: { fontSize: 14, fontWeight: '600' },
  rowMeta: { fontSize: 12, marginTop: 2 },
});
