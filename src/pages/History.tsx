import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Clock, Trash2, Globe, Inbox,
    ExternalLink, Download, Image, Presentation,
    Sparkles, Search
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAllAssets, clearAllAssets, getAssetById } from "@/services/assetRegistry";
import type { AssetRegistryEntry, AssetType } from "@/types/campusos";
import { toast } from "sonner";

const typeConfig: Record<AssetType, { icon: React.ReactNode; label: string; color: string; gradient: string; accentBorder: string }> = {
    poster: {
        icon: <Image className="w-4 h-4" />,
        label: "Poster",
        color: "text-pink-400",
        gradient: "from-pink-500 to-rose-500",
        accentBorder: "border-l-pink-500/50",
    },
    landing: {
        icon: <Globe className="w-4 h-4" />,
        label: "Landing Page",
        color: "text-blue-400",
        gradient: "from-blue-500 to-cyan-500",
        accentBorder: "border-l-blue-500/50",
    },
    presentation: {
        icon: <Presentation className="w-4 h-4" />,
        label: "Presentation",
        color: "text-amber-400",
        gradient: "from-amber-500 to-orange-500",
        accentBorder: "border-l-amber-500/50",
    },
};

function timeAgo(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = now - then;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

function SpotlightCard({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        ref.current.style.setProperty("--x", `${e.clientX - rect.left}px`);
        ref.current.style.setProperty("--y", `${e.clientY - rect.top}px`);
    }, []);
    return (
        <div ref={ref} onMouseMove={onMouseMove} className={`spotlight-card ${className}`}>
            {children}
        </div>
    );
}

type FilterType = "all" | AssetType;

export default function History() {
    const [entries, setEntries] = useState<AssetRegistryEntry[]>([]);
    const [filter, setFilter] = useState<FilterType>("all");

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

    const filteredEntries = filter === "all" ? entries : entries.filter((e) => e.type === filter);

    const filterOptions: { value: FilterType; label: string }[] = [
        { value: "all", label: "All" },
        { value: "poster", label: "Posters" },
        { value: "landing", label: "Pages" },
        { value: "presentation", label: "Decks" },
    ];

    return (
        <div className="min-h-screen pt-16 noise">
            <div className="fixed inset-0 gradient-mesh pointer-events-none" />

            <div className="relative max-w-4xl mx-auto px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div>
                        <h1 className="text-3xl font-bold font-display">Library</h1>
                        <p className="text-muted-foreground mt-1">
                            Your generated assets — {filteredEntries.length} item{filteredEntries.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                    {entries.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClear}
                            className="text-muted-foreground hover:text-destructive gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear All
                        </Button>
                    )}
                </motion.div>

                {/* Filter bar */}
                {entries.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="flex items-center gap-2 mb-6"
                    >
                        <Search className="w-3.5 h-3.5 text-muted-foreground" />
                        <div className="flex gap-1">
                            {filterOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setFilter(opt.value)}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${filter === opt.value
                                            ? "bg-primary/10 text-primary border border-primary/20"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {filteredEntries.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-28 text-center"
                    >
                        <div className="relative mb-6">
                            <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center animate-float">
                                <Inbox className="w-9 h-9 text-muted-foreground/40" />
                            </div>
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 opacity-[0.06] blur-xl animate-pulse-glow" />
                        </div>
                        <h3 className="text-lg font-semibold font-display mb-2">
                            {filter === "all" ? "No creations yet" : `No ${filter}s yet`}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-8 max-w-sm">
                            Your generated posters, websites, and presentations will appear here
                        </p>
                        <a href="/create">
                            <Button variant="glow" className="gap-2">
                                <Sparkles className="w-4 h-4" />
                                Start Creating
                            </Button>
                        </a>
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {filteredEntries.map((entry, i) => {
                                const config = typeConfig[entry.type] || typeConfig.poster;
                                return (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ delay: i * 0.04 }}
                                    >
                                        <SpotlightCard>
                                            <Card className={`glass border-border/50 hover:border-primary/20 transition-all duration-200 group border-l-2 ${config.accentBorder}`}>
                                                <CardContent className="p-4 flex items-center gap-4">
                                                    {/* Type Icon */}
                                                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-105 group-hover:shadow-xl transition-all duration-300`}>
                                                        {config.icon}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className="font-medium text-sm truncate">{entry.title}</p>
                                                            <Badge variant="secondary" className="text-[10px] shrink-0">
                                                                {config.label}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground truncate">{entry.prompt}</p>
                                                    </div>

                                                    {/* Date */}
                                                    <div className="text-right shrink-0 mr-2">
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Clock className="w-3 h-3" />
                                                            {timeAgo(entry.createdAt)}
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <Button
                                                            variant="glow"
                                                            size="sm"
                                                            className="gap-1.5 h-8 text-xs"
                                                            onClick={() => handleOpen(entry)}
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                            Open
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="gap-1.5 h-8 text-xs border-border/50"
                                                            onClick={() => handleDownload(entry)}
                                                        >
                                                            <Download className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </SpotlightCard>
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
