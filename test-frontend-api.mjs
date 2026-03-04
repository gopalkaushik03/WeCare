// test-frontend-api.mjs
const API_BASE = "https://wecare-q02v.onrender.com";

async function test() {
    console.log("Testing POST /api/v1/analyze...");
    try {
        const response = await fetch(`${API_BASE}/api/v1/analyze`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                mood: "anxious",
                notes: "Just testing the API",
                cognitive_load_score: 45
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ API Error:", errorText);
            process.exit(1);
        }

        const data = await response.json();
        console.log("✅ Success! Status:", response.status);
        console.log("Response summary length:", data.summary?.length);
    } catch (err) {
        console.error("❌ Fetch failed:", err.message);
        process.exit(1);
    }
}

test();
