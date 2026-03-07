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

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden shadow-sm">
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
                        <div className="bg-primary/10 p-2 rounded-lg mt-1">
                            <Play className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg text-foreground mb-1">
                                {video.title}
                            </h3>
                            <p className="text-muted-foreground text-sm mb-3">
                                {video.description}
                            </p>
                            <span className="inline-block px-3 py-1 bg-primary/5 text-primary text-xs font-medium rounded-full border border-primary/20">
                                {video.category}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
