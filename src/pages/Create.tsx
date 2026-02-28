import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, ExternalLink, Sparkles, Loader2, Image, Globe, Presentation, Wand2, PenLine, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IntentInput } from "@/components/IntentInput";
import { PromptTemplateSelector } from "@/prompt-intelligence";
import { CreateEventModal, EventAssetGroup, useEventGenerator } from "@/events";
import { useCreationEngine } from "@/hooks/useCreationEngine";
import type { AssetType, CampusEvent } from "@/types/campusos";

type PromptMode = "free" | "guided";

const assetTypes: { value: AssetType | "auto"; label: string; icon: React.ReactNode; description: string }[] = [
    { value: "auto", label: "Auto-Detect", icon: <Sparkles className="w-5 h-5" />, description: "AI decides the best format" },
    { value: "poster", label: "Poster", icon: <Image className="w-5 h-5" />, description: "Event posters & flyers" },
    { value: "landing", label: "Landing Page", icon: <Globe className="w-5 h-5" />, description: "Full website pages" },
    { value: "presentation", label: "Presentation", icon: <Presentation className="w-5 h-5" />, description: "Slide decks" },
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
            <div className="fixed top-40 right-20 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-40 left-20 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-6 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">
                        {session.status === "generating" ? (
                            <span className="gradient-text">Creating your {selectedType === "auto" ? "asset" : selectedType}…</span>
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
                        <p className="text-muted-foreground max-w-lg mx-auto">
                            Describe your idea and choose a format — AI builds the rest
                        </p>
                    )}
                </motion.div>

                {/* Asset Type Selector */}
                {!isActive && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-wrap justify-center gap-3 mb-8"
                    >
                        {assetTypes.map((type) => (
                            <button
                                key={type.value}
                                onClick={() => setSelectedType(type.value)}
                                className={`relative flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200 cursor-pointer group ${selectedType === type.value
                                        ? "glass-strong border border-primary/30 text-primary glow-purple"
                                        : "glass border border-transparent text-muted-foreground hover:text-foreground hover:border-border/50"
                                    }`}
                            >
                                {type.icon}
                                <div className="text-left">
                                    <p className="text-sm font-medium">{type.label}</p>
                                    <p className="text-[11px] text-muted-foreground">{type.description}</p>
                                </div>
                            </button>
                        ))}
                    </motion.div>
                )}

                {/* Create Event Button */}
                {!isActive && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12 }}
                        className="flex justify-center mb-6"
                    >
                        <button
                            onClick={() => setShowEventModal(true)}
                            className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl glass-strong border border-dashed border-primary/30 text-primary hover:border-primary/50 hover:glow-purple transition-all duration-200 group"
                        >
                            <CalendarPlus className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                            <div className="text-left">
                                <p className="text-sm font-medium">Create Campus Event</p>
                                <p className="text-[10px] text-muted-foreground">Generate poster + landing page + presentation at once</p>
                            </div>
                        </button>
                    </motion.div>
                )}

                {/* Prompt Mode Toggle */}
                {!isActive && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="flex justify-center mb-6"
                    >
                        <div className="inline-flex items-center gap-1 p-1 rounded-xl glass border border-border/50">
                            <button
                                onClick={() => setPromptMode("guided")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    promptMode === "guided"
                                        ? "bg-primary text-primary-foreground shadow-lg"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <Wand2 className="w-4 h-4" />
                                Guided Prompt
                            </button>
                            <button
                                onClick={() => setPromptMode("free")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    promptMode === "free"
                                        ? "bg-primary text-primary-foreground shadow-lg"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <PenLine className="w-4 h-4" />
                                Free Prompt
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Input Section */}
                {!isActive && (
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
                )}

                {/* Event Generation Progress */}
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

                {/* Single Asset — Generating State */}
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
                            <p className="text-lg font-medium">AI is building your {selectedType === "auto" ? "asset" : selectedType}</p>
                            <p className="text-sm text-muted-foreground mt-2 max-w-md">
                                Interpreting your request, planning the layout, and generating production-ready content. This takes 15-30 seconds.
                            </p>
                        </div>
                        <div className="flex gap-1">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="w-2 h-2 rounded-full bg-primary/40 animate-pulse"
                                    style={{ animationDelay: `${i * 200}ms` }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Single Asset — Done State */}
                {!isEventMode && session.status === "done" && session.asset && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-6 py-16"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-green-500/10 flex items-center justify-center">
                            <Sparkles className="w-10 h-10 text-green-400" />
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

                {/* Single Asset — Error State */}
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
