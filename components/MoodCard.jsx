"use client";
import { motion } from "framer-motion";
import { buttonTap } from "@/lib/motion";
import { cn } from "@/lib/utils";

export default function MoodCard({ label, icon: Icon, color, onClick, isSelected }) {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            whileTap={buttonTap}
            className={cn(
                "relative flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 w-full aspect-square",
                isSelected
                    ? "bg-white shadow-md border-primary ring-2 ring-primary/20"
                    : "bg-white/50 border-transparent hover:bg-white hover:shadow-sm"
            )}
        >
            <div className={cn("p-4 rounded-full mb-3 transition-colors", color)}>
                <Icon className="w-8 h-8 text-white" />
            </div>
            <span className="font-medium text-foreground/80">{label}</span>

            {isSelected && (
                <motion.div
                    layoutId="activeMoodCheck"
                    className="absolute top-3 right-3 w-3 h-3 bg-primary rounded-full"
                />
            )}
        </motion.button>
    );
}
