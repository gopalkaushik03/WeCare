"use client";
import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";
import { motion } from "framer-motion";

export default function FocusTimer() {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState("focus"); // 'focus' or 'rest'
    const endTimeRef = useRef(null);

    // Mock Stats - In a real app, these would come from a database or local storage context
    const stats = {
        today: "45m",
        weekly: { current: "3.5h", target: "10h" }
    };

    useEffect(() => {
        let interval = null;

        if (isActive) {
            if (!endTimeRef.current) {
                endTimeRef.current = Date.now() + timeLeft * 1000;
            }

            interval = setInterval(() => {
                const now = Date.now();
                const diff = Math.ceil((endTimeRef.current - now) / 1000);

                if (diff <= 0) {
                    clearInterval(interval);
                    setTimeLeft(0);
                    setIsActive(false);
                    endTimeRef.current = null;
                } else {
                    setTimeLeft(diff);
                }
            }, 100);
        } else {
            endTimeRef.current = null;
        }

        return () => clearInterval(interval);
    }, [isActive]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        endTimeRef.current = null;
        setTimeLeft(mode === "focus" ? 25 * 60 : 5 * 60);
    };

    const setFocusMode = () => {
        setMode("focus");
        setIsActive(false);
        endTimeRef.current = null;
        setTimeLeft(25 * 60);
    };

    const setRestMode = () => {
        setMode("rest");
        setIsActive(false);
        endTimeRef.current = null;
        setTimeLeft(5 * 60);
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="flex flex-col items-center justify-center h-full p-4 relative overflow-hidden">
            {/* Breathing Background Glow */}
            {isActive && mode === 'focus' && (
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-primary/20 blur-3xl rounded-full z-0"
                />
            )}

            {/* Header */}
            <div className="flex items-center gap-2 mb-8 relative z-10">
                <div className="p-2 bg-white/5 rounded-full border border-white/10">
                    <Timer className={`w-4 h-4 ${isActive ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {mode === "focus" ? "Deep Focus" : "Rest & Reset"}
                </span>
            </div>

            {/* Timer Display */}
            <div className="text-7xl md:text-8xl font-display font-medium tabular-nums mb-8 relative z-10 text-glow select-none tracking-tight">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center gap-6 w-full max-w-xs relative z-10">
                <div className="flex items-center gap-4 w-full">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleTimer}
                        className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl ${isActive
                            ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
                            : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
                            }`}
                    >
                        {isActive ? (
                            <> <Pause className="w-5 h-5 fill-current" /> Pause </>
                        ) : (
                            <> <Play className="w-5 h-5 fill-current" /> Start Focus </>
                        )}
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={resetTimer}
                        className="p-4 rounded-2xl bg-secondary/10 text-secondary-foreground hover:bg-secondary/20 transition-colors border border-secondary/20"
                        aria-label="Reset Timer"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </motion.button>
                </div>

                {/* Micro Stats */}
                <div className="grid grid-cols-2 w-full gap-4 text-center">
                    <div className="flex flex-col items-center p-2 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Today</span>
                        <span className="text-sm font-bold text-foreground">{stats.today}</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Weekly Goal</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-sm font-bold text-foreground">{stats.weekly.current}</span>
                            <span className="text-[10px] text-muted-foreground">/ {stats.weekly.target}</span>
                        </div>
                    </div>
                </div>

                {/* Mode Toggle Pills */}
                <div className="flex p-1 bg-black/20 rounded-full border border-white/5 w-full">
                    <button
                        onClick={setFocusMode}
                        className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${mode === 'focus'
                            ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Focus 25m
                    </button>
                    <button
                        onClick={setRestMode}
                        className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${mode === 'rest'
                            ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Break 5m
                    </button>
                </div>
            </div>
        </div>
    );
}
