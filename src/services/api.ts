import type { ParsedIntent, Pipeline, GeneratedAsset } from "@/types/campusos";

const API_BASE = "/api";

async function post<T>(endpoint: string, body: unknown): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Request failed" }));
        throw new Error(error.message || `HTTP ${res.status}`);
    }

    return res.json();
}

export async function interpretIntent(prompt: string): Promise<ParsedIntent> {
    return post<ParsedIntent>("/interpret-intent", { prompt });
}

export async function generatePipeline(intent: ParsedIntent): Promise<Pipeline> {
    return post<Pipeline>("/generate-pipeline", { intent });
}

export async function generateAsset(
    step: { id: string; label: string; description: string; stepType: string },
    intent: ParsedIntent
): Promise<GeneratedAsset> {
    return post<GeneratedAsset>("/generate-asset", { step, intent });
}
