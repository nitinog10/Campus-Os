import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface IntentInputProps {
    onSubmit: (prompt: string) => void;
    isLoading: boolean;
}

const examplePrompts = [
    {
        label: "Tech Fest Poster",
        prompt: "Create a poster for our college tech fest 'TechNova 2026' with a futuristic neon theme",
    },
    {
        label: "Club Landing Page",
        prompt: "Build a landing page for our coding club showcasing upcoming workshops and team members",
    },
    {
        label: "Startup Pitch Deck",
        prompt: "Make a pitch deck for our startup idea — an AI-powered study planner for college students",
    },
    {
        label: "Cultural Fest Poster",
        prompt: "Design a colorful poster for our annual cultural festival 'Vivacity' happening in March",
    },
];

export function IntentInput({ onSubmit, isLoading }: IntentInputProps) {
    const [prompt, setPrompt] = useState("");
    const [showExamples, setShowExamples] = useState(true);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const charCount = prompt.length;

    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

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

    const handleExampleClick = (text: string) => {
        setPrompt(text);
        setShowExamples(false);
        // Focus the textarea so user can edit before submitting
        setTimeout(() => textareaRef.current?.focus(), 50);
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
                            ref={textareaRef}
                            id="intent-input"
                            value={prompt}
                            onChange={(e) => {
                                setPrompt(e.target.value);
                                if (showExamples && e.target.value.length > 0) setShowExamples(false);
                                if (e.target.value.length === 0) setShowExamples(true);
                            }}
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
                        <div className="flex items-center gap-3">
                            {charCount > 0 && (
                                <span className={`text-[10px] transition-colors ${charCount > 500 ? "text-amber-400" : "text-muted-foreground/50"}`}>
                                    {charCount}
                                </span>
                            )}
                            <Sparkles className="w-4 h-4 text-primary/40 animate-pulse-glow" />
                        </div>
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
                        className="mt-6 space-y-3"
                    >
                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 px-1">
                            <Lightbulb className="w-3 h-3 text-primary/60" />
                            Try an example to get started
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {examplePrompts.map((example, i) => (
                                <motion.button
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + i * 0.08 }}
                                    onClick={() => handleExampleClick(example.prompt)}
                                    className="text-left p-3 rounded-xl glass hover:glass-strong hover:border-primary/20 transition-all duration-200 cursor-pointer group"
                                >
                                    <p className="text-xs font-semibold text-primary/70 group-hover:text-primary mb-1 flex items-center gap-1.5">
                                        <ArrowRight className="w-3 h-3 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                                        {example.label}
                                    </p>
                                    <p className="text-xs text-muted-foreground/80 group-hover:text-muted-foreground line-clamp-2 leading-relaxed">
                                        {example.prompt}
                                    </p>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
