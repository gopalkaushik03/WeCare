"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function BentoGrid({ className, children }) {
    return (
        <div
            className={cn(
                "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto auto-rows-[minmax(180px,auto)]",
                className
            )}
        >
            {children}
        </div>
    );
}

export function BentoItem({ className, title, icon: Icon, children, header, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: delay, duration: 0.4, ease: "easeOut" }}
            className={cn(
                "row-span-1 rounded-3xl group/bento hover:shadow-xl transition shadow-input shadow-none p-4 justify-between flex flex-col space-y-4",
                "glass-bento", // Using the global glass utility
                className
            )}
        >
            {header}
            <div className="group-hover/bento:translate-x-2 transition duration-200">
                <div className="flex items-center gap-2 mb-2 text-primary">
                    {Icon && <Icon className="h-4 w-4" />}
                    {title && <div className="font-bold text-neutral-600 dark:text-neutral-200">{title}</div>}
                </div>
                <div className="font-sans font-normal text-neutral-600 text-xs dark:text-neutral-300">
                    {children}
                </div>
            </div>
        </motion.div>
    );
}
