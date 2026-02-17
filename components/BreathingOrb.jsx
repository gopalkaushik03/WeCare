"use client";
import { motion } from "framer-motion";

export default function BreathingOrb() {
    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-full h-full flex items-center justify-center overflow-hidden pointer-events-none">
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                    rotate: [0, 45, 0],
                }}
                transition={{
                    duration: 10,
                    ease: "easeInOut",
                    repeat: Infinity,
                }}
                className="aurora-blob w-[500px] h-[500px] md:w-[800px] md:h-[800px] rounded-full bg-gradient-to-r from-primary/30 to-purple-500/30 blur-[60px] filter"
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.3, 0.6, 0.3],
                    rotate: [0, -45, 0],
                }}
                transition={{
                    duration: 15,
                    ease: "easeInOut",
                    repeat: Infinity,
                }}
                className="aurora-blob absolute w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full bg-gradient-to-b from-blue-500/20 to-cyan-400/20 blur-[50px] filter"
            />
        </div>
    );
}
