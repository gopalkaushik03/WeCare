export const VISUAL_ENGINE = {
    // Mood-specific configurations
    moods: {
        happy: {
            colors: ["#FDE68A", "#FCD34D", "#F59E0B"], // Bright Yellows
            gradient: "linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%)",
            speed: 0.5, // Faster
            glowIntensity: 0.8
        },
        calm: {
            colors: ["#E0E7FF", "#C7D2FE", "#818CF8"], // Soft Indigos
            gradient: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
            speed: 1.0, // Normal
            glowIntensity: 0.5
        },
        neutral: {
            colors: ["#F3F4F6", "#E5E7EB", "#9CA3AF"], // Grays
            gradient: "linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)",
            speed: 0.8,
            glowIntensity: 0.4
        },
        sad: {
            colors: ["#DBEAFE", "#BFDBFE", "#60A5FA"], // Cool Blues
            gradient: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
            speed: 1.5, // Slow
            glowIntensity: 0.3
        },
        anxious: {
            colors: ["#F3E8FF", "#D8B4FE", "#C084FC"], // Jittery Purples
            gradient: "linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)",
            speed: 0.3, // Fast/Jittery
            glowIntensity: 0.6
        },
        low: {
            colors: ["#F1F5F9", "#CBD5E1", "#94A3B8"], // Muted Slate
            gradient: "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
            speed: 2.0, // Very Slow
            glowIntensity: 0.2
        },
        positive: {
            colors: ["#FEF08A", "#FACC15", "#A3E635"], // Vibrant Lime/Yellow
            gradient: "linear-gradient(135deg, #FEFCE8 0%, #FEF08A 100%)",
            speed: 0.4, // Very Active
            glowIntensity: 0.9
        }
    },

    // Global animation settings
    breathing: {
        duration: 8, // seconds
        scaleRange: [1, 1.05, 1]
    },

    // Physics settings
    physics: {
        damping: 25,
        stiffness: 100
    }
};

export const getVisualState = (mood) => {
    return VISUAL_ENGINE.moods[mood] || VISUAL_ENGINE.moods.neutral;
};
