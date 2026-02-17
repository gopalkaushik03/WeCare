"use client";
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useMood } from "@/context/MoodContext";
import { cn } from "@/lib/utils";

import { getVisualState } from "@/lib/visualEngine";

export default function EmotionalCore({ className, pulsing = false }) {
    const { mood } = useMood();
    const ref = useRef(null);

    // Mouse tracking for magnetism
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

    function handleMouseMove(e) {
        const rect = ref.current?.getBoundingClientRect();
        if (rect) {
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Calculate distance from center
            const distanceX = e.clientX - centerX;
            const distanceY = e.clientY - centerY;

            // Magnetic pull (limit range)
            x.set(distanceX / 10);
            y.set(distanceY / 10);
        }
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    // Get configs from Visual Engine
    const visualState = getVisualState(mood);
    const { colors, speed, scale } = visualState || { colors: ["#ccc", "#ddd"], speed: 1, scale: [1, 1] };

    // Use scale from visual engine or default, override if pulsing
    const animateScale = pulsing ? [1, 1.3, 0.9, 1] : (visualState.scale || [1, 1.05, 1]);
    const transitionDuration = pulsing ? 0.4 : (visualState.speed || 6);

    const gradient = `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: mouseX, y: mouseY }}
            className={cn("relative flex items-center justify-center w-64 h-64 cursor-pointer", className)}
        >
            {/* Core Orb */}
            <motion.div
                animate={{
                    scale: animateScale,
                    rotate: [0, 5, -5, 0],
                    borderRadius: ["50% 50% 50% 50%", "60% 40% 60% 40%", "40% 60% 40% 60%", "50% 50% 50% 50%"]
                }}
                transition={{
                    duration: transitionDuration,
                    repeat: pulsing ? 0 : Infinity,
                    ease: "easeInOut"
                }}
                className="w-48 h-48 blur-2xl opacity-80"
                style={{ background: gradient }}
            />

            {/* Inner Core (More defined) */}
            <motion.div
                animate={{
                    scale: Array.isArray(animateScale) ? animateScale.map(s => s * 0.8) : 0.8,
                }}
                transition={{
                    duration: transitionDuration,
                    repeat: pulsing ? 0 : Infinity,
                    ease: "easeInOut",
                    delay: 0.2
                }}
                className="absolute w-32 h-32 rounded-full blur-xl bg-white/40 mix-blend-overlay"
            />

            {/* Interactive Pulse Ring on Hover */}
            <motion.div
                whileHover={{ scale: 1.2, opacity: 0.1 }}
                className="absolute inset-0 rounded-full border-2 border-white/20 opacity-0 transition-opacity duration-500"
            />
        </motion.div>
    );
}
