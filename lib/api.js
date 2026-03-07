// lib/api.js
// WeCare API client — all real backend calls, no mocks.
// All URLs are built from the centralized config so there are zero
// hardcoded localhost references — works identically in dev and production.

import { API_BASE_URL, API_V1 } from "./apiConfig";

// Removed DEFAULT_USER as backend relies on JWT sub

async function apiFetch(path, options = {}) {
    const headers = { "Content-Type": "application/json" };
    // Inject JWT token if available
    try {
        const token = localStorage.getItem("wc_token");
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    } catch (e) {
        // Ignored. Next.js server-side rendering might trip over localStorage
    }

    const res = await fetch(`${API_BASE_URL}${path}`, {
        headers,
        ...options,
    });
    if (!res.ok) {
        if (res.status === 401) {
            localStorage.removeItem("wc_token");
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
        }
        const errorText = await res.text();
        console.error(`API Error [${res.status}] ${path}:`, errorText);
        throw new Error(`API request failed: ${res.status}`);
    }
    return res.json();
}

export const api = {
    // ------------------------------------------------------------------
    // Auth — Real JWT implementation
    // ------------------------------------------------------------------
    auth: {
        login: async (email, password) => {
            try {
                const data = await apiFetch("/api/v1/auth/login", {
                    method: "POST",
                    body: JSON.stringify({ email, password }),
                });
                return { success: true, user: data };
            } catch (err) {
                return { success: false, message: "Invalid credentials" };
            }
        },
        signup: async (name, email, password) => {
            try {
                const data = await apiFetch("/api/v1/auth/signup", {
                    method: "POST",
                    body: JSON.stringify({ name, email, password }),
                });
                return { success: true, user: data };
            } catch (err) {
                return { success: false, message: "Email already registered or invalid fields" };
            }
        },
        logout: () => {
            try {
                localStorage.removeItem("wc_token");
            } catch (e) {}
        },
        me: async () => {
            try {
                const data = await apiFetch("/api/v1/auth/me");
                return { success: true, user: data };
            } catch (err) {
                return { success: false, message: "Unauthorized" };
            }
        }
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
                    `/api/v1/entries?limit=${limit}`
                );
                return data.entries || [];
            } catch {
                return [];
            }
        },

        /** Current and longest streak from server-computed dates. */
        streak: async () => {
            try {
                return await apiFetch(`/api/v1/entries/streak`);
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
                const data = await apiFetch(`/api/v1/analyze`, {
                    method: "POST",
                    body: JSON.stringify({
                        mood,
                        notes,
                        cognitive_load_score
                    })
                });

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
                    `/api/v1/me/trajectory?days=${days}`
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