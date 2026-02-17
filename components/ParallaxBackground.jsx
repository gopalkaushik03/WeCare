"use client";
import { useEffect } from "react";
import { useMood } from "@/context/MoodContext";

export default function ParallaxBackground() {
    const { mood } = useMood();

    useEffect(() => {
        // Sync mood to body for global CSS variables
        document.body.dataset.mood = mood;
    }, [mood]);

    return (
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
            {/* Simple ambient grain transparency if needed, or rely on body */}
            <div className="absolute inset-0 bg-white/5 opacity-50 mix-blend-overlay" />
        </div>
    );
}
