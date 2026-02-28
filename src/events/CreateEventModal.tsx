// ─── Create Event Modal ───────────────────────────────────────────────────────
// Two-step wizard: 1) Event details  2) Choose assets → Generate

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    CalendarDays,
    MapPin,
    Users,
    Palette,
    FileText,
    Sparkles,
    Image,
    Globe,
    Presentation,
    Check,
    ArrowRight,
    ArrowLeft,
    Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createBlankEvent } from "./eventStore";
import type { CampusEvent, AssetType } from "@/types/campusos";

// ─── Types ──────────────────────────────────────────────────────────────────

interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (event: CampusEvent, selectedTypes: AssetType[]) => void;
}

interface FormField {
    key: keyof Omit<CampusEvent, "id" | "createdAt" | "assets">;
    label: string;
    placeholder: string;
    icon: React.ReactNode;
    required: boolean;
    multiline?: boolean;
    hint?: string;
}

// ─── Config ─────────────────────────────────────────────────────────────────

const formFields: FormField[] = [
    {
        key: "name",
        label: "Event Name",
        placeholder: "e.g., TechNova 2026",
        icon: <Sparkles className="w-4 h-4" />,
        required: true,
        hint: "The main title that appears on all assets",
    },
    {
        key: "date",
        label: "Date & Time",
        placeholder: "e.g., March 15-17, 2026 · 9 AM onwards",
        icon: <CalendarDays className="w-4 h-4" />,
        required: true,
    },
    {
        key: "venue",
        label: "Venue",
        placeholder: "e.g., Main Auditorium, Block A",
        icon: <MapPin className="w-4 h-4" />,
        required: true,
    },
    {
        key: "organizer",
        label: "Organizer / Club",
        placeholder: "e.g., Computer Science Department",
        icon: <Users className="w-4 h-4" />,
        required: true,
    },
    {
        key: "theme",
        label: "Visual Theme",
        placeholder: "e.g., Cyberpunk, Neon, Minimalist",
        icon: <Palette className="w-4 h-4" />,
        required: false,
        hint: "Sets the visual mood across poster, page & slides",
    },
    {
        key: "description",
        label: "What's this event about?",
        placeholder: "A short description — what makes this event exciting? (1-3 sentences)",
        icon: <FileText className="w-4 h-4" />,
        required: true,
        multiline: true,
    },
];

const assetOptions: {
    type: AssetType;
    label: string;
    icon: React.ReactNode;
    color: string;
    description: string;
    timeEstimate: string;
}[] = [
    {
        type: "poster",
        label: "Event Poster",
        icon: <Image className="w-6 h-6" />,
        color: "from-pink-500/20 to-orange-500/20 border-pink-500/30",
        description: "A striking visual poster for promotions and social media",
        timeEstimate: "~15 sec",
    },
    {
        type: "landing",
        label: "Landing Page",
        icon: <Globe className="w-6 h-6" />,
        color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
        description: "A full event website with details, schedule & registration",
        timeEstimate: "~20 sec",
    },
    {
        type: "presentation",
        label: "Pitch Deck",
        icon: <Presentation className="w-6 h-6" />,
        color: "from-purple-500/20 to-indigo-500/20 border-purple-500/30",
        description: "Slide deck for sponsors, faculty, or team presentations",
        timeEstimate: "~25 sec",
    },
];

// ─── Component ──────────────────────────────────────────────────────────────

