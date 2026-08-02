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

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    <LinearGradient
      colors={['#F0C080', '#D4894A', '#A8561E', '#2C1608']}
      locations={[0, 0.3, 0.6, 1]}
      style={styles.root}
    >
      {/* Ambient glow blobs */}
      <View style={styles.glowTopRight} />
      <View style={styles.glowCenter} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Image source={require('@/assets/images/icon.png')} style={styles.logo} />
          <View style={styles.headerText}>
            <Text style={styles.appName}>VELOCITY</Text>
            <Text style={styles.tagline}>AI App Builder</Text>
          </View>
        </View>

        {/* Prompt card — centered hero */}
        <View style={styles.heroWrap}>
          <View style={styles.glowCard} />
          <BlurView intensity={18} tint="dark" style={styles.promptCard}>
            <View style={styles.promptCardInner}>
              <Text style={styles.promptLabel}>What will you build?</Text>
              <TextInput
                testID="prompt-input"
                value={prompt}
                onChangeText={setPrompt}
                multiline
                placeholder="Describe an app you want to make..."
                placeholderTextColor="rgba(255,255,255,0.35)"
                style={styles.promptInput}
              />
              {!!error && <Text style={styles.errorText}>{error}</Text>}
              <View style={styles.promptFooter}>
                <Text style={styles.hint}>~250 tokens · free on Groq</Text>
                <Pressable
                  testID="generate-button"
                  onPress={submit}
                  style={({ pressed }) => [styles.sendBtn, prompt.trim() && styles.sendBtnActive, { opacity: pressed ? 0.75 : 1 }]}
                >
                  {prompt.trim() ? (
                    <LinearGradient colors={['#FF9A3C', '#F97316', '#EA580C']} style={styles.sendBtnGrad}>
                      <Feather name={generating ? 'loader' : 'arrow-up'} size={18} color="#fff" />
                    </LinearGradient>
                  ) : (
                    <View style={styles.sendBtnInactive}>
                      <Feather name="arrow-up" size={18} color="rgba(255,255,255,0.4)" />
                    </View>
                  )}
                </Pressable>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Recent projects */}
        {projects.length > 0 && (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Recent projects</Text>
              <Pressable onPress={() => router.push('/projects')}>
                <Text style={styles.seeAll}>See all</Text>
              </Pressable>
            </View>
            {projects.slice(0, 3).map((project) => (
              <Pressable
                key={project.name}
                onPress={() => router.push({ pathname: '/editor', params: { project: project.name } })}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              >
                <BlurView intensity={14} tint="dark" style={styles.projectCard}>
                  <View style={styles.projectGlow} />
                  <View style={styles.projectCardInner}>
                    <View style={styles.projectIcon}>
                      <LinearGradient colors={['#FF9A3C', '#EA580C']} style={styles.iconGrad}>
                        <Feather name="box" size={16} color="#fff" />
                      </LinearGradient>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.projectName}>{project.name}</Text>
                      <Text style={styles.projectMeta}>{project.fileCount} files · {new Date(project.created).toLocaleDateString()}</Text>
                    </View>
                    <Feather name="chevron-right" color="rgba(255,255,255,0.4)" size={17} />
                  </View>
                </BlurView>
              </Pressable>
            ))}
          </>
        )}

        {/* Privacy tip */}
        <BlurView intensity={14} tint="dark" style={styles.tipCard}>
          <View style={styles.tipGlow} />
          <View style={styles.tipInner}>
            <View style={styles.tipIcon}>
              <LinearGradient colors={['#FF9A3C', '#EA580C']} style={styles.iconGrad}>
                <Feather name="shield" size={15} color="#fff" />
              </LinearGradient>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tipTitle}>Build privately</Text>
              <Text style={styles.tipText}>Your API keys stay on this device. No relay server.</Text>
            </View>
          </View>
        </BlurView>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },

  // Glow blobs
  glowTopRight: {
    position: 'absolute', top: -80, right: -80,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(249,115,22,0.25)',
  },
  glowCenter: {
    position: 'absolute', top: '30%', left: '10%',
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(234,88,12,0.18)',
  },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 32 },
  logo: { width: 44, height: 44, tintColor: '#FFFFFF' },
  headerText: {},
  appName: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', letterSpacing: 3 },
  tagline: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 1 },

  // Hero prompt
  heroWrap: { marginBottom: 28, position: 'relative' },
  glowCard: {
    position: 'absolute', top: 20, left: '10%',
    width: '80%', height: 80,
    backgroundColor: 'rgba(249,115,22,0.35)',
    borderRadius: 40,
    transform: [{ scaleY: 0.3 }],
  },
  promptCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,150,50,0.25)',
  },
  promptCardInner: { padding: 20, backgroundColor: 'rgba(18,8,2,0.6)' },
  promptLabel: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginBottom: 14 },
  promptInput: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: { fontSize: 12, color: '#F87171', marginTop: 6 },
  promptFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  hint: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  sendBtn: { width: 40, height: 40, borderRadius: 14, overflow: 'hidden' },
  sendBtnActive: {},
  sendBtnGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sendBtnInactive: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // Section
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  seeAll: { fontSize: 13, color: '#F97316', fontWeight: '600' },

  // Project cards
  projectCard: { borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,140,40,0.18)', marginBottom: 10 },
  projectGlow: { position: 'absolute', bottom: -20, left: '20%', width: 120, height: 60, borderRadius: 60, backgroundColor: 'rgba(249,115,22,0.2)' },
  projectCardInner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: 'rgba(18,8,2,0.55)' },
  projectIcon: { width: 40, height: 40, borderRadius: 12, overflow: 'hidden' },
  iconGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  projectName: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  projectMeta: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 3 },

  // Tip card
  tipCard: { borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,140,40,0.18)', marginTop: 8 },
  tipGlow: { position: 'absolute', top: -10, right: 20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(249,115,22,0.25)' },
  tipInner: { flexDirection: 'row', gap: 12, padding: 16, alignItems: 'center', backgroundColor: 'rgba(18,8,2,0.55)' },
  tipIcon: { width: 36, height: 36, borderRadius: 10, overflow: 'hidden' },
  tipTitle: { fontWeight: '700', color: '#FFFFFF', marginBottom: 3 },
  tipText: { fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 17 },
});
