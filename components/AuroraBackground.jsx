"use client";
import { motion, useMotionTemplate, useMotionValue, animate } from "framer-motion";
import { useEffect } from "react";
import { useMood } from "@/context/MoodContext";

export default function AuroraBackground() {
    const { mood } = useMood();

    // We'll rotate colors based on theme, but for aurora effect we want smooth drift
    // Using CSS variables defined in globals.css makes this theme-responsive automatically

    return (
        <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none bg-background transition-colors duration-500">
            {/* Base Gradient Layer */}
            <div className="absolute inset-0 opacity-40 mix-blend-screen filter blur-[80px]">
                <motion.div
                    animate={{
                        x: [0, 50, -50, 0],
                        y: [0, -30, 30, 0],
                    }}
                    transition={{
                        duration: 35, // Slowed down from 20
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute top-0 left-[-20%] w-[70vw] h-[70vw] rounded-full bg-[var(--aurora-1)] opacity-40"
                />
                <motion.div
                    animate={{
                        x: [0, -30, 30, 0],
                        y: [0, 40, -40, 0],
                    }}
                    transition={{
                        duration: 45, // Slowed down from 25
                        repeat: Infinity,
                        ease: "linear",
                        delay: 2
                    }}
                    className="absolute top-[20%] right-[-20%] w-[60vw] h-[60vw] rounded-full bg-[var(--aurora-2)] opacity-30"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{
                        duration: 25, // Slowed down from 15
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute bottom-[-10%] left-[20%] w-[80vw] h-[50vw] rounded-full bg-[var(--aurora-3)] mix-blend-overlay"
                />
            </div>

            {/* Grain Texture for Retro/Lo-Fi feel — inline SVG, no external dep */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundSize: '200px 200px',
                }}
            />
        </div>
    );
}
