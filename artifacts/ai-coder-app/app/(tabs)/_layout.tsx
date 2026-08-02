import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/lib/theme';
import { THEMES, ThemeName } from '@/constants/themes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Instant theme switcher ───────────────────────────────────────────────────
const THEME_LIST: { name: ThemeName; color: string; label: string }[] = [
  { name: 'violet', color: '#A78BFA', label: 'Violet' },
  { name: 'ember',  color: '#F97316', label: 'Ember'  },
  { name: 'ocean',  color: '#60A5FA', label: 'Ocean'  },
];

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: '/',          label: 'Build',    icon: 'code'    as const, segment: 'index'    },
  { href: '/projects',  label: 'Projects', icon: 'folder'  as const, segment: 'projects' },
  { href: '/settings',  label: 'Settings', icon: 'sliders' as const, segment: 'settings' },
] as const;

// 85% width on mobile / max 320px on desktop web
const DRAWER_WIDTH = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.85, 320) : 320;

// ─── iOS 26 native tabs ───────────────────────────────────────────────────────
function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: 'house', selected: 'house.fill' }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="projects">
        <Icon sf={{ default: 'folder', selected: 'folder.fill' }} />
        <Label>Projects</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Icon sf={{ default: 'gearshape', selected: 'gearshape.fill' }} />
        <Label>Settings</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

// ─── Mobile bottom tab bar ────────────────────────────────────────────────────
function MobileTabLayout() {
  const { theme } = useAppTheme();
  const isIOS = Platform.OS === 'ios';
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.accentBright,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.70)',
        headerShown: false,
        tabBarLabelStyle: { fontSize: 11, fontFamily: 'Inter_600SemiBold', marginTop: -2 },
        tabBarStyle: {
          position: 'absolute',
          bottom: isIOS ? 24 : 16,
          left: 20, right: 20,
          borderRadius: 24, height: 64,
          backgroundColor: theme.glassStrong,
          borderColor: theme.border, borderWidth: 1, borderTopWidth: 1,
          elevation: 8,
          shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3, shadowRadius: 16,
          paddingBottom: 8, paddingTop: 8, overflow: 'hidden',
        },
        tabBarBackground: () =>
          isIOS
            ? <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
            : <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.glassStrong }]} />,
      }}
    >
      <Tabs.Screen name="index"    options={{ title: 'Build',    tabBarIcon: ({ color, focused }) => <Feather name="code"    size={20} color={color} style={{ opacity: focused ? 1 : 0.85 }} /> }} />
      <Tabs.Screen name="projects" options={{ title: 'Projects', tabBarIcon: ({ color, focused }) => <Feather name="folder"  size={20} color={color} style={{ opacity: focused ? 1 : 0.85 }} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color, focused }) => <Feather name="sliders" size={20} color={color} style={{ opacity: focused ? 1 : 0.85 }} /> }} />
    </Tabs>
  );
}

