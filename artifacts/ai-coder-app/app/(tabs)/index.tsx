import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGenerate } from '@/lib/useGenerate';
import { ProjectMeta, PROJECTS_KEY, saveProject } from '@/lib/saveProject';
import { useAppTheme } from '@/lib/theme';
import { findAnswer, getSuggestions, QAEntry } from '@/lib/qaDatabase';
import { LOCAL_KEYS } from '@/lib/localKeysManager';
import { estimateGenerationCost } from '@/lib/costCalculator';

// ─── Constants ───────────────────────────────────────────────────────────────
export type ModelEntry = {
  id: string;
  label: string;
  provider: 'Groq' | 'Gemini' | 'OpenRouter' | 'OpenAI' | 'Anthropic' | 'Ollama';
  speed: string;
};

const MODELS: ModelEntry[] = [
  // ── Connected Models (Keys Provided) ──
  { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B', provider: 'Groq', speed: 'Fast' },
  { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B', provider: 'Groq', speed: 'Smart' },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', provider: 'Gemini', speed: 'Fast' },
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', provider: 'Gemini', speed: 'Smart' },
  { id: 'openrouter-llama-3.1-8b', label: 'OpenRouter Llama 3.1', provider: 'OpenRouter', speed: 'Free' },
  { id: 'openrouter-auto', label: 'OpenRouter Auto', provider: 'OpenRouter', speed: 'Best' },
  // ── Additional Models (Key Required) ──
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: 'OpenAI', speed: 'Fast' },
  { id: 'gpt-4o', label: 'GPT-4o', provider: 'OpenAI', speed: 'Best' },
  { id: 'claude-haiku-3-5', label: 'Claude Haiku 3.5', provider: 'Anthropic', speed: 'Fast' },
  { id: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5', provider: 'Anthropic', speed: 'Smart' },
];

const TEMPERATURES = [
  { id: 0.0, label: 'Precise', icon: 'target' as const, desc: 'Exact, deterministic' },
  { id: 0.4, label: 'Balanced', icon: 'sliders' as const, desc: 'Mix of creative & structured' },
  { id: 0.8, label: 'Creative', icon: 'zap' as const, desc: 'More variety, novel ideas' },
  { id: 1.2, label: 'Wild', icon: 'shuffle' as const, desc: 'Highly experimental' },
];

// ─── Types ────────────────────────────────────────────────────────────────────
export type ProcedureOption = {
  label: string;
  value: string;
  icon?: string;
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  type: 'qa' | 'generate' | 'error' | 'procedure';
  thinkingSteps?: string[];
  currentStepIndex?: number;
  isThinking?: boolean;
  procedureTitle?: string;
  procedureDesc?: string;
  options?: ProcedureOption[];
  selectedOption?: string;
};

function looksLikeQuestion(text: string): boolean {
  const t = text.trim().toLowerCase();
  const starters = ['what', 'how', 'why', 'where', 'when', 'who', 'is', 'are', 'can', 'do',
    'does', 'will', 'which', 'tell', 'explain', 'help', 'hi', 'hello', 'hey', 'thanks', 'thank'];
  return t.endsWith('?') || starters.includes(t.split(/\s+/)[0]);
}

// ─── Thinking Animation Component ─────────────────────────────────────────────
function ThinkingAnimation({
  steps,
  currentStepIndex,
  theme,
}: {
  steps: string[];
  currentStepIndex: number;
  theme: any;
}) {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 550, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 550, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <View style={styles.thinkingContainer}>
      <View style={styles.thinkingHeader}>
        <Animated.View
          style={[
            styles.thinkingOrb,
            { backgroundColor: theme.accentBright, opacity: pulseAnim },
          ]}
        />
        <Text style={[styles.thinkingTitle, { color: theme.accentBright }]}>
          Thinking & Planning…
        </Text>
      </View>
      <View style={styles.thinkingStepsList}>
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          return (
            <View key={idx} style={styles.thinkingStepItem}>
              <Feather
                name={isDone ? 'check-circle' : isCurrent ? 'loader' : 'circle'}
                size={12}
                color={isDone ? '#34D399' : isCurrent ? theme.accentBright : theme.mutedForeground}
              />
              <Text
                style={[
                  styles.thinkingStepText,
                  {
                    color: isDone
                      ? '#34D399'
                      : isCurrent
                      ? theme.foreground
                      : theme.mutedForeground,
                    fontFamily: isCurrent ? 'Inter_600SemiBold' : 'Inter_400Regular',
                  },
                ]}
              >
                {step}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─── Procedure & Directory Selection Component ──────────────────────────────
function ProcedureCard({
  msg,
  onSelectOption,
  theme,
}: {
  msg: ChatMessage;
  onSelectOption?: (option: string) => void;
  theme: any;
}) {
  return (
    <View style={[styles.procedureCard, { borderColor: theme.border, backgroundColor: theme.glassStrong }]}>
      <View style={styles.procedureHeader}>
        <Feather name="folder" size={14} color={theme.accentBright} />
        <Text style={[styles.procedureTitle, { color: theme.foreground }]}>
          {msg.procedureTitle || 'Select Directory & Layout Options'}
        </Text>
      </View>
      <Text style={[styles.procedureSub, { color: theme.mutedForeground }]}>
        {msg.procedureDesc || 'Choose target root directory for your project source files:'}
      </Text>
      <View style={styles.procedureChipsWrap}>
        {msg.options?.map(opt => {
          const isSelected = msg.selectedOption === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onSelectOption?.(opt.value)}
              style={({ pressed }) => [
                styles.procedureChip,
                {
                  borderColor: isSelected ? theme.accentBright : theme.border,
                  backgroundColor: isSelected ? theme.accentSoft : pressed ? 'rgba(255,255,255,0.06)' : 'transparent',
                },
              ]}
            >
              <Feather
                name={isSelected ? 'check-circle' : (opt.icon as any) || 'folder'}
                size={13}
                color={isSelected ? theme.accentBright : theme.foreground}
              />
              <Text
                style={[
                  styles.procedureChipText,
                  {
                    color: isSelected ? theme.accentBright : theme.foreground,
                    fontFamily: isSelected ? 'Inter_600SemiBold' : 'Inter_400Regular',
                  },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ─── Bubble ───────────────────────────────────────────────────────────────────
function Bubble({
  msg,
  theme,
  onSelectOption,
}: {
  msg: ChatMessage;
  theme: any;
  onSelectOption?: (msgId: string, value: string) => void;
}) {
  const isUser = msg.role === 'user';
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(10)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, []);
  const isError = msg.type === 'error';
  return (
    <Animated.View style={[
      styles.bubbleRow,
      isUser ? styles.bubbleRight : styles.bubbleLeft,
      { opacity: fade, transform: [{ translateY: slide }] },
    ]}>
      {!isUser && (
        <View style={[styles.avatar, { overflow: 'hidden', borderRadius: 10 }]}>
          <LinearGradient colors={[theme.accentBright, theme.accent]} style={StyleSheet.absoluteFill} />
          <Feather name="zap" size={12} color="#fff" />
        </View>
      )}
      <View style={[
        styles.bubble,
        isUser
          ? { backgroundColor: theme.accent }
          : isError
          ? { backgroundColor: 'rgba(248,113,113,0.15)', borderColor: 'rgba(248,113,113,0.4)', borderWidth: 1 }
          : { backgroundColor: theme.glassStrong, borderColor: theme.border, borderWidth: 1 },
        isUser ? styles.bubbleTailRight : styles.bubbleTailLeft,
      ]}>
        <Text style={[
          styles.bubbleText,
          { color: isUser ? '#fff' : isError ? '#F87171' : theme.foreground },
        ]}>
          {msg.text}
        </Text>

        {/* Thinking Animation Steps */}
        {msg.isThinking && msg.thinkingSteps && (
          <ThinkingAnimation
            steps={msg.thinkingSteps}
            currentStepIndex={msg.currentStepIndex ?? 0}
            theme={theme}
          />
        )}

        {/* Interactive Procedure / Directory Selector Card */}
        {msg.type === 'procedure' && msg.options && (
          <ProcedureCard
            msg={msg}
            onSelectOption={val => onSelectOption?.(msg.id, val)}
            theme={theme}
          />
        )}

        {msg.type === 'generate' && !msg.isThinking && (
          <View style={styles.genBadge}>
            <Feather name="cpu" size={10} color={theme.accentBright} />
            <Text style={[styles.genBadgeText, { color: theme.accentBright }]}>generating…</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

// ─── Picker modal ─────────────────────────────────────────────────────────────
function ModelPickerModal({
  visible,
  selected,
  keysState,
  onSelect,
  onClose,
  theme,
}: {
  visible: boolean;
  selected: string;
  keysState: Record<string, boolean>;
  onSelect: (id: string) => void;
  onClose: () => void;
  theme: any;
}) {
  const [showOthers, setShowOthers] = useState(false);

  // Dynamic filtering: Models with valid API keys automatically join the main Connected list!
  const connectedModels = MODELS.filter(m => keysState[m.provider]);
  const otherModels = MODELS.filter(m => !keysState[m.provider]);

  const renderItem = (item: ModelEntry) => {
    const active = item.id === selected;
    const isConnected = keysState[item.provider] ?? false;
    return (
      <Pressable
        key={item.id}
        onPress={() => {
          onSelect(item.id);
          onClose();
        }}
        style={[
          styles.modalItem,
          {
            borderColor: active ? theme.accentBright : 'transparent',
            backgroundColor: active ? theme.accentSoft : 'transparent',
          },
        ]}
      >
        <View style={styles.modalItemLeft}>
          {active && (
            <View style={[styles.activeIndicator, { backgroundColor: theme.accentBright }]} />
          )}
          <Text style={[styles.modalItemLabel, { color: theme.foreground, fontFamily: 'Inter_600SemiBold' }]}>
            {item.label}
          </Text>
        </View>
        <View style={styles.modelMeta}>
          <View
            style={[
              styles.connectedPill,
              { backgroundColor: isConnected ? 'rgba(52,211,153,0.14)' : 'rgba(245,158,11,0.14)' },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isConnected ? '#34D399' : '#F59E0B' },
              ]}
            />
            <Text
              style={[
                styles.connectedText,
                { color: isConnected ? '#34D399' : '#F59E0B' },
              ]}
            >
              {isConnected ? 'Connected' : 'No Key'}
            </Text>
          </View>
          <View style={[styles.providerBadge, { backgroundColor: theme.accentSoft }]}>
            <Text style={[styles.providerText, { color: theme.accentBright }]}>{item.provider}</Text>
          </View>
          <Text style={[styles.speedLabel, { color: theme.mutedForeground }]}>{item.speed}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={[styles.modalSheet, { backgroundColor: theme.card, borderColor: theme.border, maxHeight: '80%' }]}>
          <View style={[styles.modalHandle, { backgroundColor: theme.border }]} />
          <Text style={[styles.modalTitle, { color: theme.foreground }]}>Choose Model</Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Connected Models Section (Main List) */}
            {connectedModels.length > 0 && (
              <View style={{ marginBottom: 14 }}>
                <Text style={[styles.sectionHeaderTitle, { color: theme.accentBright }]}>
                  ⚡ CONNECTED APIS ({connectedModels.length})
                </Text>
                {connectedModels.map(renderItem)}
              </View>
            )}

            {/* Other Models Section (Collapsible Dropdown Accordion) */}
            {otherModels.length > 0 && (
              <View style={{ marginTop: 4 }}>
                <Pressable
                  onPress={() => setShowOthers(v => !v)}
                  style={({ pressed }) => [
                    styles.dropdownHeader,
                    { backgroundColor: pressed ? theme.accentSoft : 'rgba(255,255,255,0.04)', borderColor: theme.border },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Feather name="lock" size={12} color={theme.mutedForeground} />
                    <Text style={[styles.sectionHeaderTitle, { color: theme.mutedForeground, marginBottom: 0, marginTop: 0 }]}>
                      OTHER PROVIDERS (KEY REQUIRED) · {otherModels.length}
                    </Text>
                  </View>
                  <Feather name={showOthers ? 'chevron-up' : 'chevron-down'} size={14} color={theme.mutedForeground} />
                </Pressable>

                {showOthers && (
                  <View style={{ marginTop: 8 }}>
                    {otherModels.map(renderItem)}
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function PickerModal<T extends { id: any; label: string }>({
  visible, title, items, selected, onSelect, onClose, theme,
  renderExtra,
}: {
  visible: boolean; title: string;
  items: T[]; selected: T['id'];
  onSelect: (id: T['id']) => void; onClose: () => void;
  theme: any; renderExtra?: (item: T) => React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={[styles.modalSheet, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.modalHandle, { backgroundColor: theme.border }]} />
          <Text style={[styles.modalTitle, { color: theme.foreground }]}>{title}</Text>
          {items.map(item => {
            const active = item.id === selected;
            return (
              <Pressable
                key={String(item.id)}
                onPress={() => { onSelect(item.id); onClose(); }}
                style={[
                  styles.modalItem,
                  { borderColor: active ? theme.accentBright : 'transparent',
                    backgroundColor: active ? theme.accentSoft : 'transparent' },
                ]}
              >
                <View style={styles.modalItemLeft}>
                  {active && (
                    <View style={[styles.activeIndicator, { backgroundColor: theme.accentBright }]} />
                  )}
                  <Text style={[styles.modalItemLabel, { color: theme.foreground, fontFamily: 'Inter_600SemiBold' }]}>
                    {item.label}
                  </Text>
                </View>
                {renderExtra?.(item)}
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const scrollRef = useRef<ScrollView>(null);
  const generate = useGenerate();

  // Chat state
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [projects, setProjects] = useState<ProjectMeta[]>([]);
  const [inputFocused, setInputFocused] = useState(false);

  // Toolbar & Provider Status state
  const [modelId, setModelId] = useState(MODELS[0].id);
  const [temperature, setTemperature] = useState(0.4);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showTempPicker, setShowTempPicker] = useState(false);
  const [keysState, setKeysState] = useState<Record<string, boolean>>({
    Groq: true,
    Gemini: true,
    OpenRouter: true,
    OpenAI: false,
    Anthropic: false,
    Ollama: false,
  });

  const selectedModel = MODELS.find(m => m.id === modelId) ?? MODELS[0];
  const selectedTemp = TEMPERATURES.find(t => t.id === temperature) ?? TEMPERATURES[1];
  const suggestions = getSuggestions();

  useEffect(() => {
    AsyncStorage.getItem(PROJECTS_KEY).then(v => v && setProjects(JSON.parse(v)));
    AsyncStorage.getItem('ai-coder-model').then(v => v && setModelId(v));

    // Dynamically check key status for all providers from secrets & AsyncStorage
    const checkKeys = async () => {
      const providers = ['Groq', 'Gemini', 'OpenRouter', 'OpenAI', 'Anthropic', 'Ollama'];
      const status: Record<string, boolean> = {};
      for (const p of providers) {
        const specificKey = await AsyncStorage.getItem(`ai-coder-key-${p}`);
        const globalKey = await AsyncStorage.getItem('ai-coder-key');
        const defaultProvider = await AsyncStorage.getItem('ai-coder-provider') || 'Groq';

        // Check local secret fallbacks
        const hasSecretKey = p in LOCAL_KEYS && Boolean(LOCAL_KEYS[p as keyof typeof LOCAL_KEYS]);
        const hasStoredKey = Boolean(specificKey) || (p === defaultProvider && Boolean(globalKey));

        status[p] = hasSecretKey || hasStoredKey;
      }
      setKeysState(status);
    };
    checkKeys();
  }, [showModelPicker]);

  useEffect(() => {
    if (messages.length > 0) setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, [messages]);

  const addMsg = (msg: Omit<ChatMessage, 'id'>) => {
    const id = Date.now().toString() + Math.random();
    setMessages(cur => [...cur, { ...msg, id }]);
    return id;
  };

  const executeGeneration = async (userPrompt: string, targetDirectory: string) => {
    setGenerating(true);

    const thinkingSteps = [
      'Analyzing prompt & game mechanics…',
      `Configuring target directory "${targetDirectory}"…`,
      'Designing component architecture & UI styling…',
      'Executing code generation with ' + selectedModel.label + '…',
    ];

    // Add assistant message with live thinking steps
    const msgId = addMsg({
      role: 'assistant',
      text: `Planning & building "${userPrompt}"…`,
      type: 'generate',
      isThinking: true,
      thinkingSteps,
      currentStepIndex: 0,
    });

    // Step-by-step thinking animation loop
    for (let step = 0; step < thinkingSteps.length - 1; step++) {
      await new Promise(r => setTimeout(r, 650));
      setMessages(cur =>
        cur.map(m => (m.id === msgId ? { ...m, currentStepIndex: step + 1 } : m))
      );
    }

    try {
      const result = await generate(userPrompt);
      const saved = await saveProject(result);
      setProjects(cur => [saved, ...cur.filter(p => p.name !== saved.name)]);

      setMessages(cur =>
        cur.map(m =>
          m.id === msgId
            ? {
                ...m,
                isThinking: false,
                text: `✓ "${saved.name}" ready — ${saved.fileCount} files generated in ${targetDirectory}.`,
                type: 'qa',
              }
            : m
        )
      );

      setTimeout(() => router.push({ pathname: '/editor', params: { project: saved.name } }), 600);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Generation failed.';
      setMessages(cur =>
        cur.map(m =>
          m.id === msgId ? { ...m, isThinking: false, text: errMsg, type: 'error' } : m
        )
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectProcedureOption = (msgId: string, val: string) => {
    setMessages(cur =>
      cur.map(m => (m.id === msgId ? { ...m, selectedOption: val } : m))
    );

    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    const userPrompt = lastUserMsg?.text || 'New App';

    executeGeneration(userPrompt, val);
  };

  const submit = async () => {
    const text = prompt.trim();
    if (!text || generating) return;
    setPrompt('');
    addMsg({ role: 'user', text, type: 'qa' });

    // Q&A — fully local, no API
    if (looksLikeQuestion(text)) {
      setTimeout(() => {
        const { answer } = findAnswer(text);
        addMsg({ role: 'assistant', text: answer, type: 'qa' });
      }, 280);
      return;
    }

    // Save model preference
    await AsyncStorage.setItem('ai-coder-model', modelId);

    // Procedure Workflow: Present interactive directory & template selector card
    addMsg({
      role: 'assistant',
      text: `Let's configure your app build procedure for "${text}":`,
      type: 'procedure',
      procedureTitle: 'Procedure Step 1: Select Directory & Layout',
      procedureDesc: 'Choose target project directory and component architecture:',
      options: [
        { label: 'artifacts/ai-coder-app', value: 'artifacts/ai-coder-app', icon: 'folder' },
        { label: 'src/app (Default)', value: 'src/app', icon: 'code' },
        { label: 'artifacts/mobile-game', value: 'artifacts/mobile-game', icon: 'play-circle' },
        { label: 'custom/root', value: 'custom/root', icon: 'hard-drive' },
      ],
    });
  };

  const hasChat = messages.length > 0;

  return (
    <LinearGradient colors={theme.gradient} locations={[0, 0.3, 0.6, 1]} style={styles.root}>
      {/* Ambient glow — small, contained */}
      <View style={[styles.glow, { backgroundColor: theme.glow }]} />

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 24,
            // Extra bottom padding so content clears the docked input bar
            paddingBottom: 180,
            // flexGrow fills the full height so empty state centers vertically
            flexGrow: 1,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Chat messages ── */}
        {hasChat && (
          <View style={styles.chatList}>
            {messages.map(m => (
              <Bubble
                key={m.id}
                msg={m}
                theme={theme}
                onSelectOption={handleSelectProcedureOption}
              />
            ))}
          </View>
        )}

        {/* ── Hero Brand Lockup + Suggestions (empty state only) ── */}
        {!hasChat && (
          <View style={styles.emptyState}>
            {/* Unified Hero Brand Lockup: rocket + wordmark tightly attached (gap 8) */}
            <View style={styles.heroBrandLockup}>
              <Image
                source={require('@/assets/images/icon.png')}
                style={styles.heroLogo}
                tintColor={theme.foreground}
              />
              <View style={styles.heroBrandTextWrap}>
                <Text style={[styles.heroAppName, { color: theme.foreground }]}>VELOCITY</Text>
                <Text style={[styles.heroTagline, { color: 'rgba(255,255,255,0.80)' }]}>AI App Builder</Text>
              </View>
            </View>

            <Text style={[styles.emptyTitle, { color: theme.foreground }]}>
              What will you build?
            </Text>
            {/* 0.80 — readable on deep purple WCAG AA */}
            <Text style={[styles.emptySubtitle, { color: 'rgba(255,255,255,0.80)' }]}>
              Describe an app to generate code, or ask a question for instant help.
            </Text>
            {/* Grid: 2 columns max — prevents single-row overflow on mobile */}
            <View style={styles.chips}>
              {suggestions.map((s: QAEntry, i: number) => (
                <Pressable
                  key={s.id}
                  onPress={() => setPrompt(s.question)}
                  style={({ pressed }) => [
                    styles.chip,
                    { backgroundColor: pressed ? theme.accentSoft : theme.glass, borderColor: theme.border },
                  ]}
                >
                  <Feather name="message-circle" size={11} color={theme.accentBright} style={{ marginRight: 5 }} />
                  <Text style={[styles.chipText, { color: theme.foreground }]}>{s.question}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* ── Recent projects (empty state only) ── */}
        {!hasChat && projects.length > 0 && (
          <>
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: theme.foreground, fontFamily: 'Inter_600SemiBold' }]}>
                Recent
              </Text>
              <Pressable onPress={() => router.push('/projects')}>
                <Text style={[styles.seeAll, { color: theme.accentBright, fontFamily: 'Inter_600SemiBold' }]}>
                  See all
                </Text>
              </Pressable>
            </View>
            {projects.slice(0, 2).map(p => (
              <Pressable
                key={p.name}
                onPress={() => router.push({ pathname: '/editor', params: { project: p.name } })}
                style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
              >
                <View style={[styles.projectRow, { backgroundColor: theme.glass, borderColor: theme.border }]}>
                  <View style={[styles.projectIcon, { overflow: 'hidden', borderRadius: 10 }]}>
                    <LinearGradient colors={[theme.accentBright, theme.accent]} style={StyleSheet.absoluteFill} />
                    <Feather name="box" size={14} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.projectName, { color: theme.foreground, fontFamily: 'Inter_600SemiBold' }]}>
                      {p.name}
                    </Text>
                    <Text style={[styles.projectMeta, { color: theme.mutedForeground }]}>
                      {p.fileCount} files · {new Date(p.created).toLocaleDateString()}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={theme.mutedForeground} />
                </View>
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>

      {/* ── Input dock — anchored to bottom, sidebar-aware on web ── */}
      <View style={[
        styles.dock,
        {
          bottom: Platform.OS === 'web' ? 16 : insets.bottom + 68,
          backgroundColor: theme.glassStrong,
          // Accent border on focus for clear interactive affordance
          borderColor: inputFocused ? theme.accentBright : theme.border,
          borderWidth: inputFocused ? 1.5 : 1,
        },
      ]}>
        {/* Text input */}
        <TextInput
          testID="prompt-input"
          value={prompt}
          onChangeText={setPrompt}
          multiline
          placeholder={hasChat ? 'Ask or describe your next app…' : 'Describe an app or ask a question…'}
          placeholderTextColor="rgba(255,255,255,0.55)"
          style={[styles.dockInput, { color: theme.foreground }]}
          onSubmitEditing={submit}
          blurOnSubmit={false}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
        />

        {/* ── Toolbar row ── */}
        <View style={styles.toolbar}>
          {/* Model selector with small connection status dot */}
          <Pressable
            onPress={() => setShowModelPicker(true)}
            style={({ pressed }) => [
              styles.toolBtn,
              { backgroundColor: pressed ? theme.accentSoft : theme.glass, borderColor: theme.border },
            ]}
          >
            <View style={[
              styles.statusDot,
              { backgroundColor: keysState[selectedModel.provider] ? '#34D399' : '#F59E0B' }
            ]} />
            <Text style={[styles.toolBtnText, { color: theme.foreground }]}>
              {selectedModel.label}
            </Text>
            <View style={[styles.speedBadge, { backgroundColor: theme.accentSoft }]}>
              <Text style={[styles.speedText, { color: theme.accentBright }]}>{selectedModel.speed}</Text>
            </View>
            <Feather name="chevron-down" size={11} color={theme.mutedForeground} />
          </Pressable>

          {/* Temperature selector */}
          <Pressable
            onPress={() => setShowTempPicker(true)}
            style={({ pressed }) => [
              styles.toolBtn,
              { backgroundColor: pressed ? theme.accentSoft : theme.glass, borderColor: theme.border },
            ]}
          >
            <Feather name={selectedTemp.icon} size={12} color={theme.accentBright} />
            <Text style={[styles.toolBtnText, { color: theme.foreground }]}>{selectedTemp.label}</Text>
            <Feather name="chevron-down" size={11} color={theme.mutedForeground} />
          </Pressable>

          {/* Real-Time Price & Token Estimation Badge */}
          <View style={[styles.priceEstBadge, { backgroundColor: theme.accentSoft, borderColor: theme.border }]}>
            <Feather name="dollar-sign" size={10} color={theme.accentBright} />
            <Text style={[styles.priceEstText, { color: theme.accentBright }]}>
              {estimateGenerationCost(selectedModel.id, prompt).estimatedCostFormatted}
            </Text>
          </View>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* Clear chat */}
          {hasChat && (
            <Pressable
              onPress={() => setMessages([])}
              style={[styles.iconBtn, { backgroundColor: theme.glass, borderColor: theme.border }]}
            >
              <Feather name="trash-2" size={15} color={theme.mutedForeground} />
            </Pressable>
          )}

          {/* Send button — ALWAYS amber/vibrant, dims only when truly disabled */}
          <Pressable
            testID="generate-button"
            onPress={submit}
            disabled={generating}
            style={({ pressed }) => [
              styles.sendBtn,
              { opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <LinearGradient
              colors={[theme.accentBright, theme.accent]}
              style={[styles.sendBtnInner, !prompt.trim() && { opacity: 0.45 }]}
            >
              <Feather
                name={generating ? 'loader' : 'arrow-up'}
                size={17}
                color="#fff"
              />
            </LinearGradient>
          </Pressable>
        </View>
      </View>

      {/* ── Model picker modal ── */}
      <ModelPickerModal
        visible={showModelPicker}
        selected={modelId}
        keysState={keysState}
        onSelect={v => setModelId(v)}
        onClose={() => setShowModelPicker(false)}
        theme={theme}
      />

      {/* ── Temperature picker modal ── */}
      <PickerModal
        visible={showTempPicker}
        title="Creativity / Temperature"
        items={TEMPERATURES}
        selected={temperature}
        onSelect={v => setTemperature(v)}
        onClose={() => setShowTempPicker(false)}
        theme={theme}
        renderExtra={item => (
          <Text style={[styles.tempDesc, { color: theme.mutedForeground }]}>{item.desc}</Text>
        )}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  scroll: { flex: 1 },
  // Constrain content to a readable max-width, centered on desktop
  content: {
    paddingHorizontal: 20,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center' as const,
  },
  // Soft blurred glow — overflow:hidden on root clips hard edges
  glow: {
    position: 'absolute', top: -120, right: -120,
    width: 320, height: 320, borderRadius: 160,
    opacity: 0.25,
    // React Native web respects filter via style on View
  },

  // Hero Brand Lockup
  heroBrandLockup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  heroLogo: { width: 42, height: 42 },
  heroBrandTextWrap: { alignItems: 'flex-start' },
  heroAppName: { fontSize: 22, letterSpacing: 4, fontFamily: 'Inter_700Bold' },
  heroTagline: { fontSize: 11, marginTop: 1, fontFamily: 'Inter_400Regular' },

  // Chat
  chatList: { gap: 10, marginBottom: 12 },
  bubbleRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  bubbleLeft: { justifyContent: 'flex-start' },
  bubbleRight: { justifyContent: 'flex-end' },
  avatar: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  bubble: { maxWidth: '80%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleTailLeft: { borderBottomLeftRadius: 4 },
  bubbleTailRight: { borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 21, fontFamily: 'Inter_400Regular' },
  genBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  genBadgeText: { fontSize: 11, fontFamily: 'Inter_400Regular' },

  // Empty state — vertically centered with 2-column chip grid
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    marginBottom: 20,
    flex: 1,
    minHeight: 280,
  },
  emptyTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', marginBottom: 10, textAlign: 'center' },
  emptySubtitle: {
    fontSize: 14, fontFamily: 'Inter_400Regular',
    textAlign: 'center', lineHeight: 21, marginBottom: 24,
    maxWidth: 420,
  },
  // 2-column grid: each chip takes ~48% width, wraps naturally
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 540 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 20, borderWidth: 1,
    paddingHorizontal: 13, paddingVertical: 8,
    // Each chip takes roughly half the container — max 2 per row
    flexBasis: '46%', flexGrow: 0,
  },
  chipText: { fontSize: 12, fontFamily: 'Inter_400Regular', flex: 1 },

  // Projects
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 13 },
  seeAll: { fontSize: 13 },
  projectRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 8,
  },
  projectIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  projectName: { fontSize: 14 },
  projectMeta: { fontSize: 12, marginTop: 1, fontFamily: 'Inter_400Regular' },

  // Input dock — max-width matching chat container
  dock: {
    position: 'absolute',
    left: 16, right: 16,
    maxWidth: 720,
    alignSelf: 'center' as const,
    borderRadius: 20, borderWidth: 1,
    overflow: 'hidden',
  },
  dockInput: {
    fontSize: 15, fontFamily: 'Inter_400Regular',
    lineHeight: 22, maxHeight: 140,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8,
    minHeight: 52,
    // Ensure placeholder is always readable (WCAG AA)
    color: 'rgba(255,255,255,0.87)',
  },

  // Toolbar
  toolbar: {
    flexDirection: 'row', alignItems: 'center',
    gap: 6, paddingHorizontal: 10, paddingBottom: 10, paddingTop: 4,
  },
  toolBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 10, borderWidth: 1,
    // More vertical padding — feel like distinct interactive controls
    paddingHorizontal: 10, paddingVertical: 8,
    // Elevated glass: bg-white/5 border-white/10
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.12)',
  },
  toolBtnText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  speedBadge: { borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1 },
  speedText: { fontSize: 9, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.5 },
  iconBtn: {
    width: 34, height: 34, borderRadius: 10, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtn: { width: 36, height: 36, borderRadius: 10, overflow: 'hidden' },
  sendBtnInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Thinking Animation styles
  thinkingContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  thinkingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  thinkingOrb: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  thinkingTitle: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.3,
  },
  thinkingStepsList: {
    gap: 6,
    paddingLeft: 4,
  },
  thinkingStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  thinkingStepText: {
    fontSize: 12,
  },

  // Price estimation badge styles
  priceEstBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  priceEstText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
  },

  // Procedure & Directory Card styles
  procedureCard: {
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  procedureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  procedureTitle: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  procedureSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    lineHeight: 16,
  },
  procedureChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  procedureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  procedureChipText: {
    fontSize: 11,
  },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, borderBottomWidth: 0,
    paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12,
  },
  modalHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', marginBottom: 12 },
  modalItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 6,
  },
  modalItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  activeIndicator: { width: 6, height: 6, borderRadius: 3 },
  modalItemLabel: { fontSize: 14 },
  dropdownHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10,
    marginBottom: 4,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 6,
  },
  modelMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  connectedPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2,
  },
  connectedText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  providerBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  providerText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  speedLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  tempDesc: { fontSize: 12, fontFamily: 'Inter_400Regular' },
});
