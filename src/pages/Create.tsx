import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    RotateCcw,
    ExternalLink,
    Sparkles,
    Loader2,
    Image,
    Globe,
    Presentation,
    Wand2,
    PenLine,
    CalendarPlus,
    ArrowRight,
    Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { IntentInput } from "@/components/IntentInput";
import { PromptTemplateSelector } from "@/prompt-intelligence";
import { CreateEventModal, EventAssetGroup, useEventGenerator } from "@/events";
import { useCreationEngine } from "@/hooks/useCreationEngine";
import type { AssetType, CampusEvent } from "@/types/campusos";

type PromptMode = "free" | "guided";

const assetTypes: {
    value: AssetType | "auto";
    label: string;
    icon: React.ReactNode;
    description: string;
    gradient: string;
    glow: string;
}[] = [
    {
        value: "auto",
        label: "Auto-Detect",
        icon: <Sparkles className="w-5 h-5" />,
        description: "AI picks the best format",
        gradient: "from-purple-500/20 to-pink-500/20",
        glow: "hover:shadow-purple-500/10",
    },
    {
        value: "poster",
        label: "Poster",
        icon: <Image className="w-5 h-5" />,
        description: "Event posters & flyers",
        gradient: "from-pink-500/20 to-orange-500/20",
        glow: "hover:shadow-pink-500/10",
    },
    {
        value: "landing",
        label: "Landing Page",
        icon: <Globe className="w-5 h-5" />,
        description: "Full website pages",
        gradient: "from-blue-500/20 to-cyan-500/20",
        glow: "hover:shadow-blue-500/10",
    },
    {
        value: "presentation",
        label: "Presentation",
        icon: <Presentation className="w-5 h-5" />,
        description: "Slide decks & pitches",
        gradient: "from-indigo-500/20 to-purple-500/20",
        glow: "hover:shadow-indigo-500/10",
    },
];

