"use client";
import { Component } from "react";

/* ─── CSS-only particle fallback ───────────────────────────────────────────
   120 absolutely-positioned glowing dots — deterministic positions, varied
   sizes/colours, staggered float + twinkle animations.
   Zero WebGL, works on every browser.
   ───────────────────────────────────────────────────────────────────────── */
function CSSParticles() {
    const particles = Array.from({ length: 120 }, (_, i) => {
        // Use golden-angle spacing for even distribution
        const x = ((Math.sin(i * 137.508 * (Math.PI / 180)) + 1) / 2) * 100;
        const y = ((Math.cos(i * 97.32 * (Math.PI / 180)) + 1) / 2) * 100;
        // Sizes: mix of tiny stars and larger glowing orbs
        const size = i % 7 === 0 ? 6 + (i % 3)     // large orb  (6-8 px)
                   : i % 3 === 0 ? 3 + (i % 3)     // medium     (3-5 px)
                   :               2;               // small star (2 px)
        const duration  = 5 + (i % 9);
        const delay     = -(i * 0.35);
        const twinkle   = 3 + (i % 5);
        // Cyan / purple / indigo / pink palette
        const palette = [
            "rgba(34,211,238,0.9)",   // cyan-400
            "rgba(168,85,247,0.85)",  // purple-500
            "rgba(99,102,241,0.8)",   // indigo-500
            "rgba(236,72,153,0.75)",  // pink-500
            "rgba(34,211,238,0.6)",   // cyan dim
        ];
        const color = palette[i % palette.length];
        const glow  = `0 0 ${size * 4}px ${color}, 0 0 ${size * 8}px ${color}`;

        return { x, y, size, duration, delay, twinkle, color, glow };
    });

    return (
        <div className="fixed inset-0 z-0 bg-[#0B0C10] overflow-hidden">
            {/* background gradient glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-[#0B0C10] to-purple-900/30" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

            {/* particles */}
            {particles.map((p, i) => (
                <div
                    key={i}
                    style={{
                        position: "absolute",
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width:  `${p.size}px`,
                        height: `${p.size}px`,
                        borderRadius: "50%",
                        background: p.color,
                        boxShadow: p.glow,
                        animation: i % 2 === 0
                            ? `cssFloat ${p.duration}s ease-in-out ${p.delay}s infinite`
                            : `cssFloat ${p.duration}s ease-in-out ${p.delay}s infinite, cssTwinkle ${p.twinkle}s ease-in-out ${p.delay}s infinite`,
                    }}
                />
            ))}

            <style>{`
                @keyframes cssFloat {
                    0%   { transform: translateY(0px)   scale(1);    }
                    50%  { transform: translateY(-30px) scale(1.15); }
                    100% { transform: translateY(0px)   scale(1);    }
                }
                @keyframes cssTwinkle {
                    0%, 100% { opacity: 0.9; }
                    50%      { opacity: 0.3; }
                }
            `}</style>
        </div>
    );
}
export { CSSParticles };


export default class SceneErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.warn("[SceneErrorBoundary] 3D scene crashed — using CSS particle fallback.", error);
    }

    render() {
        if (this.state.hasError) {
            return <CSSParticles />;
        }
        return this.props.children;
    }
}

