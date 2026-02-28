import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Zap, Layers, Palette, FileText, Globe, CalendarPlus, Image, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
    {
        icon: Sparkles,
        step: "01",
        title: "Describe It",
        description: "Tell us what you need in plain language — no design skills required.",
        gradient: "from-purple-500 to-pink-500",
    },
    {
        icon: Layers,
        step: "02",
        title: "AI Designs It",
        description: "Our engine interprets your intent, picks the layout, and builds production-ready output.",
        gradient: "from-blue-500 to-cyan-500",
    },
    {
        icon: Zap,
        step: "03",
        title: "Ship It",
        description: "Download or share your polished poster, website, or deck in seconds.",
        gradient: "from-amber-500 to-orange-500",
    },
];

const creationTypes = [
    {
        icon: Palette,
        label: "Event Posters",
        description: "Promotional content for fests, hackathons & workshops",
        gradient: "from-pink-500/15 to-orange-500/15",
        borderGlow: "group-hover:shadow-pink-500/10",
        iconColor: "text-pink-400",
        accentColor: "bg-pink-500",
    },
    {
        icon: Globe,
        label: "Landing Pages",
        description: "Complete websites for clubs, projects & portfolios",
        gradient: "from-blue-500/15 to-cyan-500/15",
        borderGlow: "group-hover:shadow-blue-500/10",
        iconColor: "text-blue-400",
        accentColor: "bg-blue-500",
    },
    {
        icon: FileText,
        label: "Presentations",
        description: "Slide decks for assignments, pitches & reports",
        gradient: "from-purple-500/15 to-indigo-500/15",
        borderGlow: "group-hover:shadow-purple-500/10",
        iconColor: "text-purple-400",
        accentColor: "bg-purple-500",
    },
];

