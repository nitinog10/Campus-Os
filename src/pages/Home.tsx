import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
    ArrowRight, Sparkles, Zap, Layers, Palette, FileText,
    Globe, CalendarPlus, Image, Presentation, Github, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ParticleField } from "@/components/ParticleField";
import { useRef, useCallback } from "react";

const features = [
    {
        icon: Sparkles,
        title: "AI-Powered Creation",
        description: "Describe what you need in plain language — the AI handles layout, styling, images, and content.",
        gradient: "from-purple-500 to-pink-500",
        step: "01",
    },
    {
        icon: Layers,
        title: "Smart Templates",
        description: "Guided forms for different use cases auto-build the perfect AI prompt from simple fields.",
        gradient: "from-blue-500 to-cyan-500",
        step: "02",
    },
    {
        icon: Zap,
        title: "Instant Output",
        description: "Get polished, ready-to-use digital assets in seconds. Download, deploy, present.",
        gradient: "from-amber-500 to-orange-500",
        step: "03",
    },
];

const creationTypes = [
    {
        icon: Palette,
        label: "Event Posters",
        description: "Promotional content for fests, hackathons & workshops",
        gradient: "from-pink-500/15 to-orange-500/15",
        iconColor: "text-pink-400",
        borderColor: "hover:border-pink-500/30",
    },
    {
        icon: Globe,
        label: "Landing Pages",
        description: "Complete websites for clubs, projects & portfolios",
        gradient: "from-blue-500/15 to-cyan-500/15",
        iconColor: "text-blue-400",
        borderColor: "hover:border-blue-500/30",
    },
    {
        icon: FileText,
        label: "Presentations",
        description: "Slide decks for assignments, pitches & reports",
        gradient: "from-purple-500/15 to-indigo-500/15",
        iconColor: "text-purple-400",
        borderColor: "hover:border-purple-500/30",
    },
];

function useSpotlight() {
    const ref = useRef<HTMLDivElement>(null);
    const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        ref.current.style.setProperty("--x", `${e.clientX - rect.left}px`);
        ref.current.style.setProperty("--y", `${e.clientY - rect.top}px`);
    }, []);
    return { ref, onMouseMove };
}

