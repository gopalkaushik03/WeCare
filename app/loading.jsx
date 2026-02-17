"use client";
import { motion } from "framer-motion";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            <div className="relative flex flex-col items-center justify-center gap-6">
                {/* Pulsing Background Rings */}
                <div className="absolute w-24 h-24 bg-primary/10 rounded-full animate-ping" />
                <div className="absolute w-32 h-32 bg-primary/5 rounded-full animate-ping animation-delay-300" />

                {/* Main Logo Circle */}
                <motion.div
                    className="w-16 h-16 bg-gradient-to-tr from-primary via-purple-400 to-primary rounded-full shadow-[0_0_40px_rgba(102,252,241,0.5)]"
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.8, 1, 0.8],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                {/* Loading Text */}
                <motion.p
                    className="text-sm font-medium text-muted-foreground tracking-wider uppercase"
                    animate={{
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    Loading WeCare...
                </motion.p>
            </div>
        </div>
    );
}
