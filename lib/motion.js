export const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
    hidden: { opacity: 0 },
    initial: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren, delayChildren } },
    animate: { opacity: 1, transition: { staggerChildren, delayChildren } },
    visible: { opacity: 1, transition: { staggerChildren, delayChildren } }
});

export const cardHover = {
    rest: { scale: 1, boxShadow: "0px 4px 10px rgba(0,0,0,0.1)" },
    hover: { scale: 1.02, boxShadow: "0px 10px 20px rgba(0,0,0,0.15)", transition: { duration: 0.2 } }
};

// Restored missing exports
export const slideUp = {
    initial: { y: 20, opacity: 0 },
    animate: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.4,
            ease: "easeOut"
        }
    }
};

export const scaleIn = {
    hidden: { scale: 0.9, opacity: 0 },
    show: {
        scale: 1,
        opacity: 1,
        transition: {
            duration: 0.3
        }
    }
};

export const buttonHover = { scale: 1.05 };
export const buttonTap = { scale: 0.95 };

export const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: { duration: 0.3 }
    },
    transition: { type: "tween", ease: "anticipate", duration: 0.5 }
};
