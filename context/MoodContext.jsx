"use client";
import { createContext, useContext, useState, useEffect } from "react";

const MoodContext = createContext({
    mood: "neutral",
    setMood: () => { },
    safeMode: false,
    setSafeMode: () => { },
});

export function MoodProvider({ children }) {
    const [mood, setMood] = useState("neutral");
    const [safeMode, setSafeMode] = useState(false);

    // Optional: Persist mood or sync with user data later
    // For now, it resets to neutral on full reload which is safer/calmer

    return (
        <MoodContext.Provider value={{ mood, setMood, safeMode, setSafeMode }}>
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
