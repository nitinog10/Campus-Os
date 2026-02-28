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
                            <img src={slide.image} alt="" className="w-full h-full object-cover opacity-25 scale-105" crossOrigin="anonymous" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/85 to-[#0a0a0f]/50" />
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20" />
                        </div>
                    )}
                    {/* Decorative orbs */}
                    <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
                    <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />
                    <div className="relative z-10 max-w-4xl">
                        {"badge" in slide && slide.badge && (
                            <span className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-sm text-purple-300 font-medium tracking-wide"
                                style={{ animation: "fadeInUp 0.5s ease 0.1s both" }}>
                                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                                {slide.badge}
                            </span>
                        )}
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent leading-[1.05] mb-8 tracking-tight"
                            style={{ animation: "fadeInUp 0.6s ease 0.2s both" }}>
                            {slide.title}
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light" style={{ animation: "fadeInUp 0.5s ease 0.4s both" }}>{slide.subtitle}</p>
                        <div className="mt-16 flex items-center justify-center gap-3 text-sm text-gray-600" style={{ animation: "fadeInUp 0.5s ease 0.6s both" }}>
                            <span className="w-12 h-[1px] bg-gradient-to-r from-transparent to-purple-500/50" />
                            <span className="text-xs uppercase tracking-[0.2em]">Use ← → to navigate</span>
                            <span className="w-12 h-[1px] bg-gradient-to-r from-blue-500/50 to-transparent" />
                        </div>
                    </div>
                </div>
            );

        case "content":
            return (
                <div className="flex h-full">
                    <div className={`flex flex-col justify-center ${slide.image ? "w-[55%]" : "w-full"} px-16 md:px-24`}>
                        <div className="max-w-xl">
                            <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-8" />
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 leading-tight tracking-tight">{slide.title}</h2>
                            <ul className="space-y-6">
                                {slide.bullets.map((bullet, i) => (
                                    <li key={i} className="flex items-start gap-4 text-lg text-gray-300/90 leading-relaxed"
                                        style={{ animation: `fadeInUp 0.5s ease ${0.15 + i * 0.1}s both` }}>
                                        <span className="mt-2 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 shrink-0 shadow-lg shadow-purple-500/20" />
                                        <span>{bullet}</span>
                                    </li>
                                ))}
                            </ul>
                            {slide.note && (
                                <p className="mt-10 text-sm text-gray-500 italic border-l-2 border-purple-500/30 pl-4 py-1">
                                    {slide.note}
                                </p>
                            )}
                        </div>
                    </div>
                    {slide.image && (
                        <div className="w-[45%] flex items-center justify-center p-8 relative">
                            <div className="absolute inset-8 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-3xl" />
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="relative max-w-full max-h-[70vh] rounded-2xl shadow-2xl shadow-purple-500/10 object-cover border border-white/5"
                                crossOrigin="anonymous"
                                style={{ animation: "fadeInUp 0.6s ease 0.3s both" }}
                            />
                        </div>
                    )}
                </div>
            );

        case "image-focus":
            return (
                <div className="flex flex-col items-center justify-center h-full px-16 gap-8 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent pointer-events-none" />
                    <h2 className="relative text-3xl md:text-4xl font-bold text-white tracking-tight" style={{ animation: "fadeInUp 0.5s ease both" }}>{slide.title}</h2>
                    <div className="relative max-w-5xl w-full group" style={{ animation: "fadeInUp 0.5s ease 0.2s both" }}>
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="relative w-full max-h-[58vh] object-cover rounded-2xl shadow-2xl shadow-purple-900/20 border border-white/5"
                            crossOrigin="anonymous"
                        />
                    </div>
                    <p className="relative text-lg text-gray-400 max-w-3xl text-center leading-relaxed" style={{ animation: "fadeInUp 0.5s ease 0.4s both" }}>{slide.caption}</p>
                </div>
            );

        case "stats":
            return (
                <div className="flex flex-col items-center justify-center h-full px-16 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.06)_0%,transparent_70%)]" />
                    <h2 className="relative text-3xl md:text-4xl font-bold text-white mb-20 tracking-tight" style={{ animation: "fadeInUp 0.5s ease both" }}>{slide.title}</h2>
                    <div className="relative flex gap-0">
                        {slide.stats.map((stat, i) => (
                            <div key={i} className="text-center px-12 md:px-16 relative" style={{ animation: `fadeInUp 0.5s ease ${0.1 + i * 0.15}s both` }}>
                                {i > 0 && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-16 bg-gradient-to-b from-transparent via-white/10 to-transparent" />}
                                <p className="text-5xl md:text-7xl font-extrabold bg-gradient-to-br from-purple-300 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4 tracking-tight">
                                    {stat.value}
                                </p>
                                <p className="text-sm text-gray-400 uppercase tracking-[0.15em] font-medium">{stat.label}</p>
                                {"description" in stat && stat.description && (
                                    <p className="text-xs text-gray-600 mt-2 max-w-[160px] mx-auto">{stat.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            );

        case "two-column":
            return (
                <div className="flex flex-col justify-center h-full px-16 md:px-24 relative">
                    <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6" />
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 tracking-tight">{slide.title}</h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="relative bg-gradient-to-br from-purple-500/[0.03] to-transparent rounded-2xl p-8 border border-purple-500/10 hover:border-purple-500/25 transition-all duration-300 group"
                            style={{ animation: "fadeInUp 0.5s ease 0.1s both" }}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <h3 className="text-xl font-semibold text-purple-300 mb-5 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-400" />
                                {slide.left.heading}
                            </h3>
                            <ul className="space-y-4">
                                {slide.left.items.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-300 leading-relaxed">
                                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-purple-500/60 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative bg-gradient-to-br from-blue-500/[0.03] to-transparent rounded-2xl p-8 border border-blue-500/10 hover:border-blue-500/25 transition-all duration-300 group"
                            style={{ animation: "fadeInUp 0.5s ease 0.2s both" }}>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <h3 className="text-xl font-semibold text-blue-300 mb-5 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-400" />
                                {slide.right.heading}
                            </h3>
                            <ul className="space-y-4">
                                {slide.right.items.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-300 leading-relaxed">
                                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-500/60 shrink-0" />
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
                            <img src={slide.image} alt="" className="w-full h-full object-cover opacity-15 scale-105" crossOrigin="anonymous" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/85 to-[#0a0a0f]/50" />
                        </div>
                    )}
                    <div className="absolute top-1/3 left-1/3 w-[350px] h-[350px] rounded-full bg-purple-500/8 blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-1/3 right-1/3 w-[250px] h-[250px] rounded-full bg-blue-500/8 blur-[80px] pointer-events-none" />
                    <div className="relative z-10 max-w-3xl">
                        <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-purple-300 via-white to-blue-300 bg-clip-text text-transparent mb-8 tracking-tight"
                            style={{ animation: "fadeInUp 0.5s ease 0.1s both" }}>
                            {slide.title}
                        </h1>
                        <p className="text-xl text-gray-400 mb-6 leading-relaxed" style={{ animation: "fadeInUp 0.5s ease 0.3s both" }}>{slide.subtitle}</p>
                        {slide.links && slide.links.length > 0 && (
                            <div className="flex gap-3 mt-8 justify-center flex-wrap" style={{ animation: "fadeInUp 0.5s ease 0.5s both" }}>
                                {slide.links.map((link, i) => (
                                    <span key={i} className="px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/10 text-sm text-gray-300 hover:bg-white/[0.08] hover:border-white/20 transition-all cursor-pointer">
                                        {link}
                                    </span>
                                ))}
                            </div>
                        )}
                        {slide.note && <p className="text-sm text-gray-500 mt-6" style={{ animation: "fadeInUp 0.5s ease 0.7s both" }}>{slide.note}</p>}
                    </div>
                </div>
            );

        case "quote":
            return (
                <div className="flex flex-col items-center justify-center h-full px-16 text-center relative">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.04)_0%,transparent_60%)]" />
                    <div className="relative max-w-3xl">
                        <span className="block text-[120px] leading-none text-purple-500/10 font-serif mb-[-40px]">"</span>
                        <p className="text-2xl md:text-3xl font-light text-white/90 leading-relaxed italic" style={{ animation: "fadeInUp 0.6s ease both" }}>
                            {slide.quote}
                        </p>
                        <span className="block text-[120px] leading-none text-purple-500/10 font-serif mt-[-60px] rotate-180">"</span>
                    </div>
                    <div className="flex items-center gap-5 mt-4" style={{ animation: "fadeInUp 0.6s ease 0.3s both" }}>
                        {slide.image && (
                            <img src={slide.image} alt={slide.author} className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/20 shadow-lg shadow-purple-500/10" crossOrigin="anonymous" />
                        )}
                        <div className="text-left">
                            <p className="font-semibold text-white text-lg">{slide.author}</p>
                            {slide.role && <p className="text-sm text-purple-300/70">{slide.role}</p>}
                        </div>
                    </div>
                </div>
            );

        case "team":
            return (
                <div className="flex flex-col items-center justify-center h-full px-16 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.04)_0%,transparent_60%)]" />
                    <h2 className="relative text-3xl md:text-4xl font-bold text-white mb-16 tracking-tight" style={{ animation: "fadeInUp 0.5s ease both" }}>{slide.title}</h2>
                    <div className="relative flex flex-wrap justify-center gap-10 md:gap-14 max-w-5xl">
                        {slide.members.map((member, i) => (
                            <div
                                key={i}
                                className="flex flex-col items-center text-center group"
                                style={{ animation: `fadeInUp 0.5s ease ${0.1 + i * 0.12}s both` }}
                            >
                                <div className="relative mb-5">
                                    <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300" />
                                    <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-purple-500/30 transition-all duration-300 shadow-xl shadow-purple-500/5">
                                        {member.image ? (
                                            <img src={member.image} alt={member.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center text-3xl font-bold text-white/50">
                                                {member.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <p className="font-semibold text-white text-base">{member.name}</p>
                                <p className="text-sm text-purple-300/60 mt-1">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case "timeline":
            return (
                <div className="flex flex-col justify-center h-full px-16 md:px-24 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(168,85,247,0.04)_0%,transparent_50%)]" />
                    <h2 className="relative text-3xl md:text-4xl font-bold text-white mb-14 text-center tracking-tight" style={{ animation: "fadeInUp 0.5s ease both" }}>{slide.title}</h2>
                    <div className="relative max-w-3xl mx-auto w-full">
                        {/* Vertical gradient line */}
                        <div className="absolute left-7 top-2 bottom-2 w-[2px] bg-gradient-to-b from-purple-500/60 via-blue-500/40 to-purple-500/10 rounded-full" />
                        <div className="space-y-5">
                            {slide.items.map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-6 group"
                                    style={{ animation: `fadeInUp 0.5s ease ${0.1 + i * 0.1}s both` }}
                                >
                                    {/* Glowing dot */}
                                    <div className="relative z-10 shrink-0">
                                        <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative w-14 h-14 rounded-full bg-[#0a0a0f] border-2 border-purple-500/30 group-hover:border-purple-500/60 flex items-center justify-center transition-colors backdrop-blur-sm">
                                            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wide leading-tight text-center">{item.time}</span>
                                        </div>
                                    </div>
                                    {/* Content card */}
                                    <div className="flex-1 bg-white/[0.02] rounded-xl p-5 border border-white/[0.06] hover:border-purple-500/20 hover:bg-white/[0.04] transition-all duration-300">
                                        <p className="font-semibold text-white text-base">{item.title}</p>
                                        {item.description && <p className="text-sm text-gray-400 mt-2 leading-relaxed">{item.description}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
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
            } else if (slide.type === "quote") {
                pdf.setFontSize(20);
                pdf.setTextColor(200, 200, 210);
                const quoteText = `"${slide.quote}"`;
                const splitQuote = pdf.splitTextToSize(quoteText, width - 60);
                pdf.text(splitQuote, width / 2, height / 2 - 20, { align: "center" });
                pdf.setFontSize(14);
                pdf.setTextColor(168, 85, 247);
                pdf.text(`— ${slide.author}${slide.role ? `, ${slide.role}` : ""}`, width / 2, height / 2 + 20, { align: "center" });
            } else if (slide.type === "team") {
                pdf.setFontSize(24);
                pdf.text(slide.title, width / 2, 30, { align: "center" });
                pdf.setFontSize(14);
                const memberWidth = width / Math.min(slide.members.length, 5);
                slide.members.forEach((member, j) => {
                    const x = memberWidth * j + memberWidth / 2;
                    pdf.setTextColor(255, 255, 255);
                    pdf.text(member.name, x, height / 2, { align: "center" });
                    pdf.setFontSize(12);
                    pdf.setTextColor(150, 150, 160);
                    pdf.text(member.role, x, height / 2 + 12, { align: "center" });
                    pdf.setFontSize(14);
                });
            } else if (slide.type === "timeline") {
                pdf.setFontSize(24);
                pdf.text(slide.title, width / 2, 30, { align: "center" });
                pdf.setFontSize(12);
                pdf.setTextColor(200, 200, 210);
                slide.items.forEach((item, j) => {
                    pdf.setTextColor(168, 85, 247);
                    pdf.text(item.time, 25, 55 + j * 22);
                    pdf.setTextColor(255, 255, 255);
                    pdf.setFontSize(14);
                    pdf.text(item.title, 65, 55 + j * 22);
                    if (item.description) {
                        pdf.setFontSize(11);
                        pdf.setTextColor(150, 150, 160);
                        pdf.text(item.description, 65, 63 + j * 22);
                    }
                    pdf.setFontSize(12);
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
            className="h-screen bg-[#08080c] flex flex-col overflow-hidden select-none"
            style={{ fontFamily: "'Inter', 'Sora', 'Space Grotesk', system-ui, sans-serif" }}
        >
            {/* Global slide animation + fonts */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Sora:wght@400;500;600;700;800&display=swap');
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(40px) scale(0.98); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes slideOut {
          from { opacity: 1; transform: translateX(0) scale(1); }
          to { opacity: 0; transform: translateX(-40px) scale(0.98); }
        }
      `}</style>

            {/* Slide Area */}
            <div className="flex-1 relative bg-[#0a0a0f]">
                <div
                    key={currentSlide}
                    className="absolute inset-0"
                    style={{ animation: "slideIn 0.45s cubic-bezier(0.4, 0, 0.2, 1)" }}
                >
                    <SlideContent slide={slide} />
                </div>

                {/* Navigation Arrows — minimal, Gamma-style */}
                {currentSlide > 0 && (
                    <button
                        onClick={goPrev}
                        className="absolute left-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/[0.04] hover:bg-white/[0.1] flex items-center justify-center text-gray-500 hover:text-white transition-all duration-200 border border-white/[0.04] hover:border-white/10 backdrop-blur-sm"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                )}
                {currentSlide < totalSlides - 1 && (
                    <button
                        onClick={goNext}
                        className="absolute right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/[0.04] hover:bg-white/[0.1] flex items-center justify-center text-gray-500 hover:text-white transition-all duration-200 border border-white/[0.04] hover:border-white/10 backdrop-blur-sm"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Bottom Bar — Gamma-style minimal */}
            <div className="h-14 bg-[#050507]/90 backdrop-blur-xl border-t border-white/[0.04] px-6 flex items-center justify-between">
                <a
                    href="/"
                    className="flex items-center gap-2 text-xs text-gray-600 hover:text-white transition-colors duration-200"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">CampusOS</span>
                </a>

                {/* Slide progress */}
                <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                        {presentation.slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentSlide(i)}
                                className={`rounded-full transition-all duration-300 ${i === currentSlide
                                        ? "bg-gradient-to-r from-purple-500 to-blue-500 w-7 h-2"
                                        : i < currentSlide
                                            ? "bg-purple-500/30 w-2 h-2 hover:bg-purple-500/50"
                                            : "bg-white/[0.08] w-2 h-2 hover:bg-white/20"
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="text-[11px] text-gray-600 tabular-nums font-medium">
                        {currentSlide + 1} / {totalSlides}
                    </span>
                </div>

                <button
                    onClick={downloadPDF}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-xs text-white font-medium transition-all duration-200 shadow-lg shadow-purple-500/10"
                >
                    <Download className="w-3.5 h-3.5" />
                    Export
                </button>
            </div>
        </div>
    );
}