export function CreateEventModal({ isOpen, onClose, onSubmit }: CreateEventModalProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [form, setForm] = useState<Record<string, string>>({});
    const [selectedTypes, setSelectedTypes] = useState<AssetType[]>(["poster", "landing", "presentation"]);
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // ─── Derived ────────────────────────────────────────────────────────────

    const filledRequired = useMemo(
        () => formFields.filter((f) => f.required && form[f.key]?.trim()).length,
        [form]
    );
    const totalRequired = formFields.filter((f) => f.required).length;
    const allRequiredFilled = filledRequired === totalRequired;

    const totalEstimateSeconds = useMemo(() => {
        let secs = 0;
        if (selectedTypes.includes("poster")) secs += 15;
        if (selectedTypes.includes("landing")) secs += 20;
        if (selectedTypes.includes("presentation")) secs += 25;
        return secs;
    }, [selectedTypes]);

    // ─── Handlers ───────────────────────────────────────────────────────────

    const handleFieldChange = useCallback(
        (key: string, value: string) => {
            setForm((prev) => ({ ...prev, [key]: value }));
            if (errors[key]) setErrors((prev) => ({ ...prev, [key]: false }));
        },
        [errors]
    );

    const handleFieldBlur = useCallback((key: string) => {
        setTouched((prev) => ({ ...prev, [key]: true }));
    }, []);

    const toggleType = useCallback((type: AssetType) => {
        setSelectedTypes((prev) => {
            const next = prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type];
            return next.length === 0 ? prev : next;
        });
    }, []);

    const validateStep1 = useCallback((): boolean => {
        const newErrors: Record<string, boolean> = {};
        let valid = true;
        for (const field of formFields) {
            if (field.required && !form[field.key]?.trim()) {
                newErrors[field.key] = true;
                valid = false;
            }
        }
        setErrors(newErrors);
        // Mark all as touched
        const allTouched: Record<string, boolean> = {};
        formFields.forEach((f) => { allTouched[f.key] = true; });
        setTouched(allTouched);
        return valid;
    }, [form]);

    const goToStep2 = useCallback(() => {
        if (validateStep1()) setStep(2);
    }, [validateStep1]);

    const handleSubmit = useCallback(() => {
        const event = createBlankEvent({
            name: form.name?.trim() || "",
            date: form.date?.trim() || "",
            venue: form.venue?.trim() || "",
            organizer: form.organizer?.trim() || "",
            theme: form.theme?.trim() || "",
            description: form.description?.trim() || "",
        });
        onSubmit(event, selectedTypes);
        // Reset
        setForm({});
        setErrors({});
        setTouched({});
        setStep(1);
    }, [form, selectedTypes, onSubmit]);

    const handleClose = useCallback(() => {
        setForm({});
        setErrors({});
        setTouched({});
        setStep(1);
        onClose();
    }, [onClose]);

    // ─── Render ─────────────────────────────────────────────────────────────

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 24 }}
                        transition={{ type: "spring", damping: 26, stiffness: 300 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-border/50 bg-background shadow-2xl pointer-events-auto overflow-hidden">
                            {/* ── Header ──────────────────────────────────── */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                                        <Sparkles className="w-4.5 h-4.5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">Create Campus Event</h2>
                                        <p className="text-xs text-muted-foreground">
                                            Step {step} of 2 — {step === 1 ? "Event Details" : "Choose Assets"}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-2 rounded-lg hover:bg-muted/80 transition-colors"
                                >
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            {/* ── Step indicator ─────────────────────────── */}
                            <div className="px-6 pt-4 pb-2">
                                <div className="flex items-center gap-2">
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                        step === 1 ? "bg-primary/10 text-primary" : "bg-green-500/10 text-green-400"
                                    }`}>
                                        {step > 1 ? <Check className="w-3 h-3" /> : <span className="w-4 text-center">1</span>}
                                        Details
                                    </div>
                                    <div className="flex-1 h-px bg-border/50" />
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                        step === 2 ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
                                    }`}>
                                        <span className="w-4 text-center">2</span>
                                        Assets
                                    </div>
                                </div>
                            </div>

                            {/* ── Body (scrollable) ──────────────────────── */}
                            <div className="flex-1 overflow-y-auto px-6 py-4">
                                <AnimatePresence mode="wait">
                                    {/* ── Step 1: Event Details ─────────── */}
                                    {step === 1 && (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-4"
                                        >
                                            {formFields.map((field) => {
                                                const hasError = errors[field.key] && touched[field.key];
                                                const isFilled = Boolean(form[field.key]?.trim());

                                                return (
                                                    <div key={field.key} className="space-y-1.5">
                                                        <label
                                                            htmlFor={`event-${field.key}`}
                                                            className="text-sm font-medium flex items-center gap-2"
                                                        >
                                                            <span className={`transition-colors duration-200 ${
                                                                isFilled ? "text-green-400" : "text-primary/60"
                                                            }`}>
                                                                {field.icon}
                                                            </span>
                                                            {field.label}
                                                            {field.required && (
                                                                <span className="text-destructive/70 text-xs">*</span>
                                                            )}
                                                            {!field.required && (
                                                                <span className="text-muted-foreground/50 text-[10px]">optional</span>
                                                            )}
                                                        </label>

                                                        {field.hint && (
                                                            <p className="text-[11px] text-muted-foreground/70 -mt-0.5">
                                                                {field.hint}
                                                            </p>
                                                        )}

                                                        {field.multiline ? (
                                                            <Textarea
                                                                id={`event-${field.key}`}
                                                                value={form[field.key] || ""}
                                                                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                                                onBlur={() => handleFieldBlur(field.key)}
                                                                placeholder={field.placeholder}
                                                                className={`min-h-[88px] resize-none transition-all duration-200 ${
                                                                    hasError
                                                                        ? "border-destructive/50 bg-destructive/5"
                                                                        : "bg-muted/20 border-border/40 focus:bg-primary/5 focus:border-primary/40"
                                                                }`}
                                                            />
                                                        ) : (
                                                            <input
                                                                id={`event-${field.key}`}
                                                                type="text"
                                                                value={form[field.key] || ""}
                                                                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                                                onBlur={() => handleFieldBlur(field.key)}
                                                                placeholder={field.placeholder}
                                                                className={`w-full px-3 py-2.5 rounded-lg border text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:ring-offset-1 transition-all duration-200 ${
                                                                    hasError
                                                                        ? "border-destructive/50 bg-destructive/5"
                                                                        : "border-border/40 bg-muted/20 focus:bg-primary/5 focus:border-primary/40"
                                                                }`}
                                                            />
                                                        )}

                                                        {hasError && (
                                                            <motion.p
                                                                initial={{ opacity: 0, y: -4 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className="text-xs text-destructive flex items-center gap-1"
                                                            >
                                                                Please fill in this field
                                                            </motion.p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </motion.div>
                                    )}

                                    {/* ── Step 2: Choose Assets ─────────── */}
                                    {step === 2 && (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-5"
                                        >
                                            {/* Event summary pill */}
                                            <div className="p-3 rounded-xl glass border border-border/30 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-primary">
                                                    <Sparkles className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold truncate">{form.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {form.date} · {form.venue}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setStep(1)}
                                                    className="text-xs text-primary hover:underline shrink-0"
                                                >
                                                    Edit
                                                </button>
                                            </div>

                                            {/* Asset cards */}
                                            <div>
                                                <p className="text-xs font-semibold text-foreground/80 uppercase tracking-wider mb-3">
                                                    Which assets should we generate?
                                                </p>
                                                <div className="space-y-2.5">
                                                    {assetOptions.map((opt) => {
                                                        const isSelected = selectedTypes.includes(opt.type);
                                                        return (
                                                            <motion.button
                                                                key={opt.type}
                                                                whileTap={{ scale: 0.99 }}
                                                                onClick={() => toggleType(opt.type)}
                                                                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
                                                                    isSelected
                                                                        ? `glass-strong bg-gradient-to-r ${opt.color} glow-purple`
                                                                        : "glass border-border/20 hover:border-border/40 opacity-60 hover:opacity-80"
                                                                }`}
                                                            >
                                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                                                                    isSelected ? "text-primary" : "text-muted-foreground"
                                                                }`}>
                                                                    {opt.icon}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-semibold">{opt.label}</p>
                                                                    <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                                                                </div>
                                                                <div className="flex flex-col items-end gap-1 shrink-0">
                                                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                                                        isSelected
                                                                            ? "bg-primary border-primary"
                                                                            : "border-muted-foreground/30"
                                                                    }`}>
                                                                        {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                                                                    </div>
                                                                    <span className="text-[10px] text-muted-foreground">{opt.timeEstimate}</span>
                                                                </div>
                                                            </motion.button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Time estimate */}
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 rounded-lg bg-muted/20">
                                                <Zap className="w-3.5 h-3.5 text-primary" />
                                                <span>
                                                    Estimated time: <strong className="text-foreground">~{totalEstimateSeconds}s</strong> for {selectedTypes.length} asset{selectedTypes.length !== 1 ? "s" : ""}
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* ── Footer ─────────────────────────────────── */}
                            <div className="flex items-center justify-between px-6 py-4 border-t border-border/30 bg-background/50">
                                {step === 1 ? (
                                    <>
                                        <p className="text-xs text-muted-foreground">
                                            {filledRequired}/{totalRequired} required
                                        </p>
                                        <div className="flex gap-3">
                                            <Button variant="outline" onClick={handleClose} size="sm">
                                                Cancel
                                            </Button>
                                            <Button
                                                variant={allRequiredFilled ? "glow" : "default"}
                                                onClick={goToStep2}
                                                size="sm"
                                                className="gap-1.5 min-w-[120px]"
                                            >
                                                Next
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setStep(1)}
                                            size="sm"
                                            className="gap-1.5"
                                        >
                                            <ArrowLeft className="w-3.5 h-3.5" />
                                            Back
                                        </Button>
                                        <Button
                                            variant="glow"
                                            onClick={handleSubmit}
                                            className="gap-2 min-w-[180px]"
                                        >
                                            <Sparkles className="w-4 h-4" />
                                            Generate {selectedTypes.length} Asset{selectedTypes.length !== 1 ? "s" : ""}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default CreateEventModal;
