// ─── Event Assets Group Display ───────────────────────────────────────────────
// Polished card-based display for grouped event assets with animated progress

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Image,
    Globe,
    Presentation,
    ExternalLink,
    Loader2,
    CheckCircle2,
    XCircle,
    SkipForward,
    RotateCcw,
    Sparkles,
    CalendarDays,
    MapPin,
    PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AssetType, CampusEvent, EventGenerationStatus } from "@/types/campusos";

// ─── Types ──────────────────────────────────────────────────────────────────

interface EventAssetGroupProps {
    event: CampusEvent;
    assetStatus: EventGenerationStatus;
    assetUrls: Partial<Record<AssetType, string>>;
    errors: Partial<Record<AssetType, string>>;
    overallStatus: "idle" | "generating" | "done" | "error";
    onReset: () => void;
}

// ─── Config ─────────────────────────────────────────────────────────────────

const assetMeta: {
    type: AssetType;
    label: string;
    icon: React.ReactNode;
    gradient: string;
    glowColor: string;
    description: string;
}[] = [
    {
        type: "poster",
        label: "Event Poster",
        icon: <Image className="w-5 h-5" />,
        gradient: "from-pink-500/20 to-orange-500/20",
        glowColor: "shadow-pink-500/10",
        description: "Visual promotional poster",
    },
    {
        type: "landing",
        label: "Landing Page",
        icon: <Globe className="w-5 h-5" />,
        gradient: "from-blue-500/20 to-cyan-500/20",
        glowColor: "shadow-blue-500/10",
        description: "Complete event website",
    },
    {
        type: "presentation",
        label: "Pitch Deck",
        icon: <Presentation className="w-5 h-5" />,
        gradient: "from-purple-500/20 to-indigo-500/20",
        glowColor: "shadow-purple-500/10",
        description: "Slide presentation deck",
    },
];

// ─── Sub-components ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { text: string; className: string; icon: React.ReactNode }> = {
        generating: {
            text: "Generating",
            className: "bg-primary/10 text-primary border-primary/20",
            icon: <Loader2 className="w-3 h-3 animate-spin" />,
        },
        done: {
            text: "Complete",
            className: "bg-green-500/10 text-green-400 border-green-500/20",
            icon: <CheckCircle2 className="w-3 h-3" />,
        },
        error: {
            text: "Failed",
            className: "bg-red-500/10 text-red-400 border-red-500/20",
            icon: <XCircle className="w-3 h-3" />,
        },
        skipped: {
            text: "Skipped",
            className: "bg-muted/30 text-muted-foreground/50 border-muted/20",
            icon: <SkipForward className="w-3 h-3" />,
        },
        pending: {
            text: "Queued",
            className: "bg-muted/20 text-muted-foreground/60 border-border/20",
            icon: <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/30" />,
        },
    };
    const c = config[status] || config.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${c.className}`}>
            {c.icon}
            {c.text}
        </span>
    );
}

// ─── Component ──────────────────────────────────────────────────────────────

export function EventAssetGroup({
    event,
    assetStatus,
    assetUrls,
    errors,
    overallStatus,
    onReset,
}: EventAssetGroupProps) {
    const allDone = overallStatus === "done" || overallStatus === "error";
    const successCount = useMemo(
        () => Object.values(assetStatus).filter((s) => s === "done").length,
        [assetStatus]
    );
    const totalSelected = useMemo(
        () => Object.values(assetStatus).filter((s) => s !== "skipped").length,
        [assetStatus]
    );
    const progressPct = totalSelected > 0 ? Math.round((successCount / totalSelected) * 100) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mx-auto"
        >
            {/* ── Event Header Card ──────────────────────── */}
            <motion.div
                initial={{ scale: 0.96 }}
                animate={{ scale: 1 }}
                className="p-5 rounded-2xl glass-strong border border-primary/10 mb-8"
            >
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center shrink-0">
                        <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider">
                                Event Mode
                            </span>
                        </div>
                        <h2 className="text-xl font-bold truncate">{event.name}</h2>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" />
                                {event.date}
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.venue}
                            </span>
                            {event.organizer && (
                                <span className="inline-flex items-center gap-1 text-muted-foreground/70">
                                    by {event.organizer}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Overall Progress Bar ──────────────────── */}
                {overallStatus === "generating" && (
                    <div className="mt-5">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                            <span className="flex items-center gap-1.5">
                                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                                Generating assets…
                            </span>
                            <span className="font-medium text-foreground/70">
                                {successCount}/{totalSelected} complete
                            </span>
                        </div>
                        <div className="w-full h-2.5 bg-muted/40 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 rounded-full"
                                animate={{ width: `${progressPct}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                )}

                {/* ── Completion Summary ────────────────────── */}
                {allDone && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-5 flex items-center gap-2 text-sm"
                    >
                        <PartyPopper className="w-4 h-4 text-green-400" />
                        <span className="text-foreground/80">
                            <strong className="text-foreground">{successCount}</strong> of {totalSelected} assets generated successfully
                        </span>
                    </motion.div>
                )}
            </motion.div>

            {/* ── Asset Cards ────────────────────────────── */}
            <div className="grid gap-3">
                <AnimatePresence>
                    {assetMeta.map((meta, index) => {
                        const status = assetStatus[meta.type];
                        if (status === "skipped") return null;

                        const url = assetUrls[meta.type];
                        const error = errors[meta.type];
                        const isGenerating = status === "generating";
                        const isDone = status === "done";

                        return (
                            <motion.div
                                key={meta.type}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.08 }}
                                className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                                    isGenerating
                                        ? "glass-strong border-primary/20 shadow-lg shadow-primary/5"
                                        : isDone
                                        ? `glass-strong border-green-500/20 shadow-md ${meta.glowColor}`
                                        : status === "error"
                                        ? "glass border-red-500/20"
                                        : "glass border-border/30 opacity-70"
                                }`}
                            >
                                {/* Generating shimmer overlay */}
                                {isGenerating && (
                                    <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                                        <div className="w-full h-full shimmer" />
                                    </div>
                                )}

                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${meta.gradient} ${
                                    isDone ? "text-green-400" : isGenerating ? "text-primary" : status === "error" ? "text-red-400" : "text-muted-foreground"
                                }`}>
                                    {meta.icon}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm">{meta.label}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {error ? (
                                            <span className="text-red-400">{error}</span>
                                        ) : (
                                            meta.description
                                        )}
                                    </p>
                                </div>

                                {/* Status badge + action */}
                                <div className="flex items-center gap-2.5 shrink-0">
                                    <StatusBadge status={status} />
                                    {isDone && url && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-1.5 text-xs h-8"
                                            onClick={() => window.open(url, "_blank")}
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                            View
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* ── Done Actions ───────────────────────────── */}
            {allDone && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10"
                >
                    {successCount > 0 && Object.keys(assetUrls).length > 0 && (
                        <Button
                            variant="glow"
                            size="lg"
                            onClick={() => {
                                Object.values(assetUrls).forEach((url) => {
                                    if (url) window.open(url, "_blank");
                                });
                            }}
                            className="gap-2"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Open All Assets
                        </Button>
                    )}
                    <Button variant="outline" size="lg" onClick={onReset} className="gap-2">
                        <RotateCcw className="w-4 h-4" />
                        Create Another Event
                    </Button>
                </motion.div>
            )}
        </motion.div>
    );
}

export default EventAssetGroup;
