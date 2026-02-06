
export interface GeneratedPage {
  id: string;
  prompt: string;
  code: string;
  timestamp: number;
  description?: string;
}

export enum ViewMode {
  PREVIEW = 'PREVIEW',
  CODE = 'CODE'
}

export interface GenerationState {
  isGenerating: boolean;
  error: string | null;
}
