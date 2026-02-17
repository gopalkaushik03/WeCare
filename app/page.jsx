"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Sparkles, Headphones } from "lucide-react";
import SpotlightCard from "@/components/SpotlightCard";

// Dynamically import Scene (R3F) - client-side only
const Scene = dynamic(() => import("@/components/Scene"), {
    ssr: false,
    loading: () => (
        <div className="fixed inset-0 z-0 bg-[#0B0C10] flex items-center justify-center">
            <div className="text-cyan-400 text-sm animate-pulse">Loading 3D Scene...</div>
        </div>
    ),
});

export default function Home() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <>
            {/* Fixed 3D Background - Only render after mounting */}
            {mounted && (
                <>
                    <div className="fixed inset-0 z-0 animate-subtle-gradient opacity-60 pointer-events-none" />
                    <Scene />
                </>
            )}

            {/* Scrollable HTML Content */}
            <div id="scroll-container" className="relative z-10 pointer-events-none">
                {/* Section 1: Hero - Let particles shine */}
                <section className="min-h-screen flex items-center justify-center relative px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <motion.h1
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="text-6xl md:text-8xl font-display font-bold text-white mb-6 pointer-events-auto tracking-tight transform-gpu"
                        >
                            Find Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Inner Balance.</span>
                        </motion.h1>
                        <p className="text-xl md:text-2xl text-slate-300 pointer-events-auto mb-10 max-w-2xl mx-auto leading-relaxed">
                            Your personal AI companion for mental wellness. Track moods, gain insights, and find focus in a safe, judgment-free space.
                        </p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 1.5 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto"
                        >
                            <Link href="/signup">
                                <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(34,211,238,0.6)" }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-lg font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
                                >
                                    Start Your Journey
                                    <ArrowRight className="w-5 h-5" />
                                </motion.button>
                            </Link>

                        </motion.div>
                    </motion.div>

                    {/* Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2, duration: 1 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-auto"
                    >
                        <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-cyan-500 to-transparent opacity-50"></div>
                    </motion.div>
                </section>

                {/* Section 2: Features - Appear as heart forms */}
                <section id="features" className="min-h-screen py-32 px-6 container mx-auto relative">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                            Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Thrive</span>
                        </h2>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                            Powerful tools designed to help you understand yourself better and build lasting mental resilience.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {/* Card 1: Mood Tracking */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            whileHover={{ y: -10 }}
                            className="pointer-events-auto"
                        >
                            <SpotlightCard className="h-full bg-card/30 backdrop-blur-md border border-white/5 rounded-3xl p-8 hover:border-cyan-500/30 transition-all duration-300">
                                <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 text-cyan-400">
                                    <TrendingUp className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 font-display text-white">
                                    Mood Tracking
                                </h3>
                                <p className="text-slate-400 leading-relaxed">
                                    Log your daily emotions with our intuitive interface. Identify triggers and visualize your emotional patterns over time.
                                </p>
                            </SpotlightCard>
                        </motion.div>

                        {/* Card 2: AI Insights (Emphasized) */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            whileHover={{ y: -10, scale: 1.02 }}
                            className="pointer-events-auto relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent rounded-3xl pointer-events-none" />
                            <SpotlightCard className="h-full bg-card/40 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 shadow-2xl shadow-purple-900/20 hover:border-purple-500/50 transition-all duration-300 relative z-10">
                                <div className="absolute top-4 right-4 bg-purple-500 text-white text-[10px] font-bold px-2 py-1 rounded-full tracking-wide">
                                    POWERED BY GEMINI
                                </div>
                                <div className="h-14 w-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                                    <Sparkles className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 font-display text-white">
                                    AI Insights
                                </h3>
                                <p className="text-slate-300 leading-relaxed font-medium">
                                    Receive personalized, empathetic guidance. Our AI analyzes your inputs to provide actionable advice tailored just for you.
                                </p>
                            </SpotlightCard>
                        </motion.div>

                        {/* Card 3: Sonic Therapy */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            whileHover={{ y: -10 }}
                            className="pointer-events-auto"
                        >
                            <SpotlightCard className="h-full bg-card/30 backdrop-blur-md border border-white/5 rounded-3xl p-8 hover:border-pink-500/30 transition-all duration-300">
                                <div className="h-14 w-14 rounded-2xl bg-pink-500/10 flex items-center justify-center mb-6 text-pink-400">
                                    <Headphones className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 font-display text-white">
                                    Sonic Therapy
                                </h3>
                                <p className="text-slate-400 leading-relaxed">
                                    Immerse yourself in binaural beats and Lo-Fi mixes curated to help you focus, relax, or sleep better.
                                </p>
                            </SpotlightCard>
                        </motion.div>
                    </div>

                    {/* Extra spacing for scroll */}
                    <div className="h-32"></div>
                </section>
            </div>
        </>
    );
}
