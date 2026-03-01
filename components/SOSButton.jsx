"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, X, Wind } from "lucide-react";

export default function SOSButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50 group">
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-black/80 backdrop-blur text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Immediate grounding help
                </div>

                <button
                    onClick={() => setIsOpen(true)}
                    className="relative bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg shadow-red-500/30 transition-transform hover:scale-105 active:scale-95"
                >
                    <span className="font-bold relative z-10">SOS</span>

                    {/* Subtle Pulse - Every 8s */}
                    <span className="absolute inset-0 rounded-full bg-red-500 animate-[ping_3s_ease-in-out_infinite_6s] opacity-20"></span>
                    <motion.span
                        animate={{ scale: [1, 1.1, 1], opacity: [0, 0.3, 0] }}
                        transition={{ duration: 4, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
                        className="absolute inset-0 rounded-full bg-red-400"
                    />
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-card w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative"
                        >
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 p-2 bg-black/10 rounded-full hover:bg-black/20 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="p-8 text-center space-y-8">
                                <div>
                                    <h2 className="text-3xl font-display font-bold mb-2">Breathe</h2>
                                    <p className="text-muted-foreground">Follow the circle to ground yourself.</p>
                                </div>

                                {/* Breathing Animation: 4-7-8 Technique */}
                                <div className="relative flex justify-center py-8">
                                    <motion.div
                                        animate={{
                                            scale: [1, 2.5, 2.5, 1], // Expands for Inhale, Stays for Hold, Shrinks for Exhale
                                            opacity: [0.3, 0.6, 0.6, 0.3]
                                        }}
                                        transition={{
                                            duration: 19, // Total cycle: 4s + 7s + 8s = 19s
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            times: [0, 0.21, 0.58, 1] // 0 -> 4s(21%) -> 11s(58%) -> 19s(100%)
                                        }}
                                        className="w-24 h-24 rounded-full bg-blue-400/30 absolute"
                                    />
                                    <motion.div
                                        animate={{
                                            // Matching inner circle
                                            scale: [1, 1.5, 1.5, 1],
                                        }}
                                        transition={{
                                            duration: 19,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            times: [0, 0.21, 0.58, 1]
                                        }}
                                        className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white relative z-10 shadow-xl shadow-blue-500/20"
                                    >
                                        <Wind className="w-8 h-8" />
                                    </motion.div>

                                    {/* Text Guide */}
                                    <motion.div
                                        className="absolute -bottom-8 text-sm font-medium text-foreground/80"
                                        animate={{
                                            opacity: [0, 1, 1, 1, 0],
                                        }}
                                        transition={{ duration: 19, repeat: Infinity, times: [0, 0.1, 0.5, 0.9, 1] }}
                                    >
                                        Inhale (4) • Hold (7) • Exhale (8)
                                    </motion.div>
                                </div>

                                <div className="space-y-3">
                                    <a
                                        href="tel:911"
                                        className="block w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Phone className="w-5 h-5" />
                                        Call Emergency Services
                                    </a>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="block w-full py-4 bg-secondary/20 hover:bg-secondary/30 text-secondary-foreground font-semibold rounded-xl transition-colors"
                                    >
                                        I'm feeling better
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