export default function Create() {
    const { session, runCreation, reset } = useCreationEngine();
    const [selectedType, setSelectedType] = useState<AssetType | "auto">("auto");
    const [promptMode, setPromptMode] = useState<PromptMode>("guided");
    const [showEventModal, setShowEventModal] = useState(false);

    // Event Mode
    const eventGen = useEventGenerator();
    const isEventMode = eventGen.overallStatus !== "idle";

    const handleEventSubmit = (event: CampusEvent, selectedTypes: AssetType[]) => {
        setShowEventModal(false);
        eventGen.runEventGeneration(event, selectedTypes);
    };

    const handleEventReset = () => {
        eventGen.reset();
    };

    const isActive = session.status !== "idle" || isEventMode;

    return (
        <div className="min-h-screen pt-16">
            {/* Background */}
            <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />
            <div className="fixed top-32 right-10 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-32 left-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-5xl mx-auto px-6 py-10 md:py-14">
                {/* ── Hero ─────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">
                        {session.status === "generating" ? (
                            <span className="gradient-text">
                                Creating your {selectedType === "auto" ? "asset" : selectedType}…
                            </span>
                        ) : session.status === "done" ? (
                            <span className="gradient-text">Created!</span>
                        ) : (
                            <>
                                What do you want to{" "}
                                <span className="gradient-text">create</span>?
                            </>
                        )}
                    </h1>
                    {!isActive && (
                        <p className="text-muted-foreground max-w-lg mx-auto text-sm md:text-base">
                            Choose a format, describe your idea — AI builds it for you
                        </p>
                    )}
                </motion.div>

                {/* ── Asset Type Cards + Event Card ─────────────────────── */}
                {!isActive && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 }}
                        className="mb-10"
                    >
                        {/* Asset type grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            {assetTypes.map((type, i) => {
                                const active = selectedType === type.value;
                                return (
                                    <motion.button
                                        key={type.value}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 + i * 0.04 }}
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setSelectedType(type.value)}
                                        className={`relative text-left p-4 rounded-xl border transition-all duration-200 ${
                                            active
                                                ? "glass-strong border-primary/40 glow-purple"
                                                : `glass border-border/30 hover:border-border/60 hover:shadow-lg ${type.glow}`
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${type.gradient} flex items-center justify-center mb-3 ${
                                            active ? "text-primary" : "text-muted-foreground"
                                        }`}>
                                            {type.icon}
                                        </div>
                                        <p className={`text-sm font-semibold mb-0.5 ${active ? "text-primary" : ""}`}>
                                            {type.label}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                                            {type.description}
                                        </p>
                                        {active && (
                                            <motion.div
                                                layoutId="activeType"
                                                className="absolute inset-0 rounded-xl border-2 border-primary/30 pointer-events-none"
                                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                            />
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* ── Create Event Card (prominent!) ──────────────── */}
                        <motion.button
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setShowEventModal(true)}
                            className="w-full p-5 rounded-xl gradient-border group cursor-pointer"
                        >
                            <div className="flex items-center gap-4 bg-background rounded-xl">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                                    <CalendarPlus className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                                        Create Campus Event
                                        <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider">
                                            Multi-Asset
                                        </span>
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Generate a coordinated poster, landing page & presentation — all at once from one event brief
                                    </p>
                                </div>
                                <div className="hidden sm:flex items-center gap-2 shrink-0">
                                    <div className="flex -space-x-2">
                                        <div className="w-7 h-7 rounded-lg bg-pink-500/15 border border-pink-500/20 flex items-center justify-center">
                                            <Image className="w-3.5 h-3.5 text-pink-400" />
                                        </div>
                                        <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                                            <Globe className="w-3.5 h-3.5 text-blue-400" />
                                        </div>
                                        <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
                                            <Presentation className="w-3.5 h-3.5 text-purple-400" />
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                                </div>
                            </div>
                        </motion.button>
                    </motion.div>
                )}

                {/* ── Mode Toggle + Input ──────────────────────────────── */}
                {!isActive && (
                    <div className="max-w-3xl mx-auto">
                        {/* Mode toggle */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.18 }}
                            className="flex items-center justify-between mb-5"
                        >
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                                <Zap className="w-3 h-3 text-primary/60" />
                                Prompt Mode
                            </p>
                            <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg glass border border-border/50">
                                <button
                                    onClick={() => setPromptMode("guided")}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                                        promptMode === "guided"
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <Wand2 className="w-3 h-3" />
                                    Guided
                                </button>
                                <button
                                    onClick={() => setPromptMode("free")}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                                        promptMode === "free"
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <PenLine className="w-3 h-3" />
                                    Free Text
                                </button>
                            </div>
                        </motion.div>

                        {/* Input area */}
                        <AnimatePresence mode="wait">
                            {promptMode === "free" ? (
                                <motion.div
                                    key="free"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <IntentInput
                                        onSubmit={(prompt) => runCreation(prompt, selectedType)}
                                        isLoading={false}
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="guided"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <PromptTemplateSelector
                                        assetType={selectedType}
                                        onPromptReady={(prompt) => runCreation(prompt, selectedType)}
                                        isLoading={false}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* ── Event Generation Progress ───────────────────────── */}
                {isEventMode && eventGen.event && (
                    <EventAssetGroup
                        event={eventGen.event}
                        assetStatus={eventGen.assetStatus}
                        assetUrls={eventGen.assetUrls}
                        errors={eventGen.errors}
                        overallStatus={eventGen.overallStatus}
                        onReset={handleEventReset}
                    />
                )}

                {/* ── Single Asset — Generating ───────────────────────── */}
                {!isEventMode && session.status === "generating" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-6 py-20"
                    >
                        <div className="relative">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl opacity-20 blur-xl animate-pulse-glow" />
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-medium">
                                AI is building your {selectedType === "auto" ? "asset" : selectedType}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2 max-w-md">
                                Interpreting your request, planning the layout, and generating production-ready content. This takes 15-30 seconds.
                            </p>
                        </div>
                        <div className="flex gap-1.5">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <motion.div
                                    key={i}
                                    className="w-2 h-2 rounded-full bg-primary"
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{
                                        duration: 1.2,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                    }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── Single Asset — Done ─────────────────────────────── */}
                {!isEventMode && session.status === "done" && session.asset && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-6 py-16"
                    >
                        <div className="relative">
                            <div className="w-20 h-20 rounded-2xl bg-green-500/10 flex items-center justify-center">
                                <Sparkles className="w-10 h-10 text-green-400" />
                            </div>
                            <div className="absolute inset-0 bg-green-500 rounded-2xl opacity-10 blur-xl" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-2">{session.asset.title}</h2>
                            <p className="text-muted-foreground">
                                Your {session.asset.type} has been generated and opened in a new tab
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="glow"
                                onClick={() => window.open(session.asset!.viewUrl, "_blank")}
                                className="gap-2"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Open Viewer
                            </Button>
                            <Button variant="outline" onClick={reset} className="gap-2">
                                <RotateCcw className="w-4 h-4" />
                                Create Another
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* ── Single Asset — Error ────────────────────────────── */}
                {!isEventMode && session.status === "error" && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-4 py-16"
                    >
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 max-w-md text-center">
                            {session.error}
                        </div>
                        <Button variant="outline" onClick={reset} className="gap-2">
                            <RotateCcw className="w-4 h-4" />
                            Try Again
                        </Button>
                    </motion.div>
                )}
            </div>

            {/* Event Modal */}
            <CreateEventModal
                isOpen={showEventModal}
                onClose={() => setShowEventModal(false)}
                onSubmit={handleEventSubmit}
            />
        </div>
    );
}
