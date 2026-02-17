"use client";
import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
    { name: 'Mon', uv: 4 },
    { name: 'Tue', uv: 6 },
    { name: 'Wed', uv: 5 },
    { name: 'Thu', uv: 8 },
    { name: 'Fri', uv: 7 },
    { name: 'Sat', uv: 9 },
    { name: 'Sun', uv: 8 },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#1a1c23]/90 backdrop-blur border border-white/10 p-3 rounded-xl shadow-xl">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
                <p className="text-sm font-medium text-primary">
                    Mood Score: {payload[0].value}/10
                </p>
                <p className="text-xs text-white/50 italic mt-1">"Feeling productive"</p>
            </div>
        );
    }
    return null;
};

export default function MoodTrendChart() {
    return (
        <div className="w-full h-[150px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#66FCF1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#66FCF1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="uv"
                        stroke="#66FCF1"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorUv)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
