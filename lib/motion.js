// lib/motion.js
// Unified Framer Motion variant definitions.
//
// IMPORTANT: All child variants that appear inside a staggerContainer
// MUST use the same key names as the parent: "hidden" and "show".
// Mixing "initial/animate" keys with "hidden/show" parents causes
// Framer Motion to log "0 is not animatable" warnings and skip animations.

export const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    // Legacy aliases so old code using "visible" still works
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Parent container — use this with variants={staggerContainer()} on a motion.div
export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
    hidden: { opacity: 0 },
    initial: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren, delayChildren } },
    animate: { opacity: 1, transition: { staggerChildren, delayChildren } },
    visible: { opacity: 1, transition: { staggerChildren, delayChildren } },
});

// Child slide variants — uses BOTH "hidden/show" AND "initial/animate"
// so it works whether inside a stagger parent or used standalone.
export const slideUp = {
    hidden: { y: 20, opacity: 0 },
    initial: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
    animate: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

export const scaleIn = {
    hidden: { scale: 0.9, opacity: 0 },
    initial: { scale: 0.9, opacity: 0 },
    show: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
    animate: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
};

// cardHover — DO NOT put boxShadow in rest/initial state.
// Framer Motion can only animate from a value it already knows.
// Using a CSS class for the default shadow instead.
export const cardHover = {
    rest: { scale: 1 },
    hover: { scale: 1.02, transition: { duration: 0.2 } },
};

export const buttonHover = { scale: 1.05 };
export const buttonTap = { scale: 0.95 };

export const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: { duration: 0.3 },
    },
};
