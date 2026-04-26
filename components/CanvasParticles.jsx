"use client";
import { useRef, useEffect } from "react";

const PARTICLE_COUNT = 350;
const COLORS = [
    [34,  211, 238], // cyan-400
    [168, 85,  247], // purple-500
    [99,  102, 241], // indigo-500
    [236, 72,  153], // pink-500
    [56,  189, 248], // sky-400
];

/** Build the heart-target positions for every particle. */
function buildHeartPositions(count, W, H) {
    const scale = Math.min(W, H) * 0.038; // responsive
    const cx = W / 2;
    const cy = H / 2 - H * 0.04;
    return Array.from({ length: count }, (_, i) => {
        const t = (i / count) * Math.PI * 2;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        return { x: cx + x * scale, y: cy + y * scale };
    });
}

export default function CanvasParticles() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        // ── State ────────────────────────────────────────────────────────────
        let W = window.innerWidth;
        let H = window.innerHeight;
        let mouse = { x: W / 2, y: H / 2 };
        let scrollProgress = 0;
        let heartPos = buildHeartPositions(PARTICLE_COUNT, W, H);
        let animId;

        const resize = () => {
            W = canvas.width  = window.innerWidth;
            H = canvas.height = window.innerHeight;
            heartPos = buildHeartPositions(PARTICLE_COUNT, W, H);
            particles.forEach((p, i) => {
                p.hx = heartPos[i].x;
                p.hy = heartPos[i].y;
            });
        };
        canvas.width  = W;
        canvas.height = H;

        // ── Particles ─────────────────────────────────────────────────────────
        const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
            const [r, g, b] = COLORS[i % COLORS.length];
            return {
                // random start positions
                rx: Math.random() * W,
                ry: Math.random() * H,
                // heart target
                hx: heartPos[i].x,
                hy: heartPos[i].y,
                // live position (starts at random)
                x: Math.random() * W,
                y: Math.random() * H,
                // core dot size (px)
                size: i % 7 === 0 ? 2.5 + Math.random()
                     : i % 3 === 0 ? 1.5 + Math.random() * 0.5
                     : 1 + Math.random() * 0.5,
                // colour
                r, g, b,
                // individual float parameters
                phase:      Math.random() * Math.PI * 2,
                floatSpd:   0.0008 + Math.random() * 0.0012,
                floatAmpX:  15 + Math.random() * 25,
                floatAmpY:  10 + Math.random() * 20,
                // opacity base
                alpha: 0.65 + Math.random() * 0.35,
            };
        });

        // ── Event handlers ────────────────────────────────────────────────────
        const onMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
        const onScroll    = () => {
            const max = document.body.scrollHeight - window.innerHeight;
            scrollProgress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
        };
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("scroll",    onScroll,    { passive: true });
        window.addEventListener("resize",    resize);

        // ── Animation loop ────────────────────────────────────────────────────
        const REPEL_RADIUS  = 110;  // px — mouse repulsion zone
        const REPEL_STRENGTH = 10;  // px  — max push

        const animate = (ts) => {
            // Dark background with slight trail (motion blur feel)
            ctx.fillStyle = "rgba(11,12,16,0.38)";
            ctx.fillRect(0, 0, W, H);

            const prog = scrollProgress;

            for (const p of particles) {
                // ── Target interpolation (random ↔ heart) ──────────────────
                const tx = p.rx + (p.hx - p.rx) * prog;
                const ty = p.ry + (p.hy - p.ry) * prog;

                // Float gently when scattered; stop when heart forms
                const floatScale = 1 - Math.min(prog * 1.8, 1);
                const fx = Math.sin(ts * p.floatSpd + p.phase)           * p.floatAmpX * floatScale;
                const fy = Math.cos(ts * p.floatSpd * 0.7 + p.phase + 1) * p.floatAmpY * floatScale;

                // ── Mouse repulsion ─────────────────────────────────────────
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                let rx = 0, ry = 0;
                if (dist < REPEL_RADIUS) {
                    const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) ** 2;
                    rx = (dx / dist) * force * REPEL_STRENGTH;
                    ry = (dy / dist) * force * REPEL_STRENGTH;
                }

                // ── Smooth spring towards target + float + repel ────────────
                p.x += (tx + fx + rx - p.x) * 0.06;
                p.y += (ty + fy + ry - p.y) * 0.06;

                // ── Draw glow halo ──────────────────────────────────────────
                const glowR = p.size * 8;
                const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
                grad.addColorStop(0,   `rgba(${p.r},${p.g},${p.b},${p.alpha * 0.6})`);
                grad.addColorStop(0.4, `rgba(${p.r},${p.g},${p.b},${p.alpha * 0.15})`);
                grad.addColorStop(1,   `rgba(${p.r},${p.g},${p.b},0)`);
                ctx.beginPath();
                ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();

                // ── Draw solid core ─────────────────────────────────────────
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.alpha})`;
                ctx.fill();
            }

            animId = requestAnimationFrame(animate);
        };

        animId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("scroll",    onScroll);
            window.removeEventListener("resize",    resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0"
            style={{ display: "block", background: "#0B0C10" }}
        />
    );
}
