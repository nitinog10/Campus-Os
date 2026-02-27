import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Download, FileText, Copy, Check, ArrowLeft } from "lucide-react";
import { getAssetById } from "@/services/assetRegistry";
import { toast } from "sonner";
import type { GeneratedAssetV2 } from "@/types/campusos";

export default function LandingPageViewer() {
    const { id } = useParams<{ id: string }>();
    const [asset, setAsset] = useState<GeneratedAssetV2 | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [showToolbar, setShowToolbar] = useState(true);

    useEffect(() => {
        if (id) {
            const loaded = getAssetById(id);
            setAsset(loaded);
        }
        setLoading(false);
    }, [id]);

    const downloadHTML = () => {
        if (!asset || typeof asset.content !== "string") return;
        const blob = new Blob([asset.content], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${asset.title.replace(/\s+/g, "_")}_landing_page.html`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const copyCode = async () => {
        if (!asset || typeof asset.content !== "string") return;
        await navigator.clipboard.writeText(asset.content);
        setCopied(true);
        toast.success("Deploy-ready code copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!asset) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white gap-4">
                <h1 className="text-2xl font-bold">Landing Page Not Found</h1>
                <p className="text-gray-400">This page may have been removed or the link is invalid.</p>
                <a href="/" className="flex items-center gap-2 text-blue-400 hover:text-blue-300">
                    <ArrowLeft className="w-4 h-4" /> Back to CampusOS
                </a>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex flex-col">
            {/* Floating Toolbar */}
            {showToolbar && (
                <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2.5 shadow-2xl">
                    <a
                        href="/"
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors mr-2"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back
                    </a>
                    <span className="text-white/10 text-sm">|</span>
                    <button
                        onClick={copyCode}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-300 hover:text-white transition-all"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? "Copied!" : "Copy Code"}
                    </button>
                    <button
                        onClick={downloadHTML}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-300 hover:text-white transition-all"
                    >
                        <FileText className="w-3.5 h-3.5" />
                        HTML
                    </button>
                    <button
                        onClick={() => setShowToolbar(false)}
                        className="ml-1 text-gray-500 hover:text-white text-xs"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Show toolbar button when hidden */}
            {!showToolbar && (
                <button
                    onClick={() => setShowToolbar(true)}
                    className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/80 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-lg"
                >
                    <Download className="w-4 h-4" />
                </button>
            )}

            {/* Full-page Landing Page Render */}
            <iframe
                srcDoc={typeof asset.content === "string" ? asset.content : ""}
                className="w-full flex-1 border-0"
                title="Landing Page Preview"
                sandbox="allow-same-origin allow-scripts"
                style={{ minHeight: "100vh" }}
            />
        </div>
    );
}
