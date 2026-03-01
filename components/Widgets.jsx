"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, Trash2, Check, Wind, Flame, TreeDeciduous } from "lucide-react";

export function ZenGarden() {
    const [streak, setStreak] = useState(0);
    const [stage, setStage] = useState(0); // 0: Seed, 1: Sprout, 2: Sapling, 3: Tree, 4: Ancient

    useEffect(() => {
        // Read and Apply Decay Logic on Mount
        const today = new Date().toISOString().split("T")[0];
        const lastLogged = localStorage.getItem("wecare_last_logged");
        let currentStreak = parseInt(localStorage.getItem("wecare_streak") || "0", 10);

        if (lastLogged && lastLogged !== today) {
            const diffTime = Math.abs(new Date(today) - new Date(lastLogged));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 1) {
                // Missed more than 1 day -> Reset
                currentStreak = 0;
                localStorage.setItem("wecare_streak", "0"); // Persist reset
            }
            // If diffDays === 1, we preserve streak (waiting for today's log)
        }

        setStreak(currentStreak);
        determineStage(currentStreak);
    }, []);

    const determineStage = (s) => {
        if (s === 0) setStage(0);       // Seed
        else if (s < 3) setStage(1);    // Sprout
        else if (s < 7) setStage(2);    // Sapling
        else if (s < 30) setStage(3);   // Tree
        else setStage(4);               // Ancient
    };

    // Visual configurations for each stage
    const stageConfig = {
        0: { icon: Sprout, color: "text-stone-400 dark:text-stone-500", scale: 0.8, text: "Plant a seed today." },
        1: { icon: Sprout, color: "text-green-400", scale: 1, text: "It's growing!" },
        2: { icon: Sprout, color: "text-green-500", scale: 1.2, text: "Keep nurturing it." },
        3: { icon: TreeDeciduous, color: "text-emerald-500", scale: 1.5, text: "Strong roots formed." },
        4: { icon: Flame, color: "text-orange-500", scale: 1.8, text: "Unstoppable!" },
    };

    const currentConfig = stageConfig[stage];
    const Icon = currentConfig.icon;

    // Milestone Logic
    const milestones = [3, 7, 30, 60, 100];
    const nextMilestone = milestones.find(m => m > streak) || 100;
    const daysToGo = nextMilestone - streak;
    const progressPercent = Math.min(100, (streak / nextMilestone) * 100);

    return (
        <div className="h-full flex flex-col items-center justify-center relative overflow-hidden p-6 group">
            {/* Streak Badge */}
            <div className="absolute top-4 right-4 bg-white/5 px-3 py-1 rounded-full border border-white/10 z-20">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Flame className={`w-3 h-3 ${streak > 0 ? 'fill-orange-500 text-orange-500' : 'text-slate-400'}`} />
                    {streak} Day Streak
                </span>
            </div>

            {/* Main Animated Icon */}
            <div className="relative z-10 mb-4">
                {/* Dynamic Glow Aura */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute inset-0 blur-3xl rounded-full ${streak > 30 ? 'bg-orange-500/30' : streak > 0 ? 'bg-green-500/20' : 'bg-transparent'} transition-colors duration-1000`}
                />

                <motion.div
                    animate={{
                        scale: currentConfig.scale,
                        rotate: [0, 2, -2, 0],
                        y: [0, -5, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Icon className={`w-20 h-20 ${currentConfig.color} drop-shadow-2xl transition-colors duration-500`} strokeWidth={1.5} />
                </motion.div>
            </div>

            {/* Stage Text */}
            <div className="text-center z-10">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {currentConfig.text}
                </p>

                {/* Milestone Progress */}
                <div className="mt-4 w-full max-w-[120px] mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                        <span>Next: {nextMilestone} Days</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className={`h-full rounded-full ${streak > 0 ? 'bg-primary' : 'bg-slate-600'}`}
                        />
                    </div>
                    <p className="text-[9px] text-center mt-1 text-slate-500">{daysToGo} days to go</p>
                </div>
            </div>
        </div>
    );
}

export function ThoughtShredder() {
    const [step, setStep] = useState(0); // 0: Mood, 1: Thought, 2: Control, 3: Action, 4: Done
    const [data, setData] = useState({ mood: "", thought: "", isControl: null, action: "" });
    const [isShredding, setIsShredding] = useState(false);

    const moods = [
        { icon: "🙂", label: "Okay" },
        { icon: "😔", label: "Sad" },
        { icon: "😡", label: "Angry" },
        { icon: "😰", label: "Anxious" },
        { icon: "😴", label: "Tired" }
    ];

    const handleNext = () => setStep(step + 1);

    const handleShred = () => {
        setIsShredding(true);
        setTimeout(() => {
            setStep(4); // Success state
            setIsShredding(false);

            // Reset after delay
            setTimeout(() => {
                setStep(0);
                setData({ mood: "", thought: "", isControl: null, action: "" });
            }, 3000);
        }, 1500);
    };

    return (
        <div className="h-full flex flex-col p-2">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
                <Trash2 className="w-4 h-4 text-destructive" /> Negative Processor
            </h3>

            <div className="flex-1 relative flex flex-col">
                <AnimatePresence mode="wait">
                    {/* Step 0: Mood Selection */}
                    {step === 0 && (
                        <motion.div
                            key="step0"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col gap-4 h-full"
                        >
                            <p className="text-sm font-medium">How are you feeling right now?</p>
                            <div className="grid grid-cols-5 gap-2">
                                {moods.map((m) => (
                                    <button
                                        key={m.label}
                                        onClick={() => {
                                            setData({ ...data, mood: m.label });
                                            handleNext();
                                        }}
                                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 hover:scale-105 transition-all text-2xl"
                                        title={m.label}
                                    >
                                        {m.icon}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 1: Write Thought */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col h-full"
                        >
                            <p className="text-sm font-medium mb-2">What's weighing you down?</p>
                            <textarea
                                className="flex-1 bg-background/30 border border-white/10 rounded-xl p-3 text-sm resize-none focus:ring-1 focus:ring-primary/50 outline-none placeholder:text-muted-foreground/30 mb-2"
                                placeholder="Pour it out here..."
                                value={data.thought}
                                onChange={(e) => setData({ ...data, thought: e.target.value })}
                                autoFocus
                            />
                            <button
                                onClick={handleNext}
                                disabled={!data.thought}
                                className="py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-bold uppercase transition-colors disabled:opacity-50"
                            >
                                Next
                            </button>
                        </motion.div>
                    )}

                    {/* Step 2: Control Check */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col h-full justify-center gap-4"
                        >
                            <p className="text-sm font-medium text-center">Is this within your control?</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setData({ ...data, isControl: true });
                                        handleNext();
                                    }}
                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 font-bold text-sm transition-all"
                                >
                                    Yes
                                </button>
                                <button
                                    onClick={() => {
                                        setData({ ...data, isControl: false });
                                        handleNext();
                                    }}
                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 font-bold text-sm transition-all text-muted-foreground hover:text-foreground"
                                >
                                    No
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Action or Shred */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{
                                opacity: 0,
                                scaleY: 0,
                                skewX: 20,
                                filter: "blur(10px)",
                                transition: { duration: 1.5 }
                            }} // Shredding exit animation
                            className="flex flex-col h-full"
                        >
                            <p className="text-sm font-medium mb-2">
                                {data.isControl
                                    ? "What's one small step you can take?"
                                    : "Since you can't control it, ready to let go?"}
                            </p>

                            {data.isControl ? (
                                <textarea
                                    className="flex-1 bg-background/30 border border-white/10 rounded-xl p-3 text-sm resize-none focus:ring-1 focus:ring-green-500/50 outline-none placeholder:text-muted-foreground/30 mb-2"
                                    placeholder="I will..."
                                    value={data.action}
                                    onChange={(e) => setData({ ...data, action: e.target.value })}
                                    autoFocus
                                />
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs italic p-4 bg-white/5 rounded-xl border border-white/5 mb-2">
                                    &ldquo;{data.thought}&rdquo;
                                </div>
                            )}

                            <button
                                onClick={handleShred}
                                disabled={isShredding || (data.isControl && !data.action)}
                                className={`w-full py-3 bg-destructive hover:bg-destructive/90 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-destructive/20 active:scale-95 ${isShredding ? 'opacity-80' : ''}`}
                            >
                                {isShredding ? (
                                    <span className="flex items-center justify-center gap-2 animate-pulse">
                                        <Wind className="w-4 h-4 animate-spin" /> Shredding...
                                    </span>
                                ) : "Let It Go"}
                            </button>
                        </motion.div>
                    )}

                    {/* Step 4: Success */}
                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col items-center justify-center text-green-500 bg-background/30 rounded-xl border border-green-500/20"
                        >
                            <Check className="w-12 h-12 mb-2" />
                            <span className="text-xs font-bold tracking-widest uppercase mb-1">Processed</span>
                            <span className="text-[10px] text-muted-foreground">You're doing great.</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
