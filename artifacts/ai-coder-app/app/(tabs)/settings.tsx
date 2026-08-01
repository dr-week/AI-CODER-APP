import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

export default function SettingsScreen() {
  const colors = useColors();
  const [provider, setProvider] = useState('Groq');
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    Promise.all([AsyncStorage.getItem('ai-coder-key'), AsyncStorage.getItem('ai-coder-provider')]).then(([value, savedProvider]) => {
      if (value) setKey(value);
      if (savedProvider) setProvider(savedProvider);
    });
  }, []);
  const save = async () => {
    await AsyncStorage.multiSet([['ai-coder-key', key], ['ai-coder-provider', provider]]);
    setSaved(true); setTimeout(() => setSaved(false), 1800);
  };
  return <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
    <Text style={[styles.kicker, { color: colors.primary }]}>PREFERENCES</Text><Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
    <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Choose how your private workspace talks to models.</Text>
    <Text style={[styles.label, { color: colors.mutedForeground }]}>MODEL PROVIDER</Text>
    <View style={styles.providers}>{['Groq', 'OpenAI', 'Anthropic', 'Ollama'].map(item => <Pressable key={item} onPress={() => setProvider(item)} style={[styles.provider, { backgroundColor: provider === item ? colors.accent : colors.card, borderColor: provider === item ? colors.primary : colors.border }]}><Text style={{ color: provider === item ? colors.primary : colors.secondaryForeground, fontWeight: '600' }}>{item}</Text></Pressable>)}</View>
    {provider === 'Groq' && <Text style={[styles.note, { color: colors.mutedForeground }]}>Free-tier model: llama-3.1-8b-instant</Text>}
    <Text style={[styles.label, { color: colors.mutedForeground }]}>API KEY OR LOCAL URL</Text>
    <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="key" size={17} color={colors.mutedForeground} /><TextInput testID="api-key-input" value={key} onChangeText={setKey} placeholder={provider === 'Ollama' ? 'http://localhost:11434' : `Paste your ${provider} key`} placeholderTextColor={colors.mutedForeground} secureTextEntry={provider !== 'Ollama'} style={[styles.input, { color: colors.foreground }]} /></View>
    <Pressable onPress={save} style={({ pressed }) => [styles.save, { backgroundColor: colors.primary, opacity: pressed ? .7 : 1 }]}><Text style={{ color: colors.primaryForeground, fontWeight: '700' }}>{saved ? 'Saved locally' : 'Save settings'}</Text></Pressable>
    <View style={[styles.privacy, { backgroundColor: colors.accent }]}><Feather name="shield" size={19} color={colors.primary} /><Text style={{ color: colors.secondaryForeground, flex: 1, lineHeight: 18 }}>Your credentials are stored only on this device. Nothing is sent to our servers.</Text></View>
  </ScrollView>;
}
const styles = StyleSheet.create({ screen: { flex: 1 }, content: { padding: 20, paddingTop: 24, paddingBottom: 120 }, kicker: { fontSize: 11, letterSpacing: 2, fontWeight: '700' }, title: { fontSize: 27, fontWeight: '700', marginTop: 5 }, subtitle: { fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 32 }, label: { fontSize: 11, letterSpacing: 1.5, fontWeight: '700', marginBottom: 12 }, providers: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }, provider: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1 }, note: { fontSize: 12, marginBottom: 24 }, inputWrap: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52 }, input: { flex: 1, fontSize: 14 }, save: { alignItems: 'center', justifyContent: 'center', borderRadius: 14, height: 52, marginTop: 14 }, privacy: { marginTop: 28, borderRadius: 15, padding: 15, flexDirection: 'row', gap: 12 } });