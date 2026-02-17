// Backend API Base URL
const API_BASE_URL = "http://localhost:8000";

// Simulate API delay (optional now, but kept for consistency)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
    auth: {
        login: async (email, password) => {
            await delay(800);
            if (email === "demo@wecare.com" && password === "demo123") {
                return { success: true, user: { name: "Demo User", email } };
            }
            return { success: false, message: "Invalid credentials" };
        },
        signup: async (name, email, password) => {
            await delay(1000);
            return { success: true, user: { name, email } };
        },
    },
    mood: {
        submit: async (mood, notes) => {
            await delay(600);
            console.log("Mood logged locally:", { mood, notes, date: new Date().toISOString() });
            return { success: true, message: "Mood tracked successfully!" };
        },
        history: async () => {
            await delay(400);
            return [
                { date: "2023-10-24", mood: "Happy", notes: "Had a great walk." },
                { date: "2023-10-23", mood: "Neutral", notes: "Busy day at work." },
            ];
        }
    },
    analysis: {
        submit: async (mood, notes) => {
            try {
                const response = await fetch(`${API_BASE_URL}/analyze`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ mood, notes }), // Match Python backend expectation
                });
                if (!response.ok) throw new Error("Backend unavailable");
                const data = await response.json();
                return { success: true, analysis: data };
            } catch (error) {
                console.error("Backend connection failed:", error);
                return { success: false, message: "Could not connect to AI server." };
            }
        }
    }
};