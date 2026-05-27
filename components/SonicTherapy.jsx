"use client";
import { useState, useEffect } from "react";
import { Headphones, ExternalLink, Music2 } from "lucide-react";
import { useMood } from "@/context/MoodContext";
import { motion, AnimatePresence } from "framer-motion";

const MOOD_PLAYLISTS = {
    happy: {
        id: "37i9dQZF1DXdPec7aLTmlC",
        label: "Happy Hits",
        desc: "Feel-good energy to keep you glowing",
        emoji: "☀️",
        accent: "#fbbf24",
        glow: "rgba(251,191,36,0.15)",
        border: "rgba(251,191,36,0.2)",
    },
    calm: {
        id: "37i9dQZF1DWZqd5JICZI0u",
        label: "Deep Calm",
        desc: "Breathe slow, drift easy",
        emoji: "🌿",
        accent: "#2dd4bf",
        glow: "rgba(45,212,191,0.15)",
        border: "rgba(45,212,191,0.2)",
    },
    neutral: {
        id: "37i9dQZF1DXcBWIGoYBM5M",
        label: "Lofi Beats",
        desc: "Focus mode, steady rhythm",
        emoji: "🎧",
        accent: "#67e8f9",
        glow: "rgba(103,232,249,0.15)",
        border: "rgba(103,232,249,0.2)",
    },
    sad: {
        id: "37i9dQZF1DX7qK8ma5wgG1",
        label: "Gentle Comfort",
        desc: "It's okay to feel — you're not alone",
        emoji: "💙",
        accent: "#93c5fd",
        glow: "rgba(147,197,253,0.15)",
        border: "rgba(147,197,253,0.2)",
    },
    anxious: {
        id: "37i9dQZF1DWZqd5JICZI0u",
        label: "Calm the Mind",
        desc: "Let the sound quiet the noise",
        emoji: "🫶",
        accent: "#c084fc",
        glow: "rgba(192,132,252,0.15)",
        border: "rgba(192,132,252,0.2)",
    },
};

const getMoodConfig = (raw) => MOOD_PLAYLISTS[raw] || MOOD_PLAYLISTS.neutral;

// Animated EQ bars
function EQBars({ accent }) {
    return (
        <span className="flex items-end gap-[2px] h-4">
            {[
                { anim: { scaleY: [0.3, 1, 0.4] },    dur: 1.1 },
                { anim: { scaleY: [0.7, 0.2, 1] },    dur: 0.8 },
                { anim: { scaleY: [0.5, 1, 0.3] },    dur: 1.3 },
                { anim: { scaleY: [1, 0.3, 0.8] },    dur: 0.9 },
            ].map((b, i) => (
                <motion.span
                    key={i}
                    animate={b.anim}
                    transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut" }}
                    className="w-[3px] rounded-full origin-bottom"
                    style={{ height: "100%", background: accent }}
                />
            ))}
        </span>
    );
}

export default function SonicTherapy() {
    const { rawMood } = useMood();
    const [mounted, setMounted] = useState(false);
    const [key, setKey] = useState(0);

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => { setKey(k => k + 1); }, [rawMood]);

    if (!mounted) {
        return (
            <div className="h-full flex flex-col gap-3 animate-pulse">
                <div className="h-4 bg-white/5 rounded w-20" />
                <div className="h-4 bg-white/5 rounded w-32" />
                <div className="flex-1 bg-white/5 rounded-2xl" />
            </div>
        );
    }

    const cfg = getMoodConfig(rawMood);
    const spotifyUrl = `https://open.spotify.com/playlist/${cfg.id}`;

    return (
        <div className="h-full flex flex-col gap-3 relative overflow-hidden">
            {/* Ambient glow */}
            <motion.div
                className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
                animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ background: `radial-gradient(circle, ${cfg.glow}, transparent 70%)`, filter: "blur(20px)" }}
            />

            {/* Header row */}
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: `${cfg.accent}15`, border: `1px solid ${cfg.border}` }}>
                        <Headphones className="w-4 h-4" style={{ color: cfg.accent }} />
                    </div>
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: `${cfg.accent}90` }}>
                            Sonic Therapy
                        </p>
                        <p className="text-xs font-bold text-white/80 leading-none">Music for your mood</p>
                    </div>
                </div>
                <EQBars accent={cfg.accent} />
            </div>

            {/* Mood label pill */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={rawMood}
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl w-fit relative z-10"
                    style={{ background: `${cfg.accent}10`, border: `1px solid ${cfg.border}` }}
                >
                    <span className="text-sm">{cfg.emoji}</span>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider leading-none" style={{ color: cfg.accent }}>
                            {cfg.label}
                        </p>
                        <p className="text-[9px] text-white/40 leading-none mt-0.5">{cfg.desc}</p>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Spotify embed */}
            <div
                key={key}
                className="flex-1 rounded-2xl overflow-hidden relative z-10"
                style={{ border: `1px solid ${cfg.border}`, minHeight: 80 }}
            >
                <iframe
                    src={`https://open.spotify.com/embed/playlist/${cfg.id}?utm_source=generator&theme=0`}
                    width="100%"
                    height="100%"
                    style={{ minHeight: 80, display: "block" }}
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    className="border-none"
                />
            </div>

            {/* Footer link */}
            <a
                href={spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-[11px] font-semibold transition-opacity hover:opacity-70 relative z-10"
                style={{ color: cfg.accent }}
            >
                Open full playlist <ExternalLink className="w-3 h-3" />
            </a>

            {rawMood === "neutral" && (
                <p className="text-[9px] text-center text-white/20 -mt-1 relative z-10">
                    Log your mood for a personalized mix
                </p>
            )}
        </div>
    );
}
