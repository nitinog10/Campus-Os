import type { GeneratedAssetV2, AssetType } from "@/types/campusos";

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

// ─── New consolidated endpoint ──────────────────────────

export async function generate(
    prompt: string,
    assetType: AssetType | "auto" = "auto"
): Promise<GeneratedAssetV2> {
    return post<GeneratedAssetV2>("/generate", { prompt, assetType });
}
