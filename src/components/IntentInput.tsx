import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface IntentInputProps {
    onSubmit: (prompt: string) => void;
    isLoading: boolean;
}

const examplePrompts = [
    "Create a poster for our college tech fest 'TechNova 2026' with a futuristic theme",
    "Build a landing page for our coding club showcasing upcoming workshops",
    "Make a pitch deck for our startup idea — an AI-powered study planner",
    "Design social media posts for our college cultural festival",
];

export function IntentInput({ onSubmit, isLoading }: IntentInputProps) {
    const [prompt, setPrompt] = useState("");
    const [showExamples, setShowExamples] = useState(true);

    const handleSubmit = () => {
        if (!prompt.trim() || isLoading) return;
        setShowExamples(false);
        onSubmit(prompt.trim());
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            handleSubmit();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-3xl mx-auto"
        >
            {/* Input Area */}
            <div className="relative gradient-border rounded-2xl">
                <div className="relative bg-background rounded-2xl p-1">
                    <div className="relative">
                        <Textarea
                            id="intent-input"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe what you want to create…"
                            className="min-h-[140px] resize-none border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0 pr-14"
                            disabled={isLoading}
                        />
                        <div className="absolute bottom-3 right-3">
                            <Button
                                id="submit-intent"
                                onClick={handleSubmit}
                                disabled={!prompt.trim() || isLoading}
                                variant="glow"
                                size="icon"
                                className="rounded-xl h-10 w-10"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                    <div className="px-4 pb-3 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                            <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-mono">Ctrl</kbd>
                            {" + "}
                            <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-mono">Enter</kbd>
                            {" to submit"}
                        </p>
                        <Sparkles className="w-4 h-4 text-primary/40 animate-pulse-glow" />
                    </div>
                </div>
            </div>

            {/* Example Prompts */}
            <AnimatePresence>
                {showExamples && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                        className="mt-6 space-y-2"
                    >
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider px-1">
                            Try an example
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {examplePrompts.map((example, i) => (
                                <motion.button
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + i * 0.1 }}
                                    onClick={() => {
                                        setPrompt(example);
                                        setShowExamples(false);
                                    }}
                                    className="text-left text-sm text-muted-foreground hover:text-foreground p-3 rounded-xl glass hover:glass-strong transition-all duration-200 cursor-pointer group"
                                >
                                    <span className="text-primary/60 group-hover:text-primary mr-2">→</span>
                                    {example}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
