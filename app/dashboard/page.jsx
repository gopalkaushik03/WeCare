"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useMood } from "@/context/MoodContext";
import { useUser } from "@/context/UserContext";
import { api } from "@/lib/api";
import { ZenGarden, ThoughtShredder } from "@/components/Widgets";
import SonicTherapy from "@/components/SonicTherapy";
import SOSButton from "@/components/SOSButton";
import FocusTimer from "@/components/FocusTimer";
import SpotlightCard from "@/components/SpotlightCard";
import ConsistencyHeatmap from "@/components/ConsistencyHeatmap";
import WeeklyInsight from "@/components/WeeklyInsight";
import TrajectoryWidget from "@/components/TrajectoryWidget";
import {
    Flame, Sparkles, Timer, Music2, Leaf,
    Brain, TrendingUp, Calendar, ChevronRight,
    Smile
} from "lucide-react";
import Link from "next/link";

// ─── Stagger animation variants ──────────────────────────────────────────────
const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const item = {
    hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
    show: {
        opacity: 1, y: 0, filter: "blur(0px)",
        transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }
    },
};

// ─── Ambient glow orbs (behind everything) ───────────────────────────────────
function AmbientOrbs() {
    return (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.07]"
                style={{ background: "radial-gradient(circle, #66FCF1 0%, transparent 70%)", filter: "blur(40px)" }} />
            <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.06]"
                style={{ background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)", filter: "blur(50px)" }} />
            <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full opacity-[0.05]"
                style={{ background: "radial-gradient(circle, #22d3ee 0%, transparent 70%)", filter: "blur(60px)" }} />
        </div>
    );
}

// ─── Section label chip ───────────────────────────────────────────────────────
function SectionLabel({ icon: Icon, label, color = "#66FCF1" }) {
    return (
        <div className="flex items-center gap-2 mb-1" style={{ color }}>
            <Icon className="w-3 h-3" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em]">{label}</span>
        </div>
    );
}

// ─── Quick-action chip ────────────────────────────────────────────────────────
function QuickChip({ href, icon: Icon, label, color }) {
    return (
        <Link href={href}>
            <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all"
                style={{
                    background: `${color}12`,
                    border: `1px solid ${color}25`,
                }}
            >
                <Icon className="w-3.5 h-3.5" style={{ color }} />
                <span className="text-[11px] font-semibold text-white/70">{label}</span>
                <ChevronRight className="w-2.5 h-2.5 text-white/30 ml-auto" />
            </motion.div>
        </Link>
    );
}

