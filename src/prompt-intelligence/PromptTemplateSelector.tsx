// ─── Prompt Template Selector Component ───────────────────────────────────────
// Redesigned: visual template cards, grouped form, live preview, clear submit

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    Check,
    AlertCircle,
    Eye,
    EyeOff,
    Pencil,
    Send,
    Image,
    Globe,
    Presentation,
    RotateCcw,
    ChevronRight,
    Info,
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

// ─── Helpers ────────────────────────────────────────────────────────────────

const assetIcons: Record<AssetType, React.ReactNode> = {
    poster: <Image className="w-4 h-4" />,
    landing: <Globe className="w-4 h-4" />,
    presentation: <Presentation className="w-4 h-4" />,
};

const assetColors: Record<AssetType, { bg: string; text: string }> = {
    poster: { bg: "from-pink-500/20 to-orange-500/20", text: "text-pink-400" },
    landing: { bg: "from-blue-500/20 to-cyan-500/20", text: "text-blue-400" },
    presentation: { bg: "from-purple-500/20 to-indigo-500/20", text: "text-purple-400" },
};

const assetLabel: Record<AssetType, string> = {
    poster: "Poster",
    landing: "Landing Page",
    presentation: "Presentation",
};

// ─── Component ──────────────────────────────────────────────────────────────

interface PromptTemplateSelectorProps {
    assetType: AssetType | "auto";
    onPromptReady: (prompt: string) => void;
    isLoading?: boolean;
}

