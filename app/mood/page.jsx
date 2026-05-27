"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Smile, Meh, Frown, CloudRain, Sun, Loader2, ArrowLeft, Brain, Sparkles, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { useMood } from "@/context/MoodContext";
import { REFLECTION_QUESTIONS, MICRO_INSIGHTS } from "@/lib/data";

// ─── Mood config — each has its own personality ──────────────────────────────
const MOODS = [
    {
        id: "happy",
        label: "Happy",
        emoji: "😊",
        icon: Smile,
        accent: "#fbbf24",
        glow: "rgba(251,191,36,0.2)",
        border: "rgba(251,191,36,0.3)",
        bg: "rgba(251,191,36,0.08)",
        tagline: "Radiating good energy",
    },
    {
        id: "calm",
        label: "Calm",
        emoji: "☀️",
        icon: Sun,
        accent: "#2dd4bf",
        glow: "rgba(45,212,191,0.2)",
        border: "rgba(45,212,191,0.3)",
        bg: "rgba(45,212,191,0.08)",
        tagline: "Still and grounded",
    },
    {
        id: "neutral",
        label: "Neutral",
        emoji: "😐",
        icon: Meh,
        accent: "#94a3b8",
        glow: "rgba(148,163,184,0.15)",
        border: "rgba(148,163,184,0.25)",
        bg: "rgba(148,163,184,0.07)",
        tagline: "Just getting through",
    },
    {
        id: "sad",
        label: "Sad",
        emoji: "😔",
        icon: Frown,
        accent: "#60a5fa",
        glow: "rgba(96,165,250,0.2)",
        border: "rgba(96,165,250,0.3)",
        bg: "rgba(96,165,250,0.08)",
        tagline: "It's okay to feel this",
    },
    {
        id: "anxious",
        label: "Anxious",
        emoji: "🌧️",
        icon: CloudRain,
        accent: "#c084fc",
        glow: "rgba(192,132,252,0.2)",
        border: "rgba(192,132,252,0.3)",
        bg: "rgba(192,132,252,0.08)",
        tagline: "You're not alone",
    },
];

// ─── Cognitive load hook ──────────────────────────────────────────────────────
function useCognitiveLoad() {
    const keystrokeTimesRef = useRef([]);
    const backspaceCountRef = useRef(0);
    const pauseCountRef = useRef(0);
    const lastKeystrokeRef = useRef(null);
    const [score, setScore] = useState(0);

    const onKeyDown = useCallback((e) => {
        const now = Date.now();
        if (e.key === "Backspace") backspaceCountRef.current += 1;
        if (lastKeystrokeRef.current) {
            if (now - lastKeystrokeRef.current > 2000) pauseCountRef.current += 1;
        }
        lastKeystrokeRef.current = now;
        keystrokeTimesRef.current.push(now);
        if (keystrokeTimesRef.current.length % 5 === 0) {
            const totalKeys = keystrokeTimesRef.current.length;
            const backspaces = backspaceCountRef.current;
            const pauses = pauseCountRef.current;
            const times = keystrokeTimesRef.current;
            const elapsed = (times[times.length - 1] - times[0]) / 1000 / 60 || 0.01;
            const wpm = (totalKeys / 5) / elapsed;
            const wpmScore = Math.min(100, (wpm / 80) * 100);
            const backspaceScore = Math.min(100, (backspaces / totalKeys) * 400);
            const pauseScore = Math.min(100, pauses * 15);
            const raw = (backspaceScore * 0.4) + (pauseScore * 0.4) + ((100 - wpmScore) * 0.2);
            setScore(Math.round(Math.min(100, raw)));
        }
    }, []);

    const reset = useCallback(() => {
        keystrokeTimesRef.current = [];
        backspaceCountRef.current = 0;
        pauseCountRef.current = 0;
        lastKeystrokeRef.current = null;
        setScore(0);
    }, []);

    return { score, onKeyDown, reset };
}

// ─── Cognitive load indicator (inline pill) ───────────────────────────────────
function LoadPill({ score }) {
    const color = score > 70 ? "#f87171" : score > 40 ? "#fbbf24" : "#34d399";
    const label = score > 70 ? "High load" : score > 40 ? "Some effort" : "Flowing";
    const radius = 10, circ = 2 * Math.PI * radius;
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
            style={{ background: `${color}0D`, border: `1px solid ${color}30` }}
        >
            <svg width="28" height="28" viewBox="0 0 28 28">
                <circle cx="14" cy="14" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />
                <circle cx="14" cy="14" r={radius} fill="none" stroke={color} strokeWidth="2.5"
                    strokeDasharray={circ} strokeDashoffset={circ - (score / 100) * circ}
                    strokeLinecap="round" transform="rotate(-90 14 14)"
                    style={{ transition: "stroke-dashoffset 0.4s ease, stroke 0.4s ease" }} />
                <text x="14" y="18" textAnchor="middle" fontSize="7" fill={color} fontWeight="bold">{score}</text>
            </svg>
            <div>
                <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: `${color}99` }}>
                    Mental effort
                </p>
                <p className="text-[11px] font-semibold" style={{ color }}>{label}</p>
            </div>
            <p className="text-[9px] text-white/25 ml-auto max-w-[80px] leading-tight">
                From your typing rhythm · private
            </p>
        </motion.div>
    );
}

