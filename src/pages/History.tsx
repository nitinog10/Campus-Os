import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Clock, Trash2, Globe, Inbox,
    ExternalLink, Download, Image, Presentation, Sparkles, ArrowRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAllAssets, clearAllAssets, getAssetById } from "@/services/assetRegistry";
import type { AssetRegistryEntry, AssetType } from "@/types/campusos";
import { toast } from "sonner";

const typeConfig: Record<AssetType, { icon: React.ReactNode; label: string; color: string; gradient: string; accentBar: string }> = {
    poster: {
        icon: <Image className="w-4 h-4" />,
        label: "Poster",
        color: "text-pink-400",
        gradient: "from-pink-500 to-rose-500",
        accentBar: "accent-bar-pink",
    },
    landing: {
        icon: <Globe className="w-4 h-4" />,
        label: "Landing Page",
        color: "text-blue-400",
        gradient: "from-blue-500 to-cyan-500",
        accentBar: "accent-bar-blue",
    },
    presentation: {
        icon: <Presentation className="w-4 h-4" />,
        label: "Presentation",
        color: "text-amber-400",
        gradient: "from-amber-500 to-orange-500",
        accentBar: "accent-bar-amber",
    },
};

function relativeTime(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = now - then;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

export default function History() {
    const [entries, setEntries] = useState<AssetRegistryEntry[]>([]);

    useEffect(() => {
        setEntries(getAllAssets());
    }, []);

    const handleClear = () => {
        clearAllAssets();
        setEntries([]);
        toast.success("All assets cleared");
    };

    const handleOpen = (entry: AssetRegistryEntry) => {
        window.open(entry.viewUrl, "_blank");
    };

    const handleDownload = (entry: AssetRegistryEntry) => {
        const asset = getAssetById(entry.id);
        if (!asset) {
            toast.error("Asset data not found");
            return;
        }

        let content: string;
        let ext: string;

        if (typeof asset.content === "string") {
            content = asset.content;
            ext = "html";
        } else {
            content = JSON.stringify(asset.content, null, 2);
            ext = "json";
        }

        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${entry.title.replace(/\s+/g, "_")}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Download started!");
    };

    return (
        <div className="min-h-screen pt-16 noise-overlay">
            {/* Background ambient */}
            <div className="fixed inset-0 bg-grid opacity-15 pointer-events-none" />
            <div className="aurora-orb aurora-orb-2 opacity-[0.05]" style={{ position: "fixed" }} />

            <div className="relative max-w-4xl mx-auto px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-10"
                >
                    <div>
                        <h1 className="text-4xl font-bold">
                            <span className="gradient-text">Library</span>
                        </h1>
                        <p className="text-muted-foreground/70 mt-2 text-sm">
                            Your generated assets — {entries.length} item{entries.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                    {entries.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClear}
                            className="text-muted-foreground hover:text-destructive gap-2 transition-colors duration-300"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear All
                        </Button>
                    )}
                </motion.div>

                {entries.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-28 text-center"
                    >
                        {/* Orbital art empty state */}
                        <div className="relative w-28 h-28 mb-8">
                            <div className="absolute inset-0 rounded-full border border-border/30" />
                            <div className="absolute inset-[20%] rounded-full border border-border/20 orbit-ring" style={{ animationDuration: "8s" }} />
                            <div className="absolute inset-[40%] rounded-full border border-primary/15 orbit-ring-reverse" style={{ animationDuration: "6s" }} />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Inbox className="w-8 h-8 text-muted-foreground/50" />
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No creations yet</h3>
                        <p className="text-sm text-muted-foreground mb-8 max-w-sm">
                            Your generated posters, websites, and presentations will appear here
                        </p>
                        <a href="/create">
                            <Button variant="glow" className="gap-2 h-11 px-6 rounded-xl">
                                <Sparkles className="w-4 h-4" />
                                Start Creating
                            </Button>
                        </a>
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {entries.map((entry, i) => {
                                const config = typeConfig[entry.type] || typeConfig.poster;
                                return (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ delay: i * 0.04 }}
                                    >
                                        <Card className={`glass-card border-border/30 hover:border-primary/15 transition-all duration-500 group cursor-pointer accent-bar ${config.accentBar}`}>
                                            <CardContent className="p-4 pl-6 flex items-center gap-4" onClick={() => handleOpen(entry)}>
                                                {/* Type Icon */}
                                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                                                    {config.icon}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors duration-300">{entry.title}</p>
                                                        <Badge variant="secondary" className="text-[10px] shrink-0 border border-border/50">
                                                            {config.label}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground/70 truncate">{entry.prompt}</p>
                                                </div>

                                                {/* Date */}
                                                <div className="text-right shrink-0 mr-2">
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
                                                        <Clock className="w-3 h-3" />
                                                        {relativeTime(entry.createdAt)}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0" onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        variant="glow"
                                                        size="sm"
                                                        className="gap-1.5 h-8 text-xs rounded-lg"
                                                        onClick={() => handleOpen(entry)}
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                        Open
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-1.5 h-8 text-xs rounded-lg border-border/50"
                                                        onClick={() => handleDownload(entry)}
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
