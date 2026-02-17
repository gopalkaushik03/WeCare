"use client";
import { Canvas } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import Experience from "./Experience";

export default function Scene() {
    return (
        <div className="fixed inset-0 z-0">
            <Canvas
                camera={{ position: [0, 0, 8], fov: 50 }}
                gl={{ alpha: true, antialias: true }}
                dpr={[1, 2]}
            >
                <color attach="background" args={["#0B0C10"]} />
                <fog attach="fog" args={["#0B0C10", 5, 15]} />

                <Experience />

                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