export default function DashboardPage() {
    const { mood } = useMood();
    const { user } = useUser();
    const router = useRouter();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [streak, setStreak] = useState(0);
    const [greeting, setGreeting] = useState("Good Evening");

    useEffect(() => {
        const token = localStorage.getItem("wc_token");
        if (!token) { router.push("/login"); return; }
        setIsCheckingAuth(false);
        const h = new Date().getHours();
        if (h < 12) setGreeting("Good Morning");
        else if (h < 18) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");
    }, [router]);

    useEffect(() => {
        if (!isCheckingAuth) {
            api.mood.streak()
                .then((r) => setStreak(r.current || 0))
                .catch(() => setStreak(0));
        }
    }, [isCheckingAuth]);

    const displayName = user?.name || "Explorer";

    if (isCheckingAuth) return null;

    return (
        <>
            <AmbientOrbs />

            <div className="relative z-10 min-h-screen px-4 md:px-10 pt-8 pb-28 max-w-[1400px] mx-auto space-y-8">

                {/* ── HEADER ────────────────────────────────────────────── */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-4"
                >
                    <div>
                        {/* Greeting */}
                        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1"
                            style={{ color: "#66FCF1", opacity: 0.7 }}>
                            {greeting}
                        </p>
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">
                            {displayName}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">.</span>
                        </h1>
                        <p className="text-sm text-white/40 mt-1">Your safe space is ready.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Streak badge */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.4 }}
                            className="flex items-center gap-2 px-4 py-2 rounded-full"
                            style={{
                                background: "linear-gradient(135deg, rgba(251,146,60,0.15), rgba(239,68,68,0.1))",
                                border: "1px solid rgba(251,146,60,0.25)",
                            }}
                        >
                            <Flame className="w-4 h-4 text-orange-400" />
                            <span className="text-sm font-bold text-white">{streak} Day Streak</span>
                        </motion.div>

                        {/* Log mood CTA */}
                        <Link href="/mood">
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: "0 0 24px rgba(102,252,241,0.35)" }}
                                whileTap={{ scale: 0.96 }}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-[#0B0C10]"
                                style={{
                                    background: "linear-gradient(135deg, #66FCF1, #45A29E)",
                                }}
                            >
                                <Smile className="w-4 h-4" />
                                Log Mood
                            </motion.button>
                        </Link>
                    </div>
                </motion.header>

                {/* ── BENTO GRID ────────────────────────────────────────── */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-auto"
                >

                    {/* ══ 1. FOCUS TIMER — Hero (spans 5 cols × 2 rows) ══ */}
                    <motion.div variants={item} className="md:col-span-5 md:row-span-2">
                        <SpotlightCard className="h-full min-h-[380px] p-0 border-cyan-500/15 shadow-[0_0_60px_rgba(102,252,241,0.06)]">
                            {/* Top accent line */}
                            <div className="h-0.5 w-full rounded-t-3xl"
                                style={{ background: "linear-gradient(90deg, transparent, #66FCF1 50%, transparent)" }} />
                            <div className="p-1 h-full">
                                <SectionLabel icon={Timer} label="Deep Focus" color="#66FCF1" />
                                <FocusTimer />
                            </div>
                        </SpotlightCard>
                    </motion.div>

                    {/* ══ 2. WEEKLY INSIGHT / QUOTE — 7 cols × 1 row ══ */}
                    <motion.div variants={item} className="md:col-span-7">
                        <SpotlightCard className="h-full min-h-[170px] p-5 border-purple-500/15 shadow-[0_0_40px_rgba(139,92,246,0.05)]">
                            <WeeklyInsight />
                        </SpotlightCard>
                    </motion.div>

                    {/* ══ 3. CONSISTENCY HEATMAP — 3 cols × 1 row ══ */}
                    <motion.div variants={item} className="md:col-span-3">
                        <SpotlightCard className="h-full min-h-[170px] p-5 border-white/8">
                            <SectionLabel icon={Calendar} label="Consistency" color="#a78bfa" />
                            <div className="flex-1 flex items-center justify-center mt-2">
                                <ConsistencyHeatmap />
                            </div>
                        </SpotlightCard>
                    </motion.div>

                    {/* ══ 4. 7-DAY TRAJECTORY — 4 cols × 1 row ══ */}
                    <motion.div variants={item} className="md:col-span-4">
                        <SpotlightCard className="h-full min-h-[170px] p-5 border-emerald-500/15 shadow-[0_0_30px_rgba(52,211,153,0.04)]">
                            <SectionLabel icon={TrendingUp} label="7-Day Trajectory" color="#34d399" />
                            <div className="mt-2">
                                <TrajectoryWidget />
                            </div>
                        </SpotlightCard>
                    </motion.div>

                    {/* ══ 5. THOUGHT SHREDDER — 6 cols × 1 row ══ */}
                    <motion.div variants={item} className="md:col-span-6">
                        <SpotlightCard className="h-full min-h-[220px] p-0 border-red-500/15 shadow-[0_0_30px_rgba(239,68,68,0.04)]">
                            <div className="h-0.5 w-full rounded-t-3xl"
                                style={{ background: "linear-gradient(90deg, transparent, rgba(239,68,68,0.6) 50%, transparent)" }} />
                            <div className="p-1 h-full">
                                <SectionLabel icon={Brain} label="Negative Processor" color="#f87171" />
                                <ThoughtShredder />
                            </div>
                        </SpotlightCard>
                    </motion.div>

                    {/* ══ 6. SONIC THERAPY — 3 cols × 1 row ══ */}
                    <motion.div variants={item} className="md:col-span-3">
                        <SpotlightCard className="h-full min-h-[220px] p-5 border-pink-500/15 shadow-[0_0_30px_rgba(236,72,153,0.04)]">
                            <SectionLabel icon={Music2} label="Sonic Therapy" color="#f472b6" />
                            <div className="mt-2">
                                <SonicTherapy />
                            </div>
                        </SpotlightCard>
                    </motion.div>

                    {/* ══ 7. ZEN GARDEN — 3 cols × 1 row ══ */}
                    <motion.div variants={item} className="md:col-span-3">
                        <SpotlightCard className="h-full min-h-[220px] border-emerald-500/15 shadow-[0_0_30px_rgba(52,211,153,0.04)]">
                            <SectionLabel icon={Leaf} label="Zen Garden" color="#6ee7b7" />
                            <ZenGarden />
                        </SpotlightCard>
                    </motion.div>

                    {/* ══ 8. QUICK ACTIONS — bottom strip ══ */}
                    <motion.div variants={item} className="md:col-span-12">
                        <div className="rounded-2xl p-4 border border-white/5"
                            style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)" }}>
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 mb-3">Quick Actions</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <QuickChip href="/mood" icon={Smile} label="Log Today's Mood" color="#66FCF1" />
                                <QuickChip href="/analysis" icon={Sparkles} label="View AI Analysis" color="#a78bfa" />
                                <QuickChip href="/dashboard" icon={TrendingUp} label="Emotional Trend" color="#34d399" />
                                <QuickChip href="/mood" icon={Brain} label="CBT Journal" color="#f472b6" />
                            </div>
                        </div>
                    </motion.div>

                </motion.div>
            </div>

            {/* Floating SOS */}
            <SOSButton />
        </>
    );
}
