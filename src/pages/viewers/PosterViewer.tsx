import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Download, FileText, ArrowLeft } from "lucide-react";
import { getAssetById } from "@/services/assetRegistry";
import type { GeneratedAssetV2 } from "@/types/campusos";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function PosterViewer() {
    const { id } = useParams<{ id: string }>();
    const [asset, setAsset] = useState<GeneratedAssetV2 | null>(null);
    const [loading, setLoading] = useState(true);
    const posterRef = useRef<HTMLDivElement>(null);

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
        a.download = `${asset.title.replace(/\s+/g, "_")}_poster.html`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadPDF = async () => {
        if (!posterRef.current) return;
        try {
            const canvas = await html2canvas(posterRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#000",
            });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${asset?.title.replace(/\s+/g, "_")}_poster.pdf`);
        } catch (err) {
            console.error("PDF export failed:", err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!asset) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white gap-4">
                <h1 className="text-2xl font-bold">Poster Not Found</h1>
                <p className="text-gray-400">This poster may have been removed or the link is invalid.</p>
                <a href="/" className="flex items-center gap-2 text-purple-400 hover:text-purple-300">
                    <ArrowLeft className="w-4 h-4" /> Back to CampusOS
                </a>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
            {/* Toolbar */}
            <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <a
                        href="/"
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        CampusOS
                    </a>
                    <span className="text-white/20">|</span>
                    <h1 className="text-sm font-medium text-white truncate max-w-[300px]">{asset.title}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={downloadHTML}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-300 hover:text-white transition-all border border-white/10"
                    >
                        <FileText className="w-4 h-4" />
                        Download HTML
                    </button>
                    <button
                        onClick={downloadPDF}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm text-white transition-all shadow-lg shadow-purple-600/20"
                    >
                        <Download className="w-4 h-4" />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Poster Preview */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div
                    ref={posterRef}
                    className="w-full max-w-[595px] shadow-2xl shadow-purple-500/5 rounded-lg overflow-hidden"
                    style={{ aspectRatio: "210 / 297" }}
                >
                    <iframe
                        srcDoc={typeof asset.content === "string" ? asset.content : ""}
                        className="w-full h-full border-0"
                        title="Poster Preview"
                        sandbox="allow-same-origin"
                    />
                </div>
            </div>
        </div>
    );
}
