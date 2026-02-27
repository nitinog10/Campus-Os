import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { IntentSummary } from "@/components/IntentSummary";
import { PipelineView } from "@/components/PipelineView";
import { AssetCard } from "@/components/AssetCard";
import type { CreationSession } from "@/types/campusos";

interface CreationCanvasProps {
    session: CreationSession;
}

export function CreationCanvas({ session }: CreationCanvasProps) {
    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <AnimatePresence mode="wait">
                {/* Loading State */}
                {session.status === "interpreting" && (
                    <motion.div
                        key="interpreting"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center gap-4 py-12"
                    >
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl opacity-20 blur-xl animate-pulse-glow" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium">Interpreting your request…</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                AI is analyzing your description
                            </p>
                        </div>
                    </motion.div>
                )}

                {session.status === "planning" && (
                    <motion.div
                        key="planning"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center gap-4 py-12"
                    >
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl opacity-20 blur-xl animate-pulse-glow" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium">Planning execution pipeline…</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Creating the optimal workflow for your content
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Intent Summary */}
            {session.intent && session.status !== "interpreting" && (
                <IntentSummary intent={session.intent} />
            )}

            {/* Pipeline */}
            {session.pipeline && session.status !== "planning" && (
                <PipelineView pipeline={session.pipeline} />
            )}

            {/* Generating Status */}
            {session.status === "generating" && session.assets.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 p-4 rounded-xl glass"
                >
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Generating assets…</p>
                </motion.div>
            )}

            {/* Generated Assets */}
            {session.assets.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Generated Assets
                    </h3>
                    {session.assets.map((asset, i) => (
                        <AssetCard key={asset.stepId} asset={asset} index={i} />
                    ))}
                </div>
            )}

            {/* Error */}
            {session.status === "error" && session.error && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400"
                >
                    {session.error}
                </motion.div>
            )}
        </div>
    );
}
