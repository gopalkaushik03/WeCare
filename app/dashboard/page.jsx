"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
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
    Smile, ArrowRight, Star
} from "lucide-react";
import Link from "next/link";

// ─── Time-aware personal messages ────────────────────────────────────────────
const PERSONAL_MESSAGES = [
    { hours: [5,6,7,8,9],   msg: "A fresh start awaits you. Make today count.",       emoji: "🌅" },
    { hours: [10,11],       msg: "You're doing great — keep the momentum going.",       emoji: "⚡" },
    { hours: [12,13],       msg: "Midday check-in. How's your mental energy?",          emoji: "☀️" },
    { hours: [14,15,16],    msg: "The afternoon is yours. Stay grounded.",              emoji: "🍃" },
    { hours: [17,18,19],    msg: "Evening approaches. Reflect on your wins today.",    emoji: "🌇" },
    { hours: [20,21,22],    msg: "Wind down gently. You showed up today — that matters.", emoji: "🌙" },
    { hours: [23,0,1,2,3,4],msg: "Late night? Rest is part of the healing process.",   emoji: "✨" },
];

function getPersonalMsg(hour) {
    return PERSONAL_MESSAGES.find(m => m.hours.includes(hour)) ||
        { msg: "Welcome back. Your space is ready.", emoji: "💙" };
}

// ─── Live digital clock ───────────────────────────────────────────────────────
function LiveClock() {
    const [time, setTime] = useState("");
    useEffect(() => {
        const tick = () => {
            const d = new Date();
            setTime(d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }));
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);
    return (
        <span className="font-mono text-sm font-medium tracking-widest" style={{ color: "rgba(102,252,241,0.5)" }}>
            {time}
        </span>
    );
}

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

                {/* ══ PREMIUM WELCOME BANNER ══════════════════════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: -24, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="relative overflow-hidden rounded-3xl"
                    style={{
                        background: "linear-gradient(135deg, rgba(10,12,18,0.95) 0%, rgba(15,15,30,0.92) 60%, rgba(8,10,20,0.95) 100%)",
                        border: "1px solid rgba(102,252,241,0.12)",
                        boxShadow: "0 0 0 1px rgba(102,252,241,0.06), 0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(102,252,241,0.08)",
                        backdropFilter: "blur(24px)",
                    }}
                >
                    {/* Aurora shimmer behind content */}
                    <div className="absolute inset-0 pointer-events-none">
                        <motion.div
                            animate={{ x: ["-10%", "10%", "-10%"], opacity: [0.4, 0.7, 0.4] }}
                            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-16 left-0 w-[60%] h-[200%]"
                            style={{ background: "radial-gradient(ellipse, rgba(102,252,241,0.07) 0%, transparent 70%)" }}
                        />
                        <motion.div
                            animate={{ x: ["10%", "-10%", "10%"], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                            className="absolute -top-16 right-0 w-[50%] h-[200%]"
                            style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)" }}
                        />
                        {/* Subtle grid texture */}
                        <div className="absolute inset-0 opacity-[0.03]"
                            style={{
                                backgroundImage: "linear-gradient(rgba(102,252,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(102,252,241,0.5) 1px, transparent 1px)",
                                backgroundSize: "40px 40px"
                            }}
                        />
                    </div>

                    {/* Top accent line */}
                    <div className="h-px w-full"
                        style={{ background: "linear-gradient(90deg, transparent 0%, #66FCF1 30%, #8B5CF6 70%, transparent 100%)", opacity: 0.4 }}
                    />

                    <div className="relative z-10 px-8 py-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        {/* LEFT — Identity block */}
                        <div className="flex-1">
                            {/* Time + live clock row */}
                            <motion.div
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="flex items-center gap-3 mb-4"
                            >
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                                    style={{ background: "rgba(102,252,241,0.08)", border: "1px solid rgba(102,252,241,0.15)" }}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#66FCF1] animate-pulse" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#66FCF1]/70">{greeting}</span>
                                </div>
                                <LiveClock />
                            </motion.div>

                            {/* Name — large shimmer headline */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight leading-none">
                                    <span className="text-white/90">{displayName}</span>
                                    <motion.span
                                        animate={{ opacity: [0.6, 1, 0.6] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                        className="text-transparent bg-clip-text"
                                        style={{ backgroundImage: "linear-gradient(135deg, #66FCF1, #8B5CF6, #66FCF1)", backgroundSize: "200%" }}
                                    >
                                        .
                                    </motion.span>
                                </h1>
                            </motion.div>

                            {/* Personal message */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.7 }}
                                className="mt-3 text-sm leading-relaxed max-w-md"
                                style={{ color: "rgba(255,255,255,0.45)" }}
                            >
                                {getPersonalMsg(new Date().getHours()).emoji}{" "}
                                {getPersonalMsg(new Date().getHours()).msg}
                            </motion.p>
                        </div>

                        {/* RIGHT — Badges + CTA */}
                        <motion.div
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35, duration: 0.6 }}
                            className="flex flex-col items-start md:items-end gap-3 flex-shrink-0"
                        >
                            {/* Streak badge */}
                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
                                style={{
                                    background: "linear-gradient(135deg, rgba(251,146,60,0.12), rgba(239,68,68,0.08))",
                                    border: "1px solid rgba(251,146,60,0.2)",
                                    boxShadow: "0 0 20px rgba(251,146,60,0.08)"
                                }}>
                                <Flame className="w-4 h-4 text-orange-400" />
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-orange-400/60">Current Streak</p>
                                    <p className="text-base font-bold text-white leading-none">{streak} Days</p>
                                </div>
                            </div>

                            {/* Log Mood CTA */}
                            <Link href="/mood" className="w-full md:w-auto">
                                <motion.button
                                    whileHover={{
                                        scale: 1.04,
                                        boxShadow: "0 0 32px rgba(102,252,241,0.4), 0 0 60px rgba(102,252,241,0.15)"
                                    }}
                                    whileTap={{ scale: 0.96 }}
                                    className="w-full md:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-bold text-[#0B0C10] transition-all"
                                    style={{
                                        background: "linear-gradient(135deg, #66FCF1 0%, #45A29E 50%, #66FCF1 100%)",
                                        backgroundSize: "200% auto",
                                    }}
                                >
                                    <Smile className="w-4 h-4" />
                                    How are you feeling?
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </motion.button>
                            </Link>

                            {/* Subtle tagline */}
                            <p className="text-[9px] font-medium uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.2)" }}>
                                WeCare · Your AI Companion
                            </p>
                        </motion.div>
                    </div>

                    {/* Bottom accent line */}
                    <div className="h-px w-full"
                        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.3) 50%, transparent 100%)" }}
                    />
                </motion.div>

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
