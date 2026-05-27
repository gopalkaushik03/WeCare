"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, Trash2, Check, Wind, Flame, TreeDeciduous, Shield, Sparkles } from "lucide-react";
import { api } from "@/lib/api";

// ═══════════════════════════════════════════════════════════════
//  ZEN GARDEN
// ═══════════════════════════════════════════════════════════════
export function ZenGarden() {
    const [streak, setStreak] = useState(0);
    const [longestStreak, setLongestStreak] = useState(0);
    const [stage, setStage] = useState(0);
    const [graceDayUsed, setGraceDayUsed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadStreak() {
            const cached = parseInt(localStorage.getItem("wecare_streak") || "0", 10);
            setStreak(cached);
            determineStage(cached);
            try {
                const data = await api.mood.streak();
                const serverStreak = data.current ?? cached;
                setStreak(serverStreak);
                setLongestStreak(data.longest ?? 0);
                determineStage(serverStreak);
                localStorage.setItem("wecare_streak", serverStreak.toString());
            } catch { } finally { setIsLoading(false); }

            const today = new Date().toISOString().split("T")[0];
            const lastLogged = localStorage.getItem("wecare_last_logged");
            const weekNum = getWeekNumber(new Date());
            const graceWeek = localStorage.getItem("wecare_grace_week");
            if (lastLogged && lastLogged !== today) {
                const diffDays = Math.ceil(Math.abs(new Date(today) - new Date(lastLogged)) / (1000 * 60 * 60 * 24));
                if (diffDays === 2 && String(weekNum) !== graceWeek) {
                    localStorage.setItem("wecare_grace_week", String(weekNum));
                    setGraceDayUsed(true);
                }
            }
        }
        loadStreak();
    }, []);

    function getWeekNumber(d) {
        const onejan = new Date(d.getFullYear(), 0, 1);
        return Math.ceil(((d - onejan) / 86400000 + onejan.getDay() + 1) / 7);
    }

    const determineStage = (s) => {
        if (s === 0) setStage(0);
        else if (s < 3) setStage(1);
        else if (s < 7) setStage(2);
        else if (s < 30) setStage(3);
        else setStage(4);
    };

    const stageConfig = {
        0: { icon: Sprout,         color: "#64748b", glow: "rgba(100,116,139,0.2)", text: "Plant a seed today.",    emoji: "🌱" },
        1: { icon: Sprout,         color: "#4ade80", glow: "rgba(74,222,128,0.25)", text: "It's growing!",         emoji: "🌿" },
        2: { icon: Sprout,         color: "#22c55e", glow: "rgba(34,197,94,0.30)",  text: "Keep nurturing it.",    emoji: "🌳" },
        3: { icon: TreeDeciduous,  color: "#10b981", glow: "rgba(16,185,129,0.35)", text: "Strong roots formed.",  emoji: "🌲" },
        4: { icon: Flame,          color: "#f97316", glow: "rgba(249,115,22,0.40)", text: "Unstoppable!",          emoji: "🔥" },
    };

    const c = stageConfig[stage];
    const Icon = c.icon;
    const milestones = [3, 7, 30, 60, 100];
    const nextMilestone = milestones.find(m => m > streak) || 100;
    const daysToGo = nextMilestone - streak;
    const progressPercent = Math.min(100, (streak / nextMilestone) * 100);

    return (
        <div className="h-full flex flex-col items-center justify-between relative overflow-hidden p-5 group">
            {/* Background glow pulse */}
            <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.35, 0.15] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 60%, ${c.glow}, transparent 70%)` }}
            />

            {/* Top row */}
            <div className="w-full flex items-center justify-between z-10">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: c.color }}>
                        {c.emoji} Stage {stage}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    {graceDayUsed && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                            <Shield className="w-2.5 h-2.5 text-amber-400" />
                            <span className="text-[8px] font-bold text-amber-400">Grace</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <Flame className={`w-3 h-3 ${streak > 0 ? "text-orange-400" : "text-slate-500"}`} />
                        <span className="text-[10px] font-bold text-white/70">
                            {isLoading ? "..." : `${streak}d`}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main icon */}
            <div className="relative z-10 flex flex-col items-center">
                <motion.div
                    animate={{ scale: [1, 1.08, 1], y: [0, -6, 0], rotate: [0, 1.5, -1.5, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="mb-3"
                >
                    <Icon
                        className="w-16 h-16 drop-shadow-2xl"
                        style={{ color: c.color, filter: `drop-shadow(0 0 16px ${c.glow})` }}
                        strokeWidth={1.5}
                    />
                </motion.div>
                <p className="text-sm font-semibold text-white/80 text-center">{c.text}</p>
            </div>

            {/* Progress bar — always visible */}
            <div className="w-full z-10">
                <div className="flex justify-between text-[9px] font-medium mb-1.5"
                    style={{ color: "rgba(255,255,255,0.35)" }}>
                    <span>Next: {nextMilestone} days</span>
                    {longestStreak > 0 && <span style={{ color: "#fbbf24" }}>Best: {longestStreak}</span>}
                </div>
                <div className="h-1 w-full rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.06)" }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${c.color}, ${c.color}99)` }}
                    />
                </div>
                <p className="text-[9px] text-center mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>
                    {daysToGo} days to go
                </p>
            </div>
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════
//  THOUGHT SHREDDER  (Negative Processor)
// ═══════════════════════════════════════════════════════════════
export function ThoughtShredder() {
    const [step, setStep] = useState(0);
    const [data, setData] = useState({ mood: "", thought: "", isControl: null, action: "" });
    const [isShredding, setIsShredding] = useState(false);

    const moods = [
        { icon: "🙂", label: "Okay",    color: "#22c55e" },
        { icon: "😔", label: "Sad",     color: "#60a5fa" },
        { icon: "😡", label: "Angry",   color: "#f87171" },
        { icon: "😰", label: "Anxious", color: "#c084fc" },
        { icon: "😴", label: "Tired",   color: "#94a3b8" },
    ];

    const handleNext = () => setStep(s => s + 1);

    const handleShred = () => {
        setIsShredding(true);
        setTimeout(() => {
            setStep(4);
            setIsShredding(false);
            setTimeout(() => {
                setStep(0);
                setData({ mood: "", thought: "", isControl: null, action: "" });
            }, 3000);
        }, 1500);
    };

    // Step label map
    const stepLabels = ["How are you feeling?", "What's weighing you down?", "Is it in your control?", "Take action or let go", ""];
    const totalSteps = 4;

    return (
        <div className="h-full flex flex-col p-4 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)" }}>
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </div>
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(239,68,68,0.6)" }}>CBT Tool</p>
                        <p className="text-xs font-bold text-white/80 leading-none">Negative Processor</p>
                    </div>
                </div>
                {/* Step dots */}
                {step > 0 && step < 4 && (
                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                                style={{
                                    background: i < step ? "#f87171" : "rgba(255,255,255,0.1)",
                                    transform: i === step - 1 ? "scale(1.4)" : "scale(1)"
                                }} />
                        ))}
                    </div>
                )}
            </div>

            {/* Subtle top divider */}
            <div className="w-full h-px mb-4"
                style={{ background: "linear-gradient(90deg, transparent, rgba(239,68,68,0.2), transparent)" }} />

            {/* Step content */}
            <div className="flex-1 relative">
                <AnimatePresence mode="wait">

                    {/* Step 0 — Mood grid */}
                    {step === 0 && (
                        <motion.div key="s0"
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col gap-4 h-full"
                        >
                            <p className="text-sm font-semibold text-white/70">How are you feeling right now?</p>
                            <div className="grid grid-cols-5 gap-2">
                                {moods.map((m) => (
                                    <motion.button
                                        key={m.label}
                                        whileHover={{ scale: 1.12, y: -3 }}
                                        whileTap={{ scale: 0.93 }}
                                        onClick={() => { setData({ ...data, mood: m.label }); handleNext(); }}
                                        className="flex flex-col items-center justify-center py-3 rounded-2xl text-2xl transition-all"
                                        style={{
                                            background: "rgba(255,255,255,0.04)",
                                            border: "1px solid rgba(255,255,255,0.08)",
                                        }}
                                        title={m.label}
                                    >
                                        {m.icon}
                                        <span className="text-[8px] font-bold mt-1" style={{ color: m.color }}>{m.label}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 1 — Write thought */}
                    {step === 1 && (
                        <motion.div key="s1"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col h-full gap-3"
                        >
                            <p className="text-sm font-semibold text-white/70">What's weighing you down?</p>
                            <textarea
                                className="flex-1 rounded-xl p-3 text-sm resize-none outline-none placeholder:text-white/20 text-white/80"
                                style={{
                                    background: "rgba(0,0,0,0.3)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    minHeight: 80,
                                }}
                                placeholder="Pour it out here..."
                                value={data.thought}
                                onChange={(e) => setData({ ...data, thought: e.target.value })}
                                autoFocus
                            />
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                onClick={handleNext} disabled={!data.thought}
                                className="py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-30"
                                style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
                            >
                                Continue →
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Step 2 — Control check */}
                    {step === 2 && (
                        <motion.div key="s2"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col h-full justify-center gap-5"
                        >
                            <p className="text-sm font-semibold text-white/70 text-center">Is this within your control?</p>
                            <div className="flex gap-3">
                                {[{ label: "Yes", val: true, color: "#34d399" }, { label: "No", val: false, color: "#f87171" }].map(opt => (
                                    <motion.button
                                        key={opt.label}
                                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                        onClick={() => { setData({ ...data, isControl: opt.val }); handleNext(); }}
                                        className="flex-1 py-3.5 rounded-2xl text-sm font-bold transition-all"
                                        style={{
                                            background: `${opt.color}10`,
                                            border: `1px solid ${opt.color}30`,
                                            color: opt.color,
                                        }}
                                    >
                                        {opt.label}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3 — Action / shred */}
                    {step === 3 && (
                        <motion.div key="s3"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scaleY: 0, skewX: 15, filter: "blur(8px)", transition: { duration: 1.2 } }}
                            className="flex flex-col h-full gap-3"
                        >
                            <p className="text-sm font-semibold text-white/70">
                                {data.isControl ? "What's one small step you can take?" : "Ready to release it?"}
                            </p>
                            {data.isControl ? (
                                <textarea
                                    className="flex-1 rounded-xl p-3 text-sm resize-none outline-none placeholder:text-white/20 text-white/80"
                                    style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(52,211,153,0.2)", minHeight: 70 }}
                                    placeholder="I will..."
                                    value={data.action}
                                    onChange={(e) => setData({ ...data, action: e.target.value })}
                                    autoFocus
                                />
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-white/30 text-xs italic p-4 rounded-xl"
                                    style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                    "{data.thought}"
                                </div>
                            )}
                            <motion.button
                                whileHover={{ scale: 1.02, boxShadow: "0 0 24px rgba(239,68,68,0.3)" }}
                                whileTap={{ scale: 0.96 }}
                                onClick={handleShred}
                                disabled={isShredding || (data.isControl && !data.action)}
                                className="py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-40"
                                style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.8), rgba(185,28,28,0.8))", color: "#fff" }}
                            >
                                {isShredding ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Wind className="w-4 h-4 animate-spin" /> Shredding...
                                    </span>
                                ) : "Let It Go 🌬️"}
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Step 4 — Done */}
                    {step === 4 && (
                        <motion.div key="s4"
                            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            className="flex-1 h-full flex flex-col items-center justify-center gap-3 rounded-2xl"
                            style={{ background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.15)" }}
                        >
                            <motion.div
                                animate={{ scale: [1, 1.15, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Check className="w-10 h-10" style={{ color: "#34d399" }} />
                            </motion.div>
                            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#34d399" }}>Processed</p>
                            <p className="text-[11px] text-white/40">You showed up. That's enough.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
