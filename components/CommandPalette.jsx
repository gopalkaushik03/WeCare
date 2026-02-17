"use client";
import React, { useState, useEffect } from "react";
import { Command } from "cmdk";
import { Search, PenLine, Timer, Music, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CommandPalette() {
    const [open, setOpen] = useState(false);

    // Toggle with Ctrl+K
    useEffect(() => {
        const down = (e) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpen(false)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="w-full max-w-lg relative z-10"
                    >
                        <Command className="bg-[#1a1c23]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden text-foreground">
                            <div className="flex items-center px-4 border-b border-white/5">
                                <Search className="w-5 h-5 text-muted-foreground mr-3" />
                                <Command.Input
                                    placeholder="Type a command or search..."
                                    className="w-full h-14 bg-transparent outline-none text-lg placeholder:text-muted-foreground/50"
                                />
                                <div className="flex gap-1">
                                    <kbd className="px-2 py-1 bg-white/5 rounded text-[10px] font-mono text-muted-foreground">ESC</kbd>
                                </div>
                            </div>

                            <Command.List className="p-2 max-h-[300px] overflow-y-auto">
                                <Command.Empty className="p-4 text-center text-sm text-muted-foreground">No results found.</Command.Empty>

                                <Command.Group heading="Actions" className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2 py-1 mb-1">
                                    <Command.Item className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-primary/20 hover:text-primary cursor-pointer transition-colors group">
                                        <PenLine className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        <span className="text-sm font-medium text-foreground">Log Mood</span>
                                        <span className="ml-auto text-xs text-muted-foreground opacity-50">L</span>
                                    </Command.Item>
                                    <Command.Item className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-primary/20 hover:text-primary cursor-pointer transition-colors group">
                                        <Timer className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        <span className="text-sm font-medium text-foreground">Start Focus Timer</span>
                                        <span className="ml-auto text-xs text-muted-foreground opacity-50">F</span>
                                    </Command.Item>
                                    <Command.Item className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-primary/20 hover:text-primary cursor-pointer transition-colors group">
                                        <Music className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        <span className="text-sm font-medium text-foreground">Play Lo-Fi</span>
                                        <span className="ml-auto text-xs text-muted-foreground opacity-50">M</span>
                                    </Command.Item>
                                </Command.Group>

                                <Command.Separator className="h-px bg-white/5 my-2" />

                                <Command.Group heading="Navigation" className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2 py-1 mb-1">
                                    <Command.Item className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-primary/20 hover:text-primary cursor-pointer transition-colors group">
                                        <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        <span className="text-sm font-medium text-foreground">Profile</span>
                                    </Command.Item>
                                </Command.Group>
                            </Command.List>
                        </Command>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
