// lib/api.js
// WeCare API client — all real backend calls, no mocks.

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://wecare-q02v.onrender.com";
const DEFAULT_USER = "local_user"; // Replaced by auth token in Phase 2 (Clerk)

async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error:", errorText);
        throw new Error("API request failed");
    }
    return res.json();
}

export const api = {
    // ------------------------------------------------------------------
    // Auth (still mock — Phase 2 replaces with Clerk)
    // ------------------------------------------------------------------
    auth: {
        login: async (email, password) => {
            if (email === "demo@wecare.com" && password === "demo123") {
                return { success: true, user: { name: "Demo User", email } };
            }
            return { success: false, message: "Invalid credentials" };
        },
        signup: async (name, email, password) => {
            return { success: true, user: { name, email } };
        },
    },

    // ------------------------------------------------------------------
    // Mood Entries — real persistence, graceful client-side fallback
    // ------------------------------------------------------------------
    mood: {
        /**
         * Persist a completed analysis result as a mood entry.
         * Called after analysis.submit() succeeds.
         */
        submit: async (mood, notes, analysisResult = {}) => {
            try {
                return await apiFetch("/api/v1/entries", {
                    method: "POST",
                    body: JSON.stringify({
                        user_id: DEFAULT_USER,
                        mood,
                        notes,
                        risk_level: analysisResult.risk_level || "low",
                        summary: analysisResult.summary || "",
                        insight: analysisResult.insight || null,
                        reframe: analysisResult.reframe || null,
                        action: analysisResult.action || null,
                        reframe_technique: analysisResult.reframe_technique || null,
                        emotional_themes: analysisResult.emotional_themes || [],
                        suggestions: analysisResult.suggestions || [],
                    }),
                });
            } catch (err) {
                console.warn("[API] Entry persistence failed (DB may be offline):", err.message);
                // Return optimistic success so UI flow isn't blocked
                return { success: false, id: null, message: err.message };
            }
        },

        /** Last 30 entries for the current user. */
        history: async (limit = 30) => {
            try {
                const data = await apiFetch(
                    `/api/v1/entries?user_id=${DEFAULT_USER}&limit=${limit}`
                );
                return data.entries || [];
            } catch {
                return [];
            }
        },

        /** Current and longest streak from server-computed dates. */
        streak: async () => {
            try {
                return await apiFetch(`/api/v1/entries/streak?user_id=${DEFAULT_USER}`);
            } catch {
                return { current: 0, longest: 0, total_entries: 0 };
            }
        },
    },

    // ------------------------------------------------------------------
    // Analysis — calls the Gemini-powered AI endpoint
    // ------------------------------------------------------------------
    analysis: {
        submit: async (mood, notes, cognitive_load_score) => {
            try {
                const response = await fetch(`${API_BASE}/api/v1/analyze`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        mood,
                        notes,
                        cognitive_load_score
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("API Error:", errorText);
                    throw new Error("API request failed");
                }

                const data = await response.json();
                return { success: true, analysis: data };
            } catch (err) {
                console.error("[API] Analysis failed:", err.message);
                return { success: false, message: err.message };
            }
        },
    },

    // ------------------------------------------------------------------
    // Trajectory — 7-day emotional trend
    // ------------------------------------------------------------------
    trajectory: {
        get: async (days = 7) => {
            try {
                return await apiFetch(
                    `/api/v1/me/trajectory?user_id=${DEFAULT_USER}&days=${days}`
                );
            } catch {
                return {
                    trajectory: "insufficient_data",
                    label: "Getting Started",
                    direction: "flat",
                    color: "blue",
                    message: "Log a few more check-ins to see your emotional trajectory.",
                    score_history: [],
                    entry_count: 0,
                };
            }
        },
    },
};