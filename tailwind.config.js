/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
                display: ['var(--font-clash)', 'sans-serif'],
            },
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            animation: {
                "aurora": "aurora 20s ease infinite alternate",
                "shred": "shred 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards",
                "breathing-orb": "breathing-orb 10s ease-in-out infinite",
                "marquee": "marquee 25s linear infinite",
            },
            keyframes: {
                aurora: {
                    "0%": { transform: "translate(0, 0) rotate(0deg)" },
                    "100%": { transform: "translate(10%, 10%) rotate(5deg)" },
                },
                shred: {
                    "0%": { clipPath: "inset(0 0 0 0)", transform: "translateY(0)" },
                    "100%": { clipPath: "inset(100% 0 0 0)", transform: "translateY(20px)" },
                },
                "breathing-orb": {
                    "0%, 100%": { transform: "scale(1)", opacity: "0.8" },
                    "50%": { transform: "scale(1.1)", opacity: "0.5" },
                },
                marquee: {
                    "0%": { transform: "translateX(0%)" },
                    "100%": { transform: "translateX(-100%)" },
                }
            },
        },
    },
    plugins: [],
}
