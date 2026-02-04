// CAMPUSOS Type Definitions

export type IntentType = 'event_promotion' | 'website' | 'presentation';

export interface ParsedIntent {
  type: IntentType;
  title: string;
  description: string;
  audience: string;
  tone: 'formal' | 'casual' | 'energetic' | 'professional';
  elements: string[];
  context: Record<string, string>;
}

export interface PipelineStep {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'design' | 'code';
  status: 'pending' | 'processing' | 'complete' | 'error';
  dependencies: string[];
  output?: GeneratedAsset;
  explanation?: string;
}

export interface Pipeline {
  id: string;
  intent: ParsedIntent;
  steps: PipelineStep[];
  status: 'initializing' | 'running' | 'complete' | 'error';
  createdAt: Date;
}

export interface GeneratedAsset {
  id: string;
  type: 'text' | 'design' | 'code';
  subtype: string;
  content: string;
  metadata: Record<string, unknown> & {
    format?: string;
    language?: string;
    preview?: string;
  };
  explanation: AssetExplanation;
}

export interface AssetExplanation {
  rationale: string;
  decisions: string[];
  alternatives?: string[];
  attribution?: string[];
}

export interface CreationState {
  userInput: string;
  intent: ParsedIntent | null;
  pipeline: Pipeline | null;
  assets: GeneratedAsset[];
  currentStep: number;
  isProcessing: boolean;
  error: string | null;
}
