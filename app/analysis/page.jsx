"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Brain, Lightbulb, BookOpen, ArrowLeft, RefreshCcw, Sparkles } from "lucide-react";
import MotionCard from "@/components/MotionCard";
import VideoSection from "@/components/VideoSection";
import ProfessionalSupport from "@/components/ProfessionalSupport";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import { slideUp, staggerContainer } from "@/lib/motion";

// NOTE: api import removed — analysis/page.jsx no longer calls Gemini.
// The result is read from sessionStorage, set by mood/page.jsx BEFORE navigation.
// This eliminates the double Gemini API call bug (Stage 1 fix).

export default function AnalysisPage() {
    const router = useRouter();
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingText, setLoadingText] = useState("Understanding your thoughts...");
    const [error, setError] = useState(false);

    // Cycle loading text
    useEffect(() => {
        if (loading) {
            const texts = ["Understanding your thoughts...", "Reflecting gently...", "Finding clarity..."];
            let i = 0;
            const interval = setInterval(() => {
                i = (i + 1) % texts.length;
                setLoadingText(texts[i]);
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [loading]);

    // Read analysis from sessionStorage — set by mood/page.jsx before navigation.
    // NO Gemini API call is made here. Single call, single cost.
    useEffect(() => {
        try {
            const raw = sessionStorage.getItem("wc_analysis");

            if (!raw) {
                // Direct navigation or page refresh — no result in sessionStorage.
                // Redirect back to mood entry so the user can resubmit.
                router.push("/mood");
                return;
            }

            const { result } = JSON.parse(raw);

            // Clean up immediately so a refresh sends the user back to /mood
            // rather than re-displaying a stale result.
            sessionStorage.removeItem("wc_analysis");

            if (result) {
                setAnalysis(result);
            } else {
                setError(true);
            }
        } catch (err) {
            console.error("Analysis read error:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [router]);

    // Loading State
    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-black text-white relative overflow-hidden">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-32 h-32 bg-cyan-500/20 blur-3xl rounded-full absolute"
                />
                <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-2 border-cyan-500/30 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
                    </div>
                    <p className="text-zinc-400 font-medium text-sm animate-pulse">{loadingText}</p>
                </div>
            </div>
        );
    }

    // Error State
    if (error || !analysis) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen p-4 text-center bg-black text-white">
                <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-lg">
                    <div className="bg-red-500/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <RefreshCcw className="w-6 h-6 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Connection Issue</h2>
                    <p className="text-zinc-400 mb-6">We couldn't reach the AI at the moment.</p>
                    <button onClick={() => window.location.reload()} className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all">Try Again</button>
                    <button onClick={() => router.push("/dashboard")} className="w-full mt-3 py-3 text-zinc-500 hover:text-white transition-colors text-sm">Return to Dashboard</button>
                </div>
            </div>
        );
    }

    const riskLevel = analysis.risk_level || "low";

    return (
        <motion.div
            variants={staggerContainer()}
            initial="hidden"
            animate="show"
            className="min-h-screen bg-black text-white pb-20 font-sans"
        >
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Header Nav */}
                <button
                    onClick={() => router.push("/dashboard")}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </button>

                {/* Title Section */}
                <motion.div variants={slideUp} className="mb-12 text-center">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                        Your Personal Insight
                    </h1>
                    <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
                        A gentle reflection on your thoughts, powered by AI.
                    </p>
                </motion.div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {/* Summary Card */}
                    <MotionCard className="md:col-span-2 bg-zinc-900 border-zinc-800 shadow-2xl">
                        <div className="flex flex-col md:flex-row items-start gap-6">
                            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-4 rounded-2xl">
                                <Brain className="w-8 h-8 text-cyan-400" />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-xl font-bold text-white">Analysis Summary</h2>
                                <p className="text-zinc-300 leading-relaxed text-lg">
                                    {analysis.summary || "Unable to generate summary."}
                                </p>
                            </div>
                        </div>
                    </MotionCard>

                    {/* Insight Card */}
                    {analysis.insight && (
                        <MotionCard delay={0.1} className="bg-zinc-900 border-zinc-800">
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2">
                                    <Sparkles className="w-3 h-3" /> Psychological Context
                                </h3>
                                <p className="text-zinc-200 leading-relaxed font-medium">
                                    {analysis.insight}
                                </p>
                            </div>
                        </MotionCard>
                    )}

                    {/* Reframe Card */}
                    {analysis.reframe && (
                        <MotionCard delay={0.2} className="bg-zinc-900 border-zinc-800">
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
                                    <Lightbulb className="w-3 h-3" /> A Gentle Reframe
                                </h3>
                                <p className="text-zinc-200 leading-relaxed italic border-l-2 border-amber-500/50 pl-4">
                                    &ldquo;{analysis.reframe}&rdquo;
                                </p>
                            </div>
                        </MotionCard>
                    )}
                </div>

                {/* Suggestions & Resources Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {/* Suggestions List */}
                    <motion.div variants={slideUp} className="space-y-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-400" /> Suggested Actions
                        </h3>
                        <ul className="space-y-3">
                            {Array.isArray(analysis.suggestions) && analysis.suggestions.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800/80 transition-all group">
                                    <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center bg-zinc-800 text-zinc-400 rounded-full text-xs font-bold group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-colors">
                                        {idx + 1}
                                    </span>
                                    <span className="text-zinc-300 text-sm">{typeof item === 'string' ? item : item.text || item.description || 'Suggestion'}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Resources List */}
                    <motion.div variants={slideUp} className="space-y-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-400" /> Helpful Resources
                        </h3>
                        <div className="grid gap-3">
                            {Array.isArray(analysis.resources) && analysis.resources.length > 0 ? (
                                analysis.resources.map((res, idx) => (
                                    <div key={idx} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 text-sm font-medium flex items-center justify-between hover:border-zinc-700 transition-colors">
                                        {typeof res === 'string' ? res : res.title || res.description || 'Resource'}
                                        <ArrowLeft className="w-4 h-4 rotate-180 text-zinc-600" />
                                    </div>
                                ))
                            ) : (
                                <div className="p-6 bg-zinc-900/50 border border-zinc-800 border-dashed rounded-xl text-center">
                                    <p className="text-zinc-500 text-sm">
                                        No specific readings for this moment.<br />
                                        Focus on the actions above.
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Support Section */}
                <div className="space-y-12 border-t border-zinc-800 pt-12">
                    {riskLevel === 'high' && <motion.div variants={slideUp}><ProfessionalSupport riskLevel={riskLevel} /></motion.div>}
                    <motion.div variants={slideUp}><VideoSection riskLevel={riskLevel} /></motion.div>
                    {riskLevel !== 'high' && <motion.div variants={slideUp}><ProfessionalSupport riskLevel={riskLevel} /></motion.div>}
                </div>

                <SafetyDisclaimer />
            </div>
        </motion.div>
    );
}