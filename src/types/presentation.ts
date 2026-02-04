export enum ThemeType {
  MODERN = 'MODERN',
  DARK = 'DARK',
  PROFESSIONAL = 'PROFESSIONAL',
  PLAYFUL = 'PLAYFUL'
}

export interface Slide {
  id: string;
  title: string;
  content: string[];
  imagePrompt: string;
  imageUrl?: string;
  layout: 'left' | 'right' | 'center';
  speakerNotes: string;
}

export interface Presentation {
  topic: string;
  slides: Slide[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  presentation?: Presentation;
}

export interface ThemeConfig {
  name: string;
  bg: string;
  text: string;
  accent: string;
  card: string;
  fontClass: string;
}
