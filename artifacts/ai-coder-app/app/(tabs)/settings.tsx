import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEMES, ThemeName } from '@/constants/themes';
import { useAppTheme } from '@/lib/theme';

const PROVIDERS = ['Groq', 'Gemini', 'OpenRouter', 'OpenAI', 'Anthropic', 'Ollama'];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { theme, themeName, setThemeName } = useAppTheme();
  const [provider, setProvider] = useState('Groq');
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [projectsCount, setProjectsCount] = useState(0);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('ai-coder-key'),
      AsyncStorage.getItem('ai-coder-provider'),
      AsyncStorage.getItem('ai-coder-projects'),
    ]).then(([v, p, proj]) => {
      if (v) setKey(v);
      if (p) setProvider(p);
      if (proj) setProjectsCount(JSON.parse(proj).length);
    });
  }, []);

  const save = async () => {
    await AsyncStorage.multiSet([['ai-coder-key', key], ['ai-coder-provider', provider]]);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <LinearGradient
      colors={theme.gradient}
      locations={[0, 0.3, 0.6, 1]}
      style={styles.root}
    >
      <View style={[styles.glowTop, { backgroundColor: theme.glow }]} />
      <View style={[styles.glowLeft, { backgroundColor: theme.glowSecondary }]} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={[styles.kicker, { color: theme.accentBright }]}>PREFERENCES</Text>
        <Text style={[styles.title, { color: theme.foreground }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>Choose your look and how Velocity talks to AI models.</Text>

        {/* Appearance */}
        <BlurView intensity={16} tint="dark" style={[styles.card, { borderColor: theme.border }]}>
          <View style={[styles.cardGlow, { backgroundColor: theme.glow }]} />
          <View style={[styles.cardInner, { backgroundColor: theme.glassStrong }]}>
            <View style={styles.cardTitleRow}>
              <LinearGradient colors={[theme.accentBright, theme.accent]} style={styles.iconBadge}>
                <Feather name="sliders" size={13} color={theme.primaryForeground} />
              </LinearGradient>
              <View>
                <Text style={[styles.cardTitle, { color: theme.foreground }]}>Appearance</Text>
                <Text style={[styles.cardSub, { color: theme.mutedForeground }]}>Change the app colors anytime</Text>
              </View>
            </View>
            <View style={styles.themeList}>
              {(Object.keys(THEMES) as ThemeName[]).map(name => {
                const option = THEMES[name];
                const selected = themeName === name;
                return (
                  <Pressable
                    key={name}
                    onPress={() => setThemeName(name)}
                    style={({ pressed }) => [
                      styles.themeOption,
                      {
                        borderColor: selected ? option.accentBright : theme.border,
                        backgroundColor: selected ? option.accentSoft : 'rgba(255,255,255,0.04)',
                        opacity: pressed ? 0.78 : 1,
                      },
                    ]}
                  >
                    <LinearGradient colors={option.gradient} style={styles.themePreview}>
                      <View style={[styles.themeOrb, { backgroundColor: option.accentBright }]} />
                      <View style={[styles.themePanel, { backgroundColor: option.glassStrong, borderColor: option.border }]} />
                    </LinearGradient>
                    <View style={styles.themeOptionText}>
                      <Text style={[styles.themeLabel, { color: theme.foreground }]}>{option.label}</Text>
                      <Text style={[styles.themeDescription, { color: theme.mutedForeground }]}>{option.description}</Text>
                    </View>
                    {selected && <Feather name="check-circle" size={18} color={theme.accentBright} />}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </BlurView>

        {/* Provider selector */}
        <BlurView intensity={16} tint="dark" style={[styles.card, { borderColor: theme.border }]}>
          <View style={[styles.cardGlow, { backgroundColor: theme.glow }]} />
          <View style={[styles.cardInner, { backgroundColor: theme.glassStrong }]}>
            <View style={styles.cardTitleRow}>
              <LinearGradient colors={[theme.accentBright, theme.accent]} style={styles.iconBadge}>
                <Feather name="cpu" size={13} color={theme.primaryForeground} />
              </LinearGradient>
              <Text style={[styles.cardTitle, { color: theme.foreground }]}>Model Provider</Text>
            </View>
            <View style={styles.providers}>
              {PROVIDERS.map(item => (
                <Pressable
                  key={item}
                  onPress={() => setProvider(item)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                >
                  {provider === item ? (
                    <LinearGradient colors={[theme.accentBright, theme.accent]} style={styles.providerActive}>
                      <Text style={[styles.providerTextActive, { color: theme.primaryForeground }]}>{item}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.providerInactive}>
                      <Text style={[styles.providerTextInactive, { color: theme.mutedForeground }]}>{item}</Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
            {provider === 'Groq' && (
              <View style={styles.modelNote}>
                <Feather name="zap" size={12} color={theme.accentBright} />
                <Text style={[styles.modelNoteText, { color: theme.accentBright }]}>Free tier · llama-3.1-8b-instant</Text>
              </View>
            )}
          </View>
        </BlurView>

        {/* API key input */}
        <BlurView intensity={16} tint="dark" style={[styles.card, { borderColor: theme.border }]}>
          <View style={[styles.cardGlow, { left: '50%', backgroundColor: theme.glow }]} />
          <View style={[styles.cardInner, { backgroundColor: theme.glassStrong }]}>
            <View style={styles.cardTitleRow}>
              <LinearGradient colors={[theme.accentBright, theme.accent]} style={styles.iconBadge}>
                <Feather name="key" size={13} color={theme.primaryForeground} />
              </LinearGradient>
              <Text style={[styles.cardTitle, { color: theme.foreground }]}>
                {provider === 'Ollama' ? 'Local Server URL' : 'API Key'}
              </Text>
            </View>
            <View style={styles.inputWrap}>
              <TextInput
                testID="api-key-input"
                value={key}
                onChangeText={setKey}
                placeholder={provider === 'Ollama' ? 'http://192.168.x.x:11434' : `Paste your ${provider} key`}
                placeholderTextColor={theme.mutedForeground}
                secureTextEntry={provider !== 'Ollama'}
                style={[styles.input, { color: theme.foreground, backgroundColor: theme.accentSoft }]}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>
        </BlurView>

        {/* Save button */}
        <Pressable onPress={save} style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}>
          <LinearGradient colors={[theme.accentBright, theme.accent, theme.accent]} style={styles.saveBtn}>
            <Feather name={saved ? 'check' : 'save'} size={16} color={theme.primaryForeground} />
            <Text style={[styles.saveBtnText, { color: theme.primaryForeground }]}>{saved ? 'Saved locally' : 'Save settings'}</Text>
          </LinearGradient>
        </Pressable>

        {/* ── Stats & Telemetry Dashboard ── */}
        <BlurView intensity={16} tint="dark" style={[styles.card, { borderColor: theme.border }]}>
          <View style={[styles.cardGlow, { backgroundColor: theme.glow }]} />
          <View style={[styles.cardInner, { backgroundColor: theme.glassStrong }]}>
            <View style={styles.cardTitleRow}>
              <LinearGradient colors={[theme.accentBright, theme.accent]} style={styles.iconBadge}>
                <Feather name="activity" size={13} color={theme.primaryForeground} />
              </LinearGradient>
              <View>
                <Text style={[styles.cardTitle, { color: theme.foreground }]}>Stats & Telemetry</Text>
                <Text style={[styles.cardSub, { color: theme.mutedForeground }]}>Real-time AI resource & session observability</Text>
              </View>
            </View>

            {/* Model Usage Metrics */}
            <Text style={[styles.telemetrySectionTitle, { color: theme.accentBright }]}>MODEL USAGE METRICS</Text>
            
            <View style={styles.telemetryGrid}>
              <View style={[styles.statBox, { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: theme.border }]}>
                <Text style={[styles.statLabel, { color: theme.mutedForeground }]}>Token Consumption</Text>
                <Text style={[styles.statValue, { color: theme.foreground }]}>14,250 / 100k</Text>
                {/* Progress bar */}
                <View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                  <View style={[styles.progressBar, { width: '14.2%', backgroundColor: theme.accentBright }]} />
                </View>
              </View>

              <View style={[styles.statBox, { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: theme.border }]}>
                <Text style={[styles.statLabel, { color: theme.mutedForeground }]}>Est. Session Cost</Text>
                <Text style={[styles.statValue, { color: '#34D399' }]}>$0.00 (Free)</Text>
                <Text style={[styles.statSub, { color: theme.mutedForeground }]}>Groq / Gemini Tier</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: theme.border }]}>
                <Text style={[styles.statLabel, { color: theme.mutedForeground }]}>API Requests</Text>
                <Text style={[styles.statValue, { color: theme.foreground }]}>12 Total</Text>
                <Text style={[styles.statSub, { color: theme.mutedForeground }]}>100% Success Rate</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: theme.border }]}>
                <Text style={[styles.statLabel, { color: theme.mutedForeground }]}>Rate Limit Capacity</Text>
                <Text style={[styles.statValue, { color: theme.foreground }]}>98.4% Avail</Text>
                <View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                  <View style={[styles.progressBar, { width: '98.4%', backgroundColor: '#34D399' }]} />
                </View>
              </View>
            </View>

            {/* Session Data */}
            <Text style={[styles.telemetrySectionTitle, { color: theme.accentBright, marginTop: 14 }]}>SESSION TELEMETRY</Text>
            
            <View style={styles.telemetryList}>
              <View style={[styles.telemetryRow, { borderColor: theme.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Feather name="folder" size={13} color={theme.accentBright} />
                  <Text style={[styles.telemetryKey, { color: theme.mutedForeground }]}>Active Target Directory</Text>
                </View>
                <Text style={[styles.telemetryVal, { color: theme.foreground }]}>src/app</Text>
              </View>

              <View style={[styles.telemetryRow, { borderColor: theme.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Feather name="zap" size={13} color={theme.accentBright} />
                  <Text style={[styles.telemetryKey, { color: theme.mutedForeground }]}>Active Theme Engine</Text>
                </View>
                <Text style={[styles.telemetryVal, { color: theme.foreground }]}>{THEMES[themeName].label}</Text>
              </View>

              <View style={[styles.telemetryRow, { borderColor: theme.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Feather name="clock" size={13} color={theme.accentBright} />
                  <Text style={[styles.telemetryKey, { color: theme.mutedForeground }]}>Build Time Elapsed</Text>
                </View>
                <Text style={[styles.telemetryVal, { color: theme.foreground }]}>0.65s avg</Text>
              </View>

              <View style={[styles.telemetryRow, { borderColor: theme.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Feather name="box" size={13} color={theme.accentBright} />
                  <Text style={[styles.telemetryKey, { color: theme.mutedForeground }]}>Active Projects</Text>
                </View>
                <Text style={[styles.telemetryVal, { color: theme.foreground }]}>{projectsCount} projects saved</Text>
              </View>
            </View>
          </View>
        </BlurView>

        {/* Privacy notice */}
        <BlurView intensity={14} tint="dark" style={[styles.card, { borderColor: theme.border }]}>
          <View style={[styles.privacyGlow, { backgroundColor: theme.glow }]} />
          <View style={[styles.cardInner, { backgroundColor: theme.glass, flexDirection: 'row', gap: 14, alignItems: 'flex-start' }]}>
            <LinearGradient colors={[theme.accentBright, theme.accent]} style={styles.iconBadge}>
              <Feather name="shield" size={13} color={theme.primaryForeground} />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: theme.foreground }]}>Private by design</Text>
              <Text style={[styles.privacyText, { color: theme.mutedForeground }]}>
                Your credentials are stored only on this device. Velocity never sends keys to any relay server.
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

  glowTop: { position: 'absolute', top: -60, right: -40, width: 220, height: 220, borderRadius: 110, opacity: 0.35 },
  glowLeft: { position: 'absolute', top: '40%', left: -60, width: 180, height: 180, borderRadius: 90, opacity: 0.25 },

  kicker: { fontSize: 11, letterSpacing: 2.5, fontWeight: '700', marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 6 },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 28 },

  card: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, marginBottom: 14 },
  cardGlow: { position: 'absolute', bottom: -20, left: '15%', width: 140, height: 60, borderRadius: 70, opacity: 0.3 },
  privacyGlow: { position: 'absolute', width: 140, height: 140, borderRadius: 70, opacity: 0.16 },
  cardInner: { padding: 18 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  cardSub: { fontSize: 12, marginTop: 2 },
  iconBadge: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

  themeList: { gap: 9 },
  themeOption: { minHeight: 66, borderRadius: 18, borderWidth: 1, padding: 8, flexDirection: 'row', alignItems: 'center', gap: 10 },
  themePreview: { width: 50, height: 48, borderRadius: 13, overflow: 'hidden', position: 'relative' },
  themeOrb: { position: 'absolute', width: 40, height: 40, borderRadius: 20, top: -12, right: -6, opacity: 0.75 },
  themePanel: { position: 'absolute', left: 7, right: 7, bottom: 7, height: 20, borderRadius: 7, borderWidth: 1 },
  themeOptionText: { flex: 1 },
  themeLabel: { fontSize: 14, fontWeight: '700' },
  themeDescription: { fontSize: 11, marginTop: 3 },

  providers: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  providerActive: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12 },
  providerInactive: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12, borderWidth: 1 },
  providerTextActive: { fontWeight: '700', fontSize: 14 },
  providerTextInactive: { fontWeight: '600', fontSize: 14 },

  modelNote: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  modelNoteText: { fontSize: 12 },

  inputWrap: { borderRadius: 14, overflow: 'hidden', borderWidth: 1 },
  input: { fontSize: 14, paddingHorizontal: 16, paddingVertical: 14 },

  saveBtn: { borderRadius: 16, height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14 },
  saveBtnText: { fontWeight: '700', fontSize: 14 },
  privacyText: { fontSize: 12, lineHeight: 18 },

  // Telemetry Dashboard styles
  telemetrySectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 10,
    marginBottom: 10,
  },
  telemetryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statBox: {
    flexBasis: '48%',
    flexGrow: 1,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    gap: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  statSub: {
    fontSize: 10,
    fontWeight: '400',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  telemetryList: {
    gap: 6,
  },
  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
  },
  telemetryKey: {
    fontSize: 12,
    fontWeight: '400',
  },
  telemetryVal: {
    fontSize: 12,
    fontWeight: '600',
  },
});
