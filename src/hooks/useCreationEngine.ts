import { useState, useCallback } from "react";
import { toast } from "sonner";
import { interpretIntent, generatePipeline, generateAsset } from "@/services/api";
import type { CreationSession, HistoryEntry, PipelineStep } from "@/types/campusos";

const HISTORY_KEY = "campusos_history";

function createSession(prompt: string): CreationSession {
    return {
        id: crypto.randomUUID(),
        prompt,
        intent: null,
        pipeline: null,
        assets: [],
        status: "idle",
        error: null,
        createdAt: new Date().toISOString(),
    };
}

function saveToHistory(session: CreationSession) {
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        const history: HistoryEntry[] = raw ? JSON.parse(raw) : [];
        if (session.intent) {
            history.unshift({
                id: session.id,
                prompt: session.prompt,
                intentType: session.intent.type,
                title: session.intent.title,
                createdAt: session.createdAt,
                assetCount: session.assets.length,
            });
            // Keep last 50 entries
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
        }
    } catch {
        // localStorage might be full or unavailable
    }
}

export function getHistory(): HistoryEntry[] {
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
}

export function useCreationEngine() {
    const [session, setSession] = useState<CreationSession>(createSession(""));

    const runCreation = useCallback(async (prompt: string) => {
        const newSession = createSession(prompt);
        setSession({ ...newSession, status: "interpreting" });

        try {
            // Step 1: Interpret intent
            const intent = await interpretIntent(prompt);
            intent.rawPrompt = prompt;
            setSession((prev) => ({ ...prev, intent, status: "planning" }));
            toast.success("Intent interpreted!");

            // Step 2: Generate pipeline
            const pipeline = await generatePipeline(intent);
            setSession((prev) => ({ ...prev, pipeline, status: "generating" }));
            toast.success("Pipeline planned!");

            // Step 3: Generate assets for each step sequentially
            const assets = [];
            for (let i = 0; i < pipeline.steps.length; i++) {
                const step = pipeline.steps[i];

                // Mark step as running
                setSession((prev) => {
                    if (!prev.pipeline) return prev;
                    const updatedSteps: PipelineStep[] = prev.pipeline.steps.map((s, idx) =>
                        idx === i ? { ...s, status: "running" as const } : s
                    );
                    return {
                        ...prev,
                        pipeline: { ...prev.pipeline, steps: updatedSteps },
                    };
                });

                try {
                    const asset = await generateAsset(step, intent);
                    assets.push(asset);

                    // Mark step as done and add asset
                    setSession((prev) => {
                        if (!prev.pipeline) return prev;
                        const updatedSteps: PipelineStep[] = prev.pipeline.steps.map((s, idx) =>
                            idx === i ? { ...s, status: "done" as const } : s
                        );
                        return {
                            ...prev,
                            pipeline: { ...prev.pipeline, steps: updatedSteps },
                            assets: [...prev.assets, asset],
                        };
                    });
                } catch (err) {
                    // Mark step as error but continue
                    setSession((prev) => {
                        if (!prev.pipeline) return prev;
                        const updatedSteps: PipelineStep[] = prev.pipeline.steps.map((s, idx) =>
                            idx === i ? { ...s, status: "error" as const } : s
                        );
                        return {
                            ...prev,
                            pipeline: { ...prev.pipeline, steps: updatedSteps },
                        };
                    });
                    console.error(`Error generating asset for step ${step.label}:`, err);
                }
            }

            // Done
            const finalSession: CreationSession = {
                ...newSession,
                intent,
                pipeline: {
                    ...pipeline,
                    steps: pipeline.steps.map((s) => ({
                        ...s,
                        status: "done" as const,
                    })),
                },
                assets,
                status: "done",
            };
            setSession(finalSession);
            saveToHistory(finalSession);
            toast.success("All assets generated!");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Something went wrong";
            setSession((prev) => ({ ...prev, status: "error", error: message }));
            toast.error(message);
        }
    }, []);

    const reset = useCallback(() => {
        setSession(createSession(""));
    }, []);

    return { session, runCreation, reset };
}
