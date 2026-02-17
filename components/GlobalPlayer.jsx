"use client";
import { useState } from "react";
import { Play, Pause, SkipForward, Music } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GlobalPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, type: "spring" }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
        >
            <div className="bg-[#0B0C10]/80 backdrop-blur-xl border border-white/10 rounded-full pl-2 pr-6 py-2 shadow-2xl flex items-center gap-4 hover:scale-105 transition-transform">

                {/* Album Art / Icon */}
                <div className={`w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center ${isPlaying ? "animate-spin-slow" : ""}`}>
                    <Music className="w-4 h-4 text-primary" />
                </div>

                {/* Controls & Info */}
                <div className="flex items-center gap-4">
                    <div className="flex flex-col w-32 overflow-hidden">
                        <span className="text-xs font-bold text-white whitespace-nowrap animate-marquee">
                            {isPlaying ? "Lo-Fi Beats to Relax To" : "Not Playing"}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Sonic Therapy</span>
                    </div>

                    <div className="h-6 w-px bg-white/10" />

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="text-white hover:text-primary transition-colors"
                        >
                            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                        </button>
                        <button className="text-muted-foreground hover:text-white transition-colors">
                            <SkipForward className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Waveform Visualization */}
                {isPlaying && (
                    <div className="flex items-end gap-1 h-4 ml-2">
                        {[1, 2, 3].map((i) => (
                            <motion.div
                                key={i}
                                animate={{ height: ["20%", "100%", "20%"] }}
                                transition={{
                                    duration: 0.5 + i * 0.1,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="w-1 bg-primary rounded-full"
                            />
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
