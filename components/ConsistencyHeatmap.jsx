"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

const MOOD_COLORS = {
    happy: { bar: "bg-yellow-400", glow: "shadow-[0_0_8px_rgba(250,204,21,0.4)]" },
    calm: { bar: "bg-orange-400", glow: "shadow-[0_0_8px_rgba(251,146,60,0.3)]" },
    neutral: { bar: "bg-slate-400", glow: "" },
    sad: { bar: "bg-blue-400", glow: "shadow-[0_0_8px_rgba(96,165,250,0.3)]" },
    anxious: { bar: "bg-purple-500", glow: "shadow-[0_0_8px_rgba(168,85,247,0.3)]" },
    none: { bar: "bg-white/5", glow: "" },
};

export default function ConsistencyHeatmap() {
    const [mounted, setMounted] = useState(false);
    const [hoveredDay, setHoveredDay] = useState(null);
    const [days, setDays] = useState([]);
    const [checkInPercent, setCheckInPercent] = useState(0);

    useEffect(() => {
        setMounted(true);
        loadHeatmapData();
    }, []);

    async function loadHeatmapData() {
        // Build last-30-day skeleton
        const skeleton = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            return {
                date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                isoDate: date.toISOString().split("T")[0],
                dayName: date.toLocaleDateString("en-US", { weekday: "long" }),
                mood: "none",
            };
        });

        // Try to fill from API — falls back to empty skeleton if DB is offline
        try {
            const entries = await api.mood.history(30);
            const entryMap = {};
            for (const e of entries) {
                if (e.date) entryMap[e.date] = e.mood || "neutral";
            }
            let checked = 0;
            for (const day of skeleton) {
                if (entryMap[day.isoDate]) {
                    day.mood = entryMap[day.isoDate];
                    checked++;
                }
            }
            setCheckInPercent(Math.round((checked / 30) * 100));
        } catch {
            // No data — show empty skeleton
        }

        setDays(skeleton);
    }

    const insight = (() => {
        if (!days.length) return "Loading your consistency data...";
        const checkedIn = days.filter(d => d.mood !== "none").length;
        if (checkedIn === 0) return "Start your first check-in today! 🌱";
        if (checkedIn < 7) return `${checkedIn} check-ins so far — keep building the habit.`;
        if (checkedIn < 20) return `${checkedIn}/30 days active. Great momentum! 🔥`;
        return `${checkedIn}/30 days — phenomenal consistency! 🌟`;
    })();

    if (!mounted) return <div className="h-24 bg-white/5 animate-pulse rounded-xl" />;

    return (
        <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Consistency (30 Days)
                </span>
                <span className="text-[10px] text-muted-foreground">
                    {checkInPercent}% Active
                </span>
            </div>

            <div className="flex gap-1 flex-wrap justify-between relative">
                {days.map((day, i) => {
                    const style = MOOD_COLORS[day.mood] || MOOD_COLORS.none;
                    return (
                        <div
                            key={i}
                            onMouseEnter={() => setHoveredDay({ ...day, index: i })}
                            onMouseLeave={() => setHoveredDay(null)}
                            className={`w-2 h-6 rounded-[2px] transition-all duration-300 relative cursor-help ${style.bar} ${style.glow}`}
                        />
                    );
                })}

                {/* Shared Floating Tooltip */}
                <AnimatePresence>
                    {hoveredDay && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute bottom-full left-0 right-0 mx-auto w-max z-50 mb-2 pointer-events-none"
                            style={{ left: `${(hoveredDay.index / 29) * 100}%`, translateX: "-50%" }}
                        >
                            <div className="bg-black/90 backdrop-blur-md border border-white/10 text-white px-3 py-2 rounded-lg shadow-xl flex flex-col items-center">
                                <span className="text-xs font-bold whitespace-nowrap capitalize">
                                    {hoveredDay.dayName} — {hoveredDay.mood === "none" ? "No entry" : hoveredDay.mood}
                                </span>
                                <span className="text-[10px] text-white/50">{hoveredDay.date}</span>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="text-xs text-center text-slate-500 dark:text-slate-400 font-medium py-1 bg-white/5 rounded-lg border border-white/5">
                {insight}
            </div>
        </div>
    );
}
