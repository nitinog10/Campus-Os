import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Zap, Layers, Palette, FileText, Globe, CalendarPlus, Image, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
    {
        icon: Sparkles,
        title: "AI-Powered Creation",
        description: "Describe what you need in plain language — the AI handles the rest.",
        gradient: "from-purple-500 to-pink-500",
    },
    {
        icon: Layers,
        title: "Smart Templates",
        description: "Guided forms for different use cases auto-build the perfect AI prompt.",
        gradient: "from-blue-500 to-cyan-500",
    },
    {
        icon: Zap,
        title: "Instant Output",
        description: "Get polished, ready-to-use digital assets in seconds, not hours.",
        gradient: "from-amber-500 to-orange-500",
    },
];

const creationTypes = [
    {
        icon: Palette,
        label: "Event Posters",
        description: "Promotional content for fests, hackathons & workshops",
        gradient: "from-pink-500/15 to-orange-500/15",
        iconColor: "text-pink-400",
    },
    {
        icon: Globe,
        label: "Landing Pages",
        description: "Complete websites for clubs, projects & portfolios",
        gradient: "from-blue-500/15 to-cyan-500/15",
        iconColor: "text-blue-400",
    },
    {
        icon: FileText,
        label: "Presentations",
        description: "Slide decks for assignments, pitches & reports",
        gradient: "from-purple-500/15 to-indigo-500/15",
        iconColor: "text-purple-400",
    },
];

export default function Home() {
    return (
        <div className="min-h-screen pt-16">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-grid opacity-50" />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

                <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-36">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs text-muted-foreground mb-8"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                            Powered by OpenAI
                        </motion.div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                            Create Anything{" "}
                            <span className="gradient-text">with AI</span>
                        </h1>

                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                            Transform your ideas into polished posters, websites, and presentations.
                            Just describe what you need — AI does the rest.
                        </p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex flex-col sm:flex-row gap-3 justify-center"
                        >
                            <Link to="/create">
                                <Button variant="glow" size="lg" className="gap-2 text-base px-8">
                                    Start Creating
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                            <Link to="/create" onClick={() => {/* will open event modal in create page */}}>
                                <Button variant="outline" size="lg" className="gap-2 text-base px-6">
                                    <CalendarPlus className="w-4 h-4" />
                                    Create Event
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features */}
            <section className="max-w-7xl mx-auto px-6 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        How It Works
                    </h2>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                        Three simple steps from idea to polished output
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
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
                                <Card className="glass border-border/50 h-full hover:border-primary/20 transition-colors duration-300 group">
                                    <CardContent className="p-6 space-y-4">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-lg font-semibold">{feature.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* Creation Types */}
            <section className="max-w-7xl mx-auto px-6 pb-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
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
                                transition={{ delay: i * 0.15 }}
                            >
                                <Link to="/create">
                                    <Card className="glass border-border/50 hover:border-primary/30 hover:glow-purple transition-all duration-300 cursor-pointer group">
                                        <CardContent className="p-6 flex items-start gap-4">
                                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${type.gradient} flex items-center justify-center ${type.iconColor} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{type.label}</h3>
                                                <p className="text-sm text-muted-foreground">{type.description}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* Event Mode Highlight */}
            <section className="max-w-7xl mx-auto px-6 pb-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <Link to="/create">
                        <div className="relative p-8 md:p-12 rounded-2xl gradient-border overflow-hidden group cursor-pointer">
                            <div className="relative bg-background rounded-2xl flex flex-col md:flex-row items-center gap-6 md:gap-10">
                                <div className="flex -space-x-3">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 flex items-center justify-center border border-pink-500/20 shadow-lg">
                                        <Image className="w-6 h-6 text-pink-400" />
                                    </div>
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/20 shadow-lg">
                                        <Globe className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center border border-purple-500/20 shadow-lg">
                                        <Presentation className="w-6 h-6 text-purple-400" />
                                    </div>
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                                        <h3 className="text-xl md:text-2xl font-bold">Campus Event Mode</h3>
                                        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                                            New
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground max-w-lg">
                                        Create one event and automatically generate a coordinated poster, landing page, and presentation — all matching your event's theme.
                                    </p>
                                </div>
                                <Button variant="glow" className="gap-2 shrink-0 group-hover:shadow-xl transition-shadow">
                                    Try It
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </Button>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border/50 py-8">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-muted-foreground">
                    <p>© 2026 CampusOS. Built with OpenAI.</p>
                    <p>By Nitin OG</p>
                </div>
            </footer>
        </div>
    );
}
