"use client";
import { useState, useEffect } from "react";
import { Music, PlayCircle, PauseCircle } from "lucide-react";
import { useMood } from "@/context/MoodContext";

// Curated non-copyright/royalty-free or public helpful playlists (simulated IDs)
const MOOD_PLAYLISTS = {
    happy: "5qap5aO4i9obOGs11lsdlK", // Uplifting
    calm: "37i9dQZF1DWZqd5JICZI0u", // Peaceful Piano
    neutral: "37i9dQZF1DXcBWIGoYBM5M", // Lo-Fi Beats
    sad: "37i9dQZF1DX7qK8ma5wgG1", // Sad Songs
    anxious: "37i9dQZF1DWZqd5JICZI0u", // Anxiety Relief
    low: "37i9dQZF1DWZqd5JICZI0u",
    positive: "5qap5aO4i9obOGs11lsdlK"
};

export default function MoodMusicPlayer() {
    const { mood } = useMood();
    const [isPlaying, setIsPlaying] = useState(false);

    // In a real app with Spotify SDK, we'd use the playlist ID
    // For this prototype, we'll simulate the player state

    return (
        <div className="h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/20 p-2 rounded-full text-primary">
                        <Music className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-sm">Sonic Therapy</span>
                </div>
                {isPlaying && (
                    <span className="flex gap-0.5 h-3 items-end">
                        <span className="w-1 bg-primary animate-[bounce_1s_infinite] h-full"></span>
                        <span className="w-1 bg-primary animate-[bounce_1.5s_infinite] h-2/3"></span>
                        <span className="w-1 bg-primary animate-[bounce_0.5s_infinite] h-3/4"></span>
                    </span>
                )}
            </div>

            <div className="space-y-4">
                <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Now Playing For</p>
                    <p className="text-lg font-display capitalize text-foreground">{mood || "Relaxation"}</p>
                </div>

                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-full py-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors flex items-center justify-center gap-2 font-medium"
                >
                    {isPlaying ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                    {isPlaying ? "Pause" : "Play Mix"}
                </button>
            </div>
        </div>
    );
}