// ─── Web collapsible drawer layout ───────────────────────────────────────────
function WebDrawerLayout() {
  const { theme, themeName, setThemeName } = useAppTheme();
  const router   = useRouter();
  const pathname = usePathname();
  const insets   = useSafeAreaInsets();

  const [open, setOpen] = useState(false);

  // Drawer slide: translateX from -DRAWER_WIDTH (hidden) → 0 (visible)
  const slideAnim   = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  // Backdrop opacity: 0 → 0.5
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: open ? 0 : -DRAWER_WIDTH,
        useNativeDriver: true,
        stiffness: 320, damping: 30,
      }),
      Animated.timing(backdropAnim, {
        toValue: open ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [open]);

  const isActive = (segment: string) =>
    segment === 'index' ? pathname === '/' : pathname.startsWith('/' + segment);

  const close = () => setOpen(false);
  const navigate = (href: string) => { router.push(href as any); close(); };

  return (
    <View style={styles.root}>
      {/* ── Hidden tabs for routing — no visible tab bar ── */}
      <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
        <Tabs.Screen name="index"    options={{ title: 'Build'    }} />
        <Tabs.Screen name="projects" options={{ title: 'Projects' }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      </Tabs>

      {/* ── Backdrop — tappable to close drawer ── */}
      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        style={[styles.backdrop, { opacity: backdropAnim }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>

      {/* ── Floating hamburger — always on top-left ── */}
      <View style={[styles.hamburgerWrap, { top: insets.top + 12 }]}>
        <Pressable
          onPress={() => setOpen(o => !o)}
          style={({ pressed }) => [
            styles.hamburger,
            {
              backgroundColor: pressed
                ? theme.accentSoft
                : theme.glassStrong,
              borderColor: theme.border,
            },
          ]}
        >
          <Feather name={open ? 'x' : 'menu'} size={18} color={theme.foreground} />
        </Pressable>
      </View>

      {/* ── Drawer — slides from left ── */}
      <Animated.View
        style={[
          styles.drawer,
          {
            width: DRAWER_WIDTH,
            transform: [{ translateX: slideAnim }],
            backgroundColor: theme.background === '#080615' ? '#0F0C22' : theme.background === '#0C0A08' ? '#181410' : '#0B182B',
            borderColor: theme.border,
            paddingTop: insets.top + 16,
          },
        ]}
      >
        {/* Clean, functional drawer header — no collision with X button */}
        <View style={styles.drawerHeader}>
          <Text style={[styles.drawerTitle, { color: theme.foreground }]}>Navigation</Text>
          <Pressable
            onPress={close}
            style={({ pressed }) => [
              styles.closeBtn,
              { backgroundColor: pressed ? theme.accentSoft : 'rgba(255,255,255,0.08)' },
            ]}
          >
            <Feather name="x" size={18} color={theme.foreground} />
          </Pressable>
        </View>

        <View style={[styles.drawerDivider, { backgroundColor: theme.border }]} />

        {/* Nav items */}
        <View style={styles.navList}>
          {NAV_ITEMS.map(item => {
            const active = isActive(item.segment);
            return (
              <Pressable
                key={item.href}
                onPress={() => navigate(item.href)}
                style={({ pressed }) => [
                  styles.navItem,
                  {
                    backgroundColor: active
                      ? theme.accentSoft
                      : pressed ? 'rgba(255,255,255,0.06)' : 'transparent',
                  },
                ]}
              >
                {/* Single clean active indicator — left bar only */}
                {active && (
                  <View style={[styles.activeBar, { backgroundColor: theme.accentBright }]} />
                )}

                {/* Icon */}
                <View style={[
                  styles.navIcon,
                  active
                    ? { overflow: 'hidden', borderRadius: 9 }
                    : { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 9 },
                ]}>
                  {active ? (
                    <LinearGradient colors={[theme.accentBright, theme.accent]} style={StyleSheet.absoluteFill} />
                  ) : null}
                  <Feather
                    name={item.icon}
                    size={16}
                    color={active ? '#fff' : 'rgba(255,255,255,0.85)'}
                  />
                </View>

                {/* Label */}
                <Text style={[
                  styles.navLabel,
                  {
                    color: active ? theme.accentBright : 'rgba(255,255,255,0.85)',
                    fontFamily: active ? 'Inter_600SemiBold' : 'Inter_400Regular',
                  },
                ]}>
                  {item.label}
                </Text>

                {active && (
                  <View style={[styles.activeDot, { backgroundColor: theme.accentBright }]} />
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.drawerDivider, { backgroundColor: theme.border, marginTop: 12 }]} />

        {/* Theme switcher */}
        <View style={styles.themeSection}>
          <Text style={[styles.themeLabel, { color: theme.mutedForeground }]}>THEME</Text>
          <View style={styles.themeRow}>
            {THEME_LIST.map(t => {
              const active = themeName === t.name;
              return (
                <Pressable
                  key={t.name}
                  onPress={() => setThemeName(t.name)}
                  style={({ pressed }) => [
                    styles.themeOption,
                    {
                      backgroundColor: active ? t.color + '22' : 'rgba(255,255,255,0.05)',
                      borderColor: active ? t.color : 'rgba(255,255,255,0.10)',
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <View style={[styles.themeDot, { backgroundColor: t.color }]} />
                  <Text style={[
                    styles.themeOptionLabel,
                    { color: active ? t.color : 'rgba(255,255,255,0.65)' },
                  ]}>
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function TabLayout() {
  if (Platform.OS === 'web') return <WebDrawerLayout />;
  if (isLiquidGlassAvailable()) return <NativeTabLayout />;
  return <MobileTabLayout />;
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Backdrop overlay — dark & heavy blur to prevent text bleed-through
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(12px)',
    zIndex: 90,
  },

  // Floating hamburger — overlaid on content when drawer is closed
  hamburgerWrap: {
    position: 'absolute',
    left: 16,
    zIndex: 80,
  },
  hamburger: {
    width: 44, height: 44,
    borderRadius: 12, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },

  // Drawer — slides in from left
  drawer: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    borderRightWidth: 1,
    zIndex: 100,
    paddingHorizontal: 16,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },

  drawerHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 4, paddingBottom: 16, paddingTop: 4,
  },
  drawerTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  drawerDivider: { height: 1, marginHorizontal: 0, marginBottom: 16 },

  // Nav
  navList: { gap: 3 },
  navItem: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, gap: 12,
    paddingVertical: 6, paddingLeft: 6, paddingRight: 12,
    position: 'relative', overflow: 'hidden',
  },
  // Single active indicator — left bar only (no double-highlight)
  activeBar: {
    position: 'absolute', left: 0, top: 8, bottom: 8,
    width: 3, borderRadius: 2,
  },
  navIcon: {
    width: 34, height: 34,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  navLabel: { fontSize: 14, flex: 1 },
  activeDot: {
    width: 6, height: 6, borderRadius: 3,
    opacity: 0.7,
  },

  // Theme switcher
  themeSection: { paddingHorizontal: 4, paddingTop: 10, gap: 10 },
  themeLabel: {
    fontSize: 10, fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.2, textTransform: 'uppercase',
  },
  themeRow: { gap: 6 },
  themeOption: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 10, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 8,
  },
  themeDot: { width: 10, height: 10, borderRadius: 5 },
  themeOptionLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
});
