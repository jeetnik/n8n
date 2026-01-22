"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

export default function ThreeHeroBackground() {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // Scene Setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#050505"); // Very dark background
        scene.fog = new THREE.FogExp2(0x050505, 0.05); // Fog for depth

        // Camera
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 15;
        camera.position.y = 5;
        camera.lookAt(0, 0, 0);

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);

        // Geometry - Floating Cubes/Prisms
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({
            color: 0x6d28d9, // Purple 700
            roughness: 0.2,
            metalness: 0.8,
            transparent: true,
            opacity: 0.9,
        });

        const cubes: THREE.Mesh[] = [];
        const count = 40;

        for (let i = 0; i < count; i++) {
            const cube = new THREE.Mesh(geometry, material);

            // Random Position
            cube.position.x = (Math.random() - 0.5) * 40;
            cube.position.y = (Math.random() - 0.5) * 20;
            cube.position.z = (Math.random() - 0.5) * 20;

            // Random Scale (Tall prisms)
            cube.scale.x = Math.random() * 2 + 1;
            cube.scale.y = Math.random() * 6 + 2; // Tall
            cube.scale.z = Math.random() * 2 + 1;

            // Random Rotation
            cube.rotation.x = Math.random() * Math.PI;
            cube.rotation.y = Math.random() * Math.PI;

            scene.add(cube);
            cubes.push(cube);
        }

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x8b5cf6, 400, 50); // Violet
        pointLight1.position.set(5, 10, 5);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x3b82f6, 400, 50); // Blue
        pointLight2.position.set(-5, -5, 5);
        scene.add(pointLight2);

        // Animation Loop
        let animationId: number;
        const animate = () => {
            animationId = requestAnimationFrame(animate);

            // Rotate Cubes
            cubes.forEach((cube, i) => {
                cube.rotation.x += 0.002;
                cube.rotation.y += 0.003;
                // Float effect (simple sine wave offset based on index)
                cube.position.y += Math.sin(Date.now() * 0.001 + i) * 0.01;
            });

            // Subtle camera movement
            camera.position.x += (Math.sin(Date.now() * 0.0005) * 0.5 - camera.position.x) * 0.05;
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
        };
        animate();

        // GSAP Intro
        gsap.from(camera.position, {
            y: 20,
            z: 30,
            duration: 2.5,
            ease: "power3.out"
        });

        // Resize Handler
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", handleResize);

        // Cleanup
        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationId);
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={mountRef}
            className="absolute inset-0 -z-10 w-full h-full overflow-hidden opacity-60"
            style={{ pointerEvents: 'none' }}
        />
    );
}
