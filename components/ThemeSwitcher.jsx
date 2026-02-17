"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Leaf, Heart } from "lucide-react";

const THEMES = [
    { id: "midnight", label: "Midnight", icon: Moon, color: "bg-[#1F2833]" },
    { id: "earth", label: "Earth", icon: Leaf, color: "bg-[#4A5D23]" },
    { id: "pop", label: "Pop", icon: Heart, color: "bg-[#A18CD1]" },
];

export default function ThemeSwitcher() {
    const [theme, setTheme] = useState("midnight");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem("wecare-theme") || "midnight";
        setTheme(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);
        document.documentElement.classList.toggle("dark", savedTheme === "midnight");
    }, []);

    const toggleTheme = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem("wecare-theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "midnight");
    };

    if (!mounted) return null;

    return (
        <div className="flex bg-card/40 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-lg">
            {THEMES.map((t) => (
                <button
                    key={t.id}
                    onClick={() => toggleTheme(t.id)}
                    className="relative px-3 py-2 rounded-full flex items-center justify-center transition-all outline-none"
                    aria-label={`Switch to ${t.label} theme`}
                >
                    {theme === t.id && (
                        <motion.div
                            layoutId="active-theme"
                            className="absolute inset-0 bg-white/20 rounded-full"
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        />
                    )}
                    <t.icon
                        className={`w-4 h-4 relative z-10 transition-colors ${theme === t.id ? 'text-primary' : 'text-muted-foreground'}`}
                    />
                </button>
            ))}
        </div>
    );
}
