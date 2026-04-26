"use client";
import { Component } from "react";

/**
 * SceneErrorBoundary
 * Catches WebGL context loss and any other exceptions thrown by the 3D
 * Scene / React-Three-Fiber canvas so the rest of the page keeps working.
 */
export default class SceneErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.warn("[SceneErrorBoundary] 3D scene crashed — falling back to plain background.", error, info);
    }

    render() {
        if (this.state.hasError) {
            // Fallback: a plain gradient background — looks fine, no crash
            return (
                <div className="fixed inset-0 z-0 bg-[#0B0C10]">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-[#0B0C10] to-purple-900/20" />
                </div>
            );
        }
        return this.props.children;
    }
}
