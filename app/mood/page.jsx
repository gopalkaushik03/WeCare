"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Smile, Meh, Frown, CloudRain, Sun, Loader2, CheckCircle2, ArrowRight, Brain } from "lucide-react";
import MotionCard from "@/components/MotionCard";
import MoodCard from "@/components/MoodCard";
import { api } from "@/lib/api";
import { staggerContainer, slideUp, fadeIn, scaleIn } from "@/lib/motion";
import { useMood } from "@/context/MoodContext";
import { REFLECTION_QUESTIONS, MICRO_INSIGHTS } from "@/lib/data";
import EmotionalCore from "@/components/EmotionalCore";

const MOODS = [
    { id: "happy", label: "Happy", icon: Smile, color: "bg-yellow-400" },
    { id: "calm", label: "Calm", icon: Sun, color: "bg-orange-300" },
    { id: "neutral", label: "Neutral", icon: Meh, color: "bg-gray-300" },
    { id: "sad", label: "Sad", icon: Frown, color: "bg-blue-400" },
    { id: "anxious", label: "Anxious", icon: CloudRain, color: "bg-purple-400" },
];

// -------------------------------------------------------------------
// Cognitive Load Hook — client-side only, zero data sent to server
// except the final score
// -------------------------------------------------------------------
function useCognitiveLoad() {
    const keystrokeTimesRef = useRef([]);
    const backspaceCountRef = useRef(0);
    const pauseCountRef = useRef(0);
    const lastKeystrokeRef = useRef(null);
    const [score, setScore] = useState(0); // 0–100

    const onKeyDown = useCallback((e) => {
        const now = Date.now();

        if (e.key === "Backspace") backspaceCountRef.current += 1;

        if (lastKeystrokeRef.current) {
            const gap = now - lastKeystrokeRef.current;
            if (gap > 2000) pauseCountRef.current += 1; // >2s pause counts as hesitation
        }
        lastKeystrokeRef.current = now;
        keystrokeTimesRef.current.push(now);

        // Recompute score every ~5 keystrokes
        if (keystrokeTimesRef.current.length % 5 === 0) {
            const totalKeys = keystrokeTimesRef.current.length;
            const backspaces = backspaceCountRef.current;
            const pauses = pauseCountRef.current;

            // Compute WPM (assume 5 chars/word)
            const times = keystrokeTimesRef.current;
            const elapsed = (times[times.length - 1] - times[0]) / 1000 / 60 || 0.01;
            const wpm = (totalKeys / 5) / elapsed;

            // Normalise components 0–100
            const wpmScore = Math.min(100, (wpm / 80) * 100);   // 80 WPM = max calm
            const backspaceScore = Math.min(100, (backspaces / totalKeys) * 400); // >25% = high
            const pauseScore = Math.min(100, pauses * 15);          // each pause adds 15

            // Weighted composite
            const raw = (backspaceScore * 0.4) + (pauseScore * 0.4) + ((100 - wpmScore) * 0.2);
            setScore(Math.round(Math.min(100, raw)));
        }
    }, []);

    const reset = useCallback(() => {
        keystrokeTimesRef.current = [];
        backspaceCountRef.current = 0;
        pauseCountRef.current = 0;
        lastKeystrokeRef.current = null;
        setScore(0);
    }, []);

    return { score, onKeyDown, reset };
}

// -------------------------------------------------------------------
// Cognitive Load Gauge — circular SVG
// -------------------------------------------------------------------
function CognitiveLoadGauge({ score }) {
    const radius = 16;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (score / 100) * circ;

    const color =
        score > 70 ? "#ef4444" :   // red — high load
            score > 40 ? "#f59e0b" :   // amber — medium
                "#22c55e";    // green — low

    const label =
        score > 70 ? "High" :
            score > 40 ? "Medium" : "Low";

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2"
            title={`Cognitive Load: ${score}/100`}
        >
            <svg width="40" height="40" viewBox="0 0 40 40">
                {/* Track */}
                <circle cx="20" cy="20" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                {/* Progress */}
                <circle
                    cx="20" cy="20" r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform="rotate(-90 20 20)"
                    style={{ transition: "stroke-dashoffset 0.4s ease, stroke 0.4s ease" }}
                />
                <text x="20" y="24" textAnchor="middle" fontSize="9" fill={color} fontWeight="bold">
                    {score}
                </text>
            </svg>
            <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <Brain className="w-2.5 h-2.5" /> Load
                </span>
                <span className="text-[10px] font-semibold" style={{ color }}>{label}</span>
            </div>
        </motion.div>
    );
}

