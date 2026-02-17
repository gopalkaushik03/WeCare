"use client";
import { motion } from "framer-motion";

const ITEMS = [
    "✨ Mindfulness",
    "🌊 Deep Focus",
    "🚀 AI Insights",
    "🌱 Growth",
    "🛡️ Safe Space",
    "🎵 Sonic Therapy",
    "🧠 Mental Clarity",
];

export default function InfiniteMarquee() {
    return (
        <div className="w-full overflow-hidden bg-white/5 border-y border-white/5 backdrop-blur-sm py-4">
            <motion.div
                className="flex whitespace-nowrap"
                animate={{ x: "-50%" }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: 20,
                }}
            >
                <div className="flex gap-12 px-6">
                    {[...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS].map((item, i) => (
                        <span
                            key={i}
                            className="text-lg md:text-xl font-display font-medium text-muted-foreground/80 tracking-wider uppercase"
                        >
                            {item}
                        </span>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
