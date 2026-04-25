"use client";
import { motion } from "framer-motion";
import { Video, Play } from "lucide-react";
import { getVideoForRiskLevel } from "@/lib/motivationalVideos";
import { slideUp } from "@/lib/motion";

export default function VideoSection({ riskLevel = "low" }) {
    const video = getVideoForRiskLevel(riskLevel);

    if (!video) return null;

    return (
        <motion.div
            variants={slideUp}
            initial="initial"
            animate="animate"
            className="w-full mb-8"
        >
            <div className="mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">
                    Helpful Video for You
                </h2>
            </div>

            <div className="glass-card overflow-hidden shadow-xl">
                {/* Video Embed */}
                <div className="w-full aspect-video overflow-hidden">
                    <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1`}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>

                {/* Video Info */}
                <div className="p-6">
                    <div className="flex items-start gap-3">
                        <div className="bg-primary/15 p-2 rounded-lg mt-1">
                            <Play className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg text-white mb-1">
                                {video.title}
                            </h3>
                            <p className="text-white/70 text-sm mb-3">
                                {video.description}
                            </p>
                            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/30">
                                {video.category}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
