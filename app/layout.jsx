import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-clash" });

export const metadata = {
    title: "WECARE | AI-Based Mental Health Awareness",
    description: "A calm, safe space for mental health tracking and awareness.",
};

import { MoodProvider } from "@/context/MoodContext";

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={cn(inter.variable, outfit.variable, "font-sans min-h-screen flex flex-col transition-colors duration-500")}>
                <MoodProvider>
                    <Navbar />
                    <main className="flex-1 flex flex-col pt-20">
                        {children}
                    </main>
                    <Footer />
                </MoodProvider>
            </body>
        </html>
    );
}
