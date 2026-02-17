"use client";
import { useState, useEffect } from "react";
import { PlayCircle, PauseCircle, Volume2, Headphones } from "lucide-react";
import { useMood } from "@/context/MoodContext";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

// Valid YouTube IDs
const MOOD_VIDEOS = {
    happy: "https://www.youtube.com/watch?v=5qap5aO4i9A",
    calm: "https://www.youtube.com/watch?v=jfKfPfyJRdk", // Lofi Girl
    neutral: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    sad: "https://www.youtube.com/watch?v=tfBVp0Zi2iE",
    anxious: "https://www.youtube.com/watch?v=DWcJFNfaw9c",
};

export default function SonicTherapy() {
    const { mood } = useMood();
    const [isPlaying, setIsPlaying] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [url, setUrl] = useState(MOOD_VIDEOS.neutral);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mood && MOOD_VIDEOS[mood]) {
            setUrl(MOOD_VIDEOS[mood]);
        } else {
            setUrl(MOOD_VIDEOS.neutral);
        }
    }, [mood]);

    if (!mounted) return null;

    return (
        <div className="h-full flex flex-col justify-between relative overflow-hidden">
            {/* Hidden Player */}
            <div className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden">
                <ReactPlayer
                    url={url}
                    playing={isPlaying}
                    width="0"
                    height="0"
                    volume={0.5}
                    loop={true}
                    controls={false}
                    playsinline={true}
                />
            </div>

            <div className="flex items-center justify-between mb-2 z-10 w-full">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/20 p-2 rounded-full text-primary">
                        <Headphones className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-sm">Sonic Therapy</span>
                </div>
                {isPlaying && (
                    <div className="flex items-center gap-2">
                        <span className="flex gap-0.5 h-3 items-end">
                            <span className="w-1 bg-primary animate-[bounce_1s_infinite] h-full"></span>
                            <span className="w-1 bg-primary animate-[bounce_1.5s_infinite] h-2/3"></span>
                            <span className="w-1 bg-primary animate-[bounce_0.5s_infinite] h-3/4"></span>
                        </span>
                    </div>
                )}
            </div>

            <div className="space-y-4 z-10 w-full">
                <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Current Mix</p>
                    <p className="text-lg font-display capitalize text-foreground truncate">
                        {mood ? `${mood} Vibes` : "Lofi Girl Radio"}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`w-full py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-medium shadow-lg hover:scale-[1.02] active:scale-95 ${isPlaying ? 'bg-primary text-primary-foreground shadow-primary/20' : 'bg-white/5 hover:bg-white/10 text-primary border border-primary/20'}`}
                    >
                        {isPlaying ? <PauseCircle className="w-5 h-5 fill-current" /> : <PlayCircle className="w-5 h-5 fill-current" />}
                        {isPlaying ? "Pause Session" : "Start Session"}
                    </button>
                </div>
            </div>

            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        </div>
    );
}