// -------------------------------------------------------------------
// Main Page
// -------------------------------------------------------------------
export default function MoodTrackerPage() {
    const router = useRouter();
    const { setMood, setRawMood } = useMood();
    const { score: clScore, onKeyDown: clOnKeyDown, reset: clReset } = useCognitiveLoad();

    const [step, setStep] = useState(1);
    const [selectedMood, setSelectedMood] = useState(null);
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showGauge, setShowGauge] = useState(false);

    const handleMoodSelect = (moodId) => {
        setSelectedMood(moodId);
        clReset();
        setStep(2);
    };

    async function handleSubmit() {
        if (!selectedMood) return;
        setIsSubmitting(true);
        try {
            // 1. Call Gemini analysis (with cognitive load score)
            const analysisResult = await api.analysis.submit(
                selectedMood,
                notes,
                clScore > 0 ? clScore : null
            );

            // 2. Persist the entry to MongoDB
            await api.mood.submit(
                selectedMood,
                notes,
                analysisResult.success ? analysisResult.analysis : {}
            );

            // 3. Update global mood context
            setRawMood(selectedMood);
            if (["sad", "anxious"].includes(selectedMood)) setMood("low");
            else if (["happy"].includes(selectedMood)) setMood("positive");
            else setMood("neutral");

            // 4. Store the result in sessionStorage so analysis page can read it
            //    without making a second Gemini API call (fixes double-call bug).
            //    Notes are intentionally NOT stored in the URL to protect PII.
            sessionStorage.setItem(
                "wc_analysis",
                JSON.stringify({
                    result: analysisResult.success ? analysisResult.analysis : null,
                    mood: selectedMood,
                    clScore,
                })
            );

            // 5. Navigate to analysis — clean URL, no query params
            router.push("/analysis");
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    }

    // Show gauge only once user starts typing
    const handleNotesChange = (e) => {
        setNotes(e.target.value);
        if (!showGauge && e.target.value.length > 5) setShowGauge(true);
    };

    // Step 3 success screen (unchanged from original)
    if (step === 3) {
        const getRecommendations = (mood) => {
            switch (mood) {
                case "sad": case "anxious":
                    return [
                        { type: "Sonic", label: "Listen to Rain Sounds", action: () => router.push("/sonic") },
                        { type: "Breath", label: "4-7-8 Breathing", action: () => router.push("/dashboard") },
                        { type: "Read", label: "Today's Insight", action: () => router.push("/dashboard") },
                    ];
                case "happy": case "calm":
                    return [
                        { type: "Journal", label: "Save this moment", action: () => { } },
                        { type: "Share", label: "Share Gratitude", action: () => { } },
                        { type: "Sonic", label: "Uplifting Lo-Fi", action: () => router.push("/sonic") },
                    ];
                default:
                    return [
                        { type: "Walk", label: "Take a Walk", action: () => { } },
                        { type: "Drink", label: "Hydrate", action: () => { } },
                        { type: "Music", label: "Listen to Music", action: () => router.push("/sonic") },
                    ];
            }
        };

        const recommendations = getRecommendations(selectedMood);
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <EmotionalCore pulsing={true} />
                </div>
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="text-center max-w-md relative z-10 w-full">
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>
                        <CheckCircle2 className="w-20 h-20 text-green-500 mb-6 mx-auto" />
                    </motion.div>
                    <h2 className="text-3xl font-bold mb-4">Logged Successfully!</h2>
                    <MotionCard className="bg-primary/5 border-primary/20 p-6 mb-6">
                        <h3 className="font-semibold text-primary mb-2">Micro-Insight</h3>
                        <p className="text-muted-foreground italic">
                            &ldquo;{MICRO_INSIGHTS[selectedMood] || "Taking a moment to check in makes a difference."}&rdquo;
                        </p>
                    </MotionCard>
                    <div className="bg-white/5 rounded-2xl p-4 mb-8 border border-white/10">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recommended Next Steps</h3>
                        <div className="space-y-2">
                            {recommendations.map((rec, idx) => (
                                <button key={idx} onClick={rec.action}
                                    className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group">
                                    <span className="text-sm font-medium">{rec.label}</span>
                                    <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    </div>
                    <button onClick={() => router.push("/dashboard")}
                        className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all flex items-center gap-2 mx-auto">
                        Go to Dashboard <ArrowRight className="w-4 h-4" />
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div initial="initial" animate="animate" variants={staggerContainer()}
            className="container mx-auto px-4 py-8 max-w-4xl">
            <AnimatePresence mode="wait">
                {/* Step 1 — Mood Selection */}
                {step === 1 && (
                    <motion.div key="step1"
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                        <motion.div variants={slideUp} className="mb-8 text-center">
                            <h1 className="text-3xl font-bold mb-2">How are you feeling right now?</h1>
                            <p className="text-muted-foreground">Select the emotion that best describes your current state.</p>
                        </motion.div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                            {MOODS.map((mood) => (
                                <motion.div key={mood.id} variants={scaleIn}>
                                    <MoodCard {...mood} isSelected={selectedMood === mood.id} onClick={() => handleMoodSelect(mood.id)} />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Step 2 — Reflection + Cognitive Load */}
                {step === 2 && (
                    <motion.div key="step2"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="max-w-xl mx-auto">
                        <button onClick={() => setStep(1)}
                            className="text-sm text-muted-foreground hover:text-primary mb-4 flex items-center gap-1">
                            ← Back to moods
                        </button>

                        <MotionCard className="p-8 bg-white/60 backdrop-blur-md">
                            <div className="text-center mb-6">
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                    Reflection
                                </span>
                                <h2 className="text-2xl font-bold mt-4 mb-2">
                                    {REFLECTION_QUESTIONS[selectedMood]}
                                </h2>
                            </div>

                            {/* Notes textarea */}
                            <div className="relative mb-4">
                                <textarea
                                    value={notes}
                                    onChange={handleNotesChange}
                                    onKeyDown={clOnKeyDown}
                                    maxLength={2000}
                                    className="w-full p-4 rounded-xl border border-input bg-white/50 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                                    placeholder="..."
                                    autoFocus
                                />
                                <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                                    {notes.length}/2000
                                </div>
                            </div>

                            {/* Cognitive Load Gauge — fades in once user starts typing */}
                            <AnimatePresence>
                                {showGauge && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex items-center justify-between mb-4 px-3 py-2 rounded-xl bg-white/5 border border-white/10"
                                    >
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                Mental Effort Detected
                                            </p>
                                            <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                                                Based on your typing rhythm — not shared with anyone.
                                            </p>
                                        </div>
                                        <CognitiveLoadGauge score={clScore} />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex justify-end">
                                <button onClick={handleSubmit} disabled={isSubmitting}
                                    className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                    {isSubmitting ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Analysing...</>
                                    ) : "Save Entry"}
                                </button>
                            </div>
                        </MotionCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
