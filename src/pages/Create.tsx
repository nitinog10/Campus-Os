import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IntentInput } from "@/components/IntentInput";
import { CreationCanvas } from "@/components/CreationCanvas";
import { useCreationEngine } from "@/hooks/useCreationEngine";

export default function Create() {
    const { session, runCreation, reset } = useCreationEngine();
    const isActive = session.status !== "idle";

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
                        {isActive ? (
                            <span className="gradient-text">Creating…</span>
                        ) : (
                            <>
                                What do you want to{" "}
                                <span className="gradient-text">create</span>?
                            </>
                        )}
                    </h1>
                    {!isActive && (
                        <p className="text-muted-foreground max-w-lg mx-auto">
                            Describe your idea and let AI build it for you
                        </p>
                    )}
                    {session.status === "done" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4"
                        >
                            <Button
                                variant="outline"
                                onClick={reset}
                                className="gap-2"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Create Something New
                            </Button>
                        </motion.div>
                    )}
                </motion.div>

                {/* Input */}
                {!isActive && (
                    <IntentInput
                        onSubmit={runCreation}
                        isLoading={session.status === "interpreting"}
                    />
                )}

                {/* Canvas */}
                {isActive && (
                    <CreationCanvas session={session} />
                )}
            </div>
        </div>
    );
}
