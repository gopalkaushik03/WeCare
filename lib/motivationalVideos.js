// Curated motivational and grounding videos categorized by risk level
// Videos are selected to be calm, supportive, and non-aggressive

export const MOTIVATIONAL_VIDEOS = {
    low: [
        {
            id: "ZwJkMNIzHBo",
            title: "5-Minute Gratitude Meditation",
            description: "A gentle practice to cultivate appreciation and positive emotions.",
            category: "Gratitude"
        },
        {
            id: "inpok4MKVLM",
            title: "Morning Motivation - You've Got This",
            description: "Uplifting affirmations to start your day with confidence.",
            category: "Growth"
        },
        {
            id: "aEqlQvczMJQ",
            title: "Peaceful Nature Sounds for Relaxation",
            description: "Calming nature scenes to enhance your positive mood.",
            category: "Relaxation"
        }
    ],
    medium: [
        {
            id: "SEfs5TJZ6Nk",
            title: "10-Minute Stress Relief Meditation",
            description: "Guided meditation to release tension and find balance.",
            category: "Stress Management"
        },
        {
            id: "O-6f5wQXSu8",
            title: "Box Breathing Technique",
            description: "Simple breathing exercise to calm your nervous system.",
            category: "Breathing"
        },
        {
            id: "z6X5oEIg6Ak",
            title: "Mindful Movement for Anxiety",
            description: "Gentle stretches to reconnect with your body and mind.",
            category: "Mindfulness"
        }
    ],
    high: [
        {
            id: "cEqZthCaMpo",
            title: "5-4-3-2-1 Grounding Technique",
            description: "A powerful exercise to bring you back to the present moment.",
            category: "Grounding"
        },
        {
            id: "tEmt1Znux58",
            title: "Deep Breathing for Panic Relief",
            description: "Calming breathwork to help during moments of intense distress.",
            category: "Crisis Support"
        },
        {
            id: "92i5m3tV5XY",
            title: "You Are Not Alone - Reassurance",
            description: "Gentle reminder that support is available and things can get better.",
            category: "Reassurance"
        }
    ]
};

/**
 * Get a random video for a specific risk level
 * @param {string} riskLevel - 'low', 'medium', or 'high'
 * @returns {object} Video object with id, title, description, category
 */
export function getVideoForRiskLevel(riskLevel) {
    const normalizedLevel = riskLevel?.toLowerCase() || 'low';
    const videos = MOTIVATIONAL_VIDEOS[normalizedLevel] || MOTIVATIONAL_VIDEOS.low;
    const randomIndex = Math.floor(Math.random() * videos.length);
    return videos[randomIndex];
}

/**
 * Get all videos for a specific risk level
 * @param {string} riskLevel - 'low', 'medium', or 'high'
 * @returns {array} Array of video objects
 */
export function getAllVideosForRiskLevel(riskLevel) {
    const normalizedLevel = riskLevel?.toLowerCase() || 'low';
    return MOTIVATIONAL_VIDEOS[normalizedLevel] || MOTIVATIONAL_VIDEOS.low;
}
