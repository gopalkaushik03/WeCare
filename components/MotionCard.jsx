import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { slideUp } from "@/lib/motion";


export default function MotionCard({ children, className, delay = 0, hoverEffect = true, glass = false, layoutId }) {
    return (
        <motion.div
            layoutId={layoutId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: delay, ease: "easeOut" }}
            className={cn(
                "relative group transition-all duration-200 ease-out",
                "rounded-2xl p-6",
                glass
                    ? "glass-card"
                    : "glass-card",
                hoverEffect && "hover:-translate-y-1 hover:shadow-xl hover:scale-[1.01]",
                className
            )}
        >
            {children}
        </motion.div>
    );
}
