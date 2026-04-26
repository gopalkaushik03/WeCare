"use client";
import { Canvas } from "@react-three/fiber";
import Experience from "./Experience";

export default function Scene() {
    return (
        <div className="fixed inset-0 z-0">
            <Canvas
                camera={{ position: [0, 0, 8], fov: 50 }}
                gl={{ alpha: true, antialias: true }}
                dpr={[1, 2]}
                onCreated={({ gl }) => {
                    gl.setClearColor("#0B0C10", 1);
                }}
            >
                <color attach="background" args={["#0B0C10"]} />
                <fog attach="fog" args={["#0B0C10", 5, 15]} />

                {/* Simple inline lights — no external HDR fetch */}
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={0.4} />

                <Experience />
            </Canvas>
        </div>
    );
}
