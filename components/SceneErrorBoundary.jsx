"use client";
import { Component } from "react";

/* ─── CSS-only particle fallback ───────────────────────────────────────────
   Renders 60 absolutely-positioned dots with randomised positions, sizes,
   colours (cyan / purple mix) and staggered float animations.
   Works on every browser — no WebGL, no Canvas, no external deps.
   ───────────────────────────────────────────────────────────────────────── */
function CSSParticles() {
    const particles = Array.from({ length: 60 }, (_, i) => {
        const x = Math.floor(Math.sin(i * 137.508) * 50 + 50);   // deterministic
        const y = Math.floor(Math.cos(i * 137.508) * 50 + 50);
        const size = (i % 4) + 1;
        const duration = 6 + (i % 8);
        const delay = -(i * 0.4);
        // alternate cyan / purple
        const color = i % 3 === 0
            ? "rgba(34,211,238,0.7)"   // cyan-400
            : i % 3 === 1
                ? "rgba(168,85,247,0.7)"  // purple-500
                : "rgba(99,102,241,0.6)"; // indigo-500

        return { x, y, size, duration, delay, color };
    });

    return (
        <div className="fixed inset-0 z-0 bg-[#0B0C10] overflow-hidden">
            {/* subtle gradient glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-[#0B0C10] to-purple-900/20" />

            {/* particles */}
            {particles.map((p, i) => (
                <div
                    key={i}
                    style={{
                        position: "absolute",
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        borderRadius: "50%",
                        background: p.color,
                        boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
                        animation: `cssParticleFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
                    }}
                />
            ))}

            <style>{`
                @keyframes cssParticleFloat {
                    0%   { transform: translateY(0px) scale(1);   opacity: 0.8; }
                    50%  { transform: translateY(-18px) scale(1.2); opacity: 1;   }
                    100% { transform: translateY(0px) scale(1);   opacity: 0.8; }
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

