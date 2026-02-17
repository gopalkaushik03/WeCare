"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { HeartHandshake, Home, LayoutDashboard, Smile } from "lucide-react";

export default function Navbar() {
    const pathname = usePathname();

    const navItems = [
        { name: "Home", path: "/", icon: <Home className="w-5 h-5 md:w-6 md:h-6" /> },
        { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="w-5 h-5 md:w-6 md:h-6" /> },
        { name: "Mood Tracker", path: "/mood", icon: <Smile className="w-5 h-5 md:w-6 md:h-6" /> },
    ];

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-0 z-50 w-full border-b border-border/40 bg-white/60 dark:bg-[#0B0C10]/60 backdrop-blur-xl transition-colors duration-500"
        >
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                        <HeartHandshake className="w-7 h-7 text-primary" />
                    </div>
                    <span className="text-xl font-semibold tracking-tight text-foreground/80 dark:text-white/80">WECARE</span>
                </Link>
                <div className="hidden md:flex items-center gap-8">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={cn(
                                "flex items-center gap-2 transition-colors duration-200",
                                pathname === item.path
                                    ? "text-primary"
                                    : "text-slate-600 dark:text-gray-300 hover:text-cyan-500"
                            )}
                            title={item.name}
                        >
                            {item.icon}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    {pathname === "/login" || pathname === "/signup" ? null : (
                        <Link href="/login" className="hidden md:block text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            Log in
                        </Link>
                    )}
                    <Link href="/signup" className="hidden md:block">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-primary text-primary-foreground h-9 px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors"
                        >
                            Get Started
                        </motion.button>
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-slate-600 dark:text-gray-300"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 12" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                        )}
                    </button>
                </div>
            </div >

            {/* Mobile Nav */}
            {
                mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="md:hidden bg-white/95 dark:bg-[#0B0C10]/95 backdrop-blur-xl border-b border-border/40"
                    >
                        <div className="flex flex-col p-4 space-y-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={cn(
                                        "flex items-center gap-4 p-2 rounded-lg transition-colors",
                                        pathname === item.path
                                            ? "bg-primary/10 text-primary"
                                            : "text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5"
                                    )}
                                >
                                    {item.icon}
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            ))}
                            <div className="h-px bg-border/50 my-2" />
                            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block p-2 text-sm font-medium text-muted-foreground hover:text-primary">
                                Log in
                            </Link>
                            <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                                <button className="w-full bg-primary text-primary-foreground h-10 rounded-full text-sm font-medium shadow-sm hover:bg-primary/90">
                                    Get Started
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                )
            }
        </motion.nav >
    );
}
