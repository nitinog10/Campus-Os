import { motion } from "framer-motion";
import { Check, Loader2, Circle, AlertCircle, FileText, Palette, Code2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Pipeline, StepStatus, StepType } from "@/types/campusos";

interface PipelineViewProps {
    pipeline: Pipeline;
}

const statusConfig: Record<StepStatus, { icon: React.ReactNode; color: string }> = {
    pending: { icon: <Circle className="w-4 h-4" />, color: "text-muted-foreground" },
    running: { icon: <Loader2 className="w-4 h-4 animate-spin" />, color: "text-blue-400" },
    done: { icon: <Check className="w-4 h-4" />, color: "text-green-400" },
    error: { icon: <AlertCircle className="w-4 h-4" />, color: "text-red-400" },
};

const typeIcons: Record<StepType, React.ReactNode> = {
    text: <FileText className="w-3.5 h-3.5" />,
    design: <Palette className="w-3.5 h-3.5" />,
    code: <Code2 className="w-3.5 h-3.5" />,
};

export function PipelineView({ pipeline }: PipelineViewProps) {
    const completedSteps = pipeline.steps.filter((s) => s.status === "done").length;
    const progress = pipeline.steps.length > 0
        ? (completedSteps / pipeline.steps.length) * 100
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
        >
            <Card className="glass border-border/50">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Execution Pipeline</CardTitle>
                        <span className="text-xs text-muted-foreground">
                            {completedSteps}/{pipeline.steps.length} steps
                        </span>
                    </div>
                    <Progress value={progress} className="mt-2" />
                </CardHeader>
                <CardContent>
                    <div className="relative space-y-0">
                        {pipeline.steps.map((step, i) => {
                            const config = statusConfig[step.status];
                            const isLast = i === pipeline.steps.length - 1;

                            return (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="relative flex gap-3 pb-4"
                                >
                                    {/* Vertical Line */}
                                    {!isLast && (
                                        <div className="absolute left-[11px] top-7 bottom-0 w-px bg-border" />
                                    )}

                                    {/* Status Icon */}
                                    <div className={`relative z-10 flex-shrink-0 mt-0.5 ${config.color}`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step.status === "done"
                                                ? "bg-green-400/10"
                                                : step.status === "running"
                                                    ? "bg-blue-400/10"
                                                    : "bg-muted"
                                            }`}>
                                            {config.icon}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className={`text-sm font-medium ${step.status === "done"
                                                    ? "text-foreground"
                                                    : step.status === "running"
                                                        ? "text-blue-400"
                                                        : "text-muted-foreground"
                                                }`}>
                                                {step.label}
                                            </p>
                                            <span className="text-muted-foreground/50">
                                                {typeIcons[step.stepType]}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {step.description}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
