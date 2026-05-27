"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useMood } from "@/context/MoodContext";
import { useUser } from "@/context/UserContext";
import { api } from "@/lib/api";

import { ZenGarden, ThoughtShredder } from "@/components/Widgets";
import SonicTherapy from "@/components/SonicTherapy";
import SOSButton from "@/components/SOSButton";
import FocusTimer from "@/components/FocusTimer";
import SpotlightCard from "@/components/SpotlightCard";
import StaggeredText from "@/components/StaggeredText";
import { BentoGrid, BentoItem } from "@/components/BentoGrid";
import { staggerContainer } from "@/lib/motion";
import { Brain, History, TrendingUp, Calendar } from "lucide-react";
import ConsistencyHeatmap from "@/components/ConsistencyHeatmap";
import MoodTrendChart from "@/components/MoodTrendChart";
import WeeklyInsight from "@/components/WeeklyInsight";
import TrajectoryWidget from "@/components/TrajectoryWidget";

export default function DashboardPage() {
    const { mood } = useMood();
    const { user } = useUser();
    const router = useRouter();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem("wc_token");
        if (!token) {
            router.push("/login");
        } else {
            setIsCheckingAuth(false);
        }
    }, [router]);

    useEffect(() => {
        if (!isCheckingAuth) {
            api.mood.streak().then((res) => {
                setStreak(res.current || 0);
            }).catch(() => setStreak(0));
        }
    }, [isCheckingAuth]);

    const displayName = user?.name || "Explorer";

    const container = {
        hidden: {},
        show: {
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    // Adaptive Card Style
    const [greeting, setGreeting] = React.useState("Good Evening");

    React.useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 18) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");
    }, []);

    // Adaptive Card Style
    const cardStyle = "border-white/12 text-white transition-colors duration-500";
    // Base texts are handled by text-foreground which adapts via globals.css

    if (isCheckingAuth) return null;

    return (
        <div className="min-h-screen p-6 pb-24 md:p-12 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-baseline gap-3">
                        <StaggeredText
                            text={`${greeting}, ${displayName}`}
                            className="text-2xl md:text-3xl font-display font-medium text-slate-800 dark:text-white mb-2"
                        />
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                            {streak} Day Streak 🔥
                        </span>
                    </div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="text-slate-500 dark:text-gray-400"
                    >
                        Your safe space is ready.
                    </motion.p>
                </div>

            </header>

            {/* Main Bento Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-4 grid-rows-[auto] gap-4"
            >
                {/* 1. Main Feature: Focus Mode (Hero Card - Top Left) */}
                <motion.div variants={item} className="md:col-span-2 md:row-span-2">
                    <SpotlightCard className={`h-full min-h-[350px] ${cardStyle} border-primary/20 shadow-lg shadow-primary/5`}>
                        <FocusTimer />
                    </SpotlightCard>
                </motion.div>

                {/* 2. Weekly Insight (Important - Top Right) */}
                <motion.div variants={item} className="md:col-span-2 md:row-span-1">
                    <SpotlightCard className={`h-full ${cardStyle} p-6 border-amber-500/20`}>
                        <WeeklyInsight />
                    </SpotlightCard>
                </motion.div>

                {/* 3. Consistency Heatmap (Info - Middle Right) */}
                <motion.div variants={item} className="md:col-span-1 md:row-span-1">
                    <SpotlightCard className={`h-full p-4 flex flex-col ${cardStyle}`}>
                        <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-gray-400">
                            <Calendar className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase">Consistency</span>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                            <ConsistencyHeatmap />
                        </div>
                    </SpotlightCard>
                </motion.div>

                {/* 4. Emotional Trajectory (Middle Right) */}
                <motion.div variants={item} className="md:col-span-1 md:row-span-1">
                    <SpotlightCard className={`h-full p-4 flex flex-col ${cardStyle} border-emerald-500/10`}>
                        <TrajectoryWidget />
                    </SpotlightCard>
                </motion.div>


                {/* 5. Thought Shredder (Bottom Left) */}
                <motion.div variants={item} className="md:col-span-2 md:row-span-1">
                    <SpotlightCard className={`h-full min-h-[220px] ${cardStyle} border-red-500/10`}>
                        <ThoughtShredder />
                    </SpotlightCard>
                </motion.div>

                {/* 6. Sonic Therapy & Zen Garden (Bottom Right - Grouped) */}
                <motion.div variants={item} className="md:col-span-1 md:row-span-1">
                    <SpotlightCard className={`h-full p-6 ${cardStyle}`}>
                        <SonicTherapy />
                    </SpotlightCard>
                </motion.div>

                <motion.div variants={item} className="md:col-span-1 md:row-span-1">
                    <SpotlightCard className={`h-full ${cardStyle}`}>
                        <ZenGarden />
                    </SpotlightCard>
                </motion.div>
            </motion.div>

            {/* Floating SOS */}
            <SOSButton />
        </div>
    );
}
