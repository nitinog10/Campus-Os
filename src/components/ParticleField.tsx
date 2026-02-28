import { useRef, useEffect } from "react";

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    opacity: number;
    color: string;
}

const COLORS = [
    "168, 85, 247",  // purple
    "99, 102, 241",  // indigo
    "59, 130, 246",  // blue
    "6, 182, 212",   // cyan
];

export function ParticleField({ className = "" }: { className?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const particlesRef = useRef<Particle[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = 0;
        let height = 0;

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
        };

        const initParticles = () => {
            const count = Math.min(60, Math.floor((width * height) / 15000));
            particlesRef.current = Array.from({ length: count }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                radius: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.5 + 0.1,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
            }));
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            const particles = particlesRef.current;

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        const alpha = (1 - dist / 120) * 0.08;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw and update particles
            for (const p of particles) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
                ctx.fill();

                p.x += p.vx;
                p.y += p.vy;

                // Wrap around edges
                if (p.x < -5) p.x = width + 5;
                if (p.x > width + 5) p.x = -5;
                if (p.y < -5) p.y = height + 5;
                if (p.y > height + 5) p.y = -5;
            }

            animationRef.current = requestAnimationFrame(draw);
        };

        resize();
        initParticles();
        draw();

        window.addEventListener("resize", () => {
            resize();
            initParticles();
        });

        // Pause when tab hidden
        const handleVisibility = () => {
            if (document.hidden) {
                cancelAnimationFrame(animationRef.current);
            } else {
                draw();
            }
        };
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            cancelAnimationFrame(animationRef.current);
            window.removeEventListener("resize", resize);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
            style={{ zIndex: 0 }}
        />
    );
}
