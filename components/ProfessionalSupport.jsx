"use client";
import { motion } from "framer-motion";
import { Phone, ExternalLink, Heart, AlertCircle, Clock } from "lucide-react";
import { getSupportForRiskLevel } from "@/lib/professionalSupport";
import { slideUp, staggerContainer } from "@/lib/motion";

export default function ProfessionalSupport({ riskLevel = "low" }) {
    const support = getSupportForRiskLevel(riskLevel);

    return (
        <motion.div
            variants={staggerContainer(0.1)}
            initial="initial"
            animate="animate"
            className="w-full"
        >
            <div className="mb-4 flex items-center gap-2">
                <Heart className={`w-5 h-5 ${riskLevel === 'high' ? 'text-red-500' : 'text-primary'}`} />
                <h2 className="text-2xl font-semibold text-foreground">
                    Get Professional Help
                </h2>
            </div>

            {/* High Risk - Emergency Warning */}
            {riskLevel === 'high' && (
                <motion.div
                    variants={slideUp}
                    className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl"
                >
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-red-900 mb-1">
                                You're Not Alone - Help is Available
                            </h3>
                            <p className="text-red-800 text-sm">
                                If you're experiencing a crisis or having thoughts of self-harm, please reach out immediately. These helplines are here for you 24/7.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Primary Resources */}
            <motion.div variants={slideUp} className="space-y-4 mb-6">
                {support.primary && support.primary.length > 0 && (
                    <>
                        {support.primary.map((resource, idx) => (
                            <div
                                key={idx}
                                className={`p-5 rounded-xl border transition-all ${
                                        riskLevel === 'high' && resource.type === 'crisis'
                                            ? 'bg-red-950/60 border-red-500/40 shadow-md backdrop-blur-sm'
                                            : 'glass-card hover:shadow-xl hover:border-white/25'
                                    }`}
                            >
                                {/* Helpline Card */}
                                {resource.phone ? (
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                        <div className="flex-1">
                                            <h3 className={`font-semibold text-lg mb-1 ${riskLevel === 'high' && resource.type === 'crisis'
                                                    ? 'text-red-900'
                                                    : 'text-foreground'
                                                }`}>
                                                {resource.name}
                                            </h3>
                                            <p className="text-white/75 text-sm mb-3">
                                                {resource.description}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                                                <Clock className="w-4 h-4" />
                                                <span>{resource.availability}</span>
                                            </div>
                                        </div>
                                        <a
                                            href={`tel:${resource.phone}`}
                                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium shadow-sm transition-all whitespace-nowrap ${riskLevel === 'high' && resource.type === 'crisis'
                                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                                                }`}
                                        >
                                            <Phone className="w-4 h-4" />
                                            {resource.phone}
                                        </a>
                                    </div>
                                ) : (
                                    /* Online Platform Card */
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1 text-foreground">
                                            {resource.name}
                                        </h3>
                                        <p className="text-white/75 text-sm mb-3">
                                            {resource.description}
                                        </p>
                                        {resource.features && (
                                            <ul className="mb-4 space-y-1">
                                                {resource.features.map((feature, fIdx) => (
                                                    <li key={fIdx} className="text-sm text-white/80 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        <a
                                            href={resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                                        >
                                            Visit Website
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </>
                )}
            </motion.div>

            {/* Secondary Resources */}
            {support.secondary && support.secondary.length > 0 && (
                <motion.div variants={slideUp}>
                    <h3 className="text-lg font-semibold mb-3 text-foreground">
                        {riskLevel === 'high' ? 'Online Support Options' : 'Additional Resources'}
                    </h3>
                    <div className="space-y-3">
                        {support.secondary.map((resource, idx) => (
                            <div
                                key={idx}
                                className="glass-card p-4 rounded-lg hover:border-white/25 transition-all"
                            >
                                {resource.phone ? (
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div>
                                            <h4 className="font-medium text-foreground">{resource.name}</h4>
                                            <p className="text-xs text-white/55">{resource.availability}</p>
                                        </div>
                                        <a
                                            href={`tel:${resource.phone}`}
                                            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm"
                                        >
                                            <Phone className="w-4 h-4" />
                                            {resource.phone}
                                        </a>
                                    </div>
                                ) : (
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div>
                                            <h4 className="font-medium text-foreground">{resource.name}</h4>
                                            <p className="text-xs text-white/55">{resource.description}</p>
                                        </div>
                                        <a
                                            href={resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm"
                                        >
                                            Visit
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