export function PromptTemplateSelector({
    assetType,
    onPromptReady,
    isLoading = false,
}: PromptTemplateSelectorProps) {
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const [showPreview, setShowPreview] = useState(false);
    const [isEditingPreview, setIsEditingPreview] = useState(false);
    const [editedPrompt, setEditedPrompt] = useState("");
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [showOptional, setShowOptional] = useState(false);
    const formRef = useRef<HTMLDivElement>(null);

    // ─── Derived ────────────────────────────────────────────────────────────

    const availableTemplates = useMemo(() => {
        if (assetType === "auto") return promptTemplates;
        return getTemplatesByAssetType(assetType);
    }, [assetType]);

    const selectedTemplate = useMemo(
        () => availableTemplates.find((t) => t.id === selectedTemplateId) || null,
        [availableTemplates, selectedTemplateId]
    );

    const validation = useMemo(() => {
        if (!selectedTemplate) return { valid: false, missingFields: [] as string[] };
        return validateRequiredFields(formValues, selectedTemplate.fields);
    }, [selectedTemplate, formValues]);

    const completeness = useMemo(() => {
        if (!selectedTemplate)
            return { percentage: 0, filledRequired: 0, totalRequired: 0, filledOptional: 0, totalOptional: 0 };
        return getFormCompleteness(formValues, selectedTemplate.fields);
    }, [selectedTemplate, formValues]);

    const promptPreview = useMemo(() => {
        if (!selectedTemplate) return { preview: "", isComplete: false, missingCount: 0 };
        return buildPromptPreview(selectedTemplate, formValues);
    }, [selectedTemplate, formValues]);

    const finalPrompt = useMemo(() => {
        if (!selectedTemplate || !validation.valid) return "";
        return buildPrompt(selectedTemplate, formValues);
    }, [selectedTemplate, formValues, validation.valid]);

    const requiredFields = selectedTemplate?.fields.filter((f) => f.required) || [];
    const optionalFields = selectedTemplate?.fields.filter((f) => !f.required) || [];

    // ─── Effects ────────────────────────────────────────────────────────────

    useEffect(() => {
        if (assetType !== "auto") {
            const def = getDefaultTemplateForAssetType(assetType);
            if (def) {
                setSelectedTemplateId(def.id);
                setFormValues({});
                setIsEditingPreview(false);
                setShowOptional(false);
            }
        } else if (availableTemplates.length > 0 && !selectedTemplateId) {
            setSelectedTemplateId(availableTemplates[0].id);
        }
    }, [assetType, availableTemplates, selectedTemplateId]);

    useEffect(() => {
        if (finalPrompt && !isEditingPreview) setEditedPrompt(finalPrompt);
    }, [finalPrompt, isEditingPreview]);

    useEffect(() => {
        if (selectedTemplate && formRef.current) {
            setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 200);
        }
    }, [selectedTemplate]);

    // ─── Handlers ───────────────────────────────────────────────────────────

    const handleTemplateSelect = (id: string) => {
        setSelectedTemplateId(id);
        setFormValues({});
        setIsEditingPreview(false);
        setShowPreview(false);
        setShowOptional(false);
    };

    const handleFieldChange = (key: string, value: string) => {
        setFormValues((prev) => ({ ...prev, [key]: value }));
        if (isEditingPreview) setIsEditingPreview(false);
    };

    const handleSubmit = () => {
        if (isLoading) return;
        const prompt = isEditingPreview ? editedPrompt : finalPrompt;
        if (prompt.trim()) onPromptReady(prompt);
    };

    const canSubmit = validation.valid || (isEditingPreview && editedPrompt.trim().length > 10);

    // ─── Field Renderer ─────────────────────────────────────────────────────

    const renderField = (field: typeof requiredFields[number], variant: "required" | "optional") => {
        const isFilled = Boolean(formValues[field.key]?.trim());
        const isFocused = focusedField === field.key;
        const bgBase = variant === "required"
            ? (isFocused ? "bg-primary/5 border-primary/40" : "bg-muted/20 border-border/40")
            : (isFocused ? "bg-primary/5 border-primary/30" : "bg-muted/10 border-border/30");

        return (
            <motion.div
                key={field.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1.5"
            >
                <label htmlFor={`tpl-${field.key}`} className="text-sm font-medium flex items-center gap-2">
                    {variant === "required" && (
                        <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${isFilled ? "bg-green-400" : "bg-muted-foreground/30"}`} />
                    )}
                    <span className={variant === "optional" ? "text-muted-foreground" : ""}>{field.label}</span>
                </label>
                {field.multiline ? (
                    <Textarea
                        id={`tpl-${field.key}`}
                        value={formValues[field.key] || ""}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        onFocus={() => setFocusedField(field.key)}
                        onBlur={() => setFocusedField(null)}
                        placeholder={field.placeholder}
                        className={`min-h-[76px] resize-none transition-all duration-200 ${bgBase}`}
                        disabled={isLoading}
                    />
                ) : (
                    <input
                        id={`tpl-${field.key}`}
                        type="text"
                        value={formValues[field.key] || ""}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        onFocus={() => setFocusedField(field.key)}
                        onBlur={() => setFocusedField(null)}
                        placeholder={field.placeholder}
                        className={`w-full px-3 py-2.5 rounded-lg border text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:ring-offset-1 transition-all duration-200 ${bgBase}`}
                        disabled={isLoading}
                    />
                )}
            </motion.div>
        );
    };

    // ─── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="w-full max-w-3xl mx-auto space-y-5">
            {/* ─── Template Cards ────────────────────────────────────────── */}
            <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-primary/60" />
                    Pick a template to get started
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {availableTemplates.map((tpl, i) => {
                        const active = selectedTemplateId === tpl.id;
                        const colors = assetColors[tpl.assetType];

                        return (
                            <motion.button
                                key={tpl.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleTemplateSelect(tpl.id)}
                                className={`relative text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                                    active
                                        ? "glass-strong border-primary/40 glow-purple"
                                        : "glass border-border/20 hover:border-border/50 hover:glass-strong"
                                }`}
                            >
                                {active && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                                    >
                                        <Check className="w-3 h-3 text-primary-foreground" />
                                    </motion.div>
                                )}

                                <div className="flex items-center gap-2 mb-2.5">
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors.bg} flex items-center justify-center ${colors.text}`}>
                                        {assetIcons[tpl.assetType]}
                                    </div>
                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 bg-muted/50 px-1.5 py-0.5 rounded font-medium">
                                        {tpl.assetType}
                                    </span>
                                </div>

                                <p className={`text-sm font-semibold leading-tight mb-1 ${active ? "text-primary" : ""}`}>
                                    {tpl.label}
                                </p>
                                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                                    {tpl.description}
                                </p>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* ─── Form ──────────────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
                {selectedTemplate && (
                    <motion.div
                        key={selectedTemplate.id}
                        ref={formRef}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ type: "spring", damping: 22, stiffness: 200 }}
                        className="space-y-5"
                    >
                        {/* Progress */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${completeness.percentage}%` }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                />
                            </div>
                            <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">
                                {completeness.percentage}%
                            </span>
                        </div>

                        {/* Required fields section */}
                        <div className="gradient-border rounded-2xl">
                            <div className="bg-background rounded-2xl p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold text-foreground/80 uppercase tracking-wider flex items-center gap-1.5">
                                        <ChevronRight className="w-3 h-3 text-primary" />
                                        Required Details
                                    </p>
                                    <p className="text-[11px] text-muted-foreground tabular-nums">
                                        {completeness.filledRequired} of {completeness.totalRequired} filled
                                    </p>
                                </div>
                                {requiredFields.map((f) => renderField(f, "required"))}
                            </div>
                        </div>

                        {/* Optional fields toggle */}
                        {optionalFields.length > 0 && (
                            <div>
                                <button
                                    onClick={() => setShowOptional(!showOptional)}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-border/40 hover:border-border/60 text-sm text-muted-foreground hover:text-foreground transition-all duration-200 group"
                                >
                                    <span className="flex items-center gap-2">
                                        <Info className="w-3.5 h-3.5 text-primary/50" />
                                        {showOptional ? "Hide" : "Add"} optional details
                                        {completeness.filledOptional > 0 && (
                                            <span className="text-primary text-xs">({completeness.filledOptional} filled)</span>
                                        )}
                                    </span>
                                    <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${showOptional ? "rotate-90" : ""}`} />
                                </button>

                                <AnimatePresence>
                                    {showOptional && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="mt-3 rounded-xl border border-border/20 p-5 space-y-4">
                                                {optionalFields.map((f) => renderField(f, "optional"))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* ─── Prompt Preview ────────────────────────────────── */}
                        <div className="space-y-2">
                            <button
                                onClick={() => setShowPreview(!showPreview)}
                                className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                {showPreview ? "Hide" : "Preview"} generated prompt
                                <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${showPreview ? "rotate-90" : ""}`} />
                            </button>

                            <AnimatePresence>
                                {showPreview && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 rounded-xl glass border border-border/20 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                                    AI Prompt
                                                </p>
                                                {validation.valid && (
                                                    <button
                                                        onClick={() => {
                                                            if (isEditingPreview) {
                                                                setEditedPrompt(finalPrompt);
                                                                setIsEditingPreview(false);
                                                            } else {
                                                                setEditedPrompt(finalPrompt);
                                                                setIsEditingPreview(true);
                                                            }
                                                        }}
                                                        className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors"
                                                    >
                                                        {isEditingPreview ? (
                                                            <><RotateCcw className="w-3 h-3" /> Reset</>
                                                        ) : (
                                                            <><Pencil className="w-3 h-3" /> Edit</>
                                                        )}
                                                    </button>
                                                )}
                                            </div>

                                            {isEditingPreview ? (
                                                <Textarea
                                                    value={editedPrompt}
                                                    onChange={(e) => setEditedPrompt(e.target.value)}
                                                    className="min-h-[100px] resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm"
                                                />
                                            ) : (
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                                    {promptPreview.preview || (
                                                        <span className="italic opacity-60">Fill in the required fields to see a preview...</span>
                                                    )}
                                                </p>
                                            )}

                                            {!validation.valid && validation.missingFields.length > 0 && (
                                                <div className="pt-3 border-t border-border/20 flex items-start gap-2">
                                                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                                    <p className="text-xs text-amber-400/90">
                                                        Still need: {validation.missingFields.join(", ")}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ─── Submit ────────────────────────────────────────── */}
                        <motion.div
                            className="flex items-center justify-between pt-1 pb-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.15 }}
                        >
                            <p className="text-xs text-muted-foreground">
                                {validation.valid ? (
                                    <span className="text-green-400 flex items-center gap-1">
                                        <Check className="w-3 h-3" /> Ready to generate
                                    </span>
                                ) : (
                                    <span>{completeness.totalRequired - completeness.filledRequired} field{completeness.totalRequired - completeness.filledRequired !== 1 ? "s" : ""} remaining</span>
                                )}
                            </p>
                            <Button
                                onClick={handleSubmit}
                                disabled={!canSubmit || isLoading}
                                variant="glow"
                                size="lg"
                                className="gap-2 min-w-[170px]"
                            >
                                {isLoading ? (
                                    "Generating..."
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Generate {assetLabel[selectedTemplate.assetType]}
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty state */}
            {!selectedTemplate && availableTemplates.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                    <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No templates for this asset type yet</p>
                </div>
            )}
        </div>
    );
}

export default PromptTemplateSelector;
