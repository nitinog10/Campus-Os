import { Link, useLocation } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Cpu, Plus, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
    const location = useLocation();
    const { scrollY } = useScroll();

    // Scroll-aware transforms
    const headerBg = useTransform(
        scrollY,
        [0, 50],
        ["rgba(5, 10, 24, 0.5)", "rgba(5, 10, 24, 0.85)"]
    );
    const headerBlur = useTransform(scrollY, [0, 50], [16, 32]);
    const bottomGlow = useTransform(
        scrollY,
        [0, 50],
        ["rgba(168, 85, 247, 0)", "rgba(168, 85, 247, 0.08)"]
    );

    const navItems = [
        { path: "/", label: "Home", icon: Sparkles },
        { path: "/create", label: "Create", icon: Plus },
        { path: "/history", label: "Library", icon: Clock },
    ];

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
                backgroundColor: headerBg,
                backdropFilter: useTransform(headerBlur, (v) => `blur(${v}px)`),
                borderBottomColor: bottomGlow,
            }}
            className="fixed top-0 left-0 right-0 z-50 border-b border-border/30"
        >
            {/* Bottom glow line */}
            <motion.div
                style={{ backgroundColor: bottomGlow }}
                className="absolute bottom-0 left-0 right-0 h-px"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="relative">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300 group-hover:scale-105">
                            <Cpu className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300" />
                    </div>
                    <span className="text-lg font-bold font-display gradient-text hidden sm:inline">CampusOS</span>
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-1">
                    {navItems.map((item, i) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link key={item.path} to={item.path}>
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    size="sm"
                                    className={`relative gap-1.5 px-3 sm:px-4 ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden sm:inline text-sm">{item.label}</span>
                                    {isActive && (
                                        <>
                                            <motion.div
                                                layoutId="activeNav"
                                                className="absolute inset-0 bg-primary/10 rounded-md"
                                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                            />
                                            {/* Gradient underline */}
                                            <motion.div
                                                layoutId="activeNavLine"
                                                className="absolute -bottom-[9px] left-2 right-2 h-[2px] bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-full"
                                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                            />
                                        </>
                                    )}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </motion.header>
    );
}
