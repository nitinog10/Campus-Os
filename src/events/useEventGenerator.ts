// ─── Event Generator Hook ─────────────────────────────────────────────────────
// Sequentially generates Poster → Landing Page → Presentation for a CampusEvent

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { generate } from "@/services/api";
import { saveAsset } from "@/services/assetRegistry";
import { saveEvent, updateEventAssets } from "./eventStore";
import type { CampusEvent, AssetType, EventGenerationStatus } from "@/types/campusos";

type OverallStatus = "idle" | "generating" | "done" | "error";

interface EventGeneratorState {
    event: CampusEvent | null;
    overallStatus: OverallStatus;
    assetStatus: EventGenerationStatus;
    /** Generated asset view URLs keyed by type */
    assetUrls: Partial<Record<AssetType, string>>;
    /** Error messages keyed by type */
    errors: Partial<Record<AssetType, string>>;
    /** Which asset types to generate (allows skipping) */
    selectedTypes: AssetType[];
}

const INITIAL_ASSET_STATUS: EventGenerationStatus = {
    poster: "idle",
    landing: "idle",
    presentation: "idle",
};

function createInitialState(): EventGeneratorState {
    return {
        event: null,
        overallStatus: "idle",
        assetStatus: { ...INITIAL_ASSET_STATUS },
        assetUrls: {},
        errors: {},
        selectedTypes: ["poster", "landing", "presentation"],
    };
}

// ─── Prompt Builders ────────────────────────────────────

function buildPosterPrompt(event: CampusEvent): string {
    const parts = [
        `Create a stunning ${event.theme ? event.theme + " themed" : ""} A4 event poster for "${event.name}"`,
        `happening at ${event.venue} on ${event.date}`,
    ];

    if (event.organizer) {
        parts.push(`organized by ${event.organizer}`);
    }

    let prompt = parts.join(", ") + ". ";
    prompt += event.description + " ";
    prompt += "Make it visually striking with bold typography, vibrant colors, and modern design elements. ";
    prompt += "Include event name, date, venue, and organizer prominently. ";
    prompt += "Student-friendly, energetic, and professional.";

    return prompt;
}

function buildLandingPrompt(event: CampusEvent): string {
    let prompt = `Build a modern, responsive event landing page for "${event.name}"`;
    prompt += ` — ${event.description}. `;
    prompt += `The event takes place at ${event.venue} on ${event.date}`;

    if (event.organizer) {
        prompt += `, organized by ${event.organizer}`;
    }

    prompt += ". ";

    if (event.theme) {
        prompt += `Visual theme: ${event.theme}. `;
    }

    prompt += "Include sections for: event overview, schedule highlights, venue information, and a registration CTA. ";
    prompt += "Use a consistent visual identity that matches the event poster. ";
    prompt += "Modern, student-friendly design with clear call-to-action buttons.";

    return prompt;
}

function buildPresentationPrompt(event: CampusEvent): string {
    let prompt = `Create a professional presentation deck for "${event.name}"`;
    prompt += ` — ${event.description}. `;
    prompt += `Event details: ${event.venue}, ${event.date}`;

    if (event.organizer) {
        prompt += `, by ${event.organizer}`;
    }

    prompt += ". ";

    if (event.theme) {
        prompt += `Theme: ${event.theme}. `;
    }

    prompt += "Include slides for: title slide, event overview, agenda/schedule, ";
    prompt += "key highlights, speaker/team information, venue details, and a closing slide with contact info. ";
    prompt += "Ensure visual consistency with the event's poster and landing page design. ";
    prompt += "Professional yet energetic, suitable for campus presentations.";

    return prompt;
}

function getPromptForType(event: CampusEvent, assetType: AssetType): string {
    switch (assetType) {
        case "poster":
            return buildPosterPrompt(event);
        case "landing":
            return buildLandingPrompt(event);
        case "presentation":
            return buildPresentationPrompt(event);
    }
}

// ─── Hook ───────────────────────────────────────────────

export function useEventGenerator() {
    const [state, setState] = useState<EventGeneratorState>(createInitialState());

    const setSelectedTypes = useCallback((types: AssetType[]) => {
        setState((prev) => ({ ...prev, selectedTypes: types }));
    }, []);

    const toggleAssetType = useCallback((type: AssetType) => {
        setState((prev) => {
            const current = prev.selectedTypes;
            const updated = current.includes(type)
                ? current.filter((t) => t !== type)
                : [...current, type];
            // Ensure at least one is selected
            if (updated.length === 0) return prev;
            return { ...prev, selectedTypes: updated };
        });
    }, []);

    const runEventGeneration = useCallback(
        async (event: CampusEvent, typesToGenerate?: AssetType[]) => {
            const types = typesToGenerate ?? state.selectedTypes;

            // Save event first
            saveEvent(event);

            // Mark skipped types
            const assetStatus: EventGenerationStatus = {
                poster: types.includes("poster") ? "idle" : "skipped",
                landing: types.includes("landing") ? "idle" : "skipped",
                presentation: types.includes("presentation") ? "idle" : "skipped",
            };

            setState({
                event,
                overallStatus: "generating",
                assetStatus,
                assetUrls: {},
                errors: {},
                selectedTypes: types,
            });

            const assetUrls: Partial<Record<AssetType, string>> = {};
            const errors: Partial<Record<AssetType, string>> = {};
            let anySuccess = false;

            // Sequential generation
            for (const assetType of types) {
                // Update status: generating
                setState((prev) => ({
                    ...prev,
                    assetStatus: {
                        ...prev.assetStatus,
                        [assetType]: "generating",
                    },
                }));

                try {
                    const prompt = getPromptForType(event, assetType);
                    const asset = await generate(prompt, assetType);

                    // Save to asset registry
                    saveAsset(asset);

                    // Update event store with the asset ID
                    updateEventAssets(event.id, assetType, asset.id);

                    assetUrls[assetType] = asset.viewUrl;
                    anySuccess = true;

                    // Update status: done
                    setState((prev) => ({
                        ...prev,
                        assetStatus: {
                            ...prev.assetStatus,
                            [assetType]: "done",
                        },
                        assetUrls: { ...prev.assetUrls, [assetType]: asset.viewUrl },
                    }));

                    toast.success(`${event.name} — ${assetType} generated!`);
                } catch (err) {
                    const message =
                        err instanceof Error ? err.message : "Generation failed";
                    errors[assetType] = message;

                    // Update status: error — continue to next asset
                    setState((prev) => ({
                        ...prev,
                        assetStatus: {
                            ...prev.assetStatus,
                            [assetType]: "error",
                        },
                        errors: { ...prev.errors, [assetType]: message },
                    }));

                    toast.error(`${assetType} failed: ${message}`);
                }
            }

            // Final overall status
            setState((prev) => ({
                ...prev,
                overallStatus: anySuccess ? "done" : "error",
            }));

            if (anySuccess) {
                toast.success(`Event "${event.name}" assets generated!`);
            }
        },
        [state.selectedTypes]
    );

    const reset = useCallback(() => {
        setState(createInitialState());
    }, []);

    return {
        ...state,
        setSelectedTypes,
        toggleAssetType,
        runEventGeneration,
        reset,
    };
}
