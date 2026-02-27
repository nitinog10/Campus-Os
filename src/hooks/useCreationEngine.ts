import { useState, useCallback } from "react";
import { toast } from "sonner";
import { generate } from "@/services/api";
import { saveAsset } from "@/services/assetRegistry";
import type { CreationSession, AssetType } from "@/types/campusos";

function createSession(): CreationSession {
    return {
        id: crypto.randomUUID(),
        prompt: "",
        assetType: "auto",
        asset: null,
        status: "idle",
        error: null,
        createdAt: new Date().toISOString(),
    };
}

export function useCreationEngine() {
    const [session, setSession] = useState<CreationSession>(createSession());

    const runCreation = useCallback(
        async (prompt: string, assetType: AssetType | "auto" = "auto") => {
            setSession({
                ...createSession(),
                prompt,
                assetType,
                status: "generating",
                createdAt: new Date().toISOString(),
            });

            try {
                const asset = await generate(prompt, assetType);

                // Save to registry
                saveAsset(asset);

                setSession((prev) => ({
                    ...prev,
                    asset,
                    status: "done",
                }));

                toast.success(`${asset.title} generated!`);

                // Open viewer in new tab
                window.open(asset.viewUrl, "_blank");
            } catch (err) {
                const message = err instanceof Error ? err.message : "Something went wrong";
                setSession((prev) => ({ ...prev, status: "error", error: message }));
                toast.error(message);
            }
        },
        []
    );

    const reset = useCallback(() => {
        setSession(createSession());
    }, []);

    return { session, runCreation, reset };
}
