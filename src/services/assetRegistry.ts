import type { GeneratedAssetV2, AssetRegistryEntry } from "@/types/campusos";

const REGISTRY_KEY = "campusos_assets";

// ─── Save asset to registry ─────────────────────────────

export function saveAsset(asset: GeneratedAssetV2): void {
    try {
        const entries = getAllAssets();

        // Save full asset data separately for viewer access
        localStorage.setItem(`campusos_asset_${asset.id}`, JSON.stringify(asset));

        // Save registry entry (lightweight metadata)
        const entry: AssetRegistryEntry = {
            id: asset.id,
            type: asset.type,
            title: asset.title,
            prompt: asset.intent.rawPrompt,
            viewUrl: asset.viewUrl,
            createdAt: asset.createdAt,
            intent: asset.intent,
        };

        entries.unshift(entry);
        localStorage.setItem(REGISTRY_KEY, JSON.stringify(entries.slice(0, 100)));
    } catch {
        // localStorage might be full
    }
}

// ─── Get all registry entries ───────────────────────────

export function getAllAssets(): AssetRegistryEntry[] {
    try {
        const raw = localStorage.getItem(REGISTRY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

// ─── Get full asset by ID (for viewers) ─────────────────

export function getAssetById(id: string): GeneratedAssetV2 | null {
    try {
        const raw = localStorage.getItem(`campusos_asset_${id}`);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

// ─── Delete single asset ────────────────────────────────

export function deleteAsset(id: string): void {
    try {
        localStorage.removeItem(`campusos_asset_${id}`);
        const entries = getAllAssets().filter((e) => e.id !== id);
        localStorage.setItem(REGISTRY_KEY, JSON.stringify(entries));
    } catch {
        // ignore
    }
}

// ─── Clear all assets ───────────────────────────────────

export function clearAllAssets(): void {
    try {
        const entries = getAllAssets();
        for (const entry of entries) {
            localStorage.removeItem(`campusos_asset_${entry.id}`);
        }
        localStorage.removeItem(REGISTRY_KEY);
        // Also clear legacy history
        localStorage.removeItem("campusos_history");
    } catch {
        // ignore
    }
}
