// Professional mental health support resources for India

export const CRISIS_HELPLINES = [
    {
        name: "KIRAN - National Mental Health Helpline",
        phone: "1800-599-0019",
        availability: "24/7",
        description: "Government of India's mental health rehabilitation helpline",
        type: "crisis"
    },
    {
        name: "iCall - TISS Helpline",
        phone: "9152987821",
        availability: "Mon-Sat, 8 AM - 10 PM",
        description: "Psychosocial helpline by Tata Institute of Social Sciences",
        type: "crisis"
    },
    {
        name: "AASRA",
        phone: "+91-22-27546669",
        availability: "24/7",
        description: "Suicide prevention and mental health support",
        type: "crisis"
    },
    {
        name: "Vandrevala Foundation",
        phone: "1860-2662-345",
        availability: "24/7",
        description: "Free mental health support and counseling",
        type: "crisis"
    }
];

export const ONLINE_COUNSELING_PLATFORMS = [
    {
        name: "MindPeers",
        url: "https://mindpeers.co",
        description: "Professional therapy and counseling services",
        features: ["Licensed therapists", "Chat & video sessions", "Affordable pricing"]
    },
    {
        name: "YourDOST",
        url: "https://yourdost.com",
        description: "Emotional wellness and mental health platform",
        features: ["Anonymous support", "Expert counselors", "Self-help resources"]
    },
    {
        name: "BetterLYF",
        url: "https://www.betterlyf.com",
        description: "Online counseling and therapy platform",
        features: ["Certified psychologists", "Flexible scheduling", "Confidential sessions"]
    },
    {
        name: "Amaha (InnerHour)",
        url: "https://www.amahahealth.com",
        description: "Mental health and self-care app",
        features: ["Therapy programs", "Psychiatry support", "Self-care tools"]
    }
];

export const EMERGENCY_SERVICES = {
    police: "100",
    ambulance: "102",
    nationalEmergency: "112"
};

/**
 * Get support resources based on risk level
 * @param {string} riskLevel - 'low', 'medium', or 'high'
 * @returns {object} Relevant support resources
 */
export function getSupportForRiskLevel(riskLevel) {
    const normalizedLevel = riskLevel?.toLowerCase() || 'low';

    if (normalizedLevel === 'high') {
        return {
            primary: CRISIS_HELPLINES,
            secondary: ONLINE_COUNSELING_PLATFORMS,
            emergency: EMERGENCY_SERVICES,
            showEmergency: true
        };
    } else if (normalizedLevel === 'medium') {
        return {
            primary: ONLINE_COUNSELING_PLATFORMS,
            secondary: CRISIS_HELPLINES,
            emergency: null,
            showEmergency: false
        };
    } else {
        return {
            primary: ONLINE_COUNSELING_PLATFORMS.slice(0, 2),
            secondary: null,
            emergency: null,
            showEmergency: false
        };
    }
}
