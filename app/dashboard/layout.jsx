"use client";
import React from "react";
import GlobalPlayer from "@/components/GlobalPlayer";
import CommandPalette from "@/components/CommandPalette";

export default function DashboardLayout({ children }) {
    return (
        <>
            <CommandPalette />
            <div className="relative min-h-screen">
                {children}
            </div>
            <GlobalPlayer />
        </>
    );
}
