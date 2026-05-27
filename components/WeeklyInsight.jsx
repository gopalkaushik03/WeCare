"use client";
import React, { useState, useEffect, useRef } from "react";
import { Lightbulb, Quote, X, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── 7 comeback / motivational quotes ──────────────────────────────────────
const QUOTES = [
    {
        text: "You didn't come this far to only come this far.",
        author: "Unknown",
        accent: "#a78bfa",       // violet
        glow: "rgba(167,139,250,0.15)",
        tag: "Keep Going",
    },
    {
        text: "The comeback is always stronger than the setback.",
        author: "Unknown",
        accent: "#22d3ee",       // cyan
        glow: "rgba(34,211,238,0.15)",
        tag: "Resilience",
    },
    {
        text: "Hard days are the best days — that's when champions are made.",
        author: "Gabby Douglas",
        accent: "#fbbf24",       // amber
        glow: "rgba(251,191,36,0.15)",
        tag: "Champion",
    },
    {
        text: "Fall seven times, stand up eight.",
        author: "Japanese Proverb",
        accent: "#34d399",       // emerald
        glow: "rgba(52,211,153,0.15)",
        tag: "Perseverance",
    },
    {
        text: "Rock bottom became the solid foundation on which I rebuilt my life.",
        author: "J.K. Rowling",
        accent: "#fb7185",       // rose
        glow: "rgba(251,113,133,0.15)",
        tag: "Rebuild",
    },
    {
        text: "You are allowed to be both a masterpiece and a work in progress.",
        author: "Sophia Bush",
        accent: "#818cf8",       // indigo
        glow: "rgba(129,140,248,0.15)",
        tag: "Growth",
    },
    {
        text: "Every storm runs out of rain. Every dark night turns into day.",
        author: "Maya Angelou",
        accent: "#38bdf8",       // sky
        glow: "rgba(56,189,248,0.15)",
        tag: "Hope",
    },
];

// ─── Time-aware weekly insight ──────────────────────────────────────────────
function getInsight() {
    const h = new Date().getHours();
    if (h < 10) return {
        title: "Morning Clarity",
        text: "Start with intention. A 5-minute focus session now sets the tone for the entire day.",
        tag: "Morning Ritual",
        cta: "Start session",
    };
    if (h > 20) return {
        title: "Wind Down Protocol",
        text: "Disconnect from screens. A breathing exercise now can improve your sleep quality by 30%.",
        tag: "Evening Wind-down",
        cta: "Try 4-7-8",
    };
    return {
        title: "The 4-7-8 Breathing Technique",
        text: "Inhale 4s · hold 7s · exhale 8s. This simple pattern reduces anxiety and deepens sleep.",
        tag: "Mindfulness",
        cta: "Try it now",
    };
}

export default function WeeklyInsight() {
    // Pick a random quote once on mount so it changes each visit/login
    const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    const [hovered, setHovered] = useState(false);
    const [isBreathing, setIsBreathing] = useState(false);
    const insight = getInsight();
    const timerRef = useRef(null);

    // Slight delay before dismissing so quick mouse passes don't flicker
    const handleMouseEnter = () => {
        clearTimeout(timerRef.current);
        setHovered(true);
    };
    const handleMouseLeave = () => {
        timerRef.current = setTimeout(() => setHovered(false), 120);
    };

    useEffect(() => () => clearTimeout(timerRef.current), []);

    return (
        <>
            {/* ── Card shell ─────────────────────────────────────── */}
            <div
                className="relative h-full flex flex-col overflow-hidden select-none"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Dynamic accent glow that matches the quote color */}
                <motion.div
                    className="pointer-events-none absolute inset-0 rounded-2xl"
                    animate={{ background: quote.glow }}
                    transition={{ duration: 0.8 }}
                    style={{ filter: "blur(20px)", opacity: 0.6 }}
                />

                {/* Shimmer border on hover */}
                <motion.div
                    className="pointer-events-none absolute inset-0 rounded-2xl"
                    style={{
                        border: "1px solid transparent",
                        backgroundClip: "padding-box",
                    }}
                    animate={{
                        boxShadow: hovered
                            ? `0 0 0 1px ${quote.accent}55, 0 8px 40px ${quote.glow}`
                            : `0 0 0 1px transparent`,
                    }}
                    transition={{ duration: 0.35 }}
                />

                {/* ── QUOTE LAYER (always visible) ────────────────── */}
                <div className="relative z-10 flex flex-col h-full">
                    {/* Tag pill */}
                    <div className="flex items-center justify-between mb-4">
                        <motion.div
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                            style={{
                                background: `${quote.accent}18`,
                                color: quote.accent,
                                border: `1px solid ${quote.accent}30`,
                            }}
                        >
                            <Zap className="w-2.5 h-2.5" />
                            {quote.tag}
                        </motion.div>
                        <span
                            className="text-[9px] uppercase tracking-widest font-medium opacity-40"
                            style={{ color: quote.accent }}
                        >
                            hover for insight
                        </span>
                    </div>

                    {/* Big quote mark */}
                    <Quote
                        className="w-7 h-7 mb-1 opacity-20"
                        style={{ color: quote.accent }}
                    />

                    {/* Quote text */}
                    <p
                        className="text-sm font-semibold leading-relaxed text-white flex-1"
                        style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
                    >
                        {quote.text}
                    </p>

                    {/* Author */}
                    <p
                        className="mt-3 text-[11px] font-bold uppercase tracking-widest"
                        style={{ color: quote.accent, opacity: 0.75 }}
                    >
                        — {quote.author}
                    </p>
                </div>

                {/* ══ WEEKLY INSIGHT OVERLAY — slides up on hover ══════ */}
                <AnimatePresence>
                    {hovered && (
                        <motion.div
                            key="insight-overlay"
                            initial={{ y: "100%", opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 380,
                                damping: 36,
                                mass: 0.9,
                            }}
                            className="absolute inset-0 z-20 flex flex-col rounded-2xl overflow-hidden"
                            style={{
                                background:
                                    "linear-gradient(160deg, rgba(15,15,25,0.97) 0%, rgba(20,20,35,0.97) 100%)",
                                backdropFilter: "blur(24px) saturate(1.6)",
                                WebkitBackdropFilter: "blur(24px) saturate(1.6)",
                                border: `1px solid rgba(251,191,36,0.2)`,
                                boxShadow: "0 -8px 40px rgba(251,191,36,0.1)",
                            }}
                        >
                            {/* Top accent line */}
                            <div
                                className="h-0.5 w-full flex-shrink-0"
                                style={{
                                    background:
                                        "linear-gradient(90deg, transparent, #fbbf24, transparent)",
                                }}
                            />

                            <div className="flex flex-col h-full p-5">
                                {/* Header */}
                                <div className="flex items-center gap-2 mb-4">
                                    <div
                                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ background: "rgba(251,191,36,0.15)" }}
                                    >
                                        <Lightbulb className="w-4 h-4 text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-amber-400/60">
                                            Weekly Insight
                                        </p>
                                        <p className="text-xs font-bold text-white/90 leading-none mt-0.5">
                                            {insight.tag}
                                        </p>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="w-full h-px bg-white/5 mb-4" />

                                {/* Content */}
                                <h3 className="text-sm font-bold text-white leading-snug mb-2">
                                    {insight.title}
                                </h3>
                                <p className="text-xs text-white/55 leading-relaxed flex-1">
                                    {insight.text}
                                </p>

                                {/* CTA */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsBreathing(true);
                                    }}
                                    className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.1))",
                                        border: "1px solid rgba(251,191,36,0.3)",
                                        color: "#fbbf24",
                                        boxShadow: "0 4px 20px rgba(251,191,36,0.1)",
                                    }}
                                >
                                    {insight.cta} →
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Breathing Modal ──────────────────────────────────── */}
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
                                className="absolute top-0 right-0 p-4 text-white/40 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {/* Breathing glow */}
                            <motion.div
                                animate={{ scale: [1, 1.5, 1.5, 1], opacity: [0.25, 0.55, 0.55, 0.25] }}
                                transition={{ duration: 19, repeat: Infinity, times: [0, 0.21, 0.58, 1], ease: "easeInOut" }}
                                className="absolute inset-0 bg-primary/20 rounded-full blur-3xl"
                            />

                            {/* Circle */}
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

                            {/* Phase labels */}
                            <div className="mt-12 text-center relative h-8 w-full">
                                <motion.p
                                    animate={{ opacity: [0, 1, 1, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, repeatDelay: 15 }}
                                    className="text-xl font-medium text-white absolute inset-x-0 top-0"
                                >Inhale Deeply (4s)</motion.p>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0, 0, 1, 1, 0] }}
                                    transition={{ duration: 19, repeat: Infinity, times: [0, 0.21, 0.22, 0.57, 0.58] }}
                                    className="text-xl font-medium text-white absolute inset-x-0 top-0"
                                >Hold Breath (7s)</motion.p>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0, 0, 1, 1, 0] }}
                                    transition={{ duration: 19, repeat: Infinity, times: [0, 0.58, 0.59, 0.99, 1] }}
                                    className="text-xl font-medium text-white absolute inset-x-0 top-0"
                                >Exhale Slowly (8s)</motion.p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
