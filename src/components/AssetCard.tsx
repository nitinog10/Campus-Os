import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Download, Check, Eye, Code2, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import type { GeneratedAsset } from "@/types/campusos";

interface AssetCardProps {
    asset: GeneratedAsset;
    index: number;
}

export function AssetCard({ asset, index }: AssetCardProps) {
    const [copied, setCopied] = useState(false);
    const [viewMode, setViewMode] = useState<"preview" | "code">(
        asset.contentType === "html" ? "preview" : "code"
    );

    const handleCopy = async () => {
        await navigator.clipboard.writeText(asset.content);
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const ext = asset.contentType === "html" ? "html" : asset.contentType === "markdown" ? "md" : "txt";
        const blob = new Blob([asset.content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${asset.stepLabel.replace(/\s+/g, "_").toLowerCase()}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Download started!");
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.15 }}
        >
            <Card className="glass border-border/50 overflow-hidden">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{asset.stepLabel}</CardTitle>
                            <Badge variant="outline" className="text-[10px]">
                                {asset.contentType}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                            {asset.contentType === "html" && (
                                <div className="flex items-center gap-0.5 mr-2">
                                    <Button
                                        variant={viewMode === "preview" ? "secondary" : "ghost"}
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => setViewMode("preview")}
                                        title="Preview"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                        variant={viewMode === "code" ? "secondary" : "ghost"}
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => setViewMode("code")}
                                        title="View Code"
                                    >
                                        <Code2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={handleCopy}
                                title="Copy"
                            >
                                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={handleDownload}
                                title="Download"
                            >
                                <Download className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {/* Content Preview */}
                    <ScrollArea className="max-h-[400px] rounded-lg">
                        {viewMode === "preview" && asset.contentType === "html" ? (
                            <div
                                className="bg-white rounded-lg p-4 text-black"
                                dangerouslySetInnerHTML={{ __html: asset.content }}
                            />
                        ) : asset.contentType === "markdown" ? (
                            <div className="prose prose-invert prose-sm max-w-none p-4">
                                <ReactMarkdown>{asset.content}</ReactMarkdown>
                            </div>
                        ) : (
                            <pre className="text-xs font-mono text-muted-foreground bg-muted/30 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">
                                {asset.content}
                            </pre>
                        )}
                    </ScrollArea>

                    {/* Explanation */}
                    {asset.explanation && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                            <FileText className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {asset.explanation}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
