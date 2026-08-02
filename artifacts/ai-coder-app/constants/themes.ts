export type ThemeName = 'violet' | 'ember' | 'ocean';

export type AppTheme = {
  name: ThemeName;
  label: string;
  description: string;
  swatches: string[];
  gradient: readonly [string, string, string, string];
  glow: string;
  glowSecondary: string;
  border: string;
  glass: string;
  glassStrong: string;
  accent: string;
  accentBright: string;
  accentSoft: string;
  accentText: string;
  foreground: string;
  mutedForeground: string;
  background: string;
  card: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  accentSurface: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  input: string;
};

export const THEMES: Record<ThemeName, AppTheme> = {
  violet: {
    name: 'violet',
    label: 'Aurora Violet',
    description: 'Luminous lavender glass',
    swatches: ['#C9AEFF', '#8B6BE8', '#271C50'],
    // Deep-to-darker purple — no light-at-top / dark-mud-at-bottom split
    gradient: ['#2D1B69', '#1C0F52', '#110930', '#080615'],
    glow: 'rgba(167,139,250,0.40)',
    glowSecondary: 'rgba(124,58,237,0.28)',
    border: 'rgba(167,139,250,0.30)',
    glass: 'rgba(255,255,255,0.06)',
    glassStrong: 'rgba(14,9,32,0.90)',
    accent: '#A78BFA',
    accentBright: '#C4B5FD',
    accentSoft: 'rgba(167,139,250,0.18)',
    accentText: '#EDE9FE',
    foreground: '#FFFFFF',
    // 0.70 → readable on both light purple top and dark bottom (WCAG AA)
    mutedForeground: 'rgba(255,255,255,0.70)',
    background: '#080615',
    card: '#1B1631',
    primary: '#A78BFA',
    primaryForeground: '#FFFFFF',
    secondary: '#282043',
    secondaryForeground: '#EDE9FE',
    muted: '#211A39',
    accentSurface: '#33245C',
    accentForeground: '#EDE9FE',
    destructive: '#F87171',
    destructiveForeground: '#FFFFFF',
    input: '#3D3060',
  },
  ember: {
    name: 'ember',
    label: 'Ember',
    description: 'Deep space amber — WCAG AA',
    swatches: ['#FB923C', '#F97316', '#0C0A08'],
    // Deep obsidian gradient — no more muddy brown
    gradient: ['#1A1410', '#110E0B', '#0C0A08', '#070604'],
    glow: 'rgba(251,146,60,0.30)',
    glowSecondary: 'rgba(249,115,22,0.18)',
    // Crisp amber border — clearly visible on dark
    border: 'rgba(251,146,60,0.28)',
    glass: 'rgba(255,255,255,0.06)',
    glassStrong: 'rgba(30,24,18,0.92)',
    accent: '#F97316',
    accentBright: '#FB923C',
    // Soft amber tint for input backgrounds
    accentSoft: 'rgba(251,146,60,0.14)',
    accentText: '#FFF7ED',
    // Full white for foreground — 15:1 contrast on dark
    foreground: '#FFFFFF',
    // 60% white — meets 4.5:1 for placeholders on dark surface
    mutedForeground: 'rgba(255,255,255,0.62)',
    background: '#0C0A08',
    card: '#1E1A15',
    primary: '#F97316',
    primaryForeground: '#FFFFFF',
    secondary: '#2A2218',
    secondaryForeground: '#FFF7ED',
    muted: '#1A1510',
    accentSurface: '#3A2B1A',
    accentForeground: '#FFF7ED',
    destructive: '#F87171',
    destructiveForeground: '#FFFFFF',
    input: '#2E261C',
  },
  ocean: {
    name: 'ocean',
    label: 'Deep Ocean',
    description: 'Deep teal-navy — WCAG AA',
    swatches: ['#7DD3FC', '#3B82F6', '#071428'],
    // Consistently deep ocean — no bright-at-top / dark-mud-at-bottom split
    gradient: ['#0F2744', '#0A1C3A', '#071228', '#030912'],
    glow: 'rgba(96,165,250,0.38)',
    glowSecondary: 'rgba(59,130,246,0.22)',
    border: 'rgba(96,165,250,0.28)',
    glass: 'rgba(255,255,255,0.06)',
    glassStrong: 'rgba(7,18,40,0.92)',
    accent: '#60A5FA',
    accentBright: '#93C5FD',
    accentSoft: 'rgba(96,165,250,0.16)',
    accentText: '#DBEAFE',
    foreground: '#FFFFFF',
    // 0.70 — WCAG AA on dark navy
    mutedForeground: 'rgba(255,255,255,0.70)',
    background: '#030912',
    card: '#0F2040',
    primary: '#60A5FA',
    primaryForeground: '#FFFFFF',
    secondary: '#152D54',
    secondaryForeground: '#DBEAFE',
    muted: '#0D1E38',
    accentSurface: '#1A3B6E',
    accentForeground: '#DBEAFE',
    destructive: '#F87171',
    destructiveForeground: '#FFFFFF',
    input: '#1E3A64',
  },
};

export const DEFAULT_THEME: ThemeName = 'violet';