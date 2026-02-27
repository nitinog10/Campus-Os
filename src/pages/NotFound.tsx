import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <h1 className="text-8xl font-bold gradient-text mb-4">404</h1>
                <p className="text-xl text-muted-foreground mb-8">
                    This page doesn't exist
                </p>
                <Link to="/">
                    <Button variant="glow" className="gap-2">
                        <Home className="w-4 h-4" />
                        Go Home
                    </Button>
                </Link>
            </motion.div>
        </div>
    );
}
