import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEMES, ThemeName } from '@/constants/themes';
import { useAppTheme } from '@/lib/theme';

const PROVIDERS = ['Groq', 'OpenAI', 'Anthropic', 'Ollama'];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { theme, themeName, setThemeName } = useAppTheme();
  const [provider, setProvider] = useState('Groq');
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('ai-coder-key'),
      AsyncStorage.getItem('ai-coder-provider'),
    ]).then(([v, p]) => {
      if (v) setKey(v);
      if (p) setProvider(p);
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
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },

  glowTop: { position: 'absolute', top: -60, right: -40, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(249,115,22,0.22)' },
  glowLeft: { position: 'absolute', top: '40%', left: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(234,88,12,0.14)' },

  kicker: { fontSize: 11, letterSpacing: 2.5, fontWeight: '700', color: '#F97316', marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 6 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 20, marginBottom: 28 },

  card: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,140,40,0.2)', marginBottom: 14 },
  cardGlow: { position: 'absolute', bottom: -20, left: '15%', width: 140, height: 60, borderRadius: 70, backgroundColor: 'rgba(249,115,22,0.2)' },
  privacyGlow: { position: 'absolute', top: -10, right: 20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(249,115,22,0.22)' },
  cardInner: { padding: 18, backgroundColor: 'rgba(18,8,2,0.6)' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
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
  providerInactive: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  providerTextActive: { color: '#fff', fontWeight: '700', fontSize: 14 },
  providerTextInactive: { color: 'rgba(255,255,255,0.55)', fontWeight: '600', fontSize: 14 },

  modelNote: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  modelNoteText: { fontSize: 12, color: '#F97316' },

  inputWrap: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  input: { color: '#FFFFFF', fontSize: 14, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: 'rgba(255,255,255,0.07)' },

  saveBtn: { borderRadius: 16, height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  privacyText: { fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 19, marginTop: 4 },
});
