import { ThemeType, ThemeConfig } from '@/types/presentation';

export const THEME_CONFIGS: Record<ThemeType, ThemeConfig> = {
  [ThemeType.MODERN]: {
    name: 'Modern Minimalist',
    bg: 'bg-white',
    text: 'text-slate-800',
    accent: 'bg-indigo-600',
    card: 'bg-slate-50',
    fontClass: 'font-title'
  },
  [ThemeType.DARK]: {
    name: 'Midnight Tech',
    bg: 'bg-slate-950',
    text: 'text-slate-100',
    accent: 'bg-cyan-500',
    card: 'bg-slate-900',
    fontClass: 'font-title'
  },
  [ThemeType.PROFESSIONAL]: {
    name: 'Executive Blue',
    bg: 'bg-slate-50',
    text: 'text-slate-900',
    accent: 'bg-blue-800',
    card: 'bg-white',
    fontClass: 'font-serif'
  },
  [ThemeType.PLAYFUL]: {
    name: 'Vibrant Pop',
    bg: 'bg-amber-50',
    text: 'text-slate-900',
    accent: 'bg-pink-500',
    card: 'bg-white',
    fontClass: 'font-title'
  }
};
