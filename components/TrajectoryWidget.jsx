"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

const CONFIG = {
    improving: {
        Icon: TrendingUp,
        color: "text-emerald-400",
        glow: "bg-emerald-500/10 border-emerald-500/20",
        dot: "bg-emerald-400",
        label: "Improving",
    },
    stable: {
        Icon: Minus,
        color: "text-slate-400",
        glow: "bg-white/5 border-white/10",
        dot: "bg-slate-400",
        label: "Stable",
    },
    declining: {
        Icon: TrendingDown,
        color: "text-amber-400",
        glow: "bg-amber-500/10 border-amber-500/20",
        dot: "bg-amber-400",
        label: "Needs Attention",
    },
    insufficient_data: {
        Icon: Minus,
        color: "text-blue-400",
        glow: "bg-blue-500/10 border-blue-500/20",
        dot: "bg-blue-400",
        label: "Getting Started",
    },
};

export default function TrajectoryWidget() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.trajectory.get(7).then((d) => {
            setData(d);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const trajectory = data?.trajectory || "insufficient_data";
    const cfg = CONFIG[trajectory] || CONFIG.insufficient_data;
    const { Icon } = cfg;
    const scores = data?.score_history || [];

    // Normalise scores for mini sparkline (1–3 → height px)
    const maxScore = 3;
    const bars = scores.length > 0 ? scores : [1, 1, 1];

    return (
        <div className="h-full flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">7-Day Trajectory</span>
            </div>

            {/* Trend Card */}
            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-3 p-3 rounded-xl border ${cfg.glow}`}
            >
                <div className={`p-2 rounded-lg ${cfg.glow}`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                </div>
                <div>
                    <p className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                        {data?.message}
                    </p>
                </div>
            </motion.div>

            {/* Mini Sparkline */}
            <div className="flex items-end gap-1 h-8 px-1">
                {bars.map((score, i) => {
                    const heightPct = (score / maxScore) * 100;
                    return (
                        <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPct}%` }}
                            transition={{ delay: i * 0.05, duration: 0.4 }}
                            className={`flex-1 rounded-sm ${cfg.dot} opacity-70`}
                            style={{ minHeight: "4px" }}
                        />
                    );
                })}
            </div>

            <p className="text-[9px] text-center text-muted-foreground">
                Based on {data?.entry_count || 0} check-in{data?.entry_count !== 1 ? "s" : ""}
            </p>
        </div>
    );
}
