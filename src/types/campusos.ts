// ─── CampusOS Core Types ────────────────────────────────

export type IntentType = "event_promotion" | "website" | "presentation";
export type Tone = "formal" | "casual" | "energetic" | "professional" | "creative";
export type StepType = "text" | "design" | "code";
export type StepStatus = "pending" | "running" | "done" | "error";

export interface ParsedIntent {
    type: IntentType;
    title: string;
    description: string;
    audience: string;
    tone: Tone;
    elements: string[];
    rawPrompt: string;
}

export interface PipelineStep {
    id: string;
    label: string;
    description: string;
    stepType: StepType;
    status: StepStatus;
    dependencies: string[];
    order: number;
}

export interface Pipeline {
    id: string;
    intentId: string;
    steps: PipelineStep[];
    createdAt: string;
}

export interface GeneratedAsset {
    stepId: string;
    stepLabel: string;
    content: string;
    contentType: "text" | "html" | "markdown" | "json";
    explanation: string;
}

export interface CreationSession {
    id: string;
    prompt: string;
    intent: ParsedIntent | null;
    pipeline: Pipeline | null;
    assets: GeneratedAsset[];
    status: "idle" | "interpreting" | "planning" | "generating" | "done" | "error";
    error: string | null;
    createdAt: string;
}

export interface HistoryEntry {
    id: string;
    prompt: string;
    intentType: IntentType;
    title: string;
    createdAt: string;
    assetCount: number;
}
