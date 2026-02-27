import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Clock, Trash2, Megaphone, Globe, FileText, Inbox,
    ExternalLink, Download, Image, Presentation
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAllAssets, clearAllAssets, getAssetById } from "@/services/assetRegistry";
import type { AssetRegistryEntry, AssetType } from "@/types/campusos";
import { toast } from "sonner";

const typeConfig: Record<AssetType, { icon: React.ReactNode; label: string; color: string; gradient: string }> = {
    poster: {
        icon: <Image className="w-4 h-4" />,
        label: "Poster",
        color: "text-pink-400",
        gradient: "from-pink-500 to-rose-500",
    },
    landing: {
        icon: <Globe className="w-4 h-4" />,
        label: "Landing Page",
        color: "text-blue-400",
        gradient: "from-blue-500 to-cyan-500",
    },
    presentation: {
        icon: <Presentation className="w-4 h-4" />,
        label: "Presentation",
        color: "text-amber-400",
        gradient: "from-amber-500 to-orange-500",
    },
};

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
        <div className="min-h-screen pt-16">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div>
                        <h1 className="text-3xl font-bold">Library</h1>
                        <p className="text-muted-foreground mt-1">
                            Your generated assets — {entries.length} item{entries.length !== 1 ? "s" : ""}
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

                {entries.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-24 text-center"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                            <Inbox className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No creations yet</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Your generated posters, websites, and presentations will appear here
                        </p>
                        <a href="/create">
                            <Button variant="glow">Start Creating</Button>
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
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <Card className="glass border-border/50 hover:border-primary/20 transition-all duration-200 group">
                                            <CardContent className="p-4 flex items-center gap-4">
                                                {/* Type Icon */}
                                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white shrink-0 shadow-lg`}>
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
                                                        {new Date(entry.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                                        className="gap-1.5 h-8 text-xs"
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
