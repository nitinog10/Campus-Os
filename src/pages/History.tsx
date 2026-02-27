import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Trash2, Megaphone, Globe, FileText, Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getHistory, clearHistory } from "@/hooks/useCreationEngine";
import type { HistoryEntry, IntentType } from "@/types/campusos";

const typeConfig: Record<IntentType, { icon: React.ReactNode; label: string; color: string }> = {
    event_promotion: { icon: <Megaphone className="w-4 h-4" />, label: "Event", color: "text-pink-400" },
    website: { icon: <Globe className="w-4 h-4" />, label: "Website", color: "text-blue-400" },
    presentation: { icon: <FileText className="w-4 h-4" />, label: "Presentation", color: "text-amber-400" },
};

export default function History() {
    const [entries, setEntries] = useState<HistoryEntry[]>([]);

    useEffect(() => {
        setEntries(getHistory());
    }, []);

    const handleClear = () => {
        clearHistory();
        setEntries([]);
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
                        <h1 className="text-3xl font-bold">History</h1>
                        <p className="text-muted-foreground mt-1">Your past creations</p>
                    </div>
                    {entries.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground hover:text-destructive gap-2">
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
                        <p className="text-sm text-muted-foreground">
                            Your creations will appear here after you generate something
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {entries.map((entry, i) => {
                                const config = typeConfig[entry.intentType] || typeConfig.event_promotion;
                                return (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <Card className="glass border-border/50 hover:border-primary/20 transition-colors">
                                            <CardContent className="p-4 flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${config.color} shrink-0`}>
                                                    {config.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-medium text-sm truncate">{entry.title}</p>
                                                        <Badge variant="secondary" className="text-[10px] shrink-0">
                                                            {config.label}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground truncate">{entry.prompt}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(entry.createdAt).toLocaleDateString()}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {entry.assetCount} asset{entry.assetCount !== 1 ? "s" : ""}
                                                    </p>
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
