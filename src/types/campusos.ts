// ─── CampusOS Core Types ────────────────────────────────

export type IntentType = "event_promotion" | "website" | "presentation";
export type AssetType = "poster" | "landing" | "presentation";
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

// ─── Presentation Slides ────────────────────────────────

export interface TitleSlide {
    type: "title";
    title: string;
    subtitle: string;
    image?: string;
}

export interface ContentSlide {
    type: "content";
    title: string;
    bullets: string[];
    note?: string;
    image?: string;
}

export interface ImageFocusSlide {
    type: "image-focus";
    title: string;
    caption: string;
    image: string;
}

export interface StatsSlide {
    type: "stats";
    title: string;
    stats: { value: string; label: string }[];
}

export interface TwoColumnSlide {
    type: "two-column";
    title: string;
    left: { heading: string; items: string[] };
    right: { heading: string; items: string[] };
}

export interface ClosingSlide {
    type: "closing";
    title: string;
    subtitle: string;
    note?: string;
    image?: string;
}

export type Slide = TitleSlide | ContentSlide | ImageFocusSlide | StatsSlide | TwoColumnSlide | ClosingSlide;

export interface PresentationData {
    title: string;
    theme?: { primary: string; secondary: string; accent: string };
    slides: Slide[];
}

// ─── Generated Asset (new unified format) ───────────────

export interface GeneratedAssetV2 {
    id: string;
    type: AssetType;
    title: string;
    content: string | PresentationData; // HTML string for poster/landing, JSON for presentation
    contentType: "html" | "json";
    intent: ParsedIntent;
    viewUrl: string;
    createdAt: string;
}

// ─── Asset Registry ─────────────────────────────────────

export interface AssetRegistryEntry {
    id: string;
    type: AssetType;
    title: string;
    prompt: string;
    viewUrl: string;
    createdAt: string;
    intent: ParsedIntent;
}

// ─── Creation Session (updated) ─────────────────────────

export interface CreationSession {
    id: string;
    prompt: string;
    assetType: AssetType | "auto";
    asset: GeneratedAssetV2 | null;
    status: "idle" | "generating" | "done" | "error";
    error: string | null;
    createdAt: string;
}

// ─── Campus Event Mode ──────────────────────────────────

export interface CampusEvent {
    id: string;
    name: string;
    date: string;
    venue: string;
    organizer: string;
    theme: string;
    description: string;
    createdAt: string;
    assets: {
        poster?: string;
        landing?: string;
        presentation?: string;
    };
}

export type EventAssetType = keyof CampusEvent["assets"];

export type EventGenerationStatus = {
    poster: "idle" | "generating" | "done" | "error" | "skipped";
    landing: "idle" | "generating" | "done" | "error" | "skipped";
    presentation: "idle" | "generating" | "done" | "error" | "skipped";
};

// ─── Legacy types (kept for backwards compat) ───────────

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

export interface HistoryEntry {
    id: string;
    prompt: string;
    intentType: IntentType;
    title: string;
    createdAt: string;
    assetCount: number;
}
