"use client";
import React, { useState, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";

export default function ConsistencyHeatmap() {
    const [mounted, setMounted] = useState(false);
    const [hoveredDay, setHoveredDay] = useState(null);

    // Simple seeded random function
    const seededRandom = (seed) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    };

    // Generate last 30 days
    const days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));

        let status = "none";
        // Deterministic status based on index
        const rand = seededRandom(i + 42);
        if (rand > 0.6) status = "happy";
        else if (rand > 0.3) status = "anxious";

        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

        return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            fullDate: date,
            dayName,
            status
        };
    });

    // Dynamic Insight Logic
    const insight = "You focus best on Tuesdays."; // Simplified logic for demo

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-24 bg-white/5 animate-pulse rounded-xl" />;

    return (
        <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Consistency (30 Days)</span>
                <span className="text-[10px] text-muted-foreground">85% Streak</span>
            </div>

            <div className="flex gap-1 flex-wrap justify-between relative">
                {days.map((day, i) => (
                    <div
                        key={i}
                        onMouseEnter={() => setHoveredDay({ ...day, index: i })}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`
                            w-2 h-6 rounded-[2px] transition-all duration-300 relative cursor-help
                            ${day.status === "none" ? "bg-white/5 hover:bg-white/10" : ""}
                            ${day.status === "happy" ? "bg-primary shadow-[0_0_8px_rgba(102,252,241,0.3)]" : ""}
                            ${day.status === "anxious" ? "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.3)]" : ""}
                        `}
                    />
                ))}

                {/* Shared Floating Tooltip */}
                <AnimatePresence>
                    {hoveredDay && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute bottom-full left-0 right-0 mx-auto w-max z-50 mb-2 pointer-events-none"
                            style={{
                                left: `${(hoveredDay.index / 29) * 100}%`,
                                translateX: '-50%'
                            }}
                        >
                            <div className="bg-black/90 backdrop-blur-md border border-white/10 text-white px-3 py-2 rounded-lg shadow-xl flex flex-col items-center">
                                <span className="text-xs font-bold whitespace-nowrap">
                                    {hoveredDay.dayName} – {hoveredDay.status === 'happy' ? '45m Focus' : '15m Focus'}
                                </span>
                                <span className="text-[10px] text-white/50">{hoveredDay.date}</span>

                                {/* Tiny Arrow */}
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
