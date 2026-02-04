import type { ParsedIntent, Pipeline, GeneratedAsset } from './campusos';

export interface HistoryEntry {
  id: string;
  userInput: string;
  intent: ParsedIntent;
  pipeline: Pipeline | null;
  assets: GeneratedAsset[];
  createdAt: string;
  title: string; // Short title for sidebar display
}

export interface HistoryState {
  entries: HistoryEntry[];
  activeEntryId: string | null;
}
