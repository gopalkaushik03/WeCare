"use client";
import React, { useState, useEffect } from "react";
import { Lightbulb, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WeeklyInsight() {
    const [isOpen, setIsOpen] = useState(false);
    const [insight, setInsight] = useState({
        title: "The 4-7-8 Breathing Technique",
        text: "Inhale for 4 seconds, hold for 7, and exhale for 8. This simple pattern reduces anxiety and helps you sleep better."
    });

    // Dynamic Insight Logic
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 10) {
            setInsight({
                title: "Morning Clarity",
                text: "Start your day with intention. A 5-minute focus session now sets the tone for the entire day."
            });
        } else if (hour > 20) {
            setInsight({
                title: "Wind Down Protocol",
                text: "Disconnect from screens. A short breathing exercise now can improve your sleep quality by 30%."
            });
        }
        // Default remains 4-7-8 for midday
    }, []);

    return (
        <div className="h-full flex flex-col relative">
            <div className="flex items-center gap-2 mb-3 text-amber-500">
                <Lightbulb className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Weekly Insight</span>
            </div>
            <div className="flex-1 flex flex-col justify-center relative z-10">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                    {insight.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed">
                    {insight.text}
                </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 flex justify-between items-center relative z-10">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Mindfulness Tip</span>
                <button
                    onClick={() => setIsOpen(true)}
                    className="text-xs font-bold text-primary hover:text-primary/80 transition-all flex items-center gap-1 group"
                >
                    Try it now
                    <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </button>
            </div>

            {/* Breathing Overlay Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative w-full max-w-md aspect-square flex flex-col items-center justify-center">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-0 right-0 p-4 text-white/50 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {/* Breathing Circles */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.5, 1.5, 1],
                                    opacity: [0.3, 0.6, 0.6, 0.3]
                                }}
                                transition={{
                                    duration: 19, // 4-7-8 cycle
                                    repeat: Infinity,
                                    times: [0, 0.21, 0.58, 1],
                                    ease: "easeInOut"
                                }}
                                className="absolute inset-0 bg-primary/20 rounded-full blur-3xl"
                            />

                            <motion.div
                                animate={{ scale: [1, 1.3, 1.3, 1] }}
                                transition={{
                                    duration: 19,
                                    repeat: Infinity,
                                    times: [0, 0.21, 0.58, 1],
                                    ease: "easeInOut"
                                }}
                                className="w-48 h-48 rounded-full border-2 border-primary/30 flex items-center justify-center relative bg-black/40 backdrop-blur-xl"
                            >
                                <motion.div
                                    className="text-center"
                                    animate={{ opacity: [0, 1, 1, 0] }}
                                    transition={{ duration: 19, repeat: Infinity, times: [0, 0.1, 0.9, 1] }}
                                >
                                    <span className="text-4xl font-display font-bold text-white block mb-1">4-7-8</span>
                                    <span className="text-xs text-primary uppercase tracking-widest">Breathe</span>
                                </motion.div>
                            </motion.div>

                            <div className="mt-12 text-center space-y-2">
                                <motion.p
                                    animate={{ opacity: [0, 1, 1, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, repeatDelay: 15 }}
                                    className="text-xl font-medium text-white"
                                >
                                    Inhale Deeply (4s)
                                </motion.p>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0, 0, 1, 1, 0] }}
                                    transition={{ duration: 19, repeat: Infinity, times: [0, 0.21, 0.22, 0.57, 0.58] }}
                                    className="text-xl font-medium text-white absolute bottom-10 left-0 right-0"
                                >
                                    Hold Breath (7s)
                                </motion.p>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0, 0, 1, 1, 0] }}
                                    transition={{ duration: 19, repeat: Infinity, times: [0, 0.58, 0.59, 0.99, 1] }}
                                    className="text-xl font-medium text-white absolute bottom-10 left-0 right-0"
                                >
                                    Exhale Slowly (8s)
                                </motion.p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
