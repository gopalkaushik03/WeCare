"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import AuroraBackground from "@/components/AuroraBackground";
import { useUser } from "@/context/UserContext";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useUser();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background">
            {/* Dynamic Background */}
            <AuroraBackground />
            <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px]" />

            {/* Glass Prism Card */}
            <motion.div
                initial={{ opacity: 0, y: 50, rotateX: 10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-md p-8 relative z-10 mx-4"
            >
                <div className="absolute inset-0 bg-card/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]" />

                {/* Content */}
                <div className="relative z-10">
                    <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                    </Link>

                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Welcome Back</h1>
                        <p className="text-muted-foreground text-sm">Enter your credentials to access your safe space.</p>
                    </div>

                    <form className="space-y-6" onSubmit={async (e) => {
                        e.preventDefault();
                        if (!email || !password) {
                            setError("Please fill in all fields.");
                            return;
                        }
                        setError("");
                        setIsLoading(true);
                        try {
                            const result = await login(email, password);
                            if (result.success) {
                                router.push("/dashboard");
                            } else {
                                setError(result.message || "Invalid email or password");
                            }
                        } catch (err) {
                            setError("An unexpected error occurred. Please try again.");
                        } finally {
                            setIsLoading(false);
                        }
                    }}>
                        <div className="space-y-2 group">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">Email</label>
                            <div className="relative">
                                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${error && !email ? 'text-red-400' : 'text-muted-foreground group-focus-within:text-primary'}`} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="hello@wecare.com"
                                    className={`w-full bg-background/50 border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 shadow-inner ${error && !email ? 'border-red-400/50 bg-red-400/5' : 'border-border'}`}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">Password</label>
                            <div className="relative">
                                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${error && !password ? 'text-red-400' : 'text-muted-foreground group-focus-within:text-primary'}`} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className={`w-full bg-background/50 border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 shadow-inner ${error && !password ? 'border-red-400/50 bg-red-400/5' : 'border-border'}`}
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-400 text-sm text-center font-medium bg-red-400/10 py-2 rounded-lg border border-red-400/20"
                            >
                                {error}
                            </motion.p>
                        )}

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={!isLoading ? { scale: 1.02, boxShadow: "0 0 20px rgba(102, 252, 241, 0.3)" } : {}}
                            whileTap={!isLoading ? { scale: 0.98 } : {}}
                            className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-8 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                        >
                            {isLoading ? "Signing in…" : (<>Sign In <ArrowRight className="w-4 h-4" /></>)}
                        </motion.button>

                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70 mt-4">
                            <Lock className="w-3 h-3" />
                            <span>Your data is encrypted and private</span>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            Don't have an account?{" "}
                            <Link href="/signup" className="text-primary hover:text-primary/80 font-medium hover:underline underline-offset-4">
                                Join WeCare
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
