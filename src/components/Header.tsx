import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Cpu, Plus, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
    const location = useLocation();

    const navItems = [
        { path: "/", label: "Home", icon: Sparkles },
        { path: "/create", label: "Create", icon: Plus },
        { path: "/history", label: "History", icon: Clock },
    ];

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/30"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="relative">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow duration-300">
                            <Cpu className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300" />
                    </div>
                    <span className="text-lg font-bold gradient-text hidden sm:inline">CampusOS</span>
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-0.5 sm:gap-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link key={item.path} to={item.path}>
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    size="sm"
                                    className={`relative gap-1.5 px-2.5 sm:px-3 ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{item.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNav"
                                            className="absolute inset-0 bg-primary/10 rounded-md"
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
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
