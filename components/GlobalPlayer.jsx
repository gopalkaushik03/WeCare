"use client";
import { motion } from "framer-motion";
import { Music, ExternalLink } from "lucide-react";
import { useMood } from "@/context/MoodContext";

const MOOD_META = {
    happy: { label: "Happy Hits", accent: "text-yellow-400", bg: "bg-yellow-400" },
    calm: { label: "Deep Calm", accent: "text-teal-400", bg: "bg-teal-400" },
    neutral: { label: "Lofi Beats", accent: "text-cyan-400", bg: "bg-cyan-400" },
    sad: { label: "Gentle Comfort", accent: "text-blue-400", bg: "bg-blue-400" },
    anxious: { label: "Calm the Mind", accent: "text-purple-400", bg: "bg-purple-400" },
};

const MOOD_PLAYLIST_IDS = {
    happy: "37i9dQZF1DXdPec7aLTmlC",
    calm: "37i9dQZF1DWZqd5JICZI0u",
    neutral: "37i9dQZF1DXcBWIGoYBM5M",
    sad: "37i9dQZF1DX7qK8ma5wgG1",
    anxious: "37i9dQZF1DWZqd5JICZI0u",
};

export default function GlobalPlayer() {
    const { rawMood } = useMood();
    const meta = MOOD_META[rawMood] || MOOD_META.neutral;
    const playlistId = MOOD_PLAYLIST_IDS[rawMood] || MOOD_PLAYLIST_IDS.neutral;

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, type: "spring" }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
        >
            <div className="bg-[#0B0C10]/90 backdrop-blur-xl border border-white/10 rounded-full pl-3 pr-5 py-2 shadow-2xl flex items-center gap-3">
                {/* Spinning disc icon */}
                <div className={`w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0`}>
                    <Music className={`w-4 h-4 ${meta.accent}`} />
                </div>

                {/* Track info */}
                <div className="flex flex-col overflow-hidden w-28">
                    <span className={`text-xs font-bold truncate ${meta.accent}`}>
                        {meta.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Sonic Therapy
                    </span>
                </div>

                {/* Divider */}
                <div className="h-6 w-px bg-white/10" />

                {/* Animated waveform (decorative, always playing feel) */}
                <span className="flex gap-0.5 h-3 items-end">
                    {[1.1, 0.85, 1.3].map((dur, i) => (
                        <motion.span
                            key={i}
                            animate={{ scaleY: [0.3, 1, 0.3] }}
                            transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}
                            className={`w-1 ${meta.bg} rounded-full h-full block origin-bottom opacity-80`}
                        />
                    ))}
                </span>

                {/* External link to open in Spotify */}
                <a
                    href={`https://open.spotify.com/playlist/${playlistId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-white transition-colors"
                    title="Open in Spotify"
                >
                    <ExternalLink className="w-4 h-4" />
                </a>
            </div>
        </motion.div>
    );
}
