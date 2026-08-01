import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

const projects = [
  { name: 'Habit Garden', detail: 'React · updated 2h ago', color: '#7DE2A8' },
  { name: 'Studio Dashboard', detail: 'Next.js · updated yesterday', color: '#9BA7FF' },
];

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const submit = () => {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      router.push({ pathname: '/editor', params: { prompt } });
      setPrompt('');
    }, 550);
  };
  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingTop: insets.top + 18, paddingBottom: 110 }}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>AI CODER</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>What will you build?</Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: colors.accent }]}><Feather name="code" color={colors.primary} size={20} /></View>
      </View>
      <View style={[styles.promptCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput testID="prompt-input" value={prompt} onChangeText={setPrompt} multiline placeholder="Describe an app you want to make..." placeholderTextColor={colors.mutedForeground} style={[styles.prompt, { color: colors.foreground }]} />
        <View style={styles.promptFooter}>
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>Local-first · BYOK ready</Text>
          <Pressable testID="generate-button" onPress={submit} style={({ pressed }) => [styles.send, { backgroundColor: prompt.trim() ? colors.primary : colors.secondary, opacity: pressed ? .7 : 1 }]}>
            <Feather name={generating ? 'loader' : 'arrow-up'} size={18} color={prompt.trim() ? colors.primaryForeground : colors.mutedForeground} />
          </Pressable>
        </View>
      </View>
      <View style={styles.sectionHead}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent projects</Text><Pressable onPress={() => router.push('/projects')}><Text style={{ color: colors.primary, fontWeight: '600' }}>See all</Text></Pressable></View>
      {projects.map((project) => <Pressable key={project.name} onPress={() => router.push('/editor')} style={({ pressed }) => [styles.project, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? .75 : 1 }]}><View style={[styles.projectIcon, { backgroundColor: project.color + '22' }]}><Feather name="box" color={project.color} size={19} /></View><View style={{ flex: 1 }}><Text style={[styles.projectName, { color: colors.foreground }]}>{project.name}</Text><Text style={[styles.projectDetail, { color: colors.mutedForeground }]}>{project.detail}</Text></View><Feather name="chevron-right" color={colors.mutedForeground} size={18} /></Pressable>)}
      <View style={[styles.tip, { backgroundColor: colors.accent }]}>
        <Feather name="zap" color={colors.primary} size={18} /><View style={{ flex: 1 }}><Text style={[styles.tipTitle, { color: colors.foreground }]}>Build privately</Text><Text style={[styles.tipText, { color: colors.secondaryForeground }]}>Connect your own model in Settings. Your keys stay on this device.</Text></View>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 }, eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 2 }, title: { fontSize: 27, fontWeight: '700', marginTop: 5 }, avatar: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, promptCard: { borderWidth: 1, borderRadius: 18, padding: 15, minHeight: 155 }, prompt: { fontSize: 16, lineHeight: 23, minHeight: 85, textAlignVertical: 'top' }, promptFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, hint: { fontSize: 12 }, send: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, sectionHead: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, marginBottom: 12 }, sectionTitle: { fontSize: 17, fontWeight: '700' }, project: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 10, gap: 12 }, projectIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, projectName: { fontSize: 15, fontWeight: '600' }, projectDetail: { fontSize: 12, marginTop: 4 }, tip: { flexDirection: 'row', gap: 12, padding: 16, borderRadius: 16, marginTop: 20 }, tipTitle: { fontWeight: '700', marginBottom: 4 }, tipText: { fontSize: 12, lineHeight: 18 },
});