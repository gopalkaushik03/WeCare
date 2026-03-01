"use client";
import { useState, useEffect } from "react";
import { Headphones, Music2, ChevronRight, ExternalLink } from "lucide-react";
import { useMood } from "@/context/MoodContext";
import { motion, AnimatePresence } from "framer-motion";

// Spotify playlist IDs + metadata per mood
const MOOD_PLAYLISTS = {
    happy: {
        id: "37i9dQZF1DXdPec7aLTmlC",
        label: "Happy Hits",
        desc: "Feel-good energy to keep you glowing ☀️",
        color: "from-yellow-500/20 to-amber-400/10",
        accent: "text-yellow-400",
        border: "border-yellow-500/20",
    },
    calm: {
        id: "37i9dQZF1DWZqd5JICZI0u",
        label: "Deep Calm",
        desc: "Breathe slow, drift easy 🌿",
        color: "from-teal-500/20 to-cyan-400/10",
        accent: "text-teal-400",
        border: "border-teal-500/20",
    },
    neutral: {
        id: "37i9dQZF1DXcBWIGoYBM5M",
        label: "Lofi Beats",
        desc: "Focus mode, steady rhythm 🎧",
        color: "from-cyan-500/20 to-blue-400/10",
        accent: "text-cyan-400",
        border: "border-cyan-500/20",
    },
    sad: {
        id: "37i9dQZF1DX7qK8ma5wgG1",
        label: "Gentle Comfort",
        desc: "It's okay to feel — you're not alone 💙",
        color: "from-blue-500/20 to-indigo-400/10",
        accent: "text-blue-400",
        border: "border-blue-500/20",
    },
    anxious: {
        id: "37i9dQZF1DWZqd5JICZI0u",
        label: "Calm the Mind",
        desc: "Let the sound quiet the noise 🫶",
        color: "from-purple-500/20 to-violet-400/10",
        accent: "text-purple-400",
        border: "border-purple-500/20",
    },
};

// Fallback order so we always have a valid playlist
const getMoodConfig = (rawMood) =>
    MOOD_PLAYLISTS[rawMood] || MOOD_PLAYLISTS.neutral;

export default function SonicTherapy() {
    const { rawMood } = useMood();
    const [mounted, setMounted] = useState(false);
    const [key, setKey] = useState(0); // force iframe reload on mood change

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // Reload the embed whenever mood changes
        setKey((k) => k + 1);
    }, [rawMood]);

    if (!mounted) {
        return (
            <div className="h-full flex flex-col gap-3 p-1 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-24" />
                <div className="h-4 bg-white/5 rounded w-full" />
                <div className="flex-1 bg-white/5 rounded-xl" />
            </div>
        );
    }

    const config = getMoodConfig(rawMood);
    const spotifyUrl = `https://open.spotify.com/playlist/${config.id}`;

    return (
        <div className="h-full flex flex-col gap-3 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`bg-white/10 p-2 rounded-full ${config.accent}`}>
                        <Headphones className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-sm text-foreground">Sonic Therapy</span>
                </div>

                {/* Animated bars — always show as decorative */}
                <span className="flex gap-0.5 h-3 items-end opacity-70">
                    <motion.span
                        animate={{ scaleY: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                        className={`w-1 ${config.accent.replace("text-", "bg-")} rounded-full h-full block origin-bottom`}
                    />
                    <motion.span
                        animate={{ scaleY: [0.6, 0.3, 0.9, 0.6] }}
                        transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                        className={`w-1 ${config.accent.replace("text-", "bg-")} rounded-full h-full block origin-bottom`}
                    />
                    <motion.span
                        animate={{ scaleY: [1, 0.4, 0.7, 1] }}
                        transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
                        className={`w-1 ${config.accent.replace("text-", "bg-")} rounded-full h-full block origin-bottom`}
                    />
                </span>
            </div>

            {/* Mood Label */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={rawMood}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                >
                    <p className={`text-xs uppercase tracking-wider font-bold mb-0.5 ${config.accent}`}>
                        {config.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                        {config.desc}
                    </p>
                </motion.div>
            </AnimatePresence>

            {/* Spotify Embed — this actually produces REAL audio */}
            <div
                key={key}
                className={`rounded-xl overflow-hidden border ${config.border} flex-1 min-h-[80px]`}
            >
                <iframe
                    src={`https://open.spotify.com/embed/playlist/${config.id}?utm_source=generator&theme=0`}
                    width="100%"
                    height="100%"
                    style={{ minHeight: 80 }}
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    className="border-none block"
                />
            </div>

            {/* Open Full Playlist */}
            <a
                href={spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 text-xs font-semibold ${config.accent} hover:opacity-80 transition-opacity`}
            >
                Open full playlist <ExternalLink className="w-3 h-3" />
            </a>

            {/* Mood hint — only if rawMood is neutral (not yet logged) */}
            {rawMood === "neutral" && (
                <p className="text-[10px] text-center text-muted-foreground/50 -mt-1">
                    Log your mood to get a personalised mix
                </p>
            )}

            {/* Glow */}
            <div className={`absolute -bottom-8 -right-8 w-28 h-28 rounded-full blur-3xl pointer-events-none bg-gradient-to-br ${config.color}`} />
        </div>
    );
}