// ─── Single mood card ─────────────────────────────────────────────────────────
function MoodButton({ mood, isSelected, onClick }) {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ y: -4, scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className="relative flex flex-col items-center justify-center gap-3 p-6 rounded-3xl transition-all duration-300 overflow-hidden"
            style={{
                background: isSelected ? mood.bg : "rgba(255,255,255,0.03)",
                border: `1px solid ${isSelected ? mood.border : "rgba(255,255,255,0.07)"}`,
                boxShadow: isSelected ? `0 0 32px ${mood.glow}, 0 0 0 1px ${mood.border}` : "none",
            }}
        >
            {/* Glow behind emoji on selected */}
            {isSelected && (
                <motion.div
                    layoutId="moodGlow"
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 50% 40%, ${mood.glow}, transparent 70%)` }}
                />
            )}

            {/* Selected dot */}
            {isSelected && (
                <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-2 h-2 rounded-full"
                    style={{ background: mood.accent, boxShadow: `0 0 6px ${mood.accent}` }}
                />
            )}

            {/* Emoji */}
            <motion.span
                animate={isSelected ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-4xl relative z-10 select-none"
            >
                {mood.emoji}
            </motion.span>

            {/* Label */}
            <div className="text-center relative z-10">
                <p className="text-sm font-bold text-white/90">{mood.label}</p>
                <p className="text-[10px] mt-0.5 leading-tight"
                    style={{ color: isSelected ? mood.accent : "rgba(255,255,255,0.3)" }}>
                    {mood.tagline}
                </p>
            </div>
        </motion.button>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MoodTrackerPage() {
    const router = useRouter();
    const { setMood, setRawMood } = useMood();
    const { score: clScore, onKeyDown: clOnKeyDown, reset: clReset } = useCognitiveLoad();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [step, setStep] = useState(1);
    const [selectedMood, setSelectedMood] = useState(null);
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showGauge, setShowGauge] = useState(false);

    // Today's date label
    const dateLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

    useEffect(() => {
        const token = localStorage.getItem("wc_token");
        if (!token) router.push("/login");
        else setIsCheckingAuth(false);
    }, [router]);

    const moodConfig = MOODS.find(m => m.id === selectedMood);

    const handleMoodSelect = (moodId) => {
        setSelectedMood(moodId);
        clReset();
        setStep(2);
    };

    const handleNotesChange = (e) => {
        setNotes(e.target.value);
        if (!showGauge && e.target.value.length > 5) setShowGauge(true);
    };

    async function handleSubmit() {
        if (!selectedMood) return;
        setIsSubmitting(true);
        try {
            const analysisResult = await api.analysis.submit(selectedMood, notes, clScore > 0 ? clScore : null);
            await api.mood.submit(selectedMood, notes, analysisResult.success ? analysisResult.analysis : {});
            setRawMood(selectedMood);
            if (["sad", "anxious"].includes(selectedMood)) setMood("low");
            else if (["happy"].includes(selectedMood)) setMood("positive");
            else setMood("neutral");
            sessionStorage.setItem("wc_analysis", JSON.stringify({
                result: analysisResult.success ? analysisResult.analysis : null,
                mood: selectedMood, clScore,
            }));
            router.push("/analysis");
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isCheckingAuth) return null;

    return (
        <div className="min-h-screen relative">
            {/* Subtle ambient orbs — same as landing page */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.06]"
                    style={{ background: "radial-gradient(circle, #66FCF1, transparent 70%)", filter: "blur(60px)" }} />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.05]"
                    style={{ background: "radial-gradient(circle, #8B5CF6, transparent 70%)", filter: "blur(70px)" }} />
                {/* Mood-specific glow when selected */}
                <AnimatePresence>
                    {moodConfig && (
                        <motion.div
                            key={moodConfig.id}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.8 }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
                            style={{
                                background: `radial-gradient(circle, ${moodConfig.glow}, transparent 65%)`,
                                filter: "blur(40px)",
                            }}
                        />
                    )}
                </AnimatePresence>
            </div>

            <div className="relative z-10 max-w-2xl mx-auto px-4 py-10">
                {/* ── Page header ── */}
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-10 text-center"
                >
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-3"
                        style={{ color: "rgba(102,252,241,0.5)" }}>
                        Daily Check-in · {dateLabel}
                    </p>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="h1"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                <h1 className="text-3xl md:text-4xl font-display font-bold text-white leading-tight">
                                    How are you feeling
                                    <span className="text-transparent bg-clip-text"
                                        style={{ backgroundImage: "linear-gradient(135deg, #66FCF1, #8B5CF6)" }}> right now?</span>
                                </h1>
                                <p className="mt-2 text-sm text-white/40">
                                    Pick the one that feels closest. There's no wrong answer.
                                </p>
                            </motion.div>
                        )}
                        {step === 2 && moodConfig && (
                            <motion.div key="h2"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <span className="text-2xl">{moodConfig.emoji}</span>
                                    <span className="text-sm font-bold px-2.5 py-1 rounded-full"
                                        style={{ background: moodConfig.bg, color: moodConfig.accent, border: `1px solid ${moodConfig.border}` }}>
                                        {moodConfig.label}
                                    </span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-display font-bold text-white leading-tight">
                                    {REFLECTION_QUESTIONS[selectedMood]}
                                </h1>
                                <p className="mt-2 text-sm text-white/35">
                                    Optional — just for you. Writing it out helps.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* ── Step content ── */}
                <AnimatePresence mode="wait">

                    {/* STEP 1 — Mood selection */}
                    {step === 1 && (
                        <motion.div key="step1"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {MOODS.map((mood, i) => (
                                    <motion.div
                                        key={mood.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.07, duration: 0.4 }}
                                    >
                                        <MoodButton
                                            mood={mood}
                                            isSelected={selectedMood === mood.id}
                                            onClick={() => handleMoodSelect(mood.id)}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2 — Reflection */}
                    {step === 2 && moodConfig && (
                        <motion.div key="step2"
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {/* Back link */}
                            <button onClick={() => { setStep(1); setShowGauge(false); }}
                                className="flex items-center gap-1.5 text-xs font-semibold text-white/40 hover:text-white/70 transition-colors mb-6">
                                <ArrowLeft className="w-3.5 h-3.5" /> Back to moods
                            </button>

                            {/* Glass card */}
                            <div className="rounded-3xl overflow-hidden"
                                style={{
                                    background: "rgba(10,12,20,0.7)",
                                    border: `1px solid ${moodConfig.border}`,
                                    boxShadow: `0 0 40px ${moodConfig.glow}`,
                                    backdropFilter: "blur(20px)",
                                }}>
                                {/* Colored top bar */}
                                <div className="h-0.5 w-full"
                                    style={{ background: `linear-gradient(90deg, transparent, ${moodConfig.accent}, transparent)` }} />

                                <div className="p-7 space-y-4">
                                    {/* Textarea */}
                                    <div className="relative">
                                        <textarea
                                            value={notes}
                                            onChange={handleNotesChange}
                                            onKeyDown={clOnKeyDown}
                                            maxLength={2000}
                                            rows={5}
                                            className="w-full rounded-2xl p-4 text-sm resize-none outline-none text-white/80 placeholder:text-white/20 leading-relaxed"
                                            style={{
                                                background: "rgba(0,0,0,0.35)",
                                                border: "1px solid rgba(255,255,255,0.07)",
                                            }}
                                            placeholder="Write freely — this stays between you and your AI companion…"
                                            autoFocus
                                        />
                                        <span className="absolute bottom-3 right-4 text-[10px] text-white/25">
                                            {notes.length}/2000
                                        </span>
                                    </div>

                                    {/* Cognitive load indicator */}
                                    <AnimatePresence>
                                        {showGauge && <LoadPill score={clScore} />}
                                    </AnimatePresence>

                                    {/* Submit */}
                                    <motion.button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        whileHover={!isSubmitting ? {
                                            scale: 1.02,
                                            boxShadow: `0 0 28px ${moodConfig.glow}`
                                        } : {}}
                                        whileTap={{ scale: 0.97 }}
                                        className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        style={{
                                            background: isSubmitting
                                                ? "rgba(255,255,255,0.05)"
                                                : `linear-gradient(135deg, ${moodConfig.accent}CC, ${moodConfig.accent}88)`,
                                            color: isSubmitting ? "rgba(255,255,255,0.5)" : "#0B0C10",
                                            border: `1px solid ${moodConfig.border}`,
                                        }}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Analysing with AI…</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4" />
                                                <span>Get my AI insights</span>
                                                <ArrowRight className="w-4 h-4 ml-1" />
                                            </>
                                        )}
                                    </motion.button>

                                    <p className="text-center text-[10px] text-white/20">
                                        Powered by Gemini · Responses are private and not shared
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
