import { motion } from "framer-motion";
import { Target, Users, Megaphone, Palette } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ParsedIntent } from "@/types/campusos";

interface IntentSummaryProps {
    intent: ParsedIntent;
}

const typeIcons: Record<string, React.ReactNode> = {
    event_promotion: <Megaphone className="w-4 h-4" />,
    website: <Target className="w-4 h-4" />,
    presentation: <Palette className="w-4 h-4" />,
};

const typeLabels: Record<string, string> = {
    event_promotion: "Event Promotion",
    website: "Landing Page",
    presentation: "Presentation",
};

export function IntentSummary({ intent }: IntentSummaryProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
        >
            <Card className="glass-strong border-primary/10 glow-purple">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            {typeIcons[intent.type] || <Target className="w-4 h-4" />}
                        </div>
                        <div>
                            <CardTitle className="text-lg">{intent.title}</CardTitle>
                            <Badge variant="glow" className="mt-1">
                                {typeLabels[intent.type] || intent.type}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {intent.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Users className="w-3.5 h-3.5" />
                                Audience
                            </div>
                            <p className="text-sm font-medium">{intent.audience}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Palette className="w-3.5 h-3.5" />
                                Tone
                            </div>
                            <p className="text-sm font-medium capitalize">{intent.tone}</p>
                        </div>
                    </div>

                    {intent.elements.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">Required Elements</p>
                            <div className="flex flex-wrap gap-1.5">
                                {intent.elements.map((el, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                        {el}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
