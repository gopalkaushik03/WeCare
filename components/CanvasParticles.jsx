"use client";
import { useRef, useEffect } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────
const COUNT        = 250;
const CONNECT_DIST = 120;   // px — draw line between particles closer than this
const MOUSE_RADIUS = 180;   // px — mouse influence zone
const REPEL_FORCE  = 40;    // px — how hard particles push away from cursor
const SPRING       = 0.13;  // how fast particles chase their target (higher = faster)
const DRIFT_SPEED  = 0.25;  // base particle drift speed (px / frame)

// Muted palette: subtle, matches #0B0C10 dark theme
// [r, g, b, alpha]
const PALETTE = [
    [147, 197, 253, 0.55],   // blue-300
    [167, 139, 250, 0.50],   // violet-400
    [96,  165, 250, 0.48],   // blue-400
    [52,  211, 153, 0.38],   // emerald-400  (accent)
    [255, 255, 255, 0.25],   // white star
    [196, 181, 253, 0.42],   // violet-300
    [125, 211, 252, 0.40],   // sky-300
];

// ─── Heart target positions ───────────────────────────────────────────────────
function heartTargets(n, W, H) {
    const s  = Math.min(W, H) * 0.034;
    const cx = W / 2, cy = H / 2 - H * 0.03;
    return Array.from({ length: n }, (_, i) => {
        const t = (i / n) * Math.PI * 2;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        return [cx + x * s, cy + y * s];
    });
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CanvasParticles() {
    const ref = useRef(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        // Shared mutable state
        let W = 0, H = 0;
        let hearts = [];
        let mouse = { x: -9999, y: -9999 };
        let scroll = 0;
        let raf;

        // ── Resize ─────────────────────────────────────────────────────────
        const resize = () => {
            W = canvas.width  = window.innerWidth;
            H = canvas.height = window.innerHeight;
            hearts = heartTargets(COUNT, W, H);
            pts.forEach((p, i) => { p.hx = hearts[i][0]; p.hy = hearts[i][1]; });
        };

        // ── Particles ──────────────────────────────────────────────────────
        // Initialise AFTER we know W/H
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
        hearts = heartTargets(COUNT, W, H);

        const pts = Array.from({ length: COUNT }, (_, i) => {
            const [r, g, b, a] = PALETTE[i % PALETTE.length];
            // Random start positions scattered over the canvas
            const rx = Math.random() * W;
            const ry = Math.random() * H;
            return {
                // Random home (idle drifting target)
                rx, ry,
                // Heart target (scroll target)
                hx: hearts[i][0],
                hy: hearts[i][1],
                // Live position
                x: rx, y: ry,
                // Velocity (for drifting)
                vx: (Math.random() - 0.5) * DRIFT_SPEED,
                vy: (Math.random() - 0.5) * DRIFT_SPEED,
                // Appearance
                r, g, b, a,
                size: 0.8 + Math.random() * 1.4,   // 0.8 – 2.2 px core
                // Phase for gentle wobble
                phase: Math.random() * Math.PI * 2,
            };
        });

        // ── Events ─────────────────────────────────────────────────────────
        const onMove   = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
        const onScroll = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            scroll = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("scroll",    onScroll, { passive: true });
        window.addEventListener("resize",    resize);

        // ── Draw loop ──────────────────────────────────────────────────────
        const draw = (ts) => {
            // Full clear — clean look (no trails)
            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = "#0B0C10";
            ctx.fillRect(0, 0, W, H);

            const prog = scroll;

            // ── Update positions ──────────────────────────────────────────
            for (const p of pts) {
                // Target: lerp between drifting home and heart
                const tx = p.rx + (p.hx - p.rx) * prog;
                const ty = p.ry + (p.hy - p.ry) * prog;

                // Drift only when scattered
                if (prog < 0.05) {
                    p.rx += p.vx;
                    p.ry += p.vy;
                    // Bounce off edges
                    if (p.rx < 0 || p.rx > W) p.vx *= -1;
                    if (p.ry < 0 || p.ry > H) p.vy *= -1;
                }

                // Mouse repulsion — fast spring
                const dx   = p.x - mouse.x;
                const dy   = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                let repX = 0, repY = 0;
                if (dist < MOUSE_RADIUS) {
                    const f = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) ** 2;
                    repX = (dx / dist) * f * REPEL_FORCE;
                    repY = (dy / dist) * f * REPEL_FORCE;
                }

                // Spring towards target (fast)
                p.x += (tx + repX - p.x) * SPRING;
                p.y += (ty + repY - p.y) * SPRING;
            }

            // ── Draw connection lines (constellation / frame effect) ───────
            ctx.save();
            for (let i = 0; i < COUNT; i++) {
                const a = pts[i];
                for (let j = i + 1; j < COUNT; j++) {
                    const b = pts[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const d  = Math.sqrt(dx * dx + dy * dy);
                    if (d < CONNECT_DIST) {
                        // Line alpha fades with distance; extra bright near heart
                        const baseFade  = 1 - d / CONNECT_DIST;
                        const heartBoost = prog * 0.5;          // brighter when heart forms
                        const lineAlpha  = (baseFade * 0.12 + heartBoost * baseFade * 0.25);
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = `rgba(147,197,253,${lineAlpha})`;
                        ctx.lineWidth   = 0.5;
                        ctx.stroke();
                    }
                }

                // Lines from mouse to nearby particles
                const mdx  = a.x - mouse.x;
                const mdy  = a.y - mouse.y;
                const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
                if (mdist < MOUSE_RADIUS * 0.75) {
                    const f = 1 - mdist / (MOUSE_RADIUS * 0.75);
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(167,139,250,${f * 0.35})`;
                    ctx.lineWidth   = 0.6;
                    ctx.stroke();
                }
            }
            ctx.restore();

            // ── Draw particles ────────────────────────────────────────────
            for (const p of pts) {
                // Soft glow (very small, not neon)
                const glowR = p.size * 5;
                const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
                g.addColorStop(0,   `rgba(${p.r},${p.g},${p.b},${p.a * 0.45})`);
                g.addColorStop(0.5, `rgba(${p.r},${p.g},${p.b},${p.a * 0.1})`);
                g.addColorStop(1,   `rgba(${p.r},${p.g},${p.b},0)`);
                ctx.beginPath();
                ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
                ctx.fillStyle = g;
                ctx.fill();

                // Crisp solid core
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.a})`;
                ctx.fill();
            }

            raf = requestAnimationFrame(draw);
        };

        raf = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("scroll",    onScroll);
            window.removeEventListener("resize",    resize);
        };
    }, []);

    return (
        <canvas
            ref={ref}
            style={{
                position: "fixed", inset: 0, zIndex: 0,
                display: "block", background: "#0B0C10",
                pointerEvents: "none",
            }}
        />
    );
}
