import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, Linking, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getPreviewUrl, setPreviewUrl } from '@/lib/saveProject';
import { useAppTheme } from '@/lib/theme';

export default function PreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { project } = useLocalSearchParams<{ project?: string }>();
  const name = String(project ?? 'project');
  const web = useRef<WebView>(null);
  const [url, setUrl] = useState('');
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');

  // Hardware BackHandler for Android
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
    getPreviewUrl(name).then(value => {
      setUrl(value);
      setDraft(value);
    });
  }, [name]);

  const save = async () => {
    const value = draft.trim();
    if (!/^https?:\/\//i.test(value)) {
      setError('Use a deployed URL or a LAN URL such as http://192.168.1.20:3000.');
      return;
    }
    await setPreviewUrl(name, value);
    setUrl(value);
    setError('');
  };

  return (
    <LinearGradient colors={theme.gradient} locations={[0, 0.3, 0.6, 1]} style={styles.root}>
      <View style={[styles.screen, { paddingTop: insets.top + 10 }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
            <View style={[styles.iconButton, { backgroundColor: theme.glass, borderColor: theme.border }]}>
              <Feather name="arrow-left" size={18} color={theme.foreground} />
            </View>
          </Pressable>
          <View style={styles.titleWrap}>
            <Text style={[styles.title, { color: theme.foreground }]}>Live Preview</Text>
            <Text style={[styles.subTitle, { color: theme.mutedForeground }]}>{name}</Text>
          </View>
          <View style={styles.actions}>
            <Pressable onPress={() => web.current?.reload()} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
              <View style={[styles.iconButton, { backgroundColor: theme.glass, borderColor: theme.border }]}>
                <Feather name="refresh-cw" size={16} color={theme.foreground} />
              </View>
            </Pressable>
            <Pressable onPress={() => url && Linking.openURL(url)} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
              <View style={[styles.iconButton, { backgroundColor: theme.glass, borderColor: theme.border }]}>
                <Feather name="external-link" size={16} color={theme.foreground} />
              </View>
            </Pressable>
          </View>
        </View>

        {/* URL Input Bar */}
        <BlurView intensity={18} tint="dark" style={[styles.urlCard, { borderColor: theme.border }]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="https://your-site.com or http://192.168.x.x:3000"
            placeholderTextColor={theme.mutedForeground}
            style={[styles.input, { color: theme.foreground }]}
          />
          <Pressable onPress={save} style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}>
            <LinearGradient colors={[theme.accentBright, theme.accent]} style={styles.openBtn}>
              <Text style={[styles.openText, { color: theme.primaryForeground }]}>Open</Text>
            </LinearGradient>
          </Pressable>
        </BlurView>

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        {/* Android & Mobile Optimized WebView */}
        {url ? (
          <View style={styles.webContainer}>
            <WebView
              ref={web}
              source={{ uri: url }}
              javaScriptEnabled
              domStorageEnabled
              scalesPageToFit
              allowsInlineMediaPlayback
              mixedContentMode="always"
              onError={() => setError('This preview could not be reached. Check the URL or make sure your computer and phone share Wi‑Fi.')}
              style={styles.web}
            />
          </View>
        ) : (
          <View style={styles.empty}>
            <LinearGradient colors={[theme.accentBright, theme.accent]} style={styles.emptyBadge}>
              <Feather name="monitor" size={24} color={theme.primaryForeground} />
            </LinearGradient>
            <Text style={[styles.emptyTitle, { color: theme.foreground }]}>No preview URL set</Text>
            <Text style={[styles.emptySub, { color: theme.mutedForeground }]}>
              Paste a deployed site URL or a local network development server URL above to test your app.
            </Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  screen: { flex: 1 },
  header: { paddingHorizontal: 18, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconButton: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  titleWrap: { flex: 1 },
  title: { fontSize: 17, fontWeight: '700' },
  subTitle: { fontSize: 11, marginTop: 1 },
  actions: { flexDirection: 'row', gap: 8 },

  urlCard: { marginHorizontal: 18, borderRadius: 14, borderWidth: 1, padding: 6, flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, paddingHorizontal: 12, fontSize: 13 },
  openBtn: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10, justifyContent: 'center' },
  openText: { fontWeight: '700', fontSize: 13 },
  errorText: { marginHorizontal: 18, marginTop: 8, fontSize: 12, color: '#F87171' },

  webContainer: { flex: 1, marginTop: 12, overflow: 'hidden' },
  web: { flex: 1, backgroundColor: 'transparent' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  emptyBadge: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySub: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
});