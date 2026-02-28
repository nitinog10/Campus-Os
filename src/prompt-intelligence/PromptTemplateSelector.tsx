// ─── Prompt Template Selector Component ───────────────────────────────────────

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown,
    Sparkles,
    Check,
    AlertCircle,
    FileText,
    Eye,
    EyeOff,
    Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { AssetType } from "@/types/campusos";
import {
    type PromptTemplate,
    promptTemplates,
    getTemplatesByAssetType,
    getDefaultTemplateForAssetType,
} from "./promptTemplates";
import {
    buildPrompt,
    buildPromptPreview,
    validateRequiredFields,
    getFormCompleteness,
} from "./buildPrompt";

interface PromptTemplateSelectorProps {
    /** Current asset type filter (auto means show all) */
    assetType: AssetType | "auto";
    /** Callback when prompt is ready to submit */
    onPromptReady: (prompt: string) => void;
    /** Whether submission is in progress */
    isLoading?: boolean;
}

export function PromptTemplateSelector({
    assetType,
    onPromptReady,
    isLoading = false,
}: PromptTemplateSelectorProps) {
    // ─── State ─────────────────────────────────────────────────────────────────

    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    const [isEditingPreview, setIsEditingPreview] = useState(false);
    const [editedPrompt, setEditedPrompt] = useState("");

    // ─── Derived State ─────────────────────────────────────────────────────────

    const availableTemplates = useMemo(() => {
        if (assetType === "auto") {
            return promptTemplates;
        }
        return getTemplatesByAssetType(assetType);
    }, [assetType]);

    const selectedTemplate = useMemo(() => {
        return availableTemplates.find((t) => t.id === selectedTemplateId) || null;
    }, [availableTemplates, selectedTemplateId]);

    const validation = useMemo(() => {
        if (!selectedTemplate) {
            return { valid: false, missingFields: [] };
        }
        return validateRequiredFields(formValues, selectedTemplate.fields);
    }, [selectedTemplate, formValues]);

    const completeness = useMemo(() => {
        if (!selectedTemplate) {
            return { percentage: 0, filledRequired: 0, totalRequired: 0, filledOptional: 0, totalOptional: 0 };
        }
        return getFormCompleteness(formValues, selectedTemplate.fields);
    }, [selectedTemplate, formValues]);

    const promptPreview = useMemo(() => {
        if (!selectedTemplate) {
            return { preview: "", isComplete: false, missingCount: 0 };
        }
        return buildPromptPreview(selectedTemplate, formValues);
    }, [selectedTemplate, formValues]);

    const finalPrompt = useMemo(() => {
        if (!selectedTemplate || !validation.valid) return "";
        return buildPrompt(selectedTemplate, formValues);
    }, [selectedTemplate, formValues, validation.valid]);

    // ─── Effects ───────────────────────────────────────────────────────────────

    // Auto-select default template when asset type changes
    useEffect(() => {
        if (assetType !== "auto") {
            const defaultTemplate = getDefaultTemplateForAssetType(assetType);
            if (defaultTemplate) {
                setSelectedTemplateId(defaultTemplate.id);
                setFormValues({});
                setIsEditingPreview(false);
            }
        } else if (availableTemplates.length > 0 && !selectedTemplateId) {
            setSelectedTemplateId(availableTemplates[0].id);
        }
    }, [assetType, availableTemplates, selectedTemplateId]);

    // Sync edited prompt when preview changes
    useEffect(() => {
        if (finalPrompt && !isEditingPreview) {
            setEditedPrompt(finalPrompt);
        }
    }, [finalPrompt, isEditingPreview]);

    // ─── Handlers ──────────────────────────────────────────────────────────────

    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplateId(templateId);
        setFormValues({});
        setIsDropdownOpen(false);
        setIsEditingPreview(false);
    };

    const handleFieldChange = (key: string, value: string) => {
        setFormValues((prev) => ({
            ...prev,
            [key]: value,
        }));
        // Reset manual edit when form changes
        if (isEditingPreview) {
            setIsEditingPreview(false);
        }
    };

    const handleSubmit = () => {
        if (isLoading) return;

        const promptToSubmit = isEditingPreview ? editedPrompt : finalPrompt;
        if (promptToSubmit.trim()) {
            onPromptReady(promptToSubmit);
        }
    };

    const handleEditPreview = () => {
        setEditedPrompt(finalPrompt);
        setIsEditingPreview(true);
    };

    const handleResetEdit = () => {
        setEditedPrompt(finalPrompt);
        setIsEditingPreview(false);
    };

    // ─── Render ────────────────────────────────────────────────────────────────

    const canSubmit = validation.valid || (isEditingPreview && editedPrompt.trim().length > 10);

    return (
        <div className="w-full max-w-3xl mx-auto space-y-6">
            {/* Template Selector Dropdown */}
            <div className="relative">
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2 block">
                    Choose a Template
                </label>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl glass-strong border border-border/50 hover:border-primary/30 transition-all duration-200 text-left"
                    disabled={isLoading}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">
                                {selectedTemplate?.label || "Select a template"}
                            </p>
                            {selectedTemplate && (
                                <p className="text-xs text-muted-foreground">
                                    {selectedTemplate.description}
                                </p>
                            )}
                        </div>
                    </div>
                    <ChevronDown
                        className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
                            isDropdownOpen ? "rotate-180" : ""
                        }`}
                    />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                    {isDropdownOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-50 w-full mt-2 py-2 rounded-xl glass-strong border border-border/50 shadow-xl max-h-80 overflow-y-auto"
                        >
                            {availableTemplates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => handleTemplateSelect(template.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                                        selectedTemplateId === template.id
                                            ? "bg-primary/10 text-primary"
                                            : "hover:bg-muted/50"
                                    }`}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-sm">{template.label}</p>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                                                {template.assetType}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {template.description}
                                        </p>
                                    </div>
                                    {selectedTemplateId === template.id && (
                                        <Check className="w-4 h-4 text-primary" />
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Form Fields */}
            {selectedTemplate && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    {/* Progress Indicator */}
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                            {completeness.filledRequired}/{completeness.totalRequired} required fields
                            {completeness.filledOptional > 0 && (
                                <span className="text-primary ml-1">
                                    +{completeness.filledOptional} optional
                                </span>
                            )}
                        </span>
                        <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-primary rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${completeness.percentage}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                            <span className="text-muted-foreground">{completeness.percentage}%</span>
                        </div>
                    </div>

                    {/* Dynamic Form Fields */}
                    <div className="gradient-border rounded-2xl">
                        <div className="bg-background rounded-2xl p-4 space-y-4">
                            {selectedTemplate.fields.map((field) => (
                                <div key={field.key} className="space-y-1.5">
                                    <label
                                        htmlFor={field.key}
                                        className="text-sm font-medium flex items-center gap-1.5"
                                    >
                                        {field.label}
                                        {field.required ? (
                                            <span className="text-destructive">*</span>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">(optional)</span>
                                        )}
                                    </label>
                                    {field.multiline ? (
                                        <Textarea
                                            id={field.key}
                                            value={formValues[field.key] || ""}
                                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                            placeholder={field.placeholder}
                                            className="min-h-[80px] resize-none bg-muted/30 border-border/50 focus:border-primary/50"
                                            disabled={isLoading}
                                        />
                                    ) : (
                                        <input
                                            id={field.key}
                                            type="text"
                                            value={formValues[field.key] || ""}
                                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                            placeholder={field.placeholder}
                                            className="w-full px-3 py-2 rounded-lg border border-border/50 bg-muted/30 text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200 placeholder:text-muted-foreground"
                                            disabled={isLoading}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Prompt Preview */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setShowPreview(!showPreview)}
                                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPreview ? (
                                    <Eye className="w-3.5 h-3.5" />
                                ) : (
                                    <EyeOff className="w-3.5 h-3.5" />
                                )}
                                {showPreview ? "Hide" : "Show"} Prompt Preview
                            </button>
                            {showPreview && validation.valid && (
                                <button
                                    onClick={isEditingPreview ? handleResetEdit : handleEditPreview}
                                    className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                                >
                                    <Pencil className="w-3 h-3" />
                                    {isEditingPreview ? "Reset to Generated" : "Edit Prompt"}
                                </button>
                            )}
                        </div>

                        <AnimatePresence>
                            {showPreview && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-4 rounded-xl glass border border-border/30">
                                        {isEditingPreview ? (
                                            <Textarea
                                                value={editedPrompt}
                                                onChange={(e) => setEditedPrompt(e.target.value)}
                                                className="min-h-[100px] resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm"
                                                placeholder="Edit your prompt..."
                                            />
                                        ) : (
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                {promptPreview.preview || "Fill in the fields above to see your prompt..."}
                                            </p>
                                        )}
                                        {!validation.valid && validation.missingFields.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-border/30 flex items-start gap-2">
                                                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                                <p className="text-xs text-amber-500">
                                                    Missing required fields: {validation.missingFields.join(", ")}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-2">
                        <Button
                            onClick={handleSubmit}
                            disabled={!canSubmit || isLoading}
                            variant="glow"
                            size="lg"
                            className="gap-2"
                        >
                            <Sparkles className="w-4 h-4" />
                            {isLoading ? "Generating..." : "Generate Asset"}
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* Empty State */}
            {!selectedTemplate && (
                <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>Select a template to get started</p>
                </div>
            )}
        </div>
    );
}

export default PromptTemplateSelector;
