import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Download, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { getAssetById } from "@/services/assetRegistry";
import type { GeneratedAssetV2, PresentationData, Slide } from "@/types/campusos";
import jsPDF from "jspdf";

// ─── Slide Renderer ──────────────────────────────────────

function SlideContent({ slide }: { slide: Slide }) {
    switch (slide.type) {
        case "title":
            return (
                <div className="relative flex flex-col items-center justify-center h-full text-center px-16 overflow-hidden">
                    {slide.image && (
                        <div className="absolute inset-0">
                            <img src={slide.image} alt="" className="w-full h-full object-cover opacity-20" crossOrigin="anonymous" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/80 to-[#0a0a0f]/60" />
                        </div>
                    )}
                    <div className="relative z-10">
                        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent leading-tight mb-6">
                            {slide.title}
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl">{slide.subtitle}</p>
                        <div className="mt-12 flex items-center gap-2 text-sm text-gray-600">
                            <span className="w-8 h-[2px] bg-gradient-to-r from-purple-500 to-blue-500" />
                            Use ← → arrow keys to navigate
                            <span className="w-8 h-[2px] bg-gradient-to-r from-blue-500 to-purple-500" />
                        </div>
                    </div>
                </div>
            );

        case "content":
            return (
                <div className="flex h-full">
                    <div className={`flex flex-col justify-center ${slide.image ? "w-1/2" : "w-full"} px-16 md:px-24`}>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-10">{slide.title}</h2>
                        <ul className="space-y-5">
                            {slide.bullets.map((bullet, i) => (
                                <li key={i} className="flex items-start gap-4 text-lg md:text-xl text-gray-300"
                                    style={{ animation: `fadeInUp 0.5s ease ${i * 0.1}s both` }}>
                                    <span className="mt-1 w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 shrink-0" />
                                    <span>{bullet}</span>
                                </li>
                            ))}
                        </ul>
                        {slide.note && (
                            <p className="mt-10 text-sm text-gray-500 italic border-l-2 border-purple-500/30 pl-4">
                                {slide.note}
                            </p>
                        )}
                    </div>
                    {slide.image && (
                        <div className="w-1/2 flex items-center justify-center p-8">
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="max-w-full max-h-[70vh] rounded-2xl shadow-2xl shadow-purple-500/10 object-cover"
                                crossOrigin="anonymous"
                            />
                        </div>
                    )}
                </div>
            );

        case "image-focus":
            return (
                <div className="flex flex-col items-center justify-center h-full px-16 gap-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-white">{slide.title}</h2>
                    <div className="relative max-w-4xl w-full">
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full max-h-[60vh] object-cover rounded-2xl shadow-2xl shadow-purple-500/10"
                            crossOrigin="anonymous"
                        />
                        <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10" />
                    </div>
                    <p className="text-lg text-gray-400 max-w-2xl text-center">{slide.caption}</p>
                </div>
            );

        case "stats":
            return (
                <div className="flex flex-col items-center justify-center h-full px-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-16">{slide.title}</h2>
                    <div className="flex gap-12 md:gap-20">
                        {slide.stats.map((stat, i) => (
                            <div key={i} className="text-center" style={{ animation: `fadeInUp 0.5s ease ${i * 0.15}s both` }}>
                                <p className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-3">
                                    {stat.value}
                                </p>
                                <p className="text-lg text-gray-400 uppercase tracking-wider">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case "two-column":
            return (
                <div className="flex flex-col justify-center h-full px-16 md:px-24">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-10">{slide.title}</h2>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-colors">
                            <h3 className="text-xl font-semibold text-purple-400 mb-4">{slide.left.heading}</h3>
                            <ul className="space-y-3">
                                {slide.left.items.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-300">
                                        <span className="mt-1.5 w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-blue-500/30 transition-colors">
                            <h3 className="text-xl font-semibold text-blue-400 mb-4">{slide.right.heading}</h3>
                            <ul className="space-y-3">
                                {slide.right.items.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-300">
                                        <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            );

        case "closing":
            return (
                <div className="relative flex flex-col items-center justify-center h-full text-center px-16 overflow-hidden">
                    {slide.image && (
                        <div className="absolute inset-0">
                            <img src={slide.image} alt="" className="w-full h-full object-cover opacity-15" crossOrigin="anonymous" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/80 to-[#0a0a0f]/60" />
                        </div>
                    )}
                    <div className="relative z-10">
                        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-6">
                            {slide.title}
                        </h1>
                        <p className="text-xl text-gray-400 mb-4">{slide.subtitle}</p>
                        {slide.note && <p className="text-sm text-gray-500">{slide.note}</p>}
                    </div>
                </div>
            );

        default:
            return <div className="flex items-center justify-center h-full text-gray-500">Unknown slide type</div>;
    }
}

// ─── Main Viewer ─────────────────────────────────────────

export default function PresentationViewer() {
    const { id } = useParams<{ id: string }>();
    const [asset, setAsset] = useState<GeneratedAssetV2 | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        if (id) {
            const loaded = getAssetById(id);
            setAsset(loaded);
        }
        setLoading(false);
    }, [id]);

    const presentation: PresentationData | null =
        asset?.content && typeof asset.content === "object"
            ? (asset.content as PresentationData)
            : asset?.content && typeof asset.content === "string"
                ? (() => { try { return JSON.parse(asset.content as string); } catch { return null; } })()
                : null;

    const totalSlides = presentation?.slides?.length || 0;

    const goNext = useCallback(() => {
        setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
    }, [totalSlides]);

    const goPrev = useCallback(() => {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight" || e.key === " ") {
                e.preventDefault();
                goNext();
            }
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                goPrev();
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [goNext, goPrev]);

    const downloadPDF = () => {
        if (!presentation) return;
        const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
        const width = pdf.internal.pageSize.getWidth();
        const height = pdf.internal.pageSize.getHeight();

        presentation.slides.forEach((slide, i) => {
            if (i > 0) pdf.addPage();
            pdf.setFillColor(10, 10, 15);
            pdf.rect(0, 0, width, height, "F");
            pdf.setTextColor(255, 255, 255);

            if (slide.type === "title" || slide.type === "closing") {
                pdf.setFontSize(32);
                pdf.text(slide.title, width / 2, height / 2 - 10, { align: "center" });
                pdf.setFontSize(16);
                pdf.setTextColor(150, 150, 160);
                pdf.text(slide.subtitle, width / 2, height / 2 + 10, { align: "center" });
            } else if (slide.type === "content") {
                pdf.setFontSize(24);
                pdf.text(slide.title, 25, 30);
                pdf.setFontSize(14);
                pdf.setTextColor(200, 200, 210);
                slide.bullets.forEach((bullet, j) => {
                    pdf.text(`• ${bullet}`, 30, 55 + j * 18);
                });
            } else if (slide.type === "stats") {
                pdf.setFontSize(24);
                pdf.text(slide.title, width / 2, 30, { align: "center" });
                pdf.setFontSize(36);
                const statWidth = width / slide.stats.length;
                slide.stats.forEach((stat, j) => {
                    const x = statWidth * j + statWidth / 2;
                    pdf.setTextColor(168, 85, 247);
                    pdf.text(stat.value, x, height / 2 - 10, { align: "center" });
                    pdf.setFontSize(14);
                    pdf.setTextColor(150, 150, 160);
                    pdf.text(stat.label, x, height / 2 + 10, { align: "center" });
                    pdf.setFontSize(36);
                });
            } else if (slide.type === "image-focus") {
                pdf.setFontSize(24);
                pdf.text(slide.title, width / 2, 30, { align: "center" });
                pdf.setFontSize(14);
                pdf.setTextColor(150, 150, 160);
                pdf.text(slide.caption, width / 2, height - 20, { align: "center" });
            } else if (slide.type === "two-column") {
                pdf.setFontSize(24);
                pdf.text(slide.title, 25, 30);
                pdf.setFontSize(14);
                pdf.setTextColor(200, 200, 210);
                pdf.text(slide.left.heading, 25, 55);
                slide.left.items.forEach((item, j) => {
                    pdf.text(`• ${item}`, 30, 70 + j * 14);
                });
                pdf.text(slide.right.heading, width / 2 + 10, 55);
                slide.right.items.forEach((item, j) => {
                    pdf.text(`• ${item}`, width / 2 + 15, 70 + j * 14);
                });
            }
        });

        pdf.save(`${asset?.title.replace(/\s+/g, "_")}_presentation.pdf`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white">
                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!asset || !presentation) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] text-white gap-4">
                <h1 className="text-2xl font-bold">Presentation Not Found</h1>
                <p className="text-gray-400">Could not load presentation data.</p>
                <a href="/" className="flex items-center gap-2 text-purple-400 hover:text-purple-300">
                    <ArrowLeft className="w-4 h-4" /> Back to CampusOS
                </a>
            </div>
        );
    }

    const slide = presentation.slides[currentSlide];

    return (
        <div
            className="h-screen bg-[#0a0a0f] flex flex-col overflow-hidden select-none"
            style={{ fontFamily: "'Inter', 'Space Grotesk', system-ui, sans-serif" }}
        >
            {/* Global slide animation */}
            <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

            {/* Slide Area */}
            <div className="flex-1 relative">
                <div
                    key={currentSlide}
                    className="absolute inset-0"
                    style={{ animation: "slideIn 0.4s ease" }}
                >
                    <SlideContent slide={slide} />
                </div>

                {/* Navigation Arrows */}
                {currentSlide > 0 && (
                    <button
                        onClick={goPrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all border border-white/5"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                )}
                {currentSlide < totalSlides - 1 && (
                    <button
                        onClick={goNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all border border-white/5"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Bottom Bar */}
            <div className="h-14 bg-black/60 backdrop-blur-lg border-t border-white/5 px-6 flex items-center justify-between">
                <a
                    href="/"
                    className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    CampusOS
                </a>

                {/* Slide Indicator */}
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        {presentation.slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentSlide(i)}
                                className={`h-2 rounded-full transition-all duration-200 ${i === currentSlide
                                        ? "bg-purple-500 w-6"
                                        : i < currentSlide
                                            ? "bg-purple-500/40 w-2"
                                            : "bg-white/10 w-2"
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-gray-500 tabular-nums">
                        {currentSlide + 1} / {totalSlides}
                    </span>
                </div>

                <button
                    onClick={downloadPDF}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs text-white transition-all"
                >
                    <Download className="w-3.5 h-3.5" />
                    PDF
                </button>
            </div>
        </div>
    );
}