function SpotlightCard({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const { ref, onMouseMove } = useSpotlight();
    return (
        <div
            ref={ref}
            onMouseMove={onMouseMove}
            className={`spotlight-card ${className}`}
        >
            {children}
        </div>
    );
}

export default function Home() {
    return (
        <div className="min-h-screen pt-16 noise">
            {/* ── Hero Section ────────────────────────────────────── */}
            <section className="relative overflow-hidden">
                {/* Particle Canvas */}
                <ParticleField className="opacity-60" />

                {/* Animated Orbs */}
                <div className="orb orb-purple w-[500px] h-[500px] top-[10%] left-[15%]" style={{ animationDelay: "0s" }} />
                <div className="orb orb-blue w-[400px] h-[400px] top-[30%] right-[10%]" style={{ animationDelay: "-7s" }} />
                <div className="orb orb-cyan w-[350px] h-[350px] bottom-[10%] left-[40%]" style={{ animationDelay: "-14s" }} />

                {/* Grid */}
                <div className="absolute inset-0 bg-grid opacity-40" />

                <div className="relative max-w-7xl mx-auto px-6 py-28 md:py-40">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-border/40 text-xs text-muted-foreground mb-8 shimmer"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                            Powered by OpenAI · GPT-4o
                        </motion.div>

                        {/* Hero Heading */}
                        <h1 className="font-display text-6xl md:text-8xl font-black tracking-tight leading-[1.05] mb-6">
                            Create Anything{" "}
                            <span className="gradient-text-animated text-glow">
                                with AI
                            </span>
                        </h1>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
                        >
                            Transform your ideas into polished posters, websites, and presentations.
                            Just describe what you need — AI does the rest.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <Link to="/create">
                                <Button variant="glow" size="lg" className="gap-2 text-base px-8 h-12 text-lg font-semibold">
                                    Start Creating
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            </Link>
                            <Link to="/create">
                                <Button variant="outline" size="lg" className="gap-2 text-base px-7 h-12 border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all">
                                    <CalendarPlus className="w-4 h-4" />
                                    Create Event
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Fade-out gradient at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
            </section>

            {/* ── How It Works ────────────────────────────────────── */}
            <section className="relative max-w-7xl mx-auto px-6 py-28">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70 mb-3">Simple Workflow</p>
                    <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                        How It Works
                    </h2>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                        Three simple steps from idea to polished output
                    </p>
                </motion.div>

                {/* Connector Line (desktop) */}
                <div className="hidden md:block absolute top-[52%] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

                <div className="grid md:grid-cols-3 gap-6">
                    {features.map((feature, i) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15, duration: 0.5 }}
                            >
                                <SpotlightCard>
                                    <Card className="glass border-border/50 h-full hover:border-primary/20 transition-all duration-300 group">
                                        <CardContent className="p-7 space-y-4 relative">
                                            {/* Step Number */}
                                            <span className="absolute top-5 right-5 text-5xl font-black font-display gradient-text opacity-[0.08] select-none">
                                                {feature.step}
                                            </span>

                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <h3 className="text-lg font-semibold">{feature.title}</h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </SpotlightCard>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* ── What Can You Create? ────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-6 pb-28">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70 mb-3">Asset Types</p>
                    <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                        What Can You Create?
                    </h2>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                        From promotional materials to complete websites
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                    {creationTypes.map((type, i) => {
                        const Icon = type.icon;
                        return (
                            <motion.div
                                key={type.label}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15, duration: 0.5 }}
                            >
                                <Link to="/create">
                                    <SpotlightCard>
                                        <Card className={`glass border-border/50 ${type.borderColor} hover:glow-purple transition-all duration-300 cursor-pointer group h-full`}>
                                            <CardContent className="p-7 flex flex-col gap-4">
                                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.gradient} flex items-center justify-center ${type.iconColor} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg mb-1.5 group-hover:text-primary transition-colors flex items-center gap-2">
                                                        {type.label}
                                                        <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-70 group-hover:translate-x-0 transition-all duration-300" />
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground leading-relaxed">{type.description}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </SpotlightCard>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* ── Event Mode Highlight ────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-6 pb-28">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <Link to="/create">
                        <div className="relative p-[1px] rounded-2xl border-shimmer overflow-hidden group cursor-pointer">
                            <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-8 md:p-12">
                                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                                    <div className="flex -space-x-3">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 flex items-center justify-center border border-pink-500/20 shadow-lg animate-float" style={{ animationDelay: "0s" }}>
                                            <Image className="w-6 h-6 text-pink-400" />
                                        </div>
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/20 shadow-lg animate-float" style={{ animationDelay: "0.5s" }}>
                                            <Globe className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center border border-purple-500/20 shadow-lg animate-float" style={{ animationDelay: "1s" }}>
                                            <Presentation className="w-6 h-6 text-purple-400" />
                                        </div>
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                                            <h3 className="text-xl md:text-2xl font-bold font-display">Campus Event Mode</h3>
                                            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                                                New
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground max-w-lg">
                                            Create one event and automatically generate a coordinated poster, landing page, and presentation — all matching your event's theme.
                                        </p>
                                    </div>
                                    <Button variant="glow" className="gap-2 shrink-0 group-hover:shadow-xl transition-all duration-300">
                                        Try It
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            </section>

            {/* ── Footer ─────────────────────────────────────────── */}
            <footer className="relative border-t border-border/30">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-display font-bold gradient-text">CampusOS</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <Link to="/create" className="hover:text-foreground transition-colors">Create</Link>
                            <Link to="/history" className="hover:text-foreground transition-colors">Library</Link>
                            <a href="https://github.com/nitinog10/Campus-Os" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                                <Github className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground/60">
                        <p>© 2026 CampusOS. Built with OpenAI.</p>
                        <p>By Nitin OG</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
