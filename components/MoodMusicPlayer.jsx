"use client";

import { useState, useEffect, useMemo } from "react";
import { Music, ExternalLink } from "lucide-react";
import { useMood } from "@/context/MoodContext";

const MOOD_PLAYLISTS = {
  happy: "5qap5aO4i9obOGs11lsdlK",
  calm: "37i9dQZF1DWZqd5JICZI0u",
  neutral: "37i9dQZF1DXcBWIGoYBM5M",
  sad: "37i9dQZF1DX7qK8ma5wgG1",
  anxious: "37i9dQZF1DWZqd5JICZI0u",
  low: "37i9dQZF1DWZqd5JICZI0u",
  positive: "5qap5aO4i9obOGs11lsdlK",
};

const MOOD_MESSAGES = {
  happy: "Keep the good vibes flowing 🌞",
  calm: "Slow down and breathe 🌿",
  sad: "It's okay to feel this way 💙",
  anxious: "Let’s ease your mind 🫶",
  neutral: "Focus mode activated 🎧",
  low: "One small step at a time 🌱",
  positive: "Ride the momentum 🚀",
};

export default function MoodMusicPlayer() {
  const { mood } = useMood();
  const [animateKey, setAnimateKey] = useState(0);

  const playlistId = useMemo(() => {
    return MOOD_PLAYLISTS[mood] || MOOD_PLAYLISTS.neutral;
  }, [mood]);

  const message = useMemo(() => {
    return MOOD_MESSAGES[mood] || "Relax and reset ✨";
  }, [mood]);

  useEffect(() => {
    setAnimateKey((prev) => prev + 1);
  }, [mood]);

  return (
    <div className="h-full flex flex-col justify-between p-5 rounded-2xl 
      bg-gradient-to-br from-primary/10 via-background to-primary/5 
      border border-border shadow-md">

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-2 rounded-full text-primary">
            <Music className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm">Sonic Therapy</span>
        </div>

        <span className="flex gap-0.5 h-4 items-end">
          <span className="w-1 bg-primary rounded animate-[bounce_1s_infinite] h-full"></span>
          <span className="w-1 bg-primary rounded animate-[bounce_1.3s_infinite] h-3/4"></span>
          <span className="w-1 bg-primary rounded animate-[bounce_0.7s_infinite] h-2/3"></span>
        </span>
      </div>

      <div
        key={animateKey}
        className="space-y-2 transition-all duration-500 animate-in fade-in slide-in-from-bottom-2"
      >
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          Now Playing For
        </p>

        <p className="text-lg font-semibold capitalize text-foreground">
          {mood || "Relaxation"}
        </p>

        <p className="text-xs text-muted-foreground">{message}</p>
      </div>

      <div className="mt-4 rounded-xl overflow-hidden border border-border">
        <iframe
          src={`https://open.spotify.com/embed/playlist/${playlistId}`}
          width="100%"
          height="80"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="border-none"
        />
      </div>

      <button
        onClick={() =>
          window.open(`https://open.spotify.com/playlist/${playlistId}`, "_blank")
        }
        className="mt-4 w-full py-3 rounded-xl bg-primary text-primary-foreground 
        hover:opacity-90 transition-all flex items-center justify-center gap-2 font-medium"
      >
        Open Full Playlist
        <ExternalLink className="w-4 h-4" />
      </button>
    </div>
  );
}
