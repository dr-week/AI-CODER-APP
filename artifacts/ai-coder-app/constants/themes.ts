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
    gradient: ['#D7BFFF', '#9374E9', '#33245C', '#0D0A19'],
    glow: 'rgba(167,139,250,0.34)',
    glowSecondary: 'rgba(124,58,237,0.24)',
    border: 'rgba(211,190,255,0.32)',
    glass: 'rgba(18,13,38,0.56)',
    glassStrong: 'rgba(13,10,28,0.72)',
    accent: '#A78BFA',
    accentBright: '#C4B5FD',
    accentSoft: 'rgba(167,139,250,0.22)',
    accentText: '#EDE9FE',
    foreground: '#FAF9FF',
    mutedForeground: 'rgba(245,243,255,0.56)',
    background: '#0D0A19',
    card: '#1B1631',
    primary: '#A78BFA',
    primaryForeground: '#171027',
    secondary: '#282043',
    secondaryForeground: '#EDE9FE',
    muted: '#211A39',
    accentSurface: '#33245C',
    accentForeground: '#EDE9FE',
    destructive: '#F87171',
    destructiveForeground: '#210A10',
    input: '#493C73',
  },
  ember: {
    name: 'ember',
    label: 'Ember',
    description: 'Warm orange glass',
    swatches: ['#FFB267', '#F97316', '#321709'],
    gradient: ['#F0C080', '#D4894A', '#A8561E', '#2C1608'],
    glow: 'rgba(249,115,22,0.28)',
    glowSecondary: 'rgba(234,88,12,0.18)',
    border: 'rgba(255,150,50,0.26)',
    glass: 'rgba(18,8,2,0.56)',
    glassStrong: 'rgba(18,8,2,0.68)',
    accent: '#F97316',
    accentBright: '#FF9A3C',
    accentSoft: 'rgba(249,115,22,0.22)',
    accentText: '#FFEDD5',
    foreground: '#FFFFFF',
    mutedForeground: 'rgba(255,255,255,0.5)',
    background: '#2C1608',
    card: '#321A0B',
    primary: '#F97316',
    primaryForeground: '#FFFFFF',
    secondary: '#4B2814',
    secondaryForeground: '#FFEDD5',
    muted: '#3C2112',
    accentSurface: '#5B2A12',
    accentForeground: '#FFEDD5',
    destructive: '#F87171',
    destructiveForeground: '#210A10',
    input: '#70401F',
  },
  ocean: {
    name: 'ocean',
    label: 'Deep Ocean',
    description: 'Cool blue glass',
    swatches: ['#8BD9FF', '#4F8FE8', '#102746'],
    gradient: ['#A6DFFF', '#598FD6', '#1B3A67', '#08111F'],
    glow: 'rgba(56,189,248,0.28)',
    glowSecondary: 'rgba(37,99,235,0.22)',
    border: 'rgba(147,212,255,0.3)',
    glass: 'rgba(5,18,39,0.56)',
    glassStrong: 'rgba(4,14,30,0.72)',
    accent: '#60A5FA',
    accentBright: '#93C5FD',
    accentSoft: 'rgba(96,165,250,0.22)',
    accentText: '#DBEAFE',
    foreground: '#F8FCFF',
    mutedForeground: 'rgba(239,248,255,0.56)',
    background: '#08111F',
    card: '#10233E',
    primary: '#60A5FA',
    primaryForeground: '#071426',
    secondary: '#173253',
    secondaryForeground: '#DBEAFE',
    muted: '#112945',
    accentSurface: '#1E4775',
    accentForeground: '#DBEAFE',
    destructive: '#F87171',
    destructiveForeground: '#210A10',
    input: '#315B89',
  },
};

export const DEFAULT_THEME: ThemeName = 'violet';