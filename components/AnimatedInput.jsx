"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AnimatedInput({ id, type, label, register, error, ...props }) {
    const [isFocused, setIsFocused] = useState(false);
    // Use prop value if available to determine if label should float
    const hasValue = props.value ? String(props.value).length > 0 : false;

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    return (
        <div className="relative mb-4">
            <motion.div
                animate={isFocused || hasValue ? "active" : "inactive"}
                variants={{
                    active: { y: -2, scale: 0.98 },
                    inactive: { y: 0, scale: 1 }
                }}
                className={cn(
                    "relative flex items-center w-full rounded-xl border-2 bg-white/50 backdrop-blur-sm transition-all duration-300",
                    isFocused ? "border-primary shadow-md ring-4 ring-primary/10" : "border-transparent",
                    error ? "border-red-300 ring-red-100" : ""
                )}
            >
                <input
                    id={id}
                    type={type}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className="w-full px-4 pt-6 pb-2 bg-transparent outline-none text-foreground font-medium placeholder-transparent"
                    placeholder={label}
                    {...props}
                />
                <motion.label
                    htmlFor={id}
                    initial={false}
                    animate={isFocused || hasValue ? { y: -12, scale: 0.75, opacity: 0.7 } : { y: 0, scale: 1, opacity: 0.5 }}
                    className="absolute left-4 top-4 text-muted-foreground pointer-events-none origin-left transition-all duration-200"
                >
                    {label}
                </motion.label>
            </motion.div>

            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-5 left-1 text-xs text-red-500 font-medium"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
}
