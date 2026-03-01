"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Smile, Meh, Frown, CloudRain, Sun, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
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

export default function MoodTrackerPage() {
    const router = useRouter();
    const { setMood, setRawMood } = useMood();

    const [step, setStep] = useState(1); // 1: Select, 2: Reflect, 3: Success
    const [selectedMood, setSelectedMood] = useState(null);
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleMoodSelect = (moodId) => {
        setSelectedMood(moodId);
        setStep(2); // Go to reflection
    }

    async function handleSubmit() {
        if (!selectedMood) return;

        setIsSubmitting(true);
        try {
            await api.mood.submit(selectedMood, notes);

            // --- STREAK LOGIC START ---
            const today = new Date().toISOString().split("T")[0];
            const lastLogged = localStorage.getItem("wecare_last_logged");
            let currentStreak = parseInt(localStorage.getItem("wecare_streak") || "0", 10);

            if (lastLogged !== today) {
                if (lastLogged) {
                    const diffTime = Math.abs(new Date(today) - new Date(lastLogged));
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays === 1) {
                        // Consecutive day
                        currentStreak += 1;
                    } else {
                        // Streak broken
                        currentStreak = 1;
                    }
                } else {
                    // First time logging
                    currentStreak = 1;
                }

                localStorage.setItem("wecare_streak", currentStreak.toString());
                localStorage.setItem("wecare_last_logged", today);
            }
            // --- STREAK LOGIC END ---

            // Set global mood context (grouped + raw)
            setRawMood(selectedMood);
            if (["sad", "anxious"].includes(selectedMood)) {
                setMood("low");
            } else if (["happy"].includes(selectedMood)) {
                setMood("positive");
            } else {
                setMood("neutral");
            }

            // Redirect to analysis page with mood data
            router.push(`/analysis?mood=${selectedMood}&notes=${encodeURIComponent(notes)}`);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    }

    // Step 3: Success screen
    if (step === 3) {
        // Simple recommendations logic
        const getRecommendations = (mood) => {
            switch (mood) {
                case "sad":
                case "anxious":
                    return [
                        { type: "Sonic", label: "Listen to Rain Sounds", action: () => router.push("/sonic") },
                        { type: "Breath", label: "4-7-8 Breathing", action: () => router.push("/dashboard") },
                        { type: "Read", label: "Today's Insight", action: () => router.push("/dashboard") }
                    ];
                case "happy":
                case "calm":
                    return [
                        { type: "Journal", label: "Save this moment", action: () => { } },
                        { type: "Share", label: "Share Gratitude", action: () => { } },
                        { type: "Sonic", label: "Uplifting Lo-Fi", action: () => router.push("/sonic") }
                    ];
                default:
                    return [
                        { type: "Walk", label: "Take a Walk", action: () => { } },
                        { type: "Drink", label: "Hydrate", action: () => { } },
                        { type: "Music", label: "Listen to Music", action: () => router.push("/sonic") }
                    ];
            }
        };

        const recommendations = getRecommendations(selectedMood);

        return (
            <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                {/* Visual Reward Background */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <EmotionalCore pulsing={true} />
                </div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center max-w-md relative z-10 w-full"
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5 }}
                    >
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
                                <button
                                    key={idx}
                                    onClick={rec.action}
                                    className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group"
                                >
                                    <span className="text-sm font-medium">{rec.label}</span>
                                    <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => router.push("/dashboard")}
                        className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all flex items-center gap-2 mx-auto"
                    >
                        Go to Dashboard <ArrowRight className="w-4 h-4" />
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer()}
            className="container mx-auto px-4 py-8 max-w-4xl"
        >
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        <motion.div variants={slideUp} className="mb-8 text-center">
                            <h1 className="text-3xl font-bold mb-2">How are you feeling right now?</h1>
                            <p className="text-muted-foreground">Select the emotion that best describes your current state.</p>
                        </motion.div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                            {MOODS.map((mood) => (
                                <motion.div
                                    key={mood.id}
                                    variants={scaleIn}
                                >
                                    <MoodCard
                                        {...mood}
                                        isSelected={selectedMood === mood.id}
                                        onClick={() => handleMoodSelect(mood.id)}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="max-w-xl mx-auto"
                    >
                        <button
                            onClick={() => setStep(1)}
                            className="text-sm text-muted-foreground hover:text-primary mb-4 flex items-center gap-1"
                        >
                            &larr; Back to moods
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

                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full p-4 rounded-xl border border-input bg-white/50 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none mb-6"
                                placeholder="..."
                                autoFocus
                            />

                            <div className="flex justify-end">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        "Save Entry"
                                    )}
                                </button>
                            </div>
                        </MotionCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
