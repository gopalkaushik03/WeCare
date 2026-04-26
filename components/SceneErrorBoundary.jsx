"use client";
import { Component } from "react";
import CanvasParticles from "./CanvasParticles";

// Keep CSSParticles as a named export for backward compat (page.jsx imports it)
export { default as CSSParticles } from "./CanvasParticles";

export default class SceneErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error) {
        console.warn("[SceneErrorBoundary] 3D scene crashed — using Canvas particle fallback.", error);
    }

    render() {
        if (this.state.hasError) {
            return <CanvasParticles />;
        }
        return this.props.children;
    }
}
