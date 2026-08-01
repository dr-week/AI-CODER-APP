import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useColors } from '@/hooks/useColors';
import { getPreviewUrl, setPreviewUrl } from '@/lib/saveProject';

export default function PreviewScreen() {
  const colors = useColors(); const router = useRouter(); const { project } = useLocalSearchParams<{ project?: string }>();
  const name = String(project ?? 'project'); const web = useRef<WebView>(null); const [url, setUrl] = useState(''); const [draft, setDraft] = useState(''); const [error, setError] = useState('');
  useEffect(() => { getPreviewUrl(name).then(value => { setUrl(value); setDraft(value); }); }, [name]);
  const save = async () => { const value = draft.trim(); if (!/^https?:\/\//i.test(value)) { setError('Use a deployed URL or a LAN URL such as http://192.168.1.20:3000.'); return; } await setPreviewUrl(name, value); setUrl(value); setError(''); };
  return <View style={[styles.screen, { backgroundColor: colors.background }]}><View style={styles.header}><Pressable onPress={() => router.back()}><Feather name="arrow-left" size={22} color={colors.foreground} /></Pressable><Text style={[styles.title, { color: colors.foreground }]}>Live Preview</Text><View style={styles.actions}><Pressable onPress={() => web.current?.reload()}><Feather name="refresh-cw" size={18} color={colors.foreground} /></Pressable><Pressable onPress={() => url && Linking.openURL(url)}><Feather name="external-link" size={18} color={colors.foreground} /></Pressable></View></View>
    <View style={[styles.urlRow, { backgroundColor: colors.card, borderColor: colors.border }]}><TextInput value={draft} onChangeText={setDraft} autoCapitalize="none" autoCorrect={false} placeholder="https://your-site.com or http://192.168.x.x:3000" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground }]} /><Pressable onPress={save} style={[styles.open, { backgroundColor: colors.primary }]}><Text style={{ color: colors.primaryForeground, fontWeight: '700' }}>Open</Text></Pressable></View>
    {!!error && <Text style={[styles.error, { color: '#D86B6B' }]}>{error}</Text>}
    {url ? <WebView ref={web} source={{ uri: url }} onError={() => setError('This preview could not be reached. Check the URL or make sure your computer and phone share Wi‑Fi.')} style={styles.web} /> : <View style={styles.empty}><Feather name="monitor" size={32} color={colors.primary} /><Text style={[styles.emptyTitle, { color: colors.foreground }]}>No preview URL yet</Text><Text style={{ color: colors.mutedForeground, textAlign: 'center' }}>Paste a deployed URL, GitHub Pages URL, or a local network dev-server URL above.</Text></View>}
  </View>;
}
const styles = StyleSheet.create({ screen: { flex: 1 }, header: { paddingTop: 54, paddingHorizontal: 18, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 15 }, title: { fontSize: 17, fontWeight: '700', flex: 1 }, actions: { flexDirection: 'row', gap: 18 }, urlRow: { marginHorizontal: 14, borderWidth: 1, borderRadius: 12, padding: 5, flexDirection: 'row', alignItems: 'center' }, input: { flex: 1, paddingHorizontal: 9, fontSize: 12 }, open: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 9 }, error: { padding: 12, fontSize: 12 }, web: { flex: 1, marginTop: 12 }, empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 }, emptyTitle: { fontSize: 18, fontWeight: '700' } });