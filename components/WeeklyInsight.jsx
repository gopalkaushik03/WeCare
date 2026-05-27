"use client";
import React, { useState, useEffect, useRef } from "react";
import { Lightbulb, Quote, X, Sparkles, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Comeback / Motivational Quotes ────────────────────────────────────────
const QUOTES = [
    {
        text: "You didn't come this far to only come this far.",
        author: "Unknown",
        color: "from-violet-500/20 to-fuchsia-500/20",
        accent: "#a78bfa",
    },
    {
        text: "The comeback is always stronger than the setback.",
        author: "Unknown",
        color: "from-cyan-500/20 to-blue-500/20",
        accent: "#67e8f9",
    },
    {
        text: "Hard days are the best days because that's when champions are made.",
        author: "Gabby Douglas",
        color: "from-amber-500/20 to-orange-500/20",
        accent: "#fbbf24",
    },
    {
        text: "Fall seven times, stand up eight.",
        author: "Japanese Proverb",
        color: "from-emerald-500/20 to-teal-500/20",
        accent: "#34d399",
    },
    {
        text: "Rock bottom became the solid foundation on which I rebuilt my life.",
        author: "J.K. Rowling",
        color: "from-rose-500/20 to-pink-500/20",
        accent: "#fb7185",
    },
    {
        text: "It's not about how hard you hit. It's about how hard you can get hit and keep moving forward.",
        author: "Rocky Balboa",
        color: "from-indigo-500/20 to-purple-500/20",
        accent: "#818cf8",
    },
    {
        text: "Every storm runs out of rain. Keep going.",
        author: "Maya Angelou",
        color: "from-sky-500/20 to-cyan-500/20",
        accent: "#38bdf8",
    },
];

// ─── Weekly Insights (time-aware) ──────────────────────────────────────────
function getInsight() {
    const hour = new Date().getHours();
    if (hour < 10) return {
        title: "Morning Clarity",
        text: "Start your day with intention. A 5-minute focus session now sets the tone for the entire day.",
        tag: "Morning Ritual",
        action: "Start session →",
    };
    if (hour > 20) return {
        title: "Wind Down Protocol",
        text: "Disconnect from screens. A short breathing exercise now can improve your sleep quality by 30%.",
        tag: "Evening Wind-down",
        action: "Try 4-7-8 →",
    };
    return {
        title: "The 4-7-8 Breathing Technique",
        text: "Inhale for 4 seconds, hold for 7, and exhale for 8. This simple pattern reduces anxiety and helps you sleep better.",
        tag: "Mindfulness Tip",
        action: "Try it now →",
    };
}

export default function WeeklyInsight() {
    const [isFlipped, setIsFlipped] = useState(false);
    const [quoteIdx, setQuoteIdx] = useState(0);
    const [isBreathing, setIsBreathing] = useState(false);
    const [autoPlay, setAutoPlay] = useState(true);
    const intervalRef = useRef(null);
    const insight = getInsight();
    const quote = QUOTES[quoteIdx];

    // Auto-cycle quotes every 5s when not flipped
    useEffect(() => {
        if (autoPlay && !isFlipped) {
            intervalRef.current = setInterval(() => {
                setQuoteIdx((i) => (i + 1) % QUOTES.length);
            }, 5000);
        }
        return () => clearInterval(intervalRef.current);
    }, [autoPlay, isFlipped]);

    const nextQuote = (e) => {
        e.stopPropagation();
        setAutoPlay(false);
        setQuoteIdx((i) => (i + 1) % QUOTES.length);
    };

    return (
        <>
            {/* ── Card container with perspective ── */}
            <div
                className="h-full w-full"
                style={{ perspective: "1000px" }}
                onMouseEnter={() => setIsFlipped(true)}
                onMouseLeave={() => setIsFlipped(false)}
            >
                <motion.div
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
                    style={{ transformStyle: "preserve-3d", position: "relative", height: "100%", width: "100%" }}
                >
                    {/* ══════════ FRONT — Motivational Quote ══════════ */}
                    <div
                        style={{
                            backfaceVisibility: "hidden",
                            WebkitBackfaceVisibility: "hidden",
                            position: "absolute",
                            inset: 0,
                        }}
                        className="h-full flex flex-col"
                    >
                        {/* Gradient glow background */}
                        <motion.div
                            key={quoteIdx + "-glow"}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6 }}
                            className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${quote.color} pointer-events-none`}
                        />

                        {/* Header */}
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="flex items-center gap-2" style={{ color: quote.accent }}>
                                <Sparkles className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Comeback Quote</span>
                            </div>
                            {/* Dot indicators */}
                            <div className="flex items-center gap-1">
                                {QUOTES.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={(e) => { e.stopPropagation(); setAutoPlay(false); setQuoteIdx(i); }}
                                        className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                                        style={{
                                            background: i === quoteIdx ? quote.accent : "rgba(255,255,255,0.2)",
                                            transform: i === quoteIdx ? "scale(1.4)" : "scale(1)",
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Quote body */}
                        <div className="flex-1 flex flex-col justify-center relative z-10 overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={quoteIdx}
                                    initial={{ opacity: 0, y: 18 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -18 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                >
                                    {/* Big quote mark */}
                                    <Quote
                                        className="w-6 h-6 mb-2 opacity-40"
                                        style={{ color: quote.accent }}
                                    />
                                    <p className="text-sm font-semibold text-white leading-relaxed mb-3"
                                        style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>
                                        "{quote.text}"
                                    </p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest"
                                        style={{ color: quote.accent, opacity: 0.8 }}>
                                        — {quote.author}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10 relative z-10">
                            <span className="text-[9px] text-white/30 uppercase tracking-widest">
                                Hover for insight ✦
                            </span>
                            <button
                                onClick={nextQuote}
                                className="flex items-center gap-1 text-[10px] font-bold transition-all hover:scale-110 active:scale-95"
                                style={{ color: quote.accent }}
                            >
                                <RefreshCw className="w-3 h-3" />
                                Next
                            </button>
                        </div>
                    </div>

                    {/* ══════════ BACK — Weekly Insight ══════════ */}
                    <div
                        style={{
                            backfaceVisibility: "hidden",
                            WebkitBackfaceVisibility: "hidden",
                            transform: "rotateY(180deg)",
                            position: "absolute",
                            inset: 0,
                        }}
                        className="h-full flex flex-col"
                    >
                        {/* Subtle amber glow */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 pointer-events-none" />

                        {/* Header */}
                        <div className="flex items-center gap-2 mb-3 text-amber-400 relative z-10">
                            <Lightbulb className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Weekly Insight</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col justify-center relative z-10">
                            <h3 className="text-base font-bold text-white mb-2 leading-snug">
                                {insight.title}
                            </h3>
                            <p className="text-xs text-gray-300 leading-relaxed">
                                {insight.text}
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center relative z-10">
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                                {insight.tag}
                            </span>
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsBreathing(true); }}
                                className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-all flex items-center gap-1 group"
                            >
                                {insight.action}
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ── Breathing Modal (unchanged, triggered from back side) ── */}
            <AnimatePresence>
                {isBreathing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setIsBreathing(false)}
                    >
                        <div
                            className="relative w-full max-w-md aspect-square flex flex-col items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setIsBreathing(false)}
                                className="absolute top-0 right-0 p-4 text-white/50 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <motion.div
                                animate={{ scale: [1, 1.5, 1.5, 1], opacity: [0.3, 0.6, 0.6, 0.3] }}
                                transition={{ duration: 19, repeat: Infinity, times: [0, 0.21, 0.58, 1], ease: "easeInOut" }}
                                className="absolute inset-0 bg-primary/20 rounded-full blur-3xl"
                            />
                            <motion.div
                                animate={{ scale: [1, 1.3, 1.3, 1] }}
                                transition={{ duration: 19, repeat: Infinity, times: [0, 0.21, 0.58, 1], ease: "easeInOut" }}
                                className="w-48 h-48 rounded-full border-2 border-primary/30 flex items-center justify-center bg-black/40 backdrop-blur-xl"
                            >
                                <motion.div
                                    className="text-center"
                                    animate={{ opacity: [0, 1, 1, 0] }}
                                    transition={{ duration: 19, repeat: Infinity, times: [0, 0.1, 0.9, 1] }}
                                >
                                    <span className="text-4xl font-bold text-white block mb-1">4-7-8</span>
                                    <span className="text-xs text-primary uppercase tracking-widest">Breathe</span>
                                </motion.div>
                            </motion.div>

                            <div className="mt-12 text-center relative h-8 w-full">
                                <motion.p
                                    animate={{ opacity: [0, 1, 1, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, repeatDelay: 15 }}
                                    className="text-xl font-medium text-white absolute inset-x-0 top-0"
                                >
                                    Inhale Deeply (4s)
                                </motion.p>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0, 0, 1, 1, 0] }}
                                    transition={{ duration: 19, repeat: Infinity, times: [0, 0.21, 0.22, 0.57, 0.58] }}
                                    className="text-xl font-medium text-white absolute inset-x-0 top-0"
                                >
                                    Hold Breath (7s)
                                </motion.p>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0, 0, 1, 1, 0] }}
                                    transition={{ duration: 19, repeat: Infinity, times: [0, 0.58, 0.59, 0.99, 1] }}
                                    className="text-xl font-medium text-white absolute inset-x-0 top-0"
                                >
                                    Exhale Slowly (8s)
                                </motion.p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
