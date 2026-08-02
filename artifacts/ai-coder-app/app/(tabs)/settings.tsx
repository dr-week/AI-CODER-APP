import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PROVIDERS = ['Groq', 'OpenAI', 'Anthropic', 'Ollama'];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
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
      colors={['#F0C080', '#D4894A', '#A8561E', '#2C1608']}
      locations={[0, 0.3, 0.6, 1]}
      style={styles.root}
    >
      <View style={styles.glowTop} />
      <View style={styles.glowLeft} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.kicker}>PREFERENCES</Text>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Choose how Velocity talks to AI models.</Text>

        {/* Provider selector */}
        <BlurView intensity={16} tint="dark" style={styles.card}>
          <View style={styles.cardGlow} />
          <View style={styles.cardInner}>
            <View style={styles.cardTitleRow}>
              <LinearGradient colors={['#FF9A3C', '#EA580C']} style={styles.iconBadge}>
                <Feather name="cpu" size={13} color="#fff" />
              </LinearGradient>
              <Text style={styles.cardTitle}>Model Provider</Text>
            </View>
            <View style={styles.providers}>
              {PROVIDERS.map(item => (
                <Pressable
                  key={item}
                  onPress={() => setProvider(item)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                >
                  {provider === item ? (
                    <LinearGradient colors={['#FF9A3C', '#EA580C']} style={styles.providerActive}>
                      <Text style={styles.providerTextActive}>{item}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.providerInactive}>
                      <Text style={styles.providerTextInactive}>{item}</Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
            {provider === 'Groq' && (
              <View style={styles.modelNote}>
                <Feather name="zap" size={12} color="#F97316" />
                <Text style={styles.modelNoteText}>Free tier · llama-3.1-8b-instant</Text>
              </View>
            )}
          </View>
        </BlurView>

        {/* API key input */}
        <BlurView intensity={16} tint="dark" style={styles.card}>
          <View style={[styles.cardGlow, { left: '50%' }]} />
          <View style={styles.cardInner}>
            <View style={styles.cardTitleRow}>
              <LinearGradient colors={['#FF9A3C', '#EA580C']} style={styles.iconBadge}>
                <Feather name="key" size={13} color="#fff" />
              </LinearGradient>
              <Text style={styles.cardTitle}>
                {provider === 'Ollama' ? 'Local Server URL' : 'API Key'}
              </Text>
            </View>
            <View style={styles.inputWrap}>
              <TextInput
                testID="api-key-input"
                value={key}
                onChangeText={setKey}
                placeholder={provider === 'Ollama' ? 'http://192.168.x.x:11434' : `Paste your ${provider} key`}
                placeholderTextColor="rgba(255,255,255,0.3)"
                secureTextEntry={provider !== 'Ollama'}
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>
        </BlurView>

        {/* Save button */}
        <Pressable onPress={save} style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}>
          <LinearGradient colors={['#FF9A3C', '#F97316', '#EA580C']} style={styles.saveBtn}>
            <Feather name={saved ? 'check' : 'save'} size={16} color="#fff" />
            <Text style={styles.saveBtnText}>{saved ? 'Saved locally' : 'Save settings'}</Text>
          </LinearGradient>
        </Pressable>

        {/* Privacy notice */}
        <BlurView intensity={14} tint="dark" style={styles.card}>
          <View style={styles.privacyGlow} />
          <View style={[styles.cardInner, { flexDirection: 'row', gap: 14, alignItems: 'flex-start' }]}>
            <LinearGradient colors={['#FF9A3C', '#EA580C']} style={styles.iconBadge}>
              <Feather name="shield" size={13} color="#fff" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Private by design</Text>
              <Text style={styles.privacyText}>
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
  iconBadge: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

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
