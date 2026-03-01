"use client";
import { createContext, useContext, useState, useEffect } from "react";

const MoodContext = createContext({
    mood: "neutral",
    setMood: () => { },
    rawMood: "neutral",
    setRawMood: () => { },
    safeMode: false,
    setSafeMode: () => { },
});

export function MoodProvider({ children }) {
    const [mood, setMood] = useState("neutral");
    const [safeMode, setSafeMode] = useState(false);
    // rawMood stores the exact selected mood (happy/calm/neutral/sad/anxious)
    const [rawMood, setRawMoodState] = useState("neutral");

    // Restore from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("wecare_raw_mood");
        if (saved) setRawMoodState(saved);
    }, []);

    // Persist rawMood when it changes
    const setRawMood = (m) => {
        setRawMoodState(m);
        localStorage.setItem("wecare_raw_mood", m);
    };

    return (
        <MoodContext.Provider value={{ mood, setMood, rawMood, setRawMood, safeMode, setSafeMode }}>
            <div
                className="min-h-screen transition-colors duration-1000 ease-in-out"
                data-mood={mood}
            >
                {children}
            </div>
        </MoodContext.Provider>
    );
}

export function useMood() {
    return useContext(MoodContext);
}
