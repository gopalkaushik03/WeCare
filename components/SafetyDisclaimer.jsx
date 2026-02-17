"use client";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { fadeIn } from "@/lib/motion";

export default function SafetyDisclaimer() {
    return (
        <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            className="w-full mt-8"
        >
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-900">
                        <p className="font-medium mb-1">Important Disclaimer</p>
                        <p className="text-amber-800">
                            WeCare provides supportive and educational guidance only.
                            It does not replace professional medical or mental health care.
                            If you feel unsafe, please contact emergency services immediately.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
