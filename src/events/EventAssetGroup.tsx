// ─── Event Assets Group Display ───────────────────────────────────────────────
// Shows all generated assets grouped under their parent event with progress

import { motion } from "framer-motion";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AssetType, CampusEvent, EventGenerationStatus } from "@/types/campusos";

interface EventAssetGroupProps {
    event: CampusEvent;
    assetStatus: EventGenerationStatus;
    assetUrls: Partial<Record<AssetType, string>>;
    errors: Partial<Record<AssetType, string>>;
    overallStatus: "idle" | "generating" | "done" | "error";
    onReset: () => void;
}

const assetMeta: {
    type: AssetType;
    label: string;
    icon: React.ReactNode;
}[] = [
    { type: "poster", label: "Event Poster", icon: <Image className="w-5 h-5" /> },
    { type: "landing", label: "Landing Page", icon: <Globe className="w-5 h-5" /> },
    { type: "presentation", label: "Presentation", icon: <Presentation className="w-5 h-5" /> },
];

function StatusIcon({ status }: { status: string }) {
    switch (status) {
        case "generating":
            return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
        case "done":
            return <CheckCircle2 className="w-5 h-5 text-green-400" />;
        case "error":
            return <XCircle className="w-5 h-5 text-red-400" />;
        case "skipped":
            return <SkipForward className="w-5 h-5 text-muted-foreground/50" />;
        default:
            return <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />;
    }
}

function statusLabel(status: string): string {
    switch (status) {
        case "generating":
            return "Generating…";
        case "done":
            return "Complete";
        case "error":
            return "Failed";
        case "skipped":
            return "Skipped";
        default:
            return "Queued";
    }
}

export function EventAssetGroup({
    event,
    assetStatus,
    assetUrls,
    errors,
    overallStatus,
    onReset,
}: EventAssetGroupProps) {
    const allDone = overallStatus === "done" || overallStatus === "error";
    const successCount = Object.values(assetStatus).filter((s) => s === "done").length;
    const totalSelected = Object.values(assetStatus).filter((s) => s !== "skipped").length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mx-auto"
        >
            {/* Event Header */}
            <div className="text-center mb-8">
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-strong border border-primary/20 text-sm text-primary mb-4"
                >
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Campus Event Mode
                </motion.div>
                <h2 className="text-2xl font-bold mb-1">{event.name}</h2>
                <p className="text-sm text-muted-foreground">
                    {event.venue} · {event.date}
                    {event.organizer && ` · ${event.organizer}`}
                </p>
            </div>

            {/* Overall Progress */}
            {overallStatus === "generating" && (
                <div className="mb-6">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>Generating assets…</span>
                        <span>
                            {successCount}/{totalSelected} complete
                        </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                            animate={{
                                width: `${totalSelected > 0 ? Math.round((successCount / totalSelected) * 100) : 0}%`,
                            }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>
            )}

            {/* Asset Cards */}
            <div className="space-y-3">
                {assetMeta.map((meta, index) => {
                    const status = assetStatus[meta.type];
                    if (status === "skipped") return null;

                    const url = assetUrls[meta.type];
                    const error = errors[meta.type];

                    return (
                        <motion.div
                            key={meta.type}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                                status === "generating"
                                    ? "glass-strong border-primary/20 glow-purple"
                                    : status === "done"
                                    ? "glass-strong border-green-500/20"
                                    : status === "error"
                                    ? "glass border-red-500/20"
                                    : "glass border-border/30"
                            }`}
                        >
                            {/* Icon */}
                            <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                    status === "done"
                                        ? "bg-green-500/10 text-green-400"
                                        : status === "generating"
                                        ? "bg-primary/10 text-primary"
                                        : status === "error"
                                        ? "bg-red-500/10 text-red-400"
                                        : "bg-muted/50 text-muted-foreground"
                                }`}
                            >
                                {meta.icon}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{meta.label}</p>
                                <p className="text-xs text-muted-foreground">
                                    {error ? error : statusLabel(status)}
                                </p>
                            </div>

                            {/* Status / Action */}
                            <div className="flex items-center gap-2">
                                <StatusIcon status={status} />
                                {status === "done" && url && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="gap-1.5 text-xs"
                                        onClick={() => window.open(url, "_blank")}
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        Open
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Done / Reset Actions */}
            {allDone && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex justify-center gap-3 mt-8"
                >
                    {successCount > 0 && Object.keys(assetUrls).length > 0 && (
                        <Button
                            variant="glow"
                            onClick={() => {
                                // Open all generated assets
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
                    <Button variant="outline" onClick={onReset} className="gap-2">
                        <RotateCcw className="w-4 h-4" />
                        Create Another
                    </Button>
                </motion.div>
            )}
        </motion.div>
    );
}

export default EventAssetGroup;