export default function Home() {
    return (
        <div className="min-h-screen pt-16 noise-overlay">
            {/* ═══ HERO ═══════════════════════════════════════════════ */}
            <section className="relative overflow-hidden">
                {/* Aurora ambient orbs */}
                <div className="aurora-orb aurora-orb-1" />
                <div className="aurora-orb aurora-orb-2" />
                <div className="aurora-orb aurora-orb-3" />

                {/* Grid background */}
                <div className="absolute inset-0 bg-grid opacity-40" />

                {/* Scanning line */}
                <div className="scan-line" />

                {/* Orbital decoration rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
                    <div className="orbit-ring w-full h-full" />
                    <div className="orbit-ring-reverse absolute inset-[15%]" />
                    <div className="orbit-ring absolute inset-[35%]" style={{ animationDuration: "30s" }} />
                </div>

                {/* Radial spotlight behind heading */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-[600px] h-[400px] bg-purple-500/8 rounded-full blur-[100px] animate-pulse-glow pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-6 py-28 md:py-40">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        {/* Badge pill with shimmer border */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass shimmer-border text-xs text-muted-foreground mb-10"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                            Powered by OpenAI
                        </motion.div>

                        {/* Main heading — big, bold, dramatic */}
                        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight leading-[1.05] mb-8">
                            Create Anything{" "}
                            <br className="hidden md:block" />
                            <span className="gradient-text">with AI</span>
                        </h1>

                        <p className="text-lg md:text-xl text-muted-foreground/80 max-w-2xl mx-auto mb-12 leading-relaxed">
                            Transform your ideas into polished posters, websites, and presentations.
                            Just describe what you need — AI does the rest.
                        </p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <Link to="/create">
                                <Button variant="glow" size="lg" className="gap-2 text-base px-10 h-14 rounded-2xl">
                                    Start Creating
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                            <Link to="/create" onClick={() => { }}>
                                <Button variant="outline" size="lg" className="gap-2 text-base px-8 h-14 rounded-2xl border-border/50 hover:border-primary/30 hover:bg-primary/5">
                                    <CalendarPlus className="w-4 h-4" />
                                    Create Event
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ═══ HOW IT WORKS ════════════════════════════════════════ */}
            <section className="relative max-w-7xl mx-auto px-6 py-28">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/60 mb-4">Simple Workflow</p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-5">
                        How It Works
                    </h2>
                    <p className="text-muted-foreground max-w-lg mx-auto text-lg">
                        Three steps from idea to polished output
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                    {features.map((feature, i) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                            >
                                <Card className="glass-card hover:border-primary/20 transition-all duration-500 group hover-tilt relative overflow-hidden h-full">
                                    {/* Step watermark */}
                                    <span className="step-number">{feature.step}</span>
                                    <CardContent className="relative p-7 space-y-5">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-500`}>
                                            <Icon className="w-7 h-7 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold">{feature.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Desktop connector line */}
                <div className="hidden md:block absolute top-[58%] left-[20%] right-[20%] h-px">
                    <div className="gradient-line w-full" />
                </div>
            </section>

            {/* ═══ WHAT CAN YOU CREATE ═════════════════════════════════ */}
            <section className="max-w-7xl mx-auto px-6 pb-28">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/60 mb-4">Capabilities</p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-5">
                        What Can You Create?
                    </h2>
                    <p className="text-muted-foreground max-w-lg mx-auto text-lg">
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
                                transition={{ delay: i * 0.15 }}
                            >
                                <Link to="/create">
                                    <Card className={`glass-card border-border/30 hover:border-primary/20 transition-all duration-500 cursor-pointer group relative overflow-hidden h-full ${type.borderGlow} hover:shadow-lg`}>
                                        {/* Left accent bar */}
                                        <div className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full ${type.accentColor} opacity-30 group-hover:opacity-60 transition-opacity duration-500`} />

                                        <CardContent className="p-7 pl-8 flex flex-col gap-4">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.gradient} flex items-center justify-center ${type.iconColor} shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg mb-1.5 group-hover:text-primary transition-colors duration-300">{type.label}</h3>
                                                <p className="text-sm text-muted-foreground leading-relaxed">{type.description}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-primary/50 group-hover:text-primary/80 transition-colors duration-300 mt-auto">
                                                <span>Create now</span>
                                                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* ═══ EVENT MODE CTA ══════════════════════════════════════ */}
            <section className="max-w-7xl mx-auto px-6 pb-28">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <Link to="/create">
                        <div className="relative p-[1.5px] rounded-2xl overflow-hidden group cursor-pointer animated-border">
                            <div className="relative bg-background/95 rounded-[calc(1rem-1.5px)] p-8 md:p-12">
                                {/* Gradient mesh */}
                                <div className="absolute inset-0 rounded-[calc(1rem-1.5px)] overflow-hidden">
                                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-500/5 via-transparent to-transparent" />
                                    <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-blue-500/5 via-transparent to-transparent" />
                                </div>

                                <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12">
                                    {/* Floating icon trio */}
                                    <div className="flex -space-x-3">
                                        <motion.div
                                            animate={{ y: [0, -6, 0] }}
                                            transition={{ duration: 3, repeat: Infinity, delay: 0 }}
                                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 flex items-center justify-center border border-pink-500/20 shadow-lg shadow-pink-500/5"
                                        >
                                            <Image className="w-7 h-7 text-pink-400" />
                                        </motion.div>
                                        <motion.div
                                            animate={{ y: [0, -6, 0] }}
                                            transition={{ duration: 3, repeat: Infinity, delay: 0.3 }}
                                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/5"
                                        >
                                            <Globe className="w-7 h-7 text-blue-400" />
                                        </motion.div>
                                        <motion.div
                                            animate={{ y: [0, -6, 0] }}
                                            transition={{ duration: 3, repeat: Infinity, delay: 0.6 }}
                                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center border border-purple-500/20 shadow-lg shadow-purple-500/5"
                                        >
                                            <Presentation className="w-7 h-7 text-purple-400" />
                                        </motion.div>
                                    </div>

                                    <div className="flex-1 text-center md:text-left">
                                        <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
                                            <h3 className="text-2xl md:text-3xl font-bold">Campus Event Mode</h3>
                                            <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                                                New
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground max-w-xl text-base leading-relaxed">
                                            Create one event and automatically generate a coordinated poster, landing page, and presentation — all matching your event's theme.
                                        </p>
                                    </div>

                                    <Button variant="glow" className="gap-2 shrink-0 h-12 px-8 rounded-xl group-hover:shadow-xl transition-all duration-500">
                                        Try It
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            </section>

            {/* ═══ FOOTER ═════════════════════════════════════════════ */}
            <footer className="relative border-t border-border/30">
                {/* Top glow line */}
                <div className="absolute top-0 left-0 right-0 gradient-line" />

                <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <p>© 2026 CampusOS</p>
                        <span className="text-border">•</span>
                        <span className="px-2 py-0.5 rounded-md glass text-[10px] font-medium uppercase tracking-wider">
                            Built with OpenAI
                        </span>
                    </div>
                    <p className="text-muted-foreground/60">
                        Designed by <span className="text-foreground/80 font-medium">Nitin OG</span>
                    </p>
                </div>
            </footer>
        </div>
    );
}
