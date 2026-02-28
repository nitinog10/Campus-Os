// ─── Create Event Modal ───────────────────────────────────────────────────────

import { useState, useCallback } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createBlankEvent } from "./eventStore";
import type { CampusEvent, AssetType } from "@/types/campusos";

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
}

const formFields: FormField[] = [
    {
        key: "name",
        label: "Event Name",
        placeholder: "e.g., TechNova 2026, HackFest, Cultural Night",
        icon: <Sparkles className="w-4 h-4" />,
        required: true,
    },
    {
        key: "date",
        label: "Date & Time",
        placeholder: "e.g., March 15-17, 2026 | 9 AM onwards",
        icon: <CalendarDays className="w-4 h-4" />,
        required: true,
    },
    {
        key: "venue",
        label: "Venue",
        placeholder: "e.g., Main Auditorium, Block A, University Campus",
        icon: <MapPin className="w-4 h-4" />,
        required: true,
    },
    {
        key: "organizer",
        label: "Organizer / Club",
        placeholder: "e.g., Computer Science Department, Tech Club",
        icon: <Users className="w-4 h-4" />,
        required: true,
    },
    {
        key: "theme",
        label: "Visual Theme",
        placeholder: "e.g., Cyberpunk, Neon Futuristic, Minimalist, Nature",
        icon: <Palette className="w-4 h-4" />,
        required: false,
    },
    {
        key: "description",
        label: "Short Description",
        placeholder: "Describe your event in 1-3 sentences. What makes it special?",
        icon: <FileText className="w-4 h-4" />,
        required: true,
        multiline: true,
    },
];

const assetTypeOptions: { type: AssetType; label: string; icon: React.ReactNode; description: string }[] = [
    { type: "poster", label: "Poster", icon: <Image className="w-5 h-5" />, description: "Eye-catching event poster" },
    { type: "landing", label: "Landing Page", icon: <Globe className="w-5 h-5" />, description: "Event registration website" },
    { type: "presentation", label: "Presentation", icon: <Presentation className="w-5 h-5" />, description: "Event pitch deck" },
];

export function CreateEventModal({ isOpen, onClose, onSubmit }: CreateEventModalProps) {
    const [form, setForm] = useState<Record<string, string>>({});
    const [selectedTypes, setSelectedTypes] = useState<AssetType[]>(["poster", "landing", "presentation"]);
    const [errors, setErrors] = useState<Record<string, boolean>>({});

    const handleFieldChange = useCallback((key: string, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        // Clear error on edit
        if (errors[key]) {
            setErrors((prev) => ({ ...prev, [key]: false }));
        }
    }, [errors]);

    const toggleType = useCallback((type: AssetType) => {
        setSelectedTypes((prev) => {
            if (prev.includes(type)) {
                // Don't allow deselecting all
                if (prev.length === 1) return prev;
                return prev.filter((t) => t !== type);
            }
            return [...prev, type];
        });
    }, []);

    const validate = useCallback((): boolean => {
        const newErrors: Record<string, boolean> = {};
        let valid = true;

        for (const field of formFields) {
            if (field.required && !form[field.key]?.trim()) {
                newErrors[field.key] = true;
                valid = false;
            }
        }

        setErrors(newErrors);
        return valid;
    }, [form]);

    const handleSubmit = useCallback(() => {
        if (!validate()) return;

        const event = createBlankEvent({
            name: form.name?.trim() || "",
            date: form.date?.trim() || "",
            venue: form.venue?.trim() || "",
            organizer: form.organizer?.trim() || "",
            theme: form.theme?.trim() || "",
            description: form.description?.trim() || "",
        });

        onSubmit(event, selectedTypes);

        // Reset form
        setForm({});
        setErrors({});
    }, [form, selectedTypes, validate, onSubmit]);

    const handleClose = useCallback(() => {
        setForm({});
        setErrors({});
        onClose();
    }, [onClose]);

    const filledRequired = formFields.filter((f) => f.required && form[f.key]?.trim()).length;
    const totalRequired = formFields.filter((f) => f.required).length;

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
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border/50 bg-background shadow-2xl pointer-events-auto">
                            {/* Header */}
                            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border/50 bg-background/95 backdrop-blur-sm rounded-t-2xl">
                                <div>
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-primary" />
                                        Create Campus Event
                                    </h2>
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                        Generate poster, landing page & presentation in one go
                                    </p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-6">
                                {/* Progress */}
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">
                                        {filledRequired}/{totalRequired} required fields
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-primary rounded-full"
                                                animate={{
                                                    width: `${totalRequired > 0 ? Math.round((filledRequired / totalRequired) * 100) : 0}%`,
                                                }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-4">
                                    {formFields.map((field) => (
                                        <div key={field.key} className="space-y-1.5">
                                            <label
                                                htmlFor={`event-${field.key}`}
                                                className="text-sm font-medium flex items-center gap-2"
                                            >
                                                <span className="text-primary/70">{field.icon}</span>
                                                {field.label}
                                                {field.required ? (
                                                    <span className="text-destructive">*</span>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">(optional)</span>
                                                )}
                                            </label>
                                            {field.multiline ? (
                                                <Textarea
                                                    id={`event-${field.key}`}
                                                    value={form[field.key] || ""}
                                                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                                    placeholder={field.placeholder}
                                                    className={`min-h-[90px] resize-none bg-muted/30 border-border/50 focus:border-primary/50 ${
                                                        errors[field.key] ? "border-destructive/50 ring-1 ring-destructive/30" : ""
                                                    }`}
                                                />
                                            ) : (
                                                <input
                                                    id={`event-${field.key}`}
                                                    type="text"
                                                    value={form[field.key] || ""}
                                                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                                    placeholder={field.placeholder}
                                                    className={`w-full px-3 py-2 rounded-lg border bg-muted/30 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:border-primary/50 transition-all duration-200 ${
                                                        errors[field.key]
                                                            ? "border-destructive/50 ring-1 ring-destructive/30"
                                                            : "border-border/50"
                                                    }`}
                                                />
                                            )}
                                            {errors[field.key] && (
                                                <p className="text-xs text-destructive">This field is required</p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Asset Type Selection */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium">
                                        Assets to Generate
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {assetTypeOptions.map((opt) => {
                                            const isSelected = selectedTypes.includes(opt.type);
                                            return (
                                                <button
                                                    key={opt.type}
                                                    onClick={() => toggleType(opt.type)}
                                                    className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 text-center ${
                                                        isSelected
                                                            ? "glass-strong border-primary/30 text-primary glow-purple"
                                                            : "glass border-border/30 text-muted-foreground hover:text-foreground hover:border-border/50"
                                                    }`}
                                                >
                                                    {isSelected && (
                                                        <div className="absolute top-2 right-2">
                                                            <Check className="w-3.5 h-3.5 text-primary" />
                                                        </div>
                                                    )}
                                                    {opt.icon}
                                                    <div>
                                                        <p className="text-sm font-medium">{opt.label}</p>
                                                        <p className="text-[10px] text-muted-foreground mt-0.5">{opt.description}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        All selected assets share the same event context for visual consistency
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="sticky bottom-0 flex items-center justify-between px-6 py-4 border-t border-border/50 bg-background/95 backdrop-blur-sm rounded-b-2xl">
                                <p className="text-xs text-muted-foreground">
                                    {selectedTypes.length} asset{selectedTypes.length !== 1 ? "s" : ""} will be generated sequentially
                                </p>
                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={handleClose}>
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="glow"
                                        onClick={handleSubmit}
                                        disabled={filledRequired < totalRequired}
                                        className="gap-2"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Generate All Assets
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default CreateEventModal;
