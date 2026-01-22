"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

export default function ThreeFeatureRing() {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        // Scene
        const scene = new THREE.Scene();

        // Camera
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
        camera.position.z = 12;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);

        // Group for the ring
        const ringGroup = new THREE.Group();
        scene.add(ringGroup);

        // Geometry - Translucent Planes
        const geometry = new THREE.BoxGeometry(1.5, 2.5, 0.1);
        const material = new THREE.MeshBasicMaterial({
            color: 0x8b5cf6, // Violet 500
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide,
            wireframe: false
        });

        const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.5 });
        const edgesGeom = new THREE.EdgesGeometry(geometry);

        const radius = 4;
        const count = 12;

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;

            const mesh = new THREE.Mesh(geometry, material);
            const edges = new THREE.LineSegments(edgesGeom, wireframeMaterial);

            // Position in circle
            mesh.position.x = Math.cos(angle) * radius;
            mesh.position.z = Math.sin(angle) * radius;
            mesh.rotation.y = -angle + Math.PI / 2; // Face outward

            edges.position.copy(mesh.position);
            edges.rotation.copy(mesh.rotation);

            ringGroup.add(mesh);
            ringGroup.add(edges);
        }

        // Animation Loop
        let animationId: number;
        const animate = () => {
            animationId = requestAnimationFrame(animate);

            ringGroup.rotation.y += 0.005;
            ringGroup.rotation.x = Math.sin(Date.now() * 0.001) * 0.2; // Gentle tilt

            renderer.render(scene, camera);
        };
        animate();

        // GSAP Intro
        ringGroup.scale.set(0, 0, 0);
        gsap.to(ringGroup.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 1.5,
            ease: "back.out(1.7)"
        });

        // Cleanup
        const currentMount = mountRef.current;
        return () => {
            cancelAnimationFrame(animationId);
            if (currentMount) {
                currentMount.removeChild(renderer.domElement);
            }
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={mountRef}
            className="w-full h-full min-h-[400px]"
        />
    );
}
