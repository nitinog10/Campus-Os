// ─── Prompt Builder for CampusOS Prompt Intelligence Layer ────────────────────

import type { PromptTemplate, PromptField } from "./promptTemplates";

export interface BuildPromptOptions {
    /** Whether to add tone modifiers for consistency */
    enforceTone?: boolean;
    /** Custom tone override */
    tone?: "student-friendly" | "professional" | "modern" | "formal";
    /** Maximum prompt length (characters) */
    maxLength?: number;
}

const DEFAULT_OPTIONS: BuildPromptOptions = {
    enforceTone: true,
    tone: "student-friendly",
    maxLength: 2000,
};

/**
 * Cleans and normalizes a field value
 */
function cleanFieldValue(value: string | undefined): string {
    if (!value) return "";
    return value
        .trim()
        .replace(/\s+/g, " ") // Normalize whitespace
        .replace(/[""]/g, '"') // Normalize quotes
        .replace(/['']/g, "'"); // Normalize apostrophes
}

/**
 * Checks if a field has a meaningful value
 */
function hasValue(value: string | undefined): boolean {
    return Boolean(value && value.trim().length > 0);
}

/**
 * Filters out empty optional fields from the values object
 */
export function filterEmptyOptionalFields(
    values: Record<string, string>,
    fields: PromptField[]
): Record<string, string> {
    const result: Record<string, string> = {};

    for (const field of fields) {
        const value = values[field.key];
        const cleaned = cleanFieldValue(value);

        // Include if required OR if has value
        if (field.required || hasValue(cleaned)) {
            result[field.key] = cleaned;
        }
    }

    return result;
}

/**
 * Validates that all required fields have values
 */
export function validateRequiredFields(
    values: Record<string, string>,
    fields: PromptField[]
): { valid: boolean; missingFields: string[] } {
    const missingFields: string[] = [];

    for (const field of fields) {
        if (field.required && !hasValue(values[field.key])) {
            missingFields.push(field.label);
        }
    }

    return {
        valid: missingFields.length === 0,
        missingFields,
    };
}

/**
 * Gets tone modifier text based on the selected tone
 */
function getToneModifier(tone: BuildPromptOptions["tone"]): string {
    switch (tone) {
        case "student-friendly":
            return " Use a modern, student-friendly tone that's engaging and approachable.";
        case "professional":
            return " Maintain a professional, polished tone suitable for formal contexts.";
        case "modern":
            return " Use a contemporary, trendy style with modern design sensibilities.";
        case "formal":
            return " Keep the tone formal and academic-appropriate.";
        default:
            return "";
    }
}

/**
 * Builds an optimized prompt string from template and form values
 *
 * Features:
 * - Removes empty optional fields
 * - Cleans and normalizes text
 * - Enforces tone consistency
 * - Respects max length constraints
 */
export function buildPrompt(
    template: PromptTemplate,
    values: Record<string, string>,
    options: BuildPromptOptions = {}
): string {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Clean values and filter empty optional fields
    const cleanedValues = filterEmptyOptionalFields(values, template.fields);

    // Generate base prompt from template
    let prompt = template.basePrompt(cleanedValues);

    // Add tone modifier if enabled
    if (opts.enforceTone && opts.tone) {
        prompt += getToneModifier(opts.tone);
    }

    // Truncate if exceeds max length
    if (opts.maxLength && prompt.length > opts.maxLength) {
        prompt = prompt.slice(0, opts.maxLength - 3) + "...";
    }

    return prompt;
}

/**
 * Generates a preview of what the prompt will look like
 * Shows placeholders for empty required fields
 */
export function buildPromptPreview(
    template: PromptTemplate,
    values: Record<string, string>
): { preview: string; isComplete: boolean; missingCount: number } {
    const validation = validateRequiredFields(values, template.fields);

    // Build preview values with placeholders
    const previewValues: Record<string, string> = {};

    for (const field of template.fields) {
        const value = values[field.key];
        if (hasValue(value)) {
            previewValues[field.key] = cleanFieldValue(value);
        } else if (field.required) {
            previewValues[field.key] = `[${field.label}]`;
        }
    }

    const preview = template.basePrompt(previewValues);

    return {
        preview,
        isComplete: validation.valid,
        missingCount: validation.missingFields.length,
    };
}

/**
 * Calculates the completeness percentage of filled fields
 */
export function getFormCompleteness(
    values: Record<string, string>,
    fields: PromptField[]
): { percentage: number; filledRequired: number; totalRequired: number; filledOptional: number; totalOptional: number } {
    let filledRequired = 0;
    let totalRequired = 0;
    let filledOptional = 0;
    let totalOptional = 0;

    for (const field of fields) {
        if (field.required) {
            totalRequired++;
            if (hasValue(values[field.key])) {
                filledRequired++;
            }
        } else {
            totalOptional++;
            if (hasValue(values[field.key])) {
                filledOptional++;
            }
        }
    }

    const filled = filledRequired + filledOptional;
    const total = totalRequired + totalOptional;
    const percentage = total > 0 ? Math.round((filled / total) * 100) : 0;

    return {
        percentage,
        filledRequired,
        totalRequired,
        filledOptional,
        totalOptional,
    };
}

/**
 * Enhances a free-form prompt with standard CampusOS quality modifiers
 */
export function enhanceFreePrompt(prompt: string, assetType?: string): string {
    let enhanced = prompt.trim();

    // Don't modify if already long enough
    if (enhanced.length > 500) {
        return enhanced;
    }

    // Add quality hints based on asset type
    if (assetType === "poster") {
        if (!enhanced.toLowerCase().includes("visual")) {
            enhanced += " Make it visually striking with modern design elements.";
        }
    } else if (assetType === "landing") {
        if (!enhanced.toLowerCase().includes("responsive") && !enhanced.toLowerCase().includes("mobile")) {
            enhanced += " Ensure responsive design with clear call-to-action buttons.";
        }
    } else if (assetType === "presentation") {
        if (!enhanced.toLowerCase().includes("slide") && !enhanced.toLowerCase().includes("visual")) {
            enhanced += " Create clean, professional slides with engaging visuals.";
        }
    }

    return enhanced;
}
