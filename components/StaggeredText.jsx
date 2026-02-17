"use client";
import { motion } from "framer-motion";

export default function StaggeredText({ text, className }) {
    const letters = Array.from(text);

    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.03, delayChildren: 0.04 * i },
        }),
    };

    const child = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
        hidden: {
            opacity: 0,
            y: 20,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
    };

    return (
        <motion.h1
            style={{ overflow: "hidden", display: "flex", flexWrap: "wrap", gap: "0.2rem" }}
            variants={container}
            initial="hidden"
            animate="visible"
            className={className}
        >
            {text.split(" ").map((word, index) => (
                <span key={index} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
                    {Array.from(word).map((letter, index) => (
                        <motion.span variants={child} key={index} style={{ display: "inline-block" }}>
                            {letter}
                        </motion.span>
                    ))}
                </span>
            ))}
        </motion.h1>
    );
}
