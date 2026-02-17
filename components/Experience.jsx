"use client";
import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export default function Experience() {
    const pointsRef = useRef();
    const progressRef = useRef({ value: 0 });
    const { camera } = useThree();

    // 1. Generate Heart Shape Positions
    const heartPoints = useMemo(() => {
        const points = [];
        const particleCount = 2000;

        for (let i = 0; i < particleCount; i++) {
            const t = (i / particleCount) * Math.PI * 2;

            // Heart formula
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
            const z = (Math.random() - 0.5) * 5; // Slight depth volume

            // Scale and Position adjustments to fit viewport
            points.push(new THREE.Vector3(x * 0.15, y * 0.15 + 1, z));
        }
        return points;
    }, []);

    // 2. Generate Random Full-Screen Positions
    const randomPoints = useMemo(() => {
        const points = [];
        const particleCount = 2000; // Must match heartPoints count

        for (let i = 0; i < particleCount; i++) {
            // Range: x[-20, 20], y[-12, 12], z[-10, 10]
            const x = (Math.random() - 0.5) * 40;
            const y = (Math.random() - 0.5) * 24;
            const z = (Math.random() - 0.5) * 20;

            points.push(new THREE.Vector3(x, y, z));
        }
        return points;
    }, []);

    // 3. Create Attributes (Positions & Colors)
    const { positions, colors, randoms } = useMemo(() => {
        const positions = new Float32Array(randomPoints.length * 3);
        const colors = new Float32Array(randomPoints.length * 3);
        const randoms = new Float32Array(randomPoints.length); // For individual shimmer timing

        randomPoints.forEach((point, i) => {
            positions[i * 3] = point.x;
            positions[i * 3 + 1] = point.y;
            positions[i * 3 + 2] = point.z;

            // Cyan/Purple Mix
            const cyan = new THREE.Color(0x22d3ee);
            const purple = new THREE.Color(0xa855f7);
            const mixColor = cyan.clone().lerp(purple, Math.random());

            colors[i * 3] = mixColor.r;
            colors[i * 3 + 1] = mixColor.g;
            colors[i * 3 + 2] = mixColor.b;

            randoms[i] = Math.random();
        });

        return { positions, colors, randoms };
    }, [randomPoints]);

    // Setup ScrollTrigger
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.to(progressRef.current, {
                value: 1,
                ease: "power2.inOut",
                scrollTrigger: {
                    trigger: "#scroll-container",
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1.5,
                    markers: false,
                },
            });
        });
        return () => ctx.revert();
    }, []);

    // Animation Loop
    useFrame((state) => {
        if (!pointsRef.current) return;

        const currentPositions = pointsRef.current.geometry.attributes.position.array;
        const progress = progressRef.current.value;
        const time = state.clock.elapsedTime;

        randomPoints.forEach((randPoint, i) => {
            const heartPoint = heartPoints[i] || heartPoints[0];

            // 1. Morph Interpolation
            const x = THREE.MathUtils.lerp(randPoint.x, heartPoint.x, progress);
            const y = THREE.MathUtils.lerp(randPoint.y, heartPoint.y, progress);
            const z = THREE.MathUtils.lerp(randPoint.z, heartPoint.z, progress);

            // Shimmer / Pulse
            const shimmer = Math.sin(time * 2 + randoms[i] * 10);
            const hover = Math.sin(time * 0.5 + randoms[i]) * 0.05;

            currentPositions[i * 3] = x;
            currentPositions[i * 3 + 1] = y + hover;
            currentPositions[i * 3 + 2] = z;
        });

        pointsRef.current.geometry.attributes.position.needsUpdate = true;

        // Camera gentle float
        const mouseX = state.pointer.x * 0.5;
        const mouseY = state.pointer.y * 0.5;
        camera.position.x += (mouseX - camera.position.x) * 0.02;
        camera.position.y += (-mouseY - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);
    });

    return (
        <>
            <ambientLight intensity={0.5} />
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={positions.length / 3}
                        array={positions}
                        itemSize={3}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        count={colors.length / 3}
                        array={colors}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.06}
                    sizeAttenuation={true}
                    transparent={true}
                    opacity={0.9}
                    vertexColors={true}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </points>
        </>
    );
}
